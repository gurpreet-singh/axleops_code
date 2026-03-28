# State Inventory: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/ux-brief.md)

---

## 1. AuthState Machine (Complete)

The app's auth lifecycle is a finite state machine. Engineering must implement every state and every transition listed here. No other states or transitions should exist.

```
                    ┌─────────────────┐
            ┌──────│ Unauthenticated  │◄──────────────────────────────────┐
            │      │ (error?)         │◄──────────────┐                   │
            │      └────────┬─────────┘               │                   │
            │               │ submit credentials      │                   │
            │               ▼                         │                   │
            │      ┌─────────────────┐                │                   │
            │      │   LoggingIn      │                │                   │
            │      └────────┬─────────┘                │                   │
            │               │                         │                   │
            │    ┌──────────┼──────────┐              │                   │
            │    │          │          │              │                   │
            │    ▼          ▼          ▼              │                   │
            │  login     getMe      getMe             │                   │
            │  fails     fails      succeeds          │                   │
            │    │         │          │               │                   │
            │    └──┬──────┘     ┌────┴────┐          │                   │
            │       │            │         │          │                   │
            │       ▼            ▼         ▼          │                   │
            │  Unauthenticated  0 roles  1+ roles     │                   │
            │  (with error)      │         │          │                   │
            │                    ▼         │          │                   │
            │          ┌──────────────┐    │          │                   │
            │          │ NoSupported  │    │          │                   │
            │          │ Roles        │    │          │                   │
            │          └──────────────┘    │          │                   │
            │                         ┌────┴────┐     │                   │
            │                         │         │     │                   │
            │                         ▼         ▼     │                   │
            │                      1 role    2+ roles  │                   │
            │                      (auto)   (manual)   │                   │
            │                         │         │     │                   │
            │                         │    ┌────┴────┐│                   │
            │                         │    │RoleSel. ││                   │
            │                         │    │         ││                   │
            │                         │    └────┬────┘│                   │
            │                         │         │     │                   │
            │                         └────┬────┘     │                   │
            │                              │          │                   │
            │                      selectRole call    │                   │
            │                              │          │                   │
            │                    ┌─────────┼─────┐    │                   │
            │                    │               │    │                   │
            │                    ▼               ▼    │                   │
            │               succeeds          fails   │                   │
            │                    │               │    │                   │
            │                    ▼               └────┘                   │
            │         ┌──────────────────┐                                │
            │         │  Authenticated    │                                │
            │         │  (UserSession)    │────── logout ──────────────────┘
            │         └────────┬─────────┘        (explicit or 401)
            │                  │
            │                  └── 401 response on any API call ──────────┘
            │
            │  session restore (app launch with stored token)
            └──▶ Restoring ──▶ getMe
                                ├── 200 → Authenticated
                                ├── 401 → Unauthenticated (clean, no error)
                                └── network error → Authenticated (optimistic)
```

---

## 2. Complete State Table

| State ID | State Name | UI Shown | Entry Conditions | Exit Transitions |
|----------|-----------|----------|-----------------|------------------|
| S1 | **Unauthenticated** (clean) | Login Screen, no error | App launch (no token), successful logout, 401 on session restore | → S3 (submit credentials) |
| S2 | **Unauthenticated** (error) | Login Screen, with error message | Login failure, getMe failure, selectRole failure | → S3 (resubmit), clears error on keystroke |
| S2a | **Unauthenticated** (session expired) | Login Screen, with info message | 401 from re-validation or in-app API call | → S3 (submit credentials) |
| S3 | **LoggingIn** | Login Screen, loading spinner | Credential submission from S1 or S2 | → S2 (failure), → S4/S5/S6/S7 (success) |
| S4 | **NoSupportedRoles** | Unsupported Role Screen | getMe returns roles, none are mobile-supported | Dead end (close app) |
| S5 | **RoleSelection** | Role Selector Screen | getMe returns 2+ mobile-supported roles | → S3 (role selected → loading), → S2 (selectRole failure), → S7 (selectRole success) |
| S6 | **Restoring** | Splash/brand state with spinner | App launch with stored token | → S7 (valid), → S1 (401), → S7 (network error, optimistic) |
| S7 | **Authenticated** | Driver Shell (tabs + content) | Successful selectRole or successful session restore | → S1 (explicit logout), → S2a (401) |

---

## 3. State → Message Mapping

Every state that shows text to the driver has an exact message. Engineering must use these strings.

| State | Message | Style |
|-------|---------|-------|
| S2 (bad credentials) | "Incorrect email or password. Contact your administrator if the problem persists." | `color.error`, `type.body` |
| S2 (network error) | "Unable to connect. Check your internet connection and try again." | `color.error`, `type.body` |
| S2 (getMe failure) | "Failed to resolve user profile." | `color.error`, `type.body` |
| S2 (selectRole failure) | "Failed to select role: [error detail]" | `color.error`, `type.body` |
| S2a (session expired) | "Your session has expired. Please sign in again." | `color.info`, `type.body` |
| S4 (unsupported role) | "Your assigned role is not yet available on mobile. Please use the AxleOps web portal." | `color.on.surface.variant`, `type.body` |
| S5 (role selector heading) | "Welcome, [displayName]" | `type.headline.medium` |
| S5 (role selector subtitle) | "Select your role to continue" | `type.body`, `color.on.surface.variant` |

---

## 4. Transition Timing

| Transition | Animation | Duration |
|------------|-----------|----------|
| S1 → S3 | None (instant state change within Login Screen) | 0ms |
| S3 → S7 | Fade from Login to Driver Shell | 150ms (`motion.fade`) |
| S5 → S7 | Fade from Role Selector to Driver Shell | 150ms (`motion.fade`) |
| S6 → S7 | Fade from Splash to Driver Shell | 150ms (`motion.fade`) |
| S6 → S1 | Fade from Splash to Login | 150ms (`motion.fade`) |
| S7 → S1/S2a | Fade from Driver Shell to Login | 150ms (`motion.fade`) |
| Any → S4 | Fade to Unsupported Role | 150ms (`motion.fade`) |

---

## 5. Session Persistence States

| Situation | Stored Token | Action |
|-----------|-------------|--------|
| First ever launch | None | → S1 (Login) |
| After successful login | Token stored locally | On next launch → S6 (Restore) |
| After explicit logout | Token cleared | On next launch → S1 (Login) |
| After 401 forced logout | Token cleared | On next launch → S1 (Login) |
| App killed during LoggingIn (S3) | No token yet stored | On relaunch → S1 (Login) |
| App killed during Authenticated (S7) | Token persisted | On relaunch → S6 (Restore) |

---

## 6. Mock vs Real: Visible Differences

In **debug/QA builds only**, the following differences are visible:

| Aspect | Real Mode | Mock Mode |
|--------|-----------|-----------|
| Login credentials | Must match seeded backend users | Any email/password accepted |
| JWT token prefix | Standard JWT format | Prefixed with `mock-` |
| Debug overlay | Shows "REAL" indicator | Shows "MOCK" indicator |
| Role list from getMe | Real user's roles | Fixed: DRIVER + OPS_EXECUTIVE |
| selectRole response | Real role-scoped JWT | Canned mock session |
| Logout | Invalidates Redis session | No-op (simulated delay) |

In **production builds**, all mock indicators and toggles are hidden. The driver never knows or cares about mock vs. real.
