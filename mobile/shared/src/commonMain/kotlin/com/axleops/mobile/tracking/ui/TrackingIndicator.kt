package com.axleops.mobile.tracking.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GpsFixed
import androidx.compose.material.icons.filled.GpsNotFixed
import androidx.compose.material.icons.filled.GpsOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.tracking.model.TrackingState
import com.axleops.mobile.ui.theme.Spacing

/**
 * GPS tracking status indicator for the trip detail header (Layer 1).
 *
 * Renders a compact icon + label reflecting the current [TrackingState]:
 * - ACTIVE: pulsing green GPS icon + "Tracking"
 * - ACTIVE_DEGRADED: yellow GPS icon + "Limited GPS"
 * - SIGNAL_LOST: red signal-off icon + "No Signal"
 * - PERMISSION_DENIED: yellow location-off icon + "No GPS Permission"
 * - INACTIVE: gray GPS-off icon + "GPS Off"
 * - STOPPED: gray GPS icon + "Tracking Complete"
 *
 * Source: spec §5.1, UX status-copy-and-messaging.md
 */
@Composable
fun TrackingIndicator(
    state: TrackingState,
    modifier: Modifier = Modifier,
) {
    val (icon, tint, shouldPulse) = when (state) {
        TrackingState.ACTIVE -> Triple(Icons.Filled.GpsFixed, Color(0xFF22C55E), true) // Green
        TrackingState.ACTIVE_DEGRADED -> Triple(Icons.Filled.GpsNotFixed, Color(0xFFF59E0B), false) // Amber
        TrackingState.SIGNAL_LOST -> Triple(Icons.Filled.GpsNotFixed, Color(0xFFEF4444), false) // Red
        TrackingState.PERMISSION_DENIED -> Triple(Icons.Filled.GpsOff, Color(0xFFF59E0B), false) // Amber
        TrackingState.AWAITING_PERMISSION -> Triple(Icons.Filled.GpsNotFixed, Color(0xFF94A3B8), false) // Gray
        TrackingState.INACTIVE -> Triple(Icons.Filled.GpsOff, Color(0xFF94A3B8), false) // Gray
        TrackingState.STOPPED -> Triple(Icons.Filled.GpsFixed, Color(0xFF94A3B8), false) // Gray
    }

    // Pulsing animation for ACTIVE state
    val alpha = if (shouldPulse) {
        val transition = rememberInfiniteTransition(label = "tracking_pulse")
        val animatedAlpha by transition.animateFloat(
            initialValue = 1f,
            targetValue = 0.4f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 150),
                repeatMode = RepeatMode.Reverse,
                initialStartOffset = androidx.compose.animation.core.StartOffset(2850),
            ),
            label = "tracking_pulse_alpha",
        )
        animatedAlpha
    } else {
        1f
    }

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Icon(
            imageVector = icon,
            contentDescription = state.displayLabel,
            tint = tint,
            modifier = Modifier
                .size(16.dp)
                .alpha(alpha),
        )
        Text(
            text = state.displayLabel,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Medium,
            color = tint,
        )
    }
}
