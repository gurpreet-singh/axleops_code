package com.axleops.mobile.role.model

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.navigation.ScreenChild
import com.axleops.mobile.navigation.ScreenConfig
import com.axleops.mobile.navigation.TabConfig
import com.axleops.mobile.navigation.TabDefinition

/**
 * Configuration for a single mobile-supported role.
 *
 * Defines the navigation structure, display metadata, and landing
 * behavior for a role. Instances are registered in [RoleRegistry]
 * and looked up during role resolution after login.
 *
 * @property role The [AppRole] this config applies to.
 * @property label User-facing role name (e.g., "Driver").
 * @property tabs Ordered list of bottom navigation tabs for this role.
 *   The tab bar renders exactly these tabs in order.
 * @property landingTabId The [TabDefinition.id] of the tab selected
 *   on initial entry after login. Must match one of [tabs].
 * @property tabConfigs Decompose [TabConfig] list derived from [tabs].
 *   Used by [ShellComponent] to create [ChildPages].
 * @property screenFactory Factory to create [ScreenChild] from [ScreenConfig].
 *   Each role provides its own factory mapping configs to role-specific screens.
 *   Pure Kotlin — no Compose imports allowed.
 */
data class RoleConfig(
    val role: AppRole,
    val label: String,
    val tabs: List<TabDefinition>,
    val landingTabId: String,
    val screenFactory: (config: ScreenConfig, componentContext: ComponentContext) -> ScreenChild,
) {
    init {
        require(tabs.isNotEmpty()) { "RoleConfig must have at least one tab" }
        require(tabs.any { it.id == landingTabId }) {
            "landingTabId '$landingTabId' must match one of the tab ids: ${tabs.map { it.id }}"
        }
    }

    /**
     * Decompose-compatible tab configurations derived from [tabs].
     */
    val tabConfigs: List<TabConfig>
        get() = tabs.map { TabConfig(id = it.id, label = it.label) }

    /**
     * Index of the landing tab in [tabs].
     */
    val landingTabIndex: Int
        get() = tabs.indexOfFirst { it.id == landingTabId }.coerceAtLeast(0)
}
