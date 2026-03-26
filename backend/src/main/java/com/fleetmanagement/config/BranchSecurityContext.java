package com.fleetmanagement.config;

import java.util.List;
import java.util.UUID;

public class BranchSecurityContext {

    private static final ThreadLocal<List<UUID>> CONTEXT = new ThreadLocal<>();

    public static void set(List<UUID> branchIds) {
        CONTEXT.set(branchIds);
    }

    public static List<UUID> get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}