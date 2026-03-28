# Design Review Checklist — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Date**: 2026-03-28

---

## How to Use This Checklist

This checklist is used **twice**:

1. **During foundation implementation** — engineering self-verifies each item.
2. **During foundation review** — a reviewer audits the shipped foundation against these items before feature epics begin.

Mark each item:  `[x]` pass · `[ ]` fail · `[–]` not applicable (with justification)

---

## Section 1: App Shell Structure

- [ ] Top bar renders with screen title on all screens
- [ ] Top bar back arrow appears on all non-root screens and pops on tap
- [ ] Top bar remains fixed on scroll (does not collapse)
- [ ] Bottom tab bar renders with correct tabs from `RoleConfig`
- [ ] Tab bar shows active/inactive state correctly (`color.primary` vs `color.on.surface.variant`)
- [ ] Tab bar has `elevation.medium` (visible shadow)
- [ ] Tapping inactive tab switches to that tab
- [ ] Tapping active tab resets to tab root (if not already at root)
- [ ] Tab bar is hidden during immersive flows
- [ ] Safe area insets are respected on all edges (notch, home indicator, rounded corners)
- [ ] Content area fills space between top bar and tab bar correctly
- [ ] No content drawn behind system status bar or home indicator

---

## Section 2: Startup Flow

- [ ] App launches to splash/brand screen (no white flash)
- [ ] If no stored token → Login screen appears without delay
- [ ] If stored token → session validated via `GET /auth/me`
- [ ] Validation takes < 3 seconds → shell renders
- [ ] Validation takes > 3 seconds → error screen with retry
- [ ] Validation returns 401 → token cleared, Login screen shown
- [ ] 1 mobile-supported role → auto-selected, shell renders
- [ ] Multiple mobile roles → Role Selector screen shown
- [ ] 0 mobile roles → Unsupported Role screen shown
- [ ] Network failure during validation → error screen with retry
- [ ] After 3 retries → secondary hint "or sign in again" appears

---

## Section 3: UX State Handling

### Loading
- [ ] Loading state shows skeleton (not blank screen, not centered spinner)
- [ ] Skeleton matches expected content shape (cards for list screens)
- [ ] Skeleton has shimmer animation (0.15 – 0.35 alpha, 800ms cycle)
- [ ] Top bar and tab bar remain interactive during loading

### Empty
- [ ] Empty state shows icon (64dp) + descriptive message
- [ ] Message is role-contextual (not generic "No data")
- [ ] Optional action button renders below message when provided
- [ ] Empty state is centered vertically in content area

### Error  
- [ ] Error state shows error icon (48dp, `color.error`) + message + Retry button
- [ ] Message is user-friendly (not HTTP status code or stack trace)
- [ ] Retry button re-initiates failed fetch
- [ ] Loading skeleton appears during retry

### Offline
- [ ] Offline banner appears below top bar when device loses connectivity
- [ ] Banner uses `color.warning` background, wifi-off icon, "No internet connection" text
- [ ] Previously loaded data remains visible below banner
- [ ] "Last updated X min ago" timestamp appears and updates live
- [ ] If no stale data (first visit while offline), empty state shown below banner
- [ ] Network-dependent actions are disabled (38% opacity) with explanation
- [ ] Banner dismisses on reconnection (150ms fade)
- [ ] Screen re-fetches data silently on reconnection

### Blocked
- [ ] Blocked hint shows lock icon + reason + optional resolution CTA
- [ ] Blocked hint is inline (not full-screen modal)
- [ ] Rest of screen remains interactive around blocked area

### Transitions
- [ ] Loading → Success/Empty/Error transitions use crossfade (150ms)
- [ ] No abrupt content jumps or layout shifts during state transitions
- [ ] `UiStateHandler` composable correctly dispatches all 6 states

---

## Section 4: Navigation

- [ ] Push navigation slides screen in from right (250ms)
- [ ] Pop navigation slides screen out to right (250ms)
- [ ] System back gesture performs identical pop
- [ ] Per-tab navigation stacks are preserved on tab switch
- [ ] Modal dialogs open with fade + scale (150ms)
- [ ] Modal confirmations (logout) are NOT scrim-dismissible
- [ ] Bottom sheets slide up (200ms) with handle and scrim
- [ ] Bottom sheets are swipe-down dismissible
- [ ] Tab switching is instant (no animation)

---

## Section 5: Auth & Session

- [ ] JWT token stored securely (Keychain on iOS, encrypted prefs on Android)
- [ ] 401 response from any API call triggers auto-logout
- [ ] Auto-logout clears token and navigates to Login
- [ ] "Session expired" message shown on Login after auto-logout
- [ ] Auth state observable works — auth changes reflect immediately across all screens
- [ ] App resume < 30 min does not re-validate
- [ ] App resume ≥ 30 min re-validates silently

---

## Section 6: API Client

- [ ] Single centralized HTTP client is used for all API calls
- [ ] JWT token is attached as Bearer header on authenticated requests
- [ ] Base URL varies by build environment (dev/staging/prod)
- [ ] JSON serialization/deserialization works correctly
- [ ] HTTP errors are mapped to defined error types (network, auth, client, server, timeout)
- [ ] Connect timeout = 10s, read timeout = 30s (configurable)
- [ ] Request/response logging enabled in dev builds
- [ ] Request/response logging disabled in production builds
- [ ] Multipart file upload is supported

---

## Section 7: Mock/Real Switching

- [ ] Per-feature data source mode is configurable (real, mock, hybrid)
- [ ] Dev/staging builds support runtime toggling via Settings
- [ ] Production builds have no mock infrastructure (code-excluded)
- [ ] Switching mock ↔ real requires zero UI/ViewModel code changes
- [ ] Mock fixtures load correctly from app resources
- [ ] Mock data is realistic and matches expected backend shapes
- [ ] Mock data source simulates latency (not instant)
- [ ] Editing a mock JSON fixture reflects on next app launch (QA editable)
- [ ] Mock/real indicator badge visible in debug builds only
- [ ] Tapping mock/real badge navigates to Data Sources settings

---

## Section 8: Design System Integration

- [ ] AxleOps theme applied at app root via `AxleOpsTheme`
- [ ] All colors use named tokens (no hardcoded hex values in feature code)
- [ ] All typography uses named styles (`type.headline`, `type.title`, etc.)
- [ ] All spacing uses named tokens (`Spacing.sm`, `Spacing.lg`, etc.)
- [ ] All corner radii use named tokens
- [ ] Touch targets ≥ 48dp on all interactive elements
- [ ] Contrast ratio ≥ 4.5:1 for body text
- [ ] Changing a single token value propagates to all dependent screens

---

## Section 9: Upload Baseline

- [ ] Upload service interface exists with capture, preview, progress, retry
- [ ] Camera/gallery permission requested at point of use with rationale
- [ ] File size validation occurs before upload attempt
- [ ] Thumbnail preview shown after capture
- [ ] Upload progress indicator shown during upload
- [ ] Upload failure shows retry affordance
- [ ] Mock mode stores files locally + returns mock URL
- [ ] Previously entered form data preserved on upload failure

---

## Section 10: Analytics / Logging

- [ ] Analytics interface exists with screen view, action, error, custom event methods
- [ ] Screen view events logged on navigation
- [ ] Error events logged with context (screen, action, error type)
- [ ] Local logging implementation works for development
- [ ] Analytics interface is injectable via DI (swappable later)
- [ ] Diagnostic log levels respect build environment (verbose dev, minimal staging, errors-only prod)

---

## Section 11: Module Structure

- [ ] Layered packages: `ui/`, `domain/`, `data/`, `di/`
- [ ] Domain models are pure Kotlin (no Ktor, Compose, or platform imports)
- [ ] DTOs are separate from domain models (live in `data/dto/`)
- [ ] Mappers convert DTO ↔ Domain (live in `data/mapper/`)
- [ ] Platform-specific code uses expect/actual pattern
- [ ] Role-specific UI lives in `ui/{rolename}/`, not in shared modules
- [ ] No static singletons — all infrastructure injectable via Koin

---

## Section 12: Cross-Platform

- [ ] App compiles and runs on Android emulator
- [ ] App compiles and runs on iOS simulator
- [ ] Shell renders correctly on both platforms
- [ ] Platform-specific differences (safe areas, back gesture, permissions) handled via expect/actual

---

## Section 13: What Later Features Must Inherit

This section is for the **reviewer to verify** that the foundation's patterns are documented clearly enough that feature developers can reuse them without ambiguity.

- [ ] A developer can create a new screen using `UiStateHandler` without reading foundation source code (API is self-documenting)
- [ ] A developer can add a mock fixture for a new feature without modifying foundation code
- [ ] A developer can define a new tab for a new role by adding a `RoleConfig` entry — no shell code changes
- [ ] A developer can use the upload service in a new feature without building upload infrastructure
- [ ] A developer can log analytics events without configuring an analytics service
- [ ] The state inventory clearly documents what each feature screen MUST define (empty messages, error retries, blocked reasons)
- [ ] The interaction rules clearly document form validation, keyboard behavior, and partial progress expectations

---

## Summary

| Section | Items |
|---------|-------|
| 1. Shell Structure | 12 |
| 2. Startup Flow | 11 |
| 3. State Handling | 23 |
| 4. Navigation | 9 |
| 5. Auth & Session | 7 |
| 6. API Client | 9 |
| 7. Mock/Real Switching | 10 |
| 8. Design System | 8 |
| 9. Upload Baseline | 8 |
| 10. Analytics/Logging | 6 |
| 11. Module Structure | 7 |
| 12. Cross-Platform | 4 |
| 13. Feature Inheritance | 7 |
| **Total** | **121** |
