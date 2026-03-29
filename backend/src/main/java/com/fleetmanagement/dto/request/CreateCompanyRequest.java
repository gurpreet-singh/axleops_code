package com.fleetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateCompanyRequest {

    private String panNumber;
    @NotBlank
    private String legalName;
    private String tradeName;
    private String cinNumber;
    @NotBlank
    private String companyType; // CLIENT, VENDOR, BOTH, INTERNAL
    private String defaultPaymentTerms;
    private String ourVendorCode;
    private BigDecimal lastYearRevenue;
    private String website;
    private boolean gstRegistered;
    private boolean fuelVendor;
    private List<String> gstins;
}
