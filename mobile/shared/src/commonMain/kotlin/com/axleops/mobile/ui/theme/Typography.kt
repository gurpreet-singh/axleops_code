package com.axleops.mobile.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * AxleOps typographic scale.
 *
 * 6-level scale mapped to Material3 [Typography] slots:
 *
 * | Design Token   | M3 Slot         | Size  | Weight   |
 * |----------------|-----------------|-------|----------|
 * | type.headline  | headlineMedium  | 24sp  | Bold     |
 * | type.title     | titleLarge      | 20sp  | SemiBold |
 * | type.subtitle  | titleMedium     | 16sp  | SemiBold |
 * | type.body      | bodyMedium      | 14sp  | Regular  |
 * | type.label     | labelMedium     | 12sp  | Medium   |
 * | type.caption   | labelSmall      | 11sp  | Regular  |
 *
 * Feature screens MUST use `MaterialTheme.typography.*` — never
 * hardcoded [TextStyle] values.
 */
val AxleTypography = Typography(
    // type.headline → Screen titles, primary KPI values
    headlineMedium = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = (-0.25).sp,
    ),
    // type.title → Section headers, card titles
    titleLarge = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp,
    ),
    // type.subtitle → Sub-section headers, emphasized labels
    titleMedium = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.1.sp,
    ),
    // type.body → Primary content text, descriptions
    bodyMedium = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp,
    ),
    // type.label → Form labels, metadata, badge text
    labelMedium = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp,
    ),
    // type.caption → Timestamps, hints, tertiary info
    labelSmall = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp,
    ),

    // ── Additional M3 slots filled for completeness ──────────────────────

    headlineLarge = TextStyle(
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
    ),
    headlineSmall = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 28.sp,
    ),
    bodyLarge = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
    bodySmall = TextStyle(
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
    ),
    labelLarge = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
)
