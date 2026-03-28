package com.axleops.mobile.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.runtime.Composable

/**
 * AxleOps app theme.
 *
 * Wraps Material3 [MaterialTheme] with AxleOps brand colors,
 * typography, and shape tokens defined in this package:
 * - [AxleLightColorScheme] from Color.kt
 * - [AxleTypography] from Typography.kt
 * - [AxleShapes] defined below
 *
 * All design tokens (spacing, elevation, motion, radius) are accessed
 * through their respective objects ([Spacing], [Elevation], [Motion], [Radius]).
 *
 * @param darkTheme Whether to use dark color scheme. V1 uses light only.
 * @param content The composable content to theme.
 */
@Composable
fun AxleOpsTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    // V1: light theme only. Dark theme deferred per spec.
    val colorScheme = AxleLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AxleTypography,
        shapes = AxleShapes,
        content = content,
    )
}

/**
 * AxleOps shape system using [Radius] tokens.
 */
private val AxleShapes = Shapes(
    small = RoundedCornerShape(Radius.sm),   // 4dp
    medium = RoundedCornerShape(Radius.md),  // 8dp
    large = RoundedCornerShape(Radius.lg),   // 12dp
)
