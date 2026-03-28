# Open Issues: Driver Auth & Session

**Date**: 2026-03-28  
**Feature Status**: ⚠️ **Ready for Fix Round**  
**Sources**: [design-review-round-1](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/reviews/design-review-round-1.md) · [qa-report-round-1](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/reviews/qa-report-round-1.md) · [implementation-notes](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/handoff/implementation-notes.md)

---

## Feature Verdict

> **Ready for Fix Round.** Core auth flows are structurally correct and tested. 12 issues identified (1 critical, 3 major, 8 minor). All are engineer-fixable — no spec, plan, or architecture changes required. One UX doc needs a factual correction (OI-10). No issues block Driver Active Trip startup, but the critical item (OI-01) must be fixed before shipping.

---

## Issue Register

### OI-01 · Background re-validation uses wrong logout path

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Owner** | Engineer |
| **Source** | QA-001 |
| **Fix path** | Engineer fixes directly |
| **File** | [AppNavHost.kt:93](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L93) |

`onAppForegrounded()` returning `true` calls `authViewModel.logout()` (clean, no message) instead of `authViewModel.forceLogout("Your session has expired…", INFO)`. Driver loses the expiry notification after 30+ min background.

**Active Trip impact**: None functionally — driver still reaches login. But silent expiry is a UX trust issue for field drivers.

---

### OI-02 · Error text does not clear on keystroke

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Owner** | Engineer |
| **Source** | DR-002, QA-002 |
| **Fix path** | Engineer fixes directly |
| **File** | [LoginScreen.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt) |

UX interaction-rules §1.3 requires error message to disappear on keystroke. No clear mechanism exists.

**Active Trip impact**: None — login polish only.

---

### OI-03 · No animated transitions between auth states

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Owner** | Engineer |
| **Source** | DR-003, QA-003 |
| **Fix path** | Engineer fixes directly |
| **File** | [AppNavHost.kt:127](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AppNavHost.kt#L127) |

UX state-inventory §4 specifies 150ms `motion.fade` for all auth state transitions. Currently instant snaps.

**Active Trip impact**: None — visual polish only.

---

### OI-04 · Mock DRIVER authorities don't match spec

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Owner** | Engineer |
| **Source** | QA-004 |
| **Fix path** | Engineer fixes directly |
| **File** | [MockAuthRepository.kt:54](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/auth/repository/MockAuthRepository.kt#L54) |

Mock returns `["TRIP_READ", "TRIP_UPDATE", "POD_UPLOAD"]`. Spec FR-031 requires: `TRIP_READ_OWN`, `TRIP_UPDATE_STATUS`, `VEHICLE_READ_ASSIGNED`, `INSPECTION_CREATE_OWN`, `INSPECTION_READ_OWN`, `SERVICE_CREATE_BREAKDOWN`, `REMINDER_READ_OWN`.

**Active Trip impact**: ⚠️ **Direct risk.** If Active Trip checks `authorities.contains("TRIP_READ_OWN")` in mock mode, it will silently fail. Must fix before Active Trip mock testing.

---

### OI-05 · `color.info` mapped to `color.tertiary` (undocumented)

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Designer (document) or Engineer (add token) |
| **Source** | DR-001, QA-005 |
| **Fix path** | Designer updates design system doc OR Engineer adds `color.info` alias |

Spec says `color.info`; implementation uses `colorScheme.tertiary`. Either formalize the alias in the design system or update UX docs to say `tertiary`.

**Active Trip impact**: None.

---

### OI-06 · Keyboard Done action does not trigger login

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Engineer |
| **Source** | DR-004, QA-006 |
| **Fix path** | Engineer fixes directly |

Email: missing `ImeAction.Next`. Password: missing `ImeAction.Done` + `onDone` callback.

**Active Trip impact**: None — login polish.

---

### OI-07 · Message text has no `maxLines` / ellipsis

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Engineer |
| **Source** | DR-005, QA-007 |
| **Fix path** | Engineer fixes directly |

UX interaction-rules §1.3: "Max 2 lines, truncate with ellipsis."

**Active Trip impact**: None.

---

### OI-08 · No accessibility annotations on login screen

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Engineer |
| **Source** | DR-006, QA-008 |
| **Fix path** | Engineer fixes directly |

Missing `LiveRegion.Polite` on error text, `contentDescription` on spinner.

**Active Trip impact**: None.

---

### OI-09 · Fully-qualified import in AppNavHost

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Engineer |
| **Source** | DR-007, QA-009 |
| **Fix path** | Engineer fixes directly |

`com.axleops.mobile.auth.model.MessageType.INFO` → should use top-level import.

**Active Trip impact**: None.

---

### OI-10 · `data-dependencies.md §4` contradicts spec and implementation

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Designer |
| **Source** | QA-010 |
| **Fix path** | UX artifact must be updated |
| **File** | [data-dependencies.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/data-dependencies.md) |

Doc says "Session metadata: In-memory only" and "Last active role: Not persisted." Both are factually wrong — spec FR-050 mandates persistence and the implementation does persist.

**Active Trip impact**: None — spec and implementation are correct; only the UX doc is stale.

---

### OI-11 · `implementation-notes.md` references stale mock issue

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Engineer |
| **Source** | QA-011 |
| **Fix path** | Engineer fixes directly |

Line 75 still says `MockAuthRepository` has `ROLE_DRIVER` prefix mismatch — this was already fixed. Should now note the **authority mismatch** (OI-04) instead.

**Active Trip impact**: None — documentation only.

---

### OI-12 · SessionManager re-validation doesn't use shared `sessionExpired` flow

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Owner** | Architect (note for future) |
| **Source** | QA-012 |
| **Fix path** | Defer — not required for v1 |

`SessionManager.onAppForegrounded()` returns a `Boolean` and relies on the caller to decide what to do. The per-request 401 interceptor uses a `SharedFlow`. Unifying both paths would prevent bugs like OI-01 from recurring.

**Active Trip impact**: None — architectural improvement, not a defect once OI-01 is fixed.

---

## Summary Table

| ID | Severity | Owner | Fix Path | Active Trip Risk |
|----|----------|-------|----------|------------------|
| OI-01 | Critical | Engineer | Direct fix | Low (UX trust) |
| OI-02 | Major | Engineer | Direct fix | None |
| OI-03 | Major | Engineer | Direct fix | None |
| OI-04 | Major | Engineer | Direct fix | ⚠️ Mock testing |
| OI-05 | Minor | Designer/Engineer | Doc or code | None |
| OI-06 | Minor | Engineer | Direct fix | None |
| OI-07 | Minor | Engineer | Direct fix | None |
| OI-08 | Minor | Engineer | Direct fix | None |
| OI-09 | Minor | Engineer | Direct fix | None |
| OI-10 | Minor | Designer | UX doc update | None |
| OI-11 | Minor | Engineer | Direct fix | None |
| OI-12 | Minor | Architect | Defer | None |

---

## Recommended Fix Round Plan

### Must fix (before shipping / Active Trip)
- **OI-01**: One-line fix — `logout()` → `forceLogout(…)` in AppNavHost
- **OI-04**: Update mock authorities to match spec's 7 exact strings

### Should fix (polish round)
- **OI-02**: Error-clear-on-keystroke in LoginScreen
- **OI-03**: `AnimatedContent` wrapper in AppNavHost
- **OI-06, OI-07, OI-08, OI-09**: Batch as "LoginScreen polish"

### Doc update
- **OI-10**: Designer updates `data-dependencies.md §4`
- **OI-11**: Engineer updates `implementation-notes.md`

### Defer
- **OI-05**: Decide color.info mapping later (cosmetic)
- **OI-12**: Unify SessionManager flows in a future hardening pass

---

## Downstream: Driver Active Trip Readiness

| Guarantee | Status |
|-----------|--------|
| Valid `UserSession` available | ✅ Working |
| Bearer token injection | ✅ Working |
| Global 401 interception | ✅ Working |
| Session persistence | ✅ Working |
| Mock/real switchability | ⚠️ OI-04 must fix mock authorities |
| `contactId` | Known null (Gap G1) — Active Trip must handle |

**Verdict**: Active Trip can start development. OI-04 is the only issue that directly affects mock-mode testing for Active Trip.
