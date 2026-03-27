package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class TenantUserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String title;
    private String status;
    private UUID branchId;
    private String branchName;
    private UUID tenantId;
    private String tenantName;
}
