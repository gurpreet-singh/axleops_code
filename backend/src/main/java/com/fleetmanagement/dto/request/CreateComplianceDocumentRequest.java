package com.fleetmanagement.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Unified compliance document creation/renewal request.
 * Common fields are at the top level; type-specific fields
 * are in the 'details' map.
 */
@Data
public class CreateComplianceDocumentRequest {

    // ─── Common Fields ──────────────────────────────────────────
    private String documentType; // RC, PERMIT, PUC, PASSING, INSURANCE, ROAD_TAX, GREEN_TAX, AUTHORITY, CFRA, PTI, FASTAG, PROFESSION_TAX
    private String documentNumber;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private LocalDate issuedDate;
    private BigDecimal amount;
    private String notes;

    // ─── Type-Specific Fields (flexible map) ────────────────────
    // For INSURANCE: insuranceCompany, policyNumber, policyType, sumInsured, netPremium, grossPremium, ...
    // For PERMIT: permitNumber, permitType, issuingAuthority, routeDescription, goodsDescription, ...
    // For PUC: pucNumber, pucDate, pucExpiryDate, testingCenter, ...
    // ... etc. for each document type
    private Map<String, Object> details;
}
