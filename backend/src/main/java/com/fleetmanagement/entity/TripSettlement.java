package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trip_settlements")
@Getter
@Setter
public class TripSettlement extends BaseEntity {

    @Column(name = "trip_id", nullable = false, unique = true)
    private UUID tripId;

    @Column(name = "total_advances")
    private BigDecimal totalAdvances;

    @Column(name = "total_expenses")
    private BigDecimal totalExpenses;

    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_action", length = 20, nullable = false)
    private SettlementAction settlementAction;

    @Column(name = "settlement_note", columnDefinition = "TEXT")
    private String settlementNote;

    @Column(name = "settled_by", nullable = false)
    private UUID settledBy;

    @Column(name = "settled_at", nullable = false)
    private LocalDateTime settledAt;

    @Column(name = "voucher_id")
    private UUID voucherId;
}
