# QA Checklist — 002 Design Foundation

**Purpose**: Validate that the spec, plan, and UX package for the Design Foundation are complete, clear, and testable — with emphasis on implemented components, role boundaries, and regression risk.  
**Created**: 2026-03-28  
**Grounded in**: spec.md, plan.md, tasks.md, ux/*  
**Depth**: Standard | **Audience**: QA / Reviewer

---

## Requirement Completeness — Design Token System

- [ ] CHK001 — Are all color token categories (brand, semantic, surface, trip-phase, exception) enumerated with exact hex values? [Completeness, Spec §FR-001]
- [ ] CHK002 — Are semantic color roles (success, warning, error, info) mapped to specific use-case contexts, not just listed as values? [Clarity, Spec §FR-001]
- [ ] CHK003 — Is the relationship between `TripPhase` enum colors and `MaterialTheme.colorScheme` documented — which gets used where? [Clarity, Gap]
- [ ] CHK004 — Are typography tokens specified with all required properties (family, size, weight, line height, letter spacing) for all 6 levels? [Completeness, Spec §FR-002]
- [ ] CHK005 — Is it specified which M3 typography slot each design token maps to (e.g., `type.headline` → `headlineMedium`)? [Clarity, Plan §Phase 1]
- [ ] CHK006 — Are spacing tokens documented with their semantic purpose (e.g., `md=12dp` is "standard internal padding"), not just numeric values? [Clarity, Spec §FR-003]
- [ ] CHK007 — Are icon size tokens (touch=24dp, inline=20dp, decorative=16dp) specified in the design system document, not just in code? [Gap, Spec §FR-004]
- [ ] CHK008 — Is the minimum touch target size (48dp) specified as a named token and cross-referenced by component specs? [Completeness, Spec §FR-005]
- [ ] CHK009 — Are elevation tokens (none/low/medium/high) specified with their intended use contexts (cards, headers, modals)? [Completeness, Plan §Phase 1]
- [ ] CHK010 — Are animation/motion tokens (screen=250ms, sheet=200ms, fade=150ms) specified with both duration AND easing curve? [Completeness, Spec §FR-011]

---

## Requirement Completeness — Component Catalog

- [ ] CHK011 — Are all 6 button variants (primary, secondary, text, destructive, icon, FAB) specified with dimensions, colors, disabled state, and usage rules? [Completeness, Spec §FR-005, UX §design-review-checklist]
- [ ] CHK012 — Is the "one primary button per screen" rule documented with guidance on what happens when a screen needs two equally important actions? [Edge Case, UX §interaction-rules 1.1]
- [ ] CHK013 — Are card component variants (standard, active trip, summary, milestone) specified with their internal anatomy (header/body/footer slots, max line counts)? [Completeness, Spec §FR-014]
- [ ] CHK014 — Are all 8 form field types from FR-022 (text, numeric, dropdown, datetime, checkbox, radio, toggle, textarea) documented with dimensions, label placement, and error states? [Completeness, Spec §FR-022]
- [ ] CHK015 — Is the dropdown → bottom sheet threshold (>7 options) specified as a firm rule with guidance on who counts the options — the caller or the component? [Clarity, Spec §FR-022, UX §interaction-rules 6]
- [ ] CHK016 — Are badge dimensions specified for both `compact` (inline) and `standard` (card-level) variants? [Completeness, Spec §FR-034]
- [ ] CHK017 — Are the 5 stepper step states (completed, current, future, blocked, skipped) all specified with distinct visual treatments for both horizontal and vertical variants? [Completeness, Spec §FR-033]
- [ ] CHK018 — Is the bottom sheet max height (70%) specified as a token or a fixed rule, and is behavior for content exceeding that height defined? [Clarity, Plan §Phase 3]
- [ ] CHK019 — Is the upload card state machine (Idle → Uploading → Success/Failed) specified with transitions, retry behavior, and what happens to locally preserved files on app restart? [Completeness, Spec §FR-025]
- [ ] CHK020 — Is the confirmation dialog structure (title, message, confirm, cancel) specified with button color rules for destructive vs non-destructive variants? [Completeness, UX §interaction-rules 1.2]

---

## Requirement Completeness — State System

- [ ] CHK021 — Are all 6 canonical states (Loading, Empty, Error, DataLoaded, Offline, Blocked) defined with entry/exit conditions and visual patterns? [Completeness, Spec §FR-028]
- [ ] CHK022 — Is the skeleton loading pattern specified to match "expected content layout shape" — are per-screen-type skeleton shapes documented? [Clarity, Spec §FR-028, UX §state-inventory 1.3]
- [ ] CHK023 — Is the stale-while-offline behavior specified: indefinite visibility, no timeout, "Last updated X min ago" timestamp format, and refresh interval for the elapsed label? [Completeness, Spec §FR-028, Clarification §2026-03-28]
- [ ] CHK024 — Are state transitions (loading → data, error → retry → loading, offline → reconnect → refresh) specified with animation requirements? [Completeness, Spec §FR-029]
- [ ] CHK025 — Is the Blocked state specified as "inline alongside content" vs "replacing content"? Are the visual rules clear for where the BlockedHint appears relative to the blocked action? [Clarity, Spec §FR-028, UX §state-inventory 1.1]
- [ ] CHK026 — Is the per-screen state justification requirement (FR-030) documented with a template — what format should the omission justification take? [Clarity, Spec §FR-030]
- [ ] CHK027 — Are state rendering rules for pull-to-refresh specified: overlay vs replacement, disabled-when-offline, and which screen types support it vs which don't? [Completeness, UX §state-inventory 1.3, UX §interaction-rules 5.3]

---

## Requirement Clarity — Role Boundaries

- [ ] CHK028 — Is the shared vs role-specific boundary (FR-035) testable: can a reviewer unambiguously classify any given component as "shared" or "role-configurable" using only the spec? [Measurability, Spec §FR-035]
- [ ] CHK029 — Is the prohibition against role-specific token overrides (FR-036) quantified — does it apply to `MaterialTheme` extensions as well, or only to the core token objects? [Clarity, Spec §FR-036]
- [ ] CHK030 — Are the role-configurable elements listed exhaustively, or is the spec's list ("tab content, landing screen, density, empty-state messaging") open-ended? [Ambiguity, Spec §FR-035]
- [ ] CHK031 — Is the component ownership model (shared in `ui/common/`, role-specific in `ui/driver/`) specified with clear criteria for when a component graduates from role-specific to shared? [Gap, Spec §FR-037]
- [ ] CHK032 — Does the spec define what happens when a role needs a component that exists in shared but with a different variant — fork, extend, or contribute back? [Gap, Spec §FR-036]

---

## Requirement Clarity — Navigation & Shell

- [ ] CHK033 — Is the tab count range (2–5) specified with what happens at the boundaries — 1 tab (no tab bar?) and 6+ tabs (error, overflow, or rejection)? [Edge Case, Spec §FR-007]
- [ ] CHK034 — Is the re-tap-active-tab behavior unambiguous: "scroll to top" vs "pop to root" vs "both in sequence"? Are conditions for each clearly stated? [Clarity, Spec §FR-012, Clarification §2026-03-28]
- [ ] CHK035 — Is per-tab navigation stack preservation specified with limits — max stack depth per tab, memory constraints, or cleanup rules? [Edge Case, Gap]
- [ ] CHK036 — Is the offline banner positioning ("between top bar and content") specified with z-index behavior — does it push content down or overlay? [Clarity, Plan §Phase 4]
- [ ] CHK037 — Are tab bar icon and label specifications (active/inactive color, icon size, label typography) defined as tokens rather than implementation-specific values? [Completeness, Spec §FR-007]
- [ ] CHK038 — Is the header bar specification (left-aligned vs centered title) resolved to a single definitive choice? [Ambiguity, Spec §FR-008]

---

## Scenario Coverage — Future Role Expansion

- [ ] CHK039 — Does the spec define a testable procedure for adding a new role shell (step-by-step) using only the design foundation? [Measurability, SC-005]
- [ ] CHK040 — Are requirements defined for what happens when a role has different information density needs than the Driver default? [Coverage, Spec §FR-015, Edge Case §1]
- [ ] CHK041 — Is it specified whether a new role can introduce role-specific state patterns (e.g., a "pending approval" state) or must use only the 6 canonical states? [Gap, Spec §FR-028]
- [ ] CHK042 — Are requirements specified for how the tab bar adapts to 2 tabs vs 5 tabs — even distribution, or left-aligned? [Coverage, Spec §FR-007, Edge Case §3]
- [ ] CHK043 — Does the spec address role-specific empty-state messaging uniquely, or does it only list Driver-centric messages? [Coverage, Spec §FR-035]

---

## Scenario Coverage — Mock-vs-Real Data Implications

- [ ] CHK044 — Is Constitution Principle VIII ("mock/real data visually identical") specified with measurable criteria — how would a reviewer verify that mock data rendering is indistinguishable? [Measurability, UX §design-review-checklist, Alignment §VIII]
- [ ] CHK045 — Are requirements defined for how components behave when backed by mock vs real data — specifically for upload cards (`UploadState`), pull-to-refresh, and offline banner? [Coverage, Gap]
- [ ] CHK046 — Is the offline state testable with mock APIs — does the spec define how mock-backed offline differs from real-backend offline? [Clarity, Gap]
- [ ] CHK047 — Are error state messages specified to be generic enough for both mock and real APIs, or are they expected to differ? [Consistency, Spec §FR-028]

---

## Scenario Coverage — Regression Risk

- [ ] CHK048 — Is the impact of the theme migration (deep blue → emerald primary) documented as a regression surface — which existing screens are affected and how? [Coverage, Plan §Phase 1]
- [ ] CHK049 — Is the `UiState` sealed interface expansion (4 → 6 states) documented with the exhaustive-`when` guarantee — what happens to callers that don't handle `Offline`/`Blocked`? [Clarity, Plan §Phase 2]
- [ ] CHK050 — Is the `UiStateHandler` `Crossfade` animation specified as opt-out-able for performance-sensitive screens, or is it mandated globally? [Gap]
- [ ] CHK051 — Are the import path changes (`ui/shared/Theme.kt` → `ui/theme/*`) documented as a breaking change with migration guidance? [Completeness, Plan §Phase 1]
- [ ] CHK052 — Is the `TabDefinition` contract change (`iconName: String` → `icon: ImageVector`) documented as a breaking change affecting all role registrations? [Completeness, Plan §Phase 4]
- [ ] CHK053 — Are requirements defined for what happens if `compose.materialIconsExtended` is not available — fallback strategy or hard dependency? [Edge Case, Gap]

---

## Acceptance Criteria Quality

- [ ] CHK054 — Can SC-001 ("100% of screens pass visual consistency audit") be objectively measured without subjective judgment — is the audit procedure defined? [Measurability, Spec §SC-001]
- [ ] CHK055 — Is SC-002 ("any developer can build a new screen within 1 day") measurable — what constitutes a "screen" and does the 1-day SLA include testing? [Measurability, Spec §SC-002]
- [ ] CHK056 — Is SC-003 ("non-technical user identifies trip status in 3 seconds") specified with test methodology — how many users, what qualifies as "correct identification"? [Measurability, Spec §SC-003]
- [ ] CHK057 — Is SC-007 ("single source of truth") testable — is there a defined procedure to change one token and verify propagation across all screens? [Measurability, Spec §SC-007]

---

## Dependencies & Assumptions

- [ ] CHK058 — Is the assumption that "Material 3 Compose Multiplatform is the component baseline" validated against iOS rendering compatibility? [Assumption, Spec §Assumptions]
- [ ] CHK059 — Is the `compose.materialIconsExtended` dependency documented as a required dependency with version constraints? [Dependency, Gap]
- [ ] CHK060 — Is the KMP-specific limitation (`System.currentTimeMillis()` in `OfflineBanner`) documented in the spec as a known platform constraint with a remediation timeline? [Dependency, Gap]
- [ ] CHK061 — Are WCAG 2.1 Level AA compliance requirements (4.5:1 contrast, 48dp touch targets) specified as testable criteria with tools/methods for verification? [Completeness, Spec §Assumptions]

---

## Summary

| Dimension | Item Count |
|-----------|-----------|
| Token System Completeness | CHK001–CHK010 (10) |
| Component Catalog Completeness | CHK011–CHK020 (10) |
| State System Completeness | CHK021–CHK027 (7) |
| Role Boundaries Clarity | CHK028–CHK032 (5) |
| Navigation & Shell Clarity | CHK033–CHK038 (6) |
| Future Role Expansion | CHK039–CHK043 (5) |
| Mock-vs-Real Implications | CHK044–CHK047 (4) |
| Regression Risk | CHK048–CHK053 (6) |
| Acceptance Criteria Quality | CHK054–CHK057 (4) |
| Dependencies & Assumptions | CHK058–CHK061 (4) |
| **Total** | **61 items** |
