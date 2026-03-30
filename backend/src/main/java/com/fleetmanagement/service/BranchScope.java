package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantPrincipal;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.function.BiFunction;
import java.util.function.Function;

/**
 * Branch-aware query routing utility.
 *
 * Picks the correct repository method based on whether the user
 * is tenant-wide (sees all branches) or branch-scoped (sees one branch).
 *
 * Usage:
 *   return branchScope.queryList(principal,
 *       repo::findByTenantId,          // tenant-wide query
 *       repo::findByTenantIdAndBranchId // branch-scoped query
 *   );
 */
@Component
public class BranchScope {

    /**
     * Route a list query to the appropriate repository method.
     *
     * @param p           Authenticated principal
     * @param tenantQuery Query returning all tenant data (for Owner/Super Admin)
     * @param branchQuery Query filtering by branch (for branch-scoped users)
     */
    public <T> List<T> queryList(
            TenantPrincipal p,
            Function<UUID, List<T>> tenantQuery,
            BiFunction<UUID, UUID, List<T>> branchQuery) {

        if (p.isTenantWide()) {
            return tenantQuery.apply(p.tenantId());
        }
        return branchQuery.apply(p.tenantId(), p.branchId());
    }

    /**
     * Route a count query to the appropriate repository method.
     */
    public long queryCount(
            TenantPrincipal p,
            Function<UUID, Long> tenantCount,
            BiFunction<UUID, UUID, Long> branchCount) {

        if (p.isTenantWide()) {
            return tenantCount.apply(p.tenantId());
        }
        return branchCount.apply(p.tenantId(), p.branchId());
    }
}
