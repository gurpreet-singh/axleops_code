package com.fleetmanagement.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ContactResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String type;
    private String licenseNumber;
    private LocalDate licenseExpiry;
    private String city;
    private String status;
    private String branchName;
}
