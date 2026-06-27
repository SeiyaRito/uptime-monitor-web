import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.password_confirmation) { setPwError('Las contraseñas no coinciden.'); return; }
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await client.put('/api/auth/password', pwForm);
      setPwSuccess('Contraseña actualizada.');
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      const data = err.response?.data;
      setPwError(data?.message || 'Error al actualizar la contraseña.');
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = { height: 40, padding: '0 13px', background: '#101010', border: '0.5px solid #262626', borderRadius: 9, color: '#e8e8e8', fontSize: 13.5, width: '100%' };

  return (
    <>
      <header style={{ flexShrink: 0, height: 61, borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 26px' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Configuración de cuenta</h1>
      </header>

      <div className="pw-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '30px 26px 64px' }}>

          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#f2f2f2' }}>Perfil</h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>Información de tu cuenta.</p>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, paddingBottom: 20, borderBottom: '0.5px solid #1c1c1c', marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 11, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600, color: '#9a9a9a' }}>{initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8e8' }}>{user?.name}</div>
                <div style={{ fontSize: 12.5, color: '#666', marginTop: 2 }}>@{user?.username} · {user?.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Nombre completo</label>
                <input className="pw-field" readOnly defaultValue={user?.name} style={{ ...inputStyle, opacity: 0.7 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Correo electrónico</label>
                <input className="pw-field" readOnly defaultValue={user?.email} style={{ ...inputStyle, fontFamily: "'Geist Mono',monospace", fontSize: 13, opacity: 0.7 }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 14 }}>Edición de perfil próximamente.</div>
          </div>

          <div style={{ marginTop: 36, marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#f2f2f2' }}>Cambiar contraseña</h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>Usa mínimo 8 caracteres.</p>
          </div>

          <div style={{ background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 12, padding: 20 }}>
            <form onSubmit={handlePwSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pwError && <div style={{ fontSize: 13, color: '#E24B4A', background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '10px 13px' }}>{pwError}</div>}
                {pwSuccess && <div style={{ fontSize: 13, color: '#1D9E75', background: 'rgba(29,158,117,0.08)', border: '0.5px solid rgba(29,158,117,0.25)', borderRadius: 8, padding: '10px 13px' }}>{pwSuccess}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Contraseña actual</label>
                  <input className="pw-field" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña actual" value={pwForm.current_password} onChange={e => setPw('current_password', e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Nueva contraseña</label>
                    <input className="pw-field" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={pwForm.password} onChange={e => setPw('password', e.target.value)} required style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Confirmar nueva contraseña</label>
                    <input className="pw-field" type="password" autoComplete="new-password" placeholder="Repite la nueva contraseña" value={pwForm.password_confirmation} onChange={e => setPw('password_confirmation', e.target.value)} required style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="submit" disabled={pwLoading} style={{ height: 38, padding: '0 16px', borderRadius: 9, background: 'transparent', border: '0.5px solid #2a2a2a', color: '#e8e8e8', fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
                  {pwLoading ? 'Actualizando…' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>

          <div style={{ marginTop: 36, marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#E24B4A' }}>Zona de peligro</h2>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#666', lineHeight: 1.5 }}>Acciones irreversibles y destructivas.</p>
          </div>

          <div style={{ background: '#140e0e', border: '0.5px solid rgba(226,75,74,0.28)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#f0d6d5' }}>Cerrar todas las sesiones</div>
                <div style={{ fontSize: 12.5, color: '#9a7372', marginTop: 4, lineHeight: 1.55 }}>Revoca tu token de sesión actual y cierra tu sesión en todos lados.</div>
              </div>
              <button onClick={logout} style={{ height: 38, padding: '0 16px', borderRadius: 9, background: '#E24B4A', border: '0.5px solid #E24B4A', color: '#1a0606', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                Cerrar sesión
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
