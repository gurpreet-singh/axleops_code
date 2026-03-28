# UX Brief — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28  
**Status**: Specification complete, pre-implementation

---

## Goal

Define the app-wide UX/design foundation: visual tokens, component catalog, screen templates, state handling patterns, trip visual language, and navigation grammar. This is a governance feature — it produces design artifacts that all future feature implementations must conform to.

## Target User

- **Primary**: Implementors (developers building mobile features)
- **Secondary**: Reviewers (verifying visual consistency and UX compliance)
- **Tertiary**: Drivers (beneficiaries of consistent, field-grade UX)

## Design Inputs

| Source | Document |
|--------|----------|
| Spec | [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/002-design-foundation/spec.md) |
| Design Philosophy | [mobile-design-philosophy.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-philosophy.md) |
| Design System | [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md) |
| Navigation Grammar | [mobile-navigation-grammar.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-navigation-grammar.md) |
| Role Shells | [role-shells.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/role-shells.md) |
| Review Checklist | [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/design-review-checklist.md) |
| Constitution | [constitution.md](file:///Users/ankit/a/fleetly/axleops_code/.specify/memory/constitution.md) |
| Spec 001 | [001 spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md) |

## Scope Boundary

This UX package covers the **design system infrastructure** — tokens, components, patterns, state handling, and review criteria. It does **not** cover:

- Feature-specific screens (Active Trip, POD Capture, etc.)
- Business logic or data flows
- Backend contracts
- Implementation code

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color primary | Emerald `#059669` | Harmonizes with web Operations department color; high outdoor contrast |
| Typography | System fonts only | Fastest rendering, guaranteed availability, OS accessibility support |
| Spacing base | 4dp grid | Industry standard, aligns with Material 3 grid |
| Touch target minimum | 48dp | WCAG/Material guideline; critical for field (glove-friendly) use |
| State handling | 5 canonical states + Blocked | Constitution Principle VII requires all; Blocked added for trip execution rules |
| Screen templates | 3 types (List/Detail/Action) | Covers all Driver v1 screens; extensible to future roles |
| No dark mode in v1 | Light theme only | Simplifies token system; dark mode is additive (future) |
| Portrait only in v1 | No landscape support | Driver use case is portrait; reduces layout complexity |
