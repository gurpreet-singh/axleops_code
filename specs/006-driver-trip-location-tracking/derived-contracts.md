# Derived Contract: Location Batch Ingestion

**Feature**: `006-driver-trip-location-tracking`  
**Status**: 🟡 Mock-backed (backend implementation pending)  
**Gap**: LT-G1 (spec §8.4)

---

## Canonical Endpoint

```
POST /trips/{tripId}/location/batch
```

### Authentication

- Bearer token (JWT) required
- Server MUST validate that the authenticated driver owns the trip

### Request

```json
{
  "points": [
    {
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "accuracy": 10.5,
      "timestamp": "2026-03-29T12:00:00.000Z",
      "speed": 15.3,
      "bearing": 45.0,
      "altitude": 14.2,
      "provider": "GPS",
      "batteryLevel": 78
    }
  ]
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `clientId` | String (UUID v4) | ✅ | Client-generated, unique per point. Used for dedup. |
| `latitude` | Double | ✅ | WGS84 latitude |
| `longitude` | Double | ✅ | WGS84 longitude |
| `accuracy` | Double | ✅ | Horizontal accuracy in meters |
| `timestamp` | String (ISO-8601) | ✅ | GPS fix time (device clock) |
| `speed` | Double | ❌ | Speed in m/s |
| `bearing` | Double | ❌ | Heading in degrees (0–360) |
| `altitude` | Double | ❌ | Altitude in meters above sea level |
| `provider` | String | ❌ | `GPS`, `Network`, `Fused`, `Passive` |
| `batteryLevel` | Integer | ❌ | Battery percentage (0–100) |

### Response

```
HTTP 202 Accepted
```

```json
{
  "accepted": 3,
  "duplicates": 0
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `202` | Batch accepted (some may be dupes) |
| `400` | Invalid request body |
| `401` | Session expired — client should stop sync |
| `403` | Driver does not own this trip |
| `404` | Trip not found |
| `500` | Server error — client should retry with backoff |

### Deduplication

- Composite unique constraint: `(tripId, clientId)`
- Server MUST handle retried batches gracefully — duplicate `clientId` values within a trip are silently ignored (counted in `duplicates`)
- Client uses `INSERT OR IGNORE` locally for the same guarantee

### Batch Behavior

- Maximum points per batch: **50** (client-enforced)
- Client sends batches in FIFO order (oldest first)
- Retry with exponential backoff: 30s → 1m → 2m → 5m → 10m (cap)
- On 401: stop retrying (auth expired)

---

## Backend Derivation Source

- Trip entity: `backend/src/main/java/com/axleops/Trip.java`
- New entity needed: `TripLocationPoint` (backend task T-BE1)
- New controller needed: `TripLocationController` (backend task T-BE2)

## Mobile Implementation

- `MockLocationRepository` returns `BatchLogResult(accepted = N, duplicates = 0)`
- `RealLocationRepository` is stubbed with `UnsupportedOperationException` (LT-G1)
- `BatchSyncWorker` handles retry/backoff/auth-failure logic client-side
- `LocationBufferRepository` handles local dedup via SQLDelight `INSERT OR IGNORE`
