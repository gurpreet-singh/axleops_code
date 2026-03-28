package com.axleops.mobile.ui.theme

import androidx.compose.ui.graphics.Color
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * Verifies trip phase color token mappings match the design system spec.
 *
 * Each [TripPhase] MUST map to the exact hex value defined in
 * mobile-design-system.md §1.1 Trip Phase Colors.
 */
class ColorTokenTest {

    @Test
    fun `CREATED phase maps to Gray 500`() {
        assertEquals(Color(0xFF6B7280), TripPhase.CREATED.color)
    }

    @Test
    fun `IN_TRANSIT phase maps to Blue 600`() {
        assertEquals(Color(0xFF2563EB), TripPhase.IN_TRANSIT.color)
    }

    @Test
    fun `COMPLETED phase maps to Emerald 600`() {
        assertEquals(Color(0xFF059669), TripPhase.COMPLETED.color)
    }

    @Test
    fun `SETTLED phase maps to Gray 400`() {
        assertEquals(Color(0xFF9CA3AF), TripPhase.SETTLED.color)
    }

    @Test
    fun `exception color is Orange 600`() {
        assertEquals(Color(0xFFEA580C), TripPhase.exceptionColor)
    }

    @Test
    fun `primary brand color is Emerald 600`() {
        assertEquals(Color(0xFF059669), AxlePrimary)
    }

    @Test
    fun `secondary brand color is Cyan 600`() {
        assertEquals(Color(0xFF0891B2), AxleSecondary)
    }

    @Test
    fun `error color is Red 600`() {
        assertEquals(Color(0xFFDC2626), AxleError)
    }

    @Test
    fun `all trip phases have unique colors`() {
        val colors = TripPhase.entries.map { it.color }
        assertEquals(colors.size, colors.toSet().size, "Trip phase colors must be unique")
    }
}
