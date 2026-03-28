# User Flows: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/ux-brief.md)

---

## Flow 1: Fresh Login (No Existing Session)

**Trigger**: Driver opens the app for the first time, or after a full logout/session clear.

```
┌─────────────┐
│  App Launch  │
└──────┬──────┘
       │ No stored token
       ▼
┌─────────────────┐
│  Login Screen   │ ← Email + Password form
│  (Idle state)   │    Button: "Sign In" (disabled until both fields non-empty)
└──────┬──────────┘
       │ Tap "Sign In"
       ▼
┌─────────────────┐
│  Login Screen   │ ← Spinner replaces "Sign In" text
│  (Loading)      │    Fields disabled. Button disabled.
└──────┬──────────┘
       │
       ├─── 401 → Login Screen (Error: "Incorrect email or password.
       │                         Contact your administrator if the problem persists.")
       │
       ├─── Network error → Login Screen (Error: "Unable to connect.
       │                                   Check your internet connection and try again.")
       │
       └─── 200 OK (token received)
            │
            ▼
       ┌──────────────┐
       │ GET /auth/me  │  ← Silent. No visible state change. Login spinner continues.
       └──────┬───────┘
              │
              ├── Failure → Login Screen (Error: "Failed to resolve user profile.")
              │
              └── Success → role list received
                    │
                    ├── 0 supported roles → Unsupported Role Screen
                    │
                    ├── 1 supported role (DRIVER) → auto-select
                    │     │
                    │     ▼
                    │    POST /auth/select-role
                    │     │
                    │     ├── Failure → Login Screen (Error: "Failed to select role.")
                    │     │
                    │     └── Success → UserSession created
                    │                    │
                    │                    ▼
                    │              ┌──────────────────┐
                    │              │  Driver Shell     │
                    │              │  Active Trip tab  │ ← LANDING
                    │              └──────────────────┘
                    │
                    └── 2+ supported roles → Role Selector Screen
                          │
                          │ User taps "Driver"
                          ▼
                         POST /auth/select-role
                          │
                          ├── Failure → Login Screen (Error)
                          │
                          └── Success → UserSession created
                                         │
                                         ▼
                                   ┌──────────────────┐
                                   │  Driver Shell     │
                                   │  Active Trip tab  │ ← LANDING
                                   └──────────────────┘
```

### Timing Budget

| Phase | Target | Visible to User |
|-------|--------|----------------|
| Login API call | ≤ 1.5s | Spinner on button |
| getMe call | ≤ 0.5s | Spinner continues |
| selectRole call | ≤ 0.5s | Spinner continues |
| Shell render | ≤ 0.5s | Tabs appear |
| **Total** | **≤ 3s** | Login spinner → Driver shell |

---

## Flow 2: Session Restore (App Reopened with Valid Token)

**Trigger**: Driver relaunches the app (cold start) with a stored session token.

```
┌─────────────┐
│  App Launch  │
└──────┬──────┘
       │ Stored token found
       ▼
┌─────────────────────┐
│  Splash State       │ ← App icon/brand + subtle progress indicator
│  (Validating...)    │    Duration: ≤ 2s
└──────┬──────────────┘
       │ GET /auth/me (with stored token)
       │
       ├── 200 OK → Session valid
       │     │
       │     ▼
       │   ┌──────────────────┐
       │   │  Driver Shell     │ ← Resume on last-active tab
       │   │  (restored)       │    No login screen shown
       │   └──────────────────┘
       │
       ├── 401 → Token expired/revoked
       │     │
       │     ▼
       │   ┌─────────────────┐
       │   │  Login Screen   │ ← Clean entry. No error message.
       │   │  (fresh)        │    (Session just expired — not an error from user's perspective.)
       │   └─────────────────┘
       │
       └── Network error → no validation possible
              │
              ▼
            ┌──────────────────┐
            │  Driver Shell     │ ← Resume with stale token. Let the
            │  (optimistic)     │    per-request 401 interceptor catch expiry.
            └──────────────────┘
```

### Design Rules for Session Restore

- **No full login screen flash.** The driver must not briefly see the login screen and then jump to the shell. Use a splash/brand state while validating.
- **On 401 during restore: no error message.** The session simply expired. The login screen appears fresh, as if this is a new session. The driver re-enters credentials.
- **On network error during restore: optimistic resume.** The driver may have valid data cached. Let them continue until a real 401 is hit.

---

## Flow 3: Background Re-Validation

**Trigger**: Driver foregrounds the app after ≥ 30 minutes in background.

```
┌────────────────────┐
│  App Foregrounded   │
│  (≥ 30 min elapsed) │
└──────┬─────────────┘
       │
       ▼
  GET /auth/me (silent, no visible UI change)
       │
       ├── 200 OK → No action. Driver continues on current screen.
       │
       ├── 401 → Session expired
       │     │
       │     ▼
       │   Session cleared. Shell detached.
       │   ┌─────────────────────────────────────────────┐
       │   │  Login Screen                               │
       │   │  Message: "Your session has expired.        │
       │   │           Please sign in again."             │
       │   └─────────────────────────────────────────────┘
       │
       └── Network error → No action. Rely on per-request 401 interceptor.
```

### Design Rules for Re-Validation

- **< 30 minutes background**: No re-validation. Instant resume.
- **Re-validation in progress**: Invisible to the driver unless it takes > 1 second (then show a subtle inline indicator — not a full-screen blocker).
- **401 during re-validation**: Same logout behavior as a per-request 401, but the login screen **does** show the expiry message (unlike Flow 2, because the driver was actively using the app).

---

## Flow 4: In-App 401 (Session Expires During Use)

**Trigger**: Any API call returns HTTP 401 while the driver is actively using the app.

```
┌──────────────────────┐
│  Any Screen          │
│  (authenticated)     │
└──────┬───────────────┘
       │ API call returns 401
       ▼
  Global 401 interceptor fires
       │
       ▼
  Session cleared. Shell detached.
  ┌─────────────────────────────────────────────┐
  │  Login Screen                               │
  │  Message: "Your session has expired.        │
  │           Please sign in again."             │
  └─────────────────────────────────────────────┘
```

### Design Rules

- **No intermediate screen.** Transition directly from current screen to login.
- **Screen transition**: Standard 250ms fade (design system `motion.fade`).
- **Unsaved data is lost.** This is accepted in v1. No "save draft" prompt on 401.

---

## Flow 5: Explicit Logout

**Trigger**: Driver taps "Sign Out" in the Settings tab.

```
┌──────────────────┐
│  Settings Screen │
└──────┬───────────┘
       │ Tap "Sign Out"
       ▼
┌───────────────────────────────────┐
│  Confirmation Modal               │
│                                   │
│  Title: "Sign Out"                │
│  Body:  "Are you sure you want    │
│          to sign out?"            │
│                                   │
│  [Cancel]          [Sign Out]     │
└──────┬────────────────────────────┘
       │
       ├── "Cancel" → Dismiss modal. Stay on Settings.
       │
       └── "Sign Out"
            │
            ▼
       POST /auth/logout (best-effort)
       Local session cleared.
       Shell detached.
            │
            ▼
       ┌─────────────────┐
       │  Login Screen   │ ← Fresh. No error message. No expiry message.
       │  (clean entry)  │
       └─────────────────┘
```

### Design Rules

- **Destructive action → confirmation required.** Per design system: destructive actions always require a confirmation modal.
- **"Sign Out" button is the confirm action** (right-aligned, primary style). "Cancel" is the dismiss action (left-aligned, text button).
- **Logout is best-effort.** If the network call fails, local session is still cleared. The driver sees the login screen regardless.
- **No loading state for logout.** The transition is instant from the user's perspective — clear local state first, fire network call in the background.

---

## Flow 6: Role Selection (Multi-Role User)

**Trigger**: User has 2+ mobile-supported roles after login.

```
┌─────────────────────────────────────────┐
│  Role Selector Screen                   │
│                                         │
│  "Welcome, Ramesh Yadav"               │
│  "Select your role to continue"         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Driver                            │  │
│  │ View trips, earnings, vehicle info →  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Operations Executive              │  │
│  │ Manage fleet operations & dispatch →  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Design Rules

- **Each role is a tappable card.** Uses existing `RoleCard` composable (card with label + description + arrow).
- **Tapping a card immediately triggers role selection** (POST /auth/select-role). The card shows a loading state (spinner replaces arrow) while the call completes.
- **Back button on this screen**: Not available. The user must pick a role or close the app. There is no "go back to login" because they are already authenticated — they just haven't chosen a scope.
