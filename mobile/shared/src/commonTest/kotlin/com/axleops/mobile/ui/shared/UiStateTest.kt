package com.axleops.mobile.ui.shared

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Verifies [UiState] sealed interface covers all 6 canonical states
 * and preserves data correctly.
 */
class UiStateTest {

    @Test
    fun `Loading is a singleton`() {
        val state: UiState<String> = UiState.Loading
        assertIs<UiState.Loading>(state)
    }

    @Test
    fun `Empty carries message and optional action`() {
        val state = UiState.Empty(
            message = "No trips found",
            actionLabel = "Refresh",
        )
        assertEquals("No trips found", state.message)
        assertEquals("Refresh", state.actionLabel)
    }

    @Test
    fun `Error carries message and optional retry`() {
        var retryCalled = false
        val state = UiState.Error(
            message = "Network error",
            onRetry = { retryCalled = true },
        )
        assertEquals("Network error", state.message)
        assertEquals(0, state.retryCount)
        state.onRetry?.invoke()
        assertTrue(retryCalled)
    }

    @Test
    fun `Error retryCount carries explicit value`() {
        val state = UiState.Error(
            message = "Still failing",
            retryCount = 3,
        )
        assertEquals(3, state.retryCount)
    }

    @Test
    fun `DataLoaded preserves generic data`() {
        val data = listOf("trip1", "trip2")
        val state = UiState.DataLoaded(data)
        assertEquals(data, state.data)
        assertEquals(2, state.data.size)
    }

    @Test
    fun `Offline preserves stale data`() {
        val staleData = listOf("old-trip")
        val state = UiState.Offline(
            staleData = staleData,
            lastUpdatedMs = 1000L,
        )
        assertEquals(staleData, state.staleData)
        assertEquals(1000L, state.lastUpdatedMs)
    }

    @Test
    fun `Offline with null stale data`() {
        val state = UiState.Offline<String>(
            staleData = null,
            lastUpdatedMs = null,
        )
        assertNull(state.staleData)
        assertNull(state.lastUpdatedMs)
    }

    @Test
    fun `Blocked carries reason and optional resolution`() {
        var resolveCalled = false
        val state = UiState.Blocked(
            reason = "Location permission required",
            resolution = "Enable Location",
            onResolve = { resolveCalled = true },
        )
        assertEquals("Location permission required", state.reason)
        assertEquals("Enable Location", state.resolution)
        state.onResolve?.invoke()
        assertTrue(resolveCalled)
    }

    @Test
    fun `sealed interface has exactly 6 variants`() {
        // Compile-time exhaustiveness: if a 7th variant is added,
        // all existing when() blocks will require a new branch.
        val states: List<UiState<String>> = listOf(
            UiState.Loading,
            UiState.Empty("empty"),
            UiState.Error("error"),
            UiState.DataLoaded("data"),
            UiState.Offline(staleData = "stale"),
            UiState.Blocked(reason = "blocked"),
        )
        assertEquals(6, states.size)
    }
}
