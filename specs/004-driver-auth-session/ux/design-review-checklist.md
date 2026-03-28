# Design Review Checklist: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Purpose**: QA-ready checklist for design and UX review before implementation is considered complete  
> **Date**: 2026-03-28

---

## 1. Login Flow

- [ ] Login screen shows app branding (AxleOps + Fleet Management subtitle)
- [ ] Email field uses email keyboard type, no auto-correct
- [ ] Password field is masked (no "show password" toggle in v1)
- [ ] "Sign In" button is disabled when either field is empty
- [ ] "Sign In" button shows spinner during loading (replaces text)
- [ ] Both fields are disabled during loading
- [ ] Error message appears inline between password field and button
- [ ] Error text uses `color.error` for auth errors (bad credentials, network)
- [ ] Error text uses `color.info` for session expiry notification
- [ ] Error clears when driver types in either field
- [ ] "Done" on keyboard triggers login (same as button tap)
- [ ] Form state survives rotation / process death (`rememberSaveable`)

---

## 2. Role Resolution

- [ ] Single supported role → auto-selected (no role selector shown)
- [ ] Multiple supported roles → role selector screen shown
- [ ] Zero supported roles → unsupported role screen shown
- [ ] "ALL" meta-role from backend is excluded from mobile resolution
- [ ] Only roles registered in `RoleRegistry` appear in the selector
- [ ] Role selector shows display name + description for each role
- [ ] Tapping a role card shows loading state on that card
- [ ] Other cards are visually muted during selection loading
- [ ] Back button is disabled on role selector screen

---

## 3. Session Restore

- [ ] App launch with stored token shows splash/brand state (not login screen)
- [ ] Splash state shows subtle spinner below branding
- [ ] Splash duration ≤ 2 seconds
- [ ] If token is valid → driver lands on Active Trip tab (no login flash)
- [ ] If token returns 401 → login screen shown (clean, no error message)
- [ ] If network error → optimistic resume (Driver Shell shown with stale token)
- [ ] No "logging in..." or "validating..." text on splash

---

## 4. Landing Behavior

- [ ] Successful auth → driver lands on Active Trip tab (first tab)
- [ ] Landing tab is driven by `RoleConfig.landingTabId`, not hardcoded
- [ ] Tab bar visible after landing
- [ ] Top bar shows screen title

---

## 5. Logout Flow

- [ ] "Sign Out" button exists in Settings tab
- [ ] Tapping "Sign Out" shows confirmation modal
- [ ] Modal title: "Sign Out"
- [ ] Modal body: "Are you sure you want to sign out?"
- [ ] Confirm button: "Sign Out" (right-aligned)
- [ ] Cancel button: "Cancel" (left-aligned)
- [ ] Backdrop tap dismisses modal
- [ ] On confirm: local session cleared immediately
- [ ] On confirm: `POST /auth/logout` called (best-effort, non-blocking)
- [ ] On confirm: login screen shown (clean, no messages)
- [ ] On cancel: return to Settings, no state change
- [ ] Reopening app after logout shows login screen (not session restore)

---

## 6. Session Expiry (401)

- [ ] Any API 401 response triggers global logout
- [ ] On 401: session cleared → shell detached → login screen shown
- [ ] Login screen shows info message: "Your session has expired. Please sign in again."
- [ ] Message uses `color.info` (not `color.error`)
- [ ] Multiple simultaneous 401s → only one logout sequence triggered
- [ ] No unsaved-data prompt on 401 (accepted for v1)

---

## 7. Background Re-Validation

- [ ] App backgrounded < 30 min → no re-validation on foreground
- [ ] App backgrounded ≥ 30 min → `GET /auth/me` called on foreground
- [ ] Re-validation is invisible (no full-screen blocker)
- [ ] Re-validation success → driver continues on current screen
- [ ] Re-validation 401 → logout + login screen with expiry message
- [ ] Re-validation network error → no action (rely on per-request 401)

---

## 8. Error States (No Dead Ends)

- [ ] Invalid credentials → error shown, fields re-enabled, retry possible
- [ ] Network error (login) → error shown, fields re-enabled, retry possible
- [ ] getMe failure → error shown, returns to login
- [ ] selectRole failure → error shown, returns to login
- [ ] No blank screens at any point in the auth lifecycle
- [ ] No frozen states (loading without timeout or escape)

---

## 9. Design System Compliance

- [ ] All text uses typographic scale tokens (`type.headline`, `type.body`, etc.)
- [ ] All colors use semantic color tokens (no hardcoded hex values)
- [ ] All spacing uses spacing scale tokens (`space.md`, `space.lg`, etc.)
- [ ] All touch targets ≥ 48dp × 48dp
- [ ] All text contrast ≥ 4.5:1
- [ ] Screen transitions use `motion.fade` (150ms)
- [ ] No custom animations or decorative elements

---

## 10. Shared Pattern Reuse

- [ ] Login screen reuses existing `LoginScreen` composable
- [ ] Role selector reuses existing `RoleSelectorScreen` composable
- [ ] Unsupported role reuses existing `UnsupportedRoleScreen` composable
- [ ] Logout modal reuses existing `AlertDialog` pattern from `AppNavHost`
- [ ] Offline banner reuses shared `OfflineBanner` / `ConnectivityObserver`
- [ ] Auth state machine reuses existing `AuthViewModel` + `AuthState` hierarchy
- [ ] Session management reuses existing `SessionManager`
- [ ] No new UI components, color tokens, or typography styles introduced

---

## 11. Mock vs Real

- [ ] Mock mode: any email/password accepted
- [ ] Mock mode: mock user has DRIVER + OPS roles (tests role selector)
- [ ] Mock mode: selectRole returns canned session with mock authorities
- [ ] Mock mode: `contactId` populated (unlike real mode)
- [ ] Mock mode: debug indicator visible (non-production builds only)
- [ ] Real mode: credentials validated against backend
- [ ] Real mode: all 4 endpoints called (`login`, `me`, `select-role`, `logout`)
- [ ] Switching mock/real requires only config toggle, no code changes
