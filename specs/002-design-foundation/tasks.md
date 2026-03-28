# Tasks: Design Foundation

**Input**: Design documents from `specs/002-design-foundation/`  
**Prerequisites**: plan.md ✅, spec.md ✅, ux/ package ✅  
**Tests**: Not explicitly requested. Unit tests included only for token validation and state system correctness.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

### Story Mapping

| Story | Spec Title | Priority | Plan Phase |
|-------|-----------|----------|------------|
| US1 | Implementor Follows a Consistent Design Language | P1 | Phase 1 (Theme) + Phase 3 (Components) |
| US2 | Role Shell Adapts to the Active Role | P1 | Phase 4 (Navigation) |
| US3 | Every Screen Handles All Lifecycle States | P1 | Phase 2 (State System) |
| US4 | Trip Status is Visually Unambiguous at a Glance | P2 | Phase 1 (Colors) + Phase 3 (Badges) |
| US5 | Designer or Developer Adds a New Role Without Redesigning | P2 | Validated by US1+US2 completion |

---

## Phase 1: Setup

**Purpose**: Package restructuring — move existing theme to new package structure.

- [x] T001 Create `ui/theme/` package directory at `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/`
- [x] T002 Create `ui/components/` package structure with subdirectories: `buttons/`, `cards/`, `badges/`, `inputs/`, `feedback/`, `sheets/`, `stepper/` at `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/`

---

## Phase 2: Foundational — Design Tokens (Blocking)

**Purpose**: All design tokens MUST be in place before any component or screen work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Create color token definitions in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/Color.kt` — brand colors (emerald `#059669` primary, cyan `#0891B2` secondary), semantic colors (success, warning, error, info), surface/outline variants, and trip-phase colors (created=gray, in_transit=blue, completed=emerald, settled=muted, exception=orange). Define `TripPhase` enum with color mapping.
- [x] T004 [P] Create typography scale in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/Typography.kt` — 6-level scale: headline (24sp/Bold), title (20sp/SemiBold), subtitle (16sp/SemiBold), body (14sp/Regular), label (12sp/Medium), caption (11sp/Regular). Map to Material3 `Typography` slots.
- [x] T005 [P] Create spacing scale in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/Spacing.kt` — `xxs=2dp`, `xs=4dp`, `sm=8dp`, `md=12dp`, `lg=16dp`, `xl=24dp`, `xxl=32dp`, `screen=16dp`. Replace existing `Spacing` object.
- [x] T006 [P] Create elevation tokens in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/Elevation.kt` — `none=0dp`, `low=1dp`, `medium=4dp`, `high=8dp`.
- [x] T007 [P] Create animation tokens in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/Motion.kt` — `screen=250ms`, `sheet=200ms`, `fade=150ms`, `collapse=200ms` with easing curves.
- [x] T008 Move and refactor `AxleOpsTheme` composable from `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/Theme.kt` → `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/theme/AxleOpsTheme.kt`. Wire new Color, Typography, Shapes. Delete old `Theme.kt`.
- [x] T009 Update all imports referencing `ui.shared.Theme` → `ui.theme.AxleOpsTheme` and `ui.shared.Spacing` → `ui.theme.Spacing` across all existing files in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`
- [x] T010 Create `SpacingTest.kt` in `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/ui/theme/SpacingTest.kt` — verify all spacing values are multiples of 4dp (except xxs=2dp)
- [x] T011 Create `ColorTokenTest.kt` in `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/ui/theme/ColorTokenTest.kt` — verify `TripPhase` enum maps each phase to the correct color

**Checkpoint**: All design tokens defined. Compilation passes. Token tests pass. Theme restructure complete.

---

## Phase 3: User Story 3 — Every Screen Handles All Lifecycle States (P1) 🎯 MVP

**Goal**: Expand `UiState` from 4 to 6 states, add skeleton/offline/blocked composables, update `UiStateHandler`.

**Independent Test**: Force airplane mode on any screen → `OfflineBanner` visible + stale data visible + "Last updated" timestamp shown. Mock an error → `ErrorStateScreen` with retry. Mock empty data → `EmptyStateScreen` with icon.

- [x] T012 [US3] Add `Offline(staleData: T?, lastUpdatedMs: Long?)` and `Blocked(reason: String, resolution: String?)` variants to sealed interface in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/UiState.kt`
- [x] T013 [P] [US3] Create `SkeletonLine` and `SkeletonCard` composables with shimmer animation in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T014 [P] [US3] Create `SkeletonList(itemCount: Int)` composable (renders N `SkeletonCard` items) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T015 [P] [US3] Create `OfflineBanner` composable (full-width warning bar with connectivity icon + "No internet connection · Last updated X min ago" label) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T016 [P] [US3] Create `BlockedHint` composable (inline warning icon + reason text + optional resolution button) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T017 [US3] Update `EmptyStateScreen` to accept optional `icon: ImageVector?` parameter for illustration in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T018 [US3] Update `UiStateHandler` to handle `Offline` (render OfflineBanner + stale content if available, or EmptyStateScreen) and `Blocked` (render BlockedHint inline) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`
- [x] T019 [US3] Create `UiStateTest.kt` in `mobile/shared/src/commonTest/kotlin/com/axleops/mobile/ui/shared/UiStateTest.kt` — verify Offline preserves stale data, Blocked carries reason/resolution, sealed interface covers all 6 variants

**Checkpoint**: All 6 UiState variants defined. Skeleton, Offline, Blocked composables ready. UiStateHandler exhaustively dispatches all states.

---

## Phase 4: User Story 1 — Implementor Follows a Consistent Design Language (P1)

**Goal**: Create the shared component catalog so developers build screens from predefined components rather than ad-hoc composables.

**Independent Test**: A developer can build a new screen type (list, detail, action) using only components from `ui/components/` and tokens from `ui/theme/` — no hardcoded styling.

- [x] T020 [P] [US1] Create button components (`AxlePrimaryButton`, `AxleSecondaryButton`, `AxleTextButton`, `AxleDestructiveButton`, `AxleIconButton`) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/buttons/AxleButtons.kt` — all enforcing 48dp min height, using theme tokens
- [x] T021 [P] [US1] Create card components (`AxleCard` with header/body/footer slots, `SummaryCard` with value/label/trend) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/cards/AxleCards.kt` — radius=`Radius.md`, elevation=`Elevation.low`, padding=`Spacing.lg`
- [x] T022 [P] [US1] Create form input components (`AxleTextField` with top-aligned label, error state, blur validation, `AxleDropdown` with bottom sheet for >7 options) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/inputs/AxleInputs.kt`
- [x] T023 [P] [US1] Create feedback components (`AxleConfirmationDialog` with title/message/confirm/cancel/isDestructive, snackbar wrapper) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/feedback/AxleFeedback.kt`
- [x] T024 [P] [US1] Create `AxleBottomSheet` wrapper (handle bar, max 70% height, scrim, `Motion.sheet` animation) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/sheets/AxleBottomSheet.kt`
- [x] T025 [P] [US1] Create upload card component (`AxleUploadCard(state: UploadState)` with thumbnail + progress + retry/remove actions, `UploadState` sealed class: Idle/Uploading/Success/Failed) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/feedback/AxleUploadCard.kt`

**Checkpoint**: Full shared component catalog available. Any screen can be composed from these building blocks.

---

## Phase 5: User Story 4 — Trip Status is Visually Unambiguous at a Glance (P2)

**Goal**: Create trip-specific visual components (badges, stepper) using the trip-phase color tokens from Phase 2.

**Independent Test**: Render 5 trip cards with different phases (Created, In Transit, In Transit + Exception, Completed, Settled). A viewer correctly identifies each status within 3 seconds per card.

- [x] T026 [P] [US4] Create `TripPhaseBadge(phase: TripPhase, compact: Boolean)` composable — pill badge with phase-specific background color and white label in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/badges/TripBadges.kt`
- [x] T027 [P] [US4] Create `ExceptionBadge(count: Int)` composable — orange badge with exception icon + count in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/badges/TripBadges.kt`
- [x] T028 [P] [US4] Create `CountBadge(count: Int)` composable — small circle badge for tab notification counts in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/badges/TripBadges.kt`
- [x] T029 [US4] Create `HorizontalStepper(steps: List<StepState>, currentIndex: Int)` composable (10-dot summary) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/stepper/MilestoneStepper.kt` — step states: Completed (green + checkmark), Current (pulsing primary), Future (outline gray), Blocked (red lock), Skipped (muted dash)
- [x] T030 [US4] Create `VerticalStepper(steps: List<StepState>, currentIndex: Int)` composable (timeline detail) in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/stepper/MilestoneStepper.kt` — each step is an expandable card with colored left border

**Checkpoint**: Trip visual language components ready. Phase colors, badges, and stepper can be used by any trip-related screen.

---

## Phase 6: User Story 2 — Role Shell Adapts to the Active Role (P1)

**Goal**: Upgrade `AuthShell` with per-tab `NavHost`, Material icons, and offline banner integration.

**Independent Test**: Switch role between Driver and OpsExec stub → same shell structure renders with different tab icons/labels. Drill into a screen in one tab, switch away, switch back → previous screen is restored. Re-tap active tab → resets to root.

- [x] T031 [US2] Create `AxleIcon` sealed class or enum mapping icon names to Material `Icons.Outlined.*` vectors in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/TabDefinition.kt`
- [x] T032 [US2] Update `TabDefinition` to use `ImageVector` instead of `String` for `iconName` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/TabDefinition.kt`
- [x] T033 [US2] Create `TabNavHost` composable — per-tab `NavHost` wrapper that preserves backstack across tab switches using `rememberSaveable` in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/TabNavHost.kt`
- [x] T034 [US2] Refactor `AuthShell` to use per-tab `TabNavHost`, Material `Icon` composable (replace emoji), and integrate `OfflineBanner` between top bar and content area in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt`
- [x] T035 [US2] Add re-tap-active-tab logic: tapping the already-selected tab resets its `NavHost` to the start destination in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt`
- [x] T036 [US2] Update `DriverScreens.kt` and `OpsExecPlaceholderScreens.kt` to use Material icon `ImageVector` references in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/driver/DriverScreens.kt` and `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/opsexec/OpsExecPlaceholderScreens.kt`

**Checkpoint**: Shell renders Material icons, preserves per-tab navigation stack, shows offline banner when disconnected. Both Driver and OpsExec roles render correctly from their RoleConfig.

---

## Phase 7: Token Alignment Sweep

**Purpose**: Ensure all existing screens use named design tokens — zero hardcoded values.

- [x] T037 [P] [US1] Replace hardcoded dp/color/text values in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/LoginScreen.kt` with `Spacing.*`, `MaterialTheme.*` tokens
- [x] T038 [P] [US1] Replace hardcoded dp/color/text values in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/RoleSelectorScreen.kt` with theme tokens
- [x] T039 [P] [US1] Replace hardcoded dp/color/text values in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/SettingsScreen.kt` with theme tokens
- [x] T040 [P] [US1] Replace hardcoded dp/color/text values in `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/UnsupportedRoleScreen.kt` with theme tokens
- [x] T041 [P] Verify all interactive elements in existing screens meet 48dp minimum touch target — audit and fix any violations across `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/`

**Checkpoint**: All existing screens use named tokens only. Zero hardcoded color, size, or spacing values remain.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Compilation validation, documentation, and design review readiness.

- [x] T042 Run full compilation check: `cd mobile && ./gradlew :shared:compileKotlinMetadata` — fix any errors from package restructure
- [x] T043 Run full test suite: `cd mobile && ./gradlew :shared:allTests` — verify SpacingTest, ColorTokenTest, UiStateTest all pass
- [x] T044 Run Android app build: `cd mobile && ./gradlew :composeApp:assembleDebug` — verify app builds with new theme

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)                           ← no dependencies
    ↓
Phase 2 (Tokens)                          ← blocks everything
    ↓
Phase 3 (US3: States)    ─┐
Phase 4 (US1: Components) ├── all parallel after Phase 2
Phase 5 (US4: Trip Badges) ┘
    ↓
Phase 6 (US2: Shell)                      ← depends on Phase 3 (OfflineBanner)
    ↓
Phase 7 (Token Sweep)                     ← depends on Phase 2 tokens being final
    ↓
Phase 8 (Polish)                          ← depends on all above
```

### User Story Dependencies

- **US3 (States)**: Depends only on Phase 2 tokens. No dependency on other stories.
- **US1 (Components)**: Depends only on Phase 2 tokens. No dependency on other stories.
- **US4 (Trip Visuals)**: Depends on Phase 2 (trip-phase colors). No dependency on US1/US3.
- **US2 (Shell)**: Depends on Phase 3 (needs `OfflineBanner` from US3).
- **US5 (Extensibility)**: Validated implicitly by US1 + US2 completion. No dedicated tasks.

### Parallel Opportunities

Within Phase 2: T003–T007 are all parallel (different files, no dependencies).  
Within Phase 4: T020–T025 are all parallel (different component files).  
Within Phase 5: T026–T028 are parallel (same file but different functions).  
Within Phase 7: T037–T041 are all parallel (different screen files).  
Across phases: Phase 3, 4, 5 can all run in parallel after Phase 2 completes.

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Phase 1: Setup (package structure)
2. Complete Phase 2: Tokens (colors, typography, spacing, elevation, motion, theme)
3. Complete Phase 3: US3 (state system — Offline, Blocked, skeletons)
4. **STOP and VALIDATE**: App compiles, UiState handles 6 states, skeletons render
5. This alone satisfies Constitution Principle VII compliance

### Incremental Delivery

1. Setup + Tokens → Theme is emerald, all tokens defined
2. Add US3 (States) → Offline/Blocked/Skeleton patterns ready
3. Add US1 (Components) → Full component catalog available
4. Add US4 (Trip Visuals) → Badges and stepper ready
5. Add US2 (Shell) → Per-tab NavHost + Material icons
6. Token sweep → Zero hardcoded values
7. Polish → Compilation + tests green

### Parallel Team Strategy

With 2 developers after Phase 2:
- **Developer A**: Phase 3 (US3: States) → Phase 6 (US2: Shell)
- **Developer B**: Phase 4 (US1: Components) + Phase 5 (US4: Badges) → Phase 7 (Sweep)

---

## Notes

- All paths target `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`
- No backend or frontend changes — design layer only
- Upload/evidence capture platform integration (camera, gallery, signature) is not in scope — only the `UploadState` API contract is defined
- Milestone stepper renders step states but is not wired to trip data (wired in Active Trip feature spec)
- Design review checklist at `docs/design/design-review-checklist.md` validates all work

---

## Fix Round 1 (Post Design Review + QA)

**Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/handoff/open-issues.md)  
**Date**: 2026-03-28

### Ready for Engineering (no prerequisites)

- [x] T045 [OI-007] Add tab count validation `require(tabs.size in 2..5)` to `AuthShell` with meaningful error message  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/AuthShell.kt`  
  **Prerequisite**: None  
  **Affects**: Navigation shell · Future role expansion safety  
  **Consistency risk**: Must not change existing 4-tab Driver/OpsExec behavior  

- [x] T046 [OI-010] Add `animate: Boolean = true` parameter to `UiStateHandler` composable; when false, skip `Crossfade` and render directly  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`  
  **Prerequisite**: None  
  **Affects**: Loading/empty/error/offline/blocked patterns · Long-term feature consistency  
  **Consistency risk**: Default must remain `true` to preserve existing animated behavior  

- [x] T047 [OI-002] Replace `System.currentTimeMillis()` with `Clock.System.now().toEpochMilliseconds()` in `OfflineBanner`; add `kotlinx-datetime` dependency if not already present  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt`, `mobile/shared/build.gradle.kts`  
  **Prerequisite**: None  
  **Affects**: Shared components · iOS build compatibility  
  **Consistency risk**: Timestamp format in OfflineBanner must remain "X min ago"  

### Ready for Engineering (deferred until Active Trip epic starts)

- [ ] T048 [OI-001] Create `TabNavHost` composable wrapping per-tab `NavController` with `rememberSaveable`; integrate into `AuthShell` content area  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/navigation/TabNavHost.kt`, `AuthShell.kt`  
  **Prerequisite**: Active Trip feature requires drill-down screens (triggers this task)  
  **Affects**: Navigation shell · Role shells · Per-tab backstack preservation (FR-012)  
  **Consistency risk**: Re-tap-active-tab logic in AuthShell must wire to NavHost reset  

### Blocked on PM/Spec Decision

- [ ] T049 [OI-003] Add `AxleDateTimePicker` component to `ui/components/inputs/`  
  **File**: `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/components/inputs/AxleDateTimePicker.kt`  
  **Prerequisite**: PM must confirm datetime picker is foundation scope (see OI-003)  
  **Affects**: Shared components · Form field catalog completeness (FR-022)  
  **Consistency risk**: Must follow same label-above-field pattern as AxleTextField  

### Not engineering-actionable (spec/design artifact updates)

| OI | Owner | What's needed |
|----|-------|---------------|
| OI-004 | Designer | Update `docs/design/mobile-design-system.md` §1.6 with named icon size tokens |
| OI-005 | PM | Create state coverage grid template in spec or `specs/_templates/` |
| OI-006 | Architect | Add component graduation policy to spec §FR-037 |
| OI-008 | Architect | Decide if density is role-level or screen-level; defer or update RoleConfig |
| OI-009 | Architect | Document UiState non-extensibility as intentional constraint |
| OI-011 | Engineer (after spec) | Add MockNetworkInterceptor; needs spec to define mock offline behavior first |
| OI-012 | PM + Designer | Define SC-003 usability test protocol (not code-actionable) |
| OI-013 | Designer | Per-screen skeleton specs are feature-level responsibility |
