package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.entity.Authority;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

/**
 * Handles file uploads for compliance docs, vehicle docs, receipts, etc.
 * Stores files to a local uploads directory (swap for S3 in production).
 */
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Create directory structure: uploads/{category}/
        Path dir = Paths.get(UPLOAD_DIR, category);
        Files.createDirectories(dir);

        // Generate unique filename to avoid collisions
        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
        String storedName = UUID.randomUUID().toString().substring(0, 8) + "_" + (originalName != null ? originalName : "file" + ext);
        Path filePath = dir.resolve(storedName);
        Files.write(filePath, file.getBytes());

        return ResponseEntity.ok(Map.of(
                "fileName", originalName,
                "storedName", storedName,
                "fileUrl", "/uploads/" + category + "/" + storedName,
                "fileType", ext.replace(".", ""),
                "fileSizeBytes", file.getSize(),
                "category", category
        ));
    }

    @PostMapping("/multiple")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<java.util.List<Map<String, Object>>> uploadMultiple(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category
    ) throws IOException {
        java.util.List<Map<String, Object>> results = new java.util.ArrayList<>();
        Path dir = Paths.get(UPLOAD_DIR, category);
        Files.createDirectories(dir);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String originalName = file.getOriginalFilename();
            String ext = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            String storedName = UUID.randomUUID().toString().substring(0, 8) + "_" + (originalName != null ? originalName : "file" + ext);
            Path filePath = dir.resolve(storedName);
            Files.write(filePath, file.getBytes());
            results.add(Map.of(
                    "fileName", originalName != null ? originalName : "file",
                    "storedName", storedName,
                    "fileUrl", "/uploads/" + category + "/" + storedName,
                    "fileType", ext.replace(".", ""),
                    "fileSizeBytes", file.getSize()
            ));
        }
        return ResponseEntity.ok(results);
    }
}
