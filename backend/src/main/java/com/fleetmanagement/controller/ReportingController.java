package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.entity.Authority;
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

    @GetMapping("/roll-up")
    @RequiresAuthority(Authority.FINANCIAL_REPORT_READ)
    public ResponseEntity<Map<String, Object>> rollUp(
            @RequestParam UUID groupId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.groupRollUp(groupId, from, to));
    }

    @GetMapping("/profit-loss")
    @RequiresAuthority(Authority.FINANCIAL_REPORT_READ)
    public ResponseEntity<Map<String, Object>> profitAndLoss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.profitAndLoss(from, to));
    }

    @GetMapping("/balance-sheet")
    @RequiresAuthority(Authority.FINANCIAL_REPORT_READ)
    public ResponseEntity<Map<String, Object>> balanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf) {
        return ResponseEntity.ok(reportingService.balanceSheet(asOf));
    }

    @GetMapping("/group-breakdown")
    @RequiresAuthority(Authority.FINANCIAL_REPORT_READ)
    public ResponseEntity<List<Map<String, Object>>> groupBreakdown(
            @RequestParam UUID groupId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportingService.groupBreakdown(groupId, from, to));
    }

    @GetMapping("/trip-profitability/{tripId}")
    @RequiresAuthority(Authority.FINANCIAL_REPORT_READ)
    public ResponseEntity<Map<String, Object>> tripProfitability(@PathVariable UUID tripId) {
        return ResponseEntity.ok(reportingService.tripProfitability(tripId));
    }
}
