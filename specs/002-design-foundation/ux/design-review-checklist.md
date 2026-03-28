# Design Review Checklist — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> Feature-local mirror of the global [design-review-checklist.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/design-review-checklist.md), tailored to the design foundation deliverables themselves.

---

## Design System Completeness

- [x] Color palette defined: brand, semantic, surface, and trip phase tokens
- [x] Typography scale defined: 6 levels with size, weight, line height, letter spacing
- [x] Spacing scale defined: 4dp base, named tokens from xxs to screen
- [x] Elevation tokens defined: 4 levels (none, low, medium, high)
- [x] Corner radius tokens defined: 4 sizes (sm, md, lg, full)
- [x] Animation tokens defined: screen, sheet, fade, collapse with durations and curves

## Component Catalog Completeness

- [x] Buttons: 6 variants (primary, secondary, text, destructive, icon, FAB) with dimensions and states
- [x] Cards: 4 variants (standard, active trip, summary, milestone) with anatomy rules
- [x] Inputs: 7 types (text, numeric, dropdown, datetime, checkbox, radio, toggle) with states
- [x] Status badges: 3 types (phase, exception, count) with dimensions
- [x] Stepper: 2 variants (horizontal summary, vertical detail) with 5 step states
- [x] State screens: 4 components (loading, empty, error, offline banner)
- [x] Bottom sheet: dimensions, handle, max height, animation
- [x] Modal dialog: dimensions, structure, action alignment

## Screen Templates

- [x] List template defined with layout zones
- [x] Detail template defined with section rules
- [x] Action (form) template defined with bottom-anchored CTA
- [x] All Driver v1 screens allocated to a template type

## State Handling Coverage

- [x] 6 states defined (Loading, Empty, Error, DataLoaded, Offline, Blocked)
- [x] State transition diagram documented
- [x] State rendering rules documented (no blank screens, stale-while-offline, retry always available)
- [x] Per-screen-type state inventory completed
- [x] Justified omissions documented (Login has no Empty state, etc.)
- [x] Shared state components specified (`UiStateHandler`, `EmptyStateScreen`, etc.)

## Interaction Rules Coverage

- [x] Primary action rules (one per screen, bottom-anchored, verb-first)
- [x] Destructive action rules (confirmation modal, deliberate reach)
- [x] Upload/evidence patterns (photo, document, signature)
- [x] Confirmation/feedback patterns (success, error, snackbar)
- [x] Blocked state interaction rules
- [x] Navigation interactions (tab bar, back, pull-to-refresh)
- [x] Form interaction rules (validation timing, partial progress, keyboard handling)

## Cross-Cutting Concerns

- [x] Shared vs role-specific boundaries clearly defined
- [x] Trip visual language defined (4 phases + exception + milestone stepper)
- [x] Accessibility minimums defined (48dp touch, 4.5:1 contrast, 11sp floor)
- [x] Responsive rules defined (< 360dp, standard, > 428dp)
- [x] Information density tiers defined (compact, standard, rich)

## Document Cross-References

- [x] All design documents cross-reference each other
- [x] UX brief links to all design artifacts
- [x] Screen map links to component catalog and templates
- [x] State inventory references design system state components
- [x] Interaction rules align with navigation grammar

## Alignment with Constitution

- [x] Principle II (Role-Scoped Design): shared/role-specific boundaries documented
- [x] Principle VII (Production-Grade Field UX): all 5 states + blocked defined
- [x] Principle VIII (Testability & Switchability): mock/real data visually identical (no mock-specific styling)
- [x] Principle IX (Reviewability): 10-section design review checklist created

---

## Verdict

All items checked. Design foundation package is complete and ready for architectural planning (`/speckit.plan`).
