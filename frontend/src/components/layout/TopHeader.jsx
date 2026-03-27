import { useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function TopHeader() {
  const { currentRole } = useAuthStore();
  const location = useLocation();

  if (!currentRole) return null;

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))
    .join(' › ') || 'Dashboard';

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
      </div>
    </header>
  );
}
