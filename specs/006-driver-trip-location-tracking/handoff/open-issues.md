# Open Issues — Driver Trip Location Tracking & Background Telemetry

**Feature**: 006-driver-trip-location-tracking  
**PM Triage Date**: 2026-03-29  
**Sources**: design-review-round-1.md (14 issues), qa-report-round-1.md (24 failures, 19 unique)  
**Feature Status**: **Ready for Fix Round**

---

## Feature Gate Decision

| Gate | Verdict |
|------|---------|
| Architecture | ✅ Approved — no changes needed |
| State machine correctness | ✅ Approved — all 7 states, 10 transitions correct |
| Offline buffer / sync | ✅ Approved — write-through, backoff, auth-stop all correct |
| Platform resilience (Android) | ✅ Approved — ForegroundService, AlarmManager, BootReceiver |
| Platform resilience (iOS) | ✅ Approved — background mode, significant location, AppDelegate |
| Mock/real switching | ✅ Approved — toggle guard prevents mid-tracking switch |
| Active Trip integration | ✅ Approved — auto-start/stop, no new navigation |
| **Driver-facing messaging** | ❌ **Not approved** — 13 copy/icon/dismiss issues |
| **SIGNAL_LOST logic** | ❌ **Not approved** — `isActive = false` creates re-entry bug |

**Verdict**: The tracking engine is production-grade. The driver-facing presentation layer requires a fix round before field deployment. No spec, UX, or plan updates are needed — the specs are correct and the implementation diverges from them.

---

## Issue Register

### OI-001 — SIGNAL_LOST.isActive = false (Logic Bug)

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Major |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-006, F-006 |
| **Risk Class** | Background behavior correctness |

**Problem**: `TrackingState.SIGNAL_LOST` has `isActive = false`. During signal loss, `ActiveTripComponent.updateTrackingForTrip()` sees `isActive = false` and may call `start()` again — creating a duplicate tracking instance. The Android foreground notification logic may also be affected.

**Fix**: Set `isActive = true` for SIGNAL_LOST. Verify `ActiveTripComponent` re-entry guard, `DataSourceToggleGuard` inclusion of SIGNAL_LOST, and notification persistence.

**Downstream impact if unresolved**: During GPS signal loss (tunnels, urban canyons), tracking could restart and create duplicate capture loops, doubling battery drain and corrupting the point timeline. This is a **field reliability risk** on real driver routes.

---

### OI-002 — Banner Dismiss State Tracking Missing

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Major |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-013, F-012 |
| **Risk Class** | Driver trust / UX reliability |

**Problem**: No dismiss-state tracking for any of the 7 warning banners. Dismissed banners reappear on every screen recomposition. The spec defines 3 dismiss scopes: per-session (in-memory), per-trip (local KV store by tripId), per-install (local KV store).

**Fix**: Implement `BannerDismissTracker` with the 3 scopes. Wire into `LocationPermissionBanner`.

**Downstream impact if unresolved**: Drivers will be repeatedly interrupted by banners they've already acknowledged. In a real fleet, this trains drivers to ignore all banners — including critical ones (exception alerts, EWB blocks). Degrades trust in the entire Active Trip notification system.

---

### OI-003 — Pre-Prompt Copy Diverges From Spec

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Major |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-001, DR-002, DR-003, F-001, F-002 |
| **Risk Class** | Misleading driver messaging |

**Problem**: Pre-prompt title says "Enable Location Tracking" (spec: "Trip Location Tracking"). Body introduces "real-time visibility", "ETA updates", "route tracking" — all explicitly out of scope (spec §2). Missing 3 bullet points that communicate tracking boundaries (starts at departure / stops at destination / only this trip).

**Fix**: Replace title, body, and add bullet points with exact copy from status-copy-and-messaging.md §2.

**Downstream impact if unresolved**: Drivers expect ETA and route features. When those don't exist, they lose trust in the app's honesty. In fleet environments, misleading permission rationales can also create labor/union issues about surveillance scope.

---

### OI-004 — All 6 Banner Copies Diverge From Spec

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Major |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-007, F-007, F-008, F-009, F-011 |
| **Risk Class** | Misleading driver messaging |

**Problem**: All 6 banner texts deviate from the approved copy. Key violation: "Location permission denied" uses blame language — spec explicitly says "never blame the driver". Correct: "Location tracking is off."

| Banner | Implementation | Spec |
|--------|---------------|------|
| Permission denied | "Location permission denied" | "Location tracking is off" |
| Background limited | "Background location not enabled" | "Background tracking is limited" |
| Permanently denied | "Location permission blocked" | "Location tracking is off" + Settings |
| Device location off | "Device location is turned off" | "Your device location is turned off" |
| Reduced accuracy | "Using approximate location" | "Approximate location only" |

**Fix**: Replace with exact spec strings.

**Downstream impact if unresolved**: Blame-language ("denied", "blocked") creates adversarial framing between the app and the driver. In fleet apps, this escalates to driver complaints, support tickets, and potential non-compliance with permission transparency rules.

---

### OI-005 — Device Location Off Banner Missing Action Button

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-014, F-010 |
| **Risk Class** | Permission correctness |

**Problem**: `DeviceLocationOffBanner` has no action button. Spec requires "Turn On Location" that deep-links to device location settings.

**Fix**: Add `onAction` callback that opens device location settings.

**Downstream impact if unresolved**: Driver sees "location is off" but has no affordance to fix it. They must navigate settings manually — many won't, resulting in a permanently degraded trip.

---

### OI-006 — Permission Revocation Banner Not Distinct

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | F-019 |
| **Risk Class** | Permission-state clarity |

**Problem**: When permission is revoked mid-tracking, the generic "ForegroundDeniedBanner" is shown. Spec requires a distinct message: "Location permission was removed. Tracking has stopped."

**Fix**: Add `PermissionRevokedBanner` variant; wire to detect revocation vs initial denial.

**Downstream impact if unresolved**: Driver doesn't realize tracking was actively stopped — they think it might still be running in some capacity. Breaks the trust contract that the app is transparent about its tracking state.

---

### OI-007 — Battery Optimization Banner Missing

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-010, F-015 |
| **Risk Class** | Background tracking correctness |

**Problem**: `AndroidBatteryHelper` exists and detects OEM + battery optimization status, but no banner is wired to show the driver that battery optimization may affect tracking.

**Fix**: Add `BatteryOptimizationBanner` composable; wire to `AndroidBatteryHelper.isIgnoringBatteryOptimizations()`.

**Downstream impact if unresolved**: On Xiaomi/Oppo/Samsung devices, the OS may silently kill background tracking. The driver won't know why gaps appear in their trip log, and fleet ops won't understand the data quality issue.

---

### OI-008 — Banners Use Emojis Instead of Material Icons

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-008, F-013 |
| **Risk Class** | UX consistency |

**Problem**: `TrackingBanner` renders emoji characters (📍, 🔒, 📡). Emojis render differently per OEM/OS version. Spec says Material icons (`ic_warning`, `ic_info`, etc.) at 24dp.

**Fix**: Replace emoji with Material icon composables.

---

### OI-009 — Banners Use Hardcoded Colors

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-009, F-014 |
| **Risk Class** | UX consistency |

**Problem**: Banners use `Color(0xFFFEF3C7)` etc. instead of semantic theme tokens. Won't adapt to future dark mode or theme changes.

**Fix**: Use `MaterialTheme.colorScheme` tokens.

---

### OI-010 — SIGNAL_LOST Icon Is WiFi Instead of GPS

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-011, F-016 |
| **Risk Class** | UX clarity |

**Problem**: `TrackingIndicator` uses `Icons.Filled.SignalWifiOff` for SIGNAL_LOST. This icon represents WiFi, not GPS. Spec says `ic_gps_not_fixed`.

**Fix**: Change to `Icons.Filled.GpsNotFixed`.

---

### OI-011 — Tracking Indicator Pulse Cycle Mismatch

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-012, F-017 |
| **Risk Class** | UX consistency |

**Problem**: Pulse is 2.4s smooth sinusoidal. Spec says 3s period with 150ms fade.

**Fix**: Adjust animation spec to match.

---

### OI-012 — Pre-Prompt "Not Now" Button Style

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-004, F-003 |
| **Risk Class** | UX consistency |

**Problem**: `OutlinedButton` gives "Not Now" equal visual weight to "Continue". Spec says ghost/text button.

**Fix**: Change to `TextButton`.

---

### OI-013 — AWAITING_PERMISSION Label Shows "Requesting…"

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | DR-005, F-005 |
| **Risk Class** | UX consistency |

**Problem**: AWAITING_PERMISSION should render identically to INACTIVE ("GPS Off"). "Requesting…" exposes internal state.

**Fix**: Change `displayLabel` to "GPS Off".

---

### OI-014 — Android Notification Not Updated Per State

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | F-018 |
| **Risk Class** | Background behavior correctness |

**Problem**: `LocationTrackingService.updateNotification()` exists but is never called. Notification text remains "Location tracking active" even during SIGNAL_LOST or ACTIVE_DEGRADED.

**Fix**: Wire `TrackingManager` state observation to call `updateNotification()` on transitions.

---

### OI-015 — iOS Info.plist Usage Descriptions Reference Out-of-Scope Features

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Minor |
| **Owner** | Engineer |
| **Resolution** | Engineer can fix directly |
| **Source** | F-004 |
| **Risk Class** | Misleading driver messaging / App Store risk |

**Problem**: `NSLocationAlwaysAndWhenInUseUsageDescription` says "accurate ETA updates and route tracking" — neither feature exists.

**Fix**: Update to match spec: "...to continue tracking trip progress when the app is minimized."

**Downstream impact if unresolved**: Apple Review may ask about ETA/route features. If they aren't present, this could delay App Store approval.

---

## Ownership Summary

| Owner | Issue Count | IDs |
|-------|-------------|-----|
| **Engineer** | 15 | OI-001 through OI-015 |
| PM | 0 | — |
| Designer | 0 | — |
| Architect | 0 | — |
| Backend follow-up | 0 | — |
| Platform follow-up | 0 | — |

All 15 issues are **engineer-fixable**. The UX specs are correct — the implementation diverges from them. No artifact updates are required before the fix round.

---

## Resolution Path Summary

| Resolution | Count | IDs |
|------------|-------|-----|
| **Engineer can fix directly** | 15 | All |
| UX artifacts must be updated first | 0 | — |
| Spec must be updated first | 0 | — |
| Plan must be updated first | 0 | — |
| Blocked | 0 | — |

---

## Fix Round Prioritization

### Fix Round 1 — Must Fix (5 Major + 3 High-Risk Minor)

| Order | ID | Summary | Risk if Skipped |
|-------|----|---------|-----------------|
| 1 | OI-001 | `SIGNAL_LOST.isActive = true` | Duplicate tracking loops in tunnels |
| 2 | OI-002 | Banner dismiss-state tracking | Driver banner fatigue → ignores all warnings |
| 3 | OI-003 | Pre-prompt copy (title + body + bullets) | Misleading about feature scope |
| 4 | OI-004 | All 6 banner copies | Blame language → driver complaints |
| 5 | OI-005 | Device Location Off action button | No path to fix for driver |
| 6 | OI-006 | Permission revocation banner | Driver unaware tracking stopped |
| 7 | OI-007 | Battery optimization banner | Silent data gaps on aggressive OEMs |
| 8 | OI-015 | iOS plist usage descriptions | App Store rejection risk |

### Fix Round 2 — Should Fix (7 Minor)

| Order | ID | Summary |
|-------|----|---------|
| 9 | OI-008 | Replace emojis with Material icons |
| 10 | OI-009 | Use theme color tokens |
| 11 | OI-010 | Fix SIGNAL_LOST icon to GPS |
| 12 | OI-011 | Adjust pulse animation to 3s cycle |
| 13 | OI-012 | "Not Now" → TextButton |
| 14 | OI-013 | AWAITING_PERMISSION label → "GPS Off" |
| 15 | OI-014 | Wire notification state updates |

---

## Downstream Impact on Active Trip Reliability

> [!CAUTION]
> **If OI-001 is unresolved**: GPS signal loss during real-world driving (tunnels, parking garages, dense urban areas) will cause `ActiveTripComponent` to re-trigger `TrackingManager.start()`, potentially creating duplicate capture loops. This **doubles battery drain** and **corrupts the point timeline** sent to fleet operations. This is the only issue that affects the reliability of data being sent to the backend.

> [!WARNING]
> **If OI-002 + OI-004 are unresolved**: The Active Trip screen becomes visually noisy with persistent, non-dismissible warning banners. Combined with blame-language copy, this creates a hostile driver experience. Drivers will minimize app usage, defeating the purpose of the tracking feature. This is a **fleet adoption risk**, not a technical risk.

> [!NOTE]
> **If OI-007 is unresolved**: On Xiaomi/Oppo/Samsung/Huawei devices (~40% of the Android fleet in India), background tracking will silently fail. Fleet ops will see trip location gaps with no explanation. The `AndroidBatteryHelper` already detects these OEMs — the only gap is showing the driver a banner. This is a **data quality risk** specific to the Indian market deployment.

All other issues (OI-003, OI-005, OI-006, OI-008–OI-015) are presentation-layer polish. They affect user experience quality but do not compromise the reliability of tracking data or Active Trip functionality.
