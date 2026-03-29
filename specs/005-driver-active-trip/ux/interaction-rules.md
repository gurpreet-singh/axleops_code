# Interaction Rules — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Design System**: [mobile-design-system.md](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)  
> **Date**: 2026-03-29

---

## 1. Action Enablement Rules

Every action button on every screen follows these precise rules. Engineering must not guess.

### 1.1 Primary CTA (Bottom-Anchored)

The primary CTA is the single most important button on the screen. It changes based on the current sub-state.

| Current Sub-State | CTA Label | CTA Style | CTA Enabled When | Confirmation? |
|-------------------|-----------|-----------|-------------------|---------------|
| DISPATCHED | "Accept Trip" | Primary (filled, `color.primary`) | Always (within timeout) | ✅ Modal: "Accept this trip?" with trip summary |
| DISPATCHED | "Reject Trip" | Destructive (filled, `color.error`) | Always | ✅ Modal: "Reject this trip?" + reason text field (required) |
| DISPATCHED (timeout) | "Accept Trip" | Disabled (38% opacity) | Never | — |
| ACCEPTED | "Arrived at Origin" | Primary | Always | ❌ No confirmation needed |
| AT_ORIGIN | "Start Loading" | Primary | Always | ❌ |
| LOADING | "Loading Complete" | Primary | After form fields filled (weight required) | ❌ |
| LOADED | "Depart" | Primary | EWB NOT_REQUIRED or EWB = GENERATED/ACTIVE | ❌ |
| LOADED + EWB_PENDING | (no CTA) | — | Never — blocked state | — |
| DEPARTED / IN_TRANSIT | "Arrived at Destination" | Primary | Always | ❌ |
| AT_DESTINATION | "Start Unloading" | Primary | Always | ❌ |
| UNLOADING | "Delivery Complete" | Primary | After form fields filled (weight, condition) | ❌ |
| DELIVERED | "Submit POD" | Primary | Always | ❌ (POD flow handles confirmation) |
| POD_SUBMITTED | (no CTA) | — | Never — read-only | — |
| POD_VERIFIED | (no CTA) | — | Never — read-only | — |
| SETTLED | (no CTA) | — | Never — read-only | — |
| Any exception active | (no CTA) | — | Never — exception banner replaces | — |

### 1.2 Secondary Actions

| Action | Where | Style | Enabled When | Confirmation? |
|--------|-------|-------|--------------|---------------|
| "Report Issue" | Trip detail — top-right or overflow | Secondary (outlined) | IN_TRANSIT or AT_DESTINATION, no active exception | ❌ (opens separate screen) |
| "Add Expense" | Expense section — "+" inline | Text button | Before POD_SUBMITTED, no active exception | ❌ |
| "Add Document" | Document section — "+" inline | Text button | Before POD_SUBMITTED | ❌ |
| "Log Event" | En-route section — "+" inline | Text button | DEPARTED or IN_TRANSIT, no active exception | ❌ |
| "View on Map" | Trip detail — map section | Text button | Trip exists (any active state) | ❌ |

### 1.3 Disabled State Appearance

All disabled actions use the same visual treatment from `mobile-design-system.md` §2.1:
- **Opacity**: 38% of the normal button appearance
- **Touch**: Non-interactive (no ripple, no press response)
- **Reason**: Always accompanied by explanatory text below or beside the button

---

## 2. Confirmation Patterns

Actions that cannot be undone require explicit confirmation before executing.

### 2.1 Actions Requiring Confirmation

| Action | Confirmation Type | Content |
|--------|------------------|---------|
| Accept Trip | Modal Dialog | Title: "Accept Trip?" · Body: trip number + route summary · Actions: "Cancel" (text), "Accept" (primary) |
| Reject Trip | Modal Dialog | Title: "Reject Trip?" · Body: "This trip will be returned to dispatch." · Required: reason text input · Actions: "Cancel" (text), "Reject" (destructive) |
| Submit POD | POD Review Screen | Not a modal — the PodReviewScreen itself is the confirmation step. "Submit POD" button is the final action. |
| Exit POD Flow with data | Modal Dialog | Title: "Discard POD?" · Body: "Photos and signature data will be lost." · Actions: "Keep Editing" (text), "Discard" (destructive) |
| Report Exception | Submit button on ExceptionReportScreen | Not a separate modal — the form submission is the confirmation. |

### 2.2 Actions NOT Requiring Confirmation

All milestone progressions (Arrived at Origin, Start Loading, Loading Complete, Depart, Arrived at Destination, Start Unloading, Delivery Complete) execute immediately on tap. They are non-destructive forward transitions that capture evidence, not irreversible edits.

**Rationale**: The truck cab test — adding a confirmation modal to every milestone transition doubles the tap count and adds friction to a time-sensitive workflow. The milestone stepper shows what happened; if a mistake occurs, operations can intervene.

---

## 3. Feedback Patterns

### 3.1 Immediate Feedback (In-App)

| Event | Feedback Type | Duration | Visual |
|-------|--------------|----------|--------|
| Milestone transition success | Snackbar (bottom) | 3 seconds | "✓ [Milestone name] completed." `color.success` background |
| Trip accepted | Snackbar | 3 seconds | "✓ Trip accepted." |
| Trip rejected | Screen transition | Immediate | Trip card removed → empty state shown |
| Expense saved | Snackbar | 2 seconds | "✓ Expense saved." |
| Document upload started | Inline status | Persistent until done | "⏳ Uploading…" in document list item |
| Document upload complete | Inline status update | Persistent | "✓ Uploaded" in document list item |
| POD submitted | Screen transition | Immediate | Pop to trip detail → POD_SUBMITTED state |

### 3.2 Error Feedback

| Event | Feedback Type | Duration | Visual |
|-------|--------------|----------|--------|
| API call fails (transient) | Snackbar with retry | 5 seconds | "⚠ Couldn't complete action. Tap to retry." `color.error` |
| API call fails (conflict/guard) | Inline message | Persistent until resolved | Message below action area explaining why (e.g., "Trip is no longer in a valid state. Refreshing…") |
| Upload fails | Inline status | Persistent | "❌ Upload failed" with "Retry" button on the item |
| Offline action queued | Snackbar (informational) | 3 seconds | "📡 Action queued. Will sync when online." `color.info` |
| Queued action rejected by server | Modal Dialog | User dismisses | "Your [action] couldn't be synced. The trip state has changed. Please review." + "OK" button. Trip refreshes from server. |

### 3.3 Loading Feedback

| Context | Feedback | Visual |
|---------|----------|--------|
| Initial trip load | Skeleton screen | Card shape + stepper shape + sections |
| Milestone transition in progress | Button shows spinner | Primary button text replaced with circular indicator. Button disabled during call. |
| POD upload in progress | Per-file progress bar | Each thumbnail shows a horizontal progress bar beneath it |
| Photo capture processing | Inline spinner | Thumbnail placeholder with spinner while image is compressed/saved |
| Pull-to-refresh | Standard pull indicator | Platform-native pull-to-refresh animation |

---

## 4. Blocked State Messaging Patterns

When a business rule prevents action, the messaging follows this consistent pattern:

### 4.1 Template

```
┌─────────────────────────────────┐
│ 🔒 [Blocked State Label]        │
│                                 │
│ [Explanation of why]            │
│ [What needs to happen]          │
│ [Who can resolve it]            │
└─────────────────────────────────┘
```

### 4.2 Blocked State Messages

| Blocked State | Label | Explanation | Resolution | Visual Placement |
|--------------|-------|-------------|------------|-----------------|
| EWB_PENDING | "Awaiting E-Way Bill" | "E-Way Bill is being generated. Departure will be available once the EWB is ready." | "Contact dispatch if delayed." | Inline — replaces CTA area at bottom |
| EWB_EXPIRED | "E-Way Bill Expired" | "The E-Way Bill has expired. The vehicle must halt until it is extended." | "Contact dispatch immediately." | Full-width red banner at top + CTA area replaced |
| Exception Active | "[Exception Type]" | "[Description from exception report]" | "Operations will resolve this. Actions are paused." | Red banner at top. CTA area hidden entirely. |
| Accept Timeout | "Trip Can No Longer Be Accepted" | "The acceptance window has closed (30 minutes from dispatch)." | "Contact dispatch for reassignment." | Inline — Accept button disabled + text below |
| POD_SUBMITTED (read-only) | "Awaiting Verification" | "Your POD has been submitted and is being reviewed by operations." | — | Info banner (blue) below trip card |
| Offline (action attempted) | "You're Offline" | "This action requires an internet connection." | "It has been queued and will sync when you're back online." | Offline banner + snackbar |

### 4.3 Visual Rules for Blocked States

- **Blocked states use inline messaging** — never toasts, never modals (per design philosophy §3)
- Banner color: `color.error` for hard blocks (EWB expired, exception), `color.warning` for soft blocks (EWB pending, accept timeout)
- Banner position: immediately below the top bar, above scrollable content
- CTA area treatment: disabled button (38% opacity) with text underneath OR completely hidden (for exceptions)
- The blocked message includes **who can resolve it** — the driver should never be left without a next step

---

## 5. Evidence / Upload Interaction Patterns

### 5.1 Camera Capture

| Rule | Detail |
|------|--------|
| Entry | Icon button tap within a form field or "Add" action |
| Tab bar | Hidden during camera flow |
| Capture | Opens device camera in full-screen |
| Review | After capture: preview + "Retake" / "Use Photo" |
| Return | Pops back to the parent form with thumbnail added |
| Multiple | For multi-photo captures (POD, cargo): "Add More" button after review. Counter shows "2 of 2 minimum" |
| Persistence | Photos saved to app-local storage immediately — survives backgrounding |

### 5.2 Signature Capture

| Rule | Detail |
|------|--------|
| Entry | Part of POD flow (Step 2) |
| Canvas | White background, black ink, full-width drawing area (200dp min height) |
| Actions | "Clear" (text, top-right) to reset. "Next" (primary, bottom) to proceed |
| Validation | Canvas must have ink strokes — empty signature blocked with inline error "Signature required" |
| Output | Exported as image file, attached to POD payload |

### 5.3 Document Upload

| Rule | Detail |
|------|--------|
| Source | Camera (take photo) or Gallery (pick existing) or File picker (PDF) |
| Category | Bottom sheet selector before capture/selection: Invoice / Weighbridge / Permit / Cargo Photo / Receipt / Other |
| Progress | Inline on the document list item: progress bar below thumbnail |
| Retry | Failed items show ❌ icon + "Retry" text button on the item |
| Queue | Offline uploads queued with ⏳ indicator. Retried automatically on reconnect. |
| Size limit | Per file: < 10 MB. If exceeded: inline error "File too large. Max size: 10 MB." |

### 5.4 Receipt Photo (Expense)

| Rule | Detail |
|------|--------|
| Entry | Camera icon button next to receipt field in expense form |
| Optional | Receipt photo is not required for any expense category |
| Behavior | Opens camera, returns thumbnail. Saved locally before upload. |
| Independence | Expense record saves even if receipt upload fails (receipt retried independently) |

---

## 6. Offline Interaction Rules

| User Action | Online Behavior | Offline Behavior |
|------------|-----------------|-------------------|
| View trip details | Fresh fetch + display | Cached data + offline banner |
| Milestone transition | API call → success → UI update | Queued locally → pending indicator → sync on reconnect |
| Submit POD | Upload photos + data | Photos saved locally → POD queued → sync on reconnect |
| Log expense | API call | Saved locally → pending indicator |
| Upload document | API upload | Saved locally → queued → auto-retry |
| View documents | Fetch list + thumbnails | Cached list + locally stored thumbnails |
| GPS tracking | Log sent to API | Stored locally → batch-sent on reconnect |
| Report exception | API call | Queued locally → pending indicator |

**Offline visual rules**:
- `OfflineBanner` (full-width, `color.warning`) sticky below top bar
- Queued items show ⏳ icon and "Pending sync" label
- Queued count badge on Action bar: "2 pending"
- When connectivity returns: queued items auto-retry. On success: ⏳ → ✓. On failure: ⏳ → ❌ with "Retry"

---

## 7. Pull-to-Refresh and Data Freshness

| Screen | Pull-to-Refresh | Auto-Refresh |
|--------|----------------|-------------|
| ActiveTripScreen | ✅ | On app foreground (if > 30s since last fetch) |
| TripDetailScreen | ✅ | On return from milestone action |
| Document list | ✅ | After document upload completes |
| Expense list | ✅ | After expense save succeeds |
| Map | ❌ (map has its own refresh) | GPS position updates every 5 min |
