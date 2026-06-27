export default function Sparkline({ seed = 1, status = 'up', width = 124, height = 32 }) {
  const color = status === 'up' ? '#1D9E75' : '#E24B4A';
  const pad = 3;
  const base = status === 'up' ? 70 : 20;
  const vary = status === 'up' ? 22 : 14;

  const values = Array.from({ length: 24 }, (_, i) => {
    const v = base + Math.sin(i * 0.55 + seed) * vary + Math.sin(i * 1.9 + seed * 1.7) * vary * 0.35;
    if (status === 'down' && i > 15) return base * 0.08 + ((i * 7 + seed) % 5);
    return Math.max(2, v);
  });

  const min = Math.min(...values), max = Math.max(...values);
  const range = (max - min) || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x.toFixed(1), y.toFixed(1)];
  });

  const line = pts.map(p => p.join(',')).join(' ');
  const area = `${pad},${height} ${line} ${width - pad},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polygon points={area} fill={color} fillOpacity={0.07} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
