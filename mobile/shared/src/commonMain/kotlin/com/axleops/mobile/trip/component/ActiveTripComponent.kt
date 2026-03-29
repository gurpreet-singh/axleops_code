package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.trip.state.CtaState
import com.axleops.mobile.trip.state.TripStateMachine
import com.axleops.mobile.trip.state.TripUiState
import com.axleops.mobile.trip.usecase.AcceptTripUseCase
import com.axleops.mobile.trip.usecase.GetActiveTripUseCase
import com.axleops.mobile.trip.usecase.RejectTripUseCase
import com.axleops.mobile.tracking.TrackingManager
import com.axleops.mobile.tracking.model.TrackingState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Decompose component for the Active Trip tab.
 *
 * Manages:
 * - Loading the driver's active trip
 * - Accept/reject actions on dispatched trips
 * - CTA state derivation from trip status
 * - Error handling and retry
 *
 * Pure Kotlin -- no Compose imports. The Compose layer observes [uiState].
 */
class ActiveTripComponent(
    componentContext: ComponentContext,
    private val getActiveTrip: GetActiveTripUseCase,
    private val acceptTrip: AcceptTripUseCase,
    private val rejectTrip: RejectTripUseCase,
    private val trackingManager: TrackingManager,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow<TripUiState>(TripUiState.Loading)

    /** Observable UI state for the Active Trip screen. */
    val uiState: StateFlow<TripUiState> = _uiState.asStateFlow()

    /** Observable tracking state — delegates to TrackingManager. */
    val trackingState: StateFlow<TrackingState> = trackingManager.trackingState

    init {
        loadActiveTrip()
    }

    // ── Public Actions ───────────────────────────────────────────────────

    /** Reload the active trip (pull-to-refresh or retry after error). */
    fun refresh() {
        loadActiveTrip()
    }

    /** Accept the currently dispatched trip. */
    fun onAccept() {
        val current = currentTrip() ?: return
        performAction {
            val updated = acceptTrip(current.id)
            _uiState.value = TripUiState.Active(
                trip = updated,
                ctaState = deriveCtaState(updated),
            )
        }
    }

    /** Reject the currently dispatched trip with a reason. */
    fun onReject(reason: String) {
        val current = currentTrip() ?: return
        performAction {
            val updated = rejectTrip(current.id, reason)
            _uiState.value = TripUiState.Active(
                trip = updated,
                ctaState = deriveCtaState(updated),
            )
        }
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private fun loadActiveTrip() {
        _uiState.value = TripUiState.Loading
        scope.launch {
            try {
                val trip = getActiveTrip()
                _uiState.value = if (trip != null) {
                    // T039/T041: Auto-start tracking if trip is in a transit state
                    updateTrackingForTrip(trip)
                    TripUiState.Active(
                        trip = trip,
                        ctaState = deriveCtaState(trip),
                    )
                } else {
                    // No active trip — ensure tracking is stopped
                    trackingManager.reset()
                    TripUiState.NoTrip
                }
            } catch (e: Exception) {
                _uiState.value = TripUiState.Error(
                    message = e.message ?: "Failed to load trip",
                )
            }
        }
    }

    private fun performAction(action: suspend () -> Unit) {
        val currentState = _uiState.value as? TripUiState.Active ?: return
        _uiState.value = currentState.copy(isActionInProgress = true)
        scope.launch {
            try {
                action()
            } catch (e: Exception) {
                // Restore previous state with error flag
                _uiState.value = currentState.copy(isActionInProgress = false)
            }
        }
    }

    private fun currentTrip(): TripDetail? =
        (_uiState.value as? TripUiState.Active)?.trip

    /**
     * Derive the CTA state from the current trip status.
     *
     * For DISPATCHED: show Accept (Reject is a secondary action).
     * For other active states: derive from TripStateMachine.allowedAction().
     * For read-only/terminal: hide the CTA.
     */
    private fun deriveCtaState(trip: TripDetail): CtaState {
        val status = trip.status

        // Read-only or terminal -- no CTA
        if (TripStateMachine.isReadOnly(status) || TripStateMachine.isTerminal(status)) {
            return CtaState.Hidden
        }

        // Exception overlay -- CTA disabled with reason
        if (TripStateMachine.isBlockedByException(status)) {
            return CtaState.Disabled(
                label = "Action Blocked",
                reason = "${status.driverLabel ?: "Issue"} -- waiting for operations to resolve",
            )
        }

        // Accept phase -- special two-button UI, primary CTA is Accept
        if (TripStateMachine.isAcceptPhase(status)) {
            return CtaState.Enabled(label = "Accept Trip")
        }

        // Normal milestone progression
        val action = TripStateMachine.allowedAction(status)
        return if (action != null) {
            CtaState.Enabled(label = action.ctaLabel)
        } else {
            // Form-required states (LOADING, UNLOADING) -- use status-specific label
            CtaState.Enabled(label = status.driverLabel ?: "Continue")
        }
    }

    // ── Tracking Lifecycle (T039–T042) ───────────────────────────────────

    /**
     * Update tracking state based on trip status.
     *
     * Covers:
     * - T039: Start tracking on departure (DEPARTED/IN_TRANSIT/AT_CHECKPOINT)
     * - T040: Stop tracking on arrival (AT_DESTINATION and beyond)
     * - T041: Resume tracking on app relaunch if trip is in transit
     * - T042: React to status changes (e.g., exception overlay during transit)
     */
    private fun updateTrackingForTrip(trip: com.axleops.mobile.domain.model.TripDetail) {
        val shouldTrack = TripStateMachine.shouldTrackGps(trip.status)
        val isCurrentlyTracking = trackingManager.currentState.isActive

        when {
            shouldTrack && !isCurrentlyTracking -> {
                // Start or resume tracking
                trackingManager.start(
                    tripId = trip.id,
                    skipPermissionCheck = trackingManager.currentState == TrackingState.STOPPED,
                )
            }
            !shouldTrack && isCurrentlyTracking -> {
                // Stop tracking (arrived or moved to non-transit state)
                trackingManager.stop()
            }
            // else: tracking state matches trip state — no action needed
        }
    }
}
