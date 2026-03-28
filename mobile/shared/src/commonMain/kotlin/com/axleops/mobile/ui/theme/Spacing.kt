package com.axleops.mobile.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * AxleOps spacing scale.
 *
 * Base unit: 4dp. All values are exact multiples of 4dp except [xxs] (2dp)
 * which is used for hairline icon-to-text pairs.
 *
 * Usage: `Spacing.lg` instead of hardcoded `16.dp`.
 */
object Spacing {
    /** 2dp — Hairline gaps (icon-to-text tight pairs). */
    val xxs: Dp = 2.dp

    /** 4dp — Minimum internal padding. */
    val xs: Dp = 4.dp

    /** 8dp — Tight internal padding, list item separators. */
    val sm: Dp = 8.dp

    /** 12dp — Standard internal padding. */
    val md: Dp = 12.dp

    /** 16dp — Card content padding, screen horizontal margin. */
    val lg: Dp = 16.dp

    /** 24dp — Section separators, vertical breathing room. */
    val xl: Dp = 24.dp

    /** 32dp — Major section breaks. */
    val xxl: Dp = 32.dp

    /** 16dp — Screen-edge horizontal padding (both sides). Same value as lg. */
    val screen: Dp = 16.dp
}
