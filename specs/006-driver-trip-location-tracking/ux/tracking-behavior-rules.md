# Tracking Behavior Rules — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Source of Truth**: [spec.md §3, §6, §11](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/spec.md)  
> **Date**: 2026-03-29

---

## 1. Lifecycle Rules

These rules govern when tracking starts, runs, and stops. They are non-negotiable product behavior.

### R1 — Automatic Start

> Tracking MUST start automatically when the trip transitions to DEPARTED.  
> There is no manual "Start Tracking" button.

**Rationale**: Manual start is a failure mode. Drivers forget. The operational goal (fleet visibility during transit) requires reliability, not compliance.

### R2 — Automatic Stop

> Tracking MUST stop automatically when the trip transitions to AT_DESTINATION or any post-transit state.  
> There is no manual "Stop Tracking" button.

**Rationale**: Stopping at arrival prevents over-collection. The destination arrival GPS is captured as part of the milestone transition data.

### R3 — No Tracking Outside Transit

> The app MUST NOT capture, buffer, or transmit location data when the trip is in a non-transit state (DISPATCHED through LOADED, or AT_DESTINATION through SETTLED).

**Rationale**: Privacy. The driver is not being surveilled — the vehicle is being tracked during a specific operational window.

### R4 — No Tracking Without Trip

> The app MUST NOT activate location services when no active trip exists.

**Rationale**: No ambient tracking. The app does not know where the driver is when they're not working.

### R5 — Exception Continuity

> Tracking MUST continue during exception states (VEHICLE_BREAKDOWN, ACCIDENT, etc.) that occur during the transit window.

**Rationale**: Exception location data is operationally critical — identifying breakdown sites, accident locations, and towing destinations.

### R6 — 48-Hour Safety Net

> If tracking has been continuously active for more than 48 hours, the system MUST auto-stop and log a diagnostic event.

**Rationale**: Prevents orphaned tracking from state machine bugs. No legitimate single-hop trip exceeds 48 hours in Indian fleet operations. Multi-day trips are multi-segment.

---

## 2. Permission Rules

### R7 — Request at Departure, Not at Launch

> Location permissions MUST be requested at the moment of departure, not at app launch, login, or trip acceptance.

**Rationale**: Contextual request timing dramatically improves grant rates. The driver understands "I'm about to drive, so they need my location."

### R8 — Never Block the Trip

> If location permission is denied, the trip MUST proceed.  
> GPS is a **warning-level** concern, never a blocking requirement.

**Rationale**: Per `trip.md` milestone rules, GPS coordinates are captured with a warning if unavailable. The trip cannot be held hostage by a permission choice.

### R9 — One Pre-Prompt Per Install

> The pre-prompt bottom sheet (rationale explainer) MUST be shown on the first departure after install.  
> If the driver has already been shown the pre-prompt and made a choice, do not show it again for subsequent trips.

**Exception**: If the driver revokes permission between trips, the pre-prompt may be shown once more on the next departure.

### R10 — Respect "Don't Ask Again"

> If the OS permanently blocks the permission dialog (Android: "Don't ask again"), the app MUST NOT attempt to show the OS dialog.  
> Instead, the "Go to Settings" affordance is the only resolution path.

---

## 3. Background Behavior Rules

### R11 — Background Is Best-Effort, Not Guaranteed

> The app MUST attempt background tracking using each platform's recommended mechanism.  
> If the OS restricts or kills the background process, this is an accepted limitation — not a bug.

**Rationale**: OEM battery optimization (Xiaomi, Samsung, Oppo) may kill background services. The app can request exemption but cannot override OS policy.

### R12 — Resume on Relaunch

> If the app is killed and relaunched while the trip is still in a transit state, tracking MUST resume automatically.  
> No driver action should be required.

**Logic**: On launch → check active trip → check trip sub-state → if in transit family → check permissions → if granted → start tracking.

### R13 — Foreground Notification Is Mandatory (Android)

> On Android, a persistent foreground notification MUST be visible while tracking is active.  
> The notification MUST NOT be dismissible by the driver.

**Rationale**: Android requires a foreground notification for foreground services. This is an OS mandate, not a design choice. The notification should be informative, not alarming.

### R14 — No Background Notification (iOS)

> On iOS, no custom notification is required for background tracking.  
> The system location arrow in the status bar serves as the tracking indicator.

---

## 4. Data Capture Rules

### R15 — No Silent Drops

> Every captured location point MUST be persisted locally before submission.  
> If submission fails, the point remains in the local buffer for retry.  
> The only acceptable data loss scenarios: device factory reset or app uninstall.

### R16 — Batch, Don't Stream

> Location points are submitted to the backend in batches (default: every 15 minutes or when 3+ points are buffered), not individually.

**Rationale**: Reduces network overhead. Groups points for efficient API usage. Tolerates brief connectivity gaps.

### R17 — Client-Side Dedup

> Each location point MUST carry a client-generated UUID (`clientId`) to prevent duplicate ingestion on retry.

### R18 — Chronological Sync

> Buffered points MUST be synced in chronological order (oldest first).  
> The backend receives the trip's breadcrumb trail in sequence.

---

## 5. Trust and Transparency Rules

### R19 — Visible When Tracking

> The driver MUST always be able to see whether tracking is active by looking at the trip detail header.  
> The indicator MUST update in real-time — not on refresh, not on pull-to-refresh.

### R20 — Visible When Not Tracking

> When tracking is inactive (non-transit state), the indicator MUST show a visually distinct "inactive" state.  
> The driver should not wonder "is it tracking me right now?"

### R21 — Visible When Degraded

> If tracking capability is limited (background denied, low accuracy, signal lost), the indicator MUST reflect the specific degradation — not a generic "warning".

### R22 — No Stealth Tracking

> The app MUST NOT collect location data through any mechanism other than the explicit tracking system.  
> Analytics events, crash reports, and API calls MUST NOT embed device location.  
> This rule applies to all code paths, not just the tracking module.

---

## 6. Integration Rules

### R23 — Tracking Does Not Own Navigation

> Tracking introduces no new screens, tabs, flows, or navigation destinations.  
> All UI elements are surfaced within the existing Active Trip screen.

### R24 — Tracking Does Not Modify Milestone Flow

> The departure milestone transition (LOADED → DEPARTED) happens regardless of permission outcome.  
> Tracking is a side-effect of departure, not a precondition.

### R25 — Tracking Indicator Does Not Compete

> The tracking indicator exists in the header alongside the phase badge and trip number.  
> It MUST NOT visually dominate, displace, or interfere with the phase badge, exception banner, or milestone stepper.

### R26 — Offline Behavior Is Consistent

> Tracking offline behavior follows the same queuing pattern as other Active Trip offline behavior (milestone transitions, document uploads, expense logging).  
> The "pending sync" indicator for location data uses the same visual language as "pending sync" for other data types.
