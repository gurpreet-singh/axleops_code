package com.axleops.mobile.tracking.model

/**
 * All possible states of the location tracking system.
 *
 * These 7 states represent the full lifecycle of tracking from the driver's
 * perspective. The UI renders different indicators, banners, and notifications
 * based on the current state.
 *
 * State precedence in the Active Trip UI:
 * Exception > EWB-Blocking > Offline > Tracking Warning > Normal
 *
 * Source: spec §5.1, UX tracking-state-inventory.md, plan §5
 */
enum class TrackingState(
    /** Human-readable label for the UI tracking indicator (Layer 1 header). */
    val displayLabel: String,
    /** Whether GPS hardware is actively capturing location data. */
    val isActive: Boolean,
) {
    /**
     * No tracking in progress — trip is not in a transit sub-state,
     * or no active trip exists.
     */
    INACTIVE(
        displayLabel = "GPS Off",
        isActive = false,
    ),

    /**
     * Tracking was requested (trip departed) but permission flow
     * is in progress. Transient state — resolves to ACTIVE, ACTIVE_DEGRADED,
     * or PERMISSION_DENIED.
     */
    AWAITING_PERMISSION(
        displayLabel = "GPS Off",
        isActive = false,
    ),

    /**
     * Tracking is running with full capability — foreground and background
     * permissions are granted, GPS hardware is providing fixes.
     */
    ACTIVE(
        displayLabel = "Tracking",
        isActive = true,
    ),

    /**
     * Tracking is running but with limited capability — background
     * permission was denied, or iOS approximate location is active.
     * Data is still being captured but may have gaps or low accuracy.
     */
    ACTIVE_DEGRADED(
        displayLabel = "Limited GPS",
        isActive = true,
    ),

    /**
     * GPS hardware is not providing fixes. Tracking is still nominally
     * active but no data is being captured. Entered after ≥ 2 consecutive
     * intervals (10 minutes) without a GPS fix.
     */
    SIGNAL_LOST(
        displayLabel = "No Signal",
        isActive = true,
    ),

    /**
     * All location permission was denied by the driver. No tracking
     * is possible. Trip continues without GPS (non-blocking warning).
     */
    PERMISSION_DENIED(
        displayLabel = "No GPS Permission",
        isActive = false,
    ),

    /**
     * Tracking was active and has been stopped — trip reached
     * AT_DESTINATION or later. Terminal state until trip reset.
     */
    STOPPED(
        displayLabel = "Tracking Complete",
        isActive = false,
    ),
    ;

    /** Whether this state should show a warning banner to the driver. */
    val isWarning: Boolean
        get() = this == ACTIVE_DEGRADED || this == SIGNAL_LOST || this == PERMISSION_DENIED

    /** Whether this state represents a tracking-capable (or attempted) mode. */
    val isTrackingAttempted: Boolean
        get() = this != INACTIVE && this != STOPPED
}
