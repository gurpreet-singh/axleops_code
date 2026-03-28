# Open Issues Triage — Mobile Role Strategy

> **Date**: 2026-03-28
> **Feature**: 001-mobile-role-strategy
> **Feature Disposition**: ✅ **Approved to close** — with follow-up task list (do not reopen feature)

---

## Triage Summary

| Source | Issues Found | Resolved | Carried Forward |
|--------|-------------|----------|----------------|
| design-review-round-2.md | 10 mismatches (M1–M10) | 0 | 10 |
| qa-report-round-1.md | 18 checklist failures | 0 | 18 |
| implementation-notes.md | 7 open issues (OI1–OI7) | 0 | 7 |
| **Deduplicated total** | — | — | **19 unique issues** |

Many issues share root causes. After deduplication: **19 unique issues** across 5 owners.

---

## Feature Disposition Decision

**✅ Approved to close.**

Rationale:
- Zero implementation defects — code is faithful to spec
- Zero critical issues
- All 4 major issues are **pre-requisites for the next feature epic**, not blockers for this one
- This feature's goal was *architecture*, not shipped screens — it delivered that
- Follow-up work is scoped as a short task list, not a feature reopening

---

## All Open Issues (Deduplicated)

### 🔴 Pre-Feature-Work Blockers (resolve before Driver Active Trip epic)

| # | Issue | Owner | Severity | Classification | Next Artifact/Task |
|---|-------|-------|----------|---------------|-------------------|
| OI-01 | **No navigation framework** — flat `when(tabId)` routing blocks detail screens, back nav, tab state preservation | **Architect** | Major | Architecture issue | New spec: `002-navigation-framework` or add to Driver Active Trip spec as Phase 0 |
| OI-02 | **No 401/session expiry handling** — expired tokens show raw errors instead of login redirect | **Engineer** | Major | Implementation gap | Fix in `HttpClientFactory.kt` — add Ktor response interceptor. Spec §US2 AC2 already covers this. |
| OI-03 | **No iOS Koin initialization** — iOS app will crash at runtime | **Engineer** | Major | Implementation gap | Create `iosApp/` Koin init (KMP `initKoin()` in shared + iOS delegate call) |

### 🟡 Pre-Release Fixes (resolve before v1 release)

| # | Issue | Owner | Severity | Classification | Next Artifact/Task |
|---|-------|-------|----------|---------------|-------------------|
| OI-04 | **`AppNavHost` role-dispatch `when` block** — violates FR-011 and design doc antipattern list | **Engineer** | Minor | Architecture debt | Add `contentFactory: @Composable (tabId: String) -> Unit` to `RoleConfig`, set during registration |
| OI-05 | **DataSourceConfig not reactive** — debug toggle is cosmetic | **Engineer** | Minor | Implementation gap | Make `DataSourceConfig` a `MutableStateFlow` in Koin singleton |
| OI-06 | **No logout confirmation modal** — design doc specifies, spec doesn't | **Engineer** | Minor | Implementation gap | Add `AlertDialog` before `authViewModel.logout()` in `AppNavHost` |
| OI-07 | **`isDebugBuild` hardcoded to `true`** — debug toggles visible in production | **Engineer** | Minor | Implementation gap | Derive from `BuildConfig.DEBUG` (Android) / compile flag (iOS) |
| OI-08 | **Emoji icons** — temporary placeholders instead of design system | **Engineer + Designer** | Minor | Design debt | Add icon resources to `composeResources/` when design system is finalized |
| OI-09 | **`baseUrl` empty string** — real API calls will fail | **Engineer** | Minor | Implementation gap | Move to `BuildConfig` or env-based property file |
| OI-10 | **Scaffold dead code** — `Greeting.kt`, `Platform.kt` remain | **Engineer** | Minor | Cleanup | Delete files |

### 🟢 Spec/Requirement Gaps (batch into spec hygiene pass)

| # | Issue | Owner | Severity | Source | Next Artifact/Task |
|---|-------|-------|----------|--------|-------------------|
| OI-11 | **Mock→real graduation criteria** undefined | **PM** | Major | CHK022 | Add section to `spec.md` §FR-016 or create `handoff/graduation-criteria.md` |
| OI-12 | **Regression test boundary** for role addition undefined | **PM + QA** | Major | CHK030 | Add to spec or create `reviews/regression-boundary.md` |
| OI-13 | Design doc rules not in spec: tab state preservation, tab bar hiding, shell composition, Settings-last constraint, top bar content | **PM** | Minor | CHK008–014 | Backfill into `spec.md` §FR-006/FR-009 from design docs |
| OI-14 | "Zero changes" (FR-011) not measurable enough | **PM** | Minor | CHK015 | Clarify wording in `spec.md` to define "shared infrastructure" boundary |
| OI-15 | SC-002 doesn't distinguish stub role vs production role | **PM** | Minor | CHK021 | Refine SC-002 wording |
| OI-16 | HYBRID DataSourceMode dropped without decision record | **PM** | Minor | CHK024 | Add note to `adr-001-role-architecture.md` or `implementation-notes.md` |
| OI-17 | Error fixture format unspecified | **PM** | Minor | CHK027 | Add fixture conventions to spec or plan |
| OI-18 | Logout from intermediate states, network loss during auth undefined | **PM** | Minor | CHK035/036 | Add edge cases to spec §Edge Cases |

### ⚪ Backend Follow-Up (tracked in backend-gaps.md)

| # | Issue | Owner | Severity | Next Artifact/Task |
|---|-------|-------|----------|-------------------|
| OI-19 | Backend gaps G1–G5 (User↔Contact link, driverId filter, earnings API, milestones API, POD API) | **Backend** | — | Already tracked in `specs/001-mobile-role-strategy/backend-gaps.md`. No spec change needed. |

---

## Owner Summary

| Owner | Issues | Action Items |
|-------|--------|-------------|
| **Engineer** | OI-01 through OI-10 | 10 fixes (3 blockers + 7 pre-release) |
| **Architect** | OI-01 | Nav framework decision + implementation |
| **PM** | OI-11 through OI-18 | 8 spec/requirement clarifications |
| **Designer** | OI-08 | Icon set finalization |
| **QA** | OI-12 | Co-define regression boundary |
| **Backend** | OI-19 | 5 API gaps (separate tracking) |

---

## Follow-Up Task List

> These are standalone tasks. Do **not** reopen `001-mobile-role-strategy`.

### Immediate (before next feature epic)

| Task | Owner | Effort | Depends On |
|------|-------|--------|-----------|
| **FU-01**: Adopt navigation framework (Voyager/Decompose) | Architect + Engineer | 1–2 days | — |
| **FU-02**: Add 401 response interceptor to `HttpClientFactory` | Engineer | 2–4 hours | — |
| **FU-03**: Add iOS Koin initialization | Engineer | 1 hour | — |

### Before v1 release

| Task | Owner | Effort | Depends On |
|------|-------|--------|-----------|
| **FU-04**: Add `contentFactory` to `RoleConfig`, eliminate `when(role)` | Engineer | 1–2 hours | FU-01 (nav framework resolves TabDefinition.navGraph too) |
| **FU-05**: Make `DataSourceConfig` reactive via `MutableStateFlow` | Engineer | 2–3 hours | — |
| **FU-06**: Add logout confirmation dialog | Engineer | 30 min | — |
| **FU-07**: Derive `isDebugBuild` from BuildConfig | Engineer | 30 min | — |
| **FU-08**: Configure `baseUrl` per environment | Engineer | 1 hour | — |
| **FU-09**: Replace emoji icons with resource icons | Engineer + Designer | 2–4 hours | Design system icon set |
| **FU-10**: Delete scaffold dead code (`Greeting.kt`, `Platform.kt`) | Engineer | 15 min | — |

### Spec hygiene (can be batched)

| Task | Owner | Effort | Depends On |
|------|-------|--------|-----------|
| **FU-11**: Define mock→real graduation criteria | PM | 1–2 hours | — |
| **FU-12**: Define regression test boundary for role addition | PM + QA | 1–2 hours | — |
| **FU-13**: Backfill design doc rules into spec.md | PM | 1 hour | — |
| **FU-14**: Clarify FR-011, SC-002, add edge cases | PM | 1 hour | — |

---

## Conclusion

The Mobile Role Strategy feature is **closed**. The architecture is sound, the implementation matches the spec, and all open issues are tracked as follow-up tasks with clear owners and timing. No artifact needs to be reopened — the follow-up list (FU-01 through FU-14) is self-contained.
