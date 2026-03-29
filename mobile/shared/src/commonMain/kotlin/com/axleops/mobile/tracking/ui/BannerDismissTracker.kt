package com.axleops.mobile.tracking.ui

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * FX-002: Tracks banner dismiss state across three scopes.
 *
 * ## Scopes
 * 1. **Per-session** (in-memory) — dismissed banners reappear on app restart.
 *    Used for: permission denied banner.
 * 2. **Per-trip** (keyed by tripId) — dismissed banners persist for the trip
 *    duration but reset for new trips.
 *    Used for: background limited, reduced accuracy, battery optimization banners.
 * 3. **Per-install** (single flag) — dismissed state persists forever.
 *    Used for: pre-prompt shown flag.
 *
 * ## Note on persistence
 * Per-trip and per-install scopes use an in-memory map keyed by
 * banner type + tripId. For full persistence across process death,
 * a platform-specific KV store (SharedPreferences / NSUserDefaults)
 * should back `persistedDismissals`. This implementation provides the
 * correct API and in-memory behavior; the platform persistence layer
 * can be added as a follow-up without changing the interface.
 *
 * Source: OI-002, spec UX status-copy-and-messaging.md §3 (dismiss rules)
 */
class BannerDismissTracker {

    /**
     * Per-session dismissed banners — cleared on app restart.
     * Key: [BannerType] name.
     */
    private val _sessionDismissals = MutableStateFlow<Set<String>>(emptySet())
    val sessionDismissals: StateFlow<Set<String>> = _sessionDismissals.asStateFlow()

    /**
     * Per-trip dismissed banners — keyed by "{bannerType}:{tripId}".
     * Persists across recompositions but not across process death (in-memory).
     */
    private val _tripDismissals = MutableStateFlow<Set<String>>(emptySet())
    val tripDismissals: StateFlow<Set<String>> = _tripDismissals.asStateFlow()

    /**
     * Per-install dismissed flags — permanent across sessions.
     * Key: [BannerType] name.
     */
    private val _installDismissals = MutableStateFlow<Set<String>>(emptySet())
    val installDismissals: StateFlow<Set<String>> = _installDismissals.asStateFlow()

    // ---- Public API ----

    /**
     * Check if a banner has been dismissed in the appropriate scope.
     *
     * @param bannerType The type of banner to check.
     * @param tripId The current trip ID (for per-trip scoped banners).
     * @return true if the banner should be hidden.
     */
    fun isDismissed(bannerType: BannerType, tripId: Long? = null): Boolean {
        return when (bannerType.scope) {
            DismissScope.PER_SESSION -> bannerType.name in _sessionDismissals.value
            DismissScope.PER_TRIP -> {
                val key = "${bannerType.name}:${tripId ?: 0}"
                key in _tripDismissals.value
            }
            DismissScope.PER_INSTALL -> bannerType.name in _installDismissals.value
            DismissScope.NOT_DISMISSIBLE -> false
        }
    }

    /**
     * Dismiss a banner in the appropriate scope.
     *
     * @param bannerType The type of banner being dismissed.
     * @param tripId The current trip ID (for per-trip scoped banners).
     */
    fun dismiss(bannerType: BannerType, tripId: Long? = null) {
        when (bannerType.scope) {
            DismissScope.PER_SESSION -> {
                _sessionDismissals.update { it + bannerType.name }
            }
            DismissScope.PER_TRIP -> {
                val key = "${bannerType.name}:${tripId ?: 0}"
                _tripDismissals.update { it + key }
            }
            DismissScope.PER_INSTALL -> {
                _installDismissals.update { it + bannerType.name }
            }
            DismissScope.NOT_DISMISSIBLE -> {
                // No-op — banner cannot be dismissed
            }
        }
    }

    /**
     * Reset all session-scoped dismissals. Called on new session.
     */
    fun resetSession() {
        _sessionDismissals.value = emptySet()
    }
}

/**
 * Dismiss scope determines how long a dismissed banner stays hidden.
 */
enum class DismissScope {
    /** Reappears on app restart. */
    PER_SESSION,
    /** Stays hidden for the current trip. */
    PER_TRIP,
    /** Stays hidden forever (per install). */
    PER_INSTALL,
    /** Cannot be dismissed — auto-clears based on state. */
    NOT_DISMISSIBLE,
}

/**
 * Banner types with their associated dismiss scopes.
 * Matches the 7 banner variants from status-copy-and-messaging.md §3.
 */
enum class BannerType(val scope: DismissScope) {
    /** §3.1 — Reappears once per app session. */
    PERMISSION_DENIED(DismissScope.PER_SESSION),
    /** §3.2 — Does not reappear for this trip once dismissed. */
    BACKGROUND_LIMITED(DismissScope.PER_TRIP),
    /** §3.3 — Not dismissible — auto-clears when device location enabled. */
    DEVICE_LOCATION_OFF(DismissScope.NOT_DISMISSIBLE),
    /** §3.4 — Does not reappear once dismissed. */
    PERMISSION_REVOKED(DismissScope.PER_SESSION),
    /** §3.5 — Not dismissible — auto-clears when GPS fix acquired. */
    SIGNAL_LOST(DismissScope.NOT_DISMISSIBLE),
    /** §3.6 — Does not reappear for this trip. */
    REDUCED_ACCURACY(DismissScope.PER_TRIP),
    /** §3.7 — Shown once per trip. */
    BATTERY_OPTIMIZATION(DismissScope.PER_TRIP),
    /** §2 — Pre-prompt shown once per install. */
    PRE_PROMPT(DismissScope.PER_INSTALL),
}
