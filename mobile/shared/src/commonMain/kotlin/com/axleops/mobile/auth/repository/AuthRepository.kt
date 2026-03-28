package com.axleops.mobile.auth.repository

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.role.model.AppRole

/**
 * Authentication repository interface.
 *
 * Abstracts the login/logout lifecycle. Implementations:
 * - [RealAuthRepository] — Ktor-backed, calls real backend endpoints
 * - (Future) MockAuthRepository — for offline QA testing
 *
 * Auth endpoints (from backend):
 * - POST /auth/login → JWT
 * - GET  /auth/me → user profile + role list
 * - POST /auth/select-role → role-scoped JWT
 * - POST /auth/logout → invalidate session
 */
interface AuthRepository {

    /**
     * Login with credentials.
     * @return The initial JWT token (pre-role-selection).
     */
    suspend fun login(email: String, password: String): LoginResult

    /**
     * Fetch the authenticated user's profile and available roles.
     * @return User profile including role list.
     */
    suspend fun getMe(token: String): UserProfile

    /**
     * Select a role and receive a role-scoped JWT.
     * @return A [UserSession] with role-scoped token and authorities.
     */
    suspend fun selectRole(token: String, role: AppRole): UserSession

    /**
     * Logout and invalidate the current session.
     */
    suspend fun logout(token: String)
}

/**
 * Result of a login attempt.
 */
sealed interface LoginResult {
    data class Success(val token: String) : LoginResult
    data class Error(val message: String) : LoginResult
}

/**
 * User profile returned by GET /auth/me.
 */
data class UserProfile(
    val userId: String,
    val displayName: String,
    val email: String,
    val roles: List<String>,
    val tenantId: String? = null,
)
