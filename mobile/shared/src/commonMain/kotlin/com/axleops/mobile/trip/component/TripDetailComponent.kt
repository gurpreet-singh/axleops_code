package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TransitionRequest
import com.axleops.mobile.domain.repository.MilestoneRepository
import com.axleops.mobile.domain.repository.TripRepository
import com.axleops.mobile.trip.state.CtaState
import com.axleops.mobile.trip.state.TripStateMachine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

/**
 * Decompose component for the Trip Detail screen.
 *
 * Manages:
 * - Loading trip detail and milestones
 * - Milestone transition submission
 * - CTA state derivation
 * - Scrollable section visibility (info, map, milestones, docs, expenses)
 *
 * Pure Kotlin -- no Compose imports. The Compose layer observes [uiState].
 */
class TripDetailComponent(
    componentContext: ComponentContext,
    private val tripId: Long,
    private val tripRepository: TripRepository,
    private val milestoneRepository: MilestoneRepository,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow<TripDetailUiState>(TripDetailUiState.Loading)

    /** Observable UI state for the Trip Detail screen. */
    val uiState: StateFlow<TripDetailUiState> = _uiState.asStateFlow()

    init {
        loadTripDetail()
    }

    // ── Public Actions ───────────────────────────────────────────────────

    /** Reload the trip detail (pull-to-refresh or retry). */
    fun refresh() {
        loadTripDetail()
    }

    /**
     * Submit a milestone transition.
     *
     * @param event The milestone event name (e.g., "ARRIVE_ORIGIN", "DEPART").
     * @param capturedData Key-value data captured with the transition.
     * @param evidenceIds IDs of evidence files attached.
     */
    fun submitTransition(
        event: String,
        capturedData: Map<String, String> = emptyMap(),
        evidenceIds: List<String> = emptyList(),
    ) {
        val current = (_uiState.value as? TripDetailUiState.Loaded) ?: return
        _uiState.value = current.copy(isTransitioning = true)

        scope.launch {
            try {
                val request = TransitionRequest(
                    event = event,
                    timestamp = Clock.System.now().toString(),
                    capturedData = capturedData,
                    evidenceIds = evidenceIds,
                )
                val updatedTrip = milestoneRepository.transition(tripId, request)
                _uiState.value = TripDetailUiState.Loaded(
                    trip = updatedTrip,
                    ctaState = deriveCtaState(updatedTrip),
                )
            } catch (e: Exception) {
                _uiState.value = current.copy(
                    isTransitioning = false,
                    transitionError = e.message,
                )
            }
        }
    }

    /** Dismiss a transition error message. */
    fun dismissError() {
        val current = (_uiState.value as? TripDetailUiState.Loaded) ?: return
        _uiState.value = current.copy(transitionError = null)
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private fun loadTripDetail() {
        _uiState.value = TripDetailUiState.Loading
        scope.launch {
            try {
                // Fetch trip detail
                val trip = tripRepository.getTrip(tripId)
                    ?: throw IllegalStateException("Trip $tripId not found")

                // Fetch milestones separately (may come from different source)
                val milestones = milestoneRepository.getMilestones(tripId)

                // Fetch full active trip detail (includes all enriched data)
                val activeTrip = tripRepository.getActiveTrip()
                val tripDetail = activeTrip ?: TripDetail(
                    id = trip.id,
                    tripNumber = trip.tripNumber,
                    status = trip.status,
                    originCity = trip.originCity,
                    destinationCity = trip.destinationCity,
                    driverId = trip.driverId,
                    vehicleNumber = trip.vehicleNumber,
                    milestones = milestones,
                )

                val detail = tripDetail.copy(milestones = milestones)

                _uiState.value = TripDetailUiState.Loaded(
                    trip = detail,
                    ctaState = deriveCtaState(detail),
                )
            } catch (e: Exception) {
                _uiState.value = TripDetailUiState.Error(
                    message = e.message ?: "Failed to load trip details",
                )
            }
        }
    }

    private fun deriveCtaState(trip: TripDetail): CtaState {
        val status = trip.status

        if (TripStateMachine.isReadOnly(status) || TripStateMachine.isTerminal(status)) {
            return CtaState.Hidden
        }

        if (TripStateMachine.isBlockedByException(status)) {
            return CtaState.Disabled(
                label = "Action Blocked",
                reason = "${status.driverLabel ?: "Issue"} -- waiting for resolution",
            )
        }

        val action = TripStateMachine.allowedAction(status)
        return if (action != null) {
            CtaState.Enabled(label = action.ctaLabel)
        } else if (TripStateMachine.requiresForm(status)) {
            CtaState.Enabled(label = status.driverLabel ?: "Continue")
        } else {
            CtaState.Hidden
        }
    }
}

/**
 * UI state for the Trip Detail screen.
 */
sealed interface TripDetailUiState {
    /** Loading trip data. */
    data object Loading : TripDetailUiState

    /** Trip data loaded successfully. */
    data class Loaded(
        val trip: TripDetail,
        val ctaState: CtaState = CtaState.Hidden,
        val isTransitioning: Boolean = false,
        val transitionError: String? = null,
    ) : TripDetailUiState

    /** Failed to load trip data. */
    data class Error(val message: String) : TripDetailUiState
}
