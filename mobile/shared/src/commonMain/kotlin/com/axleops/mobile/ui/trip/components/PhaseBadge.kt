package com.axleops.mobile.ui.trip.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.domain.model.TripPhase
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.model.TripSubState
import com.axleops.mobile.ui.theme.Spacing

/**
 * Phase badge composable — renders a colored label for the trip's phase.
 *
 * Uses [TripSubState.infoFor] to look up the phase and badge color
 * from the design system token table. Color token resolution maps
 * to Material3 semantic colors:
 *
 * - `color.phase.created` → tertiaryContainer
 * - `color.phase.in_transit` → primaryContainer
 * - `color.phase.completed` → secondaryContainer
 * - `color.phase.settled` → surfaceVariant
 * - `color.phase.exception` → errorContainer
 * - `color.warning` → tertiaryContainer (amber)
 * - `color.error` → errorContainer
 *
 * Source: design system §2.2, state-inventory.md §2
 */
@Composable
fun PhaseBadge(
    status: TripStatus,
    modifier: Modifier = Modifier,
) {
    val info = TripSubState.infoFor(status)
    val label = info.label ?: return  // Don't render badge for non-driver-visible states

    val backgroundColor = resolveTokenColor(info.badgeColorToken)

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .padding(horizontal = Spacing.sm, vertical = 4.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = resolveOnTokenColor(info.badgeColorToken),
        )
    }
}

/**
 * Resolve a badge color token to a Material3 color.
 */
@Composable
private fun resolveTokenColor(token: String) = when (token) {
    "color.phase.created" -> MaterialTheme.colorScheme.tertiaryContainer
    "color.phase.in_transit" -> MaterialTheme.colorScheme.primaryContainer
    "color.phase.completed" -> MaterialTheme.colorScheme.secondaryContainer
    "color.phase.settled" -> MaterialTheme.colorScheme.surfaceVariant
    "color.phase.exception" -> MaterialTheme.colorScheme.errorContainer
    "color.warning" -> MaterialTheme.colorScheme.tertiaryContainer
    "color.error" -> MaterialTheme.colorScheme.errorContainer
    else -> MaterialTheme.colorScheme.surfaceVariant
}

/**
 * Resolve the "on" color for a badge token.
 */
@Composable
private fun resolveOnTokenColor(token: String) = when (token) {
    "color.phase.created" -> MaterialTheme.colorScheme.onTertiaryContainer
    "color.phase.in_transit" -> MaterialTheme.colorScheme.onPrimaryContainer
    "color.phase.completed" -> MaterialTheme.colorScheme.onSecondaryContainer
    "color.phase.settled" -> MaterialTheme.colorScheme.onSurfaceVariant
    "color.phase.exception" -> MaterialTheme.colorScheme.onErrorContainer
    "color.warning" -> MaterialTheme.colorScheme.onTertiaryContainer
    "color.error" -> MaterialTheme.colorScheme.onErrorContainer
    else -> MaterialTheme.colorScheme.onSurfaceVariant
}
