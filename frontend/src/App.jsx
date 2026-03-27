import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import AppLayout from './components/layout/AppLayout';
import RoleSelector from './pages/RoleSelector';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

// ─── Platform Admin ──────────────────────────────────────
import TenantsPage from './pages/platform/TenantsPage';

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

// ─── Accounts ─────────────────────────────────────────────
import AccountGroupsPage from './pages/accounts/AccountGroupsPage';
import LedgerAccountsPage from './pages/accounts/LedgerAccountsPage';

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

        {/* ─── Trip Management ─────────────────────────── */}
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/active" element={<ActiveTripsPage />} />
        <Route path="/trips/settled" element={<PlaceholderPage title="Settled Trips" icon="fas fa-check-circle" />} />
        <Route path="/trips/archived" element={<PlaceholderPage title="Archived Trips" icon="fas fa-archive" />} />
        <Route path="/trips/create" element={<Navigate to="/trips" replace />} />
        <Route path="/trips/settlement" element={<PlaceholderPage title="Trip Settlement" icon="fas fa-handshake" />} />

        {/* ─── Fleet ───────────────────────────────────── */}
        <Route path="/fleet" element={<VehicleListPage />} />
        <Route path="/fleet/new" element={<PlaceholderPage title="Add Vehicle" icon="fas fa-truck" />} />
        <Route path="/fleet/types" element={<PlaceholderPage title="Vehicle Types" icon="fas fa-tags" />} />
        <Route path="/fleet/assignments" element={<PlaceholderPage title="Vehicle Assignments" icon="fas fa-exchange-alt" />} />
        <Route path="/fleet/detail" element={<PlaceholderPage title="Vehicle Detail" icon="fas fa-truck" />} />
        <Route path="/fleet/meter-history" element={<PlaceholderPage title="Meter History" icon="fas fa-tachometer-alt" />} />

        {/* ─── Equipment ───────────────────────────────── */}
        <Route path="/equipment" element={<PlaceholderPage title="Equipment" icon="fas fa-cogs" />} />

        {/* ─── Routes ──────────────────────────────────── */}
        <Route path="/routes" element={<RoutesPage />} />

        {/* ─── Clients & Billing ───────────────────────── */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/billing" element={<BillCollectPage />} />
        <Route path="/billing/create" element={<PlaceholderPage title="Create Bill" icon="fas fa-file-invoice" />} />
        <Route path="/invoices" element={<PlaceholderPage title="Invoices" icon="fas fa-file-invoice" />} />
        <Route path="/payment-receipts" element={<PlaceholderPage title="Payment Receipts" icon="fas fa-receipt" />} />
        <Route path="/aging-analysis" element={<PlaceholderPage title="Aging Analysis" icon="fas fa-chart-area" />} />

        {/* ─── Contacts / Drivers ──────────────────────── */}
        <Route path="/drivers" element={<ContactsPage />} />
        <Route path="/employees" element={<PlaceholderPage title="Employees" icon="fas fa-users" />} />
        <Route path="/accounts-list" element={<Navigate to="/accounts/ledgers" replace />} />

        {/* ─── Accounts (Groups + Ledgers) ──────────────── */}
        <Route path="/accounts/groups" element={<AccountGroupsPage />} />
        <Route path="/accounts/ledgers" element={<LedgerAccountsPage />} />
        <Route path="/driver-ledger" element={<PlaceholderPage title="Driver Ledger" icon="fas fa-book" />} />

        {/* ─── Expense History ─────────────────────────── */}
        <Route path="/expense-history" element={<PlaceholderPage title="Expense History" icon="fas fa-receipt" />} />

        {/* ─── Strategy & Intelligence ─────────────────── */}
        <Route path="/intelligence/recommendations" element={<PlaceholderPage title="Smart Recommendations" icon="fas fa-lightbulb" />} />
        <Route path="/intelligence/behavioral-losses" element={<PlaceholderPage title="Behavioral Losses" icon="fas fa-chart-line" />} />
        <Route path="/intelligence/service-levels" element={<PlaceholderPage title="Customer Service Levels" icon="fas fa-star" />} />
        <Route path="/intelligence/alert-analytics" element={<PlaceholderPage title="Alert Analytics" icon="fas fa-chart-bar" />} />
        <Route path="/morning-briefing" element={<PlaceholderPage title="Morning Briefing" icon="fas fa-mobile-alt" />} />

        {/* ─── Alert & Monitoring ──────────────────────── */}
        <Route path="/alerts/command-center" element={<PlaceholderPage title="Command Center" icon="fas fa-satellite-dish" />} />
        <Route path="/alerts/rules" element={<PlaceholderPage title="Alert Rules" icon="fas fa-cog" />} />
        <Route path="/alerts/escalation" element={<PlaceholderPage title="Escalation Matrix" icon="fas fa-sitemap" />} />

        {/* ─── Accounting / Ledgers ────────────────────── */}
        <Route path="/accounting/chart-of-accounts" element={<PlaceholderPage title="Chart of Accounts" icon="fas fa-list-alt" />} />
        <Route path="/accounting/ledger" element={<PlaceholderPage title="Account Ledger" icon="fas fa-book" />} />
        <Route path="/accounting/voucher-entry" element={<PlaceholderPage title="Voucher Entry" icon="fas fa-edit" />} />
        <Route path="/accounting/day-book" element={<PlaceholderPage title="Day Book" icon="fas fa-calendar-day" />} />
        <Route path="/accounting/trial-balance" element={<PlaceholderPage title="Trial Balance" icon="fas fa-balance-scale" />} />
        <Route path="/accounting/export-center" element={<PlaceholderPage title="Export Center" icon="fas fa-file-export" />} />

        {/* ─── Financial Reports ───────────────────────── */}
        <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" icon="fas fa-chart-bar" />} />
        <Route path="/reports/profit-loss" element={<PlaceholderPage title="Profit & Loss" icon="fas fa-chart-pie" />} />
        <Route path="/reports/balance-sheet" element={<PlaceholderPage title="Balance Sheet" icon="fas fa-file-alt" />} />
        <Route path="/reports/cash-flow" element={<PlaceholderPage title="Cash Flow" icon="fas fa-money-bill-wave" />} />
        <Route path="/reports/trip-profitability" element={<PlaceholderPage title="Trip Profitability" icon="fas fa-truck-loading" />} />
        <Route path="/reports/insurance-spend" element={<PlaceholderPage title="Insurance Spend" icon="fas fa-shield-alt" />} />

        {/* ─── Service / MRO ───────────────────────────── */}
        <Route path="/service/work-orders" element={<WorkOrdersPage />} />
        <Route path="/service/work-order-board" element={<PlaceholderPage title="Work Order Board" icon="fas fa-columns" />} />
        <Route path="/service/history" element={<PlaceholderPage title="Service History" icon="fas fa-history" />} />
        <Route path="/service/tasks" element={<PlaceholderPage title="Service Tasks" icon="fas fa-tasks" />} />
        <Route path="/service/programs" element={<PlaceholderPage title="Service Programs" icon="fas fa-clipboard-list" />} />
        <Route path="/service/shop-directory" element={<PlaceholderPage title="Shop Directory" icon="fas fa-store" />} />

        {/* ─── Inventory & Procurement ─────────────────── */}
        <Route path="/inventory/parts" element={<PartsListPage />} />
        <Route path="/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/inventory/intelligence" element={<PlaceholderPage title="Inventory Intelligence" icon="fas fa-brain" />} />

        {/* ─── Vendors ─────────────────────────────────── */}
        <Route path="/vendors" element={<PlaceholderPage title="Vendors" icon="fas fa-store" />} />

        {/* ─── Inspections ─────────────────────────────── */}
        <Route path="/inspections" element={<PlaceholderPage title="Inspections" icon="fas fa-clipboard-check" />} />

        {/* ─── Reminders ───────────────────────────────── */}
        <Route path="/reminders" element={<PlaceholderPage title="Reminders" icon="fas fa-bell" />} />

        {/* ─── Fuel & Energy ───────────────────────────── */}
        <Route path="/fuel/history" element={<PlaceholderPage title="Fuel History" icon="fas fa-gas-pump" />} />
        <Route path="/fuel/charging" element={<PlaceholderPage title="Charging History" icon="fas fa-bolt" />} />

        {/* ─── Places ──────────────────────────────────── */}
        <Route path="/places" element={<PlaceholderPage title="Places" icon="fas fa-map-marker-alt" />} />

        {/* ─── Documents ───────────────────────────────── */}
        <Route path="/documents" element={<PlaceholderPage title="Documents" icon="fas fa-file-alt" />} />

        {/* ─── Organization ────────────────────────────── */}
        <Route path="/org/branches" element={<PlaceholderPage title="Branches" icon="fas fa-code-branch" />} />
        <Route path="/org/partners" element={<PlaceholderPage title="Franchise & Partners" icon="fas fa-handshake" />} />

        {/* ─── Workshop Planning ───────────────────────── */}
        <Route path="/workshop/forecast" element={<PlaceholderPage title="Forecast & Capacity" icon="fas fa-calendar-alt" />} />
        <Route path="/workshop/vendor-capital" element={<PlaceholderPage title="Vendor Capital" icon="fas fa-hand-holding-usd" />} />

        {/* ─── Compliance ──────────────────────────────── */}
        <Route path="/compliance/vehicles" element={<PlaceholderPage title="Vehicle Compliance" icon="fas fa-shield-alt" />} />

        {/* ─── Driver App ──────────────────────────────── */}
        <Route path="/driver-app" element={<PlaceholderPage title="Driver App" icon="fas fa-mobile-alt" />} />
        <Route path="/workflow-templates" element={<PlaceholderPage title="Workflow Templates" icon="fas fa-project-diagram" />} />

        {/* ─── Admin ───────────────────────────────────── */}
        <Route path="/admin/users" element={<PlaceholderPage title="User Management" icon="fas fa-users-cog" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" icon="fas fa-cog" />} />

        {/* ─── Platform Admin ──────────────────────────── */}
        <Route path="/platform/tenants" element={<TenantsPage />} />
        <Route path="/platform/users" element={<PlaceholderPage title="Platform Users" icon="fas fa-users" />} />
        <Route path="/platform/settings" element={<PlaceholderPage title="Platform Settings" icon="fas fa-cog" />} />

        {/* Legacy compatibility */}
        <Route path="/mro" element={<WorkOrdersPage />} />
        <Route path="/inventory" element={<PartsListPage />} />
        <Route path="/procurement" element={<PurchaseOrdersPage />} />
        <Route path="/accounting" element={<PlaceholderPage title="Accounting" icon="fas fa-rupee-sign" />} />
        <Route path="/users" element={<PlaceholderPage title="User Management" icon="fas fa-users-cog" />} />
        <Route path="/branches" element={<PlaceholderPage title="Branches" icon="fas fa-code-branch" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
