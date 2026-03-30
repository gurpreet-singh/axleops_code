package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contacts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "phone"}))
@Getter
@Setter
public class Contact extends BaseEntity {

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String phone;
    private String email;
    private String type = "DRIVER";

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "license_expiry")
    private java.time.LocalDate licenseExpiry;

    private String address;
    private String city;
    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
