# User Flow — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> This document describes the **design-time user flows** — how implementors and reviewers interact with the design foundation, not end-user app flows (those live in each feature spec's UX package).

---

## 1. Implementor Flow: Building a New Screen

```
┌─────────────────────┐
│ Receive task to      │
│ build a new screen   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 1. Identify screen   │
│    type: List /      │
│    Detail / Action   │
│    (from design-     │
│    system templates) │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. Apply design      │
│    tokens: colors,   │
│    typography,        │
│    spacing from       │
│    mobile-design-     │
│    system.md          │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. Use shared        │
│    components:        │
│    buttons, cards,    │
│    inputs, badges     │
│    from component     │
│    catalog            │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. Implement all     │
│    applicable states: │
│    Loading, Empty,    │
│    Error, Offline,    │
│    DataLoaded,        │
│    (+ Blocked if      │
│    trip action)       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. Self-review       │
│    against design-    │
│    review-checklist   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. Submit for        │
│    review             │
└─────────────────────┘
```

## 2. Reviewer Flow: Auditing a Screen

```
┌─────────────────────┐
│ Receive PR with      │
│ new/modified screen  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 1. Open design-      │
│    review-checklist   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. Check each        │
│    section (Tokens,   │
│    Accessibility,     │
│    States, Nav,       │
│    Components, Trip   │
│    Visuals, Copy,     │
│    Density, Shared    │
│    Boundaries,        │
│    Platform)          │
└──────────┬──────────┘
           ▼
┌──────────┴──────────┐
│ All pass?            │
├── Yes ──→ Approve    │
├── Minor ─→ Cond.    │
│           Approve    │
└── Fail ──→ Request  │
            Changes    │
```

## 3. Design System Evolution Flow

```
Implementor encounters a pattern not in design system
           ▼
    Is it a one-off exception?
    ├── Yes → Document in screen's spec, use inline styling with comment
    └── No → Propose addition to design system
              ├── Create gap note in specs/{feature}/gaps.md
              ├── Review with project owner
              └── If approved → Update mobile-design-system.md + checklist
```

## 4. Role Addition Flow (Design Perspective)

```
New role approved for mobile
           ▼
1. Create RoleConfig entry (tabs, icons, landing)
           ▼
2. Design role-specific screens using:
   - Same design tokens (colors, typography, spacing)
   - Same component catalog (buttons, cards, inputs)
   - Same state patterns (loading, empty, error, offline)
   - Same screen templates (list, detail, action)
           ▼
3. Only role-specific elements:
   - Tab configuration
   - Screen content/layout
   - Empty-state messaging
   - Data queries/visibility
           ▼
4. Review against design-review-checklist
           ▼
5. Merge — no design system changes required
```
