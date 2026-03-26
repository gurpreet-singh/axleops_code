package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class VoucherResponse {
    private UUID id;
    private String voucherNumber;
    private String type;
    private LocalDate date;
    private UUID debitLedgerId;
    private String debitLedgerName;
    private UUID creditLedgerId;
    private String creditLedgerName;
    private BigDecimal amount;
    private String narration;
    private UUID tripId;
    private String tripNumber;
}