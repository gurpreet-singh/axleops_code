package com.axleops.mobile.navigation

import com.arkivanov.decompose.ComponentContext

/**
 * Root Decompose component — entry point for the entire app navigation.
 *
 * Manages the top-level auth vs. shell routing. When the user is
 * unauthenticated, no [ShellComponent] exists. When authenticated,
 * creates [ShellComponent] with the role's tab configuration.
 *
 * Pure Kotlin — no Compose, no Android, no iOS imports.
 * The Compose rendering layer ([AppNavHost]) creates this component
 * and observes its state to render the appropriate UI.
 *
 * Unlike other Decompose components, the root does NOT use ChildStack
 * for auth→shell transition because the auth state is owned by
 * [AuthViewModel] (Compose ViewModel), not Decompose. The transition
 * is driven by Compose observing [AuthViewModel.authState].
 *
 * @param componentContext Decompose lifecycle context — typically created
 *   from [DefaultComponentContext] in the platform entry point.
 */
class RootComponent(
    componentContext: ComponentContext,
) : ComponentContext by componentContext {

    private var _shellComponent: ShellComponent? = null

    /**
     * The active shell component, or null if not authenticated.
     * Read by the Compose layer to determine what to render.
     */
    val shellComponent: ShellComponent?
        get() = _shellComponent

    /**
     * Create the authenticated shell with the given tab configuration.
     *
     * Called by the Compose layer when auth state transitions to Authenticated.
     * Creates a new [ShellComponent] with the role's tabs and screen factory.
     *
     * @param tabs Ordered tab configurations from the role's [RoleConfig].
     * @param landingTabIndex Index of the landing tab (0-based).
     * @param screenFactory Factory to create [ScreenChild] from [ScreenConfig].
     */
    fun attachShell(
        tabs: List<TabConfig>,
        landingTabIndex: Int,
        screenFactory: (config: ScreenConfig, componentContext: ComponentContext) -> ScreenChild,
    ) {
        _shellComponent = ShellComponent(
            componentContext = this,
            tabs = tabs,
            landingTabIndex = landingTabIndex,
            screenFactory = screenFactory,
        )
    }

    /**
     * Destroy the shell (on logout / session expiry).
     * The Compose layer will transition back to auth screens.
     */
    fun detachShell() {
        _shellComponent = null
    }

    /**
     * Handle system back press. Delegates to the shell if attached.
     * Returns true if the back press was consumed.
     */
    fun onBackPressed(): Boolean {
        return _shellComponent?.onBackPressed() ?: false
    }
}
