package com.axleops.mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.trip.component.ExpenseFormComponent
import com.axleops.mobile.ui.theme.Spacing

/**
 * Expense form screen — category picker, amount, fuel-specific fields, receipt.
 *
 * Source: spec FR-070–FR-077, plan §7
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExpenseFormScreen(
    component: ExpenseFormComponent,
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
            text = "Log Expense",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )

        // Category picker
        var expanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = it },
        ) {
            OutlinedTextField(
                value = uiState.category.displayLabel,
                onValueChange = {},
                readOnly = true,
                label = { Text("Category") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
            )
            ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                ExpenseCategory.entries.forEach { category ->
                    DropdownMenuItem(
                        text = { Text(category.displayLabel) },
                        onClick = {
                            component.setCategory(category)
                            expanded = false
                        },
                    )
                }
            }
        }

        // Amount
        OutlinedTextField(
            value = uiState.amountText,
            onValueChange = { component.setAmount(it) },
            label = { Text("Amount (₹)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        // Fuel-specific fields
        if (uiState.isFuel) {
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
                        text = "Fuel Details",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                        OutlinedTextField(
                            value = uiState.fuelLitresText,
                            onValueChange = { component.setFuelLitres(it) },
                            label = { Text("Litres") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                        OutlinedTextField(
                            value = uiState.pricePerLitreText,
                            onValueChange = { component.setPricePerLitre(it) },
                            label = { Text("₹/Litre") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                        )
                    }
                    OutlinedTextField(
                        value = uiState.odometerText,
                        onValueChange = { component.setOdometerReading(it) },
                        label = { Text("Odometer (km)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                }
            }
        }

        // Description
        OutlinedTextField(
            value = uiState.description,
            onValueChange = { component.setDescription(it) },
            label = { Text("Notes (optional)") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
        )

        // Receipt placeholder
        Text(
            text = "📷 Receipt photo: Coming in §6 (Evidence handling)",
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
                Text("Log Expense")
            }
        }
    }
}
