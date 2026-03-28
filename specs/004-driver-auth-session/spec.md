# Feature Specification: Driver Auth & Session

**Feature Branch**: `004-driver-auth-session`  
**Created**: 2026-03-28  
**Status**: Draft  
**Target Role**: Driver  
**Input**: User description: "Driver Auth & Session — login/session flow, current-user bootstrap, role resolution, driver eligibility, landing behavior, logout/session expiry, loading/error/retry, mock-vs-real, backend gaps, acceptance criteria, out-of-scope."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Driver Logs In and Lands on Active Trip (Priority: P1)

A driver opens the AxleOps mobile app, enters their email and password, and is authenticated. The system resolves their role(s), identifies that Driver is a mobile-supported role, and automatically lands them on the **Active Trip** tab — the driver's home screen. If the driver has only the Driver role, role selection is skipped entirely.

**Why this priority**: Without a successful login → role resolution → landing flow, no other driver feature can function. This is the critical-path prerequisite for every downstream feature.

**Independent Test**: Can be fully tested by entering valid driver credentials and verifying arrival at the Active Trip tab. Delivers the foundational entry point for all driver workflows.

**Acceptance Scenarios**:

1. **Given** a driver user with only the DRIVER role, **When** they enter valid credentials and submit, **Then** the system authenticates, auto-selects the Driver role (no role selector shown), and navigates to the Active Trip tab within 3 seconds.
2. **Given** a driver user with both DRIVER and OPERATIONS_EXECUTIVE roles, **When** they enter valid credentials, **Then** a role selector is shown with both roles; selecting Driver navigates to the Active Trip tab.
3. **Given** a user with no mobile-supported roles (e.g., only FINANCE_CONTROLLER), **When** they enter valid credentials, **Then** an "Unsupported Role" screen is shown explaining the app does not yet support their role, with no way to proceed past this screen.

---

### User Story 2 — Session Persists Across App Restarts (Priority: P1)

A driver who previously authenticated can close the app and reopen it without being asked to log in again — as long as their session token has not expired or been revoked server-side.

**Why this priority**: Drivers are field workers who frequently switch between apps, navigate, take calls, and return. Re-authentication friction directly impacts adoption and productivity.

**Independent Test**: Log in, force-close the app, reopen — verify the driver lands on the Active Trip tab without seeing the login screen.

**Acceptance Scenarios**:

1. **Given** a driver with a valid, non-expired session, **When** they reopen the app after closing it, **Then** the app skips the login screen and shows the Active Trip tab.
2. **Given** a driver whose session was revoked server-side (e.g., password changed, admin deactivation), **When** they reopen the app, **Then** the app detects the expired session, clears local state, and shows the login screen with no error (clean re-entry).
3. **Given** a driver who restores the app from background after ≥ 30 minutes, **When** the re-validation call (`GET /auth/me`) returns 401, **Then** the app shows the login screen.

---

### User Story 3 — Driver Logs Out (Priority: P2)

A driver can explicitly sign out from the Settings tab. Signing out clears all local session state and returns them to the login screen. The server session is also invalidated.

**Why this priority**: Required for multi-driver device sharing (common in fleet operations) and security compliance. Not blocking for basic driver flows but essential for production use.

**Independent Test**: Log in, navigate to Settings, tap "Sign Out", confirm — verify the login screen is shown and reopening the app does not auto-restore the previous session.

**Acceptance Scenarios**:

1. **Given** an authenticated driver, **When** they tap "Sign Out" in Settings, **Then** a confirmation dialog appears ("Are you sure you want to sign out?").
2. **Given** the confirmation dialog is shown, **When** the driver confirms, **Then** the local session is cleared, the server session is invalidated (`POST /auth/logout`), and the login screen is displayed.
3. **Given** the driver confirms logout but the network is unavailable, **When** logout is attempted, **Then** the local session is still cleared and the login screen is shown (best-effort server invalidation).
4. **Given** the driver cancels the logout dialog, **When** they dismiss it, **Then** they remain on the Settings tab with no state change.

---

### User Story 4 — Session Expires While App Is Active (Priority: P2)

While a driver is actively using the app, if the backend returns a 401 Unauthorized response (token expired or revoked), the app automatically signs the driver out and returns them to the login screen with an appropriate message.

**Why this priority**: Prevents drivers from operating on stale or revoked sessions, which could lead to data submission failures or security risks.

**Independent Test**: Can be simulated by revoking the Redis session server-side during active app use and observing auto-logout behavior.

**Acceptance Scenarios**:

1. **Given** an authenticated driver using the app, **When** any API call returns HTTP 401, **Then** the app clears the session, navigates to the login screen, and shows a message: "Your session has expired. Please sign in again."
2. **Given** the driver is on a screen with unsaved data, **When** a 401 is received, **Then** the session is cleared and login screen shown (unsaved data is not preserved — this is acceptable for v1).

---

### User Story 5 — Background Re-Validation (Priority: P3)

When a driver brings the app back to the foreground after ≥ 30 minutes in the background, the system silently re-validates the session. If the session is still valid, the driver continues uninterrupted. If invalid, they are returned to the login screen.

**Why this priority**: Adds proactive session safety for long background periods rather than relying solely on the next API call to detect expiry. Nice-to-have polish for field reliability.

**Independent Test**: Log in, background the app for 30+ minutes (or mock the threshold), foreground it — verify either silent continuation or logout depending on session validity.

**Acceptance Scenarios**:

1. **Given** a driver with a valid session, **When** they foreground the app after 30+ minutes, **Then** a silent `GET /auth/me` call is made; on success, the driver continues on their current screen with no visible interruption.
2. **Given** a driver whose session expired during the background period, **When** they foreground the app, **Then** the re-validation returns 401, the session is cleared, and the login screen is shown.
3. **Given** a driver who foregrounds the app after < 30 minutes, **Then** no re-validation occurs — the app resumes immediately.
4. **Given** the re-validation call fails due to network error (not 401), **Then** no action is taken — the app relies on the next regular API call's 401 interceptor for eventual detection.

---

### Edge Cases

- **What happens when the driver enters incorrect credentials?** → Login screen shows an error message ("Invalid email or password"). The driver can retry immediately. No lockout mechanism in v1 (backend does not enforce one).
- **What happens when the backend is unreachable during login?** → Login screen shows a network error message ("Unable to connect. Check your internet connection and try again.") with a retry option.
- **What happens when the driver's account is deactivated?** → Login returns 401 with no special message distinguishing deactivation from bad credentials (backend limitation — see Gap G2).
- **What happens when the JWT is valid but the Redis session was evicted (e.g., Redis restart)?** → The JwtAuthFilter checks Redis session validity; an evicted session returns 401. The mobile app treats this identically to token expiry.
- **What happens when a driver user exists but has zero roles assigned?** → `/auth/me` returns an empty role list. The mobile app shows the "Unsupported Role" screen.
- **What happens during role resolution if `getMe` fails?** → The user is returned to the Unauthenticated state with error message "Failed to resolve user profile."

---

## Requirements *(mandatory)*

### Functional Requirements

#### Login Flow

- **FR-001**: The system MUST allow a driver to authenticate using email and password.
- **FR-002**: On successful authentication, the system MUST receive a JWT token from the backend (`POST /auth/login`).
- **FR-003**: The system MUST fetch the user profile and role list (`GET /auth/me`) immediately after login.
- **FR-004**: The login screen MUST display clear error messages for invalid credentials and network failures, with distinct messages for each.
- **FR-005**: The login form MUST prevent submission while a login request is in progress (no double-submit).

#### Role Resolution

- **FR-010**: The system MUST filter the user's backend roles to only mobile-supported roles (roles registered in the RoleRegistry).
- **FR-011**: The "ALL" meta-role returned by the backend MUST be excluded from mobile role resolution.
- **FR-012**: If exactly one mobile-supported role is found, the system MUST auto-select that role without showing a role selector.
- **FR-013**: If multiple mobile-supported roles are found, the system MUST show a role selector screen listing those roles.
- **FR-014**: If zero mobile-supported roles are found, the system MUST show an unsupported role screen with a clear explanation.
- **FR-015**: After role selection (auto or manual), the system MUST request a role-scoped JWT (`POST /auth/select-role`).

#### Current-User Bootstrap

- **FR-020**: The system MUST construct a session object containing: user ID, display name, active role, JWT, authorities, branch ID, and tenant ID.
- **FR-021**: The session object MUST be available to all authenticated screens for authorization decisions and API calls.
- **FR-022**: The session MUST include a `contactId` field (nullable) to link the authenticated user to their driver Contact record. (Gap G1: backend does not yet provide this — initially null, resolved when backend adds the mapping.)

#### Driver Eligibility & Access Rules

- **FR-030**: The app MUST treat a user as an eligible driver if and only if they hold the `DRIVER` role (backend enum: `Role.DRIVER`) and that role is registered as mobile-supported.
- **FR-031**: The Driver role's authorities (`TRIP_READ_OWN`, `TRIP_UPDATE_STATUS`, `VEHICLE_READ_ASSIGNED`, `INSPECTION_CREATE_OWN`, `INSPECTION_READ_OWN`, `SERVICE_CREATE_BREAKDOWN`, `REMINDER_READ_OWN`) MUST be embedded in the session and available for downstream feature authorization.
- **FR-032**: A deactivated user (`isActive = false`) MUST NOT be able to authenticate (enforced by backend — mobile trusts the 401 response).

#### Landing Behavior

- **FR-040**: After successful authentication and driver role resolution, the system MUST navigate the driver to the Active Trip tab.
- **FR-041**: The landing tab identity ("active-trip") MUST be driven by the RoleConfig, not hardcoded in navigation logic.

#### Session Persistence

- **FR-050**: The system MUST persist the full session locally (token, active role, userId, branchId, tenantId) using the existing `Settings` (multiplatform-settings) wrapper so the driver is not re-prompted for credentials or role selection on app restart. Encrypted storage (Keychain / EncryptedSharedPreferences) is deferred — acceptable for v1 given the 24h token TTL and server-side validation.
- **FR-051**: On app launch, the system MUST check for a locally persisted session and, if present, validate the token with the backend (`GET /auth/me`) before proceeding. Role re-resolution MUST NOT run on restore — the persisted role is used directly.
- **FR-052**: If local session validation returns HTTP 401, the system MUST clear the local session and show the login screen. On network error (non-401), the system MUST resume optimistically with the stored token — the per-request 401 interceptor provides a safety net.
- **FR-053**: If a driver's role is revoked between sessions, the app relies on per-request 401/403 responses from role-scoped APIs to detect the change reactively. No proactive role re-check on restore.

#### Logout

- **FR-060**: The system MUST provide a "Sign Out" action in the Settings tab.
- **FR-061**: Before signing out, the system MUST show a confirmation dialog.
- **FR-062**: On confirmed logout, the system MUST: (1) call `POST /auth/logout` to invalidate the server session, (2) clear the local session, (3) navigate to the login screen.
- **FR-063**: If the logout API call fails (network error), the system MUST still clear the local session and navigate to the login screen (best-effort server invalidation).

#### Session Expiry

- **FR-070**: The system MUST intercept HTTP 401 responses globally and trigger automatic logout.
- **FR-071**: On 401-triggered logout, the system MUST clear the session, detach the authenticated shell, and show the login screen.
- **FR-072**: The system MUST re-validate the session when the app returns from background after ≥ 30 minutes, using `GET /auth/me`.
- **FR-073**: The 30-minute threshold MUST be configurable (not hardcoded in business logic, though a constant is acceptable for v1).

#### Loading / Error / Retry States

- **FR-080**: The login screen MUST show a loading indicator while authentication is in progress (no blank or frozen state).
- **FR-081**: The login screen MUST show error messages for: invalid credentials, network failure, account deactivation, and unexpected errors. Session expiry notifications MUST use `MessageType.INFO` (rendered with `color.info`) to distinguish them from user-caused errors (`MessageType.ERROR`, rendered with `color.error`).
- **FR-082**: After a login error, the driver MUST be able to retry by re-submitting credentials without refreshing or restarting the app.
- **FR-083**: The role selector screen MUST show a loading indicator while role selection is in progress.
- **FR-084**: If role selection fails, the system MUST show an error and allow retry or return to the login screen.
- **FR-085**: Background re-validation MUST show a subtle re-validating indicator (optional — may be invisible to the user if latency < 1 second).

### Key Entities

- **UserSession**: Represents the authenticated driver's active session — includes user ID, display name, active role (AppRole.DRIVER), JWT, authorities list, contactId (nullable), branchId, tenantId.
- **AuthState**: Sealed state hierarchy tracking: Unauthenticated (with optional message + `MessageType.ERROR | INFO`), LoggingIn, RoleSelection, NoSupportedRoles, Authenticated.
- **UserProfile**: Intermediate representation of `/auth/me` response — user identity and all backend roles (pre-filtered).
- **LoginResult**: Success (token) or Error (message) result of login attempt.

---

## Mock-vs-Real Expectations

### Real-Backend Mode

| Endpoint | Contract | Status |
|----------|----------|--------|
| `POST /auth/login` | Accepts `{ username, password }`, returns `{ token, user: AuthUserResponse }` | ✅ Exists |
| `GET /auth/me` | Bearer token → `AuthUserResponse` (id, fullName, roles[], authorities[], tenantId, branchId) | ✅ Exists |
| `POST /auth/select-role` | `{ roleCode }` → `{ token, user: AuthUserResponse }` | ✅ Exists |
| `POST /auth/logout` | Bearer token → invalidates Redis session | ✅ Exists |

All four endpoints exist and are functional. No derived contracts are needed for the auth/session feature.

### Mock-Backend Mode

- `MockAuthRepository` accepts any email/password, returns canned mock JWT and user profile.
- Mock user profile includes `DRIVER` + `OPERATIONS_EXECUTIVE` roles to exercise the role selector flow.
- Mock JWTs are prefixed with `mock-` for easy identification in debug logs.
- Mock `selectRole` returns a session with role-appropriate authorities.
- Mock mode is switchable via `DataSourceConfig.authSource` build-time toggle.

### QA Expectations

- QA MUST be able to test the complete auth flow in mock mode without a running backend.
- QA MUST be able to test against a real backend with seeded driver users.
- QA MUST be able to verify 401 interception by revoking the Redis session server-side and observing auto-logout.
- QA MUST be able to modify mock JSON fixtures to simulate different role combinations (single role, multi-role, no supported roles).

---

## Backend Assumptions & Gaps

### Confirmed Backend Behavior (Source of Truth)

| Aspect | Detail |
|--------|--------|
| **Auth mechanism** | JWT + Redis session (24h TTL). Stateless validation with server-side revocation. |
| **Multi-role support** | Users can have multiple `Role` enum assignments. Login returns all roles; `/select-role` issues a role-scoped JWT. |
| **DRIVER role** | Backend `Role.DRIVER` with 7 authorities (TRIP_READ_OWN, TRIP_UPDATE_STATUS, VEHICLE_READ_ASSIGNED, INSPECTION_CREATE_OWN, INSPECTION_READ_OWN, SERVICE_CREATE_BREAKDOWN, REMINDER_READ_OWN). |
| **Tenant scoping** | Every user belongs to a tenant. JWT embeds tenantId. JwtAuthFilter sets TenantContext. |
| **Branch scoping** | Users have an optional branch association. JWT embeds branchId. |
| **Deactivation** | `User.isActive = false` → login rejected with 401. |
| **Session TTL** | RedisSessionService uses 24-hour TTL. No refresh-token mechanism. |

### Known Gaps

| Gap ID | Description | Impact | Mitigation |
|--------|-------------|--------|------------|
| **G1** | No `User ↔ Contact` mapping in backend. The backend `User` entity does not have a foreign key to the `Contact` (driver record) entity. Mobile needs `contactId` to scope driver-specific queries (e.g., "my trips"). | Driver features downstream (Active Trip, Past Trips) will not be able to resolve "my" data without this link. | `UserSession.contactId` is nullable. Initially null. Mock returns a canned value. Backend will need to add a `contact_id` column to `users` table and include it in `AuthUserResponse`. |
| **G2** | No distinguishable error for deactivated accounts vs. bad credentials. Both return HTTP 401 with no body. | Driver sees generic "Invalid credentials" even if their account was deactivated by admin. | Accept this for v1. Document in UX copy: "Incorrect email or password. Contact your administrator if the problem persists." |
| **G3** | No JWT refresh-token mechanism. Sessions expire after 24 hours (Redis TTL) with no way to silently extend. | Drivers on multi-day trips will be logged out after 24 hours and must re-authenticate. | Accept for v1. Inform QA of the 24h limit. Future: add refresh-token flow to backend. |
| **G4** | Backend login field is `username` (maps to `email`). No dedicated phone-login or OTP mechanism. | Drivers in the field may not remember their email. | Accept email-based login for v1. Phone/OTP login is out of scope. |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A driver with valid credentials can complete login and see the Active Trip tab within 3 seconds (on a stable network).
- **SC-002**: A driver who closes and reopens the app resumes their session without re-entering credentials in 100% of cases where the session is valid.
- **SC-003**: A session-expired driver is redirected to the login screen within 2 seconds of the 401 response, with zero dead-end or stuck states.
- **SC-004**: The logout flow from tap to login screen completes within 2 seconds.
- **SC-005**: QA can exercise both mock and real auth flows without code changes — only a configuration toggle.
- **SC-006**: 100% of auth error scenarios (invalid credentials, network failure, deactivated account) show a user-visible message — no blank or frozen screens.

---

## What This Feature Guarantees to Later Driver Features

Later driver features (Active Trip, Past Trips, Earnings, Settings content) can rely on:

1. **A valid `UserSession` object** — always available when the user is in an authenticated screen. Contains `userId`, `activeRole` (DRIVER), `jwt`, `authorities`, `branchId`, `tenantId`, and `contactId` (nullable until G1 is resolved).
2. **Role-scoped navigation** — the authenticated shell is always configured for the Driver role's tabs (Active Trip, Past Trips, Earnings, Settings). Later features only need to implement the screen content.
3. **Global 401 interception** — any API call that returns 401 will automatically trigger logout. Feature screens do not need to handle session expiry individually.
4. **Bearer token injection** — the HttpClient is pre-configured to attach the session JWT to all requests.
5. **Mock/real switchability** — the repository layer abstracts data source. Feature repositories can follow the same pattern.
6. **Session re-validation** — the SessionManager handles background re-validation. Feature screens do not need to check session freshness.

## What This Feature Does NOT Yet Guarantee

1. **`contactId` resolution** — downstream features that need "my trips" or "my vehicle" queries must handle `contactId == null` gracefully until backend Gap G1 is resolved.
2. **Offline login** — there is no cached-credential or offline authentication mechanism. The driver must be online to log in.
3. **Multi-device session management** — the backend does not invalidate old sessions when a new login occurs. Multiple devices can hold active sessions simultaneously.
4. **Token refresh** — there is no silent token renewal. After 24 hours the driver must re-authenticate.
5. **Push notification registration** — device token registration for push notifications is not part of this feature.
6. **Biometric authentication** — fingerprint/face unlock is not included in v1.

## Risks if the Auth/Session Model Is Underdefined

| Risk | Consequence | Likelihood |
|------|-------------|------------|
| G1 (`contactId` gap) is not resolved before Active Trip feature starts | Active Trip feature must use a workaround (e.g., search by driver name), creating fragile coupling | **High** — this is a known gap |
| 24-hour session TTL (G3) causes frequent logouts for drivers on multi-day trips | Driver frustration, incomplete trip data entry, support tickets | **Medium** — depends on trip duration patterns |
| No offline login means drivers in low-connectivity areas cannot start using the app after a cold restart | Field adoption friction in rural / poor-coverage regions | **Medium** — mitigated by session persistence (driver stays logged in if app is not killed) |
| Role resolution logic assumes `RoleRegistry` is the single source of truth. If a role is registered but its screens are not implemented, the app may show empty tabs. | Broken UX for partially-implemented roles | **Low** — only Driver and Ops Exec are registered; Driver screens will be implemented first |

---

## Explicitly Out of Scope

The following items are intentionally excluded from this feature and belong to later features or future iterations:

- ❌ **Active Trip screen content** — this feature lands on the Active Trip tab but does not populate it with trip data.
- ❌ **Past Trips, Earnings, or Settings screen content** — tab shells exist but content is in later features.
- ❌ **Driver profile editing** — viewing/editing profile details is a separate feature.
- ❌ **Push notification registration** — device token management is a separate concern.
- ❌ **Biometric login (Face ID / Touch ID)** — future enhancement.
- ❌ **Phone/OTP login** — requires backend changes not in scope.
- ❌ **Offline authentication / cached credentials** — future enhancement for field reliability.
- ❌ **Multi-device session conflict resolution** — no "other device logged in" handling.
- ❌ **JWT refresh-token flow** — requires backend changes.
- ❌ **Password reset / forgot password flow** — separate feature.
- ❌ **User registration / sign-up** — drivers are created by admins, not self-registered.
- ❌ **Backend changes** — this feature uses existing backend APIs as-is. Gap notes document required backend changes for future implementation.

---

## Assumptions

- The Mobile Foundation (specs/003) is fully implemented — including design system, navigation infrastructure, Decompose integration, Ktor HTTP client, Koin DI, and mock/real data source switching.
- The backend is running with the existing `/auth/*` endpoints and Redis session management. Seeded driver users are available for testing.
- Email is the only credential identifier for v1. All driver users have email-based accounts.
- Session tokens have a 24-hour TTL (based on `RedisSessionService.SESSION_TTL`). No refresh mechanism exists.
- The app targets both Android and iOS via KMP. No platform-specific auth handling is required beyond what the Mobile Foundation provides.
- The `DataSourceConfig` mechanism exists for toggling between mock and real data sources at build time (or via debug menu).

---

## Clarifications

### Session 2026-03-28

- Q: Session restore on network error — clear session (strict) or resume with stale token (optimistic)? → A: **Optimistic** — resume with stale token on network error; only clear session on explicit 401. Rationale: drivers in tunnels/dead zones should not be forced to re-login. Per-request 401 interceptor catches actual expiry.
- Q: Session restore — re-run role resolution or persist full session (token + role)? → A: **Persist full session** — store token + role. Skip role re-resolution on restore. Role changes detected reactively via 401/403 on role-scoped APIs. Rationale: roles rarely change between sessions; re-resolving adds latency and complexity.
- Q: Token storage — encrypted (Keychain/EncryptedSharedPreferences) or plain Settings? → A: **Plain Settings** for v1. JWT has 24h TTL and is server-validated. Encrypted storage is a hardening task for later, not a v1 blocker.
- Q: Session persistence implementation — owned by this feature or Foundation gap? → A: **This feature builds it.** Foundation provided abstractions (SessionManager, AuthViewModel, Settings library) but not the store/restore/validate wiring. This feature implements the full persistence cycle as new code.
- Q: Session expiry message on login screen — error color or info color? → A: **Add MessageType enum** — `Unauthenticated(message: String?, type: MessageType)` where `MessageType = ERROR | INFO`. LoginScreen uses `type` to pick `color.error` vs `color.info`. Keeps state hierarchy clean without adding a new sealed subclass.
