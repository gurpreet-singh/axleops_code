package com.fleetmanagement.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler — converts security and business exceptions
 * into proper HTTP responses with structured JSON bodies.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 403);
        body.put("error", "Forbidden");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(TenantMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTenantMismatch(TenantMismatchException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 403);
        body.put("error", "Forbidden");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 404);
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(MasterInUseException.class)
    public ResponseEntity<Map<String, Object>> handleMasterInUse(MasterInUseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 409);
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("entity", ex.getEntity());
        body.put("entityId", ex.getEntityId());
        body.put("referenceCount", ex.getReferenceCount());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(BranchInUseException.class)
    public ResponseEntity<Map<String, Object>> handleBranchInUse(BranchInUseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 409);
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("branchId", ex.getBranchId());
        body.put("vehicleCount", ex.getVehicleCount());
        body.put("driverCount", ex.getDriverCount());
        body.put("tripCount", ex.getTripCount());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidStatusTransition(InvalidStatusTransitionException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 409);
        body.put("error", "Conflict");
        body.put("message", ex.getMessage());
        body.put("currentStatus", ex.getCurrentStatus().name());
        body.put("attemptedAction", ex.getAttemptedAction());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 400);
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Safety net — catches DB-level constraint violations that bypass
     * service-level validation (e.g. race conditions, missing service checks).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());

        String detail = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage() : "";

        String message;
        int status;

        if (detail != null && (detail.contains("unique constraint") || detail.contains("duplicate key"))) {
            message = "Duplicate entry: a record with this value already exists";
            status = 409;
        } else if (detail != null && detail.contains("not-null constraint")) {
            message = "A required field is missing: " + extractColumnName(detail);
            status = 400;
        } else if (detail != null && detail.contains("foreign key constraint")) {
            message = "Referenced record does not exist or cannot be removed due to dependencies";
            status = 409;
        } else {
            message = "Data integrity error — check required fields and references";
            status = 409;
        }

        body.put("status", status);
        body.put("error", status == 400 ? "Bad Request" : "Conflict");
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    /** Extract column name from PostgreSQL not-null violation messages. */
    private String extractColumnName(String detail) {
        // PostgreSQL format: "null value in column \"xyz\" of relation ..."
        if (detail != null && detail.contains("column \"")) {
            int start = detail.indexOf("column \"") + 8;
            int end = detail.indexOf("\"", start);
            if (end > start) return detail.substring(start, end);
        }
        return "unknown";
    }
}
