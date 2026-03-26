package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clients")
@Getter
@Setter
public class Client extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "trade_name")
    private String tradeName;

    private String gstin;
    private String pan;
    private String address;
    private String city;
    private String state;
    private String phone;
    private String email;

    @Column(name = "billing_type")
    private String billingType = "PER_TRIP";

    private String industry;

    @Column(name = "contract_type")
    private String contractType;

    private String rate;

    @Column(name = "credit_limit")
    private java.math.BigDecimal creditLimit;

    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
