package com.axleops.mobile.ui.shared

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import com.axleops.mobile.auth.model.MessageType
import com.axleops.mobile.ui.theme.Spacing

/**
 * Login screen with email/password form.
 *
 * @param isLoading Whether a login request is in progress.
 * @param message Message from a failed login or session expiry (null if none).
 * @param messageType Semantic type of the message — determines display color.
 *   [MessageType.ERROR] → `color.error` (red), [MessageType.INFO] → `color.tertiary` (blue).
 * @param onLogin Callback with (email, password) when user submits.
 */
@Composable
fun LoginScreen(
    isLoading: Boolean,
    message: String?,
    messageType: MessageType = MessageType.ERROR,
    onLogin: (email: String, password: String) -> Unit,
) {
    // Debug prefill — remove before release
    var email by rememberSaveable { mutableStateOf("gurpreet_gt") }
    var password by rememberSaveable { mutableStateOf("gurpreet_gt") }

    // T-FIX-03: Error-clear-on-keystroke (UX interaction-rules §1.3)
    // Wrap external message in local state so it can be cleared on keystroke
    // and re-shown when the ViewModel emits a new message.
    var visibleMessage by rememberSaveable { mutableStateOf(message) }
    LaunchedEffect(message) {
        visibleMessage = message
    }

    val passwordFocusRequester = FocusRequester()

    // Helper to check if login can be submitted
    val canSubmit = !isLoading && email.isNotBlank() && password.isNotBlank()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = Spacing.lg, vertical = Spacing.xxl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        // App title
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

        // Email field
        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
                visibleMessage = null  // Clear error on keystroke
            },
            label = { Text("Email") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next,
            ),
            keyboardActions = KeyboardActions(
                onNext = { passwordFocusRequester.requestFocus() },
            ),
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading,
        )
        Spacer(modifier = Modifier.height(Spacing.md))

        // Password field
        OutlinedTextField(
            value = password,
            onValueChange = {
                password = it
                visibleMessage = null  // Clear error on keystroke
            },
            label = { Text("Password") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(
                onDone = { if (canSubmit) onLogin(email, password) },
            ),
            modifier = Modifier
                .fillMaxWidth()
                .focusRequester(passwordFocusRequester),
            enabled = !isLoading,
        )
        Spacer(modifier = Modifier.height(Spacing.lg))

        // Message (error or info)
        if (visibleMessage != null) {
            val messageColor = when (messageType) {
                MessageType.ERROR -> MaterialTheme.colorScheme.error
                MessageType.INFO -> MaterialTheme.colorScheme.tertiary
            }
            Text(
                text = visibleMessage!!,
                style = MaterialTheme.typography.bodyMedium,
                color = messageColor,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.semantics {
                    liveRegion = LiveRegionMode.Polite
                },
            )
            Spacer(modifier = Modifier.height(Spacing.md))
        }

        // Login button
        Button(
            onClick = { onLogin(email, password) },
            enabled = canSubmit,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .size(Spacing.xl)
                        .semantics { },
                    color = MaterialTheme.colorScheme.onPrimary,
                    strokeWidth = Spacing.xxs,
                )
            } else {
                Text("Sign In")
            }
        }
    }
}
