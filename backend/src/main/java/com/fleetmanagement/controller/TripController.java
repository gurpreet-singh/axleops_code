package com.fleetmanagement.controller;

import com.fleetmanagement.dto.request.*;
import com.fleetmanagement.dto.response.*;
import com.fleetmanagement.entity.TripStatus;
import com.fleetmanagement.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    // ═══════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════

    @GetMapping
    public List<TripResponse> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return tripService.getByStatus(TripStatus.valueOf(status.toUpperCase()));
        }
        return tripService.getAll();
    }

    @GetMapping("/active")
    public List<TripResponse> getActive() {
        return tripService.getByStatuses(
            List.of(TripStatus.CREATED, TripStatus.IN_TRANSIT, TripStatus.DELIVERED)
        );
    }

    @GetMapping("/counts")
    public Map<String, Long> getCounts() {
        return tripService.getStatusCounts();
    }

    @GetMapping("/{id}")
    public TripResponse getById(@PathVariable UUID id) {
        return tripService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TripResponse> create(@RequestBody CreateTripRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.create(request));
    }

    @PutMapping("/{id}")
    public TripResponse update(@PathVariable UUID id, @RequestBody CreateTripRequest request) {
        return tripService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════
    // STATE MACHINE TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/{id}/start")
    public TripResponse start(@PathVariable UUID id, @RequestBody(required = false) StartTripRequest request) {
        return tripService.start(id, request);
    }

    @PostMapping("/{id}/deliver")
    public TripResponse deliver(@PathVariable UUID id, @RequestBody(required = false) DeliverTripRequest request) {
        return tripService.deliver(id, request);
    }

    @PostMapping("/{id}/mark-reached")
    public TripResponse markReached(@PathVariable UUID id) {
        return tripService.markReached(id);
    }

    @PostMapping("/{id}/settle")
    public TripResponse settle(@PathVariable UUID id, @RequestBody(required = false) SettlementRequest request) {
        return tripService.settle(id, request);
    }

    @PostMapping("/{id}/cancel")
    public TripResponse cancel(@PathVariable UUID id, @RequestBody CancelTripRequest request) {
        return tripService.cancel(id, request);
    }

    // ═══════════════════════════════════════════════════════════
    // EXPENSES
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/{id}/expenses")
    public List<TripExpenseResponse> getExpenses(@PathVariable UUID id) {
        return tripService.getExpenses(id);
    }

    @PostMapping("/{id}/expenses")
    public ResponseEntity<TripExpenseResponse> addExpense(@PathVariable UUID id, @RequestBody TripExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.addExpense(id, request));
    }

    @PutMapping("/{id}/expenses/{expenseId}")
    public TripExpenseResponse updateExpense(@PathVariable UUID id, @PathVariable UUID expenseId, @RequestBody TripExpenseRequest request) {
        return tripService.updateExpense(id, expenseId, request);
    }

    @DeleteMapping("/{id}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id, @PathVariable UUID expenseId) {
        tripService.deleteExpense(id, expenseId);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════
    // ADVANCES
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/{id}/advances")
    public List<TripAdvanceResponse> getAdvances(@PathVariable UUID id) {
        return tripService.getAdvances(id);
    }

    @PostMapping("/{id}/advances")
    public ResponseEntity<TripAdvanceResponse> addAdvance(@PathVariable UUID id, @RequestBody TripAdvanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.addAdvance(id, request));
    }

    // ═══════════════════════════════════════════════════════════
    // SETTLEMENT
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/{id}/settlement-summary")
    public SettlementSummaryResponse getSettlementSummary(@PathVariable UUID id) {
        return tripService.getSettlementSummary(id);
    }

    // ═══════════════════════════════════════════════════════════
    // DOCUMENTS
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/{id}/documents")
    public List<TripDocumentResponse> getDocuments(@PathVariable UUID id) {
        return tripService.getDocuments(id);
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TripDocumentResponse> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "LR") String documentType,
            @RequestParam(value = "notes", required = false) String notes
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tripService.uploadDocument(id, file, documentType, notes));
    }

    @DeleteMapping("/{id}/documents/{docId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID id, @PathVariable UUID docId) {
        tripService.deleteDocument(id, docId);
        return ResponseEntity.noContent().build();
    }
}
