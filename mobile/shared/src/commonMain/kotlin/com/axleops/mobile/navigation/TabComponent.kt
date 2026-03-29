package com.axleops.mobile.navigation

import com.arkivanov.decompose.ComponentContext
import com.arkivanov.decompose.DelicateDecomposeApi
import com.axleops.mobile.trip.component.ActiveTripComponent
import com.axleops.mobile.trip.component.MilestoneActionComponent
import com.axleops.mobile.trip.component.TripDetailComponent
import com.arkivanov.decompose.router.stack.ChildStack
import com.arkivanov.decompose.router.stack.StackNavigation
import com.arkivanov.decompose.router.stack.childStack
import com.arkivanov.decompose.router.stack.pop
import com.arkivanov.decompose.router.stack.popTo
import com.arkivanov.decompose.router.stack.push
import com.arkivanov.decompose.value.Value
import com.arkivanov.decompose.value.operator.map

/**
 * Decompose component for a single bottom navigation tab.
 *
 * Manages an independent [ChildStack] of [ScreenConfig] destinations,
 * enabling push/pop navigation within the tab. Switching tabs does NOT
 * destroy this component — Decompose's [ChildPages] keeps all tab
 * components alive with their full stack state.
 *
 * Pure Kotlin — no Compose, no Android, no iOS imports.
 * The Compose rendering layer ([AuthShell]) observes this component's
 * [childStack] and [title] values to render the UI.
 *
 * @param componentContext Decompose lifecycle and state restoration context.
 * @param tabId Stable tab identifier (e.g., "active-trip", "settings").
 * @param tabLabel User-facing tab name used as the title when on the landing screen.
 * @param screenFactory Factory to create [ScreenChild] instances from [ScreenConfig].
 *   Provided by the role registration so that each role can map configs to its own screens.
 */
class TabComponent(
    componentContext: ComponentContext,
    val tabId: String,
    val tabLabel: String,
    private val screenFactory: (config: ScreenConfig, componentContext: ComponentContext) -> ScreenChild,
) : ComponentContext by componentContext {

    private val navigation = StackNavigation<ScreenConfig>()

    /**
     * The tab's navigation stack. The bottom of the stack is always [ScreenConfig.TabLanding].
     * Feature screens push onto this stack; back pops them off.
     */
    val childStack: Value<ChildStack<ScreenConfig, ScreenChild>> =
        childStack(
            source = navigation,
            serializer = ScreenConfig.serializer(),
            initialConfiguration = ScreenConfig.TabLanding(
                tabId = tabId,
                title = tabLabel,
            ),
            handleBackButton = true,  // Decompose handles system back within this stack
            childFactory = screenFactory,
        )

    /**
     * Current screen title — driven by the active [ScreenConfig.title].
     * Fed to the top bar by [ShellComponent].
     */
    val title: Value<String> = childStack.map { stack ->
        stack.active.configuration.title
    }

    /**
     * Whether the user can navigate back within this tab
     * (i.e., the stack has more than the landing screen).
     */
    val canGoBack: Boolean
        get() = childStack.value.backStack.isNotEmpty()

    // ── Navigation Actions ──────────────────────────────────────────────

    /**
     * Push a new screen onto this tab's stack.
     * Used by feature screens to navigate deeper (e.g., trip list → trip detail).
     */
    fun push(config: ScreenConfig) {
        navigation.push(config)
    }

    /**
     * Pop the current screen and return to the previous one.
     * If already on the landing screen, this is a no-op.
     */
    fun pop() {
        navigation.pop()
    }

    /**
     * Reset the tab to its landing screen, clearing the entire back stack.
     * Called when the user re-taps the already-active tab.
     */
    @OptIn(DelicateDecomposeApi::class)
    fun resetToRoot() {
        navigation.popTo(index = 0)
    }
}

/**
 * A child within a tab's navigation stack.
 *
 * Each variant wraps the screen's content rendering. Feature epics add
 * new variants here. The Compose rendering layer pattern-matches on these
 * to render the appropriate @Composable.
 *
 * Pure Kotlin sealed interface — no Compose imports.
 */
sealed interface ScreenChild {

    /**
     * Placeholder landing screen for a tab.
     * Rendered by foundation. Feature epics replace this with real content
     * by providing their own [ScreenChild] variants.
     */
    data class Landing(
        val tabId: String,
        val tabLabel: String,
    ) : ScreenChild

    /**
     * Settings screen — shared across all roles.
     */
    data object Settings : ScreenChild

    // ── Driver Active Trip Screens ────────────────────────────────────────

    /**
     * Active trip landing -- wraps [ActiveTripComponent] for the active trip tab.
     */
    data class ActiveTrip(
        val component: ActiveTripComponent,
    ) : ScreenChild

    /**
     * Trip detail pushed from active trip or trip list.
     */
    data class TripDetail(
        val tripId: Long,
        val component: TripDetailComponent,
    ) : ScreenChild

    /**
     * Milestone action form -- context-sensitive transition UI.
     */
    data class MilestoneAction(
        val component: MilestoneActionComponent,
    ) : ScreenChild
}
