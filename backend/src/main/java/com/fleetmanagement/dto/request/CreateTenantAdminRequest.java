package com.fleetmanagement.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateTenantAdminRequest {
    private UUID tenantId;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String title;
    private String phone;
}
