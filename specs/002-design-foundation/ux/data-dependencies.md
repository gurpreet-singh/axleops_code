# Data Dependencies — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> The Design Foundation is a **design-governance feature** — it produces design artifacts (documents, tokens, patterns), not data-driven screens. Its "data dependencies" are the existing design and specification documents it draws from and the downstream features that consume its outputs.

---

## 1. Input Dependencies (What Informed the Design Foundation)

| Source | Document | How It Influenced Design Foundation |
|--------|----------|--------------------------------------|
| Constitution | [constitution.md](file:///Users/ankit/a/fleetly/axleops_code/.specify/memory/constitution.md) | Principle VII mandates five UI states. Principle II mandates role-scoped design. Principle IX mandates reviewable diffs. |
| Product Spec | [product.md](file:///Users/ankit/a/fleetly/axleops_code/product.md) | Department colors inform mobile palette. Dashboard-per-role pattern informs shell architecture. 19 roles inform extensibility requirements. |
| Trip Spec | [trip.md](file:///Users/ankit/a/fleetly/axleops_code/trip.md) | 4-phase lifecycle informs trip visual language. 10-milestone flow informs stepper component. 13 exception states inform exception badge design. |
| Frontend Spec | [frontend_specification.md](file:///Users/ankit/a/fleetly/axleops_code/frontend_specification.md) | Web component system (atoms/molecules/organisms) informs mobile component catalog. Right slider pattern translates to bottom sheet on mobile. |
| Mobile Discovery | [mobile-discovery.md](file:///Users/ankit/a/fleetly/axleops_code/docs/analysis/mobile-discovery.md) | Driver v1 scope informs reference validation target. Mock/real strategy informs state handling (mock data must be visually identical to real). |
| Spec 001 | [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/001-mobile-role-strategy/spec.md) | Role-extensible architecture informs shared vs role-specific boundaries. RoleConfig informs tab bar configuration. |

## 2. Output Dependencies (What Consumes the Design Foundation)

| Consumer | What It Uses |
|----------|-------------|
| **Every feature spec** (003+) | Screen template assignments, state handling requirements, component references |
| **Every implementation plan** | Design tokens for theming, component catalog for UI architecture |
| **Every task** | Design review checklist for acceptance criteria |
| **Theme implementation** (`composeApp/theme/`) | Design token values (colors, typography, spacing, elevation, animation) |
| **Shared UI components** (`ui/common/`) | Component specs (buttons, cards, inputs, badges, steppers, state screens) |
| **Navigation shell** (`navigation/`) | Shell layout (header + content + tab bar) and navigation grammar rules |
| **Code reviewers** | Design review checklist sections as merge-blocking criteria |

## 3. Runtime Data (None)

This feature has **no runtime data dependencies**. It does not call APIs, read from databases, or consume user data. All design foundation outputs are static artifacts consumed at development time.

| Aspect | Value |
|--------|-------|
| API calls | None |
| Mock data | None |
| Real-time data | None |
| User input | None |
| Backend dependencies | None |

## 4. Cross-Feature Token Usage

When a feature implements screens using the design foundation, the token flow is:

```
Design Foundation (docs/design/mobile-design-system.md)
        │
        ▼ defines tokens
Theme Implementation (composeApp/theme/)
        │
        ▼ consumed by
Shared Components (ui/common/)
        │
        ▼ composed into
Feature Screens (ui/driver/activetrip/, ui/driver/pasttrips/, etc.)
```

**Rule**: Feature screens MUST NOT reference raw values. They consume tokens via theme (e.g., `MaterialTheme.colorScheme.primary`, not `Color(0xFF059669)`).
