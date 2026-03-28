# Mobile Role Strategy — Backend Gaps

> **Status**: Living document. Updated as gaps are resolved.
> **Last updated**: 2026-03-28

## G1: User ↔ Contact Link

| Field | Value |
|-------|-------|
| **Impact** | Driver role cannot auto-resolve `contactId` from JWT |
| **Current workaround** | `UserSession.contactId` is nullable; mock data uses hardcoded `driverId=501` |
| **Resolution** | Backend adds `contact_id` to `POST /auth/select-role` response |
| **Blocked features** | Driver-scoped trip queries, earnings lookup |

## G2: Driver-scoped Trip Queries

| Field | Value |
|-------|-------|
| **Impact** | `GET /trips?driverId=X` not supported |
| **Current workaround** | `DataSourceConfig.tripSource = MOCK` for driver trips |
| **Resolution** | Backend adds `driverId` query parameter to `GET /trips` |
| **Blocked features** | Real driver trip list |

## G3: Earnings API

| Field | Value |
|-------|-------|
| **Impact** | No earnings endpoint exists |
| **Current workaround** | `EarningsRepository` is mock-only; `DataSourceConfig.earningsSource = MOCK` |
| **Resolution** | Backend creates `GET /earnings?driverId=X&period=YYYY-MM` |
| **Blocked features** | Real earnings display |

## G4: Driver Trip Milestones

| Field | Value |
|-------|-------|
| **Impact** | No milestone tracking endpoint |
| **Current workaround** | `DataSourceConfig.milestoneSource = MOCK` |
| **Resolution** | Backend creates milestone CRUD endpoints |
| **Blocked features** | Trip progress tracking, location updates |

## G5: Proof of Delivery

| Field | Value |
|-------|-------|
| **Impact** | No POD upload/download endpoint |
| **Current workaround** | `DataSourceConfig.podSource = MOCK` |
| **Resolution** | Backend creates POD file management endpoints |
| **Blocked features** | Document capture, delivery confirmation |
