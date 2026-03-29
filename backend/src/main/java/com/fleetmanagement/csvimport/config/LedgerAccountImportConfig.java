package com.fleetmanagement.csvimport.config;

import com.fleetmanagement.csvimport.model.ImportDataType;
import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import com.fleetmanagement.entity.LedgerAccount;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class LedgerAccountImportConfig {

    private final ImportEntityConfigRegistry registry;

    public LedgerAccountImportConfig(ImportEntityConfigRegistry registry) {
        this.registry = registry;
    }

    @PostConstruct
    void register() {
        registry.register(ImportEntityConfig.builder()
                .entityName("LEDGER_ACCOUNT")
                .displayName("Ledger Accounts")
                .description("Import ledger accounts (parties, banks, cash accounts, etc.). Each account belongs to a ledger group.")
                .icon("fas fa-book")
                .entityClass(LedgerAccount.class)
                .fields(List.of(
                        ImportFieldDefinition.builder()
                                .fieldName("accountHead").displayName("Account Name").dataType(ImportDataType.STRING)
                                .required(true).maxLength(150).uniqueInDatabase(true).uniqueInFile(true)
                                .aliases(List.of("Account Name", "Ledger Name", "Party Name", "Account", "Name"))
                                .exampleValue("ABC Transport Co.").exampleValue2("State Bank of India")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("accountGroupRef").displayName("Account Group").dataType(ImportDataType.STRING)
                                .foreignKeyEntity("LedgerGroup").foreignKeyLookupField("name")
                                .aliases(List.of("Group Name", "Ledger Group", "Group", "Account Group"))
                                .exampleValue("Sundry Debtors").exampleValue2("Bank Accounts")
                                .helpText("Name of the ledger group this account belongs to (looked up by name)")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("accountType").displayName("Account Type").dataType(ImportDataType.ENUM)
                                .enumValues(List.of(
                                        "CLIENT", "VENDOR", "FUEL_PUMP",
                                        "BANK_ACCOUNT", "CASH_ACCOUNT", "FUEL_CARD",
                                        "FASTAG_ACCOUNT", "CORPORATE_EXPENSE_CARD",
                                        "TAX_DUTY", "CAPITAL_ACCOUNT", "INTERNAL_TRANSFER",
                                        "EXPENSE", "INCOME", "FIXED_ASSET"
                                ))
                                .enumCaseInsensitive(true)
                                .aliases(List.of("Account Type", "Ledger Account Type", "Type", "Sub Type"))
                                .exampleValue("CLIENT").exampleValue2("FUEL_PUMP")
                                .helpText("Operational behaviour type: CLIENT, VENDOR, FUEL_PUMP, BANK_ACCOUNT, etc.")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("panNumber").displayName("PAN").dataType(ImportDataType.PAN)
                                .regexPattern("[A-Z]{5}[0-9]{4}[A-Z]").regexErrorMessage("Invalid PAN format (expected: ABCDE1234F)")
                                .aliases(List.of("PAN Number", "PAN No", "PAN Card"))
                                .exampleValue("ABCDE1234F").exampleValue2("FGHIJ5678K")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("gstin").displayName("GSTIN").dataType(ImportDataType.GSTIN)
                                .regexPattern("[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}").regexErrorMessage("Invalid GSTIN format")
                                .aliases(List.of("GST No", "GST Number", "GSTIN No"))
                                .exampleValue("29ABCDE1234F1Z5").exampleValue2("07FGHIJ5678K2ZP")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("phone").displayName("Phone").dataType(ImportDataType.PHONE)
                                .aliases(List.of("Mobile", "Contact No", "Phone Number", "Mobile No"))
                                .exampleValue("9876543210").exampleValue2("8765432109")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("email").displayName("Email").dataType(ImportDataType.EMAIL)
                                .aliases(List.of("Email Address", "Email ID", "Mail"))
                                .exampleValue("abc@transport.com").exampleValue2("sbi@bank.com")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("billingAddress").displayName("Address").dataType(ImportDataType.STRING)
                                .maxLength(500)
                                .aliases(List.of("Address", "Billing Address"))
                                .exampleValue("123 Main Road, Delhi").exampleValue2("456 MG Road, Mumbai")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("city").displayName("City").dataType(ImportDataType.STRING)
                                .exampleValue("Delhi").exampleValue2("Mumbai")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("state").displayName("State").dataType(ImportDataType.STRING)
                                .exampleValue("Delhi").exampleValue2("Maharashtra")
                                .build(),
                        ImportFieldDefinition.builder()
                                .fieldName("pinCode").displayName("Pincode").dataType(ImportDataType.STRING)
                                .regexPattern("[0-9]{6}").regexErrorMessage("Pincode must be 6 digits")
                                .aliases(List.of("PIN Code", "ZIP Code", "PIN", "Pincode"))
                                .exampleValue("110001").exampleValue2("400001")
                                .build()
                ))
                .duplicateCheckFields(List.of("accountHead"))
                .build());
    }
}
