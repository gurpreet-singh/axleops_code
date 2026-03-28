package com.axleops.mobile.role.model

/**
 * Mobile app role identifiers.
 *
 * Each value maps directly to the backend role enum string via [backendValue].
 * Only roles with a registered [RoleConfig] in [RoleRegistry] are
 * considered "mobile-supported" — everything else is filtered from
 * the role selector.
 *
 * @property backendValue The exact role string returned by the backend
 *   JWT / auth endpoints. Used for matching during role resolution.
 */
enum class AppRole(val backendValue: String) {
    DRIVER("DRIVER"),
    OPERATIONS_EXECUTIVE("OPERATIONS_EXECUTIVE"),
    WORKSHOP_MANAGER("WORKSHOP_MANAGER"),
    MECHANIC("MECHANIC"),
    BRANCH_MANAGER("BRANCH_MANAGER");

    companion object {
        /** Resolve an [AppRole] from a backend role string, or null if unknown. */
        fun fromBackendValue(value: String): AppRole? =
            entries.firstOrNull { it.backendValue == value }
    }
}
