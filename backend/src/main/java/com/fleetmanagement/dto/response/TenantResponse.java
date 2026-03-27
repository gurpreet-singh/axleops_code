package com.fleetmanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TenantResponse {
    private UUID id;
    private String name;
    private String tradeName;
    private String gstin;
    private String pan;
    private String address;
    private String city;
    private String state;
    private String phone;
    private String email;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // aggregated counts
    private long branchCount;
    private long userCount;
}
