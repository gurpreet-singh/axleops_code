package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Location master — cities, loading points, plants, warehouses.
 * Used in route definition, trip creation, e-way bill addresses.
 */
@Entity
@Table(name = "master_locations",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class LocationMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", length = 20, nullable = false)
    private LocationType locationType;

    /** Self-referencing for hierarchy: 'Chakan MIDC' under 'Pune' */
    @Column(name = "parent_id")
    private UUID parentId;

    /** State name: 'Maharashtra' */
    private String state;

    /** GST state code: '27' */
    @Column(name = "state_code", length = 5)
    private String stateCode;

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;
}
