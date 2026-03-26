# AxleOps Demo Application - Deep Analysis

## 1. Entities, Attributes, and Relationships

### Core Organization & Access
*   **Branch**: `id`, `name`, `city`, `state`, `manager_id`, `address`, `status`, `is_primary`, `created_at`. (One-to-Many with Vehicles, Drivers, Trips)
*   **User**: `id`, `first_name`, `last_name`, `email`, `phone`, `role`, `title`, `branch_id`.
*   **Role**: Enum (Owner, Fleet Manager, Operations Exec, Driver, Finance Controller, etc.)

### Fleet & Operations
*   **VehicleType**: `id`, `name`, `code`, `cv_class`, `nhai_toll_category`, `axle_count`, `gvw_range`, `payload_capacity`, `body_type`, `fuel_type`, `avg_kmpl_min`, `avg_kmpl_max`, `license_class`, `status`. (One-to-Many with Vehicle, Route)
*   **Vehicle**: `id`, `name`, `status`, `year`, `make`, `model`, `chassis_no`, `license_plate`, `group`, `meter`, `operator_id`, `branch_id`, `vehicle_type_id`, `compliance_status`. (One-to-Many with WorkOrder, Issue, Trip)
*   **Equipment**: `id`, `name`, `type`, `serial_number`, `status`, `assigned_vehicle_id`, `branch_id`.
*   **Contact/Driver**: `id`, `name`, `email`, `phone`, `role`, `assigned_vehicle_id`, `branch_id`, `type`. Has Licenses, Certifications, Training Records, Performance Reviews.
*   **Place**: `id`, `name`, `type`, `address`, `lat`, `lng`.

### CRM & Routing
*   **Client**: `id`, `name`, `industry`, `gst_number`, `status`. (One-to-Many with Route, RouteContract, Trip, Invoice)
*   **Route**: `id`, `client_id`, `vehicle_type_id`, `name`, `origin_city`, `destination_city`, `distance_km`, `toll_estimate`, `diesel_estimate_litres`, `branch_id`, `stops`.
*   **RouteContract**: `id`, `route_id`, `billing_type`, `rate`, `sla_hours`, `min_margin_pct`, `demurrage_rate`, `status`.

### Trip Management
*   **Trip**: `id`, `client_id`, `route_id`, `route_contract_id`, `vehicle_id`, `driver_id`, `branch_id`, `subcontractor_id`, `status` (Created, In Transit, Completed, Settled), `scheduled_start`, `cargo_weight`, `consignment_value`. (One-to-Many with TripMilestone, Expense, Voucher).
*   **TripMilestone**: `id`, `trip_id`, `milestone_type`, `sequence_number`, `status`, `started_at`, `completed_at`, `location_gps`.
*   **EWayBillRecord**: `id`, `ewb_number`, `trip_id`, `status`, `generated_at`, `valid_until`.
*   **POD**: `id`, `trip_id`, `pod_type`, `consignee_name`, `received_quantity`, `is_verified`.

### Maintenance & Inventory
*   **Inspection**: `id`, `vehicle_id`, `form_type`, `inspector_id`, `result`, `date`.
*   **Issue**: `id`, `vehicle_id`, `summary`, `priority`, `status`, `reported_by`.
*   **WorkOrder**: `id`, `vehicle_id`, `status`, `priority`, `total_cost`, `issue_date`, `assigned_to`.
*   **ServiceTask**: `id`, `name`, `description`, `avg_cost`.
*   **Part**: `id`, `name`, `part_number`, `category`, `location`, `in_stock`, `min_qty`, `unit_cost`.
*   **PurchaseOrder**: `id`, `vendor_id`, `status`, `date`, `total`.
*   **Vendor**: `id`, `name`, `type`, `contact`, `phone`.

### Financials & Accounting
*   **Expense**: `id`, `vehicle_id`, `category`, `amount`, `date`, `vendor_id`, `status`.
*   **Invoice**: `id`, `client_id`, `amount`, `status` (Draft, Sent, Partial, Paid), `due_date`.
*   **Ledger**: `id`, `code`, `name`, `tally_group`, `normal_balance`.
*   **Voucher**: `id`, `type`, `date`, `debit_ledger_id`, `credit_ledger_id`, `amount`, `trip_id`, `vehicle_id`, `branch_id`.

---

## 2. Pages/Screens

### Dashboards (Role-specific)
*   `dashboard-owner`: High-level KPIs, profitability, alerts.
*   `dashboard-fleet-manager`: Vehicle utilization, trip statuses.
*   `dashboard-driver`: Active trip, fuel logging, POD upload.
*   `dashboard-finance`, `dashboard-shop-manager`, `dashboard-inventory`, `dashboard-compliance`, etc.

### Core Modules
*   **Trips**: `trips` (List/Kanban), `trip-detail` (Tabs: Overview, Exceptions, Financials, Milestones), `trip-create` (Multi-step wizard), `trip-profitability`.
*   **Vehicles**: `vehicle-list`, `vehicle-detail` (13 tabs), `vehicle-compliance`, `vehicle-assignments`, `meter-history`, `expense-history`, `vehicle-types`.
*   **Contacts**: `contacts`, `contact-detail`, `driver-ledger`.
*   **Clients & Billing**: `clients`, `client-detail`, `invoices`.
*   **Routes**: `routes`, `route-detail`.
*   **MRO**: `inspections`, `inspection-detail`, `issues`, `reminders`, `work-orders`, `work-order-new`, `work-order-create`, `service-tasks`, `service-programs`, `shop-directory`.
*   **Inventory**: `parts-list`, `part-detail`, `purchase-orders`, `vendors`.
*   **Accounting**: `chart-of-accounts`, `voucher-entry`, `day-book`, `profit-loss`, `balance-sheet`, `cash-flow`.
*   **Organization**: `branches`, `partners`, `subcontractors`.
*   **System**: `trip-alerts`, `reports`, `settings`, `user-management`.

---

## 3. Business Rules and Workflows

1.  **Trip Lifecycle (Operations)**: 10-milestone flow from 'Created' to 'Settled'. Cannot proceed without required validations (e.g., EWB if value > ₹50K, POD verification).
2.  **Accounting Automation**: Completing a trip generates automated journal vouchers (Revenue Recognition, Fuel Expense, Driver Advance). Settlement creates accounts payable/receivable.
3.  **Compliance Blocking**: Vehicles with expired insurance, permits, or licenses are physically blocked from being dispatched to a trip.
4.  **Route & Contracts**: "Route" is the operational entity (Distance, Toll, Diesel). "Route Contract" is the financial entity (Rate, SLA, Margins). A trip inherits from both.
5.  **Margin Floor Warnings**: Trip creation warns if estimated profitability is below the contract's minimum margin.
6.  **Multi-Tenancy/Branch Scoping**: Ledgers are global, but Vouchers are tagged with `branch_id`. Branch P&L is derived by filtering Vouchers. Users have access scoped by their Branch and Role.
7.  **Alert Engine**: Anomalies (delay > 2h, fuel efficiency drop, expense overrun) trigger critical/warning alerts with configurable notification targets.
8.  **Work Order Flow**: Issues can be converted into Work Orders; Work Orders consume Parts (reducing inventory) and track Labor.

---

## 4. Mapping Demo to Planned Stack

### Frontend (React + Vite + Tailwind)
*   **Routing**: `React Router v6`. Each HTML page maps to a Route.
*   **State Management**: `Zustand` for global UI state (Slider panel, Active Role/Branch). `React Query` for all API caching.
*   **Layouts**: `AppShell` with dynamic `Sidebar` (based on role) and `TopHeader`. Global `RightSlider` component for detail views.
*   **Components**: Reusable Tailwind components for DataTables, StatusBadges, StatCards, Timelines, Kanbans, and complex Modals. `React Hook Form + Zod` for forms like Trip Create and Work Order Create.

### Backend (Spring Boot + PostgreSQL)
*   **Controllers**: REST API for all entities (`/api/v1/trips`, `/api/v1/vehicles`, etc.).
*   **Security**: `Spring Security + JWT`. Filters check role and branch context (`X-AxleOps-Branch`).
*   **Services**: Encapsulate logic. State machine for Trip lifecycle, Vouchers generation via Event Listeners (`trip.settled` event).
*   **Data Access**: `Spring Data JPA` with `Flyway` migrations. Auditing via `@CreatedDate`, `@LastModifiedDate`.
*   **DTOs & Mappers**: `MapStruct` for Entity <-> DTO. Jakarta Validation mirroring frontend Zod schemas.
*   **Database**: PostgreSQL schema enforcing FKs, constraints, and potentially RLS for branch isolation.

### Infrastructure (Docker)
*   `docker-compose.yml` defining `frontend`, `backend`, and `postgres` containers. Dev configs with hot-reload.
