package com.axleops.mobile.navigation

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

/**
 * Unit tests for [NavConfig] sealed class serialization.
 *
 * Ensures Decompose state restoration works correctly after process death
 * by verifying round-trip JSON serialization of all navigation configs.
 */
class NavConfigTest {

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    // ── RootConfig ──────────────────────────────────────────────────────

    @Test
    fun `RootConfig Auth serializes and deserializes`() {
        val original: RootConfig = RootConfig.Auth
        val string = json.encodeToString(RootConfig.serializer(), original)
        val restored = json.decodeFromString(RootConfig.serializer(), string)
        assertIs<RootConfig.Auth>(restored)
    }

    @Test
    fun `RootConfig Shell serializes and deserializes`() {
        val original: RootConfig = RootConfig.Shell
        val string = json.encodeToString(RootConfig.serializer(), original)
        val restored = json.decodeFromString(RootConfig.serializer(), string)
        assertIs<RootConfig.Shell>(restored)
    }

    // ── TabConfig ───────────────────────────────────────────────────────

    @Test
    fun `TabConfig round-trips with data`() {
        val original = TabConfig(id = "active-trip", label = "Active Trip")
        val string = json.encodeToString(TabConfig.serializer(), original)
        val restored = json.decodeFromString(TabConfig.serializer(), string)
        assertEquals("active-trip", restored.id)
        assertEquals("Active Trip", restored.label)
    }

    // ── ScreenConfig ────────────────────────────────────────────────────

    @Test
    fun `ScreenConfig TabLanding serializes with tabId and title`() {
        val original: ScreenConfig = ScreenConfig.TabLanding(
            tabId = "history",
            title = "Trip History",
        )
        val string = json.encodeToString(ScreenConfig.serializer(), original)
        val restored = json.decodeFromString(ScreenConfig.serializer(), string)
        assertIs<ScreenConfig.TabLanding>(restored)
        assertEquals("history", restored.tabId)
        assertEquals("Trip History", restored.title)
    }

    @Test
    fun `ScreenConfig Settings serializes as singleton`() {
        val original: ScreenConfig = ScreenConfig.Settings
        val string = json.encodeToString(ScreenConfig.serializer(), original)
        val restored = json.decodeFromString(ScreenConfig.serializer(), string)
        assertIs<ScreenConfig.Settings>(restored)
        assertEquals("Settings", restored.title)
    }

    // ── AuthConfig ──────────────────────────────────────────────────────

    @Test
    fun `AuthConfig Login serializes and deserializes`() {
        val original: AuthConfig = AuthConfig.Login
        val string = json.encodeToString(AuthConfig.serializer(), original)
        val restored = json.decodeFromString(AuthConfig.serializer(), string)
        assertIs<AuthConfig.Login>(restored)
    }

    @Test
    fun `AuthConfig RoleSelector serializes and deserializes`() {
        val original: AuthConfig = AuthConfig.RoleSelector
        val string = json.encodeToString(AuthConfig.serializer(), original)
        val restored = json.decodeFromString(AuthConfig.serializer(), string)
        assertIs<AuthConfig.RoleSelector>(restored)
    }
}
