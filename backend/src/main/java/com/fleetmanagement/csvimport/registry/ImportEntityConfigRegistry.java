package com.fleetmanagement.csvimport.registry;

import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Central registry holding all importable entity configurations.
 * Each entity registers itself via a @Configuration class.
 * The framework reads from here — zero framework changes to add a new entity.
 */
@Component
public class ImportEntityConfigRegistry {

    private final Map<String, ImportEntityConfig> configs = new LinkedHashMap<>();

    public void register(ImportEntityConfig config) {
        if (config.getEntityName() == null || config.getEntityName().isBlank()) {
            throw new IllegalArgumentException("ImportEntityConfig must have a non-blank entityName");
        }
        configs.put(config.getEntityName(), config);
    }

    public ImportEntityConfig get(String entityName) {
        ImportEntityConfig config = configs.get(entityName);
        if (config == null) {
            throw new IllegalArgumentException("Unknown import entity: " + entityName);
        }
        return config;
    }

    public List<ImportEntityConfig> getAll() {
        return new ArrayList<>(configs.values());
    }

    public boolean isRegistered(String entityName) {
        return configs.containsKey(entityName);
    }
}
