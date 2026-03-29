package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "annexure_types")
@Getter
@Setter
public class AnnexureType extends BaseEntity {

    @Column(nullable = false)
    private String name;
}
