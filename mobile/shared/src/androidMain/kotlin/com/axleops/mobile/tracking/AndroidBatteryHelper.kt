package com.axleops.mobile.tracking

import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.net.toUri

/**
 * Android battery and power management helper for tracking resilience.
 *
 * Provides:
 * 1. Battery optimization exemption status and request
 * 2. Battery level reading
 * 3. OEM device manufacturer detection
 *
 * ## Battery Optimization
 * When battery optimizations are enabled for the app, Android aggressively
 * restricts background work including location updates. Requesting exemption
 * via `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` allows the tracking
 * service to run reliably.
 *
 * ## OEM Detection
 * Several manufacturers (Xiaomi, Huawei, Samsung, Oppo, OnePlus, Vivo) have
 * additional background restrictions beyond stock Android. Knowing the
 * manufacturer allows us to show OEM-specific guidance to the driver.
 *
 * Source: spec §9.1 (battery optimization), plan §3
 */
class AndroidBatteryHelper(
    private val context: Context,
) {
    /**
     * Check if the app is exempted from battery optimizations.
     */
    fun isIgnoringBatteryOptimizations(): Boolean {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    /**
     * Request battery optimization exemption.
     * Opens the system dialog asking the user to exempt this app.
     */
    fun requestBatteryOptimizationExemption() {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = "package:${context.packageName}".toUri()
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /**
     * Get the current battery level (0–100).
     */
    fun getBatteryLevel(): Int {
        val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    /**
     * Get the device manufacturer for OEM-specific battery guidance.
     */
    fun getDeviceManufacturer(): String = Build.MANUFACTURER

    /**
     * Whether this device is from an OEM known for aggressive background kill behavior.
     *
     * Covers the top OEMs that have non-standard battery management:
     * - Xiaomi (MIUI)
     * - Huawei (EMUI)
     * - Samsung (One UI)
     * - Oppo (ColorOS)
     * - OnePlus (OxygenOS / ColorOS)
     * - Vivo (Funtouch / OriginOS)
     */
    fun isAggressiveOem(): Boolean {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return manufacturer in setOf(
            "xiaomi", "redmi", "poco",
            "huawei", "honor",
            "samsung",
            "oppo", "realme",
            "oneplus",
            "vivo",
        )
    }

    /**
     * Get OEM-specific guidance text for the user about enabling background activity.
     */
    fun getOemGuidanceText(): String? {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return when {
            manufacturer in setOf("xiaomi", "redmi", "poco") ->
                "Go to Settings → Battery → App Battery Saver → AxleOps → No Restrictions"
            manufacturer in setOf("huawei", "honor") ->
                "Go to Settings → Battery → App Launch → AxleOps → Toggle off Auto-manage"
            manufacturer == "samsung" ->
                "Go to Settings → Battery → Background Usage Limits → Never Sleeping Apps → Add AxleOps"
            manufacturer in setOf("oppo", "realme") ->
                "Go to Settings → Battery → Power Saving → AxleOps → Allow Background Activity"
            manufacturer == "oneplus" ->
                "Go to Settings → Battery → Battery Optimization → AxleOps → Don't Optimize"
            manufacturer == "vivo" ->
                "Go to Settings → Battery → Background Power Consumption → AxleOps → Allow"
            else -> null
        }
    }
}
