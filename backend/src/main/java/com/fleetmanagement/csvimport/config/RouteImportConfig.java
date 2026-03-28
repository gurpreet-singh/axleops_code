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
                .description("Import route details — origin/destination cities, distances, estimated times, toll costs.")
                .icon("fas fa-route")
                .entityClass(Route.class)
                .fields(List.of(
                        ImportFieldDefinition.builder()
                                .fieldName("name").displayName("Route Name").dataType(ImportDataType.STRING)
                                .required(true).maxLength(100).uniqueInDatabase(true).uniqueInFile(true)
                                .aliases(List.of("Route", "Route Title"))
                                .exampleValue("Delhi-Mumbai").exampleValue2("Chennai-Bangalore")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("origin").displayName("From City").dataType(ImportDataType.STRING)
                                .required(true)
                                .aliases(List.of("From", "From City", "Source City", "Start City", "Origin"))
                                .exampleValue("Delhi").exampleValue2("Chennai")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("destination").displayName("To City").dataType(ImportDataType.STRING)
                                .required(true)
                                .aliases(List.of("To", "To City", "Destination", "Dest City", "End City"))
                                .exampleValue("Mumbai").exampleValue2("Bangalore")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("distanceKm").displayName("Distance (KM)").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Distance KM", "KM", "Kilometres", "Distance"))
                                .exampleValue("1400").exampleValue2("350")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("estimatedHours").displayName("Estimated Hours").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Est Hours", "Travel Time", "Duration"))
                                .exampleValue("24").exampleValue2("6")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("tollCost").displayName("Toll Cost").dataType(ImportDataType.DOUBLE)
                                .minValue(0.0)
                                .aliases(List.of("Toll Amount", "Toll Charges"))
                                .exampleValue("3500").exampleValue2("800")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("via").displayName("Via").dataType(ImportDataType.STRING)
                                .aliases(List.of("Via Route", "Through"))
                                .exampleValue("Pune").exampleValue2("Vellore")
                                .build()
                ))
                .duplicateCheckFields(List.of("name"))
                .build());
    }
}
