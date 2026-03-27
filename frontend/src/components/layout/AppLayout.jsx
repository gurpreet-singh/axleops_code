import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import SliderPanel from './SliderPanel';

export default function AppLayout() {
  const location = useLocation();

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '))
    .join(' › ') || 'Dashboard';

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        {/* Breadcrumb */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-text">{breadcrumb}</div>
        </div>
        {/* Page Content Area */}
        <div className="page-content" id="page-content-area">
          <Outlet />
        </div>
      </main>
      <SliderPanel />
    </div>
  );
}
