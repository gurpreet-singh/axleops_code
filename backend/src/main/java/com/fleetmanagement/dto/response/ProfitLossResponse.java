package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfitLossResponse {
    private BigDecimal directExpenses;
    private BigDecimal indirectExpenses;
    private BigDecimal directIncome;
    private BigDecimal indirectIncome;
    private BigDecimal netProfit;

    public ProfitLossResponse() {
        this.directExpenses = BigDecimal.ZERO;
        this.indirectExpenses = BigDecimal.ZERO;
        this.directIncome = BigDecimal.ZERO;
        this.indirectIncome = BigDecimal.ZERO;
        this.netProfit = BigDecimal.ZERO;
    }
}