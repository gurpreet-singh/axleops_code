package com.axleops.mobile.ui.shared

/**
 * Sealed interface representing the six canonical screen states.
 *
 * Every screen in the app MUST handle all six states per
 * Constitution Principle VII (Production-Grade Field UX).
 *
 * Usage:
 * ```kotlin
 * val state: UiState<List<Trip>> = UiState.Loading
 *
 * when (state) {
 *     is UiState.Loading    -> SkeletonList()
 *     is UiState.Empty      -> EmptyStateScreen(message = state.message)
 *     is UiState.Error      -> ErrorStateScreen(message = state.message)
 *     is UiState.DataLoaded -> TripList(trips = state.data)
 *     is UiState.Offline    -> OfflineBanner() + stale content
 *     is UiState.Blocked    -> BlockedHint(reason = state.reason)
 * }
 * ```
 */
sealed interface UiState<out T> {

    /** Screen is loading data. Show skeleton layout. */
    data object Loading : UiState<Nothing>

    /**
     * Data loaded but the result set is empty.
     * @param message User-facing empty-state message (role-specific).
     * @param actionLabel Optional CTA label (e.g., "Refresh").
     * @param onAction Optional callback for the CTA button.
     */
    data class Empty(
        val message: String,
        val actionLabel: String? = null,
        val onAction: (() -> Unit)? = null,
    ) : UiState<Nothing>

    /**
     * An error occurred while loading data.
     * @param message User-friendly error description.
     * @param retryCount Number of times the user has retried (drives escalation text at ≥3).
     * @param onRetry Callback to retry the failed operation.
     */
    data class Error(
        val message: String,
        val retryCount: Int = 0,
        val onRetry: (() -> Unit)? = null,
    ) : UiState<Nothing>

    /**
     * Data loaded successfully.
     * @param data The loaded payload.
     */
    data class DataLoaded<T>(val data: T) : UiState<T>

    /**
     * Device is offline. May still have stale data to display.
     *
     * Per clarification Q1: stale data remains visible indefinitely
     * with a "Last updated X min ago" timestamp.
     *
     * @param staleData Previously loaded data (null if never loaded).
     * @param lastUpdatedMs Epoch millis of last successful fetch (null if unknown).
     */
    data class Offline<T>(
        val staleData: T? = null,
        val lastUpdatedMs: Long? = null,
    ) : UiState<T>

    /**
     * Screen is explicitly blocked by a precondition.
     *
     * Examples: missing permissions, profile incomplete, feature disabled.
     *
     * @param reason User-facing explanation of why the screen is blocked.
     * @param resolution Optional action label (e.g., "Complete Profile", "Enable Location").
     * @param onResolve Optional callback for the resolution action.
     */
    data class Blocked(
        val reason: String,
        val resolution: String? = null,
        val onResolve: (() -> Unit)? = null,
    ) : UiState<Nothing>
}
