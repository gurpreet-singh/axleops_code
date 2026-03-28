package com.fleetmanagement.config;

/**
 * Thrown when a user attempts to access or modify a resource
 * that belongs to a different tenant.
 */
public class TenantMismatchException extends RuntimeException {

    public TenantMismatchException(String message) {
        super(message);
    }

    public TenantMismatchException() {
        super("Access denied: resource belongs to a different tenant");
    }
}
