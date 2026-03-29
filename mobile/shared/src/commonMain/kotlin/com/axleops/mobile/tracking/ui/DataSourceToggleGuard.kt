package com.axleops.mobile.tracking.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.axleops.mobile.tracking.TrackingManager
import com.axleops.mobile.tracking.model.TrackingState

/**
 * T047: Data source toggle guard composable.
 *
 * Wraps a `useRealLocation` toggle and disables it when tracking
 * is active (ACTIVE or ACTIVE_DEGRADED). Shows an explanatory tooltip
 * when the toggle is disabled.
 *
 * Intended for integration into the debug/settings screen alongside
 * the existing data source switcher.
 *
 * Source: plan §15 (risk register — mock/real switching edge cases)
 */
@Composable
fun DataSourceToggleGuard(
    isRealLocation: Boolean,
    onToggle: (Boolean) -> Unit,
    trackingManager: TrackingManager,
    modifier: Modifier = Modifier,
) {
    val trackingState by trackingManager.trackingState.collectAsState()
    val isTrackingActive = trackingState == TrackingState.ACTIVE ||
        trackingState == TrackingState.ACTIVE_DEGRADED ||
        trackingState == TrackingState.SIGNAL_LOST

    Column(modifier = modifier.padding(16.dp)) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Use Real Location",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.weight(1f),
            )
            Spacer(modifier = Modifier.width(8.dp))
            Switch(
                checked = isRealLocation,
                onCheckedChange = { if (!isTrackingActive) onToggle(it) },
                enabled = !isTrackingActive,
            )
        }

        if (isTrackingActive) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Cannot switch data source while tracking is active.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error,
            )
        }
    }
}
