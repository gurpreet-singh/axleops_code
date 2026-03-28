# State Inventory — Design Foundation

**Feature**: 002-design-foundation  
**Date**: 2026-03-28

> This inventory defines the **canonical state patterns** that every screen must implement. Per Constitution Principle VII, no screen may show a blank screen under any condition.

---

## 1. Canonical UI States

### 1.1 State Definitions

| State | Trigger | Visual Pattern | Required? |
|-------|---------|---------------|-----------|
| **Loading** | Data request in flight | Skeleton matching content layout shape. Action buttons: spinner replaces label. | Yes — all data screens |
| **Empty** | Request succeeded, zero results | Centered: icon/illustration (64dp) + contextual message (`type.body`) + optional action button | Yes — all list/data screens |
| **Error** | Request failed (network, server, timeout) | Centered: error icon (48dp, `color.error`) + user-friendly message + "Retry" primary button | Yes — all data screens |
| **Data Loaded** | Request succeeded with results | Full content rendering per screen template | Yes — all screens |
| **Offline** | Device connectivity lost | Persistent `OfflineBanner` below top bar. Previously loaded data stays visible. Mutation buttons disabled with tooltip. | Yes — all authenticated screens |
| **Blocked** | Business rule prevents action | Inline: warning icon + blocking reason + resolution hint. Does not replace content — appears alongside it. | Conditional — trip action screens only |

### 1.2 State Transitions

```
Initial Launch → Loading
                    ├── Success + data    → Data Loaded
                    ├── Success + empty   → Empty
                    └── Failure           → Error
                                              └── Retry tap → Loading (cycle)

Data Loaded ─── connectivity lost ──→ Offline (data remains visible)
                                          └── connectivity restored → Data Loaded (refresh)

Data Loaded ─── pull to refresh ──→ Loading overlay (data stays visible behind skeleton)
```

### 1.3 State Rendering Rules

| Rule | Description |
|------|-------------|
| **No blank screens** | A screen in Loading state must show a skeleton, not empty white space |
| **Skeletons match layout** | Skeleton shape must match the expected content layout (list skeleton for list screens, card skeleton for card screens) |
| **Stale-while-offline** | Previously loaded data remains visible when offline. No automatic clearing. |
| **Retry is always available** | Error state always includes a retry action. No dead-end error screens. |
| **Pull-to-refresh on lists** | All list screens support pull-to-refresh as a manual retry/reload mechanism |
| **Loading overlay, not replacement** | On refresh (pull-to-refresh), existing content stays visible; loading indicator overlays at the top |
| **Offline banner is persistent** | The offline indicator stays until connectivity is restored — it does not auto-dismiss on a timer |
| **Blocked is inline** | Blocked state does not replace the screen — it appears as an inline element near the blocked action |

---

## 2. State Inventory by Screen Type

### 2.1 List Screens (PastTripList, EarningsSummary)

| State | Visual |
|-------|--------|
| Loading | 3–5 card skeletons in list formation |
| Empty | Centered illustration + "No [items] yet" + optional hint |
| Error | Error icon + "Couldn't load [items]" + Retry button |
| Data Loaded | Scrollable card list with filter bar |
| Offline | OfflineBanner + stale list data visible, pull-to-refresh disabled |

### 2.2 Detail Screens (PastTripDetail, TransactionDetail, MilestoneDetail)

| State | Visual |
|-------|--------|
| Loading | Section skeletons matching detail layout |
| Empty | N/A — detail screens always have data (navigated from a list item) |
| Error | Error icon + "Couldn't load details" + Retry |
| Data Loaded | Full section content |
| Offline | OfflineBanner + stale detail data visible |

### 2.3 Action Screens (MilestoneAction, PodCapture, Login)

| State | Visual |
|-------|--------|
| Idle | Form fields enabled, action button enabled |
| Submitting | Form fields disabled, action button shows spinner |
| Error | Error banner at top + fields re-enabled |
| Success | Brief success indicator → auto-navigate to parent |
| Blocked | Inline message near the blocked field/action with reason |

### 2.4 Single-Item Screens (ActiveTrip)

| State | Visual |
|-------|--------|
| Loading | Active trip card skeleton |
| Empty | "No active trip assigned" + illustration + "Pull to refresh" hint |
| Error | Error icon + "Couldn't load trip" + Retry |
| Data Loaded | Active trip card with milestone progress + action buttons |
| Offline | OfflineBanner + stale trip card visible, mutation buttons disabled |
| Blocked | Inline message on blocked action ("Cannot depart — EWB not generated") |

---

## 3. Shared State Components

| Component | Props | Implementation Location |
|-----------|-------|------------------------|
| `LoadingIndicator` | — | `ui/common/` (shared) |
| `SkeletonCard` | `lines: Int` | `ui/common/` |
| `SkeletonList` | `itemCount: Int` | `ui/common/` |
| `EmptyStateScreen` | `icon`, `message`, `actionLabel?`, `onAction?` | `ui/common/` |
| `ErrorStateScreen` | `message`, `onRetry` | `ui/common/` |
| `OfflineBanner` | — (reads connectivity state) | `ui/common/` |
| `BlockedHint` | `reason`, `resolution?` | `ui/common/` |
| `UiStateHandler<T>` | `state: UiState<T>`, `content: @Composable (T) -> Unit` | `ui/common/` |

### `UiState<T>` Sealed Class

```
UiState<T>
├── Loading
├── Empty(message: String, actionLabel: String? = null)
├── Error(message: String, cause: Throwable? = null)
├── Success(data: T)
└── Offline(staleData: T? = null)
```

`UiStateHandler` orchestrates rendering:
- `Loading` → `SkeletonList` or `LoadingIndicator`
- `Empty` → `EmptyStateScreen`
- `Error` → `ErrorStateScreen`
- `Success` → content composable
- `Offline` → `OfflineBanner` + content composable with stale data (if available) or `EmptyStateScreen`

---

## 4. State Justification Omissions

Some screens may justifiably omit certain states. These must be documented:

| Screen | Omitted State | Justification |
|--------|--------------|---------------|
| `LoginScreen` | Empty, Offline | Login is an action screen. Offline login is not supported (requires server round-trip). |
| `SettingsScreen` | Empty, Loading | Settings data comes from local session — always available instantly. |
| `RoleSelectorScreen` | Empty | Only shown when user has 2+ roles — empty case handled upstream. |
| Detail screens navigated from lists | Empty | User always arrives via a list item — data identity is guaranteed. |
