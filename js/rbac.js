/* ===================================================
   AxleOps — Role-Based Access Control Engine
   Department → Role → Dashboard Architecture
   =================================================== */

/* =========================
   Department Definitions
   ========================= */
const DEPARTMENTS = {
    executive: {
        id: 'executive',
        label: 'Executive',
        icon: 'fas fa-crown',
        color: '#8B5CF6',
        description: 'Strategic decisions & business growth',
        roles: ['owner', 'branch_manager']
    },
    operations: {
        id: 'operations',
        label: 'Operations',
        icon: 'fas fa-route',
        color: '#059669',
        description: 'Trip planning, dispatch & execution',
        roles: ['fleet_manager', 'operator', 'driver']
    },
    finance: {
        id: 'finance',
        label: 'Finance & Accounts',
        icon: 'fas fa-rupee-sign',
        color: '#DC2626',
        description: 'Money management, billing & collections',
        roles: ['finance_controller', 'accounts_exec']
    },
    maintenance: {
        id: 'maintenance',
        label: 'Maintenance & Workshop',
        icon: 'fas fa-wrench',
        color: '#D97706',
        description: 'Vehicle health & repair management',
        roles: ['shop_manager', 'mechanic']
    },
    inventory: {
        id: 'inventory',
        label: 'Inventory & Procurement',
        icon: 'fas fa-boxes-stacked',
        color: '#0891B2',
        description: 'Parts stock control & vendor management',
        roles: ['inventory_manager']
    },
    sales: {
        id: 'sales',
        label: 'Sales & CRM',
        icon: 'fas fa-handshake',
        color: '#2563EB',
        description: 'Client acquisition & relationship management',
        roles: ['sales_bd', 'account_manager', 'partner'],
        hidden: true
    },
    compliance: {
        id: 'compliance',
        label: 'Compliance & Governance',
        icon: 'fas fa-shield-alt',
        color: '#7C3AED',
        description: 'Regulatory compliance & audit trails',
        roles: ['compliance_manager', 'auditor'],
        hidden: true
    },
    admin: {
        id: 'admin',
        label: 'System Administration',
        icon: 'fas fa-server',
        color: '#374151',
        description: 'System config, users & integrations',
        roles: ['admin']
    }
};

/* =========================
   Role Definitions
   ========================= */
const ROLES = {
    // ─── EXECUTIVE ───────────────────────────────
    owner: {
        id: 'owner',
        label: 'Owner / Director',
        icon: 'fas fa-crown',
        color: '#8B5CF6',
        department: 'executive',
        user: { name: 'Priya Sharma', initials: 'PS', title: 'Managing Director' },
        description: 'Full visibility into P&L, revenue, fleet utilization, and strategic decisions.',
        kpis: ['Revenue', 'Net Profit', 'Fleet ROI', 'Client Growth']
    },
    branch_manager: {
        id: 'branch_manager',
        label: 'Branch Manager',
        icon: 'fas fa-building',
        color: '#0E7490',
        department: 'executive',
        user: { name: 'Anand Kulkarni', initials: 'AK', title: 'Branch Manager — Pune' },
        description: 'Cross-department authority within a single branch. Manages operations, fleet, drivers, clients & branch P&L.',
        kpis: ['Branch Revenue', 'Branch Profit', 'Branch Vehicles', 'Active Trips'],
        branchScope: 'own',
        branchName: 'Pune'
    },

    // ─── OPERATIONS ──────────────────────────────
    fleet_manager: {
        id: 'fleet_manager',
        label: 'Fleet Manager',
        icon: 'fas fa-truck-moving',
        color: '#2563EB',
        department: 'operations',
        user: { name: 'Vikram Singh', initials: 'VS', title: 'Fleet Manager' },
        description: 'Manages vehicle allocation, trip planning, driver assignment, dispatch scheduling, and route optimization.',
        kpis: ['Vehicle Utilization', 'On-Time Delivery', 'Trip Count', 'Idle Vehicles']
    },
    operator: {
        id: 'operator',
        label: 'Operations Executive',
        icon: 'fas fa-headset',
        color: '#059669',
        department: 'operations',
        user: { name: 'Rajesh Kumar', initials: 'RK', title: 'Operations Executive' },
        description: 'Handles day-to-day trip dispatch, vehicle scheduling, driver coordination, and real-time tracking.',
        kpis: ['Active Trips', 'Delayed Trips', 'Driver Availability', 'Pending Dispatches']
    },

    // ─── FINANCE & ACCOUNTS ─────────────────────
    finance_controller: {
        id: 'finance_controller',
        label: 'Finance Controller',
        icon: 'fas fa-chart-line',
        color: '#B91C1C',
        department: 'finance',
        user: { name: 'Anita Desai', initials: 'AD', title: 'Finance Controller' },
        description: 'Oversees P&L, approves payments, monitors cash flow, and controls budgets.',
        kpis: ['Net Cash Flow', 'Gross Margin', 'Approvals Pending', 'Budget Variance']
    },
    accounts_exec: {
        id: 'accounts_exec',
        label: 'Accounts Executive',
        icon: 'fas fa-calculator',
        color: '#EF4444',
        department: 'finance',
        user: { name: 'Deepak Jain', initials: 'DJ', title: 'Accounts Executive' },
        description: 'Handles voucher entry, expense recording, ledger management, and daily accounting.',
        kpis: ['Pending Vouchers', 'Unreconciled', "Today's Entries", 'Expense Claims']
    },

    // ─── MAINTENANCE ─────────────────────────────
    shop_manager: {
        id: 'shop_manager',
        label: 'Workshop Manager',
        icon: 'fas fa-tools',
        color: '#D97706',
        department: 'maintenance',
        user: { name: 'Tarun Mishra', initials: 'TM', title: 'Workshop Manager' },
        description: 'Oversees vehicle maintenance, work orders, parts inventory, and service schedules.',
        kpis: ['Open Work Orders', 'Avg Repair Time', 'Parts Stock', 'Overdue Services']
    },
    mechanic: {
        id: 'mechanic',
        label: 'Mechanic',
        icon: 'fas fa-wrench',
        color: '#B45309',
        department: 'maintenance',
        user: { name: 'Ravi Shankar', initials: 'RS', title: 'Senior Mechanic' },
        description: 'Executes work orders, reports findings, logs time, and manages assigned repair tasks.',
        kpis: ['Assigned WOs', 'Completed Today', 'Avg Repair Time', 'Parts Requested']
    },

    // ─── INVENTORY & PROCUREMENT ─────────────────
    inventory_manager: {
        id: 'inventory_manager',
        label: 'Inventory Manager',
        icon: 'fas fa-boxes-stacked',
        color: '#0891B2',
        department: 'inventory',
        user: { name: 'Govind Thakur', initials: 'GT', title: 'Store Manager' },
        description: 'Controls parts stock, manages reordering, tracks consumption, and coordinates with vendors.',
        kpis: ['Low Stock Items', 'Pending POs', 'Monthly Consumption', 'Stock Value']
    },

    // ─── COMPLIANCE & GOVERNANCE ─────────────────
    compliance_manager: {
        id: 'compliance_manager',
        label: 'Compliance Manager',
        icon: 'fas fa-clipboard-check',
        color: '#7C3AED',
        department: 'compliance',
        user: { name: 'Neha Kapoor', initials: 'NK', title: 'Compliance Manager' },
        description: 'Tracks regulatory deadlines, ensures documentation, monitors permit & insurance renewals.',
        kpis: ['Expiring <30d', 'Overdue Docs', 'Fleet Readiness', 'Penalty Risk']
    },
    auditor: {
        id: 'auditor',
        label: 'Auditor',
        icon: 'fas fa-search',
        color: '#6D28D9',
        department: 'compliance',
        user: { name: 'Sanjay Gupta', initials: 'SG', title: 'Internal Auditor' },
        description: 'Read-only access to verify books, expenses, trips, and compliance. Flags exceptions.',
        kpis: ['Exception Flags', 'Trails Verified', 'Risk Score', 'Last Audit']
    },

    // ─── SALES & CRM ────────────────────────────
    sales_bd: {
        id: 'sales_bd',
        label: 'Sales / BD',
        icon: 'fas fa-chart-line',
        color: '#2563EB',
        department: 'sales',
        user: { name: 'Arjun Reddy', initials: 'AR', title: 'Business Development Manager' },
        description: 'Identifies new clients, negotiates rates, manages sales pipeline and contract closures.',
        kpis: ['Pipeline Value', 'New Clients MTD', 'Conversion Rate', 'Revenue Target']
    },
    account_manager: {
        id: 'account_manager',
        label: 'Account Manager',
        icon: 'fas fa-user-tie',
        color: '#1D4ED8',
        department: 'sales',
        user: { name: 'Shruti Menon', initials: 'SM', title: 'Key Account Manager' },
        description: 'Manages existing client relationships, ensures SLA compliance, upsells services.',
        kpis: ['Client Health Score', 'SLA Compliance', 'Revenue per Client', 'Churn Risk']
    },
    partner: {
        id: 'partner',
        label: 'Franchise Partner',
        icon: 'fas fa-handshake-angle',
        color: '#0D9488',
        department: 'sales',
        user: { name: 'Patel Roadways', initials: 'PR', title: 'Franchise Partner — Maharashtra' },
        description: 'External transport partner with scoped access to own trips, vehicles, drivers, and settlement reports.',
        kpis: ['Partner Revenue', 'Trips MTD', 'Settlement Pending', 'Partner Rating']
    },

    // ─── OPERATIONS: DRIVER ─────────────────────
    driver: {
        id: 'driver',
        label: 'Driver',
        icon: 'fas fa-id-card',
        color: '#047857',
        department: 'operations',
        user: { name: 'Ramesh Yadav', initials: 'RY', title: 'Driver — MH04AB1234' },
        description: 'Executes trips, records fuel & expenses, uploads PODs, reports issues on the road.',
        kpis: ['Active Trip', 'Km Today', 'Fuel Entered', 'PODs Pending']
    },

    // ─── SYSTEM ADMIN ────────────────────────────
    admin: {
        id: 'admin',
        label: 'Super Admin',
        icon: 'fas fa-shield-alt',
        color: '#374151',
        department: 'admin',
        user: { name: 'Amit Mehta', initials: 'AM', title: 'System Administrator' },
        description: 'Full system access. Manages users, roles, configurations, and integrations.',
        kpis: ['Active Users', 'System Health', 'Data Integrity', 'Audit Logs']
    },

    // ─── LEGACY (backward compat) ────────────────
    accounts: {
        id: 'accounts',
        label: 'Billing & Accounts',
        icon: 'fas fa-file-invoice-dollar',
        color: '#DC2626',
        department: 'finance',
        user: { name: 'Meera Joshi', initials: 'MJ', title: 'Accounts Manager' },
        description: 'Manages invoicing, client payments, driver settlements, and expense approvals.',
        kpis: ['Outstanding Amount', 'Invoices Pending', 'Driver Settlements', 'Monthly Collections'],
        legacy: true
    }
};

/* =========================
   Role-Based Menus
   ========================= */
const ROLE_MENUS = {
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
                { label: 'Accounts', page: 'accounts-list' },
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
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel & Energy', page: 'fuel-history' }, // removed — will integrate later
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
                // { label: 'Franchise & Partners', page: 'partners' }, // hidden
                // { label: 'Subcontractors', page: 'subcontractors' }, // hidden — will add later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
                { label: 'Inspection History', page: 'inspections' },
            ]
        },
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Issues', page: 'issues' }, // removed — will integrate later
        { type: 'item', icon: 'fas fa-bell', label: 'Reminders', page: 'reminders' },
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel History', page: 'fuel-history' }, // removed — will integrate later
        {
            type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
                { label: 'Command Center', page: 'trip-alerts' },
                { label: 'Alert Rules', page: 'alerting-rules' },
                { label: 'Analytics', page: 'alert-analytics' },
                { label: 'Escalation Matrix', page: 'escalation-matrix' },
            ]
        },
        // { type: 'item', icon: 'fas fa-truck-loading', label: 'Subcontractors', page: 'subcontractors' }, // hidden — will add later
        // { type: 'item', icon: 'fas fa-map-marker-alt', label: 'Places', page: 'places' }, // hidden — will add later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Issues', page: 'issues' }, // removed — will integrate later
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel Entry', page: 'fuel-history' }, // removed — will integrate later
        {
            type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
                { label: 'Command Center', page: 'trip-alerts' },
                { label: 'Alert Rules', page: 'alerting-rules' },
                { label: 'Analytics', page: 'alert-analytics' },
                { label: 'Escalation Matrix', page: 'escalation-matrix' },
            ]
        },
        // { type: 'item', icon: 'fas fa-map-marker-alt', label: 'Places', page: 'places' }, // hidden — will add later
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },

        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel History', page: 'fuel-history' }, // removed — will integrate later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel Entry', page: 'fuel-history' }, // removed — will integrate later
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
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
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
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Issues', page: 'issues' }, // removed — will integrate later
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

    // Legacy accounts menu (backward compat)
    accounts: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },

        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel History', page: 'fuel-history' }, // removed — will integrate later
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
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-clipboard-check', label: 'Inspections', id: 'sub-inspections', children: [
                { label: 'Inspection History', page: 'inspections' },
            ]
        },
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Issues', page: 'issues' }, // removed — will integrate later
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
        // { type: 'group', icon: 'fas fa-gas-pump', label: 'Fuel & Energy', id: 'sub-fuel', children: [ // removed — will integrate later
        //     { label: 'Fuel History', page: 'fuel-history' },
        //     { label: 'Charging History', page: 'charging-history' },
        // ] },
        // { type: 'item', icon: 'fas fa-map-marker-alt', label: 'Places', page: 'places' }, // hidden — will add later
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
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
                // { label: 'Franchise & Partners', page: 'partners' }, // hidden
                // { label: 'Subcontractors', page: 'subcontractors' }, // hidden — will add later
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

    compliance_manager: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
        {
            type: 'group', icon: 'fas fa-shield-alt', label: 'Compliance', id: 'sub-compliance', children: [
                { label: 'Vehicle Compliance', page: 'vehicle-compliance' },
                { label: 'Inspections', page: 'inspections' },
                { label: 'Reminders', page: 'reminders' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-truck', label: 'Vehicles', id: 'sub-vehicles', children: [
                { label: 'Vehicle List', page: 'vehicle-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-wrench', label: 'Maintenance', id: 'sub-service', children: [
                { label: 'Work Orders', page: 'work-orders' },
                { label: 'Service History', page: 'service-history' },
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
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
        { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
    ],

    auditor: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
        {
            type: 'group', icon: 'fas fa-chart-pie', label: 'Financial Reports', id: 'sub-finreports', children: [
                { label: 'Profit & Loss', page: 'profit-loss' },
                { label: 'Balance Sheet', page: 'balance-sheet' },
                { label: 'Cash Flow', page: 'cash-flow' },
                { label: 'Trip Profitability', page: 'trip-profitability' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-book', label: 'Ledgers & Vouchers', id: 'sub-accounting', children: [
                { label: 'Chart of Accounts', page: 'chart-of-accounts' },
                { label: 'Account Ledger', page: 'account-ledger' },
                { label: 'Day Book', page: 'day-book' },
                { label: 'Voucher Entry', page: 'voucher-entry' },
                { label: 'Trial Balance', page: 'trial-balance' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-route', label: 'Operations', id: 'sub-trips', children: [
                { label: 'Active Trips', page: 'active-trips' },
                { label: 'Settled Trips', page: 'archived-trips' },
                { label: 'Archived Trips', page: 'trip-archive-search' },
                { label: 'Expense History', page: 'expense-history' },
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
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
        { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
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
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Issues', page: 'issues' }, // removed — will integrate later
        {
            type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
                { label: 'Command Center', page: 'trip-alerts' },
                { label: 'Alert Rules', page: 'alerting-rules' },
                { label: 'Analytics', page: 'alert-analytics' },
                { label: 'Escalation Matrix', page: 'escalation-matrix' },
            ]
        },
    ],

    sales_bd: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
        {
            type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
                { label: 'Clients', page: 'clients' },
                { label: 'Drivers', page: 'contacts' },
                { label: 'Employees', page: 'employees' },
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-briefcase', label: 'Billing', id: 'sub-clients', children: [
                { label: 'Client Detail', page: 'client-detail' },
                { label: 'Invoices', page: 'invoices' },
                { label: 'Payment Receipts', page: 'payment-receipts' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-route', label: 'Trips & Routes', id: 'sub-trips', children: [
                { label: 'Active Trips', page: 'active-trips' },
                { label: 'Settled Trips', page: 'archived-trips' },
                { label: 'Archived Trips', page: 'trip-archive-search' },
                { label: 'Routes', page: 'routes' },
                { label: 'Route Detail', page: 'route-detail' },
            ]
        },
        { type: 'item', icon: 'fas fa-file-invoice', label: 'Invoices', page: 'invoices' },
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

    account_manager: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
        {
            type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
                { label: 'Clients', page: 'clients' },
                { label: 'Drivers', page: 'contacts' },
                { label: 'Employees', page: 'employees' },
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-briefcase', label: 'Billing', id: 'sub-billing', children: [
                { label: 'Client Detail', page: 'client-detail' },
                { label: 'Invoices', page: 'invoices' },
                { label: 'Payment Receipts', page: 'payment-receipts' },
            ]
        },
        { type: 'item', icon: 'fas fa-file-invoice', label: 'Invoices', page: 'invoices' },
        {
            type: 'group', icon: 'fas fa-route', label: 'Trips', id: 'sub-trips', children: [
                { label: 'Active Trips', page: 'active-trips' },
                { label: 'Settled Trips', page: 'archived-trips' },
                { label: 'Archived Trips', page: 'trip-archive-search' },
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
        { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
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
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel Log', page: 'fuel-history' }, // removed — will integrate later
        { type: 'item', icon: 'fas fa-receipt', label: 'Expenses', page: 'expense-history' },
        // { type: 'item', icon: 'fas fa-exclamation-triangle', label: 'Report Issue', page: 'issues' }, // removed — will integrate later
        {
            type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
                { label: 'Command Center', page: 'trip-alerts' },
                { label: 'Alert Rules', page: 'alerting-rules' },
                { label: 'Analytics', page: 'alert-analytics' },
                { label: 'Escalation Matrix', page: 'escalation-matrix' },
            ]
        },
        // { type: 'item', icon: 'fas fa-file-alt', label: 'Documents', page: 'documents' }, // removed — will integrate later
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
                { label: 'Accounts', page: 'accounts-list' },
            ]
        },
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel & Energy', page: 'fuel-history' }, // removed — will integrate later
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

    partner: [
        { type: 'item', icon: 'fas fa-th-large', label: 'Dashboard', page: 'dashboard' },
        {
            type: 'group', icon: 'fas fa-route', label: 'My Trips', id: 'sub-trips', children: [
                { label: 'Active Trips', page: 'active-trips' },
                { label: 'Settled Trips', page: 'archived-trips' },
                { label: 'Archived Trips', page: 'trip-archive-search' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-truck', label: 'My Vehicles', id: 'sub-vehicles', children: [
                { label: 'Vehicle List', page: 'vehicle-list' },
            ]
        },
        {
            type: 'group', icon: 'fas fa-users-cog', label: 'Accounts & Users', id: 'sub-accounts-users', children: [
                { label: 'Drivers', page: 'contacts' },
            ]
        },
        // { type: 'item', icon: 'fas fa-gas-pump', label: 'Fuel Log', page: 'fuel-history' }, // removed — will integrate later
        {
            type: 'group', icon: 'fas fa-bell', label: 'Alert & Monitoring', id: 'sub-intelligence', children: [
                { label: 'Command Center', page: 'trip-alerts' },
                { label: 'Alert Rules', page: 'alerting-rules' },
                { label: 'Analytics', page: 'alert-analytics' },
                { label: 'Escalation Matrix', page: 'escalation-matrix' },
            ]
        },
        { type: 'item', icon: 'fas fa-chart-bar', label: 'Reports', page: 'reports' },
    ]
};

/* =========================
   Dashboard Configs per Role
   ========================= */
const ROLE_DASHBOARDS = {
    // Roles with the Operator Dashboard (Trip Control Centre)
    fleet_manager: 'dashboard-operator',
    operator: 'dashboard-operator',
    finance_controller: 'dashboard-operator',
    accounts_exec: 'dashboard-operator',

    // All other roles — placeholder (dashboard not yet designed)
    owner: 'dashboard-placeholder',
    shop_manager: 'dashboard-placeholder',
    mechanic: 'dashboard-placeholder',
    inventory_manager: 'dashboard-placeholder',
    compliance_manager: 'dashboard-placeholder',
    auditor: 'dashboard-placeholder',
    sales_bd: 'dashboard-placeholder',
    account_manager: 'dashboard-placeholder',
    driver: 'dashboard-placeholder',
    branch_manager: 'dashboard-placeholder',
    partner: 'dashboard-placeholder',
    accounts: 'dashboard-placeholder',
    admin: 'dashboard-placeholder'
};

/* =========================
   RBAC State
   ========================= */
let currentRole = null;

function getCurrentRole() {
    return currentRole;
}

function setRole(roleId) {
    currentRole = roleId;
    localStorage.setItem('axleops_role', roleId);
}

function getSavedRole() {
    return localStorage.getItem('axleops_role');
}

/* =========================
   Render Sidebar for Role
   ========================= */
function renderSidebar(roleId) {
    const role = ROLES[roleId];
    const menu = ROLE_MENUS[roleId];
    if (!role || !menu) return;

    // Update brand section with department context
    const brandSub = document.querySelector('.sidebar-brand .brand-sub');
    if (brandSub) {
        const dept = DEPARTMENTS[role.department];
        brandSub.textContent = role.user.name;
    }

    // Build nav HTML
    const nav = document.querySelector('.sidebar-nav');
    if (!nav) return;

    // Add department badge at top of nav
    const dept = DEPARTMENTS[role.department];
    let html = '';
    if (dept) {
        html += '<div style="padding:8px 16px 12px;margin-bottom:4px;">'
            + '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.06);border-radius:8px;border:1px solid rgba(255,255,255,0.08);">'
            + '<i class="' + dept.icon + '" style="font-size:11px;color:' + dept.color + ';opacity:0.8;"></i>'
            + '<span style="font-size:11px;color:rgba(255,255,255,0.5);font-weight:500;">' + dept.label + '</span>'
            + '</div></div>';
    }

    menu.forEach(function (item) {
        if (item.type === 'item') {
            html += '<div class="nav-item' + (item.page === 'dashboard' ? ' active' : '') + '" data-page="' + item.page + '">';
            html += '<span class="nav-icon"><i class="' + item.icon + '"></i></span>';
            html += '<span class="nav-label">' + item.label + '</span>';
            html += '</div>';
        } else if (item.type === 'group') {
            html += '<div class="nav-item" data-toggle="' + item.id + '-' + roleId + '">';
            html += '<span class="nav-icon"><i class="' + item.icon + '"></i></span>';
            html += '<span class="nav-label">' + item.label + '</span>';
            html += '<span class="nav-arrow">&#9654;</span>';
            html += '</div>';
            html += '<div class="sub-nav" id="' + item.id + '-' + roleId + '">';
            item.children.forEach(function (child) {
                html += '<div class="nav-item" data-page="' + child.page + '"><span class="nav-label">' + child.label + '</span></div>';
            });
            html += '</div>';
        }
    });

    nav.innerHTML = html;

    // Re-initialize sidebar click handlers
    if (typeof window.reinitSidebar === 'function') {
        window.reinitSidebar();
    }
}

/* =========================
   Role Selector UI
   ========================= */
function showRoleSelector() {
    // Hide main app
    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'none';

    // Hide demo toolbar
    const toolbar = document.getElementById('demo-toolbar');
    if (toolbar) toolbar.style.display = 'none';

    // Create/show role selector
    let selector = document.getElementById('role-selector');
    if (!selector) {
        selector = document.createElement('div');
        selector.id = 'role-selector';
        document.body.appendChild(selector);
    }

    selector.innerHTML = buildRoleSelectorHTML();
    selector.style.display = 'flex';

    // Attach click events
    selector.querySelectorAll('.role-card').forEach(function (card) {
        card.addEventListener('click', function () {
            const roleId = this.getAttribute('data-role');
            selectRole(roleId);
        });
    });
}

function hideRoleSelector() {
    const selector = document.getElementById('role-selector');
    if (selector) selector.style.display = 'none';

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.style.display = 'flex';

    // Show demo toolbar
    const toolbar = document.getElementById('demo-toolbar');
    if (toolbar) toolbar.style.display = 'flex';
}

function selectRole(roleId) {
    setRole(roleId);
    hideRoleSelector();
    renderSidebar(roleId);
    updateHeaderForRole(roleId);
    showDashboardForRole(roleId);
    renderDemoToolbar(roleId);
    // Enforce finance-only visibility for ops roles
    if (typeof window.applyFinanceVisibility === 'function') {
        window.applyFinanceVisibility();
    }
}

function showDashboardForRole(roleId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(function (s) {
        s.style.display = 'none';
    });

    // Show role-specific dashboard if exists, otherwise generic
    const dashId = ROLE_DASHBOARDS[roleId] || 'dashboard';
    const dashEl = document.getElementById('page-' + dashId);
    if (dashEl) {
        dashEl.style.display = 'block';
    } else {
        // Fallback to generic dashboard
        const fallback = document.getElementById('page-dashboard');
        if (fallback) fallback.style.display = 'block';
    }
}

function updateHeaderForRole(roleId) {
    const role = ROLES[roleId];
    if (!role) return;

    const dept = DEPARTMENTS[role.department];

    // Add/update role switcher in header
    let switcher = document.getElementById('role-switcher-btn');
    if (!switcher) {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            switcher = document.createElement('button');
            switcher.id = 'role-switcher-btn';
            switcher.className = 'role-switcher-btn';
            headerActions.insertBefore(switcher, headerActions.firstChild);
        }
    }
    if (switcher) {
        switcher.innerHTML = '<span class="role-switcher-avatar" style="background:' + role.color + ';">' + role.user.initials + '</span>'
            + '<span class="role-switcher-info"><span class="role-switcher-name">' + role.user.name + '</span>'
            + '<span class="role-switcher-role">' + (dept ? dept.label + ' · ' : '') + role.label + '</span></span>'
            + '<i class="fas fa-exchange-alt" style="font-size:12px;color:var(--text-muted);margin-left:8px;"></i>';
        switcher.onclick = function () {
            showRoleSelector();
        };
    }

    // ─── Branch Selector / Badge in Header ───
    var existingBranchSel = document.getElementById('branch-selector-header');
    if (existingBranchSel) existingBranchSel.remove();

    var branchScope = role.branchScope || (roleId === 'owner' || roleId === 'admin' || roleId === 'finance_controller' ? 'all' : 'own');
    var branchName = role.branchName || 'Mumbai HQ';

    var headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        var branchEl = document.createElement('div');
        branchEl.id = 'branch-selector-header';
        branchEl.style.cssText = 'display:flex;align-items:center;margin-right:8px;';

        if (branchScope === 'all') {
            // Owner/Admin: dropdown to filter by branch
            branchEl.innerHTML = '<div id="branch-dropdown-trigger" style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:#0369a1;position:relative;" onclick="toggleBranchDropdown()" >'
                + '<i class="fas fa-building" style="font-size:11px;"></i>'
                + '<span id="branch-selected-label">All Branches</span>'
                + '<i class="fas fa-chevron-down" style="font-size:9px;margin-left:2px;"></i>'
                + '</div>'
                + '<div id="branch-dropdown-menu" style="display:none;position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:220px;z-index:9999;overflow:hidden;">'
                + '<div style="padding:8px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;border-bottom:1px solid #f3f4f6;">Select Branch</div>'
                + '<div class="branch-opt" data-branch="all" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;font-weight:600;color:#0369a1;background:#f0f9ff;" onclick="selectBranch(this,\'All Branches\')">'
                + '<i class="fas fa-globe" style="color:#0369a1;"></i> All Branches <i class="fas fa-check" style="margin-left:auto;font-size:10px;"></i></div>'
                + '<div class="branch-opt" data-branch="mumbai" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;" onclick="selectBranch(this,\'Mumbai HQ\')">'
                + '<span style="width:8px;height:8px;border-radius:50%;background:#2563EB;"></span> Mumbai HQ</div>'
                + '<div class="branch-opt" data-branch="delhi" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;" onclick="selectBranch(this,\'Delhi NCR\')">'
                + '<span style="width:8px;height:8px;border-radius:50%;background:#059669;"></span> Delhi NCR</div>'
                + '<div class="branch-opt" data-branch="ahmedabad" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;" onclick="selectBranch(this,\'Ahmedabad\')">'
                + '<span style="width:8px;height:8px;border-radius:50%;background:#D97706;"></span> Ahmedabad</div>'
                + '<div class="branch-opt" data-branch="pune" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;" onclick="selectBranch(this,\'Pune\')">'
                + '<span style="width:8px;height:8px;border-radius:50%;background:#0E7490;"></span> Pune</div>'
                + '<div class="branch-opt" data-branch="chennai" style="padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;border-bottom-left-radius:10px;border-bottom-right-radius:10px;" onclick="selectBranch(this,\'Chennai\')">'
                + '<span style="width:8px;height:8px;border-radius:50%;background:#DC2626;"></span> Chennai <span style="margin-left:auto;font-size:10px;color:#f59e0b;">New</span></div>'
                + '</div>';
        } else {
            // Branch-scoped user: static badge
            branchEl.innerHTML = '<div style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:linear-gradient(135deg,#ecfeff,#cffafe);border:1px solid #a5f3fc;border-radius:8px;font-size:12px;font-weight:600;color:#0e7490;">'
                + '<i class="fas fa-map-marker-alt" style="font-size:11px;"></i>'
                + '<span>' + branchName + '</span>'
                + '</div>';
        }

        // Insert before first child (before notification bell)
        headerActions.insertBefore(branchEl, headerActions.firstChild);
    }
}

// ─── Branch Dropdown Helpers ───
function toggleBranchDropdown() {
    var menu = document.getElementById('branch-dropdown-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        // Close on outside click
        if (menu.style.display === 'block') {
            setTimeout(function () {
                document.addEventListener('click', closeBranchDropdownOutside, { once: true });
            }, 10);
        }
    }
}
function closeBranchDropdownOutside(e) {
    var trigger = document.getElementById('branch-dropdown-trigger');
    var menu = document.getElementById('branch-dropdown-menu');
    if (menu && trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
}
function selectBranch(el, label) {
    document.getElementById('branch-selected-label').textContent = label;
    document.getElementById('branch-dropdown-menu').style.display = 'none';
    // Update styling: highlight selected
    document.querySelectorAll('#branch-dropdown-menu .branch-opt').forEach(function (opt) {
        opt.style.background = '';
        opt.style.color = '';
        opt.style.fontWeight = '';
        var check = opt.querySelector('.fa-check');
        if (check) check.remove();
    });
    el.style.background = '#f0f9ff';
    el.style.fontWeight = '600';
    el.style.color = '#0369a1';
    var checkMark = document.createElement('i');
    checkMark.className = 'fas fa-check';
    checkMark.style.cssText = 'margin-left:auto;font-size:10px;';
    el.appendChild(checkMark);
    if (typeof showToast === 'function') showToast('Branch filter: ' + label, 'info');
}

/* =========================
   Build Role Selector HTML
   (Department-Grouped)
   ========================= */
function buildRoleSelectorHTML() {
    let sections = '';
    var visibleDepts = 0;
    var visibleRoles = 0;

    Object.keys(DEPARTMENTS).forEach(function (deptKey) {
        var dept = DEPARTMENTS[deptKey];
        if (dept.hidden) return;
        visibleDepts++;

        var cards = '';
        var roleCount = 0;
        dept.roles.forEach(function (roleKey) {
            var r = ROLES[roleKey];
            if (!r) return;
            roleCount++;
            visibleRoles++;

            cards += '<div class="role-card" data-role="' + roleKey + '" style="--dept-color:' + dept.color + ';">'
                + '<div class="role-card-icon" style="background:' + r.color + ';"><i class="' + r.icon + '"></i></div>'
                + '<div class="role-card-info">'
                + '<div class="role-card-label">' + r.label + '</div>'
                + '<div class="role-card-user"><i class="fas fa-user" style="font-size:9px;margin-right:3px;opacity:0.5;"></i>' + r.user.name + '</div>'
                + '<div class="role-card-desc">' + r.description + '</div>'
                + '<div class="role-card-kpis">' + r.kpis.map(function (k) { return '<span style="border-color:' + dept.color + '20;color:' + dept.color + ';">' + k + '</span>'; }).join('') + '</div>'
                + '</div>'
                + '<div class="role-card-arrow"><i class="fas fa-chevron-right"></i></div>'
                + '</div>';
        });

        sections += '<div class="role-dept-section" style="--dept-color:' + dept.color + ';">'
            + '<div class="role-dept-header">'
            + '<div class="role-dept-icon" style="background:' + dept.color + ';"><i class="' + dept.icon + '"></i></div>'
            + '<div class="role-dept-info">'
            + '<div class="role-dept-label">' + dept.label + '</div>'
            + '<div class="role-dept-desc">' + dept.description + '</div>'
            + '</div>'
            + '<div class="role-dept-count">' + roleCount + (roleCount === 1 ? ' role' : ' roles') + '</div>'
            + '</div>'
            + '<div class="role-dept-cards">' + cards + '</div>'
            + '</div>';
    });

    return '<div class="role-selector-inner">'
        + '<div class="role-selector-header">'
        + '<div class="role-selector-brand">'
        + '<div class="role-selector-logo">GT</div>'
        + '<div>'
        + '<h1>Goodwill Transport</h1>'
        + '<p>Select your department & role to continue</p>'
        + '</div>'
        + '</div>'
        + '<div class="role-selector-stats">'
        + '<div class="role-selector-stat"><i class="fas fa-building"></i><span>' + visibleDepts + ' Departments</span></div>'
        + '<div class="role-selector-stat-dot"></div>'
        + '<div class="role-selector-stat"><i class="fas fa-users"></i><span>' + visibleRoles + ' Roles</span></div>'
        + '<div class="role-selector-stat-dot"></div>'
        + '<div class="role-selector-stat"><i class="fas fa-file-alt"></i><span>71 Pages</span></div>'
        + '</div>'
        + '</div>'
        + '<div class="role-selector-departments">' + sections + '</div>'
        + '<div class="role-selector-footer">'
        + '<span>Powered by <strong>AxleOps</strong> Fleet Management Platform</span>'
        + '</div>'
        + '</div>';
}

/* =========================
   Demo Toolbar
   (Quick role switching)
   ========================= */
function renderDemoToolbar(activeRoleId) {
    var toolbar = document.getElementById('demo-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'demo-toolbar';
        document.body.appendChild(toolbar);
    }

    var role = ROLES[activeRoleId];
    var dept = role ? DEPARTMENTS[role.department] : null;

    // Build department quick-switch buttons
    var deptBtns = '';
    Object.keys(DEPARTMENTS).forEach(function (deptKey) {
        var d = DEPARTMENTS[deptKey];
        if (d.hidden) return;
        var isActive = dept && dept.id === d.id;

        // Build role dropdown items for this department
        var roleItems = '';
        d.roles.forEach(function (rKey) {
            var r = ROLES[rKey];
            if (!r) return;
            var isCurrent = rKey === activeRoleId;
            roleItems += '<div class="demo-toolbar-role-item' + (isCurrent ? ' active' : '') + '" data-role="' + rKey + '">'
                + '<span class="demo-toolbar-role-dot" style="background:' + r.color + ';"></span>'
                + '<span>' + r.label + '</span>'
                + '</div>';
        });

        deptBtns += '<div class="demo-toolbar-dept' + (isActive ? ' active' : '') + '" data-dept="' + deptKey + '">'
            + '<div class="demo-toolbar-dept-btn" title="' + d.label + '">'
            + '<i class="' + d.icon + '" style="color:' + (isActive ? d.color : 'rgba(255,255,255,0.5)') + ';"></i>'
            + '<span class="demo-toolbar-dept-name">' + d.label.split(' ')[0] + '</span>'
            + '</div>'
            + '<div class="demo-toolbar-dropdown">' + roleItems + '</div>'
            + '</div>';
    });

    toolbar.innerHTML = '<div class="demo-toolbar-inner">'
        + '<div class="demo-toolbar-current">'
        + '<span class="demo-toolbar-badge">🎭 DEMO</span>'
        + '<span class="demo-toolbar-active">'
        + '<span class="demo-toolbar-active-dot" style="background:' + (role ? role.color : '#666') + ';"></span>'
        + (role ? role.label : 'No role selected')
        + '</span>'
        + '</div>'
        + '<div class="demo-toolbar-depts">' + deptBtns + '</div>'
        + '<div class="demo-toolbar-actions">'
        + '<button class="demo-toolbar-scenario-btn" title="Guided Scenarios">▶ Scenarios</button>'
        + '<button class="demo-toolbar-map-btn" title="Product Map">📋 Map</button>'
        + '</div>'
        + '</div>';

    toolbar.style.display = 'flex';

    // Attach events — department hover → show dropdown, role click → switch
    toolbar.querySelectorAll('.demo-toolbar-role-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            var rid = this.getAttribute('data-role');
            selectRole(rid);
        });
    });

    // Product map button
    var mapBtn = toolbar.querySelector('.demo-toolbar-map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', function () {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo('product-map');
            }
        });
    }

    // Scenario button
    var scenarioBtn = toolbar.querySelector('.demo-toolbar-scenario-btn');
    if (scenarioBtn) {
        scenarioBtn.addEventListener('click', function () {
            toggleScenarioPanel();
        });
    }
}

/* =========================
   Guided Scenarios System
   ========================= */
const SCENARIOS = {
    trip_lifecycle: {
        id: 'trip_lifecycle',
        label: 'Trip Lifecycle',
        icon: '🚚',
        description: 'Follow a trip from client order to payment collection — across 6 departments.',
        steps: [
            { role: 'account_manager', page: 'clients', title: 'Client Places Order', dept: 'Sales', description: 'Account Manager reviews client request, confirms route and rate card for a Mumbai→Pune shipment.' },
            { role: 'fleet_manager', page: 'trip-create', title: 'Add & Dispatch Trip', dept: 'Operations', description: 'Fleet Manager adds the trip, assigns MH04AB1234 with driver Ramesh Yadav.' },
            { role: 'operator', page: 'trips', title: 'Monitor Trip Progress', dept: 'Operations', description: 'Operations Executive tracks live trip status, coordinates with driver en route.' },
            { role: 'driver', page: 'dashboard', title: 'Driver Executes Trip', dept: 'Operations', description: 'Driver logs fuel at ₹12,450, records toll ₹3,800, delivers goods and uploads POD.' },
            { role: 'accounts_exec', page: 'invoices', title: 'Generate Invoice', dept: 'Finance', description: 'Accounts Executive creates invoice INV-078 for ₹45,000 and posts to ledger.' },
            { role: 'finance_controller', page: 'dashboard', title: 'Follow Up Payment', dept: 'Finance', description: 'Finance Controller adds to collections follow-up queue, schedules reminder call for Day 15.' },
            { role: 'owner', page: 'trip-detail', title: 'Review Profitability', dept: 'Executive', description: 'Owner views the trip details card and navigates to the Financials Tab to review profitability: Margin 25.6%.' }
        ]
    },
    month_end: {
        id: 'month_end',
        label: 'Month-End Closing',
        icon: '📊',
        description: 'Walk through the financial month-end closing process across the Finance department.',
        steps: [
            { role: 'accounts_exec', page: 'day-book', title: 'Reconcile Day Book', dept: 'Finance', description: 'Accounts Executive verifies all entries are posted, reconciles 8 unmatched bank entries.' },
            { role: 'accounts_exec', page: 'voucher-entry', title: 'Post Pending Vouchers', dept: 'Finance', description: 'Posts 6 pending vouchers to the ledger — clears the backlog.' },
            { role: 'finance_controller', page: 'profit-loss', title: 'Review P&L Statement', dept: 'Finance', description: 'Finance Controller reviews March P&L: Revenue ₹18.4L, Expenses ₹12.8L, Net Profit ₹5.6L.' },
            { role: 'finance_controller', page: 'dashboard', title: 'Outstanding Receivables', dept: 'Finance', description: 'Finance Controller reviews ₹4.32L outstanding — 2 clients are 60+ days overdue.' },
            { role: 'finance_controller', page: 'balance-sheet', title: 'Balance Sheet Review', dept: 'Finance', description: 'Finance Controller verifies assets, liabilities, and equity positions for the month.' },
            { role: 'owner', page: 'dashboard', title: 'Business Review', dept: 'Executive', description: 'Owner reviews monthly performance: fleet ROI, revenue growth, cash position.' }
        ]
    },
    breakdown: {
        id: 'breakdown',
        label: 'Vehicle Breakdown',
        icon: '🔧',
        description: 'Handle a mid-trip vehicle breakdown — from driver report to repair completion.',
        steps: [
            { role: 'driver', page: 'dashboard', title: 'Driver Reports Breakdown', dept: 'Operations', description: 'Ramesh Yadav reports engine overheating on MH04AB1234 near Lonavala.' },
            { role: 'operator', page: 'trips', title: 'Coordinate Response', dept: 'Operations', description: 'Operations Executive alerts workshop, notifies client of delay, arranges towing.' },
            { role: 'shop_manager', page: 'dashboard', title: 'Add Emergency WO', dept: 'Maintenance', description: 'Workshop Manager adds urgent WO-0185 for thermostat replacement and coolant flush.' },
            { role: 'inventory_manager', page: 'dashboard', title: 'Check Parts Availability', dept: 'Inventory', description: 'Store Manager checks stock — thermostat in stock, coolant available. Issues parts.' },
            { role: 'mechanic', page: 'dashboard', title: 'Execute Repair', dept: 'Maintenance', description: 'Ravi Shankar completes repair in 3 hours. Logs time and parts used.' },
            { role: 'fleet_manager', page: 'dashboard', title: 'Resume or Reassign', dept: 'Operations', description: 'Fleet Manager confirms vehicle roadworthy, resumes original trip assignment.' },
            { role: 'accounts_exec', page: 'voucher-entry', title: 'Record Repair Cost', dept: 'Finance', description: 'Accounts Executive posts repair expense ₹8,400 against vehicle MH04AB1234.' }
        ]
    },
    compliance_audit: {
        id: 'compliance_audit',
        label: 'Fleet Compliance Audit',
        icon: '🛡️',
        description: 'Conduct a compliance check across the fleet and verify financial trails.',
        steps: [
            { role: 'compliance_manager', page: 'dashboard', title: 'Review Fleet Status', dept: 'Compliance', description: 'Compliance Manager finds 5 expired docs across 4 vehicles, 8 expiring within 30 days.' },
            { role: 'compliance_manager', page: 'vehicle-compliance', title: 'Flag Non-Compliant Vehicles', dept: 'Compliance', description: 'Flags MH04AB1234 and DL01EF9012 for expired insurance and permits.' },
            { role: 'fleet_manager', page: 'dashboard', title: 'Pull for Renewal', dept: 'Operations', description: 'Fleet Manager schedules the 2 flagged vehicles for renewal — removes from active pool.' },
            { role: 'auditor', page: 'dashboard', title: 'Verify Financial Trails', dept: 'Compliance', description: 'Auditor reviews exception log — flags duplicate brake pad billing and cash fueling without receipts.' },
            { role: 'owner', page: 'dashboard', title: 'Compliance Health', dept: 'Executive', description: 'Owner reviews fleet readiness at 78% (target: 95%), 7 high-risk exceptions flagged.' }
        ]
    }
};

let activeScenario = null;
let activeStep = 0;

function toggleScenarioPanel() {
    var panel = document.getElementById('scenario-panel');
    if (panel) {
        panel.remove();
        activeScenario = null;
        activeStep = 0;
        return;
    }
    showScenarioSelector();
}

function showScenarioSelector() {
    var panel = document.createElement('div');
    panel.id = 'scenario-panel';
    panel.style.cssText = 'position:fixed;bottom:56px;right:16px;width:420px;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.18);z-index:9999;overflow:hidden;border:1px solid #e5e7eb;animation:slideUp 0.3s ease;';

    var html = '<div style="padding:16px 20px;background:linear-gradient(135deg,#1e293b,#334155);color:#fff;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;">'
        + '<div><div style="font-size:16px;font-weight:700;">▶ Guided Scenarios</div>'
        + '<div style="font-size:12px;opacity:0.8;margin-top:2px;">Story-based walkthroughs across departments</div></div>'
        + '<button onclick="document.getElementById(\'scenario-panel\').remove()" style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px;">✕</button>'
        + '</div></div>';

    html += '<div style="padding:12px 16px;max-height:340px;overflow-y:auto;">';
    Object.keys(SCENARIOS).forEach(function (key) {
        var s = SCENARIOS[key];
        html += '<div onclick="window._startScenario(\'' + key + '\')" style="cursor:pointer;padding:14px;margin-bottom:8px;border:1px solid #e5e7eb;border-radius:10px;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#2563eb\';this.style.background=\'#eff6ff\'" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.background=\'#fff\'">'
            + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'
            + '<span style="font-size:22px;">' + s.icon + '</span>'
            + '<div><div style="font-size:14px;font-weight:700;">' + s.label + '</div>'
            + '<div style="font-size:11px;color:#6b7280;">' + s.steps.length + ' steps</div></div>'
            + '</div>'
            + '<div style="font-size:12px;color:#374151;line-height:1.4;">' + s.description + '</div>'
            + '</div>';
    });
    html += '</div>';

    panel.innerHTML = html;
    document.body.appendChild(panel);
}

function startScenario(scenarioId) {
    activeScenario = SCENARIOS[scenarioId];
    activeStep = 0;
    if (!activeScenario) return;

    // Execute first step
    executeScenarioStep();
}

function executeScenarioStep() {
    if (!activeScenario) return;
    var step = activeScenario.steps[activeStep];
    if (!step) return;

    // Switch role and navigate
    selectRole(step.role);
    setTimeout(function () {
        if (typeof window.navigateTo === 'function') {
            window.navigateTo(step.page);
        }
        renderScenarioStepPanel();
    }, 200);
}

function renderScenarioStepPanel() {
    if (!activeScenario) return;
    var step = activeScenario.steps[activeStep];
    var role = ROLES[step.role];

    var panel = document.getElementById('scenario-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'scenario-panel';
        document.body.appendChild(panel);
    }
    panel.style.cssText = 'position:fixed;bottom:56px;right:16px;width:420px;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.18);z-index:9999;overflow:hidden;border:1px solid #e5e7eb;animation:slideUp 0.3s ease;';

    var stepDots = '';
    for (var i = 0; i < activeScenario.steps.length; i++) {
        var dotStyle = i === activeStep ? 'background:#2563eb;width:20px;' : (i < activeStep ? 'background:#86efac;' : 'background:#d1d5db;');
        stepDots += '<div style="width:8px;height:8px;border-radius:4px;' + dotStyle + 'transition:all 0.3s;"></div>';
    }

    panel.innerHTML = '<div style="padding:14px 20px;background:linear-gradient(135deg,#1e293b,#334155);color:#fff;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
        + '<div style="display:flex;align-items:center;gap:8px;">'
        + '<span style="font-size:18px;">' + activeScenario.icon + '</span>'
        + '<span style="font-size:14px;font-weight:600;">' + activeScenario.label + '</span>'
        + '</div>'
        + '<button onclick="window._exitScenario()" style="background:none;border:none;color:#fff;font-size:14px;cursor:pointer;padding:4px;opacity:0.7;">✕ Exit</button>'
        + '</div>'
        + '<div style="display:flex;gap:4px;align-items:center;">' + stepDots + '</div>'
        + '</div>'
        + '<div style="padding:16px 20px;">'
        + '<div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">STEP ' + (activeStep + 1) + ' OF ' + activeScenario.steps.length + ' — ' + step.dept + '</div>'
        + '<div style="font-size:16px;font-weight:700;margin-bottom:6px;">' + step.title + '</div>'
        + '<div style="font-size:13px;color:#374151;line-height:1.5;margin-bottom:12px;">' + step.description + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">'
        + '<div style="width:24px;height:24px;border-radius:6px;background:' + role.color + ';display:flex;align-items:center;justify-content:center;"><i class="' + role.icon + '" style="color:#fff;font-size:10px;"></i></div>'
        + '<div><div style="font-size:12px;font-weight:600;">' + role.label + '</div><div style="font-size:10px;color:#6b7280;">' + role.user.name + '</div></div>'
        + '</div>'
        + '</div>'
        + '<div style="display:flex;justify-content:space-between;padding:12px 20px;border-top:1px solid #e5e7eb;background:#f9fafb;">'
        + '<button onclick="window._scenarioPrev()" style="padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:12px;font-weight:600;' + (activeStep === 0 ? 'opacity:0.3;pointer-events:none;' : '') + '">← Previous</button>'
        + (activeStep < activeScenario.steps.length - 1
            ? '<button onclick="window._scenarioNext()" style="padding:8px 16px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:12px;font-weight:600;">Next Step →</button>'
            : '<button onclick="window._exitScenario()" style="padding:8px 16px;border:none;border-radius:8px;background:#16a34a;color:#fff;cursor:pointer;font-size:12px;font-weight:600;">✓ Complete</button>')
        + '</div>';
}

function scenarioNext() {
    if (!activeScenario) return;
    if (activeStep < activeScenario.steps.length - 1) {
        activeStep++;
        executeScenarioStep();
    }
}

function scenarioPrev() {
    if (!activeScenario) return;
    if (activeStep > 0) {
        activeStep--;
        executeScenarioStep();
    }
}

function exitScenario() {
    activeScenario = null;
    activeStep = 0;
    var panel = document.getElementById('scenario-panel');
    if (panel) panel.remove();
}

// Expose scenario functions on window for inline onclick handlers
window._startScenario = startScenario;
window._scenarioNext = scenarioNext;
window._scenarioPrev = scenarioPrev;
window._exitScenario = exitScenario;

// Expose branch selector functions on window for inline onclick handlers
window.toggleBranchDropdown = toggleBranchDropdown;
window.selectBranch = selectBranch;

export {
    DEPARTMENTS, ROLES, ROLE_MENUS, ROLE_DASHBOARDS, SCENARIOS,
    getCurrentRole, setRole, getSavedRole,
    renderSidebar, showRoleSelector, hideRoleSelector,
    selectRole, updateHeaderForRole, renderDemoToolbar,
    toggleScenarioPanel, startScenario
};

// Expose on window for app.js cross-module access
window.getCurrentRole = getCurrentRole;
window.ROLE_DASHBOARDS = ROLE_DASHBOARDS;
window.DEPARTMENTS = DEPARTMENTS;
window.SCENARIOS = SCENARIOS;
