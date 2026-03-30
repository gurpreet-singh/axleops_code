package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class BranchResponse {
    private UUID id;
    private String code;
    private String name;
    private String city;
    private String state;
    private String stateCode;
    private String address;
    private String phone;
    private String email;
    private String gstin;
    private UUID managerId;
    private String managerName;
    private boolean headquarters;
    private boolean active;
    private Integer sortOrder;

    // Computed counts for the settings page
    private Long vehicleCount;
    private Long driverCount;
    private Long tripCount;
}
