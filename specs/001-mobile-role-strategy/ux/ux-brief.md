# UX Brief — Mobile Role Strategy

> [!NOTE]
> **Retroactive backfill**: This UX package was created *after* implementation had already begun (Phases 1–8 complete). It codifies the design decisions made during implementation rather than prescribing new ones. Divergences from the original design docs are explicitly called out.

**Feature**: 001-mobile-role-strategy
**Date**: 2026-03-28
**Status**: Implementation complete, UX backfilled

---

## Goal

Define the role-extensible architecture for the AxleOps mobile app. Driver is the only v1 role. The app shell, navigation, auth, and data layer must support adding future roles (Operations Executive, Workshop Manager, Mechanic) by configuration rather than restructuring.

## Target User

- **Primary (v1)**: Fleet driver operating from a truck cab
- **Secondary (architecture validation)**: Operations Executive (stub only)

## Design Inputs

| Source | Document |
|--------|----------|
| Spec | [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md) |
| Plan | [plan.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/plan.md) |
| Role Strategy | [mobile-role-strategy.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-role-strategy.md) |
| Shell Design | [role-shells.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md) |
| Nav Grammar | [mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) |
| Implementation Notes | [implementation-notes.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/handoff/implementation-notes.md) |

## Scope Boundary

This UX package covers *only* the role-strategy architectural screens:
- Login, Role Selection, Unsupported Role
- Auth Shell (top bar + bottom nav + content area)
- Settings Screen
- Driver & OpsExec tab placeholder screens

It does **not** cover feature screens (Active Trip, Milestone Stepper, POD, etc.). Those will have their own UX packages in subsequent feature specs.
