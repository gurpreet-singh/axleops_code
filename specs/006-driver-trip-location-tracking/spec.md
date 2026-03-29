# Feature Specification: Driver Trip Location Tracking & Background Telemetry

**Feature Branch**: `006-driver-trip-location-tracking`  
**Created**: 2026-03-29  
**Status**: Draft  
**Target Role**: Driver  
**Depends On**: specs/005-driver-active-trip, specs/004-driver-auth-session, specs/003-mobile-foundation  
**Input**: User description: "Driver Trip Location Tracking & Background Telemetry — production-grade location tracking, permissions, background telemetry, offline buffering, platform-specific lifecycle, and privacy for the Driver role."

---

## Clarifications

### Session 2026-03-29

- Q: Is foreground-only tracking sufficient for first production release, or must background + resilience ship in MVP? → A: Full background + resilience is MVP. All 3 phases (foreground, background, OEM resilience) ship as one release.
- Q: Is the API contract trip-scoped (`POST /trips/{id}/location/batch`) or standalone (`POST /location/log`)? → A: Trip-scoped is canonical. 005's `POST /location/log` is superseded.
- Q: What local storage mechanism for the offline location buffer? → A: SQLite via SQLDelight — structured, queryable, KMP-native, supports reactive queries for pending sync badge.
- Q: What level of tracking health observability is required for MVP? → A: Local diagnostics logging only. Structured on-device logs exportable via debug tooling. No backend diagnostic endpoint.
- Q: What constitutes a "representative device" for OAC-001/002 acceptance testing? → A: 2 Android devices (1 stock/near-stock e.g. Pixel/Samsung, 1 aggressive-OEM e.g. Xiaomi/Oppo) + 1 iOS device.

---

## 1. Product Goal

### Why Trip Location Tracking Exists

Fleet operators today have **zero real-time visibility** into where their vehicles are during transit. Dispatchers rely on phone calls, WhatsApp messages, and driver self-reporting to determine trip progress. This creates:

- **SLA monitoring gaps** — operators cannot determine whether a trip is on schedule until it's already late.
- **Audit trail holes** — regulatory and client compliance requires demonstrable proof that goods were transported along a specific corridor at specific times.
- **Exception response delays** — breakdowns, route deviations, and unauthorized halts go undetected for hours.
- **Driver accountability gaps** — without objective location data, disputes about trip timing, routes taken, and halt duration are unresolvable.

### What Operational Value It Provides

- **Continuous trip trace** — a timestamped breadcrumb trail of the vehicle's position during transit, usable for audit, SLA evaluation, and dispute resolution.
- **Near-real-time fleet visibility** — operations can observe active trip positions on their dashboards (consumed by a separate ops feature).
- **Exception detection foundation** — prolonged halts, route deviation, and geo-fence events can be derived from location data in future features.
- **Client transparency** — clients who require location proof (e.g., cargo tracking, insurance claims) receive objective GPS evidence.

### What Problems It Solves in Trip Execution

| Problem | How Location Tracking Solves It |
|---------|--------------------------------|
| "Where is the vehicle right now?" | Last-known location available to operations within the tracking interval window. |
| "Did the driver follow the designated route?" | GPS breadcrumb trail can be compared against the planned route. |
| "How long did the vehicle halt at the toll / fuel pump?" | Halt detection from stationary GPS readings over time. |
| "Was the vehicle actually at the loading/unloading point?" | Geo-coordinate match against known origin/destination. |
| "Can we prove transit timing for the SLA claim?" | Timestamped location log serves as objective evidence. |

---

## 2. Role and Scope

### Target Role

**Driver** is the only supported role for location tracking in v1. The driver is the data producer — the app captures GPS from the driver's device during an active trip.

### Indirect Consumers (Out of Scope for This Spec)

| Consumer Role | How They Use Location Data | Spec Coverage |
|--------------|--------------------------|---------------|
| **Operations Executive / Fleet Manager** | View trip positions on a live map dashboard | Separate ops feature (not this spec) |
| **Compliance Manager** | Audit trail of vehicle positions for regulatory proof | Backend data consumption (not this spec) |
| **Client (via API/portal)** | Cargo tracking, SLA proof | Future client-facing feature (not this spec) |
| **Auditor** | GPS-vs-route reconciliation for expense verification | Backend analytics (not this spec) |

### Explicit Out-of-Scope Items

- ❌ **Operations-side real-time tracking dashboard** — this spec covers data capture on the driver device. Display to other roles is a separate feature.
- ❌ **Route deviation detection / geo-fence alerting** — future enhancement built on top of location data.
- ❌ **Real-time push of driver position to other clients** — future WebSocket/SSE feature.
- ❌ **Live ETA calculation based on GPS** — future enhancement.
- ❌ **High-frequency tracking (< 1 min intervals)** — not required for v1 fleet visibility. 5-minute cadence is the baseline.
- ❌ **Tracking outside of active trip context** — the app does NOT track the driver when no trip is active.
- ❌ **Non-driver roles producing location data** — operations/admin roles do not generate location telemetry.
- ❌ **Historical trip replay animation** — a consumer feature built on stored location data, not this spec.
- ❌ **Telematics / OBD integration** — vehicle telematics is a separate data source (see product.md Vehicle Detail → Telematics tab).

---

## 3. Tracking Modes

### 3.1 Foreground Tracking

**Definition**: GPS capture while the AxleOps app is visible on-screen and in the foreground process.

| Aspect | Behavior |
|--------|----------|
| **When active** | Trip is in an IN_TRANSIT sub-state (DEPARTED through AT_DESTINATION — exclusive of AT_DESTINATION itself) and the app is in the foreground. |
| **Accuracy** | High-accuracy (fine location). |
| **Cadence** | A location point is captured every 5 minutes (±30 seconds). |
| **UI indication** | A visible tracking indicator is shown in the trip detail header (e.g., pulsing GPS icon). |
| **Permission required** | Foreground location permission ("When In Use"). |

### 3.2 Background Tracking

**Definition**: GPS capture continues when the app moves to the background (driver switches to a navigation app, takes a call, or locks the screen).

| Aspect | Behavior |
|--------|----------|
| **When active** | Same trip state conditions as foreground tracking, but the app process is in the background. |
| **Accuracy** | Best available accuracy from the platform while respecting background restrictions. May degrade to ~100m on some devices. |
| **Cadence** | Target: 5 minutes (±30 seconds). Actual cadence may be influenced by OS power management. |
| **UI indication** | Android: persistent foreground notification. iOS: location arrow in status bar. |
| **Permission required** | Background location permission ("Always" / background location access). |

### 3.3 Tracking Lifecycle Rules

| Trip Sub-State | Tracking | Rationale |
|---------------|----------|-----------|
| DISPATCHED | ❌ Not tracking | Trip not yet accepted. No operational need. |
| ACCEPTED | ❌ Not tracking | Driver has accepted but not departed. Vehicle may still be at depot. |
| AT_ORIGIN | ❌ Not tracking | Driver at loading point. Position is known (origin location). |
| LOADING | ❌ Not tracking | Static position at loading dock. |
| LOADED | ❌ Not tracking | Static, awaiting departure. |
| EWB_PENDING | ❌ Not tracking | Blocked by E-Way Bill. Vehicle should not move. |
| **DEPARTED** | ✅ **Tracking starts** | Vehicle begins transit. This is the trigger point. |
| **IN_TRANSIT** | ✅ **Tracking active** | Vehicle in transit. Core tracking window. |
| **AT_CHECKPOINT** | ✅ **Tracking active** | Vehicle at an en-route checkpoint. Still in transit corridor. |
| **AT_DESTINATION** | ❌ **Tracking stops** | Vehicle arrived at delivery point. Position is known (destination location). |
| UNLOADING | ❌ Not tracking | Static at delivery dock. |
| DELIVERED | ❌ Not tracking | Delivery complete. |
| POD_SUBMITTED | ❌ Not tracking | Trip closing out. |
| Any exception state (VEHICLE_BREAKDOWN, etc.) | ⏸️ **Tracking continues** | The vehicle may be stopped, but location data during exceptions is valuable for audit (towing location, breakdown site, etc.). Tracking does NOT pause for exceptions. |

**Start Trigger**: Trip transitions from LOADED → DEPARTED (or equivalent departure event).  
**Stop Trigger**: Trip transitions to AT_DESTINATION (or any post-transit state).  
**Resume on Relaunch**: If the app is killed and relaunched, tracking MUST resume automatically if the trip is still in an IN_TRANSIT-family state (DEPARTED, IN_TRANSIT, AT_CHECKPOINT, or an exception state during transit).

### 3.4 Outside Active Trip Context

When the driver has **no active trip**, or the active trip is in a **non-tracking state** (DISPATCHED through LOADED, or AT_DESTINATION through SETTLED):

- No location tracking occurs.
- No location permissions are requested.
- No foreground service/notification is shown.
- No GPS hardware is activated by the app.

---

## 4. Permissions and Consent UX

### 4.1 Android Permission Flow

Android location permissions are **multi-step** (Android 10+ / API 29+):

| Step | Permission | When Requested | Rationale Shown to Driver |
|------|-----------|---------------|--------------------------|
| 1 | `ACCESS_FINE_LOCATION` (foreground) | When the trip transitions to DEPARTED for the first time. | "AxleOps needs your location to track the trip. This helps fleet operations monitor delivery progress and ensures audit compliance." |
| 2 | `ACCESS_BACKGROUND_LOCATION` (background) | Immediately after foreground permission is granted. Shown only once per install. | "Allow AxleOps to access your location in the background? This keeps trip tracking active when you switch to other apps or lock your screen during transit." |

**Denied handling — Android:**

| Scenario | Behavior |
|----------|----------|
| Foreground location denied | Warning banner: "Location tracking unavailable. Trip can continue without GPS." Trip proceeds — GPS is a warning, not a hard block (per trip.md). |
| Foreground granted, background denied | Foreground tracking works. Background tracking is limited. Warning: "Background tracking is limited. Location updates may stop when you switch apps." |
| "Don't ask again" selected | App detects `shouldShowRequestPermissionRationale() == false`. Shows a persistent banner: "Location permission is permanently denied. To enable tracking, go to Settings." with a "Go to Settings" button that opens the app's system permission settings. |
| Permission revoked from system Settings while tracking is active | Tracking stops gracefully. On next app resume, the tracking indicator updates to inactive. A warning banner is shown: "Location permission was removed. Tracking has stopped." |

### 4.2 iOS Permission Flow

iOS location permissions are **progressive** (request "When In Use" first, then "Always"):

| Step | Permission | When Requested | Rationale (Info.plist key) |
|------|-----------|---------------|--------------------------|
| 1 | When In Use (`NSLocationWhenInUseUsageDescription`) | When the trip transitions to DEPARTED for the first time. | "AxleOps uses your location during active trips to log the vehicle position for fleet operations and audit compliance." |
| 2 | Always (`NSLocationAlwaysAndWhenInUseUsageDescription`) | After granting "When In Use", the system may show the "upgrade to Always" prompt. The app requests this immediately after foreground is granted. | "AxleOps uses your location in the background to continue trip tracking when the app is not in the foreground. This ensures trip data is captured during navigation or phone calls." |

**Denied handling — iOS:**

| Scenario | Behavior |
|----------|----------|
| Location permission denied | Warning banner: "Location tracking unavailable. Trip can continue without GPS." Trip proceeds. |
| "When In Use" granted, "Always" denied | Foreground tracking works. Background tracking will not function. Warning: "Background tracking unavailable. Location may not be recorded when you leave the app." |
| Permission set to "While Using" in Settings after granting "Always" | Background tracking stops. On next app foreground, warning shown: "Background tracking has been restricted. Location updates may stop when you switch apps." |
| Provisional/reduced accuracy chosen | App detects reduced accuracy. Warning: "Approximate location only. Trip tracking may be less accurate." Tracking continues with available accuracy. |

### 4.3 Core Permission UX Principles

1. **Never request at app launch.** Location permissions MUST be requested only when contextually relevant — at the point of trip departure.
2. **Never block the trip.** If location permissions are denied, the trip MUST continue. GPS is a warning-level concern, not a blocking requirement (per trip.md milestone rules).
3. **Show clear rationale.** Before the system permission dialog, a pre-prompt explanation screen/bottom sheet MUST explain why location access is needed and what happens if denied.
4. **Respect user choice.** If the driver denies permission, do not repeatedly nag. Show a persistent (dismissible) status indicator and a single "Enable in Settings" affordance.
5. **Handle revocation gracefully.** If permission is revoked while tracking is active, stop tracking cleanly — no crashes, no orphan notifications, no silent failures.

---

## 5. Driver-Facing Behavior

### 5.1 Tracking Status Visibility

The driver MUST be able to see the current tracking status at all times during an active trip. Tracking status is embedded in the Active Trip detail screen, not a separate screen.

| Tracking State | Visual Indicator | Location |
|---------------|-----------------|----------|
| **Tracking active** | Pulsing green GPS icon with "Tracking" label | Trip detail header bar |
| **Tracking inactive (non-transit state)** | Gray GPS icon with "GPS Off" label | Trip detail header bar |
| **Tracking failed (permission denied)** | Yellow warning GPS icon with "No GPS Permission" label | Trip detail header bar + inline warning banner |
| **Tracking degraded (low accuracy / background limited)** | Yellow GPS icon with "Limited GPS" label | Trip detail header bar |
| **GPS signal lost (hardware-level)** | Red GPS icon with "No Signal" label | Trip detail header bar |

### 5.2 Warning / Indicator States

| Condition | Warning Type | UX Treatment |
|-----------|-------------|-------------|
| Location permission denied (foreground) | Persistent banner | Yellow banner at top of trip detail: "Location tracking is off. [Enable in Settings]". Dismissible but reappears on each app launch if permission remains denied. |
| Background permission denied | Inline notice | Subtle notice below tracking indicator: "Background tracking limited. Location may not be recorded when you switch apps." |
| GPS hardware disabled (device-level) | Persistent banner | "Your device location is turned off. [Turn On Location]" with a system settings shortcut. |
| Battery saver / power restriction active | Transient notice | Shown once per trip: "Battery optimization may affect location tracking. [Learn More]" — links to device-specific instructions. |
| GPS signal lost for > 10 minutes | Status change | GPS icon turns red. Label updates to "GPS signal lost since [time]". Returns to green when signal is re-acquired. |
| Location data pending sync (offline) | Badge indicator | Small badge on tracking indicator: "[N] locations pending sync". Cleared when connectivity returns and sync completes. |

### 5.3 What the Driver CANNOT Do

- The driver CANNOT manually start or stop tracking. Tracking is **automatic** based on trip state transitions. There is no "start tracking" or "stop tracking" button.
- The driver CANNOT change the tracking interval or accuracy settings.
- The driver CANNOT disable tracking for a specific trip while keeping the trip active.
- The driver CANNOT view the detailed location log (raw coordinates). They see only the status indicator.

---

## 6. Background Behavior

### 6.1 Product Expectation for Background Continuity

The fleet operator expects **uninterrupted location capture** during the transit phase. A driver on a 12-hour Mumbai-to-Delhi trip may background the app for 10+ hours while using Google Maps for navigation. During this entire period, the system MUST continue logging GPS coordinates.

### 6.2 Reliability Expectations

| Metric | Target | Acceptable for MVP |
|--------|--------|--------------------|
| Location capture rate during transit | ≥ 95% of expected data points (1 per 5 min) | ≥ 80% capture rate |
| Maximum gap between data points | ≤ 15 minutes (3× interval) | ≤ 30 minutes (6× interval) before flagging a warning |
| Resume after app relaunch (killed by OS) | Tracking resumes within 30 seconds of relaunch | Tracking resumes within 60 seconds |
| Data loss rate (points captured but never synced) | 0% (no silent drops) | 0% |

### 6.3 Battery / Privacy / UX Tradeoffs

| Concern | Approach |
|---------|----------|
| **Battery drain** | 5-minute interval is a moderate cadence. GPS hardware is activated briefly every 5 minutes, not continuously. Acceptable drain for a 12-hour trip is ~5-8% battery attributable to tracking (will vary by device). |
| **Privacy** | Tracking is ONLY active during transit. No tracking outside active trip. Driver is informed via notification (Android) and status bar icon (iOS). |
| **Notification annoyance (Android)** | The foreground notification is required by Android. Content should be informative and non-alarming: "Trip TRP-2024-0142 in progress. Location tracking active." |
| **Background kill (OEM-specific)** | Xiaomi, Samsung, Oppo, and other OEMs aggressively kill background processes. The app SHOULD request battery optimization exemption where possible. This is a known limitation — the gap is documented as a risk, not a blocker. |

### 6.4 MVP Scope: Full Background + Resilience

> **Clarification (2026-03-29)**: All 3 phases ship as a single MVP release. There is no phased rollout for tracking capability.

| Capability | MVP (v1) | Future Enhancements |
|-----------|---------|-----------|
| Foreground tracking | ✅ Required | — |
| Background tracking (standard) | ✅ Required | — |
| Background tracking after OS kill | ✅ Required — auto-restart via AlarmManager (Android) / significant location change (iOS) | — |
| OEM battery optimization bypass | ✅ Required — request exemption + OEM-specific handling for top 5 Android manufacturers (Xiaomi, Samsung, Oppo, Realme, Vivo) | Expand to additional OEMs as field data identifies gaps |
| Heart-beat / liveness check | ❌ Not required for MVP | ✅ Backend detects missing pings and alerts operations |
| Geofence-triggered events | ❌ Not required for MVP | ✅ Auto-log arrival/departure at known locations |

### 6.5 Resilience Requirements

Since all tracking phases ship together, the following resilience behaviors are **MVP requirements**, not stretch goals:

1. **Auto-restart after OS kill**: On Android, use AlarmManager or equivalent to re-trigger the foreground service. On iOS, use `startMonitoringSignificantLocationChanges()` to relaunch the app.
2. **OEM battery optimization exemption**: Request `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` and provide device-specific guidance for the top 5 OEMs.
3. **Gap detection**: If tracking resumes after an OS kill, the first captured point MUST include a `TRACKING_RESUMED` event with the gap duration.
4. **Continuous operation**: The tracking system MUST function reliably across foreground, background, and post-kill states as a single integrated capability.

---

## 7. Data and Telemetry Behavior

### 7.1 What Location Data Must Be Captured

Each location data point MUST include:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `latitude` | Double | WGS84 latitude | Yes |
| `longitude` | Double | WGS84 longitude | Yes |
| `accuracy` | Double | Horizontal accuracy in meters | Yes |
| `timestamp` | ISO-8601 / epoch ms | Time of GPS fix (device clock) | Yes |
| `speed` | Double | Speed in m/s at time of fix (if available from platform) | Optional |
| `bearing` | Double | Heading in degrees (if available from platform) | Optional |
| `altitude` | Double | Altitude in meters above sea level (if available) | Optional |
| `provider` | String | Location source: GPS, Network, Fused, Passive | Optional |
| `batteryLevel` | Int | Device battery percentage at time of capture | Optional (useful for diagnostics) |

### 7.2 Cadence Expectations

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Capture interval** | Every 5 minutes (±30 seconds) | Sufficient for fleet visibility and audit. Balances battery vs resolution. |
| **Batch submission interval** | Every 15 minutes OR when 3+ points have accumulated | Reduces network requests. Groups 3 data points per API call. |
| **Batch size limit** | Maximum 50 points per API call | Prevents overly large payloads from offline buffer flushes. |

### 7.3 Event Types

Beyond periodic location points, the following **state-linked events** MUST be captured:

| Event Type | When Captured | Additional Data |
|------------|--------------|-----------------|
| `TRACKING_STARTED` | Tracking begins (trip enters DEPARTED) | tripId, initial GPS fix |
| `TRACKING_STOPPED` | Tracking ends (trip exits transit) | tripId, final GPS fix, reason (trip_state_change / permission_revoked / error) |
| `GPS_SIGNAL_LOST` | GPS hardware reports no fix for > 2 consecutive intervals | Last known position, duration of loss |
| `GPS_SIGNAL_RESTORED` | GPS fix re-acquired after a signal loss event | New position, gap duration |
| `BATCH_SYNCED` | A batch of location points is successfully sent to backend | Point count, batch ID |
| `BATCH_FAILED` | A batch submission fails | Error type, retry count, point count retained |

### 7.4 Offline Buffering

| Requirement | Behavior |
|-------------|----------|
| **Local storage** | Location points MUST be persisted to a local SQLite database (via SQLDelight) immediately upon capture. Data MUST survive app kill. SQLDelight provides reactive count queries for the pending sync badge and transactional batch operations for reliable sync-then-delete. |
| **Buffer capacity** | The local buffer MUST support at least 24 hours of location data at the default interval (288 points). |
| **Sync on reconnect** | When connectivity is restored, all buffered points MUST be synced to the backend in chronological order. |
| **No silent drops** | If a point is captured, it MUST eventually be sent to the backend. The only acceptable data loss scenario is device factory reset or app uninstall. |
| **Deduplication** | Each point MUST have a client-generated UUID to prevent duplicate ingestion on retry. |

### 7.5 Retry / Sync Behavior

| Scenario | Behavior |
|----------|----------|
| Batch submission fails (network error) | Retry with exponential backoff: 30s → 1min → 2min → 5min → 10min cap. Points remain in local buffer. |
| Batch submission fails (server error 5xx) | Same exponential backoff. |
| Batch submission fails (client error 4xx, non-auth) | Log error. Retry once. If still failing, mark batch as "needs review" in local storage. Do not drop. |
| Batch submission fails (401 unauthorized) | Stop retrying. Session has expired. Points remain in buffer. Resume sync after re-authentication. |
| App relaunched with buffered data | Immediately attempt to flush buffer before starting new capture. |
| Buffer exceeds 24 hours | Continue capturing. Oldest points are NOT evicted — the buffer grows. Warn in local diagnostics. |

### 7.6 Tracking Health Diagnostics

> **Clarification (2026-03-29)**: MVP includes local diagnostics logging only. No backend diagnostic endpoint.

The tracking system MUST log structured health metrics locally for debugging and QA support:

| Metric | What Is Logged | Storage |
|--------|---------------|--------|
| **Capture success rate** | Number of successful vs attempted GPS fixes per session | Local log |
| **Gap count** | Number of gaps exceeding 2× interval (10 minutes) per session | Local log |
| **Longest gap** | Maximum time between consecutive successful captures | Local log |
| **Battery level trend** | Battery level at tracking start, every 30 minutes, and at stop | Local log |
| **OS kill events** | Timestamp and last-known state when tracking was interrupted by OS | Local log |
| **Permission state changes** | Any permission grant/revoke events during tracking | Local log |

**Export mechanism**: Local diagnostics logs are accessible via the existing QA/debug settings panel. Logs can be exported as a text file for field support analysis. No backend transmission of diagnostics in MVP.

---

## 8. Backend / API Implications

### 8.1 What Seems Supportable Today

| Capability | Backend Status | Source |
|-----------|---------------|--------|
| Trip entity with driver FK | ✅ Exists | `Trip.java` — `driver` field (FK → Contact) |
| Trip status field | ✅ Exists | `Trip.java` — `status` (String) |
| Trip CRUD endpoints | ✅ Exists | `GET /trips`, `GET /trips/{id}` |
| Auth / JWT session | ✅ Exists | JWT + Redis, 24h TTL |

### 8.2 What Likely Requires New Backend Support

| Capability | What's Needed | Priority |
|-----------|--------------|----------|
| **Location ingestion endpoint** | `POST /trips/{id}/location/batch` — accepts an array of GPS points for a given trip. | High — required for real backend integration. |
| **Location persistence** | A `TripLocationPoint` entity (or equivalent) in the backend: trip FK, lat, lng, accuracy, timestamp, clientId (UUID for dedup), speed, bearing, altitude, provider. | High — no existing entity. |
| **Location query endpoint** | `GET /trips/{id}/location?from=&to=` — for operations to view the breadcrumb trail. | Medium — needed for ops dashboard, not for this driver spec. |
| **Last-known location** | `GET /trips/{id}/location/latest` — for operations to get the most recent position. | Medium — useful for ops but not required for driver-side. |
| **Location data retention policy** | How long are raw GPS points stored? Archival strategy. | Low — not needed for MVP. |

### 8.3 What Can Be Mocked Locally

| Contract | Mock Behavior | Closest Sensible Contract |
|----------|--------------|--------------------------|
| `POST /trips/{id}/location/batch` | Mock accepts the payload and returns `202 Accepted`. Logs the point count. Does not persist. | Request body: `{ "points": [{ "clientId": "uuid", "latitude": 19.07, "longitude": 72.87, "accuracy": 10.0, "timestamp": "2026-03-29T10:00:00Z", "speed": 16.5, "bearing": 45.0, "altitude": 25.0, "provider": "GPS", "batteryLevel": 72 }] }` <br> Response: `202 Accepted` with `{ "accepted": 3, "duplicates": 0 }` |
| Trip state query (is trip in transit?) | Derived from existing `GET /trips/{id}` with status field. | No new endpoint needed — mobile reads the trip status. |

### 8.4 Backend Gap Register

| Gap ID | Description | Dependency | Mitigation |
|--------|-------------|-----------|------------|
| **LT-G1** | **No location ingestion endpoint.** The canonical contract is `POST /trips/{id}/location/batch` (trip-scoped). The earlier `POST /location/log` from specs/005 is superseded. | Blocks real location sync. | Mock-backed initially. Backend needs a `TripLocationPoint` entity and ingestion controller scoped to the trip resource path. |
| **LT-G2** | **No `TripLocationPoint` entity.** No JPA entity for persisting individual GPS points. | Blocks server-side storage. | Define entity shape in derived contract. Mock locally. |
| **LT-G3** | **No location query API.** No way for operations to retrieve the breadcrumb trail. | Does NOT block driver-side spec. Blocks ops dashboard. | Out of scope for this spec. Document for ops feature. |
| **LT-G4** | **No heartbeat / liveness detection.** Backend cannot detect if a driver's tracking has silently stopped (e.g., device died). | Blocks operations alerting for "driver went dark". | Future enhancement. Not MVP. |
| **LT-G5** | **No server-side deduplication.** If the same batch is submitted twice (retry after ambiguous response), backend may store duplicates. | Risk of inflated location logs. | Client sends a `clientId` UUID per point. Backend SHOULD deduplicate on `(tripId, clientId)`. Mock ignores duplicates. |

---

## 9. Platform Constraints

### 9.1 Android-Specific Concerns

| Concern | Detail | Impact |
|---------|--------|--------|
| **Foreground service requirement** (Android 8+) | Background location capture requires a `ForegroundService` with a persistent notification. Without this, the app is killed within minutes. | MUST implement `ForegroundService` with type `location`. Notification channel required. |
| **Background location permission** (Android 10+) | `ACCESS_BACKGROUND_LOCATION` is a separate runtime permission, requested AFTER foreground location is granted. Play Store requires a separate rationale. | MUST request in a two-step flow. MUST comply with Play Store background location policy. |
| **Android 12+ foreground service restrictions** | Foreground services started from the background have restrictions. Must be started while the app is in the foreground (or via an exemption). | Start the foreground service when the trip DEPARTS (user-initiated action = app is in foreground). |
| **Battery optimization / Doze** | OEMs (Xiaomi MIUI, Samsung OneUI, Oppo ColorOS, Realme) aggressively kill background services. | Request battery optimization exemption via `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Show OEM-specific guidance if tracking gaps are detected. |
| **AlarmManager vs WorkManager** | `AlarmManager` exact alarms are restricted on Android 12+. `WorkManager` has minimum 15-min repeat constraint. ForegroundService with internal timer is the pragmatic approach. | Use ForegroundService with a coroutine-based timer for 5-min intervals. |

### 9.2 iOS-Specific Concerns

| Concern | Detail | Impact |
|---------|--------|--------|
| **Background location modes** | Requires `UIBackgroundModes: location` in Info.plist. Without this, app suspension stops location updates. | MUST configure background mode in Xcode project. |
| **Always vs When In Use** | iOS 13+ provides a provisional "Allow Once" option and a "While Using" option. "Always" is shown as a subsequent prompt. | Request `requestAlwaysAuthorization()` after user grants "When In Use". iOS auto-shows the upgrade prompt. |
| **Accuracy reduction** (iOS 14+) | Users can choose "Approximate Location" (~5km radius). | Detect `accuracyAuthorization == .reducedAccuracy`. Show warning: "Approximate location only." Tracking continues but data quality is degraded. |
| **Background app refresh** | If disabled in iOS Settings, background location updates may be throttled. | Background location updates with `allowsBackgroundLocationUpdates = true` still function independently of Background App Refresh. |
| **Significant location change monitoring** | As a fallback when the app is terminated, `startMonitoringSignificantLocationChanges()` can re-launch the app. Resolution is ~500m. | Use as a fallback safety net. Not primary tracking mechanism. |
| **App Store review** | Apple requires a "Purpose String" explaining why background location is needed. Vague descriptions may cause rejection. | Craft precise, user-centric purpose strings. |

### 9.3 Shared vs Platform-Specific Logic

| Layer | Shared (commonMain) | Platform-Specific (androidMain / iosMain) |
|-------|---------------------|------------------------------------------|
| **Tracking orchestration** | ✅ `TrackingManager` — start/stop/flush, interval timing, buffer management, state coordination | |
| **Location data model** | ✅ `LocationPoint`, `TrackingEvent` data classes | |
| **Batch submission** | ✅ `LocationRepository` (interface + mock + real) | |
| **Offline buffer** | ✅ Local persistence via shared storage API | |
| **GPS capture** | | ✅ Android: `FusedLocationProviderClient`. iOS: `CLLocationManager`. |
| **Permission requesting** | | ✅ Android: `ActivityResultContracts`. iOS: `CLLocationManager.requestAuthorization()`. |
| **Background process** | | ✅ Android: `ForegroundService`. iOS: `allowsBackgroundLocationUpdates`. |
| **Notification** | | ✅ Android: `NotificationCompat.Builder` for foreground service. iOS: not required. |
| **Battery optimization** | | ✅ Android: `PowerManager.isIgnoringBatteryOptimizations()`. iOS: N/A. |

---

## 10. Technical Strategy Considerations

### 10.1 Library vs Custom Implementation

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Custom platform implementation** (FusedLocationProvider / CLLocationManager directly) | Full control, no external dependency, can be tuned precisely. | Requires platform-specific expertise. More code to maintain. | ✅ **Recommended for v1.** Keep it simple, auditable, and under full control. |
| **KMP location library** (e.g., compass-geolocation, moko-geo) | Cross-platform abstraction, less platform code. | May not support foreground services, background location, or permission flows adequately. Less control over battery optimization. | ⚠️ Evaluate during planning. May be suitable for foreground-only. |
| **Third-party tracking SDK** (e.g., HyperTrack, Radar, Roam.ai) | Feature-rich, battle-tested, handles OEM quirks. | External dependency, licensing cost, data goes through third-party servers, privacy concerns for fleet operations. | ❌ Not recommended. Data sovereignty and cost concerns. |

**Decision point for planning**: This spec recommends custom platform implementation. The planning phase SHOULD evaluate whether a KMP location library provides sufficient foreground+background support. If so, it may be used for the shared abstraction while keeping platform-specific background mechanisms custom.

### 10.2 Rollout Strategy

> **Clarification (2026-03-29)**: All tracking capabilities ship as a single MVP release. The phases below describe **implementation sequencing**, not separate releases.

| Implementation Sequence | Scope | What It Covers |
|------------------------|-------|---------------|
| **Sequence 1: Foreground + Permission Flow** | Foreground location capture with proper permission handling. | Real GPS capture (not mock). Permission request at departure. Tracking indicator in UI. Location buffering and batch sync. |
| **Sequence 2: Background Tracking** | Background location capture with foreground service (Android) and background mode (iOS). | Persistent notification (Android). Background updates (iOS). Resume on relaunch. |
| **Sequence 3: Resilience & OEM Handling** | OEM-specific handling, auto-restart, gap detection. | OEM battery optimization bypass for top 5 manufacturers. Auto-restart after OS kill. Gap event logging. |

**All three sequences ship together in a single release.** Implementation may proceed sequentially for development convenience, but no partial release is planned.

### 10.3 Mock-First vs Real-First

| Layer | Mock-First | Real-First | Recommendation |
|-------|-----------|-----------|----------------|
| **GPS capture** | ❌ Must be real for Phase 1 | ✅ Real platform GPS from day 1 | **Real-first.** Mock GPS (returning Mumbai coordinates) is already implemented. This spec's purpose is to replace it with real GPS. |
| **Permission handling** | ❌ Must be real for Phase 1 | ✅ Real permission flows from day 1 | **Real-first.** Cannot test permissions with mocks. |
| **Backend submission** | ✅ Mock-backed initially | Real when backend endpoint exists | **Mock-first.** Backend `POST /trips/{id}/location/batch` does not exist yet. Use mock repository. |
| **Offline buffer** | ✅ Start with in-memory, move to persistent | Real persistent storage preferred | **Real-first.** Use platform-appropriate local storage from the start to avoid data loss during development/testing. |

### 10.4 What Should Be Decided in This Spec vs Deferred to Planning

| Decision | This Spec | Deferred to Planning |
|----------|----------|---------------------|
| When tracking starts/stops | ✅ Defined (§3.3) | |
| Permission timing and UX | ✅ Defined (§4) | |
| Data model (what fields to capture) | ✅ Defined (§7.1) | |
| Cadence and batching | ✅ Defined (§7.2) | |
| Offline buffering requirements | ✅ Defined (§7.4) | |
| Backend contract shape | ✅ Defined (§8.3) | |
| Specific library/SDK choice | | ✅ Planning evaluates |
| ForegroundService implementation details | | ✅ Planning designs |
| iOS CLLocationManager configuration | | ✅ Planning designs |
| Local storage mechanism (SQLite/file/KV) | ✅ SQLDelight (clarified 2026-03-29) | |
| OEM-specific battery optimization handling | | ✅ Planning/Phase 3 |

---

## 11. Privacy / Trust / Compliance Considerations

### 11.1 How Tracking Is Explained to Drivers

| Touchpoint | Communication |
|-----------|--------------|
| **Pre-permission prompt** (before OS dialog) | Bottom sheet: "Trip Location Tracking — AxleOps tracks your vehicle location during active trips to support fleet operations, ensure timely delivery, and maintain audit compliance. Location is only tracked while a trip is in transit. Tracking stops automatically when the trip ends." |
| **Foreground notification** (Android, during transit) | "AxleOps — Trip [TRP-2024-0142] in progress. Location tracking active." |
| **App settings / about** (future) | Tracking policy explanation accessible from app settings. |

### 11.2 When Tracking Is Active vs Inactive

| State | Tracking | Driver Visibility |
|-------|----------|-------------------|
| No active trip | ❌ Inactive | No tracking indicator. No notification. No GPS usage. |
| Active trip, pre-departure states | ❌ Inactive | GPS icon grayed out: "Tracking starts at departure." |
| Active trip, transit states | ✅ Active | Green GPS icon. Android: notification. iOS: status bar icon. |
| Active trip, post-arrival states | ❌ Inactive | GPS icon grayed out: "Tracking complete." |
| App backgrounded during transit | ✅ Active (background) | Android: notification persists. iOS: location arrow in status bar. |
| App killed during transit | ⏸️ Paused (resumes on relaunch) | On relaunch: tracking auto-resumes with no driver action required. |

### 11.3 Auditability / Visibility Rules

- **Every location data point** includes a timestamp and the trip ID. The driver cannot modify or delete location data.
- **Location data is trip-scoped** — it is associated with a specific trip, not with the driver as an individual. When a trip is completed/settled, the location data belongs to the trip record.
- **No ambient tracking** — the app MUST NOT capture or transmit location data outside of the active trip transit window. This is a hard rule, not a soft guideline.
- **Data retention** follows the general trip data retention policy (defined by the organization/tenant). This spec does not define a specific retention period.

### 11.4 Over-Collection Prevention

| Guardrail | Implementation |
|-----------|---------------|
| **No pre-trip tracking** | `TrackingManager.start()` is ONLY called when the trip transitions to DEPARTED. |
| **No post-trip tracking** | `TrackingManager.stop()` is called when the trip exits the IN_TRANSIT family of states. |
| **No tracking without trip** | `TrackingManager` requires a valid `tripId`. Cannot be started without an active trip context. |
| **Auto-stop safety net** | If tracking has been active for > 48 hours continuously, an automatic stop is triggered with a diagnostic log. This prevents orphaned tracking due to state bugs. |
| **Permission-gated** | GPS hardware is only accessed via the platform location APIs, which inherently respect the user's permission grant. |

---

## 12. Acceptance Criteria

### 12.1 Product Acceptance Criteria

| ID | Criterion | Category |
|----|----------|----------|
| **AC-001** | When a trip transitions to DEPARTED, the app begins capturing GPS coordinates every 5 minutes (±30 seconds). | Tracking lifecycle |
| **AC-002** | When a trip transitions to AT_DESTINATION (or later), GPS tracking stops and no further location points are captured for that trip. | Tracking lifecycle |
| **AC-003** | On Android, the app requests `ACCESS_FINE_LOCATION` followed by `ACCESS_BACKGROUND_LOCATION` at the point of trip departure, not at app launch. | Permission flow |
| **AC-004** | On iOS, the app requests "When In Use" location authorization followed by "Always" authorization at the point of trip departure. | Permission flow |
| **AC-005** | If location permission is denied, the trip proceeds with a warning. No tracking occurs, but all other trip functions work normally. | Non-blocking GPS |
| **AC-006** | A pre-permission rationale screen/prompt explains why location access is needed before the OS permission dialog appears. | Consent UX |
| **AC-007** | While tracking is active, the driver sees a tracking-active indicator (green GPS icon) in the trip detail header. | Driver visibility |
| **AC-008** | While tracking is inactive (pre-departure or post-arrival), the tracking indicator shows the appropriate inactive state. | Driver visibility |
| **AC-009** | On Android, a persistent foreground notification is shown during active tracking with trip information. The notification is dismissed when tracking stops. | Android UX |
| **AC-010** | When the app is backgrounded during transit, location capture continues at the specified interval. | Background tracking |
| **AC-011** | If the app is killed by the OS and relaunched while the trip is still in transit, tracking resumes automatically without driver action. | Resume on relaunch |
| **AC-012** | Location data captured while offline is stored locally and synced to the backend when connectivity is restored. No data points are silently dropped. | Offline resilience |
| **AC-013** | Each location batch submission includes a client-generated UUID per point for deduplication. | Data integrity |
| **AC-014** | The tracking indicator shows degraded/warning states for: permission denied, GPS signal lost, background tracking limited, low accuracy. | Status visibility |
| **AC-015** | Location points include at minimum: latitude, longitude, accuracy, and timestamp. | Data completeness |
| **AC-016** | No location data is captured when the driver has no active trip or the active trip is in a non-transit state. | Privacy / no ambient tracking |
| **AC-017** | Tracking automatically stops after 48 hours of continuous operation as a safety net. | Over-collection prevention |
| **AC-018** | If permission is permanently denied ("Don't ask again" on Android), the app provides a "Go to Settings" affordance. | Permission UX |
| **AC-019** | If location permission is revoked via system settings while tracking is active, tracking stops gracefully with a status update visible to the driver. | Permission revocation |
| **AC-020** | The mock backend accepts location batch payloads and returns `202 Accepted`. QA can verify tracking by monitoring mock API calls. | Mock/QA |

### 12.2 Operational Acceptance Criteria

| ID | Criterion | Category |
|----|----------|----------|
| **OAC-001** | At least 80% of expected location data points (1 per 5 min) are captured during a 2-hour foreground+background test on each representative Android device: (a) one stock/near-stock device (e.g., Pixel or Samsung Galaxy) and (b) one aggressive-OEM device (e.g., Xiaomi or Oppo). | Reliability |
| **OAC-002** | At least 80% of expected location data points are captured during a 2-hour foreground+background test on a representative iOS device (recent iPhone). | Reliability |
| **OAC-003** | Battery consumption attributable to location tracking does not exceed 10% per hour during active tracking. | Battery impact |
| **OAC-004** | Offline-buffered location data (24 hours worth) syncs completely within 5 minutes of connectivity restoration. | Offline sync |
| **OAC-005** | The app does not crash or produce ANR (Android) / hang (iOS) during permission request, grant, denial, or revocation flows. | Stability |
| **OAC-006** | All location tracking behavior respects the mock/real data source switching mechanism. In mock mode, GPS capture and buffering still function with the mock repository accepting data. | Testability |

### 12.3 Explicit Exclusions from Acceptance

- ❌ **Real-time location display to operations** — not tested in this feature. This spec captures data; display is a separate feature.
- ❌ **Route deviation alerts** — derived analytics, not raw tracking.
- ❌ **OEM-specific battery optimization bypass for all manufacturers** — documented as a risk, tested on representative devices only.
- ❌ **Guaranteed 100% capture rate in all background scenarios** — OS constraints make this impossible to guarantee. 80% is the MVP floor.
- ❌ **Backend location persistence and query** — backend gaps are documented. Mock ingestion is the acceptance baseline.
- ❌ **Tracking for non-driver roles** — driver-only in v1.

---

## Assumptions

- **Driver Active Trip (specs/005)** is fully implemented — trip lifecycle states, milestone progression, `TrackingManager` orchestration shell, `LocationTracker` interface, `LocationProvider` interface, `LocationRepository` interface exist.
- **Mobile Foundation (specs/003)** is fully implemented — navigation, DI (Koin), networking (Ktor), reactive data sources, `ConnectivityObserver`, `PermissionHandler` shell.
- **Driver Auth & Session (specs/004)** is fully implemented — JWT session, contactId, 401 interceptor.
- The existing `TrackingManager`, `LocationTracker`, `LocationProvider`, and `LocationRepository` in the codebase are mock/scaffold implementations that will be **replaced or upgraded** by this feature — not discarded.
- The `PermissionHandler` interface currently covers camera and gallery permissions only. This feature will **extend** it to include location permissions.
- The 5-minute capture interval is sufficient for fleet operational visibility. Higher-frequency tracking is a future enhancement.
- GPS is a **warning-level** concern, not a blocking requirement. Per `trip.md` milestone rules, each milestone captures GPS with a warning if GPS is unavailable — not a hard block.
- The `DataSourceConfig` mechanism supports switching between mock and real implementations for location-related services.
- The backend does NOT currently have a location ingestion endpoint. The canonical contract is `POST /trips/{id}/location/batch` (trip-scoped). The earlier `POST /location/log` from specs/005 is formally superseded and should not be implemented.
- Android target SDK is ≥ 29 (Android 10) which requires the two-step location permission flow.
- iOS target deployment is ≥ iOS 15 which supports all referenced CLLocationManager capabilities.
