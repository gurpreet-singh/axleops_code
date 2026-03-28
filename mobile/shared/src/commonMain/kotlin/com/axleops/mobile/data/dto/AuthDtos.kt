package com.axleops.mobile.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * DTO for `POST /auth/login` request body.
 */
@Serializable
data class AuthLoginRequestDto(
    val email: String,
    val password: String,
)

/**
 * DTO for `POST /auth/login` response body.
 */
@Serializable
data class AuthLoginResponseDto(
    val token: String,
)

/**
 * DTO for `GET /auth/me` response body.
 *
 * Maps to the backend's user profile shape. Field names use
 * `@SerialName` to match backend JSON conventions (snake_case).
 */
@Serializable
data class AuthMeResponseDto(
    val id: Long,
    @SerialName("first_name") val firstName: String = "",
    @SerialName("last_name") val lastName: String = "",
    val email: String = "",
    val roles: List<String> = emptyList(),
    @SerialName("tenant_id") val tenantId: Long? = null,
)

/**
 * DTO for `POST /auth/select-role` request body.
 */
@Serializable
data class SelectRoleRequestDto(
    val role: String,
)

/**
 * DTO for `POST /auth/select-role` response body.
 *
 * Contains the role-scoped JWT and session metadata.
 */
@Serializable
data class SelectRoleResponseDto(
    @SerialName("user_id") val userId: Long,
    @SerialName("display_name") val displayName: String = "",
    val token: String,
    val authorities: List<String> = emptyList(),
    @SerialName("contact_id") val contactId: Long? = null,
    @SerialName("branch_id") val branchId: Long? = null,
    @SerialName("tenant_id") val tenantId: Long? = null,
)
