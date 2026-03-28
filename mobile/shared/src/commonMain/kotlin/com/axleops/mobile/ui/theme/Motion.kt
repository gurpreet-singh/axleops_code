package com.axleops.mobile.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.Easing

/**
 * AxleOps animation/motion tokens.
 *
 * Defines standard durations and easing curves for all transitions.
 * Usage: `Motion.SCREEN_DURATION_MS` with `Motion.EaseInOut`.
 */
object Motion {

    // ── Durations (milliseconds) ─────────────────────────────────────────

    /** 250ms — Push/pop screen transitions. */
    const val SCREEN_DURATION_MS: Int = 250

    /** 200ms — Bottom sheet open/close. */
    const val SHEET_DURATION_MS: Int = 200

    /** 150ms — State transitions (loading → loaded). */
    const val FADE_DURATION_MS: Int = 150

    /** 200ms — Expand/collapse sections. */
    const val COLLAPSE_DURATION_MS: Int = 200

    // ── Easing Curves ────────────────────────────────────────────────────

    /** Ease-in-out — Screen transitions, expand/collapse. */
    val EaseInOut: Easing = CubicBezierEasing(0.42f, 0.0f, 0.58f, 1.0f)

    /** Ease-out — Bottom sheet animations (decelerating). */
    val EaseOut: Easing = CubicBezierEasing(0.0f, 0.0f, 0.58f, 1.0f)

    /** Linear — Fade transitions. */
    val Linear: Easing = CubicBezierEasing(0.0f, 0.0f, 1.0f, 1.0f)
}
