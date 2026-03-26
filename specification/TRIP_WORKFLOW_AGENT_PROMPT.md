# Coding Agent Prompt: Trip Workflow State Machine Implementation

> **System**: You are a senior full-stack engineer implementing the Trip Workflow State Machine for a transport and logistics management system (TMS) called TripFlow. The system uses a **3-domain architecture**: Operations (trip lifecycle), Finance (invoices & payments), and Expense (standalone cost tracking). Each domain owns its own lifecycle with no shared states. The state machine must be correct, configurable, and produce an immutable audit trail.

---

## 1. WHAT YOU ARE BUILDING

A configurable, event-driven state machine that manages the trip lifecycle within the **Operations domain** — from creation through delivery, POD verification, and settlement. The trip's terminal state is **SETTLED**. After settlement, the Finance domain independently handles invoicing and payments.

The Operations domain handles:

- **4 primary phases** (Created → In Transit → Completed → Settled) with internal sub-states
- **13 exception states** (breakdown, accident, load transfer, cargo damage, etc.)
- **2 parallel sub-processes** (E-Way Bill, POD) each with their own state lifecycle
- **5 configurable workflow templates** (Standard, Express, Heavy Cargo, Hazmat, Multi-Drop) that enable/disable specific states and transitions
- **30+ validated state transitions** with guard conditions and side effects
- **Event emission** on every transition — the Finance domain listens for `trip.settled` to enable invoicing
- **Immutable audit trail** logging every state change with who, when, from, to, GPS, and evidence

> **Important domain boundary:** There is NO "invoiced", "billed", or "closed" state on the trip. The Invoice sub-process has been moved to the Finance domain. Settled trips become billable line items via event-driven handoff.

### Tech stack:
- **Backend**: Node.js / NestJS with TypeScript
- **Database**: PostgreSQL with Knex or TypeORM
- **Frontend**: React + TypeScript (reference JSX screens provided)
- **Real-time**: WebSocket for live Kanban updates
- **Queue**: Bull (Redis) for async side effects (notifications, EWB API calls, GPS processing)

---

## 2. DATABASE SCHEMA

### 2.1 trips table — enhanced fields

Add these columns to the existing trips table:

```sql
-- Primary workflow state (Operations domain — no invoice/billing states)
-- SETTLED is the terminal state. Finance domain handles invoicing independently.
ALTER TABLE trips ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
  CHECK (status IN (
    'DRAFT','CREATED','DISPATCHED','ACCEPTED',
    'AT_ORIGIN','LOADING','LOADED','EWB_PENDING',
    'DEPARTED','IN_TRANSIT','AT_CHECKPOINT',
    'AT_DESTINATION','UNLOADING','DELIVERED',
    'POD_SUBMITTED','POD_VERIFIED','POD_DISPUTED',
    'SETTLED',
    -- Exception states
    'DRIVER_REJECTED','VEHICLE_BREAKDOWN','ACCIDENT',
    'LOAD_TRANSFER','ROUTE_BLOCKED','CARGO_DAMAGE',
    'CARGO_SHORTAGE','DELIVERY_REJECTED','EWB_EXPIRED',
    'DETENTION_EXCEEDED','DRIVER_UNREACHABLE','GPS_LOST',
    'CANCELLED','TRANSFERRED'
  ));

-- Workflow template (determines which transitions are active)
ALTER TABLE trips ADD COLUMN workflow_template VARCHAR(20) NOT NULL DEFAULT 'Standard'
  CHECK (workflow_template IN ('Standard','Express','Heavy Cargo','Hazmat','Multi-Drop'));

-- E-Way Bill parallel sub-state
ALTER TABLE trips ADD COLUMN ewb_status VARCHAR(25) NOT NULL DEFAULT 'NOT_REQUIRED'
  CHECK (ewb_status IN (
    'NOT_REQUIRED','PENDING_GENERATION','GENERATED','GENERATION_FAILED',
    'ACTIVE','EXPIRING_SOON','EXPIRED','EXTENDED','CANCELLED'
  ));
ALTER TABLE trips ADD COLUMN ewb_number VARCHAR(12);
ALTER TABLE trips ADD COLUMN ewb_valid_from TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN ewb_valid_until TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN ewb_part_b_updated BOOLEAN DEFAULT false;

-- POD parallel sub-state
ALTER TABLE trips ADD COLUMN pod_status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED'
  CHECK (pod_status IN (
    'NOT_STARTED','AWAITING_SUBMISSION','SUBMITTED',
    'VERIFICATION_IN_PROGRESS','VERIFIED_CLEAN','VERIFIED_WITH_REMARKS',
    'REJECTED','RESUBMISSION_REQUESTED','DISPUTED'
  ));

-- NOTE: Invoice status has been REMOVED from the trips table.
-- The Finance domain (invoices table) independently tracks invoice lifecycle.
-- Settled trips become billable line items via the trip.settled event.

-- Load transfer fields
ALTER TABLE trips ADD COLUMN parent_trip_id UUID REFERENCES trips(id);
ALTER TABLE trips ADD COLUMN is_transferred BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE trips ADD COLUMN transferred_to UUID REFERENCES trips(id);
ALTER TABLE trips ADD COLUMN transfer_reason VARCHAR(30)
  CHECK (transfer_reason IN ('BREAKDOWN','ACCIDENT','VEHICLE_REASSIGNMENT','DRIVER_CHANGE'));
ALTER TABLE trips ADD COLUMN transfer_location_lat DECIMAL(10,7);
ALTER TABLE trips ADD COLUMN transfer_location_lng DECIMAL(10,7);
ALTER TABLE trips ADD COLUMN transfer_timestamp TIMESTAMPTZ;

-- Multi-stop
ALTER TABLE trips ADD COLUMN is_multi_stop BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE trips ADD COLUMN total_stops INTEGER DEFAULT 2; -- origin + destination

-- Loading/departure data
ALTER TABLE trips ADD COLUMN loaded_weight_mt DECIMAL(10,2);
ALTER TABLE trips ADD COLUMN seal_number VARCHAR(30);
ALTER TABLE trips ADD COLUMN gate_pass_number VARCHAR(30);
ALTER TABLE trips ADD COLUMN departure_odometer INTEGER;
ALTER TABLE trips ADD COLUMN arrival_odometer INTEGER;
ALTER TABLE trips ADD COLUMN actual_distance_km DECIMAL(10,2);

-- Detention
ALTER TABLE trips ADD COLUMN loading_detention_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE trips ADD COLUMN unloading_detention_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE trips ADD COLUMN detention_charge DECIMAL(12,2) DEFAULT 0;

-- Timestamps for each state (for SLA calculation and analytics)
ALTER TABLE trips ADD COLUMN dispatched_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN accepted_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN arrived_origin_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN loading_started_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN loading_completed_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN departed_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN arrived_destination_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN unloading_started_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN delivered_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN pod_submitted_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN pod_verified_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN settled_at TIMESTAMPTZ;
-- invoiced_at and closed_at REMOVED — these belong to the Finance domain
ALTER TABLE trips ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE trips ADD COLUMN cancelled_by UUID REFERENCES users(id);
ALTER TABLE trips ADD COLUMN cancellation_reason TEXT;

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_ewb_status ON trips(ewb_status);
CREATE INDEX idx_trips_template ON trips(workflow_template);
CREATE INDEX idx_trips_parent ON trips(parent_trip_id);
```

### 2.2 trip_state_transitions — immutable audit log

```sql
CREATE TABLE trip_state_transitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES trips(id),
  from_state      VARCHAR(30) NOT NULL,
  to_state        VARCHAR(30) NOT NULL,
  triggered_by    UUID REFERENCES users(id),  -- NULL for system triggers
  trigger_type    VARCHAR(20) NOT NULL CHECK (trigger_type IN (
    'MANUAL','AUTO','GPS_GEOFENCE','TIMER','API','SYSTEM'
  )),
  reason          TEXT,
  notes           TEXT,
  evidence_urls   TEXT[],  -- photos, documents
  gps_lat         DECIMAL(10,7),
  gps_lng         DECIMAL(10,7),
  metadata        JSONB,  -- additional context data
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- THIS TABLE IS APPEND-ONLY. NO UPDATE OR DELETE OPERATIONS ALLOWED.
-- Enforce with a trigger:
CREATE OR REPLACE FUNCTION prevent_transition_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'trip_state_transitions is append-only. Updates and deletes are not allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER no_update_transitions
  BEFORE UPDATE OR DELETE ON trip_state_transitions
  FOR EACH ROW EXECUTE FUNCTION prevent_transition_modification();

CREATE INDEX idx_transitions_trip ON trip_state_transitions(trip_id);
CREATE INDEX idx_transitions_created ON trip_state_transitions(created_at);
```

### 2.3 trip_stops — for multi-stop trips

```sql
CREATE TABLE trip_stops (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id               UUID NOT NULL REFERENCES trips(id),
  stop_number           INTEGER NOT NULL,
  stop_type             VARCHAR(15) NOT NULL CHECK (stop_type IN ('PICKUP','DROP','CHECKPOINT')),
  location_name         VARCHAR(200) NOT NULL,
  address               TEXT,
  pincode               VARCHAR(6),
  latitude              DECIMAL(10,7),
  longitude             DECIMAL(10,7),
  geofence_radius_m     INTEGER DEFAULT 500,
  cargo_action          VARCHAR(20) CHECK (cargo_action IN (
    'FULL_LOAD','PARTIAL_UNLOAD','FULL_UNLOAD','INSPECTION_ONLY'
  )),
  cargo_qty_to_deliver  DECIMAL(10,2),
  actual_qty_delivered  DECIMAL(10,2),
  expected_arrival      TIMESTAMPTZ,
  actual_arrival        TIMESTAMPTZ,
  expected_departure    TIMESTAMPTZ,
  actual_departure      TIMESTAMPTZ,
  receiver_name         VARCHAR(100),
  receiver_phone        VARCHAR(15),
  receiver_signature_url VARCHAR(500),
  stop_status           VARCHAR(15) NOT NULL DEFAULT 'PENDING' CHECK (stop_status IN (
    'PENDING','ARRIVED','IN_PROGRESS','COMPLETED','SKIPPED'
  )),
  detention_start       TIMESTAMPTZ,
  detention_end         TIMESTAMPTZ,
  detention_hours       DECIMAL(6,2) DEFAULT 0,
  detention_charge      DECIMAL(12,2) DEFAULT 0,
  skip_reason           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(trip_id, stop_number)
);
```

### 2.4 workflow_templates — configurable

```sql
CREATE TABLE workflow_templates (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        VARCHAR(30) UNIQUE NOT NULL,
  description                 TEXT,
  is_active                   BOOLEAN NOT NULL DEFAULT true,
  -- Feature flags (each controls whether a state/transition is enabled)
  pre_departure_checklist     VARCHAR(15) DEFAULT 'Optional' CHECK (pre_departure_checklist IN ('Mandatory','Optional','Disabled')),
  at_origin_state_enabled     BOOLEAN DEFAULT true,
  weight_verification_loading VARCHAR(15) DEFAULT 'Optional' CHECK (weight_verification_loading IN ('Mandatory','Optional','Disabled')),
  seal_capture                VARCHAR(15) DEFAULT 'Optional' CHECK (seal_capture IN ('Mandatory','Optional','Disabled')),
  ewb_generation              VARCHAR(20) DEFAULT 'Auto' CHECK (ewb_generation IN ('Always','Auto','Disabled')),
  gps_tracking_frequency_sec  INTEGER DEFAULT 60,
  checkpoints_enabled         BOOLEAN DEFAULT false,
  checkpoint_interval_km      INTEGER,  -- e.g., 200 for Hazmat
  at_destination_state_enabled BOOLEAN DEFAULT true,
  unloading_verification      VARCHAR(15) DEFAULT 'Enabled' CHECK (unloading_verification IN ('Mandatory','Enabled','Skipped')),
  weight_verification_unloading VARCHAR(15) DEFAULT 'Optional' CHECK (weight_verification_unloading IN ('Mandatory','Optional','Disabled')),
  pod_min_photos              INTEGER DEFAULT 2,
  pod_weight_slip_required    BOOLEAN DEFAULT false,
  pod_receiver_signature      VARCHAR(20) DEFAULT 'Mandatory' CHECK (pod_receiver_signature IN ('Mandatory','Mandatory + stamp','Optional','Disabled')),
  auto_settlement             VARCHAR(30) DEFAULT 'Yes' CHECK (auto_settlement IN ('Yes','Yes (if no exceptions)','Manual review','After all drops')),
  detention_tracking          VARCHAR(15) DEFAULT 'Yes' CHECK (detention_tracking IN ('Yes','Yes (strict)','Yes (per stop)','No')),
  -- Metadata
  vehicle_count               INTEGER DEFAULT 0,  -- how many vehicles use this template
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the 5 default templates
INSERT INTO workflow_templates (name, description, pre_departure_checklist, at_origin_state_enabled, weight_verification_loading, seal_capture, ewb_generation, gps_tracking_frequency_sec, checkpoints_enabled, at_destination_state_enabled, unloading_verification, weight_verification_unloading, pod_min_photos, pod_weight_slip_required, pod_receiver_signature, auto_settlement, detention_tracking) VALUES
('Standard', 'Default for FMCG, general cargo', 'Optional', true, 'Optional', 'Optional', 'Auto', 60, false, true, 'Enabled', 'Optional', 2, false, 'Mandatory', 'Yes (if no exceptions)', 'Yes'),
('Express', 'Fast turnaround, skip verifications', 'Disabled', false, 'Disabled', 'Disabled', 'Auto', 30, false, false, 'Skipped', 'Disabled', 1, false, 'Mandatory', 'Yes', 'No'),
('Heavy Cargo', 'Steel, machinery, full verification', 'Mandatory', true, 'Mandatory', 'Mandatory', 'Always', 30, false, true, 'Mandatory', 'Mandatory', 4, true, 'Mandatory', 'Manual review', 'Yes (strict)'),
('Hazmat', 'Chemicals, max safety', 'Mandatory', true, 'Mandatory', 'Mandatory', 'Always', 15, true, true, 'Mandatory', 'Mandatory', 4, true, 'Mandatory + stamp', 'Manual review', 'Yes (strict)'),
('Multi-Drop', 'Multiple delivery points', 'Optional', true, 'Disabled', 'Optional', 'Auto', 30, true, true, 'Enabled', 'Disabled', 2, false, 'Mandatory', 'After all drops', 'Yes (per stop)');
```

### 2.5 Finance Domain — invoices, payments, receivables

> **These tables belong to the Finance domain.** They have no shared states with the trips table.
> Settled trips become invoice line items via the `trip.settled` event.

```sql
-- Invoice lifecycle: DRAFT → SENT → PARTIAL → PAID
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    VARCHAR(30) UNIQUE NOT NULL,  -- auto-generated, e.g. INV-2024-0001
  client_id         UUID NOT NULL REFERENCES clients(id),
  branch_id         UUID REFERENCES branches(id),
  status            VARCHAR(15) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','SENT','PARTIAL','PAID')),
  invoice_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date          DATE,
  subtotal          DECIMAL(14,2) NOT NULL DEFAULT 0,
  gst_type          VARCHAR(20) CHECK (gst_type IN ('IGST','CGST_SGST')),
  cgst_amount       DECIMAL(12,2) DEFAULT 0,
  sgst_amount       DECIMAL(12,2) DEFAULT 0,
  igst_amount       DECIMAL(12,2) DEFAULT 0,
  total_amount      DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount_paid       DECIMAL(14,2) NOT NULL DEFAULT 0,
  amount_outstanding DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes             TEXT,
  sent_at           TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Line items: each settled trip becomes a line item
CREATE TABLE invoice_line_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  trip_id           UUID NOT NULL REFERENCES trips(id),
  description       TEXT NOT NULL,  -- e.g. "Freight: Mumbai → Delhi (TRP-4824)"
  hsn_code          VARCHAR(10) DEFAULT '9965',
  rate_type         VARCHAR(15),  -- Per KM, Per Trip, Per Tonne, etc.
  quantity          DECIMAL(10,2),
  rate              DECIMAL(12,2),
  amount            DECIMAL(14,2) NOT NULL,
  fuel_surcharge    DECIMAL(12,2) DEFAULT 0,
  deductions        DECIMAL(12,2) DEFAULT 0,
  net_amount        DECIMAL(14,2) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(invoice_id, trip_id)  -- a trip can appear in only one invoice
);

-- Payments: recorded against invoices, not trips
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id        UUID NOT NULL REFERENCES invoices(id),
  payment_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  amount            DECIMAL(14,2) NOT NULL,
  payment_mode      VARCHAR(20) NOT NULL CHECK (payment_mode IN (
    'BANK_TRANSFER','CHEQUE','UPI','CASH','NEFT','RTGS'
  )),
  reference_number  VARCHAR(50),  -- UTR, cheque number, etc.
  notes             TEXT,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_line_items_trip ON invoice_line_items(trip_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
```

### 2.6 Expense Domain — standalone cost tracking

> **These tables are completely standalone.** No FK to trips or invoices.
> Tagged by vehicle + category. Reports join across domains when needed.

```sql
-- Expense entries: tagged by vehicle + category
CREATE TABLE expense_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id        UUID REFERENCES vehicles(id),  -- tagged, not FK to trips
  driver_id         UUID REFERENCES drivers(id),
  branch_id         UUID REFERENCES branches(id),
  category          VARCHAR(30) NOT NULL CHECK (category IN (
    'DIESEL','TOLL','MAINTENANCE','TYRE','INSURANCE',
    'PERMIT','PARKING','DRIVER_FOOD','MISC'
  )),
  description       TEXT,
  amount            DECIMAL(12,2) NOT NULL,
  expense_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url       VARCHAR(500),
  status            VARCHAR(15) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','APPROVED','REJECTED','PAID')),
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cash vouchers: approve + disburse
CREATE TABLE cash_vouchers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number    VARCHAR(30) UNIQUE NOT NULL,
  vehicle_id        UUID REFERENCES vehicles(id),
  driver_id         UUID REFERENCES drivers(id),
  branch_id         UUID REFERENCES branches(id),
  purpose           TEXT NOT NULL,
  amount            DECIMAL(12,2) NOT NULL,
  status            VARCHAR(15) NOT NULL DEFAULT 'REQUESTED'
    CHECK (status IN ('REQUESTED','APPROVED','DISBURSED','REJECTED')),
  requested_by      UUID REFERENCES users(id),
  approved_by       UUID REFERENCES users(id),
  approved_at       TIMESTAMPTZ,
  disbursed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Driver advances: track + deduct
CREATE TABLE driver_advances (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id         UUID NOT NULL REFERENCES drivers(id),
  amount            DECIMAL(12,2) NOT NULL,
  advance_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode      VARCHAR(20) CHECK (payment_mode IN (
    'CASH','BANK_TRANSFER','UPI'
  )),
  purpose           TEXT,  -- e.g. "Trip advance for Mumbai→Delhi"
  is_recovered      BOOLEAN NOT NULL DEFAULT false,
  recovered_amount  DECIMAL(12,2) DEFAULT 0,
  recovered_at      TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_vehicle ON expense_entries(vehicle_id);
CREATE INDEX idx_expenses_category ON expense_entries(category);
CREATE INDEX idx_vouchers_driver ON cash_vouchers(driver_id);
CREATE INDEX idx_advances_driver ON driver_advances(driver_id);
```

---

## 3. STATE MACHINE ENGINE

This is the core service. Implement as `TripStateMachine` service.

```typescript
// src/services/trip-state-machine.ts

interface TransitionRule {
  from: string;
  to: string;
  trigger: string;
  guard: (trip: Trip, context: TransitionContext) => Promise<{ valid: boolean; error?: string }>;
  sideEffects: (trip: Trip, context: TransitionContext) => Promise<void>;
  configurable?: string; // feature flag name in workflow_template
}

interface TransitionContext {
  userId?: string;
  triggerType: 'MANUAL' | 'AUTO' | 'GPS_GEOFENCE' | 'TIMER' | 'API' | 'SYSTEM';
  reason?: string;
  notes?: string;
  evidence?: string[];
  gpsLat?: number;
  gpsLng?: number;
  metadata?: Record<string, any>;
}

// THE COMPLETE TRANSITION TABLE
// Every valid transition is defined here. Any transition NOT in this table is REJECTED.
const TRANSITIONS: TransitionRule[] = [

  // ═══ HAPPY PATH ═══

  {
    from: 'DRAFT', to: 'CREATED',
    trigger: 'save_complete',
    guard: async (trip) => {
      const missing = [];
      if (!trip.client_id) missing.push('client');
      if (!trip.route_id) missing.push('route');
      if (!trip.vehicle_id) missing.push('vehicle');
      if (!trip.driver_id) missing.push('driver');
      if (!trip.cargo_weight_mt) missing.push('cargo_weight');
      if (!trip.cargo_description) missing.push('cargo_description');
      if (missing.length > 0) return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
      return { valid: true };
    },
    sideEffects: async (trip) => {
      // Check client credit limit
      await creditCheckService.validateExposure(trip.client_id, trip.estimated_freight);
    },
  },

  {
    from: 'CREATED', to: 'DISPATCHED',
    trigger: 'dispatch',
    guard: async (trip) => {
      const vehicle = await vehicleService.getById(trip.vehicle_id);
      if (vehicle.status !== 'Available') return { valid: false, error: `Vehicle ${vehicle.number} is not available (status: ${vehicle.status})` };
      const driver = await driverService.getById(trip.driver_id);
      if (driver.status !== 'Available') return { valid: false, error: `Driver ${driver.name} is on another trip` };
      const creditCheck = await creditCheckService.validateExposure(trip.client_id, trip.estimated_freight);
      if (!creditCheck.allowed) return { valid: false, error: `Client credit limit exceeded. Exposure: ${creditCheck.exposure}, Limit: ${creditCheck.limit}` };
      return { valid: true };
    },
    sideEffects: async (trip) => {
      // Send push + SMS to driver
      await notificationService.send({
        channels: ['push', 'sms'],
        recipientId: trip.driver_id,
        template: 'trip_dispatched',
        data: { tripId: trip.id, route: trip.route_description, cargo: trip.cargo_description },
      });
      // Start accept timeout timer
      await timerService.start({
        type: 'accept_timeout',
        tripId: trip.id,
        durationMinutes: trip.accept_timeout_minutes || 30, // configurable per client
        onExpiry: 'auto_reject',
      });
      // Update timestamps
      await db('trips').where('id', trip.id).update({ dispatched_at: new Date() });
    },
  },

  {
    from: 'DISPATCHED', to: 'ACCEPTED',
    trigger: 'driver_accepts',
    guard: async (trip, ctx) => {
      // Must be the assigned driver
      if (ctx.userId !== trip.driver_id) return { valid: false, error: 'Only the assigned driver can accept' };
      // Must be within accept timeout
      const timer = await timerService.get('accept_timeout', trip.id);
      if (timer && timer.expired) return { valid: false, error: 'Accept timeout expired' };
      return { valid: true };
    },
    sideEffects: async (trip) => {
      await timerService.cancel('accept_timeout', trip.id);
      await notificationService.send({
        channels: ['in_app'],
        recipientId: trip.dispatcher_id,
        template: 'trip_accepted',
        data: { tripId: trip.id, driverName: trip.driver_name },
      });
      // Generate pre-departure checklist if template requires it
      const template = await getWorkflowTemplate(trip.workflow_template);
      if (template.pre_departure_checklist !== 'Disabled') {
        await checklistService.create(trip.id, 'pre_departure');
      }
      await db('trips').where('id', trip.id).update({ accepted_at: new Date() });
    },
  },

  {
    from: 'DISPATCHED', to: 'DRIVER_REJECTED',
    trigger: 'driver_rejects',
    guard: async (trip, ctx) => {
      if (!ctx.reason) return { valid: false, error: 'Rejection reason required' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await timerService.cancel('accept_timeout', trip.id);
      await notificationService.send({
        channels: ['in_app', 'email'],
        recipientId: trip.dispatcher_id,
        template: 'trip_rejected',
        data: { tripId: trip.id, driverName: trip.driver_name, reason: ctx.reason },
      });
      // Auto-transition to CREATED for reassignment
      await this.transition(trip.id, 'CREATED', { triggerType: 'SYSTEM', reason: 'Driver rejected. Needs reassignment.' });
      // Unassign driver
      await db('trips').where('id', trip.id).update({ driver_id: null });
    },
  },

  {
    from: 'DISPATCHED', to: 'CREATED',
    trigger: 'accept_timeout',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      await notificationService.send({
        channels: ['in_app', 'push'],
        recipientId: trip.dispatcher_id,
        template: 'accept_timeout',
        data: { tripId: trip.id, driverName: trip.driver_name },
      });
      await db('trips').where('id', trip.id).update({ driver_id: null });
    },
  },

  // AT_ORIGIN — configurable
  {
    from: 'ACCEPTED', to: 'AT_ORIGIN',
    trigger: 'arrive_origin',
    guard: async (trip) => ({ valid: true }),
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({ arrived_origin_at: new Date() });
      // Start detention timer
      const contract = await contractService.getActiveForTrip(trip);
      if (contract.loading_detention_free_hrs) {
        await timerService.start({
          type: 'loading_detention',
          tripId: trip.id,
          durationMinutes: contract.loading_detention_free_hrs * 60,
          onExpiry: 'detention_alert',
        });
      }
    },
    configurable: 'at_origin_state_enabled', // if false, skip this state
  },

  {
    from: 'ACCEPTED', to: 'LOADING',
    trigger: 'skip_to_loading',
    guard: async (trip) => {
      const template = await getWorkflowTemplate(trip.workflow_template);
      if (template.at_origin_state_enabled) return { valid: false, error: 'AT_ORIGIN is enabled for this template' };
      return { valid: true };
    },
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({
        arrived_origin_at: new Date(),
        loading_started_at: new Date(),
      });
    },
  },

  {
    from: 'AT_ORIGIN', to: 'LOADING',
    trigger: 'start_loading',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip, ctx) => {
      await db('trips').where('id', trip.id).update({
        loading_started_at: new Date(),
        ...(ctx.metadata?.dock_number ? { dock_number: ctx.metadata.dock_number } : {}),
      });
    },
  },

  {
    from: 'LOADING', to: 'LOADED',
    trigger: 'complete_loading',
    guard: async (trip, ctx) => {
      const template = await getWorkflowTemplate(trip.workflow_template);
      // Weight verification
      if (template.weight_verification_loading === 'Mandatory') {
        if (!ctx.metadata?.loaded_weight) return { valid: false, error: 'Weight verification is mandatory. loaded_weight required.' };
        const deviation = Math.abs(ctx.metadata.loaded_weight - trip.cargo_weight_mt) / trip.cargo_weight_mt;
        if (deviation > 0.05) return { valid: false, error: `Weight deviation ${(deviation * 100).toFixed(1)}% exceeds 5% tolerance. Loaded: ${ctx.metadata.loaded_weight} MT vs Declared: ${trip.cargo_weight_mt} MT` };
      }
      // Seal capture
      if (template.seal_capture === 'Mandatory') {
        if (!ctx.metadata?.seal_number) return { valid: false, error: 'Seal number is mandatory for this workflow template.' };
      }
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await db('trips').where('id', trip.id).update({
        loading_completed_at: new Date(),
        loaded_weight_mt: ctx.metadata?.loaded_weight || trip.cargo_weight_mt,
        seal_number: ctx.metadata?.seal_number,
        gate_pass_number: ctx.metadata?.gate_pass_number,
      });
      // Generate gate pass
      await gatePassService.generate(trip.id);
      // Check if EWB is needed
      await ewbService.checkAndInitiate(trip);
    },
  },

  // EWB gate
  {
    from: 'LOADED', to: 'EWB_PENDING',
    trigger: 'auto_ewb_check',
    guard: async (trip) => {
      const template = await getWorkflowTemplate(trip.workflow_template);
      if (template.ewb_generation === 'Disabled') return { valid: false };
      if (template.ewb_generation === 'Always') return { valid: true };
      // Auto: check value
      return { valid: trip.consignment_value > 50000 };
    },
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({ ewb_status: 'PENDING_GENERATION' });
      // Trigger EWB generation via NIC API
      await ewbQueue.add('generate', { tripId: trip.id });
    },
  },

  {
    from: 'LOADED', to: 'DEPARTED',
    trigger: 'depart_no_ewb',
    guard: async (trip) => {
      // Can depart without EWB only if value <= 50,000 or EWB already generated
      if (trip.consignment_value > 50000 && trip.ewb_status !== 'GENERATED' && trip.ewb_status !== 'ACTIVE') {
        return { valid: false, error: `Cannot depart: E-Way Bill required (value: ${trip.consignment_value}). Current EWB status: ${trip.ewb_status}` };
      }
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await departTrip(trip, ctx);
    },
  },

  {
    from: 'EWB_PENDING', to: 'DEPARTED',
    trigger: 'ewb_generated',
    guard: async (trip) => {
      if (!trip.ewb_number) return { valid: false, error: 'EWB number not yet received' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await db('trips').where('id', trip.id).update({ ewb_status: 'ACTIVE' });
      await departTrip(trip, ctx);
    },
  },

  // IN_TRANSIT
  {
    from: 'DEPARTED', to: 'IN_TRANSIT',
    trigger: 'gps_movement_detected',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      // Activate high-frequency GPS tracking based on template
      const template = await getWorkflowTemplate(trip.workflow_template);
      await gpsService.setTrackingFrequency(trip.vehicle_id, template.gps_tracking_frequency_sec);
      // Start SLA monitoring
      await slaService.startMonitoring(trip.id);
      // Emit event for live tracking dashboard
      await eventBus.emit('trip.in_transit', { tripId: trip.id });
    },
  },

  // Checkpoint (multi-stop only)
  {
    from: 'IN_TRANSIT', to: 'AT_CHECKPOINT',
    trigger: 'arrive_checkpoint',
    guard: async (trip) => {
      if (!trip.is_multi_stop) return { valid: false, error: 'Checkpoints only for multi-stop trips' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      const stopNumber = ctx.metadata?.stop_number;
      await db('trip_stops').where({ trip_id: trip.id, stop_number: stopNumber }).update({
        actual_arrival: new Date(),
        stop_status: 'ARRIVED',
      });
    },
  },

  {
    from: 'AT_CHECKPOINT', to: 'IN_TRANSIT',
    trigger: 'depart_checkpoint',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip, ctx) => {
      const stopNumber = ctx.metadata?.stop_number;
      await db('trip_stops').where({ trip_id: trip.id, stop_number: stopNumber }).update({
        actual_departure: new Date(),
        stop_status: 'COMPLETED',
      });
    },
  },

  // ARRIVAL AT DESTINATION
  {
    from: 'IN_TRANSIT', to: 'AT_DESTINATION',
    trigger: 'arrive_destination',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({ arrived_destination_at: new Date() });
      // Stop SLA timer and evaluate
      const slaResult = await slaService.stopAndEvaluate(trip.id);
      if (slaResult.breached) {
        await alertService.create({
          type: 'SLA_BREACHED',
          tripId: trip.id,
          severity: 'Critical',
          description: `SLA breached by ${slaResult.hoursLate} hours`,
        });
      }
      // Start unloading detention timer
      const contract = await contractService.getActiveForTrip(trip);
      if (contract.unloading_detention_free_hrs) {
        await timerService.start({
          type: 'unloading_detention',
          tripId: trip.id,
          durationMinutes: contract.unloading_detention_free_hrs * 60,
          onExpiry: 'detention_alert',
        });
      }
    },
  },

  // UNLOADING — configurable
  {
    from: 'AT_DESTINATION', to: 'UNLOADING',
    trigger: 'start_unloading',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({ unloading_started_at: new Date() });
    },
    configurable: 'unloading_verification', // if 'Skipped', skip directly to DELIVERED
  },

  {
    from: 'AT_DESTINATION', to: 'DELIVERED',
    trigger: 'quick_delivery',
    guard: async (trip) => {
      const template = await getWorkflowTemplate(trip.workflow_template);
      if (template.unloading_verification !== 'Skipped' && template.at_destination_state_enabled) {
        return { valid: false, error: 'Unloading verification is enabled. Cannot skip to DELIVERED.' };
      }
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await deliverTrip(trip, ctx);
    },
  },

  {
    from: 'UNLOADING', to: 'DELIVERED',
    trigger: 'complete_unloading',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip, ctx) => {
      await deliverTrip(trip, ctx);
    },
  },

  // POD FLOW
  {
    from: 'DELIVERED', to: 'POD_SUBMITTED',
    trigger: 'submit_pod',
    guard: async (trip, ctx) => {
      const template = await getWorkflowTemplate(trip.workflow_template);
      const pod = ctx.metadata?.pod;
      if (!pod) return { valid: false, error: 'POD data required' };
      // Check minimum photos
      if ((pod.photos?.length || 0) < template.pod_min_photos) {
        return { valid: false, error: `Minimum ${template.pod_min_photos} photos required. Got ${pod.photos?.length || 0}.` };
      }
      // Check weight slip
      if (template.pod_weight_slip_required && !pod.weight_slip_url) {
        return { valid: false, error: 'Weight slip is required for this workflow template.' };
      }
      // Check receiver signature
      if (template.pod_receiver_signature !== 'Disabled' && template.pod_receiver_signature !== 'Optional') {
        if (!pod.receiver_signature_url) return { valid: false, error: 'Receiver signature is mandatory.' };
      }
      return { valid: true };
    },
    sideEffects: async (trip) => {
      await db('trips').where('id', trip.id).update({
        pod_status: 'SUBMITTED',
        pod_submitted_at: new Date(),
      });
      // Notify ops for verification
      await notificationService.send({
        channels: ['in_app'],
        recipientRole: 'ops_manager',
        template: 'pod_submitted',
        data: { tripId: trip.id },
      });
    },
  },

  {
    from: 'POD_SUBMITTED', to: 'POD_VERIFIED',
    trigger: 'verify_pod',
    guard: async (trip, ctx) => {
      if (!ctx.metadata?.verification_remarks && !ctx.metadata?.clean) {
        return { valid: false, error: 'Verification remarks required (or mark as clean)' };
      }
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      const isClean = ctx.metadata?.clean;
      await db('trips').where('id', trip.id).update({
        pod_status: isClean ? 'VERIFIED_CLEAN' : 'VERIFIED_WITH_REMARKS',
        pod_verified_at: new Date(),
        // NOTE: invoice_status removed from trips table — Finance domain handles this
      });
      // Recognize revenue (accounting event)
      await eventBus.emit('trip.pod_verified', { tripId: trip.id, clean: isClean });
      // Trigger auto-settlement if template allows
      const template = await getWorkflowTemplate(trip.workflow_template);
      if (template.auto_settlement === 'Yes' || (template.auto_settlement === 'Yes (if no exceptions)' && !trip.has_exceptions)) {
        await settlementQueue.add('auto_settle', { tripId: trip.id });
      }
    },
  },

  {
    from: 'POD_SUBMITTED', to: 'POD_DISPUTED',
    trigger: 'dispute_pod',
    guard: async (trip, ctx) => {
      if (!ctx.reason) return { valid: false, error: 'Dispute reason required' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await db('trips').where('id', trip.id).update({ pod_status: 'DISPUTED' });
      await exceptionService.create({
        tripId: trip.id,
        type: 'POD_DISPUTE',
        description: ctx.reason,
        severity: 'High',
      });
    },
  },

  // SETTLEMENT — Trip's terminal state in the Operations domain
  // After settlement, the Finance domain independently handles invoicing.
  {
    from: 'POD_VERIFIED', to: 'SETTLED',
    trigger: 'settle',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      const settlement = await settlementService.calculate(trip.id);
      await db('trips').where('id', trip.id).update({ settled_at: new Date() });
      // Create accounting journal entries
      await eventBus.emit('trip.settled', { tripId: trip.id, settlement });
      // Finance domain listens for this event and marks the trip as available
      // to be included as a line item in an invoice. The trip entity does NOT
      // store any invoice reference — that's the Finance domain's job.
    },
  },

  // NOTE: SETTLED → INVOICED and INVOICED → CLOSED transitions have been REMOVED.
  // The Finance domain owns its own independent lifecycle:
  //   Invoice: DRAFT → SENT → PARTIAL → PAID
  //   Payment: recorded against invoices, not trips
  //   Receivable: outstanding balance per client

  // ═══ EXCEPTION PATHS ═══

  {
    from: 'IN_TRANSIT', to: 'VEHICLE_BREAKDOWN',
    trigger: 'report_breakdown',
    guard: async (trip, ctx) => {
      if (!ctx.gpsLat || !ctx.gpsLng) return { valid: false, error: 'GPS location required for breakdown report' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await alertService.create({
        type: 'VEHICLE_BREAKDOWN',
        tripId: trip.id,
        severity: 'Critical',
        description: ctx.reason || 'Vehicle breakdown reported',
        gpsLat: ctx.gpsLat,
        gpsLng: ctx.gpsLng,
      });
      // Suspend ETA
      await slaService.suspend(trip.id);
    },
  },

  {
    from: 'VEHICLE_BREAKDOWN', to: 'IN_TRANSIT',
    trigger: 'resume_after_repair',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip) => {
      await slaService.resume(trip.id);
      await gpsService.setTrackingFrequency(trip.vehicle_id, 30); // higher frequency after breakdown
    },
  },

  {
    from: 'VEHICLE_BREAKDOWN', to: 'LOAD_TRANSFER',
    trigger: 'initiate_load_transfer',
    guard: async (trip, ctx) => {
      if (!ctx.metadata?.replacement_vehicle_id) return { valid: false, error: 'Replacement vehicle must be specified' };
      if (!ctx.metadata?.replacement_driver_id) return { valid: false, error: 'Replacement driver must be specified' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      // Create child trip
      const childTrip = await tripService.createChildTrip({
        parentTripId: trip.id,
        clientId: trip.client_id,
        cargoDescription: trip.cargo_description,
        cargoWeightMt: trip.cargo_weight_mt,
        consignmentValue: trip.consignment_value,
        destinationId: trip.destination_id,
        vehicleId: ctx.metadata.replacement_vehicle_id,
        driverId: ctx.metadata.replacement_driver_id,
        originLat: ctx.gpsLat, // origin = breakdown location
        originLng: ctx.gpsLng,
        workflowTemplate: trip.workflow_template,
        transferReason: 'BREAKDOWN',
      });

      // Cancel parent's EWB, generate new one for child
      if (trip.ewb_status === 'ACTIVE') {
        await ewbService.cancel(trip.id);
        await ewbService.checkAndInitiate(childTrip);
      }

      // Mark parent as transferred
      await db('trips').where('id', trip.id).update({
        status: 'TRANSFERRED',
        is_transferred: true,
        transferred_to: childTrip.id,
        transfer_reason: 'BREAKDOWN',
        transfer_location_lat: ctx.gpsLat,
        transfer_location_lng: ctx.gpsLng,
        transfer_timestamp: new Date(),
      });
    },
  },

  {
    from: 'IN_TRANSIT', to: 'ACCIDENT',
    trigger: 'report_accident',
    guard: async () => ({ valid: true }),
    sideEffects: async (trip, ctx) => {
      await alertService.create({
        type: 'ACCIDENT',
        tripId: trip.id,
        severity: 'Critical',
        description: ctx.reason || 'Accident reported',
      });
      // Notify owner, insurance, management
      await notificationService.send({
        channels: ['push', 'sms', 'whatsapp', 'email'],
        recipientRoles: ['owner', 'fleet_manager', 'insurance_contact'],
        template: 'accident_report',
        data: { tripId: trip.id, location: `${ctx.gpsLat},${ctx.gpsLng}` },
      });
    },
  },

  {
    from: 'AT_DESTINATION', to: 'DELIVERY_REJECTED',
    trigger: 'receiver_rejects',
    guard: async (trip, ctx) => {
      if (!ctx.reason) return { valid: false, error: 'Rejection reason required' };
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      // Create return trip
      if (ctx.metadata?.create_return_trip) {
        await tripService.createReturnTrip(trip.id, ctx.reason);
      }
      await exceptionService.create({
        tripId: trip.id,
        type: 'DELIVERY_REJECTED',
        description: ctx.reason,
        severity: 'High',
      });
    },
  },

  // CANCELLATION — from any pre-delivery state
  {
    from: '*_PRE_DELIVERY', to: 'CANCELLED',
    trigger: 'cancel',
    guard: async (trip, ctx) => {
      if (!ctx.reason) return { valid: false, error: 'Cancellation reason required' };
      // Cannot cancel if already delivered or settled
      const postDeliveryStates = ['DELIVERED', 'POD_SUBMITTED', 'POD_VERIFIED', 'SETTLED'];
      if (postDeliveryStates.includes(trip.status)) {
        return { valid: false, error: 'Cannot cancel a trip that has been delivered or settled' };
      }
      return { valid: true };
    },
    sideEffects: async (trip, ctx) => {
      await db('trips').where('id', trip.id).update({
        cancelled_at: new Date(),
        cancelled_by: ctx.userId,
        cancellation_reason: ctx.reason,
      });
      // Cancel EWB if active
      if (['ACTIVE', 'GENERATED'].includes(trip.ewb_status)) {
        await ewbService.cancel(trip.id);
      }
      // Release vehicle and driver
      await vehicleService.release(trip.vehicle_id);
      await driverService.release(trip.driver_id);
      // Recover advance if given
      await financeService.recoverAdvance(trip.id);
      // Settle partial expenses if mid-trip
      if (['IN_TRANSIT', 'AT_DESTINATION'].includes(trip.status)) {
        await settlementService.settlePartial(trip.id);
      }
    },
  },
];
```

### 3.1 The transition executor

```typescript
class TripStateMachine {
  async transition(tripId: string, toState: string, context: TransitionContext): Promise<Trip> {
    return await db.transaction(async (trx) => {
      // Lock the trip row for update
      const trip = await trx('trips').where('id', tripId).forUpdate().first();
      if (!trip) throw new Error(`Trip ${tripId} not found`);

      const fromState = trip.status;

      // Find matching transition rule
      const rule = TRANSITIONS.find((t) =>
        (t.from === fromState || t.from === '*_PRE_DELIVERY') && t.to === toState
      );
      if (!rule) {
        throw new Error(`Invalid transition: ${fromState} → ${toState}. No rule defined.`);
      }

      // Check if transition is enabled for this workflow template
      if (rule.configurable) {
        const template = await getWorkflowTemplate(trip.workflow_template);
        const featureValue = template[rule.configurable];
        if (featureValue === false || featureValue === 'Disabled' || featureValue === 'Skipped') {
          throw new Error(`Transition ${fromState} → ${toState} is disabled for template "${trip.workflow_template}"`);
        }
      }

      // Run guard validation
      const guardResult = await rule.guard(trip, context);
      if (!guardResult.valid) {
        throw new Error(`Transition blocked: ${guardResult.error}`);
      }

      // Execute the transition
      await trx('trips').where('id', tripId).update({ status: toState });

      // Log the transition (append-only)
      await trx('trip_state_transitions').insert({
        trip_id: tripId,
        from_state: fromState,
        to_state: toState,
        triggered_by: context.userId,
        trigger_type: context.triggerType,
        reason: context.reason,
        notes: context.notes,
        evidence_urls: context.evidence,
        gps_lat: context.gpsLat,
        gps_lng: context.gpsLng,
        metadata: context.metadata ? JSON.stringify(context.metadata) : null,
      });

      // Run side effects (outside transaction for non-critical operations)
      setImmediate(async () => {
        try {
          await rule.sideEffects(trip, context);
        } catch (err) {
          console.error(`Side effect failed for ${tripId} ${fromState}→${toState}:`, err);
          // Side effect failures should NOT roll back the transition
          // They should be retried via the queue
        }
      });

      // Emit event for subscribers
      await eventBus.emit(`trip.${toState.toLowerCase()}`, {
        tripId, fromState, toState, context,
      });

      // Broadcast to WebSocket for real-time Kanban updates
      await wsService.broadcast('trip_update', { tripId, fromState, toState });

      return await trx('trips').where('id', tripId).first();
    });
  }
}
```

---

## 4. HELPER FUNCTIONS

```typescript
// Shared departure logic
async function departTrip(trip: Trip, ctx: TransitionContext) {
  await db('trips').where('id', trip.id).update({
    departed_at: new Date(),
    departure_odometer: ctx.metadata?.odometer,
    ewb_status: trip.ewb_status === 'GENERATED' ? 'ACTIVE' : trip.ewb_status,
  });
  // Start GPS tracking
  const template = await getWorkflowTemplate(trip.workflow_template);
  await gpsService.activateTracking(trip.vehicle_id, template.gps_tracking_frequency_sec);
  // Start SLA timer
  await slaService.start(trip.id, trip.sla_hours);
  // Accounting: driver advance entry
  await eventBus.emit('trip.departed', { tripId: trip.id });
}

// Shared delivery logic
async function deliverTrip(trip: Trip, ctx: TransitionContext) {
  await db('trips').where('id', trip.id).update({
    delivered_at: new Date(),
    arrival_odometer: ctx.metadata?.odometer,
    actual_distance_km: ctx.metadata?.odometer
      ? ctx.metadata.odometer - trip.departure_odometer
      : null,
    pod_status: 'AWAITING_SUBMISSION',
  });
  // Stop detention timer
  await timerService.cancel('unloading_detention', trip.id);
  // Calculate detention if exceeded
  const detentionHours = await detentionService.calculate(trip.id, 'unloading');
  if (detentionHours > 0) {
    const contract = await contractService.getActiveForTrip(trip);
    const charge = detentionHours * contract.unloading_detention_rate;
    await db('trips').where('id', trip.id).update({
      unloading_detention_hours: detentionHours,
      detention_charge: (trip.detention_charge || 0) + charge,
    });
  }
  // Notify driver to submit POD
  await notificationService.send({
    channels: ['push'],
    recipientId: trip.driver_id,
    template: 'submit_pod_reminder',
    data: { tripId: trip.id },
  });
  // Start POD submission timer (4 hours)
  await timerService.start({
    type: 'pod_submission',
    tripId: trip.id,
    durationMinutes: 240,
    onExpiry: 'pod_overdue_alert',
  });
}

// Get workflow template config
async function getWorkflowTemplate(name: string) {
  return await db('workflow_templates').where('name', name).first();
}
```

---

## 5. API ROUTES

```
# State transitions
POST /api/trips/:id/transition
  Body: { toState: string, reason?: string, notes?: string, evidence?: string[], metadata?: object }
  Auth: role-based (which roles can trigger which transitions)

# Trip CRUD
POST   /api/trips                    → create trip (DRAFT)
PUT    /api/trips/:id                → update draft trip
GET    /api/trips/:id                → full trip detail with timeline
GET    /api/trips                    → list with filters, pagination, sort
GET    /api/trips/:id/timeline       → state transition audit log
GET    /api/trips/:id/stops          → multi-stop list

# Dispatch board
GET    /api/dispatch/board           → trips grouped by Kanban column
GET    /api/dispatch/metrics         → board summary metrics
WS     /ws/dispatch                  → real-time Kanban updates

# Workflow templates
GET    /api/workflow-templates       → list all templates
GET    /api/workflow-templates/:id   → template detail with feature flags
PUT    /api/workflow-templates/:id   → update template configuration
POST   /api/workflow-templates       → create custom template

# E-Way Bill
POST   /api/trips/:id/ewb/generate  → trigger EWB generation
POST   /api/trips/:id/ewb/extend    → extend EWB validity (Part B update)
POST   /api/trips/:id/ewb/cancel    → cancel EWB

# Load transfer
POST   /api/trips/:id/load-transfer → initiate load transfer (creates child trip)

# Multi-stop
POST   /api/trips/:id/stops         → add stop
PUT    /api/trips/:id/stops/:stopId → update stop status
```

---

## 6. EWB MONITORING CRON

```typescript
// Run every 30 minutes
async function monitorEWBExpiry() {
  // Find trips with EWB expiring in < 6 hours
  const expiring = await db('trips')
    .where('ewb_status', 'ACTIVE')
    .whereIn('status', ['IN_TRANSIT', 'AT_CHECKPOINT'])
    .where('ewb_valid_until', '<', addHours(new Date(), 6))
    .where('ewb_valid_until', '>', new Date());

  for (const trip of expiring) {
    await db('trips').where('id', trip.id).update({ ewb_status: 'EXPIRING_SOON' });
    await alertService.create({
      type: 'EWB_EXPIRING',
      tripId: trip.id,
      severity: 'Critical',
      description: `EWB ${trip.ewb_number} expires at ${trip.ewb_valid_until}`,
    });
  }

  // Find expired EWBs
  const expired = await db('trips')
    .where('ewb_status', 'ACTIVE')
    .where('ewb_valid_until', '<', new Date());

  for (const trip of expired) {
    await db('trips').where('id', trip.id).update({ ewb_status: 'EXPIRED' });
    await alertService.create({
      type: 'EWB_EXPIRED',
      tripId: trip.id,
      severity: 'Critical',
      description: `EWB ${trip.ewb_number} has EXPIRED. Vehicle must halt.`,
    });
  }
}
```

---

## 7. IMPLEMENTATION ORDER

Build in this exact sequence:

1. **Database migrations** — all tables and columns from Section 2
2. **Workflow templates table + seed data** — 5 default templates
3. **State machine engine** — `TripStateMachine.transition()` with locking, validation, logging
4. **Transition rules** — implement each rule from Section 3 with guards and side effects
5. **Trip state transition log** — append-only table with trigger to prevent modification
6. **API routes** — transition endpoint, trip CRUD, board endpoints
7. **WebSocket** — real-time Kanban updates on state change
8. **EWB integration** — NIC API via GSP, generation/extension/cancellation
9. **EWB monitoring cron** — expiry detection every 30 minutes
10. **Load transfer workflow** — parent/child trip creation, EWB transfer
11. **Multi-stop support** — trip_stops table, per-stop state management
12. **Workflow template configuration UI** — CRUD for templates, feature flags
13. **Frontend** — Kanban board (Board + List view), Trip detail, Templates screen

---

## 8. TESTING

Write tests for:

- Every valid transition (30+ tests, one per rule)
- Invalid transitions are rejected (e.g., DRAFT → IN_TRANSIT should throw)
- Guard conditions: weight deviation >5% blocks LOADING→LOADED when template=Mandatory
- EWB blocking: cannot depart when value >50K and EWB not generated
- POD validation: minimum photos enforced per template
- Workflow template: Express template skips AT_ORIGIN and UNLOADING
- Load transfer: creates child trip with correct fields, cancels parent EWB
- Cancellation: works from any pre-delivery state, recovers advance, releases vehicle
- Audit trail: every transition creates an immutable log entry
- Concurrent access: two simultaneous transitions on same trip — only one succeeds (row-level lock)
- EWB expiry cron: correctly identifies expiring and expired EWBs

---

## 9. REFERENCE

The React JSX screens have been provided separately (`trip_workflow_complete.jsx`). They show:
- **Dispatch board** with Board (10-column Kanban) and List (sortable table) views
- **Trip detail** with workflow timeline, SLA tracker, parallel sub-processes, exception handling
- **Workflow templates** with all 5 templates and their 15 configurable feature flags

Match the data shapes, status values, and color coding from the JSX when building the API responses.
