package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
public class PurchaseOrder extends BaseEntity {

    @Column(name = "po_number", nullable = false, unique = true, length = 100)
    private String poNumber;

    @Column(name = "vendor_name", nullable = false)
    private String vendorName;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "item_count")
    private Integer itemCount;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "status", length = 50)
    private String status = "DRAFT";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
