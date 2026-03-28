package com.axleops.mobile.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * AxleOps elevation tokens.
 *
 * Usage: `Elevation.low` instead of hardcoded `1.dp`.
 */
object Elevation {
    /** 0dp — Flat elements, inline content. */
    val none: Dp = 0.dp

    /** 1dp — Cards, list items. */
    val low: Dp = 1.dp

    /** 4dp — Sticky headers, bottom bars. */
    val medium: Dp = 4.dp

    /** 8dp — Modals, bottom sheets. */
    val high: Dp = 8.dp
}

/**
 * AxleOps corner radius tokens.
 *
 * Usage: `Radius.md` instead of hardcoded `8.dp`.
 */
object Radius {
    /** 4dp — Small chips, compact badges. */
    val sm: Dp = 4.dp

    /** 8dp — Cards, input fields, buttons. */
    val md: Dp = 8.dp

    /** 12dp — Bottom sheets (top corners). */
    val lg: Dp = 12.dp

    /** 24dp — FABs, pill badges, avatars. */
    val full: Dp = 24.dp
}

/**
 * AxleOps icon size tokens (FR-004).
 *
 * Three standard sizes for consistent icon rendering.
 * Usage: `IconSize.touch` instead of hardcoded `24.dp`.
 */
object IconSize {
    /** 24dp — Standard touchable icons (tab bar, action buttons). */
    val touch: Dp = 24.dp

    /** 20dp — Inline icons within text or compact spots. */
    val inline: Dp = 20.dp

    /** 16dp — Decorative/secondary icons. */
    val decorative: Dp = 16.dp
}

/**
 * AxleOps minimum touch target sizes (FR-005).
 *
 * Usage: `TouchTarget.minimum` instead of hardcoded `48.dp`.
 */
object TouchTarget {
    /** 48dp — Minimum interactive element size per accessibility guidelines. */
    val minimum: Dp = 48.dp
}
