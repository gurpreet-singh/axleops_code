/* ===================================================
   AxleOps — RBAC Configuration (React Port)
   Ported from js/rbac.js — Departments, Roles, Menus
   =================================================== */

export const DEPARTMENTS = {
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
    user: { name: 'Neha Patel', initials: 'NP', title: 'Operations Executive' },
    description: 'Day-to-day trip operations, POD tracking, and status updates.',
    kpis: ['Trips Today', 'POD Pending', 'Loading Queue']
  },
  driver: {
    id: 'driver', label: 'Driver', icon: 'fas fa-id-card', color: '#16A34A',
    department: 'operations',
    user: { name: 'Ramesh Yadav', initials: 'RY', title: 'Senior Driver' },
    description: 'Trip execution, document submission & expense tracking.',
    kpis: ['Active Trip', 'Trips This Month', 'Documents Pending']
  },
  finance_controller: {
    id: 'finance_controller', label: 'Finance Controller', icon: 'fas fa-chart-pie', color: '#DC2626',
    department: 'finance',
    user: { name: 'Ravi Mehta', initials: 'RM', title: 'Finance Controller' },
    description: 'P&L oversight, revenue assurance, payment authorization.',
    kpis: ['Revenue MTD', 'Outstanding AR', 'Profit Margin', 'Cash Flow']
  },
  accounts_exec: {
    id: 'accounts_exec', label: 'Accounts Executive', icon: 'fas fa-calculator', color: '#F59E0B',
    department: 'finance',
    user: { name: 'Sneha Iyer', initials: 'SI', title: 'Accounts Executive' },
    description: 'Invoice generation, payment tracking, TDS/GST filing.',
    kpis: ['Invoices Pending', 'Payments Due', 'GST Filing Status']
  },
  shop_manager: {
    id: 'shop_manager', label: 'Workshop Manager', icon: 'fas fa-warehouse', color: '#D97706',
    department: 'maintenance',
    user: { name: 'Arun Deshmukh', initials: 'AD', title: 'Workshop Manager' },
    description: 'Work order management, mechanic scheduling & quality checks.',
    kpis: ['Active WOs', 'TAT Score', 'Parts Pending', 'Fleet Health']
  },
  mechanic: {
    id: 'mechanic', label: 'Mechanic', icon: 'fas fa-tools', color: '#92400E',
    department: 'maintenance',
    user: { name: 'Sunil Kumar', initials: 'SK', title: 'Senior Mechanic' },
    description: 'Diagnosis, repair execution & parts consumption logging.',
    kpis: ['Assigned WOs', 'Completed Today', 'Pending Parts']
  },
  inventory_manager: {
    id: 'inventory_manager', label: 'Inventory Manager', icon: 'fas fa-boxes-stacked', color: '#0891B2',
    department: 'inventory',
    user: { name: 'Meera Nair', initials: 'MN', title: 'Inventory Manager' },
    description: 'Stock levels, reorder points, vendor management & PO lifecycle.',
    kpis: ['Stock Value', 'Low Stock Items', 'Open POs', 'Vendor Count']
  },
  admin: {
    id: 'admin', label: 'System Admin', icon: 'fas fa-user-shield', color: '#374151',
    department: 'admin',
    user: { name: 'Deepak Joshi', initials: 'DJ', title: 'System Administrator' },
    description: 'User management, branch setup, integration config & audit logs.',
    kpis: ['Active Users', 'Branches', 'Integrations', 'System Health']
  },
};

// Role-specific navigation menus
export const ROLE_MENUS = {
  owner: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'trips', label: 'Trip Management', icon: 'fas fa-route', path: '/trips' },
    { id: 'fleet', label: 'Fleet', icon: 'fas fa-truck-moving', path: '/fleet' },
    { id: 'clients', label: 'Clients', icon: 'fas fa-building', path: '/clients' },
    { id: 'routes', label: 'Routes', icon: 'fas fa-map-marked-alt', path: '/routes' },
    { id: 'drivers', label: 'Drivers', icon: 'fas fa-id-card', path: '/drivers' },
    { id: 'bill_collect', label: 'Bill & Collect', icon: 'fas fa-file-invoice-dollar', path: '/billing' },
    { id: 'accounting', label: 'Accounting', icon: 'fas fa-rupee-sign', path: '/accounting' },
    { id: 'mro', label: 'MRO', icon: 'fas fa-wrench', path: '/mro' },
    { id: 'inventory', label: 'Parts & Inventory', icon: 'fas fa-boxes-stacked', path: '/inventory' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', path: '/reports' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog', path: '/settings' },
  ],
  branch_manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'trips', label: 'Trip Management', icon: 'fas fa-route', path: '/trips' },
    { id: 'fleet', label: 'Fleet', icon: 'fas fa-truck-moving', path: '/fleet' },
    { id: 'clients', label: 'Clients', icon: 'fas fa-building', path: '/clients' },
    { id: 'routes', label: 'Routes', icon: 'fas fa-map-marked-alt', path: '/routes' },
    { id: 'drivers', label: 'Drivers', icon: 'fas fa-id-card', path: '/drivers' },
    { id: 'bill_collect', label: 'Bill & Collect', icon: 'fas fa-file-invoice-dollar', path: '/billing' },
    { id: 'mro', label: 'MRO', icon: 'fas fa-wrench', path: '/mro' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', path: '/reports' },
  ],
  fleet_manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'trips', label: 'Trip Management', icon: 'fas fa-route', path: '/trips' },
    { id: 'fleet', label: 'Fleet', icon: 'fas fa-truck-moving', path: '/fleet' },
    { id: 'routes', label: 'Routes', icon: 'fas fa-map-marked-alt', path: '/routes' },
    { id: 'drivers', label: 'Drivers', icon: 'fas fa-id-card', path: '/drivers' },
  ],
  operator: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'trips', label: 'Trip Management', icon: 'fas fa-route', path: '/trips' },
    { id: 'fleet', label: 'Fleet', icon: 'fas fa-truck-moving', path: '/fleet' },
    { id: 'drivers', label: 'Drivers', icon: 'fas fa-id-card', path: '/drivers' },
  ],
  driver: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'trips', label: 'My Trips', icon: 'fas fa-route', path: '/trips' },
  ],
  finance_controller: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'bill_collect', label: 'Bill & Collect', icon: 'fas fa-file-invoice-dollar', path: '/billing' },
    { id: 'accounting', label: 'Accounting', icon: 'fas fa-rupee-sign', path: '/accounting' },
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar', path: '/reports' },
  ],
  accounts_exec: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'bill_collect', label: 'Bill & Collect', icon: 'fas fa-file-invoice-dollar', path: '/billing' },
    { id: 'accounting', label: 'Accounting', icon: 'fas fa-rupee-sign', path: '/accounting' },
  ],
  shop_manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'mro', label: 'MRO', icon: 'fas fa-wrench', path: '/mro' },
    { id: 'fleet', label: 'Fleet', icon: 'fas fa-truck-moving', path: '/fleet' },
    { id: 'inventory', label: 'Parts & Inventory', icon: 'fas fa-boxes-stacked', path: '/inventory' },
  ],
  mechanic: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'mro', label: 'My Work Orders', icon: 'fas fa-wrench', path: '/mro' },
    { id: 'inventory', label: 'Parts', icon: 'fas fa-boxes-stacked', path: '/inventory' },
  ],
  inventory_manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'inventory', label: 'Parts & Inventory', icon: 'fas fa-boxes-stacked', path: '/inventory' },
    { id: 'mro', label: 'Purchase Orders', icon: 'fas fa-file-alt', path: '/procurement' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line', path: '/dashboard' },
    { id: 'users', label: 'User Management', icon: 'fas fa-users-cog', path: '/users' },
    { id: 'branches', label: 'Branches', icon: 'fas fa-code-branch', path: '/branches' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog', path: '/settings' },
  ],
};
