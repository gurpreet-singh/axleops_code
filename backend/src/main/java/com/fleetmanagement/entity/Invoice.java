package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
@Setter
public class Invoice extends BaseEntity {

    @Column(name = "invoice_number", nullable = false, unique = true, length = 100)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private java.math.BigDecimal amount;

    @Column(name = "gst_amount")
    private java.math.BigDecimal gstAmount;

    @Column(name = "total_amount")
    private java.math.BigDecimal totalAmount;

    @Column(name = "status", length = 50)
    private String status = "DRAFT"; // DRAFT, SENT, PARTIAL, PAID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}