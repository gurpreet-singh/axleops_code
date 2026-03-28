package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class TenantUserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private List<String> roles;
    private String title;
    private boolean active;
    private UUID branchId;
    private String branchName;
    private UUID tenantId;
    private String tenantName;
}
