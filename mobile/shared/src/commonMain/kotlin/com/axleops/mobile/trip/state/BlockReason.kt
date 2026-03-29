package com.axleops.mobile.trip.state

/**
 * Reason why a trip is blocked from progressing.
 *
 * Each variant carries context-specific data to render the
 * appropriate inline block message on the UI.
 *
 * Source: UX interaction-rules §4.1, spec FR-051–FR-054
 */
sealed interface BlockReason {

    /** Human-readable message for the block. */
    val message: String

    /**
     * Server-side guard condition prevents progression.
     *
     * Examples: EWB not approved, weight mismatch, documents incomplete.
     *
     * @param code Backend guard code.
     * @param message Human-readable explanation.
     */
    data class ServerGuard(
        val code: String,
        override val message: String,
    ) : BlockReason

    /**
     * Accept timeout expired — trip can no longer be accepted.
     *
     * @param timeoutMinutes The configured accept timeout.
     */
    data class AcceptTimeout(
        val timeoutMinutes: Int = 30,
    ) : BlockReason {
        override val message: String =
            "Accept window expired ($timeoutMinutes min). This trip will be reassigned."
    }

    /**
     * Active exception blocks all milestone progression.
     *
     * @param exceptionType The exception status name.
     * @param description Human-readable description.
     */
    data class ActiveException(
        val exceptionType: String,
        val description: String,
    ) : BlockReason {
        override val message: String =
            "Trip blocked: $description. Contact operations for resolution."
    }

    /**
     * Action requires network but device is offline.
     *
     * Some transitions can be queued; others require immediate connectivity.
     *
     * @param canQueue Whether this action can be queued for later submission.
     */
    data class OfflineRequired(
        val canQueue: Boolean,
    ) : BlockReason {
        override val message: String =
            if (canQueue) "No connection. This action will be submitted when online."
            else "No connection. This action requires network access."
    }
}
