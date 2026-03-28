package com.axleops.mobile.upload

import com.axleops.mobile.data.ApiError
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import kotlin.time.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Real [UploadService] backed by Ktor multipart POST.
 *
 * Uploads to `POST /api/v1/files/upload` as multipart/form-data.
 * Uses the derived contract shape from `derived-contracts.md`.
 *
 * Progress tracking is simulated via pre/post markers since Ktor's
 * multipart upload doesn't provide byte-level progress in KMP.
 * Full streaming progress requires platform-specific HTTP clients
 * (e.g., OkHttp interceptors on Android).
 *
 * @param httpClient Configured Ktor client with auth + content negotiation.
 * @param baseUrl Backend base URL.
 * @param tokenProvider Provides the current Bearer token.
 */
class RealUploadService(
    private val httpClient: HttpClient,
    private val baseUrl: String,
    private val tokenProvider: suspend () -> String?,
) : UploadService {

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun upload(
        imageBytes: ByteArray,
        fileType: String,
        tripId: Long?,
        onProgress: (Float) -> Unit,
    ): UploadJob {
        val jobId = Uuid.random().toString()

        try {
            // Pre-upload progress marker
            onProgress(0.1f)

            val token = tokenProvider() ?: throw ApiError.Unauthorized()

            onProgress(0.2f)

            val response = httpClient.submitFormWithBinaryData(
                url = "$baseUrl/api/v1/files/upload",
                formData = formData {
                    append("file", imageBytes, Headers.build {
                        append(HttpHeaders.ContentType, "image/jpeg")
                        append(HttpHeaders.ContentDisposition, "filename=\"upload-$jobId.jpg\"")
                    })
                    append("fileType", fileType)
                    if (tripId != null) {
                        append("tripId", tripId.toString())
                    }
                },
            ) {
                bearerAuth(token)
            }

            onProgress(0.9f)

            val result = response.body<FileUploadResponseDto>()

            onProgress(1.0f)

            return UploadJob(
                id = jobId,
                imageBytes = imageBytes,
                fileType = fileType,
                associatedTripId = tripId,
                createdAtMs = Clock.System.now().toEpochMilliseconds(),
                resultUrl = result.fileUrl,
                resultFileId = result.id,
            )
        } catch (e: ApiError) {
            throw e
        } catch (e: Exception) {
            throw ApiError.from(e)
        }
    }

    override suspend fun retry(
        job: UploadJob,
        onProgress: (Float) -> Unit,
    ): UploadJob = upload(
        imageBytes = job.imageBytes,
        fileType = job.fileType,
        tripId = job.associatedTripId,
        onProgress = onProgress,
    )
}

/**
 * DTO for the file upload response.
 * Matches the derived contract in `derived-contracts.md`.
 */
@Serializable
internal data class FileUploadResponseDto(
    val id: Long,
    @SerialName("file_name") val fileName: String = "",
    @SerialName("file_url") val fileUrl: String = "",
    @SerialName("file_type") val fileType: String = "",
    @SerialName("uploaded_at") val uploadedAt: String = "",
)
