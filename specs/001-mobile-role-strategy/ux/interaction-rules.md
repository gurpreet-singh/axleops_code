# Interaction Rules — Mobile Role Strategy

## Tab Bar Interactions

| Rule | Behavior | Source |
|------|----------|--------|
| **Tab tap** | Switches content area to selected tab. Highlights active tab. | `AuthShell` `NavigationBarItem(onClick)` |
| **Re-tap active tab** | No action (stays on current content). | Default Compose behavior |
| **Tab state preservation** | ❌ Not implemented — tabs reset on switch | Design doc specifies preservation. See Divergence below. |
| **Settings always last** | Settings tab is the final tab in every role's config. | `RoleRegistry` convention, enforced by position in `tabs` list |
| **Swipe between tabs** | ❌ Not supported — tabs switch via tap only | Acceptable for v1 |

## Login Form Interactions

| Rule | Behavior |
|------|----------|
| **Empty submission** | Button remains enabled but login call will fail with API error |
| **Loading state** | All fields disabled, button non-interactive, prevents double-submit |
| **Error display** | Red `Text` above form with error message, fields re-enabled |
| **Error dismissal** | Error clears on next login attempt (state resets to `LoggingIn`) |
| **Password visibility** | ❌ Not implemented — password is always obscured, no toggle |

## Role Selector Interactions

| Rule | Behavior |
|------|----------|
| **Card tap** | Triggers role selection via `POST /auth/select-role` |
| **Loading during selection** | Screen transitions to `LoginScreen` with loading state |
| **Single role** | Selector is never shown — auto-selected |
| **"ALL" role** | Filtered out — never visible in selector |

## Settings Interactions

| Rule | Behavior |
|------|----------|
| **Logout tap** | Calls `authRepository.logout()`, transitions to `Unauthenticated` |
| **Logout confirmation** | ❌ Not implemented — logs out immediately without confirmation modal |
| **Debug toggle** | Visual switches present for each data source feature |
| **Debug toggle effect** | ❌ Toggles are cosmetic only — `DataSourceConfig` is not reactive (design-review F4) |

## Shell Interactions

| Rule | Behavior |
|------|----------|
| **System back** | ❌ No back navigation handling — no navigation stack exists |
| **Session expiry** | ❌ Not implemented — no 401 interception or auto-logout |
| **Top bar** | Static role label, no action buttons |

## Implementation Divergences

> [!WARNING]
> **Tab state preservation** — the design doc ([mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) rule 3.1) specifies "Switching tabs preserves each tab's navigation stack." The implementation uses `rememberSaveable { mutableStateOf(landingTabId) }` for selected tab, but there is no per-tab navigation stack to preserve. Acceptable while screens are placeholders.

> [!WARNING]
> **Logout confirmation** — the design doc ([role-shells.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md) section 3.1) specifies "Logout → Modal (confirm)". The implementation logs out immediately without a confirmation dialog. This should be added before v1 release.

> [!NOTE]
> **Password visibility toggle** — not in any design doc but is a standard mobile UX pattern. Consider adding.
