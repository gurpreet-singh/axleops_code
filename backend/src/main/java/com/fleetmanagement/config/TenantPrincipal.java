package com.fleetmanagement.config;

import java.util.UUID;

/**
 * Authenticated principal carried in the SecurityContext.
 * Contains the user's identity and tenant/branch context
 * extracted from the JWT token.
 */
public record TenantPrincipal(
    UUID userId,
    UUID tenantId,
    UUID branchId
) {
}
