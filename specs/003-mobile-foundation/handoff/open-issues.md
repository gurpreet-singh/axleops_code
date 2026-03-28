# Open Issues Triage — Mobile Foundation

> **Date**: 2026-03-28
> **Feature**: 003-mobile-foundation
> **Feature Disposition**: 🟡 **Ready for fix round** — 5 engineer fixes required before closing

---

## Triage Summary

| Source | Issues Found | Overlapping | Unique |
|--------|-------------|-------------|--------|
| [design-review-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/reviews/design-review-round-1.md) | 12 issues | 7 (shared with QA) | 5 |
| [qa-report-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/reviews/qa-report-round-1.md) | 15 failures | 7 (shared with DR) | 8 |
| [implementation-notes.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/handoff/implementation-notes.md) | 3 risk notes | 2 (addressed) | 1 |
| **Deduplicated total** | — | — | **16 unique issues** |

---

## Feature Disposition Decision

**🟡 Ready for fix round.**

Rationale:
- All 48 approved tasks (T001–T048) are complete. 71 unit tests pass.
- Zero Critical issues. 5 Major issues — all engineer-fixable without spec/UX changes.
- The foundation's architecture is sound. Failures are wiring bugs and spec gaps, not design flaws.
- A targeted fix round (estimated: 1 day) will clear the 5 Major issues.
- Remaining Minor issues are either spec hygiene (PM) or deferred by design.

> [!IMPORTANT]
> The 5 Major issues are shared infrastructure debt. If unresolved, every feature epic starting with Driver Auth & Session will either (a) work around them, creating inconsistent patterns, or (b) inherit the bugs silently.

---

## All Open Issues (Deduplicated)

### 🔴 Must Fix Before Next Feature Epic

| # | Issue | Owner | Severity | Classification | Sources | Next Action |
|---|-------|-------|----------|---------------|---------|-------------|
| OI-01 | **SettingsScreen receives hardcoded `DataSourceConfig.DEFAULT`** — reactive toggle changes do not propagate. QA cannot switch mock/real via debug panel. | **Engineer** | Major | Mock-vs-real switching | DR#1, QA F11 | Engineer fix: collect `dataSourceConfigFlow` and forward live config + `onConfigChanged` to `SettingsScreen`. |
| OI-02 | **`retryCount` unreachable** — `ErrorStateScreen` accepts `retryCount` and shows escalation at ≥3, but `UiState.Error` has no `retryCount` field. No ViewModel tracks it. Escalation text is dead code. | **Engineer** | Major | Implementation defect | DR#3, DR#5, QA F05, QA F06 | Engineer fix: add `retryCount: Int = 0` to `UiState.Error`, wire through `UiStateHandler`, increment in retry logic. |
| OI-03 | **`isDebugBuild` hardcoded to `true`** — debug toggles and data source section visible in all builds including production. | **Engineer** | Major | Implementation defect | DR#11, QA F04, spec-001 OI-07 | Engineer fix: derive from `BuildConfig.DEBUG` (Android) / compile flag (iOS). Pass from platform entry point. |
| OI-04 | **No automatic screen-view tracking** — `AnalyticsService.trackScreenView()` exists but is never called. Zero screen-view events logged. | **Engineer** | Major | Implementation defect | DR#4, QA F14 | Engineer fix: add stack observer in `TabComponent` or `LaunchedEffect` in `AuthShell` content renderer. |
| OI-05 | **Startup error UX path undocumented** — backend-unreachable during session validation renders `LoginScreen(error=...)` but spec doesn't define this as a distinct flow. No dedicated retry on cold-start failure. | **PM** | Major | Spec gap | QA F02 | PM: document in spec.md §FR-013 that `LoginScreen` serves as cold-start error surface. Or define a `StartupError` state. |

### 🟡 Should Fix Before v1 Release

| # | Issue | Owner | Severity | Classification | Sources | Next Action |
|---|-------|-------|----------|---------------|---------|-------------|
| OI-06 | **Mock-vs-real indicator badge not implemented** — UX spec defines "🟢 Real / 🟠 Mock" badge in top bar for QA/debug builds. Not built. | **Engineer** | Minor | Implementation defect | DR#2, QA F10 | Engineer fix: add trailing action to `AuthShell`'s `TopAppBar`. Gate with `isDebugBuild`. |
| OI-07 | **ConnectivityObserver not wired into `UiStateHandler`** — offline banner shows via `AuthShell`, but screen-level state doesn't auto-transition (Loading while offline = infinite skeleton). | **Engineer** | Minor | Implementation defect | DR#12, QA F07 | Engineer fix: compose connectivity check into `UiStateHandler` or pass `isOffline` to screen-level renderers. |
| OI-08 | **Production build mock-stripping unverifiable** — FR-044 says debug features excluded from production, but no Gradle task or ProGuard rule strips mock JSON fixtures from release APK. | **Engineer** | Minor | Implementation gap | QA F12 | Engineer fix: add Gradle `sourceSets` filter or R8 rule. Document verification command. |
| OI-09 | **Tab bar elevation doesn't match spec** — interaction-rules says `elevation.medium` (4dp). M3 `NavigationBar` defaults to 3dp. | **Engineer** | Minor | UX/design issue | DR#9 | Engineer fix: add `tonalElevation = 4.dp` to `NavigationBar`. 1-line change. |
| OI-10 | **OfflineBanner uses `onPrimary` on `warning` surface** — semantically wrong token pairing. White-on-amber works visually but breaks if `onPrimary` changes. | **Engineer** | Minor | UX/design issue | DR#6, QA F55 | Engineer fix: use `Color.White` or add `AxleOnWarning` token. 2-line change. |

### 🟢 Spec/Requirement Gaps (Batch into Spec Hygiene Pass)

| # | Issue | Owner | Severity | Classification | Sources | Next Action |
|---|-------|-------|----------|---------------|---------|-------------|
| OI-11 | **Top bar color ambiguous** — design wireframes show `color.surface` (white). Implementation uses `color.primary` (emerald). Neither spec nor design-system doc is explicit. | **PM** | Minor | Spec gap | DR#10, QA F03 | PM decision: branded (current) vs. neutral (wireframes). Update `mobile-design-system.md` §3. |
| OI-12 | **Startup performance target not measurable** — FR-014 says "3 seconds under normal network conditions." "Normal" undefined. | **PM** | Minor | Spec gap | QA F01 | PM: define "normal" (e.g., ≤200ms RTT, ≥2GB RAM device) or accept as soft guideline. |
| OI-13 | **Mock latency configuration undefined** — FR-040 says "configurable delay." Delays hardcoded (500ms trips, 1500ms upload). No runtime control. | **PM** | Minor | Spec gap | QA F13 | PM: accept hardcoded or spec a `MockConfig.delayMs` parameter. |
| OI-14 | **Upload retry policy undefined** — FR-056 says "retry on failure" but no max count, backoff, or progressive messaging. | **PM** | Minor | Spec gap | QA F08 | PM: define max retries + messaging. Suggested: 3 retries → "Try again later." |
| OI-15 | **Upload progress limitation undocumented** — Ktor multipart in KMP doesn't provide byte-level progress. Real uploads jump 0%→100%. Mock simulates smooth progress. | **PM** | Minor | Spec gap | QA F09 | PM: document limitation. Consider indeterminate progress for real uploads. |

### ⚪ Deferred / Out of Scope

| # | Issue | Owner | Severity | Classification | Sources | Next Action |
|---|-------|-------|----------|---------------|---------|-------------|
| OI-16 | **No structured diagnostic logger** — FR-063 specifies logger (debug/info/warn/error levels). Only `AnalyticsService` exists. These are distinct concerns. | **Engineer** | Minor | Implementation gap | DR#7, QA F15 | Defer to v1.1 or batch with analytics improvements. Small task (~2 hours). |
| OI-17 | **Camera/gallery expect/actual stubs** — Platform integration returns null. Full impl deferred to Active Trip POD epic. | **Engineer** | Minor | Deferred by design | DR#8 | Resolve when Active Trip epic begins. Not foundation debt. |
| OI-18 | **Multi-role switch without restart undefined** — No spec for switching roles mid-session. Current pattern requires logout. | **PM** | Minor | Spec gap | QA F16 | Accept as out-of-scope for v1. Document that role switch = logout + re-login. |

---

## Spec-001 Carryover Status

These issues from [spec-001 open-issues](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/handoff/open-issues.md) were **resolved** during spec-003 implementation:

| Spec-001 ID | Description | Status |
|-------------|-------------|--------|
| OI-01 | No navigation framework | ✅ Resolved — Decompose adopted (T006–T015) |
| OI-02 | No 401/session expiry handling | ✅ Resolved — 401 interceptor + `sessionExpired` flow |
| OI-03 | No iOS Koin initialization | ✅ Resolved — `KoinInit.kt` created |
| OI-04 | `when(role)` dispatch in AppNavHost | ✅ Resolved — `screenFactory` in `RoleConfig` |
| OI-05 | DataSourceConfig not reactive | ✅ Resolved — `MutableStateFlow` in `AppModule` |
| OI-06 | No logout confirmation | ✅ Resolved — `AlertDialog` in `AuthenticatedContent` |
| OI-07 | `isDebugBuild` hardcoded | ⚠️ Still open — carried as OI-03 above |
| OI-09 | `baseUrl` empty string | ✅ Resolved — localhost configured for dev |
| OI-10 | Scaffold dead code | ✅ Resolved — deleted in T001 |

---

## Owner Summary

| Owner | Issues | Action Type |
|-------|--------|-------------|
| **Engineer** | OI-01, OI-02, OI-03, OI-04 (must-fix); OI-06–OI-10 (pre-release); OI-16–OI-17 (deferred) | 4 fixes before next epic, 5 before release, 2 deferred |
| **PM** | OI-05, OI-11–OI-15, OI-18 | 1 major spec clarification, 5 minor spec gaps, 1 out-of-scope acceptance |
| **Designer** | — | No actions (design system tokens match, no UX artifact updates needed) |
| **Architect** | — | No actions (architecture is sound) |
| **Backend** | — | Existing gaps (upload endpoint, User↔Contact FK, env URLs) already tracked in tasks.md T-BLOCKED-01/02/03 |

---

## Fix Round Plan

> **Scope**: OI-01 through OI-04 (engineer must-fixes) + OI-05 (PM spec note)
> **Estimated effort**: 4–6 hours engineering + 30 min PM

| Task | Owner | Effort | Depends On |
|------|-------|--------|-----------|
| **FIX-01**: Wire `dataSourceConfigFlow` into `SettingsScreen` via `AuthShell` | Engineer | 1–2 hours | — |
| **FIX-02**: Add `retryCount` to `UiState.Error`, wire through `UiStateHandler` | Engineer | 1–2 hours | — |
| **FIX-03**: Derive `isDebugBuild` from platform BuildConfig | Engineer | 30 min | — |
| **FIX-04**: Add automatic screen-view tracking in navigation | Engineer | 1–2 hours | — |
| **FIX-05**: Document startup error UX path in spec.md §FR-013 | PM | 30 min | — |

---

## Downstream Impact If Unresolved

| Issue | Impact on Driver Auth & Session | Impact on Active Trip | Impact on Later Features |
|-------|--------------------------------|----------------------|--------------------------|
| **OI-01** (config not reactive) | Auth epic needs debug toggles to test login flows. If broken, QA tests blindly. | Same — can't toggle trip data source for testing. | Every feature that needs mock/real testing is blocked. |
| **OI-02** (retryCount dead) | Login retry escalation text unreachable. User retries forever with no guidance. | Trip fetch retry has same issue. | Pattern propagates — all ErrorScreens lack escalation. |
| **OI-03** (isDebugBuild) | Low risk — no production build yet. But if forgotten, debug panel ships to users. | Same | Compounds — more debug features added over epics, all visible in prod. |
| **OI-04** (no screen tracking) | Zero analytics for login/auth screens. Can't measure auth funnel. | Zero analytics for trip screens. Can't measure usage. | Every feature ships without analytics. Retrofit cost grows linearly. |
| **OI-05** (startup error UX) | Auth epic builds on startup flow. If error path is undefined, auth epic may invent a conflicting pattern. | Depends on auth — transitive risk. | Low — startup is auth-only. |

> [!CAUTION]
> OI-01 and OI-04 are accumulating debt patterns. Each subsequent feature epic that ships without these fixes either (a) works around them, creating inconsistency, or (b) defers them further, making retrofit more expensive. Fix now while the cost is ~2 hours each.

---

## Conclusion

Mobile Foundation is **ready for fix round**. The fix round is scoped to 5 targeted tasks (FIX-01 through FIX-05, ~1 day total). After completion, the feature can be **approved to close** and the Driver Auth & Session epic can begin on stable infrastructure.

No spec, UX, or plan artifacts need updating before the engineer fix round — all fixes are implementation wiring, not design changes. OI-05 (spec clarification) can be done in parallel.
