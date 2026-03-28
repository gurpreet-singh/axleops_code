import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { DEPARTMENTS, ROLES } from '../config/roles';

export default function RoleSelector() {
  const navigate = useNavigate();
  const { setRole, selectRole, user, logout, getUserRoleCodes, isPlatformAdmin } = useAuthStore();

  // Get the user's assigned role codes from the backend
  const userRoleCodes = getUserRoleCodes();

  // Auto-skip: if user has exactly 1 role, go directly to dashboard
  useEffect(() => {
    if (userRoleCodes.length === 1) {
      const onlyRole = userRoleCodes[0];
      handleSelectRole(onlyRole);
    }
  }, [userRoleCodes.length]);

  const handleSelectRole = async (roleId) => {
    // For platform admin, no backend call needed — just set the UI role
    if (roleId === 'PLATFORM_ADMIN') {
      setRole(roleId);
      navigate('/dashboard');
      return;
    }

    // Call backend to get a scoped JWT for this role
    await selectRole(roleId);
    setRole(roleId);
    navigate('/dashboard');
  };

  const handleSelectAll = async () => {
    // "Full Access" — combined JWT with all roles
    await selectRole('ALL');
    // Use the first role's menu as the UI menu (or SUPER_ADMIN if they have it)
    const preferredUI = userRoleCodes.includes('SUPER_ADMIN')
      ? 'SUPER_ADMIN'
      : userRoleCodes.includes('OWNER_DIRECTOR')
        ? 'OWNER_DIRECTOR'
        : userRoleCodes[0];
    setRole(preferredUI);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Platform admin sees only the platform department
  if (isPlatformAdmin()) {
    return (
      <div className="role-selector-page">
        <RoleSelectorHeader user={user} onLogout={handleLogout} />
        <div className="dept-grid">
          <DeptCard dept={DEPARTMENTS.platform} userRoleCodes={['PLATFORM_ADMIN']} user={user} onSelect={handleSelectRole} />
        </div>
      </div>
    );
  }

  // Filter departments: only show depts that have at least one of the user's roles
  const visibleDepts = Object.values(DEPARTMENTS)
    .filter(d => d.id !== 'platform') // Platform admin dept not for tenant users
    .filter(d => d.roles.some(r => userRoleCodes.includes(r)));

  return (
    <div className="role-selector-page">
      <RoleSelectorHeader user={user} onLogout={handleLogout} />

      {/* Full Access option — only if user has 2+ roles */}
      {userRoleCodes.length > 1 && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            onClick={handleSelectAll}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="fas fa-layer-group" />
            Full Access — All Roles Combined
          </button>
        </div>
      )}

      <div className="dept-grid">
        {visibleDepts.map((dept) => (
          <DeptCard
            key={dept.id}
            dept={dept}
            userRoleCodes={userRoleCodes}
            user={user}
            onSelect={handleSelectRole}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────

function RoleSelectorHeader({ user, onLogout }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.3rem',
        }}>
          <i className="fas fa-truck-moving"></i>
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>AxleOps</h1>
          <span style={{
            fontSize: '0.75rem', color: '#8e99a9',
            fontWeight: 500, letterSpacing: 0.5,
          }}>FLEET MANAGEMENT PLATFORM</span>
        </div>
      </div>

      {user && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, marginBottom: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>
            {(user.firstName || user.fullName)?.[0]}{user.lastName?.[0]}
          </div>
          <span style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500 }}>
            {user.fullName || `${user.firstName} ${user.lastName}`}
          </span>
          <span style={{
            fontSize: 11, color: '#64748b',
            background: 'rgba(100,116,139,0.15)',
            padding: '3px 8px', borderRadius: 6,
          }}>
            {user.tenantName || 'Preet Transport'}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none', border: '1px solid rgba(148,163,184,0.2)',
              color: '#94a3b8', borderRadius: 6, padding: '4px 10px',
              fontSize: 11, cursor: 'pointer', marginLeft: 4,
            }}
            title="Sign out"
          >
            <i className="fas fa-sign-out-alt" style={{ marginRight: 4 }} />
            Sign out
          </button>
        </div>
      )}

      <p className="subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>
        Select your role to access your personalized dashboard and tools.
      </p>
    </div>
  );
}

function DeptCard({ dept, userRoleCodes, user, onSelect }) {
  // Only show roles that the user actually has
  const visibleRoles = dept.roles.filter(r => userRoleCodes.includes(r));
  if (visibleRoles.length === 0) return null;

  return (
    <div className="dept-card">
      <div className="dept-card-header">
        <div className="dept-icon" style={{ background: dept.color }}>
          <i className={dept.icon}></i>
        </div>
        <div>
          <h3>{dept.label}</h3>
          <p>{dept.description}</p>
        </div>
      </div>

      <div className="role-list">
        {visibleRoles.map((roleId) => {
          const role = ROLES[roleId];
          if (!role) return null;
          return (
            <button
              key={roleId}
              className="role-btn"
              onClick={() => onSelect(roleId)}
            >
              <i className={role.icon} style={{ color: role.color }}></i>
              <span>{role.label}</span>
              <span className="role-meta">
                {user ? (user.fullName || `${user.firstName} ${user.lastName}`) : role.user.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
