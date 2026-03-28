package com.axleops.mobile.auth.session

import com.axleops.mobile.auth.repository.AuthRepository
import com.axleops.mobile.data.ApiError
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlin.time.Clock
import kotlin.time.ExperimentalTime

/**
 * Manages the authenticated session lifecycle.
 *
 * Tracks foreground/background transitions and triggers silent session
 * re-validation via `GET /auth/me` when the app returns to foreground
 * after ≥ 30 minutes in background.
 *
 * Consumed by [AppNavHost] which observes [sessionExpired] to trigger logout.
 *
 * @param authRepository Used for silent re-validation.
 * @param sessionPersistence Used to clear stored session on detected expiry.
 */
class SessionManager(
    private val authRepository: AuthRepository,
    private val sessionPersistence: SessionPersistence,
) {
    companion object {
        /** Re-validation threshold: 30 minutes in milliseconds. */
        private const val REVALIDATION_THRESHOLD_MS = 30 * 60 * 1000L
    }

    /** Timestamp (epoch ms) when the app last entered background. */
    private var backgroundTimestampMs: Long = 0L

    /** Token to use for re-validation. Set by AppNavHost on authentication. */
    private var currentToken: String? = null

    private val _sessionExpired = MutableStateFlow(false)
    /**
     * Emits true when a silent re-validation discovers an expired session (401).
     * AppNavHost collects this to trigger logout.
     */
    val sessionExpired: StateFlow<Boolean> = _sessionExpired.asStateFlow()

    private val _isRevalidating = MutableStateFlow(false)
    /** True while a silent re-validation is in progress. */
    val isRevalidating: StateFlow<Boolean> = _isRevalidating.asStateFlow()

    /**
     * Set the current session token. Called after successful login + role selection.
     */
    fun setToken(token: String) {
        currentToken = token
        _sessionExpired.value = false
    }

    /**
     * Clear the session. Called on logout.
     */
    fun clearSession() {
        currentToken = null
        backgroundTimestampMs = 0L
        _sessionExpired.value = false
    }

    /**
     * Called when the app enters background.
     * Records the timestamp for later threshold comparison.
     */
    @OptIn(ExperimentalTime::class)
    fun onAppBackgrounded() {
        backgroundTimestampMs = Clock.System.now().toEpochMilliseconds()
    }

    /**
     * Called when the app returns to foreground.
     *
     * If ≥ 30 minutes have passed since backgrounding, triggers a silent
     * `GET /auth/me` re-validation.
     * - 401 (Unauthorized) → clears persisted session, sets [sessionExpired] = true
     * - Network error → does nothing (optimistic, per clarification Q1)
     * - Success → no-op (session is still valid)
     *
     * @return true if session was found expired (caller should await result).
     */
    @OptIn(ExperimentalTime::class)
    suspend fun onAppForegrounded(): Boolean {
        val token = currentToken ?: return false
        val now = Clock.System.now().toEpochMilliseconds()
        val elapsed = now - backgroundTimestampMs

        if (backgroundTimestampMs == 0L || elapsed < REVALIDATION_THRESHOLD_MS) {
            return false
        }

        _isRevalidating.value = true
        return try {
            authRepository.getMe(token)
            // Success — session still valid
            false
        } catch (e: ApiError.Unauthorized) {
            // 401 — session expired or revoked
            sessionPersistence.clear()
            _sessionExpired.value = true
            true
        } catch (_: Exception) {
            // Network error — do nothing, resume optimistically (clarification Q1)
            // Per-request 401 interceptor catches actual expiry on next API call
            false
        } finally {
            _isRevalidating.value = false
        }
    }
}

