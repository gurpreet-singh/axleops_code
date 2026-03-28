package com.axleops.mobile.platform

import platform.Foundation.NSUserDefaults

/**
 * iOS [SecureStorage] using NSUserDefaults with Keychain upgrade path.
 *
 * NOTE: Full Keychain implementation requires complex cinterop bridging
 * with CFDictionary that varies across Kotlin/Native versions. This uses
 * NSUserDefaults as a pragmatic foundation baseline. Data is sandboxed
 * per app but not hardware-encrypted like Keychain.
 *
 * For production, a Swift-side Keychain helper exposed via @objc should
 * replace this. The interface contract remains identical.
 *
 * Uses a prefix to namespace keys and avoid collisions.
 */
actual class SecureStorage {

    private val defaults = NSUserDefaults(suiteName = "com.axleops.mobile.secure")
    private val keyPrefix = "axleops_"

    actual fun save(key: String, value: String?) {
        if (value != null) {
            defaults.setObject(value, forKey = keyPrefix + key)
        } else {
            delete(key)
        }
    }

    actual fun read(key: String): String? {
        return defaults.stringForKey(keyPrefix + key)
    }

    actual fun delete(key: String) {
        defaults.removeObjectForKey(keyPrefix + key)
    }

    actual fun clearAll() {
        // Remove all keys with our prefix
        val allKeys = defaults.dictionaryRepresentation().keys
        allKeys.filterIsInstance<String>()
            .filter { it.startsWith(keyPrefix) }
            .forEach { defaults.removeObjectForKey(it) }
    }
}
