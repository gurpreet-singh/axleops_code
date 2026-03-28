package com.axleops.mobile.navigation

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.auth.model.UserSession
import com.axleops.mobile.auth.session.SessionManager
import com.axleops.mobile.auth.model.MessageType
import com.axleops.mobile.auth.viewmodel.AuthState
import com.axleops.mobile.auth.viewmodel.AuthViewModel
import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.platform.AppLifecycleObserver
import com.axleops.mobile.platform.ConnectivityObserver
import com.axleops.mobile.platform.isDebugBuild
import com.axleops.mobile.role.model.RoleConfig
import com.axleops.mobile.role.registry.RoleRegistry
import com.axleops.mobile.ui.theme.AxleOpsTheme
import com.axleops.mobile.ui.shared.LoginScreen
import com.axleops.mobile.ui.shared.RoleSelectorScreen
import com.axleops.mobile.ui.shared.SessionRestoreScreen
import com.axleops.mobile.ui.shared.UnsupportedRoleScreen
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.qualifier.named
import org.koin.mp.KoinPlatform.getKoin

/**
 * Root navigation host for the AxleOps mobile app.
 *
 * Creates a [RootComponent] (Decompose) and observes [AuthViewModel.authState]
 * to render the appropriate screen:
 * - [AuthState.Unauthenticated] → [LoginScreen]
 * - [AuthState.LoggingIn] → [LoginScreen] with loading overlay
 * - [AuthState.RoleSelection] → [RoleSelectorScreen]
 * - [AuthState.NoSupportedRoles] → Unsupported role message
 * - [AuthState.Authenticated] → [AuthShell] with Decompose-powered tabs
 *
 * The auth state machine is still driven by [AuthViewModel] (Compose ViewModel).
 * When authenticated, the [RootComponent] creates a [ShellComponent] with the
 * role's tab configuration and screen factory.
 *
 * Collects the sessionExpired flow to auto-logout on 401 responses (US2 AC2).
 *
 * @param componentContext Decompose component context, created by the platform layer.
 */
@Composable
fun AppNavHost(
    componentContext: ComponentContext,
    authViewModel: AuthViewModel = koinViewModel(),
) {
    AxleOpsTheme {
        val rootComponent = remember { RootComponent(componentContext) }
        val authState by authViewModel.authState.collectAsState()

        // ── Connectivity Observer ────────────────────────────────────
        val connectivityObserver = remember { getKoin().get<ConnectivityObserver>() }
        val isOnline by connectivityObserver.isOnline.collectAsState()

        DisposableEffect(Unit) {
            connectivityObserver.startObserving()
            onDispose { connectivityObserver.stopObserving() }
        }

        // ── Session Manager + Lifecycle Observer (T025) ─────────────
        val sessionManager = remember { getKoin().get<SessionManager>() }
        val lifecycleObserver = remember { getKoin().get<AppLifecycleObserver>() }
        val coroutineScope = rememberCoroutineScope()

        DisposableEffect(Unit) {
            lifecycleObserver.startObserving(
                onForeground = {
                    coroutineScope.launch {
                        val expired = sessionManager.onAppForegrounded()
                        if (expired) {
                            rootComponent.detachShell()
                            authViewModel.forceLogout(
                                message = "Your session has expired. Please sign in again.",
                                messageType = MessageType.INFO,
                            )
                        }
                    }
                },
                onBackground = {
                    sessionManager.onAppBackgrounded()
                },
            )
            onDispose { lifecycleObserver.stopObserving() }
        }

        // Feed session token to SessionManager when authenticated
        LaunchedEffect(authState) {
            val state = authState
            if (state is AuthState.Authenticated) {
                sessionManager.setToken(state.session.jwt)
            }
        }

        // Auto-logout on 401 — collects from HttpClient's onUnauthorized callback
        val sessionExpired = remember {
            getKoin().get<MutableSharedFlow<Unit>>(named("sessionExpired"))
        }
        LaunchedEffect(Unit) {
            sessionExpired.collect {
                sessionManager.clearSession()
                rootComponent.detachShell()
                authViewModel.forceLogout(
                    message = "Your session has expired. Please sign in again.",
                    messageType = MessageType.INFO,
                )
            }
        }

        AnimatedContent(
            targetState = authState,
            transitionSpec = {
                fadeIn(tween(150)) togetherWith fadeOut(tween(150))
            },
            label = "auth-state-transition",
        ) { state ->
            when (state) {
                is AuthState.Unauthenticated -> {
                    rootComponent.detachShell()  // Ensure shell is cleaned up
                    LoginScreen(
                        isLoading = false,
                        message = state.message,
                        messageType = state.messageType,
                        onLogin = { email, password ->
                            authViewModel.login(email, password)
                        },
                    )
                }

                is AuthState.LoggingIn -> {
                    LoginScreen(
                        isLoading = true,
                        message = null,
                        onLogin = { _, _ -> },
                    )
                }

                is AuthState.Restoring -> {
                    SessionRestoreScreen()
                }

                is AuthState.RoleSelection -> {
                    rootComponent.detachShell()  // Ensure shell is cleaned up
                    RoleSelectorScreen(
                        displayName = state.profile.displayName,
                        supportedRoles = state.supportedRoles,
                        onRoleSelected = { role ->
                            authViewModel.selectRole(state.token, role)
                        },
                    )
                }

                is AuthState.NoSupportedRoles -> {
                    rootComponent.detachShell()
                    UnsupportedRoleScreen()
                }

                is AuthState.Authenticated -> {
                    AuthenticatedContent(
                        rootComponent = rootComponent,
                        session = state.session,
                        isOffline = !isOnline,
                        onLogout = {
                            rootComponent.detachShell()
                            authViewModel.logout()
                        },
                    )
                }
            }
        }
    }
}

/**
 * Renders the authenticated app — creates [ShellComponent] and delegates to [AuthShell].
 *
 * The [RoleConfig.screenFactory] maps screen configurations to screen children.
 * Settings tab is handled by [ScreenConfig.Settings] → [ScreenChild.Settings] →
 * rendered by [AuthShell.RenderScreenChild].
 */
@Composable
private fun AuthenticatedContent(
    rootComponent: RootComponent,
    session: UserSession,
    isOffline: Boolean,
    onLogout: () -> Unit,
) {
    val roleConfig: RoleConfig? = RoleRegistry.getConfig(session.activeRole)

    // ── Logout confirmation dialog (FIX-005 / OI-06) ────────────────
    var showLogoutDialog by remember { mutableStateOf(false) }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Sign Out") },
            text = { Text("Are you sure you want to sign out?") },
            confirmButton = {
                TextButton(onClick = {
                    showLogoutDialog = false
                    onLogout()
                }) {
                    Text("Sign Out")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel")
                }
            },
        )
    }

    if (roleConfig != null) {
        // ── Reactive DataSourceConfig (T-FIX-01) ────────────────────
        val dataSourceConfigFlow = remember { getKoin().get<MutableStateFlow<DataSourceConfig>>() }
        val dataSourceConfig by dataSourceConfigFlow.collectAsState()

        // Attach shell with Decompose component tree if not already attached
        if (rootComponent.shellComponent == null) {
            rootComponent.attachShell(
                tabs = roleConfig.tabConfigs,
                landingTabIndex = roleConfig.landingTabIndex,
                screenFactory = roleConfig.screenFactory,
            )
        }

        val shellComponent = rootComponent.shellComponent
        if (shellComponent != null) {
            AuthShell(
                shellComponent = shellComponent,
                roleConfig = roleConfig,
                session = session,
                isOffline = isOffline,
                dataSourceConfig = dataSourceConfig,
                onDataSourceChanged = { dataSourceConfigFlow.value = it },
                isDebugBuild = isDebugBuild,
                onLogout = { showLogoutDialog = true },
            )
        }
    } else {
        UnsupportedRoleScreen()
    }
}
