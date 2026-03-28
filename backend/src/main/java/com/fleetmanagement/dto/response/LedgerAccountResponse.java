package com.fleetmanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class LedgerAccountResponse {

    private UUID id;

    // Identity
    private String accountHead;
    private String tallyName;
    private String nameOnDashboard;
    private String printName;
    private boolean showOnDashboard;
    private String accountGroup;
    private UUID accountGroupId;
    private String groupNature;
    private String accountSubType;

    // Financials
    private BigDecimal openingBalance;
    private String debitCredit;
    private BigDecimal currentBalance;
    private String currency;
    private boolean active;

    // Party data
    private UUID companyId;
    private String companyName; // derived from legal_name for convenience
    private String panNumber;
    private String gstin;
    private String legalName;
    private String ourVendorCode;
    private String tcsApplicable;
    private String paymentTerms;
    private String tallyPaymentTerms;
    private boolean pumpAccount;

    // Address
    private String billingAddress;
    private String city;
    private String state;
    private String stateCode;
    private String country;
    private String pinCode;
    private String phone;
    private String mobile;
    private String email;
    private String contactPerson;
    private String designation;
    private String website;

    // Shipping
    private boolean shippedToSameAsBilling;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingStateCode;
    private String shippingCountry;
    private String shippingPinCode;
    private String shippingPhone;
    private String shippingMobile;
    private String shippingEmail;
    private String shippingContactPerson;
    private String shippingDesignation;

    // Other
    private String cinNumber;
    private BigDecimal lastYearRevenue;
    private BigDecimal distance;
    private String defaultShippedToCode;
}
