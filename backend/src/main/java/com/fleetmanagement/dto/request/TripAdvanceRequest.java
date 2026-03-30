package com.fleetmanagement.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TripAdvanceRequest {
    private BigDecimal amount;
    private String paymentMode;
    private UUID sourceAccountId;
    private LocalDate givenDate;
    private String notes;
}
