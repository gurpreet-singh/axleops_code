package com.axleops.mobile.ui.shared

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.axleops.mobile.ui.theme.Spacing

/**
 * Full-screen message for users whose role is not supported on mobile.
 *
 * Shown when:
 * - User's only backend roles are not registered in [RoleRegistry]
 * - [AuthState.NoSupportedRoles] was emitted during role resolution
 *
 * @param roleName Optional role name to display (for context).
 */
@Composable
fun UnsupportedRoleScreen(
    roleName: String? = null,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(Spacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "Role Not Available",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(modifier = Modifier.height(Spacing.md))
        Text(
            text = if (roleName != null) {
                "The $roleName role is not yet available on mobile.\nPlease use the AxleOps web portal."
            } else {
                "Your assigned role is not yet available on mobile.\nPlease use the AxleOps web portal."
            },
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
    }
}
