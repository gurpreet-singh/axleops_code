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
 * it only cares about {@link GroupNature} and {@link AccountSubType}.
 */
@Entity
@Table(name = "ledger_groups")
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
     * Default sub type for new accounts created under this group.
     * The account can override this, but 95% of the time the group default is right.
     */
    @Column(name = "default_account_sub_type", length = 30)
    @Enumerated(EnumType.STRING)
    private AccountSubType defaultAccountSubType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_group_id")
    private LedgerGroup parentGroup;

    @OneToMany(mappedBy = "parentGroup", fetch = FetchType.LAZY)
    private List<LedgerGroup> children = new ArrayList<>();

    /** Optional — for Tally sync mapping */
    @Column(name = "tally_group_name")
    private String tallyGroupName;

    // ═══════════════════════════════════════════════════════════════
    // ENUMS — the only two things the code cares about
    // ═══════════════════════════════════════════════════════════════

    /** Accounting law — determines BS vs P&L and debit/credit default */
    public enum GroupNature {
        ASSET, LIABILITY, INCOME, EXPENSE
    }

    /**
     * Drives which UI form sections appear and what business logic applies.
     * <ul>
     *   <li>PARTY — PAN, GSTIN, addresses, payment terms, TCS</li>
     *   <li>BANK — bank name, account no, IFSC, branch</li>
     *   <li>CASH — minimal, cash-in-hand / petty cash / driver advances</li>
     *   <li>DUTIES_TAXES — GST input/output, TDS, TCS statutory accounts</li>
     *   <li>GENERAL — no extra fields, just identity + balance</li>
     * </ul>
     */
    public enum AccountSubType {
        PARTY, BANK, CASH, DUTIES_TAXES, GENERAL
    }
}
