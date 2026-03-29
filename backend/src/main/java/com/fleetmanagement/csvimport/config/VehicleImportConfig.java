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
                        ImportFieldDefinition.builder()
                                .fieldName("registrationNumber").displayName("Registration Number").dataType(ImportDataType.STRING)
                                .required(true).uniqueInDatabase(true).uniqueInFile(true)
                                .aliases(List.of("Reg No", "Vehicle Number", "Number Plate", "Reg Number"))
                                .exampleValue("MH12AB1234").exampleValue2("DL01CD5678")
                                .helpText("Vehicle registration number")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("make").displayName("Manufacturer").dataType(ImportDataType.STRING)
                                .aliases(List.of("Make", "Brand", "Company"))
                                .exampleValue("Tata").exampleValue2("Ashok Leyland")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("model").displayName("Model").dataType(ImportDataType.STRING)
                                .aliases(List.of("Vehicle Model"))
                                .exampleValue("Prima 4928").exampleValue2("Captain 2523")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("year").displayName("Year of Manufacture").dataType(ImportDataType.INTEGER)
                                .minValue(1990.0).maxValue(2030.0)
                                .aliases(List.of("Manufacture Year", "Year", "Mfg Year"))
                                .exampleValue("2022").exampleValue2("2020")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("chassisNumber").displayName("Chassis Number").dataType(ImportDataType.STRING)
                                .uniqueInDatabase(true)
                                .aliases(List.of("Chassis No", "Chassis"))
                                .exampleValue("MALA123456789").exampleValue2("MBLB987654321")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("engineNumber").displayName("Engine Number").dataType(ImportDataType.STRING)
                                .uniqueInDatabase(true)
                                .aliases(List.of("Engine No", "Engine"))
                                .exampleValue("ENG123456").exampleValue2("ENG789012")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("fuelType").displayName("Fuel Type").dataType(ImportDataType.STRING)
                                .aliases(List.of("Fuel"))
                                .defaultValue("DIESEL")
                                .exampleValue("DIESEL").exampleValue2("CNG")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("insuranceExpiry").displayName("Insurance Expiry").dataType(ImportDataType.DATE)
                                .aliases(List.of("Insurance Expiry Date", "Insurance Due"))
                                .exampleValue("31/12/2025").exampleValue2("15/06/2026")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("fitnessExpiry").displayName("Fitness Expiry").dataType(ImportDataType.DATE)
                                .aliases(List.of("Fitness Expiry Date", "Fitness Due", "FC Expiry"))
                                .exampleValue("31/03/2026").exampleValue2("30/09/2025")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("permitExpiry").displayName("Permit Expiry").dataType(ImportDataType.DATE)
                                .aliases(List.of("Permit Expiry Date", "Permit Due"))
                                .exampleValue("30/06/2026").exampleValue2("31/12/2025")
                                .build()
                ))
                .duplicateCheckFields(List.of("registrationNumber"))
                .build());
    }
}
