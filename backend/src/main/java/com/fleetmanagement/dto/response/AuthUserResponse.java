package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response for the /auth/me endpoint and login response.
 * Contains full role and authority information for the authenticated user.
 */
@Data
@Builder
public class AuthUserResponse {
    private UUID id;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private UUID tenantId;
    private String tenantName;
    private UUID branchId;
    private String branchName;

    /** All roles assigned to this user */
    private List<RoleInfo> roles;

    /** Flattened authorities from the active role(s) */
    private List<String> authorities;

    /** "TENANT" or "PLATFORM" */
    private String type;
}
