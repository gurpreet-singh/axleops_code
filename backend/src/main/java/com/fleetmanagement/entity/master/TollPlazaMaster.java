package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Toll Plaza master — records toll booths along routes.
 * Used in toll expense verification and FASTag reconciliation.
 */
@Entity
@Table(name = "master_toll_plazas",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class TollPlazaMaster extends MasterEntity {

    @Column(name = "location_id")
    private UUID locationId;

    private String highway;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @OneToMany(mappedBy = "tollPlaza", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TollPlazaRateMaster> rates = new ArrayList<>();
}
