# UX Brief — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Target Role**: Driver  
> **Design System**: [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)  
> **Philosophy**: [mobile-design-philosophy.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md)  
> **Date**: 2026-03-29

---

## 1. Design Mandate

This feature is the **operational core** of the driver experience — the reason the app exists. Every design decision must pass the truck cab test:

> _Can a driver sitting in a truck cab, in bright sunlight, with one greasy hand free, while parked at a loading dock, accomplish this task in under 10 seconds?_

The active trip screen is not a dashboard. It is a **task execution surface**: show me what to do now → let me do it → confirm it's done.

---

## 2. UX Objectives

| # | Objective | Design Implication |
|---|-----------|-------------------|
| 1 | **Glanceable status in < 2 seconds** | Trip phase + milestone stepper visible without scroll. Color + icon + badge — not sentences. |
| 2 | **One-tap primary action** | The next valid action is always a bottom-anchored primary button. Never hunt for it. |
| 3 | **Sequential, not exploratory** | Milestones progress linearly. The driver can't skip ahead. The UI enforces this by showing only the next action. |
| 4 | **Evidence capture is inline** | Camera, signature, GPS capture happen within the milestone flow — not separate screens to navigate to. |
| 5 | **Nothing is lost** | Photos, form data, queued transitions survive backgrounding, kill, and reconnect. Offline queue is visible. |
| 6 | **Blocked states explain themselves** | When an action is blocked (EWB pending, exception active), the reason and resolution path are shown inline — not as a toast. |
| 7 | **Single-trip focus** | One active trip at a time. No multi-select, no batch actions. Everything is about _this trip, right now_. |

---

## 3. Information Architecture

The Active Trip tab has a strict information hierarchy:

```
Layer 1: Status (always visible, no scroll)
├── Trip phase badge (color-coded)
├── Milestone stepper (horizontal, summary)
└── Exception banner (if active — red, full-width)

Layer 2: Content (scrollable)
├── Trip details section (route, client, vehicle, cargo)
├── Map section (origin → destination + driver position)
├── En-route timeline / expenses (during IN_TRANSIT)
└── Documents section

Layer 3: Action (always visible, bottom-anchored)
└── Primary CTA button (context-sensitive: "Accept Trip" / "Loading Complete" / "Submit POD")
```

**Rule**: Layer 1 (status) and Layer 3 (action) must be visible simultaneously without scrolling on any phone ≥ 360dp height.

---

## 4. Key Design Patterns (Reuse, Not Invent)

| Pattern | Source | How Active Trip Uses It |
|---------|--------|------------------------|
| **Active Trip Card** | `mobile-design-system.md` §2.2 | The primary display unit on the Active Trip landing |
| **Horizontal Stepper** | `mobile-design-system.md` §2.5 | Milestone progress bar in the trip card |
| **Vertical Stepper** | `mobile-design-system.md` §2.5 | Full milestone detail on the stepper screen |
| **Phase Badges** | `mobile-design-system.md` §2.4 | Trip status indicator (uses `color.phase.*` tokens) |
| **State Screens** | `mobile-design-system.md` §2.6 | Loading skeleton, empty state, error + retry |
| **Blocked State** | `mobile-design-philosophy.md` §3 | Inline explanation + resolution hint for EWB pending, exception active |
| **Offline Banner** | `mobile-design-system.md` §2.6 | Persistent `color.warning` bar when disconnected |
| **Detail Screen Template** | `mobile-design-system.md` §3.2 | Section-based scrollable layout for trip detail |
| **Action Screen Template** | `mobile-design-system.md` §3.3 | Bottom-anchored CTA for milestone transition forms |
| **Modal Dialog** | `mobile-design-system.md` §2.8 | Accept/Reject confirmation, discard changes |
| **Bottom Sheet** | `mobile-design-system.md` §2.7 | Expense category picker, document category picker |
| **Flow (tabs hidden)** | `mobile-navigation-grammar.md` §3.3 | POD capture flow, camera capture flow |

**Anti-pattern**: This feature must NOT invent new button styles, new card layouts, new modal patterns, or new color tokens. Every visual element must map to an existing design system component.

---

## 5. Emotional Design Goals

| Sensation | How Active Trip Achieves It |
|-----------|---------------------------|
| "I know exactly where I am" | Phase badge, milestone stepper, progress % — all visible at a glance |
| "I can do what I need in one tap" | Bottom-anchored CTA changes with state. Accept, Complete Loading, Submit POD — always one tap (+ confirmation for destructive) |
| "Nothing is lost" | Pending uploads show in-line with retry. Offline queue visible. Photos persist locally. |
| "I'm not confused" | One trip, one screen, one action at a time. No lists to filter, no tabs to switch. |
| "I can use this in bad conditions" | High contrast outdoor colors, 48dp touch targets, offline resilience |

---

## 6. Scope Boundaries

### In Scope

- Trip acceptance / rejection
- Milestone progression (10 steps)
- POD capture (photo, signature, consignee info)
- Map view (origin → destination + driver position)
- Background GPS tracking (5-min interval)
- Document upload and viewing
- Expense logging (fuel, toll, misc)
- Exception reporting
- En-route checkpoint logging
- Offline queuing and sync

### Out of Scope (Per Spec)

- Trip creation (operations-only)
- POD verification (operations verifies)
- Trip settlement / financial summary
- Past trip history (separate feature)
- Vehicle pre-trip inspection (DVIR — separate feature)
- Push notifications for dispatch
- Multi-stop (multi-drop) trips
- EWB management (extend, cancel)
- Load transfer workflow

---

## References

- [Feature Spec](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/spec.md)
- [Design Philosophy](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md)
- [Design System](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)
- [Navigation Grammar](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md)
- [Role Shells](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md)
- [Trip Lifecycle](file:///Users/ankit/a/fleetly/axleops_code/trip.md)
