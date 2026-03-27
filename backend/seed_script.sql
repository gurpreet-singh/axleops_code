-- =============================================================================
-- AxleOps — Consolidated Seed Script
-- =============================================================================
-- Run this against a FRESH database after Hibernate DDL has created the schema.
--
-- Usage:
--   1. Start the backend once with `ddl-auto: update` to create all tables
--   2. Stop the backend
--   3. Run: psql -U axleops -d axleops -f seed_script.sql
--   4. Restart the backend
--
-- This script is idempotent (ON CONFLICT DO NOTHING everywhere).
-- =============================================================================

SET client_min_messages = WARNING;

-- ─── TENANT ──────────────────────────────────────────────────────────────────

INSERT INTO tenants (id, name, trade_name, gstin, pan, city, state, status, created_at, updated_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Goodwill Transport Pvt. Ltd.', 'Goodwill Transport', '27AABCU9603R1ZM', 'AABCU9603R', 'Mumbai', 'Maharashtra', 'ACTIVE', NOW(), NOW()),
  ('e9999999-9999-9999-9999-999999999999', 'Gobind Transport', 'Gobind Transport', '03AABCU9603R1ZM', 'AABCU9603R', 'Amritsar', 'Punjab', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── BRANCHES ────────────────────────────────────────────────────────────────

INSERT INTO branches (id, tenant_id, name, city, state, is_primary, status, created_at, updated_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Mumbai HQ',  'Mumbai',    'Maharashtra', TRUE,  'ACTIVE', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Pune',       'Pune',      'Maharashtra', FALSE, 'ACTIVE', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Delhi NCR',  'Delhi',     'Delhi',       FALSE, 'ACTIVE', NOW(), NOW()),
  ('b9999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'Punjab HQ',  'Amritsar',  'Punjab',      TRUE,  'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── ROLES ───────────────────────────────────────────────────────────────────

INSERT INTO roles (id, role_key, label, department, branch_scope, description, created_at, updated_at) VALUES
  ('aa111111-1111-1111-1111-111111111111', 'OWNER',              'Owner / Director',   'executive',  'ALL', 'Full P&L visibility',                       NOW(), NOW()),
  ('aa222222-2222-2222-2222-222222222222', 'BRANCH_MANAGER',     'Branch Manager',     'executive',  'OWN', 'Cross-department authority within branch',   NOW(), NOW()),
  ('aa333333-3333-3333-3333-333333333333', 'FLEET_MANAGER',      'Fleet Manager',      'operations', 'OWN', 'Vehicle allocation',                        NOW(), NOW()),
  ('aa444444-4444-4444-4444-444444444444', 'FINANCE_CONTROLLER', 'Finance Controller', 'finance',    'ALL', 'P&L oversight',                             NOW(), NOW()),
  ('a0000002-0000-4000-a000-000000000001', 'PLATFORM_ADMIN',     'Platform Admin',     'platform',   'ALL', 'Full access to all tenants',                 NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── AUTHORITIES ─────────────────────────────────────────────────────────────

INSERT INTO authorities (id, authority_key, module, description, created_at, updated_at) VALUES
  ('ab111111-1111-1111-1111-111111111111', 'TRIP_VIEW',    'TRIP',    'View trip list and detail',  NOW(), NOW()),
  ('ab222222-2222-2222-2222-222222222222', 'TRIP_CREATE',  'TRIP',    'Create new trips',           NOW(), NOW()),
  ('ab333333-3333-3333-3333-333333333333', 'INVOICE_VIEW', 'INVOICE', 'View invoices',              NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO role_authorities (role_id, authority_id) VALUES
  ('aa111111-1111-1111-1111-111111111111', 'ab111111-1111-1111-1111-111111111111'),
  ('aa111111-1111-1111-1111-111111111111', 'ab222222-2222-2222-2222-222222222222'),
  ('aa111111-1111-1111-1111-111111111111', 'ab333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;


-- ─── USERS ───────────────────────────────────────────────────────────────────

INSERT INTO users (id, tenant_id, first_name, last_name, email, password, role, title, branch_id, created_at, updated_at) VALUES
  ('a1000001-0001-0001-0001-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Priya',    'Sharma', 'priya@goodwilltransport.in', '$demo$',      'OWNER', 'Managing Director',  'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet', 'Singh',  'gurpreet_gt',                'gurpreet_gt', 'OWNER', 'Managing Director',  'b9999999-9999-9999-9999-999999999999', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_branch_roles (id, user_id, branch_id, role_id, is_primary) VALUES
  ('cb111111-1111-1111-1111-111111111111', 'a1000001-0001-0001-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', 'aa111111-1111-1111-1111-111111111111', TRUE),
  ('cb999999-9999-9999-9999-999999999999', 'ae999999-9999-9999-9999-999999999999', 'b9999999-9999-9999-9999-999999999999', 'aa111111-1111-1111-1111-111111111111', TRUE)
ON CONFLICT (id) DO NOTHING;


-- ─── PLATFORM ADMINS ─────────────────────────────────────────────────────────

INSERT INTO platform_admins (id, first_name, last_name, email, password, title, access_level, status, created_at, updated_at) VALUES
  ('a0000001-0000-4000-a000-000000000001', 'Platform', 'Admin', 'platform_admin', 'platform_admin', 'Platform Administrator', 'FULL', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── VEHICLE TYPES ───────────────────────────────────────────────────────────

INSERT INTO vehicle_types (id, tenant_id, name, category, axle_count, fuel_type, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', '32ft Multi-Axle', 'HCV', 3, 'DIESEL', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'LCV',             'LCV', 2, 'DIESEL', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', '14MT 2-Axle',     'MCV', 2, 'DIESEL', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── CLIENTS ─────────────────────────────────────────────────────────────────

INSERT INTO clients (id, tenant_id, name, trade_name, gstin, billing_type, industry, contract_type, rate, credit_limit, status, branch_id, created_at, updated_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Reliance Industries',   'RIL',    '27AAACR5055K1Z5', 'PER_KM',    'Petrochemicals',  'Per KM',    '₹34.15/km',      1000000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Tata Steel',            'Tata',   '27AAACT2727Q1ZX', 'PER_TRIP',  'Steel & Metals',  'Per Trip',  '₹48,000/trip',     800000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Hindustan Unilever',    'HUL',    '27AAACH0549C1ZR', 'PER_KM',    'FMCG',            'Per KM',    '₹28.50/km',      1200000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'ITC Limited',           'ITC',    '27AAACI1681G1Z0', 'PER_TONNE', 'FMCG',            'Per Tonne', '₹1,200/MT',       600000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000003', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111', 'Adani Ports',           'APSEZ',  '27AAACA6526C1ZI', 'PER_TRIP',  'Infrastructure',  'Per Trip',  '₹72,000/trip',     600000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000006', 'e1111111-1111-1111-1111-111111111111', 'Mahindra Logistics',    'MLL',    '27AACCM0538L1ZD', 'PER_KM',    '3PL',             'Per KM',    '₹32.00/km',       500000, 'ACTIVE',   'a0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000007', 'e1111111-1111-1111-1111-111111111111', 'Asian Paints',          'APL',    '27AAACA6522N1ZF', 'PER_TRIP',  'Chemicals',       'Per Trip',  '₹35,000/trip',     400000, 'INACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── CONTACTS (Drivers + Others) ─────────────────────────────────────────────

INSERT INTO contacts (id, tenant_id, first_name, last_name, phone, email, type, license_number, license_expiry, city, status, branch_id, created_at, updated_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Rajesh',  'Kumar',  '+91 98765 43210', 'rajesh.kumar@example.com',  'DRIVER',     'MH0420190012345',  '2027-06-15', 'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Anita',   'Verma',  '+91 87654 32109', 'anita.verma@example.com',   'DRIVER',     'DL0420200023456',  '2028-03-20', 'Delhi',  'ACTIVE', 'a0000000-0000-0000-0000-000000000003', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Priya',   'Sharma', '+91 76543 21098', 'priya.sharma@example.com',  'OPERATIONS', NULL,               NULL,         'Pune',   'ACTIVE', 'a0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'Vikram',  'Singh',  '+91 65432 10987', 'vikram.singh@example.com',  'DRIVER',     'MH1220210034567',  '2029-01-10', 'Pune',   'ACTIVE', 'a0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111', 'Deepak',  'Patel',  '+91 54321 09876', 'deepak.patel@example.com',  'DRIVER',     'DL0120180045678',  '2026-09-30', 'Delhi',  'ACTIVE', 'a0000000-0000-0000-0000-000000000003', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000006', 'e1111111-1111-1111-1111-111111111111', 'Meera',   'Joshi',  '+91 43210 98765', 'meera.joshi@example.com',   'DRIVER',     'MH0420200056789',  '2028-12-05', 'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000007', 'e1111111-1111-1111-1111-111111111111', 'Tarun',   'Mishra', '+91 32109 87654', 'tarun.mishra@example.com',  'MECHANIC',   NULL,               NULL,         'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── VEHICLES ────────────────────────────────────────────────────────────────

INSERT INTO vehicles (id, tenant_id, registration_number, vehicle_type_id, make, model, manufacture_year, chassis_number, fuel_type, odometer, status, vehicle_group, branch_id, created_at, updated_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'MH04XY9876', 'b0000000-0000-0000-0000-000000000001', 'Tata',          'Ace Gold',        2022, 'MBLH111AXNMB4521',   'DIESEL', 139998, 'ACTIVE',         'Mumbai', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'MH04CD5678', 'b0000000-0000-0000-0000-000000000002', 'Mahindra',       'Bolero Pickup',   2021, 'MA1TB2HSXP1B73921',  'DIESEL',  72770, 'ACTIVE',         'Mumbai', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'MH12EF9012', 'b0000000-0000-0000-0000-000000000003', 'Ashok Leyland',  'Dost',            2020, 'MBLR522BXKMA09842',  'DIESEL', 157907, 'IN_SHOP',        'Pune',   'a0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'MH12GH3456', 'b0000000-0000-0000-0000-000000000002', 'Mahindra',       'Scorpio-N',       2023, 'MA1NG2GSXP1D85732',  'DIESEL',  52407, 'ACTIVE',         'Pune',   'a0000000-0000-0000-0000-000000000002', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111', 'DL01IJ7890', 'b0000000-0000-0000-0000-000000000003', 'Tata',           '407',             2019, 'MBLR511CXKMA12034',  'DIESEL', 202574, 'OUT_OF_SERVICE', 'Delhi',  'a0000000-0000-0000-0000-000000000003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── ROUTES ──────────────────────────────────────────────────────────────────

INSERT INTO routes (id, tenant_id, name, origin, destination, distance_km, estimated_hours, toll_cost, via, origin_pin, dest_pin, sla_hours, payment_terms, template, status, branch_id, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Mumbai > Delhi (JNPT)',  'JNPT Navi Mumbai',  'Mathura Refinery',  1380, 22, 8400, 'NH48 > NH44',  '400707', '281006', 26, '30 days', 'Standard', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Mumbai > Pune',          'HUL Andheri Plant', 'Pune DC Hadapsar',   150,  3,  420, 'Expressway',   '400093', '411028',  4, '15 days', 'Express',  'ACTIVE', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Delhi > Jaipur',         'ITC Gurgaon Hub',   'Jaipur Central WH',  280,  5, 2100, 'NH48',         '122001', '302017',  6, '30 days', 'Standard', 'ACTIVE', 'a0000000-0000-0000-0000-000000000003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── TRIPS ───────────────────────────────────────────────────────────────────

INSERT INTO trips (id, tenant_id, trip_number, client_id, route_id, vehicle_id, driver_id, status, lr_number, revenue, scheduled_start, branch_id, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'T-1001', 'c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'IN_TRANSIT', 'LR-2024-0042', 47130, '2024-03-18 08:00:00', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'T-1002', 'c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'IN_TRANSIT', 'LR-2024-0043', 48510, '2024-03-17 06:00:00', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'T-1003', 'c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'COMPLETED',  'LR-2024-0044',  8500, '2024-03-16 07:00:00', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'T-1004', 'c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'CREATED',    'LR-2024-0045', 12320, '2024-03-19 09:00:00', 'a0000000-0000-0000-0000-000000000003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── INVOICES ────────────────────────────────────────────────────────────────

INSERT INTO invoices (id, tenant_id, invoice_number, client_id, date, due_date, amount, gst_amount, total_amount, status, branch_id, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'GTLC/10075/F-26', 'c0000000-0000-0000-0000-000000000006', '2026-03-21', '2026-04-20', 801000, 144180, 937170, 'SENT',  'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'GTLC/10076/F-27', 'c0000000-0000-0000-0000-000000000001', '2026-03-22', '2026-04-21', 452000,  81360, 533360, 'DRAFT', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'GTLC/10077/F-28', 'c0000000-0000-0000-0000-000000000002', '2026-03-18', '2026-04-17', 624000, 112320, 736320, 'PAID',  'a0000000-0000-0000-0000-000000000001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── WORK ORDERS ─────────────────────────────────────────────────────────────

INSERT INTO work_orders (id, tenant_id, work_order_number, vehicle_id, status, priority, total_cost, issue_date, assigned_to, service_tasks, label, branch_id, created_at, updated_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'WO-371', 'e0000000-0000-0000-0000-000000000001', 'OPEN',      'NON_SCHEDULED', 82240, '2024-05-10', 'd0000000-0000-0000-0000-000000000001', 'Tire Replacement, Brake Inspection, Engine Oil', 'Tires',  'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'WO-370', 'e0000000-0000-0000-0000-000000000002', 'PENDING',   'SCHEDULED',     0,     '2024-05-09', 'd0000000-0000-0000-0000-000000000002', 'Brake Inspection, Tire Rotation',                 NULL,     'a0000000-0000-0000-0000-000000000001', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'WO-315', 'e0000000-0000-0000-0000-000000000004', 'COMPLETED', 'SCHEDULED',     11862, '2024-05-07', 'd0000000-0000-0000-0000-000000000004', 'Engine Oil & Filter Replacement',                 'Engine', 'a0000000-0000-0000-0000-000000000002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── PARTS ───────────────────────────────────────────────────────────────────

INSERT INTO parts (id, tenant_id, name, part_number, category, location, in_stock, min_qty, unit_cost, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'CEAT Czar SUV 265/65R17',  'CEAT-CZR-26565',  'Tires',       'Main Warehouse', 12,  4, 15768, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'MANN Oil Filter W 712/95', 'MANN-W71295',      'Filters',     'Main Warehouse', 24, 10,   705, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Castrol MAGNATEC 5W-30',   'CAST-MAG-5W30',   'Oil & Fluids','Main Warehouse', 18,  6,  2323, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'Bosch Brake Pads BP1234',  'BOSCH-BP1234',    'Brakes',      'Main Warehouse',  2,  4,  3817, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111', 'Exide Inva Master 150Ah',  'EXIDE-IM-150',    'Electrical',  'Main Warehouse',  6,  3, 14109, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000006', 'e1111111-1111-1111-1111-111111111111', 'MANN Air Filter C 27 006', 'MANN-C27006',     'Filters',     'Main Warehouse',  0,  5,  1078, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────

INSERT INTO purchase_orders (id, tenant_id, po_number, vendor_name, order_date, delivery_date, item_count, total_amount, status, created_at, updated_at) VALUES
  ('50000000-0000-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'PO-2024-001', 'CEAT Tyres Ltd',    '2024-03-15', '2024-03-25', 3, 189216, 'APPROVED',  NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'PO-2024-002', 'Bosch India',       '2024-03-12', '2024-03-18', 5,  45600, 'DELIVERED', NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'PO-2024-003', 'Castrol India',     '2024-03-18', '2024-03-28', 2,  27876, 'PENDING',   NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'PO-2024-004', 'Exide Industries',  '2024-03-20', NULL,         4,  84654, 'DRAFT',     NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════════════════
-- ACCOUNT GROUPS — Minimal Standard Groups (Tally-compatible)
-- ═════════════════════════════════════════════════════════════════════════════
-- Primary
-- ├── Assets
-- ├── Liabilities
-- ├── Income
-- │   ├── Direct Income (Freight)
-- │   └── Indirect Income
-- └── Expenses
--     ├── Direct Expenses (Trip Costs)
--     └── Indirect Expenses
-- ═════════════════════════════════════════════════════════════════════════════

-- Primary (root — no nature)
INSERT INTO account_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) VALUES
  ('aa000000-0001-0000-0000-000000000000', 'e1111111-1111-1111-1111-111111111111', 'Primary', NULL, NULL, NULL, 'Primary', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4 top-level groups under Primary
INSERT INTO account_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) VALUES
  ('aa000000-0001-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Assets',      'ASSET',     NULL, 'aa000000-0001-0000-0000-000000000000', 'Assets',      TRUE, NOW(), NOW()),
  ('aa000000-0001-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Liabilities', 'LIABILITY', NULL, 'aa000000-0001-0000-0000-000000000000', 'Liabilities', TRUE, NOW(), NOW()),
  ('aa000000-0001-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Income',      'INCOME',    NULL, 'aa000000-0001-0000-0000-000000000000', 'Income',      TRUE, NOW(), NOW()),
  ('aa000000-0001-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'Expenses',    'EXPENSE',   NULL, 'aa000000-0001-0000-0000-000000000000', 'Expenses',    TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Income sub-groups
INSERT INTO account_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) VALUES
  ('aa000000-0002-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111', 'Direct Income',   'INCOME', NULL, 'aa000000-0001-0000-0000-000000000003', 'Direct Incomes',   TRUE, NOW(), NOW()),
  ('aa000000-0002-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111', 'Indirect Income', 'INCOME', NULL, 'aa000000-0001-0000-0000-000000000003', 'Indirect Incomes', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Expense sub-groups
INSERT INTO account_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) VALUES
  ('aa000000-0002-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111', 'Direct Expenses',   'EXPENSE', NULL, 'aa000000-0001-0000-0000-000000000004', 'Direct Expenses',   TRUE, NOW(), NOW()),
  ('aa000000-0002-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111', 'Indirect Expenses', 'EXPENSE', NULL, 'aa000000-0001-0000-0000-000000000004', 'Indirect Expenses', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════════════════
-- DONE
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 'Seed script completed. ' || COUNT(*) || ' account groups loaded.' AS status FROM account_groups;

