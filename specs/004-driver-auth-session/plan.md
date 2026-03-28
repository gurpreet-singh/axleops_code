# Implementation Plan: Driver Auth & Session

**Branch**: `004-driver-auth-session` | **Date**: 2026-03-28 | **Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md)  
**UX Package**: [ux/](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/)  
**Target Role**: Driver | **Scope**: `/mobile/**` only

---

## Summary

This feature wires the driver's login-to-shell lifecycle into a fully functional, session-persistent, error-handling flow. All four backend auth endpoints (`/auth/login`, `/auth/me`, `/auth/select-role`, `/auth/logout`) already exist. The Mobile Foundation already provides the state machine skeleton (`AuthViewModel`), background re-validation (`SessionManager`), 401 interception, and all three pre-auth screens (`LoginScreen`, `RoleSelectorScreen`, `UnsupportedRoleScreen`).

**What this plan builds** (new code) and **what it enhances** (existing code):

| Category | Status | Work |
|----------|--------|------|
| Session persistence (Settings) | **New** | Store/restore full session to `Settings` |
| Cold-start restore path | **New** | `AuthViewModel` gains `Restoring` state + splash UI |
| `MessageType` enum | **New** | Distinguish error vs info messages on login screen |
| Logout confirmation dialog | **New** | `AlertDialog` in `SettingsScreen` / `AppNavHost` |
| Login screen enhancement | **Enhance** | Session-expiry info message (color.info styling) |
| `AuthViewModel` state machine | **Enhance** | Add `Restoring` state, `MessageType`, persistence calls |
| `SessionManager` | **Enhance** | Fix network-error behavior (optimistic, not strict) |
| Integration tests | **New** | ViewModel state transition tests, persistence round-trip |

---

## Technical Context

**Language/Version**: Kotlin 2.0 (KMP) — shared module targets Android + iOS  
**Primary Dependencies**: Compose Multiplatform, Ktor (HTTP), Koin (DI), kotlinx.serialization, kotlinx-datetime, multiplatform-settings  
**Storage**: `Settings` (multiplatform-settings) — `NSUserDefaults` on iOS, `SharedPreferences` on Android  
**Testing**: `kotlin.test` + Gradle `./gradlew :shared:allTests`  
**Target Platform**: Android 8+ / iOS 15+  
**Project Type**: KMP mobile app (shared business logic, platform-specific entry points)  
**Performance Goals**: Login → Driver Shell ≤ 3s; Session restore ≤ 2s  
**Constraints**: All implementation in `/mobile/**`; no FE/BE changes

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Existing-System-First | ✅ Pass | All 4 auth endpoints real. No invented APIs. |
| II. Role-Scoped Design | ✅ Pass | Target role: Driver. Stated in spec header. |
| III. Closest-Contract API Strategy | ✅ Pass | No derived contracts needed — all endpoints exist. |
| IV. Backend-Gap Transparency | ✅ Pass | 4 gaps documented (G1–G4) with mitigations. |
| V. State-Machine Fidelity | ✅ Pass | Auth state machine fully defined (8 states, all transitions). Not trip-related. |
| VI. Scoped Change Discipline | ✅ Pass | All changes in `/mobile/**`. No FE/BE modifications. |
| VII. Production-Grade Field UX | ✅ Pass | Loading/Error/Empty states defined for all screens. Offline behavior specified. |
| VIII. Testability & Switchability | ✅ Pass | Mock/Real toggle via `DataSourceConfig.authSource`. QA can swap. |
| IX. Reviewability | ✅ Pass | Plan breaks into 6 small tasks (<300 lines each). |

---

## Project Structure

### Documentation

```
specs/004-driver-auth-session/
├── spec.md              # Feature specification (clarified)
├── plan.md              # This file
├── ux/                  # UX package (7 files)
└── checklists/          # Requirements checklist
```

### Source Code (files touched / created)

```
mobile/shared/src/commonMain/kotlin/com/axleops/mobile/
├── auth/
│   ├── model/
│   │   ├── UserSession.kt              # EXISTS — no changes
│   │   └── MessageType.kt              # NEW — enum ERROR | INFO
│   ├── session/
│   │   ├── SessionManager.kt           # MODIFY — optimistic network-error handling
│   │   └── SessionPersistence.kt       # NEW — Settings-based store/restore
│   ├── viewmodel/
│   │   └── AuthViewModel.kt            # MODIFY — add Restoring state, persistence, MessageType
│   └── repository/
│       ├── AuthRepository.kt           # EXISTS — no changes
│       ├── RealAuthRepository.kt       # EXISTS — no changes
│       └── MockAuthRepository.kt       # EXISTS — no changes
├── di/
│   └── AppModule.kt                    # MODIFY — register SessionPersistence
├── navigation/
│   └── AppNavHost.kt                   # MODIFY — logout confirmation dialog, restore flow
└── ui/
    └── shared/
        ├── LoginScreen.kt              # MODIFY — MessageType-aware error/info styling
        ├── SettingsScreen.kt           # MODIFY — logout confirmation
        └── SessionRestoreScreen.kt     # NEW — splash/brand + spinner

mobile/shared/src/commonTest/kotlin/com/axleops/mobile/
├── auth/
│   ├── session/
│   │   └── SessionPersistenceTest.kt   # NEW — round-trip store/restore
│   └── viewmodel/
│       └── AuthViewModelTest.kt        # NEW — state transition tests
```

---

## Architecture

### 1. Login / Session Flow

```
LoginScreen → AuthViewModel.login(email, password)
  │
  ├── AuthRepository.login(email, password) → token
  │     ├── error → Unauthenticated(message, ERROR)
  │     └── success ──┐
  │                   ▼
  ├── AuthRepository.getMe(token) → UserProfile
  │     ├── error → Unauthenticated("Failed to resolve user profile.", ERROR)
  │     └── success → role list
  │           │
  │           ├── 0 supported → NoSupportedRoles
  │           ├── 1 supported → auto selectRole
  │           └── 2+ supported → RoleSelection(roles, displayName)
  │
  └── AuthRepository.selectRole(roleCode, token) → SelectRoleResponse
        ├── error → Unauthenticated(message, ERROR)
        └── success → UserSession constructed
              │
              ├── SessionPersistence.save(session)   ← NEW
              └── AuthState.Authenticated(session)
```

### 2. Session Persistence Strategy

**New class: `SessionPersistence`**

```kotlin
class SessionPersistence(private val settings: Settings) {
    fun save(session: UserSession) { /* write 8 keys to Settings */ }
    fun restore(): UserSession?    { /* read keys, return null if missing */ }
    fun clear()                    { /* remove all auth keys */ }
}
```

Keys stored: `auth_jwt`, `auth_user_id`, `auth_display_name`, `auth_active_role`, `auth_authorities` (JSON), `auth_contact_id`, `auth_branch_id`, `auth_tenant_id`.

- Written **after** successful `selectRole`.
- Read on cold start to populate `Restoring` state.
- Cleared on logout and 401.

### 3. Cold-Start Restore Flow

**New `AuthState.Restoring` state added to sealed hierarchy:**

```
App Launch → AuthViewModel checks SessionPersistence.restore()
  │
  ├── null (no stored session) → Unauthenticated (clean)
  │
  └── UserSession found → AuthState.Restoring
        │
        ├── GET /auth/me → 200 OK → Authenticated(storedSession)
        ├── GET /auth/me → 401 → SessionPersistence.clear() → Unauthenticated (clean, no error)
        └── GET /auth/me → network error → Authenticated(storedSession) [optimistic]
```

**UI for `Restoring` state**: `SessionRestoreScreen` — brand + subtitle + spinner. Duration ≤ 2s.

### 4. MessageType Enum

```kotlin
enum class MessageType { ERROR, INFO }
```

- `AuthState.Unauthenticated(message: String? = null, messageType: MessageType = ERROR)`
- Session expiry → `Unauthenticated("Your session has expired...", INFO)`
- Login failure → `Unauthenticated("Incorrect email or password...", ERROR)`
- `LoginScreen` uses `messageType` to pick `color.error` vs `color.info` (mapped to `colorScheme.tertiary` or a dedicated info semantic token)

### 5. Logout Flow Enhancement

Current state: `SettingsScreen` has a "Sign Out" button that calls `onLogout` directly.

Enhancement:
- `onLogout` callback now shows a confirmation `AlertDialog` (in `AppNavHost.AuthenticatedContent`)
- On confirm: `SessionPersistence.clear()` → `AuthViewModel.logout()` → navigate to Login (clean)
- On cancel: dismiss dialog
- Logout API call (`POST /auth/logout`) is fire-and-forget, non-blocking

### 6. SessionManager Fix

Current `SessionManager.revalidateSession()` calls `getMe()` and on **any** exception (including network error), sets `_sessionExpired.value = true`.

Fix: Only set `sessionExpired = true` on HTTP 401. On network errors, do nothing (optimistic, per clarification Q1).

```kotlin
// Before (broken):
catch (e: Exception) { _sessionExpired.value = true }

// After (fixed):
catch (e: ApiError.Unauthorized) { _sessionExpired.value = true }
catch (e: Exception) { /* network error — no action, rely on per-request 401 */ }
```

### 7. Mock vs Real Handling

No changes needed. The existing architecture already supports this:
- `DataSourceConfig.authSource` toggles between `MockAuthRepository` and `RealAuthRepository`
- `MockAuthRepository` returns canned sessions with `contactId` populated (G1 simulation)
- `SessionPersistence` is data-source-agnostic — it stores whatever session the repository layer produces

### 8. Downstream Guarantees

After implementation, later driver features can rely on:

| Guarantee | How |
|-----------|-----|
| Valid `UserSession` always available in authenticated screens | `AuthViewModel.authState` is `Authenticated(session)` |
| Global 401 handling | `sessionExpired` shared flow → auto-logout |
| Bearer token on all requests | `HttpClientFactory` injects from `SessionManager.currentSession` |
| Session survives app restarts | `SessionPersistence` store/restore cycle |
| Mock/real switchability | `DataSourceConfig.authSource` toggle |

---

## Implementation Phases

### Phase 1: Core Auth State Machine Enhancements
**Files**: `MessageType.kt` (NEW), `AuthViewModel.kt` (MODIFY), `SessionPersistence.kt` (NEW)
- Create `MessageType` enum
- Add `Restoring` state to `AuthState` sealed hierarchy
- Update `Unauthenticated` to include `messageType: MessageType`
- Create `SessionPersistence` class (store/restore/clear)
- Wire persistence into `AuthViewModel`: save on successful auth, restore on init, clear on logout

### Phase 2: Session Restore UI + Login Screen Enhancement
**Files**: `SessionRestoreScreen.kt` (NEW), `LoginScreen.kt` (MODIFY), `AppNavHost.kt` (MODIFY)
- Create `SessionRestoreScreen` composable (brand + spinner)
- Add `Restoring` state rendering to `AppNavHost`
- Enhance `LoginScreen` to use `messageType` for color selection (error vs info)

### Phase 3: Logout Confirmation + SessionManager Fix
**Files**: `AppNavHost.kt` (MODIFY), `SettingsScreen.kt` (MODIFY or leave as-is), `SessionManager.kt` (MODIFY)
- Add logout confirmation `AlertDialog` in `AppNavHost.AuthenticatedContent`
- Fix `SessionManager.revalidateSession()` to be optimistic on network errors
- Wire `SessionPersistence.clear()` into logout and 401 paths

### Phase 4: DI Registration
**Files**: `AppModule.kt` (MODIFY)
- Register `SessionPersistence` as a Koin singleton
- Inject `Settings` instance (platform-provided)

### Phase 5: Tests
**Files**: `SessionPersistenceTest.kt` (NEW), `AuthViewModelTest.kt` (NEW)
- `SessionPersistenceTest`: store/restore round-trip, clear, missing keys return null
- `AuthViewModelTest`: state transitions (login success, login failure, restore valid, restore 401, restore network error, logout)

### Phase 6: UX Package Alignment Verification
- Manual walkthrough of all 6 user flows against implementation
- Design review checklist pass (65 items)

---

## Readiness Classification

### ✅ Required Now (This Feature Builds)

| Item | Status |
|------|--------|
| `MessageType` enum | New code |
| `SessionPersistence` class | New code |
| `AuthState.Restoring` state | AuthViewModel enhancement |
| `SessionRestoreScreen` composable | New screen |
| Login screen info/error color | LoginScreen enhancement |
| Logout confirmation dialog | AppNavHost enhancement |
| `SessionManager` optimistic fix | Bug fix |
| Persistence DI registration | AppModule enhancement |
| Unit tests | New tests |

### 🔄 Can Be Mocked Now

| Item | Mock Strategy |
|------|---------------|
| `contactId` in session | `MockAuthRepository` returns canned value; real returns null |
| Driver-specific API responses | `MockAuthRepository` + canned fixtures |

### 📋 Later Real Integration Work

| Item | When |
|------|------|
| `contactId` resolution (Gap G1) | When backend adds `User → Contact` mapping |
| Encrypted token storage | Hardening pass before production launch |
| JWT refresh token | When backend adds refresh-token flow (Gap G3) |
| Phone/OTP login | When backend adds phone-login (Gap G4) |

### 🚫 Blocked by Backend

| Item | Backend Gap | Impact |
|------|-------------|--------|
| `contactId` | G1: No User→Contact mapping | Downstream features use `userId` workaround |
| Distinguishable deactivation error | G2: Same 401 for bad creds & deactivated | UX copy says "Contact your administrator" |
| Token refresh | G3: No refresh-token mechanism | 24h forced re-auth |

### ❓ Blocked by Product Ambiguity

**None.** All 5 clarification questions have been resolved. See [spec.md § Clarifications](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md).

---

## Backend Gaps

| Gap | Description | Mobile Mitigation | Needed By |
|-----|-------------|-------------------|-----------|
| G1 | No `User ↔ Contact` mapping | `contactId` nullable in `UserSession`; mock returns canned value | Active Trip feature |
| G2 | Indistinguishable 401 (bad creds vs deactivated) | Generic error message + "Contact administrator" | Acceptable for v1 |
| G3 | No JWT refresh token (24h TTL) | Accept 24h re-auth; document for QA | v2 improvement |
| G4 | Email-only login (no phone/OTP) | Accept for v1; field drivers use email accounts | v2 improvement |

---

## Verification Plan

### Automated Tests

**Command**: `cd /Users/ankit/a/fleetly/axleops_code/mobile && ./gradlew :shared:allTests`

#### SessionPersistenceTest (NEW)
- `save then restore returns identical session`
- `restore with no stored data returns null`
- `clear removes all keys, restore returns null after clear`
- `partial keys stored returns null (corruption guard)`

#### AuthViewModelTest (NEW)
- `initial state with no stored session is Unauthenticated`
- `initial state with stored session is Restoring`
- `login success with 1 role transitions to Authenticated`
- `login success with 2+ roles transitions to RoleSelection`
- `login success with 0 supported roles transitions to NoSupportedRoles`
- `login failure transitions to Unauthenticated with ERROR messageType`
- `restore with valid token transitions to Authenticated`
- `restore with 401 transitions to Unauthenticated (clean, no message)`
- `restore with network error transitions to Authenticated (optimistic)`
- `logout clears session and transitions to Unauthenticated (clean)`
- `401 event triggers logout with INFO messageType`

### Manual Verification (by user)

1. **Fresh Login**: Launch app with no stored session → login screen → enter valid credentials → verify landing on Active Trip tab
2. **Session Restore**: After successful login, kill the app → relaunch → verify splash screen briefly shown → driver shell restored without login
3. **Session Expiry**: Login, then revoke Redis session on backend → perform any API action → verify auto-logout with "session expired" info message (blue, not red)
4. **Logout**: Navigate to Settings → tap "Sign Out" → verify confirmation dialog → confirm → verify clean login screen
5. **Mock Mode**: Toggle auth to mock in debug settings → logout → login with any credentials → verify mock session works
