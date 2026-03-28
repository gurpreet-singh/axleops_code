package com.axleops.mobile.upload

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Unit tests for [UploadState] sealed interface and [UploadJob] model.
 */
class UploadStateTest {

    // ── UploadState transitions ─────────────────────────────────────────

    @Test
    fun `initial state is Idle`() {
        val state: UploadState = UploadState.Idle
        assertIs<UploadState.Idle>(state)
    }

    @Test
    fun `Capturing holds correct source`() {
        val camera = UploadState.Capturing(CaptureSource.CAMERA)
        assertEquals(CaptureSource.CAMERA, camera.source)

        val gallery = UploadState.Capturing(CaptureSource.GALLERY)
        assertEquals(CaptureSource.GALLERY, gallery.source)
    }

    @Test
    fun `Previewing holds image bytes and source`() {
        val bytes = byteArrayOf(1, 2, 3)
        val previewing = UploadState.Previewing(bytes, CaptureSource.CAMERA)
        assertTrue(bytes.contentEquals(previewing.imageBytes))
        assertEquals(CaptureSource.CAMERA, previewing.source)
    }

    @Test
    fun `Previewing equality is content-based`() {
        val bytes1 = byteArrayOf(1, 2, 3)
        val bytes2 = byteArrayOf(1, 2, 3)
        val bytes3 = byteArrayOf(4, 5, 6)

        val a = UploadState.Previewing(bytes1, CaptureSource.CAMERA)
        val b = UploadState.Previewing(bytes2, CaptureSource.CAMERA)
        val c = UploadState.Previewing(bytes3, CaptureSource.CAMERA)

        assertEquals(a, b)
        assertNotEquals(a, c)
    }

    @Test
    fun `Uploading has default zero progress`() {
        val job = createTestJob()
        val uploading = UploadState.Uploading(job = job)
        assertEquals(0f, uploading.progressPercent)
    }

    @Test
    fun `Success holds completed job`() {
        val job = createTestJob(resultUrl = "https://example.com/file.jpg")
        val success = UploadState.Success(job = job)
        assertEquals("https://example.com/file.jpg", success.job.resultUrl)
    }

    @Test
    fun `Failed holds error message and retry count`() {
        val job = createTestJob()
        val failed = UploadState.Failed(job = job, errorMessage = "timeout", retryCount = 2)
        assertEquals("timeout", failed.errorMessage)
        assertEquals(2, failed.retryCount)
    }

    @Test
    fun `Failed default retry count is zero`() {
        val job = createTestJob()
        val failed = UploadState.Failed(job = job, errorMessage = "error")
        assertEquals(0, failed.retryCount)
    }

    // ── UploadJob ────────────────────────────────────────────────────────

    @Test
    fun `UploadJob equality is based on id only`() {
        val job1 = UploadJob(
            id = "same-id",
            imageBytes = byteArrayOf(1, 2, 3),
            fileType = "POD",
        )
        val job2 = UploadJob(
            id = "same-id",
            imageBytes = byteArrayOf(4, 5, 6),
            fileType = "OTHER",
        )
        assertEquals(job1, job2)
        assertEquals(job1.hashCode(), job2.hashCode())
    }

    @Test
    fun `UploadJob with different ids are not equal`() {
        val job1 = createTestJob("id-1")
        val job2 = createTestJob("id-2")
        assertNotEquals(job1, job2)
    }

    @Test
    fun `UploadJob default values are correct`() {
        val job = UploadJob(id = "test", imageBytes = byteArrayOf())
        assertEquals("POD", job.fileType)
        assertNull(job.associatedTripId)
        assertNull(job.resultUrl)
        assertNull(job.resultFileId)
        assertTrue(job.createdAtMs > 0)
    }

    // ── CaptureSource ───────────────────────────────────────────────────

    @Test
    fun `CaptureSource has two values`() {
        assertEquals(2, CaptureSource.entries.size)
        assertTrue(CaptureSource.entries.contains(CaptureSource.CAMERA))
        assertTrue(CaptureSource.entries.contains(CaptureSource.GALLERY))
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private fun createTestJob(
        id: String = "test-job",
        resultUrl: String? = null,
    ) = UploadJob(
        id = id,
        imageBytes = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47),
        fileType = "POD",
        resultUrl = resultUrl,
    )
}
