# Backend Architecture Specification: AxleOps (Spring Boot)

## 1. Executive Summary
This document defines the backend architecture required to power the AxleOps platform. Moving from a static demo to a production-grade system requires implementing a highly secure, multi-tenant capable, branch-scoped Spring Boot application backed by PostgreSQL. The system integrates tightly with complex business rules, such as accounting Tally-grade ledger generation and the 10-milestone Trip Lifecycle.

## 2. Technology Stack
*   **Framework**: Spring Boot 3.x (Java 17 or Kotlin)
*   **Database**: PostgreSQL 15+
*   **ORM / Data Access**: Spring Data JPA / Hibernate (for entities) + JOOQ or JdbcTemplate (for complex analytical queries like P&L or fleet operational utilization).
*   **Security**: Spring Security + JWT for stateless API authentication.
*   **Migrations**: Flyway or Liquibase for managing schema changes (e.g., enforcing RLS policies).
*   **Caching**: Redis (via Spring Cache) for caching user roles, branch configurations, and frequent lookups (e.g., Chart of Accounts).
*   **Task Scheduling**: Quartz or Spring `@Scheduled` configuration for background crons (e.g., E-Way Bill expiry checkers, service reminder generators).

## 3. Database Architecture & Core Concepts

### 3.1 Multi-Tenancy & Branch Scoping
As defined in `accounting_spec.md`, the platform relies heavily on **Branch Isolation**.
*   **Schema level**: Each table will have `tenant_id` and `branch_id` (where applicable).
*   **PostgreSQL RLS**: Implement Row Level Security (RLS) policies at the database user session level to physically isolate branch data. The Spring Boot application must set database parameters (`set_config('app.current_user_id', ...)`) for each transaction.

### 3.2 Key Entity Mappings
Data entities are mapped based on the specs:
*   **Trip Management**: `Trip`, `TripMilestone`, `TripException`, `POD`, `EWayBillRecord`.
*   **Vehicle & MRO**: `Vehicle`, `WorkOrder`, `ServiceTask`, `Inspection`, `Issue`.
*   **Financials (Tally-Grade)**: `Ledger`, `Voucher`, `Invoice`, `RouteContract`, `PurchaseOrder`.
    *   *Rule*: Vouchers are tagged with `branch_id`, NOT duplicated per branch.

## 4. Architectural Patterns

### 4.1 Domain-Driven Design (DDD) Boundaries
The backend will be modularized into bounded contexts to avoid a monolithic tangle:
1.  **Core Context**: Users, Roles, Branches, RBAC.
2.  **Fleet Context**: Vehicles, Equipment, Compliance, Drivers.
3.  **Operations Context**: Routes, Trips, Dispatching, GPS Checkpoints.
4.  **Maintenance Context**: Inspections, Issues, Work Orders, Parts Inventory.
5.  **Billing & Accounting Context**: Contracts, Tally Ledgers, Vouchers, Invoices, Driver Settlements.

### 4.2 State Machine for Trip Lifecycle
The Trip entity possesses over 20 states and 13 exceptions.
*   **Implementation**: Use **Spring State Machine** or a rigorous custom State Pattern.
*   Each transition triggers specific side-effects (e.g., `trip.pod_verified` triggers `InvoiceEligibilityEvent`, `RevenueRecognitionVoucherEvent`).
*   Transitions must write an immutable log to an `audit_trail` table.

## 5. API Design & Security

### 5.1 RESTful Conventions
*   Base URL pattern: `/api/v1/{module}/...`
*   Pagination and Filtering: Standardized Pageable endpoints with QueryDSL for complex multi-column filtering requested on the UI (e.g., filtering Trips by Client + Status + Branch).

### 5.2 Branch Middleware (WebFilter)
*   A `BranchScopeFilter` intercepts `X-AxleOps-Branch` from headers.
*   It checks the JWT token claims (or Redis cache) to verify the user has access to this branch.
*   The scoped branch context is stored in a `ThreadLocal` or Spring Security Context, applied to all subsequent repository queries.

### 5.3 Exception Handling
*   `@ControllerAdvice` will translate Domain Exceptions (e.g., "Vehicle's insurance is expired", "Trip margin is below contract floor") into standardized JSON Error Responses (HTTP 409 Conflict or 400 Bad Request) with actionable validation details.

## 6. Critical Integrations

### 6.1 E-Way Bill (NIC GSP API)
*   **Sub-process**: An asynchronous worker manages the E-Way bill lifecycle (`PENDING_GENERATION` -> `GENERATED`).
*   Uses a `RestTemplate` or `WebClient` to abstract the GSP provider (e.g., ClearTax API).
*   Records full HTTP audit trails in `EWayBillRecord`.

### 6.2 Accounting Journal Generation
*   **Rule Engine**: A financial event publisher listens to trip milestones. When a trip is finalized, it auto-generates double-entry vouchers (e.g., Dr. Receivables, Cr. Freight Revenue; Dr. Fuel Expense, Cr. Vendor Payable/Cash).
*   Maintains the strict rule that Branch P&L is queried by dynamically grouping these vouchers based on their `branch_id` tags.

## 7. Background Jobs (Cron)
*   **EWB Expiry Monitor**: Runs every 30 minutes, flags trips where `validity` is < 6 hours.
*   **Service & Compliance Reminders**: Nightly job scanning `Vehicle` odometers and document expiry dates to trigger new `Reminders` or block dispatch functions.
*   **SLA Monitor**: Continuous background thread checking active trips against `RouteContract` SLA deadlines to auto-generate `DELAYED` alerts.
