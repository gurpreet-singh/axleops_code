package com.axleops.mobile.ui.shared

import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.Inbox
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.WifiOff
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.AxleWarning
import com.axleops.mobile.ui.theme.Motion
import com.axleops.mobile.ui.theme.Spacing

// ── Skeleton Components (T013, T014) ─────────────────────────────────────────

/**
 * Animated shimmer rectangle used as a placeholder line.
 *
 * @param width Line width. Use [Modifier.fillMaxWidth] for full-width lines.
 * @param height Line height (default 14dp to match body text).
 */
@Composable
fun SkeletonLine(
    modifier: Modifier = Modifier,
    width: Dp = 200.dp,
    height: Dp = 14.dp,
) {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val alpha by transition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.35f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "shimmerAlpha",
    )

    Box(
        modifier = modifier
            .width(width)
            .height(height)
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.onSurface.copy(alpha = alpha)),
    )
}

/**
 * Card-shaped skeleton placeholder with shimmer lines.
 *
 * Mimics the structure of a standard card: title line + 2 body lines.
 */
@Composable
fun SkeletonCard(
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        SkeletonLine(width = 160.dp, height = 16.dp) // title
        SkeletonLine(modifier = Modifier.fillMaxWidth(), height = 12.dp) // body line 1
        SkeletonLine(width = 120.dp, height = 12.dp) // body line 2
    }
}

/**
 * Column of [SkeletonCard] items simulating a loading list.
 *
 * @param itemCount Number of skeleton cards to show (default 4).
 */
@Composable
fun SkeletonList(
    modifier: Modifier = Modifier,
    itemCount: Int = 4,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(Spacing.screen),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        repeat(itemCount) {
            SkeletonCard()
        }
    }
}

// ── Loading Indicator ────────────────────────────────────────────────────────

/**
 * Full-screen skeleton loading layout.
 *
 * Shows a list of skeleton cards matching expected content shape
 * (per design system spec — skeletons over spinners).
 */
@Composable
fun LoadingIndicator(
    modifier: Modifier = Modifier,
) {
    SkeletonList(modifier = modifier)
}

// ── Empty State (T017) ───────────────────────────────────────────────────────

/**
 * Full-screen empty state with optional icon.
 *
 * @param message Description of why the screen is empty.
 * @param icon Optional icon/illustration (64dp). Defaults to [Icons.Outlined.Inbox].
 * @param actionLabel Optional CTA button text (e.g., "Refresh").
 * @param onAction Optional callback when CTA is tapped.
 */
@Composable
fun EmptyStateScreen(
    message: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = Icons.Outlined.Inbox,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.height(Spacing.lg))
        }
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Button(onClick = onAction) {
                Text(actionLabel)
            }
        }
    }
}

// ── Error State ──────────────────────────────────────────────────────────────

/**
 * Full-screen error state with icon, retry button, and escalation text.
 *
 * After [retryCount] reaches [RETRY_ESCALATION_THRESHOLD] (3),
 * secondary help text appears below the retry button.
 *
 * @param message User-friendly error description.
 * @param retryCount Number of times the user has already retried.
 * @param onRetry Callback to retry the failed operation.
 */
@Composable
fun ErrorStateScreen(
    message: String,
    modifier: Modifier = Modifier,
    retryCount: Int = 0,
    onRetry: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = Icons.Outlined.ErrorOutline,
            contentDescription = "Error",
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.error,
        )
        Spacer(modifier = Modifier.height(Spacing.lg))
        Text(
            text = message,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.error,
            textAlign = TextAlign.Center,
        )
        if (onRetry != null) {
            Spacer(modifier = Modifier.height(Spacing.lg))
            Button(onClick = onRetry) {
                Text("Retry")
            }
        }
        // ── Retry Escalation (T046) ─────────────────────────────
        if (retryCount >= RETRY_ESCALATION_THRESHOLD) {
            Spacer(modifier = Modifier.height(Spacing.sm))
            Text(
                text = "If this continues, contact support",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
        }
    }
}

/** Number of retries before escalation text appears. */
private const val RETRY_ESCALATION_THRESHOLD = 3

// ── Offline Banner (T015) ────────────────────────────────────────────────────

/**
 * Full-width warning bar indicating offline state.
 *
 * Sticky below the top bar. Shows wifi-off icon + label + optional
 * "Last updated X min ago" timestamp.
 *
 * @param lastUpdatedMs Epoch millis of last successful data fetch, or null.
 */
@Composable
fun OfflineBanner(
    modifier: Modifier = Modifier,
    lastUpdatedMs: Long? = null,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(AxleWarning)
            .padding(horizontal = Spacing.lg, vertical = Spacing.sm),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Outlined.WifiOff,
            contentDescription = "Offline",
            modifier = Modifier.size(18.dp),
            tint = MaterialTheme.colorScheme.onPrimary,
        )
        Spacer(modifier = Modifier.width(Spacing.sm))
        Text(
            text = buildOfflineLabel(lastUpdatedMs),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onPrimary,
        )
    }
}

/**
 * Builds the offline banner label with an optional "last updated" suffix.
 */
private fun buildOfflineLabel(lastUpdatedMs: Long?): String {
    val base = "No internet connection"
    if (lastUpdatedMs == null) return base
    val now = kotlin.time.Clock.System.now().toEpochMilliseconds()
    val diffMinutes: Long = ((now - lastUpdatedMs) / 60_000L).coerceAtLeast(0L)
    return when {
        diffMinutes < 1L -> "$base · Last updated just now"
        diffMinutes == 1L -> "$base · Last updated 1 min ago"
        diffMinutes < 60L -> "$base · Last updated $diffMinutes min ago"
        else -> {
            val hours = diffMinutes / 60L
            if (hours == 1L) "$base · Last updated 1 hour ago"
            else "$base · Last updated $hours hours ago"
        }
    }
}

// ── Blocked Hint (T016) ──────────────────────────────────────────────────────

/**
 * Inline block-reason display with lock icon and optional resolution button.
 *
 * @param reason Why the screen/action is blocked.
 * @param resolution Optional label for the resolution CTA.
 * @param onResolve Optional callback for the resolution action.
 */
@Composable
fun BlockedHint(
    reason: String,
    modifier: Modifier = Modifier,
    resolution: String? = null,
    onResolve: (() -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = Icons.Outlined.Lock,
            contentDescription = "Blocked",
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(Spacing.lg))
        Text(
            text = reason,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        if (resolution != null && onResolve != null) {
            Spacer(modifier = Modifier.height(Spacing.md))
            TextButton(onClick = onResolve) {
                Text(resolution)
            }
        }
    }
}

// ── UiStateHandler (T018) ────────────────────────────────────────────────────

/**
 * Convenience composable that renders the appropriate state screen
 * based on [UiState], delegating [UiState.DataLoaded] to [content].
 *
 * When [animate] is true (default), state transitions use a fade
 * crossfade (FR-029) with [Motion.FADE_DURATION_MS]. Set to false
 * for performance-sensitive screens that need instant state cuts.
 *
 * Handles all 6 canonical states:
 * - [UiState.Loading] → [LoadingIndicator] (skeleton list)
 * - [UiState.Empty] → [EmptyStateScreen]
 * - [UiState.Error] → [ErrorStateScreen]
 * - [UiState.DataLoaded] → content lambda
 * - [UiState.Offline] → [OfflineBanner] + stale content (or empty state)
 * - [UiState.Blocked] → [BlockedHint]
 *
 * @param animate Whether to animate state transitions (default true).
 */
@Composable
fun <T> UiStateHandler(
    state: UiState<T>,
    modifier: Modifier = Modifier,
    animate: Boolean = true,
    content: @Composable (T) -> Unit,
) {
    if (animate) {
        Crossfade(
            targetState = state,
            animationSpec = tween(durationMillis = Motion.FADE_DURATION_MS),
            label = "uiStateCrossfade",
            modifier = modifier,
        ) { currentState ->
            UiStateContent(currentState, content)
        }
    } else {
        UiStateContent(state, content, modifier)
    }
}

/**
 * Internal: renders the appropriate screen for a given [UiState].
 * Extracted to avoid duplicating the `when` block in animated vs non-animated paths.
 */
@Composable
private fun <T> UiStateContent(
    state: UiState<T>,
    content: @Composable (T) -> Unit,
    modifier: Modifier = Modifier,
) {
    when (state) {
        is UiState.Loading -> LoadingIndicator(modifier = modifier)

        is UiState.Empty -> EmptyStateScreen(
            message = state.message,
            actionLabel = state.actionLabel,
            onAction = state.onAction,
            modifier = modifier,
        )

        is UiState.Error -> ErrorStateScreen(
            message = state.message,
            retryCount = state.retryCount,
            onRetry = state.onRetry,
            modifier = modifier,
        )

        is UiState.DataLoaded -> content(state.data)

        is UiState.Offline -> {
            Column(modifier = modifier) {
                OfflineBanner(lastUpdatedMs = state.lastUpdatedMs)
                if (state.staleData != null) {
                    content(state.staleData)
                } else {
                    EmptyStateScreen(
                        message = "No cached data available",
                        icon = Icons.Outlined.WifiOff,
                    )
                }
            }
        }

        is UiState.Blocked -> BlockedHint(
            reason = state.reason,
            resolution = state.resolution,
            onResolve = state.onResolve,
        )
    }
}

