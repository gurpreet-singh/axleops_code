package com.fleetmanagement.entity;

/**
 * All fine-grained permissions in the system.
 * Each constant represents a single MODULE_ACTION permission.
 * Authorities are never stored in the database — they are resolved
 * at runtime from the user's assigned Role enum values.
 */
public enum Authority {

    // ─── Dashboard ──────────────────────────────────
    DASHBOARD_READ,

    // ─── Trip Management ────────────────────────────
    TRIP_CREATE,
    TRIP_READ,
    TRIP_READ_OWN,
    TRIP_UPDATE,
    TRIP_UPDATE_STATUS,
    TRIP_DELETE,
    TRIP_APPROVE,
    TRIP_ASSIGN_DRIVER,
    TRIP_ASSIGN_VEHICLE,

    // ─── Billing ────────────────────────────────────
    BILL_CREATE,
    BILL_READ,
    BILL_UPDATE,
    BILL_DELETE,
    BILL_APPROVE,

    // ─── Vehicles ───────────────────────────────────
    VEHICLE_CREATE,
    VEHICLE_READ,
    VEHICLE_READ_ASSIGNED,
    VEHICLE_UPDATE,
    VEHICLE_DELETE,

    // ─── Equipment ──────────────────────────────────
    EQUIPMENT_CREATE,
    EQUIPMENT_READ,
    EQUIPMENT_UPDATE,
    EQUIPMENT_DELETE,

    // ─── Inspections ────────────────────────────────
    INSPECTION_CREATE,
    INSPECTION_CREATE_OWN,
    INSPECTION_READ,
    INSPECTION_READ_OWN,
    INSPECTION_UPDATE,
    INSPECTION_APPROVE,

    // ─── Service / Maintenance ──────────────────────
    SERVICE_CREATE,
    SERVICE_CREATE_BREAKDOWN,
    SERVICE_READ,
    SERVICE_READ_OWN,
    SERVICE_UPDATE,
    SERVICE_UPDATE_OWN,
    SERVICE_DELETE,
    SERVICE_APPROVE,

    // ─── Vendors ────────────────────────────────────
    VENDOR_CREATE,
    VENDOR_READ,
    VENDOR_UPDATE,
    VENDOR_DELETE,

    // ─── Parts & Inventory ──────────────────────────
    PARTS_CREATE,
    PARTS_READ,
    PARTS_UPDATE,
    PARTS_DELETE,
    PARTS_REQUEST,
    PARTS_APPROVE_PO,

    // ─── Ledger & Vouchers ──────────────────────────
    LEDGER_CREATE,
    LEDGER_READ,
    LEDGER_UPDATE,
    LEDGER_DELETE,
    LEDGER_APPROVE,
    LEDGER_POST,

    // ─── Financial Reports ──────────────────────────
    FINANCIAL_REPORT_READ,
    FINANCIAL_REPORT_EXPORT,

    // ─── Operational Reports ────────────────────────
    REPORT_READ,
    REPORT_EXPORT,

    // ─── Alerts & Notifications ─────────────────────
    ALERT_READ,
    ALERT_CONFIGURE,

    // ─── Reminders ──────────────────────────────────
    REMINDER_CREATE,
    REMINDER_READ,
    REMINDER_READ_OWN,
    REMINDER_UPDATE,

    // ─── Accounts (Client/Vendor) ───────────────────
    ACCOUNT_CREATE,
    ACCOUNT_READ,
    ACCOUNT_UPDATE,
    ACCOUNT_DELETE,

    // ─── Workshop Planning ──────────────────────────
    WORKSHOP_PLAN_CREATE,
    WORKSHOP_PLAN_READ,
    WORKSHOP_PLAN_READ_OWN,
    WORKSHOP_PLAN_UPDATE,
    WORKSHOP_PLAN_DELETE,

    // ─── Organization ───────────────────────────────
    ORG_READ,
    ORG_UPDATE,
    ORG_CREATE,
    ORG_DELETE,

    // ─── User Management ────────────────────────────
    USER_CREATE,
    USER_READ,
    USER_UPDATE,
    USER_DELETE,

    // ─── Settings ───────────────────────────────────
    SETTINGS_READ,
    SETTINGS_UPDATE
}
