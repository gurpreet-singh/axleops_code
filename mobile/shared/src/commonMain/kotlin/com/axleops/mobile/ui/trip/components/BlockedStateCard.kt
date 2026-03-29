package com.axleops.mobile.ui.trip.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.trip.state.BlockReason
import com.axleops.mobile.ui.theme.Spacing

/**
 * Inline blocked state explanation composable.
 *
 * Shows a warning/info card with the block reason and resolution hint.
 * Used on the trip detail screen when the trip cannot progress.
 *
 * Source: UX interaction-rules §4.3
 */
@Composable
fun BlockedStateCard(
    blockReason: BlockReason,
    modifier: Modifier = Modifier,
) {
    val (bgColor, textColor, icon) = when (blockReason) {
        is BlockReason.ServerGuard -> Triple(
            MaterialTheme.colorScheme.tertiaryContainer,
            MaterialTheme.colorScheme.onTertiaryContainer,
            "⏳",
        )
        is BlockReason.AcceptTimeout -> Triple(
            MaterialTheme.colorScheme.errorContainer,
            MaterialTheme.colorScheme.onErrorContainer,
            "⏰",
        )
        is BlockReason.ActiveException -> Triple(
            MaterialTheme.colorScheme.errorContainer,
            MaterialTheme.colorScheme.onErrorContainer,
            "🚫",
        )
        is BlockReason.OfflineRequired -> Triple(
            MaterialTheme.colorScheme.surfaceVariant,
            MaterialTheme.colorScheme.onSurfaceVariant,
            "📵",
        )
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Text(
            text = "$icon ${blockTitle(blockReason)}",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = textColor,
        )
        Text(
            text = blockReason.message,
            style = MaterialTheme.typography.bodyMedium,
            color = textColor,
        )
    }
}

/**
 * Title for the block reason card.
 */
private fun blockTitle(reason: BlockReason): String = when (reason) {
    is BlockReason.ServerGuard -> "Action Blocked"
    is BlockReason.AcceptTimeout -> "Accept Window Expired"
    is BlockReason.ActiveException -> "Exception Active"
    is BlockReason.OfflineRequired -> "No Connection"
}
