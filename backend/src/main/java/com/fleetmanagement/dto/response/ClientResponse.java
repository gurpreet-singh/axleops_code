package com.fleetmanagement.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class ClientResponse {
    private UUID id;
    private String name;
    private String industry;
    private String gstNumber;
    private String status;
}