package com.axleops.mobile.navigation.driver

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.navigation.ScreenChild
import com.axleops.mobile.navigation.ScreenConfig
import com.axleops.mobile.trip.component.ActiveTripComponent
import com.axleops.mobile.trip.component.MilestoneActionComponent
import com.axleops.mobile.trip.component.TripDetailComponent
import org.koin.core.context.GlobalContext

/**
 * Driver role screen factory for Decompose navigation.
 *
 * Maps [ScreenConfig] variants to [ScreenChild] instances.
 * This is the pure-Kotlin entry point -- no @Composable code here.
 * The Compose rendering layer pattern-matches on [ScreenChild] to render UI.
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
    is ScreenConfig.TabLanding -> {
        if (config.tabId == "active-trip") {
            val koin = GlobalContext.get()
            val component = ActiveTripComponent(
                componentContext = componentContext,
                getActiveTrip = koin.get(),
                acceptTrip = koin.get(),
                rejectTrip = koin.get(),
                trackingManager = koin.get(),
            )
            ScreenChild.ActiveTrip(component = component)
        } else {
            ScreenChild.Landing(
                tabId = config.tabId,
                tabLabel = config.title,
            )
        }
    }
    is ScreenConfig.Settings -> ScreenChild.Settings
    is ScreenConfig.TripDetail -> {
        val koin = GlobalContext.get()
        val component = TripDetailComponent(
            componentContext = componentContext,
            tripId = config.tripId,
            tripRepository = koin.get(),
            milestoneRepository = koin.get(),
        )
        ScreenChild.TripDetail(tripId = config.tripId, component = component)
    }
    is ScreenConfig.MilestoneAction -> {
        val koin = GlobalContext.get()
        val status = TripStatus.entries.firstOrNull { it.name == config.statusName }
            ?: TripStatus.UNKNOWN
        val component = MilestoneActionComponent(
            componentContext = componentContext,
            tripId = config.tripId,
            event = config.event,
            currentStatus = status,
            transitionMilestone = koin.get(),
            onComplete = { /* Navigation pop handled by caller */ },
        )
        ScreenChild.MilestoneAction(component = component)
    }
}

