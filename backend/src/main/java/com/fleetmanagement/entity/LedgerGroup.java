package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * User-defined ledger group — purely organisational.
 * <p>
 * Tenants build their own chart of accounts hierarchy (any depth).
 * The code never makes decisions based on group name or structure;
 * it only cares about {@link GroupNature} and {@link LedgerGroupType}.
 */
@Entity
@Table(name = "ledger_groups",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "name"}))
@Getter
@Setter
public class LedgerGroup extends BaseEntity {

    /** e.g. "Sundry Debtors", "Bank Accounts", "Indirect Expenses" */
    @Column(nullable = false)
    private String name;

    /**
     * Determines Balance Sheet vs P&L placement and debit/credit behaviour.
     * Required for top-level groups, inherited from parent for sub-groups.
     */
    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private GroupNature nature;

    /**
     * Determines which UI form sections appear and what business logic applies
     * to accounts created under this group. Required for every group.
     */
    @Column(name = "group_type", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private LedgerGroupType groupType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private LedgerGroup parentGroup;

    @OneToMany(mappedBy = "parentGroup", fetch = FetchType.LAZY)
    private List<LedgerGroup> children = new ArrayList<>();

    /** Optional — for Tally sync mapping */
    @Column(name = "tally_group_name")
    private String tallyGroupName;

    // ═══════════════════════════════════════════════════════════════
    // ENUMS — GroupNature stays here; LedgerGroupType and LedgerAccountType are top-level
    // ═══════════════════════════════════════════════════════════════

    /** Accounting law — determines BS vs P&L and debit/credit default */
    public enum GroupNature {
        ASSET, LIABILITY, INCOME, EXPENSE
    }
}
