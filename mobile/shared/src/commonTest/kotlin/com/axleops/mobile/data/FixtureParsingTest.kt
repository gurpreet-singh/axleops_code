package com.axleops.mobile.data

import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthUserResponseDto
import com.axleops.mobile.data.dto.RoleInfoDto
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Tests that JSON payloads matching the backend contract can be parsed
 * by their corresponding DTOs.
 *
 * Ensures the DTOs remain compatible with the actual backend JSON shapes.
 * Field names must match the backend's Jackson camelCase serialization.
 */
class FixtureParsingTest {

    private val json = Json {
        isLenient = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    @Test
    fun `login response parses token and embedded user`() {
        val fixture = """
        {
          "token": "mock-jwt-token-12345",
          "user": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "fullName": "Mock Driver",
            "firstName": "Mock",
            "lastName": "Driver",
            "email": "driver@axleops-mock.com",
            "roles": [
              {"code": "DRIVER", "displayName": "Driver", "department": "Operations"}
            ],
            "authorities": ["TRIP_READ_OWN"],
            "tenantId": "tenant-1"
          }
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthLoginResponseDto.serializer(), fixture)
        assertEquals("mock-jwt-token-12345", dto.token)
        assertEquals("Mock Driver", dto.user?.fullName)
        assertEquals(1, dto.user?.roles?.size)
        assertEquals("DRIVER", dto.user?.roles?.first()?.code)
    }

    @Test
    fun `auth-me response parses AuthUserResponseDto with camelCase fields`() {
        val fixture = """
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "fullName": "Mock Driver",
          "firstName": "Mock",
          "lastName": "Driver",
          "email": "driver@axleops-mock.com",
          "roles": [
            {"code": "DRIVER", "displayName": "Driver", "department": "Operations"},
            {"code": "OPERATIONS_EXECUTIVE", "displayName": "Ops Exec", "department": "Operations"}
          ],
          "authorities": ["TRIP_READ_OWN", "TRIP_UPDATE_STATUS"],
          "tenantId": "tenant-1",
          "branchId": "branch-1",
          "branchName": "HQ",
          "type": "TENANT"
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthUserResponseDto.serializer(), fixture)
        assertEquals("550e8400-e29b-41d4-a716-446655440000", dto.id)
        assertEquals("Mock Driver", dto.fullName)
        assertEquals(2, dto.roles.size)
        assertEquals("DRIVER", dto.roles[0].code)
        assertEquals("OPERATIONS_EXECUTIVE", dto.roles[1].code)
        assertEquals(2, dto.authorities.size)
    }

    @Test
    fun `auth-me response tolerates extra unknown fields`() {
        val fixture = """
        {
          "id": "1",
          "fullName": "Test User",
          "email": "test@test.com",
          "roles": [],
          "tenantId": null,
          "some_future_field": "should be ignored"
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthUserResponseDto.serializer(), fixture)
        assertEquals("1", dto.id)
        assertEquals("Test User", dto.fullName)
    }

    @Test
    fun `select-role response parses as LoginResponse with user`() {
        val fixture = """
        {
          "token": "role-jwt-xyz",
          "user": {
            "id": "42",
            "fullName": "Raj Kumar",
            "email": "raj@axleops.com",
            "roles": [{"code": "DRIVER", "displayName": "Driver"}],
            "authorities": ["TRIP_READ_OWN", "TRIP_UPDATE_STATUS"],
            "branchId": "5",
            "tenantId": "1"
          }
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthLoginResponseDto.serializer(), fixture)
        assertEquals("role-jwt-xyz", dto.token)
        assertEquals("42", dto.user?.id)
        assertEquals("Raj Kumar", dto.user?.fullName)
        assertEquals(2, dto.user?.authorities?.size)
    }

    @Test
    fun `login response handles missing user field`() {
        val fixture = """{"token": "jwt-only"}"""
        val dto = json.decodeFromString(AuthLoginResponseDto.serializer(), fixture)
        assertEquals("jwt-only", dto.token)
        assertEquals(null, dto.user)
    }
}
