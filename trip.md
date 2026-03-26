# Trip Management Workflow — AxleOps TMS

> Refined 3-domain architecture. Each domain owns its own lifecycle — no shared states.
> **Operations** owns the trip. **Finance** owns invoicing & payments. **Expenses** are standalone.

---

## 1. Overview — Refined System Boundaries

The AxleOps trip system is divided into **3 clean domains**, each with independent lifecycles:

| Domain | Owns | Lifecycle |
|--------|------|-----------|
| **Operations** | Trip from creation to closure | Created → In Transit → Completed → Settled |
| **Finance** | Invoices, payments, receivables | DRAFT → SENT → PARTIAL → PAID |
| **Expense** | Pooled cost tracking | Standalone entries tagged by vehicle + category |

**Key principles:**
- No "billed" or "invoiced" state on the trip — that's the invoice's job to track
- Settled trips become billable line items for the Finance domain
- Trip doesn't need to know about invoice status
- Expenses have no link to trips or invoices — completely standalone
- Reports join across domains when needed (vehicle profitability = revenue − expenses)

The Operations domain internally manages:
- **4 primary phases** with operational sub-states within each
- **13 exception states** (breakdown, accident, load transfer, cargo damage, etc.)
- **2 parallel sub-processes** (E-Way Bill, POD) — each with independent state lifecycles
- **5 configurable workflow templates** (Standard, Express, Heavy Cargo, Hazmat, Multi-Drop)
- **30+ validated state transitions** with guard conditions and side effects
- **Immutable audit trail** on every transition (who, when, from → to, GPS, evidence)

---

## 2. Domain 1: Operations — Trip Lifecycle

### 2.1 The 4-Phase Model

The trip's lifecycle follows **4 major phases**, displayed as the primary progress indicator on UI:

```
① Created  ──→  ② In Transit  ──→  ③ Completed  ──→  ④ Settled
```

| # | Phase | Meaning | Entry Condition |
|---|-------|---------|-----------------|
| 1 | **Created** | Trip form saved, vehicle + driver assigned | All required fields filled (client, route, vehicle, driver, cargo) |
| 2 | **In Transit** | Vehicle has departed origin, actively moving | Vehicle left loading point (EWB generated if required) |
| 3 | **Completed** | POD + delivery details entered, trip operationally done | POD verified (clean or with remarks) |
| 4 | **Settled** | Revenue locked, trip is done | Settlement calculated — all costs and revenue finalized |

**Settled is the terminal state for the trip entity.** After settlement, the trip is released to the Finance domain as a billable line item.

### 2.2 Internal Sub-States (Operational Detail)

Within each major phase, the system tracks granular operational sub-states. These are **internal to operations** — the trip's public-facing status remains one of the 4 phases.

#### Phase 1: Created (Setup & Dispatch)

| Sub-State | Description | Trigger |
|-----------|-------------|---------|
| **DRAFT** | Trip form started but incomplete | User opens "Add Trip" |
| **CREATED** | All required fields filled, trip saved | `save_complete` — validates client, route, vehicle, driver, cargo |
| **DISPATCHED** | Trip assigned and sent to driver | `dispatch` — checks vehicle availability, driver availability, credit limit |
| **ACCEPTED** | Driver accepted via mobile app | `driver_accepts` — within accept timeout |

#### Phase 2: In Transit (Execution)

| Sub-State | Description | Trigger |
|-----------|-------------|---------|
| **AT_ORIGIN** | Driver arrived at loading point | `arrive_origin` — configurable per template |
| **LOADING** | Cargo loading in progress | `start_loading` |
| **LOADED** | Loading complete, weight verified | `complete_loading` — weight + seal per template |
| **EWB_PENDING** | Waiting for E-Way Bill generation | `auto_ewb_check` — if value > ₹50,000 |
| **DEPARTED** | Vehicle left loading point | `ewb_generated` or `depart_no_ewb` |
| **IN_TRANSIT** | Vehicle actively moving on route | `gps_movement_detected` |
| **AT_CHECKPOINT** | At intermediate stop (multi-stop only) | `arrive_checkpoint` |
| **AT_DESTINATION** | Arrived at delivery point | `arrive_destination` — SLA evaluation triggered |
| **UNLOADING** | Cargo unloading in progress | `start_unloading` — configurable per template |
| **DELIVERED** | Unloading complete, cargo handed over | `complete_unloading` or `quick_delivery` |

#### Phase 3: Completed (Verification)

| Sub-State | Description | Trigger |
|-----------|-------------|---------|
| **POD_SUBMITTED** | Driver uploaded POD documents | `submit_pod` — min photos, weight slip, signature per template |
| **POD_VERIFIED** | Operations verified POD as clean or with remarks | `verify_pod` |
| **POD_DISPUTED** | POD verification failed, dispute raised | `dispute_pod` — reason required |

#### Phase 4: Settled (Closure)

| Sub-State | Description | Trigger |
|-----------|-------------|---------|
| **SETTLED** | Financial settlement calculated, revenue locked | `settle` — auto or manual per template |

> **Important:** There is NO "invoiced" or "billed" or "closed" sub-state on the trip. Once settled, the trip is done from the Operations domain's perspective. The Finance domain independently tracks whether the trip has been included in an invoice.

### 2.3 Exception States

| State | Trigger | Resolution |
|-------|---------|------------|
| **DRIVER_REJECTED** | Driver declines trip | Auto-transitions back to CREATED for reassignment |
| **VEHICLE_BREAKDOWN** | Mechanical failure | Resume after repair → IN_TRANSIT, or initiate load transfer |
| **ACCIDENT** | Accident reported | Notifies owner, fleet manager, insurance. Critical alert created |
| **LOAD_TRANSFER** | Cargo transferred to replacement vehicle | Creates child trip, cancels parent's EWB, marks parent as TRANSFERRED |
| **ROUTE_BLOCKED** | Road block / closure | Reroute or wait |
| **CARGO_DAMAGE** | Damage detected during transit | Evidence photos uploaded, exception report created |
| **CARGO_SHORTAGE** | Quantity mismatch at delivery | Shortage deduction applied to settlement |
| **DELIVERY_REJECTED** | Receiver refuses delivery | Can create return trip |
| **EWB_EXPIRED** | E-Way Bill validity lapsed | Vehicle must halt. Extension required |
| **DETENTION_EXCEEDED** | Free time exceeded at loading/unloading | Detention charges accrued per contract rate |
| **DRIVER_UNREACHABLE** | No communication with driver | Escalation triggered |
| **GPS_LOST** | GPS signal lost | Alert to operations |
| **CANCELLED** | Trip cancelled before delivery | From any pre-delivery state. Releases vehicle/driver, recovers advance |
| **TRANSFERRED** | Parent trip replaced by child trip after load transfer | Terminal state for parent trip |

---

## 3. Parallel Sub-Processes (Operations Domain)

Two independent state lifecycles run alongside the main trip state. The Invoice sub-process has been **moved to the Finance domain** (see §6).

### 3.1 E-Way Bill (EWB) Sub-Process

```
NOT_REQUIRED → PENDING_GENERATION → GENERATED → ACTIVE → EXPIRING_SOON → EXPIRED
                                  → GENERATION_FAILED            ↓
                                                              EXTENDED
                                                              CANCELLED
```

| State | Description |
|-------|-------------|
| NOT_REQUIRED | Consignment value ≤ ₹50,000 or template has EWB disabled |
| PENDING_GENERATION | API call sent to NIC via GSP (ClearTax) |
| GENERATED | EWB number received |
| ACTIVE | Trip has departed, EWB is live |
| EXPIRING_SOON | < 6 hours remaining (detected by cron every 30 min) |
| EXPIRED | Validity lapsed — vehicle must halt |
| EXTENDED | Validity extended via Part B update |
| CANCELLED | EWB cancelled (within 24 hrs or trip cancelled) |

**Key rules:**
- Validity = CEIL(distance_km ÷ 200) days
- Part B update required when vehicle changes (e.g., load transfer)
- Auto-generated on trip departure if consignment value > ₹50,000
- Cron monitors expiry every 30 minutes

### 3.2 POD (Proof of Delivery) Sub-Process

```
NOT_STARTED → AWAITING_SUBMISSION → SUBMITTED → VERIFICATION_IN_PROGRESS
→ VERIFIED_CLEAN / VERIFIED_WITH_REMARKS / REJECTED → RESUBMISSION_REQUESTED
→ DISPUTED
```

**Requirements vary by template:**

| Template | Min Photos | Weight Slip | Receiver Signature |
|----------|-----------|-------------|-------------------|
| Standard | 2 | Optional | Mandatory |
| Express | 1 | Not required | Mandatory |
| Heavy Cargo | 4 | Required | Mandatory |
| Hazmat | 4 | Required | Mandatory + Stamp |
| Multi-Drop | 2 | Not required | Mandatory |

**Key rules:**
- POD submission timer starts on delivery (4 hours)
- Trip cannot reach Completed phase without POD verification
- Verified POD triggers revenue recognition event
- Clean POD may trigger auto-settlement per template

---

## 4. Workflow Templates

Five configurable templates control which sub-states and transitions are active. Each template is a set of **15 feature flags**.

### 4.1 Template Comparison

| Feature | Standard | Express | Heavy Cargo | Hazmat | Multi-Drop |
|---------|----------|---------|-------------|--------|------------|
| Pre-departure checklist | Optional | Disabled | Mandatory | Mandatory | Optional |
| AT_ORIGIN state | ✅ Enabled | ❌ Skipped | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| Weight verification (loading) | Optional | Disabled | Mandatory | Mandatory | Disabled |
| Seal capture | Optional | Disabled | Mandatory | Mandatory | Optional |
| EWB generation | Auto | Auto | Always | Always | Auto |
| GPS tracking frequency | 60s | 30s | 30s | 15s | 30s |
| Checkpoints enabled | ❌ | ❌ | ❌ | ✅ (every 200km) | ✅ |
| AT_DESTINATION state | ✅ | ❌ Skipped | ✅ | ✅ | ✅ |
| Unloading verification | Enabled | Skipped | Mandatory | Mandatory | Enabled |
| Weight verification (unloading) | Optional | Disabled | Mandatory | Mandatory | Disabled |
| POD min photos | 2 | 1 | 4 | 4 | 2 |
| POD weight slip required | ❌ | ❌ | ✅ | ✅ | ❌ |
| POD receiver signature | Mandatory | Mandatory | Mandatory | Mandatory + Stamp | Mandatory |
| Auto-settlement | If no exceptions | Always | Manual review | Manual review | After all drops |
| Detention tracking | Yes | No | Yes (strict) | Yes (strict) | Yes (per stop) |

### 4.2 Template Impact on Flow

- **Express**: Skips AT_ORIGIN, weight verification, unloading verification → fastest turnaround
- **Heavy Cargo**: Enforces weight verification at both ends, seal capture, 4 POD photos, manual settlement
- **Hazmat**: Maximum safety — checkpoint every 200km, 15-second GPS, mandatory stamp on POD
- **Multi-Drop**: Per-stop detention tracking, settlement only after all drops complete

---

## 5. Trip Creation & Settlement (Operations Domain)

### 5.1 Required Fields

| Field | Source |
|-------|--------|
| Client | Dropdown (filters routes) |
| Branch | Dropdown (filters vehicles/drivers) |
| Route | Dropdown filtered by client — shows contracted vs manual rate routes |
| Vehicle | Auto-filtered by route's vehicle type + branch |
| Driver | Filtered by license type (e.g., HMV) |
| Scheduled Start | Date-time picker |
| LR Number | Auto-generated or manual entry |
| Cargo Weight (MT) | Numeric |
| Cargo Description | Text |
| Consignment Value (₹) | Numeric — determines EWB requirement |

### 5.2 Smart Behaviors at Creation

- **Route → Vehicle type auto-determined**: Selecting a route sets the required vehicle type
- **Contract auto-linked**: If the selected route has an active route contract, it's auto-bound (rate, SLA, detention terms)
- **EWB threshold check**: If consignment value > ₹50,000 → "EWB is mandatory" banner shown
- **Expected delivery auto-calculated**: From SLA deadline in route contract
- **Financial preview**: Shows estimated expenses (diesel, toll, driver allowance) vs expected revenue
- **Margin floor warning**: If estimated margin < contract minimum floor (e.g., 18%)
- **Rate resolution audit**: Shows which rate source was used (Priority 1: Route Contract > Priority 2: Client Master)
- **Ad-hoc route**: Can create a new route inline; auto-promoted to Standard after 3 trips

### 5.3 FK Chain

```
Trip → Route (always set) + Route Contract (nullable — for spot/manual-rate trips)
     → Client → Branch
     → Vehicle → Driver
```

### 5.4 Settlement (Trip's Terminal State)

Settlement is the **final operation within the trip entity**. It locks revenue and becomes the handoff event to the Finance domain.

#### Settlement KPIs
- Ready to Settle (POD verified trips)
- Pending POD (cannot settle yet)
- Average Margin

#### Rate Types Supported
| Rate Type | Calculation |
|-----------|-------------|
| Per KM | Rate × actual distance |
| Per Trip | Flat rate per trip |
| Per Tonne | Rate × cargo weight |
| Per Package | Rate × package count |
| Slab-Based | Tiered rates by distance/weight |

#### Settlement Breakdown
**Revenue side:**
- Freight rate (per contract)
- Fuel surcharge (e.g., +2.4%)
- Loading/unloading charges
- Less: deductions (shortage, SLA penalty, damage)
- = **Net Client Receivable**

**Cost side:**
- Diesel (litres × price)
- Tolls (FASTag auto-captured)
- Driver allowance
- Driver food
- Misc expenses
- Less: driver advance already given
- = **Net Vendor Payable**

**Margin** = Receivable − Payable (shown as ₹ and %)

After settlement, the trip emits a `trip.settled` event. The Finance domain listens and marks the trip as available to be included in an invoice.

---

## 6. Domain 2: Finance — Invoices, Payments & Receivables

> **Finance owns invoices and payments — trips are just line items.**
> Trip doesn't need to know any of this.

### 6.1 Invoice Lifecycle

Invoices are **independent entities** in the Finance domain. They group settled trips as line items.

```
DRAFT → SENT → PARTIAL → PAID
```

| Status | Meaning |
|--------|---------|
| **DRAFT** | Invoice created, trips attached as line items — not yet sent to client |
| **SENT** | Invoice emailed/shared with client — awaiting payment |
| **PARTIAL** | Partial payment received against this invoice |
| **PAID** | Full payment received — invoice closed |

**Key rules:**
- Only **settled** trips can be included as invoice line items
- Multiple settled trips can be batched into a single invoice
- GST type (IGST/CGST+SGST) determined by supplier vs recipient state
- Invoice numbers are auto-generated per series
- The trip entity does **not** store any invoice reference — the invoice stores references to trips

### 6.2 Payment

- Payments are recorded **against invoices**, not against individual trips
- Partial payments are supported (invoice moves to PARTIAL status)
- Payment modes: bank transfer, cheque, UPI, cash
- Each payment is linked to an invoice ID

### 6.3 Receivable

- Outstanding balance = Total invoiced − Total paid
- Tracked per client at the aggregate level
- Aging analysis: current, 30 days, 60 days, 90+ days
- Client credit limit checks use receivable balance

### 6.4 Domain Boundary

```
Operations domain                     Finance domain
┌──────────────┐                     ┌────────────────────┐
│  Trip        │                     │  Invoice           │
│  (Settled) ──┼── trip.settled ──→  │  (groups trips)    │
│              │     event           │  DRAFT→SENT→       │
│  No invoice  │                     │  PARTIAL→PAID      │
│  status here │                     │                    │
└──────────────┘                     │  Payment           │
                                     │  (against invoice) │
                                     │                    │
                                     │  Receivable        │
                                     │  (outstanding)     │
                                     └────────────────────┘
```

---

## 7. Domain 3: Expense — Standalone Cost Tracking

> **Pooled accounts with tags — no per-vehicle ledgers.**
> No link to trips or invoices — completely standalone.

### 7.1 Expense Entry

- Each expense is **tagged** with: vehicle, category, date, branch
- Categories: diesel, toll, maintenance, tyre, insurance, permit, misc
- No FK to trips — expenses are recorded against vehicles/categories
- Expense entries can be approved or rejected by authorized roles

### 7.2 Cash Voucher

- Cash disbursements that need approval workflow
- Flow: Request → Approve → Disburse
- Tagged to vehicle + category
- Approval hierarchy based on amount thresholds

### 7.3 Driver Advance

- Tracked and deducted from driver settlement
- Advance given at trip dispatch (captured as an expense)
- Recovery happens during settlement calculation
- Balance tracking per driver

### 7.4 Domain Boundary

- Expense domain has **no FK** to trips or invoices
- Reports join across domains when needed:
  - **Vehicle profitability** = Revenue (from settled trips) − Expenses (from expense entries tagged to that vehicle)
  - Revenue comes from Finance domain (invoiced amounts)
  - Expenses come from Expense domain (tagged entries)

---

## 8. E-Way Bill Management

### 8.1 Details Tracked
- EWB number, generated date, valid from/until, validity basis (days), document type, HSN code
- Consignment value, transport mode, transporter ID, LR number
- Supplier GSTIN, recipient GSTIN, dispatch/delivery PIN codes
- Current vehicle (Part B), vehicle change history
- GSP API audit trail (request/response times, HTTP status codes)

### 8.2 Actions
- **View EWB PDF**: Download generated document
- **Extend Validity**: Send Part B update to GSP API
- **Update Vehicle (Part B)**: Required on load transfer / vehicle change
- **Cancel EWB**: Within 24 hours of generation

### 8.3 Monitoring Cron (every 30 minutes)
1. Find trips with EWB expiring in < 6 hours → mark EXPIRING_SOON, create Critical alert
2. Find expired EWBs → mark EXPIRED, create Critical alert ("Vehicle must halt")

---

## 9. Guard Conditions & Side Effects

### 9.1 Key Guard Conditions

| Transition | Guard |
|------------|-------|
| DRAFT → CREATED | Client, route, vehicle, driver, cargo weight, cargo description required |
| CREATED → DISPATCHED | Vehicle available, driver available, client credit limit not exceeded |
| DISPATCHED → ACCEPTED | Must be assigned driver, within accept timeout |
| DISPATCHED → DRIVER_REJECTED | Rejection reason required |
| LOADING → LOADED | If template mandates: weight deviation ≤ 5%, seal number provided |
| LOADED → DEPARTED | If consignment > ₹50K → EWB must be GENERATED or ACTIVE |
| IN_TRANSIT → AT_CHECKPOINT | Trip must be multi-stop |
| AT_DESTINATION → DELIVERED (quick) | Template must have unloading verification skipped |
| DELIVERED → POD_SUBMITTED | Min photos met, weight slip (if required), receiver signature (if required) |
| POD_SUBMITTED → POD_VERIFIED | Verification remarks or "clean" mark required |
| IN_TRANSIT → VEHICLE_BREAKDOWN | GPS location required |
| VEHICLE_BREAKDOWN → LOAD_TRANSFER | Replacement vehicle + driver must be specified |
| AT_DESTINATION → DELIVERY_REJECTED | Rejection reason required |
| Any pre-delivery → CANCELLED | Reason required; cannot cancel after delivery |

### 9.2 Key Side Effects

| Transition | Side Effects |
|------------|-------------|
| CREATED → DISPATCHED | Push + SMS to driver; start accept timeout timer (30 min) |
| DISPATCHED → ACCEPTED | Cancel accept timeout; generate pre-departure checklist if enabled; notify dispatcher |
| DISPATCHED → DRIVER_REJECTED | Cancel timeout; notify dispatcher; auto-transition to CREATED; unassign driver |
| ACCEPTED → AT_ORIGIN | Start loading detention timer per contract |
| LOADING → LOADED | Generate gate pass; check/initiate EWB |
| LOADED → DEPARTED | Activate GPS tracking per template frequency; start SLA timer |
| IN_TRANSIT → AT_DESTINATION | Stop SLA timer and evaluate (create alert if breached); start unloading detention timer |
| UNLOADING → DELIVERED | Calculate detention charges; notify driver to submit POD; start POD timer (4 hrs) |
| DELIVERED → POD_SUBMITTED | Notify ops for verification |
| POD_SUBMITTED → POD_VERIFIED | Trigger auto-settlement per template; emit revenue recognition event |
| POD_VERIFIED → SETTLED | Calculate settlement; emit `trip.settled` event (Finance domain listens) |
| IN_TRANSIT → VEHICLE_BREAKDOWN | Create Critical alert; suspend SLA/ETA |
| VEHICLE_BREAKDOWN → LOAD_TRANSFER | Create child trip; cancel parent's EWB; generate new EWB for child; mark parent as TRANSFERRED |
| Any → CANCELLED | Cancel EWB if active; release vehicle + driver; recover advance; settle partial expenses if mid-trip |

---

## 10. Audit Trail

Every state transition creates an **immutable, append-only** record:

| Field | Description |
|-------|-------------|
| trip_id | Trip reference |
| from_state | Previous state |
| to_state | New state |
| triggered_by | User ID (NULL for system triggers) |
| trigger_type | MANUAL, AUTO, GPS_GEOFENCE, TIMER, API, SYSTEM |
| reason | Free text reason |
| notes | Additional notes |
| evidence_urls | Photos, documents |
| gps_lat / gps_lng | GPS coordinates at transition |
| metadata | Additional context (JSON) |
| created_at | Timestamp |

The table enforces append-only via a database trigger that prevents UPDATE or DELETE operations.

---

## 11. Multi-Stop Trips

For Multi-Drop template trips:

- `trip_stops` table tracks each stop with: stop number, type (PICKUP/DROP/CHECKPOINT), location, geofence radius, cargo action (FULL_LOAD/PARTIAL_UNLOAD/FULL_UNLOAD/INSPECTION_ONLY)
- Each stop has its own: expected/actual arrival/departure, receiver info, detention tracking, status (PENDING/ARRIVED/IN_PROGRESS/COMPLETED/SKIPPED)
- Settlement happens only after **all drops** are completed
- Detention tracked **per stop**

---

## 12. Load Transfer Workflow

When a breakdown cannot be repaired in the field:

1. **Report breakdown** → Trip pauses, GPS location recorded, Critical alert created
2. **Select replacement vehicle + driver** from available fleet
3. **Create child trip** → Inherits cargo details, destination, workflow template; origin = breakdown location
4. **Cancel parent EWB** → Generate new EWB for child trip with updated Part B (new vehicle)
5. **Mark parent as TRANSFERRED** → Terminal state with `transferred_to` reference to child trip
6. **Child trip starts from the breakdown point** → Remaining distance to destination

---

## 13. Cross-Domain Reports

Reports join across all 3 domains when needed:

| Report | Data Sources |
|--------|-------------|
| **Trip Profitability** | Revenue from Operations (settlement) + Costs from Expense entries tagged to vehicle |
| **Vehicle Profitability (MTD)** | All trips per vehicle (Operations) + All expenses tagged to vehicle (Expense) |
| **Client Receivable Aging** | Invoice balances from Finance domain |
| **Driver Settlement** | Trip settlement from Operations + Driver advance from Expense domain |
| **Fleet Cost Analysis** | Expense entries grouped by category + vehicle |

---

## 14. Connected Systems

The Operations domain emits events consumed by other domains and systems:

| System | Event | Action |
|--------|-------|--------|
| **Finance Domain** | `trip.settled` | Trip becomes available as invoice line item |
| **Alert Engine** | Any exception state | Creates alert with severity, escalation |
| **Accounting** | `trip.departed` | Driver advance journal entry |
| **Accounting** | `trip.pod_verified` | Revenue recognition |
| **Accounting** | `trip.settled` | Settlement journal entries (5+ vouchers) |
| **Work Orders** | `trip.vehicle_breakdown` | Auto-creates work order for vehicle repair |
| **WebSocket** | Any transition | Real-time dashboard update |
| **Driver Mobile** | Dispatch, POD reminders | Push notifications |
| **Client Portal** | Status changes | Shipment tracking updates |

---

## 15. UI Pages Summary

| Page | Path | Domain | Purpose |
|------|------|--------|---------|
| Active Trips | `active-trips.html` | Operations | Trip dashboard with KPI cards, filters |
| Archived Trips | `archived-trips.html` | Operations | Settled trips archive |
| Create Trip | `trip-create.html` | Operations | Two-column form: setup + consignment/financial preview |
| Trip Detail | `trip-detail.html` | Operations | Multi-tab detail page (overview, exceptions, financials, tracking, documents) |
| Settlement | `trip-settlement.html` | Operations | Settlement table + breakdown — trip's terminal operation |
| Profitability | `trip-profitability.html` | Cross-domain | Per-trip and per-vehicle P&L report (joins Ops + Expense) |
| Trip Alerts | `trip-alerts.html` | Operations | Trip-specific alert management |
| Workflow Templates | `workflow-templates.html` | Operations | Template configuration with 15 feature flags |
| Invoices | `invoices.html` | Finance | Invoice list with status lifecycle (DRAFT→SENT→PARTIAL→PAID) |
| Payment Receipts | `payment-receipts.html` | Finance | Payment recording against invoices |
| Bill & Collect | `bill-collect.html` | Finance | Billing workflow — create bills from settled trips |
| Aging Analysis | (planned) | Finance | Client receivable aging report |
