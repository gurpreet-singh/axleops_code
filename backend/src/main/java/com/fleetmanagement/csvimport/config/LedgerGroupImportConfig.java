package com.fleetmanagement.csvimport.config;

import com.fleetmanagement.csvimport.model.ImportDataType;
import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import com.fleetmanagement.entity.LedgerGroup;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class LedgerGroupImportConfig {

    private final ImportEntityConfigRegistry registry;

    public LedgerGroupImportConfig(ImportEntityConfigRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    void register() {
        registry.register(ImportEntityConfig.builder()
                .entityName("LEDGER_GROUP")
                .displayName("Ledger Groups")
                .description("Import ledger groups for your chart of accounts. Groups organize ledger accounts into categories like Sundry Debtors, Bank Accounts, Indirect Expenses, etc.")
                .icon("fas fa-layer-group")
                .entityClass(LedgerGroup.class)
                .fields(List.of(
                        ImportFieldDefinition.builder()
                                .fieldName("name")
                                .displayName("Group Name")
                                .dataType(ImportDataType.STRING)
                                .required(true)
                                .maxLength(100)
                                .uniqueInDatabase(true)
                                .uniqueInFile(true)
                                .aliases(List.of("Group Name", "Ledger Group", "Account Group", "Group"))
                                .exampleValue("Sundry Debtors")
                                .exampleValue2("Bank Accounts")
                                .helpText("Name of the ledger group (must be unique)")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("nature")
                                .displayName("Nature")
                                .dataType(ImportDataType.ENUM)
                                .required(true)
                                .enumValues(List.of("ASSET", "LIABILITY", "INCOME", "EXPENSE"))
                                .enumCaseInsensitive(true)
                                .aliases(List.of("Group Nature", "Account Nature", "Type"))
                                .exampleValue("ASSET")
                                .exampleValue2("EXPENSE")
                                .helpText("Accounting nature: ASSET, LIABILITY, INCOME, or EXPENSE")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("defaultAccountSubType")
                                .displayName("Default Sub Type")
                                .dataType(ImportDataType.ENUM)
                                .required(true)
                                .enumValues(List.of("PARTY", "BANK", "CASH", "DUTIES_TAXES", "GENERAL"))
                                .enumCaseInsensitive(true)
                                .aliases(List.of("Sub Type", "Account Sub Type", "Default Type", "SubType"))
                                .exampleValue("PARTY")
                                .exampleValue2("GENERAL")
                                .helpText("Determines which UI form sections and business logic apply to accounts in this group")
                                .build()
                ))
                .duplicateCheckFields(List.of("name"))
                .sampleCsvFileName("ledger-groups-sample.csv")
                .build());
    }
}
