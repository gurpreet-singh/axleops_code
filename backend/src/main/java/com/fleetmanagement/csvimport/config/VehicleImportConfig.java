package com.fleetmanagement.csvimport.config;

import com.fleetmanagement.csvimport.model.ImportDataType;
import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import com.fleetmanagement.entity.Vehicle;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class VehicleImportConfig {

    private final ImportEntityConfigRegistry registry;

    public VehicleImportConfig(ImportEntityConfigRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    void register() {
        registry.register(ImportEntityConfig.builder()
                .entityName("VEHICLE")
                .displayName("Vehicles")
                .description("Import your fleet vehicles — trucks, trailers, tankers, etc. with registration details, insurance, fitness, and permit expiry dates.")
                .icon("fas fa-truck")
                .entityClass(Vehicle.class)
                .fields(List.of(
                        // ─── Core Identification ────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("registrationNumber").displayName("Vehicle Number").dataType(ImportDataType.STRING)
                                .required(true).uniqueInDatabase(true).uniqueInFile(true)
                                .aliases(List.of("Reg No", "Vehicle Number", "Number Plate", "Reg Number", "Registration Number"))
                                .exampleValue("MH12AB1234").exampleValue2("DL01CD5678")
                                .helpText("Vehicle registration number")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("vehicleCategory").displayName("Vehicle Category").dataType(ImportDataType.STRING)
                                .aliases(List.of("Category", "Veh Category", "Vehicle Cat"))
                                .enumValues(List.of("TRANSPORT", "NON_TRANSPORT", "PRIVATE", "GOVERNMENT"))
                                .exampleValue("TRANSPORT").exampleValue2("NON_TRANSPORT")
                                .helpText("Vehicle category: TRANSPORT, NON_TRANSPORT, PRIVATE, GOVERNMENT")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("referenceNumber").displayName("Reference Number").dataType(ImportDataType.STRING)
                                .aliases(List.of("Ref No", "Ref Number", "Fleet Code", "Internal Ref"))
                                .exampleValue("FLT-001").exampleValue2("REF-2024-056")
                                .helpText("Internal reference or fleet code")
                                .build(),

                        // ─── Registration Details ───────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("registrationDate").displayName("Registration Date").dataType(ImportDataType.DATE)
                                .aliases(List.of("Reg Date", "Date of Registration"))
                                .exampleValue("15/03/2022").exampleValue2("01/01/2020")
                                .helpText("Vehicle registration date")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("customerName").displayName("Customer Name").dataType(ImportDataType.STRING)
                                .aliases(List.of("Owner Name", "Registered Owner", "Owner", "Customer"))
                                .exampleValue("ABC Transport Pvt Ltd").exampleValue2("Sharma Logistics")
                                .helpText("Registered owner / customer name from RTO record")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("rtoOffice").displayName("RTO Office").dataType(ImportDataType.STRING)
                                .aliases(List.of("RTO Office Name", "RTO", "Registering Authority"))
                                .exampleValue("Pune RTO").exampleValue2("Mumbai Central RTO")
                                .helpText("RTO office where vehicle is registered")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("registrationState").displayName("Registration State").dataType(ImportDataType.STRING)
                                .aliases(List.of("State", "Reg State"))
                                .exampleValue("Maharashtra").exampleValue2("Delhi")
                                .build(),

                        // ─── Manufacturer & Model ───────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("make").displayName("Manufacturer").dataType(ImportDataType.STRING)
                                .aliases(List.of("Make", "Brand", "Company", "Manufacture Comp", "Manufacturer Company"))
                                .exampleValue("Tata").exampleValue2("Ashok Leyland")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("model").displayName("Model").dataType(ImportDataType.STRING)
                                .aliases(List.of("Vehicle Model", "Veh Model"))
                                .exampleValue("Prima 4928").exampleValue2("Captain 2523")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("vehicleTypeMaster").displayName("Vehicle Type").dataType(ImportDataType.STRING)
                                .foreignKeyEntity("VehicleTypeMaster").foreignKeyLookupField("name")
                                .aliases(List.of("Veh Type", "Type", "Vehicle Type Master", "Vehicle Type", "Vehicle Category"))
                                .exampleValue("9 MT 32 FEET").exampleValue2("HCV 49T")
                                .helpText("Vehicle type classification. Must match a Vehicle Type master entry by name.")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("year").displayName("Year of Manufacture").dataType(ImportDataType.INTEGER)
                                .minValue(1990.0).maxValue(2030.0)
                                .aliases(List.of("Manufacture Year", "Year", "Mfg Year"))
                                .exampleValue("2022").exampleValue2("2020")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("mfgMonthYear").displayName("Mfg Month Year").dataType(ImportDataType.STRING)
                                .aliases(List.of("Mfg Mnth Year", "Manufacturing Date", "Mfg Date"))
                                .exampleValue("2022-03").exampleValue2("11/2020")
                                .helpText("Manufacturing month and year (e.g. 2022-03, 03/2022)")
                                .build(),

                        // ─── Physical Attributes ────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("hpCc").displayName("HP / CC").dataType(ImportDataType.STRING)
                                .aliases(List.of("Hp Cc", "HP CC", "Engine CC", "Horsepower"))
                                .exampleValue("3783 CC / 180 HP").exampleValue2("5883 CC / 250 HP")
                                .helpText("Engine displacement in CC or horsepower")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("bodyType").displayName("Body Type").dataType(ImportDataType.STRING)
                                .aliases(List.of("Body", "Body Style"))
                                .enumValues(List.of("CLOSE_BODY", "OPEN_BODY", "TANKER", "CONTAINER", "TIPPER", "FLATBED", "TRAILER", "BUS", "VAN", "OTHER"))
                                .exampleValue("CLOSE_BODY").exampleValue2("TANKER")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("fuelType").displayName("Fuel Type").dataType(ImportDataType.STRING)
                                .aliases(List.of("Fuel"))
                                .enumValues(List.of("DIESEL", "PETROL", "CNG", "ELECTRIC", "HYBRID"))
                                .defaultValue("DIESEL")
                                .exampleValue("DIESEL").exampleValue2("CNG")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("color").displayName("Color").dataType(ImportDataType.STRING)
                                .aliases(List.of("Colour", "Vehicle Color", "Veh Color"))
                                .exampleValue("White").exampleValue2("Blue")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("seatingCapacity").displayName("Seating Capacity").dataType(ImportDataType.INTEGER)
                                .aliases(List.of("Seats", "No of Seats", "Seating"))
                                .exampleValue("3").exampleValue2("2")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("ulwKg").displayName("ULW (Kg)").dataType(ImportDataType.INTEGER)
                                .aliases(List.of("ULW", "Ulw In Kg", "Unladen Weight", "Tare Weight"))
                                .exampleValue("7500").exampleValue2("12000")
                                .helpText("Unladen (empty) weight in kilograms")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("rlwKg").displayName("RLW / GVW (Kg)").dataType(ImportDataType.INTEGER)
                                .aliases(List.of("RLW", "Rlw In Kg", "GVW", "Gross Weight", "Laden Weight"))
                                .exampleValue("16200").exampleValue2("49000")
                                .helpText("Registered laden weight / Gross Vehicle Weight in kilograms")
                                .build(),

                        // ─── Chassis & Engine ───────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("chassisNumber").displayName("Chassis Number").dataType(ImportDataType.STRING)
                                .uniqueInDatabase(true)
                                .aliases(List.of("Chassis No", "Chassis", "Chasi No"))
                                .exampleValue("MALA123456789").exampleValue2("MBLB987654321")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("engineNumber").displayName("Engine Number").dataType(ImportDataType.STRING)
                                .uniqueInDatabase(true)
                                .aliases(List.of("Engine No", "Engine"))
                                .exampleValue("ENG123456").exampleValue2("ENG789012")
                                .build(),

                        // ─── Ownership & Finance ────────────────────────────
                        ImportFieldDefinition.builder()
                                .fieldName("hypothecation").displayName("Hypothecation").dataType(ImportDataType.STRING)
                                .aliases(List.of("Hypothication", "Financer", "Bank", "Hypothecation Bank"))
                                .exampleValue("HDFC Bank").exampleValue2("SBI")
                                .helpText("Hypothecation bank or financier name")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("ownership").displayName("Ownership").dataType(ImportDataType.STRING)
                                .aliases(List.of("Owner Type", "Ownership Type"))
                                .enumValues(List.of("OWNED", "LEASED", "RENTED", "MARKET"))
                                .exampleValue("OWNED").exampleValue2("LEASED")
                                .build()
                ))
                .duplicateCheckFields(List.of("registrationNumber"))
                .build());
    }
}
