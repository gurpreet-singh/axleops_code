package com.axleops.mobile.ui.components.feedback

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import com.axleops.mobile.ui.theme.AxleError

/**
 * Styled confirmation dialog.
 *
 * Per design system §2.8:
 * - Width: screen width − 48dp (24dp margin each side)
 * - Actions: right-aligned. Confirm = primary. Cancel = text button.
 * - Destructive variant uses error color for confirm button.
 *
 * @param title Dialog title.
 * @param message Dialog body text.
 * @param confirmLabel Confirm button text (default "Confirm").
 * @param cancelLabel Cancel button text (default "Cancel").
 * @param isDestructive If true, confirm button uses error color.
 * @param onConfirm Callback when confirmed.
 * @param onCancel Callback when cancelled or dismissed.
 */
@Composable
fun AxleConfirmationDialog(
    title: String,
    message: String,
    onConfirm: () -> Unit,
    onCancel: () -> Unit,
    confirmLabel: String = "Confirm",
    cancelLabel: String = "Cancel",
    isDestructive: Boolean = false,
) {
    AlertDialog(
        onDismissRequest = onCancel,
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
            )
        },
        text = {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
            )
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(
                    text = confirmLabel,
                    color = if (isDestructive) AxleError else MaterialTheme.colorScheme.primary,
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text(cancelLabel)
            }
        },
        shape = MaterialTheme.shapes.medium,
    )
}

// ── Snackbar ─────────────────────────────────────────────────────────────────

/**
 * Snackbar type determines auto-dismiss behavior.
 *
 * Per interaction rules §3.3:
 * - Success: auto-dismiss after 3 seconds
 * - Error: persists until dismissed or retried
 * - Info: auto-dismiss after 3 seconds
 */
enum class SnackbarType {
    SUCCESS,
    ERROR,
    INFO,
}

/**
 * Styled snackbar host configuration.
 *
 * Call [showAxleSnackbar] on a [SnackbarHostState] to show a snackbar
 * with the correct duration and action behavior per design system rules.
 *
 * @param hostState The [SnackbarHostState] for the current scaffold.
 * @param message Snackbar message text.
 * @param type Type determines auto-dismiss behavior.
 * @param actionLabel Optional action label (e.g., "Retry", "Undo").
 */
suspend fun showAxleSnackbar(
    hostState: SnackbarHostState,
    message: String,
    type: SnackbarType = SnackbarType.INFO,
    actionLabel: String? = null,
): SnackbarResult {
    return hostState.showSnackbar(
        message = message,
        actionLabel = actionLabel,
        withDismissAction = type == SnackbarType.ERROR,
        duration = when (type) {
            SnackbarType.SUCCESS, SnackbarType.INFO -> SnackbarDuration.Short
            SnackbarType.ERROR -> SnackbarDuration.Indefinite
        },
    )
}
