package com.axleops.mobile.ui.trip

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.trip.component.TripDetailComponent
import com.axleops.mobile.trip.component.TripDetailUiState
import com.axleops.mobile.trip.state.CtaState
import com.axleops.mobile.ui.shared.ErrorStateScreen
import com.axleops.mobile.ui.shared.SkeletonCard
import com.axleops.mobile.ui.shared.SkeletonLine
import com.axleops.mobile.ui.theme.Spacing
import com.axleops.mobile.ui.trip.components.ExceptionBanner
import com.axleops.mobile.ui.trip.components.MapSectionPlaceholder
import com.axleops.mobile.ui.trip.components.MilestoneStepperSection

/**
 * Trip Detail screen -- scrollable detail with all sections.
 *
 * Sections (from top to bottom):
 * 1. Exception banner (conditional — FX-004)
 * 2. Route info (origin → destination, distance)
 * 3. Map placeholder (origin/destination pins)
 * 4. Milestone stepper (10-step lifecycle)
 * 5. Cargo & vehicle info
 * 6. Documents section (placeholder for §6)
 * 7. Expenses section (placeholder for §7)
 *
 * CTA is in a sticky bottom bar via Scaffold (FX-002).
 *
 * Fixes applied:
 * - FX-002 ⟵ OI-002: CTA moved to Scaffold bottomBar (was inside scrollable column)
 * - FX-003 ⟵ OI-003: skeleton loading (was spinner), ErrorStateScreen (was EmptyStateScreen)
 * - FX-004 ⟵ OI-004: ExceptionBanner wired at top of content
 *
 * Source: spec FR-010–FR-013, plan §2
 */
@Composable
fun TripDetailScreen(
    component: TripDetailComponent,
    modifier: Modifier = Modifier,
) {
    val uiState by component.uiState.collectAsState()

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        when (val state = uiState) {
            is TripDetailUiState.Loading -> {
                // FX-003: content-shaped skeleton instead of spinner
                TripDetailSkeleton()
            }
            is TripDetailUiState.Error -> {
                // FX-003: ErrorStateScreen instead of EmptyStateScreen
                ErrorStateScreen(
                    message = "Failed to load trip details:\n${state.message}",
                    onRetry = { component.refresh() },
                )
            }
            is TripDetailUiState.Loaded -> {
                TripDetailContent(
                    state = state,
                    onTransition = { event -> component.submitTransition(event) },
                    onDismissError = { component.dismissError() },
                )
            }
        }
    }
}

/**
 * FX-003: Content-shaped skeleton matching the trip detail layout.
 *
 * Shows: card (route) + stepper-like lines + cargo card + section placeholders.
 * Replaces CircularProgressIndicator per design system §2.6.
 */
@Composable
private fun TripDetailSkeleton() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg),
    ) {
        // Route info card skeleton
        SkeletonCard()

        // Map placeholder skeleton
        SkeletonLine(modifier = Modifier.fillMaxWidth(), height = Spacing.xxl)

        // Milestone stepper skeleton (5 step dots)
        Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            repeat(5) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    SkeletonLine(width = Spacing.lg, height = Spacing.lg)
                    SkeletonLine(width = Spacing.xxl * 3)
                }
            }
        }

        // Cargo & Vehicle skeleton
        SkeletonCard()

        // Documents section skeleton
        SkeletonLine(width = Spacing.xxl * 2)

        // Expenses section skeleton
        SkeletonLine(width = Spacing.xxl * 2)
    }
}

/**
 * Scrollable trip detail content with sticky bottom CTA.
 *
 * FX-002: Content is in Scaffold.content (scrollable), CTA is in Scaffold.bottomBar (sticky).
 * FX-004: ExceptionBanner renders at top when trip has an active exception.
 */
@Composable
private fun TripDetailContent(
    state: TripDetailUiState.Loaded,
    onTransition: (String) -> Unit,
    onDismissError: () -> Unit,
) {
    val trip = state.trip

    // FX-002: Scaffold with bottomBar for sticky CTA
    Scaffold(
        bottomBar = {
            // Sticky CTA — always visible, never scrolls
            TripDetailCta(
                ctaState = state.ctaState,
                isTransitioning = state.isTransitioning,
                trip = trip,
                onTransition = onTransition,
            )
        },
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding).fillMaxSize()) {
            val scrollState = rememberScrollState()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg),
            ) {
                // FX-004: Exception banner at top when trip has active exception
                trip.activeException?.let { exception ->
                    ExceptionBanner(
                        type = exception.type.name,
                        description = exception.description,
                        reportedAt = exception.reportedAt,
                    )
                }

                // §1 — Route Info
                RouteInfoSection(trip)

                HorizontalDivider()

                // §2 — Map Placeholder
                MapSectionPlaceholder(
                    originCity = trip.originCity,
                    destinationCity = trip.destinationCity,
                )

                HorizontalDivider()

                // §3 — Milestone Stepper
                MilestoneStepperSection(milestones = trip.milestones)

                HorizontalDivider()

                // §4 — Cargo & Vehicle Info
                CargoInfoSection(trip)

                HorizontalDivider()

                // §5 — Documents (placeholder)
                SectionHeader(title = "Documents")
                Text(
                    text = "${trip.documents.size} document(s) uploaded",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )

                HorizontalDivider()

                // §6 — Expenses (placeholder)
                SectionHeader(title = "Expenses")
                Text(
                    text = if (trip.expenses.isEmpty()) "No expenses logged"
                    else "${trip.expenses.size} expense(s) — Total: ₹${trip.totalExpenses}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            // Transition error snackbar
            state.transitionError?.let { error ->
                Snackbar(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(Spacing.lg),
                    action = {
                        TextButton(onClick = onDismissError) {
                            Text("Dismiss")
                        }
                    },
                ) {
                    Text(error)
                }
            }
        }
    }
}

/**
 * FX-002: Sticky CTA extracted from scrollable content.
 *
 * Rendered in Scaffold.bottomBar — always visible regardless of scroll position.
 * CTA state derivation chain is preserved: TripStatus → TripStateMachine → CtaState.
 */
@Composable
private fun TripDetailCta(
    ctaState: CtaState,
    isTransitioning: Boolean,
    trip: TripDetail,
    onTransition: (String) -> Unit,
) {
    when (ctaState) {
        is CtaState.Hidden -> { /* No button — zero height */ }
        is CtaState.Enabled -> {
            Box(modifier = Modifier.padding(Spacing.lg)) {
                Button(
                    onClick = {
                        val nextMilestone = trip.milestones.firstOrNull {
                            it.status == com.axleops.mobile.domain.model.MilestoneStatus.CURRENT
                        }
                        nextMilestone?.let { onTransition(it.type.name) }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isTransitioning,
                ) {
                    if (isTransitioning) {
                        CircularProgressIndicator(
                            color = MaterialTheme.colorScheme.onPrimary,
                        )
                    } else {
                        Text(ctaState.label)
                    }
                }
            }
        }
        is CtaState.Disabled -> {
            Column(modifier = Modifier.padding(Spacing.lg)) {
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false,
                ) {
                    Text(ctaState.label)
                }
                Text(
                    text = ctaState.reason,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = Spacing.xs),
                )
            }
        }
        is CtaState.InProgress -> {
            Box(modifier = Modifier.padding(Spacing.lg)) {
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
}

/**
 * Route information section showing origin → destination.
 */
@Composable
private fun RouteInfoSection(trip: TripDetail) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(
            modifier = Modifier.padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Text(
                text = trip.tripNumber,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "${trip.originCity} → ${trip.destinationCity}",
                style = MaterialTheme.typography.bodyLarge,
            )
            trip.originAddress?.let {
                Text(
                    text = "From: $it",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                )
            }
            trip.destinationAddress?.let {
                Text(
                    text = "To: $it",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                )
            }
            trip.totalDistanceKm?.let { distance ->
                Text(
                    text = "$distance km",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}

/**
 * Cargo and vehicle information section.
 */
@Composable
private fun CargoInfoSection(trip: TripDetail) {
    SectionHeader(title = "Cargo & Vehicle")

    Column(verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        InfoRow("Customer", trip.customerName ?: "—")
        InfoRow("Cargo", trip.cargoDescription ?: "—")
        InfoRow("Booked Weight", trip.bookedWeightMt?.let { "$it MT" } ?: "—")
        trip.actualWeightMt?.let { InfoRow("Actual Weight", "$it MT") }
        InfoRow("Vehicle", trip.vehicleNumber ?: "—")
        InfoRow("LR Number", trip.lrNumber ?: "—")
        trip.freightAmount?.let { InfoRow("Freight", "₹$it") }
        trip.budgetEstimate?.let { InfoRow("Budget", "₹$it") }
    }
}

/**
 * Section header text.
 */
@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
    )
}

/**
 * Key-value info row.
 */
@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
        )
    }
}
