# Implementation Plan: Driver Trip Location Tracking & Background Telemetry

**Feature Branch**: `006-driver-trip-location-tracking`  
**Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/spec.md)  
**UX**: [ux/](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/)  
**Constitution**: v3.0.0 — all 9 principles acknowledged  
**Date**: 2026-03-29

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Existing-System-First | ✅ | Builds on existing `TrackingManager`, `LocationTracker`, `LocationProvider`, `LocationRepository`. No new invention — replaces mocks with real implementations. |
| II. Role-Scoped Design | ✅ | Driver-only. Tracking scoped to driver's active trip. |
| III. Closest-Contract API Strategy | ✅ | `POST /trips/{id}/location/batch` derived from trip entity + domain conventions. Mock-backed initially. |
| IV. Backend-Gap Transparency | ✅ | 5 gaps documented in spec §8.4. `derived-contracts.md` to be created. |
| V. State-Machine Fidelity | ✅ | Tracking lifecycle bound to trip sub-state transitions (DEPARTED → AT_DESTINATION). |
| VI. Scoped Change Discipline | ✅ | All changes in `/mobile/**`. No FE/BE modifications. |
| VII. Production-Grade Field UX | ✅ | All 7 tracking states handled. Degraded modes transparent. Offline resilience with SQLDelight buffer. |
| VIII. Testability & Switchability | ✅ | Mock/real switching via `DataSourceConfig`. Mock repository maintained. |
| IX. Reviewability | ✅ | Plan structured into implementation sequences with small, reviewable task slices. |

---

## 1. Shared vs Platform-Specific Architecture

### Layer Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         commonMain                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │TrackingManager│  │ TrackingState │  │  LocationPoint     │    │
│  │  (orchestrator)│  │  Machine      │  │  (domain model)    │    │
│  └───────┬───────┘  └──────────────┘  └────────────────────┘    │
│          │                                                       │
│  ┌───────┴──────────────────────────────────────────┐           │
│  │              LocationBuffer (SQLDelight)           │           │
│  │  - insert(point)                                   │           │
│  │  - getPending(): Flow<List<BufferedLocationPoint>> │           │
│  │  - markSynced(ids)                                │           │
│  │  - pendingCount(): Flow<Int>                      │           │
│  └───────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────────────┐              │
│  │LocationRepository │  │ LocationPermissionState │              │
│  │ (interface)       │  │ (enum: sealed class)    │              │
│  └──────────────────┘  └─────────────────────────┘              │
│                                                                  │
│  ┌──────────────────┐  ┌─────────────────────────┐              │
│  │LocationTracker   │  │ LocationPermissionHandler│              │
│  │ (interface)       │  │ (expect)                │              │
│  └──────────────────┘  └─────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌───────────────────────┐
│      androidMain      │  │        iosMain         │
│                        │  │                         │
│ AndroidLocationTracker │  │  IOSLocationTracker    │
│ - ForegroundService    │  │  - CLLocationManager   │
│ - FusedLocationClient  │  │  - Background mode     │
│ - Notification channel │  │  - SignificantLocation  │
│                        │  │                         │
│ AndroidPermissionHdlr  │  │  IOSPermissionHandler  │
│ - Fine + Background    │  │  - WhenInUse + Always  │
│ - shouldShowRationale  │  │  - accuracyAuthorization│
│                        │  │                         │
│ AndroidBatteryHelper   │  │  (no equivalent)       │
│ - isIgnoringBatOpt     │  │                         │
│ - requestExemption     │  │                         │
└──────────────────────┘  └───────────────────────┘
```

### What Lives Where

| Component | Source Set | Rationale |
|-----------|-----------|-----------|
| `TrackingStateMachine` | commonMain | State transitions are pure logic — no platform dependency |
| `TrackingManager` (refactored) | commonMain | Orchestrates start/stop/flush; delegates GPS capture to platform |
| `LocationBuffer` (SQLDelight DAO) | commonMain | SQLDelight generates platform drivers; schema is shared |
| `LocationPoint` (expanded model) | commonMain | Domain data class with all 9 spec fields + `clientId` |
| `BufferedLocationPoint` | commonMain | SQLDelight entity with sync status |
| `LocationRepository` (interface) | commonMain | Abstraction for `batchLog` |
| `MockLocationRepository` | commonMain | Console logging mock |
| `RealLocationRepository` | commonMain | HTTP POST to `/trips/{id}/location/batch` |
| `LocationTracker` (interface) | commonMain | Abstraction for platform GPS |
| `LocationPermissionHandler` (expect) | commonMain | Expect class for permission requests |
| `AndroidLocationTracker` | androidMain | FusedLocationProviderClient + ForegroundService |
| `IOSLocationTracker` | iosMain | CLLocationManager + background modes |
| `AndroidPermissionHandler` (actual) | androidMain | ActivityResultContracts for location permissions |
| `IOSPermissionHandler` (actual) | iosMain | CLLocationManager.requestAuthorization |
| `AndroidBatteryHelper` | androidMain | PowerManager queries + exemption requests |
| `TrackingDiagnostics` | commonMain | Local health metric logging |

---

## 2. Foreground Tracking Architecture

### Flow

```
Trip transitions to DEPARTED
    │
    ▼
TrackingManager.start(tripId)
    │
    ├── TrackingStateMachine → AWAITING_PERMISSION
    │
    ├── LocationPermissionHandler.requestForegroundPermission()
    │       │
    │       ├── GRANTED → TrackingStateMachine → ACTIVE
    │       │               │
    │       │               └── LocationTracker.startTracking()
    │       │                       │
    │       │                       └── Timer: every 5 min
    │       │                               │
    │       │                               ├── LocationProvider.getCurrentLocation()
    │       │                               ├── LocationBuffer.insert(point)
    │       │                               └── Check batch threshold → flush if needed
    │       │
    │       └── DENIED → TrackingStateMachine → PERMISSION_DENIED
    │                       │
    │                       └── Departure proceeds (non-blocking)
    │
    └── Emit tracking state to UI via StateFlow
```

### Key Implementation Details

- **`TrackingManager.start(tripId)`** replaces the current simple coroutine loop with a structured state-machine-aware orchestrator.
- **`LocationTracker.startTracking()`** is the platform-specific GPS activation (Android: `requestLocationUpdates`, iOS: `startUpdatingLocation`).
- **Capture timer** lives in `TrackingManager` (commonMain). The platform tracker just provides GPS fixes; the timer logic is shared.
- **Buffer insertion** is immediate and synchronous from the capture coroutine — SQLDelight write on main/default dispatcher.

---

## 3. Background Tracking Architecture

### Android

```
TrackingManager.start()
    │
    └── AndroidLocationTracker.startTracking()
            │
            ├── Start ForegroundService (type: LOCATION)
            │   ├── Create notification channel "Trip Tracking" (LOW importance)
            │   ├── Show persistent notification: "Trip {tripNumber} · Location tracking active"
            │   └── Acquire PARTIAL_WAKE_LOCK
            │
            ├── FusedLocationProviderClient.requestLocationUpdates()
            │   ├── interval: 5 min
            │   ├── fastestInterval: 4 min
            │   ├── priority: PRIORITY_HIGH_ACCURACY
            │   └── LocationCallback → TrackingManager.onLocationReceived()
            │
            └── Register BroadcastReceiver for:
                ├── BOOT_COMPLETED (auto-restart)
                └── PACKAGE_REPLACED (app update)
```

**ForegroundService lifecycle**:
- Started when tracking begins (departure — app is in foreground, satisfying Android 12+ restrictions).
- Runs continuously in background.
- Stopped when tracking ends (arrival) or trip is cancelled.
- If killed by OS: AlarmManager sets a repeating exact alarm (every 15 min) to re-trigger. On trigger, check trip state → if still in transit → restart service.

**OEM Battery Optimization**:
- Check `PowerManager.isIgnoringBatteryOptimizations()` at tracking start.
- If not exempted, show the §3.7 battery optimization banner.
- Request exemption via `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` intent (within Play Store policy limits).
- For Xiaomi/Samsung/Oppo/Realme/Vivo: detect manufacturer → log diagnostic note. (OEM-specific settings deep links are fragile and may break across OS versions — log the manufacturer and model for field debugging.)

### iOS

```
TrackingManager.start()
    │
    └── IOSLocationTracker.startTracking()
            │
            ├── CLLocationManager configuration
            │   ├── desiredAccuracy: kCLLocationAccuracyBest
            │   ├── distanceFilter: 50m (reduces noise during highway travel)
            │   ├── allowsBackgroundLocationUpdates = true
            │   ├── pausesLocationUpdatesAutomatically = false
            │   └── showsBackgroundLocationIndicator = true
            │
            ├── startUpdatingLocation()
            │   └── CLLocationManagerDelegate → TrackingManager.onLocationReceived()
            │
            └── Fallback: startMonitoringSignificantLocationChanges()
                └── If app is terminated by OS, significant location change
                    relaunches the app → check trip state → restart full tracking
```

**iOS Significant Location Change** acts as a safety net:
- Always registered when tracking is active.
- If the app is terminated, a significant change (~500m) relaunches it.
- On relaunch: `application(_:didFinishLaunchingWithOptions:)` checks for `UIApplication.LaunchOptionsKey.location` → detects location-triggered relaunch → checks active trip → restarts `TrackingManager`.
- Resolution is low (~500m), so this is a gap-filler, not primary tracking.

---

## 4. Permission Handling Architecture

### Expanded `LocationPermissionHandler` (expect/actual)

The existing `PermissionHandler` covers camera and gallery. Location permissions are structurally different (multi-step, foreground/background split), so they get a **separate expect class**:

```kotlin
// commonMain
expect class LocationPermissionHandler {
    suspend fun checkCurrentState(): LocationPermissionState
    suspend fun requestForegroundPermission(): LocationPermissionState
    suspend fun requestBackgroundPermission(): LocationPermissionState
    fun openAppSettings()
    fun isDeviceLocationEnabled(): Boolean
}
```

This does NOT modify the existing `PermissionHandler`. It is a new, parallel abstraction because:
1. Location permissions have a fundamentally different two-step flow.
2. The return type is a rich enum, not a simple Boolean.
3. Android and iOS have different step sequences.

### Android actual

```kotlin
// androidMain
actual class LocationPermissionHandler(private val activity: ComponentActivity) {
    actual suspend fun checkCurrentState(): LocationPermissionState {
        // Check ACCESS_FINE_LOCATION, ACCESS_BACKGROUND_LOCATION, shouldShowRationale
    }
    actual suspend fun requestForegroundPermission(): LocationPermissionState {
        // ActivityResultContracts.RequestPermission(Manifest.permission.ACCESS_FINE_LOCATION)
    }
    actual suspend fun requestBackgroundPermission(): LocationPermissionState {
        // ActivityResultContracts.RequestPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
    }
    actual fun openAppSettings() {
        // ACTION_APPLICATION_DETAILS_SETTINGS intent
    }
    actual fun isDeviceLocationEnabled(): Boolean {
        // LocationManager.isProviderEnabled(GPS_PROVIDER || NETWORK_PROVIDER)
    }
}
```

### iOS actual

```kotlin
// iosMain
actual class LocationPermissionHandler {
    actual suspend fun checkCurrentState(): LocationPermissionState {
        // CLLocationManager.authorizationStatus + accuracyAuthorization
    }
    actual suspend fun requestForegroundPermission(): LocationPermissionState {
        // requestWhenInUseAuthorization()
    }
    actual suspend fun requestBackgroundPermission(): LocationPermissionState {
        // requestAlwaysAuthorization()
    }
    actual fun openAppSettings() {
        // UIApplication.openSettingsURLString
    }
    actual fun isDeviceLocationEnabled(): Boolean {
        // CLLocationManager.locationServicesEnabled()
    }
}
```

---

## 5. Permission-State and Tracking-State Modeling

### LocationPermissionState (commonMain)

```kotlin
sealed class LocationPermissionState {
    data object NotDetermined : LocationPermissionState()
    data object ForegroundOnly : LocationPermissionState()
    data object ForegroundAndBackground : LocationPermissionState()
    data object Denied : LocationPermissionState()
    data object PermanentlyDenied : LocationPermissionState() // Android-specific
    data object ReducedAccuracy : LocationPermissionState()  // iOS-specific
}
```

### TrackingState (commonMain)

```kotlin
enum class TrackingState {
    INACTIVE,              // Non-transit trip state or no trip
    AWAITING_PERMISSION,   // Departure triggered, checking permissions
    ACTIVE,                // Tracking running, full capability
    ACTIVE_DEGRADED,       // Tracking running, limited (background denied / low accuracy)
    SIGNAL_LOST,           // GPS hardware no fix for ≥ 2 intervals
    PERMISSION_DENIED,     // All location permission denied
    STOPPED,               // Was active, tracking ended (trip arrived)
}
```

### TrackingStateMachine (commonMain)

```kotlin
class TrackingStateMachine {
    private val _state = MutableStateFlow(TrackingState.INACTIVE)
    val state: StateFlow<TrackingState> = _state.asStateFlow()

    fun onTripDeparted()                // INACTIVE → AWAITING_PERMISSION
    fun onPermissionGranted(full: Boolean) // AWAITING_PERMISSION → ACTIVE or ACTIVE_DEGRADED
    fun onPermissionDenied()            // AWAITING_PERMISSION → PERMISSION_DENIED
    fun onPermissionRevoked()           // ACTIVE → PERMISSION_DENIED
    fun onBackgroundRestricted()        // ACTIVE → ACTIVE_DEGRADED
    fun onBackgroundRestored()          // ACTIVE_DEGRADED → ACTIVE
    fun onGpsSignalLost()              // ACTIVE → SIGNAL_LOST
    fun onGpsSignalRestored()          // SIGNAL_LOST → ACTIVE
    fun onTripArrived()                 // Any → STOPPED
    fun onTripReset()                   // Any → INACTIVE
}
```

All transitions are validated — invalid transitions are logged but do not crash.

---

## 6. Offline Buffering / Deferred Sync Architecture

### SQLDelight Schema

```sql
-- LocationBuffer.sq
CREATE TABLE BufferedLocationPoint (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    clientId TEXT NOT NULL UNIQUE,
    tripId INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL NOT NULL,
    timestamp TEXT NOT NULL,
    speed REAL,
    bearing REAL,
    altitude REAL,
    provider TEXT,
    batteryLevel INTEGER,
    syncStatus TEXT NOT NULL DEFAULT 'PENDING',
    capturedAt TEXT NOT NULL,
    syncAttempts INTEGER NOT NULL DEFAULT 0
);

getPendingByTrip:
SELECT * FROM BufferedLocationPoint
WHERE tripId = ? AND syncStatus = 'PENDING'
ORDER BY capturedAt ASC
LIMIT ?;

pendingCount:
SELECT COUNT(*) FROM BufferedLocationPoint
WHERE syncStatus = 'PENDING';

markSynced:
UPDATE BufferedLocationPoint
SET syncStatus = 'SYNCED'
WHERE clientId IN ?;

insert:
INSERT OR IGNORE INTO BufferedLocationPoint
(clientId, tripId, latitude, longitude, accuracy, timestamp,
 speed, bearing, altitude, provider, batteryLevel, syncStatus, capturedAt, syncAttempts)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, 0);

deleteSynced:
DELETE FROM BufferedLocationPoint
WHERE syncStatus = 'SYNCED';
```

### Sync Flow

```
LocationBuffer has pending points
    │
    ├── ConnectivityObserver reports CONNECTED
    │       │
    │       ▼
    │   BatchSyncWorker.execute()
    │       │
    │       ├── Query pending points (batch of 50, oldest first)
    │       ├── POST /trips/{id}/location/batch
    │       │       │
    │       │       ├── 202 Accepted → markSynced(ids)
    │       │       │                   deleteSynced()
    │       │       │                   repeat if more pending
    │       │       │
    │       │       ├── 4xx → increment syncAttempts, retry once
    │       │       │
    │       │       ├── 5xx → exponential backoff (30s → 1m → 2m → 5m → 10m cap)
    │       │       │
    │       │       └── 401 → stop sync, await re-authentication
    │       │
    │       └── Update pendingCount flow → UI badge refreshes
    │
    └── ConnectivityObserver reports DISCONNECTED
            │
            └── Pause sync. Points continue buffering locally.
```

### Key Design Decisions

- **Write-through**: GPS capture → SQLDelight insert → then attempt sync. Never in-memory only.
- **Batch size**: 50 points max per API call (spec §7.2).
- **Chronological order**: Oldest first (ORDER BY capturedAt ASC).
- **Delete after sync**: Synced points are purged periodically to prevent DB bloat.
- **No eviction**: Buffer grows beyond 24h if needed. Diagnostic log at threshold.

---

## 7. Real-vs-Mock Strategy

| Component | Mock | Real | Switching Mechanism |
|-----------|------|------|-------------------|
| `LocationProvider` | `MockLocationProvider` (fixed Mumbai coords) | Platform GPS via `LocationTracker` | `DataSourceConfig.useRealLocation` |
| `LocationRepository` | `MockLocationRepository` (console log) | `RealLocationRepository` (POST to API) | `DataSourceConfig.useRealLocation` |
| `LocationTracker` | `MockLocationTracker` (fixed flow) | `AndroidLocationTracker` / `IOSLocationTracker` | `DataSourceConfig.useRealLocation` |
| `LocationBuffer` | Always real | Always real | No mock — SQLDelight runs in both modes |
| `LocationPermissionHandler` | Not mocked — always real | Always real | Permissions must be exercised for real |
| `TrackingStateMachine` | Not mocked — pure logic | Always real | No mock needed — deterministic |
| `TrackingDiagnostics` | Always real | Always real | No mock — local logging |

**In mock mode**: GPS capture uses `MockLocationProvider` (returns fixed coords every 5 min). Buffer stores to SQLDelight. Mock repository accepts the batch. QA can verify the full pipeline without real GPS.

**In real mode**: Platform `LocationTracker` captures real GPS. Real repository POSTs to backend. Same buffer, same sync.

**Switching**: Via existing `DataSourceConfig` toggle mechanism in the QA/debug settings panel.

---

## 8. Data Ingestion / Contract Implications

### Derived Contract: `POST /trips/{id}/location/batch`

**Source**: Trip entity (`Trip.java`), driver FK, trip status field.  
**Canonical**: Confirmed in clarification session (supersedes 005's `POST /location/log`).

```
POST /trips/{tripId}/location/batch
Authorization: Bearer {jwt}
Content-Type: application/json

{
  "points": [
    {
      "clientId": "uuid-v4",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "accuracy": 10.0,
      "timestamp": "2026-03-29T10:00:00Z",
      "speed": 16.5,
      "bearing": 45.0,
      "altitude": 25.0,
      "provider": "GPS",
      "batteryLevel": 72
    }
  ]
}
```

**Response**: `202 Accepted`
```json
{
  "accepted": 3,
  "duplicates": 0
}
```

**Error responses**: Standard HTTP status codes.  
**Dedup**: Server uses `(tripId, clientId)` composite key. Client retries are safe.

This contract will be documented in `specs/006-driver-trip-location-tracking/derived-contracts.md`.

---

## 9. Integration Points with Driver Active Trip

| Integration Point | What Changes | Where |
|-------------------|-------------|-------|
| **Trip departure transition** | `ActiveTripViewModel` calls `TrackingManager.start(tripId)` after LOADED → DEPARTED transition succeeds. Permission pre-prompt bottom sheet shown before OS dialog. | `ActiveTripViewModel.kt` |
| **Trip arrival transition** | `ActiveTripViewModel` calls `TrackingManager.stop()` when trip transitions to AT_DESTINATION. | `ActiveTripViewModel.kt` |
| **Tracking indicator in UI** | `ActiveTripScreen` observes `TrackingManager.trackingState` StateFlow and renders the header indicator. | `ActiveTripScreen.kt` (composable) |
| **Warning banners** | `ActiveTripScreen` renders tracking-related banners based on `TrackingState` and `LocationPermissionState`. Banners follow existing `OfflineBanner` pattern. | `ActiveTripScreen.kt` |
| **Pending sync badge** | UI observes `LocationBuffer.pendingCount()` flow and renders badge near tracking indicator. | `ActiveTripScreen.kt` |
| **Exception states** | During exceptions (VEHICLE_BREAKDOWN, etc.), tracking continues. No change to exception banner precedence — tracking warnings appear below exception banner per UX state precedence. | No change to exception logic |
| **App relaunch** | On app launch, check active trip → if in transit family → check permissions → auto-restart tracking. | `ActiveTripViewModel.init {}` |
| **DI module** | `TrackingModule` expanded with new bindings: `TrackingStateMachine`, `LocationBuffer`, `LocationPermissionHandler`, `TrackingDiagnostics`, and real platform trackers. | `TrackingModule.kt` |

### What Does NOT Change in Active Trip

- Trip card layout and structure
- Milestone stepper logic
- CTA button logic (departure CTA still works identically — tracking is a side-effect)
- Exception handling flow
- Offline queue for milestone transitions
- Document upload flow
- Expense logging

---

## 10. Platform Requirement Notes

### Android

| Requirement | Implementation | Files |
|-------------|---------------|-------|
| `ForegroundService` (type: LOCATION) | New `LocationTrackingService extends Service` with `startForeground()` | `androidApp/src/.../service/LocationTrackingService.kt` |
| Notification channel | "Trip Tracking" channel, LOW importance, created in `Application.onCreate()` | `androidApp/src/.../AxleOpsApplication.kt` |
| Manifest declarations | `<service foregroundServiceType="location">`, `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `RECEIVE_BOOT_COMPLETED` | `AndroidManifest.xml` |
| `FusedLocationProviderClient` | Google Play Services dependency. `LocationRequest` with 5-min interval. | `androidMain/.../AndroidLocationTracker.kt` |
| AlarmManager restart | `AlarmManager.setExactAndAllowWhileIdle()` for service restart after OS kill | `androidMain/.../TrackingAlarmReceiver.kt` |
| Battery optimization | `PowerManager.isIgnoringBatteryOptimizations()` + `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | `androidMain/.../AndroidBatteryHelper.kt` |
| Boot receiver | Restart tracking service on device reboot if trip is still in transit | `androidApp/.../receiver/BootCompletedReceiver.kt` |

### iOS

| Requirement | Implementation | Files |
|-------------|---------------|-------|
| Background mode | `UIBackgroundModes: location` in `Info.plist` | `iosApp/Info.plist` |
| Usage descriptions | `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` | `iosApp/Info.plist` |
| `CLLocationManager` | `desiredAccuracy: Best`, `distanceFilter: 50m`, `allowsBackgroundLocationUpdates: true`, `pausesLocationUpdatesAutomatically: false` | `iosMain/.../IOSLocationTracker.kt` |
| Significant location change | `startMonitoringSignificantLocationChanges()` as fallback | `iosMain/.../IOSLocationTracker.kt` |
| App delegate relaunch | Check `LaunchOptionsKey.location` in `application(_:didFinishLaunchingWithOptions:)` | `iosApp/.../AppDelegate.swift` |
| Accuracy authorization | Detect `.reducedAccuracy` on iOS 14+ | `iosMain/.../IOSPermissionHandler.kt` |

---

## 11. Library Strategy Evaluation

| Library | Evaluated For | Verdict |
|---------|--------------|---------|
| **SQLDelight** (existing in project scope) | Location buffer persistence | ✅ **Use.** KMP-native, reactive queries, already planned for the project. |
| **Google Play Services Location** | Android GPS capture | ✅ **Use.** Industry standard for Android location. FusedLocationProviderClient. |
| **kotlinx-datetime** (already in project) | Timestamps in location points | ✅ **Use.** Already used by `TrackingManager`. |
| **compass-geolocation** (KMP library) | Cross-platform location abstraction | ❌ **Reject.** Does not support ForegroundService, background modes, or permission flows. Insufficient for production tracking. |
| **moko-geo** (KMP library) | Cross-platform location | ❌ **Reject.** Limited background support. Does not handle the ForegroundService requirement. |
| **HyperTrack / Radar SDK** | Full tracking SDK | ❌ **Reject per spec.** Data sovereignty and cost concerns. |

**Decision**: Custom platform implementation with shared orchestration. No third-party tracking library.

---

## 12. Rollout Strategy

> **Clarification (2026-03-29)**: All capabilities ship as a single MVP release. The implementation sequences below describe development ordering, not separate releases.

### Implementation Sequence 1: Foundation + Foreground

| # | Task | Type |
|---|------|------|
| 1.1 | SQLDelight schema + `LocationBuffer` DAO | Shared |
| 1.2 | `LocationPermissionState` + `TrackingState` enums | Shared |
| 1.3 | `TrackingStateMachine` with full transition logic | Shared |
| 1.4 | Expand `LocationPoint` domain model (add 5 missing fields + clientId) | Shared |
| 1.5 | `LocationPermissionHandler` (expect/actual) for foreground | Platform |
| 1.6 | Refactor `TrackingManager` to use state machine + SQLDelight buffer | Shared |
| 1.7 | Update `RealLocationRepository` endpoint from `/location/log` to `/trips/{id}/location/batch` | Shared |
| 1.8 | Permission pre-prompt bottom sheet UI | Shared (Compose) |
| 1.9 | Tracking indicator UI in ActiveTripScreen header | Shared (Compose) |
| 1.10 | Warning banners (all 7 variants) | Shared (Compose) |

### Implementation Sequence 2: Background + Platform

| # | Task | Type |
|---|------|------|
| 2.1 | Android `ForegroundService` + notification channel | Android |
| 2.2 | Android `FusedLocationProviderClient` integration | Android |
| 2.3 | Android `LocationPermissionHandler` (actual) — foreground + background | Android |
| 2.4 | iOS `CLLocationManager` integration + background mode | iOS |
| 2.5 | iOS `LocationPermissionHandler` (actual) — WhenInUse + Always | iOS |
| 2.6 | Integration: `ActiveTripViewModel` wires departure → tracking start | Shared |
| 2.7 | Integration: `ActiveTripViewModel` wires arrival → tracking stop | Shared |
| 2.8 | Pending sync badge UI | Shared (Compose) |
| 2.9 | Batch sync worker with connectivity awareness | Shared |
| 2.10 | Android foreground notification content updates per tracking state | Android |

### Implementation Sequence 3: Resilience + Diagnostics

| # | Task | Type |
|---|------|------|
| 3.1 | Android AlarmManager restart after OS kill | Android |
| 3.2 | Android BootCompletedReceiver | Android |
| 3.3 | iOS significant location change fallback | iOS |
| 3.4 | iOS app delegate relaunch detection | iOS |
| 3.5 | Android battery optimization detection + exemption request | Android |
| 3.6 | `TrackingDiagnostics` local health logging | Shared |
| 3.7 | 48-hour auto-stop safety net | Shared |
| 3.8 | `TRACKING_RESUMED` event with gap duration | Shared |
| 3.9 | DI module updates (`TrackingModule` expansion) | Shared |
| 3.10 | `derived-contracts.md` documentation | Documentation |

---

## 13. Testing Strategy

### Unit Tests (commonTest)

| Test | What It Verifies | File |
|------|-----------------|------|
| `TrackingStateMachineTest` | All 7 states, all valid transitions, invalid transition rejection | `commonTest/.../tracking/TrackingStateMachineTest.kt` |
| `LocationBufferTest` | Insert, getPending, markSynced, deleteSynced, pendingCount, dedup | `commonTest/.../tracking/LocationBufferTest.kt` |
| `BatchSyncWorkerTest` | Batch formation (50 max), chronological order, retry logic, backoff | `commonTest/.../tracking/BatchSyncWorkerTest.kt` |
| `TrackingManagerTest` | start/stop lifecycle, state transitions, flush on stop, resume logic | `commonTest/.../tracking/TrackingManagerTest.kt` |
| `TrackingDiagnosticsTest` | Metric recording, gap detection, battery trend | `commonTest/.../tracking/TrackingDiagnosticsTest.kt` |
| `LocationPointMapperTest` | Domain model → DTO mapping with all 9 fields + clientId | `commonTest/.../data/mapper/LocationPointMapperTest.kt` |

**Run**: `./gradlew :shared:cleanAllTests :shared:allTests` from `/mobile`

### Integration Tests

| Test | What It Verifies | How |
|------|-----------------|-----|
| Permission flow → tracking start | Pre-prompt → OS dialog → tracking begins | Manual test on physical devices |
| Departure → tracking → arrival | Full lifecycle during a mock trip | Manual test: trigger departure in mock, verify 3+ location points captured, arrive, verify tracking stops |
| Offline → reconnect → sync | Buffer accumulates during airplane mode, syncs when reconnected | Manual test: enable airplane mode for 10+ min, disable, verify pending badge clears |
| Background tracking (Android) | Notification persists, points captured while app is backgrounded | Manual test on Android: start tracking, switch to Chrome for 15 min, return, verify capture count |
| Background tracking (iOS) | Location arrow visible, points captured while app is backgrounded | Manual test on iOS: start tracking, switch to Maps for 15 min, return, verify capture count |
| OS kill recovery (Android) | AlarmManager triggers restart, tracking resumes | Manual test on Android: start tracking, force-stop app in Settings, wait 15 min, open app, verify tracking resumes |

### Acceptance Testing

Per OAC-001/002: 2-hour foreground+background test on:
- **Android stock**: Pixel or Samsung Galaxy (verify ≥80% capture rate)
- **Android aggressive-OEM**: Xiaomi or Oppo (verify ≥80% capture rate with battery optimization exemption)
- **iOS**: Recent iPhone (verify ≥80% capture rate)

### Existing Test Infrastructure

The project has 19 existing test files under `commonTest/`. New tracking tests follow the same patterns:
- `kotlin.test` assertions
- Coroutine test with `runTest`
- Mock implementations for repository verification
- State-driven assertions matching the `TripStateMachineTest` pattern

---

## 14. Backend Gap Register

| Gap ID | Description | Blocks | Mitigation | When Needed |
|--------|-------------|--------|-----------|-------------|
| **LT-G1** | No `POST /trips/{id}/location/batch` endpoint | Real location sync | Mock repository returns `202 Accepted` | Before production release |
| **LT-G2** | No `TripLocationPoint` JPA entity | Server-side storage | Derived contract shapes the entity | Before production release |
| **LT-G3** | No location query API (`GET /trips/{id}/location`) | Ops dashboard (NOT this feature) | Out of scope | Ops feature epic |
| **LT-G4** | No heartbeat / liveness detection | Ops alerting for silent tracking loss | Not MVP | Future enhancement |
| **LT-G5** | No server-side deduplication on `(tripId, clientId)` | Risk of duplicate points on retry | Client `clientId` UUID for intended dedup. Mock ignores dupes. | Before production release |

---

## 15. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **OEM battery kill** — Xiaomi/Oppo/etc. kill ForegroundService despite exemption | Tracking gaps on affected devices | High (these OEMs aggressively kill background processes) | AlarmManager restart. Battery exemption request. OEM detection + diagnostic logging. Documented as known limitation with ≥80% target, not 100%. |
| **iOS significant-location-change granularity** — ~500m resolution after app termination | Low-resolution gap-filling after iOS kills the app | Medium | Used as safety net only. Primary tracking via `startUpdatingLocation` with background mode. |
| **Play Store rejection** — background location permission policy | App rejection or update rejection | Low (purpose is legitimate fleet tracking) | Precise purpose strings. Background location declaration in Play Console. In-app disclosure per Google policy. |
| **SQLDelight migration** — schema changes during development | Data loss if migration not handled | Low | Version migrations in SQLDelight. Buffer is transient data — loss during dev is acceptable. |
| **GPS hardware unavailability** — driver in tunnel, underground, or dense urban canyon | No GPS fix for extended periods | Medium | `SIGNAL_LOST` state + auto-recovery. Diagnostic logging. Points before/after gap are preserved. |
| **Battery drain** — 5-min GPS activation over 12 hours | Driver complaints about battery usage | Medium | 5-min cadence (not continuous). Periodic GPS (wake → fix → sleep). Battery level monitoring in diagnostics. |
| **Mock/Real switching edge cases** — switching data source mid-trip | Inconsistent tracking state | Low | Block data source switching while tracking is active. Toggle is disabled in UI during transit. |

---

## Implementability Summary

### Implementable Now (No Blockers)

- `TrackingStateMachine` (pure logic, commonMain)
- `LocationPermissionState` / `TrackingState` enums
- SQLDelight schema + `LocationBuffer` DAO
- `LocationPoint` domain model expansion
- `TrackingManager` refactor (orchestration logic)
- `TrackingDiagnostics` (local logging)
- All UI: tracking indicator, warning banners, pending sync badge, pre-prompt bottom sheet
- `BatchSyncWorker` (sync logic with connectivity awareness)
- `derived-contracts.md` documentation
- All unit tests (state machine, buffer, sync, manager)

### Implementable with Mock Fallback

- `RealLocationRepository` → uses mock backend (returns `202 Accepted`)
- End-to-end pipeline: capture → buffer → sync → mock API acceptance

### Blocked by Platform Work (Must Be Done)

- Android `ForegroundService` + notification channel
- Android `FusedLocationProviderClient` + permission handling
- Android `AlarmManager` restart + `BootCompletedReceiver`
- Android battery optimization helpers
- iOS `CLLocationManager` + background mode configuration
- iOS `LocationPermissionHandler` (actual)
- iOS app delegate relaunch detection
- iOS significant location change monitoring
- `Info.plist` entries (iOS)
- `AndroidManifest.xml` entries (Android)

### Blocked by Backend Work (Use Mock)

- Real `POST /trips/{id}/location/batch` endpoint
- `TripLocationPoint` JPA entity
- Server-side `(tripId, clientId)` deduplication

### Product Decisions Already Resolved

All product decisions were resolved in the clarification session:
1. ✅ Full background + resilience is MVP
2. ✅ Trip-scoped endpoint is canonical
3. ✅ SQLDelight for offline buffer
4. ✅ Local diagnostics logging only
5. ✅ 2 Android + 1 iOS test device matrix

**No outstanding product decisions block implementation.**
