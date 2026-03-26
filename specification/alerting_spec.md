Alerting & Intelligence
Module Specification
Real-time anomaly detection, rule engine, alert lifecycle & assignment workflows
v1.0  |  March 2026

1. Current system analysis & gaps
Your existing implementation has two screens: Alerting Rules (16 rules across 4 categories with threshold/mode/notify config) and Trip Alerts & Intelligence (fired alerts with critical banner, severity, category tabs). This is a strong foundation. Below are the gaps that prevent it from being a production-grade alerting system.
#
Gap
Impact
Resolution in this spec
G1
No alert lifecycle / workflow
Alerts have Dismiss/Investigate buttons but no structured workflow. Who owns the investigation? When is it resolved? Where's the audit trail?
Full alert lifecycle: Open → Acknowledged → Investigating → Resolved / Escalated / False Positive. Each transition logged with user + timestamp + notes.
G2
No assignment / ownership
'Notify' column sends alerts to roles (Fleet Mgr, Owner) but nobody is assigned as the responsible person. Alerts fall through cracks.
Alert assignment: auto-assign based on rule config or manual assignment. Owner is accountable for resolution within SLA.
G3
No escalation engine
If a critical alert isn't acknowledged in 15 min or resolved in 2 hours, nobody knows. No automatic escalation.
Escalation matrix: configurable per severity. L1 → L2 → L3 with time thresholds. Unresolved criticals auto-escalate to management.
G4
No resolution SLA tracking
No measurement of how fast alerts are resolved. No SLA breach detection on the alerting system itself.
Resolution SLA per severity: Critical=30min, High=2h, Medium=8h, Low=24h. SLA breach triggers escalation.
G5
No root cause & action tracking
Clicking 'Investigate' does nothing structured. No way to record what was found, what action was taken, and whether it recurred.
Investigation form: root cause category, findings, corrective action, preventive action, linked trip/driver/vehicle/vendor. Searchable history.
G6
No alert correlation / grouping
If driver Vikram has 5 alerts (fuel anomaly + cash overspend + frequent withdrawals + missing receipts + route deviation), they appear as 5 separate items. Pattern is invisible.
Alert correlation: group alerts by trip, driver, vehicle, route. Pattern detection: 'Driver X has 3+ financial alerts in 7 days' → auto-generate compound alert.
G7
No suppression / dedup
Same rule fires repeatedly for the same trip (e.g., route deviation every GPS ping). Creates noise.
Deduplication window: same rule + same entity within configurable window (default 1h) = update existing alert, don't create new one. Suppression rules for known conditions.
G8
No alert analytics / trends
Cannot see: which rules fire most? Which drivers trigger most alerts? Are alerts increasing or decreasing over time? Which routes have most issues?
Analytics dashboard: alert volume trends, top offending drivers/vehicles/routes, category distribution, MTTR (mean time to resolve), false positive rate.
G9
No threshold learning
Thresholds are static (e.g., '>20% above route avg'). But route averages change seasonally, and a 20% threshold that works for Mumbai→Delhi is wrong for Mumbai→Pune.
Per-route, per-vehicle dynamic baselines. System learns normal ranges from historical data. Anomaly = deviation from this route's baseline, not a global threshold.
G10
No notification channels config
'Notify' column lists roles but no config for how: push notification? SMS? Email? WhatsApp? All of them?
Multi-channel notification: per-rule channel config. Critical → Push + SMS + WhatsApp. Warning → Push + Email. Info → In-app only.
G11
No client-facing alerts
Clients have no visibility into alerts affecting their shipments (delay, route deviation). They find out only when they call.
Client alert portal: configurable subset of alerts visible to clients. Delay alerts, ETA changes, delivery exceptions. Pushed to client portal + email.
G12
No scheduled / preventive alerts
All alerts are reactive (something went wrong). No proactive alerts: vehicle insurance expiring next week, driver license renewal in 30 days, contract nearing trip limit.
Preventive alert rules that fire based on upcoming dates/thresholds. Compliance calendar integration.

2. Complete alert taxonomy
Every alert in the system belongs to exactly one category, has a severity, and maps to a specific data source. Below is the exhaustive catalog of alert rules organized by category.
2.1 Financial alerts (money at risk)
Rule name
Severity
Threshold
Data source
When evaluated
Loss-making trip detected
Critical
Margin < 0%
Settlement engine
On trip settlement
Expense overrun vs estimate
Critical
Actual > Est. + 15%
Trip expenses vs route estimate
On trip settlement
Fuel cost anomaly (₹/km)
High
> 20% above route baseline
Fuel logs + GPS distance
On each fuel entry
Fuel efficiency drop (kmpl)
High
< 80% of vehicle baseline
Fuel logs + odometer
On trip completion
Cash advance overspend
High
Expenses > advance + ₹5,000
Driver expense log
Real-time during trip
Unreceipted expense
Medium
Expense > ₹500 without receipt photo
Expense log
On expense entry
Toll amount anomaly
Medium
> 15% above route toll baseline
FASTag data
On toll deduction
Invoice overdue (client)
High
Past due date
Invoice.due_date
Daily batch (9 AM)
Credit limit approaching
Medium
Exposure > 80% of limit
Client credit engine
On trip creation
Credit limit breached
Critical
Exposure > 100% of limit
Client credit engine
On trip creation
Vendor payment delayed
Medium
Settlement > 7 days after POD
Settlement status
Daily batch
Margin below floor
High
Trip margin < 18% (configurable)
Settlement engine
On settlement
Revenue drop vs last month
Medium
MTD revenue < 80% of last month pace
Invoice totals
Weekly batch (Monday)
Unusual payment pattern
High
Large payment (>₹5L) from unusual bank
Payment receipts
On payment recording

2.2 Operational alerts (trip at risk)
Rule name
Severity
Threshold
Data source
When evaluated
Route deviation detected
Critical
> 20 km off planned route
GPS trail vs route geofence
Real-time (every 30s)
Trip delay — SLA at risk
High
ETA > SLA deadline
GPS + ETA calculation
Real-time (every 5m)
Trip delay — SLA breached
Critical
Actual delivery > SLA deadline
Trip timestamps
On delivery
Vehicle stationary > 2 hours
High
No movement > 2h during trip
GPS data
Real-time
Vehicle stationary > 6 hours
Critical
No movement > 6h (possible breakdown)
GPS data
Real-time
GPS signal lost
Medium
No GPS data > 30 minutes
GPS heartbeat
Real-time
Night driving detected
Medium
Movement between 11 PM - 5 AM
GPS data
Real-time
Unplanned stop in urban area
Low
Stop > 30 min in city (not on route)
GPS + geofence
Real-time
Loading delay
Medium
Loading time > free hours + 2h
Warehouse timestamps
On loading
Unloading delay
Medium
Unloading time > free hours + 2h
POD timestamps
On POD
POD not submitted > 4 hours
High
Reached destination but no POD > 4h
Trip status + time
Batch (hourly)
E-Way Bill expiring in transit
Critical
EWB expires within 6 hours
EWB validity date
Batch (every 2h)
Trip not started > 2h after schedule
High
Departure > scheduled start + 2h
Trip timestamps
Batch (hourly)
Multiple trips same vehicle same time
Critical
Vehicle assigned to overlapping trips
Trip schedule
On trip creation

2.3 Driver behavior alerts (safety & fraud)
Rule name
Severity
Threshold
Data source
When evaluated
Overspeeding
High
> 80 km/h (loaded truck)
GPS speed
Real-time
Harsh braking
Medium
Deceleration > 0.5g
GPS/accelerometer
Real-time
Frequent cash withdrawals
High
> 3 withdrawals in 24 hours
Expense log (cash type)
On expense entry
Fuel fill mismatch
Critical
Filled litres > tank capacity or ₹/litre outlier
Fuel log vs vehicle specs
On fuel entry
Missing receipts pattern
Medium
> 3 unreceipted expenses in trip
Expense log
On trip settlement
Driver phone unreachable
Medium
Call attempt failed > 3 times
Contact log
Manual trigger
SOS triggered
Critical
Driver pressed SOS button
Mobile app SOS
Immediate
Unauthorized halt at fuel station
Low
Stop at fuel station not matching fuel log
GPS + fuel log correlation
Batch (on settlement)
Same driver consecutive SLA breach
High
Driver breached SLA on 3+ of last 5 trips
Trip history
On SLA breach
Low driver rating
Medium
Rating dropped below 4.0
Client/ops ratings
On rating entry
Driver document expiring
Medium
License/ID expires within 30 days
Driver master
Daily batch

2.4 Compliance & preventive alerts
Rule name
Severity
Threshold
Data source
When evaluated
Vehicle insurance expiring
High
Expires within 7 days
Vehicle master
Daily batch
Vehicle insurance expired during trip
Critical
Insurance expired while in transit
Vehicle master + trip status
Real-time
Fitness certificate expiring
High
Expires within 15 days
Vehicle master
Daily batch
Permit expiring
Medium
National/state permit expires within 30 days
Vehicle master
Daily batch
Pollution certificate expiring
Medium
PUC expires within 15 days
Vehicle master
Daily batch
Vehicle service overdue
Medium
Km since last service > service interval
Odometer + service log
On trip completion
Contract nearing trip limit
Medium
MTD trips > 90% of min guarantee
Contract + trip count
Daily batch
Contract expiring
Medium
Expires within 30 days
Contract dates
Daily batch
GST return filing due
High
Filing deadline within 5 days
Calendar
Daily batch
TDS deposit due
High
Quarterly deadline within 7 days
Calendar
Daily batch
Client KYC document expired
Low
Document validity expired
Client documents
Daily batch

3. Alert lifecycle & workflow
3.1 Alert states
State
Description
Transitions to
Who can transition
OPEN
Alert just fired. Not yet seen by anyone.
Acknowledged, Dismissed, Auto-Escalated
System (auto), any notified user
ACKNOWLEDGED
Someone has seen it and accepted ownership.
Investigating, Resolved, Escalated
Assigned owner
INVESTIGATING
Active investigation underway. RCA in progress.
Resolved, Escalated
Assigned owner
ESCALATED
Escalated to next level (L2/L3). Timer resets.
Acknowledged (by L2), Resolved
Escalation recipient
RESOLVED
Investigation complete. Root cause identified. Action taken.
Reopened (if recurs within 7 days)
Assigned owner, L2+
FALSE_POSITIVE
Alert was incorrect. Rule may need tuning.
(Terminal state)
Assigned owner, admin
DISMISSED
Alert reviewed and intentionally dismissed with reason.
Reopened
Assigned owner, admin
AUTO_CLOSED
Alert expired without action (>7 days for Low/Info).
(Terminal state)
System only

3.2 Escalation matrix
Each severity level has defined SLA times and escalation paths. If the alert is not acknowledged within the ACK SLA, it auto-escalates to the next level. If not resolved within the RESOLVE SLA, it escalates further.
Severity
ACK SLA
Resolve SLA
L1 (initial)
L2 (escalation)
L3 (management)
Critical
5 min
30 min
On-duty dispatcher
Fleet manager + owner
CEO / MD
High
15 min
2 hours
Fleet manager
Operations head
Owner
Medium
1 hour
8 hours
Assigned ops staff
Fleet manager
Ops head
Low
4 hours
24 hours
Assigned ops staff
Fleet manager
—
Info
—
Auto-close 7d
Notification only
—
—

3.3 Auto-assignment rules
When an alert fires, the system auto-assigns an owner based on the following priority:
	•	If the alert is for a specific trip → assign to the trip's dispatcher (the person who created/dispatched the trip)
	•	If the alert is about a driver → assign to the driver's fleet manager
	•	If the alert is about a vehicle → assign to the vehicle's fleet manager
	•	If the alert is financial → assign to the accounts team lead
	•	If the alert is compliance → assign to the compliance officer
	•	If no specific assignment rule matches → assign to the on-duty operations manager (rotation schedule)
	•	Override: rule-level config can specify a fixed assignee or role that overrides the default

4. Investigation & resolution workflow
4.1 Investigation form
When an alert owner clicks 'Investigate' or transitions to INVESTIGATING, they must fill out an investigation form. This creates a structured, searchable record.
Field
Type
Notes
root_cause_category
Enum
Driver error, Vehicle issue, Route issue, Weather, Client delay, System error, Fraud suspected, False alarm, External factor, Other
root_cause_detail
Text
Free-text description of what caused the alert
evidence
File[]
Photos, screenshots, GPS trail screenshots, FASTag receipts, fuel receipts. Uploaded evidence.
corrective_action
Text
What was done to fix the immediate problem
preventive_action
Text
What will be done to prevent recurrence (training, vehicle check, route change, rule tuning)
financial_impact
Decimal
₹ impact of the issue (loss amount, overcharge, recovery amount)
linked_entities
JSON
Trip IDs, driver ID, vehicle ID, vendor ID, client ID involved
disciplinary_action
Enum
None, Verbal warning, Written warning, Fine deducted, Suspension, Termination, Vendor penalty
recurrence_check_date
Date
Date to verify the preventive action worked. System creates a follow-up reminder.
resolution_notes
Text
Final notes on resolution

4.2 Alert correlation & compound alerts
The system automatically detects patterns across individual alerts and creates compound/correlated alerts:
	•	Driver pattern: if the same driver has 3+ alerts of any category within 7 days → create compound alert 'Driver {name} — multiple alerts detected' with severity High, linking all child alerts.
	•	Vehicle pattern: if the same vehicle has 2+ maintenance/breakdown-related alerts within 30 days → 'Vehicle {number} — recurring issues' at Medium severity.
	•	Route pattern: if the same route has 3+ delay/deviation alerts across different trips within 7 days → 'Route {origin→dest} — systematic delays' at Medium severity.
	•	Financial pattern: if the same trip has 3+ financial alerts (fuel + expense + cash) → 'Trip {id} — financial irregularity cluster' at Critical severity. This is the strongest fraud signal.

5. Deduplication, suppression & noise reduction
5.1 Deduplication rules
The same underlying condition should not create multiple alerts:
	•	Dedup key = (rule_id, entity_type, entity_id). Entity = trip, driver, vehicle, client, or invoice.
	•	If a new alert matches an existing OPEN/ACKNOWLEDGED/INVESTIGATING alert with the same dedup key → update the existing alert (increment occurrence count, update latest data) instead of creating a new one.
	•	Dedup window = configurable per rule (default: 1 hour for real-time rules, 24 hours for batch rules).
	•	Example: 'Route deviation' fires every 30 seconds for TRP-0141 while off-route. Without dedup = 120 alerts in 1 hour. With dedup = 1 alert that says 'deviation ongoing, 85 km off-route, 60 occurrences'.
5.2 Suppression rules
	•	Maintenance window: suppress all alerts for a vehicle during scheduled maintenance.
	•	Known condition: if a route deviation is expected (road construction, approved alternate route), create a suppression rule for that route+period.
	•	Post-resolution cooldown: after a 'vehicle stationary' alert is resolved as 'driver rest stop', suppress the same alert for that trip for 2 hours.
	•	Info-level auto-suppression: if an info-level alert fires > 10 times for the same entity in 30 days, auto-suppress and notify admin that the rule threshold needs tuning.
5.3 Smart severity adjustment
	•	First occurrence: alert fires at rule's configured severity.
	•	Recurrence within 7 days for same entity: severity auto-upgrades by one level (Medium → High).
	•	3+ recurrences: severity becomes Critical regardless of rule config. Creates compound alert.
	•	Pattern match (same driver, multiple alert types): severity becomes Critical with 'Fraud suspected' flag.

6. Notification channels & delivery
Channel
Latency
Best for
Content
Config
In-app (bell icon)
< 1s
All severities
Full alert detail with actions
Always on. Cannot disable.
Push notification
< 3s
Critical, High
Title + 1-line summary + tap to open
Per-user opt-in. Default on for Critical.
SMS
< 10s
Critical only
Short: 'ALERT: {title}. Trip {id}. Action needed.'
Per-rule config. Number from user profile.
WhatsApp Business
< 5s
Critical, High
Template message with trip details + CTA link
Requires WhatsApp Business API setup.
Email
< 2 min
Medium, Low, summary digests
Full detail with links, charts, evidence thumbnails
Per-user config. Digest option (hourly/daily).
Client portal
< 1 min
Delay, deviation, delivery alerts
Client-safe summary (no internal details)
Per-rule: 'client_visible' flag. Per-client opt-in.
Webhook
< 1s
Integration with external systems
JSON payload with full alert data
URL + auth config per rule.

6.1 Notification routing matrix
Default channel selection per severity (overridable per rule):
	•	Critical → In-app + Push + SMS + WhatsApp + Email (all channels)
	•	High → In-app + Push + Email
	•	Medium → In-app + Email (or daily digest)
	•	Low → In-app only
	•	Info → In-app only (collapsible, non-intrusive)

7. Alert analytics & intelligence
7.1 Dashboards
	•	Alert volume by day/week/month — trend line. Are alerts increasing (bad) or decreasing (improvement)?
	•	Category distribution — pie chart: Financial / Operational / Driver Behavior / Compliance
	•	Severity distribution — breakdown of Critical/High/Medium/Low over time
	•	Mean Time To Acknowledge (MTTA) — per severity, per assignee. Target: Critical < 5 min.
	•	Mean Time To Resolve (MTTR) — per severity, per category. Target: Critical < 30 min.
	•	Top offending drivers — ranked by alert count. Identify repeat offenders for training/action.
	•	Top offending vehicles — ranked by alert count. Identify vehicles needing maintenance/replacement.
	•	Top offending routes — ranked by alert count. Identify routes needing rate revision or alternate routing.
	•	False positive rate — % of alerts resolved as False Positive. High rate means rules need tuning.
	•	SLA compliance — % of alerts resolved within SLA per severity.
	•	Resolution by root cause — which root causes are most common? Drive systemic improvements.
	•	Financial impact — total ₹ value of issues detected by alerts. Quantifies alerting ROI.
7.2 Automated intelligence reports
	•	Weekly alert digest: emailed to management every Monday. Summarizes: total alerts, critical resolved/pending, top 3 issues, trend vs previous week, recommended actions.
	•	Driver scorecard input: alert history feeds into driver performance scoring. Drivers with fewer alerts get priority for premium routes/clients.
	•	Route health report: monthly report per route showing alert frequency, common issues, average fuel cost, SLA compliance. Used for rate revision decisions.
	•	Fraud detection report: monthly summary of all financial alerts with 'Fraud suspected' flag. Correlated patterns across drivers, vehicles, vendors.

8. Data model
Table
Purpose
Key fields
alert_rules
Rule configuration with thresholds, category, severity, channels
id, name, category, severity, threshold_json, mode (realtime/batch), channels[], auto_assign_to, dedup_window_min, is_active, client_visible
alert_rule_conditions
Multi-condition support per rule (AND/OR logic)
id, rule_id, field, operator, value, logic_gate (AND/OR)
alerts
Fired alert instances
id, rule_id, alert_number (ALT-YYMMDD-NNNN), severity, category, title, description, entity_type, entity_id, trip_id, driver_id, vehicle_id, status, assigned_to, acknowledged_at, resolved_at, sla_deadline, escalation_level, occurrence_count, compound_parent_id, financial_impact, data_snapshot_json
alert_timeline
Full audit trail of every state change
id, alert_id, from_status, to_status, changed_by, notes, created_at
alert_investigations
Structured investigation records
id, alert_id, root_cause_category, root_cause_detail, corrective_action, preventive_action, disciplinary_action, financial_impact, evidence_urls[], linked_entity_ids[], recurrence_check_date
alert_notifications
Log of every notification sent
id, alert_id, channel, recipient, sent_at, delivered_at, read_at, status
alert_suppressions
Active suppression rules
id, rule_id, entity_type, entity_id, reason, expires_at, created_by
escalation_matrix
Configurable escalation paths per severity
id, severity, level (L1/L2/L3), role, ack_sla_minutes, resolve_sla_minutes, notify_channels[]
alert_rule_baselines
Dynamic per-route/vehicle baselines
id, rule_id, route_id, vehicle_type, baseline_value, std_deviation, sample_count, last_recalculated

9. Screen specifications
Screen ALR-01: Alert command center (enhanced Trip Alerts)
The primary alert monitoring screen. Split into three zones: (1) Critical banner at top with count + live-updating cards for each critical alert. (2) Alert feed in the middle — filterable, sortable table of all alerts. (3) Summary metrics bar showing MTTA, MTTR, open count by severity.
	•	New: Assignment column with avatar of assigned owner. Click to reassign.
	•	New: SLA countdown timer on each alert (red when breaching).
	•	New: Compound alert indicator — grouped alerts show child count + expand to show linked alerts.
	•	New: Quick-resolve actions inline (dropdown: Resolved, False Positive, Dismissed — with reason).
	•	New: Trend sparkline showing alert volume over last 7 days.
Screen ALR-02: Alert detail & investigation panel
Full alert detail view with investigation workflow. Shows: alert metadata, data snapshot (the actual numbers that triggered the alert), timeline of all status changes, investigation form, linked entities (trip detail, driver profile, vehicle), evidence gallery, and related/correlated alerts.
Screen ALR-03: Rule engine (enhanced Alerting Rules)
Enhanced rule configuration. New: multi-condition builder (field + operator + value with AND/OR logic). Channel configuration per rule. Auto-assignment config. Dedup window. Client visibility toggle. Dynamic baseline toggle (use learned baseline vs static threshold). Test rule: simulate against last 30 days of data to see how many alerts it would have fired.
Screen ALR-04: Alert analytics dashboard
Trends, distributions, leaderboards, SLA compliance, MTTA/MTTR, financial impact. Date range selector. Drill-down from any chart to the underlying alerts. Export to PDF for management reporting.
Screen ALR-05: Escalation matrix configuration
Configure escalation paths per severity. Define L1/L2/L3 recipients, SLA times, notification channels. Test escalation: simulate what happens when a Critical alert goes unacknowledged for 10 minutes.

10. Implementation roadmap
Phase 1: Alert lifecycle + assignment (Weeks 1-3)
	•	Add status state machine to alerts (Open → Acknowledged → Investigating → Resolved/Escalated/FP)
	•	Add assigned_to field with auto-assignment engine
	•	Build alert timeline/audit trail
	•	Build investigation form with root cause, corrective/preventive actions
	•	Build alert detail panel (ALR-02)
	•	Enhance alert feed (ALR-01) with assignment, SLA timer, quick actions
Phase 2: Escalation + dedup + suppression (Weeks 4-6)
	•	Build escalation matrix configuration (ALR-05)
	•	Implement auto-escalation cron (check SLA every minute for Critical, every 5 min for others)
	•	Implement deduplication engine (dedup key + window)
	•	Implement suppression rules
	•	Add smart severity adjustment (recurrence upgrade)
	•	Add occurrence counter on deduplicated alerts
Phase 3: Correlation + channels + client alerts (Weeks 7-9)
	•	Build alert correlation engine (driver/vehicle/route/trip pattern detection)
	•	Implement compound alerts with parent-child linking
	•	Add multi-channel notification (push, SMS, WhatsApp, email, webhook)
	•	Build channel configuration per rule
	•	Build client-facing alert visibility (subset of alerts on client portal)
	•	Build email digest (hourly/daily summary)
Phase 4: Analytics + baselines + intelligence (Weeks 10-12)
	•	Build analytics dashboard (ALR-04) with all charts and metrics
	•	Implement dynamic baselines (per-route, per-vehicle rolling averages)
	•	Implement anomaly detection using baseline + standard deviation
	•	Build automated weekly intelligence report
	•	Build driver/vehicle/route risk scoring from alert history
	•	Add new preventive/compliance alert rules
	•	Build rule testing: simulate rule against historical data

— End of specification —
