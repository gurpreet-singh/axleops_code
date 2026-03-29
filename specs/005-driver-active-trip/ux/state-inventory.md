# State Inventory — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Source of Truth**: [trip.md](file:///Users/ankit/a/fleetly/axleops_code/trip.md) §2, §3  
> **Date**: 2026-03-29

---

## 1. Trip Sub-States Visible to the Driver

The trip lifecycle has 4 phases and 20+ sub-states in the domain. The driver only sees and interacts with a subset. This table is the **complete, exhaustive** mapping.

### 1.1 Phase 1: Created (Setup & Dispatch)

| Sub-State | Driver Sees? | Driver Label | Badge Color | CTA Button | CTA Enabled? | Notes |
|-----------|-------------|-------------|-------------|-----------|-------------|-------|
| DRAFT | ❌ | — | — | — | — | Not yet dispatched. Invisible to driver. |
| CREATED | ❌ | — | — | — | — | Saved but not dispatched. Invisible to driver. |
| DISPATCHED | ✅ | "Trip Dispatched" | `color.phase.created` (Gray 500) | Accept / Reject | ✅ (if within timeout) | Accept timeout: 30 min from dispatch. |
| ACCEPTED | ✅ | "Trip Accepted" | `color.phase.in_transit` (Blue 600) | "Arrived at Origin" | ✅ | First driver-owned state. |

### 1.2 Phase 2: In Transit (Execution)

| Sub-State | Driver Sees? | Driver Label | Badge Color | CTA Button | CTA Enabled? | Notes |
|-----------|-------------|-------------|-------------|-----------|-------------|-------|
| AT_ORIGIN | ✅ | "At Loading Point" | `color.phase.in_transit` | "Start Loading" | ✅ | |
| LOADING | ✅ | "Loading" | `color.phase.in_transit` | "Loading Complete" | ✅ | Form: weight, seal, photos |
| LOADED | ✅ | "Loaded — Ready to Depart" | `color.phase.in_transit` | "Depart" | Conditional | Blocked if EWB required but not ready |
| EWB_PENDING | ✅ | "Awaiting E-Way Bill" | `color.warning` (Amber) | — | ❌ Blocked | Inline: "Waiting for E-Way Bill generation. Contact dispatch if delayed." |
| DEPARTED | ✅ | "Departed" | `color.phase.in_transit` | "Log Event" | ✅ | GPS tracking starts |
| IN_TRANSIT | ✅ | "In Transit" | `color.phase.in_transit` | "Arrived at Destination" | ✅ | Primary state during transit |
| AT_CHECKPOINT | ✅ | "At Checkpoint" | `color.phase.in_transit` | "Continue" | ✅ | Multi-drop only (future) |
| AT_DESTINATION | ✅ | "Arrived at Destination" | `color.phase.in_transit` | "Start Unloading" | ✅ | SLA timer evaluated |
| UNLOADING | ✅ | "Unloading" | `color.phase.in_transit` | "Delivery Complete" | ✅ | Form: weight, condition |
| DELIVERED | ✅ | "Delivered" | `color.phase.in_transit` | "Submit POD" | ✅ | POD timer starts (4 hr) |

### 1.3 Phase 3: Completed (Verification)

| Sub-State | Driver Sees? | Driver Label | Badge Color | CTA Button | CTA Enabled? | Notes |
|-----------|-------------|-------------|-------------|-----------|-------------|-------|
| POD_SUBMITTED | ✅ | "POD Submitted" | `color.phase.completed` (Emerald) | — | ❌ Read-only | "Awaiting verification by operations." |
| POD_VERIFIED | ✅ | "Trip Complete" | `color.phase.completed` | — | ❌ Read-only | "Trip verified. Awaiting settlement." |
| POD_DISPUTED | ✅ | "POD Under Review" | `color.warning` | — | ❌ Read-only | "POD verification flagged. Operations will contact you." |

### 1.4 Phase 4: Settled

| Sub-State | Driver Sees? | Driver Label | Badge Color | CTA Button | CTA Enabled? | Notes |
|-----------|-------------|-------------|-------------|-----------|-------------|-------|
| SETTLED | ✅ | "Trip Settled" | `color.phase.settled` (Gray 400) | — | ❌ Read-only | Trip moves to Past Trips after settlement. |

---

## 2. Exception States

Exception states overlay the normal flow. When active, they **suppress normal CTA buttons** and show a red exception banner instead.

| Exception State | Driver Can Report? | Driver Label | Badge | CTA While Active | Resolution |
|----------------|-------------------|-------------|-------|-----------------|------------|
| DRIVER_REJECTED | N/A (driver-initiated) | — | — | — | Trip returns to ops for reassignment |
| VEHICLE_BREAKDOWN | ✅ | "Vehicle Breakdown" | `color.phase.exception` (Orange) | ❌ All disabled | Ops resolves: repair or load transfer |
| ACCIDENT | ✅ | "Accident Reported" | `color.error` (Red) | ❌ All disabled | Ops resolves: emergency protocol |
| CARGO_DAMAGE | ✅ | "Cargo Damage" | `color.phase.exception` | ❌ All disabled | Ops resolves |
| CARGO_SHORTAGE | ✅ | "Cargo Shortage" | `color.phase.exception` | ❌ Milestone disabled | Deduction applied at settlement |
| ROUTE_BLOCKED | ✅ | "Route Blocked" | `color.phase.exception` | ❌ All disabled | Ops resolves: reroute or wait |
| DELIVERY_REJECTED | Via POD flow | "Delivery Refused" | `color.error` | ❌ All disabled | Ops resolves: return trip |
| EWB_EXPIRED | System-detected | "E-Way Bill Expired" | `color.error` | ❌ "Vehicle must halt" | Ops extends EWB |
| GPS_LOST | System-detected | "GPS Signal Lost" | `color.warning` | ✅ Not blocked | Auto-clears when GPS returns |
| CANCELLED | ❌ (ops-initiated) | "Trip Cancelled" | `color.phase.settled` | ❌ All disabled | Trip removed from active view |

---

## 3. Parallel Sub-Process States

### 3.1 EWB (E-Way Bill)

| EWB State | Driver Sees? | Visual | Impact on Trip Flow |
|-----------|-------------|--------|-------------------|
| NOT_REQUIRED | ❌ Hidden | — | No impact |
| PENDING_GENERATION | ✅ | Amber "Awaiting EWB" chip in trip card | Blocks departure (LOADED → DEPARTED) |
| GENERATED | ✅ | Green "EWB ✓" chip | Departure unblocked |
| ACTIVE | ✅ | Green "EWB Active" chip | — |
| EXPIRING_SOON | ✅ | Amber "EWB Expiring" chip with countdown | Warning only |
| EXPIRED | ✅ | Red "EWB Expired" banner | Blocks all transit actions |
| EXTENDED | ✅ | Green "EWB Extended" chip | — |
| CANCELLED | ✅ (if trip cancelled) | — | — |

### 3.2 POD (Proof of Delivery)

| POD State | Driver Sees? | Visual | Impact |
|-----------|-------------|--------|--------|
| NOT_STARTED | ❌ Hidden | — | — |
| AWAITING_SUBMISSION | ✅ | "Submit POD" CTA | POD timer running (4 hr) |
| SUBMITTED | ✅ | "POD Submitted ✓" badge | Trip read-only for driver |
| VERIFICATION_IN_PROGRESS | ✅ | "Under Review" label | Read-only |
| VERIFIED_CLEAN | ✅ | "Verified ✓" label | Read-only |
| VERIFIED_WITH_REMARKS | ✅ | "Verified with Remarks" label | Read-only |
| REJECTED | ✅ | "POD Rejected" red label | Driver may need to resubmit (future) |
| DISPUTED | ✅ | "POD Under Review" amber label | Read-only |

---

## 4. Screen-Level UX States (per Design Philosophy §3)

Every section on the active trip screen can be in one of these states independently:

| Section | Loading | Empty | Error | Data Loaded | Offline | Blocked |
|---------|---------|-------|-------|-------------|---------|---------|
| **Trip Card** | Skeleton (card shape) | "No active trip" + illustration | "Couldn't load trip. Tap to retry." | Full trip card | Stale data + offline banner | N/A |
| **Map** | Map placeholder shimmer | N/A (map always shows route if trip exists) | "Map unavailable" | Route + pins + driver dot | Cached tiles + no driver dot | N/A |
| **Milestones** | Skeleton (stepper shape) | N/A (always shows all 10) | "Couldn't load milestones." | Full stepper with statuses | Stale milestone data | Exception active → paused indicator |
| **Documents** | Skeleton (2 rows) | "No documents yet" + Add button | "Couldn't load documents." | Document list | Stale list + uploads queued | Read-only after POD_SUBMITTED |
| **Expenses** | Skeleton (2 rows) | "No expenses logged" + Add button | "Couldn't load expenses." | Expense list + total | Stale list + entries queued | Read-only after POD_SUBMITTED |
| **Exception Banner** | N/A | N/A (not shown) | N/A | Red banner with exception details | Show last known exception | Active → actions disabled |

---

## 5. Combined State Precedence

When multiple states apply simultaneously, the following precedence determines what the driver sees:

```
Exception Active (highest priority — red banner + actions disabled)
    ↓
EWB Blocking (departure blocked — inline blocked message)
    ↓
Offline (banner visible — stale data + queued actions)
    ↓
Normal Sub-State (standard trip card + CTA)
```

**Rule**: An active exception ALWAYS takes visual precedence over any other state. The exception banner appears at the top, and normal CTA buttons are hidden. Only the "View Exception Details" option remains.
