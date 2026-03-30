package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Freight Charge Type master — line items on freight invoices.
 * Base freight, detention, loading/unloading, surcharges, etc.
 */
@Entity
@Table(name = "master_freight_charge_types",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class FreightChargeTypeMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_basis", length = 15, nullable = false)
    private ChargeBasis chargeBasis;

    @Column(name = "default_rate", precision = 12, scale = 2)
    private BigDecimal defaultRate;

    @Column(name = "is_taxable", nullable = false)
    private boolean taxable = true;

    @Column(name = "is_default_on_invoice")
    private boolean defaultOnInvoice = false;

    /** FK to LedgerAccount — income account this charge credits */
    @Column(name = "ledger_account_id")
    private UUID ledgerAccountId;
}
