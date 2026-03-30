package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;

/**
 * Company master — the normalised source of truth (joined rarely).
 * 
 * Only touched during:
 *   (a) creating a new party account
 *   (b) editing company master data
 *   (c) cascading updates to denormalised LedgerAccount fields
 * 
 * Never joined during transactional reads.
 * 67+ rows. Master data — 1-2 edits per year per company.
 */
@Entity
@Table(name = "companies",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "legal_name"}),
           @UniqueConstraint(columnNames = {"tenant_id", "pan_number"})
       })
@Getter
@Setter
public class Company extends BaseEntity {

    @Column(name = "pan_number", length = 10)
    private String panNumber; // unique nullable — some vendors have no PAN

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "trade_name")
    private String tradeName;

    @Column(name = "cin_number")
    private String cinNumber;

    @Column(name = "company_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private CompanyType companyType; // CLIENT, VENDOR, BOTH, INTERNAL

    @Column(name = "default_payment_terms")
    private String defaultPaymentTerms;

    @Column(name = "our_vendor_code")
    private String ourVendorCode;

    @Column(name = "last_year_revenue")
    private BigDecimal lastYearRevenue;

    private String website;

    @Column(name = "is_gst_registered", nullable = false)
    private boolean gstRegistered = false;

    @Column(name = "is_fuel_vendor", nullable = false)
    private boolean fuelVendor = false; // replaces FUEL PUMPS group hack

    /**
     * Denormalised JSONB list of all GSTINs for this company.
     * Quick "show me all GSTINs for company X" without a separate table.
     * e.g. ["27AAFCM2530H1ZO", "08AAFCM2530H1ZO"]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> gstins;

    public enum CompanyType {
        CLIENT, VENDOR, BOTH, INTERNAL
    }
}
