Client & Invoicing
Module Specification
Transport & Logistics Management System
Technical Product Architecture Document  |  v2.0  |  March 2026
Prepared by: Product & Engineering

Table of contents
1. Executive summary
2. Current system analysis & gap assessment
3. Client management module — complete specification
4. Invoicing & billing module — complete specification
5. Settlement engine — specification
6. Data model & schema design
7. API contract specification
8. Business rules engine
9. Integration points
10. Screen inventory & wireframe specifications
11. Implementation roadmap
12. Acceptance criteria & test scenarios

1. Executive summary
This specification defines the complete Client Management and Invoicing & Billing modules for the transport logistics platform. It covers the full lifecycle from client onboarding, contract definition, and rate management through trip-level settlement, consolidated period invoicing, GST compliance, payment tracking, credit management, and aging analysis.
The document identifies gaps in the current implementation (as observed in the existing Settlement & Invoicing screens and Clients & Billing screens), proposes a unified architecture, and provides screen-level specifications, data models, API contracts, business rules, and a phased implementation plan.
1.1 Scope boundaries
In scope
Out of scope
Client master (CRUD, contacts, addresses, documents)
CRM pipeline / lead management
Contract management (rate cards, SLAs, terms)
Fleet management / vehicle master
Multi-rate engine (Per KM, Per Trip, Per Tonne, Per Package, slab-based)
Driver payroll / HR module
Trip-level settlement with expense reconciliation
Warehouse management system
Consolidated period invoicing with GST/E-Invoice
Route optimization engine
Payment tracking, receipts, and reconciliation
GPS hardware provisioning
Credit limit management and approval workflows
Third-party TMS integration
Aging analysis, outstanding reports, dunning
Accounting / General ledger (API out)
Client portal (self-service shipment, POD, invoices)
Fuel card management

2. Current system analysis & gap assessment
Analysis of the four existing screens reveals a solid foundation with significant gaps that this specification addresses.
2.1 What exists (from screenshots)
	•	Settlement & Invoicing screen: Per-trip settlement table with contract rate, expenses, deductions, net receivable, vendor payable, margin calculation. Settlement breakdown panel showing line-item expenses. Invoice preview with GST calculation.
	•	Clients & Billing screen: Client list with industry, contract type (Per KM / Per Trip / Per Tonne), base rate, total trips, revenue MTD, outstanding balance, active/inactive status.
	•	Invoices screen: Period-based consolidated invoices with trip count, base amount, GST, total, due date, and status (Sent/Pending/Overdue/Paid).
2.2 Critical gaps identified
#
Gap
Impact
Resolution
G1
No client detail screen
Cannot manage contacts, addresses, GSTIN per branch, KYC documents, or contract history
Build comprehensive client profile screen with tabs
G2
No contract versioning
Rate changes overwrite history; no audit trail; disputes unresolvable
Implement contract lifecycle: draft → active → amended → expired with version chain
G3
No multi-branch billing
Clients like Reliance have multiple delivery branches with different GSTINs; single GSTIN breaks GST compliance
Branch-level billing entity with separate GSTIN, address, and contact per branch
G4
No credit limit system
No mechanism to prevent over-exposure to a client; unlimited credit risk
Credit limit per client with configurable approval workflow when limit approached/breached
G5
No payment receipt tracking
Invoices show status but no payment recording, partial payment, or reconciliation
Payment receipt module with UTR tracking, partial payments, TDS deduction, advance adjustment
G6
No credit/debit notes
Shortage deductions and disputes cannot generate formal GST-compliant credit notes
Credit note generation linked to exceptions/disputes with GST reversal
G7
No aging analysis
Cannot see 30/60/90/120+ day outstanding breakdown per client
Aging report with bucket analysis, dunning triggers, and escalation workflow
G8
No E-Invoice integration
GST B2B invoices above threshold require IRN generation on government portal
E-Invoice API integration with QR code on invoice PDF
G9
No recurring billing config
Every invoice cycle requires manual trigger; no auto-schedule
Billing schedule per client: cycle (weekly/fortnightly/monthly), cutoff day, due date offset
G10
Settlement lacks multi-rate calc
Current settlement hardcodes ₹/km; no support for per-trip or per-tonne contracts
Rate engine that resolves rate from contract type, applies weight slabs, minimum guarantees, fuel surcharges
G11
No client-side portal
Clients cannot self-serve: view invoices, download PODs, request shipments, raise disputes
Client portal with authenticated access and scoped visibility
G12
No TDS handling
Indian clients deduct TDS (1-2%) at payment; no tracking of TDS certificates or reconciliation
TDS certificate tracking per quarter with Form 26AS reconciliation helper

3. Client management module
3.1 Client master entity
Each client is an organization with one or more branches. The client master stores organization-level information, while branches store billing and delivery-specific data.
3.1.1 Client entity fields
Field
Type
Required
Validation
Notes
client_id
UUID
Auto
System-generated
Primary key
client_code
String(12)
Auto
CLT-YYYYMMDD-NNN
Human-readable unique code
legal_name
String(200)
Yes
Non-empty
Registered legal entity name
trade_name
String(200)
Optional

Common/brand name (display name)
industry
Enum
Yes
Predefined list
Petrochemicals, FMCG, Steel & Metals, Auto, Infrastructure, Chemicals, Pharma, 3PL, Other
client_type
Enum
Yes

Direct, Broker, 3PL, Group Company
pan_number
String(10)
Yes
ABCDE1234F format
Validated against government DB
primary_gstin
String(15)
Yes
Valid GSTIN format
Head office GSTIN; branches have their own
incorporation_date
Date
Optional

Company registration date
website
URL
Optional
Valid URL

credit_limit
Decimal
Yes
> 0
Maximum outstanding allowed (INR)
credit_days
Integer
Yes
1-180
Payment terms: days from invoice date
billing_cycle
Enum
Yes

Weekly, Fortnightly, Monthly, Bi-Monthly
billing_cutoff_day
Integer
Yes
1-28
Day of month for invoice cutoff
tds_applicable
Boolean
Yes

Whether client deducts TDS
tds_rate
Decimal
Conditional
0-100
TDS rate if applicable (usually 1% or 2%)
status
Enum
Yes

Prospect, Active, On Hold, Suspended, Inactive
onboarded_at
DateTime
Auto

When status first became Active
onboarded_by
FK→users
Auto

User who activated the client
account_manager
FK→users
Yes

Primary relationship manager
created_at
DateTime
Auto

Record creation timestamp
updated_at
DateTime
Auto

Last modification timestamp

3.1.2 Branch entity fields
A client must have at least one branch (the HQ). Each branch can have a unique GSTIN, address, and billing contact. Invoices are always generated at the branch level to ensure GST compliance (place of supply rules).
Field
Type
Required
Notes
branch_id
UUID
Auto
Primary key
client_id
FK→clients
Yes
Parent client
branch_name
String(100)
Yes
e.g., Mumbai HQ, Delhi Warehouse, Jamnagar Refinery
branch_code
String(10)
Auto
CLT-BR-001 format
is_primary
Boolean
Yes
Exactly one branch must be primary
gstin
String(15)
Yes
Branch-level GSTIN (can differ from HQ for interstate branches)
address_line1
String(200)
Yes
Street address
address_line2
String(200)
Optional
Locality / area
city
String(100)
Yes

state
String(50)
Yes
Must match GSTIN state code
pincode
String(6)
Yes
Indian pincode
state_code
String(2)
Auto
Derived from GSTIN first 2 digits
billing_contact_name
String(100)
Yes
Person who handles invoices
billing_contact_email
Email
Yes
Invoice delivery email
billing_contact_phone
String(15)
Yes

ops_contact_name
String(100)
Optional
Person for operational coordination
ops_contact_phone
String(15)
Optional

is_active
Boolean
Yes
Soft delete for branches

3.2 Contract management
Contracts define the commercial terms between the transport company and the client. Each contract has a version history, rate cards, SLA definitions, and payment terms.
3.2.1 Contract lifecycle
	•	DRAFT: Created but not yet activated. Can be edited freely.
	•	PENDING_APPROVAL: Submitted for management approval. Locked for editing.
	•	ACTIVE: Approved and in effect. Trips can be created against this contract.
	•	AMENDED: A new version was created from this contract. This version is frozen.
	•	EXPIRED: End date has passed. No new trips; existing trips settle under this contract.
	•	TERMINATED: Manually ended before expiry. Reason captured.
3.2.2 Contract entity
Field
Type
Notes
contract_id
UUID
Primary key
contract_number
String(20)
Human-readable: RC-YYYY-NNNN (e.g., RC-2024-0017)
client_id
FK→clients
Parent client
version
Integer
Starts at 1; increments on amendment
parent_contract_id
FK→contracts
NULL for original; points to previous version on amendment
status
Enum
DRAFT, PENDING_APPROVAL, ACTIVE, AMENDED, EXPIRED, TERMINATED
effective_from
Date
Start date of contract validity
effective_until
Date
End date; NULL for open-ended contracts
auto_renew
Boolean
If true, system creates new version on expiry
renewal_notice_days
Integer
Days before expiry to send renewal reminder (default 30)
rate_type
Enum
PER_KM, PER_TRIP, PER_TONNE, PER_PACKAGE, SLAB_BASED
fuel_surcharge_enabled
Boolean
Whether diesel price fluctuation adjusts rates
fuel_surcharge_base_price
Decimal
Base diesel price for surcharge calculation (₹/litre)
fuel_surcharge_formula
String
e.g., '((current - base) / base) * freight * 0.4'
minimum_guarantee_trips
Integer
Minimum trips per month committed by client (for volume discounts)
minimum_guarantee_revenue
Decimal
Minimum monthly revenue commitment
sla_delivery_hours
Integer
Default SLA for all routes (overridable per route)
sla_penalty_rate
Decimal
₹ per hour of delay (or % of freight)
sla_penalty_cap
Decimal
Maximum penalty per trip (% of freight, e.g., 10%)
loading_detention_free_hours
Integer
Free loading time before detention charges (default 4)
loading_detention_rate
Decimal
₹ per hour after free time
unloading_detention_free_hours
Integer
Free unloading time (default 4)
unloading_detention_rate
Decimal
₹ per hour after free time
payment_terms_days
Integer
Overrides client-level credit_days for this contract
notes
Text
Internal notes about the contract
approved_by
FK→users
Manager who approved
approved_at
DateTime
Approval timestamp

3.2.3 Route rate card
Each contract has route-level rates. A single contract can have different rates for different routes (e.g., Mumbai→Delhi is ₹34.15/km but Mumbai→Pune is ₹38.00/km due to shorter distance overhead).
Field
Type
Notes
rate_card_id
UUID
Primary key
contract_id
FK→contracts
Parent contract
route_id
FK→routes
Specific route; NULL means 'default rate for all routes'
vehicle_type
Enum
Multi-Axle, Single-Axle, Container, Mini-Truck, ALL
base_rate
Decimal
Rate value in ₹ (interpretation depends on contract.rate_type)
min_freight
Decimal
Minimum freight charge per trip regardless of calculated amount
weight_slab_json
JSON
For PER_TONNE: [{min:0,max:20,rate:1200},{min:20,max:40,rate:1100}]
distance_slab_json
JSON
For SLAB_BASED: [{min:0,max:500,rate:38},{min:500,max:1000,rate:34}]
loading_charge
Decimal
Fixed loading charge included in freight
unloading_charge
Decimal
Fixed unloading charge
oda_surcharge
Decimal
Out-of-delivery-area surcharge (₹ or %)
multi_drop_surcharge
Decimal
Per additional drop point surcharge
is_active
Boolean
Active rate card for this route

3.3 Credit management
The credit management subsystem prevents over-exposure to any single client and provides early warning before credit limits are breached.
3.3.1 Credit limit rules
	•	Total outstanding = sum of all unpaid/partially-paid invoices for the client
	•	Available credit = credit_limit - total_outstanding
	•	Exposure = total_outstanding + value of in-transit trips (estimated freight)
	•	When a new trip is created, system checks: exposure + estimated freight < credit_limit
	•	If within limit: trip proceeds normally
	•	If 80-100% of limit: trip proceeds but alert sent to account manager and finance
	•	If exceeds limit: trip is blocked. Override requires finance manager approval.
	•	Credit limit can be temporarily increased with approval (stores increase amount, reason, expiry date, approver)
3.3.2 Credit events table
Every credit-impacting event is logged: invoice raised (increases outstanding), payment received (decreases outstanding), credit note issued (decreases outstanding), debit note issued (increases outstanding), trip created (increases exposure), trip cancelled (decreases exposure).

4. Invoicing & billing module
4.1 Invoice generation workflow
Invoices are generated per client branch, per billing period. The system supports both manual and auto-scheduled generation.
4.1.1 Invoice generation steps
	•	Step 1 — Trip selection: System selects all trips for the client+branch that are in POD_VERIFIED or SETTLED status, delivered within the billing period, and not yet invoiced.
	•	Step 2 — Rate resolution: For each trip, resolve the freight rate from the active contract. Apply rate_type logic (per_km × distance, per_trip flat, per_tonne × weight, slab lookup). Apply minimum freight floor. Apply fuel surcharge if enabled. Apply multi-drop surcharge if applicable.
	•	Step 3 — Deduction application: Apply SLA penalties (if trip.sla_status = BREACHED, calculate penalty per contract terms). Apply shortage deductions (from POD shortage_qty × cargo value per unit). Apply damage deductions (from exception resolution). Apply any negotiated discounts.
	•	Step 4 — Tax calculation: Determine GST type based on place of supply. If supplier state = client branch state → CGST + SGST (each at 9% of 18% total). If different states → IGST at 18%. HSN code: 9965 (Goods Transport Services) or 9966 depending on service type.
	•	Step 5 — Invoice creation: Generate invoice number (INV-YYYY-NNNN sequential). Create invoice record with all line items. Calculate totals. If amount exceeds E-Invoice threshold (currently ₹5 Cr, subject to government notification), trigger E-Invoice generation for IRN and QR code.
	•	Step 6 — Review & approval: Invoice enters DRAFT status. Finance reviewer checks totals, line items, GST. Approver signs off. Status moves to APPROVED.
	•	Step 7 — Dispatch: Generate PDF. Email to client billing contact. Status moves to SENT. Due date = invoice date + credit_days.
4.1.2 Invoice entity
Field
Type
Notes
invoice_id
UUID
Primary key
invoice_number
String(20)
Sequential: INV-YYYY-NNNN. Immutable once generated.
client_id
FK→clients
Parent client
branch_id
FK→branches
Billing branch (determines GSTIN and place of supply)
contract_id
FK→contracts
Contract under which rates were applied
period_start
Date
Billing period start date
period_end
Date
Billing period end date
trip_count
Integer
Number of trips included
base_amount
Decimal
Sum of freight charges before tax
deductions_total
Decimal
Sum of all deductions (penalties, shortages, discounts)
taxable_amount
Decimal
base_amount - deductions_total
cgst_rate
Decimal
CGST rate (9% if intrastate)
cgst_amount
Decimal
CGST amount
sgst_rate
Decimal
SGST rate (9% if intrastate)
sgst_amount
Decimal
SGST amount
igst_rate
Decimal
IGST rate (18% if interstate)
igst_amount
Decimal
IGST amount
total_tax
Decimal
cgst + sgst + igst
total_amount
Decimal
taxable_amount + total_tax
tds_expected
Decimal
Expected TDS deduction (if client.tds_applicable)
net_receivable
Decimal
total_amount - tds_expected
amount_paid
Decimal
Running total of payments received
amount_outstanding
Decimal
net_receivable - amount_paid
status
Enum
DRAFT, APPROVED, SENT, PARTIALLY_PAID, PAID, OVERDUE, DISPUTED, CANCELLED, WRITTEN_OFF
due_date
Date
invoice_date + credit_days
irn
String(64)
Invoice Reference Number from E-Invoice portal (if applicable)
qr_code_data
Text
Signed QR code string for E-Invoice compliance
pdf_url
URL
S3 path to generated invoice PDF
sent_at
DateTime
When email was dispatched
sent_to
Email[]
Recipients of invoice email
notes
Text
Any remarks or special instructions
created_by
FK→users
Creator
approved_by
FK→users
Approver
created_at
DateTime


4.1.3 Invoice line items
Each trip in the invoice becomes a line item with full rate calculation breakdown.
Field
Type
Notes
line_item_id
UUID
Primary key
invoice_id
FK→invoices
Parent invoice
trip_id
FK→trips
The trip being billed
lr_number
String
LR number for reference
route_description
String
e.g., Mumbai → Ahmedabad (540 km)
vehicle_number
String
Vehicle used
delivery_date
Date
When cargo was delivered
rate_type
Enum
PER_KM, PER_TRIP, PER_TONNE, etc.
rate_value
Decimal
Rate applied (₹34.15/km, ₹48,000/trip, etc.)
quantity
Decimal
Distance in km, weight in MT, or 1 for per-trip
gross_freight
Decimal
rate_value × quantity
fuel_surcharge
Decimal
Fuel surcharge amount
loading_charge
Decimal
From rate card
unloading_charge
Decimal
From rate card
oda_surcharge
Decimal
Out-of-delivery-area charge
detention_charge
Decimal
Loading/unloading detention
multi_drop_charge
Decimal
Additional drop point charge
total_freight
Decimal
Sum of all charges above
sla_penalty
Decimal
Deduction for SLA breach
shortage_deduction
Decimal
Deduction for shortage
damage_deduction
Decimal
Deduction for damage
discount
Decimal
Any negotiated discount
net_amount
Decimal
total_freight - deductions
hsn_code
String(8)
9965 or 9966

4.2 Payment management
4.2.1 Payment receipt entity
When a client makes a payment, it is recorded and allocated against one or more invoices. The system supports partial payments, advance payments, TDS deductions, and bank reconciliation.
Field
Type
Notes
payment_id
UUID
Primary key
payment_number
String
PAY-YYYY-NNNN
client_id
FK→clients
Paying client
payment_date
Date
Date payment was received
payment_mode
Enum
NEFT, RTGS, IMPS, UPI, Cheque, Cash, Demand Draft
utr_number
String
Unique Transaction Reference (for electronic payments)
cheque_number
String
For cheque payments
bank_name
String
Payer's bank
gross_amount
Decimal
Total amount received
tds_amount
Decimal
TDS deducted by client
net_amount
Decimal
gross_amount + tds_amount (total against outstanding)
allocated_amount
Decimal
Amount allocated to specific invoices
unallocated_amount
Decimal
Advance / unallocated balance
status
Enum
RECEIVED, ALLOCATED, PARTIALLY_ALLOCATED, BOUNCED, REVERSED
received_by
FK→users
User who recorded the payment
notes
Text
Payment remarks

4.2.2 Payment allocation
A single payment can be split across multiple invoices. Each allocation links a payment to an invoice with an amount.
	•	payment_allocation_id, payment_id (FK), invoice_id (FK), allocated_amount, tds_amount, allocated_at, allocated_by
	•	When allocated_amount + tds_amount >= invoice.net_receivable, invoice status → PAID
	•	When allocated_amount > 0 but < net_receivable, invoice status → PARTIALLY_PAID
	•	Unallocated amounts are tracked as advance and can be auto-adjusted against future invoices
4.2.3 Credit note / debit note
Credit notes reduce the client's outstanding (for shortages, penalties, disputes). Debit notes increase it (for additional charges, corrections). Both are GST-compliant documents with their own sequential numbering.
	•	cn_id, cn_number (CN-YYYY-NNNN), invoice_id (FK, if linked to specific invoice), client_id, branch_id, reason (Shortage, Damage, SLA Penalty, Rate Correction, Other), amount, tax_amount, total, status, approved_by

4.3 Aging analysis & collections
4.3.1 Aging buckets
Outstanding invoices are categorized into aging buckets based on days past due date:
	•	Current (not yet due)
	•	1-30 days overdue
	•	31-60 days overdue
	•	61-90 days overdue
	•	91-120 days overdue
	•	120+ days overdue (critical)
4.3.2 Dunning workflow
	•	Day 0 (due date): Automated payment reminder email
	•	Day 7: Second reminder with escalation to client's finance head
	•	Day 15: Alert to account manager and internal finance manager
	•	Day 30: Client status changes to ON_HOLD. New trips blocked unless overridden.
	•	Day 60: Formal demand notice. Escalation to management.
	•	Day 90: Client status changes to SUSPENDED. All operations halted.
	•	Day 120+: Write-off review initiated.

5. Settlement engine specification
5.1 Rate resolution engine
The settlement engine computes the freight charge for each trip based on the contract rate type. Below is the resolution logic per rate type:
Rate type
Calculation formula
Example
PER_KM
freight = rate_value × actual_distance_km. If freight < min_freight → use min_freight.
₹34.15/km × 540 km = ₹18,441. Min freight ₹20,000 → final = ₹20,000
PER_TRIP
freight = rate_value (flat). No distance or weight calc.
₹48,000 per trip → final = ₹48,000
PER_TONNE
freight = lookup_slab(cargo_weight_mt) × cargo_weight_mt. Apply slab from weight_slab_json.
22 MT at ₹1,200/MT (0-20MT slab) + 2 MT at ₹1,100/MT (20-40MT slab) = ₹26,200
PER_PACKAGE
freight = rate_value × package_count.
₹150/package × 420 packages = ₹63,000
SLAB_BASED
freight = lookup_distance_slab(distance_km) × distance_km. Apply slab from distance_slab_json.
1,380 km: first 500 km at ₹38/km + next 500 km at ₹34/km + 380 km at ₹30/km = ₹47,400

5.2 Fuel surcharge calculation
When fuel_surcharge_enabled is true on the contract, the system adjusts freight based on diesel price fluctuation:
	•	surcharge_pct = ((current_diesel_price - base_diesel_price) / base_diesel_price) × fuel_weight_factor
	•	fuel_surcharge_amount = gross_freight × surcharge_pct
	•	fuel_weight_factor is typically 0.35-0.40 (diesel is ~35-40% of operating cost)
	•	Diesel price source: configurable — manual entry or API from oil company website
5.3 Vendor settlement
Parallel to client invoicing, the system settles vendor/driver payments:
	•	vendor_payable = agreed_vendor_rate × distance_or_trips
	•	Add: actual fuel (if company-provided diesel on credit), tolls (from FASTag data or driver logs)
	•	Add: driver allowance, loading/unloading charges
	•	Less: advance_paid (cash advance given at trip start)
	•	Less: diesel_advance (if fuel was provided)
	•	Less: penalties (for SLA breach attributable to driver/vendor)
	•	Less: TDS on vendor payment (if applicable, usually 1%)
	•	net_vendor_payable = total after all additions and deductions

6. Complete data model — entity relationship
6.1 New tables summary
Table
Purpose
Key relations
clients
Client master with organization-level data, credit limits, billing config
Has many: branches, contracts, invoices, payments
client_branches
Branch addresses, GSTINs, billing contacts
Belongs to: client. Has many: invoices
client_contacts
Multiple contacts per client with role (finance, ops, management)
Belongs to: client, optionally branch
client_documents
KYC, PAN card, GST certificate, incorporation cert, agreements
Belongs to: client
contracts
Rate agreements with versioning and lifecycle
Belongs to: client. Has many: rate_cards
contract_rate_cards
Per-route, per-vehicle-type rate definitions with slabs
Belongs to: contract, route
invoices
Period invoices with GST, E-Invoice support
Belongs to: client, branch, contract
invoice_line_items
Per-trip charges with full rate breakdown
Belongs to: invoice, trip
payments
Payment receipts with bank details
Belongs to: client
payment_allocations
Links payments to invoices (many-to-many)
Belongs to: payment, invoice
credit_notes
GST-compliant credit notes for deductions
Belongs to: client, optionally invoice
debit_notes
GST-compliant debit notes for additional charges
Belongs to: client, optionally invoice
credit_events_log
Audit trail of all credit-impacting transactions
Belongs to: client
tds_certificates
TDS certificates received from clients per quarter
Belongs to: client
billing_schedules
Auto-invoicing schedule configuration
Belongs to: client
dunning_log
Dunning/reminder actions taken per invoice
Belongs to: invoice

7. API contract specification
7.1 Client APIs
Method
Endpoint
Description
Auth role
GET
/api/clients
List clients with filters, pagination, search
Ops, Finance, Admin
POST
/api/clients
Create new client
Admin, Account Manager
GET
/api/clients/:id
Full client profile with branches, contacts, stats
Ops, Finance, Admin
PUT
/api/clients/:id
Update client master fields
Admin, Account Manager
PATCH
/api/clients/:id/status
Change client status (activate, hold, suspend)
Admin, Finance Manager
POST
/api/clients/:id/branches
Add branch to client
Admin
PUT
/api/clients/:id/branches/:bid
Update branch details
Admin
GET
/api/clients/:id/credit-summary
Credit limit, outstanding, exposure, available
Finance
POST
/api/clients/:id/credit-limit-override
Temporary credit limit increase (needs approval)
Finance Manager
GET
/api/clients/:id/aging
Aging analysis for this client
Finance
GET
/api/clients/:id/statement
Account statement (all invoices, payments, CNs, DNs)
Finance, Client Portal

7.2 Contract APIs
Method
Endpoint
Description
Auth role
GET
/api/contracts
List contracts with client filter
Ops, Finance
POST
/api/contracts
Create new contract (draft)
Account Manager
GET
/api/contracts/:id
Contract detail with rate cards
Ops, Finance
PUT
/api/contracts/:id
Update draft contract
Account Manager
POST
/api/contracts/:id/submit-approval
Submit for approval
Account Manager
POST
/api/contracts/:id/approve
Approve contract → ACTIVE
Finance Manager
POST
/api/contracts/:id/amend
Create amendment (new version)
Account Manager
POST
/api/contracts/:id/rate-cards
Add route rate card
Account Manager
PUT
/api/contracts/:id/rate-cards/:rid
Update rate card
Account Manager
GET
/api/contracts/:id/versions
Version history of this contract
Any

7.3 Invoice APIs
Method
Endpoint
Description
Auth role
GET
/api/invoices
List invoices with filters (client, status, date range)
Finance, Client
POST
/api/invoices/generate
Generate invoice for client+branch+period
Finance
POST
/api/invoices/auto-generate
Trigger auto-generation for all eligible clients
System (cron)
GET
/api/invoices/:id
Invoice detail with line items
Finance, Client
POST
/api/invoices/:id/approve
Approve draft invoice
Finance Manager
POST
/api/invoices/:id/send
Send invoice to client (email+portal)
Finance
POST
/api/invoices/:id/cancel
Cancel invoice (with reason)
Finance Manager
GET
/api/invoices/:id/pdf
Download invoice PDF
Finance, Client
POST
/api/invoices/:id/e-invoice
Generate E-Invoice (IRN + QR)
Finance
GET
/api/invoices/aging-report
Aging analysis across all clients
Finance Manager

7.4 Payment APIs
Method
Endpoint
Description
Auth role
POST
/api/payments
Record incoming payment
Finance
GET
/api/payments/:id
Payment detail
Finance
POST
/api/payments/:id/allocate
Allocate payment to invoices
Finance
POST
/api/payments/:id/reverse
Reverse a payment (bounced cheque, etc.)
Finance Mgr
POST
/api/credit-notes
Create credit note
Finance
POST
/api/debit-notes
Create debit note
Finance
GET
/api/clients/:id/tds-certificates
TDS certificates for client
Finance
POST
/api/clients/:id/tds-certificates
Upload TDS certificate
Finance

8. Business rules engine
The following rules are enforced by the system. Each rule has an ID for traceability in code and test cases.
Rule ID
Rule
Enforcement
BR-01
Invoice numbers are sequential and immutable once generated
DB sequence; no gaps allowed; cancelled invoices retain their number
BR-02
An invoice can only be cancelled if status is DRAFT or APPROVED (not yet SENT)
API validation; SENT invoices require credit note instead
BR-03
A trip can appear on exactly one invoice. No double-billing.
Unique constraint on invoice_line_items(trip_id)
BR-04
GST type (CGST+SGST vs IGST) is determined by supplier state vs client branch state
Derived from branch.state_code vs company.state_code at invoice generation
BR-05
Credit limit check at trip creation: exposure must not exceed limit
Pre-create hook; override requires finance_manager role
BR-06
Contract must be ACTIVE for trips to be created against it
Trip creation validates contract status
BR-07
Rate card resolution priority: route-specific rate > vehicle-specific rate > default rate
Rate engine resolution order
BR-08
Fuel surcharge recalculated monthly unless contract specifies otherwise
Cron job on 1st of month; fetches latest diesel price
BR-09
Payment allocation follows FIFO unless manually overridden
Oldest unpaid invoice gets allocated first
BR-10
TDS amount is tracked separately and reconciled quarterly
Payment.tds_amount logged; quarterly reconciliation report
BR-11
Dunning escalation is automated but can be paused per client
dunning_paused flag on client; overrides cron schedule
BR-12
Contract amendment preserves rate history; old version is AMENDED, new version is ACTIVE
Version chain via parent_contract_id
BR-13
Client ON_HOLD allows completing in-transit trips but blocks new trip creation
Trip creation checks client.status != ON_HOLD/SUSPENDED
BR-14
E-Invoice is mandatory for B2B invoices above threshold (₹5 Cr currently)
Auto-trigger at invoice generation if total exceeds threshold
BR-15
Minimum guarantee shortfall is billed at period end if committed trips/revenue not met
Monthly cron checks min_guarantee_trips/revenue vs actual

9. Integration points
System
Direction
Data exchanged
Protocol
GST E-Invoice (NIC)
Outbound → IRN
Invoice JSON → IRN, signed QR, ack number
REST API via GSP (IRIS, ClearTax, etc.)
E-Way Bill (NIC)
Outbound → EWB
Consignment details → EWB number
REST API via GSP
GSTIN Validation
Outbound
GSTIN → legal name, address, status verification
REST API (MasterGST or similar)
PAN Verification
Outbound
PAN → name, status
NSDL/UTIITSL API
Bank Statement Import
Inbound
Bank transactions for payment reconciliation
CSV/MT940 upload or bank API
Accounting System
Outbound → Ledger
Invoices, payments, CNs, DNs → journal entries
REST API or Tally/SAP connector
Email Service
Outbound
Invoice PDFs, reminders, statements
SendGrid/AWS SES
SMS Gateway
Outbound
Payment reminders, overdue alerts
Msg91/Twilio
Diesel Price API
Inbound
Daily diesel price for fuel surcharge calculation
IOCL/BPCL API or scraper
Trip Management Module
Bidirectional
Trip data for invoicing; credit check at trip creation
Internal service calls

10. Screen inventory & specifications
10.1 Client management screens
Screen CL-01: Client list (enhanced from current)
URL: /clients
Enhanced version of the existing Clients & Billing screen. Additions: search with typeahead, multi-filter (status, industry, contract type, account manager), credit health indicator (green/amber/red based on outstanding vs limit ratio), sortable columns, bulk export.
	•	Columns: Client name (link), Industry, Contract type, Rate, Total trips, Revenue (MTD), Outstanding, Credit utilization (%), Account manager, Status
	•	Row click → navigates to Client detail (CL-02)
	•	Quick actions: Add client, Export, Bulk status change
Screen CL-02: Client detail / profile (NEW)
URL: /clients/:id
Comprehensive client profile screen with tabbed layout. This is the single source of truth for all client information.
	•	Header: Client name, code, status badge, industry badge, account manager avatar, credit health meter
	•	Tab — Overview: Key metrics (revenue MTD/YTD, outstanding, trips, on-time %), credit summary card, recent activity feed
	•	Tab — Branches: List of branches with GSTIN, address, contacts. Add/edit branch inline.
	•	Tab — Contracts: Active and historical contracts. Version timeline. Rate card details. Create/amend actions.
	•	Tab — Invoices: All invoices for this client with status filter. Inline payment recording.
	•	Tab — Payments: Payment history with allocation details. Record payment action.
	•	Tab — Aging: Outstanding aging chart (bar chart by bucket) + table of overdue invoices
	•	Tab — Documents: KYC documents, agreements, TDS certificates. Upload with type categorization.
	•	Tab — Statement: Full account statement (ledger view) showing all transactions chronologically
Screen CL-03: Add/edit client form (NEW)
URL: /clients/new or /clients/:id/edit
Multi-step wizard: Step 1 (Organization details: name, PAN, GSTIN, industry, type) → Step 2 (Primary branch address + GSTIN) → Step 3 (Billing config: credit limit, credit days, billing cycle, TDS) → Step 4 (Contacts: finance contact, ops contact) → Step 5 (Documents: PAN card upload, GST cert, agreement) → Review & create.
Screen CL-04: Contract builder (NEW)
URL: /clients/:id/contracts/new
Contract creation wizard: Select rate type → Define base rates → Add route-specific rate cards → Configure SLA terms → Set detention charges → Configure fuel surcharge → Set payment terms → Review & submit for approval.

10.2 Invoicing & billing screens
Screen INV-01: Invoice list (enhanced from current)
URL: /invoices
Enhanced version of current Invoices screen. Additions: date range picker, multi-status filter, client filter with typeahead, amount range filter, bulk actions (approve, send), aging summary cards at top.
Screen INV-02: Invoice detail (NEW)
URL: /invoices/:id
Full invoice view showing: header (invoice#, client, branch, GSTIN, dates), line items table (per trip with rate breakdown), tax computation, payment history against this invoice, credit/debit notes linked, PDF preview, action buttons (approve, send, record payment, create CN).
Screen INV-03: Invoice generation wizard (NEW)
URL: /invoices/generate
Step 1: Select client + branch + billing period → Step 2: System shows eligible trips with rate preview → Step 3: Review freight calculations, apply manual adjustments → Step 4: GST computation preview → Step 5: Generate (creates DRAFT invoice for approval).
Screen INV-04: Payment receipt (NEW)
URL: /payments/new
Record payment: select client, enter amount, mode (NEFT/RTGS/UPI/cheque), UTR/reference, date. System shows outstanding invoices for allocation. Auto-suggests FIFO allocation. Manual override available. TDS field for deduction tracking.
Screen INV-05: Aging dashboard (NEW)
URL: /invoices/aging
Cross-client aging analysis. Stacked bar chart showing total outstanding by aging bucket. Table below with client-level breakdown. Drill-down to client-level aging. Dunning action buttons per client (send reminder, escalate, pause).
Screen INV-06: Client account statement (NEW)
URL: /clients/:id/statement
Ledger-style statement: date-sorted list of all transactions (invoices, payments, credit notes, debit notes). Running balance column. Date range filter. Export to PDF/Excel. Shareable with client via portal.

10.3 Settlement screens (enhanced)
Screen STL-01: Settlement dashboard (enhanced)
Enhancements to existing screen: Add rate type column, show rate calculation breakdown on expand, add fuel surcharge line item, add detention charges, show multi-rate support. Add 'Batch settle' with approval workflow. Add export to accounting system button.
Screen STL-02: Settlement detail (enhanced)
Enhancements: Show rate resolution steps (which rate card applied, what slab, fuel surcharge calculation). Show vendor settlement side-by-side with client invoice preview. Show margin analysis per trip.

11. Implementation roadmap
Phase 1: Client master + contract foundation (Weeks 1-3)
	•	Implement clients table, branches, contacts, documents with full CRUD APIs
	•	Build client list screen (CL-01) with search, filters, sorting
	•	Build client detail/profile screen (CL-02) with Overview and Branches tabs
	•	Build add/edit client wizard (CL-03)
	•	Implement contract entity with lifecycle (draft → active → amended → expired)
	•	Build contract builder screen (CL-04) with rate card management
	•	Add contract version history
Sprint deliverables: Client CRUD, branch management, contract creation with rate cards, client profile screen
Phase 2: Rate engine + settlement overhaul (Weeks 4-6)
	•	Build multi-rate resolution engine supporting all 5 rate types
	•	Implement fuel surcharge calculation service
	•	Add detention charge calculation (loading + unloading)
	•	Enhance settlement engine to use rate cards instead of hardcoded rates
	•	Add slab-based rate resolution (weight slabs, distance slabs)
	•	Build minimum freight enforcement
	•	Enhance settlement screen (STL-01, STL-02) with rate breakdown
Sprint deliverables: Rate engine, fuel surcharge, enhanced settlement with multi-rate support
Phase 3: Invoice generation + GST (Weeks 7-9)
	•	Implement invoice entity with line items
	•	Build invoice generation wizard (INV-03) with trip selection and rate preview
	•	Implement GST calculation engine (CGST/SGST vs IGST based on place of supply)
	•	Build invoice detail screen (INV-02) with PDF generation
	•	Enhance invoice list screen (INV-01) with advanced filters
	•	Implement auto-invoice scheduling (billing_schedules table + cron)
	•	Build credit note and debit note generation
	•	Integrate E-Invoice API via GSP for IRN and QR code generation
Sprint deliverables: Invoice generation, GST compliance, PDF generation, E-Invoice, credit notes
Phase 4: Payments + credit management (Weeks 10-12)
	•	Build payment receipt recording (INV-04)
	•	Implement payment allocation with FIFO auto-suggest
	•	Build TDS tracking and certificate management
	•	Implement credit limit engine with trip creation check
	•	Build credit limit override workflow with approval
	•	Build aging dashboard (INV-05) with bucket analysis
	•	Implement dunning automation (email reminders, escalation, auto-hold)
	•	Build client account statement (INV-06)
Sprint deliverables: Payment management, credit limits, aging analysis, dunning automation
Phase 5: Client portal + analytics (Weeks 13-15)
	•	Build client portal authentication (invite-based, SSO option)
	•	Client portal: invoice list, download PDF, payment history
	•	Client portal: shipment tracking, POD downloads, dispute filing
	•	Client portal: account statement view
	•	Build revenue analytics: client-wise, route-wise, month-wise
	•	Build margin analysis dashboard
	•	Accounting system integration (Tally/SAP journal entry export)
	•	Bank statement import for payment reconciliation
Sprint deliverables: Client self-service portal, analytics dashboards, accounting integration

12. Acceptance criteria & test scenarios
ID
Scenario
Expected result
AC-01
Create client with 3 branches
Client appears in list. Each branch has unique GSTIN. Primary branch marked.
AC-02
Create PER_KM contract with 3 routes
Contract in DRAFT. Submit → PENDING. Approve → ACTIVE. Each route has distinct rate.
AC-03
Generate invoice for monthly period
Invoice includes all POD_VERIFIED trips. Rate calc matches contract. GST correct per state.
AC-04
Invoice for interstate delivery
IGST at 18% applied (not CGST+SGST). HSN 9965 on line item.
AC-05
Invoice for intrastate delivery
CGST 9% + SGST 9% applied. No IGST.
AC-06
Trip with SLA breach on invoice
Penalty deducted per contract rate. Line item shows deduction.
AC-07
Partial payment against invoice
Invoice status → PARTIALLY_PAID. Outstanding updated. Client's credit exposure reduced.
AC-08
Payment with TDS deduction
TDS tracked separately. net_receivable = total - TDS. Reconciliation shows TDS entry.
AC-09
Credit limit breach on trip creation
Trip blocked. Error message shows current exposure and limit. Override button for finance mgr.
AC-10
Fuel surcharge calculation
If diesel rose 10% from base, freight increases by ~4% (at 0.4 weight factor).
AC-11
Contract amendment
Old version → AMENDED. New version created with incremented version number. Rate changes on new version only.
AC-12
Aging report accuracy
Invoices in correct bucket based on days past due date. Totals match outstanding.
AC-13
Dunning at Day 30
Client auto-set to ON_HOLD. New trips blocked. Notification sent. Existing trips complete normally.
AC-14
Credit note for shortage
CN generated with GST reversal. Client outstanding reduced. Linked to original invoice.
AC-15
Auto-invoice generation
On billing_cutoff_day, invoices auto-generated for all eligible clients. Status = DRAFT for review.

— End of specification —
