package com.axleops.mobile.ui.components.feedback

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.outlined.AttachFile
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.AxleError
import com.axleops.mobile.ui.theme.AxleSuccess
import com.axleops.mobile.ui.theme.Spacing

/**
 * Upload state machine for evidence/document uploads.
 *
 * Defines the four states an upload can be in. This is the API contract;
 * actual platform capture (camera, gallery) is deferred to the Active Trip spec.
 */
sealed interface UploadState {
    /** No upload started. */
    data object Idle : UploadState

    /** Upload in progress. */
    data class Uploading(val progress: Float) : UploadState

    /** Upload completed successfully. */
    data class Success(val thumbnailUri: String) : UploadState

    /** Upload failed. */
    data class Failed(val message: String) : UploadState
}

/**
 * Upload card component showing thumbnail/progress/actions.
 *
 * Per design system, this defines the API contract for upload UX.
 * Platform capture integration is deferred to the Active Trip feature.
 *
 * @param state Current upload state.
 * @param label File label (e.g., "Proof of Delivery", "Damage Photo").
 * @param onRetry Retry callback for failed uploads.
 * @param onRemove Remove/cancel callback.
 */
@Composable
fun AxleUploadCard(
    state: UploadState,
    label: String,
    modifier: Modifier = Modifier,
    onRetry: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(Spacing.md),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Thumbnail / status icon area
        Box(
            modifier = Modifier.size(48.dp),
            contentAlignment = Alignment.Center,
        ) {
            when (state) {
                is UploadState.Idle -> {
                    Icon(
                        imageVector = Icons.Outlined.AttachFile,
                        contentDescription = "Ready",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(24.dp),
                    )
                }
                is UploadState.Uploading -> {
                    CircularProgressIndicator(
                        progress = { state.progress },
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 2.dp,
                    )
                }
                is UploadState.Success -> {
                    Icon(
                        imageVector = Icons.Outlined.CheckCircle,
                        contentDescription = "Uploaded",
                        tint = AxleSuccess,
                        modifier = Modifier.size(24.dp),
                    )
                }
                is UploadState.Failed -> {
                    Icon(
                        imageVector = Icons.Outlined.ErrorOutline,
                        contentDescription = "Failed",
                        tint = AxleError,
                        modifier = Modifier.size(24.dp),
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(Spacing.md))

        // Label + status text
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            when (state) {
                is UploadState.Idle -> {}
                is UploadState.Uploading -> {
                    Spacer(modifier = Modifier.height(Spacing.xs))
                    LinearProgressIndicator(
                        progress = { state.progress },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
                is UploadState.Success -> {
                    Text(
                        text = "Uploaded",
                        style = MaterialTheme.typography.labelSmall,
                        color = AxleSuccess,
                    )
                }
                is UploadState.Failed -> {
                    Text(
                        text = state.message,
                        style = MaterialTheme.typography.labelSmall,
                        color = AxleError,
                    )
                }
            }
        }

        // Action buttons
        when (state) {
            is UploadState.Failed -> {
                if (onRetry != null) {
                    IconButton(onClick = onRetry) {
                        Icon(
                            imageVector = Icons.Outlined.Refresh,
                            contentDescription = "Retry",
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
            is UploadState.Success, is UploadState.Idle -> {
                if (onRemove != null) {
                    IconButton(onClick = onRemove) {
                        Icon(
                            imageVector = Icons.Outlined.Close,
                            contentDescription = "Remove",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            else -> {}
        }
    }
}
