# Design Review Round 1 — 002-design-foundation

**Reviewed by**: Design Reviewer  
**Date**: 2026-03-28  
**Scope**: Full implementation against spec.md, plan.md, ux/* package, and approved task boundary (T001–T044)  

---

## 1. Status: Changes Requested

The foundation is architecturally sound and covers the majority of spec requirements. Several gaps exist — most are minor engineer-only fixes, but a few require UX clarification or are deferred-by-design. No blockers.

---

## 2. Summary

The implementation delivers a well-structured design foundation with:
- ✅ Complete token system (Color, Typography, Spacing, Elevation, Motion, Radius)
- ✅ 6-state `UiState` sealed interface with `UiStateHandler` composable
- ✅ Skeleton loaders (shimmer animation), OfflineBanner, BlockedHint
- ✅ 5 button variants, card components, input components, upload card, badges, stepper
- ✅ Material Icons via `compose.materialIconsExtended`
- ✅ Role-agnostic AuthShell with `ImageVector`-driven tabs
- ✅ Token sweep across existing screens (zero hardcoded dp imports)
- ✅ All builds pass: `compileDebugKotlinAndroid`, `testDebugUnitTest`, `assembleDebug`

However, some spec requirements are partially met or missing, detailed below.

---

## 3. What Matches the Approved UX

| Spec Area | FR(s) | Verdict |
|-----------|-------|---------|
| Color palette: brand emerald, semantic, trip-phase, surface | FR-001, FR-031, FR-032 | ✅ Matches. `TripPhase` enum with 4 phases + exception color. `AxleLightColorScheme` is emerald-primary. |
| Typography: 6-level scale with correct sizes | FR-002 | ✅ Matches. 24/20/16/14/12/11sp scale as specified. |
| Spacing: 4dp base, named tokens | FR-003 | ✅ Matches. xxs=2, xs=4, sm=8, md=12, lg=16, xl=24, xxl=32, screen=16. |
| Elevation + Radius tokens | Plan Phase 1 | ✅ Matches. 4 elevation levels, 4 radius levels. |
| Motion tokens | FR-011, Plan Phase 1 | ✅ Matches. Screen=250ms, sheet=200ms, fade=150ms, collapse=200ms. Easing curves defined. |
| 6-state UiState | FR-028, FR-030 | ✅ Matches. Loading, Empty, Error, DataLoaded, Offline, Blocked. |
| Skeleton loaders | FR-028 (loading) | ✅ Matches. `SkeletonLine` with shimmer animation, `SkeletonCard`, `SkeletonList`. |
| OfflineBanner | FR-028 (offline) | ✅ Matches. WifiOff icon, "Last updated X min ago" relative timestamp, persistent banner. Stale data preserved. |
| BlockedHint | FR-028 (blocked) | ✅ Matches. Lock icon, reason text, optional resolution CTA. |
| EmptyStateScreen | FR-028 (empty) | ✅ Matches. Icon (64dp default `Icons.Outlined.Inbox`), message, optional action button. |
| ErrorStateScreen | FR-028 (error) | ✅ Matches. Error icon (48dp), user-friendly message, retry button. |
| Button variants | FR-005, IR §1.1–1.3 | ✅ Matches. 5 variants with 48dp min height. Primary, Secondary, Text, Destructive, Icon. |
| AxleTextField with blur validation | FR-022, FR-023 | ✅ Matches. Top-aligned label, error state, `onBlurValidate` callback. |
| AxleDropdown | FR-022 | ✅ Matches. Exposed dropdown with label. |
| Upload card state machine | FR-025 | ✅ Matches. `UploadState` sealed: Idle, Uploading(progress), Success, Failed. Material icons. |
| TripPhaseBadge | FR-034 | ✅ Matches. Pill-shaped, phase-specific color, white text. Compact + standard. |
| ExceptionBadge | FR-032 | ✅ Matches. Orange background, count text. |
| CountBadge | FR-034 | ✅ Matches. 20dp circle, 99+ cap. |
| MilestoneStepper | FR-033 | ✅ Matches. Horizontal (dots) + vertical (cards). 5 states: Completed, Current, Future, Blocked, Skipped. Pulse animation on current. |
| AuthShell with Material icons | FR-006, FR-007, FR-008, US2 | ✅ Matches. Data-driven tab bar, Material `Icon()` composable, OfflineBanner integration. |
| Tab icons per role | FR-007 | ✅ Matches. Driver: Route, History, AccountBalanceWallet, Settings. OpsExec: Map, Route, Notifications, Settings. |
| Re-tap active tab | FR-012, clarification | ✅ Detection in place (currently no-op; per-tab NavHost deferred). |
| Shared vs role-specific boundary | FR-035, FR-036 | ✅ Matches. All tokens/components in shared. Role configs only differ in tab content. |
| Token sweep on existing screens | SC-001 | ✅ All existing screens use `Spacing.*`, `Elevation.*`, `MaterialTheme.*`. Zero `import unit.dp` in UI files. |
| 48dp touch targets | FR-005, SC-006 | ✅ Audit conducted. All interactive elements meet 48dp. |

---

## 4. Issues Found

### Issue 1: Per-tab NavHost not implemented (T033)

**FR-012**: "Tab switches MUST preserve each tab's navigation stack — returning to a previously visited tab resumes at the last-viewed screen."  
**Clarification**: "Preserve per-tab navigation stack."

**Current**: `AuthShell` uses `rememberSaveable { mutableStateOf(landingTabId) }` — flat tab switching. When tabs change, the previous tab's content is decomposed (not preserved). No `TabNavHost.kt` file exists.

**Severity**: Major  
**Requires**: Engineer-only fix (create `TabNavHost.kt` wrapping per-tab `NavController` with `rememberSaveable`)  
**Note**: Documented as deferred in handoff notes. Currently no drill-down screens exist, so the gap has no user-visible impact yet. Will become critical when Active Trip screen adds detail navigation.

---

### Issue 2: State transitions not animated (FR-029)

**FR-029**: "State transitions between loading → data-loaded, error → retry → loading MUST animate smoothly. No abrupt content jumps."

**Current**: `UiStateHandler` uses a `when` block — state changes cause hard cuts (no `AnimatedContent`, no `Crossfade`). The shimmer in `SkeletonList` animates, but the transition *between states* (loading → data) is instant.

**Severity**: Minor  
**Requires**: Engineer-only fix (wrap `UiStateHandler` body in `AnimatedContent` or `Crossfade` using `Motion.FADE_DURATION_MS`)

---

### Issue 3: Missing Snackbar component (AxleSnackbar)

**Plan §Phase 3**: Lists `AxleSnackbar` wrapper in `feedback/AxleFeedback.kt`.  
**IR §3.3**: Defines snackbar rules (auto-dismiss 3s success, persist error, above tab bar).

**Current**: `AxleFeedback.kt` contains only `AxleConfirmationDialog`. No `AxleSnackbar` component exists.

**Severity**: Minor  
**Requires**: Engineer-only fix (add `AxleSnackbar` composable or `SnackbarHost` configuration)

---

### Issue 4: Missing form components (FR-022)

**FR-022**: Specifies 8 form field types: text input, numeric input, dropdown/picker, date-time picker, checkbox, radio, toggle, multi-line text area.

**Current**: Only `AxleTextField` (text/numeric) and `AxleDropdown` are implemented. Missing: date-time picker, checkbox, radio, toggle, multi-line text area.

**Severity**: Minor  
**Requires**: PM/spec clarification — Are these foundation or feature work?  
**Note**: Plan §Phase 3 only lists `AxleTextField` and `AxleDropdown`, suggesting the others were intentionally deferred. Spec says "MUST define", plan scopes only 2. If intentional, the omission should be documented as deferred. Otherwise, the missing 6 components are needed.

---

### Issue 5: `AxleCard` uses direct `Elevation.low` but plan specifies slot API

**Plan §Phase 3**: "AxleCard (standard card with header/body/footer slots, radius=md, elevation=low)"

**Current**: `AxleCard` in `AxleCards.kt` uses a slot-based content lambda (correct). A review of the file shows it does use `Elevation.low` and `Radius.md`.

**Severity**: No issue — matches plan. ✅

---

### Issue 6: Missing icon size tokens (FR-004)

**FR-004**: "Standard icon sizes (24dp touch, 20dp inline, 16dp decorative)."

**Current**: No named icon size tokens exist in the theme. Components use ad-hoc `Modifier.size(24.dp)`, `Modifier.size(18.dp)`, `Modifier.size(10.dp)` etc. across StateScreens, Upload, and Stepper.

**Severity**: Minor  
**Requires**: Engineer-only fix (add `object IconSize { val touch = 24.dp; val inline = 20.dp; val decorative = 16.dp }` to theme)

---

### Issue 7: `SettingsScreen` uses raw `System.currentTimeMillis()` via `OfflineBanner`

**Current**: `OfflineBanner` uses `System.currentTimeMillis()` — JVM-specific. Will fail on iOS.

**Severity**: Minor  
**Requires**: Engineer-only fix (replace with `Clock.System.now()` from `kotlinx-datetime`)  
**Note**: Already documented in handoff notes.

---

### Issue 8: `AxleDropdown` uses deprecated `menuAnchor()` API

**Current**: Single-param `menuAnchor()` is deprecated in recent Material3 versions.

**Severity**: Minor  
**Requires**: Engineer-only fix (update to 2-param overload)  
**Note**: Already documented. Non-blocking — compiles with warning only.

---

### Issue 9: No pull-to-refresh support in foundation components (FR-019)

**FR-019**: "List screens MUST support pull-to-refresh."  
**IR §5.3**: "Available on all list screens and single-item screens."

**Current**: No `PullToRefreshBox` or equivalent wrapper exists in the component catalog. Individual screens will need to implement it ad-hoc.

**Severity**: Major  
**Requires**: Engineer-only fix (add shared `AxlePullToRefresh` wrapper or document as feature-deferred)  
**Note**: This is a frequently reused pattern. A shared wrapper would prevent inconsistency across screens.

---

### Issue 10: No FAB button variant (FR-018)

**FR-018**: "List screen: optional FAB."  
**UX design-review-checklist**: "Buttons: 6 variants (primary, secondary, text, destructive, icon, FAB)"

**Current**: `AxleButtons.kt` has 5 variants. No FAB. The design review checklist expects 6.

**Severity**: Minor  
**Requires**: Engineer-only fix (add `AxleFab` composable)

---

### Issue 11: `TripBadges.kt` has hardcoded `dp` values

**Current**: Lines 45-46 use `2.dp`, `4.dp`, `6.dp`, `8.dp` directly instead of `Spacing.*` tokens. Also `20.dp` for CountBadge size (line 100).

**Severity**: Minor  
**Requires**: Engineer-only fix (replace with `Spacing.xxs`, `Spacing.xs`, etc.)

---

### Issue 12: `AxleButtons.kt` uses raw `48.dp` instead of a token

**Current**: `private val ButtonHeight = 48.dp` — correct value but not from a named touch target token.

**Severity**: Minor  
**Requires**: Engineer-only fix (add `object TouchTarget { val minimum = 48.dp }` or use existing token)

---

## 5. Severity Summary

| Severity | Count | Issues |
|----------|-------|--------|
| **Critical** | 0 | — |
| **Major** | 2 | #1 (per-tab NavHost), #9 (pull-to-refresh) |
| **Minor** | 8 | #2, #3, #4, #6, #7, #8, #10, #11, #12 |

---

## 6. Resolution Matrix

| # | Issue | Fix Type | Owner |
|---|-------|----------|-------|
| 1 | Per-tab NavHost | Engineer-only fix | Engineer (deferred until drill-down screens exist) |
| 2 | State transition animation | Engineer-only fix | Engineer |
| 3 | Missing AxleSnackbar | Engineer-only fix | Engineer |
| 4 | Missing form components | PM/spec clarification | PM decides scope |
| 6 | Icon size tokens | Engineer-only fix | Engineer |
| 7 | `System.currentTimeMillis()` | Engineer-only fix | Engineer |
| 8 | Deprecated `menuAnchor()` | Engineer-only fix | Engineer |
| 9 | Pull-to-refresh wrapper | Engineer-only fix | Engineer |
| 10 | Missing FAB variant | Engineer-only fix | Engineer |
| 11 | TripBadges hardcoded dp | Engineer-only fix | Engineer |
| 12 | ButtonHeight not tokenized | Engineer-only fix | Engineer |

---

## 7. Recommended Next Actions

### Immediate (before next feature work)
1. **Add `AnimatedContent` to `UiStateHandler`** (#2) — prevents visual jank when states change
2. **Add icon size tokens** (#6) — small change, big consistency win
3. **Tokenize badge/button hardcoded dp values** (#11, #12) — complete the token sweep

### Before Active Trip feature
4. **Implement `TabNavHost`** (#1) — required once drill-down navigation exists
5. **Add pull-to-refresh wrapper** (#9) — needed for Active Trip list + Past Trips list
6. **Add `AxleSnackbar`** (#3) — needed for submit-action feedback

### Clarification needed
7. **PM to confirm**: Are date-time picker, checkbox, radio, toggle, multi-line textarea foundation scope or feature-deferred? (#4)

### Can defer safely
8. `menuAnchor()` deprecation (#8) — compiles fine, fix when updating M3
9. `System.currentTimeMillis()` (#7) — only affects iOS, fix when iOS build is set up
10. FAB variant (#10) — no Driver v1 screen uses FAB per current spec
