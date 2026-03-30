package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Expense Category master — categorises trip and operational expenses.
 * Used in trip expense entry, analysis reports, budget tracking.
 */
@Entity
@Table(name = "master_expense_categories",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class ExpenseCategoryMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_context", length = 15, nullable = false)
    private ExpenseContext expenseContext;

    /** FK to LedgerAccount — auto-suggest ledger for voucher posting */
    @Column(name = "default_ledger_account_id")
    private UUID defaultLedgerAccountId;

    @Column(name = "is_receipt_mandatory")
    private boolean receiptMandatory = false;

    @Column(name = "max_amount_without_approval", precision = 12, scale = 2)
    private BigDecimal maxAmountWithoutApproval;

    /** Icon identifier for mobile app */
    private String icon;
}
