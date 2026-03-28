package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.request.CreateLedgerAccountRequest;
import com.fleetmanagement.dto.response.LedgerAccountResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.LedgerAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ledger-accounts")
@RequiredArgsConstructor
public class LedgerAccountController {

    private final LedgerAccountService ledgerAccountService;

    @GetMapping
    @RequiresAuthority(Authority.LEDGER_READ)
    public ResponseEntity<List<LedgerAccountResponse>> getAll() {
        return ResponseEntity.ok(ledgerAccountService.getAll());
    }

    @GetMapping("/active")
    @RequiresAuthority(Authority.LEDGER_READ)
    public ResponseEntity<List<LedgerAccountResponse>> getActive() {
        return ResponseEntity.ok(ledgerAccountService.getActive());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.LEDGER_READ)
    public ResponseEntity<LedgerAccountResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ledgerAccountService.getById(id));
    }

    @GetMapping("/by-company/{companyId}")
    @RequiresAuthority(Authority.LEDGER_READ)
    public ResponseEntity<List<LedgerAccountResponse>> getByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ledgerAccountService.getByCompany(companyId));
    }

    @PostMapping
    @RequiresAuthority(Authority.LEDGER_CREATE)
    public ResponseEntity<LedgerAccountResponse> create(@Valid @RequestBody CreateLedgerAccountRequest request) {
        return ResponseEntity.ok(ledgerAccountService.create(request));
    }

    @PutMapping("/{id}")
    @RequiresAuthority(Authority.LEDGER_UPDATE)
    public ResponseEntity<LedgerAccountResponse> update(@PathVariable UUID id, @Valid @RequestBody CreateLedgerAccountRequest request) {
        return ResponseEntity.ok(ledgerAccountService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresAuthority(Authority.LEDGER_DELETE)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ledgerAccountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
