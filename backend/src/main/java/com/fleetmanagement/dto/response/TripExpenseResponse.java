package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TripExpenseResponse {
    private UUID id;
    private UUID tripId;
    private UUID expenseCategoryId;
    private String expenseCategoryName;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String description;
    private String paymentMode;
    private String receiptUrl;
    private UUID fuelPumpAccountId;
    private BigDecimal fuelLitres;
    private BigDecimal fuelRatePerLitre;
    private BigDecimal odometerReading;
    private UUID loggedBy;
    private LocalDateTime createdAt;
}
