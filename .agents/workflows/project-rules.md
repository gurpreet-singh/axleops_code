---
description: Project rules and conventions for the AxleOps platform — MUST be read before any task
---

# AxleOps Project Rules & Conventions

> **IMPORTANT**: Read this file before starting any task on the AxleOps codebase.

## 1. Database & Schema Management

### PostgreSQL is the primary database
- **Always use PostgreSQL** for development and testing
- Start backend with: `SPRING_PROFILES_ACTIVE=postgres ./gradlew bootRun`
- Connection: `jdbc:postgresql://localhost:5432/axleops` (user: `axleops`, password: `axleops`)

### DDL Auto Update is ON
- `spring.jpa.hibernate.ddl-auto=update` is enabled
- **Do NOT create Flyway migration scripts for schema changes** — Hibernate auto-syncs entity changes to PostgreSQL on startup
- Existing migration files in `db/migration/` are only for **seed data** (INSERT statements)
- When adding new entities or modifying fields, just update the Java entity — the schema updates automatically

### Seed Data
- Seed data lives in `src/main/resources/db/migration/V9__seed_demo_data.sql`
- Use `INSERT ... ON CONFLICT (id) DO NOTHING` for idempotent inserts (PostgreSQL syntax)
- **Never use H2-specific functions** like `RANDOM_UUID()` or `MERGE INTO` — use `gen_random_uuid()` and `INSERT ... ON CONFLICT`

## 2. Multi-Tenancy Architecture

### Platform Admin vs Tenant Users — SEPARATE CONCEPTS
- **Platform Admins** (`platform_admins` table) manage the AxleOps platform itself (create tenants, assign system admins). They are **NOT** in the `users` table
- **Tenant Users** (`users` table) are employees of transport companies. They always belong to a specific tenant
- Never mix these two user types — they have different entities, repositories, and authentication paths

### Tenant Isolation
- All business entities have a `tenant_id` column
- `TenantContext` (ThreadLocal) manages the current tenant in the backend
- The Gobind Transport tenant (`e9999999-9999-9999-9999-999999999999`) is the primary test environment

## 3. Backend Conventions (Spring Boot)

### Project Structure
```
com.fleetmanagement
├── config/         # Security, CORS, Tenant config
├── controller/     # REST controllers (@RequestMapping)
├── dto/
│   ├── request/    # Incoming request DTOs
│   └── response/   # Outgoing response DTOs
├── entity/         # JPA entities (@Entity)
├── mapper/         # MapStruct mappers
├── repository/     # Spring Data JPA repositories
└── service/        # Business logic (@Service)
```

### Naming & Patterns
- Controllers: `{Entity}Controller.java` → `@RequestMapping("/{entity}")`
- Services: `{Entity}Service.java` → `@Transactional`
- DTOs: `Create{Entity}Request.java`, `{Entity}Response.java`
- Mappers: `{Entity}Mapper.java` with `@Mapper(componentModel = "spring")`
- API base path: `/api/v1/` (set via `server.servlet.context-path`)

### UUID Conventions
- All entity IDs are `UUID` type
- In SQL seed data, use only valid hex characters (0-9, a-f) in UUID strings
- **Never** use non-hex prefixes like `t`, `r`, `u` in UUIDs

## 4. Frontend Conventions (React + Vite)

### RBAC & Role System
- All roles are defined in `src/config/roles.js` (DEPARTMENTS, ROLES, ROLE_MENUS)
- The `platform_admin` role is for Platform Management (multi-tenant administration)
- Adding a new role requires entries in DEPARTMENTS, ROLES, pageToRoute mapping, and ROLE_MENUS

### Sidebar Menu Architecture (v2 — Task-Oriented)
The sidebar uses **10 top-level groups** organized by *what the user is doing*, not by entity type:
1. **Command Center** — Dashboard, Morning Brief, Alerts & Reminders
2. **Trips** — Active, Settled, Archived, Routes & Rates
3. **Fleet** — Vehicles, Vehicle Types, Equipment, Assignments, Documents, Fuel Log
4. **People & Accounts** — Ledger Accounts, Drivers, Employees
5. **Workshop** — Service Records, Job Cards, Inspections, Parts & Stock, Part Fitment History
6. **Billing** — Invoices, Payment Receipts, Aging Analysis
7. **Books** — Chart of Accounts, Voucher Entry, Day Book, Account Ledger, Trial Balance, Financial Statements, Tally Export
8. **Insights** — Route Profitability, Fleet Utilization, Driver Scorecard, Fuel Analytics, Behavioral Losses, Service Level Report
9. **Settings** — Organization, Branches, Users & Roles, Masters, Integrations
10. CSV Import (flat utility item, admin roles only)

Menu items are composed using reusable `MENU.*` factory functions in `roles.js`. Each role gets a curated subset.

### Slider Panel Pattern
- Use `useSliderStore` (Zustand) for all detail/create views
- Open: `const { openSlider } = useSliderStore()` → `openSlider({ title, content, width })`
- Close: `const { closeSlider } = useSliderStore()` → `closeSlider()`
- Slider content components receive data as props + `onSuccess` / `onRefresh` callbacks

### API Services
- All API calls go through `src/services/api.js` (Axios instance with `/api/v1` base URL)
- Create module-specific service files: `src/services/{module}Service.js`

### Page Structure
- Pages live in `src/pages/{module}/`
- List pages: `{Entity}Page.jsx` — table + stats + search + slider triggers
- Detail content: `{Entity}DetailContent.jsx` — slider content with tabs
- Create content: `{Entity}CreateContent.jsx` — slider form content

### Styling
- Global styles: `src/styles/global.css`
- React overrides: `src/styles/overrides.css`
- Use existing CSS classes (`.stat-card`, `.sl-section`, `.sl-row`, `.table-container`, etc.)
- Avoid inline styles for reusable patterns — prefer CSS classes

## 5. Running the Application

### Backend
```bash
cd backend
SPRING_PROFILES_ACTIVE=postgres ./gradlew bootRun
```
Runs on: `http://localhost:8080/api/v1/`

### Frontend
```bash
cd frontend
npm run dev
```
Runs on: `http://localhost:5173/`

### Database Setup (first time)
```bash
brew services start postgresql@17
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
createuser -s axleops
psql -U $(whoami) -d postgres -c "ALTER USER axleops PASSWORD 'axleops';"
createdb -U axleops axleops
```

### Reset Database (if needed)
```bash
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
psql -U axleops -d postgres -c "DROP DATABASE axleops;"
createdb -U axleops axleops
# Then restart backend — Hibernate + Flyway will recreate everything
```
