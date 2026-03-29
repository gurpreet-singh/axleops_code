# Design Review Round 1 — Driver Trip Location Tracking

**Feature**: 006-driver-trip-location-tracking  
**Reviewer**: Design / UX Architecture  
**Date**: 2026-03-29  
**Build Status**: ✅ GREEN  

---

## 1. Status: **Changes Requested**

The implementation captures the correct state model, lifecycle rules, and platform infrastructure. However, **driver-facing copy, banner behavior, and several UX contracts are inconsistent** with the approved behavioral UX spec. These are fixable issues — none require architecture changes — but several are **Major** because they affect driver trust, privacy messaging, and degraded-mode clarity, which are core to this feature's UX mandate.

---

## 2. Summary

### What matches the approved spec ✅
- **7-state model**: `TrackingState` enum has the correct 7 states, correct `displayLabel` for 6 of 7 states, and correct `isActive` flags for 6 of 7.
- **State machine transitions**: All 10 methods (`onTripDeparted`, `onPermissionGranted`, `onPermissionDenied`, `onTripArrived`, `onGpsSignalLost`, `onGpsSignalRestored`, `onPermissionRevoked`, `onBackgroundRestricted`, `onBackgroundRestored`, `onTripReset`) match the transition table in tracking-state-inventory.md §2.
- **Tracking indicator**: `TrackingIndicator.kt` renders all 7 states with correct icons and semantic colors. Pulsing animation is correctly gated to ACTIVE-only.
- **Trip lifecycle integration**: Tracking auto-starts on departure and auto-stops on arrival via `TripStateMachine.shouldTrackGps()`.
- **No manual start/stop**: No "Start Tracking" or "Stop Tracking" button — matches R1/R2.
- **Permission pre-prompt**: `LocationPermissionRationale.kt` exists with "Continue" / "Not Now" buttons — matches permission-flow.md §3.
- **6 banner variants**: All 6 contextual warning banners exist — foreground denied, background denied, permanently denied, device location off, reduced accuracy, signal lost.
- **Pending sync badge**: `PendingSyncBadge.kt` matches spec (20dp circle, amber, white text, 99+ overflow).
- **Offline buffer**: SQLDelight persistence survives app kill — matches R15.
- **Batch sync**: 3 triggers (threshold/timer/connectivity), exponential backoff, auth-expiry halt — matches spec §7.5.
- **Android notification**: `LocationTrackingService` has persistent foreground notification with correct channel ("Trip Tracking").
- **iOS background**: `allowsBackgroundLocationUpdates = true`, `pausesLocationUpdatesAutomatically = false`, significant location change monitoring — matches spec §9.2.
- **No ambient tracking**: Tracking requires `tripId` and transit sub-state — matches R3/R4.

---

## 3. Issues

### DR-001 — Pre-prompt title mismatch
**Severity**: Major  
**Category**: Copy mismatch  
**Requires**: Engineer-only fix

| | UX Spec (status-copy-and-messaging §2) | Implementation (`LocationPermissionRationale.kt`) |
|-|-----|------|
| Title | **"Trip Location Tracking"** | **"Enable Location Tracking"** |

The spec mandates the title be descriptive ("what this is"), not directive ("what to do"). "Enable Location Tracking" sounds like a toggle — it misframes the permission as optional configuration rather than a natural consequence of departure.

---

### DR-002 — Pre-prompt body copy diverges from spec
**Severity**: Major  
**Category**: Copy mismatch — trust/privacy messaging  
**Requires**: Engineer-only fix

| | UX Spec (status-copy-and-messaging §2) | Implementation |
|-|-----|------|
| Body | "AxleOps tracks your vehicle location during transit to help fleet operations monitor delivery progress and maintain compliance." | "AxleOps uses your location to track trip progress and provide real-time visibility to fleet operations. Location data is collected only during active trips and helps ensure accurate ETA updates and route tracking." |

The implementation introduces concepts **not in the spec**: "real-time visibility", "ETA updates", "route tracking". The spec deliberately avoids promising ETA or real-time features (both are explicitly out-of-scope in spec §2). This creates driver expectations the product cannot fulfill.

---

### DR-003 — Pre-prompt bullet points mismatch
**Severity**: Minor  
**Category**: Copy mismatch  
**Requires**: Engineer-only fix

| | UX Spec | Implementation |
|-|-----|------|
| Bullets | 3 bullets: "Tracking starts when you depart" / "Tracking stops when you arrive at the destination" / "Location is only recorded during this trip" | No bullet points — replaced with a second paragraph about "Allow 'Always'" |

The bullet points are privacy trust devices — they communicate the bounded nature of tracking. The "Always" paragraph shifts the framing toward requesting more invasive permissions rather than explaining boundaries.

---

### DR-004 — Pre-prompt "Not Now" is `OutlinedButton`, spec says `TextButton`
**Severity**: Minor  
**Category**: Design system compliance  
**Requires**: Engineer-only fix

| | UX Spec (status-copy-and-messaging §3) | Implementation |
|-|-----|------|
| Secondary button | Text (ghost) button | `OutlinedButton` (visible border) |

Per the UX spec and mobile-design-system.md, "Not Now" is a de-emphasized dismissal — not an alternative action. An outlined button gives it equal visual weight to "Continue".

---

### DR-005 — `AWAITING_PERMISSION.displayLabel` mismatch
**Severity**: Minor  
**Category**: Copy mismatch  
**Requires**: Engineer-only fix

| | UX Spec (tracking-state-inventory §1) | Implementation (`TrackingState.kt`) |
|-|-----|------|
| Label | **"GPS Off"** | **"Requesting…"** |

The spec says AWAITING_PERMISSION renders identically to INACTIVE — the driver should not see transient system state. "Requesting…" exposes internal implementation detail.

---

### DR-006 — `SIGNAL_LOST.isActive` should be `true`
**Severity**: Major  
**Category**: Logic mismatch  
**Requires**: Engineer-only fix

| | UX Spec (tracking-state-inventory §1, spec §3.3) | Implementation (`TrackingState.kt`) |
|-|-----|------|
| `isActive` for SIGNAL_LOST | **Active** — tracking continues to attempt, GPS hardware is still polled, foreground service/notification is maintained | `isActive = false` |

SIGNAL_LOST is **not inactive** — it means "tracking is running but GPS can't obtain a fix". The system still captures points if signal returns. The foreground service (Android) and notification must persist during SIGNAL_LOST. Setting `isActive = false` means the Android foreground notification could be dismissed and the service stopped — breaking the resilience contract.

This also affects `DataSourceToggleGuard` which checks `isActive` to block switching.

---

### DR-007 — Banner copy diverges from spec across all 6 variants
**Severity**: Major  
**Category**: Copy mismatch — driver-facing messaging  
**Requires**: Engineer-only fix

| Banner | UX Spec (status-copy-and-messaging §3) | Implementation |
|--------|-----|------|
| Permission denied | "Location tracking is off. Trip can continue without GPS." | "Location permission denied / Trip will continue without GPS tracking" |
| Background limited | "Background tracking is limited. Location may not be recorded when you switch apps." | "Background location not enabled / GPS tracking may pause when app is in background" |
| Permanently denied | Same as denied + "Enable in Settings" link | "Location permission blocked / Go to Settings to enable location access for AxleOps" |
| Device location off | "Your device location is turned off." + "Turn On Location" action | "Device location is turned off / Turn on Location in device settings for GPS tracking" (no action button) |
| GPS signal lost | "GPS signal lost. Location tracking will resume when signal is available." | "GPS signal lost / Location tracking will resume when signal is available" ✅ (close) |
| Reduced accuracy | "Approximate location only. Trip tracking may be less accurate." | "Using approximate location / Enable precise location for accurate trip tracking" |

Key problems:
- The spec explicitly says **never blame the driver** — "Location permission denied" violates this. The correct copy is "Location tracking is off."
- "Location permission blocked" uses technical framing — the spec says "no jargon".
- `DeviceLocationOffBanner` is missing the "Turn On Location" action button (spec says it must have a system settings shortcut).
- Copy tone guidelines §6 say "be direct, no blame, no urgency theater" — several banners introduce blame or directive language.

---

### DR-008 — Banner uses emojis instead of Material icons
**Severity**: Minor  
**Category**: Design system compliance  
**Requires**: Engineer-only fix

The UX spec (status-copy-and-messaging §3) specifies Material icons (`ic_warning`, `ic_info`, `ic_location_off`, `ic_gps_not_fixed`, `ic_battery_alert`) at 24dp. The implementation uses emoji characters (📍, 🔒, 📡). Emojis render differently per device OEM/OS version and break visual consistency with the design system.

---

### DR-009 — Banner does not use design system color tokens
**Severity**: Minor  
**Category**: Design system compliance  
**Requires**: Engineer-only fix

The UX spec mandates `color.warning at 10% opacity` / `color.info at 10% opacity` / `color.error at 10% opacity` backgrounds. The implementation uses hardcoded hex values (`Color(0xFFFEF3C7)` = Amber-100, `Color(0xFFFEE2E2)` = Red-100). These are close approximations but don't use the semantic tokens, which means they won't adapt to theme changes.

---

### DR-010 — Battery optimization banner missing
**Severity**: Minor  
**Category**: Missing implementation  
**Requires**: Engineer-only fix

The UX spec defines a 7th banner (status-copy-and-messaging §3.7): "Battery optimization may affect location tracking" with a "Learn More" action linking to device battery settings. This banner is not implemented in `LocationPermissionBanner.kt`. The `AndroidBatteryHelper` exists but is not wired to a banner.

---

### DR-011 — Tracking indicator icon for SIGNAL_LOST uses `SignalWifiOff`
**Severity**: Minor  
**Category**: Design system compliance  
**Requires**: Engineer-only fix

| | UX Spec (status-copy-and-messaging §1) | Implementation |
|-|-----|------|
| SIGNAL_LOST icon | `ic_gps_not_fixed` (slash overlay) | `Icons.Filled.SignalWifiOff` |

`SignalWifiOff` is a Wi-Fi icon, not a GPS icon. The spec says `ic_gps_not_fixed` (a GPS-specific icon with a diagonal slash). Using a Wi-Fi icon for a GPS concern creates confusion about what type of signal was lost.

---

### DR-012 — Tracking indicator animation cycle differs from spec
**Severity**: Minor  
**Category**: Animation spec mismatch  
**Requires**: Engineer-only fix

| | UX Spec (status-copy-and-messaging §1) | Implementation |
|-|-----|------|
| Pulse cycle | "once every 3 seconds (subtle, 150ms fade cycle using `motion.fade`)" | `tween(durationMillis = 1200)` with `RepeatMode.Reverse` = 2.4s full cycle |

The spec says 3s period with a 150ms fade. The implementation is a 2.4s smooth sinusoidal fade (1200ms + 1200ms reverse). The visual effect is different — the spec wants a brief "blink" every 3s, the implementation is a slow continuous pulse.

---

### DR-013 — Missing dismiss behavior and scope tracking for banners
**Severity**: Major  
**Category**: Behavior gap  
**Requires**: Engineer-only fix

The UX spec (data-dependencies.md §4) defines 3 dismiss scopes:
- **Per session** (in-memory): Permission denied banner — reappears on app restart
- **Per trip** (local storage): Background limited, reduced accuracy, battery optimization — once per `tripId`
- **Per install** (local storage): Pre-prompt shown flag

The current banner implementations have no dismiss state tracking. They are always rendered based on `LocationPermissionState` without checking:
- Has this banner been dismissed this session?
- Has this banner been dismissed for this trip?
- Is this the first departure after install?

Without this, dismissed banners reappear on every recomposition — annoying the driver and violating R9/R10.

---

### DR-014 — `DeviceLocationOffBanner` missing "Turn On Location" action
**Severity**: Minor  
**Category**: Missing behavior  
**Requires**: Engineer-only fix

The spec (status-copy-and-messaging §3.3) requires a "Turn On Location" action button that deep-links to the device's location settings. The implementation has `actionLabel = null, onAction = null` — the banner is informational-only with no affordance for resolution.

---

## 4. Issue Severity Summary

| Severity | Count | IDs |
|----------|-------|-----|
| **Critical** | 0 | — |
| **Major** | 5 | DR-001, DR-002, DR-006, DR-007, DR-013 |
| **Minor** | 9 | DR-003, DR-004, DR-005, DR-008, DR-009, DR-010, DR-011, DR-012, DR-014 |

---

## 5. Resolution Type Summary

| Type | IDs |
|------|-----|
| **Engineer-only fix** | All 14 |
| **UX package update** | None |
| **PM/spec clarification** | None |
| **Architecture change** | None |

---

## 6. Recommended Next Actions

### Immediate (Fix Round 1)

1. **Fix all copy** (DR-001, DR-002, DR-003, DR-005, DR-007) — update to **exact** strings from status-copy-and-messaging.md. No creative deviation from approved copy.
2. **Fix `SIGNAL_LOST.isActive = true`** (DR-006) — cascade check: ensure foreground service and notification persist during SIGNAL_LOST.
3. **Implement banner dismiss state tracking** (DR-013) — add `DismissStateTracker` with per-session (in-memory), per-trip (local KV), and per-install (local KV) scopes.
4. **Replace emojis with Material icons** in banners (DR-008).
5. **Add missing "Turn On Location" action** to `DeviceLocationOffBanner` (DR-014).
6. **Add battery optimization banner** wired to `AndroidBatteryHelper` (DR-010).

### Short-term (Fix Round 2)
7. **Fix "Not Now" to TextButton** (DR-004).
8. **Fix SIGNAL_LOST icon** to `GpsNotFixed` or equivalent (DR-011).
9. **Adjust pulse animation** to 3s cycle per spec (DR-012).
10. **Wire color tokens** from theme instead of hardcoded hex (DR-009).
