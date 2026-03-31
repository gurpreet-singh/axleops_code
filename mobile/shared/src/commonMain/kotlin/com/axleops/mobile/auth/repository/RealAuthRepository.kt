package com.axleops.mobile.auth.repository

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.data.ApiError
import com.axleops.mobile.data.dto.AuthLoginRequestDto
import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthUserResponseDto
import com.axleops.mobile.data.dto.SelectRoleRequestDto
import com.axleops.mobile.data.mapper.toDomain
import com.axleops.mobile.data.mapper.toSession
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
 * - POST /api/v1/auth/login
 * - GET  /api/v1/auth/me
 * - POST /api/v1/auth/select-role
 * - POST /api/v1/auth/logout
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
            println("[AUTH] login() → POST $baseUrl/auth/login (username=$email)")
            val response = httpClient.post("$baseUrl/auth/login") {
                contentType(ContentType.Application.Json)
                setBody(AuthLoginRequestDto(username = email, password = password))
            }
            val dto = response.body<AuthLoginResponseDto>()
            println("[AUTH] login() → SUCCESS token=${dto.token.take(20)}…")
            dto.toDomain()
        } catch (e: Exception) {
            println("[AUTH] login() → FAILED: ${e::class.simpleName}: ${e.message}")
            e.printStackTrace()
            val apiError = ApiError.from(e)
            LoginResult.Error(message = apiError.message)
        }
    }

    override suspend fun getMe(token: String): UserProfile {
        try {
            val response = httpClient.get("$baseUrl/auth/me") {
                bearerAuth(token)
            }
            return response.body<AuthUserResponseDto>().toDomain()
        } catch (e: Exception) {
            throw ApiError.from(e)
        }
    }

    override suspend fun selectRole(token: String, role: AppRole): UserSession {
        try {
            val response = httpClient.post("$baseUrl/auth/select-role") {
                bearerAuth(token)
                contentType(ContentType.Application.Json)
                setBody(SelectRoleRequestDto(roleCode = role.backendValue))
            }
            return response.body<AuthLoginResponseDto>().toSession(role)
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
