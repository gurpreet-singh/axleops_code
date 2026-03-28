package com.fleetmanagement.service;

import com.fleetmanagement.config.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * The recursive computation engine — this is the "Tally-level power" feature.
 * 
 * Uses PostgreSQL WITH RECURSIVE to walk the LedgerGroup tree and aggregate
 * voucher amounts across all child groups + their ledger accounts.
 * 
 * Key operations:
 *   1. groupRollUp  — total for a group + all descendants (Trip Expenses = Fuel + Toll + Bata + ...)
 *   2. profitAndLoss — Income total - Expense total for a date range
 *   3. balanceSheet  — Assets vs Liabilities snapshot
 *   4. groupBreakdown — detailed per-child-group totals (for drill-down UI)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportingService {

    @PersistenceContext
    private EntityManager em;

    // ═══════════════════════════════════════════════════════════════
    // 1. ROLL-UP: Sum all vouchers under a group and its descendants
    // ═══════════════════════════════════════════════════════════════

    /**
     * Roll up debit-side and credit-side totals for a group + all its children.
     * 
     * @param rootGroupId The group to start the tree walk from
     * @param fromDate    Start of period (inclusive)
     * @param toDate      End of period (inclusive)
     * @return Map with keys: debitTotal, creditTotal, netAmount
     */
    public Map<String, Object> groupRollUp(UUID rootGroupId, LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.get();

        String sql = """
            WITH RECURSIVE group_tree AS (
                SELECT id FROM ledger_groups WHERE id = :rootGroupId AND tenant_id = :tenantId
                UNION ALL
                SELECT ag.id FROM ledger_groups ag
                JOIN group_tree gt ON ag.parent_group_id = gt.id
            )
            SELECT
                COALESCE(SUM(CASE WHEN la.id = v.debit_ledger_id THEN v.amount ELSE 0 END), 0) AS debit_total,
                COALESCE(SUM(CASE WHEN la.id = v.credit_ledger_id THEN v.amount ELSE 0 END), 0) AS credit_total
            FROM vouchers v
            JOIN ledger_accounts la ON la.id = v.debit_ledger_id OR la.id = v.credit_ledger_id
            WHERE la.account_group_id IN (SELECT id FROM group_tree)
              AND v.date BETWEEN :fromDate AND :toDate
              AND v.tenant_id = :tenantId
            """;

        Object[] row = (Object[]) em.createNativeQuery(sql)
                .setParameter("rootGroupId", rootGroupId)
                .setParameter("tenantId", tenantId)
                .setParameter("fromDate", fromDate)
                .setParameter("toDate", toDate)
                .getSingleResult();

        BigDecimal debitTotal = toBigDecimal(row[0]);
        BigDecimal creditTotal = toBigDecimal(row[1]);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("groupId", rootGroupId);
        result.put("fromDate", fromDate.toString());
        result.put("toDate", toDate.toString());
        result.put("debitTotal", debitTotal);
        result.put("creditTotal", creditTotal);
        result.put("netAmount", debitTotal.subtract(creditTotal));
        return result;
    }


    // ═══════════════════════════════════════════════════════════════
    // 2. PROFIT & LOSS — the automatic financial statement
    // ═══════════════════════════════════════════════════════════════

    /**
     * P&L = Income total − Expense total for a date range.
     * Income  = credit-side amounts under INCOME groups
     * Expense = debit-side amounts under EXPENSE groups
     */
    public Map<String, Object> profitAndLoss(LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.get();

        String sql = """
            WITH RECURSIVE 
            income_tree AS (
                SELECT id FROM ledger_groups WHERE nature = 'INCOME' AND parent_group_id IS NULL AND tenant_id = :tenantId
                UNION ALL
                SELECT ag.id FROM ledger_groups ag JOIN income_tree it ON ag.parent_group_id = it.id
            ),
            expense_tree AS (
                SELECT id FROM ledger_groups WHERE nature = 'EXPENSE' AND parent_group_id IS NULL AND tenant_id = :tenantId
                UNION ALL
                SELECT ag.id FROM ledger_groups ag JOIN expense_tree et ON ag.parent_group_id = et.id
            )
            SELECT
                (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v
                 JOIN ledger_accounts la ON la.id = v.credit_ledger_id
                 WHERE la.account_group_id IN (SELECT id FROM income_tree)
                   AND v.date BETWEEN :fromDate AND :toDate
                   AND v.tenant_id = :tenantId) AS income_total,
                   
                (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v
                 JOIN ledger_accounts la ON la.id = v.debit_ledger_id
                 WHERE la.account_group_id IN (SELECT id FROM expense_tree)
                   AND v.date BETWEEN :fromDate AND :toDate
                   AND v.tenant_id = :tenantId) AS expense_total
            """;

        Object[] row = (Object[]) em.createNativeQuery(sql)
                .setParameter("tenantId", tenantId)
                .setParameter("fromDate", fromDate)
                .setParameter("toDate", toDate)
                .getSingleResult();

        BigDecimal incomeTotal  = toBigDecimal(row[0]);
        BigDecimal expenseTotal = toBigDecimal(row[1]);
        BigDecimal netProfit    = incomeTotal.subtract(expenseTotal);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("fromDate", fromDate.toString());
        result.put("toDate", toDate.toString());
        result.put("incomeTotal", incomeTotal);
        result.put("expenseTotal", expenseTotal);
        result.put("netProfit", netProfit);
        result.put("isProfitable", netProfit.signum() >= 0);
        return result;
    }


    // ═══════════════════════════════════════════════════════════════
    // 3. BALANCE SHEET — Assets vs Liabilities snapshot
    // ═══════════════════════════════════════════════════════════════

    /**
     * Balance Sheet as-of a date.
     * Assets  = SUM(opening + debits - credits) for ASSET ledgers
     * Liabilities = SUM(opening + credits - debits) for LIABILITY ledgers
     */
    public Map<String, Object> balanceSheet(LocalDate asOfDate) {
        UUID tenantId = TenantContext.get();

        String sql = """
            WITH RECURSIVE 
            asset_tree AS (
                SELECT id FROM ledger_groups WHERE nature = 'ASSET' AND parent_group_id IS NULL AND tenant_id = :tenantId
                UNION ALL
                SELECT ag.id FROM ledger_groups ag JOIN asset_tree at2 ON ag.parent_group_id = at2.id
            ),
            liability_tree AS (
                SELECT id FROM ledger_groups WHERE nature = 'LIABILITY' AND parent_group_id IS NULL AND tenant_id = :tenantId
                UNION ALL
                SELECT ag.id FROM ledger_groups ag JOIN liability_tree lt ON ag.parent_group_id = lt.id
            )
            SELECT
                -- Asset total = opening balances + net debit movements
                (SELECT COALESCE(SUM(la.opening_balance), 0) +
                    COALESCE((SELECT SUM(v.amount) FROM vouchers v WHERE v.debit_ledger_id = ANY(ARRAY_AGG(la.id)) AND v.date <= :asOfDate AND v.tenant_id = :tenantId), 0) -
                    COALESCE((SELECT SUM(v.amount) FROM vouchers v WHERE v.credit_ledger_id = ANY(ARRAY_AGG(la.id)) AND v.date <= :asOfDate AND v.tenant_id = :tenantId), 0)
                 FROM ledger_accounts la WHERE la.account_group_id IN (SELECT id FROM asset_tree) AND la.tenant_id = :tenantId) AS asset_total,

                -- Liability total = opening balances + net credit movements
                (SELECT COALESCE(SUM(la.opening_balance), 0) +
                    COALESCE((SELECT SUM(v.amount) FROM vouchers v WHERE v.credit_ledger_id = ANY(ARRAY_AGG(la.id)) AND v.date <= :asOfDate AND v.tenant_id = :tenantId), 0) -
                    COALESCE((SELECT SUM(v.amount) FROM vouchers v WHERE v.debit_ledger_id = ANY(ARRAY_AGG(la.id)) AND v.date <= :asOfDate AND v.tenant_id = :tenantId), 0)
                 FROM ledger_accounts la WHERE la.account_group_id IN (SELECT id FROM liability_tree) AND la.tenant_id = :tenantId) AS liability_total
            """;

        Object[] row = (Object[]) em.createNativeQuery(sql)
                .setParameter("tenantId", tenantId)
                .setParameter("asOfDate", asOfDate)
                .getSingleResult();

        BigDecimal assetTotal = toBigDecimal(row[0]);
        BigDecimal liabilityTotal = toBigDecimal(row[1]);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("asOfDate", asOfDate.toString());
        result.put("assetTotal", assetTotal);
        result.put("liabilityTotal", liabilityTotal);
        result.put("equity", assetTotal.subtract(liabilityTotal));
        return result;
    }


    // ═══════════════════════════════════════════════════════════════
    // 4. GROUP BREAKDOWN — drill-down into child groups
    // ═══════════════════════════════════════════════════════════════

    /**
     * For a root group, show the total for EACH of its direct child groups.
     * Used for drill-down: "Trip Expenses" → [Fuel: 45000, Toll: 12000, Bata: 8000, ...]
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> groupBreakdown(UUID rootGroupId, LocalDate fromDate, LocalDate toDate) {
        UUID tenantId = TenantContext.get();

        // First, get the direct children of the root group
        String childrenSql = """
            SELECT id, name, nature FROM ledger_groups 
            WHERE parent_group_id = :rootGroupId AND tenant_id = :tenantId
            ORDER BY name
            """;

        List<Object[]> children = em.createNativeQuery(childrenSql)
                .setParameter("rootGroupId", rootGroupId)
                .setParameter("tenantId", tenantId)
                .getResultList();

        List<Map<String, Object>> breakdown = new ArrayList<>();
        for (Object[] child : children) {
            UUID childId = (UUID) child[0];
            String childName = (String) child[1];
            String childNature = (String) child[2];

            // Recursive roll-up for each child
            Map<String, Object> rollup = groupRollUp(childId, fromDate, toDate);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("groupId", childId);
            item.put("groupName", childName);
            item.put("nature", childNature);
            item.put("debitTotal", rollup.get("debitTotal"));
            item.put("creditTotal", rollup.get("creditTotal"));
            item.put("netAmount", rollup.get("netAmount"));
            breakdown.add(item);
        }

        return breakdown;
    }


    // ═══════════════════════════════════════════════════════════════
    // 5. DIMENSIONAL ROLL-UP — Trip profitability, Vehicle costs
    // ═══════════════════════════════════════════════════════════════

    /**
     * Roll up by dimension — e.g. "all expenses for Trip T-1001"
     * This is your differentiator over Tally: dimensions + hierarchy combined.
     */
    public Map<String, Object> tripProfitability(UUID tripId) {
        UUID tenantId = TenantContext.get();

        String sql = """
            SELECT
                COALESCE(SUM(CASE WHEN la_cr.group_nature = 'INCOME' THEN v.amount ELSE 0 END), 0) AS revenue,
                COALESCE(SUM(CASE WHEN la_dr.group_nature = 'EXPENSE' THEN v.amount ELSE 0 END), 0) AS expenses
            FROM vouchers v
            LEFT JOIN ledger_accounts la_dr ON la_dr.id = v.debit_ledger_id
            LEFT JOIN ledger_accounts la_cr ON la_cr.id = v.credit_ledger_id
            WHERE v.trip_id = :tripId AND v.tenant_id = :tenantId
            """;

        Object[] row = (Object[]) em.createNativeQuery(sql)
                .setParameter("tripId", tripId)
                .setParameter("tenantId", tenantId)
                .getSingleResult();

        BigDecimal revenue  = toBigDecimal(row[0]);
        BigDecimal expenses = toBigDecimal(row[1]);
        BigDecimal margin   = revenue.subtract(expenses);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("tripId", tripId);
        result.put("revenue", revenue);
        result.put("expenses", expenses);
        result.put("margin", margin);
        result.put("marginPercent", revenue.signum() > 0
                ? margin.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        return result;
    }


    // ═══════════════════════════════════════════════════════════════
    // UTILS
    // ═══════════════════════════════════════════════════════════════

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal bd) return bd;
        return new BigDecimal(val.toString());
    }
}
