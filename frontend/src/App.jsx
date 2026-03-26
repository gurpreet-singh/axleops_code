import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import AppLayout from './components/layout/AppLayout';
import RoleSelector from './pages/RoleSelector';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

function ProtectedRoute({ children }) {
  const { currentRole } = useAuthStore();
  if (!currentRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public — Role Selector */}
      <Route path="/" element={<RoleSelector />} />

      {/* Protected — App Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<PlaceholderPage title="Trip Management" icon="fas fa-route" />} />
        <Route path="/fleet" element={<PlaceholderPage title="Fleet Management" icon="fas fa-truck-moving" />} />
        <Route path="/clients" element={<PlaceholderPage title="Clients" icon="fas fa-building" />} />
        <Route path="/routes" element={<PlaceholderPage title="Route Management" icon="fas fa-map-marked-alt" />} />
        <Route path="/drivers" element={<PlaceholderPage title="Drivers" icon="fas fa-id-card" />} />
        <Route path="/billing" element={<PlaceholderPage title="Bill & Collect" icon="fas fa-file-invoice-dollar" />} />
        <Route path="/accounting" element={<PlaceholderPage title="Accounting" icon="fas fa-rupee-sign" />} />
        <Route path="/mro" element={<PlaceholderPage title="MRO & Maintenance" icon="fas fa-wrench" />} />
        <Route path="/inventory" element={<PlaceholderPage title="Parts & Inventory" icon="fas fa-boxes-stacked" />} />
        <Route path="/procurement" element={<PlaceholderPage title="Purchase Orders" icon="fas fa-file-alt" />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" icon="fas fa-chart-bar" />} />
        <Route path="/users" element={<PlaceholderPage title="User Management" icon="fas fa-users-cog" />} />
        <Route path="/branches" element={<PlaceholderPage title="Branches" icon="fas fa-code-branch" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" icon="fas fa-cog" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
