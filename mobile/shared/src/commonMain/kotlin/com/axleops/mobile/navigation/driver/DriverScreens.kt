package com.axleops.mobile.navigation.driver

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.navigation.ScreenChild
import com.axleops.mobile.navigation.ScreenConfig

/**
 * Driver role screen factory for Decompose navigation.
 *
 * Maps [ScreenConfig] variants to [ScreenChild] instances.
 * This is the pure-Kotlin entry point — no @Composable code here.
 * The Compose rendering layer pattern-matches on [ScreenChild] to render UI.
 *
 * Feature epics (Driver Active Trip, Past Trips, Earnings) will add
 * new [ScreenConfig] and [ScreenChild] variants here.
 */

/**
 * Creates [ScreenChild] from [ScreenConfig] for the Driver role.
 *
 * Passed as [RoleConfig.screenFactory] during role registration.
 */
fun driverScreenFactory(
    config: ScreenConfig,
    componentContext: ComponentContext,
): ScreenChild = when (config) {
    is ScreenConfig.TabLanding -> ScreenChild.Landing(
        tabId = config.tabId,
        tabLabel = config.title,
    )
    is ScreenConfig.Settings -> ScreenChild.Settings

    // Feature epics add their screen mappings here:
    // is ScreenConfig.TripDetail -> ScreenChild.TripDetail(...)
}
