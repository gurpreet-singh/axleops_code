package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Master reference table for ledger groups (~25 rows, max 3 levels deep).
 * Denormalised name/nature are copied onto LedgerAccount for zero-join reads.
 * Supports Tally-style hierarchy for automatic P&L / Balance Sheet roll-up.
 */
@Entity
@Table(name = "ledger_groups")
@Getter
@Setter
public class LedgerGroup extends BaseEntity {

    @Column(nullable = false)
    private String name; // e.g. "SUNDRY DEBTORS"

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private GroupNature nature; // ASSET, LIABILITY, INCOME, EXPENSE (null = Primary root)

    @Column(name = "default_account_type", length = 30)
    @Enumerated(EnumType.STRING)
    private AccountType defaultAccountType; // drives which UI form to show

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private LedgerGroup parentGroup;

    /** Walk the tree downward — children of this group */
    @OneToMany(mappedBy = "parentGroup", fetch = FetchType.LAZY)
    private List<LedgerGroup> children = new ArrayList<>();

    @Column(name = "tally_group_name")
    private String tallyGroupName;

    @Column(name = "is_system_group", nullable = false)
    private boolean systemGroup = false; // protect standard groups from deletion

    public enum GroupNature {
        ASSET, LIABILITY, INCOME, EXPENSE
    }

    public enum AccountType {
        PARTY_GENERAL, BANK, GENERAL
    }
}
