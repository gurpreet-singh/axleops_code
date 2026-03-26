import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { DEPARTMENTS, ROLES } from '../config/roles';

export default function RoleSelector() {
  const navigate = useNavigate();
  const setRole = useAuthStore((s) => s.setRole);

  const handleSelectRole = (roleId) => {
    setRole(roleId);
    navigate('/dashboard');
  };

  // Filter to visible departments only
  const visibleDepts = Object.values(DEPARTMENTS).filter((d) => !d.hidden);

  return (
    <div className="role-selector-page">
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
        <p className="subtitle" style={{ maxWidth: 500, margin: '0 auto' }}>
          Select your role to access your personalized dashboard and tools.
        </p>
      </div>

      <div className="dept-grid">
        {visibleDepts.map((dept) => (
          <div className="dept-card" key={dept.id}>
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
              {dept.roles.map((roleId) => {
                const role = ROLES[roleId];
                if (!role) return null;
                return (
                  <button
                    key={roleId}
                    className="role-btn"
                    onClick={() => handleSelectRole(roleId)}
                  >
                    <i className={role.icon} style={{ color: role.color }}></i>
                    <span>{role.label}</span>
                    <span className="role-meta">{role.user.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
