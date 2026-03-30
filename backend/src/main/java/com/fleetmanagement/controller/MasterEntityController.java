package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.MasterEntityService;
import com.fleetmanagement.service.MasterSchemaDefinitions;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Generic REST controller for all 15 master entities.
 * Single controller handles all entity types via URL path variable {entity}.
 *
 * GET    /masters/{entity}              → list all (searchable)
 * GET    /masters/{entity}/{id}         → get one
 * POST   /masters/{entity}              → create
 * PUT    /masters/{entity}/{id}         → update
 * DELETE /masters/{entity}/{id}         → soft-delete (deactivate)
 * PATCH  /masters/{entity}/{id}/activate→ reactivate
 * GET    /masters/{entity}/dropdown     → minimal id+name for dropdowns
 * GET    /masters/{entity}/schema       → field schema for dynamic forms
 * GET    /masters/entities              → list of all master entity types
 */
@RestController
@RequestMapping("/masters")
@RequiredArgsConstructor
public class MasterEntityController {

    private final MasterEntityService masterService;

    /** List all master entity types with their metadata */
    @GetMapping("/entities")
    @RequiresAuthority(Authority.SETTINGS_READ)
    public ResponseEntity<List<Map<String, Object>>> listEntityTypes() {
        return ResponseEntity.ok(MasterSchemaDefinitions.getAllEntities());
    }

    /** Get field schema for dynamic form rendering */
    @GetMapping("/{entity}/schema")
    @RequiresAuthority(Authority.SETTINGS_READ)
    public ResponseEntity<Map<String, Object>> getSchema(@PathVariable String entity) {
        return ResponseEntity.ok(masterService.getSchema(entity));
    }

    /** Dropdown — minimal id+name for select fields */
    @GetMapping("/{entity}/dropdown")
    @RequiresAuthority(Authority.SETTINGS_READ)
    public ResponseEntity<List<Map<String, Object>>> dropdown(@PathVariable String entity) {
        return ResponseEntity.ok(masterService.dropdown(entity));
    }

    /** List all records (with optional search and active filter) */
    @GetMapping("/{entity}")
    @RequiresAuthority(Authority.SETTINGS_READ)
    public ResponseEntity<List<Map<String, Object>>> list(
            @PathVariable String entity,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(masterService.list(entity, search, activeOnly));
    }

    /** Get one record by ID */
    @GetMapping("/{entity}/{id}")
    @RequiresAuthority(Authority.SETTINGS_READ)
    public ResponseEntity<Map<String, Object>> getById(
            @PathVariable String entity, @PathVariable UUID id) {
        return ResponseEntity.ok(masterService.getById(entity, id));
    }

    /** Create a new record */
    @PostMapping("/{entity}")
    @RequiresAuthority(Authority.SETTINGS_UPDATE)
    public ResponseEntity<Map<String, Object>> create(
            @PathVariable String entity, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(masterService.create(entity, data));
    }

    /** Update an existing record */
    @PutMapping("/{entity}/{id}")
    @RequiresAuthority(Authority.SETTINGS_UPDATE)
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable String entity, @PathVariable UUID id,
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(masterService.update(entity, id, data));
    }

    /** Soft-delete (deactivate) */
    @DeleteMapping("/{entity}/{id}")
    @RequiresAuthority(Authority.SETTINGS_UPDATE)
    public ResponseEntity<Void> deactivate(
            @PathVariable String entity, @PathVariable UUID id) {
        masterService.deactivate(entity, id);
        return ResponseEntity.noContent().build();
    }

    /** Reactivate */
    @PatchMapping("/{entity}/{id}/activate")
    @RequiresAuthority(Authority.SETTINGS_UPDATE)
    public ResponseEntity<Void> activate(
            @PathVariable String entity, @PathVariable UUID id) {
        masterService.activate(entity, id);
        return ResponseEntity.noContent().build();
    }
}
