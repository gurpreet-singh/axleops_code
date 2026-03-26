# AxleOps — Fleet Management Platform

> **Product Name**: AxleOps  
> **Version**: Demo Prototype  
> **Last Updated**: March 2026  
> **Target Customer Archetype**: Ciskie Contracting (small-to-mid-size contractor fleet operator)

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Architecture Overview](#architecture-overview)
3. [Module Map & Page Index](#module-map--page-index)
4. [Core Modules — Detailed Breakdown](#core-modules--detailed-breakdown)
   - [Dashboard](#1-dashboard)
   - [Vehicles](#2-vehicles)
   - [Equipment](#3-equipment)
   - [Inspections](#4-inspections)
   - [Issues](#5-issues)
   - [Reminders](#6-reminders)
   - [Service](#7-service)
   - [Contacts & Driver Management](#8-contacts--driver-management)
   - [Vendors](#9-vendors)
   - [Parts & Inventory](#10-parts--inventory)
   - [Fuel & Energy](#11-fuel--energy)
   - [Places](#12-places)
   - [Documents](#13-documents)
   - [Reports](#14-reports)
5. [Navigation & Information Architecture](#navigation--information-architecture)
6. [UI Patterns & Design System](#ui-patterns--design-system)
7. [Data Relationships & Entity Model](#data-relationships--entity-model)
8. [Implemented Interactions](#implemented-interactions)
9. [Feature Roadmap & Enhancement Areas](#feature-roadmap--enhancement-areas)
10. [Technical Notes](#technical-notes)

---

## Product Vision

AxleOps is a **comprehensive fleet management platform** designed for contracting companies and fleet operators who need to manage vehicles, equipment, maintenance, compliance, fuel, drivers, parts inventory, and operational costs from a single unified interface. 

The product aims to provide:
- **Complete vehicle lifecycle management** — from acquisition through daily operations to disposal
- **Proactive maintenance management** — service reminders, work orders, and inspection workflows
- **Financial visibility** — cost of ownership, operating cost reports, and per-vehicle/per-mile cost tracking
- **Compliance & safety** — vehicle registration, insurance tracking, recall monitoring, driver licensing
- **Driver/operator management** — certifications, training, performance reviews, and communication logs
- **Mixed fleet support** — ICE vehicles (trucks, vans) and EVs (Tesla, Ford Lightning) with fuel + charging tracking
- **Parts & procurement** — inventory management, purchase orders, and vendor relationships

---

## Architecture Overview

```
axleops/
├── index.html              ← Main application shell (sidebar + header + content area)
├── css/
│   └── styles.css          ← Complete design system (~31KB)
├── js/
│   └── app.js              ← Navigation, modals, tabs, and interaction logic
├── pages/                  ← 31 individual page HTML fragments
│   ├── dashboard.html
│   ├── vehicle-list.html
│   ├── vehicle-detail.html
│   ├── vehicle-compliance.html
│   ├── vehicle-assignments.html
│   ├── meter-history.html
│   ├── expense-history.html
│   ├── equipment.html
│   ├── inspections.html
│   ├── inspection-detail.html
│   ├── issues.html
│   ├── reminders.html
│   ├── service-history.html
│   ├── work-orders.html
│   ├── work-order-new.html
│   ├── work-order-create.html
│   ├── service-tasks.html
│   ├── service-programs.html
│   ├── shop-directory.html
│   ├── contacts.html
│   ├── contact-detail.html
│   ├── vendors.html
│   ├── parts-list.html
│   ├── part-detail.html
│   ├── purchase-orders.html
│   ├── fuel-history.html
│   ├── charging-history.html
│   ├── places.html
│   ├── documents.html
│   ├── reports.html
│   └── report-detail.html
└── readme.md               ← This file
```

**How it works**: The `index.html` file acts as a single-page application shell. It defines the persistent sidebar and header, then dynamically fetches and injects all 31 page HTML fragments into a content area. The `app.js` handles client-side navigation (showing/hiding pages), breadcrumb updates, modal interactions, and tab switching — all without a backend or framework.

---

## Module Map & Page Index

| Module | Pages | Key Concepts |
|--------|-------|--------------|
| **Dashboard** | `dashboard.html` | Widgets, KPIs, charts, recent activity |
| **Vehicles** | `vehicle-list.html`, `vehicle-detail.html`, `vehicle-compliance.html`, `vehicle-assignments.html`, `meter-history.html`, `expense-history.html` | Fleet inventory, lifecycle, compliance, operator assignment |
| **Equipment** | `equipment.html` | Non-vehicle assets linked to vehicles |
| **Inspections** | `inspections.html`, `inspection-detail.html` | DVIR, checklists, pass/fail, GPS tracking |
| **Issues** | `issues.html` | Defect tracking with priority & resolution |
| **Reminders** | `reminders.html` | Time-based and mileage-based service triggers |
| **Service** | `service-history.html`, `work-orders.html`, `work-order-new.html`, `work-order-create.html`, `service-tasks.html`, `service-programs.html`, `shop-directory.html` | Full MRO (Maintenance, Repair, Operations) workflow |
| **Contacts** | `contacts.html`, `contact-detail.html` | People management, driver profiles, HR compliance |
| **Vendors** | `vendors.html` | External service providers and suppliers |
| **Parts & Inventory** | `parts-list.html`, `part-detail.html`, `purchase-orders.html` | Inventory tracking, procurement |
| **Fuel & Energy** | `fuel-history.html`, `charging-history.html` | Fuel consumption, EV charging analytics |
| **Places** | `places.html` | Geofenced locations (offices, yards, job sites, chargers) |
| **Documents** | `documents.html` | File storage for registrations, insurance, reports |
| **Reports** | `reports.html`, `report-detail.html` | Analytics, cost analysis, operational reporting |

---

## Core Modules — Detailed Breakdown

### 1. Dashboard
**File**: `pages/dashboard.html`

The command center of the application. Provides at-a-glance fleet health via configurable widgets.

**Widgets implemented**:

| Widget | Type | Concept |
|--------|------|---------|
| Repair Priority Class Trends | Stacked area chart (SVG) | Visualizes mix of Emergency / Non-Scheduled / Scheduled / No Priority repairs over time |
| Open Issues | Numeric KPI | Count of open + overdue issues |
| Service Reminders | Numeric KPI | Overdue vs. Due Soon service reminders |
| Vehicle Renewal Reminders | Numeric KPI | Overdue vs. Due Soon vehicle-level renewals (registration, insurance) |
| On-Time Service Compliance | Percentage KPI | All-time vs. last-30-day compliance rate |
| Time to Resolve | Line chart | Average time to resolve issues, tracked against issue volume |
| Vehicle Status | Status breakdown | Active / Inactive / In Shop / Out of Service count with color-coded dots |
| Equipment Status | Status breakdown | In-Service / Out-of-Service / Disposed / Missing equipment counts |
| Active Work Orders | Status breakdown | Open / Waiting on Parts / Waiting 1 / Review |
| Recent Comments | Timeline | Chronological activity feed showing comments on issues and work orders |
| ROs Needing Approval | Action table | Repair orders pending management approval with vehicle, task count, cost, and view action |
| Contact Renewal Reminders | Numeric KPI | Overdue vs. Due Soon contact-level renewals (licenses, certifications) |

**Key concepts**: Widget management button, compact/expanded view toggle, group filtering, auto-refresh timestamp.

---

### 2. Vehicles

#### 2a. Vehicle List
**File**: `pages/vehicle-list.html`

Master fleet inventory with tabular view of all vehicles.

**Data fields per vehicle**:
- Name (with emoji avatar) — clickable to vehicle detail
- Status (Active / In Shop / Out of Service) — color-coded badges
- Year / Make / Model
- Chassis No. (truncated display)
- License Plate
- Group (geographic: Birmingham, Atlanta, Columbia, Alabama)
- Meter (mileage)
- Operator (avatar + name)

**Capabilities**: Status tab filtering, column-based search, filters for Status/Group/Type, pagination (1-20 of 47), bulk selection checkboxes, "Add Vehicle" action.

**Vehicle types demonstrated**: Ford F-150, F-250, F-550, Chevrolet Express, Silverado, RAM 2500, Toyota Tacoma, Mercedes Sprinter, GMC Sierra, Tesla Model Y, Ford Lightning.

#### 2b. Vehicle Detail
**File**: `pages/vehicle-detail.html`

Comprehensive single-vehicle profile — the richest page in the application.

**Header section**:
- Vehicle avatar, name, status badge
- Key specs: Year/Make/Model, Chassis No., License Plate
- Quick metadata: Meter reading (refreshable), Group (with hierarchy), Operator
- Label editing, Unwatch/Edit/Add actions

**Tab navigation** (13+ tabs):
Overview, Specs, Financial, Telematics (BETA), Fuel History, Service History, Inspection History, Work Orders, Service Reminders, Renewal Reminders, Issues, Meter History, Compliance, More

**Overview tab sections**:

| Section | Content |
|---------|---------|
| Details | 20+ fields: Name, Meter, Status (with history link), Auto Integrate Status, Group (with hierarchy + history), Operator, Vehicle Type (linked entity with NHAI category, payload, KMPL), Fuel Type, Chassis No. (with "Decode Chassis" link), License Plate, Year, Make, Model, Registration State, Color, Ownership, Body Type, Body Subtype, MSRP, Base Warranty, Extended Warranty |
| Linked Assets | Equipment/trailers linked to this vehicle |
| Last Known Location | Map widget with pin, Map/Satellite toggle, location name display |
| Open Issues | Overdue + Open counts, issue details with description |
| Service Reminders | Due-soon reminders for this vehicle |
| Incomplete Work Orders | Unassigned + Assigned counts, linked work order card with assignee, time elapsed, and service task |
| Inspections | Upcoming inspection schedule |
| Cost of Ownership | Total costs ($25K), Cost per meter ($1.22/mi), bar chart timeline, breakdown by Fuel/Service/Other costs |
| Utilization | Bar chart of usage over time, meter usage total, average daily usage |

#### 2c. Vehicle Compliance
**File**: `pages/vehicle-compliance.html`

Deep-dive into a single vehicle's regulatory and compliance status.

**Compliance tabs**: Registration & Insurance, Maintenance History, Inspection Records, Recalls & Campaigns

**Sections**:

| Section | Fields / Data |
|---------|---------------|
| Vehicle Registration | Registration State, License Plate, Registration Number, Registration Date, Expiration Date (with status badge), Title Number, Title State, Registered Owner |
| Insurance Policy | Provider, Policy Number, Policy Type, Effective Date, Expiration Date, Monthly Premium, Deductible, Coverage Limit, Agent contact |
| Inspection Records | Table: Type, Date, Result (Pass/Conditional Pass/Fail), Next Due, Status (Current/Overdue) — DOT Annual, State Emissions, Safety Inspection |
| Recent Maintenance | Table: Service, Date, Odometer, Cost, Vendor |
| Recalls & Safety Campaigns | NHTSA recall cards with recall number, component, description, affected vehicles, issued date, status (Action Required / Resolved), action buttons (Schedule Repair / Mark Complete) |

#### 2d. Vehicle Assignments
**File**: `pages/vehicle-assignments.html`

Maps operators to vehicles with temporal tracking.

**Fields**: Vehicle, Current Operator (with avatar), Start Date, End Date, Status (Current / Ended).

#### 2e. Meter History
**File**: `pages/meter-history.html`

Odometer/hour meter log across the fleet.

**Fields**: Vehicle, Date, Meter Value, Source (Fuel Entry / GPS / Manual / Telematics), Void status.

**Key concept**: Multiple meter sources — manual entry, fuel transaction auto-capture, GPS/telematics integration.

#### 2f. Expense History
**File**: `pages/expense-history.html`

All non-service expenses tracked per vehicle.

**Summary KPIs**: Total Expenses ($42,830), This Month ($5,120), Avg Per Vehicle ($911), Pending (3).

**Expense types**: Fuel, Service, Toll, Parking — tracked with vendor, amount, and payment status (Paid/Pending).

---

### 3. Equipment
**File**: `pages/equipment.html`

Non-vehicle asset tracking for items that may be paired with vehicles.

**Fields**: Name, Type, Serial Number, Status (Active / In Service / Inactive), Assigned Vehicle, Group.

**Equipment types demonstrated**: Flatbed Trailer, Air Compressor, Portable Generator, MIG Welder, Boom Crane.

**Key concept**: Equipment is linked to vehicles — e.g., Trailer T-201 is assigned to BS101. Status tracking parallels vehicles.

---

### 4. Inspections

#### 4a. Inspection History
**File**: `pages/inspections.html`

Fleet-wide inspection log with submission tracking.

**Tabs**: Inspection Submissions (24), Inspection Schedules (6), Failed Items.

**Table fields**: Date, Vehicle, Form, Inspector, Result (Pass / Pass w/ Defects / Fail), Failed Items count, Duration.

**Inspection form types**: Pre-Trip Inspection, DOT Annual, Monthly Safety, EV Battery Check.

#### 4b. Inspection Detail
**File**: `pages/inspection-detail.html`

Full DVIR (Driver Vehicle Inspection Report) submission view.

**Header metadata**: Vehicle, Inspection Form, Start/Submit timestamps, Duration, Submission Source (AxleOps Go = mobile app), Submitted By.

**Checklist sections**:
- **Meter** — Odometer reading capture
- **Interior** — Mirrors (✓ Intact), Fuel Level (✓ 3/4), Medical Kit (✓ Present)
- **Exterior** — Body (✓ No Damage), Tires (✗ Attention Required — with Acknowledge/Create Issue actions), Lights (✓ Pass)
- **General Remarks** — Free-text field
- **Final Sign-off** — Driver signature capture (cursive rendering)

**Special features**: GPS position warning (80% of items at same GPS = possible non-compliance), map widget with inspection location, Create Issue action from failed items.

---

### 5. Issues
**File**: `pages/issues.html`

Defect and problem tracking system linked to vehicles.

**Status tabs**: All, Open (blue), Resolved (green).

**Table fields**: #, Summary, Vehicle, Priority (High/Medium/Low — color-coded), Status (Open/Resolved), Reported By, Date.

**Sample issues**: Engine warning light, cracked windshield, brake squeal, AC failure, turn signal intermittent, tire pressure warning.

**Key concept**: Issues originate from inspections, driver reports, or manual entry. They can be linked to work orders for resolution.

---

### 6. Reminders
**File**: `pages/reminders.html`

Proactive maintenance scheduling engine.

**Summary KPIs**: Total Reminders (34), Overdue (4), Due Soon (6), Snoozed (2).

**Status tabs**: All, Overdue (red), Due Soon (yellow), Upcoming (green).

**Table fields**: Vehicle, Service Task, Status, Due (mileage-based or time-based), Last Completed, Compliance (visual progress bar — green/yellow/red).

**Key concept**: Reminders can be **mileage-based** ("500 mi ago") or **time-based** ("In 30 days"). They are linked to service tasks and trigger work order creation. Compliance progress bars provide visual urgency.

---

### 7. Service

The most feature-rich module — covers the full maintenance lifecycle.

#### 7a. Service History
**File**: `pages/service-history.html`

Historical record of all completed service events.

**Fields**: Date, Vehicle, Service Task, Vendor, Labor cost, Parts cost, Total cost.

#### 7b. Work Orders (List)
**File**: `pages/work-orders.html`

Active and historical work order management.

**Status tabs**: All, Open, Pending, Completed, Pending - Warranty.

**Filters**: Vehicle, Vehicle Group, Service Tasks, Watcher.

**Table fields**: Vehicle (with avatar), WO Number (clickable), Status, Repair Priority (Emergency/High/Normal — color-coded), Service Tasks, Issue Date, Assigned To, Total Cost.

**Key concept**: Work orders are the central artifact that connects vehicles, issues, service tasks, parts, labor, and vendors.

#### 7c. Work Order Detail
**File**: `pages/work-order-new.html`

Single work order view with full operational detail.

**Header**: WO number, status badge, vehicle info, priority (Emergency), assignee, issue date, expected completion.

**Actions**: Complete, Print.

**Sections**:

| Section | Content |
|---------|---------|
| Service Tasks | Table with Task, Labor, Parts, Total, Status (Done/Pending/Queued) — with column totals |
| Activity Log | Timeline of work order lifecycle: created, assigned, task completions |
| Parts Used | Table: Part (clickable to part-detail), Part #, Qty, Unit Cost, Total |
| Comments & Attachments | Threaded comments with user avatars, timestamps, comment text, add comment textarea, attach button |

#### 7d. Work Order Create
**File**: `pages/work-order-create.html`

Comprehensive work order creation form — the most complex form in the application.

**Left column** — Vehicle & Assignment:
- Vehicle selector (dropdown with Name + Make/Model)
- Current Meter display (auto-populated), Void checkbox
- Completion Date & Time inputs (with calendar/clock icons)
- Start odometer for completion meter (toggle checkbox with explanation)
- Assigned To (tag-style selector with remove capability)
- Labels (Routine / Emergency / Preventive)
- Vendor selector (Firestone, Pep Boys, Jiffy Lube)
- Invoice Number, PO Number fields
- Custom Fields section (GL Code with description)
- Description textarea

**Right column** — Issues & Line Items:
- **Issues section**: Tabbed (Open/Resolved/Closed), selectable issue table with checkbox linking, "Link to Line Items" capability
- **Line Items section**: Tabbed (Service Tasks/Labor/Parts), searchable service task list, collapsible task cards with:
  - Task name, last completed info
  - Add Labor / Add Part / Link Issues actions
  - Notes textarea per task
  - Labor, Parts, Subtotal columns
  - "Add Service Task" button, customizable columns
- **Cost Summary**: Labor, Parts, Subtotal, Discount (% or $), Tax (% or $ — default 4.1%), Grand Total
- **Photos** and **Documents**: Upload zones with empty states

**Add Labor Modal**: Technician selector, Labor Hours (with quick-select buttons: 15m, 30m, 45m, 1h, 2h, 3h, 4h), Hourly Rate, Set Labor Time Entry toggle, Service Task dropdown, Notes, Subtotal calculation.

**Actions**: Cancel, Save and… (dropdown), Save Work Order.

#### 7e. Service Tasks
**File**: `pages/service-tasks.html`

Catalog/library of reusable service task definitions.

**Fields**: Service Task name, Description, Vehicles Using (count), Avg Cost.

**Tasks defined**: Oil & Filter Change, Tire Rotation, Brake Inspection, Brake Pad Replacement, Tire Replacement, Transmission Flush, A/C Service, Engine Air Filter, Battery Replacement, Battery Health Check (EV).

#### 7f. Service Programs
**File**: `pages/service-programs.html`

Bundled preventive maintenance schedules that auto-generate reminders.

**Programs defined**:

| Program | Vehicles | Tasks | Interval | Includes |
|---------|----------|-------|----------|----------|
| Standard Maintenance | 38 | 5 | Every 5,000 mi / 6 mo | Oil Change, Tire Rotation, Air Filter, Fluid Check, Multi-Point Inspection |
| DOT Compliance | 15 | 3 | Annual | DOT Annual Inspection, Brake Inspection, Emissions Test |
| EV Battery Program | 4 | 2 | Every 15,000 mi / 12 mo | Battery Health Check, Coolant System Inspection |

#### 7g. Shop Directory
**File**: `pages/shop-directory.html`

Approved service provider catalog.

**Fields**: Shop Name, Address, Phone, Specialties, Rating (star-based), Status.

**Shops listed**: Quick Lube Pro, Ciskie Auto Shop, Tire Kingdom, AAMCO, Tesla Service Center.

---

### 8. Contacts & Driver Management

#### 8a. Contact List
**File**: `pages/contacts.html`

People directory with role-based organization.

**Tabs**: All Contacts (18), Team Members (12), Vendor Contacts (6).

**Fields**: Name (with avatar), Email, Phone, Role (Admin/Operator/Fleet Manager), Group, Assigned Vehicle.

#### 8b. Contact Detail (Driver Profile)
**File**: `pages/contact-detail.html`

Rich driver/operator profile — a comprehensive HR-adjacent feature set.

**Header**: Avatar, name, status badge, role, group, email, phone, assigned vehicle, employee ID, hire date.

**Actions**: Message, Edit.

**Tabs**: Overview, Licenses & Certifications, Training Records, Performance Reviews, Communication Log, Assignment History.

**Sections**:

| Section | Content |
|---------|---------|
| Contact Information | Full name, email, phone, mobile, emergency contact, role, group, custom fields (Badge ID) |
| Licenses | Table: License Type (CDL Class A, Medical Examiner's Certificate), Number, State, Class, Expiration, Status (Valid / Expiring Soon) |
| Certifications & Endorsements | Table: Certification (HAZMAT, Tanker, Forklift, First Aid/CPR), Issuing Authority, Date Obtained, Expiration, Status |
| Training Records | Table: Course (Defensive Driving, HAZMAT Handling, ELD Compliance, Vehicle Pre-Trip), Provider, Date Completed, Renewal Due, Status |
| Performance Reviews | Rich cards with: Quarter/Year, Reviewer, Star rating (4.5/5), multi-dimensional scores (Safety Score, On-Time Delivery, Fuel Efficiency, Vehicle Care), narrative comments |
| Communication Log | Timeline: scheduled reviews, CDL verifications (auto-verified via DMV), certification renewal reminders, training completions, vehicle assignments |

---

### 9. Vendors
**File**: `pages/vendors.html`

External partner and supplier management.

**Fields**: Vendor Name, Type (Service Shop / Tire Dealer / Parts Supplier / Fuel Provider / OEM Dealer), Contact, Phone, Total Spent (YTD), Work Order count.

**Key concept**: Vendors are referenced from work orders, service history, fuel entries, and purchase orders — creating a unified spend view.

---

### 10. Parts & Inventory

#### 10a. Parts List
**File**: `pages/parts-list.html`

Fleet parts catalog with inventory tracking.

**Summary KPIs**: Total Parts (156), Low Stock (8), Out of Stock (2), Inventory Value ($34,210).

**Fields**: Part Name, Part Number, Category (Tires/Filters/Oil & Fluids/Brakes/Electrical), Location, In Stock (red-flagged when below min), Min Qty, Unit Cost.

#### 10b. Part Detail
**File**: `pages/part-detail.html`

Single part profile with usage tracking.

**Header**: Part name, part number, category, In Stock, Min Qty, Unit Cost, Total Value.

**Sections**:
- Part Details — Part Number, Manufacturer, Category, Location (Warehouse + Bay), Preferred Vendor
- Usage History — Table: Date, Vehicle, Work Order (clickable), Qty

#### 10c. Purchase Orders
**File**: `pages/purchase-orders.html`

Procurement tracking for parts.

**Status tabs**: All, Open, Pending, Received, Closed.

**Fields**: PO Number, Vendor, Date, Items description, Total, Status.

---

### 11. Fuel & Energy

#### 11a. Fuel History
**File**: `pages/fuel-history.html`

Traditional fuel (gasoline/diesel) transaction tracking.

**Summary KPIs**: Total Fuel Cost MTD ($4,215.30), Total Gallons (1,124), Avg Cost/Gallon ($3.75), Avg MPG Fleet (18.4).

**Fields**: Date, Vehicle, Gallons, Cost/Gal, Total Cost, Odometer, MPG, Vendor (Shell, BP, Chevron, Marathon).

#### 11b. Charging History
**File**: `pages/charging-history.html`

EV-specific energy tracking — demonstrates mixed-fleet support.

**Summary KPIs**: Total Energy Cost MTD ($156.40), Total kWh (892), Avg Cost/kWh ($0.18), Avg Efficiency (3.8 mi/kWh).

**Fields**: Date, Vehicle, kWh, Cost, Start %, End %, Duration, Location (Office Charger, Tesla Supercharger, ChargePoint).

**Key concept**: This module extends the fuel tracking paradigm to electric vehicles, with EV-specific metrics (kWh, charge percentage, mi/kWh efficiency, charging duration).

---

### 12. Places
**File**: `pages/places.html`

Geofenced location management.

**Fields**: Name, Type (Office/Yard/Warehouse/Charging/Job Site — color-coded badges), Address, Vehicles Nearby.

**Locations demonstrated**: Birmingham HQ, Atlanta Branch, Columbia Yard, Main Warehouse, Office Charger Station, Client Site - Vulcan.

**Key concept**: Places are used for geofencing, charging station management, and proximity tracking.

---

### 13. Documents
**File**: `pages/documents.html`

File storage and document management.

**Fields**: Name (with file type icon — PDF/Image/Excel), Type (Vehicle Registration, Insurance Certificate, Inspection Report, Insurance Policy, Schedule), Associated Vehicle, Uploaded By, Date, Size.

**Key concept**: Documents are linked to specific vehicles or marked as fleet-wide. Supports PDF, image, and spreadsheet file types.

---

### 14. Reports

#### 14a. Report Library
**File**: `pages/reports.html`

Searchable, categorized report catalog with favorites and sharing.

**Left sidebar navigation**:
- Standard Reports: Favorites (1), Saved (1), Shared (0)
- Report Types: Vehicles (13), Vehicle Assignments (2), Inspections (4), Issues (2), Service (8), Work Orders (5), Contacts (2), Parts (4), Fuel (3)

**Report list** (Vehicles category — 13 reports):
Cost Comparison by Year in Service, Cost/Meter Trend, Expense Summary, Expenses by Vehicle, Group Changes, Operating Costs Summary, Status Changes, Status Summary, Total Cost Trend, Utilization Summary, Vehicle Details, Vehicle Renewal Reminders, Vehicles Report.

**Features**: Favoriting (star toggle), List/Grid view toggle, sortable table.

#### 14b. Report Detail (Operating Cost Summary)
**File**: `pages/report-detail.html`

Fully rendered report with visualizations and data tables.

**Actions**: Save, Share, Export CSV, Print.

**Summary panel**: Total Cost ($262,261.06), Service Costs ($39,650.30), Fuel Costs ($185,692.62), Other Costs ($36,918.14).

**Charts**:
- Average Cost/Meter bar chart (by unit: Mi, Km, Hr)
- Cost Breakdown donut chart (Service 15.1%, Fuel 70.8%, Other 14.1%)

**Data table**: Grouped by vehicle group (Alabama, Birmingham, Columbia) with per-vehicle rows.

**Fields**: Vehicle, Service Costs, Fuel Costs, Other Costs, Total Cost, Cost/Meter — each column filterable.

**Filtering**: Applied filter count badge, filter picker, column customization, pagination (1-50 of 154).

---

## Navigation & Information Architecture

### Sidebar Navigation Structure

```
├── Dashboard
├── Vehicles ▸
│   ├── Vehicle List
│   ├── Vehicle Assignments
│   ├── Meter History
│   ├── Expense History
│   ├── Replacement Analysis
│   └── Telematics Devices
├── Equipment
├── Inspections ▸
│   ├── Inspection History
│   ├── Item Failures
│   ├── Schedules
│   └── Forms
├── Issues ▸
│   └── Issue List
├── Reminders ▸
│   ├── Service Reminders
│   ├── Vehicle Renewal Reminders
│   └── Contact Renewal Reminders
├── Service ▸
│   ├── Service History
│   ├── Work Orders
│   ├── Service Tasks
│   ├── Service Programs
│   ├── Shop Directory
│   └── Shop Integration
├── Contacts
├── Vendors
├── Parts & Inventory ▸
│   ├── Parts List
│   └── Purchase Orders
├── Fuel & Energy ▸
│   ├── Fuel History
│   └── Charging History
├── Places
├── Documents
├── Reports
└── Help
```

### Breadcrumb System

Every page has a breadcrumb trail updated via `app.js`. Examples:
- `Vehicles › Vehicle List`
- `Vehicles › Vehicle Detail › Compliance`
- `Service › Work Orders › New Work Order`
- `Parts & Inventory › Part Detail`

### Cross-Navigation Links

Pages are heavily interlinked. Key navigation paths:
- **Vehicle List → Vehicle Detail** (click vehicle name)
- **Vehicle Detail → Compliance** (Compliance tab)
- **Vehicle Detail → Issues / Work Orders / Reminders** (sidebar sections)
- **Work Order List → Work Order Detail** (click WO number)
- **Work Order Detail → Part Detail** (click part name)
- **Work Order Detail → Vehicle Detail** (click vehicle name)
- **Inspection Submission → Issue creation** (failed item action)
- **Dashboard → Issues / Work Orders** (widget links)
- **Report Detail → Vehicle Detail** (click vehicle in data table)
- **Contact Detail → Vehicle Detail** (assigned vehicle link)

---

## UI Patterns & Design System

### Component Library

| Component | Usage |
|-----------|-------|
| **Status Badges** | Color-coded pills: `active` (green), `open` (blue), `pending` (yellow), `overdue`/`critical` (red), `completed` (green), `inactive` (gray), `info` (blue) |
| **Status Dots** | Colored circles for quick visual status: green, yellow, red, blue |
| **Status Tabs** | Horizontal filter tabs with colored dots for filtering list views by status |
| **Tabs** | Content tabs for detail pages (Overview, Specs, Financial, etc.) |
| **Data Tables** | Sortable tables with search, filters, pagination, checkboxes for bulk actions |
| **Detail Grids** | Two-column layouts for detail pages (left: primary info, right: related data) |
| **Info Lists** | Label-value pairs for displaying entity attributes |
| **Stat Cards** | KPI summary cards in grid rows (e.g., Total Parts: 156, Low Stock: 8) |
| **Widgets** | Dashboard cards with headers, body content, and actions |
| **Timelines** | Chronological activity feeds with colored dots |
| **Charts** | SVG-based area charts, bar charts, line charts, donut charts |
| **Modals** | Overlay dialogs for forms (e.g., Add Labor) |
| **Progress Bars** | Colored fill bars for compliance visualization |
| **Breadcrumbs** | Navigation trail at top of content area |
| **Filter Buttons** | Dropdown-style filter triggers in table toolbars |
| **User Avatars** | Circular avatars with initials (gradient backgrounds for contacts) |
| **Vehicle Avatars** | Emoji-based vehicle type indicators (🚛 🚐 🚗 ⚡) |
| **Learn Badges** | Contextual help indicators on page headers |
| **Cost Rows** | Label + value rows for financial summaries with totals |
| **Empty States** | Placeholder content for sections with no data (icons + upload buttons) |
| **Form Controls** | Inputs, selects, textareas, checkboxes with consistent styling |
| **Cards** | Content containers with header, body, and footer sections (used in Service Programs) |

### Design Tokens (CSS Variables)

The design system uses CSS custom properties for theming:
- `--primary` / `--primary-light` — Brand blue
- `--text-primary` / `--text-secondary` / `--text-muted` — Text hierarchy
- `--bg-main` / `--bg-white` — Background tiers
- `--border-color` — Consistent borders
- `--status-active` / `--status-overdue` / `--status-pending` — Semantic status colors

---

## Data Relationships & Entity Model

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Vehicle     │────▶│  Work Order      │────▶│  Service Task    │
│  (list/detail)│     │  (create/detail) │     │  (catalog)       │
└──────┬───────┘     └────────┬─────────┘     └──────────────────┘
       │                      │
       │                      ├──▶ Labor (technician, hours, rate)
       │                      ├──▶ Part (from inventory)
       │                      └──▶ Issue (linked)
       │
       ├──▶ Equipment (linked assets)
       ├──▶ Contact / Operator (assignment)
       ├──▶ Fuel Entry / Charging Entry
       ├──▶ Meter Entry
       ├──▶ Expense Entry
       ├──▶ Inspection Submission
       ├──▶ Service Reminder
       ├──▶ Document
       ├──▶ Vehicle Compliance (registration, insurance, recalls)
       └──▶ Vendor (via work orders, service history)

┌──────────────────────┐
│  Service Program     │──── bundles Service Tasks with intervals
└──────────────────────┘     and auto-generates Service Reminders

┌──────────────────────┐
│  Contact / Driver    │
├─ Licenses            │
├─ Certifications      │
├─ Training Records    │
├─ Performance Reviews │
└─ Communication Log   │
└──────────────────────┘

┌──────────────────────┐
│  Parts Inventory     │──── tracked via Purchase Orders
├─ Part Detail         │     and consumed via Work Orders
└──────────────────────┘

┌──────────────────────┐
│  Reports             │──── aggregate data from all entities
└──────────────────────┘     (vehicles, costs, fuel, service, etc.)
```

---

## Implemented Interactions

The `app.js` file (197 lines) implements:

1. **Client-side page routing** — `navigateTo(page)` shows/hides page sections, updates breadcrumbs, scrolls to top
2. **Sidebar sub-menu toggling** — Expandable/collapsible navigation groups with arrow rotation
3. **Active state management** — Sidebar highlights current page, auto-expands parent groups
4. **Modal open/close** — Click-to-open, overlay-click-to-close, close button support
5. **Tab switching** — Both content tabs and status filter tabs with active state management
6. **Breadcrumb updates** — Dynamic breadcrumb text based on current page

---

## Feature Roadmap & Enhancement Areas

Based on the current demo structure, these areas are **referenced in the UI but not yet fully implemented**:

| Feature | Status | Notes |
|---------|--------|-------|
| Replacement Analysis | Nav link present | Points to vehicle-detail; needs dedicated page |
| Telematics Devices | Nav link present | Points to vehicle-detail; needs dedicated page |
| Item Failures (Inspections) | Tab present | Needs dedicated page or tab content |
| Inspection Schedules | Tab present | Needs dedicated page or tab content |
| Inspection Forms | Tab + button present | Needs form builder/viewer |
| Shop Integration | Nav link present | Points to shop-directory; needs integration settings |
| Vehicle Detail Tabs | Multiple tabs listed | Specs, Financial, Telematics (BETA), and per-vehicle Fuel/Service/Inspection/WO/Issues/Meter History need tab content |
| Contact Renewal Reminders | Nav link + widget present | Needs dedicated list page |
| Vehicle Renewal Reminders | Nav link + widget present | Needs dedicated list page |
| Issue Detail | Links present | Issues link to list; needs individual issue detail page |
| Equipment Detail | Links present | Equipment items link to list; needs detail page |
| Search (Global) | Header search bar present | No search logic implemented |
| Add/Edit Forms | Add buttons present on all pages | Most create/edit forms not implemented (only `work-order-create` fully built) |
| Notifications | Bell icon with badge (1) in header | No notification panel |
| Settings | Gear icon in header | No settings page |
| User Profile | Brand area shows "Sara Ciskie" | No profile/auth pages |
| Data Filtering | Filter buttons present everywhere | Visual only; no filtering logic |
| Sorting | Sort indicators on column headers | Visual only; no sort logic |
| Pagination | Page info shown (e.g., "1-20 of 47") | Visual only; no page navigation |
| Print/Export | Print and Export buttons on various pages | No print/export logic |
| Mobile Responsive | — | CSS may need responsive breakpoints |

---

## Technical Notes

### No Build System Required
This is a **zero-dependency**, pure HTML/CSS/JS demo application. It can be served from any static file server or opened directly in a browser (with a local server for `fetch()` to work).

### Running Locally
```bash
# Any static file server works. Example with Python:
cd axleops
python3 -m http.server 8000
# Then open http://localhost:8000

# Or with Node.js http-server:
npx http-server . -p 8000
```

### Browser Compatibility
- Uses CSS custom properties (CSS variables) — requires modern browsers
- Uses `fetch()` API — requires modern browsers
- Uses Font Awesome 6.5.1 via CDN for iconography
- SVG-based charts render without any chart library dependency

### Demo Data Context
The demo is configured for **Ciskie Contracting**, a fictional contracting company based in the southeastern United States (Alabama, Georgia, South Carolina) with:
- ~47 vehicles in the fleet
- ~67 pieces of equipment
- ~18 contacts/operators
- Multiple geographic groups: Birmingham, Atlanta, Columbia, Alabama
- Mixed fleet: traditional ICE trucks/vans + 2 EVs (Tesla Model Y, Ford Lightning)
- Vehicle naming convention: Two-letter code + number (e.g., BS101, BL102, AC107CON)

---

*This README serves as the single source of truth for understanding the AxleOps product scope, feature set, and architecture. It should be referenced and updated as new features are added or existing ones are enhanced.*
