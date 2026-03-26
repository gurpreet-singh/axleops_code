# TMS Operator Dashboard — Feature Specification v6

## 1. Overview

The TMS (Transport Management System) Operator Dashboard is a single-page React application that enables two roles — **Operations** and **Accounts** — to manage the full lifecycle of freight trips in an Indian logistics company. The dashboard uses a right-side sliding panel for all drill-down interactions.

**Tech Stack:** React (functional components + hooks), inline styles, no external CSS framework. All data is client-side (no backend in prototype).

---

## 2. Status Flow

Every trip progresses through these 6 statuses in order:

```
Consignment → In Transit → Delivered → Trip Sheet → Billed → Paid
```

| Status | Meaning | Who acts |
|--------|---------|----------|
| Consignment | LR/Bilty received, vehicle may or may not be assigned yet | Ops |
| In Transit | Vehicle dispatched, truck on the road | Ops (deliver), Accts (advances) |
| Delivered | Goods handed over, ePOD captured | Both (edit details) |
| Trip Sheet | Accounts settled driver expenses against advances | Accts |
| Billed | Freight invoice raised to client | Accts |
| Paid | Client payment received, trip fully closed | — |

---

## 3. Role-Based Dashboard Views

### 3.1 Operations View

**Bar 1 — Trip Movement (3 boxes):**

| Box | Count | Subtitle | What it shows |
|-----|-------|----------|--------------|
| Consignment | Trips in "Consignment" | Assign vehicle & dispatch | LR received, needs vehicle |
| In Transit | Trips in "In Transit" | Mark delivered + ePOD | Vehicle on road |
| Delivered | Trips in "Delivered" | Handed to Accounts | Done from ops side |

**Bar 2 — Ops Alerts (3-column grid, 1 box):**

| Box | Count | Filter |
|-----|-------|--------|
| Delayed Trips | Trips with `delayed: true` | Shows overdue trips |

### 3.2 Accounts View

**Bar 1 — Trip Movement (3 boxes, same as Ops for visibility):**

| Box | Subtitle |
|-----|----------|
| Consignment | Awaiting dispatch |
| In Transit | Add advances |
| Delivered | Create Trip Sheet |

**Bar 2 — Bill & Collect (3 boxes):**

| Box | Status | Subtitle |
|-----|--------|----------|
| Trip Sheet | "Trip Sheet" | Raise freight bill |
| Billed | "Billed" | Collect payment |
| Paid & Closed | "Paid" | Fully settled |

---

## 4. Trip Data Model

```javascript
{
  id: "T-04601",           // Auto-generated trip ID
  lr: "LR-08001",          // LR / Waybill / Bilty number
  lrDate: "2026-03-22",    // LR date
  routeId: "RT-001",       // Reference to route master
  status: "In Transit",    // Current status

  // Route-derived fields
  client: "Reliance Retail",
  origin: "Mumbai",
  destination: "Pune",
  team: "West Team",
  freight: 8500,            // Calculated from route rate
  freightTerms: "To Pay",   // To Pay | Paid | To Be Billed (TBB)
  hire: null,                // For attached/market vehicles

  // Vehicle (null if Consignment without vehicle)
  vehicle: "MH12 AB 1234",
  driver: "Raju Singh",
  vtype: "Own",              // Own | Attached | Market

  // Consignment details (can be filled later via Edit Details)
  consignor: "Reliance Jamnagar DC",
  consignee: "Reliance Pune WH-3",
  goods: "Packaged food items",
  weightKg: 14200,
  packages: 320,
  declaredValue: 420000,     // Triggers E-Way Bill alert if > ₹50,000

  // Job Entry / Vehicle Trip Log
  jobEntry: {
    date: "2026-03-22",
    time: "09:00",
    odoStart: 12340,          // Odometer at dispatch
    dispatchNote: "Standard load"
  },

  // Financial arrays
  advances: [
    { id: "adv1", type: "Driver", amount: 3500, mode: "Cash",
      date: "2026-03-22", note: "Fuel + toll" }
  ],
  expenses: [
    { id: "exp1", category: "Fuel", amount: 2100,
      date: "2026-03-20", note: "Diesel refill" }
  ],

  // ePOD — captured at delivery
  pod: {
    receiver: "Ramesh Kumar",
    date: "2026-03-19",
    files: 2,
    note: "Signed + photo"
  },

  // Trip Sheet — expense settlement
  tripSheet: {
    settledDate: "2026-03-17",
    totalAdv: 5000,
    totalExp: 5390,
    balance: -390,            // Negative = due to driver
    note: "Driver owes ₹390"
  },

  // Billing & Payment
  deliveryDate: "2026-03-19",
  invoiceAmt: 16800,          // Freight + GST + extras
  paymentDate: "2026-03-15",
  paymentRef: "UTR20260315001",
  delayed: false
}
```

---

## 5. Master Data

### 5.1 Route Master

Each route defines: origin, destination, client, rate (flat or per-km), distance, transit days, team, freight terms, default consignor, default consignee.

### 5.2 Vehicle Master

Each vehicle maps to: vehicle number, driver name, vehicle type (Own/Attached), and a default route. The vehicle lookup auto-resolves driver and type.

---

## 6. Actions by Role & Status

### 6.1 Operations Actions

| Status | Actions Available |
|--------|-------------------|
| Consignment | Assign Vehicle & Dispatch, Edit Details |
| In Transit | Mark Delivered + ePOD, Edit Details |
| Delivered | Edit Details |
| Trip Sheet+ | (none) |

### 6.2 Accounts Actions

| Status | Actions Available |
|--------|-------------------|
| Consignment | Edit Details |
| In Transit | Add Advance, Edit Details |
| Delivered | Trip Sheet / Settle, Edit Details |
| Trip Sheet | Raise Freight Bill |
| Billed | Payment Receipt |
| Paid | (none) |

---

## 7. Action Specifications

### 7.1 Create Trip (Add Trip Form)

**Trigger:** "➕ New Trip" button in header.

**Sticky action bar at top** with Save/Start Trip/Cancel buttons and status indicator.

**Sections (all 2-column layout):**

1. **📄 LR / Waybill & Vehicle** — LR number (required), LR date, Vehicle number (searchable type-ahead, optional). When vehicle resolves: shows driver, type in green card.

2. **🗺️ Route & Client** — Searchable route dropdown (required). When selected: shows client, origin→destination, distance, transit days, rate, freight terms in info cards. Trip date and team fields.

3. **📦 Consignment Details** — Consignor, Consignee (pre-filled from route defaults), Cargo description, Material type, Cargo weight (kg), Packages/Qty, Consignment value (₹), Invoice no. E-Way Bill alert when value > ₹50,000.

4. **💵 Driver Advance** (only if vehicle assigned) — Amount, Payment mode (searchable). Deduction note.

5. **📝 Notes** — Free text.

**Two save options:**
- **🚛 Start Trip** — saves as "Consignment" status
- **✓ Start & Dispatch** — only appears when vehicle is assigned, saves as "In Transit"

### 7.2 Assign Vehicle & Dispatch

**Available on:** Consignment status, Ops role.

**Fields:** Vehicle number (searchable type-ahead), Job Entry fields (dispatch time, odometer, note), Driver advance (amount, mode).

**Result:** Updates trip to "In Transit" with vehicle, driver, vtype, jobEntry, and any advance.

### 7.3 Mark Delivered + ePOD

**Available on:** In Transit status, Ops role.

**Fields:** Delivery date, Goods condition (dropdown: Good/Damaged/Short), ePOD section (received by, note, file upload button).

**Result:** Updates trip to "Delivered" with deliveryDate and pod object.

### 7.4 Edit Details

**Available on:** Consignment, In Transit, Delivered — both roles.

**Two section cards:**
- **📦 Consignor & Consignee** — Consignor, Consignee
- **🏷️ Cargo Details** — Cargo description, weight, packages, consignment value. E-Way Bill alert.

**Result:** Updates consignment fields on the trip.

### 7.5 Add Advance

**Available on:** In Transit status, Accounts role.

**Fields:** Advance type (Driver or Hire Slip — toggle shown only for Attached/Market vehicles), Amount (required), Payment mode (searchable), Note.

**Result:** Appends to trip's `advances` array.

### 7.6 Trip Sheet / Settle

**Available on:** Delivered status, Accounts role.

**Layout:** Shows previously logged expenses, allows adding new expense lines (category via searchable dropdown, amount, date, note), running settlement summary (advances vs expenses), balance calculation, settlement note.

**Result:** Updates trip to "Trip Sheet" status with all expenses merged and tripSheet settlement object.

### 7.7 Raise Freight Bill

**Available on:** Trip Sheet status, Accounts role.

**Auto-populated:** Base freight, client, freight terms.
**Input fields:** Detention, Loading charges, Other charges, GST % (dropdown), Bill date.
**Calculation:** Sub-total, GST amount, Invoice total — shown in dark summary card.

**Result:** Updates trip to "Billed" with invoiceAmt.

### 7.8 Payment Receipt

**Available on:** Billed status, Accounts role.

**Auto-populated:** Invoice amount, client.
**Input fields:** Amount received, Payment mode (searchable), UTR/Reference, Payment date.

**Result:** Updates trip to "Paid" with paymentDate and paymentRef.

---

## 8. Trip Detail View (Right Slider)

When a trip is opened, the detail view shows section cards:

### 8.1 Section Cards

| Card | Icon | Shows |
|------|------|-------|
| LR / Consignment | 📄 | LR number, date, client, freight terms, contract freight |
| Vehicle & Driver | 🚛 | Vehicle, type, driver, route + Job Entry sub-section (dispatch time, odometer, note) |
| Consignment Details | 📦 | Consignor, consignee, cargo, weight, packages, value, E-Way Bill alert |
| Delivery | ✅ | Delivery date (only if delivered) |
| ePOD | 📋 | Received by, date, note, ON FILE tag |
| Accounts Ledger | 📊 | Debit/credit table (Accounts view only) — advances, expenses, settlement, freight bill, payment |
| Advances Given | 💵 | List of advances (Ops view only) |
| Trip Sheet Settlement | 🧾 | Advance vs expense balance, settlement note |

### 8.2 Accounts Ledger

A table with columns: Date, Type, Description, Debit, Credit. Entry types:
- **Advance** — debit entry per advance given
- **Expense** — debit entry per expense (shown after trip sheet settlement)
- **Settlement** — highlighted row marking trip sheet closure
- **Freight Bill** — credit entry for invoice amount
- **Payment** — credit entry for payment received

---

## 9. UI Components

### 9.1 SearchDropdown

A custom searchable dropdown replacing native `<select>` for all key fields. Features:
- Click to open, shows all options
- Type-ahead search input at top filters options
- Each option can have a label and optional sub-text
- Click outside to close
- Used for: Route selection, Payment mode, Expense category

### 9.2 Section Card

A bordered card with colored header containing icon + title, used throughout the form and detail views. Props: icon, title, bg (header background), borderColor.

### 9.3 Other Atoms

- **Badge** — Status pill with colored dot
- **Tag** — Small label (AUTO, UPLOADED, ON FILE)
- **Lbl** — Form label with optional required asterisk
- **Field** — Styled input field
- **Btn** — Primary/secondary button with disabled state
- **Divider** — Horizontal rule with optional label
- **InfoRow** — Label-value row for detail display

---

## 10. Right Slider Panel

- **Width:** 520px fixed, slides in from right
- **Backdrop:** Semi-transparent overlay, click to close
- **Header:** Gradient blue, shows context (title, trip count or trip ID)
- **Modes:**
  - `addTrip` — Shows AddTripForm
  - `list` — Shows filtered trip list with search, click to open detail
- **Trip list cards:** Show trip ID, LR, route, client, vehicle, driver, status badge, freight, advance amount, and tags (Delayed, ePOD, Settled)

---

## 11. Design Specifications

- **Font:** DM Sans / Segoe UI
- **Background:** #F0F4F9
- **Header:** Linear gradient #1A237E → #0F4C81
- **All form grids:** 2-column layout (1fr 1fr)
- **Info cards in route section:** 2-column
- **Border radius:** 10-16px for cards, 10px for inputs
- **Status colors:** Purple (Consignment), Blue (In Transit), Green (Delivered), Amber (Trip Sheet), Indigo (Billed), Green (Paid)

---

## 12. Sample Data Summary

| Status | Count | Example |
|--------|-------|---------|
| Consignment | 1 | Marico Pune→Ahmedabad, no vehicle |
| In Transit | 3 | Reliance Mumbai→Pune, ITC Mumbai→Nashik, Tata Delhi→Agra (delayed) |
| Delivered | 1 | Nestlé Bengaluru→Chennai |
| Trip Sheet | 2 | Tata Delhi→Agra, Nestlé Bengaluru→Chennai |
| Billed | 3 | Marico Pune→Ahmedabad, Reliance Mumbai→Pune, ITC Mumbai→Nashik |
| Paid | 3 | Reliance Mumbai→Pune, Nestlé Bengaluru→Chennai, Marico Pune→Ahmedabad |

**Total: 13 trips across all 6 statuses.**
