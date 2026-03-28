package com.axleops.mobile.ui.components.badges

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import com.axleops.mobile.ui.theme.AxleError
import com.axleops.mobile.ui.theme.AxleOnPrimary
import com.axleops.mobile.ui.theme.IconSize
import com.axleops.mobile.ui.theme.Radius
import com.axleops.mobile.ui.theme.Spacing
import com.axleops.mobile.ui.theme.TripPhase

/**
 * Trip status badges.
 *
 * Per design system §2.4:
 * - Phase badge (standard): 24dp height, 8dp horizontal padding, `radius.sm`
 * - Phase badge (compact): 20dp height, 6dp horizontal padding, `radius.sm`
 * - Exception badge: same as phase badge, `color.phase.exception`
 * - Count badge: 20dp × 20dp circle, `color.error` fill
 * - Labels use `type.label`, white text on colored background
 */

/**
 * Trip phase badge — pill-shaped label with phase-specific background color.
 *
 * @param phase The trip phase to display.
 * @param compact If true, use compact dimensions (20dp height).
 */
@Composable
fun TripPhaseBadge(
    phase: TripPhase,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val verticalPadding = if (compact) Spacing.xxs else Spacing.xs
    val horizontalPadding = if (compact) Spacing.xs + Spacing.xxs else Spacing.sm

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(Radius.sm))
            .background(phase.color)
            .padding(horizontal = horizontalPadding, vertical = verticalPadding),
    ) {
        Text(
            text = phase.label,
            style = MaterialTheme.typography.labelMedium,
            color = AxleOnPrimary,
        )
    }
}

/**
 * Exception badge — orange status overlay for trips with exceptions.
 *
 * @param count Number of exceptions (shown as label text).
 */
@Composable
fun ExceptionBadge(
    count: Int,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(Radius.sm))
            .background(TripPhase.exceptionColor)
            .padding(horizontal = Spacing.sm, vertical = Spacing.xxs),
    ) {
        Text(
            text = if (count == 1) "1 Exception" else "$count Exceptions",
            style = MaterialTheme.typography.labelMedium,
            color = AxleOnPrimary,
        )
    }
}

/**
 * Count badge — small circle badge for tab bar notification counts.
 *
 * @param count Number to display (capped at "99+").
 */
@Composable
fun CountBadge(
    count: Int,
    modifier: Modifier = Modifier,
) {
    if (count <= 0) return

    Box(
        modifier = modifier
            .size(IconSize.inline)
            .clip(CircleShape)
            .background(AxleError),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = if (count > 99) "99+" else "$count",
            style = MaterialTheme.typography.labelSmall,
            color = AxleOnPrimary,
        )
    }
}
