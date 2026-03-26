Route Management
& Planning Specification
Slider-based UX • Workflow template binding • Toll plaza mapping
Performance analytics • Risk scoring • Route lifecycle
v2.0 — Slider UX  |  March 2026

1. UX paradigm: Slider-based interaction
The route management module uses a slider (right-side drawer) as its primary interaction pattern. The user never leaves the route list table. All viewing, editing, and creating of route data happens in a right-side slider panel that overlays the table.
1.1 Why slider-based (not page-based)
	•	Context preservation: the user always sees the route list behind the slider. They know where they are. They can compare routes visually while viewing detail.
	•	Workflow efficiency: a dispatcher working through routes doesn't need to navigate back and forth. Click a row → slider opens → review/edit → close slider → click next row. 50% fewer page transitions.
	•	Batch operations: user can quickly scan multiple routes by clicking row after row. Each click replaces the slider content without a page load.
	•	Progressive disclosure: the table shows summary data (distance, toll, template, risk). The slider reveals full detail only when needed. Reduces cognitive load.
	•	Consistent with modern SaaS patterns: Linear, Notion, Salesforce Lightning, and most B2B tools use slider/drawer patterns for master-detail views.
1.2 Slider anatomy
	•	Width: 55% of viewport (default), resizable to 40–75%. On mobile: full-screen.
	•	Header: Route name + badges + close button. Sticky at top of slider.
	•	Tabs inside slider: Overview, Toll plazas, Workflow template, Contracts, Performance, Trip history. Tabs scroll within the slider.
	•	Footer: Action buttons (Save, Edit, Add trip from this route). Sticky at bottom.
	•	Backdrop: route list is dimmed 30% but visible and scrollable. Clicking backdrop closes slider.
	•	Keyboard: Escape closes. Arrow up/down navigates to prev/next route without closing slider.
	•	Animation: slides in from right (200ms ease-out). Content loads immediately (no lazy load for current route data).
1.3 Slider modes
	•	VIEW mode: displays route detail read-only. All tabs available. This is the default when clicking a row.
	•	EDIT mode: fields become editable. Triggered by 'Edit' button in slider header. Save/Cancel in footer.
	•	CREATE mode: blank form for new route creation. Triggered by '+ Add route' button. Same tabs structure but as input forms.
1.4 Application-wide slider pattern
This slider pattern should be used across the ENTIRE TripFlow application — not just routes. Everywhere there is a master list/table with a detail view, the slider pattern applies:
	•	Route list → Route slider (this spec)
	•	Trip list → Trip slider (future: replace trip detail page with slider)
	•	Client list → Client slider
	•	Invoice list → Invoice slider
	•	Work order list → Work order slider
	•	Alert list → Alert slider
	•	Part inventory list → Part slider
The slider component should be built as a reusable system component (SliderPanel) that any module can use.

2. Route architecture — three-layer model
Layer 1 — ROUTE (Operational): Distance, highways, toll plazas, diesel, geofences, instructions. Scoped to Client + Vehicle Type + Origin + Destination.
Layer 2 — ROUTE CONTRACT (Financial): Rate, billing type, SLA, demurrage, payment terms, GST. One route can have multiple contracts over time.
Layer 3 — WORKFLOW TEMPLATE (Process): Which verification steps are active, GPS frequency, POD requirements, settlement rules. Bound to route via workflow_template_id FK.
FK chain: Trip → Route Contract (nullable) → Route (always set) → Client. From these, system resolves everything: client, vehicle type, distance, tolls, rate, SLA, workflow template.

3. Current gaps
#
Gap
Impact
Resolution
G1
No workflow template on route
Dispatcher must manually select template for every trip. Wrong template = wrong verification steps, wrong GPS frequency.
Add workflow_template_id FK on routes. Auto-inherit on trip creation. Override possible per trip.
G2
No toll plaza mapping
Toll is a single number. Cannot validate FASTag charges. Cannot detect route deviations by comparing expected vs actual tolls.
route_toll_plazas table: plaza name, km marker, vehicle class rate, FASTag discount, state border flag.
G3
No route risk scoring
No quantified assessment. Ops relies on tribal knowledge for risky routes.
Composite risk score (1–10) from: SLA breach rate, damage rate, exception frequency, seasonal factors. Updated monthly.
G4
No performance analytics
Route detail shows YTD revenue but no trends, no benchmark accuracy, no P&L per route.
Performance tab in slider: monthly volume trend, estimate accuracy, on-time trend, exception breakdown, profitability.
G5
No seasonal adjustments
Monsoon adds 4–6 hours. Winter fog adds 2–3 hours. No mechanism to adjust estimates.
Seasonal override layer: date-range adjustments for duration, diesel, risk. Auto-activated by calendar.
G6
No alternate routes
If primary route is blocked, no pre-configured alternatives.
Alternate routes linked to primary. Auto-suggested on ROUTE_BLOCKED exception.
G7
No waypoint mapping
No intermediate points (toll plazas, fuel stations, rest stops, state borders, weigh bridges).
route_waypoints table: ordered list with type, km marker, GPS coords, mandatory checkpoint flag.
G8
No ad-hoc route approval
Ad-hoc routes bypass calibration.
Ad-hoc created with is_adhoc=true. After 3 trips, system prompts promotion with actual data.
G9
No geofence configuration per route
Geofence radius is global default. Industrial areas need larger radius.
Per-route origin_geofence_radius_m and dest_geofence_radius_m fields.
G10
No return route linking
No link between outbound and return legs for round-trip costing.
return_route_id FK. Round-trip cost = outbound + return. Utilization tracking.
G11
Page-based navigation is slow
Click route → new page load → back button → list reloads. Breaks workflow.
Slider-based UX: route list stays on screen, detail opens in right drawer. All CRUD in slider.
G12
No corridor-level comparison
Cannot compare vehicle types on the same corridor side-by-side.
Corridor grouping: group routes by origin_city + dest_city. Comparison view within slider.

4. Route data model — enhanced fields
Field
Type
New?
Description
route_id / route_code
UUID / String
Existing
Primary key + human-readable code (RTE-0012)
client_id
FK
Existing
Scoped to specific client
vehicle_type
Enum
Existing
Multi-Axle, 2-Axle, Container 40ft, LCV, Tanker, 3-Axle
origin_city, origin_state, origin_location, origin_pincode
String
Existing
Origin details
origin_lat, origin_lng
Decimal
NEW
GPS coords for origin geofence
origin_geofence_radius_m
Integer
NEW
Geofence radius (default 1000). Larger for JNPT etc.
destination_city, destination_state, destination_location, destination_pincode
String
Existing
Destination details
dest_lat, dest_lng
Decimal
NEW
GPS coords for destination geofence
dest_geofence_radius_m
Integer
NEW
Destination geofence radius (default 500)
distance_km
Decimal
Existing
Route distance
est_duration_min, est_duration_max
Integer
Existing
Transit time range in minutes
via_highway
String
Existing
Highway names
toll_estimate
Decimal
Existing
Total toll cost = SUM of route_toll_plazas
toll_plaza_count
Integer
Existing
Count of toll plazas
diesel_estimate_litres
Decimal
Existing
Estimated diesel consumption
avg_kmpl
Decimal
Existing
Historical average fuel efficiency
diesel_price_per_litre
Decimal
NEW
Current diesel price. Auto-updated daily.
workflow_template_id
FK
NEW
Links to workflow_templates. THE KEY MISSING FIELD.
risk_score
Decimal(3,1)
NEW
Route risk 1–10. Computed monthly from historical data.
risk_factors
JSONB
NEW
Breakdown: {sla_breach_rate, damage_rate, theft_risk, road_quality, weather}
seasonal_period
String
NEW
e.g. 'Jun 15–Sep 30' for monsoon adjustment
seasonal_duration_add_pct
Decimal
NEW
% added to duration during seasonal period
return_route_id
FK
NEW
Paired return route for round-trip costing
is_adhoc
Boolean
NEW
True for uncalibrated ad-hoc routes
adhoc_trip_count
Integer
NEW
Trips completed. Promote after 3.
status
Enum
NEW
ACTIVE, INACTIVE, PENDING_APPROVAL, SUSPENDED
benchmark_total_expense
Decimal
NEW
Sum of diesel + toll + driver + loading + misc benchmarks
loading_instructions, unloading_instructions
Text
Existing
Operational instructions
branch
String
Existing
Global or branch-specific

5. Toll plaza mapping & route waypoints
5.1 route_toll_plazas
Each toll plaza on the route as a separate record. Sum of effective_rate = toll_estimate on route.
	•	Fields: id, route_id, plaza_name, km_marker, highway, latitude, longitude, nhai_category, single_journey_rate, fastag_discount_pct, effective_rate, is_state_border, state_entering, sequence_order, last_rate_update
	•	When actual FASTag data comes in during a trip, system compares per-plaza: expected vs actual. Discrepancy = route deviation indicator.
5.2 route_waypoints
Key stops along the route: toll plazas, fuel stations, rest areas, state borders, weigh bridges, key cities.
	•	Fields: id, route_id, waypoint_type (TOLL_PLAZA / FUEL_STATION / REST_AREA / STATE_BORDER / WEIGH_BRIDGE / KEY_CITY / CHECKPOINT), name, km_from_origin, expected_passage_time, latitude, longitude, geofence_radius_m, is_mandatory_checkpoint, notes, sequence_order
	•	For Hazmat template with checkpoints_enabled=true, waypoints marked is_mandatory_checkpoint=true trigger AT_CHECKPOINT state transitions.

6. Workflow template binding
6.1 Resolution hierarchy
	•	Priority 1 — Trip-level override (dispatcher manually selects)
	•	Priority 2 — Route-level (route.workflow_template_id) ← THIS IS THE DEFAULT
	•	Priority 3 — Contract-level fallback
	•	Priority 4 — Client-level default
	•	Priority 5 — System default: Standard
6.2 Auto-suggestion when creating route
	•	Tanker vehicle type → suggest Hazmat
	•	Container 40ft → suggest Heavy Cargo
	•	Distance < 200 km → suggest Express
	•	Multi-stop routes → suggest Multi-Drop
	•	Suggestion is displayed in the slider during route creation. User can override.

7. Slider tab specifications
Tab 1: Overview
Route operational data: client, vehicle type, origin/dest with pincode (EWB dispatch/delivery PIN), distance, duration, via highway, toll estimate, diesel estimate, avg KMPL. Vehicle type card: NHAI category, toll per plaza avg, avg loaded weight, diesel KMPL, current diesel price. Expense benchmarks: diesel cost, toll, driver allowance, loading/unloading, misc, total benchmark. Risk score card with factor breakdown.
Tab 2: Toll plazas
Table of all toll plazas: sequence #, name, highway, km marker, rate, cumulative total. Add/edit/remove plazas inline. Total at bottom matching route toll_estimate. State border indicators. FASTag discount applied.
Tab 3: Workflow template
Assigned template badge with all feature flags displayed. Change template dropdown. Resolution hierarchy visual showing which level this route's template was assigned at. Warnings if template conflicts with route characteristics (e.g., Hazmat checkpoint interval vs route distance).
Tab 4: Contracts
Route contracts table: contract ID, billing type, rate, SLA, min margin, volume commitment, achieved MTD, demurrage, payment terms, GST, effective dates. New contract button. Info banner: contracts hold only financial data. FK chain visualization.
Tab 5: Performance
Monthly trip volume chart (6 months). Estimate accuracy bars: transit time, diesel, toll, total expense. On-time delivery trend. Top exceptions on this route. Profitability trend.
Tab 6: Trip history
Recent trips on this route: trip ID, date, driver, vehicle, actual time, actual diesel, SLA status, margin. Click any trip → opens trip slider (nested or replaces current).

8. Route lifecycle states
State
Description
Transitions to
Who
DRAFT
Route being configured in slider CREATE mode. All fields editable.
ACTIVE, PENDING_APPROVAL
Ops admin, dispatcher
PENDING_APPROVAL
Ad-hoc route awaiting review. Auto-triggered after 3 trips.
ACTIVE (promote), REJECTED
Ops manager
ACTIVE
Available for trip creation. Fully calibrated.
INACTIVE, SUSPENDED
Ops admin
INACTIVE
Decommissioned. No new trips. Historical data preserved.
ACTIVE (reactivate)
Ops admin
SUSPENDED
Temporarily disabled (road construction, seasonal). Auto-reactivates.
ACTIVE (auto/manual)
Ops admin, system

9. Implementation roadmap
Phase 1: Slider component + route CRUD (Weeks 1–2)
	•	Build reusable SliderPanel component (width, animation, backdrop, keyboard, resize)
	•	Implement route list with slider: click row → VIEW mode slider. Arrow keys for prev/next.
	•	Build all 6 tabs in slider with VIEW mode content
	•	Build EDIT mode: fields become inputs. Save/Cancel in footer.
	•	Build CREATE mode: blank form with same tab structure.
	•	Add workflow_template_id FK with template assignment UI
Phase 2: Toll mapping + waypoints + geofence (Weeks 3–4)
	•	Build route_toll_plazas CRUD with inline editing in Toll Plazas tab
	•	Build route_waypoints CRUD
	•	Add geofence fields. Per-route radius configuration.
	•	Connect toll plazas to toll_estimate calculation (SUM of effective_rate)
Phase 3: Performance + risk + analytics (Weeks 5–6)
	•	Build route_performance_monthly with cron computation
	•	Build Performance tab charts: volume, accuracy, on-time, exceptions
	•	Implement risk score calculation and display
	•	Build Trip History tab with recent trips and actuals vs estimates
Phase 4: Seasonal, alternates, ad-hoc promotion (Weeks 7–8)
	•	Build seasonal adjustment layer
	•	Build alternate route linking
	•	Build ad-hoc route promotion workflow (3-trip auto-prompt)
	•	Build return route linking with round-trip costing
	•	Roll out slider pattern to other modules (trips, clients, invoices)

— End of specification —
