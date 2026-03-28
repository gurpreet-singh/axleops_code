# Screen Map — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Date**: 2026-03-28

---

## 1. Foundation-Owned Screens

These screens are **fully owned by the foundation**. Feature epics do not modify them — they compose on top of them.

### 1.1 Pre-Auth Screens

| Screen | Purpose | Entry Point | Exit |
|--------|---------|-------------|------|
| **Splash / Loading** | Brand presence while session is validated | App launch | → Login *or* Shell |
| **LoginScreen** | Email/password auth entry | No valid session | → Shell (after auth + role resolution) |
| **RoleSelectorScreen** | Choose active role (multi-role users only) | After login, if > 1 mobile-supported role | → Shell (selected role) |
| **UnsupportedRoleScreen** | Inform user their role(s) have no mobile support | After login, if 0 mobile-supported roles | → Logout → Login |

### 1.2 Authenticated Shell

| Element | Purpose | Visibility |
|---------|---------|------------|
| **Top Bar** | Screen title, optional trailing actions, offline indicator | Always visible |
| **Content Area** | Hosts the active tab's navigation stack | Always visible |
| **Bottom Tab Bar** | Top-level navigation driven by `RoleConfig` | Visible on tab-level and first-level detail screens. Hidden during immersive flows. |

### 1.3 State Screens (Shared Composables)

These are not standalone navigation destinations. They render *inside* other screens via `UiStateHandler`.

| Component | When Shown | Visual Summary |
|-----------|-----------|----------------|
| **LoadingIndicator** (skeleton) | Data is being fetched | Column of `SkeletonCard` items matching expected layout shape |
| **EmptyStateScreen** | Fetch succeeded, no results | 64dp icon + message + optional action button |
| **ErrorStateScreen** | Fetch failed | 48dp error icon + message + "Retry" button |
| **OfflineBanner** | Device offline | Full-width amber bar with wifi-off icon + "No internet" + stale-data timestamp |
| **BlockedHint** | Business rule prevents action | 48dp lock icon + reason + optional resolution CTA |

### 1.4 Settings Screen (Shared Tab)

| Section | Content | Notes |
|---------|---------|-------|
| **Profile** | Name, phone, branch, license info | Read-only in v1. Data from `GET /auth/me` + contact lookup |
| **Session** | Logout button (with confirmation dialog) | Shared across all roles |
| **App Info** | Version, build number | Static |
| **Data Sources** | Per-feature mock/real toggles | **QA/debug builds only**. Hidden in production. |

### 1.5 Placeholder Screens

| Screen | Purpose | When Shown |
|--------|---------|-----------|
| **ComingSoonScreen** | Placeholder for tabs registered in `RoleConfig` but with no implemented screens | When a role has tabs that are defined but not yet built |
| **TabPlaceholder** | Per-tab landing skeleton with role-contextual "Under construction" message | During foundation before feature epics populate tab content |

---

## 2. Feature Screens (Owned by Later Epics)

The foundation defines the *container* for these screens (tab slot, navigation stack, state handler). The feature epic defines the *content*.

### 2.1 Driver Tabs (Defined by Foundation, Populated by Feature Epics)

| Tab | Landing Screen | Owner Epic | Foundation Provides |
|-----|---------------|------------|---------------------|
| **Active Trip** | Active trip card or empty state | Driver Active Trip | Tab slot, navigation stack, UiStateHandler, skeleton/empty/error patterns |
| **Past Trips** | Trip history list | Driver Past Trips | Tab slot, list-screen template, pull-to-refresh, pagination pattern |
| **Earnings** | Summary cards + transaction list | Driver Earnings | Tab slot, summary-card template, UiStateHandler |
| **Settings** | Profile + logout + app info | Foundation (shared) | Fully owned by foundation |

### 2.2 Future Role Tabs (Not Implemented)

The foundation's `RoleConfig` registry can hold entries for future roles. If a future role's tab has no screen implementation, the **ComingSoonScreen** renders. This is validated architecturally but not shipped to users.

---

## 3. Screen Navigation Tree

```
App
├── Pre-Auth (no tab bar)
│   ├── Splash / Loading
│   ├── LoginScreen
│   ├── RoleSelectorScreen
│   └── UnsupportedRoleScreen
│
└── Authenticated Shell (tab bar visible)
    ├── [Tab 1 — role-defined]
    │   └── Feature content (or TabPlaceholder if not yet built)
    ├── [Tab 2 — role-defined]
    │   └── Feature content (or TabPlaceholder)
    ├── [Tab N — role-defined]
    │   └── Feature content (or TabPlaceholder)
    └── [Settings — always last]
        └── SettingsScreen (foundation-owned)
```

---

## 4. Screen Transition Rules

| Transition | Animation | Duration |
|-----------|-----------|----------|
| Splash → Login | Fade | 150ms |
| Splash → Shell | Fade | 150ms |
| Login → RoleSelector | Slide right | 250ms |
| RoleSelector → Shell | Fade | 150ms |
| Tab switch | Instant (no animation) | 0ms |
| Push (list → detail) | Slide in from right | 250ms |
| Pop (back) | Slide out to right | 250ms |
| Modal open | Fade + scale up | 150ms |
| Modal close | Fade + scale down | 150ms |
| Sheet open | Slide up | 200ms |
| Sheet close | Slide down | 200ms |
| State change (loading → loaded) | Crossfade | 150ms |

All durations and curves reference [design system motion tokens](file:///Users/ankit/a/fleetly/axleops_code/docs/design/mobile-design-system.md).
