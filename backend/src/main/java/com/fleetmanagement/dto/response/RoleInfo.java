package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Role information included in auth responses.
 */
@Data
@Builder
public class RoleInfo {
    private String code;
    private String displayName;
    private String department;
}
