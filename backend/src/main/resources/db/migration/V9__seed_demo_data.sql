-- ============================================
-- V9: Seed additional demo data (safe upserts)
-- ============================================

-- ── Branches ──────────────────────────────────
MERGE INTO branches (id, name, city, state, is_primary, status) KEY(id) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Mumbai HQ', 'Mumbai', 'Maharashtra', TRUE, 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000002', 'Pune', 'Pune', 'Maharashtra', FALSE, 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000003', 'Delhi NCR', 'Delhi', 'Delhi', FALSE, 'ACTIVE');

-- ── Vehicle Types ─────────────────────────────
MERGE INTO vehicle_types (id, name, category, axle_count, fuel_type) KEY(id) VALUES
    ('b0000000-0000-0000-0000-000000000001', '32ft Multi-Axle', 'HCV', 3, 'DIESEL'),
    ('b0000000-0000-0000-0000-000000000002', 'LCV', 'LCV', 2, 'DIESEL'),
    ('b0000000-0000-0000-0000-000000000003', '14MT 2-Axle', 'MCV', 2, 'DIESEL');

-- ── Clients ───────────────────────────────────
MERGE INTO clients (id, name, trade_name, gstin, billing_type, industry, contract_type, rate, credit_limit, status, branch_id) KEY(id) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Reliance Industries', 'RIL', '27AAACR5055K1Z5', 'PER_KM', 'Petrochemicals', 'Per KM', '₹34.15/km', 1000000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000002', 'Tata Steel', 'Tata Steel Ltd', '27AAACT2727Q1ZX', 'PER_TRIP', 'Steel & Metals', 'Per Trip', '₹48,000/trip', 800000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000003', 'Hindustan Unilever', 'HUL', '27AAACH0549C1ZR', 'PER_KM', 'FMCG', 'Per KM', '₹28.50/km', 1200000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000004', 'ITC Limited', 'ITC', '27AAACI1681G1Z0', 'PER_TONNE', 'FMCG', 'Per Tonne', '₹1,200/MT', 600000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000003'),
    ('c0000000-0000-0000-0000-000000000005', 'Adani Ports', 'APSEZ', '27AAACA6526C1ZI', 'PER_TRIP', 'Infrastructure', 'Per Trip', '₹72,000/trip', 600000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000006', 'Mahindra Logistics', 'MLL', '27AACCM0538L1ZD', 'PER_KM', '3PL', 'Per KM', '₹32.00/km', 500000, 'ACTIVE', 'a0000000-0000-0000-0000-000000000002'),
    ('c0000000-0000-0000-0000-000000000007', 'Asian Paints', 'APL', '27AAACA6522N1ZF', 'PER_TRIP', 'Chemicals', 'Per Trip', '₹35,000/trip', 400000, 'INACTIVE', 'a0000000-0000-0000-0000-000000000001');

-- ── Contacts (Drivers + Others) ───────────────
MERGE INTO contacts (id, first_name, last_name, phone, email, type, license_number, license_expiry, city, status, branch_id) KEY(id) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Rajesh', 'Kumar', '+91 98765 43210', 'rajesh.kumar@example.com', 'DRIVER', 'MH0420190012345', '2027-06-15', 'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'Anita', 'Verma', '+91 87654 32109', 'anita.verma@example.com', 'DRIVER', 'DL0420200023456', '2028-03-20', 'Delhi', 'ACTIVE', 'a0000000-0000-0000-0000-000000000003'),
    ('d0000000-0000-0000-0000-000000000003', 'Priya', 'Sharma', '+91 76543 21098', 'priya.sharma@example.com', 'OPERATIONS', NULL, NULL, 'Pune', 'ACTIVE', 'a0000000-0000-0000-0000-000000000002'),
    ('d0000000-0000-0000-0000-000000000004', 'Vikram', 'Singh', '+91 65432 10987', 'vikram.singh@example.com', 'DRIVER', 'MH1220210034567', '2029-01-10', 'Pune', 'ACTIVE', 'a0000000-0000-0000-0000-000000000002'),
    ('d0000000-0000-0000-0000-000000000005', 'Deepak', 'Patel', '+91 54321 09876', 'deepak.patel@example.com', 'DRIVER', 'DL0120180045678', '2026-09-30', 'Delhi', 'ACTIVE', 'a0000000-0000-0000-0000-000000000003'),
    ('d0000000-0000-0000-0000-000000000006', 'Meera', 'Joshi', '+91 43210 98765', 'meera.joshi@example.com', 'DRIVER', 'MH0420200056789', '2028-12-05', 'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000007', 'Tarun', 'Mishra', '+91 32109 87654', 'tarun.mishra@example.com', 'MECHANIC', NULL, NULL, 'Mumbai', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001');

-- ── Vehicles ──────────────────────────────────
MERGE INTO vehicles (id, registration_number, vehicle_type_id, make, model, manufacture_year, chassis_number, fuel_type, odometer, status, vehicle_group, branch_id) KEY(id) VALUES
    ('e0000000-0000-0000-0000-000000000001', 'MH04XY9876', 'b0000000-0000-0000-0000-000000000001', 'Tata', 'Ace Gold', 2022, 'MBLH111AXNMB4521', 'DIESEL', 139998, 'ACTIVE', 'Mumbai', 'a0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000002', 'MH04CD5678', 'b0000000-0000-0000-0000-000000000002', 'Mahindra', 'Bolero Pickup', 2021, 'MA1TB2HSXP1B73921', 'DIESEL', 72770, 'ACTIVE', 'Mumbai', 'a0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000003', 'MH12EF9012', 'b0000000-0000-0000-0000-000000000003', 'Ashok Leyland', 'Dost', 2020, 'MBLR522BXKMA09842', 'DIESEL', 157907, 'IN_SHOP', 'Pune', 'a0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000004', 'MH12GH3456', 'b0000000-0000-0000-0000-000000000002', 'Mahindra', 'Scorpio-N', 2023, 'MA1NG2GSXP1D85732', 'DIESEL', 52407, 'ACTIVE', 'Pune', 'a0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000005', 'DL01IJ7890', 'b0000000-0000-0000-0000-000000000003', 'Tata', '407', 2019, 'MBLR511CXKMA12034', 'DIESEL', 202574, 'OUT_OF_SERVICE', 'Delhi', 'a0000000-0000-0000-0000-000000000003');

-- ── Routes ────────────────────────────────────
MERGE INTO routes (id, name, origin, destination, distance_km, estimated_hours, toll_cost, via, origin_pin, dest_pin, sla_hours, payment_terms, template, status, branch_id) KEY(id) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Mumbai > Delhi (JNPT)', 'JNPT Navi Mumbai', 'Mathura Refinery', 1380, 22, 8400, 'NH48 > NH44', '400707', '281006', 26, '30 days', 'Standard', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('f0000000-0000-0000-0000-000000000002', 'Mumbai > Pune', 'HUL Andheri Plant', 'Pune DC Hadapsar', 150, 3, 420, 'Expressway', '400093', '411028', 4, '15 days', 'Express', 'ACTIVE', 'a0000000-0000-0000-0000-000000000001'),
    ('f0000000-0000-0000-0000-000000000003', 'Delhi > Jaipur', 'ITC Gurgaon Hub', 'Jaipur Central WH', 280, 5, 2100, 'NH48', '122001', '302017', 6, '30 days', 'Standard', 'ACTIVE', 'a0000000-0000-0000-0000-000000000003');

-- ── Trips ─────────────────────────────────────
MERGE INTO trips (id, trip_number, client_id, route_id, vehicle_id, driver_id, status, lr_number, revenue, scheduled_start, branch_id) KEY(id) VALUES
    ('10000000-0000-0000-0000-000000000001', 'T-1001', 'c0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'IN_TRANSIT', 'LR-2024-0042', 47130, '2024-03-18 08:00:00', 'a0000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000002', 'T-1002', 'c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'IN_TRANSIT', 'LR-2024-0043', 48510, '2024-03-17 06:00:00', 'a0000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000003', 'T-1003', 'c0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'COMPLETED', 'LR-2024-0044', 8500, '2024-03-16 07:00:00', 'a0000000-0000-0000-0000-000000000001'),
    ('10000000-0000-0000-0000-000000000004', 'T-1004', 'c0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'CREATED', 'LR-2024-0045', 12320, '2024-03-19 09:00:00', 'a0000000-0000-0000-0000-000000000003');

-- ── Invoices ──────────────────────────────────
MERGE INTO invoices (id, invoice_number, client_id, date, due_date, amount, gst_amount, total_amount, status, branch_id) KEY(id) VALUES
    ('20000000-0000-0000-0000-000000000001', 'GTLC/10075/F-26', 'c0000000-0000-0000-0000-000000000006', '2026-03-21', '2026-04-20', 801000, 144180, 937170, 'SENT', 'a0000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000002', 'GTLC/10076/F-27', 'c0000000-0000-0000-0000-000000000001', '2026-03-22', '2026-04-21', 452000, 81360, 533360, 'DRAFT', 'a0000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000003', 'GTLC/10077/F-28', 'c0000000-0000-0000-0000-000000000002', '2026-03-18', '2026-04-17', 624000, 112320, 736320, 'PAID', 'a0000000-0000-0000-0000-000000000001');

-- ── Work Orders ───────────────────────────────
MERGE INTO work_orders (id, work_order_number, vehicle_id, status, priority, total_cost, issue_date, assigned_to, service_tasks, label, branch_id) KEY(id) VALUES
    ('30000000-0000-0000-0000-000000000001', 'WO-371', 'e0000000-0000-0000-0000-000000000001', 'OPEN', 'NON_SCHEDULED', 82240, '2024-05-10', 'd0000000-0000-0000-0000-000000000001', 'Tire Replacement, Brake Inspection, Engine Oil', 'Tires', 'a0000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000002', 'WO-370', 'e0000000-0000-0000-0000-000000000002', 'PENDING', 'SCHEDULED', 0, '2024-05-09', 'd0000000-0000-0000-0000-000000000002', 'Brake Inspection, Tire Rotation', NULL, 'a0000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000003', 'WO-315', 'e0000000-0000-0000-0000-000000000004', 'COMPLETED', 'SCHEDULED', 11862, '2024-05-07', 'd0000000-0000-0000-0000-000000000004', 'Engine Oil & Filter Replacement', 'Engine', 'a0000000-0000-0000-0000-000000000002');

-- ── Parts ─────────────────────────────────────
MERGE INTO parts (id, name, part_number, category, location, in_stock, min_qty, unit_cost) KEY(id) VALUES
    ('40000000-0000-0000-0000-000000000001', 'CEAT Czar SUV 265/65R17', 'CEAT-CZR-26565', 'Tires', 'Main Warehouse', 12, 4, 15768),
    ('40000000-0000-0000-0000-000000000002', 'MANN Oil Filter W 712/95', 'MANN-W71295', 'Filters', 'Main Warehouse', 24, 10, 705),
    ('40000000-0000-0000-0000-000000000003', 'Castrol MAGNATEC 5W-30', 'CAST-MAG-5W30', 'Oil & Fluids', 'Main Warehouse', 18, 6, 2323),
    ('40000000-0000-0000-0000-000000000004', 'Bosch Brake Pads BP1234', 'BOSCH-BP1234', 'Brakes', 'Main Warehouse', 2, 4, 3817),
    ('40000000-0000-0000-0000-000000000005', 'Exide Inva Master 150Ah', 'EXIDE-IM-150', 'Electrical', 'Main Warehouse', 6, 3, 14109),
    ('40000000-0000-0000-0000-000000000006', 'MANN Air Filter C 27 006', 'MANN-C27006', 'Filters', 'Main Warehouse', 0, 5, 1078);

-- ── Purchase Orders ───────────────────────────
MERGE INTO purchase_orders (id, po_number, vendor_name, order_date, delivery_date, item_count, total_amount, status) KEY(id) VALUES
    ('50000000-0000-0000-0000-000000000001', 'PO-2024-001', 'CEAT Tyres Ltd', '2024-03-15', '2024-03-25', 3, 189216, 'APPROVED'),
    ('50000000-0000-0000-0000-000000000002', 'PO-2024-002', 'Bosch India', '2024-03-12', '2024-03-18', 5, 45600, 'DELIVERED'),
    ('50000000-0000-0000-0000-000000000003', 'PO-2024-003', 'Castrol India', '2024-03-18', '2024-03-28', 2, 27876, 'PENDING'),
    ('50000000-0000-0000-0000-000000000004', 'PO-2024-004', 'Exide Industries', '2024-03-20', NULL, 4, 84654, 'DRAFT');
