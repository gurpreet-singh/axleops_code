# Implementation Notes — Mobile Role Strategy

> **Snapshot date**: 2026-03-28
> **Branch**: `001-mobile-role-strategy`
> **Purpose**: Stabilization snapshot before retroactive UX artifact creation.

---

## 1. What Has Been Implemented

### File Inventory (39 files created/modified)

#### Role Model (`role/`)
| File | Purpose |
|------|---------|
| `role/model/AppRole.kt` | Enum: DRIVER, OPERATIONS_EXECUTIVE, WORKSHOP_MANAGER, MECHANIC, BRANCH_MANAGER — maps to backend values |
| `role/model/RoleConfig.kt` | Data class: role, label, iconName, tabs, landingTabId — with validation |
| `role/registry/RoleRegistry.kt` | Singleton registry with Driver (4 tabs) + OpsExec (4 stub tabs) configs |

#### Navigation (`navigation/`)
| File | Purpose |
|------|---------|
| `navigation/TabDefinition.kt` | Tab data class: id, label, iconName, badgeEnabled |
| `navigation/AuthShell.kt` | Role-agnostic Scaffold — top bar + bottom nav + content area |
| `navigation/AppNavHost.kt` | Root composable — routes auth state to Login/RoleSelector/AuthShell |
| `navigation/driver/DriverScreens.kt` | 4 Driver tab placeholders (Active Trip, Past Trips, Earnings, Settings) |
| `navigation/opsexec/OpsExecPlaceholderScreens.kt` | 4 OpsExec "coming soon" stubs |

#### Auth (`auth/`)
| File | Purpose |
|------|---------|
| `auth/model/UserSession.kt` | Session: userId, activeRole, jwt, authorities, displayName, contactId, branchId |
| `auth/repository/AuthRepository.kt` | Interface: login, getMe, selectRole, logout + LoginResult, UserProfile DTOs |
| `auth/repository/RealAuthRepository.kt` | Ktor impl calling POST /auth/login, GET /auth/me, POST /auth/select-role, POST /auth/logout |
| `auth/viewmodel/AuthViewModel.kt` | State machine: Unauthenticated → LoggingIn → RoleSelection → Authenticated |

#### Data Layer (`data/`, `domain/`)
| File | Purpose |
|------|---------|
| `data/DataSourceMode.kt` | REAL/MOCK enum + DataSourceConfig (per-feature mode) |
| `data/HttpClientFactory.kt` | Ktor client with JSON, auth headers, logging |
| `data/MockFixtureLoader.kt` | Loads JSON from composeResources via KSerializer parameter |
| `domain/model/Trip.kt` | Trip + TripStatus (Serializable, matches backend shape) |
| `domain/model/TripFilter.kt` | Role-scoped filter: driverId, branchId, status, limit, offset |
| `domain/model/Earnings.kt` | EarningsSummary + TripEarning (mock-only in v1) |
| `domain/repository/TripRepository.kt` | Interface: getTrips(filter), getTrip(id) |
| `domain/repository/EarningsRepository.kt` | Interface: getEarnings(driverId, period), getAvailablePeriods(driverId) |
| `data/repository/RealTripRepository.kt` | Ktor impl: GET /trips, GET /trips/{id} with filter query params |
| `data/repository/MockTripRepository.kt` | JSON fixture loader with client-side filtering |
| `data/repository/MockEarningsRepository.kt` | JSON fixture loader (mock-only) |

#### DI (`di/`)
| File | Purpose |
|------|---------|
| `di/AppModule.kt` | Root Koin module: DataSourceConfig, HttpClient |
| `di/AuthModule.kt` | AuthRepository, AuthViewModel bindings |
| `di/DataSourceModule.kt` | TripRepository (mock/real), EarningsRepository (mock-only) |

#### UI (`ui/shared/`)
| File | Purpose |
|------|---------|
| `ui/shared/Theme.kt` | AxleOpsTheme: brand colors, typography, shapes, Spacing tokens |
| `ui/shared/UiState.kt` | Sealed interface: Loading, Empty, Error, DataLoaded |
| `ui/shared/StateScreens.kt` | LoadingIndicator, EmptyStateScreen, ErrorStateScreen, UiStateHandler |
| `ui/shared/LoginScreen.kt` | Email/password form with loading/error states |
| `ui/shared/RoleSelectorScreen.kt` | Card-based role picker (mobile-supported only) |
| `ui/shared/SettingsScreen.kt` | Profile section, logout, app version, debug data-source toggles |
| `ui/shared/UnsupportedRoleScreen.kt` | "Your role is not yet available on mobile" screen |

#### Android Entry (`composeApp/`)
| File | Purpose |
|------|---------|
| `AxleOpsApplication.kt` | Application class with Koin startKoin (3 modules) |
| `App.kt` | Delegates to AppNavHost |
| `AndroidManifest.xml` | Registered AxleOpsApplication |

#### Mock Fixtures (`composeResources/files/mocks/`)
| File | Purpose |
|------|---------|
| `trips/driver-trips.json` | 4 trips, mixed statuses, driverId=501 |
| `trips/driver-trips-empty.json` | Empty array |
| `trips/driver-trips-error.json` | Malformed JSON for error state testing |
| `earnings/driver-earnings.json` | March 2026 summary, 3 trip payouts |

#### Build/Config Changes
| File | Change |
|------|--------|
| `gradle/libs.versions.toml` | Added koin 4.0.4, ktor 3.1.3, kotlinx-serialization 1.8.1, koin-android |
| `shared/build.gradle.kts` | Added Koin/Ktor/Compose/serialization plugins + deps |
| `composeApp/build.gradle.kts` | Added koin-android, updated namespace/applicationId |
| `iosApp/Configuration/Config.xcconfig` | Updated bundle ID |
| `local.properties` | Set sdk.dir |

---

## 2. Tasks Completed (from tasks.md)

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Setup | T001–T004 | ✅ All completed |
| Phase 2: Foundational | T005–T012 | ✅ All completed |
| Phase 3: US1 — Driver Shell | T013–T020 | ✅ All completed |
| Phase 4: US2 — Shared Services | T021–T028 | ✅ All completed |
| Phase 5: US3 — Role Extensibility | T029–T031 | ✅ All completed |
| Phase 6: US4 — Data Visibility | T032–T038 | ✅ All completed |
| Phase 7: US5 — API Strategy | T039–T042 | ✅ All completed |
| Phase 8: Polish | T043–T047 | ⚠️ Partially completed |

### Phase 8 Detail

| Task | tasks.md Description | What Was Done |
|------|---------------------|---------------|
| T043 | Document derived contracts | ✅ Created `AxleOpsApplication.kt` + Koin init instead (task was repurposed to "wire Koin app entry point") |
| T044 | Document backend gaps | ✅ Created `backend-gaps.md` (G1–G5) |
| T045 | Validate extensibility with 3rd stub role | ❌ Not done — OpsExec stub is present but no 3rd role was added/removed |
| T046 | Validate mock fixture swap | ❌ Not done — fixtures exist but swap test was not executed |
| T047 | Run `./gradlew :shared:allTests` | ❌ Not done — no tests exist yet. Build verification used `compileDebugKotlinAndroid` |

---

## 3. Implicit Design Decisions Made During Implementation

These decisions were made during coding and are **not explicitly documented** in spec.md or plan.md:

| # | Decision | Rationale |
|---|----------|-----------|
| ID1 | **No navigation framework** — used flat `when(authState)` + `when(tabId)` state-based routing instead of Voyager/Decompose | Plan D9 called for evaluating both. Neither was adopted because all current screens are single-level tab placeholders. Will need resolution before any tab gains depth (detail screens, multi-step flows). |
| ID2 | **Emoji text icons** instead of Material Icons or resource-based icons | `compose.material3` in KMP commonMain doesn't include Icons Extended. Emoji strings (`🚛`, `📋`, `💰`, `⚙️`) used as temporary placeholders. `resolveIconEmoji()` centralizes mapping. |
| ID3 | **`Trip.id` is `Long`** instead of plan's `String` | Backend Trip entity uses `Long` primary keys. Matched backend shape over plan pseudocode. |
| ID4 | **No `RoleResolver` class** — role resolution logic is inline in `AuthViewModel.resolveRole()` | Plan (line 73) called for `role/resolution/RoleResolver.kt`. The logic is small enough (~25 lines) that a separate class felt premature. Can be extracted if it grows. |
| ID5 | **`TabDefinition` dropped `navGraph` field** | Plan specified `val navGraph: NavGraph`. Without a navigation framework, there's nothing to put here. The field will be added when a nav framework is adopted. |
| ID6 | **`DataSourceMode` dropped `HYBRID`** | Plan (line 92, 394) mentioned `HYBRID`. Implementation uses only `REAL` and `MOCK`. No use case for `HYBRID` exists in v1. |
| ID7 | **`MockFixtureLoader.load()` uses explicit `KSerializer<T>`** instead of `inline reified T` | Kotlin/Native public-API inline restrictions prevent `inline reified` from accessing `Res.readBytes()`. Switched to `KSerializer` parameter pattern. |
| ID8 | **OpsExec role is registered and routable** — not just a "stub" | OpsExec has a `RoleConfig` entry, 4 tabs, placeholder screens, and a routing case in `AppNavHost`. This goes slightly beyond "validate with a stub" — it's a real (empty) role shell. |
| ID9 | **`AppNavHost` has a role-dispatch `when` block** | Each role maps to its tab content factory via `when(session.activeRole)`. Adding a new role requires adding a branch here. Plan's `NavGraph` field on `TabDefinition` would have avoided this. |
| ID10 | **SettingsScreen debug toggle writes to nothing** | Toggle UI exists but `DataSourceConfig` is passed as a static `DEFAULT` value. No reactive state holder backs it. The toggle is cosmetic-only. |

---

## 4. What Is Still Pending

### From tasks.md
- T043 (as written): Derived contracts documentation (`driver-derived-contracts.md`) — not created
- T045: 3rd stub role validation (add → verify → remove)
- T046: Mock fixture swap validation
- T047: Test suite (`./gradlew :shared:allTests` — no tests exist)

### From design-review.md Findings
| Finding | Description | Priority |
|---------|-------------|----------|
| F1 | `AppNavHost` role-dispatch `when` block — violates FR-011 | Medium |
| F2 | Emoji icons — needs design system icon set | Low (v1) |
| F3 | No navigation framework — blocks detail screens | **High** |
| F4 | DataSourceConfig not reactive — debug toggle inert | Medium |
| F5 | TabDefinition missing navGraph field | Low (resolves with F3) |

### From backend-gaps.md
| Gap | Blocks |
|-----|--------|
| G1: User↔Contact link | Driver-scoped queries |
| G2: driverId filter on GET /trips | Real driver trip list |
| G3: Earnings API | Real earnings display |
| G4: Trip milestones endpoint | Trip progress tracking |
| G5: POD endpoint | Delivery confirmation |

---

## 5. Known Open Issues / Uncertainties

| # | Issue | Impact |
|---|-------|--------|
| OI1 | **No iOS entry point Koin init** — `AxleOpsApplication.kt` is Android-only. iOS app (`iosApp/`) has no equivalent `startKoin` call. | iOS build will crash at runtime due to missing Koin context. |
| OI2 | **`isDebugBuild = true` hardcoded** in `AppNavHost` line 110 — no BuildConfig integration. | Debug toggles visible in all builds, including production. |
| OI3 | **`RealAuthRepository` response DTOs are assumed** — `LoginResponseDto`, `MeResponseDto`, `SelectRoleResponseDto` shapes are inferred from backend controller signatures but not validated against actual API responses. | First real API integration may require DTO adjustments. |
| OI4 | **`HttpClientFactory.baseUrl` is empty string** in `DataSourceModule` → `RealTripRepository`. | Real trip API calls will fail until baseUrl is configured. |
| OI5 | **No token refresh / session expiry handling** — `AuthViewModel` does not handle 401 responses or JWT expiry. | Expired sessions will show raw error messages instead of redirecting to login. |
| OI6 | **composeApp `App.kt` still contains scaffold `Greeting` references** — `Greeting.kt` and `Platform.kt` are leftover scaffold files. | Dead code; no runtime impact but clutters the project. |
| OI7 | **`UserSession.contactId` is nullable** — mock data uses hardcoded `driverId=501` but real auth flow has no way to populate this until backend gap G1 is resolved. | Driver-scoped queries will return empty results when hitting real API. |

---

## 6. Fix Round 1 Results (2026-03-28)

### Completed Fix Tasks

| Task | Issue | What Changed | Status |
|------|-------|-------------|--------|
| FIX-001 | OI-02 / OI5 | 401 response interceptor added to `HttpClientFactory.kt` — `onUnauthorized` callback invoked on HTTP 401 | ✅ Done |
| FIX-002 | OI-03 / OI1 | iOS Koin initialization — `di/KoinInit.kt` created, `iOSApp.swift` updated to call `KoinInitKt.doInitKoin()` | ✅ Done |
| FIX-003 | OI-04 / F1 | `tabContentFactory` lambda added to `RoleConfig` — `when(session.activeRole)` eliminated from `AppNavHost` | ✅ Done |
| FIX-005 | OI-06 | Logout confirmation `AlertDialog` added to `AppNavHost.AuthenticatedContent` | ✅ Done |
| FIX-008 | OI-10 / OI6 | Deleted `Greeting.kt`, `Platform.kt`, `Platform.android.kt`, `Platform.ios.kt` + updated `ContentView.swift` | ✅ Done |

### Files Changed

| File | Change Type |
|------|------------|
| `data/HttpClientFactory.kt` | Modified — added `onUnauthorized` param + `HttpResponseValidator` |
| `role/model/RoleConfig.kt` | Modified — added `tabContentFactory` field |
| `role/registry/RoleRegistry.kt` | Modified — wired `DriverTabContent`/`OpsExecTabContent` as factories |
| `navigation/AppNavHost.kt` | Modified — eliminated `when(role)`, added logout dialog, removed unused imports |
| `di/KoinInit.kt` | **New** — shared Koin init callable from iOS |
| `iosApp/iOSApp.swift` | Modified — calls `doInitKoin()` on launch |
| `iosApp/ContentView.swift` | Modified — removed `Greeting()` reference |
| `Greeting.kt` | **Deleted** |
| `Platform.kt` | **Deleted** |
| `Platform.android.kt` | **Deleted** |
| `Platform.ios.kt` | **Deleted** |

### Still Blocked / Deferred

| Task | Reason |
|------|--------|
| FIX-004 (reactive DataSourceConfig) | Requires careful integration with Koin scoping — `MutableStateFlow` as DI provider needs `factory` vs `single` consideration. Small but carries regression risk. Defer to separate PR. |
| FIX-006 (isDebugBuild from BuildConfig) | Requires `expect/actual` pattern and Android `BuildConfig` generation. Separate PR. |
| FIX-007 (baseUrl per environment) | Same platform `expect/actual` + build variant infrastructure as FIX-006. Batch together. |

### How to Verify

1. **Compile check**: `./gradlew :shared:compileDebugKotlinAndroid` — ✅ passed
2. **401 interceptor**: Wire `onUnauthorized` to `AuthViewModel.logout()` in `AppModule` when creating `HttpClient`. Trigger a 401 from backend → confirm redirect to login.
3. **iOS Koin**: Build iOS target → confirm app launches without Koin crash.
4. **contentFactory**: Add a hypothetical 3rd role to `RoleRegistry` — confirm zero changes needed in `AppNavHost`.
5. **Logout dialog**: Tap "Sign Out" in Settings → confirm dialog appears before logout.
6. **Dead code**: Confirm `Greeting.kt` and `Platform.kt` no longer exist in project.

### Follow-Up Risks

- **FIX-001 is plumbed but not wired**: `onUnauthorized` callback needs to be connected to `AuthViewModel.logout()` in `AppModule.kt` where `HttpClient` is created. Currently `create()` is called with no arguments. This is a one-line follow-up.
- **FIX-002 uses `KoinInitKt.doInitKoin()`** — this is Kotlin/Native's auto-generated Swift name for `fun initKoin()`. If the function is renamed, the Swift call will break.

### Issues Resolved by Fix Round 1

| Issue | Previous Status | New Status |
|-------|----------------|------------|
| OI1 (No iOS Koin) | Open | ✅ Resolved (FIX-002) |
| OI5 (No 401 handling) | Open | ⚠️ Partially resolved (plumbing added, not wired) |
| OI6 (Scaffold dead code) | Open | ✅ Resolved (FIX-008) |
| F1 (when(role) block) | Open | ✅ Resolved (FIX-003) |
| ID9 (AppNavHost role dispatch) | Implicit decision | ✅ Superseded by contentFactory |

