# QA Checklist — Driver Active Trip

> **Feature**: 005-driver-active-trip
> **Created**: 2026-03-29
> **Purpose**: Requirements quality validation — are the spec, UX, and plan complete, clear, consistent, and testable?
> **Grounded in**: spec.md, ux/ (7 files), plan.md, tasks.md, design-review-round-1.md, implementation-notes.md

---

## 1. Active Trip Visibility

### Requirement Completeness

- [ ] CHK001 — Are requirements defined for all 4 ActiveTripScreen layout variants (empty, dispatched, active, read-only)? [Completeness, screen-map §3.1–3.4]
- [ ] CHK002 — Is the trip card content for each layout variant exhaustively listed with field-by-field requirements? [Completeness, Spec §FR-002, data-dependencies §1.1]
- [ ] CHK003 — Are requirements defined for what happens when the driver has no active trip AND a background queued trip is syncing? [Gap, Spec §FR-001]
- [ ] CHK004 — Is the auto-refresh behavior (app foreground > 30s) specified with measurable timing? [Completeness, interaction-rules §7]
- [ ] CHK005 — Are requirements defined for the transition between "Active Trip" and "No Trip" when a trip is rejected or completed mid-session? [Coverage, user-flow §1]
- [ ] CHK006 — Is the ActiveTripScreen listed in the screen-map as a distinct screen separate from TripDetailScreen? [Consistency, screen-map §2 vs design-review CR-3]

### Requirement Clarity

- [ ] CHK007 — Is "trip card" precisely defined with dimensions, padding, and anatomy rules from design system §2.2? [Clarity, mobile-design-system §2.2]
- [ ] CHK008 — Is the stepper progress indicator representation (dot vs icon vs filled circle) fully specified per state? [Clarity, mobile-design-system §2.5]
- [ ] CHK009 — Is "scrollable content" quantified for how much of the screen it occupies relative to the sticky CTA and status bar? [Clarity, ux-brief §3]

---

## 2. Lifecycle State Presentation

### Requirement Completeness

- [ ] CHK010 — Are driver-visible labels defined for all 29 driver-visible sub-states in state-inventory §1? [Completeness, state-inventory §1.1–1.4]
- [ ] CHK011 — Are badge color tokens defined for all sub-states, including exception states and EWB sub-states? [Completeness, state-inventory §1–2]
- [ ] CHK012 — Is the precedence rule (Exception > EWB Blocking > Offline > Normal) documented with all possible overlapping combinations? [Completeness, state-inventory §5]
- [ ] CHK013 — Are requirements defined for what the driver sees during the transition animation between two sub-states (e.g., ACCEPTED → AT_ORIGIN)? [Gap]
- [ ] CHK014 — Are requirements defined for the UNKNOWN status fallback (unmapped backend string)? [Coverage, implementation-notes T001]
- [ ] CHK015 — Is the GPS_LOST state specified as non-blocking (warning only, different from other exceptions)? [Clarity, state-inventory §2, Spec §FR-058]

### Requirement Consistency

- [ ] CHK016 — Are the driver-visible labels in spec §FR-090 table consistent with the labels in state-inventory §1? [Consistency, Spec §FR-090 vs state-inventory §1]
- [ ] CHK017 — Is the COMPLETED status (legacy alias for POD_VERIFIED) consistent across spec, state-inventory, and TripStatus enum? [Consistency, implementation-notes T001]
- [ ] CHK018 — Do the CTA labels in interaction-rules §1.1 match the DriverAction.ctaLabel values in implementation-notes T013? [Consistency]

---

## 3. Allowed vs Blocked Driver Actions

### Requirement Completeness

- [ ] CHK019 — Are all 12 transitions in the state machine documented with source state, action, and target state? [Completeness, Spec §FR-020–FR-028]
- [ ] CHK020 — Is the accept timeout (30 minutes) defined with start reference (dispatch timestamp) and what the driver sees after expiry? [Completeness, Spec §FR-005]
- [ ] CHK021 — Are requirements for the "Reject" flow complete: reason field required, minimum length, and what happens to the trip after rejection? [Completeness, Spec §FR-004, interaction-rules §2.1]
- [ ] CHK022 — Are the blocked states exhaustively listed with both the visual treatment AND the resolution path ("who can resolve it")? [Completeness, interaction-rules §4.2]
- [ ] CHK023 — Is the EWB guard defined as backend-only (mobile sends depart → backend rejects 422)? Is this clear enough to prevent client-side EWB checks? [Clarity, Spec §FR-023, Clarifications Q2]
- [ ] CHK024 — Are requirements defined for what happens when an exception is reported during DEPARTED vs AT_DESTINATION (different allowed states)? [Coverage, Spec §FR-080]

### Requirement Clarity

- [ ] CHK025 — Is "disabled button" (38% opacity, non-interactive) quantified identically across design-system §2.1 and interaction-rules §1.3? [Consistency]
- [ ] CHK026 — Is the distinction between "CTA hidden" (exception active, read-only states) and "CTA disabled" (accept timeout, EWB pending) clearly documented? [Clarity, interaction-rules §1.1]

---

## 4. Transition Handling

### Requirement Completeness

- [ ] CHK027 — Are requirements defined for the loading indicator on the CTA button during a transition API call? [Completeness, interaction-rules §3.3]
- [ ] CHK028 — Is the success snackbar ("✓ [Milestone name] completed", 3 seconds) defined for all milestone transitions? [Completeness, interaction-rules §3.1]
- [ ] CHK029 — Is the 409 Conflict error handling (state changed on server) defined with refresh + snackbar behavior? [Completeness, data-dependencies §5]
- [ ] CHK030 — Is the 422 Unprocessable error handling (EWB guard) defined with inline blocked message? [Completeness, data-dependencies §5, Spec §FR-023]
- [ ] CHK031 — Are requirements for queuing multiple offline transitions defined with replay order and halt-on-rejection behavior? [Completeness, Spec §FR-101, Clarifications Q1]
- [ ] CHK032 — Is the discrepancy notification (queued action rejected after sync) defined with modal content and trip state refresh? [Completeness, interaction-rules §3.2]

### Scenario Coverage

- [ ] CHK033 — Are requirements defined for what happens when a transition succeeds but the response is lost due to network failure? [Coverage, Edge Case]
- [ ] CHK034 — Are requirements defined for concurrent transitions (driver taps CTA twice quickly)? [Coverage, Edge Case]
- [ ] CHK035 — Are requirements specified for what happens when the trip state changes on the server while the driver is filling a form (race condition)? [Coverage, Edge Case]

---

## 5. Document / Evidence / POD Flows

### Requirement Completeness

- [ ] CHK036 — Is the POD flow defined as a 4-step sequence (Photos → Signature → Consignee → Review) with explicit step indicators? [Completeness, user-flow §4, screen-map §2]
- [ ] CHK037 — Is the minimum photo count (default 2, template-configurable) defined with validation message text? [Completeness, Spec §FR-031]
- [ ] CHK038 — Is the signature capture defined with canvas dimensions (200dp min height), ink color, and clear/next actions? [Completeness, interaction-rules §5.2]
- [ ] CHK039 — Is the document category list exhaustive (7 categories) and consistent between spec §FR-061 and interaction-rules §5.3? [Consistency, Spec §FR-061]
- [ ] CHK040 — Are file size limits defined (< 10 MB per file) with error message text? [Completeness, interaction-rules §5.3]
- [ ] CHK041 — Are requirements for the "Discard POD?" confirmation modal defined (title, body, actions)? [Completeness, interaction-rules §2.1]
- [ ] CHK042 — Is the document soft-delete behavior defined with audit fields (deleted_by, deleted_at) and immutability after POD_SUBMITTED? [Completeness, Spec §FR-066]
- [ ] CHK043 — Are per-file upload progress and per-file retry requirements defined for POD photos? [Completeness, Spec §FR-034]
- [ ] CHK044 — Is the "Refused" POD type flow defined with required refusal reason and transition to DELIVERY_REJECTED? [Completeness, Spec §FR-032]

### Edge Cases

- [ ] CHK045 — Is the behavior defined when the app is force-killed during a multi-photo POD upload? [Coverage, Spec Edge Cases]
- [ ] CHK046 — Is the behavior defined when GPS is unavailable during milestone capture (warning, not block)? [Coverage, Spec §FR-027]
- [ ] CHK047 — Is the weight deviation warning (> 5% from booked) defined as non-blocking? [Coverage, Spec Edge Cases]

---

## 6. Mock-vs-Real Switching

### Requirement Completeness

- [ ] CHK048 — Is the DataSourceConfig toggle mechanism documented for all 8 repository types (trip, document, expense, exception, checkpoint, location, pod, milestone)? [Completeness]
- [ ] CHK049 — Are mock fixtures documented with specific sub-states they cover (accepted, in-transit, delivered, pod-submitted, no-trip, milestones-full-lifecycle, expenses-documents-sample)? [Completeness]
- [ ] CHK050 — Is the switching behavior defined: does toggling require app restart or take effect immediately? [Clarity]
- [ ] CHK051 — Are requirements for mock GPS tracking ("silent sink") defined separately from real GPS tracking? [Consistency]
- [ ] CHK052 — Are the derived API contracts (§2.2 in data-dependencies) documented with request/response shapes that both mock and real implementations share? [Completeness, data-dependencies §2.2]

### Scenario Coverage

- [ ] CHK053 — Are requirements defined for running the complete lifecycle (DISPATCHED → POD_SUBMITTED) in mock mode without backend? [Coverage, Spec SC-008]
- [ ] CHK054 — Is mock exception state simulation documented (modifiable fixture files)? [Coverage, Spec QA Expectations]
- [ ] CHK055 — Is mock offline behavior testable: disable network → perform actions → re-enable → verify sync? [Coverage, Spec QA Expectations]

---

## 7. Editable Mock JSON Scenario Coverage

### Requirement Completeness

- [ ] CHK056 — Are fixture files documented for all significant sub-state combinations: DISPATCHED, ACCEPTED, LOADING (form required), LOADED + EWB_PENDING (blocked), IN_TRANSIT (GPS active), DELIVERED, POD_SUBMITTED (read-only)? [Completeness]
- [ ] CHK057 — Is a fixture defined for exception states (VEHICLE_BREAKDOWN, ACCIDENT, CARGO_DAMAGE)? [Gap]
- [ ] CHK058 — Is a fixture defined for the accept-timeout scenario (dispatch timestamp > 30 minutes ago)? [Gap]
- [ ] CHK059 — Is a fixture defined for trips with pre-existing expenses, documents, and milestone data (not empty)? [Coverage]
- [ ] CHK060 — Are the fixtures structured so QA can swap them without code changes (e.g., file replacement, config toggle)? [Clarity]

---

## 8. Loading / Empty / Error / Offline / Blocked States

### Requirement Completeness

- [ ] CHK061 — Are skeleton loading screens defined per-section (card shape, stepper shape, 2-row lists) or only generically? [Clarity, state-inventory §4, mobile-design-system §2.6]
- [ ] CHK062 — Are empty states defined for every section (Trip: "No active trip", Documents: "No documents yet", Expenses: "No expenses logged")? [Completeness, state-inventory §4]
- [ ] CHK063 — Is the ErrorScreen defined with error icon (48dp, color.error) + message + "Retry" button, distinct from EmptyStateScreen? [Completeness, design-review MJ-5]
- [ ] CHK064 — Is the OfflineBanner defined with position (sticky below top bar), color token (color.warning), icon, and label text? [Completeness, mobile-design-system §2.6]
- [ ] CHK065 — Are blocked state messages defined for all 6 blocked scenarios (EWB_PENDING, EWB_EXPIRED, Exception Active, Accept Timeout, POD_SUBMITTED read-only, Offline)? [Completeness, interaction-rules §4.2]
- [ ] CHK066 — Are per-section UX states documented independently (trip card can be loaded while documents section shows error)? [Completeness, state-inventory §4]
- [ ] CHK067 — Is the queued mutation badge ("2 pending") defined with position and styling? [Completeness, interaction-rules §6]

### Requirement Consistency

- [ ] CHK068 — Is the design-review finding CR-1 (spinner vs skeleton) addressed in requirements, and is the skeleton spec clear enough for engineering? [Consistency, design-review CR-1]
- [ ] CHK069 — Is the design-review finding CR-2 (CTA inline vs sticky) addressed in requirements? [Consistency, design-review CR-2]

---

## 9. Regression Risk for Later Features

### Dependencies & Assumptions

- [ ] CHK070 — Does the Active Trip feature make any assumptions about navigation structure that would conflict with "Past Trips" tab addition? [Assumption]
- [ ] CHK071 — Are Document/Expense upload patterns documented as reusable for future features (Inspections, Vehicle Photos)? [Completeness, Spec §4 Guarantees]
- [ ] CHK072 — Is the offline queue infrastructure documented as feature-agnostic (no trip-specific hardcoding that would break for Inspections)? [Completeness, Spec §4 Guarantees]
- [ ] CHK073 — Is the GPS tracking start/stop lifecycle documented clearly enough to avoid conflicts with future driver features that may also need location? [Completeness]
- [ ] CHK074 — Are the expense logging patterns documented as trip-scoped (not vehicle-scoped) and is the backend reconciliation gap noted? [Assumption, Spec Gap G5]
- [ ] CHK075 — Is the DataSourceConfig mechanism extensible for future data sources without modifying existing toggles? [Completeness]
- [ ] CHK076 — Is the TripStateMachine documented as the single source of truth for action permissions, preventing future features from duplicating transition logic? [Consistency]
- [ ] CHK077 — Are the read-only states (POD_SUBMITTED, POD_VERIFIED, SETTLED) clearly enough defined that "Past Trips" can reuse the same TripDetailScreen? [Completeness]
- [ ] CHK078 — Is the "Earnings" feature dependency on trip.totalExpenses / trip.freightAmount / trip.netProfit documented or noted as a gap? [Gap]

---

## 10. Acceptance Criteria Quality

- [ ] CHK079 — Are all 11 Success Criteria (SC-001 through SC-011) measurable with specific numeric thresholds? [Measurability, Spec SC-001–SC-011]
- [ ] CHK080 — Is SC-002 ("complete lifecycle in single uninterrupted session") testable without backend, using mock fixtures alone? [Measurability]
- [ ] CHK081 — Is SC-005 ("GPS every 5 min ± 30s") testable given that GPS tracking is mock-only? [Measurability]
- [ ] CHK082 — Is SC-009 ("appropriate empty/loading/error/data states for every screen section") exhaustively enumerated in state-inventory §4? [Coverage]
- [ ] CHK083 — Are acceptance scenarios for all 10 user stories specific enough to derive automated test cases? [Measurability]

---

## 11. Backend Gaps & Assumptions

- [ ] CHK084 — Are all 9 backend gaps (G1–G9) documented with impact assessment and mitigation strategy? [Completeness, Spec §Backend Gaps]
- [ ] CHK085 — Is the contactId mapping gap (G1/G8) documented as blocking real-backend active trip queries? [Completeness]
- [ ] CHK086 — Is the assumption "single driver has at most one active trip" validated against the backend Trip entity (no FK constraint exists)? [Assumption]
- [ ] CHK087 — Is the trip status type (plain String in backend, enum in mobile) documented as a deserialization risk? [Coverage, implementation-notes T001]
- [ ] CHK088 — Are the derived API contracts version-tolerant (what happens when backend adds fields the mobile doesn't expect)? [Coverage]

---

## Summary

| Category | Items |
|----------|-------|
| Active Trip Visibility | CHK001–CHK009 (9) |
| Lifecycle State Presentation | CHK010–CHK018 (9) |
| Allowed vs Blocked Driver Actions | CHK019–CHK026 (8) |
| Transition Handling | CHK027–CHK035 (9) |
| Document / Evidence / POD Flows | CHK036–CHK047 (12) |
| Mock-vs-Real Switching | CHK048–CHK055 (8) |
| Editable Mock JSON Scenarios | CHK056–CHK060 (5) |
| Loading/Empty/Error/Offline/Blocked | CHK061–CHK069 (9) |
| Regression Risk for Later Features | CHK070–CHK078 (9) |
| Acceptance Criteria Quality | CHK079–CHK083 (5) |
| Backend Gaps & Assumptions | CHK084–CHK088 (5) |
| **Total** | **88 items** |
