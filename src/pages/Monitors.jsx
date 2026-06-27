import { useState, useEffect } from 'react';
import client from '../api/client';
import MonitorModal from '../components/MonitorModal';
import DeleteModal from '../components/DeleteModal';

const MONO = "'Geist Mono', monospace";

function StatusDot({ status }) {
  const up = status === 'up';
  return (
    <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: up ? '#1D9E75' : '#E24B4A', boxShadow: up ? '0 0 8px 1px rgba(29,158,117,0.65)' : '0 0 8px 1px rgba(226,75,74,0.7)', animation: !up && status !== 'pending' ? 'pwpulse 1.4s ease-in-out infinite' : 'none', display: 'inline-block' }} />
  );
}

function StatusBadge({ status }) {
  const up = status === 'up';
  const color = up ? '#1D9E75' : status === 'pending' ? '#888' : '#E24B4A';
  const bg = up ? 'rgba(29,158,117,0.10)' : status === 'pending' ? 'rgba(136,136,136,0.10)' : 'rgba(226,75,74,0.10)';
  const bd = up ? 'rgba(29,158,117,0.28)' : status === 'pending' ? 'rgba(136,136,136,0.25)' : 'rgba(226,75,74,0.30)';
  return <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', padding: '3px 8px', borderRadius: 5, color, background: bg, border: `0.5px solid ${bd}` }}>{up ? 'ACTIVO' : status === 'pending' ? 'PENDIENTE' : 'CAÍDO'}</span>;
}

function formatInterval(minutes) {
  if (minutes === 1) return 'Cada 1 min';
  if (minutes < 60) return `Cada ${minutes} min`;
  return `Cada ${minutes / 60}h`;
}

function timeAgo(date) {
  if (!date) return '—';
  const s = Math.round((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `hace ${s}s`;
  if (s < 3600) return `hace ${Math.round(s / 60)}m`;
  return `hace ${Math.round(s / 3600)}h`;
}

export default function Monitors() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMonitors = () => {
    client.get('/api/monitors')
      .then(r => setMonitors(Array.isArray(r.data) ? r.data : (r.data.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMonitors();
    const id = setInterval(fetchMonitors, 30000);
    return () => clearInterval(id);
  }, []);

  const upCount = monitors.filter(m => m.last_status === 'up').length;
  const downCount = monitors.filter(m => m.last_status === 'down').length;
  const q = query.toLowerCase();
  const filtered = q ? monitors.filter(m => m.name.toLowerCase().includes(q) || m.url.toLowerCase().includes(q)) : monitors;

  const handleAdd = async (form) => { await client.post('/api/monitors', form); fetchMonitors(); };
  const handleEdit = async (form) => { await client.put(`/api/monitors/${editTarget.id}`, form); fetchMonitors(); };
  const handleDelete = async () => { await client.delete(`/api/monitors/${deleteTarget.id}`); fetchMonitors(); };
  const handleToggle = async (m) => { await client.patch(`/api/monitors/${m.id}/toggle`); fetchMonitors(); };

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Monitores</h1>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: '#555' }}>{monitors.length} total · {upCount} activos · {downCount} caídos</span>
        </div>
      </header>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '18px 26px 16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: 340 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, pointerEvents: 'none' }}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="pw-search" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o URL…"
            style={{ width: '100%', height: 36, padding: '0 13px 0 35px', background: '#101010', border: '0.5px solid #262626', borderRadius: 9, color: '#e8e8e8', fontSize: 13 }} />
        </div>
        <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 36, padding: '0 14px', borderRadius: 9, background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#04140d', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo monitor
        </button>
      </div>

      <div className="pw-scroll" style={{ flex: 1, overflow: 'auto', padding: '0 26px 40px' }}>
        <div style={{ minWidth: 1040, background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 11, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 92px 110px 116px 86px 84px 96px', alignItems: 'center', gap: 14, padding: '11px 18px', borderBottom: '0.5px solid #1e1e1e' }}>
            {['Monitor', 'Estado', 'Intervalo', 'Último chequeo', 'Respuesta', 'Uptime', 'Acciones'].map((h, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555', textAlign: i >= 4 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.7fr 92px 110px 116px 86px 84px 96px', gap: 14, padding: '14px 18px', borderBottom: '0.5px solid #181818' }}>
                {Array.from({ length: 6 }).map((_, j) => <div key={j} style={{ height: 14, background: '#1e1e1e', borderRadius: 4 }} />)}
                <div />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 18px', textAlign: 'center', fontSize: 13, color: '#555' }}>
              {query ? `Ningún monitor coincide con "${query}".` : 'Sin monitores aún. Agrega el primero arriba.'}
            </div>
          ) : (
            filtered.map(m => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1.7fr 92px 110px 116px 86px 84px 96px', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '0.5px solid #181818' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                  <StatusDot status={m.last_status} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 11.5, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{m.url}</div>
                  </div>
                </div>
                <div><StatusBadge status={m.last_status} /></div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: '#9a9a9a' }}>{formatInterval(m.interval_minutes)}</div>
                <div style={{ fontSize: 12.5, color: '#8a8a8a' }}>{timeAgo(m.last_checked_at)}</div>
                <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 13, color: m.last_response_time_ms ? '#cfcfcf' : '#555', fontVariantNumeric: 'tabular-nums' }}>{m.last_response_time_ms ? `${m.last_response_time_ms} ms` : '—'}</div>
                <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 13, color: '#cfcfcf', fontVariantNumeric: 'tabular-nums' }}>—</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                  <button title={m.is_active ? 'Pausar' : 'Reanudar'} onClick={() => handleToggle(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>
                    {m.is_active ? <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="6" width="3.4" height="12" rx="1"/><rect x="13.6" y="6" width="3.4" height="12" rx="1"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
                  </button>
                  <button title="Editar" onClick={() => setEditTarget(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </button>
                  <button title="Eliminar" onClick={() => setDeleteTarget(m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {addOpen && <MonitorModal onClose={() => setAddOpen(false)} onSave={handleAdd} />}
      {editTarget && <MonitorModal monitor={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {deleteTarget && <DeleteModal monitor={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </>
  );
}
