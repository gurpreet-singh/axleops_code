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

        // ── Trip Status ────────────────────────────────────
        result.put("tripStatus", mapEnum("trip_status",
                com.fleetmanagement.entity.TripStatus.values(),
                Map.of(
                        "CREATED", "Created",
                        "IN_TRANSIT", "In Transit",
                        "DELIVERED", "Delivered",
                        "SETTLED", "Settled",
                        "CANCELLED", "Cancelled"
                )));

        // ── Trip Type ──────────────────────────────────────
        result.put("tripType", mapEnum("trip_type",
                com.fleetmanagement.entity.TripType.values(),
                Map.of(
                        "FTL", "FTL — Full Truck Load",
                        "PTL", "PTL — Part Truck Load",
                        "LTL", "LTL — Less Than Truck Load",
                        "CONTAINER", "Container",
                        "TANKER", "Tanker",
                        "ODC", "ODC — Over Dimensional Cargo"
                )));

        // ── POD Status ─────────────────────────────────────
        result.put("podStatus", mapEnum("pod_status",
                com.fleetmanagement.entity.PodStatus.values(),
                Map.of(
                        "PENDING", "Pending",
                        "UPLOADED", "Uploaded",
                        "VERIFIED", "Verified"
                )));

        // ── Payment Terms ──────────────────────────────────
        result.put("paymentTerms", mapEnum("payment_terms",
                com.fleetmanagement.entity.PaymentTerms.values(),
                Map.of(
                        "TO_PAY", "To Pay",
                        "PAID", "Paid",
                        "TO_BE_BILLED", "To Be Billed"
                )));

        // ── Payment Mode ───────────────────────────────────
        result.put("paymentMode", mapEnum("payment_mode",
                com.fleetmanagement.entity.PaymentMode.values(),
                Map.of(
                        "CASH", "Cash",
                        "BANK_TRANSFER", "Bank Transfer",
                        "FUEL_CARD", "Fuel Card",
                        "UPI", "UPI",
                        "FASTAG", "FASTag",
                        "COMPANY_ACCOUNT", "Company Account"
                )));

        // ── Risk Type ──────────────────────────────────────
        result.put("riskType", mapEnum("risk_type",
                com.fleetmanagement.entity.RiskType.values(),
                Map.of(
                        "CARRIER_RISK", "Carrier Risk",
                        "OWNER_RISK", "Owner's Risk"
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
