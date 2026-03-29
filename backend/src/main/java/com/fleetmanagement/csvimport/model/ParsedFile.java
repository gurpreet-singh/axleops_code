package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedFile {
    private List<String> headers;
    private List<Map<String, String>> rows;

    public int getRowCount() {
        return rows != null ? rows.size() : 0;
    }

    public int getColumnCount() {
        return headers != null ? headers.size() : 0;
    }
}
