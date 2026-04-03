-- =============================================================================
-- AxleOps — Consolidated Seed Script
-- =============================================================================
-- Run this against a FRESH database after Hibernate DDL has created the schema.
--
-- Usage:
--   1. Start the backend once with `ddl-auto: update` to create all tables
--   2. Stop the backend
--   3. Run: psql -U postgres -p 5433 -d axleops -f seed_script.sql
--   4. Restart the backend
--
-- This script is idempotent (ON CONFLICT DO NOTHING everywhere).
-- All records belong to tenant: e9999999-9999-9999-9999-999999999999 (Preet Transport)
-- =============================================================================

SET client_min_messages = WARNING;

-- ─── TENANT ──────────────────────────────────────────────────────────────────

INSERT INTO tenants (id, name, trade_name, gstin, pan, city, state, status, created_at, updated_at) VALUES
  ('e9999999-9999-9999-9999-999999999999', 'Preet Transport', 'Preet Transport', '03AABCU9603R1ZM', 'AABCU9603R', 'Amritsar', 'Punjab', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── BRANCHES ────────────────────────────────────────────────────────────────

INSERT INTO branches (id, tenant_id, code, name, city, state, is_headquarters, is_active, created_at, updated_at) VALUES
  ('b9999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'PB-HQ',  'Punjab HQ',  'Amritsar',  'Punjab',  TRUE,  TRUE, NOW(), NOW()),
  ('b9999999-9999-9999-9999-999999999998', 'e9999999-9999-9999-9999-999999999999', 'LDH',    'Ludhiana',   'Ludhiana',  'Punjab',  FALSE, TRUE, NOW(), NOW()),
  ('b9999999-9999-9999-9999-999999999997', 'e9999999-9999-9999-9999-999999999999', 'DEL',    'Delhi NCR',  'Delhi',     'Delhi',   FALSE, TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── USERS (all operational & admin personnel — unified identity) ────────────
-- username = login credential | email = communication (nullable) | phone = E.164 format

INSERT INTO users (id, tenant_id, first_name, last_name, username, email, password, title, phone, login_enabled, status, branch_id, is_active, created_at, updated_at) VALUES
  -- Owner / Director
  ('ae999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Singh',    'gurpreet_owner',       'gurpreet.singh@gobind.in',      'gurpreet_owner',       'Owner / Director',       '+919800000001', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999998', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Sharma',   'ankit_owner',          'ankit.sharma@gobind.in',       'ankit_owner',          'Owner / Director',       '+919800000002', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Branch Manager
  ('ae999999-9999-9999-9999-999999999997', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Kaur',     'gurpreet_branch_mgr',  'gurpreet.kaur@gobind.in',      'gurpreet_branch_mgr',  'Branch Manager',         '+919800000003', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999996', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Verma',    'ankit_branch_mgr',     'ankit.verma@gobind.in',        'ankit_branch_mgr',     'Branch Manager',         '+919800000004', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Fleet Manager
  ('ae999999-9999-9999-9999-999999999995', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Gill',     'gurpreet_fleet_mgr',   'gurpreet.gill@gobind.in',      'gurpreet_fleet_mgr',   'Fleet Manager',          '+919800000005', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999994', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Gupta',    'ankit_fleet_mgr',      'ankit.gupta@gobind.in',        'ankit_fleet_mgr',      'Fleet Manager',          '+919800000006', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Operations Executive
  ('ae999999-9999-9999-9999-999999999993', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Dhillon',  'gurpreet_ops_exec',    'gurpreet.dhillon@gobind.in',   'gurpreet_ops_exec',    'Operations Executive',   '+919800000007', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999992', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Kumar',    'ankit_ops_exec',       'ankit.kumar@gobind.in',        'ankit_ops_exec',       'Operations Executive',   '+919800000008', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Driver
  ('d0000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Driver',   'gurpreet_driver',      NULL,                           'gurpreet_driver',      'Driver',                 '+919876543210', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Driver',   'ankit_driver',         NULL,                           'ankit_driver',         'Driver',                 '+918765432109', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Foreman (non-login)
  ('ae999999-9999-9999-9999-999999999991', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Foreman',  'gurpreet_foreman',     NULL,                           NULL,                   'Foreman',                '+919800000011', FALSE, 'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999990', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Foreman',  'ankit_foreman',        NULL,                           NULL,                   'Foreman',                '+919800000012', FALSE, 'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Helper (non-login)
  ('ae999999-9999-9999-9999-999999999989', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Helper',   'gurpreet_helper',      NULL,                           NULL,                   'Helper',                 '+919800000013', FALSE, 'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999988', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Helper',   'ankit_helper',         NULL,                           NULL,                   'Helper',                 '+919800000014', FALSE, 'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Finance Controller
  ('ae999999-9999-9999-9999-999999999987', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Finance',  'gurpreet_finance',     'gurpreet.finance@gobind.in',   'gurpreet_finance',     'Finance Controller',     '+919800000015', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999986', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Finance',  'ankit_finance',        'ankit.finance@gobind.in',      'ankit_finance',        'Finance Controller',     '+919800000016', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Accounts Executive
  ('ae999999-9999-9999-9999-999999999985', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Accounts', 'gurpreet_accounts',    'gurpreet.accounts@gobind.in',  'gurpreet_accounts',    'Accounts Executive',     '+919800000017', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999984', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Accounts', 'ankit_accounts',       'ankit.accounts@gobind.in',     'ankit_accounts',       'Accounts Executive',     '+919800000018', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Workshop Manager
  ('ae999999-9999-9999-9999-999999999983', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Workshop', 'gurpreet_workshop',    'gurpreet.workshop@gobind.in',  'gurpreet_workshop',    'Workshop Manager',       '+919800000019', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999982', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Workshop', 'ankit_workshop',       'ankit.workshop@gobind.in',     'ankit_workshop',       'Workshop Manager',       '+919800000020', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Mechanic
  ('d0000000-0000-0000-0000-000000000007', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Mechanic', 'gurpreet_mechanic',    NULL,                           'gurpreet_mechanic',    'Mechanic',               '+913210987654', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999981', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Mechanic', 'ankit_mechanic',       NULL,                           'ankit_mechanic',       'Mechanic',               '+919800000022', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Inventory Manager
  ('ae999999-9999-9999-9999-999999999980', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet',  'Inventory','gurpreet_inventory',   'gurpreet.inventory@gobind.in', 'gurpreet_inventory',   'Inventory Manager',      '+919800000023', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),
  ('ae999999-9999-9999-9999-999999999979', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Inventory','ankit_inventory',      'ankit.inventory@gobind.in',    'ankit_inventory',      'Inventory Manager',      '+919800000024', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW()),

  -- Super Admin (additional — Gurpreet already has it via owner, so Ankit gets a dedicated one)
  ('ae999999-9999-9999-9999-999999999978', 'e9999999-9999-9999-9999-999999999999', 'Ankit',     'Admin',    'ankit_admin',          'ankit.admin@gobind.in',        'ankit_admin',          'System Administrator',   '+919800000026', TRUE,  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── TENANT USER ROLES (join table — enum name strings) ──────────────────────

INSERT INTO tenant_user_role (user_id, role) VALUES
  -- Owner / Director (+ Super Admin for Gurpreet)
  ('ae999999-9999-9999-9999-999999999999', 'OWNER_DIRECTOR'),
  ('ae999999-9999-9999-9999-999999999999', 'SUPER_ADMIN'),
  ('ae999999-9999-9999-9999-999999999998', 'OWNER_DIRECTOR'),

  -- Branch Manager
  ('ae999999-9999-9999-9999-999999999997', 'BRANCH_MANAGER'),
  ('ae999999-9999-9999-9999-999999999996', 'BRANCH_MANAGER'),

  -- Fleet Manager
  ('ae999999-9999-9999-9999-999999999995', 'FLEET_MANAGER'),
  ('ae999999-9999-9999-9999-999999999994', 'FLEET_MANAGER'),

  -- Operations Executive
  ('ae999999-9999-9999-9999-999999999993', 'OPERATIONS_EXECUTIVE'),
  ('ae999999-9999-9999-9999-999999999992', 'OPERATIONS_EXECUTIVE'),

  -- Driver
  ('d0000000-0000-0000-0000-000000000001', 'DRIVER'),
  ('d0000000-0000-0000-0000-000000000002', 'DRIVER'),

  -- Foreman
  ('ae999999-9999-9999-9999-999999999991', 'FOREMAN'),
  ('ae999999-9999-9999-9999-999999999990', 'FOREMAN'),

  -- Helper
  ('ae999999-9999-9999-9999-999999999989', 'HELPER'),
  ('ae999999-9999-9999-9999-999999999988', 'HELPER'),

  -- Finance Controller
  ('ae999999-9999-9999-9999-999999999987', 'FINANCE_CONTROLLER'),
  ('ae999999-9999-9999-9999-999999999986', 'FINANCE_CONTROLLER'),

  -- Accounts Executive
  ('ae999999-9999-9999-9999-999999999985', 'ACCOUNTS_EXECUTIVE'),
  ('ae999999-9999-9999-9999-999999999984', 'ACCOUNTS_EXECUTIVE'),

  -- Workshop Manager
  ('ae999999-9999-9999-9999-999999999983', 'WORKSHOP_MANAGER'),
  ('ae999999-9999-9999-9999-999999999982', 'WORKSHOP_MANAGER'),

  -- Mechanic
  ('d0000000-0000-0000-0000-000000000007', 'MECHANIC'),
  ('ae999999-9999-9999-9999-999999999981', 'MECHANIC'),

  -- Inventory Manager
  ('ae999999-9999-9999-9999-999999999980', 'INVENTORY_MANAGER'),
  ('ae999999-9999-9999-9999-999999999979', 'INVENTORY_MANAGER'),

  -- Super Admin (Ankit)
  ('ae999999-9999-9999-9999-999999999978', 'SUPER_ADMIN')
ON CONFLICT DO NOTHING;


-- ─── PLATFORM ADMINS ─────────────────────────────────────────────────────────

INSERT INTO platform_admins (id, first_name, last_name, email, password, title, access_level, is_active, created_at, updated_at) VALUES
  ('a0000001-0000-4000-a000-000000000001', 'Platform', 'Admin', 'platform_admin', 'platform_admin', 'Platform Administrator', 'PLATFORM_ADMIN', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── VEHICLE TYPES ───────────────────────────────────────────────────────────

INSERT INTO vehicle_types (id, tenant_id, name, category, axle_count, fuel_type, created_at, updated_at) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', '32ft Multi-Axle', 'HCV', 3, 'DIESEL', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'LCV',             'LCV', 2, 'DIESEL', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', '14MT 2-Axle',     'MCV', 2, 'DIESEL', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── CLIENTS ─────────────────────────────────────────────────────────────────

INSERT INTO clients (id, tenant_id, name, trade_name, gstin, billing_type, industry, contract_type, rate, credit_limit, status, branch_id, created_at, updated_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'Reliance Industries',   'RIL',    '27AAACR5055K1Z5', 'PER_KM',    'Petrochemicals',  'Per KM',    '₹34.15/km',      1000000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'Tata Steel',            'Tata',   '27AAACT2727Q1ZX', 'PER_TRIP',  'Steel & Metals',  'Per Trip',  '₹48,000/trip',     800000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'Hindustan Unilever',    'HUL',    '27AAACH0549C1ZR', 'PER_KM',    'FMCG',            'Per KM',    '₹28.50/km',      1200000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'e9999999-9999-9999-9999-999999999999', 'ITC Limited',           'ITC',    '27AAACI1681G1Z0', 'PER_TONNE', 'FMCG',            'Per Tonne', '₹1,200/MT',       600000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999997', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000005', 'e9999999-9999-9999-9999-999999999999', 'Adani Ports',           'APSEZ',  '27AAACA6526C1ZI', 'PER_TRIP',  'Infrastructure',  'Per Trip',  '₹72,000/trip',     600000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000006', 'e9999999-9999-9999-9999-999999999999', 'Mahindra Logistics',    'MLL',    '27AACCM0538L1ZD', 'PER_KM',    '3PL',             'Per KM',    '₹32.00/km',       500000, 'ACTIVE',   'b9999999-9999-9999-9999-999999999998', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000007', 'e9999999-9999-9999-9999-999999999999', 'Asian Paints',          'APL',    '27AAACA6522N1ZF', 'PER_TRIP',  'Chemicals',       'Per Trip',  '₹35,000/trip',     400000, 'INACTIVE', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── VEHICLES ────────────────────────────────────────────────────────────────

INSERT INTO vehicles (id, tenant_id, registration_number, vehicle_type_id, make, model, manufacture_year, chassis_number, fuel_type, odometer, status, vehicle_group, branch_id, created_at, updated_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'PB02XY9876', 'b0000000-0000-0000-0000-000000000001', 'Tata',          'Ace Gold',        2022, 'MBLH111AXNMB4521',   'DIESEL', 139998, 'ACTIVE',         'Amritsar', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'PB02CD5678', 'b0000000-0000-0000-0000-000000000002', 'Mahindra',       'Bolero Pickup',   2021, 'MA1TB2HSXP1B73921',  'DIESEL',  72770, 'ACTIVE',         'Amritsar', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'PB11EF9012', 'b0000000-0000-0000-0000-000000000003', 'Ashok Leyland',  'Dost',            2020, 'MBLR522BXKMA09842',  'DIESEL', 157907, 'IN_SHOP',        'Ludhiana', 'b9999999-9999-9999-9999-999999999998', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000004', 'e9999999-9999-9999-9999-999999999999', 'PB11GH3456', 'b0000000-0000-0000-0000-000000000002', 'Mahindra',       'Scorpio-N',       2023, 'MA1NG2GSXP1D85732',  'DIESEL',  52407, 'ACTIVE',         'Ludhiana', 'b9999999-9999-9999-9999-999999999998', NOW(), NOW()),
  ('e0000000-0000-0000-0000-000000000005', 'e9999999-9999-9999-9999-999999999999', 'DL01IJ7890', 'b0000000-0000-0000-0000-000000000003', 'Tata',           '407',             2019, 'MBLR511CXKMA12034',  'DIESEL', 202574, 'OUT_OF_SERVICE', 'Delhi',    'b9999999-9999-9999-9999-999999999997', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── ROUTES ──────────────────────────────────────────────────────────────────

INSERT INTO routes (id, tenant_id, name, origin, destination, distance_km, estimated_hours, toll_cost, via, origin_pin, dest_pin, sla_hours, payment_terms, template, status, branch_id, created_at, updated_at) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'Amritsar > Delhi',      'Preet HQ Amritsar', 'Delhi Warehouse',   450, 8,  3200, 'NH44',         '143001', '110001', 10, '30 days', 'Standard', 'ACTIVE', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'Amritsar > Ludhiana',   'Preet HQ Amritsar', 'Ludhiana Hub',      140,  3,   420, 'NH44',         '143001', '141001',  4, '15 days', 'Express',  'ACTIVE', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('f0000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'Delhi > Jaipur',        'Delhi NCR Hub',      'Jaipur Central WH',  280,  5, 2100, 'NH48',         '110001', '302017',  6, '30 days', 'Standard', 'ACTIVE', 'b9999999-9999-9999-9999-999999999997', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── TRIPS (driver_id now references users table) ───────────────────────────

INSERT INTO trips (id, tenant_id, trip_number, client_id, route_id, vehicle_id, driver_id, status, lr_number, revenue, scheduled_start, branch_id, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'T-1001', 'c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'IN_TRANSIT', 'LR-2024-0042', 47130, '2024-03-18 08:00:00', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'T-1002', 'c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'IN_TRANSIT', 'LR-2024-0043', 48510, '2024-03-17 06:00:00', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'T-1003', 'c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'ae999999-9999-9999-9999-999999999993', 'COMPLETED',  'LR-2024-0044',  8500, '2024-03-16 07:00:00', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'e9999999-9999-9999-9999-999999999999', 'T-1004', 'c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'CREATED',    'LR-2024-0045', 12320, '2024-03-19 09:00:00', 'b9999999-9999-9999-9999-999999999997', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── INVOICES ────────────────────────────────────────────────────────────────

INSERT INTO invoices (id, tenant_id, invoice_number, client_id, date, due_date, amount, gst_amount, total_amount, status, branch_id, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'GTLC/10075/F-26', 'c0000000-0000-0000-0000-000000000006', '2026-03-21', '2026-04-20', 801000, 144180, 937170, 'SENT',  'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'GTLC/10076/F-27', 'c0000000-0000-0000-0000-000000000001', '2026-03-22', '2026-04-21', 452000,  81360, 533360, 'DRAFT', 'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'GTLC/10077/F-28', 'c0000000-0000-0000-0000-000000000002', '2026-03-18', '2026-04-17', 624000, 112320, 736320, 'PAID',  'b9999999-9999-9999-9999-999999999999', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── WORK ORDERS (assigned_to now references users table) ────────────────────

INSERT INTO work_orders (id, tenant_id, work_order_number, vehicle_id, status, priority, total_cost, issue_date, assigned_to, service_tasks, label, branch_id, created_at, updated_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'WO-371', 'e0000000-0000-0000-0000-000000000001', 'OPEN',      'NON_SCHEDULED', 82240, '2024-05-10', 'd0000000-0000-0000-0000-000000000001', 'Tire Replacement, Brake Inspection, Engine Oil', 'Tires',  'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'WO-370', 'e0000000-0000-0000-0000-000000000002', 'PENDING',   'SCHEDULED',     0,     '2024-05-09', 'd0000000-0000-0000-0000-000000000002', 'Brake Inspection, Tire Rotation',                 NULL,     'b9999999-9999-9999-9999-999999999999', NOW(), NOW()),
  ('30000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'WO-315', 'e0000000-0000-0000-0000-000000000004', 'COMPLETED', 'SCHEDULED',     11862, '2024-05-07', 'd0000000-0000-0000-0000-000000000007', 'Engine Oil & Filter Replacement',                 'Engine', 'b9999999-9999-9999-9999-999999999998', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── PARTS ───────────────────────────────────────────────────────────────────

INSERT INTO parts (id, tenant_id, name, part_number, category, location, in_stock, min_qty, unit_cost, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'CEAT Czar SUV 265/65R17',  'CEAT-CZR-26565',  'Tires',       'Main Warehouse', 12,  4, 15768, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'MANN Oil Filter W 712/95', 'MANN-W71295',      'Filters',     'Main Warehouse', 24, 10,   705, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'Castrol MAGNATEC 5W-30',   'CAST-MAG-5W30',   'Oil & Fluids','Main Warehouse', 18,  6,  2323, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000004', 'e9999999-9999-9999-9999-999999999999', 'Bosch Brake Pads BP1234',  'BOSCH-BP1234',    'Brakes',      'Main Warehouse',  2,  4,  3817, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000005', 'e9999999-9999-9999-9999-999999999999', 'Exide Inva Master 150Ah',  'EXIDE-IM-150',    'Electrical',  'Main Warehouse',  6,  3, 14109, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000006', 'e9999999-9999-9999-9999-999999999999', 'MANN Air Filter C 27 006', 'MANN-C27006',     'Filters',     'Main Warehouse',  0,  5,  1078, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────

INSERT INTO purchase_orders (id, tenant_id, po_number, vendor_name, order_date, delivery_date, item_count, total_amount, status, created_at, updated_at) VALUES
  ('50000000-0000-0000-0000-000000000001', 'e9999999-9999-9999-9999-999999999999', 'PO-2024-001', 'CEAT Tyres Ltd',    '2024-03-15', '2024-03-25', 3, 189216, 'APPROVED',  NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', 'e9999999-9999-9999-9999-999999999999', 'PO-2024-002', 'Bosch India',       '2024-03-12', '2024-03-18', 5,  45600, 'DELIVERED', NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000003', 'e9999999-9999-9999-9999-999999999999', 'PO-2024-003', 'Castrol India',     '2024-03-18', '2024-03-28', 2,  27876, 'PENDING',   NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000004', 'e9999999-9999-9999-9999-999999999999', 'PO-2024-004', 'Exide Industries',  '2024-03-20', NULL,         4,  84654, 'DRAFT',     NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ═════════════════════════════════════════════════════════════════════════════
-- DONE
-- ═════════════════════════════════════════════════════════════════════════════
SELECT 'Seed script completed.' AS status;
