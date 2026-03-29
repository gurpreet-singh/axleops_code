package com.fleetmanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
public class ComplianceDocumentResponse {

    private UUID id;
    private UUID vehicleId;
    private String vehicleRegistrationNumber;

    // ─── Common Fields ──────────────────────────────────────────
    private String documentType;
    private String documentNumber;
    private String status;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private LocalDate issuedDate;
    private BigDecimal amount;

    // ─── Versioning ─────────────────────────────────────────────
    private Integer versionNumber;
    private Boolean isCurrent;
    private UUID previousVersionId;
    private String renewalSource;
    private String notes;

    // ─── Computed ────────────────────────────────────────────────
    private Long daysRemaining;
    private String expiryStatus; // ACTIVE, EXPIRING_SOON, EXPIRED

    // ─── Type-Specific Details ──────────────────────────────────
    private Map<String, Object> details;
}
