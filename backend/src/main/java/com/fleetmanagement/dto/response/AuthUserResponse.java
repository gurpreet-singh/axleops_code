package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response for the /auth/me endpoint and login response.
 * Contains full role, authority, and branch context information.
 */
@Data
@Builder
public class AuthUserResponse {
    private UUID id;
    private String fullName;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phone;
    private UUID tenantId;
    private String tenantName;

    // ─── Branch context ─────────────────────────────────────
    private UUID branchId;         // user's assigned branch (null = tenant-wide)
    private String branchCode;     // for display
    private String branchName;
    private int branchCount;       // total active branches for this tenant
    private List<BranchSummary> allBranches; // for branch-switcher dropdown

    /** All roles assigned to this user */
    private List<RoleInfo> roles;

    /** Flattened authorities from the active role(s) */
    private List<String> authorities;

    /** "TENANT" or "PLATFORM" */
    private String type;

    /**
     * Lightweight branch summary for the allBranches list.
     */
    @Data
    @Builder
    public static class BranchSummary {
        private UUID id;
        private String code;
        private String name;
    }
}
