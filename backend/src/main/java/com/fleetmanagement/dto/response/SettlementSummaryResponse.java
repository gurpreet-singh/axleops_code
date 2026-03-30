package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SettlementSummaryResponse {
    private BigDecimal totalAdvances;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private List<TripExpenseResponse> expenseLines;
    private List<TripAdvanceResponse> advanceLines;
}
