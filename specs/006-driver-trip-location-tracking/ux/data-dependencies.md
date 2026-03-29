# Data Dependencies — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Date**: 2026-03-29

---

## 1. What Drives Each UX State

Every UX element in this feature is driven by observable data inputs. This document maps each visual element to the data that determines its appearance and behavior.

---

## 2. Tracking Indicator

The header-level tracking indicator is the primary UX element.

| Tracking State (Output) | Data Inputs Required | How They Combine |
|------------------------|---------------------|-----------------|
| **INACTIVE** | `tripSubState` ∈ {DISPATCHED, ACCEPTED, AT_ORIGIN, LOADING, LOADED, EWB_PENDING, AT_DESTINATION, UNLOADING, DELIVERED, POD_SUBMITTED, POD_VERIFIED, SETTLED} | Trip exists but not in transit window. |
| **INACTIVE** (no trip) | `activeTrip == null` | No trip assigned. Indicator not rendered. |
| **AWAITING_PERMISSION** | `tripSubState == DEPARTED` AND `permissionState == NOT_DETERMINED` | Transient: departure just triggered, permission check in progress. |
| **ACTIVE** | `tripSubState` ∈ {DEPARTED, IN_TRANSIT, AT_CHECKPOINT} AND `permissionState ∈ {FOREGROUND_AND_BACKGROUND, BACKGROUND_GRANTED}` AND `gpsSignalAvailable == true` AND `accuracyLevel == FULL` | Full tracking, all systems go. |
| **ACTIVE_DEGRADED** | Same transit states AND (`permissionState == FOREGROUND_ONLY` OR `accuracyLevel == REDUCED`) AND `gpsSignalAvailable == true` | Tracking works but with limitations. |
| **SIGNAL_LOST** | Same transit states AND `permissionState != DENIED` AND `gpsSignalAvailable == false` (for ≥ 2 intervals) | GPS hardware has no fix. |
| **PERMISSION_DENIED** | `tripSubState` ∈ transit states AND `permissionState == DENIED` | No tracking possible. |
| **STOPPED** | Previous tracking state was ACTIVE/ACTIVE_DEGRADED/SIGNAL_LOST AND `tripSubState` transitioned to AT_DESTINATION or later | Tracking was running and has ended. |

### Data Sources

| Data Input | Source | Update Mechanism |
|-----------|--------|-----------------|
| `tripSubState` | Trip ViewModel state (from `GET /trips/{id}` + local state machine) | Reactive (StateFlow → recomposition) |
| `permissionState` | Platform `PermissionHandler` | Checked on: departure trigger, app resume, settings return |
| `gpsSignalAvailable` | Platform `LocationTracker` (last fix age > 2× interval = lost) | Reactive (callback from platform location API) |
| `accuracyLevel` | Platform `LocationTracker` (horizontal accuracy threshold: < 100m = FULL, ≥ 100m = REDUCED) | Reactive |

---

## 3. Permission Pre-Prompt

| UX Element | Show Condition | Data Input |
|-----------|---------------|-----------|
| Pre-prompt bottom sheet | `isFirstDepartureAfterInstall == true` AND `permissionState == NOT_DETERMINED` | `isFirstDepartureAfterInstall`: persisted flag in local preferences. `permissionState`: platform query. |
| "Continue" button | Always shown in pre-prompt | — |
| "Not Now" button | Always shown in pre-prompt | — |

### Data Sources

| Data Input | Source | Persistence |
|-----------|--------|------------|
| `isFirstDepartureAfterInstall` | Local key-value store | Persists across sessions. Set to `false` after first pre-prompt is shown. Reset on app reinstall. |
| `permissionState` | Platform API: `checkSelfPermission()` (Android) / `CLLocationManager.authorizationStatus` (iOS) | Queried live, not cached. |

---

## 4. Warning Banners

| Banner | Show Condition | Data Inputs | Dismiss Logic |
|--------|---------------|------------|---------------|
| Permission denied | `permissionState == DENIED` AND `tripSubState` ∈ transit states | `permissionState`, `tripSubState` | Dismissible. Reappears once per app session (tracked via in-memory flag). |
| Background limited | `permissionState == FOREGROUND_ONLY` AND `tripSubState` ∈ transit states | `permissionState`, `tripSubState` | Dismissible. Does not reappear for this trip (tracked via `tripId` + local flag). |
| Device location off | `deviceLocationEnabled == false` AND `tripSubState` ∈ transit states | `deviceLocationEnabled` (platform API), `tripSubState` | Not dismissible. Auto-clears when `deviceLocationEnabled` becomes `true`. |
| Permission revoked | `previousPermissionState != DENIED` AND `currentPermissionState == DENIED` | `previousPermissionState` (local cache), `currentPermissionState` (live query) | Dismissible. Shown once. |
| GPS signal lost | `gpsSignalAvailable == false` (for ≥ 2 intervals) AND tracking state was ACTIVE | `gpsSignalAvailable`, `lastFixTimestamp` | Not dismissible. Auto-clears when `gpsSignalAvailable` becomes `true`. |
| Reduced accuracy (iOS) | `accuracyAuthorization == REDUCED` AND `tripSubState` ∈ transit states | `accuracyAuthorization` (iOS only) | Dismissible. Does not reappear for this trip. |
| Battery optimization (Android) | `isIgnoringBatteryOptimizations == false` AND `tripSubState` ∈ transit states AND `platform == ANDROID` | `isIgnoringBatteryOptimizations` (Android PowerManager API) | Dismissible. Shown once per trip. |

### Dismiss Tracking

| Scope | Persistence | Reset |
|-------|------------|-------|
| Per app session (in-memory) | `var dismissedThisSession: Boolean` | Reset on app process restart |
| Per trip (local storage) | `Set<String> dismissedBannersForTrip[tripId]` | Cleared when trip exits transit |
| Per install (local storage) | `var prePromptShownOnce: Boolean` | Cleared on reinstall |

---

## 5. Pending Sync Badge

| UX Element | Show Condition | Data Input |
|-----------|---------------|-----------|
| Sync badge (count) | `pendingLocationPointCount > 0` | `pendingLocationPointCount`: count of `LocationPoint` records in local buffer with `syncStatus == PENDING` |
| Badge cleared | `pendingLocationPointCount == 0` | All buffered points synced successfully |

### Data Sources

| Data Input | Source | Update Mechanism |
|-----------|--------|-----------------|
| `pendingLocationPointCount` | Local storage (location buffer table/file) | Reactive: updated on capture (increment) and sync completion (decrement) |

---

## 6. Foreground Notification (Android)

| Notification Field | Data Input | Source |
|-------------------|-----------|--------|
| Trip number placeholder | `trip.tripNumber` | Trip ViewModel |
| Tracking status text | `trackingState` | Tracking state machine |
| Notification visibility | `trackingState != INACTIVE && trackingState != PERMISSION_DENIED` | Tracking state machine |

---

## 7. Data Input Summary (All Unique Inputs)

| # | Data Input | Type | Source | Reactive? |
|---|-----------|------|--------|-----------|
| 1 | `tripSubState` | Enum | Trip ViewModel / State Machine | Yes (StateFlow) |
| 2 | `activeTrip` | Trip? (nullable) | Trip Repository | Yes (StateFlow) |
| 3 | `permissionState` | Enum (NOT_DETERMINED, FOREGROUND_ONLY, FOREGROUND_AND_BACKGROUND, DENIED) | Platform PermissionHandler | Checked on events |
| 4 | `gpsSignalAvailable` | Boolean | Platform LocationTracker | Yes (callback) |
| 5 | `accuracyLevel` | Enum (FULL, REDUCED) | Platform LocationTracker | Yes (callback) |
| 6 | `deviceLocationEnabled` | Boolean | Platform System API | Checked on resume |
| 7 | `isIgnoringBatteryOptimizations` | Boolean | Android PowerManager | Checked on resume |
| 8 | `isFirstDepartureAfterInstall` | Boolean | Local KV store | Checked on departure |
| 9 | `pendingLocationPointCount` | Int | Local buffer storage | Yes (reactive query) |
| 10 | `lastFixTimestamp` | Instant | Platform LocationTracker | Updated on each fix |
| 11 | `trip.tripNumber` | String | Trip ViewModel | Yes (StateFlow) |
| 12 | `previousPermissionState` | Enum | Local cache (updated on each check) | On resume |
| 13 | `accuracyAuthorization` | Enum (FULL, REDUCED) | iOS CLLocationManager | Checked on resume |
