# Interaction Rules — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> These rules govern **how the user interacts** with the app at the design-system level. Feature-specific interaction rules (e.g., POD capture workflow) live in each feature's UX package.

---

## 1. Action Patterns

### 1.1 Primary Actions

| Rule | Description |
|------|-------------|
| **One primary action per screen** | Each screen has at most one primary (filled) button. It represents the most important thing the user can do on that screen. |
| **Bottom-anchored** | Primary action buttons sit at the bottom of the screen, fixed above the tab bar or keyboard. They never scroll out of view. |
| **Verb-first labels** | Action buttons use imperative verbs: "Accept Trip", "Capture POD", "Submit", not "OK" or "Done". |
| **Loading state on submit** | When a primary action triggers a request, the button shows a spinner and becomes non-interactive. The label changes to the progressive form ("Accepting…"). |

### 1.2 Destructive Actions

| Rule | Description |
|------|-------------|
| **Always require confirmation** | Destructive actions (Reject Trip, Cancel, Delete, Logout) show a confirmation modal before executing. |
| **Modal structure** | Title: "Confirm [Action]". Body: consequence description. Two buttons: Cancel (text) + Confirm (destructive, `color.error`). |
| **No undo** | Once confirmed, destructive actions are final. The confirmation modal must make this clear. |
| **Deliberate reach** | Destructive buttons should not be in the thumb-easy zone. Place them in secondary positions (top-right, end of scroll, or behind overflow menu). |

### 1.3 Secondary & Tertiary Actions

| Rule | Description |
|------|-------------|
| **Outlined buttons** | Secondary actions (alternative to primary): "Reject" next to "Accept", "Skip" next to "Submit". |
| **Text buttons** | Tertiary actions: "Learn more", "View details", navigation links. |
| **Overflow menu** | If more than 2 actions compete for space, place extras behind a ⋮ overflow menu. |

---

## 2. Upload & Evidence Capture

### 2.1 Photo Capture

| Step | Behavior |
|------|----------|
| **Trigger** | Tap camera icon or "Add Photo" button |
| **Capture** | Full-screen camera (tab bar hidden). Tap to capture. |
| **Preview** | Captured photo shown full-screen with "Use Photo" (primary) and "Retake" (secondary). |
| **Upload** | Progress indicator during upload. Thumbnail shown on completion. |
| **Failure** | "Upload failed" message + "Retry" button. Photo preserved locally — not lost. |
| **Limits** | Max photo count shown as "2/4 photos" — user informed before reaching limit. |

### 2.2 Document/File Upload

| Step | Behavior |
|------|----------|
| **Trigger** | Tap "Upload" button |
| **Selection** | System file picker (platform-native) |
| **Progress** | Upload progress bar within the upload card |
| **Size limits** | Communicated before selection: "Max 10 MB per file" |
| **Failure** | Retry affordance. File preserved locally. |

### 2.3 Signature Capture

| Step | Behavior |
|------|----------|
| **Trigger** | "Capture Signature" button on POD screen |
| **Canvas** | Full-width drawing canvas (landscape-optimized within portrait layout). Tab bar hidden. |
| **Actions** | "Clear" (secondary) to reset, "Done" (primary) to confirm |
| **Preview** | Signature thumbnail shown after capture with "Redo" option |
| **Persistence** | Signature saved locally immediately. Upload happens with POD submission. |

---

## 3. Confirmation & Feedback

### 3.1 Success Feedback

| Scenario | Pattern |
|----------|---------|
| **Inline action** (mark milestone complete) | Brief check animation on the button (300ms) → UI updates to reflect new state. No toast, no modal. |
| **Submit action** (submit POD, save expense) | Transition to parent screen + brief snackbar: "POD submitted" (3 seconds, auto-dismiss). |
| **Multi-step completion** | Return to parent screen with updated state visible on the parent. |

### 3.2 Error Feedback

| Scenario | Pattern |
|----------|---------|
| **Submit error** | Red error banner at top of form: "Couldn't submit. Check your connection and try again." Fields remain filled. |
| **Inline validation error** | Red text below the offending field (on blur). Field border turns `color.error`. |
| **Network error on action** | Snackbar with retry: "Action failed. Tap to retry." (persists until dismissed or retried). |

### 3.3 Toasts & Snackbars

| Rule | Description |
|------|-------------|
| **Auto-dismiss** | Success snackbars: 3 seconds. Error snackbars: persist until dismissed or retried. |
| **Position** | Above the bottom tab bar, below the content area. |
| **Max one** | Only one snackbar visible at a time. New ones replace previous. |
| **No toasts for errors** | Errors must be visible and persistent — never use auto-dismissing toasts for error messages. |

---

## 4. Blocked State Interactions

| Scenario | Pattern |
|----------|---------|
| **Trip action blocked** | The action button appears disabled (38% opacity). Below or beside it: inline `BlockedHint` with blocking reason ("Cannot depart — E-Way Bill not yet generated") and resolution action if applicable ("Generate EWB" link). |
| **Feature unavailable offline** | Button disabled, tooltip/label: "Requires internet connection". |
| **Permission denied** | Button hidden entirely — the user should not see actions they cannot perform (RBAC filtering in ViewModel, not UI). |

---

## 5. Navigation Interactions

### 5.1 Tab Bar

| Rule | Behavior |
|------|----------|
| **Tab tap** | Switches to the selected tab's root screen. Active tab highlighted with primary color. |
| **Re-tap active tab** | Scrolls to top of the current screen (if scrolled) or pops to tab root (if deep in nav stack). |
| **Tab state preservation** | Switching away and back preserves the tab's navigation stack position. |
| **Swipe between tabs** | Not supported. Tabs switch via tap only. |

### 5.2 Back Navigation

| Rule | Behavior |
|------|----------|
| **System back** | Pops current screen from the nav stack. On tab root: no-op (does not exit app without confirmation). |
| **Back arrow** | Visible on all non-root screens. Taps pop the current screen. |
| **Exit from tab root** | System back on any tab root shows "Exit app?" confirmation dialog. |
| **Flow exit** | Back/close during a multi-step flow with unsaved data shows "Discard changes?" confirmation. |

### 5.3 Pull-to-Refresh

| Rule | Behavior |
|------|----------|
| **Available on** | All list screens and single-item screens (Active Trip). |
| **Not available on** | Detail screens navigated from lists, action screens, settings. |
| **Visual** | Standard pull indicator at top. Existing content stays visible during refresh. |
| **Offline** | Pull-to-refresh is disabled when offline (no network to fetch from). |

---

## 6. Form Interactions

| Rule | Description |
|------|-------------|
| **Validation timing** | On blur (field loses focus), not on every keystroke. Exception: character-count limits show live count. |
| **Submit validation** | On submit tap, all fields validate. Scroll to first error field. Show summary banner at top. |
| **Required field indicator** | Asterisk `*` appended to label text. |
| **Partial progress** | Multi-step forms persist state across interruptions (app background, accidental back). The user can return and resume. |
| **Keyboard handling** | Bottom action button stays above keyboard. Form scrolls to keep focused field visible. "Next" key moves to next field; "Done" key submits or dismisses keyboard. |
| **Dropdown/Picker** | Opens as a bottom sheet with search (if > 7 options) or inline option list (if ≤ 7 options). |
