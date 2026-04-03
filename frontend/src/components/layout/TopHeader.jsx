import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function TopHeader() {
  const { currentRole, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  if (!currentRole) return null;

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const userName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : currentRole.user?.name || '';
  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`
    : currentRole.user?.initials || '';
  const roleName = currentRole.label || '';
  const tenantName = user?.tenantName || '';

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigate('/login');
  };

  const handleSwitchRole = () => {
    setShowMenu(false);
    navigate('/');
  };

  return (
    <header className="top-header">
      <div className="search-bar">
        <span className="search-icon"><i className="fas fa-search"></i></span>
        <input
          type="text"
          placeholder="Search AxleOps"
          id="global-search"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.target.value = '';
            }
          }}
        />
        <span className="search-scope">All ▾</span>
      </div>

      <div className="header-actions">
        <button className="header-btn" title="Notifications">
          <i className="fas fa-bell"></i>
          <span className="badge">1</span>
        </button>
        <button className="header-btn" title="Help">
          <i className="fas fa-question-circle"></i>
        </button>
        <button className="header-btn" title="Settings">
          <i className="fas fa-sliders-h"></i>
        </button>

        {/* User Profile Menu */}
        <div className="header-user-menu" ref={menuRef}>
          <button
            className="header-user-btn"
            onClick={() => setShowMenu(!showMenu)}
            title={userName}
            id="user-profile-btn"
          >
            <div className="header-user-avatar" style={{ background: currentRole.color || 'linear-gradient(135deg, #1a73e8, #4285f4)' }}>
              {userInitials}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{userName}</span>
              <span className="header-user-role">{roleName}</span>
            </div>
            <i className={`fas fa-chevron-${showMenu ? 'up' : 'down'} header-user-chevron`}></i>
          </button>

          {showMenu && (
            <div className="header-user-dropdown">
              <div className="header-dropdown-profile">
                <div className="header-dropdown-avatar" style={{ background: currentRole.color || 'linear-gradient(135deg, #1a73e8, #4285f4)' }}>
                  {userInitials}
                </div>
                <div className="header-dropdown-info">
                  <span className="header-dropdown-name">{userName}</span>
                  <span className="header-dropdown-role">{roleName}</span>
                  {tenantName && <span className="header-dropdown-tenant">{tenantName}</span>}
                </div>
              </div>

              <div className="header-dropdown-divider"></div>

              <button className="header-dropdown-item" onClick={handleSwitchRole} id="switch-role-btn">
                <i className="fas fa-exchange-alt"></i>
                <span>Switch Role</span>
              </button>

              <div className="header-dropdown-divider"></div>

              <button className="header-dropdown-item header-dropdown-logout" onClick={handleLogout} id="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
