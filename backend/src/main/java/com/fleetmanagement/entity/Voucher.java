package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
public class Voucher extends BaseEntity {

    @Column(name = "voucher_number", nullable = false, unique = true, length = 100)
    private String voucherNumber;

    @Column(name = "voucher_type", nullable = false, length = 50)
    private String type; // PMT, RCT, SLS, PUR, JRN, CNT, CRN, DRN

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debit_ledger_id", nullable = false)
    private LedgerAccount debitLedger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_ledger_id", nullable = false)
    private LedgerAccount creditLedger;

    @Column(nullable = false)
    private java.math.BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String narration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Contact driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}