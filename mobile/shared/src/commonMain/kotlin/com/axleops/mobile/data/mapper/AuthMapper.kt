package com.axleops.mobile.data.mapper

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.auth.repository.LoginResult
import com.axleops.mobile.auth.repository.UserProfile
import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthMeResponseDto
import com.axleops.mobile.data.dto.SelectRoleResponseDto
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
 * Map auth/me response DTO to domain user profile.
 *
 * Handles:
 * - Empty first/last name → displayName = email prefix
 * - Empty roles list → preserved as-is (handled by role selector)
 */
fun AuthMeResponseDto.toDomain(): UserProfile =
    UserProfile(
        userId = id.toString(),
        displayName = buildDisplayName(firstName, lastName, email),
        email = email,
        roles = roles,
        tenantId = tenantId?.toString(),
    )

/**
 * Map select-role response DTO to domain user session.
 *
 * Handles:
 * - Null contactId/branchId/tenantId → preserved as null
 * - Empty displayName → falls back to "User"
 */
fun SelectRoleResponseDto.toDomain(role: AppRole): UserSession =
    UserSession(
        userId = userId.toString(),
        displayName = displayName.ifBlank { "User" },
        activeRole = role,
        jwt = token,
        authorities = authorities,
        contactId = contactId?.toString(),
        branchId = branchId?.toString(),
        tenantId = tenantId?.toString(),
    )

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
