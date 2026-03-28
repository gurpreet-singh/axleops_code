import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { pageToPath } from '../../config/roles';

export default function Sidebar() {
  const { currentRole, menuItems, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({});

  // Auto-expand group that contains the current path
  useEffect(() => {
    if (!menuItems) return;
    const newExpanded = {};
    menuItems.forEach((item) => {
      if (item.type === 'group' && item.children) {
        const isActive = item.children.some(
          (child) => pageToPath(child.page) === location.pathname
        );
        if (isActive) newExpanded[item.id] = true;
      }
    });
    setExpanded((prev) => ({ ...prev, ...newExpanded }));
  }, [location.pathname, menuItems]);

  if (!currentRole) return null;

  const toggleGroup = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Use real authenticated user info
  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : currentRole.user.name;
  const userInitials = user
    ? `${user.firstName[0]}${user.lastName[0]}`
    : currentRole.user.initials;
  const tenantName = user?.tenantName || 'Preet Transport';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
        <div className="brand-icon">
          {userInitials}
        </div>
        <div className="brand-info">
          <span className="brand-name">{tenantName}</span>
          <span className="brand-sub">{userName}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => {
          if (item.type === 'group') {
            const isExpanded = expanded[item.id];
            const isGroupActive = item.children?.some(
              (child) => pageToPath(child.page) === location.pathname
            );
            return (
              <div key={item.id || idx}>
                {/* Group header */}
                <div
                  className={`nav-item${isExpanded ? ' expanded' : ''}${isGroupActive ? ' group-active' : ''}`}
                  onClick={() => toggleGroup(item.id)}
                >
                  <span className="nav-icon"><i className={item.icon}></i></span>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-arrow">&#9654;</span>
                </div>
                {/* Sub-nav */}
                <div className={`sub-nav${isExpanded ? ' open' : ''}`}>
                  {item.children?.map((child, ci) => (
                    <NavLink
                      key={ci}
                      to={pageToPath(child.page)}
                      className={({ isActive }) =>
                        `nav-item${isActive ? ' active' : ''}`
                      }
                    >
                      <span className="nav-label">{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          // Flat item
          return (
            <NavLink
              key={item.page || idx}
              to={pageToPath(item.page)}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon"><i className={item.icon}></i></span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher Footer */}
      <div className="sidebar-footer">
        <button
          onClick={() => navigate('/')}
          className="role-switch-btn"
        >
          <div className="role-switch-avatar" style={{ background: currentRole.color }}>
            {userInitials}
          </div>
          <div className="role-switch-info">
            <div className="role-switch-name">{userName}</div>
            <div className="role-switch-role">{currentRole.label}</div>
          </div>
          <i className="fas fa-exchange-alt role-switch-icon"></i>
        </button>
      </div>
    </aside>
  );
}
