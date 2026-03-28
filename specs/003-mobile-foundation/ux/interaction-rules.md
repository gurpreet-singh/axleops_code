# Interaction Rules — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Date**: 2026-03-28

---

## 1. Shell Interaction Rules

### 1.1 Top Bar

| Rule | Behavior |
|------|----------|
| **Title** | Reflects the current screen's display name. Left-aligned. `type.title` style. |
| **Back arrow** | Visible on all non-root screens. Tapping pops the current screen. Not visible on tab landing screens. |
| **Trailing actions** | Optional. Maximum 2 icon buttons (more via overflow menu). Reserved for screen-specific actions (filter, search). |
| **Offline indicator** | When offline, the `OfflineBanner` appears as a separate row *below* the top bar — it does NOT replace the title. |
| **Scroll behavior** | Top bar remains fixed (does not collapse on scroll in v1). Content scrolls behind / below it. |

### 1.2 Bottom Tab Bar

| Rule | Behavior |
|------|----------|
| **Appearance** | Fixed at bottom. `elevation.medium` (4dp shadow). Background `color.surface`. |
| **Tab items** | Icon (24dp) above label (`type.caption`). Active tab: `color.primary` icon + label. Inactive: `color.on.surface.variant`. |
| **Tap on inactive tab** | Switches to that tab, showing the last-viewed screen in that tab's stack. |
| **Tap on active tab** | Resets that tab's navigation stack to the root/landing screen. If already on root, no-op. |
| **Long press** | No action (reserved for future accessibility). |
| **Badge** | Small `CountBadge` (20dp circle, `color.error` fill) on tab icon. Count ≤ 99 shown numerically; > 99 shows "99+". Badge visibility configured per tab in `RoleConfig`. |
| **Visibility** | Visible on tab landing and first-level detail screens. **Hidden** during immersive flows (camera capture, signature, multi-step forms with tab bar hidden). |
| **Tab count** | 3–5 tabs per role. Distributed evenly across bar width. |
| **Safe area** | Tab bar sits above the home indicator (iOS) / nav gesture area (Android). System safe area insets apply. |

### 1.3 Content Area

| Rule | Behavior |
|------|----------|
| **Scroll** | Content scrolls within the content area. Top bar and tab bar remain fixed. |
| **Pull-to-refresh** | Supported on list and summary screens. Pull gesture triggers data refresh. Spinner is a short circular indicator at the top of the content area, not a full skeleton reload. |
| **Safe area** | Content respects safe area insets. No content drawn behind status bar, notch, or home indicator. |

---

## 2. Navigation Interaction Rules

### 2.1 Push/Pop (Stack Navigation)

| Rule | Behavior |
|------|----------|
| **Push** | Navigating from list → detail slides the new screen in from the right (250ms ease-in-out). |
| **Pop** | Back navigation slides the current screen out to the right (250ms ease-in-out). |
| **Back affordance** | Back arrow in top bar + system back gesture (swipe from left edge on iOS, system back on Android). Both perform identical pop. |
| **Pop to root** | No multi-level pop in v1. User pops one screen at a time, or taps the active tab to reset to root. |

### 2.2 Modal Dialogs

| Rule | Behavior |
|------|----------|
| **Open** | Fade + scale up over `color.scrim` backdrop (32% black). Duration: 150ms. |
| **Close** | Fade + scale down. Scrim fades. Duration: 150ms. |
| **Dismiss** | Tapping scrim dismisses ONLY for non-destructive modals. Confirmation modals (logout, reject trip) are NOT scrim-dismissible. |
| **Actions** | Max 2 buttons. Confirm = primary button (right). Cancel = text button (left). |
| **Use cases** | Confirmations (logout, destructive actions), alerts (session expired). NOT for content display — use sheets for that. |

### 2.3 Bottom Sheets

| Rule | Behavior |
|------|----------|
| **Open** | Slide up from bottom over `color.scrim` backdrop. Duration: 200ms ease-out. Top corners: `radius.lg` (12dp). |
| **Close** | Slide down. Duration: 200ms ease-in. |
| **Dismiss** | Swipe down gesture or tap on scrim. |
| **Handle** | 32dp × 4dp centered bar at the top (`color.outline`). Indicates sheet is draggable. |
| **Max height** | 70% of screen height. If content exceeds, sheet scrolls internally. |
| **Use cases** | Filters, pickers, secondary options, additional info that doesn't warrant a full screen. |

### 2.4 Tab Switching

| Rule | Behavior |
|------|----------|
| **Animation** | None. Tab switches are instant (0ms). Content snaps to the target tab. |
| **State preservation** | Each tab's navigation stack is preserved independently. Returning to a tab shows the last-viewed screen. |
| **Data retention** | Data loaded in a tab is NOT re-fetched on tab return (unless stale by feature-defined TTL or pull-to-refresh). |

---

## 3. Form Interaction Rules

The foundation defines form field behavior. Feature screens compose these fields into domain-specific forms.

### 3.1 Input Fields

| Rule | Behavior |
|------|----------|
| **Label** | Always above the field (top-aligned). Never floating or inside the field. `type.label` style. |
| **Placeholder** | Inside the field. `color.on.surface.variant`. Disappears on focus. |
| **Focus** | Border changes to `color.primary` (2dp width). Keyboard opens. |
| **Blur** | Validation runs on blur. If invalid, border changes to `color.error` and error message appears below. |
| **Error message** | Below field. `color.error`. `type.caption`. Appears on blur validation failure. Clears when user starts typing again. |
| **Disabled** | 38% opacity. Non-interactive. Touch has no effect. |
| **Required indicator** | `*` appended to label text. |

### 3.2 Validation

| Rule | Behavior |
|------|----------|
| **Timing** | Field-level: on blur. Form-level: on submit. |
| **On submit** | All fields validated. If any invalid, scroll to first error. Optionally, summary banner at top: "Please fix the highlighted errors." |
| **Progressive** | Fields validate individually as user moves through form. Not all fields validate when first one is touched. |

### 3.3 Keyboard

| Rule | Behavior |
|------|----------|
| **Action button** | Form with multiple fields: "Next" moves focus to next field. Last field: "Done" or "Submit". |
| **Sticky CTA** | Primary action button at bottom of form stays above keyboard. Content scrolls, button remains visible. |
| **Dismiss** | Tapping outside a field or tapping "Done" dismisses keyboard. |

### 3.4 Partial Progress

| Rule | Behavior |
|------|----------|
| **Within session** | Navigating away from a multi-field form within a tab and returning preserves entered data (ViewModel holds state). |
| **Tab switch** | Form state is preserved if user switches tabs and returns (ViewModel is tab-scoped). |
| **App background** | Form state is preserved if app backgrounds and resumes (ViewModel survives configuration change). |
| **Exit confirmation** | If user navigates back from a form with unsaved changes, show confirmation dialog: "Discard changes?" with "Discard" + "Keep editing" buttons. |

---

## 4. Upload Interaction Rules

The foundation defines the upload interaction contract. Feature screens use the upload service for domain-specific flows (POD photos, evidence capture, expense receipts).

### 4.1 Capture Flow

| Step | UX |
|------|-----|
| **Trigger** | User taps "Add Photo" / "Capture" button in a feature screen. |
| **Permission** | If camera/gallery permission not granted, show system permission dialog with rationale: "AxleOps needs camera access to capture trip evidence." If permanently denied, show settings-redirect button. |
| **Capture** | Platform camera/gallery UI opens. Tab bar is hidden (immersive flow). |
| **Review** | Captured image is shown as a thumbnail preview. User can accept, retake, or cancel. |

### 4.2 Upload Progress

| Step | UX |
|------|-----|
| **Queued** | Thumbnail shown with "Uploading…" overlay and circular progress indicator. |
| **In progress** | Progress percentage shown on thumbnail. |
| **Success** | Progress indicator removed. Thumbnail shows checkmark badge. |
| **Failure** | Thumbnail shows error badge + "Retry" button. Previously entered form data is NOT lost. |

### 4.3 File Constraints

| Constraint | UX |
|-----------|-----|
| **File size exceeded** | Show error before upload: "File too large (max Xmb). Choose a smaller file." |
| **Max file count reached** | Disable "Add Photo" button. Show hint: "Maximum X files reached." |
| **Unsupported format** | Show error: "This file type is not supported." |

---

## 5. Debug/QA Interaction Rules

### 5.1 Data Source Toggles (Settings)

| Rule | Behavior |
|------|----------|
| **Location** | Settings screen → "Data Sources" section. Visible in QA/debug builds only. |
| **Controls** | Per-feature toggle: switch between "Real" and "Mock". |
| **Effect** | Toggle takes effect on next data fetch (not retroactive on currently displayed data). |
| **Label** | Each toggle shows the feature name + current mode + backend URL (for real) or fixture filename (for mock). |

### 5.2 Mock Indicator (Top Bar)

| Rule | Behavior |
|------|----------|
| **Location** | Top bar trailing area, leftmost position (before screen-specific actions). |
| **Appearance** | Small badge: "🟢 Real" / "🟠 Mock" / "🔶 Hybrid". `type.caption` size. |
| **Tap** | Navigates to Data Sources section in Settings. |
| **Visibility** | QA and development builds only. Excluded from production APK/IPA entirely. |

---

## 6. Accessibility Rules (Foundation Baseline)

| Rule | Specification |
|------|--------------|
| **Touch targets** | Minimum 48dp × 48dp for all interactive elements. No exceptions. |
| **Contrast** | Minimum 4.5:1 for body text. 3:1 for large text (`type.headline`, `type.title`). |
| **Screen reader** | All interactive elements have `contentDescription`. Decorative icons use `contentDescription = null`. |
| **Focus order** | Logical top-to-bottom, left-to-right. Tab bar items are focusable. |
| **Motion** | If system "reduce motion" is enabled, all animations drop to 0ms (instant). |
