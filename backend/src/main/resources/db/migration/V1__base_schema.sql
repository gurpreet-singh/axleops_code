-- ============================================
-- V1: AxleOps Core Schema — Base Tables
-- ============================================

-- Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'OPERATOR',
    title VARCHAR(100),
    phone VARCHAR(50),
    branch_id UUID REFERENCES branches(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(50),
    pan VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    billing_type VARCHAR(50) DEFAULT 'PER_TRIP',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle Types
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    axle_count INT,
    payload_capacity DECIMAL(10, 2),
    fuel_type VARCHAR(50) DEFAULT 'DIESEL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts (Drivers, Mechanics, etc.)
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    type VARCHAR(50) DEFAULT 'DRIVER',
    license_number VARCHAR(100),
    license_expiry DATE,
    address TEXT,
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    make VARCHAR(100),
    model VARCHAR(100),
    manufacture_year INT,
    chassis_number VARCHAR(100),
    engine_number VARCHAR(100),
    color VARCHAR(50),
    fuel_type VARCHAR(50) DEFAULT 'DIESEL',
    odometer DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    insurance_expiry DATE,
    fitness_expiry DATE,
    permit_expiry DATE,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    distance_km DECIMAL(10, 2),
    estimated_hours DECIMAL(6, 2),
    toll_cost DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route Contracts
CREATE TABLE route_contracts (
    id UUID PRIMARY KEY,
    route_id UUID NOT NULL REFERENCES routes(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    freight_rate DECIMAL(12, 2),
    rate_type VARCHAR(50) DEFAULT 'PER_TRIP',
    loading_charges DECIMAL(10, 2),
    unloading_charges DECIMAL(10, 2),
    detention_charges_per_day DECIMAL(10, 2),
    effective_from DATE,
    effective_to DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ledgers (Chart of Accounts)
CREATE TABLE ledgers (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES ledgers(id),
    balance DECIMAL(15, 2) DEFAULT 0,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers
CREATE TABLE vouchers (
    id UUID PRIMARY KEY,
    voucher_number VARCHAR(100) NOT NULL UNIQUE,
    voucher_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    debit_ledger_id UUID REFERENCES ledgers(id),
    credit_ledger_id UUID REFERENCES ledgers(id),
    amount DECIMAL(15, 2) NOT NULL,
    narration TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
