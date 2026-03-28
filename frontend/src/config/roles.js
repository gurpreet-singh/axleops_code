/* ===================================================
   AxleOps — RBAC Configuration (React Port)
   Ported from js/rbac.js — Departments, Roles, Menus
   Full nested menu structure for all roles
   =================================================== */

export const DEPARTMENTS = {
  platform: {
    id: 'platform', label: 'Platform Management', icon: 'fas fa-globe', color: '#7C3AED',
    description: 'Multi-tenant platform administration & client onboarding',
    roles: ['platform_admin']
  },
  executive: {
    id: 'executive', label: 'Executive', icon: 'fas fa-crown', color: '#8B5CF6',
    description: 'Strategic decisions & business growth',
    roles: ['owner', 'branch_manager']
  },
  operations: {
    id: 'operations', label: 'Operations', icon: 'fas fa-route', color: '#059669',
    description: 'Trip planning, dispatch & execution',
    roles: ['fleet_manager', 'operator', 'driver']
  },
  finance: {
    id: 'finance', label: 'Finance & Accounts', icon: 'fas fa-rupee-sign', color: '#DC2626',
    description: 'Money management, billing & collections',
    roles: ['finance_controller', 'accounts_exec']
  },
  maintenance: {
    id: 'maintenance', label: 'Maintenance & Workshop', icon: 'fas fa-wrench', color: '#D97706',
    description: 'Vehicle health & repair management',
    roles: ['shop_manager', 'mechanic']
  },
  inventory: {
    id: 'inventory', label: 'Inventory & Procurement', icon: 'fas fa-boxes-stacked', color: '#0891B2',
    description: 'Parts stock control & vendor management',
    roles: ['inventory_manager']
  },
  admin: {
    id: 'admin', label: 'System Administration', icon: 'fas fa-server', color: '#374151',
    description: 'System config, users & integrations',
    roles: ['admin']
  },
};

export const ROLES = {
  platform_admin: {
    id: 'platform_admin', label: 'Platform Admin', icon: 'fas fa-globe', color: '#7C3AED',
    department: 'platform',
    user: { name: 'Platform Admin', initials: 'PA', title: 'Platform Administrator' },
    description: 'Full access to all platform tenants. Create & manage transport companies, assign system admins.',
    kpis: ['Total Tenants', 'Active Companies', 'Total Users', 'System Health']
  },
  owner: {
    id: 'owner', label: 'Owner / Director', icon: 'fas fa-crown', color: '#8B5CF6',
    department: 'executive',
    user: { name: 'Priya Sharma', initials: 'PS', title: 'Managing Director' },
    description: 'Full visibility into P&L, revenue, fleet utilization, and strategic decisions.',
    kpis: ['Revenue', 'Net Profit', 'Fleet ROI', 'Client Growth']
  },
  branch_manager: {
    id: 'branch_manager', label: 'Branch Manager', icon: 'fas fa-building', color: '#0E7490',
    department: 'executive',
    user: { name: 'Anand Kulkarni', initials: 'AK', title: 'Branch Manager — Pune' },
    description: 'Cross-department authority within a single branch.',
    kpis: ['Branch Revenue', 'Branch Profit', 'Branch Vehicles', 'Active Trips']
  },
  fleet_manager: {
    id: 'fleet_manager', label: 'Fleet Manager', icon: 'fas fa-truck-moving', color: '#2563EB',
    department: 'operations',
    user: { name: 'Vikram Singh', initials: 'VS', title: 'Fleet Manager' },
    description: 'Vehicle allocation, trip planning, driver assignment & dispatch.',
    kpis: ['Vehicle Utilization', 'On-Time Delivery', 'Trip Count', 'Idle Vehicles']
  },
  operator: {
    id: 'operator', label: 'Operations Executive', icon: 'fas fa-headset', color: '#059669',
    department: 'operations',
    user: { name: 'Rajesh Kumar', initials: 'RK', title: 'Operations Executive' },
    description: 'Day-to-day trip dispatch, vehicle scheduling, driver coordination.',
    kpis: ['Active Trips', 'Delayed Trips', 'Driver Availability', 'Pending Dispatches']
  },
  driver: {
    id: 'driver', label: 'Driver', icon: 'fas fa-id-card', color: '#047857',
    department: 'operations',
    user: { name: 'Ramesh Yadav', initials: 'RY', title: 'Driver — MH04AB1234' },
    description: 'Trip execution, fuel & expense recording, POD uploads.',
    kpis: ['Active Trip', 'Km Today', 'Fuel Entered', 'PODs Pending']
  },
  finance_controller: {
    id: 'finance_controller', label: 'Finance Controller', icon: 'fas fa-chart-line', color: '#B91C1C',
    department: 'finance',
    user: { name: 'Anita Desai', initials: 'AD', title: 'Finance Controller' },
    description: 'P&L oversight, payment approvals, cash flow monitoring.',
    kpis: ['Net Cash Flow', 'Gross Margin', 'Approvals Pending', 'Budget Variance']
  },
  accounts_exec: {
    id: 'accounts_exec', label: 'Accounts Executive', icon: 'fas fa-calculator', color: '#EF4444',
    department: 'finance',
    user: { name: 'Deepak Jain', initials: 'DJ', title: 'Accounts Executive' },
    description: 'Voucher entry, expense recording, ledger management, daily accounting.',
    kpis: ['Pending Vouchers', 'Unreconciled', "Today's Entries", 'Expense Claims']
  },
  shop_manager: {
    id: 'shop_manager', label: 'Workshop Manager', icon: 'fas fa-tools', color: '#D97706',
    department: 'maintenance',
    user: { name: 'Tarun Mishra', initials: 'TM', title: 'Workshop Manager' },
    description: 'Work order management, mechanic scheduling & quality checks.',
    kpis: ['Open Work Orders', 'Avg Repair Time', 'Parts Stock', 'Overdue Services']
  },
  mechanic: {
    id: 'mechanic', label: 'Mechanic', icon: 'fas fa-wrench', color: '#B45309',
    department: 'maintenance',
    user: { name: 'Ravi Shankar', initials: 'RS', title: 'Senior Mechanic' },
    description: 'Work order execution, findings reporting, time & parts logging.',
    kpis: ['Assigned WOs', 'Completed Today', 'Avg Repair Time', 'Parts Requested']
  },
  inventory_manager: {
    id: 'inventory_manager', label: 'Inventory Manager', icon: 'fas fa-boxes-stacked', color: '#0891B2',
    department: 'inventory',
    user: { name: 'Govind Thakur', initials: 'GT', title: 'Store Manager' },
    description: 'Parts stock, reordering, consumption tracking, vendor coordination.',
    kpis: ['Low Stock Items', 'Pending POs', 'Monthly Consumption', 'Stock Value']
  },
  admin: {
    id: 'admin', label: 'Super Admin', icon: 'fas fa-shield-alt', color: '#374151',
    department: 'admin',
    user: { name: 'Amit Mehta', initials: 'AM', title: 'System Administrator' },
    description: 'Full system access — users, roles, configurations, integrations.',
    kpis: ['Active Users', 'System Health', 'Data Integrity', 'Audit Logs']
  },
};

/* ======================================================
   Role-Based Menus — Full nested structure from demo app
   Menu items use type: 'item' (flat) or 'group' (nested)
   Page names map to route paths via pageToPath()
   ====================================================== */

// Helper: converts demo page names to React Router paths
export function pageToPath(page) {
  const map = {
    'dashboard': '/dashboard',
    'owner-morning-briefing': '/morning-briefing',
    'active-trips': '/trips/active',
    'archived-trips': '/trips/settled',
    'trip-archive-search': '/trips/archived',
    'trips': '/trips',
    'trip-create': '/trips/create',
    'trip-settlement': '/trips/settlement',
    'routes': '/routes',
    'bill-collect': '/billing',
    'invoices': '/invoices',
    'payment-receipts': '/payment-receipts',
    'aging-analysis': '/aging-analysis',
    'client-bill-master': '/billing/create',
    'vehicle-list': '/fleet',
    'vehicle-types': '/fleet/types',
    'vehicle-assignments': '/fleet/assignments',
    'vehicle-detail': '/fleet/detail',
    'vehicle-new': '/fleet/new',
    'meter-history': '/fleet/meter-history',
    'expense-history': '/expense-history',
    'equipment': '/equipment',
    'clients': '/clients',
    'contacts': '/drivers',
    'employees': '/employees',
    'accounts-list': '/accounts-list',
    'account-groups': '/accounts/groups',
    'ledger-accounts': '/accounts/ledgers',
    'driver-ledger': '/driver-ledger',
    'smart-recommendations': '/intelligence/recommendations',
    'behavioral-losses': '/intelligence/behavioral-losses',
    'customer-service-levels': '/intelligence/service-levels',
    'alert-analytics': '/intelligence/alert-analytics',
    'trip-alerts': '/alerts/command-center',
    'alerting-rules': '/alerts/rules',
    'escalation-matrix': '/alerts/escalation',
    'chart-of-accounts': '/accounting/chart-of-accounts',
    'account-ledger': '/accounting/ledger',
    'voucher-entry': '/accounting/voucher-entry',
    'day-book': '/accounting/day-book',
    'trial-balance': '/accounting/trial-balance',
    'export-center': '/accounting/export-center',
    'profit-loss': '/reports/profit-loss',
    'balance-sheet': '/reports/balance-sheet',
    'cash-flow': '/reports/cash-flow',
    'trip-profitability': '/reports/trip-profitability',
    'insurance-spend': '/reports/insurance-spend',
    'branches': '/org/branches',
    'partners': '/org/partners',
    'inventory-intelligence': '/inventory/intelligence',
    'workshop-forecast': '/workshop/forecast',
    'vendor-capital': '/workshop/vendor-capital',
    'reports': '/reports',
    'settings': '/settings',
    'inspections': '/inspections',
    'reminders': '/reminders',
    'service-history': '/service/history',
    'work-orders': '/service/work-orders',
    'work-order-board': '/service/work-order-board',
    'service-tasks': '/service/tasks',
    'service-programs': '/service/programs',
    'shop-directory': '/service/shop-directory',
    'vendors': '/vendors',
    'parts-list': '/inventory/parts',
    'purchase-orders': '/inventory/purchase-orders',
    'fuel-history': '/fuel/history',
    'charging-history': '/fuel/charging',
    'places': '/places',
    'documents': '/documents',
    'user-management': '/admin/users',
    'vehicle-compliance': '/compliance/vehicles',
    'driver-mobile': '/driver-app',
    'workflow-templates': '/workflow-templates',
    'platform-tenants': '/platform/tenants',
    'platform-users': '/platform/users',
    'platform-settings': '/platform/settings',
  };
  return map[page] || `/${page}`;
}

export const ROLE_MENUS = {
  platform_admin: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-building', label: 'Tenant Management', id: 'sub-tenants', children: [
        { label: 'All Tenants', page: 'platform-tenants' },
      ]
    },
    { type: 'item', icon: 'fas fa-cog', label: 'Platform Settings', page: 'platform-settings' },
  ],

  owner: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    { type: 'item', icon: 'fas fa-mobile-alt', label: 'Morning Briefing', page: 'owner-morning-briefing' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
        { label: 'Routes', page: 'routes' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
        { label: 'Vehicle Types', page: 'vehicle-types' },
        { label: 'Vehicle Assignments', page: 'vehicle-assignments' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-lightbulb', label: 'Strategy & Insights', id: 'sub-strategy', children: [
        { label: 'Smart Recommendations', page: 'smart-recommendations' },
        { label: 'Behavioral Losses', page: 'behavioral-losses' },
        { label: 'Customer Service Levels', page: 'customer-service-levels' },
        { label: 'Alert Analytics', page: 'alert-analytics' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-book', label: 'Ledgers & Vouchers', id: 'sub-accounting', children: [
        { label: 'Chart of Accounts', page: 'chart-of-accounts' },
        { label: 'Account Ledger', page: 'account-ledger' },
        { label: 'Voucher Entry', page: 'voucher-entry' },
        { label: 'Day Book', page: 'day-book' },
        { label: 'Trial Balance', page: 'trial-balance' },
        { label: 'Export Center', page: 'export-center' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-chart-pie', label: 'Financial Reports', id: 'sub-finreports', children: [
        { label: 'Profit & Loss', page: 'profit-loss' },
        { label: 'Balance Sheet', page: 'balance-sheet' },
        { label: 'Cash Flow', page: 'cash-flow' },
        { label: 'Trip Profitability', page: 'trip-profitability' },
        { label: 'Insurance Spend', page: 'insurance-spend' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-sitemap', label: 'Organization', id: 'sub-org', children: [
        { label: 'Branches', page: 'branches' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-calendar-alt', label: 'Workshop Planning', id: 'sub-workshop', children: [
        { label: 'Inventory Intelligence', page: 'inventory-intelligence' },
        { label: 'Forecast & Capacity', page: 'workshop-forecast' },
        { label: 'Vendor Capital', page: 'vendor-capital' },
      ]
    },
    { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
    { type: 'item', icon: 'fas fa-cog', label: 'Settings', page: 'settings' },
  ],

  branch_manager: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Trip Dashboard', page: 'trips' },
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
        { label: 'Routes', page: 'routes' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Create Bill', page: 'client-bill-master' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
        { label: 'Vehicle Assignments', page: 'vehicle-assignments' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-book', label: 'Ledgers', id: 'sub-accounting', children: [
        { label: 'Account Ledger', page: 'account-ledger' },
        { label: 'Day Book', page: 'day-book' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-chart-pie', label: 'Financial Reports', id: 'sub-finreports', children: [
        { label: 'Branch P&L', page: 'profit-loss' },
        { label: 'Trip Profitability', page: 'trip-profitability' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-wrench', label: 'Maintenance', id: 'sub-service', children: [
        { label: 'Work Orders', page: 'work-orders' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-shield-alt', label: 'Compliance', id: 'sub-compliance', children: [
        { label: 'Vehicle Compliance', page: 'vehicle-compliance' },
      ]
    },
    { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
  ],

  fleet_manager: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
        { label: 'Routes', page: 'routes' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
        { label: 'Vehicle Types', page: 'vehicle-types' },
        { label: 'Vehicle Assignments', page: 'vehicle-assignments' },
      ]
    },
    { type: 'item', icon: 'fas fa-cogs', label: 'Equipment', page: 'equipment' },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
        { label: 'Inspection History', page: 'inspections' },
      ]
    },
    { type: 'item', icon: 'fas fa-bell', label: 'Reminders', page: 'reminders' },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
  ],

  operator: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
        { label: 'Routes', page: 'routes' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
        { label: 'Vehicle Assignments', page: 'vehicle-assignments' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
  ],

  driver: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'My Trips', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'My Vehicle', id: 'sub-vehicles', children: [
        { label: 'Vehicle Details', page: 'vehicle-detail' },
        { label: 'Service History', page: 'service-history' },
        { label: 'Inspections', page: 'inspections' },
      ]
    },
    { type: 'item', icon: 'fas fa-receipt', label: 'Expenses', page: 'expense-history' },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
  ],

  finance_controller: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-book', label: 'Ledgers & Vouchers', id: 'sub-accounting', children: [
        { label: 'Chart of Accounts', page: 'chart-of-accounts' },
        { label: 'Account Ledger', page: 'account-ledger' },
        { label: 'Voucher Entry', page: 'voucher-entry' },
        { label: 'Day Book', page: 'day-book' },
        { label: 'Trial Balance', page: 'trial-balance' },
        { label: 'Export Center', page: 'export-center' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-chart-pie', label: 'Financial Reports', id: 'sub-finreports', children: [
        { label: 'Profit & Loss', page: 'profit-loss' },
        { label: 'Balance Sheet', page: 'balance-sheet' },
        { label: 'Cash Flow', page: 'cash-flow' },
        { label: 'Trip Profitability', page: 'trip-profitability' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    { type: 'item', icon: 'fas fa-store', label: 'Vendors', page: 'vendors' },
    { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
  ],

  accounts_exec: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-book', label: 'Ledgers & Vouchers', id: 'sub-accounting', children: [
        { label: 'Chart of Accounts', page: 'chart-of-accounts' },
        { label: 'Account Ledger', page: 'account-ledger' },
        { label: 'Voucher Entry', page: 'voucher-entry' },
        { label: 'Day Book', page: 'day-book' },
        { label: 'Trial Balance', page: 'trial-balance' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    { type: 'item', icon: 'fas fa-truck', label: 'Expense History', page: 'expense-history' },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    { type: 'item', icon: 'fas fa-store', label: 'Vendors', page: 'vendors' },
  ],

  shop_manager: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-wrench', label: 'Service', id: 'sub-service', children: [
        { label: 'Work Order Board', page: 'work-order-board' },
        { label: 'Work Orders', page: 'work-orders' },
        { label: 'Service History', page: 'service-history' },
        { label: 'Service Tasks', page: 'service-tasks' },
        { label: 'Service Programs', page: 'service-programs' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
        { label: 'Inspection History', page: 'inspections' },
      ]
    },
    { type: 'item', icon: 'fas fa-bell', label: 'Reminders', page: 'reminders' },
    {
      type: 'group', icon: 'fas fa-boxes-stacked', label: 'Parts & Inventory', id: 'sub-parts', children: [
        { label: 'Inventory Intelligence', page: 'inventory-intelligence' },
        { label: 'Parts List', page: 'parts-list' },
        { label: 'Purchase Orders', page: 'purchase-orders' },
      ]
    },
    { type: 'item', icon: 'fas fa-store', label: 'Vendors', page: 'vendors' },
    { type: 'item', icon: 'fas fa-store', label: 'Shop Directory', page: 'shop-directory' },
    {
      type: 'group', icon: 'fas fa-calendar-alt', label: 'Workshop', id: 'sub-workshop', children: [
        { label: 'Forecast & Capacity', page: 'workshop-forecast' },
        { label: 'Vendor Capital', page: 'vendor-capital' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
  ],

  mechanic: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-wrench', label: 'My Work', id: 'sub-service', children: [
        { label: 'Work Orders', page: 'work-orders' },
        { label: 'Service Tasks', page: 'service-tasks' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
        { label: 'Inspections', page: 'inspections' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-boxes-stacked', label: 'Parts', id: 'sub-parts', children: [
        { label: 'Parts List', page: 'parts-list' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
  ],

  inventory_manager: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-boxes-stacked', label: 'Inventory', id: 'sub-parts', children: [
        { label: 'Inventory Intelligence', page: 'inventory-intelligence' },
        { label: 'Parts List', page: 'parts-list' },
        { label: 'Purchase Orders', page: 'purchase-orders' },
      ]
    },
    { type: 'item', icon: 'fas fa-store', label: 'Vendors', page: 'vendors' },
    { type: 'item', icon: 'fas fa-hand-holding-usd', label: 'Vendor Capital', page: 'vendor-capital' },
    {
      type: 'group', icon: 'fas fa-wrench', label: 'Workshop', id: 'sub-service', children: [
        { label: 'Work Orders', page: 'work-orders' },
      ]
    },
    { type: 'item', icon: 'fas fa-truck', label: 'Expense History', page: 'expense-history' },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
  ],

  admin: [
    { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
    {
      type: 'group', icon: 'fas fa-route', label: 'Trip Management', id: 'sub-trips', children: [
        { label: 'Active Trips', page: 'active-trips' },
        { label: 'Settled Trips', page: 'archived-trips' },
        { label: 'Archived Trips', page: 'trip-archive-search' },
        { label: 'Routes', page: 'routes' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-file-invoice-dollar', label: 'Bill & Collect', id: 'sub-bill-collect', children: [
        { label: 'Bill & Collect', page: 'bill-collect' },
        { label: 'Invoices', page: 'invoices' },
        { label: 'Payment Receipts', page: 'payment-receipts' },
        { label: 'Aging Analysis', page: 'aging-analysis' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
        { label: 'Vehicle List', page: 'vehicle-list' },
        { label: 'Vehicle Types', page: 'vehicle-types' },
        { label: 'Vehicle Assignments', page: 'vehicle-assignments' },
      ]
    },
    { type: 'item', icon: 'fas fa-cogs', label: 'Equipment', page: 'equipment' },
    {
      type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
        { label: 'Clients', page: 'clients' },
        { label: 'Drivers', page: 'contacts' },
        { label: 'Employees', page: 'employees' },
        { label: 'Ledger Groups', page: 'account-groups' },
        { label: 'Ledger Accounts', page: 'ledger-accounts' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
        { label: 'Inspection History', page: 'inspections' },
      ]
    },
    { type: 'item', icon: 'fas fa-bell', label: 'Reminders', page: 'reminders' },
    {
      type: 'group', icon: 'fas fa-wrench', label: 'Service', id: 'sub-service', children: [
        { label: 'Work Order Board', page: 'work-order-board' },
        { label: 'Service History', page: 'service-history' },
        { label: 'Work Orders', page: 'work-orders' },
        { label: 'Service Tasks', page: 'service-tasks' },
        { label: 'Service Programs', page: 'service-programs' },
        { label: 'Shop Directory', page: 'shop-directory' },
      ]
    },
    { type: 'item', icon: 'fas fa-store', label: 'Vendors', page: 'vendors' },
    {
      type: 'group', icon: 'fas fa-boxes-stacked', label: 'Parts & Inventory', id: 'sub-parts', children: [
        { label: 'Inventory Intelligence', page: 'inventory-intelligence' },
        { label: 'Parts List', page: 'parts-list' },
        { label: 'Purchase Orders', page: 'purchase-orders' },
      ]
    },
    { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
    {
      type: 'group', icon: 'fas fa-book', label: 'Ledgers & Vouchers', id: 'sub-accounting', children: [
        { label: 'Chart of Accounts', page: 'chart-of-accounts' },
        { label: 'Account Ledger', page: 'account-ledger' },
        { label: 'Voucher Entry', page: 'voucher-entry' },
        { label: 'Day Book', page: 'day-book' },
        { label: 'Trial Balance', page: 'trial-balance' },
        { label: 'Export Center', page: 'export-center' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-chart-pie', label: 'Financial Reports', id: 'sub-finreports', children: [
        { label: 'Profit & Loss', page: 'profit-loss' },
        { label: 'Balance Sheet', page: 'balance-sheet' },
        { label: 'Cash Flow', page: 'cash-flow' },
        { label: 'Trip Profitability', page: 'trip-profitability' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
        { label: 'Command Center', page: 'trip-alerts' },
        { label: 'Alert Rules', page: 'alerting-rules' },
        { label: 'Analytics', page: 'alert-analytics' },
        { label: 'Escalation Matrix', page: 'escalation-matrix' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-sitemap', label: 'Organization', id: 'sub-org', children: [
        { label: 'Branches', page: 'branches' },
      ]
    },
    {
      type: 'group', icon: 'fas fa-calendar-alt', label: 'Workshop Planning', id: 'sub-workshop', children: [
        { label: 'Forecast & Capacity', page: 'workshop-forecast' },
        { label: 'Vendor Capital', page: 'vendor-capital' },
      ]
    },
    { type: 'item', icon: 'fas fa-users-cog', label: 'User Management', page: 'user-management' },
    { type: 'item', icon: 'fas fa-cog', label: 'Settings', page: 'settings' },
  ],
};
