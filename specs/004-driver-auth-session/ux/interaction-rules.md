# Interaction Rules: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/ux-brief.md)

---

## 1. Login Form Rules

### 1.1 Input Validation

| Rule | Detail |
|------|--------|
| **Email field** | Keyboard type: email. No inline validation (validated server-side). No auto-correct. |
| **Password field** | Keyboard type: password. Masked by default. No "show password" toggle in v1. |
| **Empty check** | "Sign In" button is disabled (38% opacity) until both email and password are non-empty. |
| **No client-side format validation** | We do not validate email format or password strength. The backend is the authority. Rationale: driver emails are set by admins — no risk of typo-prevention UX being useful. |
| **Persisted across config changes** | `rememberSaveable` — email/password survive rotation and process death. |

### 1.2 Button Behavior

| State | Button Label | Button State | On Tap |
|-------|-------------|-------------|--------|
| Fields empty | "Sign In" | Disabled (38% opacity) | No action |
| Fields populated | "Sign In" | Enabled (primary fill) | Trigger login |
| Loading | ◌ (spinner, 24dp) | Disabled | No action |
| Error shown | "Sign In" | Enabled | Re-trigger login |

### 1.3 Error Display

| Rule | Detail |
|------|--------|
| **Position** | Inline, between password field and button. |
| **Style** | `type.body`, `color.error` for auth errors; `color.info` for session expiry. |
| **Max lines** | 2. Longer messages truncate with ellipsis. |
| **Clear on keystroke** | Error text disappears when the user types in either field. |
| **Clear on resubmit** | Error text disappears when "Sign In" is tapped again. |
| **No toast or snackbar** | Errors are inline only. Rationale: toasts auto-dismiss and are easy to miss. |

### 1.4 Keyboard Behavior

| Rule | Detail |
|------|--------|
| **Focus order** | Email → Password (pressing "Next" on email keyboard moves to password). |
| **Done action** | "Done" on the password keyboard triggers login (same as tapping "Sign In"). |
| **Keyboard dismiss** | Tapping outside an input field does NOT dismiss the keyboard (fields are centered — the keyboard overlaps nothing). |

---

## 2. Role Selector Rules

### 2.1 Card Interaction

| Rule | Detail |
|------|--------|
| **Tap area** | Entire card is tappable (not just the arrow). |
| **Tap feedback** | Ripple effect on card. |
| **Loading state** | Tapped card: arrow replaced with spinner. Other cards: alpha reduced to 50%. Tapping non-active cards is ignored during loading. |
| **Error handling** | On selectRole failure, transition back to Login Screen with error. The role selector is not reshown (session is considered invalid). |

### 2.2 Back Navigation

| Rule | Detail |
|------|--------|
| **System back button** | Does nothing. The user must select a role. They are authenticated but unsoped. |
| **Swipe back gesture** | Disabled on this screen. |
| **Rationale** | Returning to login would require re-entering credentials for no reason. The user is already authenticated. |

---

## 3. Logout Rules

### 3.1 Trigger

| Rule | Detail |
|------|--------|
| **Location** | "Sign Out" button in the Settings tab. |
| **Style** | Text button, `color.error`. Positioned in a "Session" section of Settings. |
| **Not a FAB or primary action** | Logout is intentionally low-priority in visual hierarchy. |

### 3.2 Confirmation Modal

| Property | Value |
|----------|-------|
| **Title** | "Sign Out" |
| **Body** | "Are you sure you want to sign out?" |
| **Confirm button** | "Sign Out" — text button, right-aligned |
| **Cancel button** | "Cancel" — text button, left-aligned |
| **Backdrop tap** | Dismisses modal (same as Cancel) |

### 3.3 Post-Logout Behavior

| Rule | Detail |
|------|--------|
| **Immediate local clear** | Session token removed from persistent storage. In-memory session cleared. |
| **Network call** | `POST /auth/logout` — fire and forget. Do not block the UI on this call. |
| **Transition** | Fade to Login Screen (150ms). |
| **Login screen state** | Clean — no error message, no session expiry message. |

---

## 4. Session Expiry Rules

### 4.1 401 Interception

| Rule | Detail |
|------|--------|
| **Scope** | Global. Every HTTP response is checked. |
| **401 handling** | Clear session → detach shell → show Login Screen with session expiry info message. |
| **No retry** | The 401 response is not retried. The driver must re-authenticate. |
| **No unsaved-data prompt** | In v1, any in-progress screen data is lost on 401. This is acceptable. |
| **Prevent cascade** | If multiple API calls return 401 simultaneously (e.g., parallel requests), only the first one triggers logout. Subsequent 401s are ignored. |

### 4.2 Background Re-Validation

| Rule | Detail |
|------|--------|
| **Threshold** | 30 minutes in background. |
| **Timer source** | `Clock.System.now()` — monotonic, not wall clock. |
| **Visible indicator** | None for ≤ 1 second. If re-validation takes > 1 second, no visible change (rely on per-request 401). |
| **On 401** | Same as §4.1 — clear session, show Login with expiry message. |
| **On network error** | No action. Resume normally. Individual API calls will trigger 401 if session is actually expired. |
| **On success** | No action. The driver continues uninterrupted. No toast, no banner, no indicator. |

---

## 5. Offline Behavior During Auth

| Scenario | Behavior |
|----------|----------|
| **Login attempted while offline** | Login call fails with network error. Login Screen shows: "Unable to connect. Check your internet connection and try again." |
| **App launched while offline (with stored token)** | Session restore's getMe call fails with network error. App proceeds optimistically — shows Driver Shell with stale token. First real API call will reveal if session is valid. |
| **App goes offline while authenticated** | Shared `OfflineBanner` appears. Auth feature itself takes no action. Feature screens handle offline individually. |
| **App comes back online after > 30 min offline** | Re-validation fires. If getMe succeeds → no action. If 401 → logout. If still offline → no action. |

---

## 6. Accessibility Rules

| Rule | Detail |
|------|--------|
| **Focus order** | Email → Password → Sign In button (sequential). |
| **Screen reader announcement on error** | Error text is announced via `LiveRegion.Polite` when it appears. |
| **Screen reader announcement on loading** | "Signing in" is announced when the spinner appears. |
| **Contrast** | All text meets 4.5:1 minimum (enforced by design system tokens). |
| **Touch targets** | All buttons ≥ 48dp × 48dp (enforced by design system). |
