package com.fleetmanagement.entity.master;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Toll Plaza Rate — rate per vehicle type for a toll plaza.
 * Child entity, not a MasterEntity itself.
 */
@Entity
@Table(name = "master_toll_plaza_rates")
@Getter @Setter
public class TollPlazaRateMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toll_plaza_id", nullable = false)
    private TollPlazaMaster tollPlaza;

    @Column(name = "vehicle_type_id", nullable = false)
    private UUID vehicleTypeId;

    @Column(name = "single_trip_rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal singleTripRate;

    @Column(name = "return_trip_rate", precision = 10, scale = 2)
    private BigDecimal returnTripRate;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}
