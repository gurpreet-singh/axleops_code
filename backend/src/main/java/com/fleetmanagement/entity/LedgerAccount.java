package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * The fat LedgerAccount — zero joins for 95% of operations.
 * 
 * Every downstream system (vouchers, expenses, trips, invoices, TDS/TCS,
 * Tally sync, reports) reads from this single table.
 * 
 * Party/GST/address data is embedded, not joined. Only the Company master
 * holds the normalised truth — edits propagate down via an update cascade.
 * 
 * Primary entity — 633 rows.
 */
@Entity
@Table(name = "ledger_accounts", indexes = {
    @Index(name = "idx_la_company_id", columnList = "company_id"),
    @Index(name = "idx_la_account_type", columnList = "account_type"),
    @Index(name = "idx_la_account_group_id", columnList = "account_group_id"),
    @Index(name = "idx_la_is_active", columnList = "is_active"),
    @Index(name = "idx_la_origin_dest", columnList = "origin_city, destination_city"),
    @Index(name = "idx_la_gstin", columnList = "gstin"),
    @Index(name = "idx_la_tenant_active", columnList = "tenant_id, is_active")
})
@Getter
@Setter
public class LedgerAccount extends BaseEntity {

    // ═══════════════════════════════════════════════════════════════
    // IDENTITY (EVERY ACCOUNT)
    // ═══════════════════════════════════════════════════════════════

    /** Primary display name — e.g. "Nashik To Chakan" */
    @Column(name = "account_head", nullable = false)
    private String accountHead;

    /** Override name for Tally sync, null = use account_head */
    @Column(name = "tally_name")
    private String tallyName;

    /** Display override for dashboard widgets */
    @Column(name = "name_on_dashboard")
    private String nameOnDashboard;

    /** Denormalised from AccountGroup — e.g. "SUNDRY DEBTORS" */
    @Column(name = "account_group")
    private String accountGroup;

    /** FK to AccountGroup — only for group master edits */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_group_id")
    private AccountGroup accountGroupRef;

    /** Denormalised from AccountGroup — "ASSET" / "LIABILITY" / "INCOME" / "EXPENSE" */
    @Column(name = "group_nature", length = 20)
    private String groupNature;

    /** Account type classification */
    @Column(name = "account_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    // ═══════════════════════════════════════════════════════════════
    // FINANCIALS (EVERY ACCOUNT)
    // ═══════════════════════════════════════════════════════════════

    @Column(name = "opening_balance", precision = 15, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    /** Running balance — updated on every voucher post */
    @Column(name = "current_balance", precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(length = 5)
    private String currency = "INR";

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // ═══════════════════════════════════════════════════════════════
    // PARTY DATA (ONLY WHEN account_type = PARTY_*)
    // Embedded, not joined. Company master is the source of truth.
    // ═══════════════════════════════════════════════════════════════

    /** FK to Company — nullable, for master data cascade */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    /** Denorm from Company — e.g. "AAFCM2530H" */
    @Column(name = "pan_number", length = 10)
    private String panNumber;

    /** Flat GSTIN string — e.g. "27AAFCM2530H1ZO". No join needed. */
    @Column(length = 15)
    private String gstin;

    /** Denorm from Company — e.g. "Mahindra & Mahindra Ltd." */
    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "our_vendor_code")
    private String ourVendorCode;

    @Column(name = "tcs_applicable", length = 20)
    @Enumerated(EnumType.STRING)
    private TcsApplicability tcsApplicable;

    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "tally_payment_terms")
    private String tallyPaymentTerms;

    /** Fuel vendor flag — replaces the old FUEL PUMPS group hack */
    @Column(name = "is_pump_account", nullable = false)
    private boolean pumpAccount = false;

    // ═══════════════════════════════════════════════════════════════
    // ADDRESS (EMBEDDED — used by invoices, e-way bills, e-invoices)
    // ═══════════════════════════════════════════════════════════════

    /** Full billing address for this account */
    @Column(name = "billing_address", columnDefinition = "TEXT")
    private String billingAddress;

    private String city;

    private String state; // e.g. "Maharashtra"

    @Column(name = "state_code", length = 5)
    private String stateCode; // e.g. "27"

    private String country; // e.g. "India"

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    private String phone;

    private String mobile;

    private String email;

    @Column(name = "contact_person")
    private String contactPerson;

    private String designation;

    // ═══════════════════════════════════════════════════════════════
    // SHIPPING (EMBEDDED — for accounts with different ship-to)
    // ═══════════════════════════════════════════════════════════════

    /** true = skip shipping fields, use billing address */
    @Column(name = "shipped_to_same_as_billing", nullable = false)
    private boolean shippedToSameAsBilling = true;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "shipping_city")
    private String shippingCity;

    @Column(name = "shipping_state")
    private String shippingState;

    @Column(name = "shipping_state_code", length = 5)
    private String shippingStateCode;

    @Column(name = "shipping_country")
    private String shippingCountry;

    @Column(name = "shipping_pin_code", length = 10)
    private String shippingPinCode;

    @Column(name = "shipping_phone")
    private String shippingPhone;

    @Column(name = "shipping_contact_person")
    private String shippingContactPerson;

    @Column(name = "shipping_designation")
    private String shippingDesignation;

    // ═══════════════════════════════════════════════════════════════
    // ROUTE DATA (ONLY WHEN account_type = PARTY_ROUTE)
    // ═══════════════════════════════════════════════════════════════

    /** e.g. "Nashik" — extracted, searchable */
    @Column(name = "origin_city")
    private String originCity;

    /** e.g. "Chakan" */
    @Column(name = "destination_city")
    private String destinationCity;

    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;

    // ═══════════════════════════════════════════════════════════════
    // OTHER (SPECIAL ACCOUNT TYPES)
    // ═══════════════════════════════════════════════════════════════

    /** CIN number — e.g. "L63000MH2007PLC173466" */
    @Column(name = "cin_number")
    private String cinNumber;

    @Column(name = "last_year_revenue", precision = 15, scale = 2)
    private BigDecimal lastYearRevenue;

    @Column(name = "default_shipped_to_code")
    private String defaultShippedToCode;

    // ═══════════════════════════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════════════════════════

    public enum AccountType {
        PARTY_ROUTE, PARTY_GENERAL, BANK, DRIVER_CASH, GENERAL
    }

    public enum TcsApplicability {
        NOT_APPLICABLE, TCS_ON_SALE, TCS_ON_PURCHASE
    }
}
