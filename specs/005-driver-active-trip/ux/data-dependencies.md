# Data Dependencies — Driver Active Trip

> **Feature**: 005-driver-active-trip  
> **Spec**: [spec.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/spec.md) (Mock-vs-Real section)  
> **Date**: 2026-03-29

---

## 1. Screen → Data Mapping

This table defines exactly what data each screen / section needs, where it comes from, and what happens when it's unavailable.

### 1.1 ActiveTripScreen (Landing)

| Data Field | Source API | Mock Fallback | Required? | Empty/Missing Behavior |
|-----------|-----------|--------------|-----------|----------------------|
| Active trip existence | `GET /trips/driver/active` | `MockTripRepository.getActiveTrip()` | Yes | Empty state: "No active trip" |
| Trip number | Response field: `tripNumber` | Mock fixture | Yes | — |
| Route (origin → destination) | Response field: `route.origin`, `route.destination` | Mock fixture | Yes | — |
| Client name | Response field: `clientName` | Mock fixture | Yes | — |
| Vehicle registration | Response field: `vehicleRegistration` | Mock fixture | Yes | — |
| Scheduled start | Response field: `scheduledStart` | Mock fixture | Yes | — |
| Current sub-state | Response field: `status` | Mock fixture | Yes | — |
| Milestone progress | `GET /trips/{id}/milestones` | Mock milestone list | Yes | Stepper shows all empty |
| Exception state (if any) | Embedded in trip response or separate field | Mock | No | No exception banner |

### 1.2 TripDetailScreen (Scrollable Sections)

| Section | Data Source | Mock Fallback | Offline | Loading |
|---------|-----------|--------------|---------|---------|
| **Trip Details** | `GET /trips/{id}` (enriched) | Mock fixture | Cached | Skeleton |
| **Map** | Origin/destination GPS coords from route | Mock coords | Cached tiles, no live position | Placeholder |
| **Milestones** | `GET /trips/{id}/milestones` | Mock list | Cached | Skeleton (stepper shape) |
| **Documents** | `GET /trips/{id}/documents` | Mock list | Cached list | Skeleton (2 rows) |
| **Expenses** | `GET /trips/{id}/expenses` | Mock list | Cached list | Skeleton (2 rows) |
| **Running expense total** | Computed from expense list | Computed from mock | Computed from cache | "—" |

### 1.3 Milestone Action Forms

| Milestone | Required Form Data | Auto-Captured | Optional |
|-----------|-------------------|--------------|----------|
| Loading Complete | Cargo weight (MT) | GPS, timestamp | Seal number, cargo photos |
| Departure | — | GPS, timestamp, odometer | — |
| Arrived at Destination | — | GPS, timestamp, odometer | — |
| Delivery Complete | Delivered weight, condition | GPS, timestamp | — |

### 1.4 POD Capture

| Field | Source | Required? |
|-------|--------|-----------|
| Photos | Camera / Gallery | Yes (min 2, template-configurable) |
| Signature | Digital drawing pad | Yes |
| Consignee name | Manual input | Yes |
| Consignee designation | Manual input | No |
| Delivery remarks | Manual input | No |
| Received quantity | Pre-filled from loaded weight | Yes |
| Received condition | Picker (Good / Damaged / Partial) | Yes |
| POD type | Picker (Normal / Refused) | Yes (default: Normal) |
| Refusal reason | Manual input | Conditional (if Refused) |
| GPS coordinates | Auto-captured | Yes (warn if unavailable) |
| Timestamp | Auto-captured | Yes |

---

## 2. API Dependency Matrix

### 2.1 Existing APIs (Backend Confirmed)

| API | Used For | Auth Required | Notes |
|-----|---------|--------------|-------|
| `GET /trips` | Fallback: list all trips | TRIP_READ | Not driver-scoped; filter client-side by contactId (fragile) |
| `GET /trips/{id}` | Trip detail | TRIP_READ | Returns `TripResponse` (basic fields) |

### 2.2 Derived APIs (Mock-Backed)

| API | Used For | Method | Body | Response | Mock Behavior |
|-----|---------|--------|------|----------|---------------|
| `GET /trips/driver/active` | Fetch active trip | GET | — | `TripDetailResponse` | Returns fixture for configured sub-state |
| `POST /trips/{id}/accept` | Accept trip | POST | `{}` | `TripDetailResponse` (ACCEPTED) | Updates fixture state |
| `POST /trips/{id}/reject` | Reject trip | POST | `{ reason: string }` | `204 No Content` | Clears active trip |
| `POST /trips/{id}/transition` | Milestone transition | POST | `{ event: string, data: {}, gps: {} }` | `TripDetailResponse` (new state) | Advances fixture state |
| `GET /trips/{id}/milestones` | List milestones | GET | — | `MilestoneResponse[]` | Returns fixture list |
| `POST /trips/{id}/pod` | Submit POD | POST (multipart) | Photos + signature + fields | `PodResponse` | Accepts files, returns success |
| `POST /trips/{id}/documents` | Upload document | POST (multipart) | File + category | `DocumentResponse` | Accepts file, returns metadata |
| `GET /trips/{id}/documents` | List documents | GET | — | `DocumentResponse[]` | Returns fixture list |
| `POST /trips/{id}/expenses` | Log expense | POST | `ExpenseRequest` | `ExpenseResponse` | Appends to fixture list |
| `GET /trips/{id}/expenses` | List expenses | GET | — | `ExpenseResponse[]` | Returns fixture list |
| `POST /trips/{id}/exceptions` | Report exception | POST | `ExceptionRequest` | `ExceptionResponse` | Sets exception state on fixture |
| `POST /location/log` | GPS tracking | POST | `{ tripId, points: [{lat, lng, ts, accuracy}] }` | `204 No Content` | Silent sink |

### 2.3 Auth & Session Dependencies (from 004-driver-auth-session)

| Dependency | Provided By | Used For |
|-----------|------------|---------|
| JWT token | `UserSession.jwt` | Bearer token on all API calls |
| contactId | `UserSession.contactId` (nullable — Gap G1) | Scoping `GET /trips/driver/active` to this driver |
| userId | `UserSession.userId` | Audit: `triggered_by` field on transitions |
| authorities | `UserSession.authorities` | Client-side gate: `TRIP_READ_OWN`, `TRIP_UPDATE_STATUS` |
| 401 interceptor | Auth module | Auto-logout on expired session |

---

## 3. Data Freshness & Caching Strategy

| Data | Cache Duration | Refresh Trigger | Stale Tolerance |
|------|---------------|----------------|----------------|
| Active trip (detail) | Until explicit refresh | App foreground (> 30s), pull-to-refresh, after milestone action | Show stale + refresh in background |
| Milestones | Same as trip detail | After milestone transition | Show stale + refresh |
| Documents | Until explicit refresh | After upload completes | Show stale |
| Expenses | Until explicit refresh | After expense save | Show stale |
| Map tiles | Platform cache (OS-level) | — | Standard tile cache |
| GPS position | Real-time (5 min) | Next tracking interval | Show last known position |

---

## 4. Data Size Estimates

| Data Type | Estimated Size | Impact |
|-----------|---------------|--------|
| Trip detail response | ~2–5 KB | Negligible |
| Milestone list (10 items) | ~5–10 KB | Negligible |
| Document list (10 items) | ~3–5 KB (metadata only) | Negligible |
| Individual photo (compressed) | 500 KB – 3 MB | Upload progress needed. Queue for offline. |
| POD (2 photos + signature) | 2–8 MB total | Multi-part upload with per-file progress |
| GPS batch (12 points/hr) | ~1 KB per batch | Negligible |
| Expense list (20 items) | ~5 KB | Negligible |
| Local offline queue (worst case) | ~50 MB (if many photos queued) | App should warn at > 100 MB pending |

---

## 5. Error Contract Expectations

| API Call | Expected Error Codes | UX Response |
|---------|---------------------|-------------|
| Any call | `401 Unauthorized` | Global interceptor → logout → login screen |
| Any call | `403 Forbidden` | Snackbar: "You don't have permission for this action." |
| `POST /trips/{id}/accept` | `409 Conflict` (timeout or already accepted) | Refresh trip → show current state. Snackbar: "Trip state has changed." |
| `POST /trips/{id}/transition` | `409 Conflict` (wrong state) | Refresh trip → show current state. Snackbar: "Trip state has changed." |
| `POST /trips/{id}/transition` | `422 Unprocessable` (guard violation, e.g. EWB) | Inline blocked message (per interaction-rules §4) |
| `POST /trips/{id}/pod` | `413 Payload Too Large` | Snackbar: "Files too large. Compress and retry." |
| Any call | `500 Internal Server Error` | Snackbar: "Something went wrong. Tap to retry." |
| Any call | Network error (no response) | If queuable: queue + offline indicator. If not: snackbar with retry. |
