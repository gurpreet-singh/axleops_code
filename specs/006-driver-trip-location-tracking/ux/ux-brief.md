# UX Brief — Driver Trip Location Tracking

> **Feature**: 006-driver-trip-location-tracking  
> **Target Role**: Driver  
> **Parent Feature**: [005-driver-active-trip](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/spec.md)  
> **Design System**: [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)  
> **Philosophy**: [mobile-design-philosophy.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md)  
> **Date**: 2026-03-29

---

## 1. Design Mandate

This feature is **not a new screen**. It is a **behavioral layer** that lives within the Active Trip experience. The driver should perceive location tracking as a natural consequence of working, not as a feature to configure, manage, or worry about.

> Tracking should feel like turning on headlights — it happens because conditions require it, not because the driver decided to.

The UX challenge here is not layout or navigation. It is **status clarity**, **permission trust**, and **degraded-mode transparency** — all within the existing Active Trip surface.

---

## 2. UX Objectives

| # | Objective | Design Implication |
|---|-----------|-------------------|
| 1 | **Tracking is automatic and invisible when working** | No "start tracking" button. No tracking settings. It begins with departure, ends with arrival. |
| 2 | **Tracking status is glanceable** | A single icon+label in the trip header communicates tracking state in < 1 second. |
| 3 | **Permission requests feel contextual, not intrusive** | Permission prompts appear at the moment of departure — where the driver understands why. Never at launch. |
| 4 | **Denied/degraded states are transparent, not punishing** | The trip continues. Warnings are clear but not blocking. The driver is never trapped by a permission choice. |
| 5 | **Offline resilience is visible** | If data is buffered, the driver knows. If it synced, the indicator updates. No silent failures. |
| 6 | **No new navigation patterns** | Everything integrates into the existing Active Trip card and detail screen. No new tabs, no new bottom sheets for tracking config. |
| 7 | **Trust through predictability** | The driver knows when they're tracked and when they're not. The boundary is trip state, not an arbitrary toggle. |

---

## 3. Integration Point: Active Trip Layer 1 (Status)

Per the Active Trip UX brief, Layer 1 is the always-visible status area:

```
Layer 1: Status (no scroll)
├── Trip phase badge
├── Milestone stepper (horizontal)
├── Exception banner (if active)
└── 🆕 Tracking status indicator  ←  THIS FEATURE
```

The tracking indicator is a **small, non-interactive element** in the trip header bar — same row as the trip number or phase badge. It uses the design system's existing badge/icon vocabulary:

- Icon: GPS/location icon (from existing icon set)
- Label: Short text (e.g., "Tracking", "No GPS")
- Color: Semantic (green/amber/red/gray) per tracking state

**It does NOT**:
- Float or overlay
- Require its own screen
- Open a bottom sheet
- Have a tap action (in v1 — future: tap to see tracking diagnostics)

---

## 4. Integration Point: Permission Pre-Prompt

The permission request occurs within the **milestone transition flow**. When the driver taps "Depart" (triggering the LOADED → DEPARTED transition), the app:

1. Shows a pre-prompt bottom sheet explaining why location is needed
2. Dismissal or "Continue" triggers the OS permission dialog
3. Regardless of permission outcome, the departure transition proceeds

This uses the existing **Bottom Sheet** component (`mobile-design-system.md` §2.7) and the existing **Flow** pattern where the tab bar remains visible.

---

## 5. What This Feature Adds to Active Trip

| Element | Where | Type | New Component? |
|---------|-------|------|---------------|
| Tracking status indicator | Trip detail header | Icon + label badge | No — uses existing badge pattern |
| Permission pre-prompt | Departure transition flow | Bottom sheet | No — uses existing bottom sheet |
| Warning banner (permission denied) | Below trip header | Inline banner | No — uses existing `OfflineBanner` pattern adapted for warnings |
| "Go to Settings" affordance | Within warning banner | Text button | No — uses existing text button |
| Foreground notification (Android) | OS notification tray | OS notification | Platform-specific, not a UI component |
| Pending sync badge | Near tracking indicator | Count badge | No — uses existing count badge pattern |

**Anti-pattern**: This feature must NOT introduce new card styles, new color tokens, new icon styles, or new navigation destinations. It lives entirely within the Active Trip surface using existing components.

---

## 6. Scope Boundaries

### In Scope (Behavioral UX)
- Permission request timing and rationale
- Permission denied / limited / revoked state handling
- Tracking indicator states and transitions
- Warning and guidance messaging
- Foreground notification content (Android)
- Degraded-mode transparency (background limited, GPS lost, offline buffering)
- Privacy communication (pre-prompt, notification text)

### Out of Scope
- Map UI (covered by Active Trip spec)
- Location data visualization (operations feature)
- Tracking interval configuration UI (no UI — interval is fixed)
- Battery usage monitoring screens
- OEM-specific battery optimization bypass guides (documented in spec risks, not a UX deliverable)
- Settings page for tracking preferences (no such page — tracking is automatic)

---

## References

- [Feature Spec](file:///Users/ankit/a/fleetly/axleops_code/specs/006-driver-trip-location-tracking/spec.md)
- [Active Trip UX Brief](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/ux-brief.md)
- [Active Trip State Inventory](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/state-inventory.md)
- [Design Philosophy](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md)
- [Design System](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)
