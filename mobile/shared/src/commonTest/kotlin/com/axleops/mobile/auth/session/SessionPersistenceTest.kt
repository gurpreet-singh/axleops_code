package com.axleops.mobile.auth.session

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.role.model.AppRole
import com.russhwolf.settings.MapSettings
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

/**
 * Unit tests for [SessionPersistence].
 *
 * Uses [MapSettings] (in-memory) from multiplatform-settings-test
 * to avoid platform-specific storage in unit tests.
 */
class SessionPersistenceTest {

    private val settings = MapSettings()
    private val persistence = SessionPersistence(settings)

    private val testSession = UserSession(
        userId = "42",
        displayName = "Raj Kumar",
        activeRole = AppRole.DRIVER,
        jwt = "jwt-test-token-abc",
        authorities = listOf("TRIP_READ", "TRIP_UPDATE"),
        contactId = "100",
        branchId = "5",
        tenantId = "1",
    )

    @Test
    fun `save then restore returns identical session`() {
        persistence.save(testSession)
        val restored = persistence.restore()

        assertNotNull(restored)
        assertEquals(testSession.userId, restored.userId)
        assertEquals(testSession.displayName, restored.displayName)
        assertEquals(testSession.activeRole, restored.activeRole)
        assertEquals(testSession.jwt, restored.jwt)
        assertEquals(testSession.authorities, restored.authorities)
        assertEquals(testSession.contactId, restored.contactId)
        assertEquals(testSession.branchId, restored.branchId)
        assertEquals(testSession.tenantId, restored.tenantId)
    }

    @Test
    fun `restore with no stored data returns null`() {
        val restored = persistence.restore()
        assertNull(restored)
    }

    @Test
    fun `clear removes all keys - restore returns null after clear`() {
        persistence.save(testSession)
        persistence.clear()
        val restored = persistence.restore()
        assertNull(restored)
    }

    @Test
    fun `save with null optional fields restores correctly`() {
        val sessionWithNulls = testSession.copy(
            contactId = null,
            branchId = null,
            tenantId = null,
        )
        persistence.save(sessionWithNulls)
        val restored = persistence.restore()

        assertNotNull(restored)
        assertNull(restored.contactId)
        assertNull(restored.branchId)
        assertNull(restored.tenantId)
    }

    @Test
    fun `partial keys stored returns null - corruption guard`() {
        // Only store some keys — simulates a crash mid-save
        settings.putString("auth_jwt", "some-token")
        settings.putString("auth_user_id", "42")
        // Missing: auth_display_name, auth_active_role, auth_authorities

        val restored = persistence.restore()
        assertNull(restored)
    }

    @Test
    fun `invalid role string returns null`() {
        settings.putString("auth_jwt", "token")
        settings.putString("auth_user_id", "42")
        settings.putString("auth_display_name", "Test")
        settings.putString("auth_active_role", "INVALID_ROLE")
        settings.putString("auth_authorities", "[]")

        val restored = persistence.restore()
        assertNull(restored)
    }

    @Test
    fun `overwrite existing session with new one`() {
        persistence.save(testSession)

        val newSession = testSession.copy(
            userId = "99",
            jwt = "new-jwt-token",
            activeRole = AppRole.OPERATIONS_EXECUTIVE,
        )
        persistence.save(newSession)

        val restored = persistence.restore()
        assertNotNull(restored)
        assertEquals("99", restored.userId)
        assertEquals("new-jwt-token", restored.jwt)
        assertEquals(AppRole.OPERATIONS_EXECUTIVE, restored.activeRole)
    }

    @Test
    fun `malformed authorities JSON falls back to empty list`() {
        settings.putString("auth_jwt", "token")
        settings.putString("auth_user_id", "42")
        settings.putString("auth_display_name", "Test")
        settings.putString("auth_active_role", "DRIVER")
        settings.putString("auth_authorities", "not-valid-json")

        val restored = persistence.restore()
        assertNotNull(restored)
        assertEquals(emptyList<String>(), restored.authorities)
    }
}
