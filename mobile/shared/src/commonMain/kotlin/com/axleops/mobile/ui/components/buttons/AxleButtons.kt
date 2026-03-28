package com.axleops.mobile.ui.components.buttons

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.axleops.mobile.ui.theme.AxleError
import com.axleops.mobile.ui.theme.AxleOnPrimary
import com.axleops.mobile.ui.theme.Spacing
import com.axleops.mobile.ui.theme.TouchTarget

/**
 * Shared button components.
 *
 * All buttons enforce 48dp minimum height (touch target) and use
 * theme tokens for colors, shapes, and typography.
 *
 * Rules (per design system §2.1):
 * - Maximum one primary button per screen
 * - Destructive actions always require confirmation modal
 * - Disabled state: 38% opacity, non-interactive
 */

private val ButtonHeight = TouchTarget.minimum
private val ButtonHorizontalPadding = Spacing.xl // 24dp

/**
 * Primary filled button — main action per screen.
 *
 * Usage: "Accept Trip", "Capture POD", "Submit"
 */
@Composable
fun AxlePrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(ButtonHeight),
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        contentPadding = PaddingValues(horizontal = ButtonHorizontalPadding),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
        )
    }
}

/**
 * Secondary outlined button — alternative action.
 *
 * Usage: "Reject", "Cancel", "Skip"
 */
@Composable
fun AxleSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(ButtonHeight),
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        contentPadding = PaddingValues(horizontal = ButtonHorizontalPadding),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
        )
    }
}

/**
 * Text (ghost) button — tertiary actions.
 *
 * Usage: "Learn more", "View details"
 */
@Composable
fun AxleTextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    TextButton(
        onClick = onClick,
        modifier = modifier.height(ButtonHeight),
        enabled = enabled,
        contentPadding = PaddingValues(horizontal = ButtonHorizontalPadding),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
        )
    }
}

/**
 * Destructive button — dangerous actions requiring confirmation.
 *
 * Usage: "Reject Trip", "Delete"
 * Always wrap in [AxleConfirmationDialog] before executing.
 */
@Composable
fun AxleDestructiveButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(ButtonHeight),
        enabled = enabled,
        shape = MaterialTheme.shapes.medium,
        colors = ButtonDefaults.buttonColors(
            containerColor = AxleError,
            contentColor = AxleOnPrimary,
        ),
        contentPadding = PaddingValues(horizontal = ButtonHorizontalPadding),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
        )
    }
}

/**
 * Icon button — compact circular actions (48dp × 48dp).
 *
 * Usage: camera, back, close, options menu.
 */
@Composable
fun AxleIconButton(
    icon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    IconButton(
        onClick = onClick,
        modifier = modifier.size(ButtonHeight),
        enabled = enabled,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = MaterialTheme.colorScheme.primary,
        )
    }
}

/**
 * Floating Action Button — prominent circular action for list screens.
 *
 * Usage: "Add Trip", "New Expense"
 * Per FR-018, list screens may include an optional FAB.
 *
 * @param icon Icon to display inside the FAB.
 * @param contentDescription Accessibility description.
 * @param onClick Callback when tapped.
 */
@Composable
fun AxleFab(
    icon: ImageVector,
    contentDescription: String?,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FloatingActionButton(
        onClick = onClick,
        modifier = modifier,
        shape = CircleShape,
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
        )
    }
}

