# Tasks: Driver Auth & Session

**Input**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md) · [plan.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/plan.md) · [ux/](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/)  
**Scope**: `/mobile/**` only  
**API Mode**: Real (all 4 endpoints exist)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to user story from spec (US1–US5)
- Exact file paths included in every task description

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: New types and infrastructure that all user stories depend on.

- [x] T001 [P] Create `MessageType` enum (ERROR, INFO) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/model/MessageType.kt`

- [x] T002 [P] Create `SessionPersistence` class (save/restore/clear `UserSession` to/from `Settings`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/session/SessionPersistence.kt`
  - Store 8 keys: `auth_jwt`, `auth_user_id`, `auth_display_name`, `auth_active_role`, `auth_authorities` (JSON array), `auth_contact_id`, `auth_branch_id`, `auth_tenant_id`
  - `restore()` returns null if any required key is missing (corruption guard)
  - Must use `Settings` from multiplatform-settings (already a project dependency)

- [x] T003 Register `SessionPersistence` as Koin singleton in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/di/AppModule.kt`
  - Inject platform-provided `Settings` instance
  - Depends on: T002

**Checkpoint**: `MessageType`, `SessionPersistence`, and DI registration exist. No behavior changes yet.

---

## Phase 2: User Story 1 — Driver Logs In and Lands on Active Trip (P1) 🎯 MVP

**Goal**: A driver enters credentials, authenticates, resolves role, and lands on the Active Trip tab. Session is persisted for future restores.

**Independent Test**: Enter valid driver credentials → verify landing on Active Trip tab ≤ 3s. Multi-role user → verify role selector shown. No-mobile-role user → verify unsupported screen.

### Implementation

- [x] T004 [US1] Update `AuthState` sealed class to include `messageType: MessageType` on `Unauthenticated` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
  - `Unauthenticated(message: String? = null, messageType: MessageType = MessageType.ERROR)`
  - Update all existing usages of `Unauthenticated` to include `messageType`
  - Depends on: T001

- [x] T005 [US1] Wire `SessionPersistence.save()` into `AuthViewModel` after successful `selectRole` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
  - After `AuthState.Authenticated(session)` is set, call `sessionPersistence.save(session)`
  - Inject `SessionPersistence` via constructor (Koin)
  - Depends on: T003, T004

- [x] T006 [US1] Enhance `LoginScreen` to use `messageType` for error vs info color in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt`
  - Accept `messageType: MessageType` parameter (default `ERROR`)
  - `ERROR` → `MaterialTheme.colorScheme.error`
  - `INFO` → `MaterialTheme.colorScheme.tertiary` (or a suitable info-level semantic color)
  - Update `AppNavHost` call site to pass `messageType` from `AuthState.Unauthenticated`
  - Depends on: T004

**Checkpoint**: Login flow works end-to-end with session saved to Settings. Login screen shows error/info messages with correct color. Role resolution unchanged (already functional).

---

## Phase 3: User Story 2 — Session Persists Across App Restarts (P1)

**Goal**: A previously authenticated driver reopens the app and resumes without re-login, provided the session is valid.

**Independent Test**: Login → force-close app → reopen → verify driver lands on Active Trip tab without seeing login screen.

### Implementation

- [x] T007 [US2] Create `SessionRestoreScreen` composable (brand + spinner) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/SessionRestoreScreen.kt`
  - Layout: AxleOps title + "Fleet Management" subtitle + centered `CircularProgressIndicator` (24dp)
  - Uses existing `Spacing`, `MaterialTheme` tokens
  - No text like "Validating..." — spinner is sufficient

- [x] T008 [US2] Add `AuthState.Restoring` state to sealed hierarchy and implement cold-start restore logic in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
  - On ViewModel init: call `sessionPersistence.restore()`
    - null → `Unauthenticated` (clean, no message)
    - session found → `Restoring` state → call `authRepository.getMe(session.jwt)`
      - 200 OK → `Authenticated(storedSession)` — no role re-resolution
      - 401 → `sessionPersistence.clear()` → `Unauthenticated` (clean, no error message)
      - Network error → `Authenticated(storedSession)` (optimistic, per clarification Q1)
  - Depends on: T005

- [x] T009 [US2] Wire `Restoring` state to `SessionRestoreScreen` in `AppNavHost` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`
  - Add `is AuthState.Restoring -> SessionRestoreScreen()` branch
  - Transition to shell via `motion.fade` (150ms `AnimatedContent`)
  - Depends on: T007, T008

**Checkpoint**: Cold-start restore works. App shows splash briefly → driver shell (valid session) or login screen (expired session). No login-screen flash.

---

## Phase 4: User Story 3 — Driver Logs Out (P2)

**Goal**: Driver can explicitly sign out from Settings with confirmation. Session is cleared locally and server-side (best-effort).

**Independent Test**: Login → navigate to Settings → tap "Sign Out" → confirm → verify login screen shown and reopening app also shows login screen.

### Implementation

- [x] T010 [US3] Add logout confirmation `AlertDialog` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`
  - Add `showLogoutDialog` mutable state to `AuthenticatedContent`
  - On `onLogout` callback from `SettingsScreen`: set `showLogoutDialog = true`
  - Dialog: title "Sign Out", body "Are you sure you want to sign out?", confirm "Sign Out" (right), cancel "Cancel" (left)
  - On confirm: `sessionPersistence.clear()` → `authViewModel.logout()` → dismiss dialog
  - On cancel / backdrop tap: dismiss dialog
  - Depends on: T005

- [x] T011 [US3] Wire `SessionPersistence.clear()` into `AuthViewModel.logout()` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
  - `logout()` must: call `sessionPersistence.clear()`, fire `POST /auth/logout` (non-blocking, fire-and-forget via `viewModelScope.launch`), set state to `Unauthenticated` (clean, no message)
  - Depends on: T005

**Checkpoint**: Logout confirmation works. Post-logout reopen shows login screen (not restore).

---

## Phase 5: User Story 4 — Session Expires While App Is Active (P2)

**Goal**: Any 401 response triggers automatic logout with an info-level "session expired" message on the login screen.

**Independent Test**: Login → revoke Redis session server-side → trigger any API call → verify auto-logout with "Your session has expired" message in info color.

### Implementation

- [x] T012 [US4] Wire `sessionExpired` shared flow to set `Unauthenticated` with `MessageType.INFO` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`
  - When `sessionExpired` event is collected: call `sessionPersistence.clear()` then `authViewModel.forceLogout(message, INFO)`
  - Ensure only the first 401 in a burst triggers logout (existing `MutableSharedFlow(extraBufferCapacity = 1)` handles this)
  - Depends on: T004, T010

- [x] T013 [US4] Add `forceLogout(message: String, type: MessageType)` method to `AuthViewModel` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModel.kt`
  - Sets state to `Unauthenticated(message = "Your session has expired. Please sign in again.", messageType = MessageType.INFO)`
  - Calls `sessionPersistence.clear()`
  - Distinct from `logout()` (which is user-initiated, clean, no message)
  - Depends on: T011

**Checkpoint**: In-app 401 triggers logout with info message. Multiple concurrent 401s handled cleanly.

---

## Phase 6: User Story 5 — Background Re-Validation (P3)

**Goal**: App re-validates session when foregrounded after ≥ 30 min. Optimistic on network errors. Logout on 401.

**Independent Test**: Login → background app for 30+ min (or mock threshold) → foreground → verify silent continuation (valid) or logout (expired).

### Implementation

- [x] T014 [US5] Fix `SessionManager.revalidateSession()` to be optimistic on network errors in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/session/SessionManager.kt`
  - Current: catches all exceptions → sets `sessionExpired = true`
  - Fix: catch `ApiError.Unauthorized` → set `sessionExpired = true`; catch all other exceptions → do nothing (optimistic)
  - Add `sessionPersistence.clear()` call before emitting `sessionExpired`
  - Depends on: T003

**Checkpoint**: Background re-validation works correctly for all three cases (valid session, expired session, network error).

---

## Phase 7: Tests

**Purpose**: Unit tests for new code.

- [x] T015 [P] Create `SessionPersistenceTest` in `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/auth/session/SessionPersistenceTest.kt`
  - `save then restore returns identical session`
  - `restore with no stored data returns null`
  - `clear removes all keys — restore returns null after clear`
  - `partial keys stored returns null (corruption guard)`
  - Uses `MapSettings()` from multiplatform-settings-test
  - Depends on: T002

- [x] T016 [P] Create `AuthViewModelTest` in `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/auth/viewmodel/AuthViewModelTest.kt`
  - `initial state with no stored session is Unauthenticated`
  - `initial state with stored session is Restoring`
  - `login success with single role auto-selects and transitions to Authenticated`
  - `login failure transitions to Unauthenticated with ERROR messageType`
  - `restore with valid token transitions to Authenticated`
  - `restore with 401 transitions to Unauthenticated (clean)`
  - `restore with network error transitions to Authenticated (optimistic)`
  - `logout clears session and transitions to Unauthenticated (clean)`
  - `forceLogout sets INFO messageType`
  - Uses `MockAuthRepository` (existing) and `MapSettings()` for `SessionPersistence`
  - Depends on: T002, T008, T011, T013

**Run**: `cd mobile && ./gradlew :shared:allTests`

---

## Phase 8: Polish & Cross-Cutting

**Purpose**: Final verification and documentation.

- [ ] T017 Run design review checklist (65 items) from `specs/004-driver-auth-session/ux/design-review-checklist.md`
- [ ] T018 Walk through all 6 user flows from `specs/004-driver-auth-session/ux/user-flow.md` manually
- [ ] T019 Verify mock mode: toggle auth to MOCK → logout → login with any credentials → confirm mock session works → confirm debug indicator visibility

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Foundational)  ─── no deps ──→ can start immediately
    │
    ├── T001 (MessageType)  ──→ T004
    ├── T002 (SessionPersistence) ──→ T003 ──→ T005
    │
Phase 2 (US1: Login) ──→ depends on T001, T003
    │
    ├── T004 ──→ T005, T006
    │
Phase 3 (US2: Restore) ──→ depends on T005
    │
    ├── T007 ┐
    ├── T008 ┤──→ T009
    │        │
Phase 4 (US3: Logout) ──→ depends on T005
    │
    ├── T010, T011
    │
Phase 5 (US4: 401 Expiry) ──→ depends on T004, T010
    │
    ├── T012, T013
    │
Phase 6 (US5: Re-validation) ──→ depends on T003
    │
    └── T014
    │
Phase 7 (Tests) ──→ depends on T002, T008, T013
    │
    ├── T015, T016 (parallel)
    │
Phase 8 (Polish) ──→ depends on all above
```

### Parallel Opportunities

```bash
# Phase 1 — all three can run in parallel:
T001 (MessageType)        # new file, no deps
T002 (SessionPersistence) # new file, no deps

# Phase 2 — T004 and T006 touch different files:
T006 (LoginScreen)  # after T004 done, independent from T005

# Phase 7 — both test files are independent:
T015 (SessionPersistenceTest) # after T002
T016 (AuthViewModelTest)      # after T013
```

### User Story Independence

| Story | Can start after | Depends on other stories? |
|-------|----------------|--------------------------|
| US1 (Login) | Phase 1 complete | No |
| US2 (Restore) | US1 complete (needs persistence wiring) | Yes — US1 (T005) |
| US3 (Logout) | US1 complete (needs persistence wiring) | Yes — US1 (T005) |
| US4 (401 Expiry) | US1 + US3 complete | Yes — US1 (T004), US3 (T010) |
| US5 (Re-validation) | Phase 1 complete | No (only needs T003) |

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: T001, T002, T003
2. Complete Phase 2: T004, T005, T006
3. **STOP and VALIDATE**: Login works, session saved, error/info colors correct
4. All further stories are incremental additions

### Recommended Execution Order

```
T001 + T002 (parallel) → T003 → T004 → T005 + T006 (parallel)
→ T007 + T008 (parallel) → T009
→ T010 + T011 (parallel) → T012 + T013 (parallel)
→ T014
→ T015 + T016 (parallel)
→ T017, T018, T019
```

**Total tasks**: 19  
**Estimated diff size**: ~200-250 new/modified lines per phase (well within 300-line review guideline)

---

## Notes

- All tasks scope to `/mobile/**` — no FE/BE changes
- All 4 auth endpoints are real — no derived contracts needed
- `MockAuthRepository` already exists with canned responses — no mock work needed
- `DataSourceConfig.authSource` toggle already wired — no switchability work needed
- `contactId` is nullable in `UserSession` — downstream features handle null gracefully

---

## Fix Round 1

**Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/handoff/open-issues.md) · [design-review-round-1](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/reviews/design-review-round-1.md) · [qa-report-round-1](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/reviews/qa-report-round-1.md)  
**Prerequisite for all**: No spec, plan, or UX updates required unless noted.

### Must Fix (before Active Trip)

- [x] T-FIX-01 [OI-01] **Critical** — Fix background re-validation logout path in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`
  - Change `authViewModel.logout()` → `authViewModel.forceLogout("Your session has expired. Please sign in again.", MessageType.INFO)` in the `onAppForegrounded` handler (line ~93)
  - Add proper `MessageType` import (remove FQN at line 122 at the same time → OI-09)
  - **Prerequisite**: None
  - **Affects**: Logout/session-expiry handling
  - **Active Trip impact**: Low — UX trust issue, not a functional blocker

- [x] T-FIX-02 [OI-04] **Major** — Fix mock DRIVER authorities in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/repository/MockAuthRepository.kt`
  - Replace `listOf("TRIP_READ", "TRIP_UPDATE", "POD_UPLOAD")` with `listOf("TRIP_READ_OWN", "TRIP_UPDATE_STATUS", "VEHICLE_READ_ASSIGNED", "INSPECTION_CREATE_OWN", "INSPECTION_READ_OWN", "SERVICE_CREATE_BREAKDOWN", "REMINDER_READ_OWN")`
  - **Prerequisite**: None
  - **Affects**: Mock-vs-real auth/bootstrap behavior
  - **Active Trip impact**: ⚠️ Direct — mock authority checks will silently fail without this

### Should Fix (polish round)

- [x] T-FIX-03 [OI-02] **Major** — Add error-clear-on-keystroke in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt`
  - Wrap external `message` in local state; set to `null` on any `onValueChange` in either field
  - Reset local state when external `message` changes (new error from ViewModel)
  - **Prerequisite**: None
  - **Affects**: Login flow

- [x] T-FIX-04 [OI-03] **Major** — Add `AnimatedContent` transitions in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt`
  - Wrap the `when (state)` block in `AnimatedContent(targetState = authState)` with `fadeIn(tween(150)) + fadeOut(tween(150))`
  - Applies to all auth state transitions (Restoring→Authenticated, Restoring→Login, Authenticated→Login, etc.)
  - **Prerequisite**: None
  - **Affects**: Login flow, current-user bootstrap, logout/session-expiry handling (visual only)

- [x] T-FIX-05 [OI-06, OI-07, OI-08] **Minor** — LoginScreen polish batch in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt`
  - Add `ImeAction.Next` on email field + `FocusRequester` to move focus to password
  - Add `ImeAction.Done` on password field + `onDone` callback triggering login
  - Add `maxLines = 2, overflow = TextOverflow.Ellipsis` on message `Text`
  - Add `Modifier.semantics { liveRegion = LiveRegionMode.Polite }` on message `Text`
  - Add `contentDescription = "Signing in"` on loading spinner
  - **Prerequisite**: None
  - **Affects**: Login flow (interaction polish + accessibility)

### Doc Update

- [x] T-FIX-06 [OI-10] **Minor** — Update `data-dependencies.md §4` (Designer task, but engineer can fix factual error)
  - File: `specs/004-driver-auth-session/ux/data-dependencies.md`
  - Change "Session metadata → In-memory only" → "Full session persisted via `SessionPersistence` (Settings)"
  - Change "Last active role → Not persisted in v1" → "Active role persisted as part of session (spec FR-050)"
  - **Prerequisite**: None (factual correction, not a design decision)
  - **Affects**: None (documentation only)

- [x] T-FIX-07 [OI-11] **Minor** — Update `implementation-notes.md` to reflect current state
  - File: `specs/004-driver-auth-session/handoff/implementation-notes.md`
  - Remove stale "MockAuthRepository has ROLE_DRIVER prefix mismatch" note (already fixed)
  - Add note about mock authority mismatch (OI-04) if not yet fixed, or mark as resolved
  - **Prerequisite**: None
  - **Affects**: None (documentation only)

### Deferred

- OI-05 (`color.info` alias) — Designer decides; no code change needed unless they add a custom token
- OI-12 (SessionManager flow unification) — Architect note for future hardening; not required for v1

### Execution Order

```
T-FIX-01 + T-FIX-02 (parallel, must-fix) → T-FIX-03 + T-FIX-04 (parallel, should-fix)
→ T-FIX-05 (after T-FIX-03, same file) → T-FIX-06 + T-FIX-07 (parallel, docs)
```

**Total fix tasks**: 7 (+ 2 deferred)  
**Estimated diff size**: ~40 lines across 4 files
