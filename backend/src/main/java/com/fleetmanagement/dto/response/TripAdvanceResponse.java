package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TripAdvanceResponse {
    private UUID id;
    private UUID tripId;
    private UUID driverId;
    private String driverName;
    private BigDecimal amount;
    private String paymentMode;
    private UUID sourceAccountId;
    private LocalDate givenDate;
    private UUID givenBy;
    private String notes;
    private LocalDateTime createdAt;
}
