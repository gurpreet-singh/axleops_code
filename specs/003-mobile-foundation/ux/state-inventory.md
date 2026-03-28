# State Inventory — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Design System**: [mobile-design-system.md § State Screens](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md)  
> **Implementation**: [StateScreens.kt](file:///Users/ankit/a/fleetly/axleops_code/mobile/shared/src/commonMain/kotlin/com/axleops/mobile/ui/shared/StateScreens.kt)  
> **Date**: 2026-03-28

---

## 1. Canonical UX States

Every screen in the app exists in one of these states. The foundation defines and implements the shared composable for each. Feature screens consume them via `UiStateHandler`.

### 1.1 Loading

| Property | Specification |
|----------|--------------|
| **Trigger** | Data fetch initiated, response not yet received |
| **Visual** | `SkeletonList` — column of `SkeletonCard` items matching the expected content layout shape. Animated shimmer (0.15–0.35 alpha, 800ms cycle). |
| **Layout** | Skeleton fills the content area. Top bar and tab bar remain interactive. |
| **Duration** | Appears immediately when fetch starts. Transitions to next state via 150ms crossfade. |
| **Rule** | No blank screens. No centered spinners for content areas. Spinners are reserved for action confirmations only (e.g., "Signing in…" button). |
| **Variants** | `SkeletonCard` (single), `SkeletonList(itemCount)` (multiple). Feature screens may define custom skeleton shapes (e.g., single large card for Active Trip). |

**Feature obligation**: Each feature screen SHOULD provide a custom skeleton that matches its loaded layout shape. If no custom skeleton is provided, the default `SkeletonList(4)` is used.

---

### 1.2 Empty

| Property | Specification |
|----------|--------------|
| **Trigger** | Data fetch succeeded, result set is empty |
| **Visual** | Centered vertically: 64dp icon (`Icons.Outlined.Inbox` default) + `type.body` message + optional primary action button below |
| **Message** | Role-contextual. Examples: "No active trip assigned" (Driver Active Trip), "No completed trips yet" (Past Trips), "No earnings data available" (Earnings). |
| **Action** | Optional. Examples: "Pull to refresh" hint (no button), "Refresh" button (if pull-to-refresh is not natural for the context). |
| **Rule** | The empty message must tell the user *why* the screen is empty in language they understand — not "No data" or "0 results". |

**Feature obligation**: Each feature screen MUST define its empty-state message and decide whether an action button is appropriate.

---

### 1.3 Error

| Property | Specification |
|----------|--------------|
| **Trigger** | Data fetch failed (network error, timeout, server error, parse error) |
| **Visual** | Centered vertically: 48dp error icon (`Icons.Outlined.ErrorOutline`, `color.error`) + `type.body` message + "Retry" primary button |
| **Message** | User-friendly. Examples: "Couldn't load your trip. Tap to retry." / "Something went wrong. Please try again." |
| **Technical detail** | Error details (HTTP status, stack trace) are logged via the analytics/logging hook. Never shown to the user. |
| **Retry** | Retry button re-initiates the failed fetch. Loading skeleton reappears during retry. |
| **Persistent error** | After 3 consecutive retries with the same error, add secondary text: "If this continues, check your connection or contact support." |

**Feature obligation**: Each feature screen MUST provide a retry action. Screens with no data dependency may omit the error state (e.g., Settings static sections) — document the omission.

---

### 1.4 Data Loaded (Success)

| Property | Specification |
|----------|--------------|
| **Trigger** | Data fetch succeeded, result set is non-empty |
| **Visual** | Full content rendering per the feature's layout |
| **Transition** | Crossfade from skeleton (150ms) |
| **Pull-to-refresh** | List screens MUST support pull-to-refresh. Summary screens MAY support it. |
| **Rule** | This is the "normal" state. The foundation does not define content layout — that is the feature's job. |

---

### 1.5 Offline

| Property | Specification |
|----------|--------------|
| **Trigger** | Device loses network connectivity (detected by platform connectivity observer) |
| **Visual** | `OfflineBanner` — full-width amber bar (`color.warning` background), sticky below top bar. Contains: wifi-off icon (18dp) + "No internet connection" label + optional "Last updated X min ago" timestamp. |
| **Stale data** | If the screen had previously loaded data, that data remains visible below the banner. No timeout-based clearing. |
| **No stale data** | If the screen has never loaded data (first visit while offline), show `EmptyStateScreen` with wifi-off icon and "No cached data available" message below the banner. |
| **Actions** | Buttons/CTAs that require network MUST be visually disabled (38% opacity) with a tooltip or subtitle: "Requires internet connection". |
| **Timestamp** | "Last updated X min ago" refreshes live (relative time since last successful fetch). |
| **Recovery** | When connectivity returns, banner dismisses (150ms fade). Screen silently re-fetches data. If re-fetch succeeds, content updates. If it fails, ErrorScreen appears. |

**Feature obligation**: Each feature screen that fetches data MUST track `lastUpdatedMs` to power the stale-data timestamp.

---

### 1.6 Blocked

| Property | Specification |
|----------|--------------|
| **Trigger** | A business rule prevents the user from performing an action (e.g., "Cannot depart — E-Way Bill not generated") |
| **Visual** | Inline (not full-screen): 48dp lock icon (`Icons.Outlined.Lock`, `color.on.surface.variant`) + reason text (`type.body`) + optional resolution CTA (`TextButton`). |
| **Placement** | Replaces the blocked action area. The rest of the screen remains interactive. |
| **Resolution** | If a resolution action exists (e.g., "Generate EWB"), the CTA navigates the user to the resolution flow. |
| **Rule** | Blocked state is NOT modal — the user can navigate away freely. It is NOT an error — the data loaded successfully; a business constraint prevents a specific action. |

**Feature obligation**: Feature screens define which actions can be blocked and what the blocking reasons are. The foundation provides the `BlockedHint` composable.

---

## 2. State Transitions

```
          ┌──────────┐
          │ Loading  │
          └────┬─────┘
               │
     ┌─────────┼──────────┐
     ▼         ▼          ▼
┌────────┐ ┌───────┐ ┌─────────┐
│ Empty  │ │Success│ │  Error  │
└────────┘ └───┬───┘ └────┬────┘
               │          │
               │    retry │
               │          ▼
               │    ┌──────────┐
               │    │ Loading  │ (retry cycle)
               │    └──────────┘
               │
     ┌─────────┴──────────┐
     ▼                    ▼
┌─────────┐         ┌─────────┐
│ Offline │         │ Blocked │
│ (overlay│         │(inline) │
│  on any)│         └─────────┘
└─────────┘
```

**Rules**:
- Loading → Success, Empty, or Error are the primary transitions.
- Error → (user taps Retry) → Loading → (re-attempt).
- Offline can overlay any state. When offline lifts, the underlying state resumes (with re-fetch).
- Blocked is an action-level state, not a screen-level state. It coexists with Success.
- All transitions animate via crossfade (150ms) per `motion.fade`.

---

## 3. State Applicability Matrix

Every screen in the app MUST declare which states it handles. This matrix covers **foundation-owned screens**. Feature screens must create their own entry during their spec.

| Screen | Loading | Empty | Error | Success | Offline | Blocked |
|--------|---------|-------|-------|---------|---------|---------|
| **Splash** | — | — | — | — | ✅ (show error + retry) | — |
| **LoginScreen** | ✅ (button spinner) | — | ✅ (inline error) | — | ✅ (inline error) | — |
| **RoleSelectorScreen** | — | — | ✅ (ErrorScreen) | ✅ (role cards) | ✅ (ErrorScreen) | — |
| **UnsupportedRoleScreen** | — | — | — | ✅ (static message) | — | — |
| **SettingsScreen** | ✅ (profile section skeleton) | — [1] | ✅ (profile section error) | ✅ (sections) | ✅ (banner, stale profile) | — |
| **TabPlaceholder** | — | — | — | ✅ ("Coming soon" message) | — | — |

**[1]** Settings has no "empty" state because static sections (App Info, Logout) are always present. Profile section may show an error if profile fetch fails, but the screen itself is never empty.

---

## 4. Mock-vs-Real Visual Indicator

In **QA/debug builds only**, a subtle indicator shows which data source mode is active:

| Element | Specification |
|---------|--------------|
| **Indicator** | Small badge in the top bar trailing area: "🟢 Real" or "🟠 Mock" |
| **Visibility** | QA and development builds only. Not present in production builds at all (code-excluded, not just hidden). |
| **Scope** | Reflects the data source of the currently visible screen's primary data. If a screen uses hybrid mode, show "🔶 Hybrid". |
| **Tap action** | Tapping the badge navigates to the Data Sources section in Settings. |

**UX Rule**: The mock/real distinction MUST NOT be visible to end users. In production, data from mock vs. real sources is architecturally distinct but UX-identical.
