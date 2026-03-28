package com.fleetmanagement.dto.request;

import lombok.Data;

/**
 * Request body for POST /auth/select-role.
 * roleCode is the enum name of the desired role, or "ALL" for combined access.
 */
@Data
public class SelectRoleRequest {
    private String roleCode;
}
