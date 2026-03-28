package com.axleops.mobile.ui.shared

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.Spacing

/**
 * Upload preview screen — shows captured image with accept/retake/cancel options.
 *
 * Displayed when [UploadState.Previewing] is active.
 * The image is shown as a thumbnail; user decides to proceed or retake.
 *
 * @param imageBitmap The captured image as a Compose ImageBitmap.
 *   Callers must convert ByteArray → ImageBitmap using platform utilities.
 *   If null, shows a placeholder message (conversion may be async).
 * @param onAccept Called when user taps "Upload" — triggers the upload flow.
 * @param onRetake Called when user taps "Retake" — returns to capture.
 * @param onCancel Called when user taps "Cancel" — returns to idle.
 */
@Composable
fun UploadPreviewScreen(
    imageBitmap: ImageBitmap?,
    onAccept: () -> Unit,
    onRetake: () -> Unit,
    onCancel: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(Spacing.md),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "Preview",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurface,
        )

        Spacer(modifier = Modifier.height(Spacing.lg))

        // Image preview
        if (imageBitmap != null) {
            Image(
                bitmap = imageBitmap,
                contentDescription = "Captured photo preview",
                modifier = Modifier
                    .size(280.dp)
                    .clip(RoundedCornerShape(12.dp)),
            )
        } else {
            Text(
                text = "Loading preview…",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        Spacer(modifier = Modifier.height(Spacing.xl))

        // Action buttons
        Button(
            onClick = onAccept,
            modifier = Modifier.fillMaxWidth(),
            enabled = imageBitmap != null,
        ) {
            Text("Upload")
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            OutlinedButton(
                onClick = onRetake,
                modifier = Modifier.weight(1f),
            ) {
                Text("Retake")
            }

            OutlinedButton(
                onClick = onCancel,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.error,
                ),
            ) {
                Text("Cancel")
            }
        }
    }
}
