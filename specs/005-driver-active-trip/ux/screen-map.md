# Screen Map — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Parent Nav**: [mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) §4.1  
> **Date**: 2026-03-29

---

## 1. Screen Tree

All screens live under the **Active Trip** tab (Tab 1 in the Driver shell).

```
Active Trip Tab
├── ActiveTripScreen (landing)
│   ├── [no trip] → EmptyState
│   ├── [DISPATCHED] → TripCard + Accept/Reject
│   └── [ACCEPTED…DELIVERED] → TripCard + detail sections
│        ├── TripDetailScreen (push — full detail with sections)
│        │   ├── MapSection (inline — not a separate screen)
│        │   ├── MilestonesSection (inline list or push → MilestoneStepperScreen)
│        │   ├── DocumentsSection (inline list)
│        │   │   └── DocumentViewerScreen (push — full-screen photo/PDF)
│        │   ├── ExpensesSection (inline list)
│        │   └── ExceptionBanner (inline — top, conditional)
│        │
│        ├── MilestoneActionScreen (push — form for current milestone)
│        │   ├── LoadingCompleteForm (weight, seal, cargo photos)
│        │   ├── DepartureForm (GPS, odometer)
│        │   ├── ArrivalForm (GPS, odometer)
│        │   └── DeliveryCompleteForm (weight, condition)
│        │
│        ├── PodCaptureFlow (push — tabs hidden)
│        │   ├── PodPhotoScreen (camera + gallery, min photo enforcement)
│        │   ├── SignatureScreen (digital signature pad)
│        │   ├── ConsigneeInfoScreen (name, designation, remarks, condition)
│        │   └── PodReviewScreen (summary + submit)
│        │
│        ├── AddExpenseScreen (push or sheet)
│        │   └── ReceiptCaptureFlow (camera — tabs hidden)
│        │
│        ├── AddDocumentScreen (push or sheet)
│        │   └── CameraFlow (camera — tabs hidden)
│        │
│        ├── ExceptionReportScreen (push)
│        │   └── EvidenceCameraFlow (camera — tabs hidden)
│        │
│        └── AddCheckpointEventScreen (push or sheet)
│
├── [POD_SUBMITTED…SETTLED] → TripCard (read-only)
│   └── TripDetailScreen (read-only — no action buttons)
│
└── [trip removed / completed] → EmptyState
```

---

## 2. Screen Inventory

| Screen | Type | Tab Bar | Template | Primary Action |
|--------|------|---------|----------|----------------|
| `ActiveTripScreen` | Tab landing | ✅ | Rich single-item | Context-dependent CTA |
| `TripDetailScreen` | Detail (push) | ✅ | Detail Screen (§3.2) | Bottom sticky CTA |
| `MilestoneActionScreen` | Action (push) | ✅ | Action Screen (§3.3) | "Complete [Milestone]" |
| `PodPhotoScreen` | Flow step | ❌ | Custom (camera) | "Next" / "Add More" |
| `SignatureScreen` | Flow step | ❌ | Custom (canvas) | "Next" |
| `ConsigneeInfoScreen` | Flow step | ❌ | Action Screen (§3.3) | "Next" |
| `PodReviewScreen` | Flow step | ❌ | Detail Screen (§3.2) | "Submit POD" |
| `AddExpenseScreen` | Action (push/sheet) | ✅ | Action Screen (§3.3) | "Save Expense" |
| `AddDocumentScreen` | Action (push/sheet) | ✅ | Action Screen (§3.3) | "Upload" |
| `ExceptionReportScreen` | Action (push) | ✅ | Action Screen (§3.3) | "Report Issue" |
| `AddCheckpointEventScreen` | Action (push/sheet) | ✅ | Action Screen (§3.3) | "Log Event" |
| `DocumentViewerScreen` | Detail (push) | ✅ | Custom (viewer) | None (read-only) |

---

## 3. ActiveTripScreen Layout

The landing screen adapts its layout based on trip state.

### 3.1 No Active Trip (Empty)

```
┌─────────────────────────────┐
│ Top Bar: "Active Trip"       │
├─────────────────────────────┤
│                             │
│      [Truck illustration]   │
│                             │
│   "No active trip"          │
│   "You'll see your next     │
│    trip here when it's      │
│    dispatched."             │
│                             │
├─────────────────────────────┤
│  Tab Bar                    │
└─────────────────────────────┘
```

### 3.2 Dispatched Trip

```
┌─────────────────────────────┐
│ Top Bar: "Active Trip"       │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ DISPATCHED badge       │  │
│  │ TRP-2024-0143         │  │
│  │ Mumbai → Delhi         │  │
│  │ Reliance Industries    │  │
│  │ MH-04-AB-1234         │  │
│  │ Start: 29 Mar, 06:00  │  │
│  │                        │  │
│  │ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  │  │ ← milestone stepper (all empty)
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│ [Reject (outlined)] [Accept (primary)] │
├─────────────────────────────┤
│  Tab Bar                    │
└─────────────────────────────┘
```

### 3.3 Active Trip (ACCEPTED → DELIVERED)

```
┌─────────────────────────────┐
│ Top Bar: "Active Trip" [📍]  │ ← GPS tracking indicator
├─────────────────────────────┤
│                             │
│ [Exception banner if active] │ ← conditional red banner
│                             │
│  ┌───────────────────────┐  │
│  │ IN TRANSIT badge       │  │
│  │ TRP-2024-0143         │  │
│  │ Mumbai → Delhi         │  │
│  │ ● ● ● ● ● ● ○ ○ ○ ○  │  │ ← stepper: 6/10
│  └───────────────────────┘  │
│                             │
│  ── Trip Details ──          │
│  Route: Mumbai → Delhi       │
│  Client: Reliance Industries │
│  Vehicle: MH-04-AB-1234     │
│  Cargo: 13.8 MT Steel Coils │
│                             │
│  ── Map ──                   │
│  [Map with route + position] │
│                             │
│  ── Expenses (₹21,050) ──   │ ← running total
│  [Expense list items]       │
│  [+ Add Expense]            │
│                             │
│  ── Documents (3) ──         │
│  [Document list items]      │
│  [+ Add Document]           │
│                             │
├─────────────────────────────┤
│ [Arrived at Destination]     │ ← primary CTA, bottom-anchored
├─────────────────────────────┤
│  Tab Bar                    │
└─────────────────────────────┘
```

### 3.4 Read-Only (POD_SUBMITTED → SETTLED)

```
┌─────────────────────────────┐
│ Top Bar: "Active Trip"       │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ POD SUBMITTED badge    │  │
│  │ TRP-2024-0143         │  │
│  │ Mumbai → Delhi         │  │
│  │ ● ● ● ● ● ● ● ● ● ○  │  │ ← 9/10
│  │                        │  │
│  │ "Awaiting POD          │  │
│  │  verification by       │  │
│  │  operations."          │  │
│  └───────────────────────┘  │
│                             │
│  [All sections read-only]   │
│                             │
├─────────────────────────────┤
│  (no action bar)            │
├─────────────────────────────┤
│  Tab Bar                    │
└─────────────────────────────┘
```

---

## 4. Screen Transitions

| From | To | Trigger | Transition | Tab Bar |
|------|-----|---------|-----------|---------|
| ActiveTripScreen | TripDetailScreen | Tap on trip card body | Push (slide left) | ✅ |
| TripDetailScreen | MilestoneActionScreen | Tap primary CTA | Push (slide left) | ✅ |
| TripDetailScreen | PodPhotoScreen | Tap "Submit POD" CTA | Push (slide up) | ❌ |
| PodPhotoScreen | SignatureScreen | Tap "Next" | Push (slide left) | ❌ |
| SignatureScreen | ConsigneeInfoScreen | Tap "Next" | Push (slide left) | ❌ |
| ConsigneeInfoScreen | PodReviewScreen | Tap "Next" | Push (slide left) | ❌ |
| PodReviewScreen | ActiveTripScreen | Submit success | Pop all to root | ✅ |
| TripDetailScreen | AddExpenseScreen | Tap "Add Expense" | Push or bottom sheet | ✅/❌ |
| TripDetailScreen | AddDocumentScreen | Tap "Add Document" | Push or bottom sheet | ✅/❌ |
| TripDetailScreen | ExceptionReportScreen | Tap "Report Issue" | Push (slide left) | ✅ |
| Any screen | CameraFlow | Tap camera icon | Push (slide up) | ❌ |
| CameraFlow | Previous screen | Capture complete | Pop | Restore |
| DocumentViewerScreen | TripDetailScreen | Back | Pop (slide right) | ✅ |

---

## 5. Relationship to Existing Navigation Map

This screen tree replaces the placeholder in `mobile-navigation-grammar.md` §4.1 under `Tab 1: Active Trip`. Specifically:

- `ActiveTripScreen` → was `ActiveTripScreen (landing)` ✓
- `TripDetailScreen` → extends `MilestoneStepperScreen` from the nav grammar into a combined detail + stepper view
- `MilestoneActionScreen` → replaces `MilestoneDetailScreen` with a more precise name indicating action capability
- `PodCaptureFlow` → matches the `PodCaptureFlow` from the nav grammar ✓
- `ExceptionReportScreen` → matches `BreakdownReportScreen` from the nav grammar, renamed for broader exception types
- `AddExpenseScreen`, `AddDocumentScreen`, `AddCheckpointEventScreen` → **new** screens not in the nav grammar (derived from spec)

> [!NOTE]
> The navigation grammar defined a preliminary screen map. This screen map is the refined, feature-complete version. The nav grammar should be updated to reflect these additions after plan approval.
