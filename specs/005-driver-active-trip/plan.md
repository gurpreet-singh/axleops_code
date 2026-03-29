# Implementation Plan: Driver Active Trip

**Feature Branch**: `005-driver-active-trip`  
**Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/spec.md)  
**UX Package**: [ux/](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/)  
**Date**: 2026-03-29

---

## 1. Active Trip Module / Package Structure

All new code lives under `mobile/shared/src/commonMain/kotlin/com/axleops/mobile/`. The feature follows the existing architecture patterns (domain interface → data Real/Mock impl → DI wiring → Decompose component → Compose screen).

```
com.axleops.mobile
├── domain/
│   ├── model/
│   │   ├── Trip.kt                  ← MODIFY: expand TripStatus enum (6 → 15 sub-states)
│   │   ├── TripDetail.kt           ← NEW: enriched detail model (milestones, expenses, docs, EWB)
│   │   ├── Milestone.kt            ← NEW: milestone model (type, sequence, status, timestamps, GPS, evidence)
│   │   ├── MilestoneType.kt        ← NEW: enum of 10 milestone types
│   │   ├── TripExpense.kt          ← NEW: expense entry model
│   │   ├── TripDocument.kt         ← NEW: document model
│   │   ├── Pod.kt                  ← NEW: POD model (consignee, signature, photos, condition)
│   │   ├── TripException.kt        ← NEW: exception report model
│   │   ├── CheckpointEvent.kt      ← NEW: en-route checkpoint event model
│   │   ├── LocationLog.kt          ← NEW: GPS coordinate + accuracy + timestamp
│   │   └── TransitionRequest.kt    ← NEW: milestone transition payload (event, data, GPS)
│   └── repository/
│       ├── TripRepository.kt        ← MODIFY: add getActiveTrip(), accept(), reject()
│       ├── MilestoneRepository.kt   ← NEW: getMilestones(), transition()
│       ├── PodRepository.kt         ← NEW: submitPod()
│       ├── TripDocumentRepository.kt ← NEW: CRUD for trip documents
│       ├── TripExpenseRepository.kt  ← NEW: CRUD for trip expenses
│       ├── TripExceptionRepository.kt ← NEW: reportException()
│       ├── CheckpointRepository.kt   ← NEW: log/list checkpoint events
│       └── LocationRepository.kt     ← NEW: batchLog() for GPS
├── data/
│   ├── dto/
│   │   ├── TripDtos.kt              ← NEW: API response DTOs (TripDetailResponse, MilestoneResponse, etc.)
│   │   └── LocationDtos.kt          ← NEW: GPS batch log DTO
│   ├── mapper/
│   │   └── TripMapper.kt            ← NEW: DTO → domain model mappers
│   ├── repository/
│   │   ├── RealTripRepository.kt     ← MODIFY: implement new methods
│   │   ├── MockTripRepository.kt     ← MODIFY: implement new methods
│   │   ├── RealMilestoneRepository.kt ← NEW
│   │   ├── MockMilestoneRepository.kt ← NEW
│   │   ├── RealPodRepository.kt       ← NEW
│   │   ├── MockPodRepository.kt       ← NEW
│   │   ├── RealTripDocumentRepository.kt ← NEW
│   │   ├── MockTripDocumentRepository.kt ← NEW
│   │   ├── RealTripExpenseRepository.kt  ← NEW
│   │   ├── MockTripExpenseRepository.kt  ← NEW
│   │   ├── RealTripExceptionRepository.kt ← NEW
│   │   ├── MockTripExceptionRepository.kt ← NEW
│   │   ├── RealCheckpointRepository.kt    ← NEW
│   │   ├── MockCheckpointRepository.kt    ← NEW
│   │   ├── RealLocationRepository.kt      ← NEW
│   │   └── MockLocationRepository.kt      ← NEW
│   └── local/
│       ├── OfflineQueue.kt            ← NEW: mutation queue for offline transitions
│       └── TripLocalCache.kt          ← NEW: local trip data cache (kotlinx.serialization + Settings)
├── trip/                              ← NEW: feature module
│   ├── component/
│   │   ├── ActiveTripComponent.kt     ← NEW: Decompose component — tab landing
│   │   ├── TripDetailComponent.kt     ← NEW: Decompose component — detail + sections
│   │   ├── MilestoneActionComponent.kt ← NEW: milestone transition form
│   │   ├── PodCaptureComponent.kt     ← NEW: multi-step POD flow
│   │   ├── ExpenseFormComponent.kt    ← NEW: add/edit expense
│   │   ├── DocumentViewerComponent.kt ← NEW: full-screen viewer
│   │   └── ExceptionReportComponent.kt ← NEW: exception form
│   ├── usecase/
│   │   ├── GetActiveTripUseCase.kt    ← NEW: fetch active trip + cache
│   │   ├── TransitionMilestoneUseCase.kt ← NEW: validate + transition + queue offline
│   │   ├── SubmitPodUseCase.kt        ← NEW: orchestrate POD upload
│   │   ├── LogExpenseUseCase.kt       ← NEW
│   │   ├── UploadDocumentUseCase.kt   ← NEW
│   │   ├── ReportExceptionUseCase.kt  ← NEW
│   │   └── SyncOfflineQueueUseCase.kt ← NEW: drain queue on reconnect
│   └── state/
│       ├── TripUiState.kt             ← NEW: sealed UI state for active trip screen
│       └── TripStateMachine.kt        ← NEW: validated sub-state transitions
├── tracking/                          ← NEW: GPS tracking module
│   ├── LocationTracker.kt             ← NEW: expect/actual interface
│   ├── TrackingConfig.kt              ← NEW: interval, permissions
│   └── TrackingManager.kt             ← NEW: start/stop/batch logic
├── navigation/
│   ├── NavConfig.kt                   ← MODIFY: add ScreenConfig variants
│   └── driver/
│       └── DriverScreens.kt           ← MODIFY: add screen factory mappings
├── di/
│   ├── DataSourceModule.kt            ← MODIFY: add new repository bindings
│   ├── TripModule.kt                  ← NEW: Koin module for trip components/use cases
│   └── TrackingModule.kt              ← NEW: Koin module for GPS tracking
├── data/
│   └── DataSourceMode.kt              ← MODIFY: add new source fields to DataSourceConfig
├── platform/                          ← expect/actual for platform-specific
│   ├── LocationTracker.kt             ← NEW expect: platform GPS tracker
│   └── ConnectivityObserver.kt        ← NEW expect: network state flow
└── ui/trip/                           ← NEW: Compose UI
    ├── ActiveTripScreen.kt            ← NEW: tab landing screen
    ├── TripDetailScreen.kt            ← NEW: scrollable detail with sections
    ├── MilestoneActionScreen.kt       ← NEW: milestone form screen
    ├── PodCaptureScreen.kt            ← NEW: multi-step POD flow screens
    ├── ExpenseFormScreen.kt           ← NEW: add/edit expense
    ├── DocumentViewerScreen.kt        ← NEW: full-screen photo/PDF viewer
    ├── ExceptionReportScreen.kt       ← NEW: exception form
    ├── CheckpointEventScreen.kt       ← NEW: en-route event form
    └── components/
        ├── TripCardComposable.kt       ← NEW: active trip card
        ├── MilestoneStepperComposable.kt ← NEW: horizontal + vertical stepper
        ├── ExceptionBannerComposable.kt  ← NEW: red exception banner
        ├── OfflineBannerComposable.kt    ← NEW: connectivity status bar
        ├── BlockedStateComposable.kt     ← NEW: inline blocked message
        └── MapSectionComposable.kt       ← NEW: map with route + driver position
```

**Total new files**: ~60  
**Modified files**: ~8

> [!NOTE]
> Platform-specific implementations (Android `androidMain/`, iOS `iosMain/`) are needed for: `LocationTracker` (foreground service / CLLocationManager), `ConnectivityObserver`, camera capture, signature pad. These use `expect/actual` declarations.

---

## 2. Domain / State Model for Active Trip

### 2.1 TripStatus Enum Expansion

The existing `TripStatus` enum has 6 values. The spec requires 15+ sub-states. **Expand in place** (not a new enum) since the backend will eventually align:

```kotlin
enum class TripStatus {
    // Phase 1: Created
    CREATED, DRAFT, DISPATCHED, ACCEPTED, DRIVER_REJECTED,
    // Phase 2: In Transit
    AT_ORIGIN, LOADING, LOADED, EWB_PENDING,
    DEPARTED, IN_TRANSIT, AT_CHECKPOINT,
    AT_DESTINATION, UNLOADING, DELIVERED,
    // Phase 3: Completed
    POD_SUBMITTED, POD_VERIFIED, POD_DISPUTED,
    // Phase 4: Settled
    SETTLED,
    // Exception states (overlays)
    VEHICLE_BREAKDOWN, ACCIDENT, CARGO_DAMAGE, CARGO_SHORTAGE,
    ROUTE_BLOCKED, DELIVERY_REJECTED, EWB_EXPIRED, GPS_LOST,
    CANCELLED,
    // Unknown / unmapped backend value
    UNKNOWN
}
```

### 2.2 TripStateMachine — Validated Transitions

A pure-Kotlin state machine that validates driver-permitted transitions:

```kotlin
object TripStateMachine {
    // Returns the next valid sub-state given a driver action, or null if not permitted
    fun nextState(current: TripStatus, action: DriverAction): TripStatus?
    
    // Returns the allowed DriverAction for the current state, or null if read-only
    fun allowedAction(current: TripStatus): DriverAction?
    
    // Returns true if this state is blocked (no driver action possible)
    fun isBlocked(current: TripStatus): Boolean
    
    // Returns true if this state is read-only (post-POD or settled)
    fun isReadOnly(current: TripStatus): Boolean
    
    // Returns true if this state is an active exception overlay
    fun isException(current: TripStatus): Boolean
}
```

**Transition table** (maps 1:1 to spec FR-090 table and UX `state-inventory.md`):

| Current | Action | Next |
|---------|--------|------|
| DISPATCHED | Accept | ACCEPTED |
| DISPATCHED | Reject | DRIVER_REJECTED |
| ACCEPTED | ArrivedAtOrigin | AT_ORIGIN |
| AT_ORIGIN | StartLoading | LOADING |
| LOADING | LoadingComplete | LOADED |
| LOADED | Depart | DEPARTED |
| DEPARTED | — | IN_TRANSIT (auto) |
| IN_TRANSIT | ArrivedAtDestination | AT_DESTINATION |
| AT_DESTINATION | StartUnloading | UNLOADING |
| UNLOADING | DeliveryComplete | DELIVERED |
| DELIVERED | SubmitPod | POD_SUBMITTED |

### 2.3 DriverAction Sealed Class

```kotlin
sealed class DriverAction {
    data object Accept : DriverAction()
    data class Reject(val reason: String) : DriverAction()
    data object ArrivedAtOrigin : DriverAction()
    data object StartLoading : DriverAction()
    data class LoadingComplete(val weight: Double, val sealNumber: String?, val photos: List<ByteArray>) : DriverAction()
    data object Depart : DriverAction()
    data object ArrivedAtDestination : DriverAction()
    data object StartUnloading : DriverAction()
    data class DeliveryComplete(val deliveredWeight: Double, val condition: CargoCondition) : DriverAction()
    data class SubmitPod(val pod: PodSubmission) : DriverAction()
}
```

---

## 3. Mapping Lifecycle Sub-States into Mobile UI State

### 3.1 TripUiState Sealed Hierarchy

```kotlin
sealed interface TripUiState {
    data object Loading : TripUiState
    data object NoTrip : TripUiState  // empty state
    data class Error(val message: String, val retry: () -> Unit) : TripUiState
    
    data class Active(
        val trip: TripDetail,
        val phase: TripPhase,        // CREATED, IN_TRANSIT, COMPLETED, SETTLED
        val ctaState: CtaState,      // what the primary button shows
        val sections: TripSections,  // visible sections with their data
        val overlay: TripOverlay?,   // exception or blocked state
        val connectivity: Connectivity,
        val pendingQueue: Int,       // number of queued offline mutations
    ) : TripUiState
}
```

### 3.2 CtaState — Primary Action Button

```kotlin
sealed interface CtaState {
    data object Hidden : CtaState  // read-only states
    data class Enabled(val label: String, val action: DriverAction) : CtaState
    data class Disabled(val label: String, val reason: String) : CtaState  // timeout, EWB pending
    data class InProgress(val label: String) : CtaState  // API call in flight
}
```

### 3.3 TripOverlay — Exception / Blocked Precedence

```kotlin
sealed interface TripOverlay {
    data class Exception(val type: String, val description: String, val timestamp: String) : TripOverlay
    data class Blocked(val label: String, val explanation: String, val resolution: String) : TripOverlay
    data object Offline : TripOverlay
}
```

**Precedence** (per UX state-inventory.md §5): Exception > Blocked > Offline > Normal.

---

## 4. Network / Repository / Use-Case Structure

### 4.1 Repository Pattern

Each domain area follows the existing pattern:

```
Interface (domain/repository/) → Real (data/repository/) → Mock (data/repository/)
```

New repository interfaces and their backends:

| Interface | Real Implementation | Mock | DataSourceConfig Field |
|-----------|-------------------|------|----------------------|
| `TripRepository` (extended) | `GET /trips/driver/active` | JSON fixture | `tripSource` (existing) |
| `MilestoneRepository` | `GET /trips/{id}/milestones`, `POST /trips/{id}/transition` | JSON fixture + state mutation | `milestoneSource` (existing) |
| `PodRepository` | `POST /trips/{id}/pod` (multipart) | Simulated upload | `podSource` (existing) |
| `TripDocumentRepository` | `POST /trips/{id}/documents`, `GET /trips/{id}/documents` | Fixture list + simulated upload | `documentSource` (NEW field) |
| `TripExpenseRepository` | `POST /trips/{id}/expenses`, `GET /trips/{id}/expenses` | In-memory list | `expenseSource` (NEW field) |
| `TripExceptionRepository` | `POST /trips/{id}/exceptions` | State mutation | `exceptionSource` (NEW field) |
| `CheckpointRepository` | `POST /trips/{id}/checkpoints` | In-memory list | `checkpointSource` (NEW field) |
| `LocationRepository` | `POST /location/log` | Silent sink | `locationSource` (NEW field) |

### 4.2 Use Cases

Each use case encapsulates a single business operation:

| Use Case | Depends On | Key Logic |
|----------|-----------|-----------|
| `GetActiveTripUseCase` | TripRepository, MilestoneRepository | Fetch + cache + merge trip + milestones |
| `TransitionMilestoneUseCase` | MilestoneRepository, TripStateMachine, OfflineQueue | Validate via state machine → API call → queue if offline |
| `SubmitPodUseCase` | PodRepository, UploadService | Upload photos → upload signature → submit POD record |
| `LogExpenseUseCase` | TripExpenseRepository, OfflineQueue | Create/edit/delete expense → queue if offline |
| `UploadDocumentUseCase` | TripDocumentRepository, UploadService | Upload file → create document record |
| `ReportExceptionUseCase` | TripExceptionRepository | Submit exception → trip enters exception state |
| `SyncOfflineQueueUseCase` | All repositories, OfflineQueue | Drain queue in order → halt on first rejection |

---

## 5. Real-API vs Mock Separation

### 5.1 Implementation Readiness Matrix

| Repository | Real API Exists? | Implementable Now | Mock Needed? |
|-----------|-----------------|-------------------|-------------|
| `TripRepository.getTrips/getTrip` | ✅ `GET /trips`, `GET /trips/{id}` | ✅ Real | ✅ Also mock |
| `TripRepository.getActiveTrip` | ❌ No driver-scoped query | Mock-first | ✅ Required |
| `TripRepository.accept/reject` | ❌ No transition API | Mock-first | ✅ Required |
| `MilestoneRepository` | ❌ No milestone entity | Mock-first | ✅ Required |
| `PodRepository` | ❌ No POD entity | Mock-first | ✅ Required |
| `TripDocumentRepository` | ❌ No file upload API | Mock-first | ✅ Required |
| `TripExpenseRepository` | ❌ No trip-expense entity | Mock-first | ✅ Required |
| `TripExceptionRepository` | ❌ No exception API | Mock-first | ✅ Required |
| `CheckpointRepository` | ❌ No checkpoint entity | Mock-first | ✅ Required |
| `LocationRepository` | ❌ No GPS log API | Mock-first | ✅ Required |

### 5.2 DataSourceConfig Extension

```kotlin
data class DataSourceConfig(
    // existing
    val authSource: DataSourceMode = DataSourceMode.REAL,
    val tripSource: DataSourceMode = DataSourceMode.REAL,
    val vehicleSource: DataSourceMode = DataSourceMode.REAL,
    val contactSource: DataSourceMode = DataSourceMode.REAL,
    val uploadSource: DataSourceMode = DataSourceMode.MOCK,
    val milestoneSource: DataSourceMode = DataSourceMode.MOCK,
    val podSource: DataSourceMode = DataSourceMode.MOCK,
    val earningsSource: DataSourceMode = DataSourceMode.MOCK,
    // new
    val documentSource: DataSourceMode = DataSourceMode.MOCK,
    val expenseSource: DataSourceMode = DataSourceMode.MOCK,
    val exceptionSource: DataSourceMode = DataSourceMode.MOCK,
    val checkpointSource: DataSourceMode = DataSourceMode.MOCK,
    val locationSource: DataSourceMode = DataSourceMode.MOCK,
)
```

### 5.3 Mock Implementation Strategy

Mock repositories:
- Return **realistic JSON fixtures** from `composeResources/files/mocks/trip/`
- **MockMilestoneRepository**: maintains an in-memory state machine. Calling `transition()` validates via `TripStateMachine` and updates the fixture's state. This allows QA to progress through the full lifecycle.
- **MockPodRepository**: accepts files, stores metadata in memory, returns success after simulated delay.
- **MockLocationRepository**: accepts payloads, logs to console, discards.

QA can swap fixture files to test different states, exceptions, and edge cases. The `DataSourceConfig` toggle is available in the Settings debug panel.

---

## 6. Driver-Permitted Actions vs Read-Only States

### 6.1 Action Availability Matrix (from spec FR-090 + UX state-inventory.md)

| Sub-State | Primary CTA | Add Expense | Add Document | Report Issue | Log Event |
|-----------|------------|-------------|-------------|-------------|-----------|
| DISPATCHED | Accept / Reject | ❌ | ❌ | ❌ | ❌ |
| ACCEPTED → DELIVERED | Context-sensitive CTA | ✅ | ✅ | ✅ (IN_TRANSIT/AT_DEST only) | ✅ (IN_TRANSIT only) |
| POD_SUBMITTED → SETTLED | Hidden | ❌ Read-only | ❌ Read-only | ❌ | ❌ |
| Any exception active | Hidden | ❌ Disabled | ❌ Disabled | ❌ (already reported) | ❌ Disabled |

### 6.2 Implementation

`TripStateMachine.allowedAction(status)` returns the permitted `DriverAction` or null. The `ActiveTripComponent` reads this and constructs the `CtaState`. Secondary actions (expense, document, exception) use separate permission checks:

```kotlin
fun canAddExpense(status: TripStatus, hasException: Boolean): Boolean
fun canAddDocument(status: TripStatus): Boolean
fun canReportException(status: TripStatus, hasActiveException: Boolean): Boolean
fun canLogCheckpoint(status: TripStatus, hasException: Boolean): Boolean
```

These are pure functions, unit-testable, and map directly to the spec tables.

---

## 7. Blocked-State Handling Architecture

### 7.1 Block Sources

1. **Server-side guard rejection (422)** — EWB not ready on depart (per clarification Q2)
2. **Accept timeout** — 30 min from dispatch, computed client-side from `dispatchedAt` timestamp
3. **Active exception** — overlay from trip state
4. **Offline with non-queueable action** — some actions require immediate server response

### 7.2 Implementation

```kotlin
sealed class BlockReason {
    data class ServerGuard(val message: String) : BlockReason()  // 422 body
    data class AcceptTimeout(val dispatchedAt: Instant) : BlockReason()
    data class ActiveException(val type: String, val description: String) : BlockReason()
    data class OfflineRequired(val action: String) : BlockReason()
}
```

The `ActiveTripComponent` computes `TripOverlay` from the block sources with the precedence defined in UX state-inventory.md §5:

```
Exception > ServerGuard > AcceptTimeout > Offline > (none)
```

UI renders: `ExceptionBannerComposable` for exceptions, `BlockedStateComposable` for guards/timeouts — both use inline messaging (never toasts, never modals — per UX interaction-rules.md §4).

---

## 8. Document / Evidence / POD Upload Architecture

### 8.1 Layered Upload Flow

```
Camera/Gallery → Local storage → Upload queue → UploadService → Server
                      ↓
              Survives backgrounding,
              kill, and offline
```

### 8.2 Reuse of Existing UploadService

The existing `UploadService` (interface with `upload()`, `retry()`, `validate()`) is reused directly:
- **POD photos**: `UploadService.upload(imageBytes, fileType="POD", tripId=id)`
- **Document uploads**: `UploadService.upload(imageBytes, fileType="DOCUMENT", tripId=id)`
- **Expense receipts**: `UploadService.upload(imageBytes, fileType="RECEIPT", tripId=id)`

The `UploadViewModel` already manages upload state (progress, retry, completion). POD flow composes multiple uploads orchestrated by `SubmitPodUseCase`.

### 8.3 POD Capture Flow Architecture

```
PodCaptureComponent (Decompose — multi-step flow)
├── Step 1: PodPhotoStep (camera/gallery, min 2 photos)
├── Step 2: SignatureStep (digital signature pad)
├── Step 3: ConsigneeInfoStep (form: name, designation, remarks, condition)
└── Step 4: PodReviewStep (summary → submit)
```

Each step stores data in `PodCaptureComponent.state`. On submit, `SubmitPodUseCase` orchestrates:
1. Upload each photo via `UploadService` (parallel, with per-file progress)
2. Upload signature image
3. Submit POD metadata with file references to `PodRepository`
4. On partial failure: retry failed files without re-capturing

### 8.4 Signature Capture

Platform `expect/actual`:
- **Android**: `Canvas` with touch drawing
- **iOS**: `PKCanvasView` (PencilKit) or custom `UIView` with Core Graphics

Output: `ByteArray` (PNG image), fed to `UploadService`.

---

## 9. Offline / Poor-Network Strategy

### 9.1 OfflineQueue

A persistent, ordered queue of mutations that haven't been synced:

```kotlin
class OfflineQueue(private val settings: Settings) {
    // Enqueue a mutation (transition, expense, document, etc.)
    fun enqueue(mutation: QueuedMutation)
    
    // Get all pending mutations in order
    fun pending(): List<QueuedMutation>
    
    // Mark a mutation as synced (remove from queue)
    fun markSynced(id: String)
    
    // Mark a mutation as failed (keep in queue with error)
    fun markFailed(id: String, error: String)
    
    // Count of pending mutations (observed by UI for badge)
    val pendingCount: StateFlow<Int>
}
```

Persisted via `kotlinx.serialization` + `multiplatform-settings` (same pattern as `SessionPersistence`).

### 9.2 Sync Strategy

`SyncOfflineQueueUseCase` runs when:
1. `ConnectivityObserver` emits `Connected`
2. App returns to foreground with pending items
3. Manual pull-to-refresh

**Replay behavior** (per clarification Q1): replay in strict chronological order. If server rejects any mutation (409 Conflict), halt queue, refresh trip from server, notify driver, discard remaining queued transitions after the rejected one.

### 9.3 ConnectivityObserver

`expect/actual`:
- **Android**: `ConnectivityManager` + `NetworkCallback`
- **iOS**: `NWPathMonitor`

Emits `StateFlow<Connectivity>` where `Connectivity` is `CONNECTED | DISCONNECTED`.

### 9.4 Local Cache

`TripLocalCache` stores the last-fetched trip detail for offline viewing. Updated on every successful fetch. Read when offline. Uses `multiplatform-settings` for simple key-value storage of serialized `TripDetail`.

---

## 10. Analytics / Logging Points

### 10.1 Screen View Events (Auto-Tracked)

| Screen | Event Name |
|--------|-----------|
| ActiveTripScreen | `screen_view_active_trip` |
| TripDetailScreen | `screen_view_trip_detail` |
| MilestoneActionScreen | `screen_view_milestone_action` |
| PodCaptureScreen | `screen_view_pod_capture` |
| ExpenseFormScreen | `screen_view_expense_form` |
| ExceptionReportScreen | `screen_view_exception_report` |

### 10.2 Action Events

| Event | Parameters | When |
|-------|-----------|------|
| `trip_accepted` | tripId, responseTime | Driver taps Accept + API succeeds |
| `trip_rejected` | tripId, reason | Driver taps Reject + API succeeds |
| `milestone_completed` | tripId, milestoneType, fromState, toState | Transition succeeds |
| `pod_submitted` | tripId, photoCount, hasSignature | POD upload completes |
| `expense_logged` | tripId, category, amount | Expense saved |
| `document_uploaded` | tripId, category, fileSize | Upload completes |
| `exception_reported` | tripId, exceptionType | Exception submitted |
| `offline_action_queued` | tripId, actionType | Action queued due to no network |
| `offline_sync_completed` | tripId, syncedCount, failedCount | Queue drained |
| `gps_tracking_started` | tripId | Tracking begins at DEPARTED |
| `gps_tracking_stopped` | tripId, pointCount | Tracking ends at AT_DESTINATION |
| `gps_permission_denied` | tripId | Driver denies GPS permission |

### 10.3 Error/Diagnostic Events

| Event | Parameters |
|-------|-----------|
| `api_error` | endpoint, statusCode, errorBody |
| `upload_failed` | tripId, fileType, errorMessage |
| `sync_conflict` | tripId, expectedState, serverState |
| `gps_signal_lost` | tripId, lastKnownLat, lastKnownLng |

---

## 11. Testing Strategy

### 11.1 Unit Tests (commonTest)

| Test File | Tests | Approach |
|-----------|-------|---------|
| `TripStateMachineTest.kt` | All valid transitions, all blocked/read-only states, exception overlay logic | Pure Kotlin, no mocks — deterministic state machine |
| `CtaStateDerivationTest.kt` | CTA label + enabled/disabled for every 15+ sub-state | Pure Kotlin — TripStatus → CtaState mapping |
| `ActionPermissionTest.kt` | canAddExpense, canAddDocument, canReportException for every state | Pure Kotlin |
| `OfflineQueueTest.kt` | Enqueue, dequeue, persist, replay order, halt-on-rejection | In-memory Settings mock |
| `GetActiveTripUseCaseTest.kt` | Happy path, no trip, network error, cache fallback | MockTripRepository |
| `TransitionMilestoneUseCaseTest.kt` | Valid transition, invalid transition, offline queue, 422 rejection | MockMilestoneRepository |
| `SubmitPodUseCaseTest.kt` | Full upload, partial failure, retry | MockPodRepository + MockUploadService |
| `TripMapperTest.kt` | DTO → domain model, null handling, unknown status | Pure mapping |
| `TripStatusTest.kt` | All enum values serialize/deserialize, unknown fallback | Serialization |

**Run command**:
```bash
cd /Users/ankit/a/fleetly/axleops_code/mobile && ./gradlew :shared:testDebugUnitTest
```

### 11.2 Integration Tests

| Scenario | Test Approach |
|----------|--------------|
| Full lifecycle (DISPATCHED → POD_SUBMITTED) in mock mode | Automated: create a test that calls all use cases in sequence via `MockMilestoneRepository`, verify state machine transitions |
| Offline queue replay | Automated: enqueue 4 transitions offline, simulate reconnect, verify all 4 sent in order |
| Upload retry | Automated: fail first upload, retry, verify success |

### 11.3 Manual QA Verification

1. **Launch app in mock mode** → verify Active Trip tab shows dispatched trip card
2. **Accept trip** → verify state changes, CTA updates to "Arrived at Origin"
3. **Progress through all milestones** → verify each CTA label change, stepper updates
4. **Submit POD** → verify multi-step flow (photos → signature → consignee → review → submit)
5. **Enable airplane mode** → perform milestone transition → verify offline indicator + queue badge
6. **Disable airplane mode** → verify queue syncs automatically
7. **Test blocked state** → use mock fixture with EWB_PENDING → verify departure is blocked with inline message
8. **Test exception** → report breakdown during IN_TRANSIT → verify red banner + actions disabled

> [!IMPORTANT]
> Detailed manual test steps will be defined in `tasks.md` per-task. The above are high-level QA scenarios.

---

## 12. Backend Gap Register & Suggested Discussion Points

### 12.1 Gap Summary (from spec)

| Gap | Description | Mobile Mitigation | BE Priority |
|-----|-------------|-------------------|-------------|
| **G1** | No driver-scoped trip query (`GET /trips/driver/active`) | Mock returns canned active trip | **P1** — blocks production use |
| **G2** | No state transition API (`POST /trips/{id}/transition`) | Mock validates via TripStateMachine | **P1** — blocks all milestone progression |
| **G3** | No TripMilestone entity | Mock maintains in-memory milestone list | **P1** — blocks audit trail |
| **G4** | No file upload API (documents, POD) | Mock accepts files and returns success | **P1** — blocks POD and evidence |
| **G5** | No trip-scoped expense entity | Mock stores in memory | **P2** — expenses can be reconciled later |
| **G6** | No GPS log endpoint | Mock is a silent sink | **P2** — tracking works locally regardless |
| **G7** | No exception reporting API | Mock sets exception state | **P2** |
| **G8** | contactId mapping gap (User ↔ Contact) | Mock returns canned driver | **P1** — inherited from auth spec |
| **G9** | No POD entity/API | Mock simulates POD acceptance | **P1** |

### 12.2 Suggested BE Discussion Points

1. **State machine approach**: Should the backend use Spring State Machine or a simpler guard-based interceptor? Mobile's `TripStateMachine` can serve as the reference implementation.
2. **Transition API design**: Single generic `POST /trips/{id}/transition` with event body, or separate endpoints per transition (`/accept`, `/depart`, etc.)? Mobile's mock uses the generic approach.
3. **Trip-scoped vs vehicle-scoped expenses**: The existing Expense entity is vehicle-scoped. Should a new `TripExpense` entity be created, or should the existing `Expense` gain a `tripId` FK?
4. **File storage**: What storage backend for POD/document uploads? S3/GCS? This affects the upload contract (presigned URLs vs. direct multipart).
5. **EWB integration**: EWB status as a field on Trip or a separate EWB entity? Mobile treats it as a backend-only guard (422 rejection on depart) — but the backend needs to know the EWB state somehow.
6. **contactId resolution timeline**: This blocks production use of the driver-scoped trip query. When can `contact_id` be added to the `users` table?

---

## 13. Implementation Phases

### Phase 1: Domain + State Machine + Data Layer (Foundation)

**Priority**: Must be first — everything else depends on it.

- Expand `TripStatus` enum
- Create all domain models (TripDetail, Milestone, Expense, Document, Pod, Exception, etc.)
- Implement `TripStateMachine` with unit tests
- Create all repository interfaces
- Create all Mock repository implementations with JSON fixtures
- Create all Real repository stubs (API calls to derived endpoints)
- Add new `DataSourceConfig` fields
- Wire new repository bindings in `DataSourceModule`

### Phase 2: Active Trip Tab + Trip Card + Accept/Reject (Story 1)

- Add `ScreenConfig` variants for Active Trip screens
- Implement `ActiveTripComponent` (Decompose)
- Implement `ActiveTripScreen` (Compose) — empty state, dispatched card, accepted card
- Implement `GetActiveTripUseCase`
- Accept/Reject with confirmation modals
- Wire into `DriverScreens` factory

### Phase 3: Trip Detail + Milestone Progression (Stories 2-3)

- Implement `TripDetailComponent` + `TripDetailScreen` with all sections
- Implement milestone stepper (horizontal + vertical)
- Implement `MilestoneActionComponent` + forms (loading, departure, arrival, delivery)
- Implement `TransitionMilestoneUseCase`
- Blocked-state handling (EWB, timeout, exception overlay)

### Phase 4: POD Submission (Story 4)

- Implement `PodCaptureComponent` (multi-step Decompose flow)
- Implement POD screens (photos, signature, consignee, review)
- Implement `SubmitPodUseCase` (orchestrate uploads)
- Platform `expect/actual` for digital signature capture

### Phase 5: Map + GPS Tracking (Stories 5-6)

- Map section with route visualization (expect/actual per platform)
- Background GPS tracking (expect/actual — Android foreground service, iOS background location)
- `LocationRepository` + batch logging
- `TrackingManager` (start/stop/batch/persist offline)

### Phase 6: Documents + Expenses + Exceptions + Checkpoints (Stories 7-10)

- Document upload + viewing
- Expense CRUD (create, edit, delete with soft-delete)
- Exception reporting
- Checkpoint event logging

### Phase 7: Offline Queue + Connectivity (Cross-Cutting)

- `OfflineQueue` implementation
- `ConnectivityObserver` (expect/actual)
- `SyncOfflineQueueUseCase`
- Offline banner UI
- Queue badge UI

---

## 14. Implementation Readiness Summary

| Category | Status |
|----------|--------|
| ✅ Implementable now with real APIs | Trip list (`GET /trips`), trip detail (`GET /trips/{id}`) |
| ✅ Implementable now with mock fallback | All 12 derived endpoints (accept, reject, transition, POD, documents, expenses, exceptions, checkpoints, GPS log, milestones, active trip) |
| ⚠️ Blocked by backend | Production use of any mock-backed feature (requires BE to implement endpoints) |
| ⚠️ Blocked by unresolved product questions | None — all 5 clarification questions resolved in spec |

---

## Constitution Check

| Principle | Status |
|-----------|--------|
| I. Existing-System-First | ✅ Trip model extends existing. Backend CRUD APIs reused where available. |
| II. Role-Scoped Design | ✅ All driver actions gated by TripStateMachine. No ops/finance actions exposed. |
| III. Closest-Contract API Strategy | ✅ 12 derived contracts follow trip.md domain model. Mock-backed with DataSourceConfig toggle. |
| IV. State-Machine Fidelity | ✅ TripStateMachine encodes all 15+ sub-states and 10 transitions from trip.md. |
| V. DataSourceConfig Driven | ✅ 5 new fields added. Factory bindings in Koin. Toggling in Settings. |
| VI. Production-Grade Field UX | ✅ UX package enforces truck cab test, 48dp touch targets, offline resilience. |
| VII. Auditability | ✅ FR-110–114 encode immutable timestamps, GPS, user ID, evidence hashes. |
| VIII. Test-Driven Confidence | ✅ 9 unit test suites planned. Mock-mode lifecycle test. Manual QA scenarios defined. |
