# Permission Flow — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Source of Truth**: [spec.md §4](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/spec.md)  
> **Date**: 2026-03-29

---

## 1. When Permissions Are Requested

Permissions are requested **exactly once** in the trip lifecycle: at the point of departure.

| Trigger | Moment | Why Here |
|---------|--------|----------|
| Driver taps "Depart" CTA | LOADED → DEPARTED transition | The driver has just committed to driving. Location tracking is immediately relevant. The request is contextual, not abstract. |

**Not requested at**:
- App launch ❌
- Login ❌
- Trip acceptance ❌
- Any other milestone ❌
- App settings ❌

---

## 2. Pre-Prompt Sequence

Before the OS permission dialog, the app shows an explanatory bottom sheet. This is the **rationale UX** — it sets context so the driver understands the OS dialog that follows.

### 2.1 Flow Diagram

```
Driver taps "Depart"
    │
    ▼
┌─ Is foreground location permission granted? ─┐
│                                                │
│  YES                                      NO   │
│   │                                        │   │
│   ▼                                        ▼   │
│  Is background permission granted?    Show Pre-Prompt
│   │           │                      Bottom Sheet
│  YES         NO                          │
│   │           │                     ┌────┴────┐
│   │           ▼                     │         │
│   │     Show background             "Continue" "Not Now"
│   │     upgrade notice               │         │
│   │          │                       ▼         ▼
│   │     ┌────┴────┐          Show OS Dialog   Skip
│   │     │         │              │           (warning
│   │  "Continue" "Skip"          ▼            shown)
│   │     │         │        Grant / Deny
│   │     ▼         ▼             │
│   │   OS Dialog  Skip     ┌─────┴─────┐
│   │     │       (proceed)  │           │
│   │     ▼                Grant      Deny
│   │  Grant/Deny            │           │
│   │     │              Check for       │
│   ▼     ▼              background      ▼
│                        (see 2.2)    Proceed
│                                    with warning
│
└── Proceed with departure transition ──────────────┘
```

**Critical rule**: Regardless of permission outcome, the departure transition ALWAYS proceeds. Permission denial does not block the trip.

### 2.2 Android Two-Step Sequence

Android 10+ requires requesting foreground location first, then background location as a separate step.

| Step | Dialog | Timing |
|------|--------|--------|
| 1. Pre-prompt bottom sheet | App-rendered | On "Depart" tap, before OS dialog |
| 2. Foreground location OS dialog | `ACCESS_FINE_LOCATION` | After pre-prompt "Continue" |
| 3. Background location OS dialog | `ACCESS_BACKGROUND_LOCATION` | Immediately after foreground granted |

If the driver grants foreground but the OS background dialog has the "Allow all the time" option, it appears immediately. If the driver selects "Only while using the app", a background upgrade notice is shown later (see §4.3).

### 2.3 iOS Two-Step Sequence

iOS uses a progressive authorization model.

| Step | Dialog | Timing |
|------|--------|--------|
| 1. Pre-prompt bottom sheet | App-rendered | On "Depart" tap |
| 2. "When In Use" OS dialog | `requestWhenInUseAuthorization()` | After pre-prompt "Continue" |
| 3. "Always" upgrade prompt | `requestAlwaysAuthorization()` | Immediately after "When In Use" granted. iOS may show this as a separate system alert or as a deferred prompt. |

---

## 3. Pre-Prompt Bottom Sheet Content

### 3.1 Layout

Uses the standard Bottom Sheet component (`mobile-design-system.md` §2.7):

```
┌─────────────────────────────────────┐
│  ─────  (drag handle)               │
│                                     │
│  📍  Trip Location Tracking         │  ← type.title
│                                     │
│  AxleOps tracks your vehicle        │  ← type.body
│  location during transit to help    │
│  fleet operations monitor delivery  │
│  progress and maintain compliance.  │
│                                     │
│  • Tracking starts at departure     │  ← bullet list
│  • Tracking stops at arrival        │
│  • Only active during this trip     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │        Continue               │  │  ← Primary button
│  └───────────────────────────────┘  │
│                                     │
│        Not Now                      │  ← Text button
│                                     │
└─────────────────────────────────────┘
```

### 3.2 Behavior

| Action | Result |
|--------|--------|
| "Continue" | Dismisses sheet → triggers OS permission dialog |
| "Not Now" | Dismisses sheet → skips permission request → departure proceeds → warning banner shown |
| Swipe-dismiss | Same as "Not Now" |
| Back button | Same as "Not Now" |

---

## 4. Post-Permission States

### 4.1 Fully Granted (Foreground + Background)

- **Tracking starts immediately** after departure transition completes.
- Tracking indicator: green GPS icon + "Tracking" label.
- Android: foreground notification appears.
- No further permission prompts for this trip or future trips (until permission is revoked).

### 4.2 Foreground Only (Background Denied)

- **Foreground tracking works** while app is visible.
- Background tracking is **limited or absent**.
- Warning banner (non-blocking): "Background tracking limited. Location may not be recorded when you switch apps."
- Android: foreground service still runs (may work for background), but the OS may restrict it.
- iOS: tracking pauses when app backgrounds.
- **No re-prompt** for background permission during this trip.

### 4.3 Background Upgrade Notice

If the driver initially granted only "When In Use" or foreground-only, the app shows a **one-time inline notice** (not a bottom sheet) on the trip detail screen:

```
┌─────────────────────────────────────┐
│ ℹ️  Background tracking is limited. │
│ Location may not update when you    │
│ switch apps.  [Enable]              │
└─────────────────────────────────────┘
```

- Tapping "Enable" opens app permission settings (system Settings app, deep-linked to the app's permission page).
- This notice appears once per trip. If dismissed, it does not reappear for this trip.
- Uses `color.info` background (blue tint).

### 4.4 Fully Denied

- **No tracking occurs.**
- Warning banner (persistent per session): "Location tracking is off. Trip can continue without GPS."
- No trip blocking. All milestone actions remain available.
- "Enable in Settings" affordance included in the banner.

### 4.5 Permanently Denied ("Don't Ask Again" on Android)

- Same visual as 4.4 (fully denied).
- The "Enable in Settings" text button is the only resolution path.
- No further OS permission dialogs will appear (Android behavior).

### 4.6 Permission Revoked While Tracking

If the driver or OS revokes location permission during an active tracking session:

1. Tracking stops gracefully (no crash, no orphan notification).
2. On next app foreground, detect permission change.
3. Update tracking indicator to "Tracking Stopped" (amber).
4. Show inline notice: "Location permission was removed. Tracking has stopped. [Go to Settings]"
5. Foreground notification is dismissed (Android).
6. **Trip continues normally** — only tracking is affected.

---

## 5. Summary: Permission State × Driver Impact

| Permission State | Tracking | Warning Shown | Trip Blocked? | Driver Action Available |
|-----------------|----------|---------------|---------------|------------------------|
| Foreground + Background granted | ✅ Full | None | No | None needed |
| Foreground only granted | ⚠️ Foreground only | Background limited notice | No | "Enable" → Settings |
| All denied | ❌ None | Persistent warning banner | No | "Enable in Settings" |
| Permanently denied (Android) | ❌ None | Persistent warning + Settings link | No | Manual: Settings app |
| Revoked during tracking | ❌ Stops | Inline notice | No | "Go to Settings" |
| Reduced accuracy (iOS) | ⚠️ Low accuracy | "Approximate location" notice | No | None (informational) |
| Device location OFF | ❌ None | "Device location is turned off" + system shortcut | No | "Turn On Location" |
