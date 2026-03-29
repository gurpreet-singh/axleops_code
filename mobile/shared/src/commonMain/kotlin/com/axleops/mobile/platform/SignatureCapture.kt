package com.axleops.mobile.platform

/**
 * Signature capture abstraction.
 *
 * In the current phase, provides a mock that returns a fixed
 * signature ID. Real implementations:
 * - Android: Canvas-based drawing view
 * - iOS: PKCanvasView
 *
 * Source: spec FR-094, plan §6.2
 */
interface SignatureCapture {
    /**
     * Capture a signature and return a file ID.
     *
     * @return File ID of the captured signature image.
     */
    suspend fun captureSignature(): String
}

/**
 * Mock [SignatureCapture] — returns a fixed ID.
 */
class MockSignatureCapture : SignatureCapture {
    override suspend fun captureSignature(): String = "mock-signature-001"
}
