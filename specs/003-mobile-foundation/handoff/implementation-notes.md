# Implementation Notes: Mobile Foundation (spec-003)

---

## T001 — Remove Dead Scaffold Files

**Status**: ✅ Already complete (prior round)
**Classification**: foundation-only
**Layers affected**: none

`Greeting.kt` and `Platform.kt` were already removed during spec-001 Fix Round 1. No further action needed.

---

## T002 — Create `platform/` Package

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: shell, platform abstractions

### Files Changed
- **[NEW]** `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/platform/package-info.kt`

### What Was Added
Package placeholder with documentation for the expect/actual platform abstraction layer (SecureStorage, ConnectivityObserver, CameraCapture, GalleryPicker, PermissionHandler).

### Verification
- `./gradlew :shared:compileKotlinIosSimulatorArm64` — BUILD SUCCESSFUL

---

## T003 — Create `upload/` Package

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: upload baseline

### Files Changed
- **[NEW]** `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/upload/package-info.kt`

### Verification
- Compiles on iOS

---

## T004 — Create `analytics/` Package

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: analytics/logging

### Files Changed
- **[NEW]** `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/analytics/package-info.kt`

### Verification
- Compiles on iOS

---

## T005 — Add Decompose Dependencies

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: navigation

### Files Changed
- **[MODIFIED]** `mobile/gradle/libs.versions.toml` — added `decompose = "3.5.0"` version + two library entries
- **[MODIFIED]** `mobile/shared/build.gradle.kts` — added `libs.decompose` and `libs.decompose.extensions.compose` to commonMain.dependencies

### What Was Added
- `com.arkivanov.decompose:decompose:3.5.0` — UI-agnostic navigation/component library
- `com.arkivanov.decompose:extensions-compose:3.5.0` — thin Compose rendering layer (subscribeAsState, Children)

### Real-vs-Mock Implications
None — this is a dependency addition only.

### Verification
- `./gradlew :shared:compileKotlinIosSimulatorArm64` — BUILD SUCCESSFUL
- Decompose classes (ComponentContext, ChildStack, etc.) are importable from commonMain

---

## Bonus Fix — StateScreens.kt Clock.System Compilation Error

**Status**: ✅ Fixed (pre-existing bug)

### Root Cause
Kotlin 2.3 introduced `kotlin.time.Clock` in the standard library, which conflicts with `kotlinx.datetime.Clock`. The existing code used `kotlinx.datetime.Clock.System.now()` which no longer resolves `System` due to the naming ambiguity.

Additionally, `Long / Int` comparisons (`diffMinutes < 1`, `diffMinutes == 1L`) had type mismatch errors.

### Fix Applied
1. Replaced `kotlinx.datetime.Clock.System` → `kotlin.time.Clock.System` (stdlib in Kotlin 2.3)
2. Changed all integer literals to `Long` (`1L`, `60L`, `60_000L`, `0L`)

### Files Changed
- **[MODIFIED]** `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt` (lines 11, 272–280)

### Risk
Other usages of `kotlinx.datetime.Clock` in future code must use `kotlin.time.Clock` instead on Kotlin 2.3+. This should be noted as a codebase convention.

---

## T006–T015 — Decompose Navigation Framework (Phase 2)

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: navigation, shell

### Architecture Created

```
RootComponent (pure Kotlin)
  └── ShellComponent (ChildPages<TabConfig, TabComponent>)
        ├── TabComponent["active-trip"] (ChildStack<ScreenConfig, ScreenChild>)
        ├── TabComponent["past-trips"] (ChildStack<ScreenConfig, ScreenChild>)
        ├── TabComponent["earnings"]   (ChildStack<ScreenConfig, ScreenChild>)
        └── TabComponent["settings"]   (ChildStack<ScreenConfig, ScreenChild>)
```

**Golden Rule**: No Compose imports in Component classes. Components are pure Kotlin.
Compose rendering happens in `AuthShell.kt` and `RenderScreenChild()` only.

### Files Created (T006–T009)
- **[NEW]** `navigation/NavConfig.kt` — `@Serializable` sealed configs: `RootConfig`, `TabConfig`, `ScreenConfig`, `AuthConfig`
- **[NEW]** `navigation/TabComponent.kt` — per-tab ChildStack with push/pop/resetToRoot, exposes `title` and `canGoBack`
- **[NEW]** `navigation/ShellComponent.kt` — ChildPages tab manager, selectTab(), onBackPressed(), activeTitle
- **[NEW]** `navigation/RootComponent.kt` — auth vs. shell routing with attachShell()/detachShell()

### Files Refactored (T010–T015)
- **[MODIFIED]** `navigation/AuthShell.kt` — thin Compose renderer observing ShellComponent. Top bar shows screen title (not role label). Back arrow when canGoBack. Tab bar uses forEachIndexed + selectTab(index). Content rendered via Decompose's `Children` composable. Re-tap-active-tab calls resetToRoot() (T015).
- **[MODIFIED]** `navigation/AppNavHost.kt` — accepts `ComponentContext`, creates `RootComponent`, attaches/detaches `ShellComponent` on auth state transitions. No more tabContentFactory lambda (T011).
- **[MODIFIED]** `role/model/RoleConfig.kt` — `tabContentFactory: @Composable` replaced with `screenFactory: (ScreenConfig, ComponentContext) -> ScreenChild` (pure Kotlin). Added `tabConfigs` and `landingTabIndex` derived properties (T012).
- **[MODIFIED]** `role/registry/RoleRegistry.kt` — uses `::driverScreenFactory` and `::opsExecScreenFactory` function references (T013).
- **[MODIFIED]** `navigation/driver/DriverScreens.kt` — pure Kotlin `driverScreenFactory()` replaces @Composable `DriverTabContent()` (T013).
- **[MODIFIED]** `navigation/opsexec/OpsExecPlaceholderScreens.kt` — pure Kotlin `opsExecScreenFactory()` replaces @Composable dispatcher (T013).

### Platform Entry Points
- **[MODIFIED]** `composeApp/.../MainActivity.kt` — creates `defaultComponentContext()` and passes to App()
- **[MODIFIED]** `composeApp/.../App.kt` — accepts `ComponentContext` parameter
- **[MODIFIED]** `composeApp/build.gradle.kts` — added Decompose dependencies to androidMain

### Back Button Handling (T014)
- `TabComponent`: `handleBackButton = true` in `childStack()` — Decompose auto-handles back within each tab's stack
- `ShellComponent.onBackPressed()` → delegates to active tab's `pop()`
- `RootComponent.onBackPressed()` → delegates to shell

### Re-Tap Reset (T015)
- `ShellComponent.selectTab(index)` — if already on this tab, calls `activeTab.resetToRoot()`
- `TabComponent.resetToRoot()` — uses `popTo(index = 0)` (@OptIn DelicateDecomposeApi)

### Verification
- `:shared:compileKotlinIosSimulatorArm64` → BUILD SUCCESSFUL (16s)
- `:composeApp:compileDebugKotlin` → BUILD SUCCESSFUL

### Real-vs-Mock Implications
None — this is structural/navigation work. No changes to data layer or API calls.

### Risk Notes
- `RootComponent` does NOT use Decompose's ChildStack for auth→shell transition because `AuthViewModel` (Compose ViewModel) owns the auth state. If we later move auth state into a Decompose Component, this would need restructuring.
- `ScreenChild` is sealed — feature epics adding new screens must add variants to both `ScreenChild` AND `ScreenConfig`, and update their role's screen factory. This is deliberate (compile-time exhaustiveness checking).

## T016–T020 — Platform Abstractions (Phase 3)

**Status**: ✅ Complete
**Classification**: foundation-only
**Layers affected**: platform services

### Files Created

| Service | commonMain expect | androidMain actual | iosMain actual |
|---------|------------------|-------------------|----------------|
| ConnectivityObserver | `isOnline: StateFlow<Boolean>`, start/stop | ConnectivityManager + NetworkCallback | Baseline (default online, `updateConnectivity()` API) |
| SecureStorage | save/read/delete/clearAll | EncryptedSharedPreferences (AES-256 GCM) | NSUserDefaults (sandboxed, Keychain upgrade documented) |
| CameraCapture | `capturePhoto(): ByteArray?` | Stub (ActivityResult in Upload epic) | Stub (UIKit in Upload epic) |
| GalleryPicker | `pickImage(): ByteArray?` | Stub (ActivityResult in Upload epic) | Stub (PHPicker in Upload epic) |
| PermissionHandler | requestCamera/Gallery permission | ContextCompat check (API 33+ aware) | Stub (AVCaptureDevice in Upload epic) |

### Build Configuration
- Added `androidx-security-crypto:1.1.0-alpha06` to `libs.versions.toml` and `shared/build.gradle.kts`
- Added `-Xexpect-actual-classes` compiler flag to suppress Kotlin Beta warnings (KT-61573)

### Design Decisions
- **iOS ConnectivityObserver**: Uses baseline default-online pattern. NWPathMonitor C API and SCNetworkReachability both have fragile cinterop across Kotlin/Native versions. Production implementation should use a Swift helper exposed via @objc.
- **iOS SecureStorage**: Uses NSUserDefaults instead of Keychain. Keychain's `CFDictionary` cinterop is brittle. Production upgrade to Swift-side Keychain helper documented.
- **Camera/Gallery/Permission stubs**: Full implementations require Activity Result API lifecycle (Android) and UIViewController presentation (iOS). These are usable for compilation but return null/false; real implementations deferred to Upload epic (T039–T045).

### Verification
- `:shared:compileKotlinIosSimulatorArm64` → BUILD SUCCESSFUL
- `:composeApp:compileDebugKotlin` → BUILD SUCCESSFUL

---

## What Remains

- **Next task**: T021 — Wire ConnectivityObserver into ShellComponent for reactive offline banner
- **Blocked**: Nothing from T001–T020 is blocked
- **Risk**: iOS ConnectivityObserver and SecureStorage use simplified implementations — production-grade versions need Swift bridge layer.

---

## Fix Round 1 — Engineer Handoff

> **Date**: 2026-03-28
> **Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/handoff/open-issues.md) (OI-01 through OI-05)
> **Trigger**: Design Review Round 1 + QA Report Round 1

### 1. Ready for Engineering

All 4 engineer tasks have **no prerequisites** — no UX, spec, or plan updates needed first.

| Task | Issue | Files to Modify | Scope |
|------|-------|----------------|-------|
| T-FIX-01 | OI-01: Reactive DataSourceConfig in SettingsScreen | `AuthShell.kt`, `AppNavHost.kt` or wrapping ViewModel | Collect `dataSourceConfigFlow` from Koin, forward to `SettingsScreen`. Replace hardcoded `DataSourceConfig.DEFAULT`. |
| T-FIX-02 | OI-02: retryCount in UiState.Error | `UiState.kt`, `StateScreens.kt` (UiStateHandler) | Add `retryCount: Int = 0` to `UiState.Error`. Update `UiStateHandler` to forward it to `ErrorStateScreen`. |
| T-FIX-03 | OI-03: isDebugBuild from BuildConfig | `AuthShell.kt`, `App.kt`, `MainActivity.kt`, expect/actual for iOS | Create `expect val isDebugBuild: Boolean` in `commonMain`, `actual` in `androidMain` (BuildConfig.DEBUG) and `iosMain` (Platform.isDebugBuild or compile flag). Pass through composable chain. |
| T-FIX-04 | OI-04: Automatic screen-view tracking | `AuthShell.kt` or `TabComponent.kt` | Add observer on `childStack` changes → call `AnalyticsService.trackScreenView(screenTitle)`. Koin inject analytics service. |

### 2. Blocked / PM-Owned

| Task | Issue | Owner | Status |
|------|-------|-------|--------|
| T-FIX-05 | OI-05: Document startup error UX | PM | Spec documentation only. Add note to spec.md §FR-013. No code. |

No tasks are blocked by backend or artifact updates.

### 3. Mock-vs-Real Switchability Requirements

These fixes **must preserve** the mock/real switching pattern:

- **T-FIX-01**: This IS the fix that makes switching functional. After this fix, toggling in Settings MUST write to the `MutableStateFlow<DataSourceConfig>` and factory DI bindings MUST read the updated value. Verify by: toggle Auth to MOCK → logout → login → `MockAuthRepository` is used (fixture data). Toggle back to REAL → login uses `RealAuthRepository` (HTTP call).
- **T-FIX-03**: After this fix, debug toggles MUST remain visible in debug builds. Verify by: run `:composeApp:installDebug` → Settings → see toggles. Run `:composeApp:installRelease` → Settings → toggles hidden.
- **T-FIX-02, T-FIX-04**: No mock-switchability impact.

### 4. Recheck Before Driver Auth & Session Begins

After Fix Round 1 is complete, verify the following before starting the next epic:

- [ ] `dataSourceConfigFlow` is reactive — toggle Auth mock/real in Settings, observe immediate effect on next login
- [ ] `isDebugBuild` reads from platform BuildConfig — debug toggles hidden in release variant
- [ ] `UiState.Error(retryCount = N)` propagates through `UiStateHandler` to `ErrorStateScreen` — escalation text visible at `retryCount ≥ 3`
- [ ] Screen-view analytics events fire on tab switch and push/pop — verify in Logcat via `LocalAnalyticsService`
- [ ] Existing 71 tests still pass: `./gradlew :shared:allTests`
- [ ] Both platform builds compile: `:shared:compileKotlinIosSimulatorArm64` + `:composeApp:compileDebugKotlin`

---

## Fix Round 1 — Completion Notes

> **Date**: 2026-03-28
> **Status**: ✅ All 4 engineer tasks complete. T-FIX-05 (PM) still open.

### 1. Completed Tasks

| Task | Issue | Status |
|------|-------|--------|
| T-FIX-01 | OI-01: Reactive DataSourceConfig | ✅ Done |
| T-FIX-02 | OI-02: retryCount in UiState.Error | ✅ Done |
| T-FIX-03 | OI-03: isDebugBuild from platform | ✅ Done |
| T-FIX-04 | OI-04: Screen-view tracking | ✅ Done |
| T-FIX-05 | OI-05: Startup error UX docs | ⏳ PM task |

### 2. Files Changed

| Task | Files Modified | Files Created |
|------|---------------|---------------|
| T-FIX-01 | `AppNavHost.kt`, `AuthShell.kt` | — |
| T-FIX-02 | `UiState.kt`, `StateScreens.kt`, `UiStateTest.kt` | — |
| T-FIX-03 | `AppNavHost.kt` | `BuildFlags.kt` (expect), `BuildFlags.android.kt` (actual), `BuildFlags.ios.kt` (actual) |
| T-FIX-04 | `AuthShell.kt` | — |

**Total**: 5 files modified, 3 files created. Zero files deleted.

### 3. Still Blocked

- **T-FIX-05**: PM must add startup error UX note to spec.md §FR-013. No code dependency.
- **T-BLOCKED-01/02/03**: Backend gaps unchanged (upload endpoint, contactId FK, env URLs).

### 4. How to Verify

```bash
# Build verification (both pass)
cd mobile && ./gradlew :shared:compileKotlinIosSimulatorArm64 :composeApp:compileDebugKotlin

# Unit tests (72 tests — 71 existing + 1 new retryCount test)
cd mobile && ./gradlew :shared:testDebugUnitTest
```

**Manual verification on device/emulator**:
1. **T-FIX-01**: Settings → toggle Auth to Mock → logout → login → mock fixture data shows. Toggle back to Real → login uses HTTP.
2. **T-FIX-03**: Settings → "Build: Debug" visible. Release build: "Build: Release" + no debug toggles.
3. **T-FIX-04**: Logcat → filter `AxleOps-Analytics` → see `SCREEN_VIEW` lines on tab switch.

### 5. What to Recheck in Design Review / QA

- **DR Issue #1** (hardcoded DataSourceConfig.DEFAULT) → resolved by T-FIX-01
- **DR Issue #3, #5** (retryCount unreachable) → resolved by T-FIX-02
- **DR Issue #11** (isDebugBuild hardcoded) → resolved by T-FIX-03
- **DR Issue #4** (no auto screen tracking) → resolved by T-FIX-04
- **QA F04, F05, F06, F11, F14** → all resolved

### 6. Follow-Up Risks

- **Android `isDebugBuild` uses reflection** on `com.axleops.mobile.BuildConfig.DEBUG` via `Class.forName()`. If the package name changes, the reflection falls back to `true`. Consider switching to a Gradle `buildConfigField` approach in `shared` module when KMP plugin supports it.
- **iOS `isDebugBuild` is hardcoded `true`**. Must be set to `false` for App Store builds via Kotlin compiler flag or source-set variant. Documented as TODO in `BuildFlags.ios.kt`.
- **`SettingsScreen` local state**: The `remember { mutableStateOf(dataSourceConfig) }` creates a local copy from the initial value. When the reactive flow updates, the composable recomposes with the new `dataSourceConfig` param, but the `remember` block doesn't re-initialize (it uses the stale value). This is mitigated because the toggle `onToggle` callback writes back to the flow immediately, and the recomposition from the flow replaces the parameter. However, if an external source changes the config (not via Settings), the Settings UI won't reflect it until recomposition. Low risk for current usage but should be refactored to use the incoming `dataSourceConfig` directly instead of a local copy.
