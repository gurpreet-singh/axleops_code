package com.axleops.mobile.tracking.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.axleops.mobile.tracking.diagnostics.TrackingDiagnostics

/**
 * T045: Diagnostics export panel composable.
 *
 * Provides a "Export Tracking Diagnostics" button that renders
 * the full diagnostic report inline. QA can copy/share the text.
 *
 * Intended for integration into the debug/settings screen.
 *
 * Source: spec §7.6 (export mechanism)
 */
@Composable
fun DiagnosticsExportPanel(
    diagnostics: TrackingDiagnostics,
    modifier: Modifier = Modifier,
) {
    var exportedText by remember { mutableStateOf<String?>(null) }

    Column(modifier = modifier.padding(16.dp)) {
        Text(
            text = "Tracking Diagnostics",
            style = MaterialTheme.typography.titleMedium,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = { exportedText = diagnostics.exportAsText() },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Export Tracking Diagnostics")
        }

        exportedText?.let { text ->
            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = text,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(8.dp),
            )
        }
    }
}
