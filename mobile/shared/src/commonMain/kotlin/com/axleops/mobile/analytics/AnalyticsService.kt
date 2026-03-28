package com.axleops.mobile.analytics

/**
 * Analytics service interface for tracking user actions, screenviews,
 * and errors throughout the mobile app.
 *
 * Implementations:
 * - [LocalAnalyticsService] — logs to platform console (Logcat / os_log)
 * - Future: Firebase, Mixpanel, or custom backend analytics
 *
 * Injection: Provided via Koin from [AnalyticsModule].
 *
 * Usage:
 * ```kotlin
 * val analytics: AnalyticsService = get()
 * analytics.trackScreenView("TripList")
 * analytics.trackAction("trip_accepted", mapOf("tripId" to "123"))
 * ```
 */
interface AnalyticsService {

    /**
     * Track a screen view event.
     *
     * Called when a user navigates to a new screen.
     *
     * @param screenName The human-readable screen name (e.g., "TripList", "Login").
     * @param properties Optional additional properties (e.g., role, tab).
     */
    fun trackScreenView(screenName: String, properties: Map<String, String> = emptyMap())

    /**
     * Track a user action event.
     *
     * Called when the user performs a discrete action (tap, submit, toggle).
     *
     * @param action The action identifier (e.g., "login_submit", "trip_accepted").
     * @param properties Optional properties providing context.
     */
    fun trackAction(action: String, properties: Map<String, String> = emptyMap())

    /**
     * Track an error event.
     *
     * Called when an error occurs that should be monitored.
     *
     * @param error The error description or type.
     * @param properties Optional properties (e.g., screen, endpoint, HTTP status).
     */
    fun trackError(error: String, properties: Map<String, String> = emptyMap())

    /**
     * Track a custom event not covered by screen/action/error.
     *
     * @param eventName The custom event name.
     * @param properties Optional properties.
     */
    fun trackCustomEvent(eventName: String, properties: Map<String, String> = emptyMap())
}
