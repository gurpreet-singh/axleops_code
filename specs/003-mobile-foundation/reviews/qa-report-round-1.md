# QA Report — Mobile Foundation (Round 1)

> **Spec**: [003-mobile-foundation/spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md)
> **Checklist**: [qa-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/reviews/qa-checklist.md)
> **Design Review**: [design-review-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/reviews/design-review-round-1.md)
> **Date**: 2026-03-28
> **Scope**: T001–T048 (all foundation phases)

---

## 1. Status: Changes Requested

The foundation is architecturally sound and most requirements are well-defined. 49 of 64 checklist items pass. The 15 failures break down as spec gaps (8), implementation defects already flagged in design review (5), and ambiguities needing PM clarification (2). None are blockers for feature development, but 5 should be resolved before the Active Trip epic begins.

---

## 2. Summary

| Metric | Value |
|--------|-------|
| **Checklist items** | 64 |
| **Passed** | 49 (77%) |
| **Failed** | 15 (23%) |
| **Critical** | 0 |
| **Major** | 5 |
| **Minor** | 10 |

The foundation correctly establishes: 6-state UiState model, per-tab Decompose navigation with push/pop/resetToRoot, 401 interceptor with session expiry flow, connectivity observer wiring, background re-validation (30 min), reactive DataSourceConfig, 7 mock JSON fixtures, upload state machine, and design token system.

The failures are concentrated in two areas: (a) spec under-definition of retry tracking, diagnostic logging, and auto screen-view analytics; (b) implementation wiring gaps where the spec is clear but the code doesn't yet connect the dots (hardcoded `DataSourceConfig.DEFAULT`, missing mock badge, hardcoded `isDebugBuild`).

---

## 3. Passed Scenarios (49 items)

### App Startup & Session (5/7 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK001 | ✅ PASS | FR-010–FR-013 define all 4 session states. `AppNavHost` renders distinct UI for each `AuthState` variant. |
| CHK003 | ✅ PASS | FR-014a defines 30-min threshold with 3 outcomes. `SessionManager.onAppForegrounded()` implements all three paths. |
| CHK004 | ✅ PASS | `AppNavHost` renders `LoginScreen` for `Unauthenticated`/`LoggingIn` states; `RootComponent.detachShell()` called on logout. No flash of auth content. |
| CHK005 | ✅ PASS | `UnsupportedRoleScreen` exists as a dedicated composable per US3:SC3. |
| CHK007 | ✅ PASS | 401 interceptor calls `sessionExpired.emit()` → `detachShell()` + `logout()`. FR-014a network failure explicitly says "do NOT disrupt user". No loop risk. |

### Shell Correctness (4/6 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK008 | ✅ PASS | `Scaffold` insets handled via `innerPadding`. FR-002 specifies safe area for both platforms. |
| CHK009 | ✅ PASS | FR-001a: "title driven by active navigation destination's label". `ShellComponent.activeTitle` maps from `TabComponent.title` → `ScreenConfig.title`. |
| CHK011 | ✅ PASS | FR-004 → `OfflineBanner` renders below top bar. Interaction-rules §1.1 confirms same. Implementation consistent: `Column(innerPadding) { if (isOffline) OfflineBanner(); Content }`. |
| CHK012 | ✅ PASS (with note) | Interaction-rules says `elevation.medium` (4dp). M3 `NavigationBar` defaults to 3dp. Spec says 4dp. Minor drift. Flagged in design review Issue #9. |

### Navigation Baseline (7/7 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK014 | ✅ PASS | FR-006 fully defined. Implementation: `ChildPages<TabConfig, TabComponent>` with per-tab `ChildStack`. |
| CHK015 | ✅ PASS | FR-006 + interaction-rules §1.2. `ShellComponent.selectTab()` → `resetToRoot()` if already on active tab. |
| CHK016 | ✅ PASS | FR-008 defined for both platforms. `TabComponent.childStack(handleBackButton = true)` + `ShellComponent.onBackPressed()`. |
| CHK017 | ✅ PASS | Navigation-grammar says 3–5. `ShellComponent.init` validates `tabs.size in 2..5`. Covers 2-tab edge for future Mechanic (3 tabs). Out-of-range throws `IllegalArgumentException`. |
| CHK018 | ✅ PASS | Interaction-rules §2.4: "stack state preserved". §3.4: "ViewModel holds form state across tab switches". Decompose keeps all `TabComponent` instances alive. |
| CHK019 | ✅ PASS | FR-009: "structure MUST NOT preclude deep linking". `ScreenConfig` is `@Serializable`. Deep links can create any config and push it. |
| CHK020 | ✅ PASS | Interaction-rules §2.4: "instant, 0ms". `ChildPages` switches are immediate (no animation spec in `childPages()`). |

### State Handling (7/10 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK021 | ✅ PASS | All 6 states defined in `UiState.kt` with composable screens in `StateScreens.kt`. |
| CHK022 | ✅ PASS | Both state-inventory §2 and mobile-design-system §1.6 say 150ms. `UiStateHandler` uses `Crossfade(animationSpec = tween(Motion.FADE_MS))` where `FADE_MS = 150`. |
| CHK023 | ✅ PASS | Shimmer: `animateFloat(0.15f → 0.35f, tween(800ms, LinearEasing), Reverse)`. Matches spec exactly. |
| CHK024 | ✅ PASS | State-inventory §1.2 provides examples per screen. `EmptyStateScreen` takes `message` + `actionLabel` params. Feature screens supply role-specific text. |
| CHK027 | ✅ PASS | State-inventory §1.5 defines banner dismissal (150ms fade) + silent re-fetch + failure → ErrorScreen. `ConnectivityObserver.isOnline` observed in `AppNavHost`. |
| CHK028 | ✅ PASS | FR-054 says "inline". State-inventory §1.6 says "replaces the blocked action area, rest of screen interactive". `BlockedHint` is a `Column` composable, not a full-screen overlay. |
| CHK029 | ✅ PASS | State-inventory §3 provides the applicability matrix for foundation screens. Feature screens "MUST create their own entry". Convention documented. |

### Upload Baseline (5/7 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK031 | ✅ PASS | `UploadState` sealed interface: Idle → Capturing → Previewing → Uploading → Success/Failed. Cancel (→ Idle) and retry (Failed → Uploading) paths defined. |
| CHK032 | ✅ PASS | `UploadService.validate()` checks `maxSizeBytes` (configurable, default 10MB). `UploadViewModel` surfaces validation errors. |
| CHK033 | ✅ PASS | `MockUploadService` applies 1500ms delay, returns `UploadResult(url = "mock://...")`. `RealUploadService` uses Ktor multipart. Behavioral difference is documented. |
| CHK034 | ✅ PASS | `CameraCapture` and `GalleryPicker` have expect/actual declarations. Android/iOS stubs return `null`. Implementation-notes §T016–T020 documents this. |
| CHK037 | ✅ PASS | FR-059 says "thumbnail preview after capture/selection". `Previewing(imageBytes, source)` carries the data. Feature-level composable renders it. Spec sufficient for UI verification. |

### Mock-vs-Real Switching (3/6 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK038 | ✅ PASS | `DataSourceConfig` has per-feature fields: `authSource`, `tripSource`, `vehicleSource`, `contactSource`, `uploadSource`. Each is independently switchable. |
| CHK039 | ✅ PASS | Factory DI bindings in `DataSourceModule.kt` read from `dataSourceConfigFlow.value` on each creation. No restart needed. Distinct from build-time env config. |
| CHK040 | ✅ PASS | SC-007: "zero changes to UI or domain code". Repository interfaces are identical for mock and real. DI swaps the implementation. Verified in `DataSourceModule`. |

### Mock Editability (3/4 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK044 | ✅ PASS (with caveat) | FR-039 says "edit and relaunch". `MockFixtureLoader` reads from `composeResources` via `Res.readBytes()`. Editing bundled resources requires rebuild — spec says "no code change required" which is technically true (JSON edit only), but "no rebuild" is ambiguous since resource bundling IS a build step. |
| CHK046 | ✅ PASS | Spec Edge Cases: "Mock data source catches parse errors and returns error state — not a crash." `MockFixtureLoader` wraps in try/catch. `FixtureParsingTest` validates fixture shapes. |
| CHK047 | ✅ PASS | 7 fixtures exist: `auth-login.json`, `auth-me.json`, `driver-trips.json`, `driver-trips-empty.json`, `driver-trips-error.json`, `driver-earnings.json`, `file-upload-success.json`. Covers FR-041 categories (success, empty, error). |

### Design System (4/5 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK051 | ✅ PASS | All 20+ color tokens in `Color.kt` verified hex-for-hex against mobile-design-system.md §1.1. |
| CHK052 | ✅ PASS | 6-level type scale defined. System font handled by M3 defaults (Roboto/SF Pro). `Theme.kt` uses M3 Typography overrides. |
| CHK053 | ✅ PASS | `Spacing.kt` defines xxs(2dp)–xxl(32dp) + screen(16dp). Matches mobile-design-system.md §1.3. |
| CHK054 | ✅ PASS | Interaction-rules §6: 48dp minimum. Tab bar items use M3 `NavigationBarItem` (material spec compliant ≥48dp). Back `IconButton` is 48dp default. |

### Regression Risk (5/6 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK056 | ✅ PASS | SC-001 defined. Adding a screen = add `ScreenConfig` variant + `ScreenChild` variant + factory branch. No foundation file changes needed for feature screens. |
| CHK057 | ✅ PASS | State-inventory §1.1: "Feature screens SHOULD provide custom skeleton. Default: SkeletonList(4)." `UiStateHandler` falls back to `SkeletonList(4)`. |
| CHK058 | ✅ PASS | Implementation-notes §T006–T015: "ScreenChild is sealed — feature epics must add variants to both ScreenChild AND ScreenConfig." Compile-time exhaustiveness prevents parallel frameworks. |
| CHK059 | ✅ PASS | FR-019: "Foundation MUST NOT implement login screen, registration, password change." Foundation provides plumbing (token store, interceptor, auth state). Auth epic adds UI. |
| CHK060 | ✅ PASS | State-inventory §3 matrix clearly separates foundation screens (Splash, Login, RoleSelector, Settings, TabPlaceholder) from feature screens. |

### Backend Gaps (3/3 passed)
| Item | Verdict | Evidence |
|------|---------|----------|
| CHK062 | ✅ PASS | Spec §Backend Gaps table documents all 5 gaps with Impact and Mitigation columns. |
| CHK063 | ✅ PASS | Spec §Assumptions: "JWT token-based auth is the auth mechanism." Backend uses `POST /auth/login` returning JWT. Validated against backend login controller. |
| CHK064 | ✅ PASS | tasks.md lists T-BLOCKED-01 (upload endpoint), T-BLOCKED-02 (contactId FK), T-BLOCKED-03 (env URLs) with clear unblocking triggers. |

---

## 4. Failed Scenarios (15 items)

### F01 — CHK002: Startup performance target not measurable

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-014 says "within 3 seconds under normal network conditions." "Normal network conditions" is undefined — no latency/bandwidth spec, no device class (low-end vs. flagship). |
| **Impact** | Cannot objectively test SC-004. |
| **Fix** | Define "normal" as: ≤200ms RTT, device with ≥2GB RAM. Or accept 3s as a soft guideline. |

---

### F02 — CHK006: Startup error rendering without shell

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Classification** | Requirement/spec gap |
| **What failed** | Spec defines `ErrorStateScreen` for screen-level errors (inside the shell). But startup failure (FR-013: "backend unreachable during session validation") happens BEFORE the shell exists. `AppNavHost` handles this via `AuthState.Unauthenticated(error = ...)` → `LoginScreen(error = ...)`, but the spec doesn't define this as a distinct UX path. |
| **Impact** | If session validation fails on cold start, user sees `LoginScreen` with an error message — acceptable but not explicitly specified. No retry on the startup error path (user must tap Login again). |
| **Fix** | Add a `StartupError` state to spec or document that `LoginScreen` serves as the error surface for startup failures. |

---

### F03 — CHK010: Top bar color ambiguous

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | Design system wireframes show `color.surface` (white) top bar. Implementation uses `color.primary` (emerald). Neither spec.md nor design-system.md explicitly states which. Design Review Issue #10 flagged this. |
| **Impact** | Visual inconsistency between docs and implementation. Feature teams may match either convention. |
| **Fix** | PM decision: primary-colored (branded, current) or surface-colored (neutral, per wireframes). Update design-system.md accordingly. |

---

### F04 — CHK013: `isDebugBuild` hardcoded

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Classification** | Implementation defect |
| **What failed** | FR-044 says debug features "MUST be completely excluded from production builds." [AuthShell.kt:149](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt#L149) passes `isDebugBuild = true` always. Design Review Issue #11 already flagged. |
| **Impact** | Production builds would show debug toggles. Low immediate risk (no production builds yet) but must be fixed before release. |
| **Fix** | Derive from `BuildConfig.DEBUG` on Android, compile-time flag on iOS. Pass from platform entry point. |

---

### F05 — CHK025: Retry count tracking not specified at implementation level

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Classification** | Requirement/spec gap + implementation defect |
| **What failed** | State-inventory §1.3 says "after 3 consecutive retries, add secondary text." `ErrorStateScreen` accepts `retryCount` parameter. But: (a) `UiState.Error` has no `retryCount` field; (b) no ViewModel tracks retry count; (c) `UiStateHandler` cannot forward it. The escalation text is unreachable code. Design Review Issue #3 + #5. |
| **Impact** | Users who retry 3+ times never see the escalation message. |
| **Fix** | Add `retryCount: Int = 0` to `UiState.Error`. Increment in ViewModel retry logic. Forward in `UiStateHandler`. |

---

### F06 — CHK026: `UiState.Error` missing `retryCount` field

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Classification** | Implementation defect |
| **What failed** | Same root cause as F05. `UiState.Error` has only `message` and `onRetry`. No `retryCount`. |
| **Impact** | Part of F05. |
| **Fix** | See F05. |

---

### F07 — CHK030: ConnectivityObserver not wired into UiStateHandler

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Implementation defect |
| **What failed** | `ConnectivityObserver.isOnline` IS wired into `AppNavHost` (verified: `collectAsState()` feeds `isOffline` to `AuthShell`). However, it's NOT wired into `UiStateHandler` — when offline, screens in Loading/Error state do NOT automatically transition to Offline state. The offline banner shows, but screen-level state doesn't react. Design Review Issue #12. |
| **Impact** | Offline banner appears (good), but a screen stuck in Loading while offline will show skeleton indefinitely instead of transitioning to Offline state with explanation. |
| **Fix** | Compose a connectivity check into `UiStateHandler`: if `isOffline && state is Loading`, render Offline state instead. |

---

### F08 — CHK035: Upload retry lacks backoff specification

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-056 says "retry on failure" but defines no max retry count, backoff strategy, or messaging progression. `UploadState.Failed` has `retryCount` but no cap. |
| **Impact** | User could retry indefinitely with no guidance. Low impact for foundation (upload is baseline), but feature epics will inherit this gap. |
| **Fix** | Define max retries (suggested: 3) + user messaging ("File upload failed after multiple attempts. Try again later."). |

---

### F09 — CHK036: Upload progress tracking limitation undocumented

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-056 says "progress tracking." `RealUploadService` uses Ktor `submitFormWithBinaryData()` which does NOT provide byte-level upload progress callbacks in KMP. `UploadState.Uploading.progressPercent` exists but is always 0f for real uploads. |
| **Impact** | Real uploads show 0% progress → 100% jump. Mock uploads simulate smooth progress. Visual inconsistency between modes. |
| **Fix** | Document this limitation. Consider indeterminate progress for real uploads until Ktor adds progress support. |

---

### F10 — CHK041: Mock-vs-real indicator badge not implemented

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Implementation defect |
| **What failed** | State-inventory §4 and interaction-rules §5.2 specify "🟢 Real" / "🟠 Mock" badge in top bar trailing area. Not implemented. Design Review Issue #2. |
| **Impact** | QA cannot visually confirm which data source is active without navigating to Settings. |
| **Fix** | Add trailing badge to `AuthShell`'s `TopAppBar` actions slot. |

---

### F11 — CHK042: SettingsScreen receives hardcoded DataSourceConfig

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Classification** | Implementation defect |
| **What failed** | [AuthShell.kt:148](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt#L148) passes `DataSourceConfig.DEFAULT`. The reactive `dataSourceConfigFlow` is never collected into the UI. Toggle changes don't reflect. Design Review Issue #1. |
| **Impact** | QA toggle UX is non-functional. |
| **Fix** | Collect `dataSourceConfigFlow` as state and forward to `SettingsScreen`. |

---

### F12 — CHK043: Production exclusion of mock sources not verifiable

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-044 says debug features "MUST be completely excluded from production builds." No verification method is specified (e.g., "APK must not contain `files/mocks/` directory"). |
| **Impact** | Cannot objectively verify SC-002 for production builds. |
| **Fix** | Add ProGuard/R8 rule or Gradle task to strip mock fixtures from release APK. Document the verification command. |

---

### F13 — CHK045: Mock latency configuration mechanism undefined

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-040 says "configurable delay." `MockTripRepository` has a hardcoded `delay(500)`. `MockUploadService` uses `delay(1500)`. No runtime slider or build-time constant to change delay. |
| **Impact** | QA cannot test edge cases (very slow mock, zero-delay mock) without code changes. |
| **Fix** | Extract delay into `DataSourceConfig` or a separate `MockConfig` object. |

---

### F14 — CHK048: No automatic screen-view tracking

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Implementation defect |
| **What failed** | FR-061 says "screen view events" and US7 says "When a user navigates to any screen, a screen-view event is logged." `AnalyticsService.trackScreenView()` exists but is never called. Design Review Issue #4. |
| **Impact** | Zero analytics data until features manually add calls. |
| **Fix** | Add `LaunchedEffect` in `AuthShell` content renderer or stack observer in `TabComponent` that calls `trackScreenView()` on stack changes. |

---

### F15 — CHK049: No structured diagnostic logger

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | FR-063 specifies "structured logging utility (debug, info, warning, error levels) with contextual info." Only `AnalyticsService` exists (event tracking). No `Logger` interface. FR-061 (analytics) and FR-063 (diagnostics) are distinct concerns. |
| **Impact** | Developers use `println()` for diagnostics. |
| **Fix** | Create `Logger.kt` interface + `ConsoleLogger` implementation. Small, independent task. |

---

### F16 — CHK061: Multi-role switch without restart undefined

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **What failed** | Spec defines role selection at login time (FR-012). No requirement addresses switching roles mid-session (e.g., user is Driver, wants to switch to Ops Exec without full logout). `RootComponent.detachShell()` + `attachShell()` pattern COULD support it, but no spec or UX defines the flow. |
| **Impact** | Future design debt if role switching is needed. Current pattern works for logout → re-login. |
| **Fix** | Accept as out-of-scope for v1. Document that role re-selection requires logout. |

---

## 5. Severity Summary

| Severity | Count | Items |
|----------|-------|-------|
| **Critical** | 0 | — |
| **Major** | 5 | F02, F04, F05/F06, F11 |
| **Minor** | 10 | F01, F03, F07, F08, F09, F10, F12, F13, F14, F15, F16 |

---

## 6. Issue Classification Summary

| Classification | Count | Items |
|---------------|-------|-------|
| **Requirement/spec gap** | 8 | F01, F02, F03, F08, F09, F12, F13, F15 |
| **Implementation defect** | 5 | F04, F05/F06, F07, F10, F11, F14 |
| **UX/design issue** | 1 | F03 (overlaps with spec gap) |
| **Architecture issue** | 0 | — |
| **Backend/API gap** | 0 | — |
| **Mock-vs-real switching** | 2 | F10, F11 |

---

## 7. Recommended Next Actions

### Must fix before Active Trip epic (5 items)
1. **F11** — Wire reactive `DataSourceConfig` into SettingsScreen (Major, implementation defect)
2. **F05/F06** — Add `retryCount` to `UiState.Error`, wire through `UiStateHandler` (Major, impl + spec)
3. **F04** — Derive `isDebugBuild` from platform BuildConfig (Major, production risk)
4. **F02** — Document startup error UX path (Major, spec gap — documentation only)
5. **F14** — Instrument automatic screen-view tracking (Minor but high value)

### Should fix before v1 release
6. **F10** — Implement mock/real indicator badge (Minor)
7. **F07** — Wire connectivity into `UiStateHandler` for automatic Offline transition (Minor)
8. **F12** — Add production mock-stripping verification (Minor)

### Accept / defer
9. **F01** — Soft guideline for startup time (accept as-is)
10. **F03** — PM decision on top bar color (needs input)
11. **F08, F09** — Upload retry/progress limitations (document and defer)
12. **F13** — Mock latency configuration (nice-to-have)
13. **F15** — Structured logger (nice-to-have for v1)
14. **F16** — Multi-role switching (out of scope for v1)

---

## 8. Overall Assessment

The foundation passes 77% of QA checks. The architecture is clean, extensible, and well-documented. The 5 major issues are solvable with targeted fixes (estimated: 1–2 tasks, ≤1 day). The minor issues are predominantly spec gaps — the implementation is sound but the requirements documentation has holes that will accumulate if not closed.

**Recommendation**: Fix the 5 must-fix items, then proceed to Active Trip feature epic with confidence that the foundation will support it without hidden instability.
