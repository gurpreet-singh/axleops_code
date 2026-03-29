package com.axleops.mobile.tracking.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryAlert
import androidx.compose.material.icons.filled.GpsNotFixed
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.axleops.mobile.tracking.model.LocationPermissionState
import com.axleops.mobile.ui.theme.Spacing

/**
 * Warning banners for location permission / tracking issues.
 *
 * All 7 banner variants use exact copy from status-copy-and-messaging.md §3.
 * Material icons (24dp), semantic theme colors at 10% opacity.
 *
 * FX-004: Spec-exact copy for all banners
 * FX-005: Device location off "Turn On Location" action
 * FX-006: Permission revocation banner (distinct from denial)
 * FX-009: Material icons replacing emoji
 * FX-010: Theme color tokens replacing hardcoded hex
 *
 * Source: spec §5.2, UX status-copy-and-messaging.md §3
 */

// ---- Banner variants ----

/**
 * §3.1 — Location permission denied. Persistent, dismissible per-session.
 */
@Composable
fun ForegroundDeniedBanner(
    onGoToSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.Warning,
        message = "Location tracking is off.",
        subtext = "Trip can continue without GPS.",
        actionLabel = "Enable in Settings",
        onAction = onGoToSettings,
        severity = BannerSeverity.WARNING,
        modifier = modifier,
    )
}

/**
 * §3.2 — Background tracking limited. One-time per trip.
 */
@Composable
fun BackgroundDeniedBanner(
    onGoToSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.Info,
        message = "Background tracking is limited.",
        subtext = "Location may not be recorded when you switch apps.",
        actionLabel = "Enable",
        onAction = onGoToSettings,
        severity = BannerSeverity.INFO,
        modifier = modifier,
    )
}

/**
 * §3.1 variant — Permission permanently denied (Settings required).
 */
@Composable
fun PermanentlyDeniedBanner(
    onGoToSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.Warning,
        message = "Location tracking is off.",
        subtext = "Go to Settings to enable location access.",
        actionLabel = "Go to Settings",
        onAction = onGoToSettings,
        severity = BannerSeverity.WARNING,
        modifier = modifier,
    )
}

/**
 * §3.3 — Device location turned off. Non-dismissible, auto-clears on enable.
 * FX-005: Now includes "Turn On Location" action button.
 */
@Composable
fun DeviceLocationOffBanner(
    onTurnOnLocation: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.LocationOff,
        message = "Your device location is turned off.",
        subtext = "Turn on Location in your device settings.",
        actionLabel = "Turn On Location",
        onAction = onTurnOnLocation,
        severity = BannerSeverity.WARNING,
        modifier = modifier,
    )
}

/**
 * §3.4 — Permission revoked during active tracking. One-time.
 * FX-006: New banner variant distinct from initial denial.
 */
@Composable
fun PermissionRevokedBanner(
    onGoToSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.Warning,
        message = "Location permission was removed.",
        subtext = "Tracking has stopped.",
        actionLabel = "Go to Settings",
        onAction = onGoToSettings,
        severity = BannerSeverity.WARNING,
        modifier = modifier,
    )
}

/**
 * §3.5 — GPS signal lost. Non-dismissible, auto-clears on fix acquired.
 */
@Composable
fun SignalLostBanner(
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.GpsNotFixed,
        message = "GPS signal lost.",
        subtext = "Location tracking will resume when signal is available.",
        actionLabel = null,
        onAction = null,
        severity = BannerSeverity.ERROR,
        modifier = modifier,
    )
}

/**
 * §3.6 — iOS reduced accuracy. One-time per trip.
 */
@Composable
fun ReducedAccuracyBanner(
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.Info,
        message = "Approximate location only.",
        subtext = "Trip tracking may be less accurate.",
        actionLabel = null,
        onAction = null,
        severity = BannerSeverity.INFO,
        modifier = modifier,
    )
}

/**
 * §3.7 — Battery optimization active (Android). Once per trip.
 * FX-007: New banner variant.
 */
@Composable
fun BatteryOptimizationBanner(
    onLearnMore: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TrackingBanner(
        icon = Icons.Filled.BatteryAlert,
        message = "Battery optimization may affect location tracking.",
        subtext = "Some device settings can prevent background tracking.",
        actionLabel = "Learn More",
        onAction = onLearnMore,
        severity = BannerSeverity.INFO,
        modifier = modifier,
    )
}

// ---- Dispatch composable ----

/**
 * Renders the appropriate permission/tracking banner for the given state.
 * Returns null (no composition) if no banner is needed.
 *
 * @param wasPermissionRevoked True if permission was revoked during an active
 *   tracking session (as opposed to never being granted). Used to show the
 *   distinct revocation banner (§3.4) instead of the generic denial banner (§3.1).
 * @param dismissTracker Banner dismiss state tracker for respecting dismiss scopes.
 * @param tripId Current trip ID for per-trip dismiss scope.
 * @param onOpenLocationSettings Opens device location settings (for device-off banner).
 */
@Composable
fun LocationPermissionBanner(
    permissionState: LocationPermissionState,
    isDeviceLocationEnabled: Boolean,
    isSignalLost: Boolean,
    wasPermissionRevoked: Boolean = false,
    isBatteryOptimized: Boolean = false,
    dismissTracker: BannerDismissTracker? = null,
    tripId: Long? = null,
    onGoToSettings: () -> Unit,
    onOpenLocationSettings: () -> Unit = onGoToSettings,
    onBatteryLearnMore: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    when {
        // Signal lost — non-dismissible, auto-cleared
        isSignalLost -> {
            SignalLostBanner(modifier = modifier)
        }
        // Device location off — non-dismissible, auto-cleared
        !isDeviceLocationEnabled -> {
            DeviceLocationOffBanner(
                onTurnOnLocation = onOpenLocationSettings,
                modifier = modifier,
            )
        }
        // Permission revoked (distinct from initial denial)
        wasPermissionRevoked && permissionState.isDenied -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.PERMISSION_REVOKED) == true
            if (!dismissed) {
                PermissionRevokedBanner(
                    onGoToSettings = onGoToSettings,
                    modifier = modifier,
                )
            }
        }
        // Permanently denied
        permissionState is LocationPermissionState.PermanentlyDenied -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.PERMISSION_DENIED) == true
            if (!dismissed) {
                PermanentlyDeniedBanner(onGoToSettings = onGoToSettings, modifier = modifier)
            }
        }
        // Foreground denied
        permissionState is LocationPermissionState.Denied -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.PERMISSION_DENIED) == true
            if (!dismissed) {
                ForegroundDeniedBanner(onGoToSettings = onGoToSettings, modifier = modifier)
            }
        }
        // Foreground only — background limited
        permissionState is LocationPermissionState.ForegroundOnly -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.BACKGROUND_LIMITED, tripId) == true
            if (!dismissed) {
                BackgroundDeniedBanner(onGoToSettings = onGoToSettings, modifier = modifier)
            }
        }
        // Reduced accuracy (iOS)
        permissionState is LocationPermissionState.ReducedAccuracy -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.REDUCED_ACCURACY, tripId) == true
            if (!dismissed) {
                ReducedAccuracyBanner(modifier = modifier)
            }
        }
        // Battery optimization active (Android) — show after permission banners
        isBatteryOptimized -> {
            val dismissed = dismissTracker?.isDismissed(BannerType.BATTERY_OPTIMIZATION, tripId) == true
            if (!dismissed) {
                BatteryOptimizationBanner(
                    onLearnMore = onBatteryLearnMore,
                    modifier = modifier,
                )
            }
        }
        // No banner needed for ForegroundAndBackground and NotDetermined
    }
}

// ---- Internal: Shared banner layout ----

/**
 * Severity levels for banner theming.
 */
private enum class BannerSeverity {
    WARNING, // Amber — permission/state issues
    ERROR,   // Red — signal loss, critical
    INFO,    // Blue — informational
}

/**
 * Shared banner layout with Material icon, message, subtext, and optional action.
 *
 * FX-009: Uses [Icon] composable instead of emoji text.
 * FX-010: Uses semantic [MaterialTheme.colorScheme] tokens at 10% opacity instead of hardcoded hex.
 */
@Composable
private fun TrackingBanner(
    icon: ImageVector,
    message: String,
    subtext: String,
    actionLabel: String?,
    onAction: (() -> Unit)?,
    severity: BannerSeverity,
    modifier: Modifier = Modifier,
) {
    val (backgroundColor, accentColor) = when (severity) {
        BannerSeverity.WARNING -> Pair(
            MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.15f),
            Color(0xFFF59E0B), // Amber — spec says color.warning
        )
        BannerSeverity.ERROR -> Pair(
            MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.15f),
            MaterialTheme.colorScheme.error,
        )
        BannerSeverity.INFO -> Pair(
            MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.15f),
            MaterialTheme.colorScheme.primary,
        )
    }
    val textColor = MaterialTheme.colorScheme.onSurface

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor)
            .padding(horizontal = Spacing.lg, vertical = Spacing.md),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = accentColor,
            modifier = Modifier.size(24.dp),
        )
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = textColor,
            )
            Text(
                text = subtext,
                style = MaterialTheme.typography.bodySmall,
                color = textColor.copy(alpha = 0.7f),
            )
        }
        if (actionLabel != null && onAction != null) {
            Text(
                text = actionLabel,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = accentColor,
                textDecoration = TextDecoration.Underline,
                modifier = Modifier.clickable { onAction() },
            )
        }
    }
}
