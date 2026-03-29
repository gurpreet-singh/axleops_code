# Tracking State Inventory — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Source of Truth**: [spec.md §3, §5](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/spec.md)  
> **Related**: [Active Trip State Inventory](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/state-inventory.md)  
> **Date**: 2026-03-29

---

## 1. Tracking States (Complete Enumeration)

The tracking subsystem has exactly **7 states**. These are orthogonal to the trip sub-state — tracking state is a parallel concern layered on top of the trip lifecycle.

| # | Tracking State | Icon | Icon Color | Label | Description |
|---|---------------|------|-----------|-------|-------------|
| 1 | **INACTIVE** | GPS icon (outline) | `color.on.surface.variant` (Gray 500) | "GPS Off" | No tracking. Trip is in a non-transit state (pre-departure or post-arrival). |
| 2 | **AWAITING_PERMISSION** | GPS icon (outline) | `color.on.surface.variant` | "GPS Off" | Departure triggered but permission not yet resolved. Transient (~2s). |
| 3 | **ACTIVE** | GPS icon (filled, pulsing) | `color.success` (Green 600) | "Tracking" | Tracking is running. Points are being captured at the specified interval. |
| 4 | **ACTIVE_DEGRADED** | GPS icon (filled) | `color.warning` (Amber 600) | "Limited GPS" | Tracking is running but with reduced capability (background denied, approximate accuracy, weak signal). |
| 5 | **SIGNAL_LOST** | GPS icon (filled, slash overlay) | `color.error` (Red 600) | "No Signal" | GPS hardware cannot obtain a fix. Tracking continues to attempt. |
| 6 | **PERMISSION_DENIED** | GPS icon (outline, slash overlay) | `color.warning` (Amber 600) | "No GPS Permission" | Driver denied location permission. No tracking possible. |
| 7 | **STOPPED** | GPS icon (outline) | `color.on.surface.variant` | "Tracking Complete" | Tracking was active but has stopped. Trip reached AT_DESTINATION or later. |

---

## 2. State Transitions

```
                          ┌──────────────────────────┐
                          │       INACTIVE            │
                          │  (non-transit trip state)  │
                          └─────────┬────────────────┘
                                    │
                             Trip departs
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │ AWAITING_PERMISSION  │
                        └──────┬──────┬───────┘
                               │      │
                          Granted    Denied
                               │      │
                    ┌──────────┘      └──────────┐
                    ▼                             ▼
              ┌──────────┐               ┌──────────────────┐
              │  ACTIVE   │               │ PERMISSION_DENIED │
              └───┬──┬───┘               └──────────────────┘
                  │  │
        ┌─────────┘  └──────────┐
        │                       │
  Background denied /      GPS hardware
  accuracy reduced           no fix
        │                       │
        ▼                       ▼
┌────────────────┐      ┌─────────────┐
│ ACTIVE_DEGRADED │      │ SIGNAL_LOST  │
└───────┬────────┘      └──────┬──────┘
        │                       │
  Background granted /      Signal re-acquired
  accuracy restored             │
        │                       │
        └───────┬───────────────┘
                │
                ▼
          ┌──────────┐
          │  ACTIVE   │
          └─────┬────┘
                │
          Trip arrives at
          destination
                │
                ▼
          ┌──────────┐
          │  STOPPED  │
          └──────────┘
```

### Transition Rules

| From | To | Trigger |
|------|-----|---------|
| INACTIVE → AWAITING_PERMISSION | Trip sub-state becomes DEPARTED | Automatic |
| AWAITING_PERMISSION → ACTIVE | Foreground (or full) permission granted | Automatic |
| AWAITING_PERMISSION → ACTIVE_DEGRADED | Foreground only granted (background denied) OR reduced accuracy granted | Automatic |
| AWAITING_PERMISSION → PERMISSION_DENIED | All location permission denied, or "Not Now" on pre-prompt | Automatic |
| ACTIVE → ACTIVE_DEGRADED | Background permission revoked, OR GPS accuracy drops below threshold | Automatic |
| ACTIVE → SIGNAL_LOST | 2+ consecutive capture intervals fail to get a GPS fix | Automatic |
| ACTIVE_DEGRADED → ACTIVE | Background permission granted (via Settings), OR accuracy restored | Automatic |
| SIGNAL_LOST → ACTIVE | GPS fix re-acquired | Automatic |
| ACTIVE / ACTIVE_DEGRADED / SIGNAL_LOST → STOPPED | Trip sub-state exits transit (AT_DESTINATION or later) | Automatic |
| PERMISSION_DENIED → ACTIVE | Permission granted via Settings (detected on app resume) | Automatic |
| Any tracking state → INACTIVE | Trip moves to non-transit state without having entered DEPARTED first | Reset |

---

## 3. State Precedence with Active Trip States

Tracking state is displayed **alongside** the trip sub-state, not instead of it. The precedence model from the Active Trip state inventory (§5) is extended:

```
Exception Active (highest — red banner, actions disabled)
    ↓
EWB Blocking (departure blocked)
    ↓
Offline (banner visible, stale data)
    ↓
Tracking State Warning (amber/red tracking indicator + optional inline notice)
    ↓
Normal Sub-State (standard trip card + CTA)
```

**Rule**: Tracking warnings are **informational** and never supersede exception banners, EWB blocking, or offline indicators. They coexist in the header — they don't replace other status elements.

---

## 4. Tracking State × Trip Sub-State Matrix

| Trip Sub-State | Expected Tracking State | Notes |
|---------------|------------------------|-------|
| DISPATCHED | INACTIVE | Pre-departure |
| ACCEPTED | INACTIVE | Pre-departure |
| AT_ORIGIN | INACTIVE | At loading point, not yet in transit |
| LOADING | INACTIVE | Static at loading dock |
| LOADED | INACTIVE | Awaiting departure |
| EWB_PENDING | INACTIVE | Blocked — vehicle should not move |
| **DEPARTED** | **ACTIVE / ACTIVE_DEGRADED / PERMISSION_DENIED** | **Tracking starts here** |
| **IN_TRANSIT** | **ACTIVE / ACTIVE_DEGRADED / SIGNAL_LOST** | **Primary tracking window** |
| **AT_CHECKPOINT** | **ACTIVE / ACTIVE_DEGRADED** | Still in transit corridor |
| **AT_DESTINATION** | **STOPPED** | Tracking ends |
| UNLOADING | STOPPED / INACTIVE | Post-transit |
| DELIVERED | INACTIVE | Post-transit |
| POD_SUBMITTED | INACTIVE | Trip closing |
| Exception (during transit) | **ACTIVE / ACTIVE_DEGRADED / SIGNAL_LOST** | Tracking continues during exceptions |
| CANCELLED | INACTIVE | Trip terminated |

---

## 5. Foreground Notification State (Android Only)

The Android foreground notification mirrors the tracking state:

| Tracking State | Notification Visible? | Notification Content |
|---------------|----------------------|---------------------|
| INACTIVE | ❌ Not shown | — |
| AWAITING_PERMISSION | ❌ Not shown | — |
| ACTIVE | ✅ Shown | "AxleOps — Trip [TRP-XXX] in progress. Location tracking active." |
| ACTIVE_DEGRADED | ✅ Shown | "AxleOps — Trip [TRP-XXX] in progress. Location tracking limited." |
| SIGNAL_LOST | ✅ Shown | "AxleOps — Trip [TRP-XXX] in progress. GPS signal lost." |
| PERMISSION_DENIED | ❌ Not shown | No foreground service running |
| STOPPED | ❌ Dismissed | Notification dismissed on transition |
