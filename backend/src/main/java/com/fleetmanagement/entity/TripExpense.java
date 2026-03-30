package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "trip_expenses")
@Getter
@Setter
public class TripExpense extends BaseEntity {

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "expense_category_id")
    private UUID expenseCategoryId;

    @Column(name = "expense_category_name")
    private String expenseCategoryName;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 20)
    private PaymentMode paymentMode;

    @Column(name = "receipt_url")
    private String receiptUrl;

    // ─── Fuel-Specific Fields ───────────────────────────────────
    @Column(name = "fuel_pump_account_id")
    private UUID fuelPumpAccountId;

    @Column(name = "fuel_litres")
    private BigDecimal fuelLitres;

    @Column(name = "fuel_rate_per_litre")
    private BigDecimal fuelRatePerLitre;

    @Column(name = "odometer_reading")
    private BigDecimal odometerReading;

    // ─── Accounting ─────────────────────────────────────────────
    @Column(name = "ledger_account_id")
    private UUID ledgerAccountId;

    @Column(name = "logged_by")
    private UUID loggedBy;
}
