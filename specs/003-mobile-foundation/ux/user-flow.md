# User Flow — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Date**: 2026-03-28

---

## 1. App Launch → First Content

This is the only user flow the foundation fully owns. Every app session begins here.

### 1.1 Flow Diagram

```
┌─────────────┐
│  App Launch  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐    No token     ┌─────────────────┐
│ Check persisted  │ ───────────────▶│   Login Screen   │
│ session token    │                 │  (auth shell)    │
└───────┬──────────┘                 └────────┬────────┘
        │ Token exists                        │
        ▼                                     │ login success
┌──────────────────┐    Invalid/     ┌────────▼────────┐
│ Validate session │ ───expired────▶│   Login Screen   │
│ GET /auth/me     │                 │  (clear token)   │
└───────┬──────────┘                 └─────────────────┘
        │ Valid
        ▼
┌──────────────────┐    1 supported   ┌────────────────┐
│ Resolve roles    │ ────role─────▶  │ Authenticated   │
│ (filter mobile-  │                  │ Shell (role)    │
│  supported)      │                  └────────────────┘
└───────┬──────────┘
        │ Multiple supported roles
        ▼
┌──────────────────┐    role chosen   ┌────────────────┐
│ Role Selector    │ ───────────────▶│ Authenticated   │
│ Screen           │                  │ Shell (role)    │
└───────┬──────────┘                  └────────────────┘
        │ 0 supported roles
        ▼
┌──────────────────┐
│ Unsupported Role │
│ Screen           │
└──────────────────┘
```

### 1.2 State-by-State UX

| Step | What the User Sees | Duration | UX Rule |
|------|-------------------|----------|---------|
| **App launch** | System splash / brand splash (static image, no animation) | < 500ms | No white flash. Background color matches `color.surface.variant`. |
| **Token check** | Same splash — no visual change | < 100ms (local read) | Invisible to user. If token is absent, transition immediately to Login. |
| **Session validation** | Splash continues OR a full-screen skeleton if splash has been visible > 1s | 200ms – 3s (network) | If network call takes > 3s, show `ErrorScreen` with "Couldn't connect" + retry. |
| **Role resolution** | Invisible (logic only) | < 50ms (local filter) | If exactly 1 mobile-supported role → skip to shell. If 0 → Unsupported screen. If > 1 → Role Selector. |
| **Login screen** | Login form (email + password + brand header) | User-driven | No auto-filled credentials in v1. Login button disabled until both fields non-empty. |
| **Logging in** | Login form with loading overlay (button shows spinner, fields disabled) | 1 – 3s | If > 5s, show inline error "Connection timed out" + re-enable form. |
| **Role selector** | Card list of available roles, each with icon + label | User-driven | Tap selects + proceeds immediately. No confirmation step. |
| **Unsupported role** | Full-screen informative message: "Your role is not yet available on mobile. Please use AxleOps web." | Persistent | Logout button present. No retry (role availability is not transient). |
| **Authenticated shell** | Tab bar renders. Landing tab (Active Trip for Driver) shows its loading skeleton. | < 1s (skeleton appears immediately) | Tab bar is interactive immediately. Content area starts with skeleton. |

### 1.3 Error Branches

| Failure Point | What Happens | Recovery |
|---------------|-------------|----------|
| Session validation network failure | `ErrorScreen`: "Couldn't connect to AxleOps. Check your connection." + Retry button | Retry re-runs validation. After 3 consecutive failures, add "or sign in again" link that clears token → Login. |
| Session validation 401 (expired) | Clear token → Login screen | Automatic. No error shown (expected flow). |
| Login API failure (network) | Inline error below password field: "Couldn't sign in. Check your connection." | User re-taps Sign In. |
| Login API failure (401 bad credentials) | Inline error: "Incorrect email or password." | User corrects and re-taps. |
| Role selection API failure | `ErrorScreen` with retry | Retry re-calls `POST /auth/select-role`. |

---

## 2. Session Expiry During Use

This flow interrupts any active screen.

```
┌─────────────────┐
│ Any API call     │
│ returns 401      │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Session expired  │
│ (intercepted by  │
│ HTTP client)     │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Clear session    │
│ Navigate to Login│
│ Show: "Session   │
│ expired. Sign in │
│ again."          │
└─────────────────┘
```

**UX Rules**:
- Transition is **immediate** — no intermediate screen.
- In-progress data (form inputs, captured photos) is **lost** on session expiry. Constitution VII says partial progress should persist, but session expiry is an auth boundary — the user is no longer authorized. Future: consider local-only caching of partial evidence.
- The "session expired" message appears as a non-dismissible banner on the Login screen, fading away after 5 seconds.

---

## 3. App Backgrounding & Foregrounding

| Scenario | UX Behavior |
|----------|-------------|
| **App goes to background** | No visible change. Session token remains persisted. |
| **App returns from background (< 30 min)** | Resume exactly where the user was. No re-validation. |
| **App returns from background (≥ 30 min)** | Re-validate session silently. If still valid → resume. If expired → Login screen (flow §2). If re-validation network call fails → do not disrupt; let next API call trigger 401 interceptor if session is truly expired. |
| **App killed and restarted** | Full startup flow (flow §1). Persisted token is checked. Feature-level state is not preserved (feature screens start fresh). |

---

## 4. Connectivity Change During Use

| Transition | UX Behavior |
|------------|-------------|
| **Online → offline** | `OfflineBanner` appears below top bar (sticky). Current data stays visible. Actions requiring network show disabled state with "No connection" explanation. |
| **Offline → online** | `OfflineBanner` dismisses (150ms fade). Active screen refreshes data automatically (silent re-fetch). No toast or celebration. |
| **Offline on launch** | Startup flow cannot validate session. Show `ErrorScreen`: "No internet connection. Connect and try again." + Retry. |

---

## 5. Flow Ownership Summary

| Flow | Foundation Owns | Feature Epic Owns |
|------|----------------|------------------|
| App launch → first skeleton | ✅ Fully | — |
| Login form submit → auth response | ✅ Infrastructure (HTTP call, token store) | Login screen design (spec-004) |
| Role resolution → shell render | ✅ Fully | — |
| Session expiry → re-auth | ✅ Fully | — |
| Connectivity detection → banner | ✅ Fully | — |
| Tab switch → stack preserve | ✅ Fully | — |
| Feature screen load → data display | State framework (UiStateHandler) | Feature content & queries |
| File capture → upload → result | Upload service contract | Feature-specific capture flows |
