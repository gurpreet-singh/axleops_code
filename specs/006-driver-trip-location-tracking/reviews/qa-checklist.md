# QA Checklist — Driver Trip Location Tracking & Background Telemetry

**Feature**: 006-driver-trip-location-tracking  
**Created**: 2026-03-29  
**Grounded in**: spec.md, ux/, plan.md, tasks.md, design-review-round-1.md, implementation-notes.md  
**Focus**: Permission flows, tracking lifecycle, background behavior, offline sync, platform-specific, driver trust/privacy

---

## 1. Permission Request Timing & Pre-Prompt

- [ ] QA-001 — Pre-prompt bottom sheet appears on **first departure after install**, not at app launch, login, or trip acceptance [Spec §4.3 P1, UX permission-flow.md §1, R7]
- [ ] QA-002 — Pre-prompt does NOT appear on subsequent trips after shown once (per-install flag) [UX tracking-behavior-rules.md R9]
- [ ] QA-003 — Tapping "Continue" on pre-prompt dismisses the sheet and triggers the **OS permission dialog** [UX permission-flow.md §3.2]
- [ ] QA-004 — Tapping "Not Now" dismisses the sheet, **skips OS dialog**, proceeds with departure, and shows a warning banner [UX permission-flow.md §3.2]
- [ ] QA-005 — Swiping down to dismiss the pre-prompt behaves identically to "Not Now" [UX permission-flow.md §3.2]
- [ ] QA-006 — On Android: OS dialog sequence is foreground (`ACCESS_FINE_LOCATION`) **first**, then background (`ACCESS_BACKGROUND_LOCATION`) **second** — never both at once [Spec §4.1, UX permission-flow.md §2.2]
- [ ] QA-007 — On iOS: OS dialog sequence is `requestWhenInUseAuthorization()` first, then `requestAlwaysAuthorization()` after foreground is granted [Spec §4.2, UX permission-flow.md §2.3]
- [ ] QA-008 — Departure transition **always proceeds** regardless of permission outcome (denied, not now, granted) [UX tracking-behavior-rules.md R8, Spec §4.3 P2]

---

## 2. Permission Denial Scenarios

- [ ] QA-009 — If foreground location is denied: trip continues, tracking does NOT start, warning banner is shown, tracking indicator shows PERMISSION_DENIED state [Spec §4.1, UX tracking-state-inventory.md §1]
- [ ] QA-010 — If foreground is granted but background is denied: foreground tracking works, background tracking is limited, "Background tracking limited" notice is shown [Spec §4.1, UX permission-flow.md §4.2]
- [ ] QA-011 — On Android: if "Don't ask again" was selected, app detects `shouldShowRequestPermissionRationale() == false`, shows "Go to Settings" affordance instead of re-prompting [Spec §4.1, UX tracking-behavior-rules.md R10]
- [ ] QA-012 — On iOS: if "Reduce to Approximate" is chosen (iOS 14+), tracking continues with reduced accuracy, "Approximate location only" notice shown [Spec §4.2, UX permission-flow.md §5]
- [ ] QA-013 — On iOS: if user downgrades from "Always" to "While Using" in Settings, app detects on resume and shows "Background tracking has been restricted" notice [Spec §4.2]
- [ ] QA-014 — "Enable in Settings" / "Go to Settings" action actually opens the app's system permission settings page [UX permission-flow.md §4.4]
- [ ] QA-015 — After granting permission in Settings and returning to app, tracking state updates from PERMISSION_DENIED → ACTIVE (or ACTIVE_DEGRADED) without requiring app restart [UX tracking-state-inventory.md §2]

---

## 3. Permission Revoked During Active Tracking

- [ ] QA-016 — If permission is revoked via system Settings while tracking is active: tracking stops gracefully — no crash, no ANR, no orphan notification [Spec §4.1, UX permission-flow.md §4.6]
- [ ] QA-017 — On next app foreground after revocation: tracking indicator updates to show stopped/denied state [UX permission-flow.md §4.6]
- [ ] QA-018 — "Location permission was removed. Tracking has stopped." notice is shown with "Go to Settings" affordance [UX status-copy-and-messaging.md §3.4]
- [ ] QA-019 — On Android: foreground notification is dismissed when permission is revoked [UX permission-flow.md §4.6]
- [ ] QA-020 — Trip continues to function normally (all milestone actions available) after permission revocation [Spec §4.3 P2, UX tracking-behavior-rules.md R8]

---

## 4. Tracking Start/Stop Lifecycle Rules

- [ ] QA-021 — Tracking starts **automatically** when trip sub-state becomes DEPARTED — no manual "Start Tracking" button exists [UX tracking-behavior-rules.md R1]
- [ ] QA-022 — Tracking stops **automatically** when trip sub-state becomes AT_DESTINATION — no manual "Stop Tracking" button exists [UX tracking-behavior-rules.md R2]
- [ ] QA-023 — No tracking occurs for non-transit states: DISPATCHED, ACCEPTED, AT_ORIGIN, LOADING, LOADED, EWB_PENDING, AT_DESTINATION, UNLOADING, DELIVERED, POD_SUBMITTED [Spec §3.3, UX tracking-behavior-rules.md R3]
- [ ] QA-024 — No tracking occurs when no active trip exists [UX tracking-behavior-rules.md R4]
- [ ] QA-025 — Tracking **continues** during exception states (VEHICLE_BREAKDOWN, ACCIDENT, etc.) that occur during transit [Spec §3.3, UX tracking-behavior-rules.md R5]
- [ ] QA-026 — 48-hour continuous tracking safety net: tracking auto-stops after 48h with a diagnostic log entry [Spec §11.4, UX tracking-behavior-rules.md R6]
- [ ] QA-027 — On app relaunch: if trip is still in transit family state (DEPARTED / IN_TRANSIT / AT_CHECKPOINT / exception during transit) **and** permissions are granted, tracking resumes automatically without driver action [Spec §3.3, UX tracking-behavior-rules.md R12]

---

## 5. Tracking State Indicator (Driver UI)

- [ ] QA-028 — Tracking indicator is visible in the trip detail header (Layer 1 status area) [UX ux-brief.md §3]
- [ ] QA-029 — All 7 tracking states render with correct icon, color, and label: INACTIVE ("GPS Off", gray), AWAITING_PERMISSION ("GPS Off", gray), ACTIVE ("Tracking", green+pulse), ACTIVE_DEGRADED ("Limited GPS", amber), SIGNAL_LOST ("No Signal", red), PERMISSION_DENIED ("No GPS Permission", amber), STOPPED ("Tracking Complete", gray) [UX tracking-state-inventory.md §1, status-copy-and-messaging.md §1]
- [ ] QA-030 — ACTIVE state has pulsing animation; no other state has animation [UX status-copy-and-messaging.md §1]
- [ ] QA-031 — Indicator does NOT visually dominate or displace the phase badge, exception banner, or milestone stepper [UX tracking-behavior-rules.md R25]
- [ ] QA-032 — Indicator updates are **reactive** (real-time via StateFlow) — no pull-to-refresh needed [UX tracking-behavior-rules.md R19, data-dependencies.md §2]

> [!NOTE]
> **DR-005**: Current implementation shows "Requesting…" for AWAITING_PERMISSION — spec says "GPS Off". Verify fix applied.
> **DR-006**: Current implementation has `SIGNAL_LOST.isActive = false` — spec says tracking continues. Verify fix applied.

---

## 6. Warning Banners

- [ ] QA-033 — Permission denied banner: "Location tracking is off. Trip can continue without GPS." + "Enable in Settings" action. Dismissible, reappears once per app session. [UX status-copy-and-messaging.md §3.1]
- [ ] QA-034 — Background limited banner: "Background tracking is limited. Location may not be recorded when you switch apps." + "Enable" action. Dismissible, does NOT reappear for this trip once dismissed. [UX status-copy-and-messaging.md §3.2]
- [ ] QA-035 — Device location off banner: "Your device location is turned off." + "Turn On Location" action. NOT dismissible, auto-clears when device location enabled. [UX status-copy-and-messaging.md §3.3]
- [ ] QA-036 — Permission revoked banner: "Location permission was removed. Tracking has stopped." + "Go to Settings" action. Dismissible, shown once. [UX status-copy-and-messaging.md §3.4]
- [ ] QA-037 — GPS signal lost banner: "GPS signal lost. Location tracking will resume when signal is available." NOT dismissible, auto-clears on signal restoration. [UX status-copy-and-messaging.md §3.5]
- [ ] QA-038 — Reduced accuracy banner (iOS): "Approximate location only. Trip tracking may be less accurate." Dismissible, does not reappear for this trip. [UX status-copy-and-messaging.md §3.6]
- [ ] QA-039 — Battery optimization banner (Android): "Battery optimization may affect location tracking." + "Learn More" action. Dismissible, shown once per trip. [UX status-copy-and-messaging.md §3.7]
- [ ] QA-040 — All banners use appropriate color tokens (warning=amber, info=blue, error=red at 10% opacity) [UX status-copy-and-messaging.md §3]
- [ ] QA-041 — Tracking warnings do NOT supersede exception banners, EWB blocking, or offline indicators — tracking banners coexist without displacing [UX tracking-state-inventory.md §3]

> [!IMPORTANT]
> **DR-007**: All 6 banner copies currently diverge from spec. Verify exact copy matches status-copy-and-messaging.md after fix.
> **DR-008**: Banners use emojis instead of Material icons — verify icons fixed.
> **DR-013**: No banner dismiss-state tracking exists — verify per-session/per-trip/per-install scopes implemented.

---

## 7. Foreground Tracking Behavior

- [ ] QA-042 — Location points are captured every 5 minutes (±30 seconds) while app is in foreground and trip is in transit [Spec §3.1]
- [ ] QA-043 — Each captured point includes at minimum: `latitude`, `longitude`, `accuracy`, `timestamp` [Spec §7.1, AC-015]
- [ ] QA-044 — Each point carries a client-generated UUID (`clientId`) for deduplication [Spec §7.4, AC-013]
- [ ] QA-045 — Points are persisted to SQLDelight local buffer **immediately** upon capture, before any sync attempt [Spec §7.4, UX tracking-behavior-rules.md R15]
- [ ] QA-046 — Tracking indicator shows "Tracking" (green, pulsing) during active foreground tracking [UX tracking-state-inventory.md §1]
- [ ] QA-047 — A `TRACKING_STARTED` event is logged when tracking begins (trip enters DEPARTED) [Spec §7.3]
- [ ] QA-048 — A `TRACKING_STOPPED` event is logged when tracking ends (trip exits transit) [Spec §7.3]

---

## 8. Background Tracking Behavior

### Android

- [ ] QA-049 — On Android: persistent foreground notification ("Trip Tracking" channel, LOW importance) appears when tracking starts [Spec §9.1, UX status-copy-and-messaging.md §4]
- [ ] QA-050 — Notification is non-dismissible (ongoing=true) [UX status-copy-and-messaging.md §4]
- [ ] QA-051 — Notification content reflects tracking state: "Location tracking active" / "Location tracking limited" / "GPS signal lost" [UX status-copy-and-messaging.md §4]
- [ ] QA-052 — Tapping the notification opens the app to the Active Trip screen [UX status-copy-and-messaging.md §4]
- [ ] QA-053 — Notification is dismissed when tracking stops (trip arrives, trip cancelled, permission revoked) [UX tracking-state-inventory.md §5]
- [ ] QA-054 — ForegroundService keeps running when app is backgrounded — points continue to be captured at the 5-min interval [Spec §3.2, AC-010]
- [ ] QA-055 — PARTIAL_WAKE_LOCK is held during service runtime [Plan §3, implementation-notes.md]
- [ ] QA-056 — If app is force-stopped: AlarmManager re-triggers service check within 15 minutes [Plan §3, Spec §6.5]
- [ ] QA-057 — After device reboot: BootCompletedReceiver checks for active transit trip and restarts tracking if needed [Plan §3, Spec §6.5]

### iOS

- [ ] QA-058 — `UIBackgroundModes: location` is configured in Info.plist [Spec §9.2, Plan §3]
- [ ] QA-059 — Location arrow appears in status bar during background tracking (iOS system behavior) [Spec §3.2]
- [ ] QA-060 — Background location updates continue when app is backgrounded (switch to Maps, take a call, lock screen) [Spec §3.2, AC-010]
- [ ] QA-061 — `pausesLocationUpdatesAutomatically = false` — iOS does NOT auto-pause updates [Plan §3]
- [ ] QA-062 — Significant location change monitoring is registered as a fallback safety net [Spec §9.2, Plan §3]
- [ ] QA-063 — If app is terminated by iOS: significant location change (~500m) relaunches the app, `AppDelegate` detects `.location` launch key, tracking resumes [Plan §3, Spec §6.5]

---

## 9. Offline Buffering / Retry / Sync

- [ ] QA-064 — Location points are stored in SQLDelight buffer with `syncStatus = PENDING` [Plan §6]
- [ ] QA-065 — Buffer supports at least 288 points (24 hours at 5-min intervals) [Spec §7.4]
- [ ] QA-066 — Buffered points survive app kill (persisted to disk via SQLDelight) [Spec §7.4, UX tracking-behavior-rules.md R15]
- [ ] QA-067 — Batch sync triggers: (a) threshold of 3+ pending points, (b) 15-minute timer, (c) connectivity restored [Spec §7.2, Plan §6]
- [ ] QA-068 — Batch size limit: max 50 points per API call [Spec §7.2]
- [ ] QA-069 — Points are synced in **chronological order** (oldest first) [Spec §7.5, UX tracking-behavior-rules.md R18]
- [ ] QA-070 — On network error / 5xx: exponential backoff retries (30s → 1m → 2m → 5m → 10m cap) [Spec §7.5]
- [ ] QA-071 — On 401 Unauthorized: sync stops, points remain in buffer, resumes after re-authentication [Spec §7.5]
- [ ] QA-072 — On 4xx (non-auth): retry once, then mark as "needs review" in local storage — do NOT drop [Spec §7.5]
- [ ] QA-073 — On app relaunch with buffered data: immediate flush attempt before starting new capture [Spec §7.5]
- [ ] QA-074 — No data points are silently dropped — the only acceptable data loss is device reset or uninstall [Spec §7.4, AC-012]

### Pending Sync Badge

- [ ] QA-075 — Pending sync badge appears adjacent to tracking indicator when `pendingLocationPointCount > 0` [UX status-copy-and-messaging.md §5]
- [ ] QA-076 — Badge shows correct count of pending points, formatted as number (capped at "99+") [UX status-copy-and-messaging.md §5]
- [ ] QA-077 — Badge clears when all points sync successfully [UX status-copy-and-messaging.md §5]

---

## 10. Mock vs Real Behavior

- [ ] QA-078 — In **mock mode**: `MockLocationRepository` accepts batch payload and returns `202 Accepted` with console logging [Plan §7, Spec §8.3]
- [ ] QA-079 — In **mock mode**: GPS capture uses `MockLocationProvider` (fixed coords every 5 min), full pipeline works: capture → buffer → sync → mock acceptance [Plan §7]
- [ ] QA-080 — In **real mode**: `RealLocationRepository` POSTs to `POST /trips/{tripId}/location/batch` with Bearer JWT auth [Spec §8.1, Plan §8]
- [ ] QA-081 — `DataSourceConfig.useRealLocation` toggle switches between mock and real implementations [Plan §7]
- [ ] QA-082 — Data source switching is **blocked** while tracking is active (DataSourceToggleGuard) [Plan §15 Risk, implementation-notes.md]
- [ ] QA-083 — In both mock and real modes: SQLDelight buffer, batch sync, and tracking state machine work identically [Plan §7, Spec OAC-006]

---

## 11. Active Trip Integration

- [ ] QA-084 — `ActiveTripViewModel` (or `ActiveTripComponent`) calls `TrackingManager.start(tripId)` on LOADED → DEPARTED transition [Plan §9]
- [ ] QA-085 — `ActiveTripViewModel` calls `TrackingManager.stop()` on trip transition to AT_DESTINATION [Plan §9]
- [ ] QA-086 — Tracking introduces **no new screens, tabs, or navigation destinations** — all UI is within the Active Trip screen [UX tracking-behavior-rules.md R23, ux-brief.md §6]
- [ ] QA-087 — Departure CTA continues to function **identically** to pre-tracking behavior — tracking is a side-effect, not a precondition [UX tracking-behavior-rules.md R24, Plan §9]
- [ ] QA-088 — Exception handling, offline milestone queue, document upload, expense logging are **unchanged** [Plan §9]

---

## 12. Platform-Specific Differences

### Android

- [ ] QA-089 — Manifest declares: `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION`, `RECEIVE_BOOT_COMPLETED` [Plan §10]
- [ ] QA-090 — `LocationTrackingService` declared with `foregroundServiceType="location"` [Plan §10]
- [ ] QA-091 — ForegroundService started when app is in foreground (departure action) — satisfies Android 12+ background start restrictions [Spec §9.1]
- [ ] QA-092 — ForegroundService uses `FusedLocationProviderClient` with 5-min interval, PRIORITY_HIGH_ACCURACY [Plan §3]
- [ ] QA-093 — Battery optimization: `PowerManager.isIgnoringBatteryOptimizations()` checked at tracking start [Plan §3, Spec §9.1]
- [ ] QA-094 — Android battery helper detects manufacturer (Xiaomi, Samsung, Oppo, Realme, Vivo, Huawei) for OEM-specific diagnostics [Plan §3]

### iOS

- [ ] QA-095 — Info.plist includes `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription` [Plan §10]
- [ ] QA-096 — CLLocationManager configured: `desiredAccuracy = kCLLocationAccuracyBest`, `distanceFilter = 50m`, `allowsBackgroundLocationUpdates = true` [Plan §3]
- [ ] QA-097 — `showsBackgroundLocationIndicator = true` — blue bar visible to the driver during background tracking [Plan §3]

---

## 13. Driver Trust / Privacy Messaging Consistency

- [ ] QA-098 — Pre-prompt copy matches spec exactly: title "Trip Location Tracking", body about fleet operations + compliance, 3 bullet points about start/stop/scope boundaries [UX status-copy-and-messaging.md §2]
- [ ] QA-099 — Pre-prompt "Not Now" button is a text (ghost) button, visually de-emphasized from "Continue" [UX status-copy-and-messaging.md §2]
- [ ] QA-100 — No location data is captured outside the trip transit window (DEPARTED through AT_CHECKPOINT) [Spec §11.3, UX tracking-behavior-rules.md R3, R4, AC-016]
- [ ] QA-101 — No location data is embedded in analytics events, crash reports, or non-tracking API calls [UX tracking-behavior-rules.md R22]
- [ ] QA-102 — Android foreground notification is informative, not alarming: "AxleOps — Trip in progress" + "Trip {tripNumber} · Location tracking active" [UX status-copy-and-messaging.md §4]
- [ ] QA-103 — Banner copy tone: direct, no blame language ("Location tracking is off" not "You denied permission"), no jargon, no urgency theater [UX status-copy-and-messaging.md §6]
- [ ] QA-104 — No "exclamation marks in warnings" — amber for information, red only for signal loss or errors [UX status-copy-and-messaging.md §6]
- [ ] QA-105 — When tracking is inactive (non-transit state), indicator shows a visually distinct "inactive" state (gray icon) — driver should never wonder "is it tracking me right now?" [UX tracking-behavior-rules.md R20]

---

## 14. Diagnostics & Safety Nets

- [ ] QA-106 — `TrackingDiagnostics` logs: capture success rate, gap count, longest gap, battery level trend, OS kill events, permission state changes [Spec §7.6]
- [ ] QA-107 — Diagnostics are exportable via the QA/debug settings panel as a text file [Spec §7.6]
- [ ] QA-108 — If tracking resumes after an OS kill, the first captured point includes a `TRACKING_RESUMED` event with gap duration [Spec §6.5]
- [ ] QA-109 — If buffer exceeds 24 hours of data: no eviction (buffer grows), diagnostic warning logged [Spec §7.5]

---

## 15. Acceptance Criteria Cross-Check

| AC | Description | QA Item(s) |
|----|-------------|------------|
| AC-001 | GPS capture every 5 min after DEPARTED | QA-042 |
| AC-002 | Tracking stops at AT_DESTINATION | QA-022 |
| AC-003 | Android: foreground → background permission at departure | QA-006 |
| AC-004 | iOS: When In Use → Always at departure | QA-007 |
| AC-005 | Denied permission → trip proceeds with warning | QA-009 |
| AC-006 | Pre-permission rationale shown before OS dialog | QA-001 |
| AC-007 | Green GPS icon during active tracking | QA-029 |
| AC-008 | Inactive indicator during non-transit states | QA-029, QA-105 |
| AC-009 | Android foreground notification during tracking | QA-049 |
| AC-010 | Background capture continues at interval | QA-054, QA-060 |
| AC-011 | Auto-resume on relaunch | QA-027 |
| AC-012 | Offline data stored and synced, no drops | QA-066, QA-074 |
| AC-013 | Client UUID per point | QA-044 |
| AC-014 | Degraded/warning indicator states | QA-029 |
| AC-015 | Points include lat/lng/accuracy/timestamp | QA-043 |
| AC-016 | No tracking outside transit window | QA-023, QA-100 |
| AC-017 | 48-hour auto-stop | QA-026 |
| AC-018 | "Go to Settings" for permanently denied | QA-011 |
| AC-019 | Graceful stop on permission revocation | QA-016 |
| AC-020 | Mock backend accepts batches, returns 202 | QA-078 |

---

## 16. Design Review Issues to Verify After Fix Round

> These items are from design-review-round-1.md. Verify after the fix round is complete.

- [ ] QA-110 — **DR-001 fixed**: Pre-prompt title is "Trip Location Tracking" (not "Enable Location Tracking") [design-review-round-1.md]
- [ ] QA-111 — **DR-002 fixed**: Pre-prompt body matches spec copy — no out-of-scope promises (ETA, real-time) [design-review-round-1.md]
- [ ] QA-112 — **DR-003 fixed**: Pre-prompt has 3 spec bullet points about tracking boundaries [design-review-round-1.md]
- [ ] QA-113 — **DR-005 fixed**: AWAITING_PERMISSION label is "GPS Off" (not "Requesting…") [design-review-round-1.md]
- [ ] QA-114 — **DR-006 fixed**: SIGNAL_LOST.isActive is `true` — service/notification persist during signal loss [design-review-round-1.md]
- [ ] QA-115 — **DR-007 fixed**: All banner copy matches status-copy-and-messaging.md exactly [design-review-round-1.md]
- [ ] QA-116 — **DR-008 fixed**: Banners use Material icons (ic_warning, ic_info, etc.) not emojis [design-review-round-1.md]
- [ ] QA-117 — **DR-010 fixed**: Battery optimization banner is implemented and visible (Android) [design-review-round-1.md]
- [ ] QA-118 — **DR-013 fixed**: Banner dismiss states tracked per-session/per-trip/per-install correctly [design-review-round-1.md]
- [ ] QA-119 — **DR-014 fixed**: Device Location Off banner has "Turn On Location" action button [design-review-round-1.md]
