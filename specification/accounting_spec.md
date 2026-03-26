
TECHNICAL SPECIFICATION

Branch Model Architecture
for AxleOps Fleet & Transport Management Platform

Data Scoping  ·  RBAC  ·  Schema Migrations  ·  API Contracts  ·  UI Placement

Product:
AxleOps v1.0
Document:
TECH-SPEC-BRANCH-001
Date:
March 2026
Status:
Ready for Engineering Review

1. Design Philosophy & Core Principle
This spec answers one question: what does it mean for an entity to "belong to a branch" in AxleOps, and what does it mean for something to be branch-independent?

The Guiding Rule
A branch is a commercial operating unit — a depot or city office that owns vehicles, employs drivers, originates trips, and generates its own P&L. Anything that directly contributes to or costs against a branch’s P&L is branch-scoped. Anything that serves the fleet as shared infrastructure is branch-independent.

This gives us a clean split:
Branch-Scoped (has branch_id)
Branch-Independent (no branch_id)
Trips
Work Orders
Vehicles
Service Tasks & Programs
Drivers (Contacts)
Parts & Inventory
Clients
Purchase Orders
Invoices
Vendors & Shop Directory
Fuel Entries
Inspections (tied to vehicle, not branch)
Routes (origin branch)
Chart of Accounts & Ledgers
Driver Ledger Entries
Vouchers (tagged, not scoped)
Trip Alerts
Equipment catalog
Compliance Documents
Service History (follows vehicle)

Why Maintenance & Inventory are NOT branch-scoped
Your design already models workshops and inventory as shared services. A vehicle from the Pune branch can break down in Delhi and be serviced at the Delhi workshop — the work order belongs to the workshop, not to Pune. Forcing work orders under a branch would break this cross-branch servicing model. The same logic applies to parts inventory: a centralized warehouse or regional parts depot serves multiple branches. Purchase orders, vendor relationships, and stock levels are organizational assets, not branch-local ones.
If a future customer needs branch-local workshops, that is modeled as a "workshop location" attribute on the work order, not by adding branch_id to the maintenance schema.

2. Database Schema Changes
2.1 New Table: branches
CREATE TABLE branches (
  branch_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(tenant_id),
  name             VARCHAR(100) NOT NULL,
  code             VARCHAR(10) NOT NULL UNIQUE,    -- e.g. 'MUM', 'DEL', 'PNE'
  city             VARCHAR(80) NOT NULL,
  state            VARCHAR(80) NOT NULL,
  address          TEXT,
  manager_user_id  UUID REFERENCES users(user_id), -- the Branch Manager
  is_primary       BOOLEAN DEFAULT false,
  status           VARCHAR(20) DEFAULT 'active'    -- active | inactive | archived
                   CHECK (status IN ('active','inactive','archived')),
  gstin            VARCHAR(15),                     -- branch-level GSTIN if different
  phone            VARCHAR(15),
  email            VARCHAR(100),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, code)
);

Key additions vs. the existing design: tenant_id (for multi-tenant SaaS), code (short identifier for trip IDs like TRP-MUM-0142), gstin (branches in different states have different GSTINs), and the status now supports soft-archival.
2.2 Foreign Key Additions to Existing Tables
Every branch-scoped table gets a branch_id column. This is not nullable — every trip, vehicle, and driver must belong to exactly one branch.
Table
Column Added
Nullable?
Notes
trips
branch_id UUID REFERENCES branches
NOT NULL
Set from creating user’s branch or explicit selection
vehicles
branch_id UUID REFERENCES branches
NOT NULL
Home branch; can be temporarily at another
contacts
branch_id UUID REFERENCES branches
NOT NULL
Driver/staff home branch
clients
branch_id UUID REFERENCES branches
NULL
NULL = company-wide client; set = branch-local client
invoices
branch_id UUID REFERENCES branches
NOT NULL
Inherited from trip’s branch
fuel_entries
branch_id UUID REFERENCES branches
NOT NULL
Inherited from trip’s branch
routes
origin_branch_id UUID REFERENCES branches
NULL
NULL = company-wide route; set = branch-originated
driver_ledger
branch_id UUID REFERENCES branches
NOT NULL
Inherited from driver’s branch
trip_alerts
branch_id UUID REFERENCES branches
NOT NULL
Inherited from trip’s branch
compliance_docs
branch_id UUID REFERENCES branches
NOT NULL
Inherited from vehicle’s branch
2.3 Users Table: Branch Assignment
Users need a branch association. A single user can be assigned to one primary branch, but some roles (Owner, Admin, Finance Controller) operate across all branches.
ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(branch_id);
ALTER TABLE users ADD COLUMN branch_scope VARCHAR(20) DEFAULT 'own'
  CHECK (branch_scope IN ('own', 'all', 'list'));
-- 'own'  = sees only their branch_id
-- 'all'  = sees all branches (Owner, Admin, Finance Controller)
-- 'list' = sees a specific set (future: regional manager over 3 branches)

CREATE TABLE user_branch_access (
  user_id    UUID REFERENCES users(user_id),
  branch_id  UUID REFERENCES branches(branch_id),
  PRIMARY KEY (user_id, branch_id)
);
-- Only populated when branch_scope = 'list'
2.4 Indexes
Every branch_id FK gets a composite index with the most common query filter for that table:
CREATE INDEX idx_trips_branch_status ON trips(branch_id, status);
CREATE INDEX idx_vehicles_branch_status ON vehicles(branch_id, status);
CREATE INDEX idx_contacts_branch_role ON contacts(branch_id, role);
CREATE INDEX idx_invoices_branch_status ON invoices(branch_id, status);
CREATE INDEX idx_fuel_entries_branch_date ON fuel_entries(branch_id, entry_date);
CREATE INDEX idx_trip_alerts_branch_sev ON trip_alerts(branch_id, severity);
2.5 Migration Strategy
For existing single-branch deployments migrating to multi-branch:
	•	Create a default branch record with is_primary = true, seeded from company settings (city, state, GSTIN).
	•	Run: UPDATE trips SET branch_id = (SELECT branch_id FROM branches WHERE is_primary = true); Repeat for vehicles, contacts, invoices, fuel_entries, driver_ledger, trip_alerts, compliance_docs.
	•	ALTER COLUMN branch_id SET NOT NULL on all tables (after backfill is verified).
	•	Assign all existing users branch_id = primary branch; set Owner and Admin users to branch_scope = 'all'.


3. RBAC: The Branch Manager Role
3.1 The Problem
The current hierarchy has 17 roles, all department heads reporting directly to Owner/Director. The Multi-Branch module defines a "Branch Manager" in prose but never adds it to the role registry, the permission matrix, or the sidebar navigation. This means there is no role that has cross-department authority within a single branch.
3.2 Role Definition
Property
Value
Role ID
18 (new addition to the 17-role registry)
Role Name
Branch Manager
Department
Operations (primary); cross-department authority within branch
Demo User
Anand Kulkarni (Pune Branch Manager)
branch_scope
own — sees only their assigned branch
Dashboard
dashboard-branch-manager.html (new page, #18)
Icon
🏢 Building
Color
#0E7490 (Teal)
3.3 KPI Cards (Branch Manager Dashboard)
The Branch Manager dashboard is a scoped version of the Owner dashboard, filtered to their branch. Six KPI cards:
	•	Branch Revenue MTD (sum of completed trip revenue for the branch)
	•	Branch Net Profit MTD (revenue minus all trip expenses)
	•	Branch Vehicles (count of vehicles with this branch_id, plus utilization %)
	•	Branch Drivers (count of active drivers, plus availability count)
	•	Outstanding Receivables (invoices with status = pending or overdue for branch clients)
	•	Active Trips (in-transit trips originating from this branch)
3.4 Updated Role Hierarchy
The Branch Manager sits between Owner and the department-level roles within their branch:
Owner / Director (Executive)  [branch_scope = all]
├── Branch Manager (per branch)  [branch_scope = own]
│   ├── Fleet Manager *
│   ├── Dispatch Manager *
│   ├── Operations Executive *
│   ├── Driver *
│   ├── Accounts Executive *  (branch-local finance)
│   ├── Collections Manager *
│   └── Sales / BD *
├── Finance Controller        [branch_scope = all]
├── Workshop Manager           [branch_scope = all / own workshop]
├── Inventory Manager          [branch_scope = all]
├── Compliance Manager         [branch_scope = all]
└── Super Admin                [branch_scope = all]

* = these roles are branch-scoped (see only own branch data)

Key insight: Finance Controller, Workshop Manager, Inventory Manager, and Compliance Manager remain company-wide roles reporting to Owner. They are not placed under Branch Manager because they manage cross-branch concerns (consolidated books, shared workshops, central inventory, fleet-wide compliance). The Branch Manager’s authority covers operations, sales, and branch-local collections within their branch.
3.5 Permission Matrix (Branch Manager Row)
Adding the Branch Manager column to the existing Module Access Matrix:
Module
Access
Scoping Rule
Dashboard
Own Branch
dashboard-branch-manager.html with branch-filtered KPIs
Trips
CRUD
WHERE branch_id = user.branch_id; can create, edit, close trips
Trip Create
✓
Vehicle/driver dropdowns filtered to own branch
Vehicles
CRUD
WHERE branch_id = user.branch_id; can request transfers
Contacts
CRUD
WHERE branch_id = user.branch_id
Driver Ledger
View + Approve
Can approve advances/settlements for branch drivers
Clients
CRUD
Branch-local clients + view company-wide clients
Invoices
CRUD
WHERE branch_id = user.branch_id
Fuel & Energy
View
WHERE branch_id = user.branch_id
Work Orders
View
Read-only: WOs for vehicles belonging to their branch
Parts
—
No access (central inventory)
Accounting
View
Branch-filtered P&L, vouchers tagged to branch trips
Compliance
View
Compliance status for branch vehicles only
Intelligence
View
Trip Alerts, Forecasts filtered to branch
Reports
View
All reports auto-filtered to branch_id
Settings
—
No access
User Management
—
No access (Owner/Admin only)
Organization
—
No access to Branches/Partners/Subcon management pages
3.6 Branch Manager Sidebar Navigation
├── Dashboard
├── Trip Management ▸
│   ├── All Trips
│   └── Routes
├── Vehicles ▸
│   ├── Vehicle List
│   └── Vehicle Assignments
├── Drivers & Contacts ▸
│   ├── All Contacts
│   └── Driver Ledger
├── Clients & Billing ▸
│   ├── Client List
│   └── Invoices
├── Fuel & Energy
├── Intelligence ▸
│   ├── Trip Alerts
│   └── Profit Forecast
├── Financial Reports ▸
│   ├── Branch P&L
│   └── Trip Profitability
└── Reports

Notice what is absent: no Settings, no User Management, no Organization section, no Dynamic Pricing (company-level pricing decisions), no Balance Sheet or Cash Flow (company-wide financial statements), no Parts & Inventory.


4. Data Scoping Engine (Query Layer)
Every API query for branch-scoped data must pass through a scoping middleware. This is the single most important piece of the branch architecture — if this is wrong, data leaks across branches.
4.1 Scoping Middleware (Pseudocode)
function resolveBranchScope(user, requestedBranchId) {
  if (user.branch_scope === 'all') {
    // Owner, Admin, Finance Controller, etc.
    if (requestedBranchId) return [requestedBranchId];  // explicit filter
    return ALL_BRANCHES;  // no filter = see everything
  }
  if (user.branch_scope === 'list') {
    const allowed = getUserBranchAccess(user.user_id);
    if (requestedBranchId && !allowed.includes(requestedBranchId))
      throw FORBIDDEN;
    return requestedBranchId ? [requestedBranchId] : allowed;
  }
  // branch_scope === 'own'
  if (requestedBranchId && requestedBranchId !== user.branch_id)
    throw FORBIDDEN;
  return [user.branch_id];
}

// Applied to every query:
SELECT * FROM trips
  WHERE branch_id = ANY(resolveBranchScope(currentUser, req.query.branch))
    AND status = req.query.status
  ORDER BY created_at DESC;
4.2 Row-Level Security (PostgreSQL RLS)
For defense-in-depth, enforce at the database level too — so even a bug in the API layer cannot leak cross-branch data:
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY branch_isolation ON trips
  USING (
    branch_id IN (
      SELECT branch_id FROM user_branch_effective_access
      WHERE user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- Materialized view for performance:
CREATE MATERIALIZED VIEW user_branch_effective_access AS
  SELECT user_id, branch_id FROM users WHERE branch_scope = 'own'
  UNION ALL
  SELECT u.user_id, b.branch_id FROM users u CROSS JOIN branches b
    WHERE u.branch_scope = 'all'
  UNION ALL
  SELECT user_id, branch_id FROM user_branch_access;
4.3 Module-by-Module Scoping Rules
Module
Scoping Query Addition
Edge Case
Trip List
WHERE trips.branch_id IN (:userBranches)
Inter-branch trips: scoped to origin branch
Trip Create
Vehicle dropdown: WHERE vehicles.branch_id = :userBranch
Driver dropdown: WHERE contacts.branch_id = :userBranch
Branch Manager cannot assign vehicles from another branch
Vehicle List
WHERE vehicles.branch_id IN (:userBranches)
Vehicle at workshop in another city still belongs to home branch
Contacts
WHERE contacts.branch_id IN (:userBranches)
Driver transferred: update contact.branch_id
Clients
WHERE clients.branch_id IN (:userBranches) OR clients.branch_id IS NULL
NULL = company-wide client visible to all
Invoices
WHERE invoices.branch_id IN (:userBranches)
Inherited from trip; no direct branch selection on invoice
Fuel Entries
WHERE fuel_entries.branch_id IN (:userBranches)
Inherited from trip
Driver Ledger
WHERE driver_ledger.branch_id IN (:userBranches)
Inherited from driver
Trip Alerts
WHERE trip_alerts.branch_id IN (:userBranches)
Inherited from trip
Compliance
WHERE compliance_docs.branch_id IN (:userBranches)
Inherited from vehicle
Routes
WHERE origin_branch_id IN (:userBranches) OR origin_branch_id IS NULL
NULL = company-wide route
Reports
All report queries append branch filter
Branch P&L is a subset; company P&L sums all


5. API Contract Changes
5.1 Branch Selector Header
All branch-scoped API endpoints accept an optional header for explicit branch filtering:
X-AxleOps-Branch: <branch_id>
If omitted, the scoping middleware applies the user’s default scope (own branch for branch-scoped users, all branches for scope=all users). If present, the middleware validates access before applying the filter.
5.2 Branch CRUD Endpoints
Method
Endpoint
Roles
Notes
POST
/api/v1/branches
Owner, Admin
Create new branch
GET
/api/v1/branches
Owner, Admin, Branch Mgr
List branches (scoped)
GET
/api/v1/branches/:id
Owner, Admin, Branch Mgr
Branch detail + KPIs
PATCH
/api/v1/branches/:id
Owner, Admin
Update branch details
POST
/api/v1/branches/:id/transfer-vehicle
Owner, Admin
Move vehicle between branches
POST
/api/v1/branches/:id/transfer-driver
Owner, Admin
Move driver between branches
GET
/api/v1/branches/:id/pnl
Owner, Admin, Branch Mgr
Branch-level P&L statement
GET
/api/v1/branches/compare
Owner, Admin
Cross-branch KPI comparison
5.3 Modified Endpoints (All Existing Branch-Scoped Modules)
Every list endpoint on a branch-scoped module gains two behaviors:
	•	Automatic scoping: response is filtered to the user’s resolved branch set.
	•	Response envelope includes branch metadata:
{
  "data": [...],
  "meta": {
    "branch_filter": "branch_MUM_001",  // active filter
    "branch_name": "Mumbai HQ",
    "total_count": 42,
    "scope": "own"  // or 'all' for cross-branch users
  }
}
5.4 Vehicle & Driver Transfer Endpoint
When a vehicle or driver is transferred between branches, it’s not a simple UPDATE — it needs an audit trail and cascading updates:
POST /api/v1/branches/:targetBranchId/transfer-vehicle
Body: { vehicle_id, reason, effective_date }

Server-side:
1. Validate: no active trips on this vehicle
2. UPDATE vehicles SET branch_id = :targetBranchId WHERE vehicle_id = :vid
3. UPDATE compliance_docs SET branch_id = :targetBranchId
     WHERE vehicle_id = :vid
4. INSERT INTO vehicle_transfer_log (vehicle_id, from_branch, to_branch,
     transferred_by, reason, effective_date)
5. Notify both branch managers via alert system


6. UI: Branch Selector Placement & Behavior
6.1 Where the Branch Selector Appears
The branch selector is a global filter in the application header bar. It does NOT appear on every page — only on pages that display branch-scoped data.
Page / Module
Selector?
Reason
Dashboard (Owner)
YES
Owner sees all branches; selector filters KPIs to one branch or 'All'
Dashboard (Branch Manager)
NO
Locked to their branch; selector hidden
Dashboard (Fleet Manager)
NO
Locked to their branch
Trip List
YES
For roles with scope=all; hidden for scope=own
Trip Create
YES (as field)
Branch selector is a form field, not header dropdown
Trip Detail
NO
Branch shown as read-only label in trip info card
Vehicle List
YES
Same rule: visible for scope=all, hidden for scope=own
Contact List
YES
Same rule
Client List
YES
Shows branch-local + company-wide clients
Invoice List
YES
Same rule
Fuel History
YES
Same rule
Driver Ledger
YES
Same rule
Trip Alerts
YES
Same rule
Route List
YES
Filters to origin branch routes + company-wide
Work Orders
NO
Branch-independent (workshop module)
Parts & Inventory
NO
Branch-independent (central inventory)
Service Tasks/Programs
NO
Branch-independent
Purchase Orders
NO
Branch-independent
Vendors / Shop Directory
NO
Branch-independent
Chart of Accounts
NO
Company-wide ledgers
Voucher Entry
NO
Vouchers are tagged to trips (branch is derived)
P&L Statement
YES
Branch-level P&L vs. consolidated P&L
Balance Sheet
NO
Always company-wide
Cash Flow
NO
Always company-wide
Trip Profitability
YES
Can filter by branch
Compliance
YES
Filter by branch vehicles
Settings
NO
Company-wide
User Management
YES
Filter users by branch assignment
Branches page
NO
This IS the branch management page
Partners / Subcontractors
NO
Company-wide organizational modules
Inspections
NO
Follows vehicle, not branch
Reports
YES
All reports gain branch filter dropdown
6.2 Selector UI Spec
Position: Header bar, right of the search input, left of the notification bell. Same visual row as the current role switcher.

Component states:
	•	For scope=all users (Owner, Admin, Finance Controller): Dropdown with options "All Branches" (default), then each active branch listed as "[Code] Branch Name" (e.g., "MUM Mumbai HQ", "DEL Delhi NCR"). Shows a small colored dot per branch for quick identification.
	•	For scope=own users (Branch Manager, Fleet Manager, Driver, etc.): Static badge showing their branch name. Not clickable, not a dropdown. Just a label: "🏢 Pune Branch".
	•	For scope=list users (future regional manager): Dropdown with only their authorized branches.

Behavior:
	•	Selecting a branch sets the X-AxleOps-Branch header on all subsequent API calls from the frontend.
	•	Selecting "All Branches" clears the header (middleware returns unfiltered data).
	•	Selection is persisted in browser sessionStorage so it survives page navigation but resets on new login.
	•	When a branch is selected, a subtle colored banner appears below the header: "🏢 Viewing: Pune Branch" with an × to clear the filter. This gives persistent visual context.
6.3 Trip Create: Branch as a Form Field
On the Trip Create page, branch is an explicit form field — not derived from the header selector. This is because an Owner creating a trip may want to create it for a branch different from their current header filter.

Field behavior:
	•	For scope=all: Dropdown listing all active branches. Defaults to the header-selected branch (or primary branch if "All" is selected).
	•	For scope=own: Read-only field showing the user’s branch. Cannot be changed.
	•	On branch selection: Vehicle and Driver dropdowns re-filter to show only that branch’s assets. Client dropdown shows branch-local clients + company-wide clients (where client.branch_id IS NULL).


7. Accounting & Financial Reporting Under Branch Model
Accounting is the trickiest module because the Chart of Accounts and ledgers are company-wide, but P&L reporting must support branch-level slicing.
7.1 Principle: Tag, Don’t Duplicate
Do NOT create separate ledgers per branch (e.g., "Diesel Expense – Mumbai", "Diesel Expense – Delhi"). This creates an explosion of ledgers that breaks Tally compatibility and makes consolidation painful. Instead, every voucher is tagged with the branch_id of the trip it relates to. Branch P&L is generated by filtering vouchers by this tag.
Voucher
├── voucher_id, type, date, debit_ledger, credit_ledger, amount, narration
├── trip_id (FK → Trip)    ← existing
├── vehicle_id (FK)          ← existing
├── driver_id (FK)           ← existing
└── branch_id (FK → Branch) ← NEW: derived from trip.branch_id at creation
7.2 Branch P&L Generation
-- Branch-level P&L for Pune branch, March 2026:
SELECT
  CASE WHEN l.ledger_type = 'Income' THEN 'Income'
       WHEN l.ledger_type = 'Expense' AND l.sub_group = 'Direct' THEN 'Direct Expense'
       ELSE 'Indirect Expense' END AS category,
  l.ledger_name,
  SUM(v.amount) AS total
FROM vouchers v
JOIN ledgers l ON v.debit_ledger = l.ledger_id OR v.credit_ledger = l.ledger_id
WHERE v.branch_id = :puneBranchId
  AND v.date BETWEEN '2026-03-01' AND '2026-03-31'
GROUP BY category, l.ledger_name
ORDER BY category, total DESC;

Indirect expenses that cannot be attributed to a single branch (office rent, admin salaries) are either left untagged (excluded from branch P&L, appear only in consolidated P&L) or allocated using a configurable formula:
Branch allocation % = (Branch Revenue / Company Revenue) * Indirect Expense
7.3 Reports That Gain Branch Filter
Report
Branch Filter?
Behavior
Profit & Loss
YES
Branch P&L from tagged vouchers
Balance Sheet
NO
Always consolidated (assets/liabilities are company-wide)
Cash Flow
NO
Always consolidated
Trip Profitability
YES
Filter trips by branch_id
Day Book
YES
Filter vouchers by branch_id tag
Vehicle Cost Reports
YES
Filter vehicles by branch_id
Fuel Reports
YES
Filter fuel entries by branch_id
Driver Performance
YES
Filter contacts by branch_id
Client Revenue
YES
Filter by client.branch_id + trip.branch_id
Route Profitability
YES
Filter by route.origin_branch_id


8. Edge Cases & Business Rules
8.1 Inter-Branch Trips
A trip originates from the Mumbai branch but the delivery destination is in Delhi. Which branch owns the trip? The rule: the originating branch owns the trip. The trip’s branch_id is set to the branch that creates it (the dispatching branch). Revenue and cost accrue to the originating branch’s P&L. The Delhi branch is not involved unless the vehicle is permanently transferred there post-trip.
8.2 Company-Wide Clients vs. Branch-Local Clients
A company like Reliance Industries may have a master contract managed at the company level (client.branch_id = NULL). But a small local client like "Pune Steel Traders" may only be relevant to the Pune branch (client.branch_id = pune_branch_id). The client list for a Branch Manager shows both: their local clients AND all company-wide clients. Only the Owner or Sales/BD with scope=all can create a company-wide client (by leaving branch_id NULL).
8.3 Vehicle Temporarily at Another Branch
A Mumbai vehicle breaks down in Ahmedabad. The vehicle’s branch_id remains Mumbai. The work order created at the Ahmedabad workshop has no branch_id (workshop is branch-independent). The Branch Manager in Mumbai can still see the vehicle in their list and view the work order (read-only access to WOs for their vehicles). No branch transfer occurs unless the vehicle is permanently reassigned.
8.4 Driver Loaned to Another Branch
If a driver from Pune is temporarily assigned to a Mumbai trip, two options:
	•	Temporary loan (no branch transfer): The trip is created by the Mumbai branch. The driver dropdown shows a "Borrow from other branch" option (available only to Owner/Admin). The driver’s branch_id stays Pune. The trip’s P&L accrues to Mumbai. The driver’s advance/settlement entries are tagged to Mumbai for that trip.
	•	Permanent transfer: Use the transfer-driver endpoint. Driver’s branch_id changes to Mumbai. All future trips, advances, and settlements are under Mumbai.
8.5 Branch Deactivation
When a branch is set to status=inactive:
	•	All active trips must be completed or cancelled first (system blocks deactivation if active trips exist).
	•	Vehicles and drivers must be transferred to other branches before deactivation.
	•	Historical data (completed trips, invoices, vouchers) retains the original branch_id for reporting.
	•	The branch no longer appears in selector dropdowns or Trip Create branch field.
	•	P&L reports can still filter by inactive branches for historical comparison.
8.6 The "All Branches" Aggregation Problem
When the Owner selects "All Branches" in the header, KPI cards on the dashboard must show company-wide totals. This is not simply the sum of branch queries — it’s a single query without the branch_id filter. Company-wide KPIs should be pre-computed and cached (materialized view or Redis) to avoid N+1 query patterns. The dashboard should show both the aggregate and a branch-comparison sparkline or mini-table below each KPI.


9. Implementation Sequence
This should be implemented in Phase 1 of the roadmap (Months 1–3), alongside the backend API and database. It is not a Phase 5 feature. Branch scoping is a foundational schema decision that affects every table — retrofitting it later is orders of magnitude harder.

Recommended sprint sequence:

Sprint 1: Schema & Migration (Week 1–2)
	•	Create branches table, seed primary branch from company settings
	•	Add branch_id FK to all branch-scoped tables (trips, vehicles, contacts, clients, invoices, fuel_entries, driver_ledger, trip_alerts, compliance_docs)
	•	Add branch_id and branch_scope to users table
	•	Create user_branch_access table
	•	Write and test migration script for existing data
	•	Create composite indexes

Sprint 2: Scoping Middleware & RLS (Week 3–4)
	•	Implement resolveBranchScope middleware in API layer
	•	Apply middleware to all list/detail endpoints on branch-scoped modules
	•	Enable PostgreSQL RLS on all branch-scoped tables
	•	Create materialized view for user_branch_effective_access
	•	Write integration tests: user A (branch=Pune) cannot see branch=Mumbai data

Sprint 3: Branch Manager Role & UI (Week 5–6)
	•	Add Branch Manager to role registry (role #18)
	•	Build dashboard-branch-manager.html with branch-scoped KPIs
	•	Build branch manager sidebar navigation
	•	Update permission matrix in RBAC engine
	•	Build header branch selector component (dropdown for scope=all, badge for scope=own)
	•	Add branch field to Trip Create form with cascading vehicle/driver filters

Sprint 4: Accounting Tags & Branch P&L (Week 7–8)
	•	Add branch_id tag to vouchers table
	•	Auto-populate branch_id on voucher creation from trip.branch_id
	•	Build branch-level P&L report (filtered by voucher branch_id tag)
	•	Add branch filter to Trip Profitability, Day Book, and Vehicle Cost reports
	•	Build the Branches management page (list, detail, add/edit modal)
	•	Build vehicle/driver transfer endpoints with audit logging

Sprint 5: Testing & Edge Cases (Week 9–10)
	•	End-to-end test: Owner creates branch, assigns manager, creates trip, verifies scoping
	•	Test inter-branch trip ownership
	•	Test company-wide vs branch-local client visibility
	•	Test vehicle transfer with cascading compliance doc update
	•	Test branch deactivation flow
	•	Performance test: 50 branches, 10,000 trips — verify query times under 200ms

10. Summary of Deliverables
#
Deliverable
Type
Sprint
1
branches table + FKs on 10 tables
Database
Sprint 1
2
user branch_scope + user_branch_access
Database
Sprint 1
3
Migration script (backfill primary branch)
Database
Sprint 1
4
resolveBranchScope middleware
API
Sprint 2
5
PostgreSQL RLS policies
Database
Sprint 2
6
Branch Manager role (#18)
RBAC
Sprint 3
7
dashboard-branch-manager.html
UI (new page)
Sprint 3
8
Header branch selector component
UI (component)
Sprint 3
9
Branch field on Trip Create form
UI (form change)
Sprint 3
10
Voucher branch_id tagging
Database + API
Sprint 4
11
Branch-level P&L report
Reports
Sprint 4
12
Branch filter on 6+ existing reports
Reports
Sprint 4
13
Branches management page
UI (new page)
Sprint 4
14
Vehicle/driver transfer endpoints
API
Sprint 4
15
Integration test suite (scoping, transfers, edge cases)
QA
Sprint 5

Total new UI pages: 2 (Branch Manager Dashboard + Branches Management). Total modified pages: every branch-scoped list page gains the header selector. Total new API endpoints: 8. Total modified endpoints: all list/detail endpoints on 10 branch-scoped modules. Total estimated engineering effort: 10 weeks (5 sprints of 2 weeks each), 2 backend engineers + 1 frontend engineer.
