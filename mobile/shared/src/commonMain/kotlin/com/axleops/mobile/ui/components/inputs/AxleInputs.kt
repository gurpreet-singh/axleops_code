package com.axleops.mobile.ui.components.inputs

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.Spacing

/**
 * Shared input components.
 *
 * Per design system §2.3:
 * - Labels always above the field (top-aligned), never floating
 * - Error messages appear below the field
 * - Validation on blur (not keystroke)
 * - Required fields marked with `*` in the label
 */

private val InputHeight = 56.dp

/**
 * Styled text input with top-aligned label and blur validation.
 *
 * @param value Current text value.
 * @param onValueChange Callback for text changes.
 * @param label Field label (append "*" for required fields).
 * @param error Error message to display below (null = no error).
 * @param onBlurValidate Optional callback invoked when the field loses focus.
 * @param enabled Whether the field is interactive.
 * @param singleLine Whether to restrict to a single line.
 * @param placeholder Optional placeholder text.
 */
@Composable
fun AxleTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    error: String? = null,
    onBlurValidate: (() -> Unit)? = null,
    enabled: Boolean = true,
    singleLine: Boolean = true,
    placeholder: String? = null,
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
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier
                .fillMaxWidth()
                .height(InputHeight)
                .onFocusChanged { focusState ->
                    if (!focusState.isFocused) {
                        onBlurValidate?.invoke()
                    }
                },
            enabled = enabled,
            singleLine = singleLine,
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

/**
 * Dropdown selector. Uses [ExposedDropdownMenuBox] for Material3 styling.
 *
 * For > 7 options, a bottom sheet should be used instead (handled by caller).
 *
 * @param selectedValue Currently selected display text.
 * @param options List of available options.
 * @param onOptionSelected Callback with the selected option.
 * @param label Field label.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AxleDropdown(
    selectedValue: String,
    options: List<String>,
    onOptionSelected: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    var expanded by remember { mutableStateOf(false) }

    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(Spacing.xs))
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { if (enabled) expanded = !expanded },
        ) {
            OutlinedTextField(
                value = selectedValue,
                onValueChange = {},
                readOnly = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable, enabled),
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                shape = MaterialTheme.shapes.medium,
                enabled = enabled,
            )
            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
            ) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option, style = MaterialTheme.typography.bodyMedium) },
                        onClick = {
                            onOptionSelected(option)
                            expanded = false
                        },
                    )
                }
            }
        }
    }
}
