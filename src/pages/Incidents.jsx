import { useState, useEffect } from 'react';
import client from '../api/client';

const MONO = "'Geist Mono', monospace";

function formatDuration(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function FilterTabs({ filter, counts, onChange }) {
  const tabs = [
    { key: 'all', label: 'Todos', count: counts.all },
    { key: 'active', label: 'Activos', count: counts.active },
    { key: 'resolved', label: 'Resueltos', count: counts.resolved },
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

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    client.get('/api/incidents')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data.data || []);
        setIncidents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const id = setInterval(() => {
      client.get('/api/incidents')
        .then(r => setIncidents(Array.isArray(r.data) ? r.data : (r.data.data || [])))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(id);
  }, []);

  const activeCount = incidents.filter(i => !i.resolved_at).length;
  const resolvedCount = incidents.filter(i => !!i.resolved_at).length;
  const counts = { all: incidents.length, active: activeCount, resolved: resolvedCount };

  const filtered = filter === 'all' ? incidents
    : filter === 'active' ? incidents.filter(i => !i.resolved_at)
    : incidents.filter(i => !!i.resolved_at);

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Incidentes</h1>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: '#555' }}>{activeCount} activos · {resolvedCount} resueltos</span>
        </div>
      </header>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '18px 26px 16px' }}>
        <FilterTabs filter={filter} counts={counts} onChange={setFilter} />
      </div>

      <div className="pw-scroll" style={{ flex: 1, overflow: 'auto', padding: '0 26px 40px' }}>
        <div style={{ minWidth: 920 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 150px 150px 110px 110px', alignItems: 'center', gap: 14, padding: '0 18px 10px 21px' }}>
            {['Monitor', 'Inicio', 'Resuelto', 'Duración', 'Estado'].map((h, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#555', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ background: '#121212', border: '0.5px solid #1c1c1c', borderRadius: 10, padding: '14px 18px' }}>
                  <div style={{ height: 14, background: '#1e1e1e', borderRadius: 4, width: '50%' }} />
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px 18px', textAlign: 'center', fontSize: 13, color: '#555' }}>
                Sin incidentes{filter === 'active' ? ' activos' : filter === 'resolved' ? ' resueltos' : ''}.
              </div>
            ) : (
              filtered.map(inc => {
                const active = !inc.resolved_at;
                return (
                  <div key={inc.id} style={{ background: active ? '#190d0d' : '#121212', border: `0.5px solid ${active ? 'rgba(226,75,74,0.22)' : '#1c1c1c'}`, borderLeft: `${active ? '2px' : '0.5px'} solid ${active ? '#E24B4A' : '#1c1c1c'}`, borderRadius: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 150px 150px 110px 110px', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', background: active ? '#E24B4A' : '#3a3a3a', boxShadow: active ? '0 0 8px 1px rgba(226,75,74,0.7)' : 'none', animation: active ? 'pwpulse 1.4s ease-in-out infinite' : 'none', display: 'inline-block' }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: active ? '#f0d6d5' : '#9a9a9a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {inc.monitor?.name || '—'}
                          </div>
                          {inc.monitor?.url && <div style={{ fontFamily: MONO, fontSize: 11.5, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{inc.monitor.url}</div>}
                        </div>
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: active ? '#8a8a8a' : '#555' }}>{formatDate(inc.started_at)}</div>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: active ? '#8a8a8a' : '#555' }}>{active ? '—' : formatDate(inc.resolved_at)}</div>
                      <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 12.5, color: active ? '#E24B4A' : '#777', fontVariantNumeric: 'tabular-nums' }}>{formatDuration(inc.duration_seconds)}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', padding: '3px 9px', borderRadius: 5, textTransform: 'uppercase', color: active ? '#E24B4A' : '#1D9E75', background: active ? 'rgba(226,75,74,0.12)' : 'rgba(29,158,117,0.08)', border: `0.5px solid ${active ? 'rgba(226,75,74,0.30)' : 'rgba(29,158,117,0.22)'}` }}>
                          {active ? 'Activo' : 'Resuelto'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
