# Screen Map — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> This screen map covers the **design system infrastructure** screens and patterns, not feature screens. Feature screens (Active Trip, POD Capture, etc.) are mapped in their own feature specs.

---

## Screen Hierarchy — Design System Context

```
App
├── Pre-Auth (no tabs, no design system shell)
│   ├── LoginScreen              → Action template
│   ├── RoleSelectorScreen       → List template (card selection)
│   └── UnsupportedRoleScreen    → Empty state pattern
│
└── Authenticated Shell
    ├── Top Bar                  → Shared component
    ├── Bottom Tab Bar           → Shared component (role-configured)
    ├── Offline Banner           → Shared state component
    └── Content Area
        │
        ├── State Screens (shared across all roles)
        │   ├── LoadingScreen    → Skeleton pattern
        │   ├── EmptyScreen      → Illustration + message + action
        │   ├── ErrorScreen      → Error message + retry
        │   └── OfflineOverlay   → Banner + stale content
        │
        ├── Screen Templates (structural patterns)
        │   ├── ListTemplate     → Toolbar → filters → scrollable cards → FAB
        │   ├── DetailTemplate   → Toolbar → sections → sticky action bar
        │   └── ActionTemplate   → Toolbar → form → bottom-anchored button
        │
        └── Component Instances
            ├── Buttons          → Primary / Secondary / Text / Destructive / Icon / FAB
            ├── Cards            → Standard / Active Trip / Summary / Milestone
            ├── Inputs           → Text / Numeric / Dropdown / DateTime / Checkbox / Radio / Toggle
            ├── Badges           → Phase (4 colors) / Exception / Count
            ├── Stepper          → Horizontal (summary) / Vertical (detail)
            ├── BottomSheet      → Filter sheets, option selectors
            └── Modal            → Confirmation dialogs
```

## Screen Template Allocation

Every screen in the app maps to one of three templates. This table shows how Driver v1 screens align:

| Screen | Template | Tab Bar | Top Bar Back Arrow |
|--------|----------|---------|-------------------|
| `ActiveTripScreen` | Rich Detail | ✅ Visible | ❌ (tab root) |
| `MilestoneStepperScreen` | Detail | ✅ Visible | ✅ |
| `MilestoneDetailScreen` | Action | ✅ Visible | ✅ |
| `PodCaptureFlow` | Action (multi-step) | ❌ Hidden | ✅ (Close) |
| `CameraFlow` | Action (immersive) | ❌ Hidden | ✅ (Close) |
| `PastTripListScreen` | List | ✅ Visible | ❌ (tab root) |
| `PastTripDetailScreen` | Detail | ✅ Visible | ✅ |
| `EarningsSummaryScreen` | List + Summary | ✅ Visible | ❌ (tab root) |
| `TransactionDetailScreen` | Detail | ✅ Visible | ✅ |
| `SettingsScreen` | Detail | ✅ Visible | ❌ (tab root) |
| `LoginScreen` | Action | ❌ Hidden | ❌ |
| `RoleSelectorScreen` | List (card selection) | ❌ Hidden | ❌ |

## Design System Deliverables Map

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Design Tokens | [mobile-design-system.md §1](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) | Color, typography, spacing, elevation, animation tokens |
| Component Catalog | [mobile-design-system.md §2](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) | Shared components with variants and dimensions |
| Screen Templates | [mobile-design-system.md §3](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) | List, Detail, Action layout blueprints |
| State Patterns | [state-inventory.md](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/ux/state-inventory.md) | Loading, Empty, Error, Offline, DataLoaded, Blocked |
| Trip Visual Language | [mobile-design-system.md §2.4–2.5](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) | Status badges, stepper, phase colors |
| Navigation Patterns | [mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) | Tab, push/pop, flow, modal, sheet |
| Review Criteria | [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/design-review-checklist.md) | 10-section audit checklist |
