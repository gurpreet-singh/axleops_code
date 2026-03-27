package com.fleetmanagement.controller;

import com.fleetmanagement.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Financial Reporting API — powered by the recursive CTE engine.
 * 
 * Endpoints:
 *   GET /reporting/roll-up?groupId=...&from=...&to=...
 *   GET /reporting/profit-loss?from=...&to=...
 *   GET /reporting/balance-sheet?asOf=...
 *   GET /reporting/group-breakdown?groupId=...&from=...&to=...
 *   GET /reporting/trip-profitability/{tripId}
 */
@RestController
@RequestMapping("/reporting")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    /**
     * Roll-up total for a group + all its descendants.
     * Example: /reporting/roll-up?groupId=aa000000-...&from=2026-04-01&to=2026-03-31
     */
    @GetMapping("/roll-up")
    public ResponseEntity<Map<String, Object>> rollUp(
            @RequestParam UUID groupId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.groupRollUp(groupId, from, to));
    }

    /**
     * Auto-generated P&L statement for a date range.
     * Example: /reporting/profit-loss?from=2026-04-01&to=2027-03-31
     */
    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, Object>> profitAndLoss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.profitAndLoss(from, to));
    }

    /**
     * Balance Sheet as-of a date.
     * Example: /reporting/balance-sheet?asOf=2026-03-31
     */
    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> balanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf) {
        return ResponseEntity.ok(reportingService.balanceSheet(asOf));
    }

    /**
     * Drill-down: breakdown of each direct child under a group.
     * Example: /reporting/group-breakdown?groupId=aa000000-...&from=2026-04-01&to=2027-03-31
     * Returns: [{ groupName: "Fuel", netAmount: 45000 }, { groupName: "Toll", netAmount: 12000 }, ...]
     */
    @GetMapping("/group-breakdown")
    public ResponseEntity<List<Map<String, Object>>> groupBreakdown(
            @RequestParam UUID groupId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.groupBreakdown(groupId, from, to));
    }

    /**
     * Trip profitability — revenue vs expenses for a specific trip.
     * Uses dimensional slicing (trip_id on voucher) + group nature classification.
     * Example: /reporting/trip-profitability/10000000-0000-...
     */
    @GetMapping("/trip-profitability/{tripId}")
    public ResponseEntity<Map<String, Object>> tripProfitability(@PathVariable UUID tripId) {
        return ResponseEntity.ok(reportingService.tripProfitability(tripId));
    }
}
