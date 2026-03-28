package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthUserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String title;
    private UUID tenantId;
    private String tenantName;
    private UUID branchId;
    private String branchName;
}
