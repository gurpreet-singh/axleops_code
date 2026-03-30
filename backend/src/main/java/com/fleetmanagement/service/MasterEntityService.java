package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.MasterEntity;
import com.fleetmanagement.entity.LedgerGroup;
import com.fleetmanagement.entity.LedgerGroupType;
import com.fleetmanagement.entity.master.*;
import com.fleetmanagement.repository.LedgerGroupRepository;
import com.fleetmanagement.repository.master.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Generic CRUD service for all 15 master entities.
 * Uses a registry pattern to resolve the correct repository and entity class
 * based on the URL slug (e.g. "vehicle-types", "service-types").
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MasterEntityService {

    private final VehicleTypeMasterRepository vehicleTypeRepo;
    private final EquipmentTypeMasterRepository equipmentTypeRepo;
    private final DocumentTypeMasterRepository documentTypeRepo;
    private final ServiceTypeMasterRepository serviceTypeRepo;
    private final PartCategoryMasterRepository partCategoryRepo;
    private final InspectionTemplateMasterRepository inspectionTemplateRepo;
    private final LocationMasterRepository locationRepo;
    private final TollPlazaMasterRepository tollPlazaRepo;
    private final PaymentTermsMasterRepository paymentTermsRepo;
    private final TaxConfigMasterRepository taxConfigRepo;
    private final NumberSeriesMasterRepository numberSeriesRepo;
    private final AlertRuleMasterRepository alertRuleRepo;
    private final ExpenseCategoryMasterRepository expenseCategoryRepo;
    private final FreightChargeTypeMasterRepository freightChargeTypeRepo;
    private final LedgerGroupRepository ledgerGroupRepo;

    // ═══════════════════════════════════════════════════════════════
    // REGISTRY — maps slug → repository
    // ═══════════════════════════════════════════════════════════════

    private MasterEntityRepository<? extends MasterEntity> getRepo(String slug) {
        return switch (slug) {
            case "vehicle-types"       -> vehicleTypeRepo;
            case "equipment-types"     -> equipmentTypeRepo;
            case "document-types"      -> documentTypeRepo;
            case "service-types"       -> serviceTypeRepo;
            case "part-categories"     -> partCategoryRepo;
            case "inspection-templates"-> inspectionTemplateRepo;
            case "locations"           -> locationRepo;
            case "toll-plazas"         -> tollPlazaRepo;
            case "payment-terms"       -> paymentTermsRepo;
            case "tax-config"          -> taxConfigRepo;
            case "number-series"       -> numberSeriesRepo;
            case "alert-rules"         -> alertRuleRepo;
            case "expense-categories"  -> expenseCategoryRepo;
            case "freight-charge-types"-> freightChargeTypeRepo;
            default -> throw new ResourceNotFoundException("Unknown master entity: " + slug);
        };
    }

    private Class<? extends MasterEntity> getEntityClass(String slug) {
        return switch (slug) {
            case "vehicle-types"       -> VehicleTypeMaster.class;
            case "equipment-types"     -> EquipmentTypeMaster.class;
            case "document-types"      -> DocumentTypeMaster.class;
            case "service-types"       -> ServiceTypeMaster.class;
            case "part-categories"     -> PartCategoryMaster.class;
            case "inspection-templates"-> InspectionTemplateMaster.class;
            case "locations"           -> LocationMaster.class;
            case "toll-plazas"         -> TollPlazaMaster.class;
            case "payment-terms"       -> PaymentTermsMaster.class;
            case "tax-config"          -> TaxConfigMaster.class;
            case "number-series"       -> NumberSeriesMaster.class;
            case "alert-rules"         -> AlertRuleMaster.class;
            case "expense-categories"  -> ExpenseCategoryMaster.class;
            case "freight-charge-types"-> FreightChargeTypeMaster.class;
            default -> throw new ResourceNotFoundException("Unknown master entity: " + slug);
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // CRUD OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /** List all records for entity (optionally filtered by active status) */
    public List<Map<String, Object>> list(String slug, String search, Boolean activeOnly) {
        UUID tenantId = TenantContext.get();

        // Special handling for ledger-groups (uses existing entity)
        if ("ledger-groups".equals(slug)) {
            return listLedgerGroups(tenantId, search);
        }

        MasterEntityRepository<? extends MasterEntity> repo = getRepo(slug);
        List<? extends MasterEntity> entities;

        if (activeOnly != null && activeOnly) {
            entities = repo.findByTenantIdAndActiveOrderBySortOrderAscNameAsc(tenantId, true);
        } else {
            entities = repo.findByTenantIdOrderBySortOrderAscNameAsc(tenantId);
        }

        // Apply search filter
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            entities = entities.stream()
                .filter(e -> e.getName().toLowerCase().contains(q) ||
                             (e.getCode() != null && e.getCode().toLowerCase().contains(q)))
                .collect(Collectors.toList());
        }

        return entities.stream().map(this::toMap).collect(Collectors.toList());
    }

    /** Get one record by ID */
    public Map<String, Object> getById(String slug, UUID id) {
        UUID tenantId = TenantContext.get();

        if ("ledger-groups".equals(slug)) {
            LedgerGroup g = ledgerGroupRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", id));
            return ledgerGroupToMap(g);
        }

        MasterEntityRepository<? extends MasterEntity> repo = getRepo(slug);
        MasterEntity entity = repo.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException(slug, id));
        return toMap(entity);
    }

    /** Dropdown list — minimal id+name for select fields */
    public List<Map<String, Object>> dropdown(String slug) {
        UUID tenantId = TenantContext.get();

        if ("ledger-groups".equals(slug)) {
            return ledgerGroupRepo.findByTenantId(tenantId).stream()
                .map(g -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", g.getId());
                    m.put("name", g.getName());
                    return m;
                }).collect(Collectors.toList());
        }

        MasterEntityRepository<? extends MasterEntity> repo = getRepo(slug);
        return repo.findByTenantIdAndActiveOrderBySortOrderAscNameAsc(tenantId, true).stream()
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", e.getId());
                m.put("name", e.getName());
                m.put("code", e.getCode());
                return m;
            }).collect(Collectors.toList());
    }

    /** Create a new master record */
    @Transactional
    public Map<String, Object> create(String slug, Map<String, Object> data) {
        UUID tenantId = TenantContext.get();

        if ("ledger-groups".equals(slug)) {
            return createLedgerGroup(tenantId, data);
        }

        @SuppressWarnings("unchecked")
        MasterEntityRepository<MasterEntity> repo = (MasterEntityRepository<MasterEntity>) getRepo(slug);

        // Validate uniqueness of code within tenant
        String code = (String) data.get("code");
        if (code != null && !code.isBlank()) {
            repo.findByCodeAndTenantId(code, tenantId)
                .ifPresent(e -> {
                    throw new IllegalArgumentException(
                            "A record with code '" + code + "' already exists");
                });
        }

        // Validate uniqueness of name within tenant
        String name = (String) data.get("name");
        if (name != null && !name.isBlank()) {
            repo.findByNameIgnoreCaseAndTenantId(name, tenantId)
                .ifPresent(e -> {
                    throw new IllegalArgumentException(
                            "A record with name '" + name + "' already exists");
                });
        }

        Class<? extends MasterEntity> clazz = getEntityClass(slug);
        MasterEntity entity;
        try {
            entity = clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException("Failed to instantiate " + clazz.getSimpleName(), e);
        }

        entity.setTenantId(tenantId);
        mapFieldsToEntity(entity, data, slug);

        MasterEntity saved = repo.save(entity);
        return toMap(saved);
    }

    /** Update an existing master record */
    @Transactional
    public Map<String, Object> update(String slug, UUID id, Map<String, Object> data) {
        UUID tenantId = TenantContext.get();

        if ("ledger-groups".equals(slug)) {
            return updateLedgerGroup(tenantId, id, data);
        }

        @SuppressWarnings("unchecked")
        MasterEntityRepository<MasterEntity> repo = (MasterEntityRepository<MasterEntity>) getRepo(slug);
        MasterEntity entity = repo.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException(slug, id));

        // Validate uniqueness of code if changing
        String code = (String) data.get("code");
        if (code != null && !code.equalsIgnoreCase(entity.getCode())) {
            repo.findByCodeAndTenantId(code, tenantId)
                .ifPresent(e -> {
                    throw new IllegalArgumentException(
                            "A record with code '" + code + "' already exists");
                });
        }

        // Validate uniqueness of name if changing
        String name = (String) data.get("name");
        if (name != null && !name.equalsIgnoreCase(entity.getName())) {
            repo.findByNameIgnoreCaseAndTenantId(name, tenantId)
                .ifPresent(e -> {
                    throw new IllegalArgumentException(
                            "A record with name '" + name + "' already exists");
                });
        }

        mapFieldsToEntity(entity, data, slug);
        MasterEntity saved = repo.save(entity);
        return toMap(saved);
    }

    /** Soft-delete (deactivate) */
    @Transactional
    public void deactivate(String slug, UUID id) {
        UUID tenantId = TenantContext.get();

        if ("ledger-groups".equals(slug)) {
            // Ledger groups don't have active field yet — just return
            return;
        }

        @SuppressWarnings("unchecked")
        MasterEntityRepository<MasterEntity> repo = (MasterEntityRepository<MasterEntity>) getRepo(slug);
        MasterEntity entity = repo.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException(slug, id));

        entity.setActive(false);
        repo.save(entity);
    }

    /** Reactivate */
    @Transactional
    public void activate(String slug, UUID id) {
        UUID tenantId = TenantContext.get();

        @SuppressWarnings("unchecked")
        MasterEntityRepository<MasterEntity> repo = (MasterEntityRepository<MasterEntity>) getRepo(slug);
        MasterEntity entity = repo.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException(slug, id));

        entity.setActive(true);
        repo.save(entity);
    }

    /** Schema endpoint — returns field definitions for the frontend dynamic form */
    public Map<String, Object> getSchema(String slug) {
        return MasterSchemaDefinitions.getSchema(slug);
    }

    // ═══════════════════════════════════════════════════════════════
    // FIELD MAPPING — converts Map<String,Object> → entity fields
    // ═══════════════════════════════════════════════════════════════

    private void mapFieldsToEntity(MasterEntity entity, Map<String, Object> data, String slug) {
        // Common fields
        if (data.containsKey("name")) entity.setName((String) data.get("name"));
        if (data.containsKey("code")) entity.setCode((String) data.get("code"));
        if (data.containsKey("description")) entity.setDescription((String) data.get("description"));
        if (data.containsKey("sortOrder")) entity.setSortOrder(toInt(data.get("sortOrder"), 0));
        if (data.containsKey("active")) entity.setActive(toBool(data.get("active"), true));

        // Entity-specific fields
        switch (slug) {
            case "vehicle-types" -> mapVehicleType((VehicleTypeMaster) entity, data);
            case "equipment-types" -> mapEquipmentType((EquipmentTypeMaster) entity, data);
            case "document-types" -> mapDocumentType((DocumentTypeMaster) entity, data);
            case "service-types" -> mapServiceType((ServiceTypeMaster) entity, data);
            case "part-categories" -> mapPartCategory((PartCategoryMaster) entity, data);
            case "inspection-templates" -> mapInspectionTemplate((InspectionTemplateMaster) entity, data);
            case "locations" -> mapLocation((LocationMaster) entity, data);
            case "toll-plazas" -> mapTollPlaza((TollPlazaMaster) entity, data);
            case "payment-terms" -> mapPaymentTerms((PaymentTermsMaster) entity, data);
            case "tax-config" -> mapTaxConfig((TaxConfigMaster) entity, data);
            case "number-series" -> mapNumberSeries((NumberSeriesMaster) entity, data);
            case "alert-rules" -> mapAlertRule((AlertRuleMaster) entity, data);
            case "expense-categories" -> mapExpenseCategory((ExpenseCategoryMaster) entity, data);
            case "freight-charge-types" -> mapFreightChargeType((FreightChargeTypeMaster) entity, data);
        }
    }

    private void mapVehicleType(VehicleTypeMaster e, Map<String, Object> d) {
        if (d.containsKey("category")) e.setCategory(VehicleCategory.valueOf((String) d.get("category")));
        if (d.containsKey("numWheels")) e.setNumWheels(toIntOrNull(d.get("numWheels")));
        if (d.containsKey("numAxles")) e.setNumAxles(toIntOrNull(d.get("numAxles")));
        if (d.containsKey("capacityTons")) e.setCapacityTons(toBigDecimal(d.get("capacityTons")));
        if (d.containsKey("capacityVolumeCft")) e.setCapacityVolumeCft(toBigDecimal(d.get("capacityVolumeCft")));
        if (d.containsKey("fuelTankCapacityLtrs")) e.setFuelTankCapacityLtrs(toBigDecimal(d.get("fuelTankCapacityLtrs")));
        if (d.containsKey("expectedMileageKmpl")) e.setExpectedMileageKmpl(toBigDecimal(d.get("expectedMileageKmpl")));
        if (d.containsKey("tareWeightKg")) e.setTareWeightKg(toBigDecimal(d.get("tareWeightKg")));
        if (d.containsKey("lengthFt")) e.setLengthFt(toBigDecimal(d.get("lengthFt")));
    }

    private void mapEquipmentType(EquipmentTypeMaster e, Map<String, Object> d) {
        if (d.containsKey("category")) e.setCategory(EquipmentCategory.valueOf((String) d.get("category")));
        if (d.containsKey("serialized")) e.setSerialized(toBool(d.get("serialized"), false));
        if (d.containsKey("expectedLifeMonths")) e.setExpectedLifeMonths(toIntOrNull(d.get("expectedLifeMonths")));
        if (d.containsKey("unitCost")) e.setUnitCost(toBigDecimal(d.get("unitCost")));
    }

    private void mapDocumentType(DocumentTypeMaster e, Map<String, Object> d) {
        if (d.containsKey("appliesTo")) e.setAppliesTo(DocumentAppliesTo.valueOf((String) d.get("appliesTo")));
        if (d.containsKey("mandatory")) e.setMandatory(toBool(d.get("mandatory"), false));
        if (d.containsKey("hasExpiry")) e.setHasExpiry(toBool(d.get("hasExpiry"), true));
        if (d.containsKey("remindDaysBefore")) e.setRemindDaysBefore(toIntOrNull(d.get("remindDaysBefore")));
        if (d.containsKey("escalationDaysBefore")) e.setEscalationDaysBefore(toIntOrNull(d.get("escalationDaysBefore")));
        if (d.containsKey("blockOnExpiry")) e.setBlockOnExpiry(toBool(d.get("blockOnExpiry"), false));
    }

    private void mapServiceType(ServiceTypeMaster e, Map<String, Object> d) {
        if (d.containsKey("category")) e.setCategory(ServiceCategory.valueOf((String) d.get("category")));
        if (d.containsKey("scheduled")) e.setScheduled(toBool(d.get("scheduled"), false));
        if (d.containsKey("defaultIntervalKm")) e.setDefaultIntervalKm(toIntOrNull(d.get("defaultIntervalKm")));
        if (d.containsKey("defaultIntervalDays")) e.setDefaultIntervalDays(toIntOrNull(d.get("defaultIntervalDays")));
        if (d.containsKey("estimatedDurationHours")) e.setEstimatedDurationHours(toBigDecimal(d.get("estimatedDurationHours")));
        if (d.containsKey("estimatedCost")) e.setEstimatedCost(toBigDecimal(d.get("estimatedCost")));
        if (d.containsKey("requiresParts")) e.setRequiresParts(toBoolOrNull(d.get("requiresParts")));
    }

    private void mapPartCategory(PartCategoryMaster e, Map<String, Object> d) {
        if (d.containsKey("parentId")) e.setParentId(toUUID(d.get("parentId")));
        if (d.containsKey("icon")) e.setIcon((String) d.get("icon"));
    }

    private void mapInspectionTemplate(InspectionTemplateMaster e, Map<String, Object> d) {
        if (d.containsKey("inspectionFor")) e.setInspectionFor(InspectionFor.valueOf((String) d.get("inspectionFor")));
        if (d.containsKey("triggerType")) e.setTriggerType(InspectionTrigger.valueOf((String) d.get("triggerType")));
        if (d.containsKey("mandatory")) e.setMandatory(toBool(d.get("mandatory"), false));
        if (d.containsKey("estimatedMinutes")) e.setEstimatedMinutes(toIntOrNull(d.get("estimatedMinutes")));
    }

    private void mapLocation(LocationMaster e, Map<String, Object> d) {
        if (d.containsKey("locationType")) e.setLocationType(LocationType.valueOf((String) d.get("locationType")));
        if (d.containsKey("parentId")) e.setParentId(toUUID(d.get("parentId")));
        if (d.containsKey("state")) e.setState((String) d.get("state"));
        if (d.containsKey("stateCode")) e.setStateCode((String) d.get("stateCode"));
        if (d.containsKey("pinCode")) e.setPinCode((String) d.get("pinCode"));
        if (d.containsKey("latitude")) e.setLatitude(toBigDecimal(d.get("latitude")));
        if (d.containsKey("longitude")) e.setLongitude(toBigDecimal(d.get("longitude")));
        if (d.containsKey("address")) e.setAddress((String) d.get("address"));
        if (d.containsKey("contactName")) e.setContactName((String) d.get("contactName"));
        if (d.containsKey("contactPhone")) e.setContactPhone((String) d.get("contactPhone"));
    }

    private void mapTollPlaza(TollPlazaMaster e, Map<String, Object> d) {
        if (d.containsKey("locationId")) e.setLocationId(toUUID(d.get("locationId")));
        if (d.containsKey("highway")) e.setHighway((String) d.get("highway"));
        if (d.containsKey("latitude")) e.setLatitude(toBigDecimal(d.get("latitude")));
        if (d.containsKey("longitude")) e.setLongitude(toBigDecimal(d.get("longitude")));
    }

    private void mapPaymentTerms(PaymentTermsMaster e, Map<String, Object> d) {
        if (d.containsKey("days")) e.setDays(toInt(d.get("days"), 0));
        if (d.containsKey("fromEvent")) e.setFromEvent(PaymentFromEvent.valueOf((String) d.get("fromEvent")));
        if (d.containsKey("tallyTermName")) e.setTallyTermName((String) d.get("tallyTermName"));
    }

    private void mapTaxConfig(TaxConfigMaster e, Map<String, Object> d) {
        if (d.containsKey("taxType")) e.setTaxType(TaxType.valueOf((String) d.get("taxType")));
        if (d.containsKey("ratePercentage")) e.setRatePercentage(toBigDecimal(d.get("ratePercentage")));
        if (d.containsKey("hsnSacCode")) e.setHsnSacCode((String) d.get("hsnSacCode"));
        if (d.containsKey("igstApplicable")) e.setIgstApplicable(toBoolOrNull(d.get("igstApplicable")));
        if (d.containsKey("cgstRate")) e.setCgstRate(toBigDecimal(d.get("cgstRate")));
        if (d.containsKey("sgstRate")) e.setSgstRate(toBigDecimal(d.get("sgstRate")));
        if (d.containsKey("effectiveFrom")) e.setEffectiveFrom(toLocalDate(d.get("effectiveFrom")));
        if (d.containsKey("defaultConfig")) e.setDefaultConfig(toBool(d.get("defaultConfig"), false));
    }

    private void mapNumberSeries(NumberSeriesMaster e, Map<String, Object> d) {
        if (d.containsKey("entityType")) e.setEntityType(NumberSeriesEntityType.valueOf((String) d.get("entityType")));
        if (d.containsKey("prefix")) e.setPrefix((String) d.get("prefix"));
        if (d.containsKey("suffix")) e.setSuffix((String) d.get("suffix"));
        if (d.containsKey("includeFy")) e.setIncludeFy(toBool(d.get("includeFy"), true));
        if (d.containsKey("fySeparator")) e.setFySeparator((String) d.get("fySeparator"));
        if (d.containsKey("paddingLength")) e.setPaddingLength(toInt(d.get("paddingLength"), 5));
        if (d.containsKey("currentValue")) e.setCurrentValue(toLong(d.get("currentValue"), 0));
        if (d.containsKey("resetOnFy")) e.setResetOnFy(toBool(d.get("resetOnFy"), true));
        if (d.containsKey("fiscalYearStartMonth")) e.setFiscalYearStartMonth(toIntOrNull(d.get("fiscalYearStartMonth")));
    }

    private void mapAlertRule(AlertRuleMaster e, Map<String, Object> d) {
        if (d.containsKey("alertType")) e.setAlertType(AlertType.valueOf((String) d.get("alertType")));
        if (d.containsKey("conditionOperator")) e.setConditionOperator(ConditionOperator.valueOf((String) d.get("conditionOperator")));
        if (d.containsKey("thresholdValue")) e.setThresholdValue(toBigDecimal(d.get("thresholdValue")));
        if (d.containsKey("severity")) e.setSeverity(AlertSeverity.valueOf((String) d.get("severity")));
        if (d.containsKey("notifyRoles")) e.setNotifyRoles(d.get("notifyRoles") != null ? d.get("notifyRoles").toString() : null);
        if (d.containsKey("notifyWhatsapp")) e.setNotifyWhatsapp(toBool(d.get("notifyWhatsapp"), false));
        if (d.containsKey("enabled")) e.setEnabled(toBool(d.get("enabled"), true));
        if (d.containsKey("cooldownHours")) e.setCooldownHours(toIntOrNull(d.get("cooldownHours")));
    }

    private void mapExpenseCategory(ExpenseCategoryMaster e, Map<String, Object> d) {
        if (d.containsKey("expenseContext")) e.setExpenseContext(ExpenseContext.valueOf((String) d.get("expenseContext")));
        if (d.containsKey("defaultLedgerAccountId")) e.setDefaultLedgerAccountId(toUUID(d.get("defaultLedgerAccountId")));
        if (d.containsKey("receiptMandatory")) e.setReceiptMandatory(toBool(d.get("receiptMandatory"), false));
        if (d.containsKey("maxAmountWithoutApproval")) e.setMaxAmountWithoutApproval(toBigDecimal(d.get("maxAmountWithoutApproval")));
        if (d.containsKey("icon")) e.setIcon((String) d.get("icon"));
    }

    private void mapFreightChargeType(FreightChargeTypeMaster e, Map<String, Object> d) {
        if (d.containsKey("chargeBasis")) e.setChargeBasis(ChargeBasis.valueOf((String) d.get("chargeBasis")));
        if (d.containsKey("defaultRate")) e.setDefaultRate(toBigDecimal(d.get("defaultRate")));
        if (d.containsKey("taxable")) e.setTaxable(toBool(d.get("taxable"), true));
        if (d.containsKey("defaultOnInvoice")) e.setDefaultOnInvoice(toBool(d.get("defaultOnInvoice"), false));
        if (d.containsKey("ledgerAccountId")) e.setLedgerAccountId(toUUID(d.get("ledgerAccountId")));
    }

    // ═══════════════════════════════════════════════════════════════
    // LEDGER GROUP SPECIAL HANDLING
    // ═══════════════════════════════════════════════════════════════

    private List<Map<String, Object>> listLedgerGroups(UUID tenantId, String search) {
        List<LedgerGroup> groups = ledgerGroupRepo.findByTenantId(tenantId);
        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            groups = groups.stream()
                .filter(g -> g.getName().toLowerCase().contains(q) ||
                    (g.getTallyGroupName() != null && g.getTallyGroupName().toLowerCase().contains(q)))
                .collect(Collectors.toList());
        }
        return groups.stream().map(this::ledgerGroupToMap).collect(Collectors.toList());
    }

    private Map<String, Object> ledgerGroupToMap(LedgerGroup g) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", g.getId());
        m.put("name", g.getName());
        m.put("code", null);
        m.put("description", null);
        m.put("active", true);
        m.put("sortOrder", 0);
        m.put("nature", g.getNature() != null ? g.getNature().name() : null);
        m.put("groupType", g.getGroupType() != null ? g.getGroupType().name() : null);
        m.put("parentGroupId", g.getParentGroup() != null ? g.getParentGroup().getId() : null);
        m.put("tallyGroupName", g.getTallyGroupName());
        m.put("createdAt", g.getCreatedAt());
        m.put("updatedAt", g.getUpdatedAt());
        return m;
    }

    private Map<String, Object> createLedgerGroup(UUID tenantId, Map<String, Object> data) {
        LedgerGroup g = new LedgerGroup();
        g.setTenantId(tenantId);
        g.setName((String) data.get("name"));
        if (data.containsKey("nature") && data.get("nature") != null) {
            g.setNature(LedgerGroup.GroupNature.valueOf((String) data.get("nature")));
        }
        if (data.containsKey("groupType") && data.get("groupType") != null) {
            g.setGroupType(LedgerGroupType.valueOf((String) data.get("groupType")));
        }
        g.setTallyGroupName((String) data.get("tallyGroupName"));
        String parentId = data.get("parentGroupId") != null ? data.get("parentGroupId").toString() : null;
        if (parentId != null && !parentId.isEmpty()) {
            LedgerGroup parent = ledgerGroupRepo.findByIdAndTenantId(UUID.fromString(parentId), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent LedgerGroup", parentId));
            g.setParentGroup(parent);
        }
        LedgerGroup saved = ledgerGroupRepo.save(g);
        return ledgerGroupToMap(saved);
    }

    private Map<String, Object> updateLedgerGroup(UUID tenantId, UUID id, Map<String, Object> data) {
        LedgerGroup g = ledgerGroupRepo.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("LedgerGroup", id));
        g.setName((String) data.get("name"));
        if (data.containsKey("nature") && data.get("nature") != null) {
            g.setNature(LedgerGroup.GroupNature.valueOf((String) data.get("nature")));
        }
        if (data.containsKey("groupType") && data.get("groupType") != null) {
            g.setGroupType(LedgerGroupType.valueOf((String) data.get("groupType")));
        } else {
            g.setGroupType(null);
        }
        g.setTallyGroupName((String) data.get("tallyGroupName"));
        String parentId = data.get("parentGroupId") != null ? data.get("parentGroupId").toString() : null;
        if (parentId != null && !parentId.isEmpty()) {
            LedgerGroup parent = ledgerGroupRepo.findByIdAndTenantId(UUID.fromString(parentId), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent LedgerGroup", parentId));
            g.setParentGroup(parent);
        } else {
            g.setParentGroup(null);
        }
        LedgerGroup saved = ledgerGroupRepo.save(g);
        return ledgerGroupToMap(saved);
    }

    // ═══════════════════════════════════════════════════════════════
    // ENTITY → MAP CONVERSION (reflection-based for generic handling)
    // ═══════════════════════════════════════════════════════════════

    private Map<String, Object> toMap(MasterEntity entity) {
        Map<String, Object> map = new LinkedHashMap<>();
        // Common fields
        map.put("id", entity.getId());
        map.put("tenantId", entity.getTenantId());
        map.put("name", entity.getName());
        map.put("code", entity.getCode());
        map.put("description", entity.getDescription());
        map.put("active", entity.isActive());
        map.put("sortOrder", entity.getSortOrder());
        map.put("createdAt", entity.getCreatedAt());
        map.put("updatedAt", entity.getUpdatedAt());

        // Entity-specific fields via reflection on the concrete class
        Class<?> clazz = entity.getClass();
        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            String name = field.getName();
            // Skip JPA internal fields
            if (name.startsWith("$$") || name.equals("serialVersionUID")) continue;
            // Skip collection fields (handled separately)
            if (java.util.Collection.class.isAssignableFrom(field.getType())) continue;
            try {
                Object value = field.get(entity);
                if (value instanceof Enum<?>) {
                    map.put(name, ((Enum<?>) value).name());
                } else {
                    map.put(name, value);
                }
            } catch (IllegalAccessException ignored) {}
        }

        return map;
    }

    // ═══════════════════════════════════════════════════════════════
    // TYPE CONVERSION HELPERS
    // ═══════════════════════════════════════════════════════════════

    private int toInt(Object val, int defaultVal) {
        if (val == null) return defaultVal;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return defaultVal; }
    }

    private long toLong(Object val, long defaultVal) {
        if (val == null) return defaultVal;
        if (val instanceof Number) return ((Number) val).longValue();
        try { return Long.parseLong(val.toString()); } catch (Exception e) { return defaultVal; }
    }

    private Integer toIntOrNull(Object val) {
        if (val == null || val.toString().isEmpty()) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        try { return Integer.parseInt(val.toString()); } catch (Exception e) { return null; }
    }

    private boolean toBool(Object val, boolean defaultVal) {
        if (val == null) return defaultVal;
        if (val instanceof Boolean) return (Boolean) val;
        return Boolean.parseBoolean(val.toString());
    }

    private Boolean toBoolOrNull(Object val) {
        if (val == null) return null;
        if (val instanceof Boolean) return (Boolean) val;
        return Boolean.parseBoolean(val.toString());
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null || val.toString().isEmpty()) return null;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        try { return new BigDecimal(val.toString()); } catch (Exception e) { return null; }
    }

    private UUID toUUID(Object val) {
        if (val == null || val.toString().isEmpty()) return null;
        if (val instanceof UUID) return (UUID) val;
        try { return UUID.fromString(val.toString()); } catch (Exception e) { return null; }
    }

    private LocalDate toLocalDate(Object val) {
        if (val == null || val.toString().isEmpty()) return null;
        if (val instanceof LocalDate) return (LocalDate) val;
        try { return LocalDate.parse(val.toString()); } catch (Exception e) { return null; }
    }
}
