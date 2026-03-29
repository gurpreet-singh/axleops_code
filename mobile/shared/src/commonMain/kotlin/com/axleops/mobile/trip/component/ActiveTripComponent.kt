package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.trip.state.CtaState
import com.axleops.mobile.trip.state.TripStateMachine
import com.axleops.mobile.trip.state.TripUiState
import com.axleops.mobile.trip.usecase.AcceptTripUseCase
import com.axleops.mobile.trip.usecase.GetActiveTripUseCase
import com.axleops.mobile.trip.usecase.RejectTripUseCase
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
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow<TripUiState>(TripUiState.Loading)

    /** Observable UI state for the Active Trip screen. */
    val uiState: StateFlow<TripUiState> = _uiState.asStateFlow()

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
                    TripUiState.Active(
                        trip = trip,
                        ctaState = deriveCtaState(trip),
                    )
                } else {
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
}
