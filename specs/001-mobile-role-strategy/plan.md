# Implementation Plan: Mobile Role Strategy

**Branch**: `001-mobile-role-strategy` | **Date**: 2026-03-28 | **Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md)  
**Input**: Feature specification from `/specs/001-mobile-role-strategy/spec.md`  
**Design**: [mobile-role-strategy.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-role-strategy.md) · [role-shells.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md) · [mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md)

## Summary

Define the role-extensible architecture for the AxleOps mobile app, implementing the Driver v1 shell while ensuring future roles (Operations Executive, Workshop Manager, Mechanic) can be added via configuration rather than restructuring. This plan covers: role-aware app shell, shared vs role-specific navigation, role resolution/bootstrap, shared domain/data layer, closest-contract API definitions by role, and mock-vs-real switching.

---

## Technical Context

**Language/Version**: Kotlin 2.0+ (KMP — Kotlin Multiplatform)  
**Primary Dependencies**: Compose Multiplatform (UI), Koin (DI), Ktor (networking), Voyager or Decompose (navigation)  
**Storage**: Not directly applicable to role strategy; deferred to feature specs  
**Testing**: Kotlin Test (`commonTest`), Compose UI testing  
**Target Platform**: Android (API 26+) + iOS (16+) via KMP  
**Project Type**: Mobile app (cross-platform)  
**Performance Goals**: Role resolution + shell render < 2 seconds post-login (SC-001)  
**Constraints**: All code in `/mobile/**`; KMP shared-first architecture  
**Scale/Scope**: 1 role in v1. Architecture validated for 4–5 roles. ~15 screens in Driver v1.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Existing-System-First | ✅ Pass | Role model derived from existing `ROLES` config in `roles.js` and backend `Role` enum. No new behavior invented. |
| II | Role-Scoped Design | ✅ Pass | Spec targets Driver as v1. Header metadata states target roles. Navigation, data visibility, and UX are scoped to Driver. |
| III | Closest-Contract API Strategy | ✅ Pass | API dependency matrix identifies real vs mock per feature. Derived contracts follow backend naming conventions. |
| IV | Backend-Gap Transparency | ✅ Pass | Gaps documented in spec's Data/API Dependencies table. Mock-backed items are explicitly marked. |
| V | State-Machine Fidelity | ✅ Pass (N/A for this epic) | This epic defines shell/navigation, not trip state transitions. Trip lifecycle compliance deferred to Driver Active Trip feature spec. |
| VI | Scoped Change Discipline | ✅ Pass | All implementation within `/mobile/**`. No FE/BE changes. |
| VII | Production-Grade Field UX | ✅ Pass | Spec requires all screens to handle Loading/Empty/Error/DataLoaded (SC-005). UX design docs define empty states per role. |
| VIII | Testability & Switchability | ✅ Pass | Mock/real per-feature toggle is a core requirement (FR-016, FR-017). Debug overlay in non-production builds. |
| IX | Reviewability | ✅ Pass | Plan produces small, task-sized slices. Each slice < 300 LOC changed. |

**Gate result**: All 9 principles satisfied. No violations to justify.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-mobile-role-strategy/
├── spec.md                  # Feature specification (complete)
├── plan.md                  # This file
├── research.md              # Phase 0 output
├── data-model.md            # Phase 1 output
├── contracts/               # Phase 1 output (derived contracts)
└── tasks.md                 # Phase 2 output (via /speckit.tasks)
```

### Source Code (mobile)

```text
mobile/
├── shared/src/commonMain/kotlin/com/axleops/mobile/
│   ├── role/                          # ← NEW: Role model
│   │   ├── model/
│   │   │   ├── AppRole.kt            # Role enum (DRIVER, OPS_EXEC, etc.)
│   │   │   └── RoleConfig.kt         # Tab set, landing, icon per role
│   │   ├── registry/
│   │   │   └── RoleRegistry.kt       # Registry of all RoleConfigs
│   │   └── resolution/
│   │       └── RoleResolver.kt       # Login → role selection → scoped session
│   │
│   ├── navigation/                    # ← NEW: Navigation framework
│   │   ├── AppNavHost.kt             # Root nav host (pre-auth + auth shell)
│   │   ├── AuthShell.kt              # Authenticated shell (top bar + tab bar + content)
│   │   ├── TabDefinition.kt          # Tab data class (id, label, icon, navGraph)
│   │   └── driver/                   # Driver-specific nav graph
│   │       └── DriverNavGraph.kt
│   │
│   ├── auth/                          # ← NEW: Auth / session
│   │   ├── model/
│   │   │   └── UserSession.kt        # User + role + token + authorities
│   │   ├── repository/
│   │   │   ├── AuthRepository.kt     # Interface
│   │   │   └── RealAuthRepository.kt # Real impl (Ktor)
│   │   └── viewmodel/
│   │       └── AuthViewModel.kt
│   │
│   ├── data/                          # ← NEW: Data source strategy
│   │   ├── DataSourceMode.kt         # Enum: REAL, MOCK, HYBRID
│   │   └── DataSourceConfig.kt       # Per-feature mode mapping
│   │
│   └── di/                            # ← NEW: Koin DI modules
│       ├── AppModule.kt              # Root DI module
│       ├── AuthModule.kt             # Auth bindings
│       └── DataSourceModule.kt       # Mock/real bindings per feature
│
├── shared/src/commonMain/composeResources/files/mocks/
│   └── *.json                         # Mock JSON fixtures (QA-editable)
│
├── composeApp/src/androidMain/        # Android entry point
└── iosApp/                            # iOS entry point
```

**Structure Decision**: KMP shared-first. All role model, navigation framework, auth, and data-source logic lives in `shared/src/commonMain/`. Platform-specific code only for entry points and platform APIs (camera, GPS). The `com.axleops.mobile` package replaces the scaffold `org.example.project`.

---

## Decisions: Now vs Deferred

### Decisions Needed Now

| # | Decision | Resolution |
|---|----------|------------|
| D1 | Role enum names | Match backend exactly: `DRIVER`, `OPERATIONS_EXECUTIVE`, `WORKSHOP_MANAGER`, `MECHANIC`, `BRANCH_MANAGER` |
| D2 | RoleConfig structure | `roleId`, `label`, `icon`, `tabs: List<TabDefinition>`, `landingTab: String` |
| D3 | Tab bar model | Bottom tab bar. Tabs from RoleConfig. 3–5 tabs. Settings always last. |
| D4 | Driver v1 tabs | Active Trip, Past Trips, Earnings, Settings (4 tabs) |
| D5 | Role selector behavior | Single role → auto-select. Multiple roles → show selector (mobile-supported only, no "ALL"). |
| D6 | Role switching | Logout + re-login. No in-app hot-swap in v1. |
| D7 | "ALL" JWT | Blocked on mobile. Not presented to users. |
| D8 | Unsupported role handling | Filtered from selector. If no supported roles → "not available on mobile" message. |
| D9 | Nav framework choice | Evaluate Voyager vs Decompose in Phase 0 research. Both are KMP-native. |
| D10 | DI framework | Koin (already established in mobile discovery analysis). |
| D11 | Mock fixture location | `shared/src/commonMain/composeResources/files/mocks/` — accessible to QA, excluded from prod. |

### Decisions Deferred Until Future Roles

| # | Decision | Why Deferred |
|---|----------|-------------|
| DF1 | Ops Executive tab structure | Not implementing in v1; projection exists in UX docs |
| DF2 | Workshop/Mechanic tab structure | Same as above |
| DF3 | Branch-scoped data queries | Backend branch scoping not settled |
| DF4 | Cross-role deep linking | Complex; each tab is self-contained in v1 |
| DF5 | Role-specific notification channels | Requires push infrastructure (deferred) |
| DF6 | Role-specific onboarding flows | Not needed for v1 Driver |

---

## Architecture: Role-Aware App Shell

### Layer Model

```
┌──────────────────────────────────────┐
│  AppNavHost (root)                   │
│  ├── Pre-Auth Graph                  │
│  │   ├── LoginScreen                 │
│  │   └── RoleSelectorScreen          │
│  └── Auth Shell                      │
│      ├── TopBar (shared structure)   │
│      ├── ContentArea (role NavGraph)  │
│      └── BottomTabBar (role tabs)    │
└──────────────────────────────────────┘
```

### Role Resolution Flow

```
App Launch
    │
    ▼
LoginScreen ──→ POST /auth/login ──→ AuthResponse { user, roles[] }
    │
    ├── 0 mobile-supported roles ──→ "Not available on mobile" screen
    ├── 1 mobile-supported role  ──→ auto-select ──→ POST /auth/select-role
    └── 2+ mobile-supported roles ──→ RoleSelectorScreen ──→ POST /auth/select-role
                                                │
                                                ▼
                                      UserSession { user, activeRole, jwt, authorities }
                                                │
                                                ▼
                                      RoleRegistry.getConfig(activeRole)
                                                │
                                                ▼
                                      AuthShell renders:
                                        • TopBar with role label
                                        • BottomTabBar from RoleConfig.tabs
                                        • ContentArea with role's NavGraph
```

### RoleConfig Registry (Pseudocode)

```kotlin
enum class AppRole(val backendValue: String) {
    DRIVER("DRIVER"),
    OPERATIONS_EXECUTIVE("OPERATIONS_EXECUTIVE"),
    WORKSHOP_MANAGER("WORKSHOP_MANAGER"),
    MECHANIC("MECHANIC"),
    BRANCH_MANAGER("BRANCH_MANAGER");
}

data class TabDefinition(
    val id: String,
    val label: String,
    val icon: IconResource,
    val navGraph: NavGraph,  // role-specific navigation graph
    val badgeEnabled: Boolean = false
)

data class RoleConfig(
    val role: AppRole,
    val label: String,
    val icon: IconResource,
    val tabs: List<TabDefinition>,
    val landingTab: String  // id of the tab selected on entry
)

object RoleRegistry {
    private val configs: Map<AppRole, RoleConfig> = mapOf(
        AppRole.DRIVER to RoleConfig(
            role = AppRole.DRIVER,
            label = "Driver",
            icon = Icons.IdCard,
            landingTab = "active-trip",
            tabs = listOf(
                TabDefinition("active-trip", "Active Trip", Icons.Route, DriverActiveTripNavGraph),
                TabDefinition("past-trips", "Past Trips", Icons.ClockHistory, DriverPastTripsNavGraph),
                TabDefinition("earnings", "Earnings", Icons.Wallet, DriverEarningsNavGraph),
                TabDefinition("settings", "Settings", Icons.Gear, SharedSettingsNavGraph),
            )
        )
        // Future roles registered here — no changes to Driver or shared code
    )

    fun getConfig(role: AppRole): RoleConfig? = configs[role]
    fun supportedRoles(): Set<AppRole> = configs.keys
}
```

Adding a future role (e.g., Operations Executive) requires:
1. Add entries in `RoleRegistry.configs` map
2. Create `OpsExecActivTripsNavGraph`, `OpsExecFleetMapNavGraph`, etc.
3. Implement the screens referenced by those NavGraphs
4. Zero changes to `AuthShell`, `BottomTabBar`, Driver code, or shared infra

---

## Shared vs Role-Specific Navigation Strategy

### Shared Components (Built Once, Used by All Roles)

| Component | Purpose | Changes When Adding a Role? |
|-----------|---------|----------------------------|
| `AppNavHost` | Root navigation host | Never |
| `LoginScreen` | Authentication | Never |
| `RoleSelectorScreen` | Multi-role picker | Never (reads from RoleRegistry) |
| `AuthShell` | Top bar + tab bar + content hosting | Never (configurable via RoleConfig) |
| `BottomTabBar` | Renders tabs from RoleConfig | Never (data-driven) |
| `SharedSettingsNavGraph` | Settings tab screens | Never (shared across roles) |
| `SettingsScreen` | Profile, logout, app info | Never |
| `UiState<T>` | Loading/Empty/Error/DataLoaded sealed class | Never |
| `ErrorScreen`, `EmptyState`, `LoadingState` | Shared state screens | Never (content parameterized) |

### Role-Specific Components (Built Per Role)

| Component | Owner | Example |
|-----------|-------|---------|
| NavGraph(s) per tab | Role | `DriverActiveTripNavGraph` |
| Screen composables | Role | `ActiveTripScreen`, `MilestoneStepperScreen` |
| Role-specific ViewModels | Role | `ActiveTripViewModel` |
| Domain use cases | Role (may reuse shared) | `GetDriverTripsUseCase` |
| Empty-state copy | Role | "No trip assigned" vs "No work orders" |

---

## Shared Domain/Data Layer Implications

### Domain Models Are Role-Agnostic

Core domain models (`Trip`, `Vehicle`, `Contact`, `TripMilestone`) are shared:

```kotlin
// shared/domain/model/Trip.kt — used by all roles
data class Trip(
    val id: String,
    val status: TripStatus,
    val client: String,
    val route: String,
    val vehicle: VehicleRef?,
    val driver: ContactRef?,
    // ... all fields from backend TripResponse
)
```

Roles differ in **queries** (which trips they request) and **presentation** (what they show), not in model shape.

### Repository Pattern (Role-Agnostic + Source-Switchable)

```kotlin
// Repository interface — role-agnostic
interface TripRepository {
    suspend fun getTrips(filter: TripFilter): List<Trip>
    suspend fun getTrip(id: String): Trip
}

// Filter contains role-specific parameters
data class TripFilter(
    val driverId: String? = null,    // Driver role
    val branchId: String? = null,    // Ops Executive role (future)
    val status: List<TripStatus>? = null,
)

// Real implementation
class RealTripRepository(private val api: TripApi) : TripRepository { ... }

// Mock implementation
class MockTripRepository(private val fixtures: MockFixtureLoader) : TripRepository { ... }
```

Role-specific filtering happens in the **ViewModel** layer, not in the repository:

```kotlin
// Driver ViewModel — scopes to "my trips"
class DriverTripsViewModel(private val tripRepo: TripRepository, private val session: UserSession) {
    fun loadTrips() = tripRepo.getTrips(TripFilter(driverId = session.contactId))
}

// Future: Ops ViewModel — scopes to "branch trips"
class OpsTripsViewModel(private val tripRepo: TripRepository, private val session: UserSession) {
    fun loadTrips() = tripRepo.getTrips(TripFilter(branchId = session.branchId))
}
```

---

## Closest-Contract API Definitions by Role

### Driver (v1) — Fully Defined

| Endpoint | Source | Status | Contract |
|----------|--------|--------|----------|
| `POST /auth/login` | Backend | ✅ Real | Existing |
| `GET /auth/me` | Backend | ✅ Real | Existing |
| `POST /auth/select-role` | Backend | ✅ Real | Existing |
| `POST /auth/logout` | Backend | ✅ Real | Existing |
| `GET /trips` | Backend | ✅ Real | Existing (tenant-wide) |
| `GET /trips/{id}` | Backend | ✅ Real | Existing |
| `GET /vehicles/{id}` | Backend | ✅ Real | Existing |
| `GET /contacts/{id}` | Backend | ✅ Real | Existing |
| `GET /trips?driverId=me` | Derived | 🟠 Mock | Closest to `GET /trips` + driver filter |
| `POST /trips/{id}/transition` | Derived | 🟠 Mock | REST convention for Trip entity state change |
| `GET /trips/{id}/milestones` | Derived | 🟠 Mock | Sub-resource of Trip |
| `POST /trips/{id}/pod` | Derived | 🟠 Mock | Sub-resource of Trip |
| `GET /drivers/me/ledger/summary` | Derived | 🟠 Mock | `/me` self-service pattern |
| `POST /files/upload` | Derived | 🟠 Mock | Standard multipart convention |

### Operations Executive (v2) — Projections Only

| Endpoint | Source | Notes |
|----------|--------|-------|
| Same auth endpoints | Real | Shared |
| `GET /trips?branchId={id}` | Derived (future) | Branch-scoped trip query |
| `POST /trips/{id}/assign` | Derived (future) | Dispatch action |
| `GET /fleet/map` | New (future) | May not derive from current BE at all |

**Contracts for future roles are NOT documented now.** They will be derived during that role's spec/plan cycle. This is intentional: specifying them now would be speculative.

---

## Mock-vs-Real Switching Strategy

### Architecture

```
ViewModels → Use Cases → Repositories (interface)
                              │
                    ┌─────────┴─────────┐
                    │                   │
            RealRepository      MockRepository
            (Ktor HTTP)         (JSON fixtures)
                    │                   │
                    └─────────┬─────────┘
                              │
                    Koin DI decides which to inject
                    based on DataSourceConfig
```

### Per-Feature Configuration

```kotlin
data class DataSourceConfig(
    val tripSource: DataSourceMode = DataSourceMode.REAL,
    val milestoneSource: DataSourceMode = DataSourceMode.MOCK,
    val podSource: DataSourceMode = DataSourceMode.MOCK,
    val earningsSource: DataSourceMode = DataSourceMode.MOCK,
    val vehicleSource: DataSourceMode = DataSourceMode.REAL,
    val contactSource: DataSourceMode = DataSourceMode.REAL,
    val authSource: DataSourceMode = DataSourceMode.REAL,
)

enum class DataSourceMode { REAL, MOCK }
```

### Switching Mechanism

| Environment | Mechanism |
|-------------|-----------|
| **Dev builds** | Compile-time `DataSourceConfig` defaults (editable in code) |
| **QA/Debug builds** | Runtime toggle in Settings > Data Sources section (hidden in prod) |
| **Production builds** | All features point to REAL. Mock code excluded via ProGuard / dead-code elimination. |

### QA Fixture Editing

Mock JSON files live in `shared/src/commonMain/composeResources/files/mocks/`:

```text
mocks/
├── trips/
│   ├── driver-trips.json          # Normal: 1 active, 3 completed
│   ├── driver-trips-empty.json    # Empty state
│   └── driver-trips-error.json    # Error simulation
├── milestones/
│   └── trip-milestones.json
├── earnings/
│   └── driver-ledger-summary.json
└── pod/
    └── pod-success.json
```

QA swaps fixtures by renaming files (e.g., `driver-trips-empty.json` → `driver-trips.json`) and re-launching the app. No code changes, no rebuild.

---

## Prerequisites Before Foundation Implementation

These must exist before any feature implementation begins:

| # | Prerequisite | Why First |
|---|-------------|-----------|
| P1 | Package rename (`org.example.project` → `com.axleops.mobile`) | Scaffold cleanup; foundational |
| P2 | Koin DI setup | All feature modules depend on DI |
| P3 | Ktor networking client (configured for auth headers) | All API calls depend on this |
| P4 | `AppRole` enum + `RoleConfig` + `RoleRegistry` | Shell depends on role model |
| P5 | `DataSourceMode` + `DataSourceConfig` + Koin factory | Mock/real switching is core architecture |
| P6 | `AuthRepository` (real impl for login, select-role) | Auth is gate to everything else |
| P7 | `UserSession` model | Every ViewModel needs session context |
| P8 | `AppNavHost` + pre-auth graph (Login, RoleSelector) | Screen navigation depends on this |
| P9 | `AuthShell` (top bar + bottom tab bar + content area) | Role-specific screens render inside this |
| P10 | `UiState<T>` sealed class + shared state composables | Every screen uses this pattern |
| P11 | Design system tokens (theme, colors, typography, spacing) | Screens must use shared design |
| P12 | Mock fixture loader utility | Mock repositories depend on this |

**Suggested implementation order**: P1 → P2 → P3 → P5 → P12 → P10 → P11 → P4 → P7 → P6 → P8 → P9

---

## Backend Assumptions and Gaps

### Assumptions (Taken as True)

| # | Assumption | Source |
|---|-----------|--------|
| A1 | Backend role enum values match mobile `AppRole` exactly | Spec + `roles.js` |
| A2 | `POST /auth/select-role` returns role-scoped JWT (not "ALL") | Backend auth controller |
| A3 | `GET /trips` returns all tenant trips (no implicit driver filtering) | Backend trip controller |
| A4 | `GET /auth/me` returns user profile with assigned roles list | Backend auth controller |
| A5 | "Dispatch Manager" maps to `OPERATIONS_EXECUTIVE` | Spec assumption |

### Gaps (Known Backend Limitations)

| # | Gap | Impact | Workaround |
|---|-----|--------|-----------|
| G1 | No `User ↔ Contact` (driver) identity link | Cannot resolve which Contact record belongs to the logged-in User | Mock: hardcode mapping. Real: needs backend `user.contactId` field. |
| G2 | No `?driverId=` filter on `GET /trips` | Cannot fetch only "my trips" from backend | Mock: client-side filter. Real: needs backend query param. |
| G3 | No trip transition endpoint | Cannot Accept/Depart/Complete trips | Mock: local state change. Real: needs `POST /trips/{id}/transition`. |
| G4 | No milestones sub-resource | Cannot read/write milestones | Mock: fixture-backed. Real: needs `GET/POST /trips/{id}/milestones`. |
| G5 | No POD capture endpoint | Cannot submit POD | Mock: fixture response. Real: needs `POST /trips/{id}/pod`. |
| G6 | No driver ledger/earnings endpoint | Cannot show earnings | Mock: fixture-backed. Real: needs `GET /drivers/me/ledger/summary`. |
| G7 | No file upload endpoint | Cannot upload evidence photos | Mock: no-op success. Real: needs `POST /files/upload`. |
| G8 | Controller guards use `TRIP_READ` not `TRIP_READ_OWN` | Driver sees all trips even with real API | Mock bypasses this. Real: needs backend guard update. |

---

## What Can Be Deferred

| Item | Why Deferrable |
|------|---------------|
| Offline support | Architecturally significant; v1 requires connectivity |
| Push notifications | Polling is interim |
| Deep linking | Nice-to-have, not blocking v1 |
| Tab badges | Requires notification infrastructure |
| Cross-tab navigation | Each tab is self-contained in v1 |
| "My Vehicle" tab | Deferred per spec; may be v1.1 |
| In-app role switching | Logout + re-login is v1 approach |
| Multi-language / i18n | English-only in v1 |
| Analytics / Telemetry | Can be added post-launch |
| Biometric auth | Standard login in v1 |

---

## Verification Plan

### Automated Tests

```bash
# Run from /mobile directory
./gradlew :shared:allTests
```

Key test areas:

1. **RoleRegistry tests** — verify Driver config exists, unsupported roles return null, `supportedRoles()` returns only configured roles
2. **RoleResolver tests** — verify single-role auto-select, multi-role selector trigger, "ALL" filtering, no-supported-roles error state
3. **DataSourceConfig tests** — verify per-feature mode toggling, Koin provides correct implementation based on mode
4. **AuthShell composition tests** — verify tab bar renders correct tabs for a given RoleConfig

### Manual Verification

1. **Role Resolution**: Login with a Driver-only user → verify auto-select → Driver shell with 4 tabs
2. **Multi-Role User**: Login with a user who has Driver + Ops Exec roles → verify selector shows only Driver (since Ops Exec has no implemented screens) → select Driver → correct shell
3. **No Supported Roles**: Login with a Finance Controller user → verify "not available on mobile" message
4. **Mock/Real Toggle**: In debug build, open Settings > Data Sources → toggle trip source → verify app behavior is unchanged (different data, same UX)
5. **QA Fixture Swap**: Replace `driver-trips.json` with empty-state fixture → re-launch → verify empty state message on Past Trips tab

---

## References

- [Feature Spec](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md)
- [Constitution v3.0.0](file:///Users/ankit/a/fleetly/axleops_code/.specify/memory/constitution.md)
- [Mobile Role Strategy Design](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-role-strategy.md)
- [Role Shells Design](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md)
- [Navigation Grammar Design](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md)
- [Mobile Discovery Analysis](file:///Users/ankit/a/fleetly/axleops_code/docs/analysis/mobile-discovery.md)
- [FE Role Configuration](file:///Users/ankit/a/fleetly/axleops_code/frontend/src/config/roles.js)
