package com.axleops.mobile.platform

/**
 * Whether the app is running in a debug build.
 *
 * Used to gate visibility of debug features:
 * - Data source toggles in Settings
 * - Mock-vs-real indicator badge in top bar
 * - Verbose analytics logging
 *
 * Platform implementations:
 * - Android: reads `BuildConfig.DEBUG` from the `composeApp` module
 * - iOS: defaults to `true` during development; set `false` for App Store builds
 */
expect val isDebugBuild: Boolean
