# State Inventory — Mobile Role Strategy

Every screen handles 4 UX states per Constitution Principle VII and spec SC-005.

## Pre-Auth Screens

### LoginScreen

| State | Visual | Trigger |
|-------|--------|---------|
| **Idle** | Email + password fields enabled, "Sign In" button enabled | Initial load, after error dismissed |
| **Loading** | Fields disabled, button shows spinner, overlay prevents interaction | `AuthState.LoggingIn` |
| **Error** | Red error banner above form, fields re-enabled | `AuthState.Unauthenticated(error = "...")` |

> No Empty or DataLoaded state — login is an action screen, not a data screen.

### RoleSelectorScreen

| State | Visual | Trigger |
|-------|--------|---------|
| **DataLoaded** | Card per role (label, icon), "Select" action per card | `AuthState.RoleSelection` with 2+ roles |
| **Loading** | (Handled by LoginScreen — role selector only appears after resolution) | — |

### UnsupportedRoleScreen

| State | Visual | Trigger |
|-------|--------|---------|
| **Informative** | "Role Not Available" heading + "Please use AxleOps web" message | `AuthState.NoSupportedRoles` |

## Authenticated Screens

### AuthShell

| State | Visual | Trigger |
|-------|--------|---------|
| **Active** | Top bar with role label, bottom tab bar from RoleConfig.tabs, content area | `AuthState.Authenticated` |

### SettingsScreen

| State | Visual | Trigger |
|-------|--------|---------|
| **DataLoaded** | Profile section (name, role, branch), Logout button, App Version, Debug toggles (if debug build) | Always (data from `UserSession`) |

### Driver Tab Placeholders (Active Trip, Past Trips, Earnings)

| State | Visual | Trigger |
|-------|--------|---------|
| **Empty** | `EmptyStateScreen` with tab-specific message | Current implementation (all placeholders) |

> [!NOTE]
> These are intentionally empty. Real states (Loading, Error, DataLoaded) will be defined in each feature's UX package.

### OpsExec Tab Placeholders (Fleet Map, Trips, Alerts)

| State | Visual | Trigger |
|-------|--------|---------|
| **Empty** | `EmptyStateScreen` with "coming soon" message | Current implementation (stub role) |

## Shared State Components (from `ui/shared/StateScreens.kt`)

| Component | Purpose | Used By |
|-----------|---------|---------|
| `LoadingIndicator` | Centered circular progress | Any screen in Loading state |
| `EmptyStateScreen` | Centered message with optional icon | Any screen with no data |
| `ErrorStateScreen` | Error message + retry button | Any screen after a failed load |
| `UiStateHandler` | Orchestrates Loading/Empty/Error/DataLoaded rendering | Future feature screens |

## Implementation Divergences

> [!WARNING]
> **`UiStateHandler` is defined but not used by any current screen**. All implemented screens manually handle their states. `UiStateHandler` will become the standard pattern when feature screens are built. This is a minor inconsistency — the infrastructure exists but isn't exercised yet.
