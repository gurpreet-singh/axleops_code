package com.fleetmanagement.config;

import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Authenticated principal carried in the SecurityContext.
 * Contains the user's identity and tenant/branch context
 * extracted from the JWT token.
 *
 * branchId = null means tenant-wide access (Owner, Super Admin, Finance).
 * branchId = UUID means branch-scoped access (Fleet Manager, Branch Manager, etc.)
 */
public record TenantPrincipal(
    UUID userId,
    UUID tenantId,
    UUID branchId       // null = tenant-wide access
) {

    /**
     * Returns true if this user has tenant-wide (cross-branch) access.
     * Owner, Super Admin, Finance Controller have branchId = null.
     */
    public boolean isTenantWide() {
        return branchId == null;
    }

    /**
     * Convenience: get the current TenantPrincipal from SecurityContext.
     */
    public static TenantPrincipal current() {
        return (TenantPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
    }
}
