package com.axleops.mobile.auth.repository

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.role.model.AppRole
import kotlinx.coroutines.delay

/**
 * Mock implementation of [AuthRepository] for offline QA testing.
 *
 * Returns canned responses with simulated network latency (500ms).
 * Used when [DataSourceConfig.authSource] == [DataSourceMode.MOCK].
 *
 * Simulated behavior:
 * - Login succeeds for any email/password → returns mock JWT
 * - getMe returns a fixed user profile with Driver + Ops Executive roles
 * - selectRole returns a mock session for the requested role
 * - logout is a no-op
 *
 * The mock JWT tokens are clearly prefixed with "mock-" to distinguish
 * from real tokens in debugging.
 */
class MockAuthRepository : AuthRepository {

    companion object {
        private const val SIMULATED_DELAY_MS = 500L
        private const val MOCK_JWT = "mock-jwt-token-12345"
        private const val MOCK_ROLE_JWT = "mock-role-jwt-token-67890"
    }

    override suspend fun login(email: String, password: String): LoginResult {
        delay(SIMULATED_DELAY_MS)
        return LoginResult.Success(token = MOCK_JWT)
    }

    override suspend fun getMe(token: String): UserProfile {
        delay(SIMULATED_DELAY_MS)
        return UserProfile(
            userId = "mock-user-1",
            displayName = "Mock Driver",
            email = "driver@axleops-mock.com",
            roles = listOf("DRIVER", "OPERATIONS_EXECUTIVE"),
            tenantId = "mock-tenant-1",
        )
    }

    override suspend fun selectRole(token: String, role: AppRole): UserSession {
        delay(SIMULATED_DELAY_MS)
        return UserSession(
            userId = "mock-user-1",
            displayName = "Mock Driver",
            activeRole = role,
            jwt = MOCK_ROLE_JWT,
            authorities = when (role) {
                AppRole.DRIVER -> listOf(
                    "TRIP_READ_OWN", "TRIP_UPDATE_STATUS", "VEHICLE_READ_ASSIGNED",
                    "INSPECTION_CREATE_OWN", "INSPECTION_READ_OWN",
                    "SERVICE_CREATE_BREAKDOWN", "REMINDER_READ_OWN",
                )
                AppRole.OPERATIONS_EXECUTIVE -> listOf("TRIP_READ", "TRIP_CREATE", "DISPATCH")
                else -> listOf("READ")
            },
            contactId = "mock-contact-42",
            branchId = "mock-branch-1",
            tenantId = "mock-tenant-1",
        )
    }

    override suspend fun logout(token: String) {
        delay(SIMULATED_DELAY_MS / 2)
        // No-op for mock — just simulates network call
    }
}
