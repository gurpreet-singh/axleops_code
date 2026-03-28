# Feature Specification: Mobile Role Strategy

**Feature Branch**: `001-mobile-role-strategy`  
**Created**: 2026-03-28  
**Status**: Draft  
**Target Role(s)**: All (architectural) · Driver (v1 implementation)  
**Input**: User description: "Define the role strategy for the AxleOps mobile app — which roles are candidates, why Driver is v1, what is shared vs role-specific, and how the app expands to future roles."

## Clarifications

### Session 2026-03-28

- Q: Should mid-session role switching be supported in v1, and if so, how? → A: Option B — Role switching requires logout + re-login with different role selection. No in-app hot-swap of roles in v1.
- Q: Should mobile block the "ALL" role JWT option and force single-role selection? → A: Option B — If user has only 1 role, auto-select it (no selector shown). If multiple roles, show selector without the "ALL" option.
- Q: What should the role selector display when a user has both mobile-supported and unsupported roles? → A: Option A — Show only mobile-supported roles. Unsupported roles are invisible in the selector. If the user has no supported roles, show an informative message.

---

## User Scenarios & Testing

### User Story 1 — Driver Lands in a Role-Scoped Experience (Priority: P1)

A driver opens the AxleOps mobile app after logging in. The app recognizes the user's role and presents a navigation shell and landing screen tailored exclusively to Driver concerns — active trip, past trips, earnings, and settings. No dispatch, maintenance, or admin features are visible.

**Why this priority**: This is the foundational experience. If the app does not correctly scope navigation and content to the authenticated role, every downstream feature is misaligned. The role-scoped shell is the prerequisite for all Driver v1 work.

**Independent Test**: A tester logs in with a Driver-role account and verifies that only Driver-specific tabs and content are shown. Logging in with a different role (when supported) shows a different shell configuration.

**Acceptance Scenarios**:

1. **Given** a user with only the `DRIVER` role logs in, **When** the app resolves the role, **Then** the app presents the Driver navigation shell (Active Trip, Past Trips, Earnings, Settings tabs) and no other role's features.
2. **Given** a user with the `DRIVER` role logs in, **When** the app renders any screen, **Then** no dispatch, maintenance, admin, or finance features are visible or navigable.
3. **Given** a user with multiple roles (e.g., `DRIVER` and `OPERATIONS_EXECUTIVE`) logs in, **When** the app resolves the role, **Then** the app presents a role selector and scopes the shell to the chosen role.

---

### User Story 2 — Shared Services Work Across Roles (Priority: P1)

Authentication, session management, profile viewing, and settings are shared capabilities that every role uses. These areas must not be duplicated per role — they are part of the common app shell.

**Why this priority**: Shared services are structural prerequisites. If auth or session management is role-specific, the architecture becomes fragmented and unmaintainable.

**Independent Test**: A tester logs in with any role and verifies that login, logout, session expiry handling, and basic profile viewing all work identically regardless of the active role.

**Acceptance Scenarios**:

1. **Given** any authenticated user, **When** they navigate to Settings, **Then** they see profile information, logout, and app version — regardless of their role.
2. **Given** a user's session expires, **When** they attempt any action, **Then** the app redirects to login — with no role-specific variation in this behavior.
3. **Given** a user logs out, **When** they return to the app, **Then** they must re-authenticate — no role retains a stale session.

---

### User Story 3 — Future Role Can Be Added Without Restructuring (Priority: P2)

When a second role (e.g., Dispatch Manager) is approved for mobile, a developer adds a new role configuration entry, a new navigation graph, and new screens for that role. No existing Driver code or shared infrastructure requires changes.

**Why this priority**: If the architecture is not role-extensible from the start, adding the second role becomes a refactoring project instead of a feature addition. This must be validated architecturally in v1 even though no second role ships.

**Independent Test**: A developer creates a stub "Dispatch Manager" role configuration entry and verifies that the app shell can render a distinct tab set for that role without modifying any Driver or shared code.

**Acceptance Scenarios**:

1. **Given** a new role configuration entry is added, **When** a user with that role logs in, **Then** the app renders the role's defined navigation tabs and landing screen.
2. **Given** a new role is added, **When** existing Driver users log in, **Then** the Driver experience is completely unchanged.
3. **Given** no screens exist for a newly registered role, **When** a user with that role logs in, **Then** the app shows a graceful "coming soon" state rather than crashing or showing Driver content.

---

### User Story 4 — Role-Specific Data Visibility is Enforced (Priority: P2)

The Driver sees only their own trips, their assigned vehicle, and their own earnings. When future roles are added, each role sees only the data appropriate to its scope (e.g., Dispatch Manager sees branch-level trips, not personal earnings).

**Why this priority**: Data visibility is a security and UX concern. If the architecture does not separate data queries by role from the start, retrofitting it is error-prone and risky.

**Independent Test**: A Driver user's trip list contains only trips assigned to that driver. No other driver's data or dispatch-level data is visible.

**Acceptance Scenarios**:

1. **Given** a Driver is logged in, **When** they view trips, **Then** only trips where they are the assigned driver are shown.
2. **Given** a Driver is logged in, **When** they view earnings, **Then** only their personal ledger entries are shown.
3. **Given** role-based data queries are implemented, **When** the underlying data source is swapped from mock to real, **Then** the same role-scoping contract is preserved — the UI and domain layer require no changes.

---

### User Story 5 — API Strategy Adapts to Backend Readiness per Role (Priority: P2)

The app consumes real backend APIs where they exist and uses mock-backed derived contracts where they do not. Each role's data needs may have different backend readiness levels. The architecture supports per-feature, per-role source switching without affecting the app's user experience.

**Why this priority**: Mobile must ship Driver v1 while many backend APIs are missing. The mock strategy must be structurally clean so that it scales to future roles without accumulating technical debt.

**Independent Test**: A tester switches a feature from mock to real data source (or vice versa) via a build flag or debug toggle, and the app behaves identically from the user's perspective.

**Acceptance Scenarios**:

1. **Given** a feature is backed by a mock data source, **When** the real backend endpoint becomes available, **Then** swapping data sources requires only changing a configuration/DI binding — no UI or domain logic changes.
2. **Given** a feature is in mock mode, **When** QA edits the mock JSON fixture, **Then** the app reflects the changed data on next load.
3. **Given** multiple features have different data source modes (some mock, some real), **When** the user navigates across them, **Then** the experience is seamless — there is no visible distinction between mock-backed and real-backed features.

---

### Edge Cases

- What happens when a user has no roles assigned? → App shows an informative error state after login, not a crash or blank screen.
- What happens when a user has a role not yet supported by the mobile app? → The role is not shown in the role selector. If none of the user's roles are mobile-supported, the app shows a clear message: "Your role is not yet available on mobile. Please use AxleOps web."
- What happens when the backend returns a role identifier that the mobile app does not recognize? → The app handles unknown roles gracefully (ignore and show available roles, or show an unsupported-role message).
- What happens when the backend role-selection endpoint fails? → The app retries or shows an error with a retry option; it does not proceed with an unscoped session.
- What happens when a multi-role user wants to switch roles mid-session? → The app does not support in-app role switching in v1. The user must logout and re-login, selecting the desired role during login. This avoids complex state cleanup and matches the backend's JWT model where `POST /auth/select-role` issues a new token.

---

## Requirements

### Functional Requirements

#### Role Model

- **FR-001**: The app MUST define a role model that maps each supported mobile role to its navigation structure, feature set, and data visibility scope.
- **FR-002**: The Driver role MUST be the only role with implemented screens and features in v1. All other roles MUST be deferred.
- **FR-003**: The role model MUST support representing future candidate roles — Dispatch Manager (mapped to `OPERATIONS_EXECUTIVE` backend role), Workshop Manager, Mechanic, Branch Manager — without implementing their features.
- **FR-004**: The app MUST resolve the user's active role at login and scope the entire session to that role. If the user has exactly one role, the app MUST auto-select it without showing a role selector.
- **FR-005**: If a user has multiple mobile-supported roles, the app MUST present a role selector before navigating to the role-scoped shell. The selector MUST show only roles that mobile supports (i.e., roles with a registered `RoleConfig`). The `"ALL"` role option MUST NOT be presented. Unsupported backend roles are filtered out and invisible in the selector.

#### Shared vs Role-Specific App Structure

- **FR-006**: The app MUST use a common authenticated shell that hosts role-specific navigation and content areas.
- **FR-007**: The following app areas MUST be shared across all roles:
  - Authentication (login, logout, session management)
  - Role selection (for multi-role users)
  - Profile viewing
  - App settings and version info
  - Error, loading, and empty state handling patterns
  - Design system (theme, typography, spacing, components)
- **FR-008**: The following app areas MUST be role-specific:
  - Navigation tab configuration (which tabs appear and in what order)
  - Landing/home screen content
  - Feature screens (e.g., Active Trip, Earnings for Driver; Fleet Map for Dispatch Manager)
  - Data queries and visibility scope
  - Role-specific empty-state messaging
- **FR-009**: Navigation MUST be driven by a role configuration registry, not by conditional logic scattered across the codebase.

#### Role-Extensible Architecture

- **FR-010**: Adding a new role MUST require only:
  1. A new role configuration entry (defining tabs, feature set, landing screen)
  2. New screen implementations for that role's features
  3. A new navigation graph for that role
  4. Reuse of existing shared domain models, repositories, and data layer — no duplication
- **FR-011**: Adding a new role MUST NOT require changes to existing role configurations, shared infrastructure, or any other role's screens.
- **FR-012**: The app MUST support a "coming soon" or "unsupported" state for roles that are registered but have no implemented screens.

#### API & Data Strategy

- **FR-013**: The app MUST consume existing backend APIs directly where they are available (auth endpoints, trip read, vehicle read, contact read).
- **FR-014**: Where backend APIs are incomplete, the app MUST define derived API contracts based on the current backend domain model (entities, services, naming conventions) and initially back them with local mock responses.
- **FR-015**: Derived contracts MUST be documented with endpoint shape, source rationale, and a link to the backend entity/service they were derived from.
- **FR-016**: The architecture MUST allow replacing a mock data source with a real API implementation by changing only the data-source binding — no UI or domain logic changes.
- **FR-017**: Each feature's data source mode (real, mock, or hybrid) MUST be independently configurable.
- **FR-018**: Mock data MUST be realistic, spec-consistent, and editable by QA via JSON fixture files without code changes.

#### v1 Scope Decision

- **FR-019**: V1 MUST implement only the Driver role surface. The four Driver tabs are: Active Trip, Past Trips, Earnings, and Settings.
- **FR-020**: V1 MUST NOT implement screens or features for Dispatch Manager, Workshop Manager, Mechanic, Branch Manager, or any other role.
- **FR-021**: V1 MUST establish the role-extensible architecture (role registry, per-role navigation, shared shell) even though only one role is implemented.

### Key Entities

- **Role Configuration**: A mapping of role identifier → navigation tabs, feature set, landing screen, and data visibility scope. Drives the entire app shell for a given user session.
- **User Session**: The authenticated user context including identity, tenant, branch, active role, and associated authorities. Determines what the user can see and do.
- **Data Source Configuration**: A per-feature mapping of which data source mode (real, mock, hybrid) is active. Enables incremental backend integration without app-wide coupling.
- **Derived Contract**: A documented API contract shape that does not yet exist in the backend but is derived from the backend's domain model. Backed by mock responses until the real endpoint ships.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A Driver user sees only Driver-relevant navigation and content within 2 seconds of login completion.
- **SC-002**: Adding a new role (stub configuration + empty screens) takes less than 1 day of developer effort and requires zero changes to existing Driver code or shared infrastructure.
- **SC-003**: Swapping a feature from mock to real data source requires changing only the data-source binding — verified by demonstrating zero diff in UI or domain code when the swap occurs.
- **SC-004**: QA can alter mock data scenarios (e.g., empty trip list, multiple trips, error states) by editing JSON fixture files with no code changes and no rebuild required beyond a standard re-launch.
- **SC-005**: 100% of app screens handle all four UX states (loading, empty, error, data-loaded) for every authenticated role.
- **SC-006**: Users with unsupported or unrecognized roles see a clear informative message — zero crashes or blank screens occur.

---

## Assumptions

- The existing backend role enum (`DRIVER`, `OPERATIONS_EXECUTIVE`, `WORKSHOP_MANAGER`, `MECHANIC`, `BRANCH_MANAGER`, etc.) is the source of truth for role identifiers. Mobile role configuration keys map directly to these backend values.
- The existing `POST /auth/select-role` endpoint works correctly for mobile and returns a role-scoped JWT. No mobile-specific auth changes are needed.
- "Dispatch Manager" on mobile maps to the existing `OPERATIONS_EXECUTIVE` backend role. There is no need for a new backend role.
- The Driver is the correct v1 role because:
  1. Drivers are the only role that *must* operate from a mobile device in the field.
  2. All other roles have adequate web access today.
  3. Driver trip execution is the highest-value mobile workflow — it unlocks real-time milestone capture, POD, and evidence collection.
  4. Starting with Driver avoids scope bloat and focuses delivery on one tight, high-value user journey.
- Backend API gaps (driver-scoped queries, trip transitions, milestones, POD, driver ledger, etc.) are well-documented in the mobile discovery analysis and will be bridged via the mock-backed derived contract strategy.
- The constitution (v3.0.0) principles — especially II (Role-Scoped Design), III (Closest-Contract API Strategy), and VIII (Testability & Switchability) — govern all implementation decisions downstream of this spec.
- Offline support is deferred from v1 but the architecture MUST NOT preclude it.
- Multi-stop trip templates and Hazmat-specific features are deferred from v1.
- Push notifications are deferred from v1; the app may use polling as an interim strategy.

---

## Deferred Items (Explicitly Out of Scope for v1)

| Item | Reason for Deferral |
|------|---------------------|
| Dispatch Manager role implementation | Driver-first strategy; architecture supports future addition |
| Workshop Manager / Mechanic role implementation | Maintenance workflows not yet proven mobile-worthy |
| Branch Manager role implementation | Primarily a dashboard role; web may suffice |
| Franchise Partner role implementation | Limited mobile surface; web adequate today |
| Real-time GPS tracking service | Infrastructure-heavy; v1 captures GPS at transitions only |
| Offline milestone capture & sync | Architecturally significant; deferred but not blocked |
| Multi-stop trip templates | Template complexity deferred to post-v1 |
| Hazmat-specific features | Specialized; deferred |
| Push notification infrastructure | Requires FCM/APNs setup; polling is interim |
| Branch-switching UI | Branch scoping not fully settled in backend |
| EWB management (driver actions) | System-automated, driver view-only in v1 |
| Maintenance work orders (except breakdown report) | Workshop domain, not Driver v1 |
| Trip creation | Ops/dispatch function, not Driver |

---

## Role Candidate Summary

| Role | Backend Role Enum | Mobile Relevance | Timeline | Rationale |
|------|-------------------|------------------|----------|-----------|
| **Driver** | `DRIVER` | 🟢 Core — field-first role, must be mobile | **v1** | Only role that operates from the field on a phone; highest-value mobile workflow |
| **Dispatch Manager / Ops Executive** | `OPERATIONS_EXECUTIVE` | 🟡 High — trip management, fleet visibility | v2 | Trip assignment, live fleet map, exception handling; web adequate for now |
| **Workshop Manager** | `WORKSHOP_MANAGER` | 🟡 Medium — work order queue | v3 | Mobile useful but not critical; web sufficient today |
| **Mechanic** | `MECHANIC` | 🟡 Medium — WO execution in workshop | v3 | Field-adjacent but workshop-based, not truly mobile-first |
| **Branch Manager** | `BRANCH_MANAGER` | 🔴 Low — primarily dashboards | v4+ | Dashboard role; web is the better surface |
| **Franchise Partner** | N/A (future) | 🔴 Low — limited mobile surface | v4+ | Revenue/settlement viewing; web adequate |

---

## Data/API Dependencies by Role

| Dependency Area | Driver (v1) | Dispatch Manager (future) | Workshop Manager (future) |
|-----------------|-------------|---------------------------|---------------------------|
| Auth & session | Real API ✅ | Real API ✅ | Real API ✅ |
| Role selection | Real API ✅ | Real API ✅ | Real API ✅ |
| Trip read (all tenant) | Real API ✅ | Real API ✅ | N/A |
| Trip read (role-scoped) | Mock 🟠 (driver-scoped query missing) | TBD (branch-scoped) | N/A |
| Trip state transitions | Mock 🟠 | TBD (dispatch actions) | N/A |
| Milestones | Mock 🟠 | View-only (TBD) | N/A |
| POD capture/upload | Mock 🟠 | View-only (TBD) | N/A |
| Driver ledger/earnings | Mock 🟠 | N/A | N/A |
| Vehicle read | Real API ✅ | Real API ✅ | Real API ✅ |
| Contact/profile read | Real API ✅ | Real API ✅ | Real API ✅ |
| Work orders | N/A | N/A | TBD (future) |
| Inspections (DVIR) | Mock 🟠 | N/A | TBD |
| Fleet map / live tracking | N/A | TBD (future) | N/A |
| Push notifications | Deferred (polling) | TBD | TBD |
| File upload | Mock 🟠 | TBD | TBD |
