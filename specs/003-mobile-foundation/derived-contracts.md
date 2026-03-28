# Derived API Contracts

> Phase 7 — T034 | Mobile Foundation (spec 003)

Contracts the mobile app derives from existing backend behavior.
These are **not** new endpoints — they document expected shapes
based on observed backend responses and frontend integration patterns.

---

## 1. POST /api/v1/files/upload

**Source**: `FileController.uploadFile()` in backend, consumed by frontend
`FileUploadService`.

**Purpose**: Upload a POD (Proof of Delivery) image or document.

### Request Shape
```
POST /api/v1/files/upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt>

Parts:
  - file: binary (image/jpeg, image/png, application/pdf)
  - tripId: Long (optional — associates file with trip)
  - fileType: String ("POD" | "VEHICLE_PHOTO" | "OTHER")
```

### Response Shape (200 OK)
```json
{
  "id": 42,
  "file_name": "pod_trip_123.jpg",
  "file_url": "https://storage.axleops.com/uploads/pod_trip_123.jpg",
  "file_type": "POD",
  "uploaded_at": "2026-03-28T10:30:00Z"
}
```

### Error Responses
| Status | Meaning | Mobile Action |
|--------|---------|---------------|
| 401 | Unauthorized | Trigger logout via 401 interceptor |
| 413 | Payload too large | Show "File too large" error |
| 500 | Server error | Allow retry |

### Backend Source References
- `FileController.java` — `@PostMapping("/api/v1/files/upload")`
- `FileService.java` — file validation, storage delegation
- `FileEntity.java` — JPA entity with `fileName`, `fileUrl`, `fileType`

---

## 2. GET /api/v1/contacts/{id}

**Source**: `ContactController.getContact()` in backend, consumed by
frontend trip detail views.

**Purpose**: Fetch driver/contact profile for trip assignment display.

### Request Shape
```
GET /api/v1/contacts/{id}
Authorization: Bearer <jwt>
```

### Response Shape (200 OK)
```json
{
  "id": 42,
  "first_name": "Raj",
  "last_name": "Kumar",
  "email": "raj.kumar@axleops.com",
  "phone": "+91-9876543210",
  "role": "DRIVER",
  "branch_id": 1,
  "tenant_id": 1,
  "license_number": "DL-1234567890",
  "is_active": true
}
```

### Error Responses
| Status | Meaning | Mobile Action |
|--------|---------|---------------|
| 401 | Unauthorized | Trigger logout |
| 404 | Contact not found | Show "Contact not found" |

### Backend Source References
- `ContactController.java` — `@GetMapping("/api/v1/contacts/{id}")`
- `ContactService.java` — contact lookup + authorization check
- `ContactEntity.java` — JPA entity

---

## Notes

- These contracts are **derived from observation**, not from formal backend
  API documentation. If the backend changes response shapes, the mobile DTOs
  and mappers must be updated accordingly.
- Mobile uses `ignoreUnknownKeys = true` in JSON parsing to tolerate
  additive backend changes without breaking.
- The upload endpoint may gain additional parameters (compression, metadata)
  in future epics — the derived contract captures the current minimum.
