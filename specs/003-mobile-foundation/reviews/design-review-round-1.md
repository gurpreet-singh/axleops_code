# Design Review — Mobile Foundation (Round 1)

> **Spec**: [003-mobile-foundation/spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md)
> **Reviewer**: Design Reviewer
> **Date**: 2026-03-28
> **Scope**: T001–T048 (all foundation phases)

---

## 1. Status: Changes Requested

The foundation establishes strong architectural patterns and correctly implements the majority of the approved spec. However, 4 issues must be resolved before the foundation is declared feature-ready, and 8 improvements should be addressed before or during the first feature epic.

---

## 2. Summary

The Mobile Foundation delivers a solid, role-extensible architecture with per-tab navigation stacks (Decompose ChildPages), reactive mock/real switching, a complete design token system matching the design spec, 6-state UiStateHandler, upload service baseline, and analytics hooks. The codebase compiles on both iOS and Android with 71 passing tests.

The most significant gaps are: (1) the SettingsScreen receives a hardcoded `DataSourceConfig.DEFAULT` instead of the reactive flow, breaking the debug toggle UX; (2) the mock-vs-real indicator badge specified in the UX is not implemented; (3) the analytics service exists but has no automatic screen-view tracking instrumented into navigation; and (4) the `ErrorStateScreen` exposes `retryCount` as a parameter but no ViewModel or Component tracks retry state, making the escalation text unreachable.

---

## 3. What Correctly Establishes the Foundation

### ✅ Shell & Navigation
- Three-zone shell (top bar + content + bottom tabs) matches [FR-001](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) and [role-shells.md § 1](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md)
- Top bar title driven by active NavConfig destination label ([FR-001a](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md))
- Per-tab independent ChildStack via `TabComponent` ([FR-006](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md))
- Re-tap active tab → `resetToRoot()` ([navigation-grammar § 3.1](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md))
- Tab count validated at 2–5 in `ShellComponent.init` ([navigation-grammar § 3.1](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md))
- Back arrow only on non-root screens (`canGoBack`)
- Role-agnostic shell — renders from `RoleConfig`, no role-specific logic

### ✅ Design Tokens
- Color palette matches [mobile-design-system.md § 1.1](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) exactly: all brand, semantic, surface, and trip phase colors verified hex-for-hex
- Typography scale matches all 6 levels via Material 3 type system
- Spacing scale (2dp–32dp) matches with named tokens
- Color scheme wired as `AxleLightColorScheme` at app root

### ✅ State Handling
- 6-state sealed `UiState` (Loading, Empty, Error, DataLoaded, Offline, Blocked) matches [state-inventory.md § 1](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md) exactly
- Composable screens for all states: skeletons (shimmer), empty (icon + message + optional CTA), error (+ retry), offline (banner + stale data), blocked (lock icon + resolution)
- `UiStateHandler` with crossfade animation + `animate` toggle
- OfflineBanner with relative time ("Last updated X min ago")

### ✅ Network / API Layer
- Centralized `ApiError` sealed class with 6 types ([FR-024](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md))
- `ApiError.from()` maps Ktor exceptions to typed errors
- DTO and domain model separation with mapper layer

### ✅ Mock Infrastructure
- `MockFixtureLoader` loading from composeResources
- Per-feature `DataSourceConfig` with reactive `MutableStateFlow`
- Factory DI bindings ensure every repository access reads latest config
- JSON fixtures: `auth-me.json`, `auth-login.json`, `file-upload-success.json`

### ✅ Upload Baseline
- Full state machine: `UploadState` (6 states) + `UploadJob` + `UploadViewModel`
- `MockUploadService` (1500ms simulated progress) + `RealUploadService` (Ktor multipart)
- Preview + progress UI composables
- File size validation (10MB default)

### ✅ Analytics
- `AnalyticsService` interface with 4 methods ([FR-061](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md))
- `LocalAnalyticsService` logs to console
- Injectable via Koin ([FR-065](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md))

---

## 4. Issues

### Issue 1 — SettingsScreen receives hardcoded `DataSourceConfig.DEFAULT`

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Spec Reference** | [FR-033](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md), [state-inventory.md § 4](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md) |
| **What's wrong** | [AuthShell.kt:148](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt#L148) passes `DataSourceConfig.DEFAULT` to `SettingsScreen`. The reactive `dataSourceConfigFlow` in `AppModule` is never collected. Debug toggles render but changes have no visible effect in the Settings UI. |
| **Impact** | QA cannot toggle mock/real via the debug panel — the core switchability UX is broken. |
| **Fix type** | Engineer-only fix |
| **Fix** | Collect `dataSourceConfigFlow` as a `StateFlow` in a wrapping ViewModel or pass it into `AuthShell` as a parameter. Forward the live snapshot + `onConfigChanged` callback to `SettingsScreen`. |

---

### Issue 2 — Mock-vs-Real indicator badge not implemented

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Spec Reference** | [state-inventory.md § 4](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md), [interaction-rules.md § 5.2](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/interaction-rules.md) |
| **What's wrong** | The UX spec defines a "🟢 Real" / "🟠 Mock" badge in the top bar trailing area for QA/debug builds. This is not implemented anywhere. |
| **Impact** | QA has no at-a-glance way to tell which data source is active. Risk of filing bugs against mock data they believe is real. |
| **Fix type** | Engineer-only fix |
| **Fix** | Add a trailing action slot in `AuthShell`'s `TopAppBar` that reads `DataSourceConfig` and renders the badge. Gate with `isDebugBuild`. Tap navigates to Settings data source section. |

---

### Issue 3 — Retry count not tracked anywhere

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Spec Reference** | [state-inventory.md § 1.3](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md), T046 |
| **What's wrong** | `ErrorStateScreen` accepts `retryCount` parameter and shows escalation text at ≥ 3 — but no ViewModel or Component tracks the count. `UiState.Error` doesn't carry `retryCount`. The parameter is unreachable. |
| **Impact** | The retry escalation feature (FR-049, "If this continues, contact support") is dead code. |
| **Fix type** | Engineer-only fix |
| **Fix** | Either: (a) add `retryCount: Int` to `UiState.Error` and have `UiStateHandler` forward it to `ErrorStateScreen`, or (b) establish a `RetryTracker` utility that ViewModels compose with. |

---

### Issue 4 — No automatic screen-view tracking in navigation

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Spec Reference** | [FR-061](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md), [US7 acceptance](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) |
| **What's wrong** | `AnalyticsService.trackScreenView()` exists but is never called. Nav transitions don't invoke it. The spec says "When a user navigates to any screen, a screen-view event is logged" — currently 0 screen views are logged. |
| **Impact** | Analytics data is empty until every feature manually adds `trackScreenView()` calls — defeating the purpose of a foundation-level hook. |
| **Fix type** | Engineer-only fix |
| **Fix** | Add a `LaunchedEffect(currentScreenConfig)` in `AuthShell`'s content renderer or a stack observer in `TabComponent` that calls `analyticsService.trackScreenView(screenTitle)` on each stack change. |

---

### Issue 5 — `UiState.Error` has no optional `retryCount` field

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [state-inventory.md § 1.3](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md) |
| **What's wrong** | The `UiState.Error` data class has `message` and `onRetry` but no `retryCount`. This means `UiStateHandler` cannot forward retry count to `ErrorStateScreen`. |
| **Impact** | Tracked as part of Issue 3 — can't be resolved independently. |
| **Fix type** | Engineer-only fix |
| **Fix** | Add `retryCount: Int = 0` to `UiState.Error`. Update `UiStateHandler` to pass through. |

---

### Issue 6 — OfflineBanner uses `onPrimary` tint where spec expects `onWarning`

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [mobile-design-system.md § 2.6 State Screens](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) |
| **What's wrong** | `OfflineBanner` uses `MaterialTheme.colorScheme.onPrimary` (white) for icon and text on `AxleWarning` (amber) background. This is visually functional but semantically incorrect — `onPrimary` is the content color for the primary brand color, not for warning surfaces. |
| **Impact** | Low visual impact now (white-on-amber is readable). But if `onPrimary` changes in a dark theme, the banner breaks. |
| **Fix type** | Engineer-only fix (2 lines) |
| **Fix** | Use `Color.White` explicitly or add an `AxleOnWarning` token. |

---

### Issue 7 — No structured diagnostic logger (FR-063)

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [FR-063](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md), [FR-064](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) |
| **What's wrong** | FR-063 specifies a structured logging utility (debug, info, warning, error levels) with contextual info (screen name, role, timestamp). Only `AnalyticsService` exists (event tracking), not a diagnostic logger. These are distinct concerns: analytics = product telemetry; logging = developer diagnostics. |
| **Impact** | Developers will use `println()` for diagnostics, creating inconsistent unstructured output. |
| **Fix type** | Engineer-only fix |
| **Fix** | Create `Logger.kt` interface with `debug/info/warn/error` methods + `ConsoleLogger` implementation. Inject via Koin. This is small and independent. |

---

### Issue 8 — Upload platform integration is stubbed

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [FR-056](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md), [FR-060](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) |
| **What's wrong** | Spec says "fully working upload service including platform camera/gallery integration via expect/actual". `CameraCapture` and `GalleryPicker` are referenced but not implemented as expect/actual declarations. The upload flow requires calling code to supply `ByteArray` externally. |
| **Impact** | Feature epics (Active Trip POD) will need to build the camera/gallery integration themselves, partially defeating the reuse goal. |
| **Fix type** | Engineer-only fix (medium effort) |
| **Fix** | Create `expect fun requestCameraCapture(): ByteArray?` and `expect fun requestGalleryPick(): ByteArray?` in commonMain, with `actual` implementations in androidMain/iosMain. Requires platform-specific permission handling. Can be deferred to the first feature that needs it (Active Trip) if agreed. |

---

### Issue 9 — Tab bar has no elevation/shadow

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [interaction-rules.md § 1.2](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/interaction-rules.md), [mobile-design-system.md § 1.4](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) |
| **What's wrong** | Design spec says bottom tab bar uses `elevation.medium` (4dp shadow). `AuthShell` uses default `NavigationBar` with no explicit elevation. M3 `NavigationBar` default elevation is 3dp (close but not exact). |
| **Impact** | Visual inconsistency is subtle. Will compound if other components reference `elevation.medium`. |
| **Fix type** | Engineer-only fix (1 line) |
| **Fix** | Add `tonalElevation = 4.dp` to `NavigationBar`. |

---

### Issue 10 — Top bar `containerColor` is `primary` — design shows `surface`

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [role-shells.md § 2.2](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md), [mobile-design-system.md § 3](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) |
| **What's wrong** | `AuthShell` sets `containerColor = MaterialTheme.colorScheme.primary` (emerald green) with white text. The screen template wireframes and role-shells doc show `color.surface` (white) with `color.on.surface` (dark) text. A colored top bar is a valid design choice but conflicts with the documented wireframes. |
| **Impact** | Feature epics will need to match this convention. If we change later, all screenshots and dev expectations shift. |
| **Fix type** | PM/spec clarification or docs/design update |
| **Fix** | Decide whether top bar is (a) primary-colored (branded) or (b) surface-colored (neutral). Update whichever doc is wrong. Both are valid — this needs an explicit decision. |

---

### Issue 11 — `isDebugBuild` hardcoded to `true` in AuthShell

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | [FR-044](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) |
| **What's wrong** | [AuthShell.kt:149](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt#L149) passes `isDebugBuild = true` with a `// TODO FIX-006` comment. Debug toggles would be visible in production. |
| **Impact** | Not dangerous for now (no production builds), but will become a production risk if not wired before release. |
| **Fix type** | Engineer-only fix |
| **Fix** | Derive from `BuildConfig.DEBUG` (Android) / compile-time flag (iOS). Pass into shell from platform entry point. |

---

### Issue 12 — No `ConnectivityObserver.isOnline` wiring into `UiStateHandler`

| Field | Value |
|-------|-------|
| **Severity** | Minor |
| **Spec Reference** | T046, [FR-004](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md) |
| **What's wrong** | T046 specifies "Wire `ConnectivityObserver.isOnline` into `UiStateHandler` — when offline, any screen currently in Loading or Error transitions to Offline state." The implementation added `retryCount` to `ErrorStateScreen` but did not wire connectivity state into the rendering logic. The `isOffline` parameter on `AuthShell` exists but is always `false` (no observer connected). |
| **Impact** | Airplane mode won't trigger the offline banner or state transitions. The offline UX is invisible until manually wired by a feature team. |
| **Fix type** | Engineer-only fix |
| **Fix** | Implement `ConnectivityObserver` expect/actual (Android `ConnectivityManager`, iOS `NWPathMonitor`), expose as `StateFlow<Boolean>`, inject into `AuthShell`. This is medium effort. |

---

## 5. Severity Summary

| Severity | Count | Issues |
|----------|-------|--------|
| **Critical** | 1 | #1 (SettingsScreen hardcoded config) |
| **Major** | 3 | #2 (mock indicator), #3 (retry count unreachable), #4 (no screen-view tracking) |
| **Minor** | 8 | #5–#12 |

---

## 6. Recommended Next Actions

### Must fix before first feature epic
1. **Issue #1** — Wire reactive `DataSourceConfig` into `SettingsScreen` (Critical)
2. **Issue #3 + #5** — Add `retryCount` to `UiState.Error`, wire through `UiStateHandler` (Major)
3. **Issue #4** — Instrument automatic screen-view tracking in navigation (Major)

### Should fix soon (during or before Active Trip epic)
4. **Issue #2** — Implement mock-vs-real indicator badge in top bar (Major)
5. **Issue #11** — Wire `isDebugBuild` from platform BuildConfig (Minor, but production risk)
6. **Issue #12** — Implement `ConnectivityObserver` and wire into shell (Minor, but high UX impact)

### Can defer to post-v1 or address when needed
7. **Issue #8** — Camera/gallery expect/actual (address when Active Trip POD epic begins)
8. **Issue #7** — Structured diagnostic logger (nice-to-have for v1)
9. **Issue #10** — Top bar color decision (needs PM input)
10. **Issues #6, #9** — Token correctness (trivial fixes, batch with any UI pass)

---

## 7. Overall Assessment

The foundation is architecturally sound. The role-extensible shell, per-tab navigation, reactive mock/real DI, and 6-state UiStateHandler are correctly designed and will support feature work without one-off workarounds. The critical fix (#1) is a wiring bug, not a design flaw. The major issues (#2–#4) are missing integration points — the pieces exist but aren't connected.

After addressing the critical and major items, this foundation is ready for the Active Trip feature epic.
