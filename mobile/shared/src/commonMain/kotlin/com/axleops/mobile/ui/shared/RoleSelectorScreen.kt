package com.axleops.mobile.ui.shared

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.axleops.mobile.role.model.AppRole
import com.axleops.mobile.role.registry.RoleRegistry
import com.axleops.mobile.ui.theme.Elevation
import com.axleops.mobile.ui.theme.Spacing

/**
 * Role selector screen.
 *
 * Shown when a user has multiple mobile-supported roles.
 * Displays only roles that are:
 * 1. In the user's backend role list
 * 2. Registered in [RoleRegistry] (mobile-supported)
 * 3. Not "ALL" (filtered per spec)
 *
 * @param displayName User's name for greeting.
 * @param supportedRoles Filtered list of roles to display.
 * @param onRoleSelected Callback when user picks a role.
 */
@Composable
fun RoleSelectorScreen(
    displayName: String,
    supportedRoles: List<AppRole>,
    onRoleSelected: (AppRole) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = Spacing.lg, vertical = Spacing.xxl),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "Welcome, $displayName",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(modifier = Modifier.height(Spacing.sm))
        Text(
            text = "Select your role to continue",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(Spacing.lg))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            items(supportedRoles) { role ->
                val config = RoleRegistry.getConfig(role)
                RoleCard(
                    label = config?.label ?: role.backendValue,
                    description = roleDescription(role),
                    onClick = { onRoleSelected(role) },
                )
            }
        }
    }
}

@Composable
private fun RoleCard(
    label: String,
    description: String,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = Elevation.low),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(Spacing.md),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(
                text = "→",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

private fun roleDescription(role: AppRole): String = when (role) {
    AppRole.DRIVER -> "View trips, earnings, and vehicle info"
    AppRole.OPERATIONS_EXECUTIVE -> "Manage fleet operations and dispatch"
    AppRole.WORKSHOP_MANAGER -> "Oversee vehicle maintenance"
    AppRole.MECHANIC -> "Track assigned work orders"
    AppRole.BRANCH_MANAGER -> "Branch-level fleet management"
}
