package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TripResponse {
    private UUID id;
    private String tripNumber;
    private String lrNumber;
    private String clientName;
    private String origin;
    private String destination;
    private String vehicleRegistration;
    private String driverName;
    private String status;
    private BigDecimal revenue;
    private LocalDateTime scheduledStart;
    private LocalDateTime actualStart;
    private LocalDateTime actualArrival;
    private boolean delayed;
}
