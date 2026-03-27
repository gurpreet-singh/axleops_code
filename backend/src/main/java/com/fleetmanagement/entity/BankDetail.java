package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Bank details for BANK-type ledger accounts (~5 rows).
 * Separate table because it's rarely queried and only used for bank reconciliation.
 * Joined only during the niche bank reconciliation operation.
 */
@Entity
@Table(name = "bank_details")
@Getter
@Setter
public class BankDetail extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ledger_account_id", nullable = false, unique = true)
    private LedgerAccount ledgerAccount;

    @Column(name = "bank_name")
    private String bankName;

    private String branch;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc_code", length = 11)
    private String ifscCode;
}
