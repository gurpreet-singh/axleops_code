package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parts")
@Getter
@Setter
public class Part extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "part_number", nullable = false, unique = true, length = 100)
    private String partNumber;

    @Column(length = 100)
    private String category;

    @Column(length = 255)
    private String location;

    @Column(name = "in_stock")
    private Integer inStock;

    @Column(name = "min_qty")
    private Integer minQty;

    @Column(name = "unit_cost")
    private java.math.BigDecimal unitCost;
}