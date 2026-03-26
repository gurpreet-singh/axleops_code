package com.fleetmanagement.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Data
public class CreateVoucherRequest {
    @NotBlank
    private String type;

    @NotNull
    private LocalDate date;

    @NotNull
    private UUID debitLedgerId;

    @NotNull
    private UUID creditLedgerId;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String narration;
    private UUID tripId;
    private UUID branchId;
}