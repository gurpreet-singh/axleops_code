package com.axleops.mobile.data

import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import org.jetbrains.compose.resources.ExperimentalResourceApi
import axelops_mobile.shared.generated.resources.Res

/**
 * Utility for loading mock JSON fixtures from compose resources.
 *
 * Fixtures live in:
 *   shared/src/commonMain/composeResources/files/mocks/<domain>/<filename>.json
 *
 * Usage:
 * ```kotlin
 * val trips = MockFixtureLoader.load("trips/driver-trips.json", ListSerializer(TripDto.serializer()))
 * ```
 *
 * QA can swap fixture files (e.g., rename `driver-trips-empty.json` to
 * `driver-trips.json`) to simulate different scenarios without code changes.
 */
object MockFixtureLoader {

    /** Shared JSON parser configured to match [HttpClientFactory] settings. */
    private val json = Json {
        isLenient = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    /**
     * Load and deserialize a mock JSON fixture file.
     *
     * @param path Relative path inside `composeResources/files/mocks/`,
     *   e.g., `"trips/driver-trips.json"`.
     * @param serializer The [KSerializer] for type [T].
     * @return The deserialized object of type [T].
     * @throws IllegalStateException if the fixture file cannot be loaded or parsed.
     */
    @OptIn(ExperimentalResourceApi::class)
    suspend fun <T> load(path: String, serializer: KSerializer<T>): T {
        val bytes = Res.readBytes("files/mocks/$path")
        val jsonString = bytes.decodeToString()
        return json.decodeFromString(serializer, jsonString)
    }

    /**
     * Load raw JSON string from a fixture file.
     *
     * @param path Relative path inside `composeResources/files/mocks/`.
     * @return The raw JSON string.
     */
    @OptIn(ExperimentalResourceApi::class)
    suspend fun loadRaw(path: String): String {
        val bytes = Res.readBytes("files/mocks/$path")
        return bytes.decodeToString()
    }
}
