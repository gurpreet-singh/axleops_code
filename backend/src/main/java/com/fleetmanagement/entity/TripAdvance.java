package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "trip_advances")
@Getter
@Setter
public class TripAdvance extends BaseEntity {

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "driver_id", nullable = false)
    private UUID driverId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 20, nullable = false)
    private PaymentMode paymentMode;

    @Column(name = "source_account_id")
    private UUID sourceAccountId;

    @Column(name = "given_date", nullable = false)
    private LocalDate givenDate;

    @Column(name = "given_by", nullable = false)
    private UUID givenBy;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
