package com.fleetmanagement.dto.request;

import lombok.Data;

@Data
public class CreateTenantRequest {
    private String name;
    private String tradeName;
    private String gstin;
    private String pan;
    private String address;
    private String city;
    private String state;
    private String phone;
    private String email;
    // Primary branch info
    private String primaryBranchName;
    private String primaryBranchCity;
    private String primaryBranchState;
    // System admin info
    private String adminFirstName;
    private String adminLastName;
    private String adminEmail;
    private String adminPassword;
    private String adminTitle;
}
