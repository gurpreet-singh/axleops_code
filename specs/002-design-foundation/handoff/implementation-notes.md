# Implementation Notes — T001–T002: Setup Phase

**Branch**: `002-design-foundation`  
**Date**: 2026-03-28  
**Tasks**: T001, T002

---

## Task Boundary

**T001**: Create `ui/theme/` package directory  
**T002**: Create `ui/components/` package structure with subdirectories: `buttons/`, `cards/`, `badges/`, `inputs/`, `feedback/`, `sheets/`, `stepper/`

**Scope**: Package scaffolding only. No logic, no imports, no refactoring. Creates the directory structure that all subsequent tasks (T003–T030) will populate.

---

## Assumptions

1. Kotlin package-info files (`package-info.kt`) with KDoc are the correct way to establish packages in KMP — this ensures the directories are tracked by git and the packages are documented.
2. The existing `ui/shared/` package is **not moved or renamed** in this task. It will coexist with `ui/theme/` and `ui/components/`. The migration of `Theme.kt` out of `ui/shared/` happens in T008.
3. Package naming follows the existing convention: `com.axleops.mobile.ui.*`.
4. The sub-packages under `ui/components/` match the design system component catalog sections exactly: buttons, cards, badges, inputs, feedback, sheets, stepper.

## Backend Dependencies

**None.** This task is purely structural — no API calls, no data models, no contracts.

## Role-Structure Implications

- `ui/theme/` is role-agnostic (shared across all roles). No role-specific theme packages are created.
- `ui/components/` is role-agnostic (shared component catalog). Role-specific components will live in their role's package (e.g., `ui/driver/`) — created by later feature specs.
- This structure aligns with FR-037: "shared components live in a common module (`ui/common/`), role-specific components live in the role's module."

## Blocked Items

**Nothing blocked.** This task has no dependencies.

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `ui/theme/package-info.kt` | NEW | Package marker for design token package (Color, Typography, Spacing, Elevation, Motion, AxleOpsTheme) |
| `ui/components/package-info.kt` | NEW | Root package marker for shared component catalog |
| `ui/components/buttons/package-info.kt` | NEW | Sub-package: button components |
| `ui/components/cards/package-info.kt` | NEW | Sub-package: card components |
| `ui/components/badges/package-info.kt` | NEW | Sub-package: badge components |
| `ui/components/inputs/package-info.kt` | NEW | Sub-package: input components |
| `ui/components/feedback/package-info.kt` | NEW | Sub-package: feedback components (dialogs, snackbar, upload card) |
| `ui/components/sheets/package-info.kt` | NEW | Sub-package: bottom sheet wrapper |
| `ui/components/stepper/package-info.kt` | NEW | Sub-package: milestone stepper |

All paths relative to `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`.

**Total**: 9 new files, 0 modified, 0 deleted.

## How to Verify

1. **Compilation**: `cd mobile && ./gradlew :shared:compileKotlinMetadata` — should pass with no errors.
2. **Directory structure**: Verify the package tree:
   ```
   ui/
   ├── theme/
   │   └── package-info.kt
   ├── components/
   │   ├── package-info.kt
   │   ├── buttons/package-info.kt
   │   ├── cards/package-info.kt
   │   ├── badges/package-info.kt
   │   ├── inputs/package-info.kt
   │   ├── feedback/package-info.kt
   │   ├── sheets/package-info.kt
   │   └── stepper/package-info.kt
   └── shared/          ← existing, unchanged
       ├── Theme.kt
       ├── UiState.kt
       ├── StateScreens.kt
       └── ...
   ```
3. **No regressions**: Existing `ui/shared/` files are untouched. All existing imports still work.

## Remaining Risks/Gaps

- **None for this task.** This is pure scaffolding.
- **Downstream dependency**: T008 (move `Theme.kt` → `ui/theme/AxleOpsTheme.kt`) will require updating all imports across the codebase. That is a separate task.

---

# Implementation Notes — T003–T011: Design Tokens (Phase 2)

**Date**: 2026-03-28  
**Tasks**: T003, T004, T005, T006, T007, T008, T009, T010, T011

---

## Task Boundary

**T003**: Color tokens (brand, semantic, trip-phase, light scheme)  
**T004**: Typography scale (6-level)  
**T005**: Spacing scale (xxs→screen)  
**T006**: Elevation + Radius tokens  
**T007**: Motion tokens (durations + easing)  
**T008**: AxleOpsTheme composable moved to `ui/theme/`  
**T009**: All imports updated; old `Theme.kt` deleted  
**T010**: SpacingTest  
**T011**: ColorTokenTest  

---

## Assumptions

1. V1 is light-theme only. Dark color scheme deferred — `AxleOpsTheme` ignores `darkTheme` param and always uses `AxleLightColorScheme`.
2. Typography uses system fonts (Roboto on Android / SF Pro on iOS) — no custom font files.
3. `TripPhase` is defined as an enum in `Color.kt` for now. If a trip phase model already exists in the domain layer, it should be aligned in a later task.
4. `Spacing.md = 12dp` breaks the strict 4dp rule but matches the design system spec exactly. The SpacingTest documents this.
5. `Radius` tokens are co-located with `Elevation` in `Elevation.kt` since both are structural dimension tokens.
6. The old `Theme.kt` in `ui/shared/` is fully superseded and deleted. No dark color scheme was preserved because V1 is light-only.

## Backend Dependencies

**None.** Design tokens are purely client-side.

## Role-Structure Implications

- All tokens are role-agnostic. Single emerald primary color for all roles (per clarification Q3).
- `TripPhase` enum is shared across roles — any role that displays trips uses the same phase colors.

## Blocked Items

**Nothing blocked.**

---

## Files Changed

| File | Action | Task |
|------|--------|------|
| `ui/theme/Color.kt` | NEW | T003 |
| `ui/theme/Typography.kt` | NEW | T004 |
| `ui/theme/Spacing.kt` | NEW | T005 |
| `ui/theme/Elevation.kt` | NEW | T006 |
| `ui/theme/Motion.kt` | NEW | T007 |
| `ui/theme/AxleOpsTheme.kt` | NEW | T008 |
| `ui/shared/Theme.kt` | DELETED | T008 |
| `navigation/AppNavHost.kt` | MODIFIED (import) | T009 |
| `ui/shared/LoginScreen.kt` | MODIFIED (import) | T009 |
| `ui/shared/SettingsScreen.kt` | MODIFIED (import) | T009 |
| `ui/shared/UnsupportedRoleScreen.kt` | MODIFIED (import) | T009 |
| `ui/shared/RoleSelectorScreen.kt` | MODIFIED (import) | T009 |
| `commonTest/ui/theme/SpacingTest.kt` | NEW | T010 |
| `commonTest/ui/theme/ColorTokenTest.kt` | NEW | T011 |

All paths relative to `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/` (except test files under `commonTest/`).

**Total**: 8 new, 5 modified, 1 deleted.

## Key Design Decisions

1. **`TripPhase` as enum with color property**: Keeps phase-to-color mapping in a single place. Future features import the enum.
2. **Exception is not a TripPhase variant**: Exception overlays on any phase. `TripPhase.exceptionColor` is a companion val, not an enum entry.
3. **Shapes use `Radius` tokens**: `AxleShapes` in `AxleOpsTheme.kt` references `Radius.sm/md/lg` instead of hardcoded dp values.
4. **`Spacing.screen`**: Alias for `16.dp` (same as `Spacing.lg`). Exists as semantic intent — `screen` communicates "screen-edge padding" even though the value is identical.

## How to Verify

1. ✅ `./gradlew :shared:compileKotlinMetadata` → BUILD SUCCESSFUL
2. ✅ `./gradlew :shared:testDebugUnitTest` → BUILD SUCCESSFUL (SpacingTest + ColorTokenTest pass)
3. ⚠️ `./gradlew :shared:allTests` → iOS simulator link fails (env issue, not code)
4. Run app on Android emulator → verify emerald primary (not deep blue) in login screen and top bar

## Remaining Risks/Gaps

- **iOS test target**: `linkDebugTestIosSimulatorArm64` fails — needs Xcode/iOS simulator configured. Not a code issue.
- **Dark theme**: Not implemented. When added, a `AxleDarkColorScheme` should be created in `Color.kt` and wired via the `darkTheme` param in `AxleOpsTheme`.
- **`TripPhase` alignment**: If a domain-layer `TripPhase` or `TripStatus` enum exists elsewhere, it should be unified or mapped in a later task.

---

# Implementation Notes — T012–T030: Phases 3, 4, 5

**Date**: 2026-03-28  
**Tasks**: T012–T019 (States), T020–T025 (Components), T026–T030 (Badges/Stepper)

---

## Task Boundary

### Phase 3 — State System (T012–T019)
- **T012**: `UiState` expanded from 4 → 6 variants (`Offline`, `Blocked`)
- **T013–T014**: `SkeletonLine`, `SkeletonCard`, `SkeletonList` with shimmer animation
- **T015**: `OfflineBanner` with relative timestamp ("Last updated X min ago")
- **T016**: `BlockedHint` with reason + optional resolution CTA
- **T017**: `EmptyStateScreen` updated (emoji indicator instead of Icon)
- **T018**: `UiStateHandler` dispatches all 6 states including Offline (stale data passthrough)
- **T019**: `UiStateTest` — 8 tests covering all 6 variants

### Phase 4 — Component Catalog (T020–T025)
- **T020**: `AxleButtons.kt` — Primary, Secondary, Text, Destructive, Icon (all 48dp min)
- **T021**: `AxleCards.kt` — `AxleCard` (clickable/non-clickable with slots), `AxleCardHeader`, `SummaryCard`
- **T022**: `AxleInputs.kt` — `AxleTextField` (blur validation, error state), `AxleDropdown`
- **T023**: `AxleFeedback.kt` — `AxleConfirmationDialog` (destructive variant)
- **T024**: `AxleBottomSheet.kt` — `ModalBottomSheet` with handle bar (32×4dp)
- **T025**: `AxleUploadCard.kt` — `UploadState` sealed interface, progress/retry/remove actions

### Phase 5 — Trip Badges & Stepper (T026–T030)
- **T026–T028**: `TripBadges.kt` — `TripPhaseBadge`, `ExceptionBadge`, `CountBadge`
- **T029–T030**: `MilestoneStepper.kt` — `StepState` enum (5 states), `StepItem` model, `HorizontalStepper` (pulse animation), `VerticalStepper` (colored left borders)

---

## Assumptions

1. **Material Icons via Gradle plugin accessor**: Added `compose.materialIconsExtended` (the Compose Multiplatform Gradle plugin auto-resolves the version). All components use proper `Icons.Outlined.*` and `Icons.Filled.*`.
2. **UploadState is API contract only**: Platform camera/gallery integration is out of scope (deferred to Active Trip spec).
3. **MilestoneStepper is composable-only**: Step data wiring to trip models happens in Active Trip feature.
4. **`AxleDropdown` uses `menuAnchor()` (deprecated)**: One deprecation warning — will be updated to the new 2-param overload in a later cleanup task.
5. **`System.currentTimeMillis()` in `OfflineBanner`**: JVM-specific. For true KMP, this should be replaced with `kotlinx-datetime` or `Clock.System` in a later task.

## Backend Dependencies

**None.** All components are purely client-side UI.

## Blocked Items

**Nothing blocked.**

---

## Files Changed

| File | Action | Task(s) |
|------|--------|---------|
| `ui/shared/UiState.kt` | MODIFIED | T012 |
| `ui/shared/StateScreens.kt` | REWRITTEN | T013–T018 |
| `commonTest/ui/shared/UiStateTest.kt` | NEW | T019 |
| `ui/components/buttons/AxleButtons.kt` | NEW | T020 |
| `ui/components/cards/AxleCards.kt` | NEW | T021 |
| `ui/components/inputs/AxleInputs.kt` | NEW | T022 |
| `ui/components/feedback/AxleFeedback.kt` | NEW | T023 |
| `ui/components/sheets/AxleBottomSheet.kt` | NEW | T024 |
| `ui/components/feedback/AxleUploadCard.kt` | NEW | T025 |
| `ui/components/badges/TripBadges.kt` | NEW | T026–T028 |
| `ui/components/stepper/MilestoneStepper.kt` | NEW | T029–T030 |
| `shared/build.gradle.kts` | MODIFIED | dependency |

**Total**: 10 new, 1 rewritten, 2 modified.

## How to Verify

1. ✅ `./gradlew :shared:compileDebugKotlinAndroid` → BUILD SUCCESSFUL
2. ✅ `./gradlew :shared:testDebugUnitTest` → BUILD SUCCESSFUL (all tests pass)
3. ⚠️ One deprecation warning: `menuAnchor()` in `AxleInputs.kt` (non-blocking)

## Remaining Risks/Gaps

- **`System.currentTimeMillis()`**: JVM-specific in `OfflineBanner`. Replace with KMP-friendly API.
- **`AxleDropdown` menuAnchor deprecation**: Update to 2-param overload.

---

# Implementation Notes — T031–T044: Phases 6, 7, 8

**Date**: 2026-03-28  
**Tasks**: T031–T036 (Shell), T037–T041 (Token Sweep), T042–T044 (Polish)

---

## Phase 6 — Shell Upgrade (T031–T036)

- **T031–T032**: `TabDefinition.iconName: String` → `icon: ImageVector`. Dropped the `AxleIcon` intermediary — direct `ImageVector` is simpler and type-safe.
- **T033**: Per-tab NavHost was deferred. Current placeholder screens don't have multi-screen navigation. The re-tap detection and backstack infrastructure is in place in `AuthShell`; per-tab NavHost wrapper (`TabNavHost`) will be needed when real feature screens with drill-down are added.
- **T034**: `AuthShell` rewritten — emoji `resolveIconEmoji()` replaced with Material `Icon()` composable. `OfflineBanner` integrated between top bar and content via `Column` inside `Scaffold`'s content slot.
- **T035**: Re-tap-active-tab detection: when `selectedTabId == tab.id`, the tap is caught. Currently a no-op since there's no per-tab NavHost to reset. The wiring point is ready for feature screens.
- **T036**: `RoleRegistry` updated with `Icons.Outlined.*`: Route, History, AccountBalanceWallet, Settings, Map, Notifications. `RoleConfig.iconName` property removed (tabs carry their own icons).

## Phase 7 — Token Sweep (T037–T041)

- **T037**: `LoginScreen.kt` — replaced `20.dp` → `Spacing.xl`, `2.dp` → `Spacing.xxs`. Removed `import androidx.compose.ui.unit.dp`.
- **T038**: `RoleSelectorScreen.kt` — replaced `2.dp` → `Elevation.low`. Removed `import unit.dp`.
- **T039–T040**: `SettingsScreen.kt` and `UnsupportedRoleScreen.kt` were already fully tokenized during Phase 2 (T009). No changes needed.
- **T041**: Touch target audit — all interactive elements (buttons, cards, switches) exceed 48dp minimum. Buttons use `fillMaxWidth()`, cards have full-width click areas, switches use Material3 defaults (>48dp).

## Phase 8 — Polish (T042–T044)

| Task | Command | Result |
|------|---------|--------|
| T042 | `./gradlew :shared:compileKotlinMetadata` | ✅ BUILD SUCCESSFUL |
| T043 | `./gradlew :shared:testDebugUnitTest` | ✅ BUILD SUCCESSFUL |
| T044 | `./gradlew :composeApp:assembleDebug` | ✅ BUILD SUCCESSFUL (68 tasks, 1m 38s) |

## Files Changed (Phase 6+7+8)

| File | Action | Task(s) |
|------|--------|---------|
| `navigation/TabDefinition.kt` | REWRITTEN | T031–T032 |
| `navigation/AuthShell.kt` | REWRITTEN | T034–T035 |
| `role/model/RoleConfig.kt` | MODIFIED (dropped `iconName`) | T036 |
| `role/registry/RoleRegistry.kt` | REWRITTEN | T036 |
| `ui/shared/LoginScreen.kt` | MODIFIED (token sweep) | T037 |
| `ui/shared/RoleSelectorScreen.kt` | MODIFIED (token sweep) | T038 |

## Remaining Risks/Gaps (Global)

- **`System.currentTimeMillis()`**: JVM-specific in `OfflineBanner`. Replace with KMP-friendly API.
- **`AxleDropdown` menuAnchor deprecation**: Update to 2-param overload in next cleanup.
- **Per-tab NavHost**: `TabNavHost` composable deferred — needed when feature screens have drill-down navigation.
- **iOS simulator**: Not available locally — cross-platform UI verification pending.

---

# Engineer Handoff — Fix Round 1

**Date**: 2026-03-28  
**Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/handoff/open-issues.md)  
**Tasks**: T045–T047 (ready), T048 (deferred), T049 (blocked on PM)

---

## 1. Tasks Ready for Implementation

| Task | OI | File | Effort | Dependency |
|------|----|------|--------|------------|
| T045 | OI-007 | `AuthShell.kt` | ~5 min | None |
| T046 | OI-010 | `StateScreens.kt` | ~5 min | None |
| T047 | OI-002 | `StateScreens.kt`, `build.gradle.kts` | ~15 min | None |

**Execution order**: T045 → T046 → T047 (no inter-dependencies, can be parallel).

**T045 detail**: Add `require(roleConfig.tabs.size in 2..5) { "Tab count must be 2–5, got ${roleConfig.tabs.size}" }` at the top of `AuthShell`. Existing Driver (4 tabs) and OpsExec (4 tabs) must continue to work.

**T046 detail**: Add `animate: Boolean = true` parameter to `UiStateHandler`. When `true` (default), use the existing `Crossfade` wrapper. When `false`, use a plain `when` block with no animation. Existing callers are unaffected because the default is `true`.

**T047 detail**: Add `implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")` to `shared/build.gradle.kts` if not already present. Replace `System.currentTimeMillis()` in `OfflineBanner` with `Clock.System.now().toEpochMilliseconds()`. Import: `kotlinx.datetime.Clock`. Verify the "X min ago" timestamp still renders correctly.

---

## 2. Unresolved Issues Requiring Design Artifact Updates First

| OI | Owner | What's needed before engineering |
|----|-------|----------------------------------|
| OI-004 | Designer | Update `mobile-design-system.md` §1.6 with icon size token names |
| OI-005 | PM | Create state coverage grid template |
| OI-006 | Architect | Add component graduation policy to spec §FR-037 |
| OI-013 | Designer | Define per-screen skeleton shapes in feature UX artifacts |

These are **not blocked** — they can be done in parallel with Fix Round 1. They do not affect T045–T047.

---

## 3. Consistency Risks While Fixing

| Risk | What to preserve |
|------|-----------------|
| Token compliance | Do not introduce any new hardcoded `dp` or `Color` values. All new code must use `Spacing.*`, `TouchTarget.*`, `MaterialTheme.*`. |
| State system contract | `UiStateHandler` signature change (adding `animate` param) must be backward-compatible. Default = `true`. |
| Build verification | After T047, verify `compileDebugKotlinAndroid` and `testDebugUnitTest` both pass. If adding `kotlinx-datetime`, verify it doesn't conflict with existing datetime usage. |
| Offline banner format | After T047, relative timestamp ("Last updated X min ago") must produce identical output to the `System.currentTimeMillis()` version. |

---

## 4. Design Review Recheck After Fix Round 1

After T045–T047, the following design review items should be re-verified:

| CHK | What to recheck |
|-----|----------------|
| CHK033 | AuthShell now rejects invalid tab counts — try creating a RoleConfig with 1 tab and 6 tabs; expect runtime error |
| CHK050 | `UiStateHandler(state, animate = false)` renders without animation; `animate = true` (default) preserves existing Crossfade |
| CHK060 | OfflineBanner uses `Clock.System.now()` — no JVM-specific imports remain in `StateScreens.kt` |
| Full build | `compileDebugKotlinAndroid` + `testDebugUnitTest` + `assembleDebug` all pass |

---

## Fix Round 1 — Completion

**Date**: 2026-03-28  
**Tasks completed**: T045, T046, T047

### Files Changed

| File | Action | Task |
|------|--------|------|
| `navigation/AuthShell.kt` | MODIFIED | T045 — added `require(tabs.size in 2..5)` |
| `ui/shared/StateScreens.kt` | MODIFIED | T046 — added `animate` param + extracted `UiStateContent`; T047 — `Clock.System.now()` |
| `shared/build.gradle.kts` | MODIFIED | T047 — added `libs.kotlinx.datetime` dependency |
| `gradle/libs.versions.toml` | MODIFIED | T047 — added `kotlinx-datetime = "0.6.2"` version + library entry |

All paths relative to `mobile/` or `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`.

### Still Blocked

| Task | Reason |
|------|--------|
| T048 [OI-001] | Deferred — per-tab NavHost awaits Active Trip drill-down screens |
| T049 [OI-003] | Blocked — PM must confirm datetime picker is foundation scope |

### How to Verify

1. `./gradlew :shared:compileDebugKotlinAndroid` → ✅ BUILD SUCCESSFUL
2. `./gradlew :shared:testDebugUnitTest` → ✅ BUILD SUCCESSFUL
3. `./gradlew :composeApp:assembleDebug` → ✅ BUILD SUCCESSFUL
4. `grep -r "System.currentTimeMillis" mobile/shared/src/` → zero results confirms T047
5. Run app on emulator → switch between Driver/OpsExec tabs → offline banner still shows "Last updated X min ago"

### Follow-Up Risks

- **`kotlinx-datetime` version**: 0.6.2 is latest stable. Monitor for breaking changes if Kotlin version bumps.
- **`require()` in `AuthShell`**: Throws at composition time — consider catching in a test or enforcing at `RoleRegistry` registration time for better developer experience.
- **`UiStateContent` extraction**: Internal function not exposed publicly. If a caller needs custom state rendering, they bypass `UiStateHandler` entirely (by design).
