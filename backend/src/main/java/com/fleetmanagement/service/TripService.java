package com.fleetmanagement.service;

import com.fleetmanagement.config.InvalidStatusTransitionException;
import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.dto.request.*;
import com.fleetmanagement.dto.response.*;
import com.fleetmanagement.entity.*;
import com.fleetmanagement.entity.master.NumberSeriesEntityType;
import com.fleetmanagement.entity.master.NumberSeriesMaster;
import com.fleetmanagement.mapper.TripMapper;
import com.fleetmanagement.repository.*;
import com.fleetmanagement.repository.master.NumberSeriesMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepo;
    private final TripExpenseRepository expenseRepo;
    private final TripAdvanceRepository advanceRepo;
    private final TripSettlementRepository settlementRepo;
    private final TripDocumentRepository documentRepo;
    private final TripMapper tripMapper;
    private final RouteRepository routeRepo;
    private final LedgerAccountRepository ledgerRepo;
    private final VehicleRepository vehicleRepo;
    private final ContactRepository contactRepo;
    private final BranchRepository branchRepo;
    private final NumberSeriesMasterRepository numberSeriesRepo;
    private final BranchValidator branchValidator;

    // ═══════════════════════════════════════════════════════════
    // CRUD
    // ═══════════════════════════════════════════════════════════

    public List<TripResponse> getAll() {
        UUID tenantId = TenantContext.get();
        return tripRepo.findByTenantId(tenantId).stream()
                .map(this::enrichAndMap)
                .toList();
    }

    public List<TripResponse> getByStatus(TripStatus status) {
        UUID tenantId = TenantContext.get();
        return tripRepo.findByTenantIdAndStatus(tenantId, status).stream()
                .map(this::enrichAndMap)
                .toList();
    }

    public List<TripResponse> getByStatuses(List<TripStatus> statuses) {
        UUID tenantId = TenantContext.get();
        return tripRepo.findByTenantIdAndStatusIn(tenantId, statuses).stream()
                .map(this::enrichAndMap)
                .toList();
    }

    public TripResponse getById(UUID id) {
        UUID tenantId = TenantContext.get();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
        return enrichAndMap(trip);
    }

    @Transactional
    public TripResponse create(CreateTripRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();

        Trip trip = new Trip();
        trip.setTenantId(tenantId);
        trip.setStatus(TripStatus.CREATED);
        trip.setCreatedBy(p.userId());
        trip.setPodStatus(PodStatus.PENDING);

        // Auto-generate trip number
        trip.setTripNumber(generateTripNumber(tenantId));

        // Resolve branch
        UUID resolvedBranchId = branchValidator.resolve(p, req.getBranchId());
        Branch branch = branchRepo.findById(resolvedBranchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", resolvedBranchId));
        trip.setBranch(branch);

        // Route (required)
        if (req.getRouteId() == null) {
            throw new IllegalArgumentException("Route is required");
        }
        Route route = routeRepo.findByIdAndTenantId(req.getRouteId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", req.getRouteId()));
        trip.setRoute(route);
        // Denormalize route fields
        trip.setOriginCity(route.getOrigin());
        trip.setDestinationCity(route.getDestination());
        trip.setExpectedDistanceKm(route.getDistanceKm());
        trip.setExpectedTransitDays(null);

        // Vehicle (optional at creation)
        if (req.getVehicleId() != null) {
            Vehicle v = vehicleRepo.findByIdAndTenantId(req.getVehicleId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", req.getVehicleId()));
            trip.setVehicle(v);
            trip.setVehicleOwnership(v.getOwnership());
        }

        // Driver (optional at creation)
        if (req.getDriverId() != null) {
            Contact d = contactRepo.findByIdAndTenantId(req.getDriverId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", req.getDriverId()));
            trip.setDriver(d);
        }

        // Trip type
        if (req.getTripType() != null) {
            trip.setTripType(TripType.valueOf(req.getTripType()));
        }

        // LR / Consignment
        trip.setLrNumber(req.getLrNumber());
        trip.setLrDate(req.getLrDate() != null ? req.getLrDate() : LocalDate.now());
        trip.setDispatchDate(req.getDispatchDate());
        trip.setDispatchTime(req.getDispatchTime());
        trip.setClientInvoiceNumbers(req.getClientInvoiceNumbers());

        // Parties
        resolveParties(trip, req, tenantId);

        // Cargo
        trip.setCargoDescription(req.getCargoDescription());
        trip.setMaterialType(req.getMaterialType());
        trip.setWeightKg(req.getWeightKg());
        trip.setPackagesCount(req.getPackagesCount());
        trip.setConsignmentValue(req.getConsignmentValue());
        trip.setEwayBillNumber(req.getEwayBillNumber());
        trip.setTrolleyPalletQty(req.getTrolleyPalletQty());
        if (req.getRiskType() != null) {
            trip.setRiskType(RiskType.valueOf(req.getRiskType()));
        }

        // Financial
        trip.setFreightAmount(req.getFreightAmount());
        if (req.getPaymentTerms() != null) {
            trip.setPaymentTerms(PaymentTerms.valueOf(req.getPaymentTerms()));
        }
        trip.setLoadingNote(req.getLoadingNote());

        // Additional
        trip.setPermitNumber(req.getPermitNumber());
        trip.setDocumentNumber(req.getDocumentNumber());
        trip.setRemarks(req.getRemarks());
        trip.setConsignorAddress(req.getConsignorAddress());
        trip.setConsigneeAddress(req.getConsigneeAddress());

        Trip saved = tripRepo.save(trip);
        return enrichAndMap(saved);
    }

    @Transactional
    public TripResponse update(UUID id, CreateTripRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        // Only CREATED trips are fully editable
        if (trip.getStatus() == TripStatus.CANCELLED || trip.getStatus() == TripStatus.SETTLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "update");
        }

        trip.setUpdatedBy(p.userId());

        // Editable fields based on status
        if (trip.getStatus() == TripStatus.CREATED) {
            // All fields editable
            if (req.getRouteId() != null) {
                Route route = routeRepo.findByIdAndTenantId(req.getRouteId(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Route", req.getRouteId()));
                trip.setRoute(route);
                trip.setOriginCity(route.getOrigin());
                trip.setDestinationCity(route.getDestination());
                trip.setExpectedDistanceKm(route.getDistanceKm());
                trip.setExpectedTransitDays(null);
            }
            if (req.getVehicleId() != null) {
                Vehicle v = vehicleRepo.findByIdAndTenantId(req.getVehicleId(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Vehicle", req.getVehicleId()));
                trip.setVehicle(v);
                trip.setVehicleOwnership(v.getOwnership());
            }
            if (req.getDriverId() != null) {
                Contact d = contactRepo.findByIdAndTenantId(req.getDriverId(), tenantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Contact", req.getDriverId()));
                trip.setDriver(d);
            }
            if (req.getTripType() != null) trip.setTripType(TripType.valueOf(req.getTripType()));

            trip.setLrNumber(req.getLrNumber());
            trip.setLrDate(req.getLrDate());
            trip.setDispatchDate(req.getDispatchDate());
            trip.setDispatchTime(req.getDispatchTime());
            trip.setClientInvoiceNumbers(req.getClientInvoiceNumbers());
            resolveParties(trip, req, tenantId);
            trip.setCargoDescription(req.getCargoDescription());
            trip.setMaterialType(req.getMaterialType());
            trip.setWeightKg(req.getWeightKg());
            trip.setPackagesCount(req.getPackagesCount());
            trip.setConsignmentValue(req.getConsignmentValue());
            trip.setEwayBillNumber(req.getEwayBillNumber());
            trip.setTrolleyPalletQty(req.getTrolleyPalletQty());
            if (req.getRiskType() != null) trip.setRiskType(RiskType.valueOf(req.getRiskType()));
            trip.setFreightAmount(req.getFreightAmount());
            if (req.getPaymentTerms() != null) trip.setPaymentTerms(PaymentTerms.valueOf(req.getPaymentTerms()));
            trip.setLoadingNote(req.getLoadingNote());
            trip.setPermitNumber(req.getPermitNumber());
            trip.setDocumentNumber(req.getDocumentNumber());
            trip.setRemarks(req.getRemarks());
            trip.setConsignorAddress(req.getConsignorAddress());
            trip.setConsigneeAddress(req.getConsigneeAddress());
        } else {
            // IN_TRANSIT / DELIVERED: limited fields editable
            if (req.getRemarks() != null) trip.setRemarks(req.getRemarks());
            if (req.getFreightAmount() != null) trip.setFreightAmount(req.getFreightAmount());
        }

        return enrichAndMap(tripRepo.save(trip));
    }

    @Transactional
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
        if (trip.getStatus() != TripStatus.CREATED && trip.getStatus() != TripStatus.CANCELLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "delete");
        }
        tripRepo.delete(trip);
    }

    // ═══════════════════════════════════════════════════════════
    // STATE MACHINE — 5 transitions
    // ═══════════════════════════════════════════════════════════

    /** CREATED → IN_TRANSIT */
    @Transactional
    public TripResponse start(UUID id, StartTripRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        if (trip.getStatus() != TripStatus.CREATED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "start");
        }

        // Allow assigning vehicle/driver at start time
        if (req != null && req.getVehicleId() != null) {
            Vehicle v = vehicleRepo.findByIdAndTenantId(req.getVehicleId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", req.getVehicleId()));
            trip.setVehicle(v);
            trip.setVehicleOwnership(v.getOwnership());
        }
        if (req != null && req.getDriverId() != null) {
            Contact d = contactRepo.findByIdAndTenantId(req.getDriverId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", req.getDriverId()));
            trip.setDriver(d);
        }

        // Validate: vehicle and driver must be assigned
        if (trip.getVehicle() == null) {
            throw new IllegalArgumentException("Vehicle must be assigned before starting trip");
        }
        if (trip.getDriver() == null) {
            throw new IllegalArgumentException("Driver must be assigned before starting trip");
        }

        trip.setStatus(TripStatus.IN_TRANSIT);
        trip.setStartedAt(LocalDateTime.now());
        trip.setUpdatedBy(p.userId());

        return enrichAndMap(tripRepo.save(trip));
    }

    /** IN_TRANSIT → DELIVERED */
    @Transactional
    public TripResponse deliver(UUID id, DeliverTripRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        if (trip.getStatus() != TripStatus.IN_TRANSIT) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "deliver");
        }

        trip.setStatus(TripStatus.DELIVERED);
        trip.setDeliveredAt(LocalDateTime.now());
        if (req != null && req.getActualDistanceKm() != null) {
            trip.setActualDistanceKm(req.getActualDistanceKm());
        }
        trip.setUpdatedBy(p.userId());

        return enrichAndMap(tripRepo.save(trip));
    }

    /** Mark reached destination (secondary flag, IN_TRANSIT only) */
    @Transactional
    public TripResponse markReached(UUID id) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        if (trip.getStatus() != TripStatus.IN_TRANSIT) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "mark-reached");
        }

        trip.setReachedDestination(true);
        trip.setReachedDestinationAt(LocalDateTime.now());
        trip.setUpdatedBy(p.userId());

        return enrichAndMap(tripRepo.save(trip));
    }

    /** DELIVERED → SETTLED */
    @Transactional
    public TripResponse settle(UUID id, SettlementRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        if (trip.getStatus() != TripStatus.DELIVERED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "settle");
        }

        // Calculate settlement
        BigDecimal totalExpenses = expenseRepo.sumByTripIdAndTenantId(id, tenantId);
        BigDecimal totalAdvances = advanceRepo.sumByTripIdAndTenantId(id, tenantId);
        BigDecimal balance = totalAdvances.subtract(totalExpenses);

        // Determine action
        SettlementAction action;
        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            action = SettlementAction.EXACT_MATCH;
        } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
            action = SettlementAction.CASH_REFUND;
        } else {
            action = SettlementAction.PAID_TO_DRIVER;
        }

        // Create settlement record
        TripSettlement settlement = new TripSettlement();
        settlement.setTenantId(tenantId);
        settlement.setTripId(id);
        settlement.setTotalAdvances(totalAdvances);
        settlement.setTotalExpenses(totalExpenses);
        settlement.setBalance(balance);
        settlement.setSettlementAction(action);
        settlement.setSettlementNote(req != null ? req.getSettlementNote() : null);
        settlement.setSettledBy(p.userId());
        settlement.setSettledAt(LocalDateTime.now());
        settlementRepo.save(settlement);

        // Update trip
        trip.setStatus(TripStatus.SETTLED);
        trip.setSettledAt(LocalDateTime.now());
        trip.setUpdatedBy(p.userId());

        return enrichAndMap(tripRepo.save(trip));
    }

    /** CREATED|IN_TRANSIT → CANCELLED */
    @Transactional
    public TripResponse cancel(UUID id, CancelTripRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();
        Trip trip = tripRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));

        if (trip.getStatus() != TripStatus.CREATED && trip.getStatus() != TripStatus.IN_TRANSIT) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "cancel");
        }

        if (req == null || req.getReason() == null || req.getReason().isBlank()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        trip.setStatus(TripStatus.CANCELLED);
        trip.setCancelledAt(LocalDateTime.now());
        trip.setCancellationReason(req.getReason());
        trip.setUpdatedBy(p.userId());

        return enrichAndMap(tripRepo.save(trip));
    }

    // ═══════════════════════════════════════════════════════════
    // EXPENSES
    // ═══════════════════════════════════════════════════════════

    public List<TripExpenseResponse> getExpenses(UUID tripId) {
        UUID tenantId = TenantContext.get();
        return expenseRepo.findByTripIdAndTenantIdOrderByExpenseDateDesc(tripId, tenantId).stream()
                .map(tripMapper::toExpenseResponse)
                .toList();
    }

    @Transactional
    public TripExpenseResponse addExpense(UUID tripId, TripExpenseRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();

        // Verify trip exists and is in valid state for expenses
        Trip trip = tripRepo.findByIdAndTenantId(tripId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
        if (trip.getStatus() == TripStatus.SETTLED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "add expense");
        }

        TripExpense expense = new TripExpense();
        expense.setTenantId(tenantId);
        expense.setTripId(tripId);
        expense.setExpenseCategoryId(req.getExpenseCategoryId());
        expense.setExpenseCategoryName(req.getExpenseCategoryName());
        expense.setAmount(req.getAmount());
        expense.setExpenseDate(req.getExpenseDate() != null ? req.getExpenseDate() : LocalDate.now());
        expense.setDescription(req.getDescription());
        if (req.getPaymentMode() != null) {
            expense.setPaymentMode(PaymentMode.valueOf(req.getPaymentMode()));
        }
        expense.setFuelPumpAccountId(req.getFuelPumpAccountId());
        expense.setFuelLitres(req.getFuelLitres());
        expense.setFuelRatePerLitre(req.getFuelRatePerLitre());
        expense.setOdometerReading(req.getOdometerReading());
        expense.setLoggedBy(p.userId());

        return tripMapper.toExpenseResponse(expenseRepo.save(expense));
    }

    @Transactional
    public TripExpenseResponse updateExpense(UUID tripId, UUID expenseId, TripExpenseRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();

        Trip trip = tripRepo.findByIdAndTenantId(tripId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
        if (trip.getStatus() == TripStatus.SETTLED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "update expense");
        }

        TripExpense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("TripExpense", expenseId));
        if (!expense.getTripId().equals(tripId) || !expense.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("TripExpense", expenseId);
        }

        expense.setExpenseCategoryId(req.getExpenseCategoryId());
        expense.setExpenseCategoryName(req.getExpenseCategoryName());
        expense.setAmount(req.getAmount());
        expense.setExpenseDate(req.getExpenseDate());
        expense.setDescription(req.getDescription());
        if (req.getPaymentMode() != null) {
            expense.setPaymentMode(PaymentMode.valueOf(req.getPaymentMode()));
        }
        expense.setFuelPumpAccountId(req.getFuelPumpAccountId());
        expense.setFuelLitres(req.getFuelLitres());
        expense.setFuelRatePerLitre(req.getFuelRatePerLitre());
        expense.setOdometerReading(req.getOdometerReading());

        return tripMapper.toExpenseResponse(expenseRepo.save(expense));
    }

    @Transactional
    public void deleteExpense(UUID tripId, UUID expenseId) {
        UUID tenantId = TenantContext.get();
        Trip trip = tripRepo.findByIdAndTenantId(tripId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
        if (trip.getStatus() == TripStatus.SETTLED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "delete expense");
        }

        TripExpense expense = expenseRepo.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("TripExpense", expenseId));
        if (!expense.getTripId().equals(tripId) || !expense.getTenantId().equals(tenantId)) {
            throw new ResourceNotFoundException("TripExpense", expenseId);
        }
        expenseRepo.delete(expense);
    }

    // ═══════════════════════════════════════════════════════════
    // ADVANCES
    // ═══════════════════════════════════════════════════════════

    public List<TripAdvanceResponse> getAdvances(UUID tripId) {
        UUID tenantId = TenantContext.get();
        return advanceRepo.findByTripIdAndTenantIdOrderByGivenDateDesc(tripId, tenantId).stream()
                .map(tripMapper::toAdvanceResponse)
                .toList();
    }

    @Transactional
    public TripAdvanceResponse addAdvance(UUID tripId, TripAdvanceRequest req) {
        TenantPrincipal p = TenantPrincipal.current();
        UUID tenantId = p.tenantId();

        Trip trip = tripRepo.findByIdAndTenantId(tripId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));
        if (trip.getStatus() == TripStatus.SETTLED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new InvalidStatusTransitionException(trip.getStatus(), "add advance");
        }
        if (trip.getDriver() == null) {
            throw new IllegalArgumentException("Driver must be assigned before giving advance");
        }

        TripAdvance advance = new TripAdvance();
        advance.setTenantId(tenantId);
        advance.setTripId(tripId);
        advance.setDriverId(trip.getDriver().getId());
        advance.setAmount(req.getAmount());
        if (req.getPaymentMode() != null) {
            advance.setPaymentMode(PaymentMode.valueOf(req.getPaymentMode()));
        } else {
            advance.setPaymentMode(PaymentMode.CASH);
        }
        advance.setSourceAccountId(req.getSourceAccountId());
        advance.setGivenDate(req.getGivenDate() != null ? req.getGivenDate() : LocalDate.now());
        advance.setGivenBy(p.userId());
        advance.setNotes(req.getNotes());

        return tripMapper.toAdvanceResponse(advanceRepo.save(advance));
    }

    // ═══════════════════════════════════════════════════════════
    // SETTLEMENT SUMMARY
    // ═══════════════════════════════════════════════════════════

    public SettlementSummaryResponse getSettlementSummary(UUID tripId) {
        UUID tenantId = TenantContext.get();
        tripRepo.findByIdAndTenantId(tripId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));

        BigDecimal totalExpenses = expenseRepo.sumByTripIdAndTenantId(tripId, tenantId);
        BigDecimal totalAdvances = advanceRepo.sumByTripIdAndTenantId(tripId, tenantId);

        SettlementSummaryResponse summary = new SettlementSummaryResponse();
        summary.setTotalExpenses(totalExpenses);
        summary.setTotalAdvances(totalAdvances);
        summary.setBalance(totalAdvances.subtract(totalExpenses));
        summary.setExpenseLines(
            expenseRepo.findByTripIdAndTenantIdOrderByExpenseDateDesc(tripId, tenantId)
                    .stream().map(tripMapper::toExpenseResponse).toList()
        );
        summary.setAdvanceLines(
            advanceRepo.findByTripIdAndTenantIdOrderByGivenDateDesc(tripId, tenantId)
                    .stream().map(tripMapper::toAdvanceResponse).toList()
        );

        return summary;
    }

    // ═══════════════════════════════════════════════════════════
    // DOCUMENTS
    // ═══════════════════════════════════════════════════════════

    public List<TripDocumentResponse> getDocuments(UUID tripId) {
        UUID tenantId = TenantContext.get();
        return documentRepo.findByTripIdAndTenantId(tripId, tenantId).stream()
                .map(tripMapper::toDocumentResponse)
                .toList();
    }

    // ═══════════════════════════════════════════════════════════
    // DASHBOARD COUNTS
    // ═══════════════════════════════════════════════════════════

    public Map<String, Long> getStatusCounts() {
        UUID tenantId = TenantContext.get();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (TripStatus s : TripStatus.values()) {
            counts.put(s.name(), tripRepo.countByTenantIdAndStatus(tenantId, s));
        }
        return counts;
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private TripResponse enrichAndMap(Trip trip) {
        UUID tenantId = trip.getTenantId();
        TripResponse r = tripMapper.toResponse(trip);

        // Computed metrics
        BigDecimal totalExpenses = expenseRepo.sumByTripIdAndTenantId(trip.getId(), tenantId);
        BigDecimal totalAdvances = advanceRepo.sumByTripIdAndTenantId(trip.getId(), tenantId);
        r.setTotalExpenses(totalExpenses);
        r.setTotalAdvances(totalAdvances);
        r.setSettlementBalance(totalAdvances.subtract(totalExpenses));

        // Trip profit = freight - expenses
        BigDecimal freight = trip.getFreightAmount() != null ? trip.getFreightAmount() : BigDecimal.ZERO;
        r.setTripProfit(freight.subtract(totalExpenses));

        return r;
    }

    private void resolveParties(Trip trip, CreateTripRequest req, UUID tenantId) {
        if (req.getConsignorId() != null) {
            trip.setConsignor(ledgerRepo.findByIdAndTenantId(req.getConsignorId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Consignor", req.getConsignorId())));
        } else {
            trip.setConsignor(null);
        }
        if (req.getConsigneeId() != null) {
            trip.setConsignee(ledgerRepo.findByIdAndTenantId(req.getConsigneeId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Consignee", req.getConsigneeId())));
        } else {
            trip.setConsignee(null);
        }
        if (req.getBillingPartyId() != null) {
            trip.setBillingParty(ledgerRepo.findByIdAndTenantId(req.getBillingPartyId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("BillingParty", req.getBillingPartyId())));
        } else {
            trip.setBillingParty(null);
        }
        if (req.getTransporterId() != null) {
            trip.setTransporter(ledgerRepo.findByIdAndTenantId(req.getTransporterId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Transporter", req.getTransporterId())));
        } else {
            trip.setTransporter(null);
        }
    }

    /**
     * Generates next trip number for the tenant using NumberSeriesMaster.
     * Falls back to T-XXXXX format with in-memory counter if no series configured.
     */
    @Transactional
    protected String generateTripNumber(UUID tenantId) {
        Optional<NumberSeriesMaster> seriesOpt = numberSeriesRepo
                .findAll().stream()
                .filter(s -> s.getTenantId().equals(tenantId) && s.getEntityType() == NumberSeriesEntityType.TRIP)
                .findFirst();

        if (seriesOpt.isPresent()) {
            NumberSeriesMaster series = seriesOpt.get();
            long nextVal = series.getCurrentValue() + 1;
            series.setCurrentValue(nextVal);
            numberSeriesRepo.save(series);

            StringBuilder sb = new StringBuilder();
            if (series.getPrefix() != null) sb.append(series.getPrefix());
            sb.append(String.format("%0" + series.getPaddingLength() + "d", nextVal));
            if (series.getSuffix() != null) sb.append(series.getSuffix());
            return sb.toString();
        }

        // Fallback: count existing trips + 1
        long count = tripRepo.findByTenantId(tenantId).size() + 1;
        return "T-" + String.format("%05d", count);
    }
}
