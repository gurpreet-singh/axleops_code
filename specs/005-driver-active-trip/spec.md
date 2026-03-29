# Feature Specification: Driver Active Trip

**Feature Branch**: `005-driver-active-trip`  
**Created**: 2026-03-28  
**Status**: Draft  
**Target Role**: Driver  
**Input**: User description: "Driver Active Trip – active/dispatched trip view, acceptance flow, trip detail & progress, lifecycle states & sub-states, driver actions, blocked/read-only states, document/POD submission, map view, GPS background tracking, expense logging, offline/poor-network, audit, mock-vs-real, acceptance criteria."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Driver Sees Dispatched Trip and Accepts It (Priority: P1)

A driver opens the mobile app and lands on the Active Trip tab (via the session established in Driver Auth & Session). If a trip has been dispatched to them, the screen shows the trip card with key details (trip number, route, client, vehicle, scheduled start) and a prominent **Accept** / **Reject** action. The driver reviews the information and taps Accept. The system records the acceptance, transitions the trip sub-state from DISPATCHED → ACCEPTED, and the screen updates to show the accepted trip with available next actions.

**Why this priority**: Without seeing and acknowledging a dispatched trip, no downstream trip execution can occur. This is the driver's entry point into the entire active trip workflow.

**Independent Test**: Dispatch a trip to a driver (via the web dashboard or mock). Open the driver app, verify the trip card appears on the Active Trip tab. Tap Accept. Verify the status updates, and the trip shows as ACCEPTED with next-step actions.

**Acceptance Scenarios**:

1. **Given** a driver with one DISPATCHED trip, **When** they open the Active Trip tab, **Then** the trip card is displayed with trip number, route (origin → destination), client name, vehicle registration, scheduled start date/time, and Accept / Reject buttons.
2. **Given** the driver taps Accept, **When** the API call succeeds, **Then** the trip sub-state changes to ACCEPTED, the Accept/Reject buttons are replaced with the next available action (e.g., "Arrived at Origin"), and a confirmation banner is briefly shown.
3. **Given** the driver taps Reject, **When** the API call succeeds, **Then** the trip transitions to DRIVER_REJECTED, the trip card is removed from the Active Trip tab, and the screen shows an empty state ("No active trip").
4. **Given** the driver has no dispatched or active trip, **When** they open the Active Trip tab, **Then** an empty state is shown: "No active trip. You'll see your next trip here when it's dispatched."
5. **Given** the accept timeout (30 minutes from dispatch) has elapsed, **When** the driver tries to accept, **Then** the system shows an error: "This trip can no longer be accepted. Contact dispatch."

---

### User Story 2 — Driver Views Trip Details and Progress (Priority: P1)

Once a trip is accepted (or at any active sub-state), the driver can view comprehensive trip details and a visual progress indicator showing which milestone they are on. The detail view includes: route information (origin, destination, distance, estimated time), client & cargo details, vehicle info, schedule (planned start, expected delivery), and the milestone progress stepper.

**Why this priority**: Complete information visibility is essential for the driver to execute the trip. Without details, the driver cannot make informed decisions about loading, route, or delivery.

**Independent Test**: Accept a trip, verify the detail screen shows all specified information. Progress through several states and verify the milestone stepper updates accordingly.

**Acceptance Scenarios**:

1. **Given** an ACCEPTED trip, **When** the driver views trip details, **Then** all of the following are displayed: trip number, client name, route (origin → destination with city names), distance (km), estimated duration, vehicle registration, cargo weight (MT), cargo description, LR number, scheduled start, expected delivery.
2. **Given** a trip at any active sub-state, **When** the driver views the progress stepper, **Then** a visual indicator shows completed milestones (✓), current milestone (●), and remaining milestones (○) — reflecting the 10-milestone lifecycle.
3. **Given** a trip in the IN_TRANSIT sub-state, **When** the driver views details, **Then** the map view section shows the route from origin to destination with the driver's current approximate position.

---

### User Story 3 — Driver Progresses the Trip Through Milestones (Priority: P1)

The driver advances the trip through its lifecycle by completing milestones in order. At each stage, the app presents the contextually appropriate action button (e.g., "Arrived at Origin", "Loading Complete", "Departed", "Arrived at Destination", "Delivery Complete", "Submit POD"). Each action may require capturing evidence (GPS coordinates, photos, odometer readings, weight, seal numbers). The system enforces the correct sequence — the driver cannot skip milestones.

**Why this priority**: This is the core operational workflow. Without milestone progression, the trip cannot move through its lifecycle and no operational data is captured.

**Independent Test**: Accept a trip and advance through each milestone from ACCEPTED → AT_ORIGIN → LOADING → LOADED → DEPARTED → IN_TRANSIT → AT_DESTINATION → UNLOADING → DELIVERED, verifying each transition captures required data and the UI updates accordingly.

**Acceptance Scenarios**:

1. **Given** an ACCEPTED trip, **When** the driver arrives at the loading point and taps "Arrived at Origin", **Then** the system captures the GPS location (with warning if GPS is disabled — not a hard block) and transitions to AT_ORIGIN. The next available action becomes "Start Loading".
2. **Given** a trip at LOADING sub-state, **When** the driver completes loading and taps "Loading Complete", **Then** a form captures: actual cargo weight (MT), seal number (if required by template), and optional cargo photos. On submit, the trip transitions to LOADED. If weight deviation > 5% from booked weight, a warning is shown but does not block submission.
3. **Given** a trip at LOADED sub-state with consignment value > ₹50,000, **When** the driver taps "Depart", **Then** the system checks EWB status. If EWB is GENERATED or ACTIVE, departure proceeds (DEPARTED). If EWB is not generated, the driver sees a blocking message: "E-Way Bill required. Contact dispatch."
4. **Given** a trip at IN_TRANSIT sub-state, **When** the driver taps "Arrived at Destination", **Then** GPS location and odometer reading are captured, the trip transitions to AT_DESTINATION, and the SLA timer evaluation is triggered.
5. **Given** a trip at UNLOADING sub-state, **When** the driver taps "Delivery Complete", **Then** a form captures delivered weight and cargo condition (Good / Damaged / Partial Damage). On submit, the trip transitions to DELIVERED and the driver is prompted to submit POD.
6. **Given** a trip at any sub-state, **When** the driver tries to trigger an out-of-sequence action (e.g., "Depart" before loading), **Then** the action is not available — the button for the inappropriate action is hidden or disabled. No out-of-sequence transitions are possible.

---

### User Story 4 — Driver Submits POD (Proof of Delivery) (Priority: P1)

After delivery, the driver captures and submits the Proof of Delivery. POD submission requires: consignee name, receiver signature (digital capture or photo), at least the minimum number of POD photos (varies by workflow template — default 2), and optional delivery remarks. POD submission triggers the trip to move toward completion.

**Why this priority**: POD is the single most critical audit document — the trip cannot be completed or settled without it. It directly impacts invoicing and revenue recognition.

**Independent Test**: Reach the DELIVERED state, tap "Submit POD", fill in required fields, capture photos, submit. Verify the trip transitions to POD_SUBMITTED and the detail view shows the uploaded POD artifacts.

**Acceptance Scenarios**:

1. **Given** a DELIVERED trip, **When** the driver taps "Submit POD", **Then** a POD capture screen appears with fields: consignee name (required), consignee designation (optional), photo capture (camera and gallery — minimum 2 photos by default), signature capture (mandatory — digital drawing pad), delivery remarks (optional), received quantity (pre-filled from loaded weight), received condition (Good / Damaged / Partial Damage).
2. **Given** all required POD fields are filled, **When** the driver taps "Submit", **Then** the POD data (including photos, signature image, GPS coordinates) is uploaded. On success, the trip sub-state transitions to POD_SUBMITTED. The progress stepper shows POD milestone as complete.
3. **Given** the receiver refuses delivery, **When** the driver selects "Refused" as POD type, **Then** a "refused reason" field becomes required. On submission, the trip enters the DELIVERY_REJECTED exception state.
4. **Given** POD photos are large (> 5 MB each), **When** photos are uploading, **Then** a progress indicator shows upload progress per file. If an upload fails, the driver can retry that specific file without re-capturing.
5. **Given** the driver is in a poor-network area, **When** they submit POD, **Then** the submission is queued locally with visible "Pending Upload" status. When connectivity is restored, the upload resumes automatically.

---

### User Story 5 — Driver Views Map with Route and Current Position (Priority: P2)

The driver can view a map showing the trip route (origin to destination) with their current GPS position. The map is accessible from the trip detail screen. It shows origin marker, destination marker, a route line, and the driver's live position.

**Why this priority**: Essential for driver navigation awareness and operational transparency. Not blocking for trip progression but highly valuable for field efficiency.

**Independent Test**: Accept a trip, open the map view, verify origin/destination markers are shown with labels, a route line is drawn, and the driver's current position is marked.

**Acceptance Scenarios**:

1. **Given** a trip in any active state (ACCEPTED through DELIVERED), **When** the driver opens the map section, **Then** a map displays with: origin pin (labeled with loading city/location), destination pin (labeled with delivery city/location), a route line between them, and the driver's current GPS position (blue dot).
2. **Given** GPS is disabled on the device, **When** the driver opens the map, **Then** the map loads with origin and destination markers, but the driver's position dot is absent. A banner shows: "Enable location for live position."
3. **Given** the trip has intermediate checkpoints (multi-drop template), **When** the driver views the map, **Then** checkpoint markers are shown along the route.

---

### User Story 6 — Background GPS Tracking with Location Logging (Priority: P2)

While a trip is in the IN_TRANSIT sub-state (DEPARTED through AT_DESTINATION), the app tracks the driver's GPS location and logs it to a backend API every 5 minutes. Tracking continues even when the app is in the background or the screen is locked. The app requests the necessary platform permissions (Android: foreground service with persistent notification; iOS: background location updates with "always" location permission).

**Why this priority**: GPS tracking is critical for fleet visibility, SLA monitoring, and audit compliance. Background operation is essential because drivers frequently switch to navigation apps, take calls, or lock their screens during transit.

**Independent Test**: Start a trip, depart (enter IN_TRANSIT), minimize the app, wait > 5 minutes, verify location entries are logged via the API (or mock receiver). Verify a visible notification is present (Android) and tracking continues (iOS).

**Acceptance Scenarios**:

1. **Given** a trip transitions to DEPARTED, **When** GPS tracking starts, **Then** the app begins logging GPS coordinates (latitude, longitude) every 5 minutes to a location API endpoint. A visual indicator (small icon in the trip header) confirms tracking is active.
2. **Given** tracking is active and the app is backgrounded, **When** 5 minutes elapse, **Then** a location log is sent to the backend. On Android, a persistent foreground notification displays: "AxleOps — Trip [trip number] in progress. Location tracking active." On iOS, background location updates continue.
3. **Given** the trip transitions to AT_DESTINATION (or any post-transit state), **When** the milestone is recorded, **Then** GPS tracking stops. The foreground notification is dismissed (Android) and background location updates cease (iOS).
4. **Given** GPS permission is denied by the driver, **When** the trip departs, **Then** a warning is shown: "Location permission required for GPS tracking. Some features may not work." The trip is NOT blocked — it can proceed without GPS (GPS is a warning, not a hard block per trip.md).
5. **Given** GPS signal is lost during transit, **When** the next logging interval occurs, **Then** the system records a GPS_LOST event and continues attempting to re-acquire. When signal is restored, logging resumes normally.
6. **Given** the app is force-killed by the OS during transit, **When** the app is relaunched, **Then** tracking resumes automatically if the trip is still in an IN_TRANSIT state. The system does not lose track.

**Platform-Specific Requirements**:

| Requirement | Android | iOS |
|-------------|---------|-----|
| Permission | `ACCESS_FINE_LOCATION` + `ACCESS_BACKGROUND_LOCATION` (Android 10+) | `NSLocationAlwaysUsageDescription` + `NSLocationWhenInUseUsageDescription` |
| Background mechanism | Foreground Service with persistent notification (required by Android 8+) | Background Location Updates mode (Info.plist `UIBackgroundModes: location`) |
| Notification | Required — persistent notification with trip info | Not required (iOS handles background location natively) |
| Battery optimization | Request exemption from Doze/battery restrictions (user-facing dialog) | Standard background processing, iOS manages battery |
| Permissions dialog | Runtime permission request at trip departure for `BACKGROUND_LOCATION` (shown AFTER granting foreground) | Prompt sequence: "When In Use" → upgrade prompt to "Always" |
| Killed by OS | ForegroundService START_STICKY ensures restart | Significant location change monitoring as fallback |
| Tracking interval | 5 minutes (AlarmManager or WorkManager periodic) | 5 minutes (CLLocationManager significant/standard) |

---

### User Story 7 — Driver Uploads and Views Documents During Trip (Priority: P2)

During any active trip state, the driver can upload documents (photos of invoices, weighbridge slips, permits, cargo photos, etc.) and view previously uploaded documents. Documents are attached to the trip with a category tag. The document section is accessible from the trip detail screen.

**Why this priority**: Documentary evidence is essential for compliance, dispute resolution, and audit trails. Drivers frequently need to capture documents at various trip stages.

**Independent Test**: Accept a trip, navigate to the documents section, upload a photo, verify it appears in the documents list with timestamp and category. View the uploaded document.

**Acceptance Scenarios**:

1. **Given** an active trip, **When** the driver opens the documents section, **Then** a list of previously uploaded documents is shown (if any), each with: thumbnail preview, filename/description, category, upload timestamp, and upload status (✓ Uploaded / ⏳ Pending / ❌ Failed).
2. **Given** the driver taps "Add Document", **When** the capture/upload screen opens, **Then** the driver can: take a photo (camera), pick from gallery, or attach a PDF. A category selector offers: Invoice, Weighbridge Slip, Permit, Cargo Photo, Inspection Report, Receipt, Other.
3. **Given** the driver uploads a document, **When** the upload succeeds, **Then** the document appears in the list with a ✓ status. If the upload fails, the document shows ❌ with a "Retry" option. No document data is lost — the local file is preserved.
4. **Given** the driver taps an uploaded document, **When** the viewer opens, **Then** photos display full-screen with pinch-to-zoom. PDFs open in an in-app viewer.
5. **Given** a poor-network scenario, **When** the driver uploads a document, **Then** the upload is queued with visible progress. The driver is NOT blocked from other trip actions while uploads are in progress.

---

### User Story 8 — Driver Logs Fuel, Maintenance, or Arbitrary Expenses (Priority: P2)

During an active trip, the driver can log expenses: fuel entries, maintenance/breakdown costs, or arbitrary expenses (tolls, food, loading/unloading charges, miscellaneous). Each expense entry captures: category, amount, optional receipt photo, and optional notes. Expenses are displayed in a list within the trip detail screen.

**Why this priority**: Real-time expense capture is critical for trip P&L accuracy and prevents post-trip reconciliation issues. Drivers need to log expenses as they occur.

**Independent Test**: During an active trip, log a fuel expense with amount and receipt photo, log a toll expense, verify both appear in the expense list with correct categories and amounts.

**Acceptance Scenarios**:

1. **Given** an active trip, **When** the driver opens the expenses section, **Then** a list of previously logged expenses is shown (if any), each with: category icon, description, amount (₹), timestamp, and receipt indicator (📎 if receipt attached).
2. **Given** the driver taps "Add Expense", **When** the expense form opens, **Then** they can select from categories: Fuel / Diesel, Toll, Driver Food, Loading / Unloading, Maintenance / Repair, Miscellaneous. Required fields: category, amount. Optional fields: description/notes, receipt photo (camera or gallery), odometer reading (for fuel entries), fuel quantity in litres (for fuel entries).
3. **Given** the driver submits a fuel expense with category "Fuel / Diesel", **When** the form includes quantity (litres) and price per litre, **Then** total amount is auto-calculated (litres × price). Odometer reading is captured for fuel efficiency tracking.
4. **Given** the driver submits an expense with a receipt photo, **When** the upload succeeds, **Then** the expense record shows the receipt attachment. If the photo upload fails, the expense record is still saved with a "Receipt pending upload" indicator.
5. **Given** multiple expenses are logged, **When** the driver views the expense list, **Then** a running total is displayed at the top: "Total Expenses: ₹[sum]".
6. **Given** the driver logs an expense while offline, **When** the expense is saved, **Then** it is stored locally and synced when connectivity is restored. The expense list shows a "Pending sync" indicator for unsynced entries.

---

### User Story 9 — Driver Handles Exception States (Priority: P3)

During a trip, certain exception events may occur (vehicle breakdown, accident, cargo damage). The driver can report an exception, which pauses the normal trip flow. Exception states are surfaced prominently in the UI with distinct styling.

**Why this priority**: Exceptions are critical operational events but are less frequent than normal trip flow. The driver's primary need is to report and surface the exception — resolution often involves operations/dispatch.

**Independent Test**: During an IN_TRANSIT trip, report a "Vehicle Breakdown" exception. Verify the trip enters VEHICLE_BREAKDOWN state, the UI reflects the exception prominently, and the active milestone is paused.

**Acceptance Scenarios**:

1. **Given** a trip in IN_TRANSIT or AT_DESTINATION state, **When** the driver taps "Report Issue", **Then** a list of exception types is shown: Vehicle Breakdown, Accident, Cargo Damage, Cargo Shortage, Route Blocked, Driver Unreachable (not self-reported).
2. **Given** the driver selects "Vehicle Breakdown", **When** the report form is shown, **Then** required fields include: description, optional GPS location (auto-captured), optional evidence photos. On submit, the trip transitions to VEHICLE_BREAKDOWN and a Critical alert is created.
3. **Given** a trip is in an exception state, **When** the driver views the trip detail, **Then** the exception is shown as a prominent red banner at the top with: exception type, timestamp, description. The progress stepper shows the current milestone as paused. Active actions (other than viewing details) are disabled until the exception is resolved by operations.
4. **Given** a trip exception is resolved by operations/dispatch, **When** the driver views the trip detail, **Then** the exception banner is cleared, and the trip resumes at the interrupted milestone with the normal action available.

---

### User Story 10 — Driver Views Active Trip via En-Route Checkpoint Logging (Priority: P3)

During the IN_TRANSIT phase, the driver logs en-route events (fuel stops, toll payments, rest halts, meals) as checkpoint sub-events. These appear in a timeline within the trip detail view.

**Why this priority**: Checkpoint logging is incremental enhancement to the core trip flow. It enriches the audit trail but is not blocking for trip completion.

> **Note**: Checkpoint events and expense entries are **independent records**. Checkpoint events are lightweight timeline markers ("driver was here, did this") for the en-route audit trail. Expense entries are financial records for trip P&L. A driver may log a "Fuel Stop" checkpoint AND a separate "Fuel" expense — each serves a different purpose and audience. No auto-creation or deduplication between the two systems.

**Independent Test**: During an IN_TRANSIT trip, log a fuel stop and a toll entry. Verify both appear as sub-events in the en-route timeline.

**Acceptance Scenarios**:

1. **Given** a trip in IN_TRANSIT state, **When** the driver views the en-route section, **Then** a timeline of logged checkpoint events is shown chronologically.
2. **Given** the driver taps "Log Event", **When** the event form opens, **Then** they can select: Fuel Stop, Toll, Rest Halt, Meal, Incident, Other. Each has contextual fields (e.g., fuel stop includes quantity/price; toll includes toll name/amount).
3. **Given** multiple checkpoint events are logged, **When** the driver views the en-route timeline, **Then** a running expense total is shown against the trip's budget estimate (e.g., "₹21,050 of ₹30,950 budget used — 68%").

---

### Edge Cases

- **What happens when two trips are dispatched to the same driver simultaneously?** → Per the existing backend, a driver has one active trip at a time. If multiple trips are dispatched, the driver sees the most recently dispatched trip. The backend enforces single-active-trip-per-driver.
- **What happens when the driver's session expires during a trip?** → The global 401 interceptor (from Driver Auth & Session) triggers logout. Any in-progress data (unsaved form fields) is lost. Locally queued uploads (POD, documents, expenses) are preserved and resume after re-login.
- **What happens when the EWB expires during transit?** → The driver sees a critical alert banner: "E-Way Bill expired. Vehicle must halt. Contact dispatch." The trip is not terminated — it stays in the EWB_EXPIRED exception state until the EWB is extended by operations.
- **What happens if the driver attempts to submit POD with fewer photos than the template minimum?** → The submit button remains disabled until the minimum photo count is met. A helper text shows: "Minimum 2 photos required" (or template-specific count).
- **What happens when the app is force-killed during a document/POD upload?** → On next launch, the app detects pending local uploads. If the trip is still active, pending uploads are listed with "Resume Upload" option.
- **What happens when GPS coordinates fail to capture at a milestone?** → A warning is shown: "Could not capture GPS location." The milestone submission is NOT blocked (per trip.md: GPS is a warning, not a hard block). The submission proceeds with null GPS coordinates.
- **What happens when the loaded cargo weight differs > 5% from booked weight?** → A warning is shown but submission is not blocked. The backend may flag this for Account Manager review.
- **What happens when the network is completely unavailable during milestone transition?** → The transition request is queued locally. A "Pending sync" indicator appears. The driver can continue viewing trip details. When connectivity is restored, the queued transition is sent. If the backend rejects it (e.g., out-of-sequence), an error is shown and the local state is corrected to match the server state.
- **What happens when the GPS tracking interval (5 min) fires but the backend is unreachable?** → The location data point is stored locally and sent in the next batch when connectivity returns. Location logging never silently drops data.
- **What happens when the driver tries to log an expense after the trip is COMPLETED?** → The expense form is no longer available. The expense section becomes read-only after POD submission.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Trip Visibility & Acceptance

- **FR-001**: The Active Trip tab MUST show the driver's current dispatched or in-progress trip. If no trip is assigned, an empty state with explanatory message MUST be shown.
- **FR-002**: A dispatched trip MUST display: trip number, route (origin city → destination city), client name, vehicle registration, scheduled start date/time, cargo weight, cargo description.
- **FR-003**: The driver MUST be able to Accept or Reject a dispatched trip.
- **FR-004**: On acceptance, the trip sub-state MUST transition from DISPATCHED → ACCEPTED. On rejection, the trip MUST transition to DRIVER_REJECTED (with reason).
- **FR-005**: If the accept timeout (30 minutes from dispatch) has elapsed, the Accept action MUST be blocked with an appropriate error message.

#### Trip Detail & Progress

- **FR-010**: The trip detail screen MUST display all trip information: trip number, client, route (origin → destination), distance, estimated duration, assigned vehicle, assigned driver, cargo weight, cargo description, LR number, scheduled start, expected delivery, and consignment value.
- **FR-011**: The trip detail MUST include a visual milestone progress stepper reflecting the 10-milestone lifecycle.
- **FR-012**: The milestone stepper MUST show status per milestone: completed (✓), in-progress (●), upcoming (○), blocked (⊘).
- **FR-013**: Completed milestones MUST display: timestamp, captured GPS coordinates (if available), and any captured data summary.

#### Driver Lifecycle Actions (Milestone Progression)

- **FR-020**: The driver MUST be able to progress the trip through milestones in strict sequential order. The available action button MUST reflect only the next valid transition.
- **FR-021**: At AT_ORIGIN, the driver MUST be able to trigger "Start Loading".
- **FR-022**: At LOADING, the driver MUST be able to trigger "Loading Complete" — capturing: actual weight (MT), seal number (if template requires), optional cargo photos.
- **FR-023**: At LOADED, the driver MUST be able to trigger "Depart". The mobile app MUST NOT perform client-side EWB status checks. Instead, the app sends the departure transition to the backend; the backend enforces the EWB guard and rejects the transition with `422 Unprocessable Entity` if the EWB is not ready (for consignments > ₹50,000). On `422` rejection, the app MUST display the server-provided block message inline (e.g., "E-Way Bill required. Contact dispatch.") and prevent the driver from re-attempting until a pull-to-refresh or server-push indicates the guard is cleared.
- **FR-024**: During IN_TRANSIT, the driver MUST see the trip as actively in progress with the running expense total and en-route event timeline.
- **FR-025**: At AT_DESTINATION, the driver MUST be able to trigger "Start Unloading".
- **FR-026**: At UNLOADING, the driver MUST be able to trigger "Delivery Complete" — capturing delivered weight and cargo condition.
- **FR-027**: Each milestone action MUST auto-capture GPS coordinates (with warning if unavailable, not a hard block) and timestamp.
- **FR-028**: The system MUST NOT allow the driver to skip milestones or trigger out-of-sequence transitions.

#### POD Submission

- **FR-030**: After DELIVERED, the driver MUST be prompted to submit POD.
- **FR-031**: POD submission MUST capture: consignee name (required), signature capture (digital drawing pad — mandatory), minimum photo count per workflow template (default 2), delivery remarks (optional), received quantity, received condition (Good / Damaged / Partial Damage).
- **FR-032**: If the receiver refuses delivery, the driver MUST be able to select "Refused" POD type, which requires a refusal reason and transitions the trip to DELIVERY_REJECTED.
- **FR-033**: POD photos MUST support camera capture and gallery selection.
- **FR-034**: POD upload MUST show per-file progress and support retry for individual failed uploads.
- **FR-035**: Failed POD uploads MUST be queued locally and resume when connectivity is restored.

#### Map View

- **FR-040**: The trip detail MUST include a map section showing the route from origin to destination.
- **FR-041**: The map MUST show: origin pin (with label), destination pin (with label), a route line, and the driver's current GPS position (when available).
- **FR-042**: If GPS is disabled, the map MUST show origin and destination markers without the driver position, plus a banner prompting GPS enablement.

#### Background GPS Tracking

- **FR-050**: Background GPS tracking MUST start when the trip enters DEPARTED sub-state and stop when the trip exits the IN_TRANSIT phase (AT_DESTINATION or later).
- **FR-051**: GPS coordinates (latitude, longitude, timestamp, accuracy) MUST be logged to a backend API every 5 minutes.
- **FR-052**: Tracking MUST continue when the app is in the background or screen is locked.
- **FR-053**: On Android, a persistent foreground notification MUST be displayed during tracking: "AxleOps — Trip [number] in progress."
- **FR-054**: On iOS, background location updates MUST be enabled via the `UIBackgroundModes: location` Info.plist capability.
- **FR-055**: If the app is terminated by the OS, tracking MUST resume when the app is relaunched if the trip is still in an IN_TRANSIT state.
- **FR-056**: Location data that fails to send due to connectivity MUST be stored locally and sent in the next batch when connectivity is restored. No data points MUST be silently dropped.
- **FR-057**: The driver MUST be able to see a tracking-active indicator on the trip detail screen.
- **FR-058**: If GPS permission is denied, the system MUST show a warning but MUST NOT block trip progression.
- **FR-059**: The app MUST request background location permission at the appropriate time — ideally when the trip is about to depart, not at app launch.

#### Document Upload & Viewing

- **FR-060**: The driver MUST be able to upload documents (photos, PDFs) during any active trip state.
- **FR-061**: Each document MUST be tagged with a category: Invoice, Weighbridge Slip, Permit, Cargo Photo, Inspection Report, Receipt, Other.
- **FR-062**: The document section MUST show a list of all trip documents with: thumbnail, category, timestamp, upload status.
- **FR-063**: The driver MUST be able to view uploaded documents — photos full-screen with zoom, PDFs in an in-app viewer.
- **FR-064**: Failed document uploads MUST be queued locally and MUST be retryable.
- **FR-065**: The document section MUST become read-only after the trip enters POD_SUBMITTED or later states.
- **FR-066**: The driver MUST be able to delete uploaded documents before POD submission. Deletion MUST be a soft-delete (record preserved for audit with `deleted_by`, `deleted_at`). After POD_SUBMITTED, documents are immutable.

#### Expense Logging

- **FR-070**: The driver MUST be able to log expenses during any active trip state (before POD submission).
- **FR-071**: Expense categories MUST include: Fuel / Diesel, Toll, Driver Food, Loading / Unloading, Maintenance / Repair, Miscellaneous.
- **FR-072**: Each expense entry MUST capture: category (required), amount in ₹ (required), description (optional), receipt photo (optional), timestamp (auto-captured).
- **FR-073**: Fuel entries MUST additionally capture: quantity in litres and price per litre with auto-calculated total, plus odometer reading.
- **FR-074**: A running expense total MUST be displayed in the expense section.
- **FR-075**: Expenses logged offline MUST be stored locally and synced when connectivity is restored.
- **FR-076**: The expense section MUST become read-only after the trip enters POD_SUBMITTED or later states.
- **FR-077**: The driver MUST be able to edit or delete expense entries before POD submission. Deletion MUST be a soft-delete (record preserved for audit with `deleted_by`, `deleted_at`). Editing MUST preserve previous values in an audit history. After POD_SUBMITTED, expenses are immutable.

#### Exception Reporting

- **FR-080**: The driver MUST be able to report exceptions during IN_TRANSIT or AT_DESTINATION states.
- **FR-081**: Available exception types: Vehicle Breakdown, Accident, Cargo Damage, Cargo Shortage, Route Blocked.
- **FR-082**: Exception report MUST capture: exception type, description (required), GPS location (auto-captured), optional evidence photos.
- **FR-083**: An active exception MUST be shown as a prominent red banner on the trip detail screen with exception details.
- **FR-084**: During an active exception, normal milestone progression actions MUST be disabled until the exception is resolved.
- **FR-085**: Exception resolution MUST come from operations/dispatch — the driver cannot self-resolve exceptions.

#### Driver-Visible Lifecycle States and Sub-States

- **FR-090**: The driver MUST see a human-readable status reflecting the sub-state, not internal enum names.

| Sub-State | Driver-Visible Label | Driver Actions Available |
|-----------|---------------------|------------------------|
| DISPATCHED | "Trip Dispatched" | Accept, Reject |
| ACCEPTED | "Trip Accepted" | Arrived at Origin |
| AT_ORIGIN | "At Loading Point" | Start Loading |
| LOADING | "Loading" | Loading Complete |
| LOADED | "Loaded — Ready to Depart" | Depart (may be blocked awaiting EWB) |
| EWB_PENDING | "Awaiting E-Way Bill" | None (blocked — read-only) |
| DEPARTED | "Departed" | Log en-route events, tracking active |
| IN_TRANSIT | "In Transit" | Log en-route events, Report Issue |
| AT_CHECKPOINT | "At Checkpoint" | Checkpoint logged |
| AT_DESTINATION | "Arrived at Destination" | Start Unloading |
| UNLOADING | "Unloading" | Delivery Complete |
| DELIVERED | "Delivered" | Submit POD |
| POD_SUBMITTED | "POD Submitted — Awaiting Verification" | Read-only (no driver actions) |
| POD_VERIFIED | "Trip Complete" | Read-only |
| SETTLED | "Trip Settled" | Read-only |

- **FR-091**: States where the driver has no available action (EWB_PENDING, POD_SUBMITTED, POD_VERIFIED, SETTLED) MUST clearly indicate the reason for the wait or read-only status.

#### Blocked & Read-Only State Representation

- **FR-095**: Blocked states MUST show a distinct visual treatment: grayed-out action area with explanatory text (e.g., "Waiting for E-Way Bill — Contact dispatch if delayed").
- **FR-096**: Read-only states MUST show all trip data but MUST NOT show any action buttons.
- **FR-097**: Exception states MUST override the primary status with a red alert banner and disable normal actions.

#### Offline & Poor-Network Considerations

- **FR-100**: All trip detail data MUST be cached locally after initial load. The driver MUST be able to view trip details without network connectivity.
- **FR-101**: Milestone transitions attempted offline MUST be queued locally and synced when connectivity is restored. The queue MUST support multiple concurrent pending transitions (e.g., a driver may progress AT_ORIGIN → LOADING → LOADED → DEPARTED while fully offline). On reconnect, the sync engine MUST replay queued transitions in strict chronological order. If the server rejects any transition (e.g., state conflict), the queue MUST halt at that point, refresh the trip state from the server, and notify the driver of the discrepancy. Remaining unsynced transitions after the rejected one are discarded.
- **FR-102**: A connectivity indicator MUST be visible when the app is offline.
- **FR-103**: Queued (unsynced) mutations MUST be visible to the driver — e.g., "1 pending update" badge.
- **FR-104**: If a queued mutation fails after sync (e.g., backend rejects an out-of-date transition), the app MUST refresh the trip state from the server and notify the driver of the discrepancy.
- **FR-105**: Document and photo uploads MUST support resume after connectivity is restored — no data loss.
- **FR-106**: GPS location logs MUST be stored locally when offline and batch-synced when connectivity is restored.

#### Audit-Sensitive User Actions

- **FR-110**: Every milestone transition MUST record: trip ID, from_state, to_state, triggered_by (driver user ID), trigger_type (MANUAL), GPS coordinates, timestamp, and any captured evidence URLs.
- **FR-111**: All milestone timestamps MUST be immutable after recording — no backdating.
- **FR-112**: POD capture MUST record: GPS location, capture timestamp, consignee details, and all evidence files with content hashes.
- **FR-113**: Exception reports MUST record: GPS location, timestamp, reporter ID, and evidence.
- **FR-114**: Expense entries MUST record: amount, category, timestamp, and submitter ID.

### Key Entities

- **Active Trip**: The driver's currently assigned trip — at most one at a time. Contains all trip metadata, route info, cargo details, schedule, milestone progress, expenses, documents, and POD.
- **Milestone**: A step in the 10-milestone trip lifecycle. Each has: type, sequence, status, timestamps, GPS, captured data, evidence files.
- **Expense Entry**: A cost record attached to the trip — category, amount, optional receipt, optional notes.
- **Document**: A file (photo or PDF) attached to the trip with a category tag.
- **POD (Proof of Delivery)**: The delivery evidence record — consignee details, signature, photos, condition assessment.
- **Location Log**: GPS coordinate record (lat, lng, timestamp, accuracy) for background tracking during transit.
- **Exception Report**: A recorded trip disruption — type, description, evidence, timestamp, GPS.
- **Checkpoint Event**: An en-route sub-event — type (fuel, toll, halt, etc.), details, timestamp, amount.

---

## Mock-vs-Real Expectations

### Real-Backend Mode — Existing APIs

| Endpoint | Contract | Status |
|----------|----------|--------|
| `GET /trips` | List all trips (tenant-scoped) | ✅ Exists |
| `GET /trips/{id}` | Trip detail | ✅ Exists |
| `DELETE /trips/{id}` | Delete trip | ✅ Exists (not used by driver) |

### Real-Backend Mode — Derived Contracts (Backend Gaps)

The following APIs do not exist in the backend but are derived from the trip domain model, entity structure, and the behavior documented in `trip.md`. These follow the "closest sensible contract" principle (Constitution Principle III).

| Derived Endpoint | Purpose | Derived From | Status |
|-----------------|---------|-------------|--------|
| `GET /trips/driver/active` | Get the driver's current active trip (by contactId) | Trip entity + Contact FK + status filter | 🟡 Derived — mock-backed |
| `POST /trips/{id}/accept` | Driver accepts dispatched trip (DISPATCHED → ACCEPTED) | trip.md §9 guard: `driver_accepts` | 🟡 Derived — mock-backed |
| `POST /trips/{id}/reject` | Driver rejects dispatched trip (DISPATCHED → DRIVER_REJECTED) | trip.md §9 guard: rejection reason required | 🟡 Derived — mock-backed |
| `POST /trips/{id}/transition` | Generic milestone transition (body: `{ event, data, gps }`) | trip.md §9 — all sub-state transitions | 🟡 Derived — mock-backed |
| `POST /trips/{id}/pod` | Submit POD (multipart: fields + photos + signature) | trip.md §3.2 POD sub-process | 🟡 Derived — mock-backed |
| `GET /trips/{id}/milestones` | List trip milestones with status | product.md TripMilestone entity | 🟡 Derived — mock-backed |
| `POST /trips/{id}/documents` | Upload document (multipart: file + category) | product.md Trip Detail Connected Data | 🟡 Derived — mock-backed |
| `GET /trips/{id}/documents` | List trip documents | product.md Trip Detail Connected Data | 🟡 Derived — mock-backed |
| `POST /trips/{id}/expenses` | Log trip expense | trip.md §7 Expense domain (adapted for driver trip) | 🟡 Derived — mock-backed |
| `GET /trips/{id}/expenses` | List trip expenses | trip.md §7 Expense domain | 🟡 Derived — mock-backed |
| `POST /trips/{id}/exceptions` | Report exception | trip.md §2.3 Exception states | 🟡 Derived — mock-backed |
| `POST /location/log` | Batch GPS location log (body: `{ tripId, points: [{ lat, lng, ts, accuracy }] }`) | product.md GPS tracking (no existing entity) | 🟡 Derived — mock-backed |

### Mock-Backend Mode

- Mock API responses MUST return realistic, spec-consistent data that mirrors the full trip.md lifecycle.
- Mock trip data MUST include a trip at various sub-states to allow QA to test each milestone independently.
- QA MUST be able to swap mock JSON fixture files to simulate different trip states, exception scenarios, and edge cases (e.g., EWB_PENDING blocking departure, expired EWB, delivery rejection).
- Mock GPS tracking MUST accept location payloads and store/discard them silently.
- Mock document upload MUST accept files and return success responses.
- Mock mode MUST be switchable via the existing `DataSourceConfig` mechanism.

### QA Expectations

- QA MUST be able to progress through the complete trip lifecycle (DISPATCHED → ACCEPTED → … → POD_SUBMITTED) using mock mode without a running backend.
- QA MUST be able to simulate exception states by modifying mock JSON fixtures.
- QA MUST be able to test offline behavior by: disabling network, performing actions, re-enabling network, and verifying sync.
- QA MUST be able to verify GPS tracking by monitoring the location log API calls (or mock receiver).
- QA MUST be able to test POD submission with various photo counts and verify minimum enforcement.

---

## Backend Assumptions & Gaps

### Confirmed Backend Behavior (Source of Truth)

| Aspect | Detail |
|--------|--------|
| **Trip entity** | `Trip.java` has: tripNumber, client, route, routeContract, vehicle, driver (Contact), branch, status (String), scheduledStart, actualStart, actualArrival, cargoWeight, cargoDescription, lrNumber, hsnCode, consignmentValue, revenue, netProfit. |
| **Trip status** | Stored as a simple String field — no state machine implementation exists yet in backend. |
| **Trip API** | `GET /trips`, `GET /trips/{id}`, `DELETE /trips/{id}` — basic CRUD only. No state transitions, no milestone support, no driver-scoped queries. |
| **Authorities** | Driver authorities: TRIP_READ_OWN, TRIP_UPDATE_STATUS, VEHICLE_READ_ASSIGNED, INSPECTION_CREATE_OWN, INSPECTION_READ_OWN, SERVICE_CREATE_BREAKDOWN, REMINDER_READ_OWN. |
| **Auth** | JWT + Redis session with 24h TTL. contactId gap (G1 from Driver Auth spec) applies. |

### Known Gaps

| Gap ID | Description | Impact | Mitigation |
|--------|-------------|--------|------------|
| **G1** | **No driver-scoped trip query.** Backend has no `GET /trips/driver/active` or filter by `driver_id`. The existing `GET /trips` returns all tenant trips. | Driver cannot fetch "my active trip" without loading all trips. | Derive `GET /trips/driver/active` endpoint. Mock initially. |
| **G2** | **No state transition API.** Backend has no `POST /trips/{id}/transition` or similar. The Trip entity's `status` is a plain String, not backed by a state machine. | All milestone progression actions require backend support. | Derive a generic transition API. Mock initially. Backend needs Spring State Machine or equivalent. |
| **G3** | **No TripMilestone entity in backend.** The product.md defines a `TripMilestone` entity, but no corresponding JPA entity, repository, or controller exists. | Cannot persist or query milestone data. | Derive milestone endpoints. Mock with JSON fixtures. |
| **G4** | **No Document/file upload API.** No file upload endpoint or entity exists for trip documents. | Cannot upload or retrieve documents or POD photos. | Derive document upload endpoints (multipart). Mock with simulated file storage. |
| **G5** | **No Expense entity for trip-level expenses.** The Expense domain in trip.md is vehicle-scoped (standalone), not trip-scoped. There is no trip-expense entity or API. | Driver expenses during a trip cannot be persisted against the trip. | Derive a trip-expense API. Mock initially. This may require backend decision on whether to extend the existing expense domain or create a trip-level expense sub-entity. |
| **G6** | **No GPS location tracking API.** No endpoint exists for logging driver GPS coordinates. | Background GPS tracking has no server to send data to. | Derive `POST /location/log` endpoint. Mock initially with a silent sink. |
| **G7** | **No Exception reporting API.** Backend has exception states defined in trip.md but no API to trigger them from the driver's perspective. | Driver cannot report breakdowns, accidents, etc. | Derive `POST /trips/{id}/exceptions` endpoint. Mock initially. |
| **G8** | **contactId mapping gap (inherited from G1 in Driver Auth).** Without `User ↔ Contact` mapping, the backend cannot resolve "which trips belong to this driver." | Active trip query depends on contactId. | Mock returns canned driver trips. Backend needs `contact_id` on `users` table. |
| **G9** | **No POD entity/API in backend.** The product.md defines a `POD` entity but no backend implementation exists. | Cannot submit or verify POD. | Derive a POD submission endpoint (multipart). Mock initially. |

### Role Boundaries

| Action | Driver | Operations / Dispatch | System |
|--------|--------|----------------------|--------|
| View trip details | ✅ Own trips only | ✅ All trips | — |
| Accept / Reject trip | ✅ | ❌ | ❌ |
| Progress milestones (AT_ORIGIN → … → DELIVERED) | ✅ | ❌ | ❌ |
| Submit POD | ✅ | ❌ | ❌ |
| Verify POD | ❌ | ✅ | ❌ |
| Log expenses | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ✅ | ❌ |
| Report exceptions | ✅ | ❌ | ❌ |
| Resolve exceptions | ❌ | ✅ | ❌ |
| Settle trip | ❌ | ✅ | ✅ (auto per template) |
| Dispatch trip | ❌ | ✅ | ❌ |
| Cancel trip | ❌ | ✅ | ❌ |
| Assign/reassign vehicle or driver | ❌ | ✅ | ❌ |

### Lifecycle Ownership Boundaries

| Lifecycle Phase | Owner | Driver's Role |
|----------------|-------|--------------|
| Phase 1: Created (DRAFT → DISPATCHED) | Operations | Read-only (not yet dispatched to driver) |
| Phase 1: Created (DISPATCHED → ACCEPTED) | Driver | Accept or Reject only |
| Phase 2: In Transit (ACCEPTED → DELIVERED) | Driver | Primary actor — progresses milestones |
| Phase 2: In Transit (Exception states) | Operations | Driver reports; Ops resolves |
| Phase 3: Completed (POD_SUBMITTED → POD_VERIFIED) | Operations | Driver submits; Ops verifies |
| Phase 4: Settled | Operations / Finance | No driver involvement |

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A driver can view and accept a dispatched trip within 5 seconds of opening the Active Trip tab (on a stable network).
- **SC-002**: A driver can progress through the complete trip lifecycle (DISPATCHED → POD_SUBMITTED) with all required data capture in a single uninterrupted session.
- **SC-003**: Trip milestone transitions appear in the milestone stepper within 2 seconds of the driver triggering the action.
- **SC-004**: POD submission completes (including photo upload) within 30 seconds for 2 photos under normal network conditions.
- **SC-005**: GPS tracking logs location data points every 5 minutes (±30 seconds) during IN_TRANSIT, including when the app is backgrounded.
- **SC-006**: 100% of milestone transitions, POD submissions, and exception reports include a timestamp, user ID, and GPS coordinates (where available) for audit compliance.
- **SC-007**: Document and expense uploads attempted offline are successfully synced within 1 minute of connectivity restoration.
- **SC-008**: QA can exercise the complete trip lifecycle in mock mode without a running backend.
- **SC-009**: The driver sees appropriate empty, loading, error, and data-loaded states for every screen section — no blank or frozen screens.
- **SC-010**: All driver-visible labels use human-readable text (no internal enum names or technical identifiers visible).
- **SC-011**: Expense logging during a trip is visible with a running total that updates within 1 second of entry.

---

## What This Feature Guarantees to Later Features

Later driver features (Past Trips, Earnings, Settings content, Inspections) can rely on:

1. **Trip lifecycle infrastructure** — milestone state machine, transition API, audit trail recording. These patterns apply to future trip-related features.
2. **Document and file upload patterns** — reusable upload-with-queue infrastructure for any future file-based feature (inspections, vehicle photos, etc.).
3. **Background GPS tracking infrastructure** — foreground service (Android) and background location (iOS) setup. Reusable for any future location-based feature.
4. **Expense logging patterns** — reusable for any future in-app cost entry feature.
5. **Offline queue infrastructure** — mutation queue + sync pattern. Applicable to any future feature needing offline resilience.
6. **Mock API patterns** — derived contract + mock fixture approach. Applicable to all future features.

## What This Feature Does NOT Guarantee

1. **Trip creation** — drivers do not create trips; that is an operations function.
2. **POD verification** — drivers submit POD; operations verifies. Verification UI is out of scope.
3. **Settlement and financial view** — trip settlement is an operations/finance function. Driver earnings derived from settlements are a separate feature.
4. **Past trip history** — this feature covers the active trip only. A "Past Trips" view is a separate feature.
5. **Vehicle inspection (DVIR)** — pre-trip inspections are a related but separate feature.
6. **Work order creation from exceptions** — exception reporting triggers alerts, but work order management is operations-scoped.
7. **Multi-stop trip support** — Multi-Drop template with per-stop tracking is a future enhancement. This spec covers single-origin-to-single-destination trips.
8. **Real-time push notifications** — dispatched trip notifications via push are a separate feature. This spec assumes the driver opens the app and sees the dispatched trip.
9. **Advanced EWB management** — EWB extension, cancellation, and Part B updates are operations-scoped. This spec only covers the driver-visible EWB status (blocking/non-blocking for departure).
10. **Load transfer workflow** — if a vehicle breaks down and cargo is transferred to another vehicle, the child trip creation and EWB update are operations-scoped.

---

## Risks if Lifecycle/Action Behavior Is Underspecified

| Risk | Consequence | Likelihood |
|------|-------------|------------|
| contactId gap (G8/G1) not resolved before implementation | Active trip query will need a workaround (mock always) — fragile coupling between user ID and driver contact record | **High** |
| Backend has no state machine — status is a plain String | Mobile mock can implement transitions, but real backend integration will require significant backend development (Spring State Machine or equivalent) | **High** |
| No milestone entity in backend | All milestone data (timestamps, GPS, evidence) has no persistence layer. Entire audit trail depends on backend creating this entity. | **High** |
| No file upload API | POD submission, document upload, receipt photos all depend on a file upload endpoint that doesn't exist | **High** |
| Expense domain is vehicle-scoped, not trip-scoped | Trip-level expense tracking may require a new entity or FK extension in the backend expense system | **Medium** |
| GPS tracking API doesn't exist | 5-minute location logging has no server endpoint. Mock works for development but real integration is blocked. | **Medium** |
| Background tracking may be killed by aggressive battery optimization (OEM-specific on Android) | GPS logs may have gaps on certain Android devices (Xiaomi, Samsung, Oppo) that aggressively kill background processes | **Medium** |
| Multi-drop trips not specified in this feature | If a multi-drop trip is dispatched to a driver, the app behavior is undefined. Needs explicit handling (show as unsupported, or extend this spec). | **Low** |
| POD template variations (Standard vs Heavy Cargo vs Hazmat minimum photos) | The spec assumes default template (2 photos). If the trip uses a different template, the POD requirements need to be dynamic from the backend. | **Medium** |

---

## Explicitly Out of Scope

- ❌ **Trip creation or modification** — drivers do not create or edit trips.
- ❌ **POD verification** — operations verifies POD, not the driver.
- ❌ **Trip settlement and financial summary** — separate feature (Earnings).
- ❌ **Past trips history** — separate feature.
- ❌ **Vehicle pre-trip inspection (DVIR)** — separate feature, though related to milestone 2.
- ❌ **Push notifications for trip dispatch** — separate feature. Driver sees trip on app open.
- ❌ **Real-time trip tracking visible to operations** — the GPS tracking here logs for audit. Real-time ops dashboard is a separate feature.
- ❌ **Multi-stop (Multi-Drop) trip support** — future enhancement.
- ❌ **EWB management (extend, cancel, Part B update)** — operations-scoped.
- ❌ **Load transfer workflow** — operations-scoped.
- ❌ **POD resubmission after rejection** — requires POD verification feature (ops-side) to exist first. For v1, POD_DISPUTED is read-only for the driver with message “Contact operations.”
- ❌ **Backend changes** — all backend gaps are documented. This feature uses existing APIs + derived mock-backed contracts.
- ❌ **Third-party map provider selection** — implementation will decide between Mapbox/Google Maps. This spec defines the UX behavior.
- ❌ **Driver advance/cash management** — finance-scoped.
- ❌ **Invoice or billing visibility** — finance-scoped.
- ❌ **Detention charge tracking** — future enhancement.
- ❌ **SLA breach alerting to the driver** — operations handles SLA monitoring and alerts.

---

## Assumptions

- Driver Auth & Session (specs/004) is fully implemented — authenticated session with JWT, contactId (nullable), role-scoped authorities, 401 interceptor, and mock/real data source switching.
- The Mobile Foundation (specs/003) is fully implemented — design system, navigation, Decompose, Ktor, Koin, reactive data sources.
- The backend is running with the existing Trip CRUD APIs. Seeded trip data with various statuses is available for real-backend testing.
- A single driver has at most one active trip at a time.
- The 5-minute GPS tracking interval is sufficient for fleet visibility. Higher-frequency tracking (30s, 15s per template) is a future enhancement.
- The Standard workflow template (default) is used. Template-specific behavior variations (Heavy Cargo, Hazmat, Express) are future enhancements. Template-specific POD requirements (minimum photos, weight slip) SHOULD be derived from trip data when available but MAY default to Standard template values (2 photos, signature required, weight slip optional) for v1.
- Expense entries logged by the driver during a trip are trip-scoped (associated with the trip) — even though the backend expense domain is vehicle-scoped. The mobile app associates expenses with the trip; backend reconciliation is a future concern.
- Map implementation will use a KMP-compatible mapping library or expect-actual per platform.
- File upload API will accept standard multipart/form-data with reasonable size limits (< 10 MB per file, < 50 MB total per trip).
- The `DataSourceConfig` mechanism exists for toggling between mock and real data sources.

---

## Clarifications

### Session 2026-03-29

- Q: How many milestone transitions can be queued concurrently while offline — single or multiple? → A: **Queue multiple.** Allow the driver to progress through as many milestones as needed while offline. Sync replays them in order on reconnect. If any transition is rejected by the server, the queue halts at that point, state refreshes from server, and the driver is notified.
- Q: How does the mobile app know the current EWB status for the departure guard? → A: **Backend-only guard.** Mobile always sends the "depart" transition. Backend rejects with `422` if EWB is not ready. Mobile shows the server-provided rejection as a block message. No client-side EWB status field or separate EWB API needed.
- Q: Are checkpoint events (Story 10) and expense entries (Story 8) the same record, or independent? → A: **Independent records.** Checkpoint events are timeline markers for audit. Expenses are financial records for trip P&L. Driver logs them separately. Some overlap (e.g., fuel stop + fuel expense) is expected and acceptable.
- Q: Can the driver edit or delete expenses and documents after saving? → A: **Both editable/deletable until POD submission.** Expenses can be edited (amount, description, category) and deleted. Documents can be deleted. All deletions are soft-deletes preserving audit trail. After POD_SUBMITTED, both become immutable.
- Q: If operations rejects the POD, can the driver resubmit? → A: **Defer to later feature.** POD resubmission requires the ops-side POD verification workflow. For v1, POD_DISPUTED/POD_REJECTED are read-only for the driver with message “Contact operations.” Explicitly out of scope.
