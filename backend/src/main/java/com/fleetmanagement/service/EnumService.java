package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.EnumValueDto;
import com.fleetmanagement.entity.Company;
import com.fleetmanagement.entity.FreightRate;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.LedgerAccountType;
import com.fleetmanagement.entity.LedgerGroup;
import com.fleetmanagement.entity.LedgerGroupType;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralised service that exposes every persisted enum as a list of
 * {@link EnumValueDto} — ready for dropdown rendering and i18n.
 * <p>
 * Convention:
 *   labelKey = "enum.{enumGroup}.{lowercase_value}"
 *   defaultLabel = human-readable English
 * <p>
 * When i18n is wired, the frontend will resolve labelKey via a
 * message bundle; until then it falls back to defaultLabel.
 */
@Service
public class EnumService {

    /**
     * Returns all enum families keyed by a stable camelCase group name.
     */
    public Map<String, List<EnumValueDto>> getAllEnums() {
        Map<String, List<EnumValueDto>> result = new LinkedHashMap<>();

        // ── Ledger Account Types (on LedgerAccount — operational behaviour) ──
        result.put("ledgerAccountType", mapEnum("ledger_account_type",
                LedgerAccountType.values(),
                Map.ofEntries(
                        Map.entry("CLIENT", "Client"),
                        Map.entry("VENDOR", "Vendor"),
                        Map.entry("FUEL_PUMP", "Fuel Pump"),
                        Map.entry("BANK_ACCOUNT", "Bank Account"),
                        Map.entry("CASH_ACCOUNT", "Cash Account"),
                        Map.entry("FUEL_CARD", "Fuel Card"),
                        Map.entry("FASTAG_ACCOUNT", "FASTag Account"),
                        Map.entry("CORPORATE_EXPENSE_CARD", "Corporate Expense Card"),
                        Map.entry("TAX_DUTY", "Tax & Duty"),
                        Map.entry("CAPITAL_ACCOUNT", "Capital Account"),
                        Map.entry("INTERNAL_TRANSFER", "Internal Transfer"),
                        Map.entry("EXPENSE", "Expense"),
                        Map.entry("INCOME", "Income"),
                        Map.entry("FIXED_ASSET", "Fixed Asset")
                )));

        // ── Ledger Group Types (on LedgerGroup — broad category) ────────
        result.put("ledgerGroupType", mapEnum("ledger_group_type",
                LedgerGroupType.values(),
                Map.of(
                        "PARTY", "Party",
                        "BANK", "Bank",
                        "CASH", "Cash",
                        "TAX", "Tax",
                        "GENERAL", "General"
                )));

        // ── Group Natures ───────────────────────────────────
        result.put("groupNature", mapEnum("group_nature",
                LedgerGroup.GroupNature.values(),
                Map.of(
                        "ASSET", "Asset",
                        "LIABILITY", "Liability",
                        "INCOME", "Income",
                        "EXPENSE", "Expense"
                )));

        // ── TCS Applicability ───────────────────────────────
        result.put("tcsApplicability", mapEnum("tcs_applicability",
                LedgerAccount.TcsApplicability.values(),
                Map.of(
                        "NOT_APPLICABLE", "Not Applicable",
                        "TCS_ON_SALE", "TCS on Sale",
                        "TCS_ON_PURCHASE", "TCS on Purchase"
                )));

        // ── Company Type ────────────────────────────────────
        result.put("companyType", mapEnum("company_type",
                Company.CompanyType.values(),
                Map.of(
                        "CLIENT", "Client",
                        "VENDOR", "Vendor",
                        "BOTH", "Client & Vendor",
                        "INTERNAL", "Internal"
                )));

        // ── Freight Rate Basis ──────────────────────────────
        result.put("rateBasis", mapEnum("rate_basis",
                FreightRate.RateBasis.values(),
                Map.of(
                        "PER_TRIP", "Per Trip",
                        "PER_KM", "Per Kilometre",
                        "PER_TON", "Per Tonne"
                )));

        return result;
    }

    // ── helper ──────────────────────────────────────────────
    private <E extends Enum<E>> List<EnumValueDto> mapEnum(
            String group, E[] values, Map<String, String> labels) {

        return Arrays.stream(values)
                .map(e -> new EnumValueDto(
                        e.name(),
                        "enum." + group + "." + e.name().toLowerCase(),
                        labels.getOrDefault(e.name(), prettify(e.name()))
                ))
                .collect(Collectors.toList());
    }

    /** UPPER_SNAKE → Title Case fallback */
    private String prettify(String name) {
        return Arrays.stream(name.split("_"))
                .map(w -> w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}
