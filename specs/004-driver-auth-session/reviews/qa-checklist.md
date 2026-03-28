# QA Checklist: Driver Auth & Session

**Purpose**: Requirements quality validation — verifying that spec, UX, and plan documents are complete, clear, consistent, and testable for all auth/session flows.  
**Created**: 2026-03-28  
**Source**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/spec.md) · [ux/](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/) · [plan.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/plan.md) · [design-review-round-1.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/reviews/design-review-round-1.md)

---

## Login Flow

- [ ] CHK001 — Are the exact error messages for all login failure modes defined with verbatim copy? [Completeness, Spec §FR-004, UX state-inventory §3]
- [ ] CHK002 — Is the behavior for empty-field submission explicitly prohibited (button disabled)? [Clarity, Spec §FR-005, UX interaction-rules §1.2]
- [ ] CHK003 — Is the timing budget for login-to-landing quantified with per-phase allocations (login ≤ 1.5s, getMe ≤ 0.5s, selectRole ≤ 0.5s, shell render ≤ 0.5s)? [Measurability, UX user-flow §Flow 1]
- [ ] CHK004 — Are keyboard interaction requirements specified (focus order email→password, "Next" advancing focus, "Done" submitting login)? [Completeness, UX interaction-rules §1.4]
- [ ] CHK005 — Is the error-clear-on-keystroke requirement explicitly defined, and is the responsible layer (UI or ViewModel) identified? [Clarity, UX interaction-rules §1.3]
- [ ] CHK006 — Is the "no client-side email validation" rule documented with rationale? [Clarity, UX interaction-rules §1.1]
- [ ] CHK007 — Are field persistence requirements across configuration changes (`rememberSaveable`) specified? [Completeness, UX interaction-rules §1.1]

---

## Driver Eligibility & Role Resolution

- [ ] CHK008 — Is the definition of "eligible driver" explicit (holds `DRIVER` role + registered in `RoleRegistry`)? [Clarity, Spec §FR-030]
- [ ] CHK009 — Is the "ALL" meta-role exclusion from mobile role resolution explicitly stated? [Completeness, Spec §FR-011]
- [ ] CHK010 — Are the exact three role resolution branches (0, 1, 2+ supported roles) defined with distinct outcomes? [Coverage, Spec §FR-010–014]
- [ ] CHK011 — Is the auto-select behavior for single-supported-role users documented (no role selector shown)? [Clarity, Spec §FR-012]
- [ ] CHK012 — Is the unsupported-role screen exit path defined (no logout button, system back/kill only)? [Completeness, UX screen-map §5]
- [ ] CHK013 — Are role selector back-navigation rules documented (system back disabled, swipe back disabled, with rationale)? [Completeness, UX interaction-rules §2.2]
- [ ] CHK014 — Are the exact role display strings and descriptions sourced from `RoleRegistry.getConfig` (not hardcoded)? [Consistency, UX data-dependencies §2.3]
- [ ] CHK015 — Is the behavior for `getMe` failure during role resolution defined (return to Unauthenticated with error)? [Coverage, Spec edge cases]

---

## Current-User Bootstrap

- [ ] CHK016 — Are all 8 fields of `UserSession` documented (userId, displayName, activeRole, jwt, authorities, contactId, branchId, tenantId)? [Completeness, Spec §FR-020, UX data-dependencies §3]
- [ ] CHK017 — Is the `contactId` nullability explicitly stated with impact on downstream features? [Clarity, Spec §FR-022, Gap G1]
- [ ] CHK018 — Is the session construction source specified for each field (which API response, which key)? [Clarity, UX data-dependencies §3]
- [ ] CHK019 — Is `UserSession` availability guaranteed for all authenticated screens? [Completeness, Spec §FR-021]
- [ ] CHK020 — Is the authorities list specified with exact authority strings for the DRIVER role? [Completeness, Spec §FR-031]

---

## Session Persistence

- [ ] CHK021 — Is the persistence technology specified (multiplatform-settings / `Settings`)? [Completeness, Spec §FR-050, Plan §2]
- [ ] CHK022 — Are the exact 8 key names for stored session fields documented? [Clarity, Plan §2]
- [ ] CHK023 — Is the corruption guard behavior specified (partial keys → return null → treat as new session)? [Coverage, Plan §2]
- [ ] CHK024 — Is the "no encrypted storage for v1" decision documented with rationale (24h TTL, server-side validation)? [Clarity, Spec §FR-050, Clarification Q3]
- [ ] CHK025 — Is the persistence write timing specified (after successful `selectRole`, not after login)? [Clarity, Plan §2]
- [ ] CHK026 — Are all persistence clear triggers documented (explicit logout, 401 force-logout, session restore 401)? [Coverage, Plan §2]
- [ ] CHK027 — Does the data-dependencies doc (§4) conflict with the plan/spec on what is persisted? The UX data-dependencies §4 says "Session metadata: In-memory only" and "Last active role: Not persisted in v1" — but the actual implementation persists the full session including role. [Conflict, UX data-dependencies §4 vs Spec §FR-050]

---

## Session Restore (Cold Start)

- [ ] CHK028 — Are all three session-restore outcomes defined (200 → Authenticated, 401 → clean Unauthenticated, network error → optimistic Authenticated)? [Coverage, Spec §FR-051–052]
- [ ] CHK029 — Is the "no role re-resolution on restore" rule explicitly stated with rationale? [Clarity, Spec §FR-051, Clarification Q2]
- [ ] CHK030 — Is the "no error message on session restore 401" rule explicit (distinguishes from login-error 401)? [Clarity, UX user-flow §Flow 2]
- [ ] CHK031 — Is the splash screen timing constraint (≤ 2 seconds) specified? [Measurability, UX screen-map §3]
- [ ] CHK032 — Is the "no login screen flash" rule documented (splash shown instead of login during validation)? [Clarity, UX user-flow §Flow 2]
- [ ] CHK033 — Is the optimistic resume on network error justified and its risk documented (stale token until 401 on next real API call)? [Clarity, Clarification Q1]
- [ ] CHK034 — Is `AuthState.Restoring` defined in the state inventory with entry/exit transitions? [Completeness, UX state-inventory §2, State S6]

---

## Session Expiry & 401 Handling

- [ ] CHK035 — Is the 401 global interception scope defined ("every HTTP response")? [Completeness, Spec §FR-070, UX interaction-rules §4.1]
- [ ] CHK036 — Is the cascade prevention rule documented (only first 401 in a burst triggers logout)? [Coverage, UX interaction-rules §4.1]
- [ ] CHK037 — Is the exact session-expiry message text specified ("Your session has expired. Please sign in again.")? [Clarity, UX state-inventory §3, State S2a]
- [ ] CHK038 — Is the `MessageType.INFO` vs `MessageType.ERROR` distinction specified for session expiry vs credential errors? [Clarity, Spec §FR-081]
- [ ] CHK039 — Is the "no unsaved data prompt on 401" rule explicitly accepted as v1 behavior? [Coverage, Spec US4 Scenario 2]
- [ ] CHK040 — Is the "no retry of 401 responses" rule stated? [Clarity, UX interaction-rules §4.1]

---

## Logout

- [ ] CHK041 — Is the confirmation dialog copy verbatim (Title: "Sign Out", Body: "Are you sure you want to sign out?")? [Completeness, UX interaction-rules §3.2]
- [ ] CHK042 — Is the button placement specified (Cancel left, Sign Out right)? [Completeness, UX interaction-rules §3.2]
- [ ] CHK043 — Is the backdrop-tap behavior specified (dismiss = Cancel)? [Completeness, UX interaction-rules §3.2]
- [ ] CHK044 — Is the fire-and-forget API call rule documented ("no loading state for logout")? [Clarity, UX user-flow §Flow 5]
- [ ] CHK045 — Is the post-logout login screen state specified as "clean — no error, no expiry message"? [Clarity, UX interaction-rules §3.3]
- [ ] CHK046 — Is the network-failure-during-logout behavior specified (local session still cleared)? [Coverage, Spec §FR-063]

---

## Background Re-Validation

- [ ] CHK047 — Is the 30-minute threshold quantified and its configurability stated? [Measurability, Spec §FR-072–073]
- [ ] CHK048 — Are all three re-validation outcomes defined (200 → no action, 401 → logout with message, network error → no action)? [Coverage, UX interaction-rules §4.2]
- [ ] CHK049 — Is the "invisible unless > 1 second" rule for re-validation UI defined? [Clarity, UX interaction-rules §4.2]
- [ ] CHK050 — Is the re-validation scope clear (fires only after ≥ 30 min background, not on every foreground)? [Clarity, Spec US5 Scenario 3]

---

## Loading / Error / Retry States

- [ ] CHK051 — Are loading indicators specified for all async operations (login, getMe, selectRole, session restore)? [Completeness, Spec §FR-080, §FR-083]
- [ ] CHK052 — Are all error messages listed in a single authoritative mapping (error type → message text → color)? [Completeness, UX state-inventory §3, UX data-dependencies §5]
- [ ] CHK053 — Is the retry mechanism defined for all error states (re-submit credentials, no page refresh needed)? [Clarity, Spec §FR-082]
- [ ] CHK054 — Is "max 2 lines with ellipsis" specified for the error message area? [Clarity, UX interaction-rules §1.3]
- [ ] CHK055 — Is the position of the error message area specified (inline between password field and button)? [Completeness, UX interaction-rules §1.3]
- [ ] CHK056 — Are role selector loading states defined (spinner replaces arrow on tapped card, other cards muted to 50%)? [Completeness, UX interaction-rules §2.1]

---

## Mock-vs-Real Switching

- [ ] CHK057 — Is the mock/real toggle mechanism identified (`DataSourceConfig.authSource`)? [Completeness, Spec §Mock-vs-Real]
- [ ] CHK058 — Are mock role strings consistent with `AppRole.backendValue` (e.g., "DRIVER" not "ROLE_DRIVER")? [Consistency, implementation-notes.md known issue]
- [ ] CHK059 — Is the mock `contactId` behavior documented (mock returns canned value, real returns null)? [Clarity, UX data-dependencies §6]
- [ ] CHK060 — Are debug overlay indicators specified for mock vs real mode in QA builds? [Completeness, UX state-inventory §6]
- [ ] CHK061 — Is `SessionPersistence` explicitly stated as data-source-agnostic (works identically with mock and real)? [Consistency, Plan §7]

---

## Transition Animations & UX Polish

- [ ] CHK062 — Are state transition animations specified (150ms `motion.fade` for all auth state changes)? [Completeness, UX state-inventory §4]
- [ ] CHK063 — Is the `color.info` semantic token defined in the design system, or is the mapping to `color.tertiary` documented? [Clarity, design-review-round-1 DR-001]
- [ ] CHK064 — Are accessibility requirements specified for auth screens (LiveRegion for errors, screen reader announcements)? [Coverage, UX interaction-rules §6]

---

## Design Review Open Issues

- [ ] CHK065 — Is the error-clear-on-keystroke interaction resolved at the requirements level (which layer clears, how)? [Ambiguity, design-review DR-002]
- [ ] CHK066 — Is the `AnimatedContent` transition requirement traceable to a spec FR or only to the UX package? [Traceability, design-review DR-003]
- [ ] CHK067 — Are keyboard `ImeAction.Next` / `ImeAction.Done` requirements traceable to the spec or only to UX interaction rules? [Traceability, design-review DR-004]

---

## Dependencies & Assumptions

- [ ] CHK068 — Are all 4 backend gaps (G1–G4) documented with mobile mitigation strategies? [Completeness, Spec §Backend Gaps]
- [ ] CHK069 — Is the 24-hour JWT TTL explicitly stated as a known limitation with impact documented? [Clarity, Spec Gap G3]
- [ ] CHK070 — Is the indistinguishable 401 for bad creds vs deactivated account documented (Gap G2)? [Clarity, Spec Gap G2]
- [ ] CHK071 — Does the spec explicitly state that all 4 auth endpoints are real (no derived contracts needed)? [Completeness, Spec §Mock-vs-Real]
- [ ] CHK072 — Is the Mobile Foundation dependency stated (design system, navigation, Ktor, Koin, data source config)? [Completeness, Spec §Assumptions]

---

## Regression Risk: Driver Active Trip

- [ ] CHK073 — Is it stated that `UserSession` remains the sole contract for downstream features (Active Trip reads from `session`)? [Consistency, Spec §Guarantees]
- [ ] CHK074 — Is the `contactId == null` handling requirement propagated to Active Trip and downstream feature specs? [Coverage, Gap G1]
- [ ] CHK075 — Is it documented that global 401 handling means feature screens do NOT need individual session-expiry handling? [Clarity, Spec §Guarantees, item 3]
- [ ] CHK076 — Is the landing tab identity (`active-trip`) driven by `RoleConfig` and not hardcoded in navigation? [Consistency, Spec §FR-041]
- [ ] CHK077 — Does the spec guarantee that bearer token injection is automatic (feature screens do not manually attach tokens)? [Completeness, Spec §Guarantees, item 4]

---

## Scenario Coverage Gaps

- [ ] CHK078 — Are requirements defined for the case where a driver has roles assigned but ALL are the "ALL" meta-role? [Edge Case, Gap]
- [ ] CHK079 — Is the behavior specified when `SessionPersistence.restore()` returns a session with a role no longer registered in `RoleRegistry`? [Edge Case, Gap]
- [ ] CHK080 — Are requirements specified for concurrent login from multiple devices (same credentials)? [Coverage, Spec §What This Feature Does NOT Guarantee, item 3]
- [ ] CHK081 — Is the behavior defined when the app is killed during the `Restoring` state (mid-getMe call)? [Edge Case, UX state-inventory §5]
- [ ] CHK082 — Are requirements defined for what happens when `selectRole` succeeds but `SessionPersistence.save()` fails (storage full)? [Edge Case, Gap]

---

**Total items**: 82  
**Focus areas**: Login flow, role resolution, session lifecycle, error handling, mock/real consistency, regression safety  
**Depth**: Standard  
**Actor**: QA / Reviewer
