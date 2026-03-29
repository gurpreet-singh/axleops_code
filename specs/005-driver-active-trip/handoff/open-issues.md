# Open Issues — Driver Active Trip

> **Feature**: 005-driver-active-trip
> **PM Triage Date**: 2026-03-29
> **Feature Status**: **Ready for Fix Round**
> **Sources**: [design-review-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/reviews/design-review-round-1.md), [qa-report-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/reviews/qa-report-round-1.md), [implementation-notes.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/handoff/implementation-notes.md)

---

## Feature Decision

**Ready for Fix Round**

The domain layer (state machine, models, CTA derivation, offline queue, mock fixtures) is production-quality. The UI layer has 24 open issues (3 critical, 8 major, 10 minor, 3 QA-infra). All are engineer-fixable — no spec rewrites, no UX package changes, no architecture rework needed. The fix round can proceed immediately.

> [!IMPORTANT]
> Zero lifecycle/state-machine issues were found. The state machine, CTA derivation, and action permission logic are fully correct. Driver trust is not at risk from the domain layer — only from the UI layer not surfacing what the domain layer already computes correctly.

---

## Issue Register

### CRITICAL — Fix Before Next QA Round

| ID | Title | Owner | Action | Downstream Risk |
|----|-------|-------|--------|----------------|
| OI-001 | **No ActiveTripScreen landing page** | Engineer | Fix directly | 🔴 Blocks Past Trips (reuses same screen patterns). Blocks Settings (driver shell tab host needs this screen as Tab 1 root). |
| OI-002 | **CTA button scrolls away (not bottom-anchored)** | Engineer | Fix directly | 🔴 Same CTA pattern reused in Past Trip detail, Expense form, POD flow. If fixed correctly here, all downstream screens inherit it. |
| OI-003 | **Loading uses spinner, not skeleton screen** | Engineer | Fix directly | 🟡 Skeleton composable becomes shared component for Past Trips list and Earnings summary. Fix once, reuse everywhere. |

<details>
<summary>Critical issue details</summary>

**OI-001 — No ActiveTripScreen landing page**
- Design ref: screen-map §3.1–3.4 (4 layout variants)
- QA ref: F01 (CHK001, CHK006)
- Impact: The entire dispatched trip acceptance flow (spec US1) has no UI surface. `ActiveTripComponent` exists, `TripUiState` has all 4 variants, but no Compose screen reads from it. Tab goes directly to `TripDetailScreen`.
- Resolution: Create `ActiveTripScreen.kt` with 4 branches: NoTrip → empty, DISPATCHED → trip card + Accept/Reject, Active → card summary + detail, ReadOnly → card + info banner.

**OI-002 — CTA scrolls away**
- Design ref: ux-brief §3 (Layer 3: always visible), interaction-rules §1.1
- QA ref: F02 (CHK009)
- Impact: Driver in truck cab cannot see the primary action button after scrolling down to view cargo or documents. Fails the "truck cab test".
- Resolution: Move CTA outside `verticalScroll()` Column into a `Scaffold` bottomBar or `Box` with `Alignment.BottomCenter`.

**OI-003 — Spinner instead of skeleton**
- Design ref: design system §2.6 `LoadingScreen`, state-inventory §4
- QA ref: F03 (CHK061, CHK068)
- Impact: Content shift when data loads (spinner → full content) instead of progressive reveal.
- Resolution: Create `TripDetailSkeleton` composable matching card + stepper + section shapes.

</details>

---

### MAJOR — Fix Before Feature Sign-Off

| ID | Title | Owner | Action | Downstream Risk |
|----|-------|-------|--------|----------------|
| OI-004 | **ExceptionBanner not wired into TripDetailScreen** | Engineer | Fix directly | 🔴 HIGH TRUST RISK. Exception states silently pass through. Driver sees normal UI while trip is blocked by accident/breakdown. If exceptions are hidden, driver trust erodes. |
| OI-005 | **OfflineBanner not wired into trip screens** | Engineer | Fix directly | 🟡 OfflineBanner is a shared component. Past Trips + Settings + Earnings all need it. Fix wiring pattern here. |
| OI-006 | **No confirmation modals for Accept/Reject** | Engineer | Fix directly | 🔴 HIGH TRUST RISK. Accidental accept/reject is irreversible. Reject has no reason field in UI. Directly affects operational correctness. |
| OI-007 | **Documents section is placeholder text** | Engineer | Fix directly | 🟡 Document list pattern needed for Past Trips (read-only document viewing). |
| OI-008 | **Expenses section is placeholder text** | Engineer | Fix directly | 🟡 Expense list + running total pattern needed for Earnings feature. |
| OI-009 | **Error state uses EmptyStateScreen** | Engineer | Fix directly | 🟡 `ErrorScreen` becomes shared component. Past Trips and Earnings will reuse it. |
| OI-010 | **No success snackbar after transitions** | Engineer | Fix directly | 🟢 Low downstream risk. Pattern establishes feedback convention for all features. |
| OI-011 | **OfflineBanner uses wrong color token** | Engineer | Fix directly | 🟢 Token fix: `surfaceVariant` → `color.warning` per design system §2.6. |

<details>
<summary>High-trust-risk issue details</summary>

**OI-004 — ExceptionBanner not wired**
- Design ref: state-inventory §5 (exception takes highest visual precedence), interaction-rules §4.2
- QA ref: F04 (CHK012, CHK065)
- Trust impact: A driver with a VEHICLE_BREAKDOWN or ACCIDENT status sees the normal trip card with an active CTA. They may attempt to transition while operations has flagged the trip as blocked. This directly undermines the "blocked states explain themselves" design mandate (ux-brief §2.6).
- Resolution: Add `if (trip.activeException != null) ExceptionBanner(...)` at top of `TripDetailContent`, before scrollable content. Suppress CTA when exception is blocking.

**OI-006 — No confirmation modals**
- Design ref: interaction-rules §2.1 (Accept + Reject require confirmation)
- QA ref: F08 (CHK021)
- Trust impact: A driver who accidentally taps "Accept" is immediately committed to a trip. A driver who taps "Reject" has no prompt for a reason — the rejection goes through without audit trail. Both actions are irreversible.
- Resolution: Add `showConfirmDialog: Boolean` state to `ActiveTripComponent`. Render confirmation modal in Compose. Reject modal must include a required reason text field.

</details>

---

### MINOR — Fix During Polish

| ID | Title | Owner | Action | Downstream Risk |
|----|-------|-------|--------|----------------|
| OI-012 | **No pull-to-refresh** | Engineer | Fix directly | 🟢 Standard Compose pattern. |
| OI-013 | **Section headers use wrong type token** | Engineer | Fix directly | 🟢 Token alignment. |
| OI-014 | **Badge corner radius 8dp not 4dp** | Engineer | Fix directly | 🟢 Token alignment. |
| OI-015 | **No GPS tracking indicator in top bar** | Engineer | Fix directly | 🟢 UX polish. |
| OI-016 | **RouteInfoSection card color wrong** | Engineer | Fix directly | 🟢 Token alignment. |
| OI-017 | **POD flow is single screen not 4-step** | Engineer | Fix directly | 🟡 Current implementation is functional but doesn't match approved UX structure. Affects UX consistency for future camera/upload flows. |
| OI-018 | **Missing accept-timeout mock fixture** | Engineer | Fix directly | 🟢 QA tooling gap. |
| OI-019 | **Horizontal milestone stepper not implemented** | Engineer | Fix directly | 🟡 ActiveTripScreen card needs horizontal summary stepper (design system §2.5). Vertical detail stepper exists. |
| OI-020 | **OfflineQueue.pendingCount not visible in UI** | Engineer | Fix directly | 🟢 Queued-count badge improves driver confidence during offline use. |
| OI-021 | **No runtime DataSourceConfig toggle** | Engineer | Fix directly (defer to Settings feature) | 🟢 Currently requires code change. Future Settings debug panel will surface this. |

---

### QA INFRASTRUCTURE — Fix for Test Coverage

| ID | Title | Owner | Action | Downstream Risk |
|----|-------|-------|--------|----------------|
| OI-022 | **TripUiState missing confirmation dialog state** | Engineer | Fix directly | 🟢 Needed for OI-006 implementation. |
| OI-023 | **Missing 3 mock fixture scenarios** | Engineer | Fix directly | 🟢 accept-timeout, LOADING with form pre-fill, AT_DESTINATION with documents. |
| OI-024 | **No debounce/double-tap protection on CTA** | Engineer | Fix directly | 🟡 Can cause duplicate transitions if network is slow. |

---

## Owner Summary

| Owner | Issues | Must Fix Before Sign-Off |
|-------|--------|--------------------------|
| **Engineer** | OI-001 through OI-024 (all 24) | OI-001–OI-011 (11 issues) |
| **Designer** | None | — |
| **Architect** | None | — |
| **PM** | None | — |
| **Backend** | None new (G1–G9 already tracked in spec) | — |

---

## Dependency Matrix

| Issue | Depends On | Blocks |
|-------|-----------|--------|
| OI-001 (ActiveTripScreen) | — | OI-002 (CTA placement), OI-006 (confirmation modals), OI-019 (horizontal stepper) |
| OI-002 (Sticky CTA) | OI-001 | — |
| OI-004 (ExceptionBanner wiring) | — | — |
| OI-005 (OfflineBanner wiring) | OI-011 (fix color first) | — |
| OI-006 (Confirmation modals) | OI-022 (UI state extension) | — |
| OI-007 (Documents section) | — | — |
| OI-008 (Expenses section) | — | — |
| OI-017 (POD 4-step) | — | — |

---

## Fix Round Plan

### Round 1 (Critical — unlock next QA pass)
1. OI-001 → Create `ActiveTripScreen.kt` (4 variants)
2. OI-002 → Move CTA to sticky bottom bar
3. OI-003 → Replace spinner with skeleton
4. OI-004 → Wire `ExceptionBanner` into `TripDetailScreen`
5. OI-006 → Add Accept/Reject confirmation modals
6. OI-011 → Fix OfflineBanner color token

### Round 2 (Major — before sign-off)
7. OI-005 → Wire `OfflineBanner` with `ConnectivityObserver`
8. OI-007 → Wire Documents section with list + thumbnails + add
9. OI-008 → Wire Expenses section with list + total + add
10. OI-009 → Create dedicated `ErrorScreen` composable
11. OI-010 → Add success snackbar

### Round 3 (Minor — polish)
12. OI-012 through OI-020 → Token fixes, pull-to-refresh, GPS indicator, POD refactor, horizontal stepper, pending badge
13. OI-021 through OI-024 → QA infrastructure (runtime toggle, fixture additions, debounce)

---

## Downstream Impact Assessment

### If Issues Left Unresolved

| Downstream Feature | Impact of Unresolved Active Trip Issues |
|--------------------|-----------------------------------------|
| **Past Trips** | 🔴 **OI-001** blocks tab navigation pattern. **OI-002** CTA pattern needed for read-only detail. **OI-003** skeleton needed for list loading. **OI-007/OI-008** document/expense list patterns reused in read-only mode. |
| **Settings** | 🟡 **OI-021** blocks runtime DataSourceConfig toggle. **OI-005** OfflineBanner pattern needed globally. |
| **Earnings** | 🟡 **OI-008** expense list + running total pattern reused in earnings breakdown. **OI-009** ErrorScreen needed for earnings API failure. |
| **Vehicle Inspection** | 🟢 Low impact — separate feature with own screens. Only shares `OfflineBanner` and `ErrorScreen`. |

### What's Safe

The following are confirmed safe and have zero downstream risk:
- ✅ State machine (11 transitions, 40+ tests) — fully correct
- ✅ Domain models (31 statuses, 10 DriverActions) — complete
- ✅ Mock/Real switching (13 toggles, ALL_MOCK preset) — extensible
- ✅ OfflineQueue (FIFO, 4 statuses) — generic and reusable
- ✅ Repository pattern (interface + Mock + Real stubs) — clean separation
- ✅ Navigation structure (Decompose child stack) — additive for new tabs

---

## Sign-Off Criteria

Driver Active Trip can be marked **Approved to Close** when:

1. ✅ All 3 Critical issues (OI-001–003) are resolved and re-verified
2. ✅ All 8 Major issues (OI-004–011) are resolved and re-verified
3. ✅ QA re-runs the checklist with ≥ 80/88 items passing
4. ✅ Trust-critical issues (OI-004 ExceptionBanner, OI-006 Confirmation Modals) pass manual verification
5. ⬜ Minor issues may remain open as tracked polish items

**Next milestone**: Fix Round 1 (6 critical issues) → QA Round 2 → Fix Round 2 (5 major issues) → PM Sign-Off
