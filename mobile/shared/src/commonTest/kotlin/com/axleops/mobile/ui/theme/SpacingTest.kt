package com.axleops.mobile.ui.theme

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Verifies spacing token values follow the 4dp base unit rule.
 *
 * All spacing values MUST be multiples of 4dp, except [Spacing.xxs] (2dp)
 * which is the documented exception for hairline icon-to-text pairs.
 */
class SpacingTest {

    @Test
    fun `xxs is 2dp - documented exception to 4dp rule`() {
        assertEquals(2f, Spacing.xxs.value)
    }

    @Test
    fun `xs is 4dp`() {
        assertEquals(4f, Spacing.xs.value)
    }

    @Test
    fun `sm is 8dp`() {
        assertEquals(8f, Spacing.sm.value)
    }

    @Test
    fun `md is 12dp`() {
        assertEquals(12f, Spacing.md.value)
    }

    @Test
    fun `lg is 16dp`() {
        assertEquals(16f, Spacing.lg.value)
    }

    @Test
    fun `xl is 24dp`() {
        assertEquals(24f, Spacing.xl.value)
    }

    @Test
    fun `xxl is 32dp`() {
        assertEquals(32f, Spacing.xxl.value)
    }

    @Test
    fun `screen is 16dp`() {
        assertEquals(16f, Spacing.screen.value)
    }

    @Test
    fun `all values except xxs are multiples of 4dp`() {
        val tokensToCheck = listOf(
            "xs" to Spacing.xs,
            "sm" to Spacing.sm,
            "md" to Spacing.md,
            "lg" to Spacing.lg,
            "xl" to Spacing.xl,
            "xxl" to Spacing.xxl,
            "screen" to Spacing.screen,
        )
        for ((name, value) in tokensToCheck) {
            assertTrue(
                value.value % 4f == 0f,
                "Spacing.$name = ${value.value}dp is not a multiple of 4dp",
            )
        }
    }
}
