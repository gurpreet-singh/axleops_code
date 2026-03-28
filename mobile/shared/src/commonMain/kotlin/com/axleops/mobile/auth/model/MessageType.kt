package com.axleops.mobile.auth.model

/**
 * Distinguishes the semantic intent of messages shown on the login screen.
 *
 * Used in [AuthState.Unauthenticated] to let the login screen render
 * auth errors (user-caused) differently from informational notices
 * (system-caused, such as session expiry).
 *
 * - [ERROR]: User-actionable problems (bad credentials, network failure).
 *   Rendered with `color.error` (red).
 * - [INFO]: System notices that are not the user's fault (session expired).
 *   Rendered with `color.tertiary` / info-level color (blue/neutral).
 *
 * See: spec FR-081, UX state-inventory.md §3
 */
enum class MessageType {
    /** Login-related error (invalid credentials, network, etc.) */
    ERROR,

    /** Informational notice (session expired, account-related) */
    INFO,
}
