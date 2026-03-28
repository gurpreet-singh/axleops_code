# Design Review Round 2 — Retrofit Validation

> **Status**: ✅ **Approved** (with tracked action items)
> **Feature**: 001-mobile-role-strategy
> **Date**: 2026-03-28
> **Type**: Retrofit validation against backfilled UX package

---

## Summary

The implementation is **structurally sound and consistent with the codified UX package**. The architecture satisfies all 5 user stories, 17 of 19 functional requirements, and 8 of 8 constitution principles. The 10 open items from the design review checklist are all **known, documented, and correctly deferred** — none represents a structural flaw requiring rework.

**Verdict**: Approve as-is. Track action items for resolution before the next feature epic (Driver Active Trip).

---

## What Is Already Consistent

| Area | UX Package Reference | Implementation Match |
|------|---------------------|---------------------|
| Auth state machine | `user-flow.md` — Login → resolve → select → shell | ✅ `AuthViewModel` matches exactly |
| Auto-select single role | `user-flow.md` — 1 role → skip selector | ✅ `resolveRole()` line 110–113 |
| "ALL" filtering | `user-flow.md` — filter out ALL | ✅ `filter { it != "ALL" }` |
| Unsupported role screen | `user-flow.md` — 0 roles → informative message | ✅ `UnsupportedRoleScreen` |
| Screen hierarchy | `screen-map.md` — Pre-Auth / AuthShell / Role-specific | ✅ Exact match |
| Shell structure | `screen-map.md` — top bar + bottom nav + content | ✅ `AuthShell` composable |
| Settings shared across roles | `interaction-rules.md` — Settings always last | ✅ Convention in `RoleRegistry` |
| 4 UX states defined | `state-inventory.md` — Loading/Empty/Error/DataLoaded | ✅ `UiState<T>` sealed interface |
| State composables | `state-inventory.md` — shared components | ✅ `LoadingIndicator`, `EmptyStateScreen`, `ErrorStateScreen` |
| Data source switching | `data-dependencies.md` — per-feature mock/real | ✅ `DataSourceConfig` + `DataSourceModule` |
| Mock fixtures for QA | `data-dependencies.md` — realistic JSON | ✅ 4 fixture files (trips + earnings) |
| Role isolation | `design-review-checklist.md` — zero cross-contamination | ✅ OpsExec added with zero Driver changes |
| Design system tokens | `design-review-checklist.md` — shared theme | ✅ `AxleOpsTheme` with colors, typography, spacing |
| Login states | `state-inventory.md` — idle, loading, error | ✅ `LoginScreen` handles all three |

---

## Mismatches Between Implementation and Codified UX

### M1: AppNavHost role-dispatch `when` block

| Field | Value |
|-------|-------|
| **UX ref** | `design-review-checklist.md` item "Adding a new role requires zero changes to AppNavHost" |
| **Spec ref** | FR-011: "Adding a new role MUST NOT require changes to… shared infrastructure" |
| **Severity** | **Minor** |
| **Impact** | Works for 2–3 roles. Becomes maintenance smell at 4+. Not blocking v1. |
| **Action** | Engineer-only fix — add `contentFactory` lambda to `RoleConfig`, set during registration. Eliminates `when` block. |
| **When** | Before v2 (OpsExec real implementation) |

### M2: Emoji text icons instead of design system icons

| Field | Value |
|-------|-------|
| **UX ref** | `design-review-checklist.md` item "Tab icons use design system icons" |
| **Design ref** | `role-shells.md` — "Route/road icon", "Clock/history icon" |
| **Severity** | **Minor** |
| **Impact** | Cosmetic. No functional impact. Driver-only audience in v1. |
| **Action** | Engineer-only fix — add icon resources to `composeResources/`, update `resolveIconEmoji` → `resolveIcon`. |
| **When** | Before public beta |

### M3: No navigation framework (flat routing)

| Field | Value |
|-------|-------|
| **UX ref** | `screen-map.md` divergence note, `interaction-rules.md` — "tab state preservation not implemented" |
| **Design ref** | `mobile-navigation-grammar.md` — push/pop per tab, tab state preservation |
| **Severity** | **Major** |
| **Impact** | Blocks all detail screens (Trip Detail, Milestone Stepper, POD flow). Not blocking for placeholder screens. |
| **Action** | Architecture change — adopt Voyager or Decompose. This is the **highest priority pre-feature-work item**. |
| **When** | Before Driver Active Trip epic |

### M4: DataSourceConfig not reactive (debug toggle inert)

| Field | Value |
|-------|-------|
| **UX ref** | `data-dependencies.md` divergence note, `interaction-rules.md` — "toggles are cosmetic only" |
| **Spec ref** | FR-017: "Each feature's data source mode MUST be independently configurable" |
| **Severity** | **Minor** |
| **Impact** | QA cannot toggle mock/real at runtime. Build-time switching works fine. |
| **Action** | Engineer-only fix — make `DataSourceConfig` a `MutableStateFlow` in Koin, bind SettingsScreen writes to it. |
| **When** | Before QA testing begins |

### M5: No logout confirmation modal

| Field | Value |
|-------|-------|
| **UX ref** | `interaction-rules.md` — "Logout shows confirmation modal before proceeding — NOT IMPLEMENTED" |
| **Design ref** | `role-shells.md` 3.1 — "Logout → Modal (confirm) → LoginScreen" |
| **Severity** | **Minor** |
| **Impact** | Accidental logout risk. Low frequency, easy undo (just re-login). |
| **Action** | Engineer-only fix — add `AlertDialog` before `authViewModel.logout()`. |
| **When** | Before v1 release |

### M6: No 401/session expiry handling

| Field | Value |
|-------|-------|
| **UX ref** | `interaction-rules.md` — "Session expiry — NOT IMPLEMENTED" |
| **Design ref** | `role-shells.md` 2.2 — "401 response → auto-logout → navigate to Login" |
| **Spec ref** | US2 AC2: "the app redirects to login — with no role-specific variation" |
| **Severity** | **Major** |
| **Impact** | Expired tokens produce raw error messages instead of a clean redirect. Real API usage will surface this immediately. |
| **Action** | Engineer-only fix — add Ktor response interceptor for 401 → trigger `AuthViewModel.logout()`. |
| **When** | Before any real API integration testing |

### M7: `UiStateHandler` defined but unused

| Field | Value |
|-------|-------|
| **UX ref** | `state-inventory.md` divergence note |
| **Severity** | **Minor** |
| **Impact** | No runtime impact. The composable exists and is ready. Feature screens will adopt it. |
| **Action** | No action — will be exercised when feature screens are built. |
| **When** | N/A |

### M8: No iOS Koin initialization

| Field | Value |
|-------|-------|
| **UX ref** | Not in UX package (infra concern) |
| **Implementation ref** | `implementation-notes.md` OI1 |
| **Severity** | **Major** |
| **Impact** | iOS app will crash at runtime. |
| **Action** | Engineer-only fix — add `startKoin` in iOS app delegate. |
| **When** | Before any iOS testing |

### M9: `isDebugBuild` hardcoded to `true`

| Field | Value |
|-------|-------|
| **UX ref** | `interaction-rules.md` — debug toggles, `data-dependencies.md` |
| **Implementation ref** | `implementation-notes.md` OI2 |
| **Severity** | **Minor** |
| **Impact** | Debug toggles visible in production. Low risk — toggles are inert anyway (M4). |
| **Action** | Engineer-only fix — derive from `BuildConfig.DEBUG` (Android) / compile flag (iOS). |
| **When** | Before production build |

### M10: TabDefinition missing `navGraph` field

| Field | Value |
|-------|-------|
| **UX ref** | `screen-map.md`, `design-review-checklist.md` |
| **Design ref** | `mobile-navigation-grammar.md` 5.1 — `navGraph` in TabDefinition schema |
| **Severity** | **Minor** |
| **Impact** | Same root cause as M1 and M3. Resolves naturally when nav framework is adopted. |
| **Action** | No separate action — resolves with M3 (nav framework adoption). |
| **When** | With M3 |

---

## Severity Summary

| Severity | Count | Items |
|----------|-------|-------|
| **Critical** | 0 | — |
| **Major** | 3 | M3 (nav framework), M6 (401 handling), M8 (iOS Koin) |
| **Minor** | 7 | M1, M2, M4, M5, M7, M9, M10 |

---

## Recommended Next Actions

Ordered by priority and dependency:

| # | Action | Mismatches | Owner | Effort | Gate |
|---|--------|-----------|-------|--------|------|
| 1 | **Adopt navigation framework** (Voyager or Decompose) | M3, M10 | Architect + Engineer | 1–2 days | Before Driver Active Trip epic |
| 2 | **Add 401 response interceptor** | M6 | Engineer | 2–4 hours | Before real API integration |
| 3 | **Add iOS Koin initialization** | M8 | Engineer | 1 hour | Before iOS testing |
| 4 | **Make DataSourceConfig reactive** | M4 | Engineer | 2–3 hours | Before QA testing |
| 5 | **Add logout confirmation dialog** | M5 | Engineer | 30 min | Before v1 release |
| 6 | **Add `contentFactory` to RoleConfig** | M1 | Engineer | 1–2 hours | Before v2 (OpsExec real) |
| 7 | **Replace emoji icons with resource icons** | M2 | Engineer + Design | 2–4 hours | Before public beta |
| 8 | **Derive `isDebugBuild` from BuildConfig** | M9 | Engineer | 30 min | Before production build |

Items 1–3 are **pre-requisites for next feature work**. Items 4–8 can be batched into a polish sprint.

---

## Conclusion

The feature is **approved for handoff**. The implementation correctly delivers the role-extensible architecture as specified. All mismatches are:
- Known and documented (in implementation-notes + design-review)
- Non-structural (no fundamental redesign needed)
- Traceable to clear actions with clear timing

No UX artifact corrections are needed. No PM/spec clarifications are required. The backfilled UX package accurately reflects the implemented design.
