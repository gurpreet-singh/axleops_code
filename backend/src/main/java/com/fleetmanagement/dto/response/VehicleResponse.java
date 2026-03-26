package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class VehicleResponse {
    private UUID id;
    private String registrationNumber;
    private Integer year;
    private String make;
    private String model;
    private String chassisNumber;
    private String status;
    private String vehicleTypeName;
    private String vehicleGroup;
    private BigDecimal odometer;
    private String fuelType;
}
