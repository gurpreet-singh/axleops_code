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
public class UploadResponse {
    private UUID importSessionId;
    private List<String> headers;
    private int rowCount;
    private int columnCount;
    private List<Map<String, String>> previewRows; // first 5 rows
    private String fileName;
    private Long fileSize;
}
