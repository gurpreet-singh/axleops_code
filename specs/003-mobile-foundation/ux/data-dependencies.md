# Data Dependencies — Mobile Foundation

> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/ux/ux-brief.md)  
> **Date**: 2026-03-28

---

## 1. Foundation Screen Data Dependencies

### 1.1 Startup Flow

| Step | Data Required | Source | Mock Available | Failure Behavior |
|------|--------------|--------|----------------|-----------------|
| **Session check** | JWT token string | Local secure storage (Keychain / EncryptedPrefs) | N/A (local read) | No token → Login screen |
| **Session validate** | User profile (id, email, display name, roles) | `GET /auth/me` (real backend) | ✅ Mock fixture returns canned profile | Network error → ErrorScreen + retry. 401 → clear token, show Login |
| **Role filter** | List of mobile-supported role IDs | `RoleRegistry` (local config) | N/A (hardcoded registry) | — |
| **Role selection** | Selected role confirmation | `POST /auth/select-role` (real backend) | ✅ Mock returns success immediately | Network error → ErrorScreen + retry |

### 1.2 Login Screen

| Data | Source | Mock Available | Notes |
|------|--------|----------------|-------|
| Email + password (user input) | User keyboard entry | N/A | Foundation provides form shell; spec-004 defines design |
| Auth response (JWT + profile) | `POST /auth/login` (real backend) | ✅ Mock returns canned JWT + profile | Mock accepts any credentials |

### 1.3 Role Selector Screen

| Data | Source | Mock Available | Notes |
|------|--------|----------------|-------|
| Available roles | From `GET /auth/me` response → filtered by `RoleRegistry` | ✅ (mocked via auth mock) | Displayed as cards with role icon + label |

### 1.4 Settings Screen

| Section | Data | Source | Mock Available | Notes |
|---------|------|--------|----------------|-------|
| Profile | Name, phone, email, branch, license | `GET /auth/me` + `GET /contacts/{id}` | ✅ Profile from auth mock. Contact from contact mock. | G-17 gap: `GET /auth/me` does not include `contactId`. Mock enriches response. |
| Session | Logout action | `POST /auth/logout` (best-effort) + local token clear | ✅ Mock: local-only clear | Real logout call is fire-and-forget; local token clear is authoritative |
| App Info | Version, build | Local BuildConfig | N/A (always local) | — |
| Data Sources | Feature mock/real status | `DataSourceConfig` (local) | N/A (always local) | Only visible in debug/QA builds |

---

## 2. API Dependencies Summary

### 2.1 Real Backend Endpoints (Foundation Uses Directly)

| Endpoint | Method | Purpose | Response Shape (Expected) |
|----------|--------|---------|--------------------------|
| `/auth/login` | POST | Authenticate user | `{ token: string, user: { id, email, displayName, roles: string[] } }` |
| `/auth/me` | GET | Validate session, get profile | `{ id, email, displayName, roles: string[], tenantId }` |
| `/auth/select-role` | POST | Confirm role selection | `{ token: string }` (potentially updated token with role claim) |
| `/auth/logout` | POST | Invalidate server session | `204 No Content` |

### 2.2 Real Backend Endpoints (Feature Screens Use, Foundation Configures Client)

These are NOT called by foundation code, but the API client configured by the foundation is used to call them. Listed here for completeness.

| Endpoint | Feature Epic | Notes |
|----------|-------------|-------|
| `GET /trips` | Active Trip, Past Trips | Foundation provides mock fixture for development |
| `GET /trips/{id}` | Active Trip detail | Foundation provides mock fixture |
| `GET /contacts/{id}` | Settings profile section | G-17: no FK from User → Contact |
| `POST /files/upload` | Upload baseline | **Does not exist yet.** Foundation mocks this entirely. |
| `GET /driver-ledger/{contactId}` | Earnings | **Does not exist yet.** Foundation provides mock fixture. |

### 2.3 Mock Fixtures (Foundation Provides)

| Fixture File | Path (in resources) | Purpose | Shape |
|-------------|---------------------|---------|-------|
| `auth-login.json` | `files/mocks/auth-login.json` | Mock login response | JWT + user profile |
| `auth-me.json` | `files/mocks/auth-me.json` | Mock session validation | User profile with roles |
| `contact-driver.json` | `files/mocks/contact-driver.json` | Mock driver contact | Contact with name, phone, license info |
| `trips-active.json` | `files/mocks/trips-active.json` | Mock active trip | Single trip with milestone progress |
| `trips-past.json` | `files/mocks/trips-past.json` | Mock past trip list | Array of completed/settled trips |
| `earnings-summary.json` | `files/mocks/earnings-summary.json` | Mock earnings data | Summary + transaction list |
| `file-upload-success.json` | `files/mocks/file-upload-success.json` | Mock file upload response | `{ url: string, id: string }` |

---

## 3. Data Flow Architecture

### 3.1 Layer Diagram

```
┌──────────────┐
│   UI Layer   │  Composables + ViewModels
│  (Compose)   │  Observes UiState<T>
└──────┬───────┘
       │ calls
       ▼
┌──────────────┐
│ Domain Layer │  Repository interfaces + domain models
│ (interfaces) │  Pure Kotlin, no framework deps
└──────┬───────┘
       │ implemented by
       ▼
┌──────────────┐     ┌──────────────┐
│  Real Data   │     │  Mock Data   │
│   Source     │     │   Source     │
│ (Ktor HTTP)  │     │ (JSON files) │
└──────────────┘     └──────────────┘
       │                    │
       │ DI selects one    │
       └────────┬───────────┘
                │
        ┌───────▼───────┐
        │ Koin Module   │
        │ provides impl │
        │ based on      │
        │ DataSourceMode│
        └───────────────┘
```

### 3.2 Data Source Selection

| Mode | Behavior | When Used |
|------|----------|-----------|
| `REAL` | Repository calls backend via Ktor HTTP client | Production. Staging when backend is available. |
| `MOCK` | Repository loads JSON fixtures from app resources | Development. QA testing edge cases. Backend unavailable. |
| `HYBRID` | Primary fetch is real; missing fields supplemented from mock data | Transitional: backend endpoints exist but are incomplete (e.g., missing fields). |

Selection is per-feature, configured via `DataSourceConfig` (see [spec-003 FR-033–036](file:///Users/ankit/a/fleetly/axleops_code/specs/003-mobile-foundation/spec.md)).

### 3.3 DTO ↔ Domain Model Mapping

| Concern | Rule |
|---------|------|
| **DTOs** | Mirror the backend's JSON response shape exactly. Live in `data/dto/` package. Annotated with `@Serializable`. |
| **Domain models** | App's internal representation. Live in `domain/model/` package. Pure Kotlin data classes. No serialization annotations. |
| **Mappers** | Functions in `data/mapper/` that convert DTO → Domain. Handle missing fields, default values, and format conversions. |
| **Direction** | One-way: DTO → Domain for reads. Domain → DTO for writes (request bodies). |

---

## 4. UX Impact of Data Gaps

| Gap | UX Impact | Foundation Mitigation |
|-----|-----------|----------------------|
| **No `contactId` in `/auth/me`** | Settings profile section cannot show driver-specific info (phone, license) from real backend | Mock enriches `/me` with `contactId`. Real mode shows partial profile (name + email only) until backend resolves G-17. |
| **No file upload endpoint** | Upload progress succeeds locally but has no server persistence in real mode | Foundation marks upload service as mock-only until endpoint ships. Feature screens show uploads completing (mock success). |
| **No driver-scoped trip query** | Active trip tab cannot filter by `driverId` in real mode | Foundation provides mock fixture. Feature epic (Active Trip) will implement hybrid mode: real fetch + client-side filter. |
| **No driver ledger endpoint** | Earnings tab shows mock data only | Foundation provides mock fixture. Feature epic (Earnings) will define the derived contract. |

---

## 5. Offline Data Strategy

| Data | Cached? | Stale Behavior |
|------|---------|----------------|
| **JWT token** | ✅ Persisted in secure storage | Valid until backend says otherwise or TTL expires |
| **User profile** | ✅ In-memory (ViewModel scope) | Survives tab switches. Lost on app kill. |
| **Last-fetched screen data** | ✅ In-memory (ViewModel scope) | Shown with "Last updated X min ago" banner when offline |
| **Mock fixtures** | ✅ Bundled with app | Always available regardless of connectivity |
| **Captured files (pre-upload)** | ✅ Local device storage | Persist until upload succeeds or user explicitly deletes |
| **Feature data** | Feature-defined | Foundation does not implement persistent cache (deferred to offline epic) |
