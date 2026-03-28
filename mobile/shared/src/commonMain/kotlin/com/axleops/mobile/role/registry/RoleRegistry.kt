package com.axleops.mobile.role.registry

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.History
import androidx.compose.material.icons.outlined.Map
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Route
import androidx.compose.material.icons.outlined.Settings
import com.axleops.mobile.navigation.TabDefinition
import com.axleops.mobile.navigation.driver.driverScreenFactory
import com.axleops.mobile.navigation.opsexec.opsExecScreenFactory
import com.axleops.mobile.role.model.AppRole
import com.axleops.mobile.role.model.RoleConfig

/**
 * Registry of all mobile-supported role configurations.
 *
 * This is the single source of truth for which roles the mobile app supports
 * and what navigation structure each role uses. Adding a new role requires:
 *  1. Adding a [RoleConfig] entry here (with its [screenFactory])
 *  2. Creating the role's screen factory function
 *  3. Zero changes to shared infrastructure ([AuthShell], [AppNavHost], etc.)
 *
 * Roles not registered here are filtered from the role selector
 * and treated as unsupported on mobile.
 */
object RoleRegistry {

    // ── Driver v1 Tabs ───────────────────────────────────────────────────

    private val driverTabs = listOf(
        TabDefinition(
            id = "active-trip",
            label = "Active Trip",
            icon = Icons.Outlined.Route,
        ),
        TabDefinition(
            id = "past-trips",
            label = "Past Trips",
            icon = Icons.Outlined.History,
        ),
        TabDefinition(
            id = "earnings",
            label = "Earnings",
            icon = Icons.Outlined.AccountBalanceWallet,
        ),
        TabDefinition(
            id = "settings",
            label = "Settings",
            icon = Icons.Outlined.Settings,
        ),
    )

    // ── Operations Executive Stub Tabs (v2 placeholder) ────────────────

    private val opsExecTabs = listOf(
        TabDefinition(
            id = "fleet-map",
            label = "Fleet Map",
            icon = Icons.Outlined.Map,
        ),
        TabDefinition(
            id = "trips",
            label = "Trips",
            icon = Icons.Outlined.Route,
        ),
        TabDefinition(
            id = "alerts",
            label = "Alerts",
            icon = Icons.Outlined.Notifications,
        ),
        TabDefinition(
            id = "settings",
            label = "Settings",
            icon = Icons.Outlined.Settings,
        ),
    )

    // ── Role Configurations ──────────────────────────────────────────────

    private val configs: Map<AppRole, RoleConfig> = mapOf(
        AppRole.DRIVER to RoleConfig(
            role = AppRole.DRIVER,
            label = "Driver",
            tabs = driverTabs,
            landingTabId = "active-trip",
            screenFactory = ::driverScreenFactory,
        ),
        AppRole.OPERATIONS_EXECUTIVE to RoleConfig(
            role = AppRole.OPERATIONS_EXECUTIVE,
            label = "Operations Executive",
            tabs = opsExecTabs,
            landingTabId = "fleet-map",
            screenFactory = ::opsExecScreenFactory,
        ),
        // Additional future roles are registered here.
        // Each role provides its own screenFactory — no changes
        // to shared code (AppNavHost, AuthShell) needed.
    )

    // ── Public API ───────────────────────────────────────────────────────

    /**
     * Get the [RoleConfig] for a given [AppRole], or null if the role
     * is not supported on mobile.
     */
    fun getConfig(role: AppRole): RoleConfig? = configs[role]

    /**
     * Returns the set of all mobile-supported [AppRole]s.
     * Used by the role selector to filter backend roles.
     */
    fun supportedRoles(): Set<AppRole> = configs.keys

    /**
     * Check if a given [AppRole] is supported on mobile
     * (i.e., has a registered [RoleConfig]).
     */
    fun isSupported(role: AppRole): Boolean = configs.containsKey(role)
}
