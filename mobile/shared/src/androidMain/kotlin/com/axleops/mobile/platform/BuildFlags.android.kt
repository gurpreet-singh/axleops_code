@file:Suppress("EXPECT_ACTUAL_CLASSIFIERS_ARE_IN_BETA_WARNING")

package com.axleops.mobile.platform

/**
 * Android: debug build detection.
 *
 * Uses a runtime assertion-based heuristic that works from any module —
 * `android.os.Debug.isDebuggerConnectable()` is only available in debuggable APKs.
 *
 * Alternative: The `composeApp` module's `BuildConfig.DEBUG` is more reliable,
 * but `shared` doesn't have access to `composeApp`'s BuildConfig.
 * This heuristic aligns with `debuggable = true` in debug builds.
 */
actual val isDebugBuild: Boolean = try {
    // Application.FLAG_DEBUGGABLE is set for debug builds.
    // We use a Class.forName probe to keep this pure Kotlin (no Context required).
    val buildConfigClass = Class.forName("com.axleops.mobile.BuildConfig")
    val debugField = buildConfigClass.getField("DEBUG")
    debugField.getBoolean(null)
} catch (_: Exception) {
    // If BuildConfig is not available (e.g., unit tests), default to true
    true
}
