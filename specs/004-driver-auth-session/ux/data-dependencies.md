# Data Dependencies: Driver Auth & Session

> **Feature**: 004-driver-auth-session  
> **Parent**: [ux-brief.md](file:///Users/ankit/a/fleetly/axleops_code/specs/004-driver-auth-session/ux/ux-brief.md)

---

## 1. API Dependencies

### 1.1 Endpoints Used

| Endpoint | Method | Request | Response | Status |
|----------|--------|---------|----------|--------|
| `/auth/login` | POST | `{ username, password }` | `{ token, user: AuthUserResponse }` | ✅ Real — exists |
| `/auth/me` | GET | Bearer token | `AuthUserResponse` | ✅ Real — exists |
| `/auth/select-role` | POST | `{ roleCode }` + Bearer token | `{ token, user: AuthUserResponse }` | ✅ Real — exists |
| `/auth/logout` | POST | Bearer token | `{ message }` | ✅ Real — exists |

All four endpoints are real and functional. **No derived contracts required for this feature.**

### 1.2 AuthUserResponse Shape

```
AuthUserResponse {
  id:          UUID
  fullName:    String
  firstName:   String
  lastName:    String
  email:       String
  tenantId:    UUID?
  tenantName:  String?
  branchId:    UUID?
  branchName:  String?
  roles:       List<RoleInfo>     ← all assigned roles
  authorities: List<String>       ← flattened from active role(s)
  type:        "TENANT" | "PLATFORM"
}

RoleInfo {
  code:        String             ← enum name (e.g., "DRIVER")
  displayName: String             ← "Driver"
  department:  String             ← "Operations"
}
```

---

## 2. Screen → Data Mapping

### 2.1 Login Screen

| Data needed | Source | Timing |
|-------------|--------|--------|
| None (form-only) | User input | — |
| Error message (on failure) | API error response or network exception | On login failure |

### 2.2 Session Restore State

| Data needed | Source | Timing |
|-------------|--------|--------|
| Stored JWT token | Local persistent storage (`Settings` / `SharedPreferences` / `NSUserDefaults`) | App launch |
| AuthUserResponse | `GET /auth/me` with stored token | App launch re-validation |

### 2.3 Role Selector Screen

| Data needed | Source | Timing |
|-------------|--------|--------|
| User display name | `AuthUserResponse.fullName` from getMe response | After login |
| Filtered role list | `AuthUserResponse.roles` → filter to `RoleRegistry.supportedRoles()` → exclude "ALL" | After login |
| Role display labels | `RoleRegistry.getConfig(role).label` | Static (compiled into app) |
| Role descriptions | `roleDescription(role)` function | Static (compiled into app) |

### 2.4 Unsupported Role Screen

| Data needed | Source | Timing |
|-------------|--------|--------|
| None (static message) | Hardcoded strings | — |

### 2.5 Driver Shell (Authenticated)

| Data needed | Source | Timing |
|-------------|--------|--------|
| `UserSession` object | Constructed from selectRole response | After role selection |
| `RoleConfig` for DRIVER | `RoleRegistry.getConfig(AppRole.DRIVER)` | Static |

---

## 3. UserSession Construction

The `UserSession` is the output of the auth feature. It is consumed by every downstream driver feature.

```
UserSession {
  userId:       ← AuthUserResponse.id (as String)
  displayName:  ← AuthUserResponse.fullName
  activeRole:   ← AppRole.DRIVER (the selected role)
  jwt:          ← token from selectRole response
  authorities:  ← AuthUserResponse.authorities from selectRole response
  contactId:    ← null (Gap G1: backend does not provide this)
  branchId:     ← AuthUserResponse.branchId (as String?)
  tenantId:     ← AuthUserResponse.tenantId (as String?)
}
```

### Gap G1 Impact on Data

`contactId` is null until the backend adds a `User → Contact` mapping. Downstream features (Active Trip, Past Trips) that need to query "my trips" will need to use `userId` or a workaround until G1 is resolved.

---

## 4. Persistent Storage

| Item | Storage | Lifecycle |
|------|---------|-----------|
| Full session (JWT, userId, displayName, activeRole, authorities, contactId, branchId, tenantId) | `SessionPersistence` via `Settings` (`NSUserDefaults` / `SharedPreferences`) | Written after selectRole success; cleared on logout or 401 |
| Active role | Persisted as part of session (spec FR-050) | Restored on cold start; no re-resolution (clarification Q2) |
| Credentials | Not persisted (no "remember me" in v1) | — |

---

## 5. Error → Message Mapping

| Error Type | HTTP Status | Message Shown |
|------------|------------|---------------|
| Invalid credentials | 401 (from `/auth/login`) | "Incorrect email or password. Contact your administrator if the problem persists." |
| Account deactivated | 401 (from `/auth/login`) | Same as invalid credentials (indistinguishable — Gap G2) |
| Network unreachable | — (exception) | "Unable to connect. Check your internet connection and try again." |
| Token expired (any API) | 401 (from any endpoint) | "Your session has expired. Please sign in again." |
| getMe failure | Any non-200 or exception | "Failed to resolve user profile." |
| selectRole failure | Any non-200 or exception | "Failed to select role: [exception message]" |
| logout failure | Any (ignored) | No message — local session cleared regardless |

---

## 6. Mock Data Shape

When `DataSourceConfig.authSource == MOCK`, `MockAuthRepository` returns:

### Login

```json
{ "token": "mock-jwt-token-12345" }
```

### getMe

```json
{
  "userId": "mock-user-1",
  "displayName": "Mock Driver",
  "email": "driver@axleops-mock.com",
  "roles": ["DRIVER", "OPERATIONS_EXECUTIVE"],
  "tenantId": "mock-tenant-1"
}
```

### selectRole (DRIVER)

```json
{
  "userId": "mock-user-1",
  "displayName": "Mock Driver",
  "activeRole": "DRIVER",
  "jwt": "mock-role-jwt-token-67890",
  "authorities": ["TRIP_READ_OWN", "TRIP_UPDATE_STATUS", "VEHICLE_READ_ASSIGNED",
                   "INSPECTION_CREATE_OWN", "INSPECTION_READ_OWN",
                   "SERVICE_CREATE_BREAKDOWN", "REMINDER_READ_OWN"],
  "contactId": "mock-contact-42",
  "branchId": "mock-branch-1",
  "tenantId": "mock-tenant-1"
}
```

> Note: Mock returns `contactId` (simulating the resolved Gap G1 state). This lets downstream features be tested in mock mode even before the backend gap is resolved.
