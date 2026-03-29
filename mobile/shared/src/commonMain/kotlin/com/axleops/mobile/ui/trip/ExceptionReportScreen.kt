package com.axleops.mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.axleops.mobile.domain.model.ExceptionType
import com.axleops.mobile.trip.component.ExceptionReportComponent
import com.axleops.mobile.ui.theme.Spacing
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow

/**
 * Exception report screen — type picker, description, GPS auto, evidence photos.
 *
 * Source: spec FR-080–FR-084, plan §8
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ExceptionReportScreen(
    component: ExceptionReportComponent,
    modifier: Modifier = Modifier,
) {
    val uiState by component.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg),
    ) {
        Text(
            text = "Report Exception",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )

        // Type picker
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(
                modifier = Modifier.padding(Spacing.md),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
            ) {
                Text(
                    text = "Exception Type",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                ) {
                    ExceptionType.entries.forEach { type ->
                        FilterChip(
                            selected = uiState.selectedType == type,
                            onClick = { component.setType(type) },
                            label = { Text(type.driverLabel) },
                        )
                    }
                }
            }
        }

        // Description
        OutlinedTextField(
            value = uiState.description,
            onValueChange = { component.setDescription(it) },
            label = { Text("Description *") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            placeholder = { Text("Describe what happened...") },
        )

        // GPS note
        Text(
            text = "📍 GPS coordinates will be captured automatically",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        // Evidence placeholder
        Text(
            text = "📷 Evidence photos: tap to add (coming in §6)",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        // Submit
        Button(
            onClick = { component.submit() },
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState.canSubmit && !uiState.isSubmitting,
        ) {
            if (uiState.isSubmitting) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary)
            } else {
                Text("Report Exception")
            }
        }
    }
}
