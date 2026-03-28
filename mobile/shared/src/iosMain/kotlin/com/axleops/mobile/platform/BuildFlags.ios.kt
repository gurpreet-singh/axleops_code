package com.axleops.mobile.platform

/**
 * iOS: debug build detection.
 *
 * Defaults to `true` during development.
 * For App Store / TestFlight builds, this should be set to `false`
 * via a Kotlin compiler flag (`-Xopt-in=...`) or a Gradle KMP
 * source-set configuration that provides a release-specific actual.
 *
 * TODO: Switch to a build-variant-aware mechanism for release builds
 *   (e.g., Gradle `buildConfigField` equivalent for iOS via KMP plugin).
 */
actual val isDebugBuild: Boolean = true
