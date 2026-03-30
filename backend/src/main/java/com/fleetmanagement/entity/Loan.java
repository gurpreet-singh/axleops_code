package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Vehicle loan / financing details.
 */
@Entity
@Table(name = "vehicle_loans",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "loan_account_no"}))
@Getter
@Setter
public class Loan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String lender;

    @Column(name = "loan_account_no")
    private String loanAccountNo;

    @Column(name = "loan_amount")
    private BigDecimal loanAmount;

    @Column(name = "interest_rate")
    private BigDecimal interestRate;

    @Column(name = "loan_term_months")
    private Integer loanTermMonths;

    @Column(name = "monthly_emi")
    private BigDecimal monthlyEmi;

    @Column(name = "outstanding_balance")
    private BigDecimal outstandingBalance;

    @Column(name = "disbursement_date")
    private LocalDate disbursementDate;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, CLOSED, DEFAULTED, PREPAID

    @Column(name = "emi_start_date")
    private LocalDate emiStartDate;

    @Column(name = "collateral_value")
    private BigDecimal collateralValue;
}
