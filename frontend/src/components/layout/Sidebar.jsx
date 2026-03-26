import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function Sidebar() {
  const { currentRole, menuItems } = useAuthStore();
  const navigate = useNavigate();

  if (!currentRole) return null;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
        <div className="logo-icon">
          <i className="fas fa-truck-moving"></i>
        </div>
        <div className="logo-text">
          <span className="logo-name">AxleOps</span>
          <span className="logo-tagline">Fleet Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
          >
            <i className={`nav-icon ${item.icon}`}></i>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role Switcher */}
      <div className="sidebar-footer" style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: 'auto',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#b0bec5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#b0bec5';
          }}
        >
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: currentRole.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 600, color: '#fff',
          }}>
            {currentRole.user.initials}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 500 }}>{currentRole.user.name}</div>
            <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>{currentRole.label}</div>
          </div>
          <i className="fas fa-exchange-alt" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
        </button>
      </div>
    </aside>
  );
}
