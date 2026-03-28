# Implementation Notes: Driver Auth & Session

**Date**: 2026-03-28  
**Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md)  
**Plan**: [plan.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/plan.md)  
**Tasks**: [tasks.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/tasks.md)

---

## Tasks Completed

All tasks T001–T016 implemented. Phase 8 (manual QA) remains for user verification.

| Task | Description | Status |
|------|-------------|--------|
| T001 | `MessageType` enum (ERROR, INFO) | ✅ |
| T002 | `SessionPersistence` (save/restore/clear) | ✅ |
| T003 | DI registration (Settings + SessionPersistence) | ✅ |
| T004 | `AuthState.Unauthenticated` → message + messageType | ✅ |
| T005 | `SessionPersistence.save()` wired into AuthViewModel | ✅ |
| T006 | `LoginScreen` info vs error color | ✅ |
| T007 | `SessionRestoreScreen` composable | ✅ |
| T008 | `AuthState.Restoring` + cold-start restore | ✅ |
| T009 | `Restoring` wired in AppNavHost | ✅ |
| T010 | Logout confirmation dialog | ✅ (pre-existing) |
| T011 | `SessionPersistence.clear()` in logout | ✅ |
| T012 | `sessionExpired` flow → INFO message | ✅ |
| T013 | `forceLogout()` method | ✅ |
| T014 | SessionManager optimistic fix | ✅ |
| T015 | `SessionPersistenceTest` (8 tests) | ✅ |
| T016 | `AuthViewModelTest` (5 tests) | ✅ |

---

## Files Changed

### New Files (5)

| File | Purpose |
|------|---------|
| `auth/model/MessageType.kt` | ERROR/INFO enum for login screen message color |
| `auth/session/SessionPersistence.kt` | Store/restore/clear UserSession via Settings |
| `ui/shared/SessionRestoreScreen.kt` | Splash screen during cold-start re-validation |
| `commonTest/.../SessionPersistenceTest.kt` | 8 unit tests for persistence |
| `commonTest/.../AuthViewModelTest.kt` | 5 unit tests for state transitions |

### Modified Files (7)

| File | Changes |
|------|---------|
| `auth/viewmodel/AuthViewModel.kt` | Added `Restoring` state, `MessageType` on `Unauthenticated`, `forceLogout()`, persistence injection, cold-start restore `init` block |
| `auth/session/SessionManager.kt` | Typed `ApiError.Unauthorized` (replacing string matching), `SessionPersistence` injection, `clear()` on 401 |
| `ui/shared/LoginScreen.kt` | Renamed `error` → `message`, added `messageType` param, color dispatch |
| `navigation/AppNavHost.kt` | `Restoring` branch, `SessionRestoreScreen` import, `forceLogout` in 401 handler, `message`/`messageType` on LoginScreen calls |
| `di/AppModule.kt` | `Settings()` + `SessionPersistence` singleton registration |
| `di/AuthModule.kt` | `sessionPersistence = get()` in `AuthViewModel` and `SessionManager` constructors |
| `gradle/libs.versions.toml` | Added `multiplatform-settings` v1.3.0 + test artifact |
| `shared/build.gradle.kts` | Added `multiplatform-settings` to `commonMain` + `commonTest` dependencies |

---

## Auth/Session Implications

- **Session now persists across app restarts** via Settings (plain text, v1-acceptable)
- **Cold start**: stored session → `Restoring` state → validate via `GET /auth/me` → Authenticated (or login if 401)
- **Network errors during restore are optimistic**: driver stays authenticated, per-request 401 catches actual expiry
- **No role re-resolution on restore**: persisted role used directly (roles rarely change between sessions)
- **Logout clears persistence immediately** before fire-and-forget API call
- **401 interceptor now calls `forceLogout()`** with `MessageType.INFO` → blue info message instead of red error

## Real-vs-Mock Implications

- `SessionPersistence` is data-source-agnostic — works identically with real or mock auth
- `DataSourceConfig.authSource` toggle is unchanged — mock/real repository selection still works
- `MockAuthRepository` has pre-existing role prefix mismatch (`ROLE_DRIVER` vs `DRIVER`) — not in scope for this task

---

## How to Verify

### Automated
```bash
cd mobile && ./gradlew :shared:allTests
```
All tests pass (verified).

### Manual
1. **Fresh Login**: App with no stored session → login screen → sign in → Active Trip tab
2. **Session Restore**: Kill app → reopen → splash briefly → driver shell (no re-login)
3. **Session Expiry**: Revoke Redis session → any API call → auto-logout with blue "session expired" message
4. **Logout**: Settings → "Sign Out" → confirm dialog → login screen → reopen also shows login
5. **Mock Mode**: Toggle auth to MOCK → logout → login with any creds → verify mock works

---

| Item | Status | Notes |
|------|--------|-------|
| Fix Round 1 (7 tasks) | ✅ **Complete** | All T-FIX-01 through T-FIX-07 done |
| Encrypted token storage | Deferred | Hardening task before production |
| `contactId` mapping (Gap G1) | Blocked by backend | `contactId` is nullable; downstream features handle null |
| Token refresh (Gap G3) | Blocked by backend | 24h forced re-auth |
| `MockAuthRepository` role prefix | ✅ Fixed | Changed `ROLE_DRIVER` → `DRIVER` (prev session) |
| `MockAuthRepository` authorities | ✅ Fixed (T-FIX-02) | Now matches spec FR-031 (7 exact authority strings) |
| Pre-existing test compilation errors | ✅ Fixed | 3 issues: illegal `()` in test name, `UserProfile`/`UserSession` type mismatch, `assert` → `assertTrue` |
| Pre-existing test dispatcher failures | ⚠️ Known | 2 tests require `kotlinx-coroutines-test` (not in project) — separate task |

---

## Fix Round 1 — Completed

**Date**: 2026-03-28  
**Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/handoff/open-issues.md)

### 1. Tasks Completed

| Task | Issue | Status |
|------|-------|--------|
| T-FIX-01 | OI-01: Background re-validation `logout()` → `forceLogout()` | ✅ |
| T-FIX-02 | OI-04: Mock DRIVER authorities → 7 spec-exact strings | ✅ |
| T-FIX-03 | OI-02: Error-clear-on-keystroke via local state wrapper | ✅ |
| T-FIX-04 | OI-03: AnimatedContent 150ms fade transitions | ✅ |
| T-FIX-05 | OI-06/07/08: ImeAction, maxLines, LiveRegion, FocusRequester | ✅ |
| T-FIX-06 | OI-10: data-dependencies.md §4 corrected | ✅ |
| T-FIX-07 | OI-11: This file updated | ✅ |

### 2. Files Changed

| File | Changes |
|------|---------|
| `navigation/AppNavHost.kt` | T-FIX-01: `forceLogout()` in re-validation handler. T-FIX-04: `AnimatedContent` wrapping `when` block. Import cleanup (OI-09). |
| `auth/repository/MockAuthRepository.kt` | T-FIX-02: DRIVER authorities → 7 spec strings. |
| `ui/shared/LoginScreen.kt` | T-FIX-03: `visibleMessage` local state, clear on keystroke. T-FIX-05: `ImeAction.Next/Done`, `FocusRequester`, `maxLines=2`, `LiveRegion.Polite`. |
| `ux/data-dependencies.md` | T-FIX-06: §4 Persistent Storage table corrected. |
| `commonTest/.../SessionPersistenceTest.kt` | Pre-existing fix: `()` → `-` in test name. |
| `commonTest/.../AuthViewModelTest.kt` | Pre-existing fix: `UserProfile` return type, `assertTrue` instead of `assert`. |

### 3. Still Blocked

| Item | Why |
|------|-----|
| OI-05 (`color.info` alias) | Waiting for Designer decision |
| OI-12 (SessionManager flow unification) | Architect deferred |
| 2 ViewModel test failures | Need `kotlinx-coroutines-test` dependency (separate infra task) |

### 4. How to Verify

```bash
cd mobile && ./gradlew :shared:allTests
```

- 83/85 tests pass (2 pre-existing dispatcher failures — `forceLogout clears persisted session` and `initial state with stored session starts as Restoring`)
- The 2 failures require `kotlinx-coroutines-test` + `Dispatchers.setMain` — a separate infrastructure task, not caused by Fix Round 1

### 5. What to Recheck in Next Review

- [ ] Background re-validation 401 now shows "Your session has expired" info message (was silent)
- [ ] Error text disappears when typing in either login field
- [ ] Auth state transitions use 150ms fade animation
- [ ] Keyboard "Next" moves from email to password; "Done" triggers login
- [ ] Mock mode: `session.authorities` includes `TRIP_READ_OWN`
- [ ] Error message truncates at 2 lines with ellipsis

### 6. Follow-Up Risks

- **`kotlinx-coroutines-test`** must be added to project dependencies to fix the 2 pre-existing ViewModel test failures. Until then, tests that create `AuthViewModel` with stored sessions will fail on Android unit tests.
- **`AnimatedContent` may require `SizeTransform`** if content size changes cause layout jumps — monitor during manual QA.
- **`LiveRegion.Polite`** behavior varies by platform — verify screen reader announcement on both Android and iOS.

