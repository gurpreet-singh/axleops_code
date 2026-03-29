# Design Review Checklist — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Date**: 2026-03-29

---

## Purpose

This checklist validates that the implementation of the Driver Active Trip feature conforms to the UX package, design system, and design philosophy. Each item is a binary pass/fail. All items must pass before the feature is considered UX-complete.

---

## 1. Design System Compliance

- [ ] All colors use design tokens from `mobile-design-system.md` §1.1 — no hardcoded hex values
- [ ] Trip phase badges use `color.phase.*` tokens correctly (created=gray, in_transit=blue, completed=emerald, settled=gray, exception=orange)
- [ ] Exception badges use `color.phase.exception` (orange) or `color.error` (red) per `state-inventory.md` §2
- [ ] Typography uses `type.*` tokens — no custom font sizes, weights, or families
- [ ] All spacing follows the 4dp grid (`space.*` tokens) — no arbitrary pixel values
- [ ] Cards use `radius.md` (8dp) and `elevation.low` (1dp)
- [ ] All touch targets are ≥ 48dp × 48dp
- [ ] Minimum text contrast ratio is 4.5:1 for all body text

## 2. Component Reuse

- [ ] Primary CTA uses the **Primary (filled)** button variant from §2.1
- [ ] Reject trip uses the **Destructive** button variant
- [ ] "Report Issue" uses the **Secondary (outlined)** button variant
- [ ] "Add Expense", "Add Document" use **Text (ghost)** button variant
- [ ] Active trip card matches **Active Trip Card** component from §2.2
- [ ] Milestone stepper uses **Horizontal Stepper** (summary) and **Vertical Stepper** (detail) from §2.5
- [ ] Stepper step states match the 5 defined states (Completed, Current, Future, Blocked, Skipped) with correct colors
- [ ] Phase badges use **Phase badge (standard)** from §2.4
- [ ] Confirmation dialogs use **Modal Dialog** from §2.8 (title + body + 2 actions, right-aligned)
- [ ] Category pickers (expense, document) use **Bottom Sheet** from §2.7
- [ ] Empty state uses **EmptyScreen** pattern from §2.6
- [ ] Error state uses **ErrorScreen** pattern from §2.6
- [ ] Loading state uses **LoadingScreen** (skeleton) pattern from §2.6
- [ ] Offline state uses **OfflineBanner** pattern from §2.6
- [ ] No new component variants invented that don't exist in the design system

## 3. Screen Layout

- [ ] ActiveTripScreen follows the information hierarchy: Status (top) → Content (scroll) → Action (bottom)
- [ ] Status + CTA visible simultaneously without scroll on 360dp-height phone
- [ ] TripDetailScreen uses **Detail Screen** template from §3.2
- [ ] Milestone action forms use **Action Screen** template from §3.3 with bottom-anchored CTA
- [ ] POD flow screens use **Action Screen** template with progress indicator (4 steps)
- [ ] Only one primary button visible per screen

## 4. Navigation Compliance

- [ ] Tab bar visible on all tab-level and first-level detail screens
- [ ] Tab bar hidden during POD capture flow, camera flow, and signature capture
- [ ] All non-landing screens have a visible back affordance
- [ ] POD flow exit with data triggers confirmation modal ("Discard POD?")
- [ ] POD flow completion returns to trip detail (parent screen), not tab landing
- [ ] Screen transitions use `motion.screen` (250ms ease-in-out) for push/pop
- [ ] Bottom sheets use `motion.sheet` (200ms ease-out)

## 5. Five States + Blocked

- [ ] Every section implements all 5 states: Loading, Empty, Error, Data Loaded, Offline
- [ ] Loading states use skeleton matching content shape — not centered spinners
- [ ] Empty states show illustration + contextual message + optional action
- [ ] Error states show error icon + message + "Retry" button
- [ ] Offline state shows persistent `color.warning` banner below top bar
- [ ] Blocked states use inline explanation (not toast, not modal) per `interaction-rules.md` §4
- [ ] Blocked messages include: what's blocked, why, who can resolve it
- [ ] No blank or frozen screens in any state transition

## 6. Action Enablement

- [ ] Primary CTA label changes correctly per sub-state (per `interaction-rules.md` §1.1 table)
- [ ] CTA is disabled (38% opacity) when business rule blocks it — never hidden misleadingly
- [ ] CTA is hidden entirely during exception states and read-only states
- [ ] Accept/Reject buttons only visible on DISPATCHED trips within timeout
- [ ] Accept button disabled (with message) after 30-minute timeout
- [ ] "Add Expense" / "Add Document" hidden after POD_SUBMITTED
- [ ] "Report Issue" only available during IN_TRANSIT or AT_DESTINATION, no active exception
- [ ] Out-of-sequence milestone transitions impossible (no UI path to trigger them)

## 7. Confirmation & Feedback

- [ ] Accept Trip requires confirmation modal
- [ ] Reject Trip requires confirmation modal with required reason field
- [ ] POD submission confirmation via PodReviewScreen (not a separate modal)
- [ ] Milestone transitions do NOT require confirmation (forward, non-destructive)
- [ ] Success feedback uses snackbar (3 sec, `color.success`)
- [ ] Error feedback uses snackbar (5 sec, `color.error`) with retry option
- [ ] Offline queuing feedback uses snackbar (3 sec, `color.info`)
- [ ] Upload progress shown inline on document/photo items (not a global spinner)
- [ ] Milestone transition shows button spinner during API call (not a modal loading)

## 8. Evidence & Upload Patterns

- [ ] Camera capture hides tab bar
- [ ] Camera capture shows review screen (preview + Retake / Use Photo)
- [ ] Multi-photo capture shows counter ("2 of 2 minimum")
- [ ] Signature pad has Clear and Next actions
- [ ] Empty signature blocks submit with inline error
- [ ] Document upload shows category selection via bottom sheet before capture
- [ ] Failed uploads show ❌ with retry per-item
- [ ] Offline uploads show ⏳ with "Pending" indicator
- [ ] Photos persist locally — survive backgrounding and app kill

## 9. Blocked State Messaging

- [ ] EWB_PENDING: inline message replaces CTA area (amber)
- [ ] EWB_EXPIRED: full-width red banner + CTA hidden
- [ ] Exception active: red banner at top + all CTAs hidden
- [ ] Accept timeout: disabled button + explanatory text below
- [ ] Read-only states: info banner + no action buttons
- [ ] All blocked messages include resolution hint ("Contact dispatch" / "Operations will resolve")

## 10. Offline & Sync

- [ ] Offline banner visible when disconnected
- [ ] Queued actions show ⏳ indicator
- [ ] Queued count visible ("2 pending")
- [ ] On reconnect: auto-retry queued items
- [ ] On sync conflict: refresh from server + modal notification to driver
- [ ] GPS logs stored locally when offline and batch-synced on reconnect
- [ ] No data silently dropped — every photo, location point, and expense persists locally

## 11. GPS Tracking

- [ ] Tracking active indicator visible in trip header during IN_TRANSIT
- [ ] Android: foreground service notification visible during tracking
- [ ] GPS permission requested at departure (not at app launch)
- [ ] GPS denial shows warning but does NOT block trip progression
- [ ] Tracking stops when trip exits IN_TRANSIT phase

## 12. Accessibility & Field Readability

- [ ] All text meets 4.5:1 contrast ratio
- [ ] No pastel-on-pastel or light gray on white
- [ ] Primary actions in thumb zone (bottom half of screen)
- [ ] Font sizes ≥ 12sp everywhere
- [ ] Interactive elements have content descriptions for screen readers

## 13. Pattern Anti-Patterns (Must NOT Exist)

- [ ] No new color tokens invented outside the design system
- [ ] No custom button styles beyond the 6 defined variants
- [ ] No use of toasts for blocked states (must be inline)
- [ ] No use of modals for blocked states (must be inline)
- [ ] No centered spinners for content loading (must use skeletons)
- [ ] No dead-end screens (every screen has an exit path)
- [ ] No driver-initiated exception resolution (only ops resolves)
- [ ] No out-of-sequence milestone triggering

---

## Sign-Off

| Reviewer | Date | Result |
|----------|------|--------|
| Design | | ☐ Pass / ☐ Fail |
| Engineering | | ☐ Pass / ☐ Fail |
| QA | | ☐ Pass / ☐ Fail |
