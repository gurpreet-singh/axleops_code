package com.axleops.mobile.auth.session

import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.role.model.AppRole
import com.russhwolf.settings.Settings
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Persists and restores [UserSession] to/from platform key-value storage.
 *
 * Used by [AuthViewModel] to:
 * - **Save** the session after successful login + role selection
 * - **Restore** the session on cold start (app relaunch)
 * - **Clear** the session on logout or 401
 *
 * Storage keys are prefixed with `auth_` to avoid collisions with other
 * features that may use Settings.
 *
 * Corruption guard: [restore] returns null if any required key is missing,
 * ensuring partial writes (e.g., from a crash mid-save) don't produce
 * an invalid session.
 *
 * See: spec FR-050 (persist full session), clarification Q3 (plain Settings for v1)
 */
class SessionPersistence(private val settings: Settings) {

    private companion object {
        const val KEY_JWT = "auth_jwt"
        const val KEY_USER_ID = "auth_user_id"
        const val KEY_DISPLAY_NAME = "auth_display_name"
        const val KEY_ACTIVE_ROLE = "auth_active_role"
        const val KEY_AUTHORITIES = "auth_authorities"
        const val KEY_CONTACT_ID = "auth_contact_id"
        const val KEY_BRANCH_ID = "auth_branch_id"
        const val KEY_TENANT_ID = "auth_tenant_id"
    }

    /**
     * Persist the full session to local Settings storage.
     *
     * Called after successful `POST /auth/select-role`.
     * Overwrites any previously stored session.
     */
    fun save(session: UserSession) {
        settings.putString(KEY_JWT, session.jwt)
        settings.putString(KEY_USER_ID, session.userId)
        settings.putString(KEY_DISPLAY_NAME, session.displayName)
        settings.putString(KEY_ACTIVE_ROLE, session.activeRole.backendValue)
        settings.putString(KEY_AUTHORITIES, Json.encodeToString(session.authorities))
        // Nullable fields: store empty string as sentinel for "not set"
        session.contactId?.let { settings.putString(KEY_CONTACT_ID, it) }
            ?: settings.remove(KEY_CONTACT_ID)
        session.branchId?.let { settings.putString(KEY_BRANCH_ID, it) }
            ?: settings.remove(KEY_BRANCH_ID)
        session.tenantId?.let { settings.putString(KEY_TENANT_ID, it) }
            ?: settings.remove(KEY_TENANT_ID)
    }

    /**
     * Restore a previously persisted session.
     *
     * Returns null if:
     * - No session was ever saved
     * - Any required key is missing (corruption guard)
     * - The stored role value doesn't map to a valid [AppRole]
     *
     * Called on cold start by [AuthViewModel] to determine whether to
     * show the login screen or attempt session re-validation.
     */
    fun restore(): UserSession? {
        val jwt = settings.getStringOrNull(KEY_JWT) ?: return null
        val userId = settings.getStringOrNull(KEY_USER_ID) ?: return null
        val displayName = settings.getStringOrNull(KEY_DISPLAY_NAME) ?: return null
        val activeRoleStr = settings.getStringOrNull(KEY_ACTIVE_ROLE) ?: return null
        val authoritiesJson = settings.getStringOrNull(KEY_AUTHORITIES) ?: return null

        val activeRole = AppRole.fromBackendValue(activeRoleStr) ?: return null

        val authorities: List<String> = try {
            Json.decodeFromString(authoritiesJson)
        } catch (_: Exception) {
            emptyList()
        }

        return UserSession(
            userId = userId,
            displayName = displayName,
            activeRole = activeRole,
            jwt = jwt,
            authorities = authorities,
            contactId = settings.getStringOrNull(KEY_CONTACT_ID),
            branchId = settings.getStringOrNull(KEY_BRANCH_ID),
            tenantId = settings.getStringOrNull(KEY_TENANT_ID),
        )
    }

    /**
     * Remove all persisted session keys.
     *
     * Called on:
     * - Explicit logout (user taps "Sign Out")
     * - 401 response (session expired or revoked)
     * - Failed session restore (token invalid)
     */
    fun clear() {
        settings.remove(KEY_JWT)
        settings.remove(KEY_USER_ID)
        settings.remove(KEY_DISPLAY_NAME)
        settings.remove(KEY_ACTIVE_ROLE)
        settings.remove(KEY_AUTHORITIES)
        settings.remove(KEY_CONTACT_ID)
        settings.remove(KEY_BRANCH_ID)
        settings.remove(KEY_TENANT_ID)
    }
}
