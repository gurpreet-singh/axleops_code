# Screen Map — Mobile Role Strategy

## Screen Hierarchy

```
App
├── Pre-Auth (no tabs visible)
│   ├── LoginScreen
│   ├── RoleSelectorScreen
│   └── UnsupportedRoleScreen
│
└── AuthShell (tabs visible)
    ├── Top Bar (role label)
    ├── Bottom Tab Bar (from RoleConfig.tabs)
    └── Content Area (role-dispatched)
        │
        ├── Driver Role
        │   ├── ActiveTripPlaceholder       [tab: active-trip]
        │   ├── PastTripsPlaceholder        [tab: past-trips]
        │   ├── EarningsPlaceholder         [tab: earnings]
        │   └── SettingsScreen (shared)     [tab: settings]
        │
        └── Operations Executive Role (stub)
            ├── FleetMapPlaceholder         [tab: fleet-map]
            ├── TripsPlaceholder            [tab: trips]
            ├── AlertsPlaceholder           [tab: alerts]
            └── SettingsScreen (shared)     [tab: settings]
```

## Screen Inventory

| Screen | Type | Tab Bar | Auth Required | Role-Specific |
|--------|------|---------|--------------|---------------|
| `LoginScreen` | Pre-auth | Hidden | No | No — shared |
| `RoleSelectorScreen` | Pre-auth | Hidden | Partial (token, no role) | No — shared |
| `UnsupportedRoleScreen` | Pre-auth | Hidden | No | No — shared |
| `AuthShell` | Shell | Visible | Yes | Config-driven |
| `SettingsScreen` | Tab landing | Visible | Yes | No — shared |
| `ActiveTripPlaceholder` | Tab landing | Visible | Yes | Driver |
| `PastTripsPlaceholder` | Tab landing | Visible | Yes | Driver |
| `EarningsPlaceholder` | Tab landing | Visible | Yes | Driver |
| `FleetMapPlaceholder` | Tab landing | Visible | Yes | OpsExec |
| `TripsPlaceholder` | Tab landing | Visible | Yes | OpsExec |
| `AlertsPlaceholder` | Tab landing | Visible | Yes | OpsExec |

## Implementation Divergences

> [!WARNING]
> **No navigation stack within tabs**. The design doc ([mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md)) specifies push/pop screen navigation per tab (e.g., `ActiveTripScreen → MilestoneStepperScreen → MilestoneDetailScreen`). The current implementation uses flat `when(tabId)` routing with no stack. This is acceptable for placeholder screens but must be resolved before feature screens (Active Trip, Past Trip Detail, etc.) are implemented. See design-review F3.
