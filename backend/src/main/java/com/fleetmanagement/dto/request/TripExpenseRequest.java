package com.fleetmanagement.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TripExpenseRequest {
    private UUID expenseCategoryId;
    private String expenseCategoryName;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String description;
    private String paymentMode;
    // Fuel-specific
    private UUID fuelPumpAccountId;
    private BigDecimal fuelLitres;
    private BigDecimal fuelRatePerLitre;
    private BigDecimal odometerReading;
}
