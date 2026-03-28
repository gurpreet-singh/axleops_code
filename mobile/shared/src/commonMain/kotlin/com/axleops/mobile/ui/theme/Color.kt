package com.axleops.mobile.ui.theme

import androidx.compose.ui.graphics.Color

// ── Brand Colors ─────────────────────────────────────────────────────────────

/** Primary brand color — Emerald 600. Used for primary actions, active states, progress. */
val AxlePrimary = Color(0xFF059669)

/** Primary container — Emerald 100. Used for primary tinted backgrounds, selected states. */
val AxlePrimaryContainer = Color(0xFFD1FAE5)

/** Content color on primary surfaces. */
val AxleOnPrimary = Color(0xFFFFFFFF)

/** Secondary brand color — Cyan 600. Used for secondary actions, links. */
val AxleSecondary = Color(0xFF0891B2)

/** Secondary container — Cyan 100. Used for secondary tinted backgrounds. */
val AxleSecondaryContainer = Color(0xFFCFFAFE)

// ── Semantic Colors ──────────────────────────────────────────────────────────

/** Success — Green 600. Completed states, confirmations. */
val AxleSuccess = Color(0xFF16A34A)

/** Warning — Amber 600. Warnings, expiring items, caution states. */
val AxleWarning = Color(0xFFD97706)

/** Error — Red 600. Errors, critical alerts, destructive actions. */
val AxleError = Color(0xFFDC2626)

/** Info — Blue 600. Informational messages, neutral highlights. */
val AxleInfo = Color(0xFF2563EB)

// ── Surface Colors ───────────────────────────────────────────────────────────

/** Surface — White. Card backgrounds, input backgrounds. */
val AxleSurface = Color(0xFFFFFFFF)

/** Surface variant — Gray 100. Screen backgrounds, alternate rows. */
val AxleSurfaceVariant = Color(0xFFF5F5F5)

/** On surface — Gray 800. Primary text on surfaces. */
val AxleOnSurface = Color(0xFF1F2937)

/** On surface variant — Gray 500. Secondary text, metadata, labels. */
val AxleOnSurfaceVariant = Color(0xFF6B7280)

/** Outline — Gray 300. Borders, dividers, input outlines. */
val AxleOutline = Color(0xFFD1D5DB)

/** Outline variant — Gray 200. Subtle separators. */
val AxleOutlineVariant = Color(0xFFE5E7EB)

/** Scrim — Black at 32% opacity. Modal/sheet backdrop. */
val AxleScrim = Color(0x52000000)

// ── Trip Phase Colors ────────────────────────────────────────────────────────

/**
 * Trip lifecycle phases mapped to their designated colors.
 *
 * These colors MUST be used consistently wherever trip status is displayed
 * (badges, stepper, cards) per the design system specification.
 */
enum class TripPhase(val color: Color, val label: String) {
    /** Created/scheduled — Gray 500. */
    CREATED(Color(0xFF6B7280), "Created"),

    /** In transit / active movement — Blue 600. */
    IN_TRANSIT(Color(0xFF2563EB), "In Transit"),

    /** Completed / verified — Emerald 600. */
    COMPLETED(Color(0xFF059669), "Completed"),

    /** Settled / closed — Gray 400. */
    SETTLED(Color(0xFF9CA3AF), "Settled"),
    ;

    companion object {
        /** Exception state color — Orange 600. Not a phase but overlays on any phase. */
        val exceptionColor = Color(0xFFEA580C)
    }
}

// ── Light Color Scheme ───────────────────────────────────────────────────────

/**
 * Light color scheme using AxleOps brand tokens.
 *
 * This scheme is consumed by [AxleOpsTheme] and should NOT be imported directly
 * by feature screens. Use `MaterialTheme.colorScheme.*` instead.
 */
val AxleLightColorScheme = androidx.compose.material3.lightColorScheme(
    primary = AxlePrimary,
    onPrimary = AxleOnPrimary,
    primaryContainer = AxlePrimaryContainer,
    secondary = AxleSecondary,
    onSecondary = AxleOnPrimary,
    secondaryContainer = AxleSecondaryContainer,
    background = AxleSurfaceVariant,
    onBackground = AxleOnSurface,
    surface = AxleSurface,
    onSurface = AxleOnSurface,
    onSurfaceVariant = AxleOnSurfaceVariant,
    error = AxleError,
    onError = AxleOnPrimary,
    outline = AxleOutline,
    outlineVariant = AxleOutlineVariant,
    scrim = AxleScrim,
)
