package com.axleops.mobile.data

/**
 * Sealed hierarchy of API errors.
 *
 * Provides a type-safe way to represent and handle all network/API failure
 * modes without relying on exception types. Used by all repositories for
 * error mapping from Ktor exceptions.
 *
 * Pattern:
 * ```
 * try { httpClient.get(...) }
 * catch (e: Exception) { throw ApiError.from(e) }
 * ```
 *
 * Or used in Result-returning functions:
 * ```
 * Result.failure(ApiError.from(e))
 * ```
 */
sealed class ApiError(
    override val message: String,
    override val cause: Throwable? = null,
) : Exception(message, cause) {

    /**
     * Network-level failure (no internet, DNS resolution, timeout).
     * User action: retry or check connectivity.
     */
    data class NetworkError(
        override val message: String = "Network error. Please check your connection.",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    /**
     * Server returned HTTP 5xx.
     * User action: retry later.
     */
    data class ServerError(
        val statusCode: Int,
        override val message: String = "Server error ($statusCode). Please try again later.",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    /**
     * Server returned HTTP 401 (Unauthorized).
     * Action: clear session, redirect to login. Usually handled by the 401 interceptor.
     */
    data class Unauthorized(
        override val message: String = "Session expired. Please sign in again.",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    /**
     * Server returned HTTP 4xx (other than 401).
     * User action: fix input or contact support.
     */
    data class ClientError(
        val statusCode: Int,
        override val message: String = "Request error ($statusCode).",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    /**
     * Response body could not be parsed (malformed JSON, missing required fields).
     * User action: contact support. Likely a backend contract mismatch.
     */
    data class ParseError(
        override val message: String = "Unexpected response format.",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    /**
     * Catchall for unexpected errors.
     */
    data class UnknownError(
        override val message: String = "An unexpected error occurred.",
        override val cause: Throwable? = null,
    ) : ApiError(message, cause)

    companion object {
        /**
         * Map any [Throwable] to an appropriate [ApiError].
         *
         * Uses Ktor's [ResponseException] hierarchy to determine HTTP status codes.
         * Falls back to message-based heuristics for non-Ktor exceptions.
         */
        fun from(throwable: Throwable): ApiError {
            val message = throwable.message ?: ""

            return when {
                // Ktor ResponseException carries status code info in message
                message.contains("401") || message.contains("Unauthorized", ignoreCase = true) ->
                    Unauthorized(cause = throwable)

                message.contains("500") || message.contains("502") ||
                    message.contains("503") || message.contains("504") ->
                    ServerError(
                        statusCode = extractStatusCode(message) ?: 500,
                        cause = throwable,
                    )

                message.contains("400") || message.contains("403") ||
                    message.contains("404") || message.contains("409") ||
                    message.contains("422") ->
                    ClientError(
                        statusCode = extractStatusCode(message) ?: 400,
                        cause = throwable,
                    )

                // Serialization / parsing errors
                throwable is kotlinx.serialization.SerializationException ->
                    ParseError(cause = throwable)

                // Network / IO errors (detect by message since IOException isn't available in commonMain)
                message.contains("timeout", ignoreCase = true) ||
                    message.contains("connect", ignoreCase = true) ||
                    message.contains("resolve", ignoreCase = true) ||
                    message.contains("network", ignoreCase = true) ||
                    message.contains("unreachable", ignoreCase = true) ||
                    message.contains("refused", ignoreCase = true) ->
                    NetworkError(cause = throwable)

                else -> UnknownError(
                    message = message.ifBlank { "An unexpected error occurred." },
                    cause = throwable,
                )
            }
        }

        private fun extractStatusCode(message: String): Int? {
            // Try to extract 3-digit HTTP status code from error message
            val regex = Regex("""\b([1-5]\d{2})\b""")
            return regex.find(message)?.groupValues?.get(1)?.toIntOrNull()
        }
    }
}
