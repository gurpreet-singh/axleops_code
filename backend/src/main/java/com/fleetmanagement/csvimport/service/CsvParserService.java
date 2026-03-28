package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.ParsedFile;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Stage 1: FILE PARSING
 * Parses CSV, handles BOM, auto-detects delimiter, extracts headers + rows.
 */
@Service
public class CsvParserService {

    private static final Logger log = LoggerFactory.getLogger(CsvParserService.class);

    public ParsedFile parse(MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            content = stripBOM(content);
            char delimiter = detectDelimiter(content);

            CSVParser parser = new CSVParserBuilder()
                    .withSeparator(delimiter)
                    .withQuoteChar('"')
                    .withIgnoreLeadingWhiteSpace(true)
                    .build();

            try (Reader reader = new InputStreamReader(new ByteArrayInputStream(content), detectCharset(content));
                 CSVReader csvReader = new CSVReaderBuilder(reader)
                         .withCSVParser(parser)
                         .build()) {

                List<String[]> allRows = csvReader.readAll();

                if (allRows.isEmpty()) {
                    throw new IllegalArgumentException("CSV file is empty");
                }
                if (allRows.size() < 2) {
                    throw new IllegalArgumentException("CSV file has headers but no data rows");
                }

                String[] headerRow = allRows.get(0);
                List<String> headers = Arrays.stream(headerRow)
                        .map(String::trim)
                        .toList();

                List<Map<String, String>> rows = new ArrayList<>();
                for (int i = 1; i < allRows.size(); i++) {
                    String[] rowData = allRows.get(i);
                    // Skip rows where all cells are empty
                    if (isEmptyRow(rowData)) continue;

                    Map<String, String> row = new LinkedHashMap<>();
                    for (int j = 0; j < headers.size(); j++) {
                        String value = j < rowData.length ? rowData[j] : "";
                        row.put(headers.get(j), value);
                    }
                    rows.add(row);
                }

                if (rows.isEmpty()) {
                    throw new IllegalArgumentException("CSV file has headers but no data rows");
                }

                log.info("Parsed CSV: {} headers, {} data rows, delimiter='{}', file={}",
                        headers.size(), rows.size(), delimiter, file.getOriginalFilename());

                return ParsedFile.builder()
                        .headers(headers)
                        .rows(rows)
                        .build();
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse CSV file: " + e.getMessage(), e);
        }
    }

    private byte[] stripBOM(byte[] content) {
        // UTF-8 BOM: EF BB BF
        if (content.length >= 3 &&
            (content[0] & 0xFF) == 0xEF &&
            (content[1] & 0xFF) == 0xBB &&
            (content[2] & 0xFF) == 0xBF) {
            return Arrays.copyOfRange(content, 3, content.length);
        }
        return content;
    }

    private char detectDelimiter(byte[] content) {
        String sample = new String(content, 0, Math.min(content.length, 2000), StandardCharsets.UTF_8);
        String firstLine = sample.split("\n", 2)[0];

        int commas = countChar(firstLine, ',');
        int semicolons = countChar(firstLine, ';');
        int tabs = countChar(firstLine, '\t');
        int pipes = countChar(firstLine, '|');

        if (tabs >= commas && tabs >= semicolons && tabs >= pipes && tabs > 0) return '\t';
        if (semicolons >= commas && semicolons >= pipes && semicolons > 0) return ';';
        if (pipes >= commas && pipes > 0) return '|';
        return ',';
    }

    private Charset detectCharset(byte[] content) {
        // Simple charset detection — default UTF-8
        try {
            String utf8 = new String(content, StandardCharsets.UTF_8);
            // If it decodes cleanly as UTF-8, use that
            if (!utf8.contains("\uFFFD")) {
                return StandardCharsets.UTF_8;
            }
        } catch (Exception ignored) {}
        return StandardCharsets.ISO_8859_1;
    }

    private int countChar(String s, char c) {
        return (int) s.chars().filter(ch -> ch == c).count();
    }

    private boolean isEmptyRow(String[] row) {
        for (String cell : row) {
            if (cell != null && !cell.trim().isEmpty()) return false;
        }
        return true;
    }
}
