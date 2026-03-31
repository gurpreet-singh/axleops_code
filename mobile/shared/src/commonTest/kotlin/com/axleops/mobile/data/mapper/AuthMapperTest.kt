package com.axleops.mobile.data.mapper

import com.axleops.mobile.data.dto.AuthLoginResponseDto
import com.axleops.mobile.data.dto.AuthUserResponseDto
import com.axleops.mobile.data.dto.RoleInfoDto
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
    fun `AuthUserResponseDto toDomain maps all fields`() {
        val dto = AuthUserResponseDto(
            id = "42",
            fullName = "Raj Kumar",
            firstName = "Raj",
            lastName = "Kumar",
            email = "raj@axleops.com",
            roles = listOf(
                RoleInfoDto(code = "DRIVER", displayName = "Driver", department = "Operations"),
                RoleInfoDto(code = "OPERATIONS_EXECUTIVE", displayName = "Ops Executive", department = "Operations"),
            ),
            tenantId = "1",
        )
        val profile = dto.toDomain()
        assertEquals("42", profile.userId)
        assertEquals("Raj Kumar", profile.displayName)
        assertEquals("raj@axleops.com", profile.email)
        assertEquals(listOf("DRIVER", "OPERATIONS_EXECUTIVE"), profile.roles)
        assertEquals("1", profile.tenantId)
    }

    @Test
    fun `AuthUserResponseDto toDomain falls back to email prefix when names blank`() {
        val dto = AuthUserResponseDto(
            id = "1",
            fullName = null,
            firstName = "",
            lastName = "",
            email = "driver@axleops.com",
        )
        val profile = dto.toDomain()
        assertEquals("driver", profile.displayName)
    }

    @Test
    fun `AuthUserResponseDto toDomain falls back to User when all empty`() {
        val dto = AuthUserResponseDto(
            id = "1",
            fullName = null,
            firstName = "",
            lastName = "",
            email = "",
        )
        val profile = dto.toDomain()
        assertEquals("User", profile.displayName)
    }

    @Test
    fun `AuthUserResponseDto toDomain handles null tenantId`() {
        val dto = AuthUserResponseDto(id = "1", tenantId = null)
        val profile = dto.toDomain()
        assertNull(profile.tenantId)
    }

    @Test
    fun `AuthLoginResponseDto toSession maps session correctly`() {
        val dto = AuthLoginResponseDto(
            token = "role-jwt-xyz",
            user = AuthUserResponseDto(
                id = "42",
                fullName = "Raj Kumar",
                authorities = listOf("TRIP_READ", "TRIP_UPDATE"),
                branchId = "5",
                tenantId = "1",
            ),
        )
        val session = dto.toSession(AppRole.DRIVER)
        assertEquals("42", session.userId)
        assertEquals("Raj Kumar", session.displayName)
        assertEquals(AppRole.DRIVER, session.activeRole)
        assertEquals("role-jwt-xyz", session.jwt)
        assertEquals(listOf("TRIP_READ", "TRIP_UPDATE"), session.authorities)
        assertNull(session.contactId) // Gap G1
        assertEquals("5", session.branchId)
        assertEquals("1", session.tenantId)
    }

    @Test
    fun `AuthLoginResponseDto toSession uses fallback for null fullName`() {
        val dto = AuthLoginResponseDto(
            token = "jwt",
            user = AuthUserResponseDto(
                id = "1",
                fullName = null,
                firstName = "",
                lastName = "",
                email = "",
            ),
        )
        val session = dto.toSession(AppRole.DRIVER)
        assertEquals("User", session.displayName)
    }

    @Test
    fun `AuthLoginResponseDto toSession handles null optional fields`() {
        val dto = AuthLoginResponseDto(
            token = "jwt",
            user = AuthUserResponseDto(
                id = "1",
                branchId = null,
                tenantId = null,
            ),
        )
        val session = dto.toSession(AppRole.DRIVER)
        assertNull(session.contactId)
        assertNull(session.branchId)
        assertNull(session.tenantId)
    }
}
