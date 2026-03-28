package com.axleops.mobile.di

import org.koin.core.module.Module

/**
 * Platform-specific Koin DI module.
 *
 * Registers platform services that require platform-specific constructors:
 * - [ConnectivityObserver] — Android needs Context, iOS needs no args
 * - [SecureStorage] — Android needs Context, iOS needs no args
 *
 * Each platform provides its own implementation of this module.
 * Registered in the Koin startup alongside [appModule], [authModule], etc.
 */
expect val platformModule: Module
