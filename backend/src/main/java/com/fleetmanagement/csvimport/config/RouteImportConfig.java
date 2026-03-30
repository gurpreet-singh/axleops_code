package com.fleetmanagement.csvimport.config;

import com.fleetmanagement.csvimport.model.ImportDataType;
import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import com.fleetmanagement.entity.Route;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class RouteImportConfig {

    private final ImportEntityConfigRegistry registry;

    public RouteImportConfig(ImportEntityConfigRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    void register() {
        registry.register(ImportEntityConfig.builder()
                .entityName("ROUTE")
                .displayName("Routes")
                .description("Import route details — names, origin/destination, distances, tolls, SLAs, charge templates, and linked ledger accounts.")
                .icon("fas fa-route")
                .entityClass(Route.class)
                .fields(List.of(

                        // ── 1. Identity ──────────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("name").displayName("Route Name").dataType(ImportDataType.STRING)
                                .required(true).maxLength(100).uniqueInDatabase(true).uniqueInFile(true)
                                .aliases(List.of("Route", "Route Title", "Route Name", "Name"))
                                .exampleValue("Delhi-Mumbai Express").exampleValue2("Chennai-Bangalore Via NH48")
                                .helpText("A unique, descriptive name for the route. This is the primary identifier.")
                                .build(),

                        // ── 2. Ledger Account (FK) ───────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("ledgerAccount").displayName("Ledger Account").dataType(ImportDataType.STRING)
                                .foreignKeyEntity("LedgerAccount").foreignKeyLookupField("accountHead")
                                .aliases(List.of("Ledger Account", "Account", "Account Name", "Client", "Party", "Customer"))
                                .exampleValue("Reliance Industries").exampleValue2("Tata Steel")
                                .helpText("Name of the ledger account (client/party) this route is linked to. Must already exist in the system.")
                                .build(),

                        // ── 3. Geography ─────────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("origin").displayName("Origin City").dataType(ImportDataType.STRING)
                                .aliases(List.of("From", "From City", "Source City", "Start City", "Origin"))
                                .exampleValue("Delhi").exampleValue2("Chennai")
                                .helpText("Starting city or location for this route.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("originPin").displayName("Origin Pincode").dataType(ImportDataType.STRING)
                                .maxLength(10)
                                .aliases(List.of("From PIN", "Origin PIN", "Source PIN", "From Pincode"))
                                .exampleValue("110001").exampleValue2("600001")
                                .helpText("Pincode of the origin location.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("destination").displayName("Destination City").dataType(ImportDataType.STRING)
                                .aliases(List.of("To", "To City", "Destination", "Dest City", "End City"))
                                .exampleValue("Mumbai").exampleValue2("Bangalore")
                                .helpText("Ending city or location for this route.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("destPin").displayName("Destination Pincode").dataType(ImportDataType.STRING)
                                .maxLength(10)
                                .aliases(List.of("To PIN", "Dest PIN", "Destination PIN", "To Pincode"))
                                .exampleValue("400001").exampleValue2("560001")
                                .helpText("Pincode of the destination location.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("via").displayName("Via Route").dataType(ImportDataType.STRING)
                                .aliases(List.of("Via", "Via Route", "Through", "Highway"))
                                .exampleValue("Pune").exampleValue2("NH48 → NH44")
                                .helpText("Intermediate points or highway numbers along the route.")
                                .build(),

                        // ── 4. Distance & Time ───────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("distanceKm").displayName("Distance (KM)").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Distance KM", "KM", "Kilometres", "Distance"))
                                .exampleValue("1400").exampleValue2("350")
                                .helpText("Total route distance in kilometres.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("estimatedHours").displayName("Estimated Hours").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Est Hours", "Travel Time", "Duration", "Hours"))
                                .exampleValue("24").exampleValue2("6")
                                .helpText("Estimated travel time in hours for this route.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("tollCost").displayName("Toll Cost (₹)").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Toll Amount", "Toll Charges", "Toll", "Toll Cost"))
                                .exampleValue("3500").exampleValue2("800")
                                .helpText("Estimated toll cost in rupees for a one-way trip.")
                                .build(),

                        // ── 5. Contract & SLA ────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("slaHours").displayName("SLA Hours").dataType(ImportDataType.INTEGER)
                                .minValue(0.0)
                                .aliases(List.of("SLA", "SLA Hrs", "SLA Hours", "Service Level Agreement"))
                                .exampleValue("26").exampleValue2("8")
                                .helpText("Maximum hours allowed for delivery under the service level agreement.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("billingType").displayName("Billing Type").dataType(ImportDataType.STRING)
                                .aliases(List.of("Billing Type", "Rate Type", "Charge Type"))
                                .exampleValue("Per Trip").exampleValue2("Per KM")
                                .helpText("How the client is billed: Per Trip, Per KM, Per MT, or Fixed.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("paymentTerms").displayName("Payment Terms").dataType(ImportDataType.STRING)
                                .aliases(List.of("Payment Terms", "Pay Terms", "Credit Period"))
                                .exampleValue("30 days").exampleValue2("Advance")
                                .helpText("Agreed payment terms for this route (e.g. 30 days, COD, Advance).")
                                .build(),

                        // ── 6. Workflow ───────────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("template").displayName("Workflow Template").dataType(ImportDataType.STRING)
                                .aliases(List.of("Template", "Workflow", "Workflow Template"))
                                .exampleValue("Standard").exampleValue2("Express")
                                .defaultValue("Standard")
                                .helpText("Trip workflow template: Standard, Express, Heavy Cargo, or Hazmat.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("status").displayName("Status").dataType(ImportDataType.STRING)
                                .aliases(List.of("Status", "Route Status"))
                                .exampleValue("ACTIVE").exampleValue2("DRAFT")
                                .defaultValue("ACTIVE")
                                .helpText("Route status: ACTIVE, DRAFT, or AD_HOC. Defaults to ACTIVE if not provided.")
                                .build(),

                        // ── 7. Document & PDF Config ─────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("documentSeries").displayName("Document Series").dataType(ImportDataType.STRING)
                                .maxLength(50)
                                .aliases(List.of("Document Series", "Doc Series", "Series", "Invoice Series"))
                                .exampleValue("GTLC/Number/F-26").exampleValue2("INV/2024/001")
                                .helpText("Document numbering series used for invoices generated from trips on this route.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("invoiceType").displayName("Invoice Type").dataType(ImportDataType.STRING)
                                .foreignKeyEntity("InvoiceType").foreignKeyLookupField("name")
                                .aliases(List.of("Invoice Type", "Invoice Trip Type", "Inv Type"))
                                .exampleValue("Standard Invoice").exampleValue2("Consolidated Invoice")
                                .helpText("Invoice PDF layout type. Must already exist in system. Controls how client invoices are generated.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("annexureType").displayName("Annexure Type").dataType(ImportDataType.STRING)
                                .foreignKeyEntity("AnnexureType").foreignKeyLookupField("name")
                                .aliases(List.of("Annexure Type", "Annexture Type", "Annexure Trip Type"))
                                .exampleValue("Trip Annexure").exampleValue2("POD Annexure")
                                .helpText("Annexure PDF layout type. Must already exist in system. Controls what supporting documents accompany the invoice.")
                                .build(),

                        // ── 8. Charge Columns (Per Trip → Invoice) ───────
                        ImportFieldDefinition.builder()
                                .fieldName("freightRate").displayName("Freight Rate").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Freight Rate", "Freight", "Freight Charge", "Rate"))
                                .exampleValue("47130").exampleValue2("12500")
                                .helpText("Base freight charge per trip in rupees.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("gdsCharges").displayName("GDS Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("GDS Charges", "GDS", "Goods Charges"))
                                .exampleValue("500").exampleValue2("0")
                                .helpText("Goods delivery/service charges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("stCharges").displayName("ST Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("ST Charges", "ST", "Service Tax Charges"))
                                .exampleValue("200").exampleValue2("0")
                                .helpText("Service tax or surcharges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("insurance").displayName("Insurance").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Insurance", "Insurance Charge", "Ins"))
                                .exampleValue("450").exampleValue2("0")
                                .helpText("Insurance charge per trip.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("loadingCharges").displayName("Loading Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Loading Charges", "Loading", "Load Charge"))
                                .exampleValue("800").exampleValue2("0")
                                .helpText("Charges for loading goods.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("unloadingCharges").displayName("Unloading Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Unloading Charges", "Unloading", "Unload Charge"))
                                .exampleValue("800").exampleValue2("0")
                                .helpText("Charges for unloading goods.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("deliveryCharges").displayName("Delivery Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Delivery Charges", "Delivery", "Door Delivery"))
                                .exampleValue("500").exampleValue2("0")
                                .helpText("Door delivery charges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("collectionCharges").displayName("Collection Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Collection Charges", "Collection", "Pickup Charge"))
                                .exampleValue("300").exampleValue2("0")
                                .helpText("Collection/pickup charges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("detentionCharges").displayName("Detention Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Detention Charges", "Detention", "Demurrage"))
                                .exampleValue("500").exampleValue2("0")
                                .helpText("Detention/demurrage charges for delays.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("godownCharges").displayName("Godown Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Godown Charges", "Godown", "Warehouse Charge"))
                                .exampleValue("200").exampleValue2("0")
                                .helpText("Godown/warehouse storage charges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("lrCharges").displayName("LR Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("LR Charges", "LR", "Lorry Receipt Charge"))
                                .exampleValue("150").exampleValue2("0")
                                .helpText("Lorry Receipt (LR) charges.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("otherCharges").displayName("Other Charges").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Other Charges", "Other", "Misc Charges", "Miscellaneous"))
                                .exampleValue("100").exampleValue2("0")
                                .helpText("Any other miscellaneous charges.")
                                .build(),

                        // ── 9. Operational Expense Defaults ──────────────
                        ImportFieldDefinition.builder()
                                .fieldName("driverExpense").displayName("Driver Expense").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Driver Expense", "Driver Cost", "Driver Bata", "Bata"))
                                .exampleValue("2200").exampleValue2("1500")
                                .helpText("Default driver bata/expense for this route.")
                                .build(),

                        ImportFieldDefinition.builder()
                                .fieldName("dieselLitres").displayName("Diesel (Litres)").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Diesel Litres", "Diesel", "Diesel In Liter", "Fuel Litres", "Fuel"))
                                .exampleValue("300").exampleValue2("80")
                                .helpText("Estimated diesel consumption in litres for one trip on this route.")
                                .build()
                ))
                .duplicateCheckFields(List.of("name"))
                .build());
    }
}
