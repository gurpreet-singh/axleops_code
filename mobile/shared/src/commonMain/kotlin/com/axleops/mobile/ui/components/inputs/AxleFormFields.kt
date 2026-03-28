package com.axleops.mobile.ui.components.inputs

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.axleops.mobile.ui.theme.Spacing

/**
 * Additional form field components (FR-022).
 *
 * Complements AxleTextField and AxleDropdown from AxleInputs.kt.
 * Per design system §2.3:
 * - Labels always beside or above the control
 * - Error messages appear below the field
 * - Required fields marked with `*` in the label
 */

// ── Checkbox ─────────────────────────────────────────────────────────────────

/**
 * Labeled checkbox with top-aligned label.
 *
 * @param checked Current checked state.
 * @param onCheckedChange Callback when toggled.
 * @param label Display text next to the checkbox.
 * @param enabled Whether the checkbox is interactive.
 */
@Composable
fun AxleCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled,
        )
        Spacer(modifier = Modifier.width(Spacing.sm))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = if (enabled) {
                MaterialTheme.colorScheme.onSurface
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        )
    }
}

// ── Switch / Toggle ──────────────────────────────────────────────────────────

/**
 * Labeled switch (toggle) with label on the left and switch on the right.
 *
 * @param checked Current state.
 * @param onCheckedChange Callback when toggled.
 * @param label Display text.
 * @param enabled Whether the switch is interactive.
 */
@Composable
fun AxleSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = if (enabled) {
                MaterialTheme.colorScheme.onSurface
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
            modifier = Modifier.weight(1f),
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled,
        )
    }
}

// ── Multi-Line Text Area ─────────────────────────────────────────────────────

/**
 * Multi-line text area for longer text input.
 *
 * @param value Current text value.
 * @param onValueChange Callback for text changes.
 * @param label Field label.
 * @param error Error message to display below (null = no error).
 * @param minLines Minimum visible lines (default 3).
 * @param maxLines Maximum lines before scrolling (default 6).
 * @param placeholder Optional placeholder text.
 * @param enabled Whether the field is interactive.
 */
@Composable
fun AxleTextArea(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    error: String? = null,
    minLines: Int = 3,
    maxLines: Int = 6,
    placeholder: String? = null,
    enabled: Boolean = true,
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = if (error != null) {
                MaterialTheme.colorScheme.error
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
        )
        Spacer(modifier = Modifier.height(Spacing.xs))
        androidx.compose.material3.OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
            singleLine = false,
            minLines = minLines,
            maxLines = maxLines,
            isError = error != null,
            placeholder = if (placeholder != null) {
                { Text(placeholder, style = MaterialTheme.typography.bodyMedium) }
            } else {
                null
            },
            shape = MaterialTheme.shapes.medium,
        )
        if (error != null) {
            Spacer(modifier = Modifier.height(Spacing.xxs))
            Text(
                text = error,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.error,
            )
        }
    }
}
