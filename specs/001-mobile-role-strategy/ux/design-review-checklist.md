# Design Review Checklist — Mobile Role Strategy

Use this checklist to validate that the implementation meets the design intent.

## Role Separation

- [x] Driver content is fully isolated in `navigation/driver/`
- [x] OpsExec content is fully isolated in `navigation/opsexec/`
- [x] Adding OpsExec required zero changes to Driver files
- [x] `RoleRegistry` is the single source of truth for supported roles
- [ ] Adding a new role requires zero changes to `AppNavHost` ← **FAILS** (F1: `when` block)

## Shared Shell

- [x] AuthShell renders top bar + bottom nav from `RoleConfig`
- [x] Top bar shows role label
- [x] Bottom nav tabs come from `RoleConfig.tabs`
- [x] Settings tab is shared and always last
- [ ] Tab icons use design system icons ← **FAILS** (F2: emoji text fallback)
- [ ] Tab state preserved on switch ← **NOT IMPLEMENTED** (no nav stack)

## Auth Flow

- [x] Login form handles idle, loading, error states
- [x] Single-role user auto-selects without showing selector
- [x] "ALL" role filtered from selector
- [x] Multi-role user sees only mobile-supported roles
- [x] No-supported-roles user sees informative message
- [ ] Logout shows confirmation modal before proceeding ← **NOT IMPLEMENTED**
- [ ] Session expiry (401) auto-redirects to login ← **NOT IMPLEMENTED**

## UX States (SC-005)

- [x] `UiState<T>` sealed interface defined (Loading, Empty, Error, DataLoaded)
- [x] Shared state composables exist (LoadingIndicator, EmptyStateScreen, ErrorStateScreen)
- [x] `UiStateHandler` composable exists for orchestration
- [ ] All screens use `UiStateHandler` ← **NOT YET** (placeholder screens use `EmptyStateScreen` directly)

## Data Layer

- [x] `TripRepository` interface with mock + real implementations
- [x] `EarningsRepository` interface with mock implementation
- [x] `TripFilter` supports role-scoped queries (driverId, branchId)
- [x] Mock fixtures are realistic JSON (not stubs)
- [x] Empty and error fixtures exist for QA
- [x] Koin DI binds mock/real based on `DataSourceConfig`
- [ ] Runtime mock/real toggle works ← **FAILS** (F4: config not reactive)

## Design System

- [x] `AxleOpsTheme` defined with brand colors, typography, shapes
- [x] `Spacing` tokens defined (xs, sm, md, lg, xl, xxl)
- [x] All screens use theme tokens, not hardcoded values
- [x] Theme wraps the entire app via `AppNavHost → AxleOpsTheme`

## Navigation

- [ ] Navigation framework adopted (Voyager/Decompose) ← **NOT DONE** (F3)
- [ ] Per-tab NavGraph references in TabDefinition ← **NOT DONE** (F5)
- [ ] Back navigation works within tabs ← **NOT APPLICABLE** (no detail screens yet)
- [x] Tab switching works via bottom nav
- [x] Auth state transitions render correct screens

## Constitution Compliance

- [x] Principle I (Existing-System-First): Role model from backend; no invented contracts
- [x] Principle II (Role-Scoped): Driver-only in v1; architecture validated with OpsExec stub
- [x] Principle III (Closest-Contract): Real APIs where available, mock where not
- [x] Principle IV (Backend-Gap Transparency): Gaps documented in `backend-gaps.md`
- [x] Principle VI (Scoped Change): All changes in `/mobile/**`
- [x] Principle VII (Field UX): State handling infrastructure exists (exercised at feature level)
- [x] Principle VIII (Testability): Mock/real switching architecture in place
- [x] Principle IX (Reviewability): Task-sized diffs across 47 tasks

## Summary

| Category | Pass | Fail/Pending | Notes |
|----------|------|-------------|-------|
| Role Separation | 4/5 | 1 | F1: AppNavHost when block |
| Shared Shell | 4/6 | 2 | F2: icons, tab state |
| Auth Flow | 5/7 | 2 | Logout confirm, 401 handling |
| UX States | 3/4 | 1 | UiStateHandler unused |
| Data Layer | 6/7 | 1 | F4: runtime toggle |
| Design System | 4/4 | 0 | ✅ |
| Navigation | 2/5 | 3 | F3, F5 — blocked on nav framework |
| Constitution | 8/8 | 0 | ✅ |
| **Total** | **36/46** | **10** | |
