package com.fleetmanagement.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class CreateTripRequest {

    // ─── Core Selection ─────────────────────────────────────────
    private UUID vehicleId;
    private UUID driverId;
    private UUID routeId;
    private String tripType; // FTL, PTL, LTL, CONTAINER, TANKER, ODC
    private UUID branchId;

    // ─── LR / Consignment Note ──────────────────────────────────
    private String lrNumber;
    private LocalDate lrDate;
    private LocalDate dispatchDate;
    private LocalTime dispatchTime;
    private String clientInvoiceNumbers;

    // ─── Parties ────────────────────────────────────────────────
    private UUID consignorId;
    private UUID consigneeId;
    private UUID billingPartyId;
    private UUID transporterId;
    private String consignorAddress;
    private String consigneeAddress;

    // ─── Cargo Details ──────────────────────────────────────────
    private String cargoDescription;
    private String materialType;
    private BigDecimal weightKg;
    private Integer packagesCount;
    private BigDecimal consignmentValue;
    private String ewayBillNumber;
    private String riskType; // CARRIER_RISK, OWNER_RISK
    private Integer trolleyPalletQty;

    // ─── Financial ──────────────────────────────────────────────
    private BigDecimal freightAmount;
    private String paymentTerms; // TO_PAY, PAID, TO_BE_BILLED
    private String loadingNote;

    // ─── Additional ─────────────────────────────────────────────
    private String permitNumber;
    private String documentNumber;
    private String remarks;
}
