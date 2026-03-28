# Tasks: Mobile Role Strategy

**Input**: Design documents from `/specs/001-mobile-role-strategy/`  
**Prerequisites**: plan.md ✅, spec.md ✅  
**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile (KMP)**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`
- **Compose Resources**: `mobile/shared/src/commonMain/composeResources/`
- **Tests**: `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/`

---

## Phase 1: Setup

**Purpose**: Scaffold cleanup, package rename, and project structure initialization.

- [ ] T001 Rename package from `org.example.project` to `com.axleops.mobile` across `mobile/shared/src/commonMain/kotlin/`, `mobile/composeApp/`, `mobile/iosApp/`, `mobile/settings.gradle.kts`, and `mobile/build.gradle.kts`
- [ ] T002 Create base package directory structure under `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/` with subdirectories: `role/model/`, `role/registry/`, `role/resolution/`, `navigation/`, `navigation/driver/`, `auth/model/`, `auth/repository/`, `auth/viewmodel/`, `data/`, `di/`, `ui/shared/`
- [ ] T003 [P] Add Koin dependency to `mobile/shared/build.gradle.kts` and create empty `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/AppModule.kt`
- [ ] T004 [P] Add Ktor client dependency to `mobile/shared/build.gradle.kts` and create empty `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/HttpClientFactory.kt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Create `DataSourceMode` enum (`REAL`, `MOCK`) and `DataSourceConfig` data class in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/DataSourceMode.kt`
- [ ] T006 [P] Create `UiState<T>` sealed class (`Loading`, `Empty`, `Error`, `DataLoaded`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/UiState.kt`
- [ ] T007 [P] Create shared state composables (`LoadingState`, `EmptyState`, `ErrorState`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [ ] T008 [P] Create mock fixture loader utility in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/MockFixtureLoader.kt` — reads JSON from `composeResources/files/mocks/`
- [ ] T009 Create design system tokens (theme, colors, typography, spacing) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/Theme.kt`
- [ ] T010 Configure Koin DI root module with `DataSourceConfig` bindings in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/AppModule.kt`
- [ ] T011 Create Ktor HTTP client factory with auth header interceptor in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/HttpClientFactory.kt`
- [ ] T012 Create `DataSourceModule.kt` Koin module that uses `DataSourceConfig` to bind mock or real repository implementations in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/DataSourceModule.kt`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Driver Lands in a Role-Scoped Experience (Priority: P1) 🎯 MVP

**Goal**: A Driver user logs in and sees a navigation shell with exactly 4 tabs (Active Trip, Past Trips, Earnings, Settings). No other role's features are visible.

**Independent Test**: Login with a Driver-role account → verify 4-tab bottom bar renders → verify no non-Driver content is navigable.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `AppRole` enum mapping to backend role values (`DRIVER`, `OPERATIONS_EXECUTIVE`, `WORKSHOP_MANAGER`, `MECHANIC`, `BRANCH_MANAGER`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/role/model/AppRole.kt`
- [ ] T014 [P] [US1] Create `TabDefinition` data class (`id`, `label`, `icon`, `badgeEnabled`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/TabDefinition.kt`
- [ ] T015 [US1] Create `RoleConfig` data class (`role`, `label`, `icon`, `tabs: List<TabDefinition>`, `landingTab`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/role/model/RoleConfig.kt`
- [ ] T016 [US1] Create `RoleRegistry` object with Driver v1 configuration (Active Trip, Past Trips, Earnings, Settings tabs) and `supportedRoles()` / `getConfig()` methods in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/role/registry/RoleRegistry.kt`
- [ ] T017 [US1] Create `UserSession` data class (`userId`, `activeRole: AppRole`, `jwt`, `authorities`, `contactId`, `branchId`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/model/UserSession.kt`
- [ ] T018 [US1] Implement `AuthShell` composable — reads `RoleConfig` from `RoleRegistry` and renders top bar (role label) + bottom tab bar (from config) + content area (placeholder per tab) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt`
- [ ] T019 [US1] Create Driver-specific tab content placeholders (4 placeholder screens with "Active Trip", "Past Trips", "Earnings" text + correct `UiState.Empty` handling) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/driver/DriverScreens.kt`
- [ ] T020 [US1] Wire `AppNavHost` root composable — pre-auth graph (placeholder login) routes to `AuthShell` with resolved `RoleConfig` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`

**Checkpoint**: Driver shell renders with 4 tabs. No other role's content is visible. Navigation between tabs works.

---

## Phase 4: User Story 2 — Shared Services Work Across Roles (Priority: P1)

**Goal**: Authentication, session management, profile viewing, and settings work identically regardless of the active role.

**Independent Test**: Login → verify profile on Settings tab → logout → verify session cleared → re-auth required.

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create `AuthRepository` interface (`login`, `selectRole`, `logout`, `getMe`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/repository/AuthRepository.kt`
- [ ] T022 [P] [US2] Create `RealAuthRepository` implementing `AuthRepository` using Ktor HTTP client (calls `POST /auth/login`, `GET /auth/me`, `POST /auth/select-role`, `POST /auth/logout`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/repository/RealAuthRepository.kt`
- [ ] T023 [US2] Create `AuthViewModel` — manages login flow, role selection, session state in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
- [ ] T024 [US2] Implement `LoginScreen` composable (email/password form, error handling, loading state) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt`
- [ ] T025 [US2] Implement `RoleSelectorScreen` composable — shows only `RoleRegistry.supportedRoles()` intersected with user's backend roles, filters out `"ALL"` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/RoleSelectorScreen.kt`
- [ ] T026 [US2] Implement `SettingsScreen` composable (profile section, logout button, app version, debug data-source toggles for non-prod builds) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/SettingsScreen.kt`
- [ ] T027 [US2] Register auth Koin bindings (`AuthRepository`, `AuthViewModel`, `UserSession`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/AuthModule.kt`
- [ ] T028 [US2] Wire `AppNavHost` to use real `AuthViewModel` — login success → role resolution → `AuthShell` with session-scoped role in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`

**Checkpoint**: Real auth flow works — login, role selection (auto-select for single role), session scoping, settings with logout.

---

## Phase 5: User Story 3 — Future Role Can Be Added Without Restructuring (Priority: P2)

**Goal**: Validate role-extensible architecture by adding a stub "Operations Executive" role config that renders a distinct shell without modifying any Driver or shared code.

**Independent Test**: Add stub OpsExec config → login with OpsExec user → verify different tabs render → verify Driver code is untouched (zero-diff).

### Implementation for User Story 3

- [ ] T029 [US3] Add stub `OPERATIONS_EXECUTIVE` `RoleConfig` entry to `RoleRegistry` with 4 placeholder tabs (Fleet Map, Trips, Alerts, Settings) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/role/registry/RoleRegistry.kt`
- [ ] T030 [US3] Create `OpsExecPlaceholderScreens.kt` with "coming soon" placeholder composables for Fleet Map, Trips, Alerts tabs in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/opsexec/OpsExecPlaceholderScreens.kt`
- [ ] T031 [US3] Implement "unsupported role" screen — shown when a user has no mobile-supported roles in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/UnsupportedRoleScreen.kt`

**Checkpoint**: Stub OpsExec role renders its own shell. Driver experience is unchanged. Unsupported roles show informative message.

---

## Phase 6: User Story 4 — Role-Specific Data Visibility Is Enforced (Priority: P2)

**Goal**: Driver sees only their own trips and earnings, enforced at the data query layer.

**Independent Test**: Login as Driver → trip list shows only trips assigned to that driver → earnings show only that driver's ledger.

**⚠️ Backend gap**: No `?driverId=` filter exists on `GET /trips`. Mock-backed in v1.

### Implementation for User Story 4

- [ ] T032 [P] [US4] Create `Trip` domain model (role-agnostic) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/domain/model/Trip.kt`
- [ ] T033 [P] [US4] Create `TripFilter` data class (`driverId`, `branchId`, `status`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/domain/model/TripFilter.kt`
- [ ] T034 [P] [US4] Create `TripRepository` interface (`getTrips(filter)`, `getTrip(id)`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/domain/repository/TripRepository.kt`
- [ ] T035 [P] [US4] Create `RealTripRepository` using Ktor (`GET /trips`, `GET /trips/{id}`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/repository/RealTripRepository.kt`
- [ ] T036 [P] [US4] Create `MockTripRepository` loading from `composeResources/files/mocks/trips/driver-trips.json` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/repository/MockTripRepository.kt`
- [ ] T037 [US4] Create mock trip JSON fixtures: `driver-trips.json` (normal), `driver-trips-empty.json`, `driver-trips-error.json` in `mobile/shared/src/commonMain/composeResources/files/mocks/trips/`
- [ ] T038 [US4] Register `TripRepository` Koin binding (mock/real based on `DataSourceConfig.tripSource`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/DataSourceModule.kt`

**Checkpoint**: Driver-scoped trip queries work via repository pattern. Mock and real implementations are interchangeable via DI.

---

## Phase 7: User Story 5 — API Strategy Adapts to Backend Readiness per Role (Priority: P2)

**Goal**: Each feature's data source (mock or real) is independently switchable. QA can edit mock fixtures without code changes.

**Independent Test**: Toggle trip source mock→real via debug menu → verify behavior unchanged. Swap `driver-trips.json` with empty fixture → re-launch → verify empty state renders.

### Implementation for User Story 5

- [ ] T039 [P] [US5] Create `EarningsRepository` interface and `MockEarningsRepository` (with `driver-ledger-summary.json` fixture) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/domain/repository/EarningsRepository.kt` and `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/repository/MockEarningsRepository.kt`
- [ ] T040 [P] [US5] Create mock earnings JSON fixtures: `driver-ledger-summary.json` (normal), `driver-ledger-empty.json` in `mobile/shared/src/commonMain/composeResources/files/mocks/earnings/`
- [ ] T041 [US5] Register `EarningsRepository` Koin binding (mock-only for v1, real when backend ships) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/DataSourceModule.kt`
- [ ] T042 [US5] Implement runtime data-source toggle in Settings debug section — reads current `DataSourceConfig`, allows per-feature mock/real switch, stores in memory (non-production builds only) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/SettingsScreen.kt`

**Checkpoint**: Per-feature mock/real switching works. QA can swap fixture files. Settings debug toggle is hidden in production.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and architecture-level verification.

- [ ] T043 [P] Document all derived contracts in `mobile/specs/001-mobile-role-strategy/contracts/driver-derived-contracts.md` — endpoint shape, source rationale, backend entity reference for each mock-backed API
- [ ] T044 [P] Document known backend gaps in `mobile/specs/001-mobile-role-strategy/gaps.md` — G1 through G8 from plan.md with status and workaround
- [ ] T045 Validate role-extensibility: add a third stub role config (e.g., `WORKSHOP_MANAGER` with 3 tabs), verify zero changes to Driver or shared code, then remove the stub
- [ ] T046 Validate mock fixture swap: rename `driver-trips-empty.json` to `driver-trips.json`, re-launch app, confirm empty state renders on Past Trips tab, then restore
- [ ] T047 Run `./gradlew :shared:allTests` from `mobile/` to verify all common tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001–T004) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (T005–T012)
- **US2 (Phase 4)**: Depends on Foundational (T005–T012). Can run in parallel with US1 (different files).
- **US3 (Phase 5)**: Depends on US1 (needs `RoleRegistry`, `AuthShell`)
- **US4 (Phase 6)**: Depends on US2 (needs `UserSession` for driver scoping). Can run in parallel with US3.
- **US5 (Phase 7)**: Depends on US4 (needs repository pattern established)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation) ─── BLOCKS ALL ───┐
    │                                    │
    ├──→ Phase 3 (US1: Driver Shell) ◄───┘
    │        │
    │        ├──→ Phase 5 (US3: Role Extensibility)
    │        │
    ├──→ Phase 4 (US2: Shared Services) ◄── can parallel with US1
    │        │
    │        ├──→ Phase 6 (US4: Data Visibility) ◄── can parallel with US3
    │                 │
    │                 ├──→ Phase 7 (US5: API Strategy)
    │
    └──→ Phase 8 (Polish) ◄── after all stories
```

### Parallel Opportunities

Within each phase, tasks marked `[P]` can run in parallel:

- **Phase 1**: T003 ∥ T004
- **Phase 2**: T005 ∥ T006 ∥ T007 ∥ T008
- **Phase 3**: T013 ∥ T014
- **Phase 4**: T021 ∥ T022
- **Phase 6**: T032 ∥ T033 ∥ T034 ∥ T035 ∥ T036
- **Phase 7**: T039 ∥ T040
- **Phase 8**: T043 ∥ T044

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T012)
3. Complete Phase 3: User Story 1 (T013–T020)
4. **STOP and VALIDATE**: Driver shell renders 4 tabs. Navigation works.
5. Demo-ready: role-scoped shell with placeholder screens.

### Incremental Delivery

1. Setup + Foundation → scaffold is clean, DI works, design system exists
2. Add US1 (Driver Shell) → Driver sees 4 tabs → **MVP**
3. Add US2 (Shared Services) → Real auth, login, logout, settings work
4. Add US3 (Extensibility) → Stub role proves architecture
5. Add US4 (Data Visibility) → Driver-scoped repositories with mock data
6. Add US5 (API Strategy) → Mock/real toggle, QA fixture workflow
7. Polish → Documentation, validation, cleanup

---

## Notes

- All tasks target `/mobile/**` — no FE/BE changes
- Tasks marked **⚠️ Backend gap** depend on future backend work; mock-backed in v1
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Navigation framework choice (Voyager vs Decompose) should be resolved during T020 (AppNavHost)

---

## Fix Round 1 (Post-Review)

**Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/handoff/open-issues.md)
**Scope**: Engineer-ready fixes only. Items requiring PM/Designer/Architect decisions are excluded.

### Immediate (before next feature epic)

- [x] FIX-001 [OI-02] Add 401 response interceptor to `HttpClientFactory.kt` — catch 401 status in Ktor `HttpResponseValidator`, trigger logout via shared callback or event bus. **Prerequisite**: none. Spec §US2 AC2 already requires this.  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/data/HttpClientFactory.kt`

- [x] FIX-002 [OI-03] Add iOS Koin initialization — created `shared/src/commonMain/kotlin/.../di/KoinInit.kt` with `fun initKoin()` calling `startKoin { modules(...) }`, invoked from `iosApp/` app delegate. **Prerequisite**: none.  
  **Files**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/KoinInit.kt` [NEW], `mobile/iosApp/iosApp/iOSApp.swift` [MODIFY]

### Pre-Release Polish

- [x] FIX-003 [OI-04] Add `contentFactory` lambda to `RoleConfig` and eliminate `when(session.activeRole)` in `AppNavHost` — set factory during `RoleRegistry` registration; `AuthenticatedContent` calls `roleConfig.tabContentFactory(tabId)` instead of dispatching by role. **Prerequisite**: none (independent of nav framework decision).  
  **Files**: `role/model/RoleConfig.kt` [MODIFY], `role/registry/RoleRegistry.kt` [MODIFY], `navigation/AppNavHost.kt` [MODIFY]

- [ ] FIX-004 [OI-05] Make `DataSourceConfig` reactive — register as `MutableStateFlow<DataSourceConfig>` singleton in `AppModule.kt`, inject in `SettingsScreen` caller, write on toggle change, read in `DataSourceModule` bindings via `get<StateFlow<DataSourceConfig>>().value`. **Prerequisite**: none.  
  **Files**: `di/AppModule.kt` [MODIFY], `di/DataSourceModule.kt` [MODIFY], `navigation/AppNavHost.kt` [MODIFY]

- [x] FIX-005 [OI-06] Add logout confirmation dialog — wrap `authViewModel.logout()` call in `AppNavHost` with `AlertDialog(title = "Sign Out", text = "Are you sure?", confirm = logout, dismiss = cancel)`. **Prerequisite**: none.  
  **File**: `navigation/AppNavHost.kt` [MODIFY]

- [ ] FIX-006 [OI-07] Derive `isDebugBuild` from platform — Android: read `BuildConfig.DEBUG`. iOS: use compile flag. Pass via `expect/actual` pattern or Koin-provided value. Remove hardcoded `true` in `AppNavHost`. **Prerequisite**: none.  
  **Files**: `navigation/AppNavHost.kt` [MODIFY], `di/AppModule.kt` [MODIFY], platform-specific `actual` files [NEW]

- [ ] FIX-007 [OI-09] Configure `baseUrl` per environment — move from hardcoded empty string in `DataSourceModule` to a Koin-provided value sourced from `BuildConfig` (Android) or `Info.plist` (iOS). **Prerequisite**: none.  
  **Files**: `di/AppModule.kt` [MODIFY], `di/DataSourceModule.kt` [MODIFY]

- [x] FIX-008 [OI-10] Delete scaffold dead code — removed `Greeting.kt`, `Platform.kt`, `Platform.android.kt`, `Platform.ios.kt` + updated `ContentView.swift`. **Prerequisite**: none.  
  **Files**: `Greeting.kt` [DELETE], `Platform.kt` [DELETE], `Platform.android.kt` [DELETE], `Platform.ios.kt` [DELETE], `ContentView.swift` [MODIFY]

### Not Ready for Engineering (excluded from this round)

| Issue | Reason | Blocked On |
|-------|--------|-----------|
| OI-01 (Nav framework) | Architect decision required — Voyager vs Decompose | New spec `002-navigation-framework` |
| OI-08 (Emoji icons) | Design system icon set not finalized | Designer |
| OI-11–OI-18 (Spec gaps) | Spec/requirement clarifications, not code changes | PM |
| OI-19 (Backend gaps) | Backend team scope | Backend |
