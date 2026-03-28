package com.axleops.mobile.ui.components.stepper

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.axleops.mobile.ui.theme.AxleError
import com.axleops.mobile.ui.theme.AxleSuccess
import com.axleops.mobile.ui.theme.Spacing

/**
 * Step state for milestone stepper components.
 *
 * Per design system §2.5:
 * | State     | Horizontal Icon                    | Vertical Card                        |
 * |-----------|------------------------------------|--------------------------------------|
 * | Completed | Filled circle + checkmark (green)  | Green left border, data shown        |
 * | Current   | Animated pulse circle (primary)    | Primary left border, action available|
 * | Future    | Outline circle (gray)              | Gray left border, muted title        |
 * | Blocked   | Lock icon (red)                    | Red left border, blocking reason     |
 * | Skipped   | Dash icon (muted)                  | Muted, struck-through title          |
 */
enum class StepState {
    COMPLETED,
    CURRENT,
    FUTURE,
    BLOCKED,
    SKIPPED,
}

/**
 * Step data model for stepper components.
 *
 * @param label Step title (e.g., "Load Vehicle", "Deliver to Hub A").
 * @param state Current state of this step.
 * @param detail Optional detail text (shown in vertical stepper).
 */
data class StepItem(
    val label: String,
    val state: StepState,
    val detail: String? = null,
)

// ── Horizontal Stepper (T029) ────────────────────────────────────────────────

/**
 * Horizontal milestone stepper — summary view.
 *
 * Shows steps as dots/icons with connecting lines.
 * Designed for trip card summaries (max ~10 steps visible).
 *
 * @param steps Ordered list of step items.
 */
@Composable
fun HorizontalStepper(
    steps: List<StepItem>,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        steps.forEachIndexed { index, step ->
            StepDot(state = step.state)
            if (index < steps.lastIndex) {
                StepConnector(
                    completed = step.state == StepState.COMPLETED,
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

@Composable
private fun StepDot(
    state: StepState,
    modifier: Modifier = Modifier,
) {
    val dotSize = 16.dp

    when (state) {
        StepState.COMPLETED -> {
            Box(
                modifier = modifier
                    .size(dotSize)
                    .clip(CircleShape)
                    .background(AxleSuccess),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Filled.Check,
                    contentDescription = "Completed",
                    modifier = Modifier.size(10.dp),
                    tint = MaterialTheme.colorScheme.onPrimary,
                )
            }
        }

        StepState.CURRENT -> {
            val transition = rememberInfiniteTransition(label = "pulse")
            val scale by transition.animateFloat(
                initialValue = 1f,
                targetValue = 1.3f,
                animationSpec = infiniteRepeatable(
                    animation = tween(800, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse,
                ),
                label = "pulseScale",
            )
            Box(
                modifier = modifier
                    .size(dotSize)
                    .scale(scale)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary),
            )
        }

        StepState.FUTURE -> {
            Box(
                modifier = modifier
                    .size(dotSize)
                    .clip(CircleShape)
                    .border(1.5.dp, MaterialTheme.colorScheme.outline, CircleShape),
            )
        }

        StepState.BLOCKED -> {
            Box(
                modifier = modifier
                    .size(dotSize)
                    .clip(CircleShape)
                    .background(AxleError),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Filled.Lock,
                    contentDescription = "Blocked",
                    modifier = Modifier.size(10.dp),
                    tint = MaterialTheme.colorScheme.onPrimary,
                )
            }
        }

        StepState.SKIPPED -> {
            Box(
                modifier = modifier
                    .size(dotSize)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Filled.Remove,
                    contentDescription = "Skipped",
                    modifier = Modifier.size(10.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun StepConnector(
    completed: Boolean,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .height(2.dp)
            .padding(horizontal = 2.dp)
            .background(
                if (completed) AxleSuccess
                else MaterialTheme.colorScheme.outline,
            ),
    )
}

// ── Vertical Stepper (T030) ──────────────────────────────────────────────────

/**
 * Vertical milestone stepper — detail timeline view.
 *
 * Each step is a card with a colored left border indicating state.
 *
 * @param steps Ordered list of step items.
 */
@Composable
fun VerticalStepper(
    steps: List<StepItem>,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        steps.forEach { step ->
            VerticalStepCard(step = step)
        }
    }
}

@Composable
private fun VerticalStepCard(
    step: StepItem,
    modifier: Modifier = Modifier,
) {
    val borderColor = when (step.state) {
        StepState.COMPLETED -> AxleSuccess
        StepState.CURRENT -> MaterialTheme.colorScheme.primary
        StepState.FUTURE -> MaterialTheme.colorScheme.outline
        StepState.BLOCKED -> AxleError
        StepState.SKIPPED -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.surface),
    ) {
        // Left color border
        Box(
            modifier = Modifier
                .width(4.dp)
                .height(56.dp)
                .background(borderColor),
        )

        // Content
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = Spacing.md, vertical = Spacing.sm),
        ) {
            Text(
                text = step.label,
                style = MaterialTheme.typography.bodyMedium.copy(
                    textDecoration = if (step.state == StepState.SKIPPED) {
                        TextDecoration.LineThrough
                    } else {
                        TextDecoration.None
                    },
                ),
                color = when (step.state) {
                    StepState.CURRENT -> MaterialTheme.colorScheme.onSurface
                    StepState.FUTURE, StepState.SKIPPED ->
                        MaterialTheme.colorScheme.onSurfaceVariant
                    else -> MaterialTheme.colorScheme.onSurface
                },
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (step.detail != null) {
                Spacer(modifier = Modifier.height(Spacing.xxs))
                Text(
                    text = step.detail,
                    style = MaterialTheme.typography.labelSmall,
                    color = when (step.state) {
                        StepState.BLOCKED -> AxleError
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )
            }
        }

        // State icon
        Box(
            modifier = Modifier
                .size(40.dp)
                .padding(Spacing.sm),
            contentAlignment = Alignment.Center,
        ) {
            StepDot(state = step.state)
        }
    }
}
