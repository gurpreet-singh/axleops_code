package com.axleops.mobile.auth.repository

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.data.ApiError
import com.axleops.mobile.data.dto.AuthLoginRequestDto
import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthMeResponseDto
import com.axleops.mobile.data.dto.SelectRoleRequestDto
import com.axleops.mobile.data.dto.SelectRoleResponseDto
import com.axleops.mobile.data.mapper.toDomain
import com.axleops.mobile.role.model.AppRole
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

/**
 * Real backend-backed implementation of [AuthRepository].
 *
 * Calls the existing AxleOps auth endpoints:
 * - POST /auth/login
 * - GET  /auth/me
 * - POST /auth/select-role
 * - POST /auth/logout
 *
 * Uses DTOs from [com.axleops.mobile.data.dto] and mappers from
 * [com.axleops.mobile.data.mapper] to isolate the domain model
 * from backend JSON shapes. Errors are mapped through [ApiError.from].
 */
class RealAuthRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : AuthRepository {

    override suspend fun login(email: String, password: String): LoginResult {
        return try {
            val response = httpClient.post("$baseUrl/auth/login") {
                contentType(ContentType.Application.Json)
                setBody(AuthLoginRequestDto(email = email, password = password))
            }
            response.body<AuthLoginResponseDto>().toDomain()
        } catch (e: Exception) {
            val apiError = ApiError.from(e)
            LoginResult.Error(message = apiError.message)
        }
    }

    override suspend fun getMe(token: String): UserProfile {
        try {
            val response = httpClient.get("$baseUrl/auth/me") {
                bearerAuth(token)
            }
            return response.body<AuthMeResponseDto>().toDomain()
        } catch (e: Exception) {
            throw ApiError.from(e)
        }
    }

    override suspend fun selectRole(token: String, role: AppRole): UserSession {
        try {
            val response = httpClient.post("$baseUrl/auth/select-role") {
                bearerAuth(token)
                contentType(ContentType.Application.Json)
                setBody(SelectRoleRequestDto(role = role.backendValue))
            }
            return response.body<SelectRoleResponseDto>().toDomain(role)
        } catch (e: Exception) {
            throw ApiError.from(e)
        }
    }

    override suspend fun logout(token: String) {
        try {
            httpClient.post("$baseUrl/auth/logout") {
                bearerAuth(token)
            }
        } catch (_: Exception) {
            // Best-effort logout — always clear local session regardless
        }
    }
}
