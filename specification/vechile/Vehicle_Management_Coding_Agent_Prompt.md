# AxleOps Vehicle Management Redesign — Coding Agent Prompt

## Context
You are working on AxleOps, a fleet and transport management platform for Indian trucking companies. The Vehicle Detail page currently has 12+ horizontal tabs (Overview, Specs, Financial, Warranties, Tire Management, Service History, Inspection History, Fuel History, Service Reminders, Issues, Meter History, Compliance). This is being restructured into a 3-panel layout with 4 logical modules and a right-side slider pattern.

## Architecture Change: From 12 Tabs to 3-Panel + 4 Modules

### Layout Structure
The Vehicle Detail page changes from a single-column with horizontal tabs to a 3-panel layout:

**Panel 1 — Left Navigation (220px fixed width)**
- Sticky vehicle identity card at top (registration, health score circle, status badge)
- 4 module navigation buttons: Overview, Maintenance & Health, Operations & Tracking, Finance & Compliance
- Quick info section at bottom (branch, group, operator, fuel type)
- This panel is always visible regardless of which module is active

**Panel 2 — Center Content (flex: 1, scrollable)**
- Shows one module at a time based on left nav selection
- Each module is a full page with cards, tables, and charts arranged in a 2-column grid
- This is where the primary data livesa

**Panel 3 — Right Slider (440px, overlays from right edge)**
- Slides in when user clicks a detail item (tire position, service task, fuel entry, warranty, issue, etc.)
- Shows contextual detail without navigating away from the current module
- Has a dimmed backdrop overlay that closes the slider on click
- Animated with CSS translateX transition
- Contains action buttons where appropriate (Create Work Order, Schedule Repair, Close Issue)

### Module Mapping (Old Tabs → New Modules)

**Module 1: Overview** (absorbs old Overview + Specs tabs)
- Key Details card: license plate, vehicle type, make/model, year, chassis, meter, axle config, payload capacity
- "View Full Specs" link → opens right slider with complete engine specs, dimensions, transmission
- Cost of Ownership card: total costs (12 months), cost per km, breakdown by category (fuel/service/other)
- Open Issues card: list of unresolved issues with priority and status
- Current Assignment card: active trip info with progress bar, driver name, route, phase

**Module 2: Maintenance & Health** (absorbs old Service History, Service Reminders, Tire Management, Warranties, Issues tabs)
- Upcoming Service Schedule table: task name, interval, next due, last completed, compliance %
  - Each row clickable → right slider with task details
  - "View Full History" link → right slider with complete service history log
- Tire Status: visual axle diagram showing all tire positions with tread depth (color-coded green/amber/red) and pressure
  - Each tire position clickable → right slider with tire brand, serial, tread depth, pressure, install date
- Warranties: compact list showing warranty name, provider, status badge (Active/Expiring/Expired)
  - Each warranty clickable → right slider with full warranty details
- Open Issues: list with priority color coding
  - Each issue clickable → right slider with issue details + "Create Work Order" / "Close Issue" actions

**Module 3: Operations & Tracking** (absorbs old Fuel History, Inspection History, Meter History tabs)
- Fuel History table: date, vendor, volume, total, kmpl (color-coded against fleet average)
  - Each row clickable → right slider with full entry detail including receipt photo placeholder
- Inspection History: date, duration, form type, inspector name
  - Each row clickable → right slider with full inspection checklist
- Meter History table: date, reading, source badge (GPS/Fuel Entry/Manual/Work Order), usage since last

**Module 4: Finance & Compliance** (absorbs old Financial + Compliance tabs)
- 4 KPI cards: Purchase Price, Current Book Value (with depreciation %), Estimated Resale, Total Cost of Ownership
- Loan Information card: lender, account, amount, down payment, interest, term, EMI, dates
- Insurance Policy card: provider, policy number, type, effective/expiry dates (red if expiring), premium, deductible, coverage, agent
- Compliance Documents table: type, date, result badge, next due, status
- Recalls & Safety Campaigns: cards with status badges and action buttons (Schedule Repair / Mark Complete)

### Right Slider Specification
- Width: 440px
- Position: fixed, right: 0, top: 0, bottom: 0
- Z-index: 50
- Background: #FFFFFF
- Box shadow: -4px 0 20px rgba(0,0,0,0.1)
- Animation: slideIn 0.2s ease (CSS @keyframes from translateX(100%) to translateX(0))
- Backdrop: fixed overlay at z-index: 40 with rgba(0,0,0,0.15), closes slider on click
- Header: title + close button (X)
- Content: scrollable
- Slider types needed:
  1. `fullSpecs` — complete engine, dimensions, weight specs from vehicle entity
  2. `serviceHistory` — list of all historical work orders with tasks and costs
  3. `serviceTask` — single service task details with interval, last date, parts needed
  4. `tire` — single tire position details (brand, model, serial, tread, pressure)
  5. `warranty` — single warranty full details
  6. `issue` — single issue with description, photos, action buttons
  7. `fuelEntry` — single fuel entry detail with receipt photo
  8. `inspection` — single inspection detail with checklist items
  9. `recall` — single recall details with action buttons
  10. `driver` — assigned driver profile summary

### Implementation Steps

1. **Replace the existing horizontal tab bar** with the left navigation panel. Remove the `<TabBar>` component and its 12 tab definitions.

2. **Create the 3-panel layout** using CSS flexbox:
   ```
   .vehicle-detail { display: flex; height: calc(100vh - header-height); }
   .left-nav { width: 220px; flex-shrink: 0; border-right: 1px solid #E2E8F0; overflow-y: auto; }
   .center-content { flex: 1; overflow-y: auto; padding: 24px; }
   ```

3. **Create 4 module components**: `VehicleOverview`, `VehicleMaintenance`, `VehicleOperations`, `VehicleFinance`. Each renders independently based on the active module state.

4. **Create the `RightSlider` component** as a reusable overlay:
   - Props: `isOpen`, `onClose`, `title`, `children`
   - Renders backdrop + sliding panel when `isOpen` is true
   - Manages its own animation state

5. **Wire up click handlers** on all interactive elements (table rows, cards, links) to open the appropriate slider type with the relevant data.

6. **Move the vehicle header** from inside the scrollable content to a fixed header above the 3-panel layout. It should always be visible with: registration number, status badge, make/model/year, meter reading, Edit and Add buttons.

### Design Tokens (match existing AxleOps design system)
- Primary blue: #2563EB
- Success green: #059669
- Warning amber: #D97706
- Danger red: #DC2626
- Background: #F1F5F9
- Card background: #FFFFFF
- Border: #E2E8F0
- Alt row: #F0F5FA
- Text primary: #1E293B
- Text secondary: #475569
- Text muted: #94A3B8
- Font: 'DM Sans', system-ui, sans-serif
- Card border-radius: 12px
- Table header: uppercase, 10-11px, letter-spacing 0.3px, color #94A3B8

### Data Dependencies
All data currently served to the 12 tabs should be reorganized into the 4 modules. No new API endpoints are needed — just restructure which data renders where. The right slider content uses the same data that was in the full tab view; it's just presented on-demand instead of all-at-once.

### Health Score Calculation
The circular health score (0-100) in the left nav is computed from:
- Days since last service (weight: 30%) — decays from 100 as days increase past the service interval
- Open issues count (weight: 25%) — each open issue reduces score by 10 points
- Compliance status (weight: 25%) — any overdue document reduces score by 25 points
- Tire tread average (weight: 20%) — below 10/32 reduces score proportionally

Color coding: ≥80 green (#059669), 50-79 amber (#D97706), <50 red (#DC2626)

### Testing Checklist
- [ ] Left nav module switching works without page reload
- [ ] Right slider opens with correct data for each clickable item
- [ ] Right slider closes on backdrop click and X button
- [ ] Right slider animation is smooth (no layout shift)
- [ ] Vehicle header remains fixed during center content scroll
- [ ] Health score circle renders correctly with dynamic percentage
- [ ] All data from old tabs is accessible through new module structure
- [ ] No data is lost in the restructuring — every field from every old tab exists somewhere in the new layout
- [ ] Mobile responsive: left nav collapses to hamburger at < 768px; slider goes full-width at < 640px
