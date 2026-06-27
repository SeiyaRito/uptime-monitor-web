import { useState, useEffect } from 'react';
import Toggle from './Toggle';

const INTERVALS = [1, 5, 10, 30];

function IntervalSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const fmt = m => `${m} ${m === 1 ? 'minuto' : 'minutos'}`;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 40, padding: '0 13px', background: '#141414', border: `0.5px solid ${open ? '#2f6f57' : '#2a2a2a'}`, borderRadius: 9, color: '#e8e8e8', fontSize: 13.5, cursor: 'pointer' }}
      >
        <span>Cada {fmt(value)}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#1f1f1f', border: '0.5px solid #2f2f2f', borderRadius: 10, padding: 5, zIndex: 50 }}>
          {INTERVALS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { onChange(m); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 34, padding: '0 11px', borderRadius: 7, background: value === m ? '#262626' : 'transparent', border: 'none', color: value === m ? '#fff' : '#cfcfcf', fontSize: 13.5, cursor: 'pointer' }}
            >
              <span>Cada {fmt(m)}</span>
              {value === m && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MonitorModal({ monitor, onClose, onSave }) {
  const editing = !!monitor;
  const [form, setForm] = useState({ name: '', url: '', interval_minutes: 5, is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (monitor) {
      setForm({ name: monitor.name, url: monitor.url, interval_minutes: monitor.interval_minutes, is_active: monitor.is_active });
    }
  }, [monitor]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Algo salió mal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,4,0.66)', animation: 'pwfade .18s ease-out' }} onClick={onClose} />
      <div role="dialog" style={{ position: 'relative', width: '100%', maxWidth: 460, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 14, animation: 'pwrise .2s cubic-bezier(0.16,1,0.3,1)', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 22px 0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f2f2' }}>
              {editing ? 'Editar monitor' : 'Agregar nuevo monitor'}
            </h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>
              {editing ? `${monitor.name} · ${monitor.last_status?.toUpperCase()}` : 'Pegasus comenzará a verificar este endpoint de inmediato.'}
            </p>
          </div>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, flexShrink: 0, marginTop: -4, borderRadius: 7, background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ fontSize: 13, color: '#E24B4A', background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '10px 13px' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Nombre del monitor</label>
              <input className="pw-field" type="text" placeholder="ej. API de Producción" value={form.name} onChange={e => set('name', e.target.value)} required
                style={{ height: 40, padding: '0 13px', background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 9, color: '#e8e8e8', fontSize: 13.5 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>URL a monitorear</label>
              <input className="pw-field" type="text" placeholder="https://api.ejemplo.com/health" value={form.url} onChange={e => set('url', e.target.value)} required
                style={{ height: 40, padding: '0 13px', background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: 9, color: '#e8e8e8', fontFamily: "'Geist Mono', monospace", fontSize: 13 }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Intervalo de chequeo</label>
              <IntervalSelect value={form.interval_minutes} onChange={v => set('interval_minutes', v)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', background: '#141414', border: '0.5px solid #242424', borderRadius: 10 }}>
              <div style={{ paddingRight: 16 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: '#e8e8e8' }}>{form.is_active ? 'Activo' : 'Inactivo'}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{form.is_active ? 'Los chequeos corren según el intervalo arriba.' : 'Monitor pausado — no se realizarán chequeos.'}</div>
              </div>
              <Toggle on={form.is_active} onChange={v => set('is_active', v)} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 9, padding: '16px 22px', borderTop: '0.5px solid #242424' }}>
            <button type="button" onClick={onClose} style={{ height: 38, padding: '0 16px', borderRadius: 9, background: 'transparent', border: '0.5px solid #2f2f2f', color: '#cfcfcf', fontSize: 13, fontWeight: 450, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', borderRadius: 9, background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#04140d', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {!editing && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
