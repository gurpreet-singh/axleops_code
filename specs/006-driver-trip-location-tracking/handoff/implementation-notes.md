# Implementation Notes: Driver Trip Location Tracking

**Feature**: `006-driver-trip-location-tracking`  
**Date**: 2026-03-29  
**Build**: ✅ GREEN (`shared` + `composeApp`)  
**Progress**: 48/52 tasks complete

---

## Complete File Manifest

### Domain Models (Phase 1)
| File | Description |
|------|-------------|
| `domain/repository/LocationRepository.kt` | `LocationPoint` (10 fields), `BatchLogResult`, `LocationRepository` interface |
| `tracking/model/TrackingState.kt` | 7-state enum with `isActive`, `displayLabel` |
| `tracking/model/LocationPermissionState.kt` | 6-state sealed class |
| `tracking/model/TrackingEvent.kt` | 7-event sealed class |
| `tracking/TrackingStateMachine.kt` | Pure state machine, 10 transition methods |

### Permission Handlers (Phase 2–3)
| File | Description |
|------|-------------|
| `platform/LocationPermissionHandler.kt` | Expect class (5 methods) |
| `platform/LocationPermissionHandler.android.kt` | Android actual (Activity result contracts) |
| `platform/LocationPermissionHandler.ios.kt` | iOS actual (CLLocationManager) |
| `tracking/ui/LocationPermissionRationale.kt` | Pre-prompt bottom sheet |
| `tracking/ui/LocationPermissionBanner.kt` | 6 contextual warning variants |

### Offline Buffer (Phase 4)
| File | Description |
|------|-------------|
| `tracking/LocationBuffer.sq` | SQLDelight schema (7 queries) |
| `tracking/data/LocationBufferRepository.kt` | Reactive persistence wrapper |
| `platform/DatabaseDriverFactory.android.kt` | Android SQLite driver |
| `platform/DatabaseDriverFactory.ios.kt` | iOS native SQLite driver |

### Platform Trackers (Phase 5)
| File | Description |
|------|-------------|
| `tracking/LocationTracker.kt` | Interface + MockLocationTracker |
| `tracking/AndroidLocationTracker.kt` | FusedLocationProviderClient + ForegroundService bridge |
| `tracking/IOSLocationTracker.kt` | CLLocationManager + background location |

### Orchestration (Phase 6)
| File | Description |
|------|-------------|
| `tracking/TrackingManager.kt` | Central orchestrator (GPS + buffer + state + sync) |

### Android Background Service (Phase 7)
| File | Location | Description |
|------|----------|-------------|
| `AndroidManifest.xml` | composeApp | Permissions + service + receivers |
| `AxleOpsApplication.kt` | composeApp | Notification channel + trackingModule |
| `LocationTrackingService.kt` | composeApp | ForegroundService with wake lock |
| `TrackingAlarmReceiver.kt` | composeApp | OS kill recovery (15-min alarm) |
| `BootCompletedReceiver.kt` | composeApp | Device reboot recovery |
| `AndroidBatteryHelper.kt` | shared | OEM detection (6 manufacturers) |

### iOS Configuration (Phase 7)
| File | Description |
|------|-------------|
| `Info.plist` | Location usage descriptions + UIBackgroundModes |

### Sync & Endpoint (Phase 9)
| File | Description |
|------|-------------|
| `tracking/sync/BatchSyncWorker.kt` | 3 triggers, exponential backoff |
| `data/repository/RealLocationRepository.kt` | Full Ktor POST to `/trips/{id}/location/batch` |
| `data/repository/MockLocationRepository.kt` | Mock implementation |

### UI Components (Phase 10)
| File | Description |
|------|-------------|
| `tracking/ui/TrackingIndicator.kt` | Pulsing GPS icon with 5 states |
| `tracking/ui/PendingSyncBadge.kt` | Unsynced point count badge |

### Trip Lifecycle Wiring (Phase 11)
| File | Description |
|------|-------------|
| `trip/component/ActiveTripComponent.kt` | TrackingManager injected, auto-start/stop via `shouldTrackGps()` |
| `navigation/driver/DriverScreens.kt` | Factory injection |

### Diagnostics (Phase 12)
| File | Description |
|------|-------------|
| `tracking/diagnostics/TrackingDiagnostics.kt` | 6 metric types, 7-day retention |

### DI (Phase 13)
| File | Description |
|------|-------------|
| `di/TrackingModule.kt` | Full Koin wiring |

### Tests (Phase 15)
| File | Test Cases |
|------|-----------|
| `TrackingStateMachineTest.kt` | 16 tests |
| `BatchSyncWorkerTest.kt` | 8 tests |
| `TrackingManagerTest.kt` | 12 tests |

---

## Status: 52/52 Tasks + 15/15 Fix Round 1 — Build GREEN

All implementation tasks (T001–T052) and all Fix Round 1 tasks (FX-001–FX-015) are complete.

---

## Fix Round 1 — Completed

### Tasks Completed (15/15)

| FX | Issue | Summary | Files Changed |
|----|-------|---------|---------------|
| FX-001 | OI-001 | `SIGNAL_LOST.isActive = true` | `TrackingState.kt` |
| FX-002 | OI-002 | Banner dismiss-state tracking (3 scopes) | `BannerDismissTracker.kt` [NEW], `LocationPermissionBanner.kt` |
| FX-003 | OI-003 | Pre-prompt copy (title + body + 3 bullets) | `LocationPermissionRationale.kt` |
| FX-004 | OI-004 | All 6 banner copies → spec-exact | `LocationPermissionBanner.kt` |
| FX-005 | OI-005 | DeviceLocationOff "Turn On Location" action | `LocationPermissionBanner.kt` |
| FX-006 | OI-006 | PermissionRevokedBanner (distinct from denial) | `LocationPermissionBanner.kt` |
| FX-007 | OI-007 | BatteryOptimizationBanner (new variant) | `LocationPermissionBanner.kt` |
| FX-008 | OI-015 | iOS Info.plist usage descriptions | `Info.plist` |
| FX-009 | OI-008 | Material icons replacing emoji | `LocationPermissionBanner.kt` |
| FX-010 | OI-009 | Theme color tokens replacing hardcoded hex | `LocationPermissionBanner.kt` |
| FX-011 | OI-010 | SIGNAL_LOST → `GpsNotFixed` icon | `TrackingIndicator.kt` |
| FX-012 | OI-011 | Pulse animation → 3s/150ms | `TrackingIndicator.kt` |
| FX-013 | OI-012 | "Not Now" → TextButton | `LocationPermissionRationale.kt` |
| FX-014 | OI-013 | AWAITING_PERMISSION → "GPS Off" | `TrackingState.kt` |
| FX-015 | OI-014 | Android notification state updates | `AndroidLocationTracker.kt`, `LocationTrackingService.kt` |

### Files Changed (9 total)

| File | Layer | Changes |
|------|-------|---------|
| `tracking/model/TrackingState.kt` | Shared | FX-001, FX-014: `isActive`, `displayLabel` |
| `tracking/ui/BannerDismissTracker.kt` | Shared [NEW] | FX-002: 3-scope dismiss tracker |
| `tracking/ui/LocationPermissionRationale.kt` | Shared | FX-003, FX-013: copy, button style |
| `tracking/ui/LocationPermissionBanner.kt` | Shared | FX-004–007, FX-009–010: full rewrite |
| `tracking/ui/TrackingIndicator.kt` | Shared | FX-011, FX-012: icon, pulse animation |
| `tracking/AndroidLocationTracker.kt` | Android | FX-015: `onNotificationUpdate` bridge |
| `service/LocationTrackingService.kt` | Android | FX-015: `ACTION_UPDATE_NOTIFICATION` |
| `iosApp/Info.plist` | iOS | FX-008: usage descriptions |

### Blocked Issues

None. All 15 open issues have been resolved.

### Invariants Preserved

> [!IMPORTANT]
> Verified during fix round:

1. ✅ State machine transitions — all 10 methods unchanged, only `isActive`/`displayLabel` properties modified
2. ✅ Offline buffer integrity — `LocationBufferRepository` untouched
3. ✅ Batch sync triggers — `BatchSyncWorker` untouched
4. ✅ ForegroundService lifecycle — `LocationTrackingService` remains START_STICKY with PARTIAL_WAKE_LOCK
5. ✅ iOS background properties — `IOSLocationTracker` untouched
6. ✅ Permission non-blocking — no trip-blocking logic added
7. ✅ Active Trip boundary — no new screens or routes
8. ✅ Build passes — `shared:compileDebugKotlinAndroid` + `composeApp:compileDebugKotlinAndroid`

### Post-Fix: What Must Be Re-Checked

**Design Review Re-Check** (DR Round 2):
- DR-001/002/003: Pre-prompt title + body + bullets (FX-003)
- DR-004: "Not Now" button style (FX-013)
- DR-005: AWAITING_PERMISSION label (FX-014)
- DR-006: SIGNAL_LOST.isActive logic (FX-001)
- DR-007: All 6 banner copies (FX-004)
- DR-008: Emoji → Material icons (FX-009)
- DR-009: Hardcoded colors → theme tokens (FX-010)
- DR-010: Battery optimization banner (FX-007)
- DR-011: SIGNAL_LOST icon (FX-011)
- DR-012: Pulse animation timing (FX-012)
- DR-013: Banner dismiss tracking (FX-002)
- DR-014: Device location off action button (FX-005)

**QA Re-Check**:
- QA items QA-002, QA-018, QA-029, QA-030, QA-033–QA-040, QA-051, QA-098–QA-103
- QA items QA-110 through QA-119 (deferred design review verification)

### Remaining Platform/Backend Risks

1. **Backend**: `POST /trips/{id}/location/batch` endpoint (LT-G1) must be deployed before production — currently mock-backed
2. **Physical device testing**: Battery optimization banner (FX-007) needs testing on Xiaomi/Oppo/Samsung devices
3. **iOS App Store**: Updated Info.plist descriptions (FX-008) should be reviewed by App Store reviewer for compliance
4. **Notification update wiring**: FX-015 provides the mechanism (`ACTION_UPDATE_NOTIFICATION`) but the `onNotificationUpdate` bridge callback must be wired in the app initialization layer when `AndroidLocationTracker` is switched from mock to real

---

## Verify

```bash
cd /Users/ankit/a/fleetly/axleops_code/mobile
./gradlew :shared:compileDebugKotlinAndroid :composeApp:compileDebugKotlinAndroid
```
