package com.fleetmanagement.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateBranchRequest {
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
    private boolean headquarters;
    private Integer sortOrder;
}
