package com.axleops.mobile.navigation

import androidx.compose.ui.graphics.vector.ImageVector

/**
 * Definition of a single bottom navigation tab.
 *
 * Tabs are configured per-role in [RoleConfig] and rendered
 * by the [AuthShell]'s bottom tab bar. The tab bar is data-driven —
 * adding or removing tabs requires only changing the role's config.
 *
 * @property id Unique identifier for this tab (e.g., "active-trip").
 *   Used as the navigation route key.
 * @property label User-visible tab label (e.g., "Active Trip").
 * @property icon Material icon vector to display in the tab bar.
 * @property badgeEnabled Whether this tab supports a notification badge.
 */
data class TabDefinition(
    val id: String,
    val label: String,
    val icon: ImageVector,
    val badgeEnabled: Boolean = false,
)
