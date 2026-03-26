package com.fleetmanagement.config;

import java.util.UUID;

public class TenantContext {

    private static final ThreadLocal<UUID> CONTEXT = new ThreadLocal<>();

    public static void set(UUID tenantId) {
        CONTEXT.set(tenantId);
    }

    public static UUID get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}