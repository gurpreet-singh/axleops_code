package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Tax Configuration master — GST rates, HSN/SAC codes, TDS/TCS rates.
 * Used in invoice tax calculation, e-invoice, GST return data.
 */
@Entity
@Table(name = "master_tax_config",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class TaxConfigMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_type", length = 10, nullable = false)
    private TaxType taxType;

    @Column(name = "rate_percentage", precision = 6, scale = 3, nullable = false)
    private BigDecimal ratePercentage;

    @Column(name = "hsn_sac_code", length = 10)
    private String hsnSacCode;

    @Column(name = "is_igst_applicable")
    private Boolean igstApplicable;

    @Column(name = "cgst_rate", precision = 6, scale = 3)
    private BigDecimal cgstRate;

    @Column(name = "sgst_rate", precision = 6, scale = 3)
    private BigDecimal sgstRate;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "is_default")
    private boolean defaultConfig = false;
}
