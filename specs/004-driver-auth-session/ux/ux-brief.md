# UX Brief: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Target Role**: Driver  
> **Design Docs**: [philosophy](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md) · [navigation](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) · [design system](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) · [role shells](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md)  
> **Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md)  
> **Date**: 2026-03-28

---

## 1. Feature Summary

This feature provides the driver's entry into the app and session continuity. It owns the screens and state transitions between "not authenticated" and "authenticated with the Driver role inside the Driver shell."

It is **not** a feature that drivers think about — it is the invisible gate they pass through to reach their real work (trips, earnings, etc.). Design must therefore optimize for **speed, clarity, and invisibility**. The best auth UX is the one the driver never notices because it just works.

---

## 2. UX Goals

| Priority | Goal |
|----------|------|
| **G1** | **Speed to task** — driver reaches Active Trip tab in ≤ 3 seconds from credential submission on a stable network. |
| **G2** | **Session invisibility** — returning drivers skip login entirely. App resumes where they left off. |
| **G3** | **Zero dead ends** — every error state offers a clear next action. No blank screens, no frozen states. |
| **G4** | **Role transparency** — multi-role users understand which role they're entering and can switch later if needed. |
| **G5** | **Confidence under expiry** — when a session expires (background or server-side), the driver knows why and what to do, without losing trust in the app. |

---

## 3. Design Constraints

### Must Reuse (from Mobile Foundation)

| Pattern | Source |
|---------|--------|
| `LoginScreen` composable | Already built. Email + password fields, loading spinner, inline error. |
| `RoleSelectorScreen` composable | Already built. List of role cards with description and arrow. |
| `UnsupportedRoleScreen` composable | Already built. Full-screen message with web portal redirect copy. |
| `AuthShell` + `AppNavHost` | Navigation container. Pre-auth screens are rendered *outside* the shell. |
| `UiState` pattern (Loading/Error/Empty/DataLoaded) | Standard state handling from design system. |
| `OfflineBanner` | Shared connectivity indicator. |
| Modal dialog (logout confirmation) | Already implemented in `AppNavHost.AuthenticatedContent`. |

### Must Not Invent

- No custom loading animations for auth screens (use standard `CircularProgressIndicator`).
- No new navigation patterns — login/role-selection/unsupported are standard full-screen states, not flows.
- No new color semantics — use existing `color.error` for errors, `color.primary` for loading.
- No new typography styles — all copy uses the existing typographic scale.

### Field-First Considerations (from Design Philosophy)

- Login form must work one-handed (fields and button in thumb zone).
- Error copy must be concise — drivers are parked at loading docks, not reading paragraphs.
- Session expiry messaging must not be alarming — it's a routine event, not a crisis.

---

## 4. Screen Inventory (This Feature)

| Screen | New or Existing | Tab Bar Visible | Notes |
|--------|----------------|----------------|-------|
| Login Screen | **Existing** — enhancement only | ❌ (pre-auth) | Add session expiry message variant |
| Role Selector Screen | **Existing** — no changes | ❌ (pre-auth) | Already functional |
| Unsupported Role Screen | **Existing** — no changes | ❌ (pre-auth) | Already functional |
| Splash / Session Restore | **New** — minimal | ❌ (pre-auth) | Brief loading state during token re-validation |

> **No new screens are invented by this feature.** All visual output uses existing Foundation composables. The work is in **state wiring, messaging, and transitions** — not new UI.

---

## 5. What This UX Package Defines

| Document | Purpose |
|----------|---------|
| [user-flow.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/user-flow.md) | Step-by-step flows for login, session restore, logout, and expiry |
| [screen-map.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/screen-map.md) | Visual layout and content specification for each screen state |
| [state-inventory.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/state-inventory.md) | Exhaustive list of all auth/session states and transitions |
| [interaction-rules.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/interaction-rules.md) | Input validation, button behavior, timing, messaging rules |
| [data-dependencies.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/data-dependencies.md) | What data each screen needs, from where, and what happens when it's missing |
| [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/design-review-checklist.md) | QA-ready checklist for design/UX review |

---

## 6. Out of Scope for This UX Package

- Active Trip, Past Trips, Earnings, or Settings tab **content** — those are separate feature UX packages.
- Biometric login, phone/OTP login, password reset — future features.
- Push notification registration or onboarding flows.
- Profile editing or account management.
