package com.axleops.mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.axleops.mobile.trip.component.PodCaptureComponent
import com.axleops.mobile.trip.component.PodStep
import com.axleops.mobile.ui.theme.Spacing

/**
 * POD Capture screen — 4-step flow.
 *
 * 1. Photo capture (minimum 2 delivery photos)
 * 2. Signature capture (digital signature pad)
 * 3. Consignee form (name + phone)
 * 4. Review + submit
 *
 * Source: spec FR-090–FR-097, plan §6.2
 */
@Composable
fun PodCaptureScreen(
    component: PodCaptureComponent,
    modifier: Modifier = Modifier,
) {
    val uiState by component.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(Spacing.lg),
    ) {
        // Step indicator
        Text(
            text = "Submit POD — Step ${uiState.currentStep + 1}/${PodStep.entries.size}",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = uiState.currentStepEnum.label,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
        )

        Spacer(Modifier.height(Spacing.lg))

        // Step content
        when (uiState.currentStepEnum) {
            PodStep.PHOTOS -> PhotoCaptureStep(
                photoCount = uiState.photoIds.size,
                onAddPhoto = { component.addPhoto("mock-photo-${uiState.photoIds.size + 1}") },
            )
            PodStep.SIGNATURE -> SignatureCaptureStep(
                hasSignature = uiState.signatureId != null,
                onCapture = { component.setSignatureId("mock-signature-001") },
            )
            PodStep.CONSIGNEE -> ConsigneeStep(
                name = uiState.consigneeName,
                phone = uiState.consigneePhone,
                remarks = uiState.remarks,
                onNameChanged = { component.setConsigneeName(it) },
                onPhoneChanged = { component.setConsigneePhone(it) },
                onRemarksChanged = { component.setRemarks(it) },
            )
            PodStep.REVIEW -> ReviewStep(uiState)
        }

        Spacer(Modifier.weight(1f))

        // Navigation buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            if (uiState.currentStep > 0) {
                TextButton(onClick = { component.previousStep() }, modifier = Modifier.weight(1f)) {
                    Text("Back")
                }
            } else {
                Spacer(Modifier.weight(1f))
            }

            if (uiState.currentStepEnum == PodStep.REVIEW) {
                Button(
                    onClick = { component.submit() },
                    modifier = Modifier.weight(1f),
                    enabled = uiState.canSubmit && !uiState.isSubmitting,
                ) {
                    if (uiState.isSubmitting) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Submit POD")
                    }
                }
            } else {
                val canProceed = when (uiState.currentStepEnum) {
                    PodStep.PHOTOS -> uiState.canProceedFromPhotos
                    PodStep.SIGNATURE -> uiState.canProceedFromSignature
                    PodStep.CONSIGNEE -> uiState.canProceedFromConsignee
                    PodStep.REVIEW -> true
                }
                Button(
                    onClick = { component.nextStep() },
                    modifier = Modifier.weight(1f),
                    enabled = canProceed,
                ) {
                    Text("Next")
                }
            }
        }
    }
}

@Composable
private fun PhotoCaptureStep(photoCount: Int, onAddPhoto: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(modifier = Modifier.padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
            Text("Delivery Photos", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text("Minimum 2 photos required (${photoCount} captured)", style = MaterialTheme.typography.bodyMedium)
            Button(onClick = onAddPhoto) { Text("📷 Capture Photo") }
        }
    }
}

@Composable
private fun SignatureCaptureStep(hasSignature: Boolean, onCapture: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(modifier = Modifier.padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
            Text("Digital Signature", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            // Signature pad placeholder — real canvas in §6.T066
            Box(
                modifier = Modifier.fillMaxWidth().height(200.dp),
                contentAlignment = Alignment.Center,
            ) {
                if (hasSignature) {
                    Text("✅ Signature captured", style = MaterialTheme.typography.bodyMedium)
                } else {
                    Text("Signature pad placeholder", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            if (!hasSignature) {
                Button(onClick = onCapture) { Text("✍️ Capture Signature") }
            }
        }
    }
}

@Composable
private fun ConsigneeStep(
    name: String, phone: String, remarks: String,
    onNameChanged: (String) -> Unit, onPhoneChanged: (String) -> Unit, onRemarksChanged: (String) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
        OutlinedTextField(value = name, onValueChange = onNameChanged, label = { Text("Consignee Name *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        OutlinedTextField(value = phone, onValueChange = onPhoneChanged, label = { Text("Consignee Phone *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        OutlinedTextField(value = remarks, onValueChange = onRemarksChanged, label = { Text("Remarks (optional)") }, modifier = Modifier.fillMaxWidth(), minLines = 2)
    }
}

@Composable
private fun ReviewStep(uiState: com.axleops.mobile.trip.component.PodCaptureUiState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
    ) {
        Column(modifier = Modifier.padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Text("Review POD", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            Text("📷 Photos: ${uiState.photoIds.size}")
            Text("✍️ Signature: ${if (uiState.signatureId != null) "Captured" else "Missing"}")
            Text("👤 Consignee: ${uiState.consigneeName}")
            Text("📱 Phone: ${uiState.consigneePhone}")
            if (uiState.remarks.isNotBlank()) Text("📝 Remarks: ${uiState.remarks}")
        }
    }
}
