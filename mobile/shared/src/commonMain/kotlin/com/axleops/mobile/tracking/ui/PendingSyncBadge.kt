package com.axleops.mobile.tracking.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Compact badge showing the count of pending (unsynced) location points.
 *
 * Placed near the [TrackingIndicator] in the trip header. Hidden when
 * the count is 0 (all points synced).
 *
 * Source: spec §5.2 (location data pending sync)
 */
@Composable
fun PendingSyncBadge(
    pendingCount: Long,
    modifier: Modifier = Modifier,
) {
    if (pendingCount <= 0) return

    val displayText = if (pendingCount > 99) "99+" else pendingCount.toString()

    Box(
        modifier = modifier
            .size(20.dp)
            .clip(CircleShape)
            .background(Color(0xFFF59E0B)), // Amber
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = displayText,
            style = MaterialTheme.typography.labelSmall,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
        )
    }
}
