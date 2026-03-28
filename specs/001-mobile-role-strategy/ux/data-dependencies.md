# Data Dependencies — Mobile Role Strategy

## Screen → Data Source Mapping

| Screen | Data Required | Source | API Endpoint | Mock/Real |
|--------|--------------|--------|-------------|-----------|
| **LoginScreen** | None (input-only) | — | `POST /auth/login` | Real |
| **RoleSelectorScreen** | User profile + roles | `AuthRepository.getMe()` | `GET /auth/me` | Real |
| **AuthShell** | RoleConfig | `RoleRegistry.getConfig()` | None (local) | N/A |
| **SettingsScreen** | UserSession, DataSourceConfig | Koin injection | None | N/A |
| **Driver tab placeholders** | None (placeholder text) | — | — | — |
| **OpsExec tab placeholders** | None (placeholder text) | — | — | — |
| **UnsupportedRoleScreen** | None (static message) | — | — | — |

## Repository → API Mapping

| Repository | Methods | Real API | Mock Source | Config Key |
|-----------|---------|----------|------------|------------|
| `AuthRepository` | login, getMe, selectRole, logout | `POST /auth/login`, `GET /auth/me`, `POST /auth/select-role`, `POST /auth/logout` | N/A (always real) | `authSource` |
| `TripRepository` | getTrips(filter), getTrip(id) | `GET /trips`, `GET /trips/{id}` | `trips/driver-trips.json` | `tripSource` |
| `EarningsRepository` | getEarnings(driverId, period), getAvailablePeriods(driverId) | ❌ No backend API | `earnings/driver-earnings.json` | `earningsSource` |

## Data Source Mode Defaults

| Feature | Default Mode | Reason |
|---------|-------------|--------|
| Auth | `REAL` | Auth endpoints exist |
| Trips | `REAL` | `GET /trips` exists (note: driverId filter is a backend gap) |
| Vehicle | `REAL` | `GET /vehicles` exists |
| Contact | `REAL` | `GET /contacts` exists |
| Milestones | `MOCK` | No endpoint |
| POD | `MOCK` | No endpoint |
| Earnings | `MOCK` | No endpoint |

## Backend Gaps Affecting UX

| Gap | Screen Impact | Current Behavior |
|-----|--------------|-----------------|
| G1: No User↔Contact link | SettingsScreen can't show full driver profile | `contactId` is nullable in `UserSession` |
| G2: No driverId filter | Past Trips shows all tenant trips, not driver-scoped | MockTripRepository applies client-side filter |
| G4: No earnings API | Earnings tab has no real data source | Always mock-backed |

## Implementation Divergences

> [!WARNING]
> **`DataSourceConfig` is not reactive** — the debug toggles in SettingsScreen write to nothing. The config is a static `DataSourceConfig.DEFAULT` passed as a parameter. Switching from mock to real at runtime does not work. See design-review F4.
