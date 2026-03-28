package com.axleops.mobile.platform

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Android [SecureStorage] using [EncryptedSharedPreferences].
 *
 * Encrypts both keys and values using AES-256 GCM (key encryption)
 * and AES-256 SIV (value encryption) backed by AndroidKeyStore.
 *
 * @param context Application context for creating encrypted preferences.
 */
actual class SecureStorage(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "axleops_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    actual fun save(key: String, value: String?) {
        if (value != null) {
            prefs.edit().putString(key, value).apply()
        } else {
            delete(key)
        }
    }

    actual fun read(key: String): String? {
        return prefs.getString(key, null)
    }

    actual fun delete(key: String) {
        prefs.edit().remove(key).apply()
    }

    actual fun clearAll() {
        prefs.edit().clear().apply()
    }
}
