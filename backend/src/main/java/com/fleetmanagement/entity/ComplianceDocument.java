package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Unified compliance document supertype.
 * Every specific document type (RC, Permit, PUC, Insurance, etc.)
 * has a corresponding row here that drives the compliance engine.
 *
 * Key invariant: For each (vehicle_id, document_type) combination,
 * exactly one record has is_current = true.
 */
@Entity
@Table(name = "compliance_documents")
@Getter
@Setter
public class ComplianceDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "document_type", nullable = false)
    private String documentType; // RC, PERMIT, PUC, PASSING, INSURANCE, ROAD_TAX, GREEN_TAX, AUTHORITY, CFRA, PTI, FASTAG, PROFESSION_TAX

    @Column(name = "document_ref_id")
    private UUID documentRefId; // FK to the specific document type table

    @Column(name = "document_number")
    private String documentNumber;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, EXPIRING_SOON, PENDING_RENEWAL, CANCELLED, SUPERSEDED

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    private BigDecimal amount;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = true;

    @Column(name = "previous_version_id")
    private UUID previousVersionId;

    @Column(name = "renewal_source")
    private String renewalSource; // MANUAL, AUTO_RENEWAL, API_SYNC

    @Column(columnDefinition = "TEXT")
    private String notes;
}
