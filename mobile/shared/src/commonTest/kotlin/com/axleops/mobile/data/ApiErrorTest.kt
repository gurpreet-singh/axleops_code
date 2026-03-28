package com.axleops.mobile.data

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull

/**
 * Unit tests for [ApiError] sealed class and [ApiError.from] mapping.
 */
class ApiErrorTest {

    @Test
    fun `from maps 401 message to Unauthorized`() {
        val error = ApiError.from(Exception("HTTP 401 Unauthorized"))
        assertIs<ApiError.Unauthorized>(error)
    }

    @Test
    fun `from maps 500 message to ServerError`() {
        val error = ApiError.from(Exception("HTTP 500 Internal Server Error"))
        assertIs<ApiError.ServerError>(error)
        assertEquals(500, error.statusCode)
    }

    @Test
    fun `from maps 503 message to ServerError`() {
        val error = ApiError.from(Exception("Service Unavailable 503"))
        assertIs<ApiError.ServerError>(error)
        assertEquals(503, error.statusCode)
    }

    @Test
    fun `from maps 400 message to ClientError`() {
        val error = ApiError.from(Exception("Bad Request 400"))
        assertIs<ApiError.ClientError>(error)
        assertEquals(400, error.statusCode)
    }

    @Test
    fun `from maps 404 message to ClientError`() {
        val error = ApiError.from(Exception("Not Found 404"))
        assertIs<ApiError.ClientError>(error)
        assertEquals(404, error.statusCode)
    }

    @Test
    fun `from maps timeout message to NetworkError`() {
        val error = ApiError.from(Exception("Connection timeout"))
        assertIs<ApiError.NetworkError>(error)
    }

    @Test
    fun `from maps connection refused to NetworkError`() {
        val error = ApiError.from(Exception("Connection refused"))
        assertIs<ApiError.NetworkError>(error)
    }

    @Test
    fun `from maps serialization error to ParseError`() {
        val error = ApiError.from(kotlinx.serialization.SerializationException("Missing field"))
        assertIs<ApiError.ParseError>(error)
    }

    @Test
    fun `from maps unknown exception to UnknownError`() {
        val error = ApiError.from(Exception("Something completely unexpected"))
        assertIs<ApiError.UnknownError>(error)
    }

    @Test
    fun `from preserves original cause`() {
        val original = Exception("HTTP 500 server down")
        val error = ApiError.from(original)
        assertEquals(original, error.cause)
    }

    @Test
    fun `Unauthorized has default message`() {
        val error = ApiError.Unauthorized()
        assertEquals("Session expired. Please sign in again.", error.message)
    }

    @Test
    fun `NetworkError has default message`() {
        val error = ApiError.NetworkError()
        assertEquals("Network error. Please check your connection.", error.message)
    }
}
