package com.fleetmanagement.service;

import com.fleetmanagement.entity.master.*;
import com.fleetmanagement.entity.LedgerGroup;
import com.fleetmanagement.entity.LedgerGroupType;

import java.util.*;

/**
 * Schema definitions for all 15 master entities.
 * Returns field metadata that the frontend uses to dynamically render
 * list columns, create/edit forms, validations, and dropdown options.
 */
public class MasterSchemaDefinitions {

    public static Map<String, Object> getSchema(String slug) {
        return switch (slug) {
            case "vehicle-types" -> vehicleTypes();
            case "equipment-types" -> equipmentTypes();
            case "document-types" -> documentTypes();
            case "service-types" -> serviceTypes();
            case "part-categories" -> partCategories();
            case "inspection-templates" -> inspectionTemplates();
            case "locations" -> locations();
            case "toll-plazas" -> tollPlazas();
            case "payment-terms" -> paymentTerms();
            case "tax-config" -> taxConfig();
            case "number-series" -> numberSeries();
            case "alert-rules" -> alertRules();
            case "expense-categories" -> expenseCategories();
            case "ledger-groups" -> ledgerGroups();
            case "freight-charge-types" -> freightChargeTypes();
            default -> throw new IllegalArgumentException("Unknown entity: " + slug);
        };
    }

    public static List<Map<String, Object>> getAllEntities() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("slug", "vehicle-types", "name", "Vehicle Types", "icon", "fas fa-truck", "description", "Categories of vehicles in the fleet"));
        list.add(Map.of("slug", "equipment-types", "name", "Equipment Types", "icon", "fas fa-cogs", "description", "Non-vehicle assets: GPS, dashcam, tools"));
        list.add(Map.of("slug", "document-types", "name", "Document Types", "icon", "fas fa-file-alt", "description", "Compliance documents for vehicles & drivers"));
        list.add(Map.of("slug", "service-types", "name", "Service Types", "icon", "fas fa-wrench", "description", "Maintenance and repair activity types"));
        list.add(Map.of("slug", "part-categories", "name", "Part Categories", "icon", "fas fa-puzzle-piece", "description", "Spare parts and consumables hierarchy"));
        list.add(Map.of("slug", "inspection-templates", "name", "Inspection Templates", "icon", "fas fa-clipboard-check", "description", "Vehicle and driver inspection checklists"));
        list.add(Map.of("slug", "locations", "name", "Locations", "icon", "fas fa-map-marker-alt", "description", "Cities, plants, warehouses, loading points"));
        list.add(Map.of("slug", "toll-plazas", "name", "Toll Plazas", "icon", "fas fa-road", "description", "Toll booths with vehicle-type rates"));
        list.add(Map.of("slug", "payment-terms", "name", "Payment Terms", "icon", "fas fa-calendar-check", "description", "Invoice payment terms and due dates"));
        list.add(Map.of("slug", "tax-config", "name", "Tax Configuration", "icon", "fas fa-percent", "description", "GST, TDS, TCS rates and HSN/SAC codes"));
        list.add(Map.of("slug", "number-series", "name", "Number Series", "icon", "fas fa-hashtag", "description", "Auto-numbering for invoices, vouchers, LR"));
        list.add(Map.of("slug", "alert-rules", "name", "Alert Rules", "icon", "fas fa-bell", "description", "Threshold-based notification triggers"));
        list.add(Map.of("slug", "expense-categories", "name", "Expense Categories", "icon", "fas fa-receipt", "description", "Trip and operational expense categories"));
        list.add(Map.of("slug", "ledger-groups", "name", "Ledger Groups", "icon", "fas fa-layer-group", "description", "Chart of accounts group hierarchy"));
        list.add(Map.of("slug", "freight-charge-types", "name", "Freight Charge Types", "icon", "fas fa-file-invoice-dollar", "description", "Invoice line item charge types"));
        return list;
    }

    // ═══════════════════════════════════════════════════════════════
    // INDIVIDUAL SCHEMAS
    // ═══════════════════════════════════════════════════════════════

    private static Map<String, Object> vehicleTypes() {
        return Map.of(
            "entityName", "Vehicle Types", "slug", "vehicle-types",
            "listColumns", List.of("name", "code", "category", "capacityTons", "numAxles", "fuelTankCapacityLtrs"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", true),
                field("category", "Category", "select", true, enumValues(VehicleCategory.class)),
                field("numWheels", "Wheels", "number", false),
                field("numAxles", "Axles", "number", false),
                field("capacityTons", "Capacity (tons)", "number", false),
                field("capacityVolumeCft", "Volume (cft)", "number", false),
                field("fuelTankCapacityLtrs", "Tank Capacity (L)", "number", false),
                field("expectedMileageKmpl", "Expected KMPL", "number", false),
                field("tareWeightKg", "Tare Weight (kg)", "number", false),
                field("lengthFt", "Length (ft)", "number", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> equipmentTypes() {
        return Map.of(
            "entityName", "Equipment Types", "slug", "equipment-types",
            "listColumns", List.of("name", "code", "category", "serialized", "expectedLifeMonths"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", false),
                field("category", "Category", "select", true, enumValues(EquipmentCategory.class)),
                field("serialized", "Serialized (unique serial no.)", "checkbox", true),
                field("expectedLifeMonths", "Expected Life (months)", "number", false),
                field("unitCost", "Unit Cost (₹)", "number", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> documentTypes() {
        return Map.of(
            "entityName", "Document Types", "slug", "document-types",
            "listColumns", List.of("name", "code", "appliesTo", "mandatory", "hasExpiry", "blockOnExpiry"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", true),
                field("appliesTo", "Applies To", "select", true, enumValues(DocumentAppliesTo.class)),
                field("mandatory", "Mandatory", "checkbox", true),
                field("hasExpiry", "Has Expiry Date", "checkbox", true),
                field("remindDaysBefore", "Remind Days Before", "number", false),
                field("escalationDaysBefore", "Escalation Days Before", "number", false),
                field("blockOnExpiry", "Block on Expiry", "checkbox", true),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> serviceTypes() {
        return Map.of(
            "entityName", "Service Types", "slug", "service-types",
            "listColumns", List.of("name", "code", "category", "scheduled", "defaultIntervalKm"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", false),
                field("category", "Category", "select", true, enumValues(ServiceCategory.class)),
                field("scheduled", "Scheduled (preventive)", "checkbox", true),
                field("defaultIntervalKm", "Interval (km)", "number", false),
                field("defaultIntervalDays", "Interval (days)", "number", false),
                field("estimatedDurationHours", "Duration (hours)", "number", false),
                field("estimatedCost", "Estimated Cost (₹)", "number", false),
                field("requiresParts", "Requires Parts", "checkbox", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> partCategories() {
        return Map.of(
            "entityName", "Part Categories", "slug", "part-categories",
            "listColumns", List.of("name", "code", "parentId"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", false),
                field("parentId", "Parent Category", "master-dropdown", false, "part-categories"),
                field("icon", "Icon", "text", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> inspectionTemplates() {
        return Map.of(
            "entityName", "Inspection Templates", "slug", "inspection-templates",
            "listColumns", List.of("name", "code", "inspectionFor", "triggerType", "mandatory"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", false),
                field("inspectionFor", "Inspection For", "select", true, enumValues(InspectionFor.class)),
                field("triggerType", "Trigger", "select", true, enumValues(InspectionTrigger.class)),
                field("mandatory", "Mandatory", "checkbox", true),
                field("estimatedMinutes", "Est. Minutes", "number", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> locations() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Locations");
        schema.put("slug", "locations");
        schema.put("listColumns", List.of("name", "code", "locationType", "state", "pinCode"));
        schema.put("searchableFields", List.of("name", "code", "state"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("locationType", "Type", "select", true, enumValues(LocationType.class)),
            field("parentId", "Parent Location", "master-dropdown", false, "locations"),
            field("state", "State", "text", false),
            field("stateCode", "State Code (GST)", "text", false),
            field("pinCode", "PIN Code", "text", false),
            field("latitude", "Latitude", "number", false),
            field("longitude", "Longitude", "number", false),
            field("address", "Address", "textarea", false),
            field("contactName", "Contact Name", "text", false),
            field("contactPhone", "Contact Phone", "text", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> tollPlazas() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Toll Plazas");
        schema.put("slug", "toll-plazas");
        schema.put("listColumns", List.of("name", "code", "highway", "latitude", "longitude"));
        schema.put("searchableFields", List.of("name", "code", "highway"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("highway", "Highway", "text", false),
            field("locationId", "Location", "master-dropdown", false, "locations"),
            field("latitude", "Latitude", "number", false),
            field("longitude", "Longitude", "number", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> paymentTerms() {
        return Map.of(
            "entityName", "Payment Terms", "slug", "payment-terms",
            "listColumns", List.of("name", "code", "days", "fromEvent"),
            "searchableFields", List.of("name", "code"),
            "defaultSort", "sortOrder",
            "fields", List.of(
                field("name", "Name", "text", true),
                field("code", "Code", "text", false),
                field("days", "Days", "number", true),
                field("fromEvent", "From Event", "select", true, enumValues(PaymentFromEvent.class)),
                field("tallyTermName", "Tally Term Name", "text", false),
                field("description", "Description", "textarea", false)
            )
        );
    }

    private static Map<String, Object> taxConfig() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Tax Configuration");
        schema.put("slug", "tax-config");
        schema.put("listColumns", List.of("name", "code", "taxType", "ratePercentage", "hsnSacCode"));
        schema.put("searchableFields", List.of("name", "code"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("taxType", "Tax Type", "select", true, enumValues(TaxType.class)),
            field("ratePercentage", "Rate (%)", "number", true),
            field("hsnSacCode", "HSN/SAC Code", "text", false),
            field("igstApplicable", "IGST Applicable", "checkbox", false),
            field("cgstRate", "CGST Rate", "number", false),
            field("sgstRate", "SGST Rate", "number", false),
            field("effectiveFrom", "Effective From", "date", false),
            field("defaultConfig", "Default", "checkbox", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> numberSeries() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Number Series");
        schema.put("slug", "number-series");
        schema.put("listColumns", List.of("name", "entityType", "prefix", "paddingLength", "currentValue", "resetOnFy"));
        schema.put("searchableFields", List.of("name"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("entityType", "Entity Type", "select", true, enumValues(NumberSeriesEntityType.class)),
            field("prefix", "Prefix", "text", false),
            field("suffix", "Suffix", "text", false),
            field("includeFy", "Include Financial Year", "checkbox", false),
            field("fySeparator", "FY Separator", "text", false),
            field("paddingLength", "Padding Length", "number", true),
            field("currentValue", "Current Value", "number", true),
            field("resetOnFy", "Reset on FY", "checkbox", true),
            field("fiscalYearStartMonth", "FY Start Month", "number", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> alertRules() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Alert Rules");
        schema.put("slug", "alert-rules");
        schema.put("listColumns", List.of("name", "alertType", "severity", "thresholdValue", "enabled"));
        schema.put("searchableFields", List.of("name"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("alertType", "Alert Type", "select", true, enumValues(AlertType.class)),
            field("conditionOperator", "Condition", "select", true, enumValues(ConditionOperator.class)),
            field("thresholdValue", "Threshold Value", "number", true),
            field("severity", "Severity", "select", true, enumValues(AlertSeverity.class)),
            field("enabled", "Enabled", "checkbox", true),
            field("notifyWhatsapp", "Notify WhatsApp", "checkbox", false),
            field("cooldownHours", "Cooldown (hours)", "number", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> expenseCategories() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Expense Categories");
        schema.put("slug", "expense-categories");
        schema.put("listColumns", List.of("name", "code", "expenseContext", "receiptMandatory"));
        schema.put("searchableFields", List.of("name", "code"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("expenseContext", "Context", "select", true, enumValues(ExpenseContext.class)),
            field("receiptMandatory", "Receipt Mandatory", "checkbox", false),
            field("maxAmountWithoutApproval", "Max Amount w/o Approval (₹)", "number", false),
            field("icon", "Icon", "text", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    private static Map<String, Object> ledgerGroups() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Ledger Groups");
        schema.put("slug", "ledger-groups");
        schema.put("listColumns", List.of("name", "nature", "groupType", "tallyGroupName"));
        schema.put("searchableFields", List.of("name", "tallyGroupName"));
        schema.put("defaultSort", "name");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("nature", "Nature", "select", true, enumValues(LedgerGroup.GroupNature.class)),
            field("groupType", "Group Type", "select", true, enumValues(LedgerGroupType.class)),
            field("parentGroupId", "Parent Group", "master-dropdown", false, "ledger-groups"),
            field("tallyGroupName", "Tally Group Name", "text", false)
        ));
        return schema;
    }

    private static Map<String, Object> freightChargeTypes() {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("entityName", "Freight Charge Types");
        schema.put("slug", "freight-charge-types");
        schema.put("listColumns", List.of("name", "code", "chargeBasis", "taxable", "defaultOnInvoice"));
        schema.put("searchableFields", List.of("name", "code"));
        schema.put("defaultSort", "sortOrder");
        schema.put("fields", List.of(
            field("name", "Name", "text", true),
            field("code", "Code", "text", false),
            field("chargeBasis", "Charge Basis", "select", true, enumValues(ChargeBasis.class)),
            field("defaultRate", "Default Rate (₹)", "number", false),
            field("taxable", "Taxable", "checkbox", true),
            field("defaultOnInvoice", "Default on Invoice", "checkbox", false),
            field("description", "Description", "textarea", false)
        ));
        return schema;
    }

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    private static Map<String, Object> field(String key, String label, String type, boolean required) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("key", key);
        f.put("label", label);
        f.put("type", type);
        f.put("required", required);
        return f;
    }

    private static Map<String, Object> field(String key, String label, String type, boolean required, Object options) {
        Map<String, Object> f = field(key, label, type, required);
        if (options instanceof List) {
            f.put("options", options);
        } else if (options instanceof String) {
            f.put("dropdownSource", options);
        }
        return f;
    }

    private static List<String> enumValues(Class<? extends Enum<?>> enumClass) {
        return Arrays.stream(enumClass.getEnumConstants())
            .map(Enum::name)
            .collect(java.util.stream.Collectors.toList());
    }
}
