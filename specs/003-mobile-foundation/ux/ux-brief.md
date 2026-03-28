# UX Brief — Mobile Foundation

> **Spec**: [003-mobile-foundation/spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md)  
> **Constitution**: v3.0.0  
> **Design Foundation**: [002-design-foundation](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md)  
> **Date**: 2026-03-28

---

## 1. What This UX Package Is

This UX package defines the **user-experience contract for the app foundation** — the structural, behavioral, and visual layer that every future business feature inherits. It is *not* a business feature UX package. It defines:

- How the app shell looks and behaves before any feature screen loads
- How startup, auth resolution, and role landing work from the user's perspective
- What baseline patterns (loading, empty, error, offline, blocked, retry) look like and how they behave
- How navigation feels structurally (tab switching, push/pop, modals, sheets)
- What shared infrastructure (uploads, analytics hooks, debug tools) looks like when it surfaces visually
- What later features must inherit vs. what they may customize

## 2. Who This Is For

| Audience | What They Get |
|----------|---------------|
| **Engineers** | Implementation-ready behavioral rules for shell, navigation, state handling, and cross-cutting infrastructure |
| **QA** | Testable expectations for every foundation-level screen and state |
| **Future spec authors** | The shared contract their features must comply with — no reinventing patterns |
| **Designers** | The boundaries of what the foundation defines vs. what features should extend |

## 3. Scope Boundaries

### In Scope (Foundation UX)

| Area | What's Defined |
|------|----------------|
| App shell layout | Three-zone structure (top bar, content, bottom tabs), safe areas, offline indicator placement |
| App startup sequence | Splash → session check → role resolution → shell render (visible states at each step) |
| Auth shell states | Login, logging-in, role selection, unsupported-role, session-expired (visual treatment only — login UI is spec-004) |
| Navigation skeleton | Tab bar behavior, per-tab stack management, push/pop transitions, modal/sheet rules, back behavior |
| State screens | Loading (skeleton), Empty, Error, Offline (banner + stale data), Blocked (inline) — shared composables |
| Debug/QA surface | Mock-vs-real indicator, data source toggle placement in Settings |
| Upload interaction baseline | Capture → preview → progress → retry pattern (contract only — no feature-specific upload UI) |
| Analytics hooks | Invisible infrastructure; UX impact is limited to "no visible analytics UI for drivers" |
| Role-landing readiness | Placeholder screens for unimplemented tabs; "Coming Soon" pattern |

### Out of Scope (Feature UX — defined by later specs)

| Area | Owner |
|------|-------|
| Login screen detailed design (fields, branding, error messages) | Driver Auth & Session spec |
| Active Trip card layout & interactions | Driver Active Trip spec |
| Milestone stepper & evidence capture flows | Driver Active Trip spec |
| Past trip list content & trip detail | Driver Past Trips spec |
| Earnings summary & transaction detail | Driver Earnings spec |
| Profile editing, password change | Driver Settings spec |

## 4. Design Inputs Consumed

This package builds on approved artifacts:

| Artifact | What We Use |
|----------|-------------|
| [Design Philosophy](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md) | Five-state model, field-first principles, density tiers, information hierarchy |
| [Design System](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) | Token catalog (colors, typography, spacing, elevation, radius, motion), component specs, screen templates |
| [Navigation Grammar](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) | Tab rules, screen navigation rules, flow rules, RoleConfig schema, Driver v1 screen map |
| [Role Shells](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md) | Shell architecture, shared vs. role-specific boundaries, anti-patterns |
| [Spec-001 Mobile Role Strategy](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md) | Role resolution rules, data source switching, extensibility requirements |

## 5. Key UX Principles for Foundation

1. **No blank screens, ever** — Every visible moment from launch to first content has a defined state (splash, skeleton, error, empty).
2. **Predictability over novelty** — Every structural behavior (tab switch, back gesture, error display) is deterministic and consistent.
3. **Features inherit, not reinvent** — State patterns, navigation rules, and component contracts are defined once here and consumed by all features.
4. **Mock and real are indistinguishable** — The user (and QA) cannot tell whether data comes from a mock or real source from the UX alone. Only the debug indicator reveals it.
5. **Foundation is invisible to the driver** — A driver never thinks about "the foundation." They think about their trip, their earnings, their settings. The foundation's job is to make those experiences seamless.

## 6. Files in This Package

| File | Purpose |
|------|---------|
| [user-flow.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/user-flow.md) | Startup, auth, and shell-entry flows with state-by-state UX |
| [screen-map.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/screen-map.md) | Every foundation-level screen and its purpose |
| [state-inventory.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/state-inventory.md) | Full inventory of all baseline UX states with visual contracts |
| [interaction-rules.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/interaction-rules.md) | Behavioral rules for shell, nav, forms, uploads, and debug tools |
| [data-dependencies.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/data-dependencies.md) | What data each foundation screen needs and where it comes from |
| [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/design-review-checklist.md) | Auditable checklist for verifying foundation UX compliance |
