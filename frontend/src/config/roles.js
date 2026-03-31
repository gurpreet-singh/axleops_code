/* ===================================================
   AxleOps — RBAC Configuration (React Port)
   Aligned with backend enum-based Role & Authority system.
   Role IDs match backend Role enum names exactly.

   MENU STRUCTURE (v2 — task-oriented grouping):
   ─────────────────────────────────────────────
   1. Command Center  — Dashboard, Morning Brief, Alerts & Reminders
   2. Trips           — Active, Settled, Archived, Routes & Rates
   3. Fleet           — Vehicles, Assignments, Documents, Fuel Log
   4. People & Accounts — Ledger Accounts, Drivers, Employees
   5. Workshop        — Service Records, Job Cards, Inspections, Parts & Stock, Part Fitment History
   6. Billing         — Invoices, Payment Receipts, Aging Analysis
   7. Books           — Chart of Accounts, Voucher Entry, Day Book, Account Ledger, Trial Balance, Financial Statements, Tally Export
   8. Insights        — Route Profitability, Fleet Utilization, Driver Scorecard, Fuel Analytics, Behavioral Losses, Service Level Report
   9. Settings        — Organization, Branches, Users & Roles, Masters, Integrations
   10. (utility)      — CSV Import (flat item for admin roles)
   =================================================== */

export const DEPARTMENTS = {
  platform: {
    id: 'platform', label: 'Platform Management', icon: 'fas fa-globe', color: '#7C3AED',
    description: 'Multi-tenant platform administration & client onboarding',
    roles: ['PLATFORM_ADMIN']
  },
  executive: {
    id: 'executive', label: 'Executive', icon: 'fas fa-crown', color: '#8B5CF6',
    description: 'Strategic decisions & business growth',
    roles: ['OWNER_DIRECTOR', 'BRANCH_MANAGER']
  },
  operations: {
    id: 'operations', label: 'Operations', icon: 'fas fa-route', color: '#059669',
    description: 'Trip planning, dispatch & execution',
    roles: ['FLEET_MANAGER', 'OPERATIONS_EXECUTIVE', 'DRIVER']
  },
  finance: {
    id: 'finance', label: 'Finance & Accounts', icon: 'fas fa-rupee-sign', color: '#DC2626',
    description: 'Money management, billing & collections',
    roles: ['FINANCE_CONTROLLER', 'ACCOUNTS_EXECUTIVE']
  },
  maintenance: {
    id: 'maintenance', label: 'Maintenance & Workshop', icon: 'fas fa-wrench', color: '#D97706',
    description: 'Vehicle health & repair management',
    roles: ['WORKSHOP_MANAGER', 'MECHANIC']
  },
  inventory: {
    id: 'inventory', label: 'Inventory & Procurement', icon: 'fas fa-boxes-stacked', color: '#0891B2',
    description: 'Parts stock control & vendor management',
    roles: ['INVENTORY_MANAGER']
  },
  admin: {
    id: 'admin', label: 'System Administration', icon: 'fas fa-server', color: '#374151',
    description: 'System config, users & integrations',
    roles: ['SUPER_ADMIN']
  },
};

export const ROLES = {
  PLATFORM_ADMIN: {
    id: 'PLATFORM_ADMIN', label: 'Platform Admin', icon: 'fas fa-globe', color: '#7C3AED',
    department: 'platform',
    user: { name: 'Platform Admin', initials: 'PA', title: 'Platform Administrator' },
    description: 'Full access to all platform tenants. Create & manage transport companies, assign system admins.',
    kpis: ['Total Tenants', 'Active Companies', 'Total Users', 'System Health']
  },
  OWNER_DIRECTOR: {
    id: 'OWNER_DIRECTOR', label: 'Owner / Director', icon: 'fas fa-crown', color: '#8B5CF6',
    department: 'executive',
    user: { name: 'Priya Sharma', initials: 'PS', title: 'Managing Director' },
    description: 'Full visibility into P&L, revenue, fleet utilization, and strategic decisions.',
    kpis: ['Revenue', 'Net Profit', 'Fleet ROI', 'Client Growth']
  },
  BRANCH_MANAGER: {
    id: 'BRANCH_MANAGER', label: 'Branch Manager', icon: 'fas fa-building', color: '#0E7490',
    department: 'executive',
    user: { name: 'Anand Kulkarni', initials: 'AK', title: 'Branch Manager — Pune' },
    description: 'Cross-department authority within a single branch.',
    kpis: ['Branch Revenue', 'Branch Profit', 'Branch Vehicles', 'Active Trips']
  },
  FLEET_MANAGER: {
    id: 'FLEET_MANAGER', label: 'Fleet Manager', icon: 'fas fa-truck-moving', color: '#2563EB',
    department: 'operations',
    user: { name: 'Vikram Singh', initials: 'VS', title: 'Fleet Manager' },
    description: 'Vehicle allocation, trip planning, driver assignment & dispatch.',
    kpis: ['Vehicle Utilization', 'On-Time Delivery', 'Trip Count', 'Idle Vehicles']
  },
  OPERATIONS_EXECUTIVE: {
    id: 'OPERATIONS_EXECUTIVE', label: 'Operations Executive', icon: 'fas fa-headset', color: '#059669',
    department: 'operations',
    user: { name: 'Rajesh Kumar', initials: 'RK', title: 'Operations Executive' },
    description: 'Day-to-day trip dispatch, vehicle scheduling, driver coordination.',
    kpis: ['Active Trips', 'Delayed Trips', 'Driver Availability', 'Pending Dispatches']
  },
  DRIVER: {
    id: 'DRIVER', label: 'Driver', icon: 'fas fa-id-card', color: '#047857',
    department: 'operations',
    user: { name: 'Ramesh Yadav', initials: 'RY', title: 'Driver — MH04AB1234' },
    description: 'Trip execution, fuel & expense recording, POD uploads.',
    kpis: ['Active Trip', 'Km Today', 'Fuel Entered', 'PODs Pending']
  },
  FINANCE_CONTROLLER: {
    id: 'FINANCE_CONTROLLER', label: 'Finance Controller', icon: 'fas fa-chart-line', color: '#B91C1C',
    department: 'finance',
    user: { name: 'Anita Desai', initials: 'AD', title: 'Finance Controller' },
    description: 'P&L oversight, payment approvals, cash flow monitoring.',
    kpis: ['Net Cash Flow', 'Gross Margin', 'Approvals Pending', 'Budget Variance']
  },
  ACCOUNTS_EXECUTIVE: {
    id: 'ACCOUNTS_EXECUTIVE', label: 'Accounts Executive', icon: 'fas fa-calculator', color: '#EF4444',
    department: 'finance',
    user: { name: 'Deepak Jain', initials: 'DJ', title: 'Accounts Executive' },
    description: 'Voucher entry, expense recording, ledger management, daily accounting.',
    kpis: ['Pending Vouchers', 'Unreconciled', "Today's Entries", 'Expense Claims']
  },
  WORKSHOP_MANAGER: {
    id: 'WORKSHOP_MANAGER', label: 'Workshop Manager', icon: 'fas fa-tools', color: '#D97706',
    department: 'maintenance',
    user: { name: 'Tarun Mishra', initials: 'TM', title: 'Workshop Manager' },
    description: 'Work order management, mechanic scheduling & quality checks.',
    kpis: ['Open Work Orders', 'Avg Repair Time', 'Parts Stock', 'Overdue Services']
  },
  MECHANIC: {
    id: 'MECHANIC', label: 'Mechanic', icon: 'fas fa-wrench', color: '#B45309',
    department: 'maintenance',
    user: { name: 'Ravi Shankar', initials: 'RS', title: 'Senior Mechanic' },
    description: 'Work order execution, findings reporting, time & parts logging.',
    kpis: ['Assigned WOs', 'Completed Today', 'Avg Repair Time', 'Parts Requested']
  },
  INVENTORY_MANAGER: {
    id: 'INVENTORY_MANAGER', label: 'Inventory Manager', icon: 'fas fa-boxes-stacked', color: '#0891B2',
    department: 'inventory',
    user: { name: 'Govind Thakur', initials: 'GT', title: 'Store Manager' },
    description: 'Parts stock, reordering, consumption tracking, vendor coordination.',
    kpis: ['Low Stock Items', 'Pending POs', 'Monthly Consumption', 'Stock Value']
  },
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN', label: 'Super Admin', icon: 'fas fa-shield-alt', color: '#374151',
    department: 'admin',
    user: { name: 'Amit Mehta', initials: 'AM', title: 'System Administrator' },
    description: 'Full system access — users, roles, configurations, integrations.',
    kpis: ['Active Users', 'System Health', 'Data Integrity', 'Audit Logs']
  },
};

/* ======================================================
   Role-Based Menus — v2 Task-Oriented Structure
   ──────────────────────────────────────────────
   DESIGN PRINCIPLES:
   1. Group by "what the user is trying to do" not by entity type
   2. Each role sees only the groups and sub-items relevant to their job
   3. Menu groups stay consistent in order across roles for muscle memory
   4. 10 top-level groups max (down from 20)
   ====================================================== */

// Helper: converts page names to React Router paths
export function pageToPath(page) {
  const map = {
    // ── Command Center ──
    'dashboard': '/dashboard',
    'morning-briefing': '/morning-briefing',
    'alerts-reminders': '/command-center/alerts',

    // ── Trips ──
    'active-trips': '/trips/active',
    'settled-trips': '/trips/settled',
    'archived-trips': '/trips/archived',
    'routes-rates': '/routes',

    // ── Fleet ──
    'vehicles': '/fleet',
    'assignments': '/fleet/assignments',
    'documents': '/documents',
    'fuel-log': '/fuel/history',

    // ── People & Accounts ──
    'ledger-accounts': '/accounts/ledgers',
    'drivers': '/drivers',
    'employees': '/employees',

    // ── Workshop ──
    'service-records': '/workshop/service-records',
    'job-cards': '/workshop/job-cards',
    'inspections': '/inspections',
    'parts-stock': '/workshop/parts',
    'part-fitment-history': '/workshop/fitment-history',

    // ── Billing ──
    'invoices': '/invoices',
    'payment-receipts': '/payment-receipts',
    'aging-analysis': '/aging-analysis',

    // ── Books ──
    'chart-of-accounts': '/accounting/chart-of-accounts',
    'voucher-entry': '/accounting/voucher-entry',
    'day-book': '/accounting/day-book',
    'account-ledger': '/accounting/ledger',
    'trial-balance': '/accounting/trial-balance',
    'financial-statements': '/accounting/financial-statements',
    'tally-export': '/accounting/tally-export',

    // ── Insights ──
    'route-profitability': '/insights/route-profitability',
    'fleet-utilization': '/insights/fleet-utilization',
    'driver-scorecard': '/insights/driver-scorecard',
    'fuel-analytics': '/insights/fuel-analytics',
    'behavioral-losses': '/insights/behavioral-losses',
    'service-level-report': '/insights/service-levels',

    // ── Settings ──
    'organization': '/settings/organization',
    'branches': '/settings/branches',
    'users-roles': '/settings/users-roles',
    'masters': '/settings/masters',
    'integrations': '/settings/integrations',

    // ── Utility ──
    'csv-import': '/import',

    // ── Platform Admin ──
    'platform-tenants': '/platform/tenants',
    'platform-settings': '/platform/settings',

    // ── Legacy compatibility (old page names → new paths) ──
    'owner-morning-briefing': '/morning-briefing',
    'trip-archive-search': '/trips/archived',
    'archived-trips': '/trips/settled',
    'routes': '/routes',
    'bill-collect': '/billing',
    'vehicle-list': '/fleet',
    'vehicle-assignments': '/fleet/assignments',
    'contacts': '/drivers',
    'clients': '/accounts/ledgers',
    'vendors': '/accounts/ledgers',
    'ledger-accounts': '/accounts/ledgers',
    'smart-recommendations': '/insights/route-profitability',
    'customer-service-levels': '/insights/service-levels',
    'alert-analytics': '/insights/fuel-analytics',
    'trip-alerts': '/command-center/alerts',
    'alerting-rules': '/command-center/alerts',
    'escalation-matrix': '/command-center/alerts',
    'work-orders': '/workshop/job-cards',
    'work-order-board': '/workshop/job-cards',
    'service-history': '/workshop/service-records',
    'service-tasks': '/workshop/service-records',
    'service-programs': '/workshop/service-records',
    'shop-directory': '/vendors',
    'parts-list': '/workshop/parts',
    'purchase-orders': '/workshop/parts',
    'inventory-intelligence': '/workshop/parts',
    'profit-loss': '/accounting/financial-statements',
    'balance-sheet': '/accounting/financial-statements',
    'cash-flow': '/accounting/financial-statements',
    'export-center': '/accounting/tally-export',
    'user-management': '/settings/users-roles',
    'settings': '/settings/organization',
    'client-bill-master': '/invoices',
    'vehicle-detail': '/fleet',
    'vehicle-new': '/fleet',
    'meter-history': '/fleet',
    'expense-history': '/fuel/history',
    'fuel-history': '/fuel/history',
    'charging-history': '/fuel/history',
    'places': '/routes',
    'reminders': '/command-center/alerts',
    'vehicle-compliance': '/fleet',
    'driver-mobile': '/dashboard',
    'workflow-templates': '/settings/integrations',
    'platform-users': '/platform/tenants',
    'branches': '/settings/branches',
    'workshop-forecast': '/workshop/job-cards',
    'vendor-capital': '/vendors',
    'reports': '/insights/route-profitability',
    'trip-profitability': '/insights/route-profitability',
    'insurance-spend': '/insights/fuel-analytics',
    'driver-ledger': '/accounting/ledger',
    'inspections': '/inspections',
  };
  return map[page] || `/${page}`;
}


/* ──────────────────────────────────────────────────────────
   REUSABLE MENU FRAGMENTS
   Build once, compose per-role.
   ────────────────────────────────────────────────────────── */

const MENU = {
  // ── 1. Command Center ──────────────────────────────────
  commandCenter: (children) => ({
    type: 'group', icon: 'fas fa-satellite-dish', label: 'Command Center', id: 'sub-command-center',
    children,
  }),
  cc: {
    dashboard:        { label: 'Dashboard',          page: 'dashboard' },
    morningBrief:     { label: 'Morning Brief',      page: 'morning-briefing' },
    alertsReminders:  { label: 'Alerts & Reminders', page: 'alerts-reminders' },
  },

  // ── 2. Trips ───────────────────────────────────────────
  trips: (children) => ({
    type: 'group', icon: 'fas fa-route', label: 'Trips', id: 'sub-trips',
    children,
  }),
  tr: {
    active:    { label: 'Active Trips',    page: 'active-trips' },
    settled:   { label: 'Settled Trips',   page: 'settled-trips' },
    archived:  { label: 'Archived Trips',  page: 'archived-trips' },
    routes:    { label: 'Routes & Rates',  page: 'routes-rates' },
  },

  // ── 3. Fleet ───────────────────────────────────────────
  fleet: (children) => ({
    type: 'group', icon: 'fas fa-truck', label: 'Fleet', id: 'sub-fleet',
    children,
  }),
  fl: {
    vehicles:    { label: 'Vehicles',       page: 'vehicles' },
    assignments: { label: 'Assignments',    page: 'assignments' },
    documents:   { label: 'Documents',      page: 'documents' },
    fuelLog:     { label: 'Fuel Log',       page: 'fuel-log' },
  },

  // ── 4. People & Accounts ───────────────────────────────
  people: (children) => ({
    type: 'group', icon: 'fas fa-users-cog', label: 'People & Accounts', id: 'sub-people',
    children,
  }),
  pp: {
    ledgerAccounts: { label: 'Ledger Accounts', page: 'ledger-accounts' },
    drivers:        { label: 'Drivers',         page: 'drivers' },
    employees:      { label: 'Employees',       page: 'employees' },
  },

  // ── 5. Workshop ────────────────────────────────────────
  workshop: (children) => ({
    type: 'group', icon: 'fas fa-wrench', label: 'Workshop', id: 'sub-workshop',
    children,
  }),
  ws: {
    serviceRecords:     { label: 'Service Records',       page: 'service-records' },
    jobCards:            { label: 'Job Cards',             page: 'job-cards' },
    inspections:        { label: 'Inspections',           page: 'inspections' },
    partsStock:         { label: 'Parts & Stock',         page: 'parts-stock' },
    partFitmentHistory: { label: 'Part Fitment History',  page: 'part-fitment-history' },
  },

  // ── 6. Billing ─────────────────────────────────────────
  billing: (children) => ({
    type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Billing', id: 'sub-billing',
    children,
  }),
  bi: {
    invoices:        { label: 'Invoices',         page: 'invoices' },
    paymentReceipts: { label: 'Payment Receipts', page: 'payment-receipts' },
    agingAnalysis:   { label: 'Aging Analysis',   page: 'aging-analysis' },
  },

  // ── 7. Books ───────────────────────────────────────────
  books: (children) => ({
    type: 'group', icon: 'fas fa-book', label: 'Books', id: 'sub-books',
    children,
  }),
  bk: {
    chartOfAccounts:     { label: 'Chart of Accounts',     page: 'chart-of-accounts' },
    voucherEntry:        { label: 'Voucher Entry',         page: 'voucher-entry' },
    dayBook:             { label: 'Day Book',              page: 'day-book' },
    accountLedger:       { label: 'Account Ledger',        page: 'account-ledger' },
    trialBalance:        { label: 'Trial Balance',         page: 'trial-balance' },
    financialStatements: { label: 'Financial Statements',  page: 'financial-statements' },
    tallyExport:         { label: 'Tally Export',          page: 'tally-export' },
  },

  // ── 8. Insights ────────────────────────────────────────
  insights: (children) => ({
    type: 'group', icon: 'fas fa-chart-line', label: 'Insights', id: 'sub-insights',
    children,
  }),
  in: {
    routeProfitability: { label: 'Route Profitability',  page: 'route-profitability' },
    fleetUtilization:   { label: 'Fleet Utilization',    page: 'fleet-utilization' },
    driverScorecard:    { label: 'Driver Scorecard',     page: 'driver-scorecard' },
    fuelAnalytics:      { label: 'Fuel Analytics',       page: 'fuel-analytics' },
    behavioralLosses:   { label: 'Behavioral Losses',    page: 'behavioral-losses' },
    serviceLevelReport: { label: 'Service Level Report', page: 'service-level-report' },
  },

  // ── 9. Settings ────────────────────────────────────────
  settings: (children) => ({
    type: 'group', icon: 'fas fa-cog', label: 'Settings', id: 'sub-settings',
    children,
  }),
  st: {
    organization: { label: 'Organization',  page: 'organization' },
    branches:     { label: 'Branches',      page: 'branches' },
    usersRoles:   { label: 'Users & Roles', page: 'users-roles' },
    masters:      { label: 'Masters',       page: 'masters' },
    integrations: { label: 'Integrations',  page: 'integrations' },
  },
};


export const ROLE_MENUS = {

  /* ────────────────────────────────────────────────────────
     PLATFORM_ADMIN
     Platform-level only — manages tenants, not business data.
     No access to trips, fleet, people, workshop, billing,
     books, or insights (those are tenant-level concerns).
     ──────────────────────────────────────────────────────── */
  PLATFORM_ADMIN: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-building', label: 'Tenant Management', id: 'sub-tenants', children: [
        { label: 'All Tenants', page: 'platform-tenants' },
      ]
    },
    { type: 'item', icon: 'fas fa-cog', label: 'Platform Settings', page: 'platform-settings' },
  ],

  /* ────────────────────────────────────────────────────────
     OWNER_DIRECTOR
     Full visibility — every group, every sub-item.
     Reason: The owner/director needs a 360° view of the
     business. They switch between revenue (Trips, Billing),
     cost (Fleet, Workshop), strategy (Insights), and
     compliance (Books, Settings) daily.
     ──────────────────────────────────────────────────────── */
  OWNER_DIRECTOR: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.morningBrief,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
      MENU.tr.routes,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.assignments,
      MENU.fl.documents,
      MENU.fl.fuelLog,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
      MENU.pp.drivers,
      MENU.pp.employees,
    ]),
    MENU.workshop([
      MENU.ws.serviceRecords,
      MENU.ws.jobCards,
      MENU.ws.inspections,
      MENU.ws.partsStock,
      MENU.ws.partFitmentHistory,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.books([
      MENU.bk.chartOfAccounts,
      MENU.bk.voucherEntry,
      MENU.bk.dayBook,
      MENU.bk.accountLedger,
      MENU.bk.trialBalance,
      MENU.bk.financialStatements,
      MENU.bk.tallyExport,
    ]),
    MENU.insights([
      MENU.in.routeProfitability,
      MENU.in.fleetUtilization,
      MENU.in.driverScorecard,
      MENU.in.fuelAnalytics,
      MENU.in.behavioralLosses,
      MENU.in.serviceLevelReport,
    ]),
    MENU.settings([
      MENU.st.organization,
      MENU.st.branches,
      MENU.st.usersRoles,
      MENU.st.masters,
      MENU.st.integrations,
    ]),
    { type: 'item', icon: 'fas fa-file-import', label: 'CSV Import', page: 'csv-import' },
  ],

  /* ────────────────────────────────────────────────────────
     BRANCH_MANAGER
     Cross-department within a single branch.
     Sees most groups but with limited depth:
     - No Masters or Integrations in Settings (central admin only)
     - Limited Books (no Financial Statements — that's controller territory)
     - Limited Insights (branch-relevant only)
     ──────────────────────────────────────────────────────── */
  BRANCH_MANAGER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.morningBrief,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
      MENU.tr.routes,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.assignments,
      MENU.fl.documents,
      MENU.fl.fuelLog,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
      MENU.pp.drivers,
      MENU.pp.employees,
    ]),
    MENU.workshop([
      MENU.ws.serviceRecords,
      MENU.ws.jobCards,
      MENU.ws.inspections,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.books([
      MENU.bk.chartOfAccounts,
      MENU.bk.accountLedger,
      MENU.bk.dayBook,
      MENU.bk.trialBalance,
    ]),
    MENU.insights([
      MENU.in.routeProfitability,
      MENU.in.fleetUtilization,
      MENU.in.driverScorecard,
    ]),
    MENU.settings([
      MENU.st.organization,
      MENU.st.branches,
      MENU.st.usersRoles,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     FLEET_MANAGER
     Owns the vehicle lifecycle and trip dispatch.
     - Full Fleet access (they manage every vehicle)
     - Trips (they dispatch and track)
     - Workshop limited to inspections (they initiate pre-trip checks,
       but don't manage work orders — that's Workshop Manager)
     - Billing view-only (they need to see invoice status for clients)
     - No Books (that's finance)
     - Insights: fleet & driver focused
     ──────────────────────────────────────────────────────── */
  FLEET_MANAGER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
      MENU.tr.routes,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.assignments,
      MENU.fl.documents,
      MENU.fl.fuelLog,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
      MENU.pp.drivers,
    ]),
    MENU.workshop([
      MENU.ws.inspections,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.insights([
      MENU.in.fleetUtilization,
      MENU.in.driverScorecard,
      MENU.in.fuelAnalytics,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     OPERATIONS_EXECUTIVE
     Day-to-day dispatch and coordination.
     - Trips (core job)
     - Fleet: Vehicles & Assignments only (knows which truck goes where)
     - People & Accounts: Ledger Accounts & Drivers (coordinates with them)
     - No Workshop, Books, or Settings (not their domain)
     - Billing view-only (checks pending bills for clients on phone)
     ──────────────────────────────────────────────────────── */
  OPERATIONS_EXECUTIVE: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
      MENU.tr.routes,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.assignments,
      MENU.fl.fuelLog,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
      MENU.pp.drivers,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     DRIVER
     Self-service: my trips, my vehicle, my fuel.
     Minimal menu — a driver shouldn't be overwhelmed.
     - Command Center: Alerts only (sees maintenance reminders, trip alerts)
     - Trips: Active only (they only care about current trip)
     - Fleet: My vehicle and fuel log (records fuel stops)
     - No People & Accounts, Billing, Books, Insights, Settings
     ──────────────────────────────────────────────────────── */
  DRIVER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.documents,
      MENU.fl.fuelLog,
    ]),
    MENU.workshop([
      MENU.ws.inspections,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     FINANCE_CONTROLLER
     Owns the money. Full Billing + Books + Financial Statements.
     - Command Center (dashboard + alerts for payment reminders)
     - Trips: view-only (needs to see trip P&L)
     - No Fleet details (not their concern)
     - People & Accounts: Ledger Accounts (AR/AP parties managed via ledger accounts)
     - Full Billing, full Books
     - Insights: Route Profitability & Fuel Analytics (cost analysis)
     ──────────────────────────────────────────────────────── */
  FINANCE_CONTROLLER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.books([
      MENU.bk.chartOfAccounts,
      MENU.bk.voucherEntry,
      MENU.bk.dayBook,
      MENU.bk.accountLedger,
      MENU.bk.trialBalance,
      MENU.bk.financialStatements,
      MENU.bk.tallyExport,
    ]),
    MENU.insights([
      MENU.in.routeProfitability,
      MENU.in.fuelAnalytics,
      MENU.in.behavioralLosses,
      MENU.in.serviceLevelReport,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     ACCOUNTS_EXECUTIVE
     Day-to-day data entry — vouchers, bills, receipts.
     - Similar to Finance Controller but no Financial Statements
       (that's a management report, not data entry)
     - No Insights (they enter data, they don't analyze it)
     - People & Accounts: Ledger Accounts (to link transactions)
     ──────────────────────────────────────────────────────── */
  ACCOUNTS_EXECUTIVE: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.books([
      MENU.bk.chartOfAccounts,
      MENU.bk.voucherEntry,
      MENU.bk.dayBook,
      MENU.bk.accountLedger,
      MENU.bk.trialBalance,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     WORKSHOP_MANAGER
     Owns the workshop end-to-end.
     - Full Workshop access (all 5 sub-items)
     - Fleet: Vehicles only (to see which vehicles need service)
     - People & Accounts: Ledger Accounts (spare part suppliers via ledger accounts)
     - Insights: Fleet Utilization (to plan capacity)
     - No Trips, Billing, or Books (not their concern)
     ──────────────────────────────────────────────────────── */
  WORKSHOP_MANAGER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
    ]),
    MENU.workshop([
      MENU.ws.serviceRecords,
      MENU.ws.jobCards,
      MENU.ws.inspections,
      MENU.ws.partsStock,
      MENU.ws.partFitmentHistory,
    ]),
    MENU.insights([
      MENU.in.fleetUtilization,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     MECHANIC
     Hands-on — sees only what they physically work on.
     - Command Center: Dashboard + Alerts (job notifications)
     - Workshop: Service Records, Job Cards, Inspections, Parts
       (no Part Fitment History — that's a management report)
     - No Fleet, People & Accounts, Billing, Books, Insights, Settings
     ──────────────────────────────────────────────────────── */
  MECHANIC: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.workshop([
      MENU.ws.serviceRecords,
      MENU.ws.jobCards,
      MENU.ws.inspections,
      MENU.ws.partsStock,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     INVENTORY_MANAGER
     Parts lifecycle owner — stock, procurement, fitment tracking.
     - Command Center: Dashboard + Alerts (low stock alerts)
     - Workshop: Parts & Stock + Part Fitment History (core job)
     - People & Accounts: Ledger Accounts (supplier management for POs)
     - No Trips, Fleet details, Billing, or Books
     ──────────────────────────────────────────────────────── */
  INVENTORY_MANAGER: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.alertsReminders,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
    ]),
    MENU.workshop([
      MENU.ws.partsStock,
      MENU.ws.partFitmentHistory,
    ]),
  ],

  /* ────────────────────────────────────────────────────────
     SUPER_ADMIN
     Full system access — identical to Owner but also includes
     all Settings sub-items and CSV Import.
     The difference from Owner: Super Admin is the technical
     administrator (configures masters, integrations, number
     series) while Owner is the business owner.
     ──────────────────────────────────────────────────────── */
  SUPER_ADMIN: [
    MENU.commandCenter([
      MENU.cc.dashboard,
      MENU.cc.morningBrief,
      MENU.cc.alertsReminders,
    ]),
    MENU.trips([
      MENU.tr.active,
      MENU.tr.settled,
      MENU.tr.archived,
      MENU.tr.routes,
    ]),
    MENU.fleet([
      MENU.fl.vehicles,
      MENU.fl.assignments,
      MENU.fl.documents,
      MENU.fl.fuelLog,
    ]),
    MENU.people([
      MENU.pp.ledgerAccounts,
      MENU.pp.drivers,
      MENU.pp.employees,
    ]),
    MENU.workshop([
      MENU.ws.serviceRecords,
      MENU.ws.jobCards,
      MENU.ws.inspections,
      MENU.ws.partsStock,
      MENU.ws.partFitmentHistory,
    ]),
    MENU.billing([
      MENU.bi.invoices,
      MENU.bi.paymentReceipts,
      MENU.bi.agingAnalysis,
    ]),
    MENU.books([
      MENU.bk.chartOfAccounts,
      MENU.bk.voucherEntry,
      MENU.bk.dayBook,
      MENU.bk.accountLedger,
      MENU.bk.trialBalance,
      MENU.bk.financialStatements,
      MENU.bk.tallyExport,
    ]),
    MENU.insights([
      MENU.in.routeProfitability,
      MENU.in.fleetUtilization,
      MENU.in.driverScorecard,
      MENU.in.fuelAnalytics,
      MENU.in.behavioralLosses,
      MENU.in.serviceLevelReport,
    ]),
    MENU.settings([
      MENU.st.organization,
      MENU.st.branches,
      MENU.st.usersRoles,
      MENU.st.masters,
      MENU.st.integrations,
    ]),
    { type: 'item', icon: 'fas fa-file-import', label: 'CSV Import', page: 'csv-import' },
  ],
};
