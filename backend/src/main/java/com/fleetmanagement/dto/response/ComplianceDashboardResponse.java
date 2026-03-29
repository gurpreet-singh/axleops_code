package com.fleetmanagement.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Fleet-level compliance dashboard response.
 */
@Data
public class ComplianceDashboardResponse {

    private long totalDocuments;
    private long activeDocuments;
    private long expiringSoonDocuments;
    private long expiredDocuments;

    private Map<String, TypeSummary> byType; // key = document type (e.g., "INSURANCE")

    private List<ComplianceDocumentResponse> expiringNext30Days;

    @Data
    public static class TypeSummary {
        private long total;
        private long active;
        private long expiringSoon;
        private long expired;
    }
}
