package com.axleops.mobile.data.dto

import kotlinx.serialization.Serializable

/**
 * DTO for `POST /auth/login` request body.
 *
 * Backend field is `username` (maps to email in mobile UI).
 * See: backend LoginRequest.java
 */
@Serializable
data class AuthLoginRequestDto(
    val username: String,
    val password: String,
)

/**
 * DTO for `POST /auth/login` and `POST /auth/select-role` response body.
 *
 * Backend returns `{ token, user: AuthUserResponse }`.
 * See: backend LoginResponse.java
 */
@Serializable
data class AuthLoginResponseDto(
    val token: String,
    val user: AuthUserResponseDto? = null,
)

/**
 * DTO for `GET /auth/me` response body and embedded user in LoginResponse.
 *
 * Maps to the backend's AuthUserResponse.java. Field names are camelCase
 * (Spring Boot default Jackson serialization).
 */
@Serializable
data class AuthUserResponseDto(
    val id: String,
    val fullName: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val tenantId: String? = null,
    val tenantName: String? = null,
    val branchId: String? = null,
    val branchName: String? = null,
    val branchCode: String? = null,
    val branchCount: Int = 0,
    val roles: List<RoleInfoDto> = emptyList(),
    val authorities: List<String> = emptyList(),
    val type: String? = null,
)

/**
 * Role info object embedded in AuthUserResponse.
 *
 * See: backend RoleInfo.java
 */
@Serializable
data class RoleInfoDto(
    val code: String,
    val displayName: String? = null,
    val department: String? = null,
)

/**
 * DTO for `POST /auth/select-role` request body.
 *
 * Backend expects `{ roleCode }`.
 * See: backend SelectRoleRequest.java
 */
@Serializable
data class SelectRoleRequestDto(
    val roleCode: String,
)
