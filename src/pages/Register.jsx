import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const msgs = Object.values(data.errors).flat();
        setError(msgs[0]);
      } else {
        setError(data?.message || 'Algo salió mal.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (label, type, key, placeholder, extra = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 12.5, fontWeight: 500, color: '#9a9a9a' }}>{label}</label>
      <input className="pw-field" type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} required
        style={{ height: 40, padding: '0 13px', background: '#101010', border: '0.5px solid #262626', borderRadius: 9, color: '#e8e8e8', fontSize: 13.5, ...extra }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a', color: '#e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <img src="/Pegasus.PNG" alt="Pegasus" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, objectFit: 'contain', background: '#ffffff', padding: 5, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f2f2' }}>Pegasus</span>
      </div>

      <div style={{ width: '100%', maxWidth: 404, background: '#141414', border: '0.5px solid #1e1e1e', borderRadius: 14, padding: '30px 30px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: '#f2f2f2' }}>Crea tu cuenta</h1>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#666', lineHeight: 1.5 }}>Empieza a monitorear tus servicios en minutos.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {error && <div style={{ fontSize: 13, color: '#E24B4A', background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', borderRadius: 8, padding: '10px 13px' }}>{error}</div>}

          {field('Nombre completo', 'text', 'name', 'Ana García')}
          {field('Usuario', 'text', 'username', 'anagarcia', { fontFamily: "'Geist Mono',monospace", fontSize: 13 })}
          {field('Correo electrónico', 'email', 'email', 'tu@empresa.com', { fontFamily: "'Geist Mono',monospace", fontSize: 13 })}
          {field('Contraseña', 'password', 'password', 'Mínimo 8 caracteres')}
          {field('Confirmar contraseña', 'password', 'password_confirmation', 'Repite tu contraseña')}

          <button type="submit" disabled={loading} style={{ marginTop: 6, height: 42, borderRadius: 9, background: '#1D9E75', border: '0.5px solid #1D9E75', color: '#04140d', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ margin: '18px 0 0', fontSize: 11.5, color: '#555', textAlign: 'center', lineHeight: 1.6 }}>
          Al crear una cuenta aceptas nuestros Términos y Política de Privacidad.
        </p>
      </div>

      <p style={{ margin: '22px 0 0', fontSize: 13.5, color: '#666' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" style={{ color: '#1D9E75', fontWeight: 500 }}>Inicia sesión</Link>
      </p>
    </div>
  );
}
