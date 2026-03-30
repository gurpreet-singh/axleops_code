package com.fleetmanagement.config;

import java.util.UUID;

/**
 * Thrown when attempting to deactivate a branch that still has active resources.
 * Returns HTTP 409 Conflict with counts of referencing entities.
 */
public class BranchInUseException extends RuntimeException {

    private final UUID branchId;
    private final long vehicleCount;
    private final long driverCount;
    private final long tripCount;

    public BranchInUseException(UUID branchId, long vehicles, long drivers, long trips) {
        super(String.format(
            "Cannot deactivate branch %s: %d active vehicles, %d active drivers, %d open trips",
            branchId, vehicles, drivers, trips));
        this.branchId = branchId;
        this.vehicleCount = vehicles;
        this.driverCount = drivers;
        this.tripCount = trips;
    }

    public UUID getBranchId() { return branchId; }
    public long getVehicleCount() { return vehicleCount; }
    public long getDriverCount() { return driverCount; }
    public long getTripCount() { return tripCount; }
}
