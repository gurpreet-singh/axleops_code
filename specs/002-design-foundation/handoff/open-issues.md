# Open Issues — 002 Design Foundation

**Author**: PM  
**Date**: 2026-03-28  
**Sources**: design-review-round-1.md, qa-report-round-1.md, implementation-notes.md, spec/ux/plan  
**Feature status**: See §5 below

---

## 1. Consolidated Issue Register

Every unresolved item across design review and QA report is assigned a stable ID (`OI-NNN`), classified by owner, and given a resolution path. Fixed issues from design review round 1 (#2, #3, #6, #8, #9, #10, #11, #12) are excluded — they are verified as resolved.

---

### OI-001 · Per-tab NavHost not implemented

| Field | Value |
|-------|-------|
| **Source** | DR-R1 Issue #1, QA CHK035 |
| **Owner** | Engineer |
| **Severity** | Major |
| **Classification** | Architecture issue |
| **Resolution** | Engineer can fix directly |
| **Status** | Deferred — no drill-down screens exist yet |

**Description**: `AuthShell` uses flat `mutableStateOf` tab switching. Tab switch destroys previous tab's state. Per-tab `NavController` + `rememberSaveable` needed to preserve per-tab backstacks per FR-012.

**Downstream impact**: **Active Trip** feature will require drill-down (trip card → stepper → milestone detail). Without per-tab NavHost, navigating from milestone back to stepper will lose scroll position. Must be resolved before the Active Trip epic starts implementation.

---

### OI-002 · `System.currentTimeMillis()` in OfflineBanner

| Field | Value |
|-------|-------|
| **Source** | DR-R1 Issue #7, QA CHK060 |
| **Owner** | Engineer |
| **Severity** | Minor |
| **Classification** | Implementation defect (KMP incompatibility) |
| **Resolution** | Engineer can fix directly |
| **Status** | Deferred — no iOS build yet |

**Description**: `OfflineBanner` uses `System.currentTimeMillis()` — JVM-specific. Will crash on iOS.

**Downstream impact**: Blocks iOS build. Fix requires `kotlinx-datetime` dependency (`Clock.System.now().toEpochMilliseconds()`). Low effort (~15 min). Should be resolved before first iOS CI pass.

---

### OI-003 · Missing form components: datetime picker, radio button

| Field | Value |
|-------|-------|
| **Source** | DR-R1 Issue #4, QA CHK014 |
| **Owner** | PM + Engineer |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Spec must be updated first (FR-022 scope decision), then engineer implements |
| **Status** | Requires PM decision |

**Description**: Spec FR-022 says MUST define 8 form field types. Implementation has 5 (text, dropdown, checkbox, switch, textarea). Missing: datetime picker and radio button.

**PM decision needed**: 
- **DateTime picker**: Likely needed for POD capture (timestamp entry) and trip scheduling. Foundation or Active Trip?
- **Radio button**: Less common in field-first UX. Defer or implement now?

**Downstream impact**: If deferred, feature teams will build ad-hoc pickers — inconsistency risk. Recommend: datetime picker → foundation scope; radio button → defer to v2.

---

### OI-004 · Spec FR-004 doesn't name icon size tokens

| Field | Value |
|-------|-------|
| **Source** | QA CHK007 |
| **Owner** | Designer |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | docs/design/mobile-design-system.md must be updated first |
| **Status** | Open |

**Description**: Code has `IconSize.touch/inline/decorative` (24/20/16dp). Spec FR-004 says "standard icon sizes" without naming the tokens. `mobile-design-system.md §1.6` mentions "outlined style, 24dp standard size" but doesn't define the 3-level system.

**Downstream impact**: Low — tokens exist in code. Feature teams can use them. But spec-to-code traceability is broken for this particular FR.

---

### OI-005 · No per-screen state justification template (FR-030)

| Field | Value |
|-------|-------|
| **Source** | QA CHK026 |
| **Owner** | PM |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Spec must be updated first |
| **Status** | Open |

**Description**: FR-030 requires every screen to handle all 6 states or document why not. No template or format is specified. Feature specs will need a "State Coverage Grid" table.

**PM action**: Add a "State Coverage Grid" template to spec.md or create a shared template in `specs/_templates/state-coverage-grid.md`.

**Downstream impact**: Without a template, feature specs will document state coverage inconsistently. Recommend establishing the template before Active Trip spec review.

---

### OI-006 · No component graduation policy (role → shared)

| Field | Value |
|-------|-------|
| **Source** | QA CHK031, CHK032 |
| **Owner** | Architect |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Spec §FR-037 must be updated first |
| **Status** | Open |

**Description**: No documented criteria for when a role-specific component should move to shared, or what happens when a role needs a variant of a shared component (fork? extend? contribute back?).

**Downstream impact**: As OpsExec and Workshop Manager roles are added, component duplication risk increases. Without a policy, teams will fork shared components ad-hoc. Recommend: add graduation policy to spec §FR-037 — "If 2+ roles use a component, it graduates to shared."

---

### OI-007 · Tab count out-of-range behavior unspecified

| Field | Value |
|-------|-------|
| **Source** | QA CHK033 |
| **Owner** | Engineer + Architect |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap + implementation defect |
| **Resolution** | Engineer can fix directly (add `require()`) |
| **Status** | Open — quick fix |

**Description**: Spec says 2–5 tabs. `AuthShell` has no validation. `role-shells.md` §4.3 shows Mechanic with 3 tabs and §6 says "3–5 tabs". Inconsistency with spec's "2–5".

**Downstream impact**: Potential crash if a future role config has 0–1 tabs. Add `require(tabs.size in 2..5)` to `AuthShell`.

---

### OI-008 · Information density not configurable per role

| Field | Value |
|-------|-------|
| **Source** | QA CHK040 |
| **Owner** | Architect |
| **Severity** | Minor |
| **Classification** | Future-consistency risk |
| **Resolution** | Architecture decision — spec first, then plan, then engineer |
| **Status** | Deferred |

**Description**: `mobile-design-philosophy.md §5` defines 3 density tiers (Compact/Standard/Rich). Spec FR-035 lists "density" as role-configurable. But `RoleConfig` has no `density` parameter — it's currently screen-level, not role-level.

**Downstream impact**: Low for v1 (Driver only). Becomes relevant when OpsExec (multi-trip view, compact density) is added. Recommend: defer to v2 scope. Document as intentional simplification.

---

### OI-009 · UiState sealed interface not extensible by roles

| Field | Value |
|-------|-------|
| **Source** | QA CHK041 |
| **Owner** | Architect |
| **Severity** | Minor |
| **Classification** | Future-consistency risk |
| **Resolution** | Architecture decision required |
| **Status** | Deferred |

**Description**: `UiState` is a sealed interface in `commonMain`. A new role wanting a custom state (e.g., "PendingApproval") cannot extend it without modifying shared code — violating the "zero shared-code changes for new role" guarantee.

**Downstream impact**: Low — the 6 canonical states cover all identified use cases. If a role-specific state is truly needed, `UiState.DataLoaded<PendingApprovalWrapper>` is the escape hatch. Document as intentional constraint.

---

### OI-010 · Crossfade animation in UiStateHandler is non-optional

| Field | Value |
|-------|-------|
| **Source** | QA CHK050 |
| **Owner** | Engineer |
| **Severity** | Minor |
| **Classification** | Future-consistency risk |
| **Resolution** | Engineer can fix directly |
| **Status** | Open — quick fix |

**Description**: `UiStateHandler` wraps all state rendering in `Crossfade(150ms)`. No `animate` parameter to disable it if a performance-sensitive screen needs instant cuts.

**Downstream impact**: Low for v1 screens. Could cause frame drops on complex list screens with rapid state changes. Add `animate: Boolean = true` parameter — ~5 min fix.

---

### OI-011 · Mock APIs don't simulate offline behavior

| Field | Value |
|-------|-------|
| **Source** | QA CHK046 |
| **Owner** | Engineer |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Spec must define mock offline behavior first |
| **Status** | Deferred |

**Description**: `MockTripService` returns hardcoded data. No mechanism to simulate offline state (connectivity toggle, delayed responses, cached vs fresh data).

**Downstream impact**: Offline UX cannot be tested in mock mode. Recommend: add a `MockNetworkInterceptor` with configurable online/offline toggle before the Active Trip feature reaches integration testing.

---

### OI-012 · SC-003 test methodology missing

| Field | Value |
|-------|-------|
| **Source** | QA CHK056 |
| **Owner** | PM + Designer |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Not code-actionable — usability test protocol needed |
| **Status** | Deferred |

**Description**: SC-003 ("non-technical user identifies trip status in 3 seconds") has no defined test methodology — user count, success criteria, testing protocol.

**Downstream impact**: None for engineering. This is a PM/UX research deliverable. Standard approach: 5–8 users, think-aloud protocol, measure time-to-correct-identification with the trip status badge/stepper.

---

### OI-013 · Per-screen skeleton shapes not specified

| Field | Value |
|-------|-------|
| **Source** | QA CHK022 |
| **Owner** | Designer |
| **Severity** | Minor |
| **Classification** | Requirement/spec gap |
| **Resolution** | Feature UX artifacts must define per-screen skeleton shapes |
| **Status** | Deferred — per-feature responsibility |

**Description**: Generic `SkeletonCard` (title + 2 body lines) exists. Spec says skeletons should "match expected content layout shape" — no per-screen skeleton specs exist.

**Downstream impact**: Each feature spec (Active Trip, Past Trips, Earnings) should define its own skeleton shape for its list/detail screens. This is feature-level, not foundation-level. Add to feature spec template.

---

## 2. Owner Summary

| Owner | Count | Open IDs |
|-------|-------|----------|
| **Engineer** | 5 | OI-001, OI-002, OI-007, OI-010, OI-011 |
| **PM** | 3 | OI-003, OI-005, OI-012 |
| **Architect** | 3 | OI-006, OI-008, OI-009 |
| **Designer** | 2 | OI-004, OI-013 |

---

## 3. Resolution Path Summary

| Path | Count | IDs |
|------|-------|-----|
| Engineer can fix directly | 4 | OI-001, OI-002, OI-007, OI-010 |
| Spec must be updated first | 3 | OI-003, OI-005, OI-006 |
| docs/design/* must be updated first | 1 | OI-004 |
| Feature UX artifacts must be updated first | 1 | OI-013 |
| Architecture decision required | 2 | OI-008, OI-009 |
| Not code-actionable | 1 | OI-012 |
| Spec must define mock behavior first | 1 | OI-011 |

---

## 4. Quick Wins (can fix in <30 min total)

| ID | Fix | Time |
|----|-----|------|
| OI-007 | Add `require(tabs.size in 2..5)` to `AuthShell` | ~5 min |
| OI-010 | Add `animate: Boolean = true` param to `UiStateHandler` | ~5 min |
| OI-002 | Replace `System.currentTimeMillis()` with `Clock.System.now()` | ~15 min |

---

## 5. Feature Status: Ready for Fix Round

> **Design Foundation is approved to proceed to the next feature epic**, subject to the following conditions:
>
> 1. **OI-001 (Per-tab NavHost)** must be resolved before Active Trip reaches the "milestone detail drill-down" implementation task — not before feature spec/plan.
> 2. **OI-007, OI-010** should be resolved in the next engineer fix round (30 min combined).
> 3. **OI-003 (datetime picker)** requires a PM scope decision before Active Trip spec is finalized.
> 4. All other items can be resolved in parallel with Active Trip planning.

**Rationale**: The foundation's token system, component catalog, state pattern, and role architecture are complete and verified. Zero critical issues. The 1 major issue (OI-001 per-tab NavHost) is deferred by design and has no user-visible impact until drill-down screens exist. The remaining items are spec documentation gaps, not implementation defects.

---

## 6. Downstream Impact by Feature

| Future Feature | Impacted OIs | Risk if Unresolved |
|---|---|---|
| **Active Trip (003)** | OI-001, OI-003, OI-005, OI-013 | No per-tab backstack; no datetime picker; no state coverage template; no skeleton spec |
| **Past Trips (004)** | OI-001, OI-013 | No per-tab backstack; no skeleton spec |
| **Earnings (005)** | OI-013 | No skeleton spec |
| **OpsExec v2 role** | OI-006, OI-007, OI-008, OI-009 | No component graduation policy; no tab count guard; no density config; no state extensibility |
| **iOS build** | OI-002 | Crash on OfflineBanner |
| **Integration testing** | OI-011 | Cannot test offline UX with mocks |

---

> [!IMPORTANT]
> **OI-001 (per-tab NavHost)** and **OI-003 (datetime picker)** are the two items most likely to create inconsistency in later features if not resolved early. All other items are documentation gaps with low engineering risk.
