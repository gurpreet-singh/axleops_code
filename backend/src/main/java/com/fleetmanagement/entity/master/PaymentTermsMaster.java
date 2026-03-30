package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Payment Terms master — standardised payment terms for client/vendor accounts.
 * Used in invoice due date calculation, aging analysis.
 */
@Entity
@Table(name = "master_payment_terms",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "code"}))
@Getter @Setter
public class PaymentTermsMaster extends MasterEntity {

    /** Number of days from event to due date. COD=0, Net 30=30 */
    @Column(nullable = false)
    private int days = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_event", length = 20, nullable = false)
    private PaymentFromEvent fromEvent;

    /** Term name as Tally expects it */
    @Column(name = "tally_term_name")
    private String tallyTermName;
}
