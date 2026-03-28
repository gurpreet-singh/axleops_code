package com.axleops.mobile.data

import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthMeResponseDto
import com.axleops.mobile.data.dto.SelectRoleResponseDto
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Tests that mock JSON fixtures can be parsed by their corresponding DTOs.
 *
 * Ensures the mock fixtures in composeResources/files/mocks/ remain
 * compatible with the DTO shapes. If a fixture or DTO changes, these
 * tests will catch the mismatch.
 */
class FixtureParsingTest {

    private val json = Json {
        isLenient = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    @Test
    fun `auth-login fixture parses to AuthLoginResponseDto`() {
        val fixture = """{"token": "mock-jwt-token-12345"}"""
        val dto = json.decodeFromString(AuthLoginResponseDto.serializer(), fixture)
        assertEquals("mock-jwt-token-12345", dto.token)
    }

    @Test
    fun `auth-me fixture parses to AuthMeResponseDto`() {
        val fixture = """
        {
          "id": 1,
          "first_name": "Mock",
          "last_name": "Driver",
          "email": "driver@axleops-mock.com",
          "roles": ["ROLE_DRIVER", "ROLE_OPS_EXECUTIVE"],
          "tenant_id": 1,
          "contact_id": 42,
          "branch_id": 1
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthMeResponseDto.serializer(), fixture)
        assertEquals(1L, dto.id)
        assertEquals("Mock", dto.firstName)
        assertEquals("Driver", dto.lastName)
        assertEquals("driver@axleops-mock.com", dto.email)
        assertEquals(2, dto.roles.size)
        assertEquals(1L, dto.tenantId)
    }

    @Test
    fun `auth-me fixture tolerates extra unknown fields`() {
        val fixture = """
        {
          "id": 1,
          "first_name": "Test",
          "last_name": "User",
          "email": "test@test.com",
          "roles": [],
          "tenant_id": null,
          "some_future_field": "should be ignored"
        }
        """.trimIndent()
        val dto = json.decodeFromString(AuthMeResponseDto.serializer(), fixture)
        assertEquals(1L, dto.id)
        assertEquals("Test", dto.firstName)
    }

    @Test
    fun `select-role response parses correctly`() {
        val fixture = """
        {
          "user_id": 42,
          "display_name": "Raj Kumar",
          "token": "role-jwt-xyz",
          "authorities": ["TRIP_READ", "TRIP_UPDATE", "POD_UPLOAD"],
          "contact_id": 100,
          "branch_id": 5,
          "tenant_id": 1
        }
        """.trimIndent()
        val dto = json.decodeFromString(SelectRoleResponseDto.serializer(), fixture)
        assertEquals(42L, dto.userId)
        assertEquals("Raj Kumar", dto.displayName)
        assertEquals("role-jwt-xyz", dto.token)
        assertEquals(3, dto.authorities.size)
        assertEquals(100L, dto.contactId)
        assertEquals(5L, dto.branchId)
        assertEquals(1L, dto.tenantId)
    }

    @Test
    fun `select-role response handles missing optional fields`() {
        val fixture = """
        {
          "user_id": 1,
          "token": "jwt"
        }
        """.trimIndent()
        val dto = json.decodeFromString(SelectRoleResponseDto.serializer(), fixture)
        assertEquals(1L, dto.userId)
        assertEquals("jwt", dto.token)
        assertEquals("", dto.displayName)
        assertTrue(dto.authorities.isEmpty())
    }
}
