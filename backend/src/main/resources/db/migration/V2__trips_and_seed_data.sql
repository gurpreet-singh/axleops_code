-- ============================================
-- V2: Trips Table + Seed Data
-- ============================================

CREATE TABLE trips (
    id UUID PRIMARY KEY,
    trip_number VARCHAR(100) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id),
    route_id UUID NOT NULL REFERENCES routes(id),
    route_contract_id UUID REFERENCES route_contracts(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES contacts(id),
    branch_id UUID REFERENCES branches(id),
    status VARCHAR(50) DEFAULT 'CREATED',
    scheduled_start TIMESTAMP,
    actual_start TIMESTAMP,
    actual_arrival TIMESTAMP,
    cargo_weight DECIMAL(10, 2),
    cargo_description TEXT,
    lr_number VARCHAR(100),
    hsn_code VARCHAR(50),
    consignment_value DECIMAL(15, 2),
    revenue DECIMAL(15, 2),
    net_profit DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: Branches
INSERT INTO branches (id, name, city, state, is_primary) VALUES
('b1111111-1111-1111-1111-111111111111', 'Mumbai HQ', 'Mumbai', 'Maharashtra', TRUE),
('b2222222-2222-2222-2222-222222222222', 'Pune Branch', 'Pune', 'Maharashtra', FALSE),
('b3333333-3333-3333-3333-333333333333', 'Delhi NCR', 'New Delhi', 'Delhi', FALSE);

-- Seed data: Admin user
INSERT INTO users (id, first_name, last_name, email, password, role, title, branch_id) VALUES
('a1000001-0001-0001-0001-000000000001', 'Priya', 'Sharma', 'priya@goodwilltransport.in', '$demo$', 'OWNER', 'Managing Director', 'b1111111-1111-1111-1111-111111111111');

-- Seed data: Vehicle types
INSERT INTO vehicle_types (id, name, category, axle_count, payload_capacity, fuel_type) VALUES
('d1000001-0001-0001-0001-000000000001', '32 FT MXL', 'TRAILER', 3, 18.00, 'DIESEL'),
('d2000002-0002-0002-0002-000000000002', '22 FT SXL', 'TRUCK', 2, 9.00, 'DIESEL'),
('d3000003-0003-0003-0003-000000000003', '19 FT Container', 'TRUCK', 2, 7.00, 'DIESEL');

-- Seed data: Contacts (Drivers)
INSERT INTO contacts (id, first_name, last_name, phone, type, license_number, branch_id) VALUES
('c1000001-0001-0001-0001-000000000001', 'Ramesh', 'Yadav', '+91-9876543210', 'DRIVER', 'MH0420230001234', 'b1111111-1111-1111-1111-111111111111'),
('c2000002-0002-0002-0002-000000000002', 'Suresh', 'Patil', '+91-9876543211', 'DRIVER', 'DL0820240005678', 'b1111111-1111-1111-1111-111111111111');

-- Seed data: Vehicles
INSERT INTO vehicles (id, registration_number, vehicle_type_id, make, model, manufacture_year, fuel_type, odometer, status, branch_id) VALUES
('e1000001-0001-0001-0001-000000000001', 'MH04AB1234', 'd1000001-0001-0001-0001-000000000001', 'Tata', 'Prima LX', 2023, 'DIESEL', 45230, 'ACTIVE', 'b1111111-1111-1111-1111-111111111111'),
('e2000002-0002-0002-0002-000000000002', 'AP11COOO8', 'd2000002-0002-0002-0002-000000000002', 'Ashok Leyland', 'Boss 1922HE', 2022, 'DIESEL', 78650, 'ACTIVE', 'b1111111-1111-1111-1111-111111111111');

-- Seed data: Clients
INSERT INTO clients (id, name, trade_name, gstin, city, state, billing_type, branch_id) VALUES
('f1000001-0001-0001-0001-000000000001', 'Hinduja Leyland Finance', 'HLF', '27AABCH1234R1ZM', 'Mumbai', 'Maharashtra', 'PER_TRIP', 'b1111111-1111-1111-1111-111111111111'),
('f2000002-0002-0002-0002-000000000002', 'Reliance Retail Ltd', 'RRL', '27AALCR5678R1ZM', 'Mumbai', 'Maharashtra', 'MONTHLY', 'b1111111-1111-1111-1111-111111111111');

-- Seed data: Routes
INSERT INTO routes (id, name, origin, destination, distance_km, estimated_hours, toll_cost, branch_id) VALUES
('a1000001-1111-1111-1111-111111111111', 'Mumbai - Pune', 'Mumbai', 'Pune', 148, 3.5, 350, 'b1111111-1111-1111-1111-111111111111'),
('a2000002-2222-2222-2222-222222222222', 'Mumbai - Delhi', 'Mumbai', 'Delhi', 1400, 24, 3200, 'b1111111-1111-1111-1111-111111111111');
