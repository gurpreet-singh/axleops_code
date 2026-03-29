package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "invoice_types")
@Getter
@Setter
public class InvoiceType extends BaseEntity {

    @Column(nullable = false)
    private String name;
}
