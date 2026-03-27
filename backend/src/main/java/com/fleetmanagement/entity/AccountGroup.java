package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Master reference table for account groups (~20 rows).
 * Denormalised name/nature are copied onto LedgerAccount for zero-join reads.
 * Rarely changes — only joined during master data edits.
 */
@Entity
@Table(name = "account_groups")
@Getter
@Setter
public class AccountGroup extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g. "SUNDRY DEBTORS"

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GroupNature nature; // ASSET, LIABILITY, INCOME, EXPENSE

    @Column(name = "default_account_type", length = 30)
    @Enumerated(EnumType.STRING)
    private AccountType defaultAccountType; // drives which UI form to show

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private AccountGroup parentGroup;

    @Column(name = "tally_group_name")
    private String tallyGroupName;

    @Column(name = "is_system_group", nullable = false)
    private boolean systemGroup = false; // protect standard groups from deletion

    public enum GroupNature {
        ASSET, LIABILITY, INCOME, EXPENSE
    }

    public enum AccountType {
        PARTY_ROUTE, PARTY_GENERAL, BANK, DRIVER_CASH, GENERAL
    }
}
