package com.fleetmanagement.entity.master;

/** Alert rule classification */
public enum AlertType {
    FUEL_OVERCAPACITY, KMPL_DEVIATION, PAYMENT_OVERDUE, DOCUMENT_EXPIRY,
    MAINTENANCE_OVERDUE, EXPENSE_ANOMALY, IDLE_VEHICLE, TRIP_DELAY,
    ADVANCE_UNSETTLED, CUSTOM
}
