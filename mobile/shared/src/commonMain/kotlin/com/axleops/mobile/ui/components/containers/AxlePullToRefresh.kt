package com.axleops.mobile.ui.components.containers

import androidx.compose.foundation.layout.Box
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * Shared pull-to-refresh wrapper (FR-019, IR §5.3).
 *
 * Wraps content in a Material3 [PullToRefreshBox] with consistent behavior.
 *
 * Rules (per interaction rules):
 * - Available on all list screens and single-item screens
 * - Not available on detail screens, action screens, or settings
 * - Disabled when offline (no network to fetch from)
 * - Existing content stays visible during refresh
 *
 * @param isRefreshing Whether a refresh is currently in progress.
 * @param onRefresh Callback triggered when user pulls to refresh.
 * @param enabled If false (e.g., offline), pull gesture is ignored.
 * @param content The scrollable content to wrap.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AxlePullToRefresh(
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    content: @Composable () -> Unit,
) {
    if (enabled) {
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = onRefresh,
            modifier = modifier,
        ) {
            content()
        }
    } else {
        Box(modifier = modifier) {
            content()
        }
    }
}
