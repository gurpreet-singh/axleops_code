import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import useEnumStore from './stores/enumStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
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
import LedgerGroupsPage from './pages/accounts/LedgerGroupsPage';
import LedgerAccountsPage from './pages/accounts/LedgerAccountsPage';

// ─── MRO / Maintenance ────────────────────────────────────
import WorkOrdersPage from './pages/mro/WorkOrdersPage';

// ─── Inventory ────────────────────────────────────────────
import PartsListPage from './pages/inventory/PartsListPage';
import PurchaseOrdersPage from './pages/inventory/PurchaseOrdersPage';

// ─── CSV Import ───────────────────────────────────────────
import ImportPage from './pages/import/ImportPage';

/**
 * Requires authentication — redirects to /login if not authenticated.
 * Also initialises the enum store on first mount.
 */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore();
  const { fetchEnums } = useEnumStore();
  useEffect(() => { fetchEnums(); }, [fetchEnums]);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Requires a role to be selected — redirects to role selector if no role chosen.
 */
function RequireRole({ children }) {
  const { isAuthenticated, currentRole } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!currentRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public — Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated — Role Selector */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <RoleSelector />
          </RequireAuth>
        }
      />

      {/* Authenticated + Role Selected — App Shell */}
      <Route
        element={
          <RequireRole>
            <AppLayout />
          </RequireRole>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ─── 1. Command Center ─────────────────────────── */}
        <Route path="/morning-briefing" element={<PlaceholderPage title="Morning Brief" icon="fas fa-sun" />} />
        <Route path="/command-center/alerts" element={<PlaceholderPage title="Alerts & Reminders" icon="fas fa-bell" />} />

        {/* ─── 2. Trips ──────────────────────────────────── */}
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/active" element={<ActiveTripsPage />} />
        <Route path="/trips/settled" element={<PlaceholderPage title="Settled Trips" icon="fas fa-check-circle" />} />
        <Route path="/trips/archived" element={<PlaceholderPage title="Archived Trips" icon="fas fa-archive" />} />
        <Route path="/trips/create" element={<Navigate to="/trips" replace />} />
        <Route path="/routes" element={<RoutesPage />} />

        {/* ─── 3. Fleet ──────────────────────────────────── */}
        <Route path="/fleet" element={<VehicleListPage />} />
        <Route path="/fleet/new" element={<PlaceholderPage title="Add Vehicle" icon="fas fa-truck" />} />
        <Route path="/fleet/types" element={<PlaceholderPage title="Vehicle Types" icon="fas fa-tags" />} />
        <Route path="/fleet/assignments" element={<PlaceholderPage title="Assignments" icon="fas fa-exchange-alt" />} />
        <Route path="/equipment" element={<PlaceholderPage title="Equipment" icon="fas fa-cogs" />} />
        <Route path="/documents" element={<PlaceholderPage title="Documents" icon="fas fa-file-alt" />} />
        <Route path="/fuel/history" element={<PlaceholderPage title="Fuel Log" icon="fas fa-gas-pump" />} />

        {/* ─── 4. People ─────────────────────────────────── */}
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/vendors" element={<PlaceholderPage title="Vendors" icon="fas fa-store" />} />
        <Route path="/drivers" element={<ContactsPage />} />
        <Route path="/employees" element={<PlaceholderPage title="Employees" icon="fas fa-users" />} />

        {/* ─── 5. Workshop ───────────────────────────────── */}
        <Route path="/workshop/service-records" element={<PlaceholderPage title="Service Records" icon="fas fa-clipboard-list" />} />
        <Route path="/workshop/job-cards" element={<WorkOrdersPage />} />
        <Route path="/inspections" element={<PlaceholderPage title="Inspections" icon="fas fa-clipboard-check" />} />
        <Route path="/workshop/parts" element={<PartsListPage />} />
        <Route path="/workshop/fitment-history" element={<PlaceholderPage title="Part Fitment History" icon="fas fa-history" />} />

        {/* ─── 6. Billing ────────────────────────────────── */}
        <Route path="/invoices" element={<PlaceholderPage title="Invoices" icon="fas fa-file-invoice" />} />
        <Route path="/payment-receipts" element={<PlaceholderPage title="Payment Receipts" icon="fas fa-receipt" />} />
        <Route path="/aging-analysis" element={<PlaceholderPage title="Aging Analysis" icon="fas fa-chart-area" />} />

        {/* ─── 7. Books ──────────────────────────────────── */}
        <Route path="/accounting/chart-of-accounts" element={<PlaceholderPage title="Chart of Accounts" icon="fas fa-list-alt" />} />
        <Route path="/accounting/voucher-entry" element={<PlaceholderPage title="Voucher Entry" icon="fas fa-edit" />} />
        <Route path="/accounting/day-book" element={<PlaceholderPage title="Day Book" icon="fas fa-calendar-day" />} />
        <Route path="/accounting/ledger" element={<PlaceholderPage title="Account Ledger" icon="fas fa-book" />} />
        <Route path="/accounting/trial-balance" element={<PlaceholderPage title="Trial Balance" icon="fas fa-balance-scale" />} />
        <Route path="/accounting/financial-statements" element={<PlaceholderPage title="Financial Statements" icon="fas fa-chart-pie" />} />
        <Route path="/accounting/tally-export" element={<PlaceholderPage title="Tally Export" icon="fas fa-file-export" />} />

        {/* ─── 8. Insights ───────────────────────────────── */}
        <Route path="/insights/route-profitability" element={<PlaceholderPage title="Route Profitability" icon="fas fa-route" />} />
        <Route path="/insights/fleet-utilization" element={<PlaceholderPage title="Fleet Utilization" icon="fas fa-truck-moving" />} />
        <Route path="/insights/driver-scorecard" element={<PlaceholderPage title="Driver Scorecard" icon="fas fa-id-card" />} />
        <Route path="/insights/fuel-analytics" element={<PlaceholderPage title="Fuel Analytics" icon="fas fa-gas-pump" />} />
        <Route path="/insights/behavioral-losses" element={<PlaceholderPage title="Behavioral Losses" icon="fas fa-chart-line" />} />
        <Route path="/insights/service-levels" element={<PlaceholderPage title="Service Level Report" icon="fas fa-star" />} />

        {/* ─── 9. Settings ───────────────────────────────── */}
        <Route path="/settings/organization" element={<PlaceholderPage title="Organization" icon="fas fa-building" />} />
        <Route path="/settings/branches" element={<PlaceholderPage title="Branches" icon="fas fa-code-branch" />} />
        <Route path="/settings/users-roles" element={<PlaceholderPage title="Users & Roles" icon="fas fa-users-cog" />} />
        <Route path="/settings/masters" element={<PlaceholderPage title="Masters" icon="fas fa-database" />} />
        <Route path="/settings/integrations" element={<PlaceholderPage title="Integrations" icon="fas fa-plug" />} />

        {/* ─── Utility ───────────────────────────────────── */}
        <Route path="/import" element={<ImportPage />} />

        {/* ─── Platform Admin ────────────────────────────── */}
        <Route path="/platform/tenants" element={<TenantsPage />} />
        <Route path="/platform/settings" element={<PlaceholderPage title="Platform Settings" icon="fas fa-cog" />} />

        {/* ─── Legacy Redirects ──────────────────────────── */}
        <Route path="/billing" element={<BillCollectPage />} />
        <Route path="/billing/create" element={<Navigate to="/invoices" replace />} />
        <Route path="/accounts/groups" element={<LedgerGroupsPage />} />
        <Route path="/accounts/ledgers" element={<LedgerAccountsPage />} />
        <Route path="/accounts-list" element={<Navigate to="/accounts/ledgers" replace />} />
        <Route path="/mro" element={<Navigate to="/workshop/job-cards" replace />} />
        <Route path="/inventory" element={<Navigate to="/workshop/parts" replace />} />
        <Route path="/procurement" element={<Navigate to="/workshop/parts" replace />} />
        <Route path="/service/work-orders" element={<Navigate to="/workshop/job-cards" replace />} />
        <Route path="/service/work-order-board" element={<Navigate to="/workshop/job-cards" replace />} />
        <Route path="/service/history" element={<Navigate to="/workshop/service-records" replace />} />
        <Route path="/service/tasks" element={<Navigate to="/workshop/service-records" replace />} />
        <Route path="/service/programs" element={<Navigate to="/workshop/service-records" replace />} />
        <Route path="/service/shop-directory" element={<Navigate to="/vendors" replace />} />
        <Route path="/inventory/parts" element={<Navigate to="/workshop/parts" replace />} />
        <Route path="/inventory/purchase-orders" element={<Navigate to="/workshop/parts" replace />} />
        <Route path="/inventory/intelligence" element={<Navigate to="/workshop/parts" replace />} />
        <Route path="/reports" element={<Navigate to="/insights/route-profitability" replace />} />
        <Route path="/reports/profit-loss" element={<Navigate to="/accounting/financial-statements" replace />} />
        <Route path="/reports/balance-sheet" element={<Navigate to="/accounting/financial-statements" replace />} />
        <Route path="/reports/cash-flow" element={<Navigate to="/accounting/financial-statements" replace />} />
        <Route path="/reports/trip-profitability" element={<Navigate to="/insights/route-profitability" replace />} />
        <Route path="/reports/insurance-spend" element={<Navigate to="/insights/fuel-analytics" replace />} />
        <Route path="/accounting" element={<Navigate to="/accounting/chart-of-accounts" replace />} />
        <Route path="/accounting/export-center" element={<Navigate to="/accounting/tally-export" replace />} />
        <Route path="/intelligence/recommendations" element={<Navigate to="/insights/route-profitability" replace />} />
        <Route path="/intelligence/behavioral-losses" element={<Navigate to="/insights/behavioral-losses" replace />} />
        <Route path="/intelligence/service-levels" element={<Navigate to="/insights/service-levels" replace />} />
        <Route path="/intelligence/alert-analytics" element={<Navigate to="/insights/fuel-analytics" replace />} />
        <Route path="/alerts/command-center" element={<Navigate to="/command-center/alerts" replace />} />
        <Route path="/alerts/rules" element={<Navigate to="/command-center/alerts" replace />} />
        <Route path="/alerts/escalation" element={<Navigate to="/command-center/alerts" replace />} />
        <Route path="/reminders" element={<Navigate to="/command-center/alerts" replace />} />
        <Route path="/admin/users" element={<Navigate to="/settings/users-roles" replace />} />
        <Route path="/settings" element={<Navigate to="/settings/organization" replace />} />
        <Route path="/users" element={<Navigate to="/settings/users-roles" replace />} />
        <Route path="/org/branches" element={<Navigate to="/settings/branches" replace />} />
        <Route path="/org/partners" element={<Navigate to="/settings/organization" replace />} />
        <Route path="/branches" element={<Navigate to="/settings/branches" replace />} />
        <Route path="/driver-ledger" element={<Navigate to="/accounting/ledger" replace />} />
        <Route path="/expense-history" element={<Navigate to="/fuel/history" replace />} />
        <Route path="/fuel/charging" element={<Navigate to="/fuel/history" replace />} />
        <Route path="/places" element={<Navigate to="/routes" replace />} />
        <Route path="/fleet/detail" element={<Navigate to="/fleet" replace />} />
        <Route path="/fleet/meter-history" element={<Navigate to="/fleet" replace />} />
        <Route path="/compliance/vehicles" element={<Navigate to="/fleet" replace />} />
        <Route path="/driver-app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/workflow-templates" element={<Navigate to="/settings/integrations" replace />} />
        <Route path="/workshop/forecast" element={<Navigate to="/workshop/job-cards" replace />} />
        <Route path="/workshop/vendor-capital" element={<Navigate to="/vendors" replace />} />
        <Route path="/platform/users" element={<Navigate to="/platform/tenants" replace />} />
        <Route path="/trips/settlement" element={<Navigate to="/trips/settled" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
