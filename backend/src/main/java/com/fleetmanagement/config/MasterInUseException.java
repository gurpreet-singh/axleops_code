package com.fleetmanagement.config;

import java.util.UUID;

/**
 * Thrown when attempting to deactivate a master entity that is still
 * referenced by active transactional records. Returns HTTP 409 Conflict.
 */
public class MasterInUseException extends RuntimeException {

    private final String entity;
    private final UUID id;
    private final long referenceCount;

    public MasterInUseException(String entity, UUID id, long referenceCount) {
        super(String.format("Cannot deactivate %s [%s]: referenced by %d active record(s). Reassign or archive them first.",
                entity, id, referenceCount));
        this.entity = entity;
        this.id = id;
        this.referenceCount = referenceCount;
    }

    public String getEntity() { return entity; }
    public UUID getEntityId() { return id; }
    public long getReferenceCount() { return referenceCount; }
}
