package com.axleops.mobile.data.mapper

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.auth.repository.LoginResult
import com.axleops.mobile.auth.repository.UserProfile
import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthUserResponseDto
import com.axleops.mobile.role.model.AppRole

/**
 * Mapper functions for Auth DTOs → domain models.
 *
 * Each mapper handles missing/default fields with sensible fallbacks.
 * This layer isolates the domain model from backend JSON shape changes.
 */

/**
 * Map login response DTO to domain login result.
 */
fun AuthLoginResponseDto.toDomain(): LoginResult =
    LoginResult.Success(token = token)

/**
 * Map auth/me response DTO (or embedded user from login response) to domain user profile.
 *
 * Handles:
 * - Empty first/last name → displayName = fullName or email prefix
 * - Roles are RoleInfoDto objects → extract code strings
 * - Empty roles list → preserved as-is (handled by role selector)
 */
fun AuthUserResponseDto.toDomain(): UserProfile =
    UserProfile(
        userId = id,
        displayName = fullName
            ?: buildDisplayName(firstName ?: "", lastName ?: "", email ?: ""),
        email = email ?: "",
        roles = roles.map { it.code },
        tenantId = tenantId,
    )

/**
 * Map auth/me or select-role user response to domain user session.
 *
 * Used after POST /auth/select-role — the response is a LoginResponse
 * with a role-scoped token + user context.
 */
fun AuthLoginResponseDto.toSession(role: AppRole): UserSession {
    val user = user ?: throw IllegalStateException("LoginResponse.user is null")
    return UserSession(
        userId = user.id,
        displayName = user.fullName
            ?: buildDisplayName(user.firstName ?: "", user.lastName ?: "", user.email ?: ""),
        activeRole = role,
        jwt = token,
        authorities = user.authorities,
        contactId = null, // Gap G1 — no contactId in backend yet
        branchId = user.branchId,
        tenantId = user.tenantId,
    )
}

/**
 * Build a user-friendly display name from first/last name components.
 * Falls back to email prefix if both names are blank.
 */
private fun buildDisplayName(firstName: String, lastName: String, email: String): String {
    val full = "$firstName $lastName".trim()
    if (full.isNotBlank()) return full
    // Fallback: use email prefix (before @)
    return email.substringBefore("@").ifBlank { "User" }
}
