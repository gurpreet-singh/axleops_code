package com.fleetmanagement.csvimport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectTemplateResponse {
    private MatchedTemplate matchedTemplate;
    private List<MappingTemplateResponse> allTemplates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchedTemplate {
        private UUID id;
        private String name;
        private Map<String, String> mappings;
        private double matchPercentage;
        private boolean isDefault;
    }
}
