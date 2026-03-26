import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import SliderPanel from './SliderPanel';

export default function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopHeader />
        <div className="content-area" style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
      <SliderPanel />
    </div>
  );
}
