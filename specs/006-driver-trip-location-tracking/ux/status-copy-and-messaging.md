# Status Copy and Messaging — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Design Token Reference**: [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)  
> **Date**: 2026-03-29

---

## 1. Tracking Indicator Copy

These are the **exact strings and icons** shown in the trip detail header tracking indicator.

| Tracking State | Icon | Icon Color Token | Label Text | Typography |
|---------------|------|-----------------|-----------|-----------|
| INACTIVE | `ic_gps_off` (outline) | `color.on.surface.variant` | "GPS Off" | `type.label` |
| AWAITING_PERMISSION | `ic_gps_off` (outline) | `color.on.surface.variant` | "GPS Off" | `type.label` |
| ACTIVE | `ic_gps_fixed` (filled, pulse anim) | `color.success` | "Tracking" | `type.label` |
| ACTIVE_DEGRADED | `ic_gps_fixed` (filled, no pulse) | `color.warning` | "Limited GPS" | `type.label` |
| SIGNAL_LOST | `ic_gps_not_fixed` (slash) | `color.error` | "No Signal" | `type.label` |
| PERMISSION_DENIED | `ic_gps_off` (slash) | `color.warning` | "No GPS Permission" | `type.label` |
| STOPPED | `ic_gps_off` (outline) | `color.on.surface.variant` | "Tracking Complete" | `type.label` |

**Indicator animation**: When ACTIVE, the GPS icon pulses once every 3 seconds (subtle, 150ms fade cycle using `motion.fade`). No animation for any other state.

---

## 2. Pre-Prompt Bottom Sheet Copy

### Title
**"Trip Location Tracking"**  
Typography: `type.title`

### Body
**"AxleOps tracks your vehicle location during transit to help fleet operations monitor delivery progress and maintain compliance."**  
Typography: `type.body`

### Bullet Points
- "Tracking starts when you depart"
- "Tracking stops when you arrive at the destination"
- "Location is only recorded during this trip"

Typography: `type.body`, icon: `•` bullet, `space.sm` between items

### Buttons
| Button | Label | Style |
|--------|-------|-------|
| Primary | "Continue" | Primary filled button |
| Secondary | "Not Now" | Text (ghost) button |

---

## 3. Warning Banners

All banners use the existing inline banner pattern from the design system: full-width, icon + text + optional action, colored per severity.

### 3.1 Location Permission Denied (Persistent)

| Property | Value |
|----------|-------|
| Background | `color.warning` at 10% opacity |
| Icon | `ic_warning` (24dp) |
| Icon color | `color.warning` |
| Text | "Location tracking is off. Trip can continue without GPS." |
| Text color | `color.on.surface` |
| Action | "Enable in Settings" → opens app settings |
| Action style | Text button, `color.warning` text |
| Dismissible | Yes, with `×` icon. Reappears once per app session. |

### 3.2 Background Tracking Limited (One-Time)

| Property | Value |
|----------|-------|
| Background | `color.info` at 10% opacity |
| Icon | `ic_info` (24dp) |
| Icon color | `color.info` |
| Text | "Background tracking is limited. Location may not be recorded when you switch apps." |
| Action | "Enable" → opens app settings |
| Action style | Text button, `color.info` text |
| Dismissible | Yes. Does not reappear for this trip once dismissed. |

### 3.3 Device Location Turned Off (Persistent)

| Property | Value |
|----------|-------|
| Background | `color.warning` at 10% opacity |
| Icon | `ic_location_off` (24dp) |
| Icon color | `color.warning` |
| Text | "Your device location is turned off." |
| Action | "Turn On Location" → opens device location settings |
| Action style | Text button, `color.warning` text |
| Dismissible | No. Disappears when device location is enabled. |

### 3.4 Permission Revoked During Tracking (One-Time)

| Property | Value |
|----------|-------|
| Background | `color.warning` at 10% opacity |
| Icon | `ic_warning` (24dp) |
| Icon color | `color.warning` |
| Text | "Location permission was removed. Tracking has stopped." |
| Action | "Go to Settings" → opens app settings |
| Action style | Text button, `color.warning` text |
| Dismissible | Yes. Does not reappear once dismissed. |

### 3.5 GPS Signal Lost (Auto-Clearing)

| Property | Value |
|----------|-------|
| Background | `color.error` at 10% opacity |
| Icon | `ic_gps_not_fixed` (24dp) |
| Icon color | `color.error` |
| Text | "GPS signal lost. Location tracking will resume when signal is available." |
| Action | None |
| Dismissible | No. Auto-clears when GPS fix is re-acquired. |

### 3.6 Reduced Accuracy (iOS, Informational)

| Property | Value |
|----------|-------|
| Background | `color.info` at 10% opacity |
| Icon | `ic_info` (24dp) |
| Icon color | `color.info` |
| Text | "Approximate location only. Trip tracking may be less accurate." |
| Action | None |
| Dismissible | Yes. Does not reappear for this trip. |

### 3.7 Battery Optimization Active (One-Time, Android)

| Property | Value |
|----------|-------|
| Background | `color.info` at 10% opacity |
| Icon | `ic_battery_alert` (24dp) |
| Icon color | `color.info` |
| Text | "Battery optimization may affect location tracking." |
| Action | "Learn More" → opens device battery optimization settings |
| Action style | Text button, `color.info` text |
| Dismissible | Yes. Shown once per trip. |

---

## 4. Foreground Notification Copy (Android)

### Active Tracking

| Property | Value |
|----------|-------|
| Channel name | "Trip Tracking" |
| Channel importance | Low (no sound, no vibration) |
| Title | "AxleOps — Trip in progress" |
| Body | "Trip {tripNumber} · Location tracking active" |
| Small icon | App icon (monochrome) |
| Large icon | None |
| Ongoing | Yes (non-dismissible) |
| Tap action | Opens the app → Active Trip screen |

### Degraded Tracking

| Property | Value |
|----------|-------|
| Title | "AxleOps — Trip in progress" |
| Body | "Trip {tripNumber} · Location tracking limited" |
| All other properties | Same as active |

### Signal Lost

| Property | Value |
|----------|-------|
| Title | "AxleOps — Trip in progress" |
| Body | "Trip {tripNumber} · GPS signal lost" |
| All other properties | Same as active |

---

## 5. Pending Sync Badge

| Property | Value |
|----------|-------|
| Location | Adjacent to tracking indicator in trip header |
| Visibility | Only visible when buffered (unsynced) location points exist |
| Format | Count badge: "{N}" (e.g., "3") |
| Badge color | `color.warning` background, white text |
| Badge size | 20dp × 20dp circle |
| Typography | `type.label`, white, centered |
| Clears | When all buffered points sync successfully |

---

## 6. Copy Tone Guidelines

| Principle | Application |
|-----------|-------------|
| **Be direct** | "Location tracking is off." not "We noticed your location services may be disabled." |
| **Explain consequences** | "Trip can continue without GPS." — tell the driver what happens, not just what's wrong. |
| **Offer resolution** | "Enable in Settings" — always give the driver a path forward. |
| **No blame** | Never "You denied permission." Always "Location tracking is off." |
| **No jargon** | "GPS" is acceptable. "ACCESS_BACKGROUND_LOCATION" is not. "Foreground service" is not. |
| **No urgency theater** | No exclamation marks in warnings. No red text for non-critical states. Amber for information, red only for signal loss or errors. |
