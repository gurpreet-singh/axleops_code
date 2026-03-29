package com.axleops.mobile.ui.trip.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.MilestoneStatus
import com.axleops.mobile.ui.theme.Spacing

/**
 * Milestone stepper section showing the 10-step trip lifecycle.
 *
 * Each step is rendered as a circle + label pair:
 * - ✅ COMPLETED — green circle
 * - 🔵 CURRENT — primary color, pulsing
 * - ⬜ UPCOMING — gray outline
 * - 🚫 BLOCKED — red circle
 * - ⏭️ SKIPPED — strikethrough label
 *
 * Source: UX state-inventory.md, plan §2.1
 */
@Composable
fun MilestoneStepperSection(
    milestones: List<Milestone>,
    modifier: Modifier = Modifier,
) {
    if (milestones.isEmpty()) {
        Text(
            text = "No milestones available",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        return
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Text(
            text = "Trip Progress",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )

        milestones.forEachIndexed { index, milestone ->
            MilestoneStepRow(
                milestone = milestone,
                isLast = index == milestones.lastIndex,
            )
        }
    }
}

/**
 * Single milestone step row with status indicator and label.
 */
@Composable
private fun MilestoneStepRow(
    milestone: Milestone,
    isLast: Boolean,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.md),
    ) {
        // Status indicator circle
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(
                    when (milestone.status) {
                        MilestoneStatus.COMPLETED -> MaterialTheme.colorScheme.primary
                        MilestoneStatus.CURRENT -> MaterialTheme.colorScheme.tertiary
                        MilestoneStatus.BLOCKED -> MaterialTheme.colorScheme.error
                        MilestoneStatus.SKIPPED -> MaterialTheme.colorScheme.outlineVariant
                        MilestoneStatus.UPCOMING -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = when (milestone.status) {
                    MilestoneStatus.COMPLETED -> "✓"
                    MilestoneStatus.CURRENT -> "●"
                    MilestoneStatus.BLOCKED -> "!"
                    MilestoneStatus.SKIPPED -> "—"
                    MilestoneStatus.UPCOMING -> "${milestone.sequenceNumber}"
                },
                style = MaterialTheme.typography.labelSmall,
                color = when (milestone.status) {
                    MilestoneStatus.COMPLETED,
                    MilestoneStatus.CURRENT,
                    MilestoneStatus.BLOCKED,
                    -> MaterialTheme.colorScheme.onPrimary
                    else -> MaterialTheme.colorScheme.onSurfaceVariant
                },
            )
        }

        // Milestone label and timestamp
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = milestone.type.driverLabel,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = if (milestone.status == MilestoneStatus.CURRENT) {
                    FontWeight.Bold
                } else {
                    FontWeight.Normal
                },
                color = when (milestone.status) {
                    MilestoneStatus.COMPLETED -> MaterialTheme.colorScheme.onSurface
                    MilestoneStatus.CURRENT -> MaterialTheme.colorScheme.tertiary
                    MilestoneStatus.BLOCKED -> MaterialTheme.colorScheme.error
                    MilestoneStatus.SKIPPED -> MaterialTheme.colorScheme.onSurfaceVariant
                    MilestoneStatus.UPCOMING -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                },
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            milestone.completedAt?.let { timestamp ->
                Text(
                    text = timestamp.take(16).replace("T", " "),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                )
            }
        }
    }

    // Connector line between steps (except last)
    if (!isLast) {
        Box(
            modifier = Modifier
                .padding(start = 11.dp) // Center under the 24dp circle
                .size(width = 2.dp, height = 8.dp)
                .background(MaterialTheme.colorScheme.outlineVariant),
        )
    }
}
