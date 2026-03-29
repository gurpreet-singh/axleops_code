package com.axleops.mobile.ui.trip.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.AxleWarning
import com.axleops.mobile.ui.theme.Spacing

/**
 * Full-width warning banner for offline state.
 *
 * Shows connectivity warning + pending queue count.
 * Background uses `color.warning` (AxleWarning amber) per design system §2.6.
 *
 * Source: spec FR-100, plan §9
 * Fix: FX-006 ⟵ OI-011
 */
@Composable
fun OfflineBanner(
    pendingCount: Int,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(AxleWarning)
            .padding(horizontal = Spacing.lg, vertical = Spacing.md),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Text(
            text = "📵",
            style = MaterialTheme.typography.titleMedium,
        )
        Text(
            text = "You are offline",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.weight(1f),
        )
        if (pendingCount > 0) {
            Text(
                text = "$pendingCount pending",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = Color.White.copy(alpha = 0.9f),
            )
        }
    }
}
