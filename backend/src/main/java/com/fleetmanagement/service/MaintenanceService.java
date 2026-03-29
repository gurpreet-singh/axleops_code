package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.*;
import com.fleetmanagement.repository.*;
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
public class MaintenanceService {

    private final ServiceTaskRepository serviceTaskRepo;
    private final IssueRepository issueRepo;
    private final InspectionRepository inspectionRepo;
    private final VehicleHealthScoreRepository healthScoreRepo;
    private final LoanRepository loanRepo;
    private final WarrantyRepository warrantyRepo;
    private final CostEntryRepository costEntryRepo;
    private final VehicleRepository vehicleRepo;

    // ═══════════════════════════════════════════════════════════
    // SERVICE TASKS
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getServiceTasks(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return serviceTaskRepo.findByVehicleIdAndTenantId(vehicleId, tid).stream()
                .map(this::taskToMap).toList();
    }

    @Transactional
    public Map<String, Object> createServiceTask(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        ServiceTask t = new ServiceTask();
        t.setTenantId(tid);
        t.setVehicle(v);
        t.setName((String) data.get("name"));
        t.setDescription((String) data.get("description"));
        t.setTaskType((String) data.getOrDefault("taskType", "PREVENTIVE"));
        t.setStatus("ACTIVE");
        if (data.get("intervalMonths") != null) t.setIntervalMonths(toInt(data.get("intervalMonths")));
        if (data.get("intervalKm") != null) t.setIntervalKm(toInt(data.get("intervalKm")));
        if (data.get("nextDueDate") != null) t.setNextDueDate(LocalDate.parse((String) data.get("nextDueDate")));
        if (data.get("nextDueKm") != null) t.setNextDueKm(toInt(data.get("nextDueKm")));
        if (data.get("estimatedCost") != null) t.setEstimatedCost(new BigDecimal(data.get("estimatedCost").toString()));
        return taskToMap(serviceTaskRepo.save(t));
    }

    @Transactional
    public Map<String, Object> completeServiceTask(UUID taskId) {
        UUID tid = TenantContext.get();
        ServiceTask t = serviceTaskRepo.findByIdAndTenantId(taskId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTask", taskId));
        t.setLastCompletedDate(LocalDate.now());
        t.setStatus("COMPLETED");
        if (t.getIntervalMonths() != null) {
            t.setNextDueDate(LocalDate.now().plusMonths(t.getIntervalMonths()));
            t.setStatus("ACTIVE");
        }
        return taskToMap(serviceTaskRepo.save(t));
    }

    @Transactional
    public void deleteServiceTask(UUID taskId) {
        UUID tid = TenantContext.get();
        ServiceTask t = serviceTaskRepo.findByIdAndTenantId(taskId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceTask", taskId));
        t.setStatus("CANCELLED");
        serviceTaskRepo.save(t);
    }

    // ═══════════════════════════════════════════════════════════
    // ISSUES
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getIssues(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return issueRepo.findByVehicleIdAndTenantId(vehicleId, tid).stream()
                .map(this::issueToMap).toList();
    }

    @Transactional
    public Map<String, Object> createIssue(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        Issue i = new Issue();
        i.setTenantId(tid);
        i.setVehicle(v);
        i.setTitle((String) data.get("title"));
        i.setDescription((String) data.get("description"));
        i.setPriority((String) data.getOrDefault("priority", "MEDIUM"));
        i.setCategory((String) data.get("category"));
        i.setReportedDate(LocalDate.now());
        i.setStatus("OPEN");
        i.setIssueNumber("ISS-" + System.currentTimeMillis() % 100000);
        if (data.get("odometerAtReport") != null) i.setOdometerAtReport(toInt(data.get("odometerAtReport")));
        return issueToMap(issueRepo.save(i));
    }

    @Transactional
    public Map<String, Object> updateIssueStatus(UUID issueId, String status, String notes) {
        UUID tid = TenantContext.get();
        Issue i = issueRepo.findByIdAndTenantId(issueId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", issueId));
        i.setStatus(status);
        if ("RESOLVED".equals(status) || "CLOSED".equals(status)) i.setResolvedDate(LocalDate.now());
        if (notes != null) i.setResolutionNotes(notes);
        return issueToMap(issueRepo.save(i));
    }

    // ═══════════════════════════════════════════════════════════
    // INSPECTIONS
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getInspections(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return inspectionRepo.findByVehicleIdAndTenantIdOrderBySubmittedAtDesc(vehicleId, tid).stream()
                .map(this::inspectionToMap).toList();
    }

    @Transactional
    public Map<String, Object> createInspection(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        Inspection ins = new Inspection();
        ins.setTenantId(tid);
        ins.setVehicle(v);
        ins.setSubmittedAt(LocalDateTime.now());
        ins.setFormType((String) data.getOrDefault("formType", "DVIR"));
        ins.setOverallResult((String) data.getOrDefault("overallResult", "PASS"));
        ins.setDefectsFound(data.get("defectsFound") != null ? toInt(data.get("defectsFound")) : 0);
        ins.setDefectSummary((String) data.get("defectSummary"));
        ins.setNotes((String) data.get("notes"));
        if (data.get("odometerReading") != null) ins.setOdometerReading(toInt(data.get("odometerReading")));
        return inspectionToMap(inspectionRepo.save(ins));
    }

    // ═══════════════════════════════════════════════════════════
    // HEALTH SCORE
    // ═══════════════════════════════════════════════════════════

    public Map<String, Object> getHealthScore(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return healthScoreRepo.findFirstByVehicleIdAndTenantIdOrderByCalculatedAtDesc(vehicleId, tid)
                .map(this::healthToMap)
                .orElse(Map.of("score", 0, "maintenanceScore", 0, "issueScore", 0, "inspectionScore", 0, "complianceScore", 0));
    }

    @Transactional
    public Map<String, Object> computeHealthScore(UUID vehicleId) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        long overdueTasks = serviceTaskRepo.countByVehicleIdAndTenantIdAndStatus(vehicleId, tid, "OVERDUE");
        long openIssues = issueRepo.countByVehicleIdAndTenantIdAndStatusIn(vehicleId, tid, List.of("OPEN", "IN_PROGRESS"));
        long totalInspections = inspectionRepo.countByVehicleIdAndTenantId(vehicleId, tid);

        int mScore = overdueTasks == 0 ? 100 : Math.max(0, 100 - (int)(overdueTasks * 15));
        int iScore = openIssues == 0 ? 100 : Math.max(0, 100 - (int)(openIssues * 20));
        int insScore = totalInspections > 0 ? 80 : 50;
        int cScore = 80; // Placeholder; fully computed with compliance module
        int overall = (mScore + iScore + insScore + cScore) / 4;

        VehicleHealthScore h = new VehicleHealthScore();
        h.setTenantId(tid);
        h.setVehicle(v);
        h.setScore(overall);
        h.setMaintenanceScore(mScore);
        h.setIssueScore(iScore);
        h.setInspectionScore(insScore);
        h.setComplianceScore(cScore);
        h.setCalculatedAt(LocalDateTime.now());
        return healthToMap(healthScoreRepo.save(h));
    }

    // ═══════════════════════════════════════════════════════════
    // LOANS
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getLoans(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return loanRepo.findByVehicleIdAndTenantId(vehicleId, tid).stream()
                .map(this::loanToMap).toList();
    }

    @Transactional
    public Map<String, Object> createLoan(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        Loan l = new Loan();
        l.setTenantId(tid);
        l.setVehicle(v);
        l.setLender((String) data.get("lender"));
        l.setLoanAccountNo((String) data.get("loanAccountNo"));
        if (data.get("loanAmount") != null) l.setLoanAmount(new BigDecimal(data.get("loanAmount").toString()));
        if (data.get("interestRate") != null) l.setInterestRate(new BigDecimal(data.get("interestRate").toString()));
        if (data.get("loanTermMonths") != null) l.setLoanTermMonths(toInt(data.get("loanTermMonths")));
        if (data.get("monthlyEmi") != null) l.setMonthlyEmi(new BigDecimal(data.get("monthlyEmi").toString()));
        if (data.get("outstandingBalance") != null) l.setOutstandingBalance(new BigDecimal(data.get("outstandingBalance").toString()));
        if (data.get("disbursementDate") != null) l.setDisbursementDate(LocalDate.parse((String) data.get("disbursementDate")));
        if (data.get("maturityDate") != null) l.setMaturityDate(LocalDate.parse((String) data.get("maturityDate")));
        l.setStatus("ACTIVE");
        return loanToMap(loanRepo.save(l));
    }

    // ═══════════════════════════════════════════════════════════
    // WARRANTIES
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getWarranties(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return warrantyRepo.findByVehicleIdAndTenantId(vehicleId, tid).stream()
                .map(this::warrantyToMap).toList();
    }

    @Transactional
    public Map<String, Object> createWarranty(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        Warranty w = new Warranty();
        w.setTenantId(tid);
        w.setVehicle(v);
        w.setWarrantyType((String) data.get("warrantyType"));
        w.setProvider((String) data.get("provider"));
        w.setStartDate(LocalDate.parse((String) data.get("startDate")));
        w.setExpiryDate(LocalDate.parse((String) data.get("expiryDate")));
        if (data.get("maxKm") != null) w.setMaxKm(toInt(data.get("maxKm")));
        w.setPolicyNumber((String) data.get("policyNumber"));
        w.setCoverageDetails((String) data.get("coverageDetails"));
        w.setStatus("ACTIVE");
        return warrantyToMap(warrantyRepo.save(w));
    }

    // ═══════════════════════════════════════════════════════════
    // COST ENTRIES
    // ═══════════════════════════════════════════════════════════

    public List<Map<String, Object>> getCostEntries(UUID vehicleId) {
        UUID tid = TenantContext.get();
        return costEntryRepo.findByVehicleIdAndTenantIdOrderByCostDateDesc(vehicleId, tid).stream()
                .map(this::costToMap).toList();
    }

    @Transactional
    public Map<String, Object> createCostEntry(UUID vehicleId, Map<String, Object> data) {
        UUID tid = TenantContext.get();
        Vehicle v = vehicleRepo.findByIdAndTenantId(vehicleId, tid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        CostEntry c = new CostEntry();
        c.setTenantId(tid);
        c.setVehicle(v);
        c.setCostCategory((String) data.get("costCategory"));
        c.setAmount(new BigDecimal(data.get("amount").toString()));
        c.setCostDate(data.get("costDate") != null ? LocalDate.parse((String) data.get("costDate")) : LocalDate.now());
        c.setDescription((String) data.get("description"));
        c.setReferenceType((String) data.getOrDefault("referenceType", "MANUAL"));
        c.setVendorName((String) data.get("vendorName"));
        c.setInvoiceNumber((String) data.get("invoiceNumber"));
        if (data.get("odometerReading") != null) c.setOdometerReading(toInt(data.get("odometerReading")));
        return costToMap(costEntryRepo.save(c));
    }

    public Map<String, Object> getCostSummary(UUID vehicleId) {
        UUID tid = TenantContext.get();
        BigDecimal totalCost = costEntryRepo.sumByVehicleAndTenant(vehicleId, tid);
        BigDecimal thisMonth = costEntryRepo.sumByVehicleAndTenantSince(vehicleId, tid, LocalDate.now().withDayOfMonth(1));
        BigDecimal thisYear = costEntryRepo.sumByVehicleAndTenantSince(vehicleId, tid, LocalDate.now().withDayOfYear(1));
        return Map.of("totalCost", totalCost, "thisMonth", thisMonth, "thisYear", thisYear);
    }

    // ═══════════════════════════════════════════════════════════
    // UNIFIED DASHBOARD for a vehicle
    // ═══════════════════════════════════════════════════════════

    public Map<String, Object> getVehicleMaintenanceDashboard(UUID vehicleId) {
        UUID tid = TenantContext.get();
        Map<String, Object> dash = new LinkedHashMap<>();
        dash.put("overdueTasks", serviceTaskRepo.countByVehicleIdAndTenantIdAndStatus(vehicleId, tid, "OVERDUE"));
        dash.put("activeTasks", serviceTaskRepo.countByVehicleIdAndTenantIdAndStatus(vehicleId, tid, "ACTIVE"));
        dash.put("openIssues", issueRepo.countByVehicleIdAndTenantIdAndStatusIn(vehicleId, tid, List.of("OPEN", "IN_PROGRESS")));
        dash.put("totalInspections", inspectionRepo.countByVehicleIdAndTenantId(vehicleId, tid));
        dash.put("totalCost", costEntryRepo.sumByVehicleAndTenant(vehicleId, tid));
        dash.put("healthScore", getHealthScore(vehicleId));
        return dash;
    }

    // ═══════════════════════════════════════════════════════════
    // Mapper Helpers
    // ═══════════════════════════════════════════════════════════

    private Map<String, Object> taskToMap(ServiceTask t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("vehicleId", t.getVehicle().getId());
        m.put("name", t.getName());
        m.put("description", t.getDescription());
        m.put("taskType", t.getTaskType());
        m.put("status", t.getStatus());
        m.put("intervalMonths", t.getIntervalMonths());
        m.put("intervalKm", t.getIntervalKm());
        m.put("nextDueDate", t.getNextDueDate());
        m.put("nextDueKm", t.getNextDueKm());
        m.put("lastCompletedDate", t.getLastCompletedDate());
        m.put("lastCompletedKm", t.getLastCompletedKm());
        m.put("estimatedCost", t.getEstimatedCost());
        m.put("compliancePct", t.getCompliancePct());
        return m;
    }

    private Map<String, Object> issueToMap(Issue i) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", i.getId());
        m.put("vehicleId", i.getVehicle().getId());
        m.put("issueNumber", i.getIssueNumber());
        m.put("title", i.getTitle());
        m.put("description", i.getDescription());
        m.put("status", i.getStatus());
        m.put("priority", i.getPriority());
        m.put("category", i.getCategory());
        m.put("reportedDate", i.getReportedDate());
        m.put("resolvedDate", i.getResolvedDate());
        m.put("resolutionNotes", i.getResolutionNotes());
        m.put("odometerAtReport", i.getOdometerAtReport());
        return m;
    }

    private Map<String, Object> inspectionToMap(Inspection ins) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", ins.getId());
        m.put("vehicleId", ins.getVehicle().getId());
        m.put("submittedAt", ins.getSubmittedAt());
        m.put("formType", ins.getFormType());
        m.put("overallResult", ins.getOverallResult());
        m.put("defectsFound", ins.getDefectsFound());
        m.put("defectSummary", ins.getDefectSummary());
        m.put("odometerReading", ins.getOdometerReading());
        m.put("notes", ins.getNotes());
        return m;
    }

    private Map<String, Object> healthToMap(VehicleHealthScore h) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("score", h.getScore());
        m.put("maintenanceScore", h.getMaintenanceScore());
        m.put("issueScore", h.getIssueScore());
        m.put("inspectionScore", h.getInspectionScore());
        m.put("complianceScore", h.getComplianceScore());
        m.put("calculatedAt", h.getCalculatedAt());
        return m;
    }

    private Map<String, Object> loanToMap(Loan l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("vehicleId", l.getVehicle().getId());
        m.put("lender", l.getLender());
        m.put("loanAccountNo", l.getLoanAccountNo());
        m.put("loanAmount", l.getLoanAmount());
        m.put("interestRate", l.getInterestRate());
        m.put("loanTermMonths", l.getLoanTermMonths());
        m.put("monthlyEmi", l.getMonthlyEmi());
        m.put("outstandingBalance", l.getOutstandingBalance());
        m.put("disbursementDate", l.getDisbursementDate());
        m.put("maturityDate", l.getMaturityDate());
        m.put("status", l.getStatus());
        return m;
    }

    private Map<String, Object> warrantyToMap(Warranty w) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", w.getId());
        m.put("vehicleId", w.getVehicle().getId());
        m.put("warrantyType", w.getWarrantyType());
        m.put("provider", w.getProvider());
        m.put("startDate", w.getStartDate());
        m.put("expiryDate", w.getExpiryDate());
        m.put("maxKm", w.getMaxKm());
        m.put("status", w.getStatus());
        m.put("policyNumber", w.getPolicyNumber());
        m.put("coverageDetails", w.getCoverageDetails());
        m.put("claimCount", w.getClaimCount());
        return m;
    }

    private Map<String, Object> costToMap(CostEntry c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("vehicleId", c.getVehicle().getId());
        m.put("costCategory", c.getCostCategory());
        m.put("amount", c.getAmount());
        m.put("costDate", c.getCostDate());
        m.put("description", c.getDescription());
        m.put("referenceType", c.getReferenceType());
        m.put("vendorName", c.getVendorName());
        m.put("invoiceNumber", c.getInvoiceNumber());
        m.put("odometerReading", c.getOdometerReading());
        return m;
    }

    private int toInt(Object o) {
        if (o instanceof Number n) return n.intValue();
        return Integer.parseInt(o.toString());
    }
}
