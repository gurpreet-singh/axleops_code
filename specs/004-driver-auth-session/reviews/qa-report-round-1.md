# QA Report: Driver Auth & Session — Round 1

**Date**: 2026-03-28  
**Status**: ⚠️ **Changes Requested**  
**Checklist Items Evaluated**: 82/82  
**Items Passed**: 70 · **Items Failed**: 12

---

## Summary

The implementation covers the full auth state machine and session lifecycle. Core flows — login, role resolution, session persistence, cold-start restore, logout, and 401 interception — are structurally correct and backed by 13 passing unit tests. However, the review uncovered **1 critical** implementation defect (background re-validation uses `logout()` instead of `forceLogout()`, suppressing the expiry message), **3 major** issues (missing error-clear-on-keystroke, missing transition animations, mock authorities don't match spec), and **8 minor** polish/consistency issues. None of these block Driver Active Trip startup, but the critical and major items should be addressed before shipping.

---

## Issue Detail

### QA-001 · Background re-validation uses `logout()` instead of `forceLogout()` — silent expiry

**Severity**: Critical  
**Classification**: Implementation defect  
**Checklist**: CHK048, CHK037, CHK038  

**Expected** (spec FR-072, UX user-flow §Flow 3, interaction-rules §4.2):  
> Background re-validation 401 → Login Screen with info message: "Your session has expired. Please sign in again." (`MessageType.INFO`)

**Actual** ([AppNavHost.kt:86-101](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L86-L101)):  
```kotlin
val expired = sessionManager.onAppForegrounded()
if (expired) {
    rootComponent.detachShell()
    authViewModel.logout()  // ← BUG: uses clean logout (no message)
}
```

The `logout()` path produces `Unauthenticated(message = null)` — a clean login screen with no expiry notice. The spec explicitly requires the session-expired message for this flow (UX Flow 3 vs Flow 5).

**Fix**: Replace `authViewModel.logout()` with:
```kotlin
authViewModel.forceLogout(
    message = "Your session has expired. Please sign in again.",
    messageType = MessageType.INFO,
)
```

---

### QA-002 · Error text does not clear on keystroke

**Severity**: Major  
**Classification**: Implementation defect  
**Checklist**: CHK005  
**Also**: Design review DR-002  

The UX interaction-rules §1.3 states: "Error text disappears when the user types in either field." No mechanism exists in `LoginScreen` to clear the message on `onValueChange`. The message is driven by `AuthState.Unauthenticated.message` and persists until a new login attempt changes the state.

---

### QA-003 · No animated transitions between auth states

**Severity**: Major  
**Classification**: Implementation defect  
**Checklist**: CHK062  
**Also**: Design review DR-003  

The UX state-inventory §4 specifies all auth state transitions use 150ms `motion.fade`. The `when (state)` block in `AppNavHost` renders composables without `AnimatedContent`, producing instant snaps.

---

### QA-004 · Mock authorities don't match spec's DRIVER authority list

**Severity**: Major  
**Classification**: Mock-vs-real switching issue  
**Checklist**: CHK058  

**Expected** (spec FR-031):  
> 7 driver authorities: `TRIP_READ_OWN`, `TRIP_UPDATE_STATUS`, `VEHICLE_READ_ASSIGNED`, `INSPECTION_CREATE_OWN`, `INSPECTION_READ_OWN`, `SERVICE_CREATE_BREAKDOWN`, `REMINDER_READ_OWN`

**Actual** ([MockAuthRepository.kt:54](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/repository/MockAuthRepository.kt#L54)):  
```kotlin
AppRole.DRIVER -> listOf("TRIP_READ", "TRIP_UPDATE", "POD_UPLOAD")
```

Only 3 authorities, none matching the spec's exact strings. If downstream features check `session.authorities.contains("TRIP_READ_OWN")`, mock mode will fail silently.

---

### QA-005 · `color.info` mapped to `color.tertiary` (undocumented alias)

**Severity**: Minor  
**Classification**: UX/design issue  
**Checklist**: CHK063  
**Also**: Design review DR-001  

The spec consistently says `color.info` but the implementation uses `colorScheme.tertiary`. Neither the design system nor the LoginScreen documents this mapping.

---

### QA-006 · Keyboard Done action does not trigger login

**Severity**: Minor  
**Classification**: Implementation defect  
**Checklist**: CHK004  
**Also**: Design review DR-004  

Email: no `ImeAction.Next`. Password: no `ImeAction.Done` / `keyboardActions.onDone`.

---

### QA-007 · Message text has no `maxLines` / ellipsis

**Severity**: Minor  
**Classification**: Implementation defect  
**Checklist**: CHK054  
**Also**: Design review DR-005  

UX interaction-rules §1.3: "Max lines: 2. Longer messages truncate with ellipsis." The `Text` composable has no `maxLines` or `overflow` property.

---

### QA-008 · No accessibility annotations on login screen

**Severity**: Minor  
**Classification**: Implementation defect  
**Checklist**: CHK064  
**Also**: Design review DR-006  

Missing: `LiveRegion.Polite` on error text, `contentDescription` on loading spinner.

---

### QA-009 · Fully-qualified import for `MessageType.INFO`

**Severity**: Minor  
**Classification**: Implementation defect  
**Checklist**: (code quality)  
**Also**: Design review DR-007  

[AppNavHost.kt:122](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L122) uses `com.axleops.mobile.auth.model.MessageType.INFO` instead of a top-level import.

---

### QA-010 · `data-dependencies.md §4` conflicts with spec/implementation

**Severity**: Minor  
**Classification**: Requirement/spec gap  
**Checklist**: CHK027  

The UX data-dependencies doc states:
- "Session metadata (userId, role, etc.) → In-memory only"
- "Last active role → Not persisted in v1"

Both are wrong — spec FR-050 mandates full session persistence and the implementation does persist the role. The data-dependencies doc needs updating.

---

### QA-011 · `implementation-notes.md` references stale MockAuthRepository issue

**Severity**: Minor  
**Classification**: Requirement/spec gap  
**Checklist**: CHK058  

[implementation-notes.md:75](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/handoff/implementation-notes.md#L75) says "`MockAuthRepository` has pre-existing role prefix mismatch (`ROLE_DRIVER` vs `DRIVER`)" — but this was already fixed. The doc should be updated to reflect the fix and to note the remaining **authority mismatch** (QA-004).

---

### QA-012 · `SessionManager.onAppForegrounded` returns `Boolean` but doesn't trigger forceLogout

**Severity**: Minor  
**Classification**: Architecture issue  
**Checklist**: CHK048  

`SessionManager.onAppForegrounded()` returns `true` on 401 but does NOT trigger `forceLogout()`. It relies on the caller (`AppNavHost`) to figure out what to do — and the caller got it wrong (QA-001). The architecture would be more robust if `SessionManager` emitted the same `sessionExpired` shared flow that the per-request 401 interceptor uses, ensuring consistent handling.

---

## Passed Scenarios (70/82)

All items not listed above passed. Key passes include:

| Area | Key Passes |
|------|-----------|
| **Login flow** | Error messages defined (CHK001), button disabled until fields populated (CHK002), timing budget quantified (CHK003) |
| **Role resolution** | ALL-role exclusion (CHK009), 0/1/2+ branch coverage (CHK010), auto-select (CHK011), back-nav disabled (CHK013) |
| **Bootstrap** | All 8 UserSession fields documented (CHK016), contactId nullable (CHK017), authorities specified (CHK020) |
| **Persistence** | Technology specified (CHK021), key names documented (CHK022), corruption guard (CHK023), write timing (CHK025), clear triggers (CHK026) |
| **Session restore** | Three outcomes defined (CHK028), no role re-resolution (CHK029), no error on 401 (CHK030), timing ≤ 2s (CHK031) |
| **Expiry/401** | Global scope (CHK035), cascade prevention (CHK036), exact message text (CHK037), no unsaved-data prompt (CHK039) |
| **Logout** | Dialog copy verbatim (CHK041), button placement (CHK042), fire-and-forget (CHK044), clean post-logout (CHK045) |
| **Re-validation** | 30-min threshold (CHK047), < 30 min no-op (CHK050) |
| **Mock/real** | Toggle mechanism (CHK057), mock `contactId` (CHK059), SessionPersistence agnostic (CHK061) |
| **Regression** | UserSession as sole contract (CHK073), landing tab from RoleConfig (CHK076), bearer injection (CHK077) |

---

## Active Trip Blockers

**None.** The auth/session feature provides a valid `UserSession` on the `Authenticated` state. All downstream guarantees (bearer token, 401 interception, session object availability) are in place. The issues found are UX polish and mock fidelity — they don't block Active Trip screen development.

---

## Severity Summary

| Severity | Count | IDs |
|----------|-------|-----|
| Critical | 1 | QA-001 |
| Major | 3 | QA-002, QA-003, QA-004 |
| Minor | 8 | QA-005 through QA-012 |

---

## Recommended Next Actions

### Immediate (before Active Trip)
1. **Fix QA-001** — Replace `authViewModel.logout()` with `authViewModel.forceLogout(…)` in `AppNavHost` background re-validation handler. One-line fix, critical for correct UX.
2. **Fix QA-004** — Update `MockAuthRepository.selectRole()` DRIVER authorities to match spec (7 authorities with exact strings).
3. **Update implementation-notes.md** — Remove stale role-prefix note, add authority mismatch note (QA-011).

### Next polish pass
4. **Fix QA-002** — Add error-clear-on-keystroke to `LoginScreen`.
5. **Fix QA-003** — Wrap auth state switch in `AnimatedContent` with 150ms fadeIn/fadeOut.
6. **Batch QA-005 through QA-009** — keyboard Done, maxLines, accessibility, color.info, import cleanup.

### Doc update
7. **Update `data-dependencies.md §4`** — Remove incorrect "in-memory only" / "not persisted" claims (QA-010).
