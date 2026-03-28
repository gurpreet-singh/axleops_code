package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.EnumValueDto;
import com.fleetmanagement.service.EnumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Static data endpoint — serves all enum types in a single call.
 * The frontend fetches this once on app load and caches it in a Zustand store.
 */
@RestController
@RequestMapping("/enums")
@RequiredArgsConstructor
public class EnumController {

    private final EnumService enumService;

    @GetMapping
    public ResponseEntity<Map<String, List<EnumValueDto>>> getAllEnums() {
        return ResponseEntity.ok(enumService.getAllEnums());
    }
}
