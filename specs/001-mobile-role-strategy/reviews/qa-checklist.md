# QA Checklist — Mobile Role Strategy

**Purpose**: Validate requirements completeness, clarity, and consistency for role boundaries, shared navigation, expansion readiness, mock/real strategy, and regression risk.
**Created**: 2026-03-28
**Grounded in**: spec.md, plan.md, tasks.md, ux/, design-review-round-2.md, implementation-notes.md
**Focus**: Role boundaries · Shared vs role-specific · Expansion readiness · Mock-vs-real · Regression risk

---

## Role Boundaries

- [ ] CHK001 — Are the exact boundaries between "shared" and "role-specific" screens enumerated? [Completeness, Spec §FR-007/FR-008]
- [ ] CHK002 — Is the rule for which screens are role-specific vs shared applied consistently between spec §FR-007, plan §Shared Components table, and ux/screen-map.md? [Consistency]
- [ ] CHK003 — Are data visibility rules specified for every repository interface (who sees what)? [Completeness, Spec §FR-008, US4]
- [ ] CHK004 — Is the behavior defined when a user's backend role exists in `AppRole` enum but has no `RoleConfig` entry? [Edge Case, Spec §Edge Cases]
- [ ] CHK005 — Are role boundary violations testable — i.e., are there measurable criteria for "no Driver content visible to OpsExec" and vice versa? [Measurability, Spec §US1 AC2]
- [ ] CHK006 — Is the "ALL" role filtering requirement clear about where filtering occurs (ViewModel, backend, or both)? [Clarity, Spec §FR-005]
- [ ] CHK007 — Are requirements defined for what happens when backend adds a new role value not in the mobile `AppRole` enum? [Edge Case, Spec §Edge Cases]

## Shared vs Role-Specific Navigation

- [ ] CHK008 — Is the Settings tab's "always last" position rule documented as a formal constraint or merely a convention? [Clarity, Plan §D3]
- [ ] CHK009 — Are tab count limits (3–5) specified in the spec or only in the design doc? Is this a hard constraint or guideline? [Clarity, Gap]
- [ ] CHK010 — Is the requirement for tab state preservation (switching tabs preserves navigation stack) documented in the spec or only in the design doc? [Gap, design/mobile-navigation-grammar.md §3.1]
- [ ] CHK011 — Are requirements for hiding the tab bar during immersive flows specified in the spec? [Gap, design/mobile-navigation-grammar.md §3.1]
- [ ] CHK012 — Is the relationship between `TabDefinition.id` values and navigation routing explicitly defined? [Clarity, Plan §RoleConfig]
- [ ] CHK013 — Are the rules for which elements compose the AuthShell (top bar + content + bottom bar) formally specified, or only in the design doc? [Traceability, Spec §FR-006]
- [ ] CHK014 — Is the top bar content (screen title, role badge, optional actions) specified per screen, or is it underspecified as "shared structure"? [Clarity, design/role-shells.md §2.2]

## Future Role Expansion Readiness

- [ ] CHK015 — Is the "zero changes to existing code" claim (Spec §FR-011) defined with measurable scope — does it mean zero file diffs, zero line changes, or zero behavior changes? [Measurability, Spec §FR-011]
- [ ] CHK016 — Is the requirement for a "coming soon" stub screen (Spec §FR-012) specified with enough detail — what text, what layout, what actions are available? [Completeness, Spec §FR-012]
- [ ] CHK017 — Are requirements defined for what happens when a role has a RoleConfig but its `contentFactory`/NavGraph is not yet implemented? [Edge Case, Gap]
- [ ] CHK018 — Does the spec define the process for registering a new role, or only the technical mechanism? Is there a documented checklist or steps? [Completeness, Spec §FR-010]
- [ ] CHK019 — Is the antipattern "monolithic when(role) in shared code" (design/role-shells.md §7) reconciled with the current AppNavHost implementation that uses exactly this pattern? [Conflict, design-review F1]
- [ ] CHK020 — Are the future role tab projections (OpsExec: Fleet Map/Trips/Alerts/Settings) documented as non-binding projections or as requirements? [Clarity, design/role-shells.md §4]
- [ ] CHK021 — Is SC-002 ("adding a new role takes less than 1 day") measurable — does it include navigation framework setup, or assume it exists? [Measurability, Spec §SC-002]

## Mock-vs-Real Strategy

- [ ] CHK022 — Are the criteria for when a feature graduates from MOCK to REAL specified? [Gap]
- [ ] CHK023 — Is the requirement for runtime mock/real switching (Spec §FR-017) specified clearly enough — is it a compile-time flag, a runtime toggle, or both? [Clarity, Spec §FR-017]
- [ ] CHK024 — Is the dropped `HYBRID` mode (plan §DataSourceMode) documented as an explicit decision or a silent omission? [Gap, implementation-notes ID6]
- [ ] CHK025 — Are requirements defined for mock fixture file naming conventions and directory structure, or is the current layout a de facto standard? [Clarity, Plan §QA Fixture Editing]
- [ ] CHK026 — Is the spec clear about QA fixture swap behavior — does "no rebuild required" mean hot-reload or re-launch? [Clarity, Spec §SC-004]
- [ ] CHK027 — Are error simulation fixtures (e.g., `driver-trips-error.json`) specified with expected error types, or is the format up to the implementer? [Completeness, Gap]
- [ ] CHK028 — Is the requirement that mock data be "realistic" (Spec §FR-018) defined with measurable criteria — field count, data shape, value ranges? [Measurability, Spec §FR-018]
- [ ] CHK029 — Are the implications of `tripSource: REAL` with backend gap G2 (no driverId filter) documented — does the app silently show all trips or apply client-side filtering? [Edge Case, backend-gaps.md G2]

## Regression Risk

- [ ] CHK030 — Are regression boundaries defined when adding a new role — what test surfaces must pass to confirm Driver is unaffected? [Gap]
- [ ] CHK031 — Is session expiry behavior specified for all screens or only generically? [Coverage, Spec §US2 AC2]
- [ ] CHK032 — Are requirements defined for the interaction between DataSourceConfig toggles and active data on screen — does toggling mid-session clear caches, reload data, or require restart? [Gap]
- [ ] CHK033 — Is the requirement for "no role retains a stale session" (Spec §US2 AC3) specified with enough detail for test automation — what constitutes "stale"? [Clarity, Spec §US2 AC3]
- [ ] CHK034 — Are requirements defined for concurrent user scenarios — e.g., same user logged in on two devices with different roles? [Coverage, Gap]
- [ ] CHK035 — Is the logout flow specified for all intermediate auth states (LoggingIn, RoleSelection), not just Authenticated? [Coverage, Gap]
- [ ] CHK036 — Are requirements for app behavior on network loss during auth flow specified? [Edge Case, Gap]

## Design Review Mismatches (from design-review-round-2.md)

- [ ] CHK037 — Is the logout confirmation modal requirement (design/role-shells.md §3.1 "Logout → Modal (confirm)") reflected in the spec, or only in the design doc? [Traceability, M5]
- [ ] CHK038 — Is the 401/session expiry auto-redirect requirement (design/role-shells.md §2.2) reflected in the spec acceptance criteria, or only in the design doc? [Traceability, Spec §US2 AC2, M6]
- [ ] CHK039 — Is the navigation framework decision (Voyager vs Decompose) documented as a deferred decision with resolution criteria, or left open-ended? [Clarity, Plan §D9, M3]
- [ ] CHK040 — Is the emoji-icon workaround (implementation-notes ID2) documented as a known tech-debt item with resolution trigger, or only in the implementation notes? [Traceability, M2]
- [ ] CHK041 — Is the `isDebugBuild` derivation requirement specified — must it come from `BuildConfig`, a compile flag, or is it undefined? [Clarity, M9]

## Dependencies & Assumptions

- [ ] CHK042 — Are all 5 backend gaps (G1–G5) cross-referenced from the spec, or only documented in a separate file? [Traceability, backend-gaps.md]
- [ ] CHK043 — Is assumption A2 ("POST /auth/select-role returns role-scoped JWT, not ALL") validated against the actual backend, or stated as an untested assumption? [Assumption, Plan §A2]
- [ ] CHK044 — Is the iOS entry point requirement (Koin initialization) specified anywhere, or is it an implementation gap discovered post-hoc? [Gap, implementation-notes OI1]
- [ ] CHK045 — Are the Kotlin/KMP version constraints (Kotlin 2.3.0, Compose Multiplatform 1.10.0) documented as hard requirements with compatibility notes? [Completeness, Gap]
- [ ] CHK046 — Is the `baseUrl` configuration strategy documented — how and where is it set per environment (dev, staging, prod)? [Gap, implementation-notes OI4]
