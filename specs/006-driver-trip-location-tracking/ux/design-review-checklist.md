# Design Review Checklist — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Date**: 2026-03-29

---

## How to Use

This checklist validates that the implementation correctly captures the behavioral UX specification. Each item references the source document. Items are grouped by concern area.

Check `[x]` when verified. Flag `[!]` for issues requiring resolution.

---

## 1. Permission Flow

- [ ] Pre-prompt bottom sheet appears when the driver taps "Depart" for the first time after install
  - Source: [permission-flow.md §2](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/permission-flow.md)
- [ ] Pre-prompt does NOT appear at app launch, login, or trip acceptance
  - Source: [tracking-behavior-rules.md R7](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Pre-prompt "Continue" triggers the OS permission dialog
- [ ] Pre-prompt "Not Now" dismisses the sheet and proceeds with departure — no tracking, warning shown
- [ ] Pre-prompt swipe-dismiss and back button behave the same as "Not Now"
- [ ] On Android: foreground location is requested first, background location requested after foreground is granted
  - Source: [permission-flow.md §2.2](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/permission-flow.md)
- [ ] On iOS: "When In Use" is requested first, "Always" is requested after "When In Use" is granted
  - Source: [permission-flow.md §2.3](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/permission-flow.md)
- [ ] Denial of any permission does NOT block the departure transition
  - Source: [tracking-behavior-rules.md R8](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Pre-prompt is NOT shown on subsequent trips if already shown once (per install)
  - Source: [tracking-behavior-rules.md R9](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] "Don't ask again" (Android) is detected — app shows "Go to Settings" instead of re-prompting
  - Source: [tracking-behavior-rules.md R10](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)

---

## 2. Tracking State Indicator

- [ ] Indicator is visible in the trip detail header (Layer 1 status area)
  - Source: [ux-brief.md §3](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/ux-brief.md)
- [ ] All 7 tracking states render with correct icon, color, and label
  - Source: [tracking-state-inventory.md §1](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-state-inventory.md)
- [ ] ACTIVE state shows pulsing animation (3s cycle, `motion.fade`)
  - Source: [status-copy-and-messaging.md §1](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] No other state has animation
- [ ] Indicator uses `type.label` typography
- [ ] Indicator does NOT visually dominate or displace the phase badge, exception banner, or milestone stepper
  - Source: [tracking-behavior-rules.md R25](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Indicator updates are reactive (real-time), not requiring pull-to-refresh
  - Source: [tracking-behavior-rules.md R19](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)

---

## 3. Warning Banners

- [ ] Permission denied banner shows correct copy: "Location tracking is off. Trip can continue without GPS."
  - Source: [status-copy-and-messaging.md §3.1](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Permission denied banner includes "Enable in Settings" action that opens app settings
- [ ] Permission denied banner is dismissible, reappears once per app session
- [ ] Background limited banner shows correct copy and "Enable" action
  - Source: [status-copy-and-messaging.md §3.2](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Background limited banner is dismissible, does NOT reappear for this trip once dismissed
- [ ] Device location off banner shows correct copy and "Turn On Location" action
  - Source: [status-copy-and-messaging.md §3.3](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Device location off banner is NOT dismissible, auto-clears when device location enabled
- [ ] Permission revoked banner shows correct copy, dismissible, shown once
  - Source: [status-copy-and-messaging.md §3.4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] GPS signal lost banner shows correct copy, NOT dismissible, auto-clears on signal restoration
  - Source: [status-copy-and-messaging.md §3.5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Reduced accuracy banner (iOS) shows correct copy, dismissible
  - Source: [status-copy-and-messaging.md §3.6](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Battery optimization banner (Android) shows correct copy and "Learn More" action, shown once per trip
  - Source: [status-copy-and-messaging.md §3.7](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] All banners use correct color tokens (warning = amber 10%, info = blue 10%, error = red 10%)
- [ ] All banners use `type.body` for text and `type.label` for action buttons

---

## 4. Tracking Lifecycle

- [ ] Tracking starts automatically when trip transitions to DEPARTED
  - Source: [tracking-behavior-rules.md R1](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Tracking stops automatically when trip transitions to AT_DESTINATION
  - Source: [tracking-behavior-rules.md R2](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] No "Start Tracking" or "Stop Tracking" button exists anywhere in the UI
- [ ] No tracking occurs in non-transit states (DISPATCHED through LOADED, AT_DESTINATION through SETTLED)
  - Source: [tracking-behavior-rules.md R3](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] No tracking occurs when no active trip exists
  - Source: [tracking-behavior-rules.md R4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Tracking continues during exception states within the transit window
  - Source: [tracking-behavior-rules.md R5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] 48-hour auto-stop safety net is implemented
  - Source: [tracking-behavior-rules.md R6](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Tracking resumes automatically on app relaunch if trip is still in transit
  - Source: [tracking-behavior-rules.md R12](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)

---

## 5. Android Foreground Notification

- [ ] Notification channel "Trip Tracking" exists with Low importance (no sound/vibration)
- [ ] Notification shows during ACTIVE, ACTIVE_DEGRADED, and SIGNAL_LOST states
  - Source: [tracking-state-inventory.md §5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-state-inventory.md)
- [ ] Notification is NOT shown during INACTIVE, AWAITING_PERMISSION, PERMISSION_DENIED, or STOPPED states
- [ ] Notification is non-dismissible (ongoing = true)
- [ ] Notification content updates to reflect current tracking state (active/limited/signal lost)
  - Source: [status-copy-and-messaging.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Tapping notification opens the app to the Active Trip screen
- [ ] Notification is dismissed when tracking transitions to STOPPED

---

## 6. Pending Sync Badge

- [ ] Badge appears adjacent to tracking indicator when `pendingLocationPointCount > 0`
  - Source: [status-copy-and-messaging.md §5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Badge shows correct count of pending (unsynced) points
- [ ] Badge clears when all points sync successfully
- [ ] Badge uses `color.warning` background, white text, 20dp circle

---

## 7. Trust and Privacy

- [ ] No location data is captured outside the trip transit window
  - Source: [tracking-behavior-rules.md R3, R4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] No location data is embedded in analytics, crash reports, or non-tracking API calls
  - Source: [tracking-behavior-rules.md R22](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Pre-prompt copy communicates: starts at departure, stops at arrival, only during this trip
  - Source: [status-copy-and-messaging.md §2](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Android foreground notification is informative, not alarming
  - Source: [status-copy-and-messaging.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)
- [ ] Copy tone follows guidelines: direct, no blame, no jargon, no urgency theater
  - Source: [status-copy-and-messaging.md §6](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/status-copy-and-messaging.md)

---

## 8. Design System Compliance

- [ ] No new color tokens introduced — all colors from existing semantic palette
- [ ] No new component types introduced — uses existing badges, banners, bottom sheets, buttons
  - Source: [ux-brief.md §5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/ux-brief.md)
- [ ] No new navigation destinations — all tracking UI lives within Active Trip screen
  - Source: [tracking-behavior-rules.md R23](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-behavior-rules.md)
- [ ] Bottom sheet uses design system specs: `radius.lg` top corners, 32×4dp handle, `color.scrim` backdrop
- [ ] Banner styling matches existing OfflineBanner pattern
- [ ] Touch targets ≥ 48dp for all interactive elements
- [ ] All text uses design system typography tokens

---

## 9. State Precedence

- [ ] Tracking warnings do NOT supersede exception banners
  - Source: [tracking-state-inventory.md §3](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/tracking-state-inventory.md)
- [ ] Tracking warnings do NOT supersede offline banner
- [ ] Multiple banners can coexist (e.g., offline banner + tracking limited notice) without layout breakage
- [ ] Exception banner always has highest visual priority regardless of tracking state

---

## 10. Data Dependencies

- [ ] All 13 data inputs from [data-dependencies.md §7](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/data-dependencies.md) are sourced and wired
- [ ] Reactive inputs (`tripSubState`, `gpsSignalAvailable`, `pendingLocationPointCount`) update the UI without manual refresh
- [ ] Non-reactive inputs (`permissionState`, `deviceLocationEnabled`) are checked on: departure trigger, app resume, Settings return
- [ ] Dismiss states are tracked at correct scope: per session, per trip, per install
  - Source: [data-dependencies.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/ux/data-dependencies.md)
