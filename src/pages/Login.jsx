import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <img src="/Pegasus.PNG" alt="Pegasus" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, objectFit: 'contain', background: '#ffffff', padding: 5, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f2f2' }}>Pegasus</span>
      </div>

      <div style={{ width: '100%', maxWidth: 404, background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 14, padding: '30px 30px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Bienvenido de vuelta</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#666', lineHeight: 1.5 }}>Inicia sesión en tu cuenta de Pegasus.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {error && <div style={{ fontSize: 13, color: '#E24B4A', background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '10px 13px' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Correo electrónico</label>
            <input className="pw-field" type="email" autoComplete="email" placeholder="tu@empresa.com" value={form.email} onChange={e => set('email', e.target.value)} required
              style={{ height: 40, padding: '0 13px', background: '#101010', border: '0.5px solid #262626', borderRadius: 9, color: '#e8e8e8', fontFamily: "'Geist Mono',monospace", fontSize: 13 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>Contraseña</label>
            </div>
            <input className="pw-field" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" value={form.password} onChange={e => set('password', e.target.value)} required
              style={{ height: 40, padding: '0 13px', background: '#101010', border: '0.5px solid #262626', borderRadius: 9, color: '#e8e8e8', fontSize: 13.5 }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 6, height: 42, borderRadius: 9, background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#04140d', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      <p style={{ margin: '22px 0 0', fontSize: 13.5, color: '#666' }}>
        ¿No tienes cuenta?{' '}
        <Link to="/register" style={{ color: '#1D9E75', fontWeight: 500 }}>Crea una</Link>
      </p>
    </div>
  );
}
