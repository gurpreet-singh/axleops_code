package com.axleops.mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.axleops.mobile.trip.component.MilestoneActionComponent
import com.axleops.mobile.trip.component.MilestoneFormType
import com.axleops.mobile.ui.theme.Spacing

/**
 * Milestone Action screen — context-sensitive form for milestone transitions.
 *
 * Renders different forms based on [MilestoneFormType]:
 * - SIMPLE_CONFIRM: just a "Confirm" button with GPS auto-capture
 * - LOADING_COMPLETE: weight, seal number, photos
 * - DELIVERY_COMPLETE: delivered weight, cargo condition
 * - SUBMIT_POD: placeholder (full multi-step flow in §6)
 *
 * Source: spec FR-020–FR-028, plan §4
 */
@Composable
fun MilestoneActionScreen(
    component: MilestoneActionComponent,
    modifier: Modifier = Modifier,
) {
    val uiState by component.uiState.collectAsState()

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.lg),
        ) {
            // Header
            Text(
                text = formTitle(uiState.formType),
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )

            // Form content
            when (uiState.formType) {
                MilestoneFormType.SIMPLE_CONFIRM -> {
                    SimpleConfirmForm(
                        eventName = uiState.event,
                    )
                }
                MilestoneFormType.LOADING_COMPLETE -> {
                    LoadingCompleteForm(
                        formData = uiState.formData,
                        onFieldChanged = { key, value -> component.updateField(key, value) },
                    )
                }
                MilestoneFormType.DELIVERY_COMPLETE -> {
                    DeliveryCompleteForm(
                        formData = uiState.formData,
                        onFieldChanged = { key, value -> component.updateField(key, value) },
                    )
                }
                MilestoneFormType.SUBMIT_POD -> {
                    PodPlaceholderForm()
                }
            }

            // Submit button
            Button(
                onClick = { component.submit(capturedData = uiState.formData) },
                modifier = Modifier.fillMaxWidth(),
                enabled = !uiState.isSubmitting && !uiState.isComplete,
            ) {
                if (uiState.isSubmitting) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                } else if (uiState.isComplete) {
                    Text("✓ Done")
                } else {
                    Text(submitLabel(uiState.formType))
                }
            }
        }

        // Error snackbar
        uiState.error?.let { error ->
            Snackbar(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(Spacing.lg),
                action = {
                    TextButton(onClick = { component.dismissError() }) {
                        Text("Dismiss")
                    }
                },
            ) {
                Text(error)
            }
        }
    }
}

@Composable
private fun SimpleConfirmForm(eventName: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Text(
                text = "Confirm: $eventName",
                style = MaterialTheme.typography.bodyLarge,
            )
            Text(
                text = "GPS coordinates and timestamp will be captured automatically.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun LoadingCompleteForm(
    formData: Map<String, String>,
    onFieldChanged: (String, String) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
        OutlinedTextField(
            value = formData["actual_weight_mt"] ?: "",
            onValueChange = { onFieldChanged("actual_weight_mt", it) },
            label = { Text("Actual Weight (MT)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        OutlinedTextField(
            value = formData["seal_number"] ?: "",
            onValueChange = { onFieldChanged("seal_number", it) },
            label = { Text("Seal Number") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Text(
            text = "📷 Photo capture: Coming in §6 (Evidence handling)",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun DeliveryCompleteForm(
    formData: Map<String, String>,
    onFieldChanged: (String, String) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
        OutlinedTextField(
            value = formData["delivered_weight_mt"] ?: "",
            onValueChange = { onFieldChanged("delivered_weight_mt", it) },
            label = { Text("Delivered Weight (MT)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        OutlinedTextField(
            value = formData["cargo_condition"] ?: "",
            onValueChange = { onFieldChanged("cargo_condition", it) },
            label = { Text("Cargo Condition (GOOD / DAMAGED / PARTIAL_DAMAGE)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
    }
}

@Composable
private fun PodPlaceholderForm() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Text(
                text = "POD Submission",
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Full multi-step POD flow (photos, signature, consignee) will be implemented in §6.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

private fun formTitle(type: MilestoneFormType): String = when (type) {
    MilestoneFormType.SIMPLE_CONFIRM -> "Confirm Action"
    MilestoneFormType.LOADING_COMPLETE -> "Loading Complete"
    MilestoneFormType.DELIVERY_COMPLETE -> "Delivery Complete"
    MilestoneFormType.SUBMIT_POD -> "Submit POD"
}

private fun submitLabel(type: MilestoneFormType): String = when (type) {
    MilestoneFormType.SIMPLE_CONFIRM -> "Confirm"
    MilestoneFormType.LOADING_COMPLETE -> "Complete Loading"
    MilestoneFormType.DELIVERY_COMPLETE -> "Complete Delivery"
    MilestoneFormType.SUBMIT_POD -> "Submit POD"
}
