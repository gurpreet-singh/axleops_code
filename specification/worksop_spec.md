Workshop & Inventory
Management Module
Intelligent inventory planning, work order lifecycle, and workshop capacity management
for Transport & Logistics Fleet Operations
v1.0  |  March 2026

1. Current system gaps & requirements mapping
Analysis of 6 existing screens (Work Orders, Service History, Service Tasks, Service Programs, Purchase Orders) reveals a basic workshop management system. Below maps each user requirement to a gap and the resolution in this specification.
#
User requirement
Current gap
Resolution
R1
Part-level historical consumption (weekly) with weeks-of-coverage
Service History shows individual entries but no aggregated consumption rate per part. No coverage calculation.
Part intelligence dashboard with: weekly consumption rate (rolling 12-week avg), current stock, weeks of coverage = stock / weekly rate. Sortable columns.
R2
When to order parts — MOQ-adjusted reorder qty
No reorder logic. No MOQ field. PO creation is manual with no guidance.
Reorder engine: when stock falls below reorder point → calculate qty = max(reorder_point + safety_stock - current_stock, MOQ). If qty < MOQ, round up to MOQ. Show 'Order now' flag.
R3
Recommended inventory holding (safety stock, reorder point, avg holding) based on lead time and consumption
No lead time tracking. No safety stock. No reorder point calculation.
Per-part: safety_stock = avg_daily_consumption × lead_time_days × safety_factor. reorder_point = safety_stock + (avg_daily_consumption × lead_time_days). avg_holding = reorder_point + (MOQ / 2). Manual input for lead_time_days and safety_factor initially.
R4
Consumables ordered by weight (kg) vs parts by units
All items tracked in units. No UOM intelligence for nuts, bolts, grease, fluids.
UOM field per part: 'Units' or 'Kg'. Consumables display stock/consumption/reorder in kg. System auto-detects category from part type.
R5
Non-moving / dead inventory identification. Fast/Medium/Slow mover classification. Correct/Under/Over/Dead inventory flagging.
No movement analysis. No classification. No inventory health scoring.
Movement classifier: Fast (consumed in last 30 days), Medium (31-90 days), Slow (91-180 days), Dead (>180 days or zero consumption in 6 months). Inventory health: current stock vs recommended holding → Under (<50% of recommended), Correct (50-150%), Over (150-300%), Dead (>300% or zero consumption).
R6
Order parts directly from inventory dashboard without navigating away
PO creation is a separate screen. No quick-order from inventory view.
Inline 'Order now' button on each part row. Opens quick-order drawer with pre-filled vendor, MOQ-adjusted qty, and 1-click PO creation.
R7
Money stuck in each part (inventory value) and open PO value
Service History shows labor + parts cost per service but no inventory valuation.
Value columns: current_stock × unit_cost = inventory_value. Open PO value = sum of pending POs for that part. Total capital locked = inventory_value + open_po_value.
R8
Sort and filter all columns. Filter by inventory health, sort by money stuck, etc.
Basic search exists but no column-level sorting or advanced filtering.
Full column sorting (asc/desc) on all numeric columns. Filter chips for: movement class, inventory health, vendor, category. Multi-sort support.
R9
Vendor details per part. Multiple vendors = multiple rows. Hover for contact info.
PO shows vendor but parts have no vendor mapping.
Part-vendor mapping table. Same part from 2 vendors = 2 rows. Vendor name visible, hover → popover with contact (name, phone, email, address). Primary/secondary vendor flag.
R10
Vendor working capital terms. Payment due per vendor based on terms.
No vendor payment terms. No working capital view.
Vendor master: payment_terms_days field. Dashboard: per-vendor total payable, amount within terms, amount overdue. Working capital impact = total open POs × weighted avg payment terms.
R11
Workshop manager — upcoming work forecast (confirmed + predicted) for workforce planning.
Work Orders show current orders but no forward-looking schedule.
Work forecast screen: confirmed work orders for next 4 weeks + predicted maintenance (from service programs — vehicles due for service based on km/date). Labor hour estimation. Capacity vs demand chart.

2. Inventory intelligence engine
The inventory intelligence engine is the core of this module. It transforms the part inventory from a simple stock list into a decision-support system that tells the workshop owner exactly what to order, when, how much, and how much money is tied up.
2.1 Part master — enhanced fields
Field
Type
Input
Description
part_number
String
Manual
Unique part identifier (e.g., OIL-5W30-1L, BRK-PAD-TATA-F)
part_name
String
Manual
Human-readable name
category
Enum
Manual
Engine, Brakes, Tyres, Electrical, Body, Fluids, Filters, Consumables, Suspension, Transmission
uom
Enum
Manual
Units or Kg. Determines display and ordering logic.
is_consumable
Boolean
Auto/Manual
True for nuts, bolts, grease, fluids, washers. Auto-detected from category 'Consumables' or overridable.
unit_cost
Decimal
Manual
Cost per unit or per kg. Updated on PO receipt (weighted average).
current_stock
Decimal
System
Current inventory level. Updated on receipt (add) and work order consumption (subtract).
moq
Decimal
Manual
Minimum Order Quantity from supplier. Ordering always rounds up to MOQ multiples.
lead_time_days
Integer
Manual
Average days from PO creation to goods receipt. Used for reorder point calculation.
safety_factor
Decimal
Manual
Multiplier for safety stock (default 1.5). Higher for critical parts, lower for non-critical.
safety_stock
Decimal
Calculated
= avg_daily_consumption × lead_time_days × safety_factor
reorder_point
Decimal
Calculated
= safety_stock + (avg_daily_consumption × lead_time_days)
avg_recommended_holding
Decimal
Calculated
= reorder_point + (MOQ / 2). The ideal average stock level.
avg_weekly_consumption
Decimal
Calculated
Rolling 12-week average of consumption from work orders.
avg_daily_consumption
Decimal
Calculated
= avg_weekly_consumption / 7
weeks_of_coverage
Decimal
Calculated
= current_stock / avg_weekly_consumption. How many weeks current stock will last.
last_consumed_date
Date
System
Date of last work order that used this part.
movement_class
Enum
Calculated
Fast (consumed in 30d), Medium (31-90d), Slow (91-180d), Dead (>180d)
inventory_health
Enum
Calculated
Under (<50% of recommended), Correct (50-150%), Over (150-300%), Dead (>300% or no consumption 6mo)
inventory_value
Decimal
Calculated
= current_stock × unit_cost
open_po_qty
Decimal
System
Total quantity in open/pending POs for this part
open_po_value
Decimal
System
Total value of open POs for this part
total_capital_locked
Decimal
Calculated
= inventory_value + open_po_value

2.2 Calculation formulas
2.2.1 Weekly consumption rate
avg_weekly_consumption = sum of consumption from work orders in last 12 weeks / 12. If a part was used 48 units in the last 12 weeks, the weekly rate is 4 units/week.
For consumables (UOM = Kg): consumption is tracked in kg. If 12 kg of grease was used in 12 weeks, weekly rate = 1 kg/week.
2.2.2 Weeks of coverage
weeks_of_coverage = current_stock / avg_weekly_consumption. If current stock is 16 units and weekly consumption is 4, coverage = 4 weeks.
Color coding: Green (>6 weeks), Amber (3-6 weeks), Red (<3 weeks), Gray (zero consumption — dead stock).
2.2.3 Safety stock
safety_stock = avg_daily_consumption × lead_time_days × safety_factor.
Example: daily consumption = 0.57 units, lead time = 7 days, safety factor = 1.5 → safety stock = 0.57 × 7 × 1.5 = 6 units (rounded up).
2.2.4 Reorder point
reorder_point = safety_stock + (avg_daily_consumption × lead_time_days).
Example: safety stock = 6, daily consumption = 0.57, lead time = 7 → reorder point = 6 + (0.57 × 7) = 10 units.
When current_stock falls below reorder_point, the system flags the part for reorder.
2.2.5 MOQ-adjusted reorder quantity
raw_reorder_qty = reorder_point + safety_stock - current_stock.
If raw_reorder_qty < MOQ → order_qty = MOQ.
If raw_reorder_qty > MOQ → order_qty = ceil(raw_reorder_qty / MOQ) × MOQ (round up to nearest MOQ multiple).
Example: need 14 units, MOQ = 10 → order 20 (2 × MOQ). Need 8 units, MOQ = 12 → order 12 (1 × MOQ).
2.2.6 Movement classification
	•	Fast mover: last consumed within 30 days AND weekly consumption > 0
	•	Medium mover: last consumed within 31-90 days OR weekly consumption < 50% of peak
	•	Slow mover: last consumed within 91-180 days
	•	Dead stock: not consumed in >180 days OR zero consumption in last 6 months
2.2.7 Inventory health classification
	•	Under inventory: current_stock < 50% of avg_recommended_holding. Action: order immediately.
	•	Correct inventory: current_stock is 50-150% of avg_recommended_holding. No action needed.
	•	Over inventory: current_stock is 150-300% of avg_recommended_holding. Action: reduce orders, check if consumption dropped.
	•	Dead inventory: current_stock > 300% of avg_recommended_holding OR movement_class = Dead. Action: write off, return to vendor, or repurpose.

3. Vendor management for parts
3.1 Part-vendor mapping
A single part can be sourced from multiple vendors. Each vendor may have different prices, MOQs, and lead times. The system tracks vendor-specific data per part.
Field
Type
Description
part_vendor_id
UUID
Primary key for the part-vendor combination
part_id
FK→parts
The part
vendor_id
FK→vendors
The supplier
is_primary
Boolean
Primary vendor for this part (default source)
vendor_part_number
String
Vendor's own part number / SKU
vendor_unit_cost
Decimal
This vendor's price per unit/kg
vendor_moq
Decimal
This vendor's minimum order qty (may differ from other vendors)
vendor_lead_time_days
Integer
This vendor's typical delivery time
last_ordered_date
Date
When we last ordered this part from this vendor
last_ordered_qty
Decimal
Quantity in last order
quality_rating
Decimal
1-5 quality score based on rejection rate and delivery reliability

3.2 Vendor working capital terms
Field
Type
Description
vendor_id
UUID
Primary key
vendor_name
String
Company name
contact_person
String
Primary contact name
phone
String
Phone number
email
String
Email
address
Text
Full address
payment_terms_days
Integer
Days to pay after goods receipt (0 = immediate, 30/60/90 days credit)
credit_limit
Decimal
Max outstanding allowed with this vendor
total_outstanding
Decimal
Current unpaid amount
total_open_po_value
Decimal
Value of POs placed but not yet received/paid
payment_within_terms
Decimal
Outstanding where due date hasn't passed
payment_overdue
Decimal
Outstanding where due date has passed
gstin
String(15)
Vendor GSTIN for input credit
Working capital dashboard: for each vendor, show total_open_po_value, payment_within_terms, payment_overdue. Aggregate: total working capital stuck = sum of all vendor outstanding. Weighted average payment terms across vendors.

4. Work order lifecycle — enhanced
4.1 Work order states
State
Description
Actions available
Next states
DRAFT
WO created, not yet scheduled
Edit, assign, schedule, cancel
SCHEDULED, CANCELLED
SCHEDULED
WO has a date and bay assigned. Appears in workshop calendar.
Reschedule, start, cancel
IN_PROGRESS, CANCELLED
IN_PROGRESS
Mechanic is actively working. Parts being consumed.
Log labor hours, consume parts, add notes, pause
PAUSED, WAITING_PARTS, QUALITY_CHECK
PAUSED
Work paused (driver needed vehicle, shift end, etc.)
Resume, cancel
IN_PROGRESS, CANCELLED
WAITING_PARTS
Work stopped because required parts not in stock. Auto-creates PO suggestion.
Resume (when parts arrive), cancel
IN_PROGRESS
QUALITY_CHECK
Work complete, QC inspection in progress.
Pass QC, fail QC (rework)
COMPLETED, IN_PROGRESS (rework)
COMPLETED
All work done, vehicle released.
Close, reopen if issue found within 7 days
CLOSED, IN_PROGRESS (warranty)
CLOSED
WO archived. All costs finalized. Cannot be modified.
(Terminal)
—
CANCELLED
WO cancelled before completion. Reason captured.
(Terminal)
—

4.2 Work order — part consumption tracking
When a mechanic uses parts in a work order, the system:
	•	Decreases current_stock of the part by the consumed quantity
	•	Creates a consumption record: (work_order_id, part_id, qty, unit_cost, total_cost, consumed_by, consumed_at)
	•	Recalculates avg_weekly_consumption, weeks_of_coverage, movement_class, inventory_health for the part
	•	Checks if current_stock < reorder_point → if yes, flags for reorder and creates notification
	•	For consumables (UOM=Kg): consumption is entered in kg (e.g., '0.5 kg grease')
4.3 Work order — labor tracking
	•	Each mechanic clocks in/out on a work order: (work_order_id, mechanic_id, start_time, end_time, hours, hourly_rate, total_labor_cost)
	•	Multiple mechanics can work on one WO (e.g., 2 mechanics on a major service)
	•	Labor hours feed into workshop capacity planning
	•	Total WO cost = sum(labor_cost) + sum(parts_cost)

5. Workshop capacity & work forecasting
5.1 Workforce planning dashboard
The workshop manager needs a forward-looking view of confirmed and predicted work to plan labor. This screen shows the next 4 weeks with:
	•	Confirmed work: scheduled work orders with estimated labor hours
	•	Predicted work: vehicles due for service based on service program schedules (km or date triggers). System calculates which vehicles will hit their service interval in the next 4 weeks based on current km and daily km average.
	•	Total labor demand per week: sum of estimated hours for confirmed + predicted work
	•	Available capacity per week: number of mechanics × working hours per day × working days
	•	Capacity utilization: demand / capacity. Color coded: Green (<80%), Amber (80-100%), Red (>100%)
	•	Overtimer / hire recommendation: if utilization >100%, recommend overtime hours or temp hire
	•	Leave management: mechanics can request leave. Manager approves/rejects. Leave reduces available capacity.
5.2 Service prediction engine
For each vehicle in the fleet, the system predicts when the next service is due:
	•	From service programs: each program has an interval (e.g., every 8,000 km / 6 months). System tracks each vehicle's last service date and odometer. Next due = last_service_km + interval_km or last_service_date + interval_months (whichever comes first).
	•	Daily km estimation: from trip GPS data, calculate average daily km per vehicle. Project forward to estimate when interval will be hit.
	•	Prediction output: vehicle, service program, predicted due date, estimated labor hours, estimated parts needed (from standard BOM for that service task).

6. Purchase order workflow — enhanced
6.1 PO lifecycle
State
Description
Trigger
Next states
DRAFT
PO created but not sent to vendor
Manual or auto from reorder
SENT, CANCELLED
SENT
PO sent to vendor (email/print)
User clicks Send
ACKNOWLEDGED, CANCELLED
ACKNOWLEDGED
Vendor confirmed receipt and delivery date
Vendor response
PARTIALLY_RECEIVED, RECEIVED
PARTIALLY_RECEIVED
Some items received, some pending
GRN (Goods Receipt Note)
RECEIVED, CANCELLED (remainder)
RECEIVED
All items received. GRN complete. Stock updated.
GRN
INVOICED
INVOICED
Vendor invoice received and matched to PO + GRN
Invoice entry
PAID
PAID
Payment made to vendor
Payment recording
CLOSED
CLOSED
PO fully processed
Auto after payment
(Terminal)
CANCELLED
PO cancelled before full receipt
Manual
(Terminal)

6.2 Quick order from inventory dashboard
When the workshop owner clicks 'Order now' on a part in the inventory dashboard:
	•	System pre-fills: part number, description, primary vendor, MOQ-adjusted qty, vendor unit cost
	•	Owner can adjust qty, select alternate vendor, add notes
	•	One-click creates PO in DRAFT state
	•	Optionally: auto-send to vendor immediately (skip DRAFT, go to SENT)
	•	After PO creation: part's open_po_qty and open_po_value are immediately updated
6.3 Goods Receipt Note (GRN)
When goods arrive from vendor:
	•	Select PO → system shows expected items and quantities
	•	Enter received quantities (can be partial)
	•	Quality check: accept all, accept with remarks, reject (damaged/wrong)
	•	On acceptance: current_stock increases, open_po_qty decreases, unit_cost recalculated (weighted average)
	•	On rejection: vendor notified, replacement or credit note requested

7. Screen specifications
Screen INV-01: Part inventory intelligence dashboard (THE KEY SCREEN)
This is the primary screen that addresses requirements R1-R10. A single, powerful table with every part showing all intelligence columns. Fully sortable and filterable.
	•	Columns: Part # | Part name | Category | UOM | Vendor (hover=contact) | Unit cost | Current stock | Weekly consumption (12-wk avg) | Weeks of coverage | Safety stock | Reorder point | Recommended holding | Movement class (Fast/Med/Slow/Dead) | Inventory health (Under/Correct/Over/Dead) | Inventory value (₹) | Open PO qty | Open PO value (₹) | Total capital locked (₹) | Action (Order now)
	•	Every column is sortable (click header to sort asc/desc). Active sort shown with arrow indicator.
	•	Filter bar: Category dropdown, Movement class chips (Fast/Med/Slow/Dead), Inventory health chips (Under/Correct/Over/Dead), Vendor dropdown, UOM filter (Units/Kg)
	•	Summary metrics at top: Total inventory value, Total open PO value, Parts below reorder point, Dead stock value, Fast/Med/Slow/Dead counts
	•	Color coding: weeks_of_coverage cell — green/amber/red/gray. inventory_health cell — green/amber/red/gray.
	•	Same part from multiple vendors = separate rows. Row shows vendor name. Hover on vendor → popover with contact details.
	•	'Order now' button on parts where current_stock < reorder_point. Opens inline quick-order drawer.
	•	Consumables (UOM=Kg) show all quantities in kg with 'kg' suffix.
Screen INV-02: Quick order drawer (inline)
Slides open from right when 'Order now' is clicked. Shows: part info, vendor (dropdown to switch), MOQ-adjusted qty (editable), unit cost, total value, vendor payment terms. 'Create PO' button. 'Add more parts' to batch multiple items into one PO.
Screen WO-01: Work order board (enhanced)
Kanban board + list view. Columns: Draft, Scheduled, In Progress, Waiting Parts, QC, Completed. Cards show vehicle, tasks, assigned mechanic, priority, estimated hours. Drag between columns for state transitions. Calendar view toggle showing work scheduled by day/week.
Screen WO-02: Work order detail (enhanced)
Full WO detail with tabs: Tasks (checklist with completion), Parts consumed (add/remove parts, auto-deducts stock), Labor log (clock in/out per mechanic), Cost summary (labor + parts), Vehicle history (past WOs for this vehicle), Notes & photos.
Screen WRK-01: Workshop forecast & capacity
4-week forward view. Stacked bar chart: confirmed hours (blue) + predicted hours (amber) vs available capacity (line). Below chart: table of upcoming work by week — vehicle, service type, estimated hours, parts needed, status (confirmed/predicted). Leave calendar showing mechanic availability. Capacity utilization percentage per week.
Screen WRK-02: Vendor working capital dashboard
Per-vendor: total PO value, received not paid, overdue, payment terms. Aggregate: total working capital stuck, cash flow projection based on PO delivery dates + payment terms. Sort by overdue amount to prioritize payments.
Screen PO-01: Purchase order list (enhanced)
Enhanced with: PO lifecycle status badges, GRN tracking, vendor payment terms column, days until due. Batch PO creation from inventory reorder recommendations.
Screen PO-02: Goods receipt note
Select PO → show expected items → enter received qty → quality check → accept/reject → stock update.

8. Data model
Table
Purpose
Key relations
parts
Part master with all intelligence fields (stock, consumption, safety, reorder, movement, health)
Has many: part_vendors, consumption_records, po_items
part_vendors
Part-vendor mapping with vendor-specific price, MOQ, lead time
Belongs to: part, vendor
vendors
Vendor master with contact details and payment terms
Has many: part_vendors, purchase_orders
consumption_records
Every part consumption event from work orders
Belongs to: work_order, part. Used for consumption rate calculation.
work_orders
Enhanced WO with full lifecycle, bay assignment, labor tracking
Belongs to: vehicle. Has many: wo_tasks, wo_parts, wo_labor
wo_tasks
Individual tasks within a work order (from service task catalog)
Belongs to: work_order, service_task
wo_parts
Parts consumed in a work order with qty and cost
Belongs to: work_order, part
wo_labor
Mechanic time logs per work order
Belongs to: work_order, mechanic (user)
purchase_orders
Enhanced PO with full lifecycle, GRN tracking, payment tracking
Belongs to: vendor. Has many: po_items, grn_items
po_items
Line items in a PO with part, qty, cost
Belongs to: purchase_order, part
grn_items
Goods receipt records: received qty, accepted qty, rejected qty
Belongs to: purchase_order, po_item
workshop_bays
Physical bays/slots in the workshop
Used for scheduling
mechanic_availability
Leave/availability calendar for mechanics
Belongs to: user (mechanic)
service_predictions
System-generated predictions of upcoming vehicle services
Belongs to: vehicle, service_program

9. Implementation roadmap
Phase 1: Part master + inventory intelligence (Weeks 1-3)
	•	Enhance parts table with all intelligence fields (MOQ, lead time, safety factor, UOM, is_consumable)
	•	Build consumption tracking from work orders → consumption_records table
	•	Implement calculation engine: weekly consumption, coverage, safety stock, reorder point, movement class, inventory health
	•	Build Part Inventory Intelligence Dashboard (INV-01) — the primary deliverable
	•	Implement column sorting and filtering on all columns
	•	Add vendor mapping per part (part_vendors table) with contact popover
Phase 2: Quick ordering + PO enhancement (Weeks 4-5)
	•	Build quick order drawer (INV-02) with MOQ-adjusted qty pre-fill
	•	Enhance PO lifecycle with ACKNOWLEDGED, PARTIALLY_RECEIVED, INVOICED, PAID states
	•	Build GRN (Goods Receipt Note) workflow with stock auto-update
	•	Connect PO data back to parts: open_po_qty, open_po_value
	•	Build Vendor Working Capital Dashboard (WRK-02)
Phase 3: Work order lifecycle + labor (Weeks 6-8)
	•	Enhance work order state machine (add WAITING_PARTS, QUALITY_CHECK, PAUSED)
	•	Build part consumption from within work orders (wo_parts) with auto stock deduction
	•	Build labor time tracking (wo_labor) with clock in/out
	•	Build enhanced WO board (WO-01) with Kanban + calendar views
	•	Build WO detail (WO-02) with all tabs
Phase 4: Forecasting + capacity planning (Weeks 9-10)
	•	Build service prediction engine from service programs + vehicle km data
	•	Build workshop forecast & capacity dashboard (WRK-01)
	•	Build leave management for mechanics
	•	Build capacity utilization alerts (>100% → overtime/hire recommendation)

— End of specification —
