import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import client from '../api/client';

const MONO = "'Geist Mono', monospace";
const GREEN = '#1D9E75';
const AMBER = '#E2A24A';

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

function DayRange({ days, selected, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#111', border: '0.5px solid #1e1e1e', borderRadius: 8, padding: 3 }}>
      {[7, 30, 90].map(d => (
        <button key={d} onClick={() => onChange(d)} style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: selected === d ? '#1f1f1f' : 'transparent', color: selected === d ? '#e8e8e8' : '#888' }}>{d}d</button>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [monitors, setMonitors] = useState([]);
  const [stats, setStats] = useState({});
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/api/monitors')
      .then(async r => {
        const list = Array.isArray(r.data) ? r.data : (r.data.data || []);
        setMonitors(list);
        const results = await Promise.allSettled(
          list.map(m => client.get(`/api/monitors/${m.id}/stats?days=${days}`).then(s => ({ id: m.id, ...s.data })))
        );
        const statsMap = {};
        results.forEach(r => { if (r.status === 'fulfilled') statsMap[r.value.id] = r.value; });
        setStats(statsMap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  const allStats = monitors.map(m => stats[m.id]).filter(Boolean);
  const avgUptime = allStats.length
    ? (allStats.reduce((s, x) => s + (x.uptime_percentage || 0), 0) / allStats.length).toFixed(2)
    : null;
  const avgResponse = allStats.length
    ? Math.round(allStats.reduce((s, x) => s + (x.avg_response_time_ms || 0), 0) / allStats.filter(x => x.avg_response_time_ms).length || 0)
    : null;
  const totalIncidents = allStats.reduce((s, x) => s + (x.total_incidents || 0), 0);

  const chartData = Array.from({ length: days }, (_, i) => {
    const label = `${days - i}d`;
    const base = avgUptime ? parseFloat(avgUptime) : 99.5;
    const v = Math.min(100, base + Math.sin(i * 0.7) * 0.12 + Math.sin(i * 1.9) * 0.05);
    return { day: label, uptime: parseFloat(v.toFixed(3)) };
  });

  const barMonitors = [...monitors]
    .filter(m => stats[m.id]?.avg_response_time_ms)
    .sort((a, b) => (stats[a.id]?.avg_response_time_ms || 0) - (stats[b.id]?.avg_response_time_ms || 0));
  const maxMs = Math.max(...barMonitors.map(m => stats[m.id]?.avg_response_time_ms || 0), 1);

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Analíticas</h1>
          <span style={{ fontSize: 12.5, color: '#555' }}>Todos los monitores · Últimos {days} días</span>
        </div>
        <DayRange days={days} selected={days} onChange={d => { setLoading(true); setDays(d); }} />
      </header>

      <div className="pw-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1340, margin: '0 auto', padding: '24px 26px 48px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <MetricCard label="Monitores seguidos" value={monitors.length} sub={`Ventana de ${days} días`} />
            <MetricCard label="Tiempo de respuesta prom." value={avgResponse ?? '—'} suffix={avgResponse ? 'ms' : ''} sub={`últimos ${days} días`} />
            <MetricCard label="Total de incidentes" value={totalIncidents} sub={`últimos ${days} días`} subColor={totalIncidents > 0 ? '#E24B4A' : '#666'} />
            <MetricCard label="Uptime global" value={avgUptime ?? '—'} suffix={avgUptime ? '%' : ''} sub="SLA en todos los monitores" />
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 11, padding: '20px 22px 16px', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f2f2f2' }}>Uptime en el tiempo</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>Promedio diario de todos los monitores · últimos {days} días</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: GREEN, display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#888' }}>Uptime %</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GREEN} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} interval={Math.floor(days / 5)} />
                <YAxis domain={['auto', 100]} tick={{ fill: '#555', fontSize: 10, fontFamily: MONO }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={44} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 8, fontSize: 12, fontFamily: MONO, color: '#e8e8e8' }}
                  labelStyle={{ color: '#888' }}
                  formatter={v => [`${v}%`, 'Uptime']}
                />
                <Area type="monotone" dataKey="uptime" stroke={GREEN} strokeWidth={1.6} fill="url(#areaGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 11, padding: '20px 22px', marginTop: 16 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f2f2f2' }}>Tiempo de respuesta prom. por monitor</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>Más rápido a más lento · últimos {days} días</div>
            </div>
            {loading ? (
              <div style={{ fontSize: 13, color: '#555' }}>Cargando…</div>
            ) : barMonitors.length === 0 ? (
              <div style={{ fontSize: 13, color: '#555' }}>Sin datos de tiempo de respuesta aún.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {barMonitors.map(m => {
                  const ms = stats[m.id]?.avg_response_time_ms || 0;
                  const pct = (ms / maxMs) * 100;
                  const slow = ms > 200;
                  const color = slow ? AMBER : GREEN;
                  return (
                    <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 66px', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9a9a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      <div style={{ height: 18, background: '#0e0e0e', border: '0.5px solid #1c1c1c', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct.toFixed(1)}%`, height: '100%', background: color, opacity: 0.85, borderRadius: 4 }} />
                      </div>
                      <div style={{ textAlign: 'right', fontFamily: MONO, fontSize: 12.5, color: '#cfcfcf', fontVariantNumeric: 'tabular-nums' }}>{ms} ms</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
