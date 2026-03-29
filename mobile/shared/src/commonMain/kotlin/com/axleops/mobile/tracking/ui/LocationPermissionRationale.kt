package com.axleops.mobile.tracking.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.Spacing

/**
 * Permission pre-prompt bottom sheet content.
 *
 * Shown once per install at the first trip departure to explain
 * why location access is needed before triggering the OS permission dialog.
 *
 * UX principle: "Rationale-first" — explain value before asking permission.
 *
 * Source: spec §4.3 principle 3, UX permission-flow.md, status-copy-and-messaging.md §2
 */
@Composable
fun LocationPermissionRationale(
    onContinue: () -> Unit,
    onNotNow: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // GPS icon
        Icon(
            imageVector = Icons.Filled.MyLocation,
            contentDescription = "Location",
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.primary,
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Title — exact copy from status-copy-and-messaging.md §2
        Text(
            text = "Trip Location Tracking",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // Body — exact copy from status-copy-and-messaging.md §2
        Text(
            text = "AxleOps tracks your vehicle location during transit to " +
                "help fleet operations monitor delivery progress and " +
                "maintain compliance.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            textAlign = TextAlign.Center,
        )

        Spacer(modifier = Modifier.height(Spacing.md))

        // Bullet points — exact copy from status-copy-and-messaging.md §2
        Column(
            modifier = Modifier.fillMaxWidth(),
        ) {
            BulletPoint("Tracking starts when you depart")
            Spacer(modifier = Modifier.height(Spacing.sm))
            BulletPoint("Tracking stops when you arrive at the destination")
            Spacer(modifier = Modifier.height(Spacing.sm))
            BulletPoint("Location is only recorded during this trip")
        }

        Spacer(modifier = Modifier.height(Spacing.xl))

        // Primary button — filled
        Button(
            onClick = onContinue,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
            ),
        ) {
            Text(
                text = "Continue",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
            )
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        // Secondary button — text/ghost (FX-013: was OutlinedButton)
        TextButton(
            onClick = onNotNow,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                text = "Not Now",
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            )
        }
    }
}

/**
 * A single bullet point row for the rationale list.
 */
@Composable
private fun BulletPoint(text: String) {
    Row(
        verticalAlignment = Alignment.Top,
    ) {
        Text(
            text = "•",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
        )
        Spacer(modifier = Modifier.width(Spacing.sm))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
        )
    }
}
