import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Toggle from '../components/Toggle';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ email_enabled: true, notify_on_down: true, notify_on_recovery: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get('/api/notifications/settings')
      .then(r => setSettings(r.data.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      await client.put('/api/notifications/settings', { [key]: value });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const toggleRow = (key, title, desc, isLast, disabled) => {
    const on = settings[key] && !disabled;
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '17px 20px', borderBottom: isLast ? 'none' : '0.5px solid #1c1c1c', opacity: disabled ? 0.55 : 1 }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: disabled ? '#5a5a5a' : '#e8e8e8' }}>{title}</div>
          <div style={{ fontSize: 12.5, color: '#666', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
        </div>
        <Toggle on={on} onChange={v => updateSetting(key, v)} disabled={disabled} />
      </div>
    );
  };

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 26px' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Notificaciones</h1>
        {saved && <span style={{ marginLeft: 12, fontSize: 12.5, color: '#1D9E75' }}>Guardado</span>}
      </header>

      <div className="pw-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '30px 26px 56px' }}>

          <div style={{ marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#f2f2f2' }}>Preferencias de notificación</h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>Elige cómo y cuándo Pegasus te alerta sobre tus monitores.</p>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#555' }}>Cargando…</div>
            ) : (
              <>
                {toggleRow('email_enabled', 'Notificaciones por email', 'Interruptor principal para todas las alertas de email de Pegasus.', false, false)}
                {toggleRow('notify_on_down', 'Notificar cuando un monitor cae', 'Recibe una alerta inmediata cuando un servicio deja de responder.', false, !settings.email_enabled)}
                {toggleRow('notify_on_recovery', 'Notificar cuando un monitor se recupera', 'Recibe un aviso cuando un servicio caído vuelve a estar en línea.', true, !settings.email_enabled)}
              </>
            )}
          </div>

          <div style={{ marginTop: 36, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#f2f2f2' }}>Configuración de email</h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>Las alertas se envían a esta dirección.</p>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 9, background: '#101010', border: '0.5px solid #242424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6e8a7e" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: 13.5, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 6px 1px rgba(29,158,117,0.55)', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#6e8a7e' }}>Verificado</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
