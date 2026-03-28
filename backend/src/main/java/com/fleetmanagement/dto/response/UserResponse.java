package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private List<String> roles;
    private String title;
    private UUID branchId;
    private String branchName;
    private boolean active;
}