package com.axleops.mobile.navigation

import kotlinx.serialization.Serializable

/**
 * Decompose navigation configurations — pure Kotlin, no Compose, no Android, no iOS.
 *
 * These sealed hierarchies define the complete navigation state space for the app.
 * Decompose uses them as type-safe route keys for [ChildStack] and [ChildPages].
 *
 * Architecture rules:
 * - All configurations MUST be @Serializable (enables state restoration on process death)
 * - All configurations MUST be pure Kotlin (no Compose, no platform imports)
 * - Feature epics add new variants to [ScreenConfig] — they do NOT create new hierarchies
 *
 * Hierarchy:
 * ```
 * RootConfig   → auth vs. authenticated shell
 * TabConfig    → one entry per tab (ChildPages)
 * ScreenConfig → screens within a tab (ChildStack push/pop)
 * ```
 */

// ── Root-Level Configuration ────────────────────────────────────────────────────

/**
 * Top-level navigation: unauthenticated auth flow vs. authenticated shell.
 *
 * [RootComponent] uses this to decide whether to show the auth flow
 * or the role-scoped shell with tabs.
 */
@Serializable
sealed interface RootConfig {

    /** Auth flow — login and role selection. */
    @Serializable
    data object Auth : RootConfig

    /** Authenticated shell — tab bar with role-scoped content. */
    @Serializable
    data object Shell : RootConfig
}

// ── Tab Configuration ───────────────────────────────────────────────────────────

/**
 * Identifies a single tab within the authenticated shell.
 *
 * [ShellComponent] uses [ChildPages] with a list of [TabConfig] entries
 * — one per tab in the role's navigation bar. The tab's [id] matches
 * [TabDefinition.id] from the role config.
 *
 * @property id Stable identifier (e.g., "active-trip", "settings").
 * @property label User-facing tab name (drives the top bar title on landing).
 */
@Serializable
data class TabConfig(
    val id: String,
    val label: String,
)

// ── Screen Configuration ────────────────────────────────────────────────────────

/**
 * Screens navigable within a single tab's [ChildStack].
 *
 * Each variant represents one screen that can be pushed onto a tab's stack.
 * Feature epics extend this sealed interface with their own screens.
 *
 * Convention:
 * - Every variant has a [title] property (drives the top bar text).
 * - Variants with parameters (IDs, filters) include them as properties.
 * - All variants MUST be @Serializable.
 *
 * Example (added by Driver Active Trip epic):
 * ```
 * @Serializable
 * data class TripDetail(val tripId: String) : ScreenConfig {
 *     override val title = "Trip Detail"
 * }
 * ```
 */
@Serializable
sealed interface ScreenConfig {

    /** User-facing title displayed in the top bar when this screen is active. */
    val title: String

    // ── Foundation Screens ───────────────────────────────────────────────

    /**
     * Default landing screen for a tab.
     *
     * Renders the tab's placeholder or the feature-provided content.
     * Every tab's ChildStack starts with this as the initial configuration.
     */
    @Serializable
    data class TabLanding(
        val tabId: String,
        override val title: String,
    ) : ScreenConfig

    /**
     * Settings screen — shared across all roles.
     * Rendered when the "settings" tab is active.
     */
    @Serializable
    data object Settings : ScreenConfig {
        override val title: String = "Settings"
    }

    // ── Driver Active Trip Screens ────────────────────────────────────────

    /**
     * Trip detail screen showing full lifecycle, milestones, CTA.
     * Pushed from the active trip tab or trip list.
     */
    @Serializable
    data class TripDetail(val tripId: Long) : ScreenConfig {
        override val title: String = "Trip Details"
    }

    /**
     * Milestone action form — pushed from trip detail for form-bearing transitions.
     */
    @Serializable
    data class MilestoneAction(
        val tripId: Long,
        val event: String,
        val statusName: String,
    ) : ScreenConfig {
        override val title: String = "Milestone Action"
    }
}

// ── Auth Flow Configuration ─────────────────────────────────────────────────────

/**
 * Screens within the unauthenticated auth flow.
 *
 * [RootComponent] uses a [ChildStack] of [AuthConfig] to manage
 * the login → role selection flow.
 */
@Serializable
sealed interface AuthConfig {

    /** Login screen. */
    @Serializable
    data object Login : AuthConfig

    /** Role selection screen (shown when user has multiple mobile-supported roles). */
    @Serializable
    data object RoleSelector : AuthConfig
}
