package com.axleops.mobile

import androidx.compose.runtime.Composable
import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.navigation.AppNavHost

/**
 * Root composable for the AxleOps mobile app.
 * Delegates to [AppNavHost] for all navigation and role resolution.
 *
 * @param componentContext Decompose root lifecycle context, created by the platform layer.
 */
@Composable
fun App(componentContext: ComponentContext) {
    AppNavHost(componentContext = componentContext)
}
