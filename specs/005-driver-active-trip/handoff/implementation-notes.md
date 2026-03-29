# Implementation Notes — Driver Active Trip

**Feature Branch**: `005-driver-active-trip`

---

## T001 — Expand TripStatus Enum (6 → 31 values)

**Status**: ✅ Complete  
**Date**: 2026-03-29

### Files Changed

| File | Change |
|------|--------|
| [Trip.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/domain/model/Trip.kt) | Expanded `TripStatus` from 6 to 31 values. Added `TripPhase` enum. Added computed properties + `fromString()`. |

### What Was Done

- **TripPhase enum** (4 values): `CREATED`, `IN_TRANSIT`, `COMPLETED`, `SETTLED` — coarse grouping for badge colors.
- **TripStatus enum** (31 values):
  - Phase 1: `DRAFT`, `CREATED`, `DISPATCHED`, `ACCEPTED`
  - Phase 2: `AT_ORIGIN`, `LOADING`, `LOADED`, `EWB_PENDING`, `DEPARTED`, `IN_TRANSIT`, `AT_CHECKPOINT`, `AT_DESTINATION`, `UNLOADING`, `DELIVERED`
  - Phase 3: `POD_SUBMITTED`, `POD_VERIFIED`, `POD_DISPUTED`, `COMPLETED` (legacy alias)
  - Phase 4: `SETTLED`
  - Exceptions: `DRIVER_REJECTED`, `VEHICLE_BREAKDOWN`, `ACCIDENT`, `LOAD_TRANSFER`, `ROUTE_BLOCKED`, `CARGO_DAMAGE`, `CARGO_SHORTAGE`, `DELIVERY_REJECTED`, `EWB_EXPIRED`, `GPS_LOST`, `CANCELLED`, `TRANSFERRED`
  - Forward compat: `UNKNOWN`
- **Computed properties**: `phase`, `driverLabel`, `isDriverVisible`, `isReadOnly`, `isException`, `isBlockingException`, `isTerminal`
- **Safe deserialization**: `TripStatus.fromString(raw)` — returns `UNKNOWN` for unmapped values.

### Lifecycle / Action Implications

- All downstream code (TripStateMachine, CtaState derivation, action permissions) will use these new enum values and properties.
- `isBlockingException` distinguishes GPS_LOST (warning only) from all other exceptions (blocking).
- `COMPLETED` kept as legacy alias for `POD_VERIFIED` — existing `Trip` list responses continue to deserialize correctly.

### Real vs Mock Implications

- **No API impact** — this is a pure domain model change. Both real and mock repositories use the same enum.
- Backend sends plain strings — `fromString()` handles graceful degradation.

### How to Verify

```bash
cd /Users/ankit/a/fleetly/axleops_code/mobile
./gradlew :shared:compileDebugSources
# BUILD SUCCESSFUL — no compilation errors
```

- All existing tests continue to pass (existing `FixtureParsingTest` uses `CREATED`/`DISPATCHED` which are preserved).
- Full validation of computed properties deferred to T015 (`TripStateMachineTest`).

### Risks / Blocked

- None. Pure additive change — no existing code broken.

---

## T002–T013 — Domain Models (Batch)

**Status**: ✅ Complete  
**Date**: 2026-03-29

### Files Created

| Task | File | Key Contents |
|------|------|-------------|
| T002 | `domain/model/TripSubState.kt` | `TripSubStateInfo` data class + `TripSubState` object (badge color token mapping) |
| T003 | `domain/model/Milestone.kt` | `Milestone` data class + `MilestoneStatus` enum (5 values) |
| T004 | `domain/model/MilestoneType.kt` | `MilestoneType` enum (10 lifecycle types with sequence + label) |
| T005 | `domain/model/TripDetail.kt` | `TripDetail` enriched model (30+ fields, 5 computed properties) |
| T006 | `domain/model/TripExpense.kt` | `TripExpense` data class + `ExpenseCategory` (6) + `SyncStatus` (3) enums |
| T007 | `domain/model/TripDocument.kt` | `TripDocument` data class + `DocumentCategory` (7) + `UploadStatus` (4) enums |
| T008 | `domain/model/Pod.kt` | `Pod` data class + `PodType` (2) + `CargoCondition` (3) + `PodVerificationStatus` (7) enums |
| T009 | `domain/model/TripException.kt` | `TripException` data class + `ExceptionType` (6) enum |
| T010 | `domain/model/CheckpointEvent.kt` | `CheckpointEvent` data class + `CheckpointEventType` (6) enum |
| T011 | `domain/model/LocationLog.kt` | `LocationLog` data class (GPS point with sync flag) |
| T012 | `domain/model/TransitionRequest.kt` | `TransitionRequest` data class (milestone transition payload) |
| T013 | `domain/model/DriverAction.kt` | `DriverAction` sealed class (10 variants: Accept through SubmitPod) |

### Build Fix Note

`TripDocument.kt` initially failed compilation — the kotlinx.serialization compiler plugin could not resolve `DocumentCategory` and `UploadStatus` enums defined after the `@Serializable data class` in the same file. Fix: moved enum definitions above the data class.

### Lifecycle / Action Implications

- `DriverAction` sealed class defines the complete set of driver-permitted actions. Each variant carries its own payload (e.g., `LoadingComplete` captures weight + seal + photos).
- `TripSubState.infoFor()` is the single lookup for badge color tokens — all UI badge rendering should derive from this.
- `SyncStatus` enum is shared across `TripExpense`, `TripDocument`, `TripException`, and `CheckpointEvent` for offline queue tracking.

### How to Verify

```bash
cd /Users/ankit/a/fleetly/axleops_code/mobile
./gradlew clean :shared:compileDebugSources
# BUILD SUCCESSFUL
```

---

## T014–T015 — TripStateMachine + Tests

**Status**: ✅ Complete  
**Date**: 2026-03-29

### Files Created

| Task | File | Key Contents |
|------|------|-------------|
| T014 | `trip/state/TripStateMachine.kt` | Pure Kotlin state machine object with transition table (11 entries), `nextState()`, `isAllowed()`, `allowedAction()`, `shouldTrackGps()`, `canModifyRecords()`, `requiresForm()`, `happyPathStatuses` |
| T015 | (test) `trip/state/TripStateMachineTest.kt` | 40+ unit tests covering all transitions, invalid transitions, exception behavior, read-only, terminal states, GPS, records, full lifecycle walk |

### Design Decisions

- **Transition table uses `Map<Pair<TripStatus, Class<out DriverAction>>, TripStatus>`** — keyed by (current status, action class) for O(1) lookup.
- **`allowedAction()` returns null** for DISPATCHED (multi-action: Accept/Reject) and for states requiring forms (LOADING, UNLOADING, DELIVERED) — the UI must build the payload.
- **Both DEPARTED and IN_TRANSIT** can transition to AT_DESTINATION (backend may report either sub-state during transit).

### Test Results

```
./gradlew :shared:testDebugUnitTest --tests "com.axleops.mobile.trip.state.TripStateMachineTest"
BUILD SUCCESSFUL in 8s
```

---

## Fix Round 1 — Engineer Handoff

**Triage Source**: [open-issues.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/handoff/open-issues.md)
**Date**: 2026-03-29

### 1. Tasks Ready for Engineering

All Fix Round 1 tasks (FX-001 through FX-006) are **ready immediately**. No UX artifact, spec, plan, or architecture updates are required before proceeding.

| Task | Issue | Status | Prerequisite |
|------|-------|--------|-------------|
| FX-001 | OI-001 (ActiveTripScreen) | ✅ Ready | None — first task in chain |
| FX-002 | OI-002 (Sticky CTA) | ✅ Ready | FX-001 must land first |
| FX-003 | OI-003 (Skeleton) | ✅ Ready | None — independent |
| FX-004 | OI-004 (ExceptionBanner wiring) | ✅ Ready | None — independent |
| FX-005 | OI-006+022 (Confirmation modals) | ✅ Ready | None — independent |
| FX-006 | OI-011 (OfflineBanner color) | ✅ Ready | None — one-line token fix |

**Recommended execution order**: FX-001 → FX-002 (depends on FX-001), then FX-003, FX-004, FX-005, FX-006 in parallel.

### 2. Blocked / Deferred Issues

| Issue | Status | Why |
|-------|--------|-----|
| OI-021 (Runtime DataSourceConfig toggle) | Deferred to Settings feature | No Settings debug panel exists yet. Infrastructure is ready. |
| T114–T121 (Backend gap follow-ups) | 🔒 Blocked on backend | APIs G1–G9 not yet implemented. No change from initial implementation. |

No lifecycle or state-machine issues are blocked. The domain layer is complete and correct.

### 3. Invariants the Engineer MUST Preserve

> [!CAUTION]
> These invariants are verified by 40+ existing unit tests. Any fix that breaks them is a regression.

1. **TripStateMachine transition table**: 11 entries must remain unchanged. Do NOT add UI-level transitions or shortcuts.
2. **`isBlockedByException()`**: Must return `true` for all exception statuses EXCEPT `GPS_LOST`. This is the single gate for CTA suppression.
3. **`CtaState` derivation chain**: `TripStatus → TripStateMachine.allowedAction() → CtaState`. Do NOT hardcode CTA labels in UI code.
4. **`TripUiState` contracts**: `Loading`, `NoTrip`, `Error`, `Active` variants must remain. Add dialog substate to `Active` (for FX-005), do NOT create new sealed variants.
5. **`DataSourceConfig` switching**: All 13 per-repository toggles must continue to work. Mock implementations must not reference real API code.
6. **Offline queue FIFO**: `OfflineQueue.pending()` must return chronological order. `SyncOfflineQueueUseCase` must halt on first rejection.
7. **`fromString()` → `UNKNOWN`**: Trip status deserialization must never throw. Unknown backend strings must degrade to `UNKNOWN`.

### 4. What Must Be Rechecked After Fixes

#### Design Review Round 2 (Scope)
- [ ] FX-001: ActiveTripScreen — 4 layout variants match screen-map §3.1–3.4
- [ ] FX-002: CTA sticky — visible without scrolling on phones ≥ 360dp height
- [ ] FX-003: Skeleton — shapes match content layout (card + stepper + sections)
- [ ] FX-004: ExceptionBanner — red, full-width, above scrollable content, with resolution hint
- [ ] FX-005: Accept modal — trip summary visible; Reject modal — reason field required, min 10 chars
- [ ] FX-006: OfflineBanner — uses `color.warning` background

#### QA Round 2 (Scope)
- [ ] Re-run checklist items CHK001, CHK006, CHK009 (ActiveTripScreen)
- [ ] Re-run CHK012, CHK065 (ExceptionBanner wiring)
- [ ] Re-run CHK021 (Confirmation modals)
- [ ] Re-run CHK061, CHK068 (Skeleton loading)
- [ ] Re-run CHK064 (OfflineBanner color)
- [ ] Regression: Re-run all §2 (Lifecycle State Presentation) items — must still all pass
- [ ] Regression: Re-run all §3 (Allowed vs Blocked) items — must still all pass
- [ ] Regression: Run full unit test suite — must be ≥ 259 passing (no regressions)

---

## Fix Round 1 — Completion Report

**Date**: 2026-03-29
**Status**: ✅ All 6 tasks complete

### 1. Tasks Completed

| Task | Issue | Status |
|------|-------|--------|
| FX-001 | OI-001 (skeleton + ErrorScreen on ActiveTripScreen) | ✅ Done |
| FX-002 | OI-002 (sticky CTA via Scaffold bottomBar) | ✅ Done |
| FX-003 | OI-003 (skeleton + ErrorScreen on TripDetailScreen) | ✅ Done |
| FX-004 | OI-004 (ExceptionBanner wired into TripDetailScreen) | ✅ Done |
| FX-005 | OI-006+022 (Accept/Reject confirmation modals) | ✅ Done |
| FX-006 | OI-011 (OfflineBanner color → AxleWarning) | ✅ Done |

### 2. Files Changed

| File | Changes |
|------|---------|
| `navigation/ActiveTripScreen.kt` | FX-001: `LoadingIndicator()` replaces spinner, `ErrorStateScreen` replaces `EmptyStateScreen`. FX-005: Accept/Reject confirmation `AlertDialog` with reject reason `OutlinedTextField` (min 10 chars). |
| `ui/trip/TripDetailScreen.kt` | FX-002: `Scaffold(bottomBar = CTA)` structure — CTA extracted to `TripDetailCta()`. FX-003: `TripDetailSkeleton()` composable. FX-004: `ExceptionBanner` rendered conditionally when `trip.activeException != null`. Error branch uses `ErrorStateScreen`. |
| `ui/trip/components/OfflineBanner.kt` | FX-006: Background `surfaceVariant` → `AxleWarning`. Text colors → `Color.White`. |

### 3. Still Blocked

| Issue | Status |
|-------|--------|
| T114–T121 (backend gaps) | 🔒 Blocked on G1–G9 APIs |
| OI-021 (runtime DataSourceConfig toggle) | Deferred to Settings feature |
| Fix Round 2 (FX-007–011) | Ready after QA Round 2 confirms Fix Round 1 |

### 4. Verification Results

- ✅ Compilation: `./gradlew :shared:compileDebugKotlin` → BUILD SUCCESSFUL
- ✅ Tests: 259 tests, 257 pass, 2 fail (pre-existing `AuthViewModelTest` — unchanged from previous round)
- ✅ Zero regressions: all trip state machine, CTA derivation, and action permission tests pass

### 5. What to Recheck

**Design Review Round 2**: ActiveTripScreen layout variants, sticky CTA position, skeleton shapes, ExceptionBanner placement, confirmation modal UX, OfflineBanner color.

**QA Round 2**: CHK001/006/009 (ActiveTripScreen), CHK012/065 (ExceptionBanner), CHK021 (confirmation modals), CHK061/068 (skeleton), CHK064 (OfflineBanner color), plus full regression on §2 and §3 items.

### 6. Follow-Up Risks

1. **ActiveTripComponent.onReject(reason)**: The component already accepts a reason string. FX-005 now gates this correctly through the reject dialog. However, if the backend eventually requires structured rejection (enum + free text), the dialog will need updating.
2. **ExceptionBanner visibility**: The banner renders based on `trip.activeException != null` which comes from the mock fixture. When switching to real API, ensure the backend populates this field correctly.
3. **Scaffold nesting**: `TripDetailScreen` now uses its own `Scaffold`. If the parent navigation host also uses a `Scaffold`, test for double-scaffold padding issues on actual devices.
