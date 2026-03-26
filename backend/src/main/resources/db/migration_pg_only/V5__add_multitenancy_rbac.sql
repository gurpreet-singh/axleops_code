CREATE TABLE tenants (
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
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For this setup we will inject a default tenant to all existing tables.
INSERT INTO tenants (id, name, trade_name, gstin, pan, city, state, status) VALUES
('t1111111-1111-1111-1111-111111111111', 'Goodwill Transport Pvt. Ltd.', 'Goodwill Transport', '27AABCU9603R1ZM', 'AABCU9603R', 'Mumbai', 'Maharashtra', 'ACTIVE');

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    role_key VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    branch_scope VARCHAR(10) NOT NULL DEFAULT 'OWN',
    description TEXT,
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authorities
CREATE TABLE authorities (
    id UUID PRIMARY KEY,
    authority_key VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Authorities
CREATE TABLE role_authorities (
    role_id UUID NOT NULL REFERENCES roles(id),
    authority_id UUID NOT NULL REFERENCES authorities(id),
    PRIMARY KEY (role_id, authority_id)
);

-- User Branch Roles
CREATE TABLE user_branch_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE (user_id, branch_id, role_id)
);

-- Seed Roles
INSERT INTO roles (id, role_key, label, department, branch_scope, description) VALUES
('r1111111-1111-1111-1111-111111111111', 'OWNER', 'Owner / Director', 'executive', 'ALL', 'Full P&L visibility'),
('r2222222-2222-2222-2222-222222222222', 'BRANCH_MANAGER', 'Branch Manager', 'executive', 'OWN', 'Cross-department authority within branch'),
('r3333333-3333-3333-3333-333333333333', 'FLEET_MANAGER', 'Fleet Manager', 'operations', 'OWN', 'Vehicle allocation'),
('r4444444-4444-4444-4444-444444444444', 'FINANCE_CONTROLLER', 'Finance Controller', 'finance', 'ALL', 'P&L oversight');

-- Seed Authorities (Subset)
INSERT INTO authorities (id, authority_key, module, description) VALUES
('a1111111-1111-1111-1111-111111111111', 'TRIP_VIEW', 'TRIP', 'View trip list and detail'),
('a2222222-2222-2222-2222-222222222222', 'TRIP_CREATE', 'TRIP', 'Create new trips'),
('a3333333-3333-3333-3333-333333333333', 'INVOICE_VIEW', 'INVOICE', 'View invoices');

-- Assign authorities to OWNER
INSERT INTO role_authorities (role_id, authority_id) VALUES
('r1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('r1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'),
('r1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333');

-- Link existing user to branch and role
INSERT INTO user_branch_roles (id, user_id, branch_id, role_id, is_primary) VALUES
('ubr11111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', TRUE);

-- Update all existing core tables to have tenant_id (Tenant isolation)
ALTER TABLE branches ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE vehicle_types ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE contacts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE vehicles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE routes ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE route_contracts ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE trips ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE ledgers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE vouchers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE invoices ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE work_orders ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE parts ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Set default tenant for existing seed data
UPDATE branches SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE users SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE clients SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE vehicle_types SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE contacts SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE vehicles SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE routes SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE route_contracts SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE trips SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE ledgers SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE vouchers SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE invoices SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE work_orders SET tenant_id = 't1111111-1111-1111-1111-111111111111';
UPDATE parts SET tenant_id = 't1111111-1111-1111-1111-111111111111';