import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Sparkline from '../components/Sparkline';
import MonitorModal from '../components/MonitorModal';

const MONO = "'Geist Mono', monospace";

function MetricCard({ label, value, sub, subColor = '#666', suffix }) {
  return (
    <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 11, padding: '16px 18px' }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#666' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 27, fontWeight: 500, color: '#f2f2f2', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
        {suffix && <span style={{ fontFamily: MONO, fontSize: 14, color: '#555' }}>{suffix}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 9 }}>{sub}</div>}
    </div>
  );
}

function StatusDot({ status }) {
  const up = status === 'up';
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: up ? '#1D9E75' : '#E24B4A',
      boxShadow: up ? '0 0 8px 1px rgba(29,158,117,0.65)' : '0 0 8px 1px rgba(226,75,74,0.7)',
      animation: !up ? 'pwpulse 1.4s ease-in-out infinite' : 'none',
      display: 'inline-block',
    }} />
  );
}

function StatusBadge({ status }) {
  const up = status === 'up';
  const pending = status === 'pending';
  const color = up ? '#1D9E75' : pending ? '#888' : '#E24B4A';
  const bg = up ? 'rgba(29,158,117,0.10)' : pending ? 'rgba(136,136,136,0.10)' : 'rgba(226,75,74,0.10)';
  const bd = up ? 'rgba(29,158,117,0.28)' : pending ? 'rgba(136,136,136,0.25)' : 'rgba(226,75,74,0.30)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', padding: '3px 8px', borderRadius: 5, color, background: bg, border: `0.5px solid ${bd}` }}>
      {up ? 'ACTIVO' : pending ? 'PENDIENTE' : 'CAÍDO'}
    </span>
  );
}

function FilterTabs({ filter, counts, onChange }) {
  const tabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'up', label: 'Activos', count: counts.up },
    { key: 'down', label: 'Caídos', count: counts.down },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 500, padding: '6px 11px', borderRadius: 7, cursor: 'pointer', background: filter === t.key ? '#1a1a1a' : 'transparent', color: filter === t.key ? '#e8e8e8' : '#888', border: `0.5px solid ${filter === t.key ? '#2a2a2a' : 'transparent'}` }}>
          {t.label}
          <span style={{ fontFamily: MONO, fontSize: 11, color: filter === t.key ? '#888' : '#555', fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchMonitors = () => {
    client.get('/api/monitors')
      .then(r => setMonitors(Array.isArray(r.data) ? r.data : (r.data.data || [])))
      .catch(() => {})
      .finally(() => { setLoading(false); setLastRefresh(new Date()); });
  };

  useEffect(() => {
    fetchMonitors();
    const id = setInterval(fetchMonitors, 30000);
    return () => clearInterval(id);
  }, []);

  const activeMonitors = monitors.filter(m => m.is_active);
  const upCount = monitors.filter(m => m.last_status === 'up').length;
  const downCount = monitors.filter(m => m.last_status === 'down').length;
  const responseTimes = monitors.filter(m => m.last_response_time_ms).map(m => m.last_response_time_ms);
  const avgResponse = responseTimes.length ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : null;

  const activeIncidents = monitors.filter(m => m.last_status === 'down');
  const filtered = filter === 'all' ? monitors : monitors.filter(m => m.last_status === filter);

  const counts = { all: monitors.length, up: upCount, down: downCount };

  const timeSince = () => {
    const s = Math.round((new Date() - lastRefresh) / 1000);
    if (s < 5) return 'Actualizado ahora mismo';
    if (s < 60) return `Actualizado hace ${s}s`;
    return `Actualizado hace ${Math.round(s / 60)}m`;
  };

  const handleAdd = async (form) => {
    await client.post('/api/monitors', form);
    fetchMonitors();
  };

  const handleToggle = async (monitor) => {
    await client.patch(`/api/monitors/${monitor.id}/toggle`);
    fetchMonitors();
  };

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Dashboard</h1>
          <span style={{ fontSize: 12.5, color: '#555' }}>{timeSince()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={fetchMonitors} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', borderRadius: 8, background: 'transparent', border: '0.5px solid #2a2a2a', color: '#cfcfcf', fontSize: 13, fontWeight: 450, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v5h-5"/></svg>
            Actualizar
          </button>
          <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', borderRadius: 8, background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#04140d', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo monitor
          </button>
        </div>
      </header>

      <div className="pw-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1340, margin: '0 auto', padding: '24px 26px 48px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <MetricCard label="Monitores activos" value={activeMonitors.length} sub={`${monitors.length} total`} />
            <MetricCard label="En línea ahora" value={upCount} suffix={`/ ${monitors.length}`} sub={downCount > 0 ? `${downCount} caídos` : 'Todos en línea'} subColor={downCount > 0 ? '#E24B4A' : '#1D9E75'} />
            <MetricCard label="Tiempo de respuesta prom." value={avgResponse ?? '—'} suffix={avgResponse ? 'ms' : ''} sub="último chequeo" />
            <MetricCard label="Caídos ahora" value={downCount} sub={downCount > 0 ? 'Requiere atención' : 'Todo en orden'} subColor={downCount > 0 ? '#E24B4A' : '#1D9E75'} />
          </div>

          {activeIncidents.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, background: '#1a0e0e', border: '0.5px solid rgba(226,75,74,0.35)', borderRadius: 11, padding: '13px 16px' }}>
              <span style={{ width: 9, height: 9, flexShrink: 0, borderRadius: '50%', background: '#E24B4A', boxShadow: '0 0 9px 1px rgba(226,75,74,0.7)', animation: 'pwpulse 1.4s ease-in-out infinite', display: 'inline-block' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: '#f0d6d5' }}>Incidente activo · </span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#E24B4A' }}>{activeIncidents[0].name}</span>
                <span style={{ fontSize: 13.5, color: '#b88a89' }}> está caído — investigando.</span>
              </div>
              <button onClick={() => navigate('/incidents')} style={{ fontSize: 12.5, fontWeight: 500, color: '#E24B4A', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Ver incidentes →
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 }}>
            <FilterTabs filter={filter} counts={counts} onChange={setFilter} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 7px 1px rgba(29,158,117,0.6)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#666' }}>Auto-actualización · 30s</span>
            </div>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 11, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 124px 96px 84px 72px', alignItems: 'center', gap: 16, padding: '10px 18px', borderBottom: '0.5px solid #1e1e1e' }}>
              {['Monitor', 'Estado', 'Últ. 24h', 'Respuesta', 'Uptime', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555', textAlign: i >= 3 && i < 5 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 124px 96px 84px 72px', gap: 16, padding: '14px 18px', borderBottom: '0.5px solid #181818' }}>
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4, width: '60%' }} />
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4 }} />
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4 }} />
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4 }} />
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4 }} />
                  <div />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px 18px', textAlign: 'center', fontSize: 13, color: '#555' }}>
                {monitors.length === 0 ? 'Sin monitores aún. Agrega el primero arriba.' : 'Ningún monitor coincide con este filtro.'}
              </div>
            ) : (
              filtered.map((m, idx) => (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 124px 96px 84px 72px', alignItems: 'center', gap: 16, padding: '13px 18px', borderBottom: '0.5px solid #181818' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                    <StatusDot status={m.last_status} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 11.5, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{m.url}</div>
                    </div>
                  </div>
                  <div><StatusBadge status={m.last_status} /></div>
                  <div style={{ height: 32 }}><Sparkline seed={idx + 1} status={m.last_status} /></div>
                  <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 13, color: m.last_response_time_ms ? '#cfcfcf' : '#555', fontVariantNumeric: 'tabular-nums' }}>
                    {m.last_response_time_ms ? `${m.last_response_time_ms} ms` : '—'}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 13, color: '#cfcfcf', fontVariantNumeric: 'tabular-nums' }}>—</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                    <button title={m.is_active ? 'Pausar' : 'Reanudar'} onClick={() => handleToggle(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>
                      {m.is_active
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="6" width="3.4" height="12" rx="1"/><rect x="13.6" y="6" width="3.4" height="12" rx="1"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      }
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {addOpen && <MonitorModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
    </>
  );
}
