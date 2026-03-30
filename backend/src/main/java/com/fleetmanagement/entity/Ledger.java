package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ledgers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "code"}))
@Getter
@Setter
public class Ledger extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "tally_group", nullable = false, length = 100)
    private String tallyGroup;

    @Column(name = "normal_balance", nullable = false, length = 10)
    private String normalBalance; // Dr or Cr
}