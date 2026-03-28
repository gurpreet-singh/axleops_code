package com.axleops.mobile.data.mapper

import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthMeResponseDto
import com.axleops.mobile.data.dto.SelectRoleResponseDto
import com.axleops.mobile.auth.repository.LoginResult
import com.axleops.mobile.role.model.AppRole
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull

/**
 * Unit tests for Auth DTO → domain model mappers.
 */
class AuthMapperTest {

    @Test
    fun `AuthLoginResponseDto toDomain returns Success with token`() {
        val dto = AuthLoginResponseDto(token = "jwt-abc-123")
        val result = dto.toDomain()
        assertIs<LoginResult.Success>(result)
        assertEquals("jwt-abc-123", result.token)
    }

    @Test
    fun `AuthMeResponseDto toDomain maps all fields`() {
        val dto = AuthMeResponseDto(
            id = 42,
            firstName = "Raj",
            lastName = "Kumar",
            email = "raj@axleops.com",
            roles = listOf("DRIVER", "OPERATIONS_EXECUTIVE"),
            tenantId = 1,
        )
        val profile = dto.toDomain()
        assertEquals("42", profile.userId)
        assertEquals("Raj Kumar", profile.displayName)
        assertEquals("raj@axleops.com", profile.email)
        assertEquals(2, profile.roles.size)
        assertEquals("1", profile.tenantId)
    }

    @Test
    fun `AuthMeResponseDto toDomain falls back to email prefix when names blank`() {
        val dto = AuthMeResponseDto(
            id = 1,
            firstName = "",
            lastName = "",
            email = "driver@axleops.com",
        )
        val profile = dto.toDomain()
        assertEquals("driver", profile.displayName)
    }

    @Test
    fun `AuthMeResponseDto toDomain falls back to User when all empty`() {
        val dto = AuthMeResponseDto(
            id = 1,
            firstName = "",
            lastName = "",
            email = "",
        )
        val profile = dto.toDomain()
        assertEquals("User", profile.displayName)
    }

    @Test
    fun `AuthMeResponseDto toDomain handles null tenantId`() {
        val dto = AuthMeResponseDto(id = 1, tenantId = null)
        val profile = dto.toDomain()
        assertNull(profile.tenantId)
    }

    @Test
    fun `SelectRoleResponseDto toDomain maps session correctly`() {
        val dto = SelectRoleResponseDto(
            userId = 42,
            displayName = "Raj Kumar",
            token = "role-jwt-xyz",
            authorities = listOf("TRIP_READ", "TRIP_UPDATE"),
            contactId = 100,
            branchId = 5,
            tenantId = 1,
        )
        val session = dto.toDomain(AppRole.DRIVER)
        assertEquals("42", session.userId)
        assertEquals("Raj Kumar", session.displayName)
        assertEquals(AppRole.DRIVER, session.activeRole)
        assertEquals("role-jwt-xyz", session.jwt)
        assertEquals(listOf("TRIP_READ", "TRIP_UPDATE"), session.authorities)
        assertEquals("100", session.contactId)
        assertEquals("5", session.branchId)
        assertEquals("1", session.tenantId)
    }

    @Test
    fun `SelectRoleResponseDto toDomain uses fallback for blank displayName`() {
        val dto = SelectRoleResponseDto(
            userId = 1,
            displayName = "",
            token = "jwt",
        )
        val session = dto.toDomain(AppRole.DRIVER)
        assertEquals("User", session.displayName)
    }

    @Test
    fun `SelectRoleResponseDto toDomain handles null optional fields`() {
        val dto = SelectRoleResponseDto(
            userId = 1,
            token = "jwt",
            contactId = null,
            branchId = null,
            tenantId = null,
        )
        val session = dto.toDomain(AppRole.DRIVER)
        assertNull(session.contactId)
        assertNull(session.branchId)
        assertNull(session.tenantId)
    }
}
