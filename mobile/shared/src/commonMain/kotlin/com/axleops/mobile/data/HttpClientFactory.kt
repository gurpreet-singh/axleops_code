package com.axleops.mobile.data

import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpResponseValidator
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.ResponseException
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.plugins.logging.Logging
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

/**
 * Factory for creating an [HttpClient] configured for the AxleOps backend.
 *
 * Features:
 * - JSON content negotiation (lenient, ignores unknown keys)
 * - Request/connect timeouts (30s default)
 * - Bearer token auth (token provided via [TokenProvider])
 * - 401 response interception → [onUnauthorized] callback
 * - Default JSON content type on all requests
 * - Request/response logging (debug builds)
 *
 * Platform-specific engines (OkHttp on Android, Darwin on iOS)
 * are resolved automatically via the Ktor engine dependency
 * declared in each source set's build.gradle.kts.
 */
object HttpClientFactory {

    /** Default request timeout in milliseconds (30 seconds). */
    private const val DEFAULT_TIMEOUT_MS = 30_000L

    /**
     * Functional interface for providing the current auth token.
     * Implemented by the auth layer (UserSession / AuthRepository).
     */
    fun interface TokenProvider {
        suspend fun getToken(): String?
    }

    /**
     * Create a configured [HttpClient].
     *
     * @param baseUrl The backend base URL (e.g., "https://api.axleops.com").
     * @param tokenProvider Supplies the current Bearer token for authenticated requests.
     *   Pass `null` during initial setup before auth is configured.
     * @param onUnauthorized Callback invoked when any response returns HTTP 401.
     *   Use this to trigger logout and redirect to login (spec §US2 AC2).
     * @param requestTimeoutMs Request timeout in ms. Default 30s.
     * @param connectTimeoutMs Connect timeout in ms. Default 30s.
     */
    fun create(
        baseUrl: String = "",
        tokenProvider: TokenProvider? = null,
        onUnauthorized: (() -> Unit)? = null,
        requestTimeoutMs: Long = DEFAULT_TIMEOUT_MS,
        connectTimeoutMs: Long = DEFAULT_TIMEOUT_MS,
    ): HttpClient = HttpClient {

        install(ContentNegotiation) {
            json(Json {
                prettyPrint = false
                isLenient = true
                ignoreUnknownKeys = true
                encodeDefaults = true
            })
        }

        install(Logging) {
            logger = object : Logger {
                override fun log(message: String) {
                    println("[HTTP] $message")
                }
            }
            level = LogLevel.ALL
        }

        // ── Timeouts (T029) ─────────────────────────────────────────────
        install(HttpTimeout) {
            requestTimeoutMillis = requestTimeoutMs
            connectTimeoutMillis = connectTimeoutMs
            socketTimeoutMillis = requestTimeoutMs
        }

        // ── 401 Interceptor (FIX-001 / OI-02) ──────────────────────────
        if (onUnauthorized != null) {
            HttpResponseValidator {
                validateResponse { response ->
                    if (response.status == HttpStatusCode.Unauthorized) {
                        onUnauthorized()
                    }
                }
            }
        }

        if (tokenProvider != null) {
            install(Auth) {
                bearer {
                    loadTokens {
                        val token = tokenProvider.getToken()
                        if (token != null) {
                            BearerTokens(accessToken = token, refreshToken = "")
                        } else {
                            null
                        }
                    }
                }
            }
        }

        if (baseUrl.isNotBlank()) {
            defaultRequest {
                url(baseUrl)
                contentType(ContentType.Application.Json)
            }
        }
    }
}

