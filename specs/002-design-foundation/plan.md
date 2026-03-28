# Implementation Plan: Design Foundation

**Branch**: `002-design-foundation` | **Date**: 2026-03-28 | **Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md)  
**Input**: Feature specification from `specs/002-design-foundation/spec.md`

---

## Summary

Implement the AxleOps mobile design foundation: align the theme with the design system specification (emerald primary, semantic/trip-phase colors, extended spacing), add Offline and Blocked states to the `UiState` sealed class, replace the spinner-based `LoadingIndicator` with skeleton components, upgrade the `AuthShell` with per-tab `NavHost` for stack preservation, replace emoji tab icons with Material icon resources, and create the shared component catalog (buttons, cards, badges, stepper, bottom sheet, modals, form inputs). All changes target `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`.

---

## Technical Context

**Language/Version**: Kotlin 2.0 (KMP), Compose Multiplatform  
**Primary Dependencies**: Material 3, Koin (DI), Ktor (networking), Compose Navigation  
**Storage**: N/A (design layer — no persistence changes)  
**Testing**: `kotlin.test` (commonTest), Compose UI unit tests  
**Target Platform**: Android (v1), iOS (future via KMP)  
**Project Type**: Mobile app (KMP/Compose Multiplatform)  
**Constraints**: Offline-capable UX, minimum 48dp touch targets, portrait-only, single primary color across roles  

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Existing-System-First | ✅ Pass | Extends existing `Theme.kt`, `UiState.kt`, `StateScreens.kt` — no new architectural layers |
| II. Role-Scoped Design | ✅ Pass | Single design system for all roles. Role variation is content-only (tab config, screen content) |
| III. Closest-Contract API | ✅ Pass | Design layer has no API dependencies |
| IV. Principle of Least Scope | ✅ Pass | Changes limited to `ui/shared/`, `navigation/`, and theme — no domain or data layer changes |
| V. Incremental, Demoable | ✅ Pass | Each phase produces a visible improvement. Theme change alone is demoable. |
| VI. Mobile-Directory Boundary | ✅ Pass | All changes in `mobile/shared/src/commonMain/` |
| VII. Production-Grade Field UX | ✅ Pass | Adding Offline/Blocked states, skeleton loaders, touch target enforcement — direct compliance |
| VIII. Testability & Switchability | ✅ Pass | Components are composable functions with preview — testable via snapshot/unit tests |
| IX. Reviewability | ✅ Pass | Plan is phased into small, reviewable diffs |

---

## Complexity Tracking

No constitution violations. No complexity justifications needed.

---

## Current State Analysis

### What Exists (from spec-001 implementation)

| Component | File | Assessment |
|-----------|------|------------|
| **Theme** | [Theme.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/Theme.kt) | Primary is deep blue (`#1A56DB`), not emerald (`#059669`). Spacing object exists but misses `xxs`, `md` (12dp). No semantic colors, no trip-phase colors. Typography scale exists but diverges from design system spec. |
| **UiState** | [UiState.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/UiState.kt) | 4 states: Loading, Empty, Error, DataLoaded. Missing: `Offline(staleData)` and `Blocked(reason)`. |
| **StateScreens** | [StateScreens.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt) | `LoadingIndicator` uses spinner (spec requires skeletons). `EmptyStateScreen` missing icon/illustration. `UiStateHandler` doesn't handle Offline/Blocked. |
| **AuthShell** | [AuthShell.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt) | Flat tab switching via `rememberSaveable { mutableStateOf(landingTabId) }` — no per-tab `NavHost`. Emoji icons instead of Material icons. No offline banner. |

### What Needs to Be Created

| Component | Purpose |
|-----------|---------|
| Extended color tokens | Semantic colors (success, warning, info), trip-phase colors, surface variants |
| Extended spacing tokens | `xxs` (2dp), `md` (12dp), `screen` (16dp) |
| Elevation tokens | `AxleElevation` object with none/low/medium/high values |
| Animation tokens | `AxleMotion` object with screen/sheet/fade/collapse durations |
| Skeleton composables | `SkeletonCard`, `SkeletonList`, `SkeletonLine` |
| `OfflineBanner` | Persistent connectivity indicator |
| `BlockedHint` | Inline block-reason display |
| `Offline` and `Blocked` UiState variants | Extended sealed interface |
| Per-tab `NavHost` | Stack-preserving tab navigation |
| Material icon integration | Replace emoji tab icons |
| Badge components | `TripPhaseBadge`, `ExceptionBadge`, `CountBadge` |
| Card components | `AxleCard`, `SummaryCard` |
| Button components | `AxlePrimaryButton`, `AxleSecondaryButton`, `AxleTextButton`, `AxleDestructiveButton` |
| Form components | `AxleTextField`, `AxleDropdown`, validation helpers |
| Bottom sheet wrapper | `AxleBottomSheet` with handle and max-height |
| Confirmation dialog | `AxleConfirmationDialog` |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-design-foundation/
├── spec.md              # Feature specification ✅
├── plan.md              # This file
├── tasks.md             # Phase 2 output (/speckit.tasks)
├── checklists/
│   └── requirements.md  # Quality checklist ✅
└── ux/                  # UX package ✅
    ├── ux-brief.md
    ├── user-flow.md
    ├── screen-map.md
    ├── state-inventory.md
    ├── interaction-rules.md
    ├── data-dependencies.md
    └── design-review-checklist.md
```

### Source Code Changes

```text
mobile/shared/src/commonMain/kotlin/com/axleops/mobile/
├── ui/
│   ├── theme/                          # [NEW] Extracted theme package
│   │   ├── AxleOpsTheme.kt             # [MOVED+MODIFIED] from ui/shared/Theme.kt
│   │   ├── Color.kt                    # [NEW] All color tokens (brand, semantic, trip-phase, surface)
│   │   ├── Typography.kt               # [NEW] Typography scale tokens
│   │   ├── Spacing.kt                  # [NEW] Spacing scale (replaces Spacing object in Theme.kt)
│   │   ├── Elevation.kt                # [NEW] Elevation tokens
│   │   └── Motion.kt                   # [NEW] Animation duration/curve tokens
│   │
│   ├── components/                     # [NEW] Shared component catalog
│   │   ├── buttons/
│   │   │   └── AxleButtons.kt          # [NEW] Primary, Secondary, Text, Destructive, Icon buttons
│   │   ├── cards/
│   │   │   └── AxleCards.kt            # [NEW] Standard card, summary card
│   │   ├── badges/
│   │   │   └── TripBadges.kt           # [NEW] Phase badge, exception badge, count badge
│   │   ├── inputs/
│   │   │   └── AxleInputs.kt           # [NEW] Text field, dropdown, validation helpers
│   │   ├── feedback/
│   │   │   └── AxleFeedback.kt         # [NEW] ConfirmationDialog, Snackbar wrapper
│   │   ├── sheets/
│   │   │   └── AxleBottomSheet.kt      # [NEW] Styled bottom sheet with handle
│   │   └── stepper/
│   │       └── MilestoneStepper.kt     # [NEW] Horizontal + vertical stepper (API-only, data for future)
│   │
│   └── shared/                         # [MODIFIED] Existing shared UI
│       ├── StateScreens.kt             # [MODIFIED] Add SkeletonCard, SkeletonList, OfflineBanner,
│       │                               #   BlockedHint; update UiStateHandler for 6 states
│       ├── UiState.kt                  # [MODIFIED] Add Offline, Blocked variants
│       ├── LoginScreen.kt              # [MINOR] Apply updated theme tokens
│       ├── SettingsScreen.kt           # [MINOR] Apply updated theme tokens
│       └── ...                         # Other screens: minor token alignment
│
├── navigation/
│   ├── AuthShell.kt                    # [MODIFIED] Per-tab NavHost, Material icons, offline banner
│   └── TabNavHost.kt                   # [NEW] Per-tab navigation host wrapper
│
└── [Theme.kt]                          # [DELETE] Moved to ui/theme/ package
```

**Structure Decision**: The existing flat `ui/shared/` package is split into `ui/theme/` (design tokens), `ui/components/` (shared component catalog), and `ui/shared/` (screen-level shared composables). This maps to the spec's component ownership model (FR-037: shared components in `ui/common/`). The `components/` package is the `ui/common/` equivalent.

---

## Implementation Phases

### Phase 1: Theme Alignment (Foundation)

**Goal**: Align all design tokens with the design system specification.

#### Changes

1. **Create `ui/theme/Color.kt`**: Define all color tokens from [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) §1.1:
   - Brand: `AxlePrimary = #059669` (emerald), `AxleSecondary = #0891B2` (cyan)
   - Semantic: success, warning, error, info
   - Trip phases: created (gray), in_transit (blue), completed (emerald), settled (muted), exception (orange)
   - Surface variants, outline variants
   - Update `lightColorScheme()` to use new emerald primary

2. **Create `ui/theme/Typography.kt`**: Extract and align typography scale with spec (24sp headline, 20sp title, 16sp subtitle, 14sp body, 12sp label, 11sp caption).

3. **Create `ui/theme/Spacing.kt`**: Extended spacing: `xxs=2dp`, `xs=4dp`, `sm=8dp`, `md=12dp`, `lg=16dp`, `xl=24dp`, `xxl=32dp`, `screen=16dp`.

4. **Create `ui/theme/Elevation.kt`**: `none=0dp`, `low=1dp`, `medium=4dp`, `high=8dp`.

5. **Create `ui/theme/Motion.kt`**: `screen=250ms`, `sheet=200ms`, `fade=150ms`, `collapse=200ms`.

6. **Create `ui/theme/AxleOpsTheme.kt`**: Move from `ui/shared/Theme.kt`, wire new color/typography/shapes. Delete old `Theme.kt`.

7. **Update imports**: All files importing `Theme.kt` get redirected to new package.

#### Size: ~8 files touched, small diff per file.

---

### Phase 2: State System Upgrade

**Goal**: Expand `UiState` to 6 states, add skeleton/offline/blocked components.

#### Changes

1. **Modify `UiState.kt`**: Add `Offline(staleData: T?, lastUpdated: Long?)` and `Blocked(reason: String, resolution: String?)` variants to sealed interface.

2. **Modify `StateScreens.kt`**:
   - Add `SkeletonLine` composable (animated shimmer rectangle)
   - Add `SkeletonCard` composable (card-shaped skeleton with line placeholders)
   - Add `SkeletonList` composable (N skeleton cards in column)
   - Add `OfflineBanner` composable (full-width warning bar with wifi-off icon + "No internet connection · Last updated X min ago")
   - Add `BlockedHint` composable (inline warning icon + reason + optional resolution button)
   - Update `UiStateHandler` to dispatch `Offline` → `OfflineBanner` + stale content, `Blocked` → `BlockedHint` inline

3. **Update `EmptyStateScreen`**: Add optional `icon` parameter for illustration/icon display (currently text-only).

#### Size: ~3 files, focused diff.

---

### Phase 3: Shared Component Catalog

**Goal**: Create the reusable component library referenced by all future feature screens.

#### Changes

1. **`ui/components/buttons/AxleButtons.kt`**: `AxlePrimaryButton`, `AxleSecondaryButton`, `AxleTextButton`, `AxleDestructiveButton`, `AxleIconButton` — all enforcing 48dp min touch target, consistent styling.

2. **`ui/components/cards/AxleCards.kt`**: `AxleCard` (standard card with header/body/footer slots, radius=`md`, elevation=`low`), `SummaryCard` (KPI value + label + optional trend).

3. **`ui/components/badges/TripBadges.kt`**: `TripPhaseBadge(phase: TripPhase)` mapping phase → color/label, `ExceptionBadge`, `CountBadge(count: Int)`.

4. **`ui/components/inputs/AxleInputs.kt`**: `AxleTextField` (top-aligned label, error state, blur validation callback), `AxleDropdown` (bottom sheet on tap when > 7 options).

5. **`ui/components/feedback/AxleFeedback.kt`**: `AxleConfirmationDialog(title, message, onConfirm, onCancel, isDestructive)`, `AxleSnackbar` wrapper.

6. **`ui/components/sheets/AxleBottomSheet.kt`**: Styled bottom sheet with handle bar, max 70% height, scrim backdrop.

7. **`ui/components/stepper/MilestoneStepper.kt`**: `HorizontalStepper(steps, currentStep)` and `VerticalStepper(steps, currentStep)` — composable API only. The step data model will be wired to trip milestone data in a later feature spec.

#### Size: 7 new files, self-contained.

---

### Phase 4: Navigation Shell Upgrade

**Goal**: Per-tab `NavHost` for stack preservation, Material icon integration, and offline banner in shell.

#### Changes

1. **New `navigation/TabNavHost.kt`**: Wraps a per-tab `NavHost` that preserves its backstack when the tab is deselected. Uses `rememberSaveable` + `NavHostController` per tab.

2. **Modify `AuthShell.kt`**:
   - Replace `tabContent(selectedTabId)` with `TabNavHost` per tab (only the selected tab is composed, but all backstacks survive)
   - Replace `resolveIconEmoji()` with Material 3 `Icon` composable using `Icons.Outlined.*` mapping
   - Delete `resolveIconEmoji()` function
   - Add `OfflineBanner` between TopAppBar and content area (conditionally shown based on connectivity state)
   - Re-tap active tab → reset that tab's NavHost to start destination

3. **Update `TabDefinition.kt`**: Change `iconName: String` to use `ImageVector` references or define an `AxleIcon` enum that maps to Material icons.

4. **Update `RoleConfig` usages**: `DriverScreens.kt` and `OpsExecPlaceholderScreens.kt` updated to use Material icon references.

#### Size: 1 new file, 4 modified files.

---

### Phase 5: Token Alignment Sweep

**Goal**: Ensure all existing screens use the new design tokens — zero hardcoded values.

#### Changes

1. Sweep `LoginScreen.kt`, `RoleSelectorScreen.kt`, `SettingsScreen.kt`, `UnsupportedRoleScreen.kt`, and all placeholder screens.
2. Replace any hardcoded `dp` values with `Spacing.*` tokens.
3. Replace any hardcoded `Color()` calls with theme references.
4. Replace any hardcoded `TextStyle()` with `MaterialTheme.typography.*`.
5. Verify all interactive elements meet 48dp minimum.

#### Size: ~6 files, small changes per file.

---

## What Belongs in Foundation vs Later Feature Work

| Foundation (this spec) | Later Feature Work |
|------------------------|-------------------|
| Design tokens (color, typography, spacing, elevation, animation) | Feature-specific screen layouts |
| `UiState` sealed class with 6 states | ViewModel state management for specific features |
| State screen composables (skeleton, empty, error, offline, blocked) | Screen-specific skeleton shapes |
| Button, card, badge, input component APIs | Feature-specific card content |
| `MilestoneStepper` composable API | Stepper wired to trip milestone data |
| `AxleBottomSheet` wrapper | Feature-specific sheet content |
| `AxleConfirmationDialog` | Feature-specific confirmation messages |
| Per-tab `NavHost` architecture | Feature-specific navigation graphs |
| Material icon integration for tab bar | Feature-specific screen icons |
| Design review checklist | Per-feature design reviews |
| Upload/evidence pattern API (`AxlePhotoCapture`, `AxleSignatureCanvas`) | Deferred to Active Trip feature spec — defined here as component API contracts only |

---

## Upload/Evidence Pattern Reusability

The design system defines the **API contract** for upload/evidence components (FR-025, FR-026) but does not implement the full capture flows (camera, gallery, signature) — those depend on platform APIs (CameraX/AVFoundation) and belong in the Active Trip feature spec.

Foundation provides:
- `AxleUploadCard(state: UploadState, onRetry, onRemove)` — thumbnail + progress + actions
- `UploadState` sealed class: `Idle`, `Uploading(progress)`, `Success(thumbnailUri)`, `Failed(message)`

Active Trip spec will provide:
- Camera integration (`expect/actual` for platform capture)
- Gallery picker integration
- Signature canvas composable
- Wiring to upload repository

---

## Design Review Repeatability

The foundation creates a **machine-readable design review process** for later features:

1. **Design review checklist** at [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/design-review-checklist.md) — 10 sections, all pass criteria defined
2. Each future feature spec's UX package includes a feature-local `design-review-checklist.md` that references the global one
3. Token enforcement is structural: all components consume `MaterialTheme.*` internally, so using the component library automatically inherits correct tokens
4. A reviewer can audit any PR by checking the 10-section checklist — no subjective design decisions

---

## Verification Plan

### Automated Tests

**Command**: `cd /Users/ankit/a/fleetly/axleops_code/mobile && ./gradlew :shared:allTests`

1. **`UiStateTest.kt`** (new, `commonTest`):
   - Verify `UiState.Offline` preserves stale data
   - Verify `UiState.Blocked` carries reason and resolution
   - Verify sealed interface exhaustiveness (compile-time — no `else` branches needed)

2. **`ColorTokenTest.kt`** (new, `commonTest`):
   - Verify `TripPhase.CREATED` maps to gray color
   - Verify `TripPhase.IN_TRANSIT` maps to blue
   - Verify `TripPhase.COMPLETED` maps to emerald
   - Verify `TripPhase.SETTLED` maps to muted gray

3. **`SpacingTest.kt`** (new, `commonTest`):
   - Verify all spacing tokens are multiples of 4dp (except `xxs = 2dp`)

### Compilation Check

**Command**: `cd /Users/ankit/a/fleetly/axleops_code/mobile && ./gradlew :shared:compileKotlinMetadata`

- Verifies that the package restructure (Theme.kt → ui/theme/) compiles cleanly
- Verifies all import redirections work
- Verifies `UiStateHandler` handles all 6 `UiState` variants (sealed interface exhaustiveness)

### Manual Verification

> [!IMPORTANT]
> The following manual checks require building and running the Android app. Please confirm if the dev environment is ready for `./gradlew :composeApp:installDebug`.

1. **Launch app → Login → Observe shell**: Verify emerald primary color is applied to top bar, buttons, and active tab indicator
2. **Switch tabs**: Verify tab switching preserves navigation state (drill into a screen, switch away, switch back — same screen visible)
3. **Re-tap active tab**: Verify it resets to the tab root screen
4. **Toggle airplane mode while on any screen**: Verify `OfflineBanner` appears below the top bar with "Last updated X min ago" message
5. **Verify tab icons**: Confirm Material icons appear (not emoji) for all tabs

---

## References

- [Spec](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md)
- [Design System](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)
- [Design Philosophy](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md)
- [Navigation Grammar](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md)
- [Role Shells](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md)
- [State Inventory](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/ux/state-inventory.md)
- [Interaction Rules](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/ux/interaction-rules.md)
- [Constitution v3.0.0](file:///Users/ankit/a/fleetly/axleops_code/.specify/memory/constitution.md)
