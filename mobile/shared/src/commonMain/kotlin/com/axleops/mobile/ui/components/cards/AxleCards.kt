package com.axleops.mobile.ui.components.cards

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import com.axleops.mobile.ui.theme.Elevation
import com.axleops.mobile.ui.theme.Spacing

/**
 * Standard card with header/body/footer slot layout.
 *
 * Per design system §2.2:
 * - `radius.md`, `elevation.low`, `space.lg` internal padding
 * - Header zone: 1 line max, truncation with ellipsis
 * - Action bar: right-aligned, max 2 visible actions
 *
 * @param modifier Modifier for the card container.
 * @param onClick Optional click handler making the card tappable.
 * @param content Card content with header/body/footer composables.
 */
@Composable
fun AxleCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    if (onClick != null) {
        Card(
            onClick = onClick,
            modifier = modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            elevation = CardDefaults.cardElevation(defaultElevation = Elevation.low),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
            ),
        ) {
            Column(
                modifier = Modifier.padding(Spacing.lg),
                content = content,
            )
        }
    } else {
        Card(
            modifier = modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            elevation = CardDefaults.cardElevation(defaultElevation = Elevation.low),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
            ),
        ) {
            Column(
                modifier = Modifier.padding(Spacing.lg),
                content = content,
            )
        }
    }
}

/**
 * Card header row with title and optional trailing composable (badge, icon).
 *
 * @param title Header text (single line, truncated with ellipsis).
 * @param trailing Optional trailing content (e.g., [TripPhaseBadge]).
 */
@Composable
fun AxleCardHeader(
    title: String,
    modifier: Modifier = Modifier,
    trailing: @Composable (() -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
        )
        trailing?.invoke()
    }
}

/**
 * Summary card for KPI display.
 *
 * Shows a large value (headline type) with a label (caption type)
 * and optional trend indicator.
 *
 * @param value The KPI value (e.g., "₹12,450", "23").
 * @param label Descriptive label (e.g., "This Month Earnings", "Active Trips").
 * @param trend Optional trend text (e.g., "+12%", "▲ 5").
 */
@Composable
fun SummaryCard(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
    trend: String? = null,
) {
    Card(
        modifier = modifier,
        shape = MaterialTheme.shapes.medium,
        elevation = CardDefaults.cardElevation(defaultElevation = Elevation.low),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(modifier = Modifier.height(Spacing.xxs))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (trend != null) {
                    Text(
                        text = "  $trend",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
        }
    }
}
