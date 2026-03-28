package com.axleops.mobile.ui.shared

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.Spacing

/**
 * Splash / session restore screen shown during cold-start re-validation.
 *
 * Displayed when [AuthState.Restoring] is active — the app has a persisted
 * session and is validating the token with `GET /auth/me` before entering
 * the driver shell.
 *
 * Layout: brand title + subtitle + centered spinner.
 * Duration: ≤ 2 seconds (timing budget from UX user-flow.md).
 *
 * See: spec FR-051, UX screen-map.md §Splash/Restore
 */
@Composable
fun SessionRestoreScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = "AxleOps",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(Spacing.sm))
        Text(
            text = "Fleet Management",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(Spacing.xxl))
        CircularProgressIndicator(
            modifier = Modifier.size(24.dp),
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 2.dp,
        )
    }
}
