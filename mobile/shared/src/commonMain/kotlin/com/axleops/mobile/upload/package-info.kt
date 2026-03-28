/**
 * Upload service layer — capture, preview, upload, retry.
 *
 * Provides [UploadService] interface with mock and real implementations,
 * [UploadState] sealed class for the upload lifecycle, and
 * [UploadViewModel] for driving the capture → preview → upload → result flow.
 *
 * Platform camera/gallery access is delegated to the `platform/` package
 * via expect/actual. The upload destination (local mock or backend endpoint)
 * is selected by [DataSourceConfig.uploadSource] via DI.
 *
 * Foundation-owned. Feature epics (POD capture, inspection photos, expense
 * receipts) use this service directly.
 */
package com.axleops.mobile.upload
