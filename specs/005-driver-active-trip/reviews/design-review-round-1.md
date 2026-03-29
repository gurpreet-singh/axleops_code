# Design Review — Round 1

> **Feature**: 005-driver-active-trip
> **Reviewer**: Designer Agent
> **Date**: 2026-03-29
> **Scope**: Implementation code in `/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`
> **Reviewed Against**: spec.md, ux/ (7 files), plan.md, mobile-design-system.md, mobile-navigation-grammar.md, role-shells.md

---

## 1. Status

**CHANGES REQUESTED**

The implementation has a solid architectural foundation — domain models, state machine, Decompose components, CTA derivation, and repository layer are well-structured. However, the UI layer has significant gaps between the approved UX package and what was implemented. Most issues are engineering-fixable without spec/UX changes.

---

## 2. Summary

| Category | Verdict |
|----------|---------|
| Domain model + state machine | ✅ Strong |
| Decompose component architecture | ✅ Solid |
| CTA state derivation | ✅ Correct |
| Screen structure (which screens exist) | ⚠️ Partial — 7/13 screens implemented |
| Loading/error/empty states | ❌ Non-compliant |
| Blocked state presentation | ✅ Correct (BlockedStateCard, ExceptionBanner exist) |
| Offline behavior | ⚠️ Infrastructure exists, not wired |
| Design system token usage | ⚠️ Partial |
| Interaction rule compliance | ❌ Multiple gaps |

---

## 3. What Matches the Approved UX

| Area | UX Requirement | Implementation |
|------|---------------|----------------|
| **CTA Derivation** | Per-state CTA label from interaction-rules §1.1 | ✅ `CtaState` + `TripStateMachine.allowedAction()` correctly derives labels |
| **Phase Badges** | Colored badges per state-inventory §1 | ✅ `PhaseBadge.kt` uses `TripSubState.infoFor()` with token resolution |
| **Blocked States** | Inline card with icon + reason + resolution | ✅ `BlockedStateCard.kt` handles 4 block reasons per §4.3 |
| **Exception Banner** | Red banner at top with exception details | ✅ `ExceptionBanner.kt` exists with correct styling |
| **Milestone Stepper** | 10-step visual with completed/current/future/blocked states | ✅ `MilestoneStepperSection.kt` implements all 5 step states |
| **State Machine** | Strict sequential transitions, exception detection | ✅ `TripStateMachine` with 12 transitions, 7 query functions |
| **Domain Model** | 29 TripStatus values, DriverAction sealed class | ✅ Complete alignment with spec FR-090 table |
| **Offline Queue** | FIFO queue with 5 mutation types | ✅ `OfflineQueue` + `QueuedMutation` + `SyncOfflineQueueUseCase` |
| **Mock Fixtures** | Lifecycle fixtures for QA | ✅ 7 JSON fixtures covering accepted → pod-submitted + no-trip |

---

## 4. Issues

### CRITICAL

#### CR-1: Loading state uses CircularProgressIndicator, not skeleton screen
- **Where**: `TripDetailScreen.kt` L66, `ActiveTripComponent` emits `TripUiState.Loading`
- **UX Spec**: state-inventory §4 + interaction-rules §3.3 — "Skeleton screen: card shape + stepper shape + sections"
- **Impact**: Violates design system §2.6 `LoadingScreen` definition and design philosophy §3 (content-shaped loading)
- **Fix**: Engineer-only — replace `CircularProgressIndicator()` with a skeleton composable matching the trip detail layout shape
- **Severity**: Critical

#### CR-2: Primary CTA button is inline (scrolls away), not bottom-anchored sticky
- **Where**: `TripDetailScreen.kt` L149–197 — CTA is inside the `Column(...).verticalScroll()`
- **UX Spec**: screen-map §3.3 + interaction-rules §1.1 — "Primary action button fixed at bottom, never scrolls out of view"
- **Impact**: On long trip detail content, the driver cannot see the CTA without scrolling to the bottom. Critical for field usability (truck cab test).
- **Fix**: Engineer-only — move CTA outside the scrollable Column, into a `Scaffold` bottomBar or a `Box` with `Alignment.BottomCenter`
- **Severity**: Critical

#### CR-3: No ActiveTripScreen landing page
- **Where**: screen-map §3.1–3.4 defines `ActiveTripScreen` as the tab landing with 4 layout variants
- **UX Spec**: ActiveTripScreen should show: (a) empty state, (b) dispatched trip with Accept/Reject, (c) active trip card summary, (d) read-only trip
- **Impact**: The current implementation goes directly to `TripDetailScreen`. There is no tab-level landing that shows the trip card with Accept/Reject on the DISPATCHED state. The entire dispatched-trip acceptance flow (spec US1) is architecturally missing from the UI layer.
- **Fix**: Engineer-only — create `ActiveTripScreen.kt` composable that reads from `ActiveTripComponent.uiState` and renders the appropriate variant
- **Severity**: Critical

---

### MAJOR

#### MJ-1: Documents and Expenses sections are placeholder text, not interactive lists
- **Where**: `TripDetailScreen.kt` L130–146
- **UX Spec**: screen-map §3.3 shows Documents section with "+ Add Document" and Expenses section with running total + "+ Add Expense"
- **Impact**: Documents and expenses are core P2 features. The UI shows "3 document(s) uploaded" as static text — no list items, no thumbnails, no add button, no status indicators.
- **Fix**: Engineer-only — wire `DocumentListSection` and `ExpenseListSection` composables with "Add" actions and item rendering
- **Severity**: Major

#### MJ-2: ExceptionBanner not integrated into TripDetailScreen
- **Where**: `ExceptionBanner.kt` exists as a composable but is not used anywhere in `TripDetailScreen.kt`
- **UX Spec**: state-inventory §5 — "Exception Active takes highest visual precedence. Banner appears at top."
- **Impact**: Active exception states silently pass through without the required red banner
- **Fix**: Engineer-only — add conditional `ExceptionBanner` at top of TripDetailContent when `TripStateMachine.isException(trip.status)` is true
- **Severity**: Major

#### MJ-3: OfflineBanner not integrated into trip screens
- **Where**: `OfflineBanner.kt` exists but is not consumed by `TripDetailScreen` or any trip screen
- **UX Spec**: interaction-rules §6 — "OfflineBanner sticky below top bar"
- **Impact**: Driver sees no offline indicator during trip
- **Fix**: Engineer-only — observe `ConnectivityObserver.isOnline` and show `OfflineBanner` in TripDetailScreen
- **Severity**: Major

#### MJ-4: No confirmation modals for Accept/Reject actions
- **Where**: `ActiveTripComponent.kt` L56–77 — `onAccept()` and `onReject()` fire directly
- **UX Spec**: interaction-rules §2.1 — Accept requires modal "Accept this trip?" with summary. Reject requires modal with reason text field.
- **Impact**: Irreversible actions execute without confirmation, violating the "destructive actions always require confirmation modal" rule.
- **Fix**: Engineer-only — add confirmation dialog state in component, render in Compose
- **Severity**: Major

#### MJ-5: Error state uses EmptyStateScreen, not ErrorScreen
- **Where**: `TripDetailScreen.kt` L68–73
- **UX Spec**: design system §2.6 — `ErrorScreen` has: error icon (48dp, color.error) + message + "Retry" primary button
- **Impact**: Error uses the EmptyStateScreen composable which may not match the error visual specification
- **Fix**: Engineer-only — create/use dedicated `ErrorScreen` composable per design system §2.6
- **Severity**: Major

---

### MINOR

#### MN-1: No pull-to-refresh on trip screens
- **Where**: `TripDetailScreen.kt` uses `verticalScroll` with no pull-to-refresh wrapper
- **UX Spec**: interaction-rules §7 — ActiveTripScreen and TripDetailScreen both support pull-to-refresh
- **Fix**: Engineer-only — wrap in `PullToRefreshBox` or equivalent Compose component
- **Severity**: Minor

#### MN-2: Section headers use `type.titleSmall` not `type.subtitle`
- **Where**: `TripDetailScreen.kt` L292 — `SectionHeader` uses `titleSmall` + `fontWeight.Bold` + `color.primary`
- **UX Spec**: design system §3.2 — "Section headers: type.subtitle, color.on.surface.variant, space.xl top margin"
- **Fix**: Engineer-only — change to `subtitleSmall`, `onSurfaceVariant`, add top margin
- **Severity**: Minor

#### MN-3: No GPS tracking indicator in trip header
- **Where**: screen-map §3.3 shows `[📍]` in the top bar during IN_TRANSIT
- **UX Spec**: spec FR-057 — "driver MUST see a tracking-active indicator"
- **Fix**: Engineer-only — observe `TrackingManager.isTracking` and show icon in top bar
- **Severity**: Minor

#### MN-4: No snackbar feedback after milestone transitions
- **Where**: `TripDetailScreen.kt` L200–214 — error snackbar exists but no success snackbar
- **UX Spec**: interaction-rules §3.1 — success shows "✓ [Milestone name] completed" for 3 seconds
- **Fix**: Engineer-only — emit success snackbar on transition completion
- **Severity**: Minor

#### MN-5: RouteInfoSection uses primaryContainer background instead of surface
- **Where**: `TripDetailScreen.kt` L225 — `CardDefaults.cardColors(containerColor = primaryContainer)`
- **UX Spec**: design system §2.2 — standard/active trip cards use `surface` background with `elevation.low`
- **Fix**: Engineer-only — change to surface color with proper elevation
- **Severity**: Minor

#### MN-6: Badge corner radius uses 8dp not `radius.sm` (4dp)
- **Where**: `PhaseBadge.kt` L48 — `RoundedCornerShape(8.dp)`
- **UX Spec**: design system §2.4 — "Phase badge: radius.sm (4dp)"
- **Fix**: Engineer-only — change to 4.dp
- **Severity**: Minor

#### MN-7: Missing screen transitions for PodCaptureFlow
- **Where**: `PodCaptureScreen.kt` exists as a single screen, but UX defines a 4-step flow (Photos → Signature → Consignee → Review)
- **UX Spec**: screen-map §2 + user-flow §4 — multi-step POD flow with tab bar hidden
- **Fix**: Engineer-only — current PodCaptureComponent is a single-screen form. Needs refactoring into 4 step screens or sections
- **Severity**: Minor (functional, but UX fidelity gap)

---

## 5. Issue Summary

| Severity | Count | Requires |
|----------|-------|----------|
| **Critical** | 3 | Engineer-only fix |
| **Major** | 5 | Engineer-only fix |
| **Minor** | 7 | Engineer-only fix |
| **Total** | 15 | All engineer-only |

No issues require UX package updates, PM/spec clarification, or architecture changes. The architecture (Decompose + state machine + repository pattern) is correct — the gaps are in UI rendering and wiring.

---

## 6. Recommended Next Actions

### Immediate (before next QA round)
1. **CR-1**: Replace spinner with skeleton loading screen
2. **CR-2**: Move CTA to sticky bottom bar (outside scrollable content)
3. **CR-3**: Create `ActiveTripScreen.kt` as tab landing with 4 variants

### Before feature sign-off
4. **MJ-1**: Wire Documents and Expenses sections with interactive lists
5. **MJ-2**: Integrate `ExceptionBanner` into `TripDetailScreen`
6. **MJ-3**: Integrate `OfflineBanner` into trip screens
7. **MJ-4**: Add confirmation modals for Accept/Reject
8. **MJ-5**: Create dedicated `ErrorScreen` composable

### Polish
9. **MN-1 through MN-7**: Token alignment, feedback patterns, GPS indicator

---

## 7. What's NOT in Scope for This Review

- Platform-specific GPS implementation (covered in separate location-tracking-audit.md)
- Backend API integration (all tasks correctly use mock-first strategy)
- Android/iOS actual implementations (expect/actual — separate task)
- Map SDK integration (correctly deferred with MapViewProvider interface)
