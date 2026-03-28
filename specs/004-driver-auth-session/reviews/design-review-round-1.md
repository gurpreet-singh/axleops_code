# Design Review: Driver Auth & Session — Round 1

**Date**: 2026-03-28  
**Reviewer Role**: Designer  
**Status**: ⚠️ **Changes Requested**

---

## Summary

The implementation faithfully covers the core auth state machine, session persistence, cold-start restore, and expiry handling. All spec user stories (US1–US5) have matching code paths. State machine states match the approved state inventory 1:1 (`Unauthenticated`, `LoggingIn`, `Restoring`, `RoleSelection`, `NoSupportedRoles`, `Authenticated`).

However, the review identifies **7 issues** across interaction polish, design system compliance, and accessibility — ranging from a minor color naming mismatch to missing UX-specified interactions (error-clear-on-keystroke, keyboard Done action). No critical blockers; the core flows are correct.

---

## What Matches the Approved Auth/Session UX

| Area | Assessment |
|------|-----------|
| Login form layout (brand, email, password, message, button) | ✅ Matches [screen-map.md §2](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/screen-map.md) exactly |
| Session restore screen (brand + spinner, no "Validating..." text) | ✅ Matches [screen-map.md §3](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/screen-map.md) |
| State machine hierarchy | ✅ All 7 states from [state-inventory.md §2](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/state-inventory.md) implemented |
| Error vs Info message split (MessageType enum) | ✅ Matches spec FR-081 and UX screen-map enhancement |
| Cold-start restore: 401 → clean login (no error) | ✅ Per [user-flow.md §Flow 2](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/user-flow.md) |
| Cold-start restore: network error → optimistic resume | ✅ Per spec clarification Q1 |
| No role re-resolution on restore | ✅ Per spec clarification Q2 / FR-051 |
| Logout: clear-first, fire-and-forget API, clean login | ✅ Per [interaction-rules.md §3.3](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md) |
| 401 expiry: forceLogout with INFO message | ✅ Per [user-flow.md §Flow 4](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/user-flow.md) |
| Session expiry message text | ✅ Exact string: "Your session has expired. Please sign in again." |
| Button disabled until both fields non-empty | ✅ `email.isNotBlank() && password.isNotBlank()` |
| Fields disabled during loading | ✅ `enabled = !isLoading` |
| Spinner replaces button text during loading | ✅ `CircularProgressIndicator` inside `Button` |
| `rememberSaveable` on email/password | ✅ Per [interaction-rules.md §1.1](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md) |
| SessionPersistence corruption guard | ✅ Returns null on missing keys |

---

## Issues

### DR-001 · `color.info` mapped to `color.tertiary` — semantic mismatch

**Severity**: Minor  
**Fix Owner**: Engineer  

**Expected** (spec FR-081, UX screen-map §2, state-inventory §3):  
> Session expiry → `color.info`

**Actual** ([LoginScreen.kt:98](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt#L98)):  
> `MessageType.INFO → MaterialTheme.colorScheme.tertiary`

**Issue**: The spec and UX docs consistently say `color.info`. The implementation maps this to `colorScheme.tertiary` (Material3's tertiary). Material3 does not have a semantic `color.info` token. Using `tertiary` is a reasonable approximation, but it should be formalized in the design system as `color.info` to avoid confusion.

**Recommendation**: Either (a) add `val info: Color` to custom `AxleOpsColors` and alias it to `tertiary`, or (b) update the UX docs to explicitly state `color.tertiary` is the approved info color. Both are valid — engineering should document the mapping.

---

### DR-002 · Error text does not clear on keystroke

**Severity**: Major  
**Fix Owner**: Engineer  

**Expected** ([interaction-rules.md §1.3](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md)):  
> "Error text disappears when the user types in either field."  
> "Error clears on next keystroke."

**Actual** ([LoginScreen.kt:72-90](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt#L72-L90)):  
> `onValueChange` only updates the field value. No mechanism exists to signal the ViewModel to clear the error state.

**Impact**: After a failed login, the error message stays visible while the user edits credentials, which feels like stale feedback. This was explicitly specified in the UX.

**Recommendation**: The `message` is driven by `AuthState.Unauthenticated.message` from the ViewModel. The `LoginScreen` should accept an `onMessageCleared` callback or use a local state to hide the message on keystroke. The cleanest approach: `LoginScreen` wraps the external `message` in local state, sets it to `null` on any `onValueChange`, and re-shows it when the external `message` changes.

---

### DR-003 · No `AnimatedContent` transition between auth states

**Severity**: Major  
**Fix Owner**: Engineer  

**Expected** ([state-inventory.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/state-inventory.md)):  
> All state transitions use `motion.fade` (150ms). Specifically:  
> - S6 → S7 (Restoring → Authenticated): "Fade from Splash to Driver Shell · 150ms"  
> - S6 → S1 (Restoring → Login): "Fade from Splash to Login · 150ms"  
> - S7 → S1/S2a (Authenticated → Login): "Fade from Driver Shell to Login · 150ms"

**Actual** ([AppNavHost.kt:127](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L127)):  
> The `when (state)` block renders composables directly — no `AnimatedContent` wrapper. State transitions are instant with no fade animation.

**Impact**: Cold-start restore (splash → shell) and session expiry (shell → login) snap abruptly instead of fading. Per the UX spec, transitions should be visually smooth.

**Recommendation**: Wrap the `when (state)` block in `AnimatedContent(targetState = authState)` with `fadeIn(tween(150))` + `fadeOut(tween(150))` as the transition spec. This handles all state-to-state transitions uniformly.

---

### DR-004 · Keyboard "Done" action does not trigger login

**Severity**: Minor  
**Fix Owner**: Engineer  

**Expected** ([interaction-rules.md §1.4](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md)):  
> - Email field: "pressing 'Next' on email keyboard moves to password"  
> - Password field: "'Done' on the password keyboard triggers login"

**Actual** ([LoginScreen.kt:70-91](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt#L70-L91)):  
> Both fields only set `keyboardType`. No `imeAction` is configured. No `keyboardActions` callback triggers login on "Done".

**Recommendation**: Email field: add `imeAction = ImeAction.Next` + `keyboardActions { onNext { passwordFocusRequester.requestFocus() } }`. Password field: add `imeAction = ImeAction.Done` + `keyboardActions { onDone { if (!isLoading && email.isNotBlank() && password.isNotBlank()) onLogin(email, password) } }`.

---

### DR-005 · Message text has no `maxLines` constraint

**Severity**: Minor  
**Fix Owner**: Engineer  

**Expected** ([interaction-rules.md §1.3](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md)):  
> "Max lines: 2. Longer messages truncate with ellipsis."

**Actual** ([LoginScreen.kt:100-103](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt#L100-L103)):  
> `Text(text = message, ...)` — no `maxLines` or `overflow` set.

**Recommendation**: Add `maxLines = 2, overflow = TextOverflow.Ellipsis` to the message `Text`.

---

### DR-006 · No accessibility annotations

**Severity**: Minor  
**Fix Owner**: Engineer  

**Expected** ([interaction-rules.md §6](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md)):  
> - "Error text is announced via `LiveRegion.Polite` when it appears."  
> - "'Signing in' is announced when the spinner appears."

**Actual**: No `semantics { liveRegion = LiveRegionMode.Polite }` on the message text. No content description on the loading spinner.

**Impact**: Screen reader users will not be notified of error/info messages or loading state changes. Low severity for v1 driver audience but specified in the UX package.

**Recommendation**: Add `Modifier.semantics { liveRegion = LiveRegionMode.Polite }` to the message `Text`. Add `contentDescription = "Signing in"` to the loading spinner.

---

### DR-007 · Fully-qualified import in AppNavHost

**Severity**: Minor  
**Fix Owner**: Engineer  

**Location**: [AppNavHost.kt:122](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L122)

```kotlin
messageType = com.axleops.mobile.auth.model.MessageType.INFO,
```

This should use a regular import at the top of the file. Cosmetic but inconsistent with the file's style.

---

## Severity Summary

| Severity | Count | Issues |
|----------|-------|--------|
| Critical | 0 | — |
| Major | 2 | DR-002 (error clear on keystroke), DR-003 (AnimatedContent transitions) |
| Minor | 5 | DR-001 (color.info), DR-004 (keyboard Done), DR-005 (maxLines), DR-006 (accessibility), DR-007 (import) |

---

## Fix Ownership

| Fix Type | Issues |
|----------|--------|
| Engineer-only fix | DR-002, DR-003, DR-004, DR-005, DR-006, DR-007 |
| UX package update OR engineer fix | DR-001 (formalize color.info mapping) |

No PM/spec clarification or architecture changes required.

---

## Recommended Next Actions

1. **Fix DR-002 and DR-003 first** — these are the two Major items and directly affect UX-perceived quality.
2. **Batch DR-004, DR-005, DR-006, DR-007** into a single "LoginScreen polish" diff.
3. **Decide DR-001** — either add `color.info` to the design system or update UX docs to say `color.tertiary`. Both are valid.
4. After fixes, re-run Phase 8 manual QA checklist (T017–T019).
