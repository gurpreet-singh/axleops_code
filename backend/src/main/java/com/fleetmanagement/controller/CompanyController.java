package com.fleetmanagement.controller;

import com.fleetmanagement.dto.request.CreateCompanyRequest;
import com.fleetmanagement.dto.response.CompanyResponse;
import com.fleetmanagement.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAll() {
        return ResponseEntity.ok(companyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.ok(companyService.create(request));
    }

    /**
     * Update company master data — triggers cascade to denormalised LedgerAccount fields.
     * This is rare (1-2 times/year) but eliminates read-time joins for every transaction.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(@PathVariable UUID id, @Valid @RequestBody CreateCompanyRequest request) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
