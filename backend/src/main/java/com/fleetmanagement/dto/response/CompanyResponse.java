package com.fleetmanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CompanyResponse {
    private UUID id;
    private String panNumber;
    private String legalName;
    private String tradeName;
    private String cinNumber;
    private String companyType;
    private String defaultPaymentTerms;
    private String ourVendorCode;
    private BigDecimal lastYearRevenue;
    private String website;
    private boolean gstRegistered;
    private boolean fuelVendor;
    private List<String> gstins;
}
