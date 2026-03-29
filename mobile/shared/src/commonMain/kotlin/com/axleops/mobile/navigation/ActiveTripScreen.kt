package com.axleops.mobile.navigation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.axleops.mobile.trip.component.ActiveTripComponent
import com.axleops.mobile.trip.state.CtaState
import com.axleops.mobile.trip.state.TripStateMachine
import com.axleops.mobile.trip.state.TripUiState
import com.axleops.mobile.ui.shared.ErrorStateScreen
import com.axleops.mobile.ui.shared.EmptyStateScreen
import com.axleops.mobile.ui.shared.LoadingIndicator
import com.axleops.mobile.ui.theme.Spacing

/**
 * Active Trip screen -- the primary driver view when a trip is assigned.
 *
 * Renders 4 states:
 * - Loading: content-shaped skeleton (per design system §2.6)
 * - NoTrip: empty state with illustration text
 * - Error: error icon + retry button (per design system §2.6)
 * - Active: trip card with CTA and confirmation modals
 *
 * Fixes applied:
 * - FX-001 ⟵ OI-001: skeleton loading (was spinner), proper ErrorScreen (was EmptyStateScreen)
 * - FX-005 ⟵ OI-006 + OI-022: Accept/Reject confirmation modals with reject reason field
 */
@Composable
fun ActiveTripScreen(
    component: ActiveTripComponent,
    modifier: Modifier = Modifier,
) {
    val uiState by component.uiState.collectAsState()

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        when (val state = uiState) {
            is TripUiState.Loading -> {
                // FX-001: skeleton instead of spinner
                LoadingIndicator()
            }

            is TripUiState.NoTrip -> {
                EmptyStateScreen(
                    message = "No active trip assigned.\nCheck back when a trip is dispatched to you.",
                    actionLabel = "Refresh",
                    onAction = { component.refresh() },
                )
            }

            is TripUiState.Error -> {
                // FX-001: ErrorStateScreen instead of EmptyStateScreen
                ErrorStateScreen(
                    message = "Something went wrong:\n${state.message}",
                    onRetry = { component.refresh() },
                )
            }

            is TripUiState.Active -> {
                ActiveTripContent(
                    state = state,
                    onAccept = { component.onAccept() },
                    onReject = { reason -> component.onReject(reason) },
                    onRefresh = { component.refresh() },
                )
            }
        }
    }
}

/**
 * Content for an active trip -- trip card with status and CTA buttons.
 *
 * FX-005: Accept/Reject now go through confirmation modals.
 * - Accept: modal with trip summary, Cancel + Confirm buttons
 * - Reject: modal with required reason text field (min 10 chars)
 */
@Composable
private fun ActiveTripContent(
    state: TripUiState.Active,
    onAccept: () -> Unit,
    onReject: (String) -> Unit,
    onRefresh: () -> Unit,
) {
    val trip = state.trip

    // FX-005: Confirmation dialog state (lives in Compose layer, not component)
    var showAcceptDialog by remember { mutableStateOf(false) }
    var showRejectDialog by remember { mutableStateOf(false) }
    var rejectReason by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
    ) {
        // Trip summary card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
            ),
        ) {
            Column(
                modifier = Modifier.padding(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
            ) {
                Text(
                    text = trip.tripNumber,
                    style = MaterialTheme.typography.titleLarge,
                )
                Text(
                    text = "${trip.originCity} \u2192 ${trip.destinationCity}",
                    style = MaterialTheme.typography.bodyLarge,
                )
                Text(
                    text = trip.status.driverLabel ?: trip.status.name,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )

                // Vehicle info
                trip.vehicleNumber?.let { vehicle ->
                    Text(
                        text = "Vehicle: $vehicle",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                // Cargo info
                trip.cargoDescription?.let { cargo ->
                    Text(
                        text = "Cargo: $cargo",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                // Weight
                trip.bookedWeightMt?.let { weight ->
                    Text(
                        text = "Weight: $weight MT",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                // Distance
                trip.totalDistanceKm?.let { distance ->
                    Text(
                        text = "Distance: $distance km",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        // CTA buttons
        when (val cta = state.ctaState) {
            is CtaState.Hidden -> { /* No button */ }

            is CtaState.Enabled -> {
                if (TripStateMachine.isAcceptPhase(trip.status)) {
                    // FX-005: Two buttons now trigger confirmation modals
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(Spacing.md),
                    ) {
                        OutlinedButton(
                            onClick = { showRejectDialog = true },
                            modifier = Modifier.weight(1f),
                            enabled = !state.isActionInProgress,
                        ) {
                            Text("Reject")
                        }
                        Button(
                            onClick = { showAcceptDialog = true },
                            modifier = Modifier.weight(1f),
                            enabled = !state.isActionInProgress,
                        ) {
                            if (state.isActionInProgress) {
                                CircularProgressIndicator(
                                    color = MaterialTheme.colorScheme.onPrimary,
                                )
                            } else {
                                Text(cta.label)
                            }
                        }
                    }
                } else {
                    // Single CTA button
                    Button(
                        onClick = { /* Will wire to milestone transition in §3 */ },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !state.isActionInProgress,
                    ) {
                        if (state.isActionInProgress) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.onPrimary,
                            )
                        } else {
                            Text(cta.label)
                        }
                    }
                }
            }

            is CtaState.Disabled -> {
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false,
                    colors = ButtonDefaults.buttonColors(
                        disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    ),
                ) {
                    Text(cta.label)
                }
                Text(
                    text = cta.reason,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                )
            }

            is CtaState.InProgress -> {
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false,
                ) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                }
            }
        }
    }

    // ── FX-005: Accept Confirmation Modal ────────────────────────────────
    if (showAcceptDialog) {
        AlertDialog(
            onDismissRequest = { showAcceptDialog = false },
            title = { Text("Accept this trip?") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                    Text("${trip.tripNumber}")
                    Text("${trip.originCity} → ${trip.destinationCity}")
                    trip.vehicleNumber?.let { Text("Vehicle: $it") }
                    trip.cargoDescription?.let { Text("Cargo: $it") }
                    Spacer(modifier = Modifier.height(Spacing.sm))
                    Text(
                        text = "Once accepted, this trip will be assigned to you.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    showAcceptDialog = false
                    onAccept()
                }) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAcceptDialog = false }) {
                    Text("Cancel")
                }
            },
        )
    }

    // ── FX-005: Reject Confirmation Modal with Reason Field ─────────────
    if (showRejectDialog) {
        AlertDialog(
            onDismissRequest = {
                showRejectDialog = false
                rejectReason = ""
            },
            title = { Text("Reject this trip?") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    Text(
                        text = "Please provide a reason for rejection.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    OutlinedTextField(
                        value = rejectReason,
                        onValueChange = { rejectReason = it },
                        label = { Text("Reason") },
                        placeholder = { Text("e.g., Vehicle not available") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        maxLines = 4,
                        isError = rejectReason.isNotEmpty() && rejectReason.length < MIN_REJECT_REASON_LENGTH,
                        supportingText = {
                            if (rejectReason.isNotEmpty() && rejectReason.length < MIN_REJECT_REASON_LENGTH) {
                                Text("Minimum $MIN_REJECT_REASON_LENGTH characters required")
                            }
                        },
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showRejectDialog = false
                        onReject(rejectReason)
                        rejectReason = ""
                    },
                    enabled = rejectReason.length >= MIN_REJECT_REASON_LENGTH,
                ) {
                    Text("Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showRejectDialog = false
                    rejectReason = ""
                }) {
                    Text("Cancel")
                }
            },
        )
    }
}

/** Minimum length for rejection reason per interaction-rules §2.1. */
private const val MIN_REJECT_REASON_LENGTH = 10
