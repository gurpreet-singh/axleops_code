# Design Review: Mobile Role Strategy Implementation

> **Reviewed**: 2026-03-28
> **Scope**: T001–T047 implementation vs spec.md, plan.md, tasks.md
> **Verdict**: **Architecturally sound with 5 actionable findings**

---

## 1. Role Separation

**Rating**: ✅ Strong

| Check | Result |
|-------|--------|
| Driver code isolated in `navigation/driver/` | ✅ |
| OpsExec code isolated in `navigation/opsexec/` | ✅ |
| Adding OpsExec required zero Driver file changes | ✅ |
| Shared infra (AuthShell, LoginScreen, SettingsScreen) is role-agnostic | ✅ |
| `RoleRegistry` is single source of truth for supported roles | ✅ |

**One weakness**:

> [!WARNING]
> **F1: `AppNavHost` contains a role-dispatch `when` block (line 114)**
> ```kotlin
> when (session.activeRole) {
>     AppRole.DRIVER -> DriverTabContent(tabId)
>     AppRole.OPERATIONS_EXECUTIVE -> OpsExecTabContent(tabId)
>     else -> UnsupportedTabContent(tabId)
> }
> ```
> This violates FR-011 ("Adding a new role MUST NOT require changes to… shared infrastructure"). Every new role requires adding a branch here. The plan's pseudocode (line 196–231) specified per-tab `NavGraph` references inside `TabDefinition`, which would make this dispatch automatic.
>
> **Severity**: Medium — works fine for 2–3 roles, becomes a maintenance smell at 4+.
> **Recommended fix**: Add a `contentFactory: @Composable (tabId: String) -> Unit` field to `RoleConfig`, set during registration. `AppNavHost` then calls `roleConfig.contentFactory(tabId)` — zero `when` block needed.

---

## 2. Shared Shell Decisions

**Rating**: ✅ Good, with one gap

| Decision | Spec/Plan | Implementation | Match? |
|----------|-----------|----------------|--------|
| Bottom tab bar from RoleConfig | ✅ D3 | ✅ AuthShell reads `roleConfig.tabs` | ✅ |
| Top bar shows role label | ✅ Plan line 178 | ✅ `TopAppBar(title = roleConfig.label)` | ✅ |
| Settings tab shared across roles | ✅ FR-007 | ✅ Hardcoded `tabId == "settings"` check | ✅ |
| Tab icons from design system | ✅ Plan: `IconResource` | ❌ Emoji text fallback | ⚠️ |

> [!IMPORTANT]
> **F2: Emoji icons are a UX debt item — not a design flaw**
> The plan specified `IconResource` references. The implementation uses emoji strings (`🚛`, `📋`, `💰`) because Material Icons Extended isn't available in KMP commonMain. This is correctly documented in code comments.
>
> **Risk**: Low for v1 (driver-only audience). Must be resolved before any public beta.
> **Recommended fix**: Add a Compose resource-based icon set to `composeResources/` and update `resolveIconEmoji` → `resolveIcon`.

---

## 3. Premature Overdesign

**Rating**: ✅ Appropriate — no significant overdesign

| Item | Concern | Verdict |
|------|---------|---------|
| OpsExec stub in RoleRegistry | Is this premature? | **No** — spec US3 explicitly requires validating extensibility with a stub role. This is spec-mandated. |
| `TripFilter.branchId` field | Driver doesn't use it | **Acceptable** — plan line 300–304 specifies this exact field. Adding it later would be a model migration. |
| `EarningsRepository` interface | Only mock impl exists | **Acceptable** — plan G6 acknowledges mock-only. The interface enables FR-016 (swap mock→real via DI only). |
| 5 entries in `AppRole` enum | Only 2 have RoleConfigs | **Acceptable** — spec FR-003 requires representing all candidate roles. Unregistered roles are filtered. |
| `DataSourceConfig.ALL_MOCK` | Not used anywhere | **Minor overdesign** — useful for future QA, but dead code today. Harmless. |

---

## 4. Driver-First Strategy Consistency

**Rating**: ✅ Consistent

| Spec Requirement | Implementation | |
|------------------|----------------|-|
| FR-019: Only Driver screens in v1 | ✅ Only `DriverScreens.kt` has real placeholders | ✅ |
| FR-020: No other role's screens | ✅ OpsExec screens are "coming soon" stubs | ✅ |
| FR-021: Role-extensible arch even with 1 role | ✅ Registry, config, data-driven shell all in place | ✅ |
| FR-004: Auto-select when 1 role | ✅ `AuthViewModel.resolveRole()` line 110–113 | ✅ |
| FR-005: Selector without "ALL" | ✅ `filter { it != "ALL" }` at line 102 | ✅ |
| D4: 4 Driver tabs | ✅ Active Trip, Past Trips, Earnings, Settings | ✅ |
| SC-005: All 4 UX states | ⚠️ Screens are placeholders — `EmptyStateScreen` only | Deferred to feature impl |

---

## 5. UX Debt for Future Role Expansion

> [!CAUTION]
> **F3: No navigation framework — state-based routing will break with depth**
>
> The plan (line 16, D9) called for evaluating Voyager or Decompose for navigation. The implementation uses a flat `when(authState)` + `when(tabId)` pattern with no navigation stack. This works for the current single-level tabs but will break when any tab needs:
> - Detail screens (e.g., Trip Detail from Past Trips)
> - Multi-screen flows (e.g., Milestone capture)
> - Back navigation within a tab
>
> **Severity**: High for next feature epic. Must be addressed before Driver Active Trip implementation.

> [!WARNING]
> **F4: `DataSourceConfig` is passed as a static value, not observed reactively**
>
> In `AppNavHost` line 109: `dataSourceConfig = DataSourceConfig.DEFAULT`. The SettingsScreen debug toggles modify nothing — the config isn't stored in a reactive state holder or in Koin's scope. The runtime mock/real toggle (T042, FR-017) is **not functional**.
>
> **Severity**: Medium — debug toggle exists visually but doesn't work.
> **Recommended fix**: Make `DataSourceConfig` a `MutableStateFlow` in a Koin singleton. SettingsScreen writes to it. `DataSourceModule` reads from it at injection time (or use Koin's scoped refresh).

> [!NOTE]
> **F5: `TabDefinition` dropped `navGraph` field from plan**
>
> Plan's `TabDefinition` (line 195–201) included `val navGraph: NavGraph`. Implementation has only `id`, `label`, `iconName`, `badgeEnabled`. This is fine *today* because navigation is flat, but the missing `navGraph` field is the same root cause as F1 and F3 — it's what would have eliminated the role-dispatch `when` block.
>
> **Severity**: Low now, high when nav framework is added. Will need to evolve `TabDefinition` at that point.

---

## Summary of Findings

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| **F1** | `AppNavHost` role-dispatch `when` block | Medium | Add `contentFactory` to `RoleConfig` |
| **F2** | Emoji icons instead of design system icons | Low (v1) | Add icon resources before beta |
| **F3** | No navigation framework (flat routing) | **High** | Must resolve before Driver feature screens |
| **F4** | DataSourceConfig not reactive — debug toggle is inert | Medium | Make it a `MutableStateFlow` in Koin |
| **F5** | `TabDefinition` missing `navGraph` field | Low | Evolve when nav framework is added |

---

## Spec Compliance Matrix

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR-001 Role model maps to nav structure | ✅ | |
| FR-002 Driver only in v1 | ✅ | |
| FR-003 Future roles representable | ✅ | |
| FR-004 Auto-select single role | ✅ | |
| FR-005 Selector without ALL | ✅ | |
| FR-006 Common shell | ✅ | |
| FR-007 Shared areas | ✅ | |
| FR-008 Role-specific areas | ✅ | |
| FR-009 Registry-driven nav | ✅ | F1 weakens this slightly |
| FR-010 Adding role: config + screens only | ⚠️ | F1: also need `AppNavHost` change |
| FR-011 No changes to existing code | ⚠️ | F1: `AppNavHost` needs a new `when` branch |
| FR-012 "Coming soon" for stub roles | ✅ | |
| FR-013–FR-018 Data/API strategy | ✅ | F4: runtime toggle non-functional |
| FR-019–FR-021 v1 scope | ✅ | |
| SC-001 Shell render < 2s | Untested | Needs device profiling |
| SC-002 New role < 1 day effort | ✅ | OpsExec proved ~15 min |
| SC-003 Mock→real zero UI diff | ✅ | By design |
| SC-004 QA fixture swap | ✅ | |
| SC-005 All 4 UX states | Deferred | Screens are placeholders |
| SC-006 Unsupported roles graceful | ✅ | |

---

## Recommendation

The architecture is **solid and correctly implements the driver-first, role-extensible strategy**. The five findings are all tractable:

- **F1 + F5** are best resolved together when the navigation framework (F3) is introduced
- **F3** is the highest priority — must be resolved before the next feature epic (Driver Active Trip)
- **F4** is a quick fix (1–2 hours)
- **F2** is cosmetic and can wait for the design system icon sprint
