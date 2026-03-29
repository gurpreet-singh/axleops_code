package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.TripDetail

/**
 * Repository interface for POD (Proof of Delivery) submission.
 *
 * The full POD includes:
 * - Photo evidence (at least 2 photos)
 * - Digital signature
 * - Consignee name and phone
 * - Optional remarks
 *
 * Backend gap G4: File upload APIs do not exist yet.
 *
 * Source: spec FR-090–FR-097
 */
interface PodRepository {

    /**
     * Submit the complete POD payload.
     *
     * @param tripId The trip ID.
     * @param pod The POD data (photos, signature, consignee).
     * @return Updated TripDetail with status = POD_SUBMITTED.
     */
    suspend fun submitPod(tripId: Long, pod: Pod): TripDetail
}
