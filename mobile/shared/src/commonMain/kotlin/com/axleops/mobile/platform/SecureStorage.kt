package com.axleops.mobile.platform

/**
 * Secure key-value storage for sensitive data (auth tokens, session info).
 *
 * Platform implementations:
 * - Android: [EncryptedSharedPreferences] (AndroidX Security)
 * - iOS: Keychain Services
 *
 * Foundation-owned. Consumed by:
 * - [AuthRepository] → persist/clear JWT tokens
 * - [SessionManager] → track session timestamps
 */
expect class SecureStorage {

    /**
     * Save a key-value pair securely.
     *
     * @param key The storage key.
     * @param value The value to store. Pass null to delete the key.
     */
    fun save(key: String, value: String?)

    /**
     * Read a value by key.
     *
     * @param key The storage key.
     * @return The stored value, or null if not found.
     */
    fun read(key: String): String?

    /**
     * Delete a value by key.
     *
     * @param key The storage key.
     */
    fun delete(key: String)

    /**
     * Clear all stored values.
     * Used during logout to wipe session data.
     */
    fun clearAll()
}
