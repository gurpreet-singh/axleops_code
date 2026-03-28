# Feature Specification: Design Foundation

**Feature Branch**: `002-design-foundation`  
**Created**: 2026-03-28  
**Status**: Draft  
**Target Role(s)**: All roles (design governance) · Driver (v1 reference implementation)  
**Input**: User description: "Define the app-wide UX/design foundation for the AxleOps mobile app — design philosophy, role-based shell, navigation grammar, information density, common patterns, state handling, trip visual language, shared vs role-specific boundaries, and deliverable design artifacts."

---

## User Scenarios & Testing

### User Story 1 — Implementor Follows a Consistent Design Language (Priority: P1)

A developer building any mobile feature opens the design foundation documentation and finds clear rules for layout, spacing, color, typography, navigation, and state handling. They produce screens that look and feel cohesive with every other screen in the app without inventing ad-hoc styling.

**Why this priority**: Without a governing design language, each feature will diverge visually and structurally. This is the prerequisite for all feature-level work.

**Independent Test**: Two developers independently build different Driver screens (e.g., Active Trip and Past Trips). Both screens pass a visual consistency review against the design foundation spec — matching typography scale, color usage, spacing grid, and component patterns — without having coordinated on aesthetics directly.

**Acceptance Scenarios**:

1. **Given** a developer implementing a new screen, **When** they reference the design foundation, **Then** they can determine the correct spacing, typography, color, and component usage without guessing or inspecting other screens.
2. **Given** the design system is defined, **When** all Driver v1 screens are assembled, **Then** a visual review confirms consistent application of the design tokens (no rogue colors, font sizes, or spacing values).
3. **Given** the design foundation exists, **When** a reviewer audits any screen, **Then** they can verify compliance against specific, named rules (not subjective opinion).

---

### User Story 2 — Role Shell Adapts to the Active Role (Priority: P1)

A user logs in and sees a navigation shell (bottom tabs, header, content area) that is tailored to their role. A Driver sees Active Trip / Past Trips / Earnings / Settings. A future Dispatch Manager would see Fleet Map / Trips / Alerts / Settings. The shell structure is the same; the content and tabs adapt per role.

**Why this priority**: The shell is the container for all features. If the shell UX pattern is not defined, every role implementation will invent its own container, creating inconsistency and rework.

**Independent Test**: Switch the role configuration between Driver and a stub "Dispatch Manager" role. The shell renders different tabs but uses the same header, same navigation patterns, same transition animations, and same tab bar component.

**Acceptance Scenarios**:

1. **Given** a Driver is logged in, **When** the shell renders, **Then** the bottom tab bar shows exactly the Driver's defined tabs in the defined order with the correct icons and labels.
2. **Given** a future role is registered with different tabs, **When** that role's shell renders, **Then** the same tab bar component renders the new role's tabs — no code duplication.
3. **Given** the design foundation defines header and tab bar specifications, **When** any role's shell is implemented, **Then** the header height, tab bar height, icon sizes, and label typography match the foundation spec exactly.

---

### User Story 3 — Every Screen Handles All Lifecycle States (Priority: P1)

Every screen in the app handles loading, empty, error, data-loaded, and offline states with consistent visual patterns. A user never encounters a blank screen, an uncaught crash, or a confusing error — regardless of network conditions or backend state.

**Why this priority**: Constitution Principle VII (Production-Grade Field UX) mandates this. Drivers operate in low-connectivity environments. Undefined state handling leads to blank screens, user confusion, and data loss.

**Independent Test**: Force-disconnect the device from network while on any screen. The screen shows a defined offline state. Reconnect — the screen recovers. Toggle mock data to return empty arrays — the screen shows a defined empty state with a suggested action.

**Acceptance Scenarios**:

1. **Given** any screen is loading data, **When** the request is in progress, **Then** a skeleton or loading indicator (not a blank screen) is shown, matching the foundation's loading pattern.
2. **Given** a screen has no data to display, **When** it renders, **Then** it shows an empty state with an illustrative element and a suggested action, matching the foundation's empty-state pattern.
3. **Given** an API request fails, **When** the error state renders, **Then** the screen shows a user-friendly message with a retry affordance, matching the foundation's error pattern.
4. **Given** the device is offline, **When** the user interacts with the app, **Then** the app indicates connectivity loss and gracefully degrades — no crashes, no silent failures.

---

### User Story 4 — Trip Status is Visually Unambiguous at a Glance (Priority: P2)

A driver looking at their trip list or active trip can instantly identify the trip's current phase (Created, In Transit, Completed, Settled) and any exception state through color, icon, and badge — without reading detailed text.

**Why this priority**: Drivers are often in the field, possibly driving. Trip status must be scannable in under 2 seconds. Visual language for trip states is a foundational UX element used across multiple screens.

**Independent Test**: Show 5 trip cards with different statuses (Scheduled, In Transit, In Transit + Exception, Completed, Settled) to a non-technical user. They correctly identify each status within 3 seconds per card.

**Acceptance Scenarios**:

1. **Given** a trip is in a specific lifecycle phase, **When** it appears in any list or detail view, **Then** it displays the phase-specific color, icon, and label defined in the design foundation.
2. **Given** a trip has an active exception, **When** it appears in any view, **Then** a visually distinct exception indicator (badge or overlay) is visible alongside the phase indicator.
3. **Given** the trip visual language is defined, **When** a developer adds trip status rendering to a new screen, **Then** they reuse the defined status component — no ad-hoc color or icon choices.

---

### User Story 5 — Designer or Developer Adds a New Role Without Redesigning (Priority: P2)

When a second role (e.g., Dispatch Manager) is added to the mobile app, the implementor follows the design foundation to configure the role's shell, select appropriate list/detail/action patterns, and apply the same spacing, color, and typography rules. No design rethinking is required.

**Why this priority**: Validates that the design foundation is genuinely role-agnostic and extensible — not accidentally Driver-specific.

**Independent Test**: A developer creates a stub Dispatch Manager screen using only the design foundation rules. The screen visually integrates with the existing app without any design foundation changes.

**Acceptance Scenarios**:

1. **Given** a new role is being designed, **When** the implementor follows the design foundation, **Then** they can configure navigation, select patterns, and style screens without modifying any foundation-level design artifacts.
2. **Given** the design foundation defines shared vs role-specific boundaries, **When** a new role is added, **Then** it is clear which components are reused (shell, state patterns, typography, spacing) and which are role-specific (tab content, screen layouts, data queries).

---

### Edge Cases

- What happens when a screen's content requires more information density than the foundation allows? → The screen documents a justified exception with the spec author's rationale. The foundation provides "dense mode" guidance for data-heavy views.
- What happens when a trip has multiple simultaneous exceptions? → The visual language defines a priority-based exception badge (highest severity shown, with a count indicator for additional exceptions).
- What happens when a role has only 2 tabs instead of 4? → The tab bar adapts gracefully — it remains at its defined height but distributes tabs evenly.
- What happens on very small screens (< 360dp width)? → The design system defines minimum touch target sizes and responsive breakpoints. Text truncation and ellipsis rules apply.
- What happens when the app is used in accessibility mode (large text, screen reader)? → The design foundation defines minimum contrast ratios and touch targets that satisfy accessibility guidelines. Custom styling does not override system accessibility settings.

---

## Clarifications

### Session 2026-03-28

- Q: How stale is acceptable for offline data? Should stale data clear after a timeout, stay visible indefinitely with a timestamp, or visually dim after a threshold? → A: Option B — stale data stays visible indefinitely with a "Last updated X min ago" timestamp displayed. No timeout-based clearing.
- Q: Tab switch behavior conflicts: FR-012 says "reset stack to root" but mobile-navigation-grammar.md rule 3.1 says "preserve each tab's navigation stack." Which is correct? → A: Option A — preserve per-tab navigation stack. Switching away and back resumes where the user left off. Re-tapping the already-active tab resets to that tab's root.
- Q: FR-035 lists "role-specific color accents (within the palette)" as role-configurable, but FR-036 forbids overriding shared color tokens. Can a role use a different primary accent color? → A: Option A — single primary color (emerald) for all roles. No per-role color accents. Visual role differentiation is through content and icons, not color.

---

## Requirements

### Functional Requirements

#### 1. Mobile Design Philosophy

- **FR-001**: The design system MUST define a visual identity for the AxleOps mobile app: primary and secondary color palettes, semantic colors (success, warning, error, info), surface and background colors — all derived from or harmonized with the existing web product's color scheme (Emerald `#059669` for Operations, etc.).
- **FR-002**: The design system MUST define a typographic scale with named styles (headline, title, body, label, caption) including font family, size, weight, line height, and letter spacing — optimized for mobile readability on screens from 360dp to 428dp width.
- **FR-003**: The design system MUST define a spatial scale (4dp base unit) for all margins, padding, and component spacing — ensuring consistent rhythm across all screens.
- **FR-004**: The design system MUST define an icon style (outlined, filled, or mixed), standard icon sizes (24dp touch, 20dp inline, 16dp decorative), and provide a curated icon set for common actions (navigate, accept, reject, upload, camera, retry, etc.).
- **FR-005**: The design system MUST prioritize field usability: minimum 48dp touch targets, high contrast for outdoor readability, and accommodations for one-handed operation on screens up to 6.7".

#### 2. Role-Based Shell Philosophy

- **FR-006**: The app shell MUST consist of three structural zones: a header bar (top), a content area (center), and a bottom tab bar. The header height, tab bar height, and safe area handling MUST be specified as fixed design tokens.
- **FR-007**: The tab bar MUST be driven by the active role's configuration. The design foundation MUST specify: maximum and minimum tab count (2–5), icon and label treatment for tabs, active/inactive visual states, and badge support for notification counts.
- **FR-008**: The header bar MUST contain: a screen title (left-aligned or centered — specified), optional contextual actions (right), and a connection status indicator when offline. The header MUST NOT contain role-switching controls (role is fixed per session per spec-001).
- **FR-009**: The shell layout MUST provide safe area insets on all edges (notch, home indicator, rounded corners) and MUST specify how content scrolls (under the header or clipped to the content zone).

#### 3. Navigation Grammar

- **FR-010**: The app MUST use a consistent navigation model: bottom tabs for top-level destinations, stack-based push/pop for drill-down (list → detail → sub-detail), and modal sheets for actions that do not leave the current context (e.g., expense entry, photo capture).
- **FR-011**: The design foundation MUST define transition animations: slide-in for push navigation, slide-out for pop, slide-up for bottom sheets, fade for modals. Animation durations MUST be specified.
- **FR-012**: Back navigation MUST be predictable: hardware/gesture back always pops the current screen or dismisses a modal. Tab switches MUST preserve each tab's navigation stack — returning to a previously visited tab resumes at the last-viewed screen. Re-tapping the already-active tab resets that tab to its root screen.
- **FR-013**: The design foundation MUST specify breadcrumb and context behavior: whether screens show a back arrow (always for non-root screens), and how screen titles update during navigation.

#### 4. Information Density Rules

- **FR-014**: The design foundation MUST define a "card anatomy" standard: maximum content zones per card (e.g., header, body, metadata footer, action bar), line limits per zone, and truncation rules (ellipsis with "view more" for text exceeding 3 lines).
- **FR-015**: List screens MUST follow a defined density tier: "compact" (single-line items for high-volume lists like transactions), "standard" (2–3 line items for trip cards), or "rich" (multi-section items for active-trip detail). Each tier MUST be specified with its dimensions and content layout.
- **FR-016**: The design foundation MUST define when to use full-screen detail vs. expandable cards vs. bottom sheets for showing additional information. The decision criteria MUST be based on content volume, not developer preference.
- **FR-017**: Data tables on mobile MUST use a defined pattern: either horizontal scroll with frozen first column, or reformatted as card-per-row. The design foundation MUST specify the breakpoint at which table → card conversion occurs.

#### 5. List / Detail / Action Patterns

- **FR-018**: The design foundation MUST define three canonical screen types and their layout contracts:
  - **List screen**: Toolbar → optional filter bar → scrollable list → optional FAB
  - **Detail screen**: Toolbar → scrollable content sections → optional sticky action bar at bottom
  - **Action screen**: Toolbar → form content → primary action button (bottom-anchored, always visible)
- **FR-019**: List screens MUST support pull-to-refresh, pagination (infinite scroll or explicit "load more"), and filtering (chip bar or dropdown). The design foundation MUST specify the visual pattern for each.
- **FR-020**: Detail screens MUST support sectioned content with clear visual separators. Each section MUST have a section header. The design foundation MUST define section header typography, separator style, and collapsible vs. always-visible behavior.
- **FR-021**: Action screens (forms) MUST follow the form UX rules defined in FR-023–FR-027.

#### 6. Form and Upload UX Rules

- **FR-022**: The design foundation MUST define standard form field components: text input, numeric input, dropdown/picker, date-time picker, checkbox, radio, toggle, and multi-line text area. Each MUST have defined dimensions, label placement (top-aligned), hint text behavior, and error state rendering.
- **FR-023**: Form validation MUST follow a defined pattern: inline validation on field blur (not on every keystroke), error messages below the field in error-colored text, and a summary banner at the top for submit-time errors.
- **FR-024**: Multi-step forms (e.g., trip milestone progression) MUST use a stepper pattern with: step indicator (numbered or icon-based), current step highlight, completed step checkmark, and disabled future steps. The design foundation MUST define the stepper component spec.
- **FR-025**: Photo and document upload interactions MUST follow a defined pattern: tap to capture (camera) or select (gallery), progress indicator during upload, thumbnail preview after success, retry on failure, and delete/replace action. Maximum file counts and size limits MUST be communicated to the user before upload.
- **FR-026**: Signature capture (for POD) MUST follow a defined pattern: full-width signature canvas, clear and redo actions, confirmation step, and preview of captured signature.
- **FR-027**: Forms MUST preserve partial progress. If the user navigates away from a multi-field form and returns, previously entered data MUST be restored (per Constitution Principle VII: partial-progress persistence).

#### 7. Loading / Empty / Error / Offline / Blocked State Philosophy

- **FR-028**: The design foundation MUST define five canonical UI states and their visual patterns:
  - **Loading**: Skeleton screens for content areas, spinner for actions. Skeletons MUST match the expected content layout shape. No blank screens.
  - **Empty**: Illustration or icon, descriptive message, and a suggested action button (e.g., "No past trips yet" with no action, or "No active trip" with "Pull to refresh"). Messages MUST be role-contextual.
  - **Error**: User-friendly message (not technical), retry button, and optional "report issue" link. Error details logged (not shown to user).
  - **Offline**: Persistent banner or indicator showing connectivity loss. Actions that require connectivity MUST be visibly disabled with an explanation. Previously loaded data MUST remain visible indefinitely (no timeout-based clearing) with a "Last updated X min ago" timestamp shown alongside the offline banner. The timestamp refreshes to reflect elapsed time since the last successful fetch.
  - **Blocked**: When a user action is blocked by a business rule (e.g., cannot depart without EWB, cannot complete without POD), the blocking reason MUST be shown inline with a clear explanation and any resolution action.
- **FR-029**: State transitions between loading → data-loaded, error → retry → loading, and offline → reconnected MUST animate smoothly. No abrupt content jumps or layout shifts.
- **FR-030**: Every screen MUST declare which states it handles (loading, empty, error, offline, data-loaded, blocked). If a screen justifiably does not need a state (e.g., Settings has no empty state), the omission MUST be documented with rationale.

#### 8. Trip / Status Visual Language

- **FR-031**: The design foundation MUST define a color and icon system for all 4 trip phases:
  - **Created**: Neutral/gray — setup phase
  - **In Transit**: Active/green or blue — movement phase
  - **Completed**: Success/teal — verified phase
  - **Settled**: Muted/final — closed phase
- **FR-032**: Exception states MUST be visually distinct from normal phases: a contrasting color (orange or red), a specific exception icon or badge, and a priority indicator when multiple exceptions exist.
- **FR-033**: The milestone stepper (10-step trip lifecycle) MUST have a defined visual treatment: completed steps (filled + checkmark), current step (highlighted + progress indicator), future steps (outline + muted), and blocked steps (locked icon + reason tooltip). The stepper MUST be defined for both horizontal (summary) and vertical (detail timeline) layouts.
- **FR-034**: Status badges MUST be consistent across all screens: a pill-shaped badge with phase-specific background color and white label text. Badge sizes MUST be defined for inline (small) and card-level (standard) uses.

#### 9. Shared vs Role-Specific UX Boundaries

- **FR-035**: The design foundation MUST delineate which design elements are **shared** (immutable across all roles) and which are **role-configurable**:
  - **Shared (immutable)**: Color palette, typographic scale, spacing grid, icon style, state patterns (loading/empty/error/offline/blocked), touch target minimums, animation durations, form field components, shell structure (header + content + tab bar), navigation grammar (push/pop/modal).
  - **Role-configurable**: Tab bar content (icons, labels, order, count), landing screen layout, list/detail content and density, role-specific empty-state messaging, feature-specific components (e.g., milestone stepper is trip-focused).
- **FR-036**: No role-specific implementation MAY override shared design tokens (colors, typography, spacing). Role-specific screens MUST compose using the shared component library, not fork it.
- **FR-037**: The design foundation MUST define a component ownership model: shared components live in a common module (`ui/common/`), role-specific components live in the role's module (`ui/driver/`, `ui/dispatch/`). This mirrors the architecture from spec-001.

#### 10. Deliverable Design Artifacts

- **FR-038**: The design foundation MUST produce the following artifacts, each maintainable and referenceable by future specs and plans:
  1. **Design Tokens File**: Named color, typography, spacing, elevation, and animation values — implementable as a theme configuration.
  2. **Component Catalog**: A documented set of shared UI components (buttons, cards, inputs, badges, steppers, state screens) with their variants, dimensions, and usage rules.
  3. **Screen Template Gallery**: Visual templates for list, detail, action, and dashboard screen types — showing zones, spacing, and content placement.
  4. **State Pattern Guide**: Visual examples of loading, empty, error, offline, and blocked states applied to representative screens.
  5. **Trip Visual Language Guide**: Status colors, icons, badges, and stepper variants with examples from the trip lifecycle.
  6. **Navigation Pattern Guide**: Flow diagrams showing tab → stack → modal navigation with defined transition types.

- **FR-039**: Each design artifact MUST be created as a referenceable document within the `specs/002-design-foundation/` directory or linked sub-directory. They MUST be verifiable — a reviewer can audit any screen against the artifacts.

### Key Entities

- **Design Token**: A named value (color, size, duration, etc.) that governs a specific visual property across the app. Tokens are the atomic building blocks of the design system.
- **UI Component**: A reusable visual element (button, card, input field, badge, stepper) with defined variants, dimensions, states, and usage rules. Components consume design tokens.
- **Screen Template**: A layout blueprint (list, detail, action, dashboard) that defines content zones, spacing, and behavioral patterns. Templates compose UI components.
- **State Pattern**: A visual and behavioral pattern for a specific data lifecycle state (loading, empty, error, offline, blocked). Applied uniformly to all screens.
- **Status Visual**: A color + icon + badge combination representing a trip lifecycle phase or exception. Used across trip-related screens for instant status recognition.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of Driver v1 screens pass a visual consistency audit — every screen uses only named design tokens for color, typography, and spacing. Zero hardcoded values outside the token system.
- **SC-002**: Any developer can build a new screen (for any role) using only the design foundation artifacts within 1 day, without requiring design consultation or inspecting other screens for style reference.
- **SC-003**: A non-technical stakeholder shown 5 trip cards with different statuses correctly identifies each status within 3 seconds per card, based solely on the visual language.
- **SC-004**: Every Driver v1 screen handles all applicable lifecycle states (loading, empty, error, offline, data-loaded). Zero blank screens or unhandled states exist in the shipped product.
- **SC-005**: Adding a second role's screens requires zero changes to the shared design system, component library, or state pattern implementations. Role-specific additions only.
- **SC-006**: Minimum touch target size (48dp) is met across 100% of interactive elements. No touch target violations exist in the shipped product.
- **SC-007**: The design token system is implemented as a single source of truth — changing a token value (e.g., primary color) propagates to all screens that use it, verified by changing one token and confirming all dependent screens update.

---

## Assumptions

- The existing web product's color scheme (department colors from `product.md`: Operations Emerald `#059669`, etc.) informs the mobile palette but does not dictate it — mobile may adjust for outdoor readability and contrast requirements.
- The app targets Android and iOS via KMP/Compose Multiplatform. Design tokens will be implemented as Compose `MaterialTheme` extensions. Platform-specific design conventions (Material 3 on Android, HIG on iOS) are respected where they don't conflict with AxleOps brand identity.
- Driver is the v1 reference implementation for validating the design foundation. All design rules are validated against Driver screens but written for role-agnostic applicability.
- The design foundation is a governance/specification artifact. Actual component implementation code is a downstream task covered by the implementation plan — this spec defines the **what**, not the **how**.
- The design system will use Material 3 (Compose Multiplatform) as the component baseline, with AxleOps-branded overrides for colors, typography, shapes, and elevation.
- Accessibility requirements follow WCAG 2.1 Level AA as a baseline: 4.5:1 contrast ratio for normal text, 3:1 for large text, and minimum 48dp touch targets.
- Offline behavior is defined at the design pattern level (what the user sees when offline). Actual offline data persistence is an architecture concern addressed in future specs.
- The design foundation does not prescribe backend contracts — it governs visual presentation and interaction patterns only.

---

## Deferred Items (Explicitly Out of Scope)

| Item | Reason for Deferral |
|------|---------------------|
| Dark mode theme | V1 ships with light theme only. Dark mode tokens can be added later as a theme variant without structural changes |
| Tablet / landscape layouts | V1 targets phone form factor only (portrait). Tablet support is a future concern |
| Motion design specification (micro-animations beyond transitions) | V1 defines transition animations. Rich micro-animations (success celebrations, progress pulses) are deferred |
| Illustration asset library | V1 uses icons and placeholder illustrations for empty states. A custom illustration library is a future polish item |
| Design-to-code generation tooling | Design tokens are manually implemented in v1. Automation (e.g., Figma → Compose export) is a future tooling investment |
| Comprehensive accessibility audit | V1 meets baseline WCAG 2.1 AA. Full audit with screen reader testing is deferred |
| Platform-divergent design (Material vs HIG) | V1 uses a single Compose Multiplatform design. iOS-specific HIG adaptations are deferred |
