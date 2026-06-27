import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  monitors: <path d="M3 12h4l3 8 4-16 3 8h4"/>,
  incidents: <><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  analytics: <><line x1="6" y1="20" x2="6" y2="15"/><line x1="12" y1="20" x2="12" y2="9"/><line x1="18" y1="20" x2="18" y2="4"/></>,
  status: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  settings: <><line x1="3" y1="7" x2="21" y2="7"/><circle cx="9" cy="7" r="2.4"/><line x1="3" y1="17" x2="21" y2="17"/><circle cx="15" cy="17" r="2.4"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
};

function Icon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444', padding: '8px 10px 6px' }}>
      {children}
    </div>
  );
}

function SidebarLink({ to, icon, children, badge, external }) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '7px 10px', borderRadius: 7, fontSize: 13.5, fontWeight: 450, color: '#8a8a8a', textDecoration: 'none', cursor: 'pointer' }}
      >
        <Icon name={icon} />
        {children}
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 11, padding: '7px 10px',
        borderRadius: 7, fontSize: 13.5, fontWeight: 450,
        color: isActive ? '#e8e8e8' : '#8a8a8a',
        background: isActive ? '#1a1a1a' : 'transparent',
        textDecoration: 'none', cursor: 'pointer',
      })}
    >
      <Icon name={icon} />
      <span style={{ flex: 1 }}>{children}</span>
      {badge != null && badge > 0 && (
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 500, color: '#E24B4A', background: 'rgba(226,75,74,0.12)', borderRadius: 20, padding: '1px 6px' }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#0a0a0a' }}>
      <aside style={{ width: 220, flexShrink: 0, background: '#111111', borderRight: '0.5px solid #1e1e1e', display: 'flex', flexDirection: 'column', padding: '16px 12px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 8px 20px', borderBottom: '0.5px solid #1e1e1e', marginBottom: 14 }}>
          <img src="/Pegasus.PNG" alt="Pegasus" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'contain', background: '#ffffff', padding: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: '#f2f2f2' }}>Pegasus</span>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 9.5, fontWeight: 500, letterSpacing: '0.04em', color: '#1D9E75', background: 'rgba(29,158,117,0.1)', border: '0.5px solid rgba(29,158,117,0.25)', padding: '2px 6px', borderRadius: 5, textTransform: 'uppercase' }}>beta</span>
          </div>
        </div>

        <SectionLabel>Monitoreo</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SidebarLink to="/" icon="dashboard">Dashboard</SidebarLink>
          <SidebarLink to="/monitors" icon="monitors">Monitores</SidebarLink>
          <SidebarLink to="/incidents" icon="incidents">Incidentes</SidebarLink>
          <SidebarLink to="/analytics" icon="analytics">Analíticas</SidebarLink>
        </nav>

        <SectionLabel>Espacio de trabajo</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SidebarLink to={`/status/${user?.username || ''}`} icon="status" external>Página de estado</SidebarLink>
          <SidebarLink to="/notifications" icon="bell">Notificaciones</SidebarLink>
          <SidebarLink to="/settings" icon="settings">Configuración</SidebarLink>
        </nav>

        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderTop: '0.5px solid #1e1e1e', marginTop: 10 }}>
          <div style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 7, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#9a9a9a' }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, color: '#cfcfcf', fontWeight: 450, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username ? `@${user.username}` : user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICONS.logout}
            </svg>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  );
}
