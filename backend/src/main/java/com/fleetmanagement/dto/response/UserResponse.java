package com.fleetmanagement.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
    private String title;
    private UUID branchId;
    private String branchName;
    private String status;
}