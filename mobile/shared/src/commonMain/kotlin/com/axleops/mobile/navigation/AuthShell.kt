package com.axleops.mobile.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.arkivanov.decompose.extensions.compose.stack.Children
import com.arkivanov.decompose.extensions.compose.subscribeAsState
import com.axleops.mobile.analytics.AnalyticsService
import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.role.model.RoleConfig
import com.axleops.mobile.ui.shared.EmptyStateScreen
import com.axleops.mobile.ui.shared.OfflineBanner
import com.axleops.mobile.ui.shared.SettingsScreen
import org.koin.compose.koinInject

/**
 * Authenticated application shell — thin Compose rendering layer.
 *
 * Observes [ShellComponent] and renders:
 * - Top bar: screen title from active [TabComponent.title], back arrow when [canGoBack]
 * - Offline banner (when [isOffline] is true)
 * - Bottom navigation bar driven by [RoleConfig.tabs] with Material icons
 * - Content area from the active tab's [ChildStack] via Decompose's [Children]
 *
 * Per-tab backstack: each tab's [TabComponent] maintains its own [ChildStack].
 * Switching tabs preserves state. Re-tapping active tab resets to root.
 *
 * This composable is role-agnostic — it reads all configuration
 * from [ShellComponent] and [RoleConfig]. No role-specific logic lives here.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthShell(
    shellComponent: ShellComponent,
    roleConfig: RoleConfig,
    session: UserSession,
    onLogout: () -> Unit,
    isOffline: Boolean = false,
    lastUpdatedMs: Long? = null,
    dataSourceConfig: DataSourceConfig = DataSourceConfig.DEFAULT,
    onDataSourceChanged: ((DataSourceConfig) -> Unit)? = null,
    isDebugBuild: Boolean = false,
) {
    // Observe the active tab's title reactively
    val activeTitle by shellComponent.activeTitle.subscribeAsState()
    val tabPages by shellComponent.tabPages.subscribeAsState()

    // Get the active TabComponent from ChildPages
    val activeTabComponent = tabPages.items.getOrNull(tabPages.selectedIndex)?.instance

    // ── Screen-view tracking (T-FIX-04) ──────────────────────────────
    val analyticsService: AnalyticsService = koinInject()
    LaunchedEffect(activeTitle, activeTabComponent?.tabId) {
        analyticsService.trackScreenView(
            screenName = activeTitle,
            properties = buildMap {
                activeTabComponent?.tabId?.let { put("tab", it) }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = activeTitle,
                        style = MaterialTheme.typography.titleLarge,
                    )
                },
                navigationIcon = {
                    if (shellComponent.canGoBack) {
                        IconButton(onClick = { shellComponent.onBackPressed() }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
        bottomBar = {
            NavigationBar {
                roleConfig.tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = tabPages.selectedIndex == index,
                        onClick = { shellComponent.selectTab(index) },
                        icon = {
                            Icon(
                                imageVector = tab.icon,
                                contentDescription = tab.label,
                            )
                        },
                        label = { Text(tab.label) },
                    )
                }
            }
        },
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            // Offline banner between top bar and content
            if (isOffline) {
                OfflineBanner(lastUpdatedMs = lastUpdatedMs)
            }

            // Render the active tab's ChildStack using Decompose's Children composable
            if (activeTabComponent != null) {
                Children(stack = activeTabComponent.childStack) { child ->
                    RenderScreenChild(
                        screenChild = child.instance,
                        session = session,
                        onLogout = onLogout,
                        dataSourceConfig = dataSourceConfig,
                        onDataSourceChanged = onDataSourceChanged,
                        isDebugBuild = isDebugBuild,
                    )
                }
            }
        }
    }
}

/**
 * Render a [ScreenChild] variant as a Composable.
 *
 * This is the single point where pure-Kotlin [ScreenChild] maps to actual UI.
 * Feature epics add new branches here when they add new [ScreenChild] variants.
 */
@Composable
private fun RenderScreenChild(
    screenChild: ScreenChild,
    session: UserSession,
    onLogout: () -> Unit,
    dataSourceConfig: DataSourceConfig = DataSourceConfig.DEFAULT,
    onDataSourceChanged: ((DataSourceConfig) -> Unit)? = null,
    isDebugBuild: Boolean = false,
) {
    when (screenChild) {
        is ScreenChild.Landing -> {
            EmptyStateScreen(
                message = "${screenChild.tabLabel}: Coming soon",
                actionLabel = "Refresh",
                onAction = { /* Will connect to ViewModel in feature epic */ },
            )
        }
        is ScreenChild.Settings -> {
            SettingsScreen(
                session = session,
                dataSourceConfig = dataSourceConfig,
                isDebugBuild = isDebugBuild,
                onLogout = onLogout,
                onDataSourceChanged = onDataSourceChanged,
            )
        }
    }
}
