import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import AppLayout from './components/layout/AppLayout';
import RoleSelector from './pages/RoleSelector';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

// ─── Trip Management ──────────────────────────────────────
import TripsPage from './pages/trips/TripsPage';
import ActiveTripsPage from './pages/trips/ActiveTripsPage';

// ─── Fleet Management ─────────────────────────────────────
import VehicleListPage from './pages/fleet/VehicleListPage';

// ─── Routes ───────────────────────────────────────────────
import RoutesPage from './pages/routes/RoutesPage';

// ─── Clients & Billing ────────────────────────────────────
import ClientsPage from './pages/clients/ClientsPage';
import BillCollectPage from './pages/accounting/BillCollectPage';

// ─── Contacts / Drivers ───────────────────────────────────
import ContactsPage from './pages/contacts/ContactsPage';

// ─── MRO / Maintenance ────────────────────────────────────
import WorkOrdersPage from './pages/mro/WorkOrdersPage';

// ─── Inventory ────────────────────────────────────────────
import PartsListPage from './pages/inventory/PartsListPage';
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage';

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

        {/* Trip Management */}
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/active" element={<ActiveTripsPage />} />
        <Route path="/trips/create" element={<PlaceholderPage title="Create Trip" icon="fas fa-plus-circle" />} />

        {/* Fleet */}
        <Route path="/fleet" element={<VehicleListPage />} />
        <Route path="/fleet/new" element={<PlaceholderPage title="Add Vehicle" icon="fas fa-truck" />} />

        {/* Routes */}
        <Route path="/routes" element={<RoutesPage />} />

        {/* Clients */}
        <Route path="/clients" element={<ClientsPage />} />

        {/* Contacts / Drivers */}
        <Route path="/drivers" element={<ContactsPage />} />

        {/* Finance / Accounting */}
        <Route path="/billing" element={<BillCollectPage />} />
        <Route path="/accounting" element={<PlaceholderPage title="Accounting" icon="fas fa-rupee-sign" />} />

        {/* MRO */}
        <Route path="/mro" element={<WorkOrdersPage />} />
        <Route path="/mro/create" element={<PlaceholderPage title="Create Work Order" icon="fas fa-wrench" />} />

        {/* Inventory */}
        <Route path="/inventory" element={<PartsListPage />} />
        <Route path="/procurement" element={<PurchaseOrdersPage />} />

        {/* Admin */}
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
