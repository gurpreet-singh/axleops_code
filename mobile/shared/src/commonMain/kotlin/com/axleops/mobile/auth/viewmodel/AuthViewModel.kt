package com.axleops.mobile.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.axleops.mobile.auth.model.MessageType
import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.auth.repository.AuthRepository
import com.axleops.mobile.auth.repository.LoginResult
import com.axleops.mobile.auth.repository.UserProfile
import com.axleops.mobile.auth.session.SessionPersistence
import com.axleops.mobile.data.ApiError
import com.axleops.mobile.role.model.AppRole
import com.axleops.mobile.role.registry.RoleRegistry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Manages the authentication lifecycle.
 *
 * State machine:
 * ```
 * Unauthenticated → Logging In → (success) → Role Selection → Session Active
 *                  ↘ (failure) → Unauthenticated (with error)
 * Session Active → (logout) → Unauthenticated
 * ```
 *
 * Role resolution rules:
 * 1. Filter user's backend roles to mobile-supported roles via [RoleRegistry]
 * 2. If exactly one supported role → auto-select (skip selector)
 * 3. If multiple supported roles → show role selector
 * 4. If zero supported roles → show unsupported role message
 * 5. "ALL" role → filtered out (not allowed on mobile, per spec)
 *
 * Session persistence (spec FR-050):
 * - Saves full session to [SessionPersistence] after successful role selection
 * - Clears stored session on logout and on 401 force-logout
 */
class AuthViewModel(
    private val authRepository: AuthRepository,
    private val sessionPersistence: SessionPersistence,
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Unauthenticated())
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    init {
        attemptSessionRestore()
    }

    /**
     * Cold-start session restore (spec FR-051).
     *
     * Checks [SessionPersistence] for a stored session:
     * - No stored session → remain Unauthenticated (clean)
     * - Stored session found → enter [AuthState.Restoring], validate via `GET /auth/me`
     *   - 200 OK → [AuthState.Authenticated] (no role re-resolution, per clarification Q2)
     *   - 401 → clear persisted session → [AuthState.Unauthenticated] (clean, no message)
     *   - Network error → [AuthState.Authenticated] (optimistic, per clarification Q1)
     */
    private fun attemptSessionRestore() {
        val storedSession = sessionPersistence.restore() ?: return
        _authState.value = AuthState.Restoring

        viewModelScope.launch {
            try {
                // Validate the stored token is still accepted by backend
                authRepository.getMe(storedSession.jwt)
                // Token is valid — resume with stored session (no role re-resolution)
                _authState.value = AuthState.Authenticated(storedSession)
            } catch (e: ApiError.Unauthorized) {
                // Token expired or revoked — clear and show clean login
                sessionPersistence.clear()
                _authState.value = AuthState.Unauthenticated()
            } catch (_: Exception) {
                // Network error — resume optimistically (per clarification Q1)
                _authState.value = AuthState.Authenticated(storedSession)
            }
        }
    }

    /**
     * Attempt login with email/password.
     */
    fun login(email: String, password: String) {
        _authState.value = AuthState.LoggingIn

        viewModelScope.launch {
            val loginResult = authRepository.login(email, password)
            when (loginResult) {
                is LoginResult.Error -> {
                    _authState.value = AuthState.Unauthenticated(
                        message = loginResult.message,
                        messageType = MessageType.ERROR,
                    )
                }
                is LoginResult.Success -> {
                    resolveRole(loginResult.token)
                }
            }
        }
    }

    /**
     * User selected a role from the role selector.
     */
    fun selectRole(token: String, role: AppRole) {
        _authState.value = AuthState.LoggingIn

        viewModelScope.launch {
            try {
                val session = authRepository.selectRole(token, role)
                sessionPersistence.save(session)
                _authState.value = AuthState.Authenticated(session)
            } catch (e: Exception) {
                _authState.value = AuthState.Unauthenticated(
                    message = "Failed to select role: ${e.message}",
                    messageType = MessageType.ERROR,
                )
            }
        }
    }

    /**
     * Explicit logout — user-initiated from Settings.
     *
     * Clears local session, fires logout API call (best-effort, non-blocking),
     * and transitions to clean Unauthenticated (no message).
     */
    fun logout() {
        val currentState = _authState.value
        sessionPersistence.clear()
        if (currentState is AuthState.Authenticated) {
            viewModelScope.launch {
                authRepository.logout(currentState.session.jwt)
            }
        }
        _authState.value = AuthState.Unauthenticated()
    }

    /**
     * Force logout — triggered by 401 interceptor or session expiry.
     *
     * Clears stored session and shows an info-level message on login screen.
     * Distinct from [logout]: this is system-initiated, not user-initiated.
     *
     * @param message Info message shown on login screen (e.g., "Your session has expired…")
     * @param messageType Semantic type for color rendering (typically [MessageType.INFO])
     */
    fun forceLogout(
        message: String,
        messageType: MessageType = MessageType.INFO,
    ) {
        sessionPersistence.clear()
        _authState.value = AuthState.Unauthenticated(
            message = message,
            messageType = messageType,
        )
    }

    // ── Private ──────────────────────────────────────────────────────────

    /**
     * Resolve role after successful login.
     * Filters to mobile-supported roles, auto-selects if only one.
     */
    private suspend fun resolveRole(token: String) {
        try {
            val profile = authRepository.getMe(token)
            val supportedRoles = profile.roles
                .filter { it != "ALL" }
                .mapNotNull { AppRole.fromBackendValue(it) }
                .filter { RoleRegistry.isSupported(it) }

            when {
                supportedRoles.isEmpty() -> {
                    _authState.value = AuthState.NoSupportedRoles(profile)
                }
                supportedRoles.size == 1 -> {
                    // Auto-select the single supported role
                    val session = authRepository.selectRole(token, supportedRoles.first())
                    sessionPersistence.save(session)
                    _authState.value = AuthState.Authenticated(session)
                }
                else -> {
                    // Multiple roles — user must pick
                    _authState.value = AuthState.RoleSelection(
                        token = token,
                        profile = profile,
                        supportedRoles = supportedRoles,
                    )
                }
            }
        } catch (e: Exception) {
            _authState.value = AuthState.Unauthenticated(
                message = "Failed to resolve user profile: ${e.message}",
                messageType = MessageType.ERROR,
            )
        }
    }
}

/**
 * Authentication state sealed hierarchy.
 *
 * See: spec §Functional Requirements, UX state-inventory.md
 */
sealed interface AuthState {

    /**
     * Not authenticated. May carry a message from a failed attempt or session expiry.
     *
     * @param message Display text (null = fresh/clean login screen)
     * @param messageType Semantic type: [MessageType.ERROR] for user-caused failures,
     *   [MessageType.INFO] for system notices (session expired). Determines color.
     */
    data class Unauthenticated(
        val message: String? = null,
        val messageType: MessageType = MessageType.ERROR,
    ) : AuthState

    /** Login request is in progress. */
    data object LoggingIn : AuthState

    /**
     * Session restore in progress — validating stored token.
     * UI shows splash/brand screen with spinner.
     */
    data object Restoring : AuthState

    /** User has multiple mobile-supported roles — must select one. */
    data class RoleSelection(
        val token: String,
        val profile: UserProfile,
        val supportedRoles: List<AppRole>,
    ) : AuthState

    /** User has no mobile-supported roles. */
    data class NoSupportedRoles(val profile: UserProfile) : AuthState

    /** Fully authenticated with a role-scoped session. */
    data class Authenticated(val session: UserSession) : AuthState
}

