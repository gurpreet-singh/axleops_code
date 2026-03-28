package com.fleetmanagement.entity;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

import static com.fleetmanagement.entity.Authority.*;

/**
 * Tenant-level roles. Each enum constant carries its display name,
 * department, and the complete set of authorities it grants.
 *
 * <p>Adding a new role or modifying authority mappings is a code change —
 * nothing is stored in the database. The only DB artefact is the
 * {@code tenant_user_role} join table which stores enum name strings.</p>
 */
public enum Role {

    OWNER_DIRECTOR("Owner / Director", "Executive",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_CREATE, TRIP_READ, TRIP_UPDATE, TRIP_DELETE, TRIP_APPROVE,
            TRIP_ASSIGN_DRIVER, TRIP_ASSIGN_VEHICLE,
            // Billing
            BILL_CREATE, BILL_READ, BILL_UPDATE, BILL_DELETE, BILL_APPROVE,
            // Vehicles
            VEHICLE_CREATE, VEHICLE_READ, VEHICLE_UPDATE, VEHICLE_DELETE,
            // Equipment
            EQUIPMENT_CREATE, EQUIPMENT_READ, EQUIPMENT_UPDATE, EQUIPMENT_DELETE,
            // Inspections
            INSPECTION_CREATE, INSPECTION_READ, INSPECTION_UPDATE,
            // Service
            SERVICE_CREATE, SERVICE_READ, SERVICE_UPDATE, SERVICE_DELETE, SERVICE_APPROVE,
            // Vendors
            VENDOR_CREATE, VENDOR_READ, VENDOR_UPDATE, VENDOR_DELETE,
            // Parts
            PARTS_CREATE, PARTS_READ, PARTS_UPDATE, PARTS_DELETE,
            // Ledger
            LEDGER_CREATE, LEDGER_READ, LEDGER_UPDATE, LEDGER_DELETE, LEDGER_APPROVE,
            // Financial reports
            FINANCIAL_REPORT_READ, FINANCIAL_REPORT_EXPORT,
            // Operational reports
            REPORT_READ, REPORT_EXPORT,
            // Alerts
            ALERT_READ, ALERT_CONFIGURE,
            // Reminders
            REMINDER_CREATE, REMINDER_READ, REMINDER_UPDATE,
            // Accounts
            ACCOUNT_CREATE, ACCOUNT_READ, ACCOUNT_UPDATE, ACCOUNT_DELETE,
            // Workshop
            WORKSHOP_PLAN_CREATE, WORKSHOP_PLAN_READ, WORKSHOP_PLAN_UPDATE, WORKSHOP_PLAN_DELETE,
            // Org
            ORG_READ, ORG_UPDATE, ORG_CREATE, ORG_DELETE,
            // Users
            USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE,
            // Settings
            SETTINGS_READ, SETTINGS_UPDATE
        )
    ),

    BRANCH_MANAGER("Branch Manager", "Executive",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_CREATE, TRIP_READ, TRIP_UPDATE, TRIP_APPROVE,
            // Billing
            BILL_CREATE, BILL_READ, BILL_UPDATE,
            // Vehicles
            VEHICLE_READ, VEHICLE_UPDATE,
            // Equipment
            EQUIPMENT_READ,
            // Inspections
            INSPECTION_CREATE, INSPECTION_READ, INSPECTION_UPDATE,
            // Service
            SERVICE_CREATE, SERVICE_READ, SERVICE_UPDATE, SERVICE_APPROVE,
            // Vendors
            VENDOR_READ,
            // Parts
            PARTS_READ,
            // Ledger
            LEDGER_CREATE, LEDGER_READ, LEDGER_UPDATE,
            // Financial reports
            FINANCIAL_REPORT_READ,
            // Operational reports
            REPORT_READ, REPORT_EXPORT,
            // Alerts
            ALERT_READ,
            // Reminders
            REMINDER_CREATE, REMINDER_READ, REMINDER_UPDATE,
            // Accounts
            ACCOUNT_READ,
            // Workshop
            WORKSHOP_PLAN_CREATE, WORKSHOP_PLAN_READ, WORKSHOP_PLAN_UPDATE,
            // Org
            ORG_READ,
            // Settings
            SETTINGS_READ
        )
    ),

    FLEET_MANAGER("Fleet Manager", "Operations",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_CREATE, TRIP_READ, TRIP_UPDATE, TRIP_DELETE, TRIP_APPROVE,
            TRIP_ASSIGN_DRIVER, TRIP_ASSIGN_VEHICLE,
            // Billing
            BILL_READ,
            // Vehicles
            VEHICLE_CREATE, VEHICLE_READ, VEHICLE_UPDATE,
            // Equipment
            EQUIPMENT_CREATE, EQUIPMENT_READ, EQUIPMENT_UPDATE,
            // Inspections
            INSPECTION_CREATE, INSPECTION_READ, INSPECTION_UPDATE,
            // Service
            SERVICE_CREATE, SERVICE_READ, SERVICE_UPDATE,
            // Vendors
            VENDOR_READ,
            // Parts
            PARTS_READ,
            // Operational reports
            REPORT_READ,
            // Alerts
            ALERT_READ,
            // Reminders
            REMINDER_CREATE, REMINDER_READ, REMINDER_UPDATE,
            // Workshop
            WORKSHOP_PLAN_CREATE, WORKSHOP_PLAN_READ, WORKSHOP_PLAN_UPDATE
        )
    ),

    OPERATIONS_EXECUTIVE("Operations Executive", "Operations",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_CREATE, TRIP_READ, TRIP_UPDATE,
            TRIP_ASSIGN_DRIVER, TRIP_ASSIGN_VEHICLE,
            // Billing
            BILL_READ,
            // Vehicles
            VEHICLE_READ,
            // Equipment
            EQUIPMENT_READ,
            // Inspections
            INSPECTION_CREATE, INSPECTION_READ,
            // Service
            SERVICE_CREATE, SERVICE_READ,
            // Vendors
            VENDOR_READ,
            // Operational reports
            REPORT_READ,
            // Alerts
            ALERT_READ
        )
    ),

    DRIVER("Driver", "Operations",
        EnumSet.of(
            TRIP_READ_OWN,
            TRIP_UPDATE_STATUS,
            VEHICLE_READ_ASSIGNED,
            INSPECTION_CREATE_OWN,
            INSPECTION_READ_OWN,
            SERVICE_CREATE_BREAKDOWN,
            REMINDER_READ_OWN
        )
    ),

    FINANCE_CONTROLLER("Finance Controller", "Finance & Accounts",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_READ,
            // Billing
            BILL_CREATE, BILL_READ, BILL_UPDATE, BILL_DELETE, BILL_APPROVE,
            // Vehicles
            VEHICLE_READ,
            // Equipment
            EQUIPMENT_READ,
            // Service
            SERVICE_READ, SERVICE_APPROVE,
            // Vendors
            VENDOR_CREATE, VENDOR_READ, VENDOR_UPDATE,
            // Parts
            PARTS_READ,
            // Ledger
            LEDGER_CREATE, LEDGER_READ, LEDGER_UPDATE, LEDGER_DELETE, LEDGER_APPROVE, LEDGER_POST,
            // Financial reports
            FINANCIAL_REPORT_READ, FINANCIAL_REPORT_EXPORT,
            // Operational reports
            REPORT_READ, REPORT_EXPORT,
            // Alerts
            ALERT_READ, ALERT_CONFIGURE,
            // Reminders
            REMINDER_READ,
            // Accounts
            ACCOUNT_CREATE, ACCOUNT_READ, ACCOUNT_UPDATE, ACCOUNT_DELETE,
            // Workshop
            WORKSHOP_PLAN_READ,
            // Org
            ORG_READ,
            // Settings
            SETTINGS_READ
        )
    ),

    ACCOUNTS_EXECUTIVE("Accounts Executive", "Finance & Accounts",
        EnumSet.of(
            DASHBOARD_READ,
            // Trip
            TRIP_READ,
            // Billing
            BILL_CREATE, BILL_READ, BILL_UPDATE,
            // Vehicles
            VEHICLE_READ,
            // Service
            SERVICE_READ,
            // Vendors
            VENDOR_READ,
            // Ledger
            LEDGER_CREATE, LEDGER_READ, LEDGER_UPDATE,
            // Financial reports
            FINANCIAL_REPORT_READ,
            // Accounts
            ACCOUNT_CREATE, ACCOUNT_READ, ACCOUNT_UPDATE
        )
    ),

    WORKSHOP_MANAGER("Workshop Manager", "Maintenance",
        EnumSet.of(
            DASHBOARD_READ,
            // Vehicles
            VEHICLE_READ, VEHICLE_UPDATE,
            // Equipment
            EQUIPMENT_CREATE, EQUIPMENT_READ, EQUIPMENT_UPDATE, EQUIPMENT_DELETE,
            // Inspections
            INSPECTION_CREATE, INSPECTION_READ, INSPECTION_UPDATE, INSPECTION_APPROVE,
            // Service
            SERVICE_CREATE, SERVICE_READ, SERVICE_UPDATE, SERVICE_DELETE, SERVICE_APPROVE,
            // Vendors
            VENDOR_CREATE, VENDOR_READ, VENDOR_UPDATE,
            // Parts
            PARTS_CREATE, PARTS_READ, PARTS_UPDATE,
            // Operational reports
            REPORT_READ,
            // Alerts
            ALERT_READ,
            // Reminders
            REMINDER_CREATE, REMINDER_READ, REMINDER_UPDATE,
            // Workshop
            WORKSHOP_PLAN_CREATE, WORKSHOP_PLAN_READ, WORKSHOP_PLAN_UPDATE, WORKSHOP_PLAN_DELETE
        )
    ),

    MECHANIC("Mechanic", "Maintenance",
        EnumSet.of(
            // Equipment
            EQUIPMENT_READ,
            // Inspections
            INSPECTION_CREATE_OWN, INSPECTION_READ_OWN,
            // Service
            SERVICE_READ_OWN, SERVICE_UPDATE_OWN,
            // Parts
            PARTS_READ, PARTS_REQUEST,
            // Reminders
            REMINDER_READ_OWN,
            // Workshop
            WORKSHOP_PLAN_READ_OWN
        )
    ),

    INVENTORY_MANAGER("Inventory Manager", "Inventory",
        EnumSet.of(
            DASHBOARD_READ,
            // Equipment
            EQUIPMENT_CREATE, EQUIPMENT_READ, EQUIPMENT_UPDATE,
            // Service
            SERVICE_READ,
            // Vendors
            VENDOR_CREATE, VENDOR_READ, VENDOR_UPDATE,
            // Parts
            PARTS_CREATE, PARTS_READ, PARTS_UPDATE, PARTS_DELETE, PARTS_APPROVE_PO,
            // Operational reports
            REPORT_READ,
            // Alerts
            ALERT_READ,
            // Reminders
            REMINDER_CREATE, REMINDER_READ, REMINDER_UPDATE,
            // Workshop
            WORKSHOP_PLAN_READ
        )
    ),

    SUPER_ADMIN("Super Admin", "System Administration",
        EnumSet.allOf(Authority.class)
    );

    private final String displayName;
    private final String department;
    private final Set<Authority> authorities;

    Role(String displayName, String department, Set<Authority> authorities) {
        this.displayName = displayName;
        this.department = department;
        this.authorities = Collections.unmodifiableSet(authorities);
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDepartment() {
        return department;
    }

    public Set<Authority> getAuthorities() {
        return authorities;
    }
}
