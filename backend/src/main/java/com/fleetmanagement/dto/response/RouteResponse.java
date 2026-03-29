package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RouteResponse {
    private UUID id;
    private String name;
    private String origin;
    private String destination;
    private BigDecimal distanceKm;
    private BigDecimal estimatedHours;
    private BigDecimal tollCost;
    private String via;
    private String originPin;
    private String destPin;
    private Integer slaHours;
    private String paymentTerms;
    private String template;
    private String status;
    private String vehicleType;
    private String billingType;
    private String documentSeries;

    // Charge columns
    private BigDecimal freightRate;
    private BigDecimal gdsCharges;
    private BigDecimal stCharges;
    private BigDecimal insurance;
    private BigDecimal loadingCharges;
    private BigDecimal unloadingCharges;
    private BigDecimal deliveryCharges;
    private BigDecimal collectionCharges;
    private BigDecimal detentionCharges;
    private BigDecimal godownCharges;
    private BigDecimal lrCharges;
    private BigDecimal otherCharges;

    // Operational defaults
    private BigDecimal driverExpense;
    private BigDecimal dieselLitres;

    // Instructions
    private String loadingInstructions;
    private String unloadingInstructions;

    // FK names
    private UUID ledgerAccountId;
    private String ledgerAccountName;
    private UUID invoiceTypeId;
    private String invoiceTypeName;
    private UUID annexureTypeId;
    private String annexureTypeName;
}
