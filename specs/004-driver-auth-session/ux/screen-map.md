# Screen Map: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/ux-brief.md)

---

## 1. Screen Topology

```
App Launch
│
├── [stored token exists] ──→ Session Restore State
│                              │
│                              ├── valid ──→ Driver Shell (Active Trip tab)
│                              ├── 401   ──→ Login Screen (clean)
│                              └── network error ──→ Driver Shell (optimistic)
│
└── [no stored token] ──→ Login Screen
                           │
                           ├── success + 1 role ──→ Driver Shell (Active Trip tab)
                           ├── success + N roles ──→ Role Selector Screen
                           │                          │
                           │                          └── role picked ──→ Driver Shell
                           ├── success + 0 roles ──→ Unsupported Role Screen
                           └── error ──→ Login Screen (with error)
```

All screens in this feature are **pre-auth** — they render *outside* the role-scoped shell. No bottom tab bar is visible.

---

## 2. Login Screen

**Status**: Existing composable (`LoginScreen.kt`). Enhancements noted below.

### Layout

```
┌─────────────────────────────────┐
│         (status bar)            │
├─────────────────────────────────┤
│                                 │
│                                 │
│          AxleOps                │  ← type.headline, color.primary
│       Fleet Management          │  ← type.body, color.on.surface.variant
│                                 │
│  ┌───────────────────────────┐  │
│  │  Email                    │  │  ← OutlinedTextField, keyboardType.Email
│  └───────────────────────────┘  │
│         (space.md = 12dp)       │
│  ┌───────────────────────────┐  │
│  │  Password  ••••••         │  │  ← OutlinedTextField, password mask
│  └───────────────────────────┘  │
│         (space.lg = 16dp)       │
│                                 │
│  ┌ error message area ───────┐  │  ← type.body, color.error
│  │ (hidden when no error)    │  │     Max 2 lines. Appears above button.
│  └───────────────────────────┘  │
│         (space.md = 12dp)       │
│  ┌───────────────────────────┐  │
│  │       Sign In             │  │  ← Primary button, full width
│  │    (or ◌ spinner)         │  │     48dp height, radius.md
│  └───────────────────────────┘  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### States

| State | Visual |
|-------|--------|
| **Idle** | Fields enabled, empty. Button disabled (grayed). No error. |
| **Fields populated** | Button enabled (primary color). |
| **Loading** | Spinner replaces "Sign In" text. Fields disabled. Button disabled. |
| **Error (credentials)** | Error text shown. Fields re-enabled. Button re-enabled. Error clears on next keystroke. |
| **Error (network)** | Same layout. Different error text. |
| **Error (session expiry)** | Info-level message (not error color): "Your session has expired. Please sign in again." Uses `color.info` instead of `color.error`. |

### Enhancement: Session Expiry Message

When the login screen is shown due to session expiry (401 from re-validation or in-app), the error area displays an **info-level** message, not an error:

```
  ┌───────────────────────────────┐
  │ ℹ Your session has expired.   │  ← color.info, type.body
  │   Please sign in again.       │
  └───────────────────────────────┘
```

This is distinct from login errors (which use `color.error`). Rationale: session expiry is not the driver's fault — do not make it look like one.

---

## 3. Session Restore State

**Status**: New. Minimal — not a full screen, just a transient state.

### Layout

```
┌─────────────────────────────────┐
│         (status bar)            │
├─────────────────────────────────┤
│                                 │
│                                 │
│                                 │
│          AxleOps                │  ← type.headline, color.primary
│       Fleet Management          │  ← type.body, color.on.surface.variant
│                                 │
│          ◌                      │  ← CircularProgressIndicator, color.primary
│                                 │     24dp, centered below subtitle
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Rules

- Duration: ≤ 2 seconds. If the re-validation call takes longer, proceed optimistically.
- No text like "Validating session..." — the spinner is sufficient.
- On success: transition to Driver Shell with `motion.fade` (150ms).
- On 401: transition to Login Screen with `motion.fade` (150ms).

---

## 4. Role Selector Screen

**Status**: Existing composable (`RoleSelectorScreen.kt`). No changes needed for this feature.

### Layout

```
┌─────────────────────────────────┐
│         (status bar)            │
├─────────────────────────────────┤
│                                 │
│  Welcome, Ramesh Yadav          │  ← type.headline.medium
│  Select your role to continue   │  ← type.body, color.on.surface.variant
│                                 │
│  ┌───────────────────────────┐  │
│  │  Driver                 → │  │  ← Card, elevation.low
│  │  View trips, earnings...  │  │     Tap → select-role API
│  └───────────────────────────┘  │
│         (space.sm = 8dp)        │
│  ┌───────────────────────────┐  │
│  │  Operations Executive   → │  │
│  │  Manage fleet operations  │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### States

| State | Visual |
|-------|--------|
| **Idle** | Cards tappable. Arrow visible on each card. |
| **Selecting** | Tapped card shows spinner replacing arrow. Other cards visually muted. |
| **Error** | Falls back to Login Screen with error message. |

---

## 5. Unsupported Role Screen

**Status**: Existing composable (`UnsupportedRoleScreen.kt`). No changes needed.

### Layout

```
┌─────────────────────────────────┐
│         (status bar)            │
├─────────────────────────────────┤
│                                 │
│                                 │
│     Role Not Available          │  ← type.headline.medium
│                                 │
│  Your assigned role is not yet  │  ← type.body, color.on.surface.variant
│  available on mobile.           │     text-align: center
│  Please use the AxleOps web     │
│  portal.                        │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Exit Path

- No button to return to login (the user is authenticated — they just can't use mobile).
- System back or app kill is the exit.
- **Future enhancement**: Add a "Sign Out" link to return to login for a different account.

---

## 6. Landing Destination

After successful auth + role selection, the driver lands on:

- **Active Trip tab** — first tab in the Driver shell's `RoleConfig`.
- Tab bar becomes visible. Top bar shows screen title.
- The content of the Active Trip tab is **not part of this feature** — it may show Empty state ("No active trip assigned") if no trip data is populated.
