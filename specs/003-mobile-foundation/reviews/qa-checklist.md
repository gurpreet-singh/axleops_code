# QA Checklist — Mobile Foundation (spec-003)

> **Purpose**: Requirements quality validation for the Mobile Foundation  
> **Created**: 2026-03-28  
> **Grounded in**: spec.md, ux/, plan.md, tasks.md, design-review-round-1.md, implementation-notes.md  
> **Focus**: App startup, shell correctness, navigation baseline, state handling, upload baseline, mock-vs-real switching, regression risk

---

## 1. App Startup & Session

- [ ] CHK001 — Are startup flow requirements defined for all possible session states (valid, expired, absent, unreachable backend)? [Completeness, Spec §FR-010–FR-013]
- [ ] CHK002 — Is the 3-second startup performance target (FR-014) defined with device/network conditions that make it measurable? [Measurability, Spec §FR-014]
- [ ] CHK003 — Is the 30-minute background re-validation threshold (FR-014a) specified with clear behavior for each outcome (valid, 401, network failure)? [Completeness, Spec §FR-014a]
- [ ] CHK004 — Are requirements specified for preventing any flash of authenticated content before login screen appears? [Clarity, Spec §FR-011]
- [ ] CHK005 — Is the blocked-role case defined with specific visual treatment and messaging (not just "clear informative message")? [Clarity, Spec §US3:SC3]
- [ ] CHK006 — Are startup error states defined separately from screen-level error states (e.g., no shell to host the ErrorScreen on cold start)? [Coverage, Gap]
- [ ] CHK007 — Is the interaction between 401 interceptor (FR-017) and the session re-validation (FR-014a) defined to avoid infinite redirect loops? [Consistency, Spec §FR-017 vs FR-014a]

---

## 2. Shell Correctness

- [ ] CHK008 — Are three-zone shell requirements (top bar, content, bottom tabs) specified with safe area inset behavior for both Android and iOS? [Completeness, Spec §FR-001–FR-003]
- [ ] CHK009 — Is the top bar title source explicitly defined as "active screen destination label from NavHost" rather than a vague "current screen"? [Clarity, Spec §FR-001a]
- [ ] CHK010 — Is the top bar background color (primary vs. surface) explicitly specified? [Ambiguity, Design Review Issue #10]
- [ ] CHK011 — Are connection status indicator requirements (FR-004) defined with specific placement (top bar vs. below top bar) and do they align with UX interaction rules §1.1? [Consistency, Spec §FR-004 vs interaction-rules.md §1.1]
- [ ] CHK012 — Are tab bar elevation requirements (interaction-rules §1.2 says `elevation.medium` = 4dp) explicitly specified and consistent with implementation? [Consistency, interaction-rules.md §1.2]
- [ ] CHK013 — Is `isDebugBuild` derivation from build configuration specified (not hardcoded)? [Coverage, Spec §FR-044, Design Review Issue #11]

---

## 3. Navigation Baseline

- [ ] CHK014 — Are per-tab independent navigation stack requirements specified with clear state preservation behavior on tab switch? [Completeness, Spec §FR-006]
- [ ] CHK015 — Is re-tap-active-tab-resets-to-root behavior explicitly required? [Completeness, Spec §FR-006, interaction-rules.md §1.2]
- [ ] CHK016 — Are back navigation requirements defined for both Android (system back) and iOS (swipe gesture) with consistent behavior? [Coverage, Spec §FR-008]
- [ ] CHK017 — Is the tab count range (3–5) validated at runtime? Are requirements defined for what happens if a RoleConfig provides 1, 2, or 6 tabs? [Edge Case, navigation-grammar.md §3.1]
- [ ] CHK018 — Are tab state preservation requirements defined to clarify: does preserving stack state also preserve scroll position and form input? [Clarity, interaction-rules.md §2.4]
- [ ] CHK019 — Are deep linking architecture requirements specified to not preclude future implementation (FR-009), even though not wired in v1? [Coverage, Spec §FR-009]
- [ ] CHK020 — Are tab switching animation requirements (interaction-rules §2.4 says "instant, 0ms") consistent with any Decompose default transition behavior? [Consistency, interaction-rules.md §2.4]

---

## 4. Loading / Empty / Error / Blocked / Offline Behavior

- [ ] CHK021 — Are all 6 canonical UX states (Loading, Empty, Error, DataLoaded, Offline, Blocked) defined with specific visual specifications? [Completeness, Spec §FR-051, state-inventory.md §1]
- [ ] CHK022 — Is the crossfade transition duration (150ms) consistent between state-inventory.md §2 and the design system animation tokens (motion.fade = 150ms)? [Consistency, state-inventory.md §2 vs mobile-design-system.md §1.6]
- [ ] CHK023 — Is the skeleton shimmer specification (0.15–0.35 alpha, 800ms cycle) defined precisely enough to verify? [Measurability, state-inventory.md §1.1]
- [ ] CHK024 — Are empty-state messages defined as role-contextual with specific examples for each foundation screen? [Completeness, state-inventory.md §1.2]
- [ ] CHK025 — Is the retry escalation threshold (3 retries → "If this continues, contact support") specified with requirements for how retry count is tracked and propagated? [Completeness, state-inventory.md §1.3, Design Review Issue #3]
- [ ] CHK026 — Are `retryCount` tracking requirements defined at the ViewModel or UiState level? Currently `UiState.Error` has no `retryCount` field. [Gap, Design Review Issue #5]
- [ ] CHK027 — Are Offline→Recovery requirements defined (banner dismissal, silent re-fetch, failure handling after reconnection)? [Coverage, state-inventory.md §1.5]
- [ ] CHK028 — Is the Blocked state placement specified as "inline, not full-screen" consistently in spec, UX, and implementation? [Consistency, Spec §FR-054 vs state-inventory.md §1.6]
- [ ] CHK029 — Are feature obligations (each screen MUST declare which states it handles) specified with a mechanism for documenting omissions? [Coverage, state-inventory.md §3]
- [ ] CHK030 — Is `ConnectivityObserver.isOnline` wiring into `UiStateHandler` specified with clear behavior for automatic state transitions (Loading/Error → Offline)? [Gap, Design Review Issue #12]

---

## 5. Upload Baseline

- [ ] CHK031 — Are upload state machine transitions (Idle → Capturing → Previewing → Uploading → Success/Failed) specified with all possible paths including cancel and retry? [Completeness, Spec §FR-056]
- [ ] CHK032 — Is the 10MB file size limit specified as configurable, and are the constraints documented for QA to verify? [Clarity, Spec §FR-058]
- [ ] CHK033 — Is the mock upload behavior (1500ms delay, mock URL returned) specified with enough detail to distinguish from real upload behavior? [Clarity, Spec §FR-057]
- [ ] CHK034 — Are camera/gallery platform integration requirements specified as expect/actual with defined stub behavior (returning null) until platform implementation? [Coverage, Spec §FR-060, implementation-notes.md §T016–T020]
- [ ] CHK035 — Are upload retry requirements defined with max retry count, backoff strategy, and user messaging? [Gap, Spec §FR-056]
- [ ] CHK036 — Are upload progress tracking limitations documented (Ktor multipart does not provide byte-level progress in KMP)? [Assumption, implementation-notes.md]
- [ ] CHK037 — Is the upload preview composable specification (thumbnail size, accept/retake/cancel buttons) defined with enough detail for visual verification? [Clarity, Spec §FR-059]

---

## 6. Mock-vs-Real Switching

- [ ] CHK038 — Are per-feature data source switching requirements specified for each implemented feature area (auth, upload, vehicle, contact)? [Completeness, Spec §FR-033]
- [ ] CHK039 — Is the reactive runtime toggle behavior (factory DI bindings, no app restart) specified and distinguished from build-time configuration? [Clarity, Spec §FR-034]
- [ ] CHK040 — Is the requirement that switching requires zero UI/ViewModel code changes explicitly stated and measurable (verify by reviewing the diff)? [Measurability, Spec §SC-007]
- [ ] CHK041 — Is the mock-vs-real indicator badge (🟢 Real / 🟠 Mock) specified with placement, tap behavior, and build-variant gating? [Completeness, state-inventory.md §4, Design Review Issue #2]
- [ ] CHK042 — Are SettingsScreen debug toggle requirements defined with per-feature granularity and does the spec address the reactive config flow (vs. hardcoded default)? [Gap, Design Review Issue #1]
- [ ] CHK043 — Is the production build exclusion of mock sources and debug toggles specified with a verification method (e.g., inspect APK for fixture files)? [Measurability, Spec §FR-044]

---

## 7. Local Mock Editability

- [ ] CHK044 — Is the requirement "QA edits a fixture JSON and sees changes on next launch" specified with the mechanism (composeResources bundle)? [Clarity, Spec §FR-039, SC-003]
- [ ] CHK045 — Is the mock latency simulation requirement (FR-040 "configurable delay") specified with how to configure it (code constant vs. runtime slider)? [Clarity, Spec §FR-040]
- [ ] CHK046 — Are requirements defined for what happens when a mock JSON fixture is malformed? [Edge Case, Spec §Edge Cases]
- [ ] CHK047 — Does the spec define the complete set of mock fixtures that must exist (auth-login, auth-me, file-upload-success, trip-list, earnings, etc.)? [Coverage, Spec §FR-041]

---

## 8. Analytics & Logging

- [ ] CHK048 — Are automatic screen-view tracking requirements specified with integration point (navigation observer vs. manual calls)? [Gap, Spec §FR-061, Design Review Issue #4]
- [ ] CHK049 — Is the structured diagnostic logger (FR-063) specified as a separate concern from the analytics event tracker (FR-061)? [Clarity, Spec §FR-063 vs FR-061]
- [ ] CHK050 — Are diagnostic log level requirements (verbose/dev, minimal/staging, errors-only/prod) specified with how the build variant drives the filter? [Completeness, Spec §FR-064]

---

## 9. Design System & Tokens

- [ ] CHK051 — Are all color tokens from the design system spec (brand, semantic, surface, trip phase) present in the implementation with exact hex values? [Completeness, mobile-design-system.md §1.1]
- [ ] CHK052 — Is the typography scale (6 levels) specified with both sp sizes and weight, and is the "system font" requirement defined for cross-platform consistency? [Clarity, mobile-design-system.md §1.2]
- [ ] CHK053 — Are spacing tokens (2dp–32dp, plus 16dp screen margin) defined consistently between design-system docs and implementation? [Consistency, mobile-design-system.md §1.3]
- [ ] CHK054 — Are touch target minimums (48dp × 48dp, no exceptions) specified for all interactive elements including tab bar items and back arrow? [Coverage, interaction-rules.md §6]
- [ ] CHK055 — Is the OfflineBanner text color specified explicitly (currently uses `onPrimary` on warning background, semantically incorrect)? [Ambiguity, Design Review Issue #6]

---

## 10. Regression Risk for Future Features

- [ ] CHK056 — Are requirements defined such that adding a new screen to a tab requires only: adding a `ScreenConfig` variant, a `ScreenChild` variant, and a factory branch? [Clarity, Spec §SC-001]
- [ ] CHK057 — Are feature-level skeleton customization requirements defined (feature screens SHOULD provide custom skeletons; default fallback is `SkeletonList(4)`)? [Completeness, state-inventory.md §1.1]
- [ ] CHK058 — Is the `ScreenChild` sealed interface extension mechanism documented to prevent future epics from creating parallel navigation frameworks? [Coverage, implementation-notes.md §T006–T015]
- [ ] CHK059 — Are requirements defined for how the Driver Auth & Session epic will provide the login UI without modifying foundation auth plumbing (FR-019)? [Dependency, Spec §FR-019]
- [ ] CHK060 — Is the relationship between foundation-owned screens (splash, role selector, settings) and feature-owned screens (trip detail, earnings) clearly delineated in scope? [Clarity, state-inventory.md §3]
- [ ] CHK061 — Are requirements defined for multi-role users switching roles after login without requiring app restart? [Edge Case, Gap]

---

## 11. Backend Gaps & Assumptions

- [ ] CHK062 — Are all 5 backend gaps documented in the spec (upload endpoint, User↔Contact FK, driver-scoped queries, error format, env URLs) with clear mitigation strategies? [Completeness, Spec §Backend Gaps]
- [ ] CHK063 — Is the assumption that "JWT token-based auth is the auth mechanism" validated against the existing backend implementation? [Assumption, Spec §Assumptions]
- [ ] CHK064 — Are blocked tasks (T-BLOCKED-01/02/03) explicitly tracked with triggering conditions for unblocking? [Coverage, tasks.md §Blocked]

---

## Summary

| Section | Items | Priority |
|---------|-------|----------|
| App Startup & Session | CHK001–CHK007 | High |
| Shell Correctness | CHK008–CHK013 | High |
| Navigation Baseline | CHK014–CHK020 | High |
| State Handling | CHK021–CHK030 | High |
| Upload Baseline | CHK031–CHK037 | Medium |
| Mock-vs-Real Switching | CHK038–CHK043 | High |
| Mock Editability | CHK044–CHK047 | Medium |
| Analytics & Logging | CHK048–CHK050 | Low |
| Design System | CHK051–CHK055 | Medium |
| Regression Risk | CHK056–CHK061 | High |
| Backend Gaps | CHK062–CHK064 | Low |

**Total items**: 64  
**Critical focus**: Items that cross-reference Design Review Round 1 issues (CHK010, CHK013, CHK025, CHK026, CHK030, CHK041, CHK042, CHK048, CHK055)
