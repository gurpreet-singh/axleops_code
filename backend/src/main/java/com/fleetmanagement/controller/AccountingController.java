package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.LedgerResponse;
import com.fleetmanagement.dto.response.VoucherResponse;
import com.fleetmanagement.dto.response.ProfitLossResponse;
import com.fleetmanagement.service.AccountingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.fleetmanagement.dto.request.CreateVoucherRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/accounting")
@RequiredArgsConstructor
public class AccountingController {

    private final AccountingService accountingService;

    @GetMapping("/ledgers")
    public ResponseEntity<List<LedgerResponse>> getAllLedgers() {
        return ResponseEntity.ok(accountingService.getAllLedgers());
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(accountingService.getAllVouchers());
    }

    @PostMapping("/vouchers")
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(accountingService.createVoucher(request));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<ProfitLossResponse> getProfitLoss() {
        return ResponseEntity.ok(accountingService.getProfitLoss());
    }
}