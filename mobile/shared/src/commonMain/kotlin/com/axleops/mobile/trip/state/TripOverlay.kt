package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus

/**
 * Trip overlay — represents exceptional states that overlay the normal trip UI.
 *
 * Overlays have precedence: Exception > Blocked > Offline.
 * Only one overlay is active at a time.
 *
 * Source: UX interaction-rules §4, state-inventory.md §3
 */
sealed interface TripOverlay {

    /** No overlay — normal UI. */
    data object None : TripOverlay

    /**
     * Active exception — red banner, actions disabled.
     *
     * @param type Exception type (e.g., "VEHICLE_BREAKDOWN", "ACCIDENT").
     * @param description Human-readable description.
     * @param reportedAt ISO-8601 timestamp.
     */
    data class Exception(
        val type: String,
        val description: String,
        val reportedAt: String? = null,
    ) : TripOverlay

    /**
     * Trip is blocked — inline message, CTA disabled.
     *
     * @param reason The specific block reason.
     */
    data class Blocked(
        val reason: BlockReason,
    ) : TripOverlay

    /**
     * Device is offline — show connectivity warning.
     *
     * CTA remains visible but submits to offline queue.
     */
    data class Offline(
        val pendingActions: Int = 0,
    ) : TripOverlay
}

/**
 * Derives the active [TripOverlay] from a [TripDetail].
 *
 * Precedence:
 * 1. Active exception (status.isBlockingException) → Exception overlay
 * 2. Block conditions (EWB_PENDING, accept timeout) → Blocked overlay
 * 3. No overlay
 *
 * Offline overlay is managed separately by the connectivity monitor.
 */
fun deriveTripOverlay(trip: TripDetail): TripOverlay {
    val status = trip.status

    // 1. Active exception
    if (TripStateMachine.isBlockedByException(status)) {
        return TripOverlay.Exception(
            type = status.name,
            description = status.driverLabel ?: "Exception reported",
            reportedAt = trip.activeException?.reportedAt,
        )
    }

    // 2. EWB pending block
    if (status == TripStatus.EWB_PENDING) {
        return TripOverlay.Blocked(
            reason = BlockReason.ServerGuard(
                code = "EWB_PENDING",
                message = "E-Way Bill is being processed. You cannot depart until it is approved.",
            ),
        )
    }

    // 3. Accept timeout
    if (TripStateMachine.isAcceptPhase(status)) {
        val now = kotlinx.datetime.Clock.System.now().toEpochMilliseconds()
        if (isAcceptExpired(trip.dispatchedAt, trip.acceptTimeoutMinutes, now)) {
            return TripOverlay.Blocked(
                reason = BlockReason.AcceptTimeout(
                    timeoutMinutes = trip.acceptTimeoutMinutes,
                ),
            )
        }
    }

    // No overlay
    return TripOverlay.None
}
