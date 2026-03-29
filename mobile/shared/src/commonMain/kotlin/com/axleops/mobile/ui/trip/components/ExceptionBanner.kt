package com.axleops.mobile.ui.trip.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.Spacing

/**
 * Red full-width banner for active trip exceptions.
 *
 * Shown at the top of the trip detail screen when the trip
 * has an active blocking exception (VEHICLE_BREAKDOWN, ACCIDENT, etc.).
 *
 * Source: UX interaction-rules §4.2, state-inventory.md §3
 */
@Composable
fun ExceptionBanner(
    type: String,
    description: String,
    reportedAt: String? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.errorContainer)
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Text(
                text = "⚠️",
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = formatExceptionType(type),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onErrorContainer,
            )
        }

        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onErrorContainer,
        )

        reportedAt?.let { timestamp ->
            Text(
                text = "Reported: ${timestamp.take(16).replace("T", " ")}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.7f),
            )
        }

        Text(
            text = "Contact operations for resolution",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onErrorContainer.copy(alpha = 0.8f),
        )
    }
}

/**
 * Format exception type code for display.
 *
 * VEHICLE_BREAKDOWN → Vehicle Breakdown
 */
private fun formatExceptionType(type: String): String =
    type.replace("_", " ")
        .lowercase()
        .replaceFirstChar { it.uppercase() }
        .split(" ")
        .joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
