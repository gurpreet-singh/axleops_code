package com.axleops.mobile.navigation.opsexec

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.navigation.ScreenChild
import com.axleops.mobile.navigation.ScreenConfig

/**
 * Operations Executive role screen factory for Decompose navigation.
 *
 * Stub implementation — all screens resolve to placeholder [ScreenChild.Landing].
 * This proves the role-extensible architecture works without modifying
 * any Driver or shared code.
 */

/**
 * Creates [ScreenChild] from [ScreenConfig] for the Operations Executive role.
 */
fun opsExecScreenFactory(
    config: ScreenConfig,
    componentContext: ComponentContext,
): ScreenChild = when (config) {
    is ScreenConfig.TabLanding -> ScreenChild.Landing(
        tabId = config.tabId,
        tabLabel = config.title,
    )
    is ScreenConfig.Settings -> ScreenChild.Settings
    is ScreenConfig.TripDetail -> ScreenChild.Landing(
        tabId = "trip-detail",
        tabLabel = "Trip Details",
    )
    is ScreenConfig.MilestoneAction -> ScreenChild.Landing(
        tabId = "milestone-action",
        tabLabel = "Milestone Action",
    )
}
