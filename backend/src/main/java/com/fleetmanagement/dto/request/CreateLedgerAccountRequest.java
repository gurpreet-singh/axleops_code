package com.fleetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateLedgerAccountRequest {

    // Identity
    @NotBlank
    private String accountHead;
    private String tallyName;
    private String nameOnDashboard;
    private String printName;
    @NotNull
    private UUID accountGroupId;
    private String accountType; // LedgerAccountType enum value — selected by the user

    // Financials
    private BigDecimal openingBalance;
    private String debitCredit;  // DEBIT or CREDIT
    private String currency;

    // Party data
    private UUID companyId;
    private String panNumber;
    private String gstin;
    private String legalName;
    private String ourVendorCode;
    private String tcsApplicable;
    private String paymentTerms;
    private String tallyPaymentTerms;

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
    private boolean shippedToSameAsBilling = true;
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
