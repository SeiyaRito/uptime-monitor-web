import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';

const GREEN = '#1D9E75';
const RED = '#E24B4A';

function UptimeBars({ uptime }) {
  const pct = parseFloat(uptime) || 100;
  const downDays = Math.round((1 - pct / 100) * 90);
  const downPositions = new Set();
  let attempts = 0;
  while (downPositions.size < downDays && attempts < 500) {
    downPositions.add(Math.floor(Math.random() * 90));
    attempts++;
  }

  return (
    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
      {Array.from({ length: 90 }, (_, i) => {
        const isDown = downPositions.has(i);
        return (
          <div
            key={i}
            className="pw-day"
            title={`Día ${90 - i}`}
            style={{ flex: '1 1 0', height: 30, minWidth: 2, borderRadius: 2, background: isDown ? RED : GREEN, opacity: isDown ? 0.92 : 0.78 }}
          />
        );
      })}
    </div>
  );
}

export default function StatusPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/api/status/${username}`)
      .then(r => setData(r.data.data || r.data))
      .catch(() => setError('Página de estado no encontrada.'))
      .finally(() => setLoading(false));
  }, [username]);

  const monitors = data?.monitors || [];
  const allUp = monitors.every(m => m.status === 'up' || m.last_status === 'up');
  const now = new Date().toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 13, color: '#555' }}>Cargando…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0f12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: '#666' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="pw-scroll" style={{ minHeight: '100vh', width: '100%', background: '#0d0f12', color: '#e6e8ea', fontFamily: "'Geist','Geist Fallback',-apple-system,sans-serif", WebkitFontSmoothing: 'antialiased', overflowY: 'auto' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <img src="/Pegasus.PNG" alt="Pegasus" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, objectFit: 'contain', background: '#ffffff', padding: 5, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f4f6' }}>
              Estado de {data?.user?.name || username}
            </span>
          </div>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: allUp ? '#0f1a15' : '#1a0d0d', border: `0.5px solid ${allUp ? 'rgba(29,158,117,0.4)' : 'rgba(226,75,74,0.35)'}`, borderRadius: 13, padding: '20px 22px' }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: '50%', background: allUp ? 'rgba(29,158,117,0.14)' : 'rgba(226,75,74,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {allUp
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/></svg>
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: allUp ? '#eafff5' : '#f0d6d5', letterSpacing: '-0.01em' }}>
              {allUp ? 'Todos los sistemas operativos' : 'Algunos sistemas están caídos'}
            </div>
            <div style={{ fontSize: 13, color: '#6e8a7e', marginTop: 3 }}>Actualizado hoy a las {now}</div>
          </div>
        </div>

        <section style={{ marginTop: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7b828b' }}>Componentes</h2>
            <span style={{ fontSize: 12, color: '#5a616a' }}>Últimos 90 días</span>
          </div>

          <div style={{ background: '#121519', border: '0.5px solid #1f242b', borderRadius: 13, overflow: 'hidden' }}>
            {monitors.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#5a616a' }}>Sin monitores configurados.</div>
            ) : (
              monitors.map((m, i) => {
                const up = (m.status || m.last_status) === 'up';
                const uptime = m.uptime_percentage ?? m.uptime ?? 100;
                return (
                  <div key={m.id || i} style={{ padding: '17px 20px', borderBottom: i < monitors.length - 1 ? '0.5px solid #1b1f25' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: up ? GREEN : RED, boxShadow: `0 0 8px 1px ${up ? 'rgba(29,158,117,0.6)' : 'rgba(226,75,74,0.7)'}`, display: 'inline-block' }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#e6e8ea' }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: up ? GREEN : RED }}>{up ? 'Operativo' : 'Caído'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <UptimeBars uptime={uptime} />
                      <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11.5, color: '#6b727b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {parseFloat(uptime).toFixed(3)}% uptime
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', fontFamily: "'Geist Mono',monospace", fontSize: 11, color: '#5a616a' }}>
              <span>Hace 90 días</span>
              <span>Hoy</span>
            </div>
          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: 56, paddingBottom: 40 }}>
          <span style={{ fontSize: 12.5, color: '#4d535b' }}>Impulsado por Pegasus</span>
        </div>
      </div>
    </div>
  );
}
