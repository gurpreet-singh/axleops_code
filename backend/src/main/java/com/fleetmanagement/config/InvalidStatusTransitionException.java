package com.fleetmanagement.config;

import com.fleetmanagement.entity.TripStatus;

/**
 * Thrown when a trip status transition is invalid.
 * Mapped to HTTP 409 by GlobalExceptionHandler.
 */
public class InvalidStatusTransitionException extends RuntimeException {

    private final TripStatus currentStatus;
    private final String attemptedAction;

    public InvalidStatusTransitionException(TripStatus currentStatus, String attemptedAction) {
        super("Cannot " + attemptedAction + " — trip is in " + currentStatus + " status");
        this.currentStatus = currentStatus;
        this.attemptedAction = attemptedAction;
    }

    public TripStatus getCurrentStatus() { return currentStatus; }
    public String getAttemptedAction() { return attemptedAction; }
}
