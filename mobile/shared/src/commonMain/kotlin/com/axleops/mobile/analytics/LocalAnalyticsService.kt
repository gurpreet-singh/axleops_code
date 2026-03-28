package com.axleops.mobile.analytics

/**
 * Local analytics implementation that logs events to the platform console.
 *
 * - **Android**: Uses `println()` (visible in Logcat under `AxleOps-Analytics` tag)
 * - **iOS**: Uses `println()` (visible in Xcode console / os_log)
 *
 * Intended for development/debug builds. Replace with a real analytics
 * provider (Firebase Analytics, Mixpanel, etc.) in production by swapping
 * the Koin binding in [AnalyticsModule].
 */
class LocalAnalyticsService : AnalyticsService {

    companion object {
        private const val TAG = "AxleOps-Analytics"
    }

    override fun trackScreenView(screenName: String, properties: Map<String, String>) {
        log("SCREEN_VIEW", screenName, properties)
    }

    override fun trackAction(action: String, properties: Map<String, String>) {
        log("ACTION", action, properties)
    }

    override fun trackError(error: String, properties: Map<String, String>) {
        log("ERROR", error, properties)
    }

    override fun trackCustomEvent(eventName: String, properties: Map<String, String>) {
        log("CUSTOM", eventName, properties)
    }

    private fun log(type: String, name: String, properties: Map<String, String>) {
        val propsStr = if (properties.isEmpty()) "" else " | ${properties.entries.joinToString(", ") { "${it.key}=${it.value}" }}"
        println("[$TAG] $type: $name$propsStr")
    }
}
