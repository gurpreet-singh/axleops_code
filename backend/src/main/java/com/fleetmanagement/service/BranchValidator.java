package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Central branch resolution and validation.
 *
 * Used by all branch-scoped services when creating entities.
 * Determines which branch_id to assign based on:
 * 1. If user is branch-scoped → use their branch (ignore request)
 * 2. If request specifies a branch → validate and use it
 * 3. If tenant has one branch → auto-assign silently
 * 4. If tenant has multiple branches and none specified → error
 */
@Component
@RequiredArgsConstructor
public class BranchValidator {

    private final BranchRepository branchRepo;

    /**
     * Validates that a branch belongs to the tenant.
     */
    public void validate(UUID branchId, UUID tenantId) {
        if (!branchRepo.existsByIdAndTenantId(branchId, tenantId)) {
            throw new IllegalArgumentException("Branch does not belong to this tenant");
        }
    }

    /**
     * Resolves the branch for entity creation.
     *
     * Logic:
     * 1. If user is branch-scoped → use their branch (ignore request body)
     * 2. If request specifies a branch → validate and use it
     * 3. If tenant has only one branch → auto-assign silently
     * 4. If tenant has multiple branches and none specified → error
     */
    public UUID resolve(TenantPrincipal p, UUID requestedBranchId) {

        // Case 1: Branch-scoped user — always their branch
        if (p.branchId() != null) {
            return p.branchId();
        }

        // Case 2: Tenant-wide user specified a branch
        if (requestedBranchId != null) {
            validate(requestedBranchId, p.tenantId());
            return requestedBranchId;
        }

        // Case 3: Auto-assign if single branch
        List<Branch> active = branchRepo.findByTenantIdAndActiveTrue(p.tenantId());
        if (active.size() == 1) {
            return active.get(0).getId();
        }

        // Case 4: Ambiguous — multiple branches, none specified
        throw new IllegalArgumentException(
            "Branch is required when tenant has multiple branches");
    }
}
