package com.axleops.mobile.auth.model

import com.axleops.mobile.role.model.AppRole

/**
 * Represents the authenticated user's session state.
 *
 * Created after successful login + role selection. Determines:
 * - Which [RoleConfig] drives the app shell
 * - Which data queries are scoped (e.g., `driverId` for Driver role)
 * - The Bearer token for API requests
 *
 * @property userId Backend user ID.
 * @property displayName User's full name for UI display.
 * @property activeRole The resolved role for this session.
 * @property jwt Role-scoped JWT token from `POST /auth/select-role`.
 * @property authorities List of permission strings from the JWT.
 * @property contactId The linked Contact/driver record ID (nullable —
 *   backend gap G1: no first-class User↔Contact link yet).
 * @property branchId The user's branch ID for branch-scoped queries.
 * @property tenantId The user's tenant ID.
 */
data class UserSession(
    val userId: String,
    val displayName: String,
    val activeRole: AppRole,
    val jwt: String,
    val authorities: List<String> = emptyList(),
    val contactId: String? = null,
    val branchId: String? = null,
    val tenantId: String? = null,
)
