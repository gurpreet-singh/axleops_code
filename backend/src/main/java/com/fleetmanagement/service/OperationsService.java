package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.*;
import com.fleetmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperationsService {

    private final FuelEntryRepository fuelEntryRepo;
    private final DriverAssignmentRepository driverAssignmentRepo;
    private final VehicleDocumentRepository vehicleDocRepo;
    private final TripRepository tripRepo;
    private final VehicleRepository vehicleRepo;
    private final ContactRepository contactRepo;

    // ═══════════════════════════════════════════════════════════
    // FUEL ENTRIES
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getFuelEntries(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return fuelEntryRepo.findByVehicleIdAndTenantIdOrderByFillDateDesc(vehicleId, tid).stream()
                .map(this::fuelToMap).toList();
    }

    @Transactional
    public Map<String, Object> createFuelEntry(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        FuelEntry f = new FuelEntry();
        f.setTenantId(tid);
        f.setVehicle(v);
        f.setBranch(v.getBranch());
        f.setFillDate(data.get("fillDate") != null ? LocalDate.parse((String) data.get("fillDate")) : LocalDate.now());
        f.setFuelType((String) data.getOrDefault("fuelType", v.getFuelType()));
        f.setQuantityLitres(toBD(data.get("quantityLitres")));
        f.setTotalCost(toBD(data.get("totalCost")));
        if (data.get("ratePerLitre") != null) {
            f.setRatePerLitre(toBD(data.get("ratePerLitre")));
        } else if (f.getQuantityLitres().compareTo(BigDecimal.ZERO) > 0) {
            f.setRatePerLitre(f.getTotalCost().divide(f.getQuantityLitres(), 2, RoundingMode.HALF_UP));
        }
        f.setFillType((String) data.getOrDefault("fillType", "FULL"));
        f.setStationName((String) data.get("stationName"));
        f.setStationLocation((String) data.get("stationLocation"));
        f.setReceiptNumber((String) data.get("receiptNumber"));
        f.setNotes((String) data.get("notes"));

        if (data.get("odometerReading") != null) {
            f.setOdometerReading(toBD(data.get("odometerReading")));
            // Compute mileage from previous entry
            fuelEntryRepo.findFirstByVehicleIdAndTenantIdOrderByFillDateDesc(vehicleId, tid)
                    .ifPresent(prev -> {
                        if (prev.getOdometerReading() != null) {
                            f.setPreviousOdometer(prev.getOdometerReading());
                            BigDecimal distance = f.getOdometerReading().subtract(prev.getOdometerReading());
                            if (distance.compareTo(BigDecimal.ZERO) > 0 && f.getQuantityLitres().compareTo(BigDecimal.ZERO) > 0) {
                                f.setMileageKmpl(distance.divide(f.getQuantityLitres(), 2, RoundingMode.HALF_UP));
                            }
                        }
                    });
            // Update vehicle odometer
            v.setOdometer(f.getOdometerReading());
            vehicleRepo.save(v);
        }

        if (data.get("driverId") != null) {
            contactRepo.findByIdAndTenantId(UUID.fromString((String) data.get("driverId")), tid)
                    .ifPresent(f::setDriver);
        }

        return fuelToMap(fuelEntryRepo.save(f));
    }

    public Map<String, Object> getFuelSummary(UUID vehicleId) {
        UUID tid = TenantContext.get();
        BigDecimal totalLitres = fuelEntryRepo.sumLitresByVehicle(vehicleId, tid);
        BigDecimal totalCost = fuelEntryRepo.sumCostByVehicle(vehicleId, tid);
        BigDecimal avgMileage = fuelEntryRepo.avgMileageByVehicle(vehicleId, tid);
        BigDecimal thisMonth = fuelEntryRepo.sumCostSince(vehicleId, tid, LocalDate.now().withDayOfMonth(1));
        return Map.of(
                "totalLitres", totalLitres,
                "totalCost", totalCost,
                "avgMileage", avgMileage,
                "thisMonth", thisMonth
        );
    }

    // ═══════════════════════════════════════════════════════════
    // DRIVER ASSIGNMENTS
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getDriverAssignments(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return driverAssignmentRepo.findByVehicleIdAndTenantIdOrderByAssignedFromDesc(vehicleId, tid).stream()
                .map(this::assignmentToMap).toList();
    }

    @Transactional
    public Map<String, Object> assignDriver(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));
        Contact driver = contactRepo.findByIdAndTenantId(UUID.fromString((String) data.get("driverId")), tid)
                .orElseThrow(() -> new ResourceNotFoundException("Contact (Driver)", UUID.fromString((String) data.get("driverId"))));

        // End previous current assignment
        driverAssignmentRepo.findByVehicleIdAndTenantIdAndIsCurrentTrue(vehicleId, tid)
                .ifPresent(prev -> {
                    prev.setIsCurrent(false);
                    prev.setAssignedTo(LocalDate.now());
                    driverAssignmentRepo.save(prev);
                });

        DriverAssignment da = new DriverAssignment();
        da.setTenantId(tid);
        da.setVehicle(v);
        da.setBranch(v.getBranch());
        da.setDriver(driver);
        da.setAssignedFrom(data.get("assignedFrom") != null ? LocalDate.parse((String) data.get("assignedFrom")) : LocalDate.now());
        da.setAssignmentType((String) data.getOrDefault("assignmentType", "PRIMARY"));
        da.setIsCurrent(true);
        da.setNotes((String) data.get("notes"));

        return assignmentToMap(driverAssignmentRepo.save(da));
    }

    @Transactional
    public void endAssignment(UUID assignmentId) {
        UUID tid = TenantContext.get();
        DriverAssignment da = driverAssignmentRepo.findByIdAndTenantId(assignmentId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("DriverAssignment", assignmentId));
        da.setIsCurrent(false);
        da.setAssignedTo(LocalDate.now());
        driverAssignmentRepo.save(da);
    }

    // ═══════════════════════════════════════════════════════════
    // VEHICLE DOCUMENTS
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getVehicleDocuments(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return vehicleDocRepo.findByVehicleIdAndTenantIdOrderByUploadDateDesc(vehicleId, tid).stream()
                .map(this::docToMap).toList();
    }

    @Transactional
    public Map<String, Object> createVehicleDocument(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        VehicleDocument d = new VehicleDocument();
        d.setTenantId(tid);
        d.setVehicle(v);
        d.setName((String) data.get("name"));
        d.setDocumentCategory((String) data.getOrDefault("documentCategory", "OTHER"));
        d.setFileName((String) data.get("fileName"));
        d.setFileType((String) data.get("fileType"));
        d.setFileUrl((String) data.get("fileUrl"));
        d.setNotes((String) data.get("notes"));
        d.setUploadDate(LocalDate.now());
        return docToMap(vehicleDocRepo.save(d));
    }

    @Transactional
    public void deleteDocument(UUID docId) {
        UUID tid = TenantContext.get();
        VehicleDocument d = vehicleDocRepo.findByIdAndTenantId(docId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleDocument", docId));
        vehicleDocRepo.delete(d);
    }

    // ═══════════════════════════════════════════════════════════
    // TRIP HISTORY (vehicle-level)
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getVehicleTrips(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return tripRepo.findByVehicleIdAndTenantIdOrderByCreatedAtDesc(vehicleId, tid).stream()
                .map(this::tripToMap).toList();
    }

    // ═══════════════════════════════════════════════════════════
    // UNIFIED OPERATIONS DASHBOARD
    // ═══════════════════════════════════════════════════════════

    public Map<String, Object> getOperationsDashboard(UUID vehicleId) {
        UUID tid = TenantContext.get();
        Map<String, Object> dash = new LinkedHashMap<>();
        dash.put("totalTrips", tripRepo.countByVehicleIdAndTenantId(vehicleId, tid));
        dash.put("activeTrips", tripRepo.countByVehicleIdAndTenantIdAndStatus(vehicleId, tid, TripStatus.IN_TRANSIT));
        dash.put("completedTrips", tripRepo.countByVehicleIdAndTenantIdAndStatus(vehicleId, tid, TripStatus.DELIVERED));
        dash.put("totalFuelCost", fuelEntryRepo.sumCostByVehicle(vehicleId, tid));
        dash.put("avgMileage", fuelEntryRepo.avgMileageByVehicle(vehicleId, tid));
        dash.put("documentCount", vehicleDocRepo.countByVehicleIdAndTenantId(vehicleId, tid));

        // Current driver
        driverAssignmentRepo.findByVehicleIdAndTenantIdAndIsCurrentTrue(vehicleId, tid)
                .ifPresentOrElse(
                        da -> dash.put("currentDriver", Map.of(
                                "id", da.getDriver().getId(),
                                "name", da.getDriver().getFirstName() + (da.getDriver().getLastName() != null ? " " + da.getDriver().getLastName() : ""),
                                "since", da.getAssignedFrom()
                        )),
                        () -> dash.put("currentDriver", null)
                );
        return dash;
    }

    // ═══════════════════════════════════════════════════════════
    // Mapper Helpers
    // ═══════════════════════════════════════════════════════════

    private Map<String, Object> fuelToMap(FuelEntry f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("vehicleId", f.getVehicle().getId());
        m.put("fillDate", f.getFillDate());
        m.put("fuelType", f.getFuelType());
        m.put("quantityLitres", f.getQuantityLitres());
        m.put("ratePerLitre", f.getRatePerLitre());
        m.put("totalCost", f.getTotalCost());
        m.put("odometerReading", f.getOdometerReading());
        m.put("mileageKmpl", f.getMileageKmpl());
        m.put("fillType", f.getFillType());
        m.put("stationName", f.getStationName());
        m.put("receiptNumber", f.getReceiptNumber());
        m.put("driverName", f.getDriver() != null ? f.getDriver().getFirstName() : null);
        m.put("notes", f.getNotes());
        return m;
    }

    private Map<String, Object> assignmentToMap(DriverAssignment da) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", da.getId());
        m.put("vehicleId", da.getVehicle().getId());
        m.put("driverId", da.getDriver().getId());
        m.put("driverName", da.getDriver().getFirstName() + (da.getDriver().getLastName() != null ? " " + da.getDriver().getLastName() : ""));
        m.put("assignedFrom", da.getAssignedFrom());
        m.put("assignedTo", da.getAssignedTo());
        m.put("assignmentType", da.getAssignmentType());
        m.put("isCurrent", da.getIsCurrent());
        m.put("notes", da.getNotes());
        return m;
    }

    private Map<String, Object> docToMap(VehicleDocument d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("vehicleId", d.getVehicle().getId());
        m.put("name", d.getName());
        m.put("documentCategory", d.getDocumentCategory());
        m.put("fileName", d.getFileName());
        m.put("fileType", d.getFileType());
        m.put("fileUrl", d.getFileUrl());
        m.put("uploadDate", d.getUploadDate());
        m.put("notes", d.getNotes());
        return m;
    }

    private Map<String, Object> tripToMap(Trip t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("tripNumber", t.getTripNumber());
        m.put("routeName", t.getRoute() != null ? t.getRoute().getName() : null);
        m.put("origin", t.getRoute() != null ? t.getRoute().getOrigin() : null);
        m.put("destination", t.getRoute() != null ? t.getRoute().getDestination() : null);
        m.put("driverName", t.getDriver() != null ? t.getDriver().getFirstName() : null);
        m.put("status", t.getStatus() != null ? t.getStatus().name() : null);
        m.put("startedAt", t.getStartedAt());
        m.put("deliveredAt", t.getDeliveredAt());
        m.put("settledAt", t.getSettledAt());
        m.put("actualDistanceKm", t.getActualDistanceKm());
        m.put("freightAmount", t.getFreightAmount());
        m.put("lrNumber", t.getLrNumber());
        m.put("podStatus", t.getPodStatus() != null ? t.getPodStatus().name() : null);
        return m;
    }

    private BigDecimal toBD(Object o) {
        if (o == null) return BigDecimal.ZERO;
        return new BigDecimal(o.toString());
    }
}
