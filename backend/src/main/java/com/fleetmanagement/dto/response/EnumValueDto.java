package com.fleetmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * A single enum option that the frontend can use for dropdowns.
 * <p>
 * Designed for internationalisation:
 * - key:          the persisted value (e.g. "PARTY_GENERAL")
 * - labelKey:     an i18n message key (e.g. "enum.ledger_account_type.party_general")
 * - defaultLabel: the English fallback rendered when no translation is available
 */
@Data
@AllArgsConstructor
public class EnumValueDto {
    private String key;
    private String labelKey;
    private String defaultLabel;
}
