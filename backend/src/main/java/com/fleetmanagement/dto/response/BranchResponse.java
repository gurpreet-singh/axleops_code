package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class BranchResponse {
    private UUID id;
    private String name;
    private String city;
    private String state;
    private String address;
    private String phone;
    private String email;
    private Boolean isPrimary;
    private String status;
    private UUID tenantId;
}
