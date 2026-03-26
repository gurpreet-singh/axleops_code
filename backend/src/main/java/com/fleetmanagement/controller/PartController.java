package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.PartResponse;
import com.fleetmanagement.service.PartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/parts")
@RequiredArgsConstructor
public class PartController {

    private final PartService partService;

    @GetMapping
    public ResponseEntity<List<PartResponse>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartResponse> getPartById(@PathVariable UUID id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }
}
