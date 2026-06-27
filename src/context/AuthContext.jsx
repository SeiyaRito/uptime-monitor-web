import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pw_token');
    if (!token) { setLoading(false); return; }
    client.get('/api/auth/me')
      .then(r => setUser(r.data.user || r.data))
      .catch(() => localStorage.removeItem('pw_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await client.post('/api/auth/login', { email, password });
    localStorage.setItem('pw_token', r.data.token);
    setUser(r.data.user);
  };

  const register = async (data) => {
    const r = await client.post('/api/auth/register', data);
    localStorage.setItem('pw_token', r.data.token);
    setUser(r.data.user);
  };

  const logout = async () => {
    try { await client.post('/api/auth/logout'); } catch {}
    localStorage.removeItem('pw_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
