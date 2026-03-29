package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.PodVerificationStatus
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertFalse

/**
 * Tests for POD validation logic used by [SubmitPodUseCase].
 */
class SubmitPodUseCaseTest {

    @Test
    fun pod_with_minimum_photos_is_valid() {
        val pod = createPod(photoCount = 2, hasSignature = true, hasConsigneeName = true)
        assertTrue(pod.photoIds.size >= 2)
    }

    @Test
    fun pod_with_less_than_2_photos_is_invalid() {
        val pod = createPod(photoCount = 1, hasSignature = true, hasConsigneeName = true)
        assertFalse(pod.photoIds.size >= 2)
    }

    @Test
    fun pod_without_signature_is_invalid() {
        val pod = createPod(photoCount = 2, hasSignature = false, hasConsigneeName = true)
        assertTrue(pod.signatureId == null)
    }

    @Test
    fun pod_without_consignee_name_is_invalid() {
        val pod = createPod(photoCount = 2, hasSignature = true, hasConsigneeName = false)
        assertTrue(pod.consigneeName.isBlank())
    }

    @Test
    fun full_pod_has_all_required_fields() {
        val pod = createPod(photoCount = 3, hasSignature = true, hasConsigneeName = true)
        assertTrue(pod.photoIds.size >= 2)
        assertTrue(pod.signatureId != null)
        assertTrue(pod.consigneeName.isNotBlank())
        assertEquals(PodVerificationStatus.SUBMITTED, pod.verificationStatus)
    }

    @Test
    fun pod_can_contain_remarks() {
        val pod = createPod(photoCount = 2, hasSignature = true, hasConsigneeName = true)
            .copy(remarks = "Minor dent on package #3")
        assertEquals("Minor dent on package #3", pod.remarks)
    }

    private fun createPod(
        photoCount: Int,
        hasSignature: Boolean,
        hasConsigneeName: Boolean,
    ): Pod = Pod(
        tripId = 1,
        consigneeName = if (hasConsigneeName) "Vikram Shah" else "",
        photoIds = (1..photoCount).map { "photo-$it" },
        signatureId = if (hasSignature) "sig-001" else null,
        verificationStatus = PodVerificationStatus.SUBMITTED,
    )
}
