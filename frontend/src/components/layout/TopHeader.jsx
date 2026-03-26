import useAuthStore from '../../stores/authStore';

export default function TopHeader() {
  const { currentRole } = useAuthStore();

  if (!currentRole) return null;

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="breadcrumb-label" style={{ color: currentRole.color }}>
            <i className={currentRole.icon} style={{ marginRight: 6 }}></i>
            {currentRole.label}
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f0f2f5', borderRadius: 8, padding: '6px 14px',
        }}>
          <i className="fas fa-search" style={{ color: '#8e99a9', fontSize: '0.8rem' }}></i>
          <input
            type="text"
            placeholder="Search trips, vehicles, clients..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: '0.82rem', color: '#1a1a2e', width: 220,
            }}
          />
          <kbd style={{
            fontSize: '0.65rem', color: '#8e99a9', background: '#e1e5eb',
            padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace',
          }}>⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="header-icon-btn" style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 8, borderRadius: 8,
          color: '#5a6474', fontSize: '1rem',
        }}>
          <i className="fas fa-bell"></i>
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ea4335', border: '2px solid #fff',
          }}></span>
        </button>

        {/* User Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: currentRole.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 600, color: '#fff',
          cursor: 'pointer',
        }}>
          {currentRole.user.initials}
        </div>
      </div>
    </header>
  );
}
