package com.axleops.mobile.ui.shared

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.DataSourceMode
import com.axleops.mobile.ui.theme.Spacing

/**
 * Settings screen — shared across all roles.
 *
 * Displays:
 * - User profile section (name, role, email)
 * - Debug data-source toggles (non-production only)
 * - Logout button
 *
 * @param session Current user session.
 * @param dataSourceConfig Current feature-level data source config.
 * @param isDebugBuild Whether debug toggles should be visible.
 * @param onLogout Callback to trigger logout.
 * @param onDataSourceChanged Callback when a data source toggle changes.
 */
@Composable
fun SettingsScreen(
    session: UserSession,
    dataSourceConfig: DataSourceConfig,
    isDebugBuild: Boolean = false,
    onLogout: () -> Unit,
    onDataSourceChanged: ((DataSourceConfig) -> Unit)? = null,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(Spacing.md),
    ) {
        // ── Profile Section ──────────────────────────────────────────────
        Text(
            text = "Profile",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(Spacing.sm))
        SettingsRow(label = "Name", value = session.displayName)
        SettingsRow(label = "Role", value = session.activeRole.backendValue)
        SettingsRow(label = "User ID", value = session.userId)
        if (session.branchId != null) {
            SettingsRow(label = "Branch", value = session.branchId)
        }

        Spacer(modifier = Modifier.height(Spacing.lg))
        HorizontalDivider()
        Spacer(modifier = Modifier.height(Spacing.lg))

        // ── Debug Section (non-prod only) ────────────────────────────────
        if (isDebugBuild && onDataSourceChanged != null) {
            Text(
                text = "Debug: Data Sources",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.secondary,
            )
            Spacer(modifier = Modifier.height(Spacing.sm))

            var config by remember { mutableStateOf(dataSourceConfig) }

            DataSourceToggle(
                label = "Auth",
                mode = config.authSource,
                onToggle = {
                    config = config.copy(authSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Trips",
                mode = config.tripSource,
                onToggle = {
                    config = config.copy(tripSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Earnings",
                mode = config.earningsSource,
                onToggle = {
                    config = config.copy(earningsSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Upload",
                mode = config.uploadSource,
                onToggle = {
                    config = config.copy(uploadSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Vehicle",
                mode = config.vehicleSource,
                onToggle = {
                    config = config.copy(vehicleSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Contact",
                mode = config.contactSource,
                onToggle = {
                    config = config.copy(contactSource = it)
                    onDataSourceChanged(config)
                },
            )
            DataSourceToggle(
                label = "Milestones",
                mode = config.milestoneSource,
                onToggle = {
                    config = config.copy(milestoneSource = it)
                    onDataSourceChanged(config)
                },
            )

            Spacer(modifier = Modifier.height(Spacing.lg))
            HorizontalDivider()
            Spacer(modifier = Modifier.height(Spacing.lg))
        }

        // ── App Info ─────────────────────────────────────────────────────
        Text(
            text = "App",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(Spacing.sm))
        SettingsRow(label = "Version", value = "1.0.0")
        SettingsRow(label = "Build", value = if (isDebugBuild) "Debug" else "Release")

        Spacer(modifier = Modifier.height(Spacing.xl))

        // ── Logout ───────────────────────────────────────────────────────
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error,
            ),
        ) {
            Text("Sign Out")
        }
    }
}

@Composable
private fun SettingsRow(label: String, value: String) {
    Column(modifier = Modifier.padding(vertical = Spacing.xs)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
        )
    }
}

@Composable
private fun DataSourceToggle(
    label: String,
    mode: DataSourceMode,
    onToggle: (DataSourceMode) -> Unit,
) {
    Column(modifier = Modifier.padding(vertical = Spacing.xs)) {
        Text(
            text = "$label: ${if (mode == DataSourceMode.REAL) "Real API" else "Mock"}",
            style = MaterialTheme.typography.bodyMedium,
        )
        Switch(
            checked = mode == DataSourceMode.REAL,
            onCheckedChange = { isReal ->
                onToggle(if (isReal) DataSourceMode.REAL else DataSourceMode.MOCK)
            },
        )
    }
}
