package com.fleetmanagement.dto.response;

import lombok.Data;


import java.util.Set;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phone;
    private String title;
    private Set<String> roles;
    private String branchName;
    private UUID branchId;

    private String status;
    private boolean loginEnabled;
    private boolean active;
}