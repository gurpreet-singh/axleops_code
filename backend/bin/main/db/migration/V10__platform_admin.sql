-- ============================================
-- V10: Platform Admin & PLATFORM_ADMIN Role
-- Platform admins are a separate concept from tenant users.
-- They manage the AxleOps platform itself — creating tenants,
-- assigning system admins, etc. NOT tied to any tenant.
-- ============================================

-- Standalone Platform Admins table
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(50),
    title VARCHAR(100) DEFAULT 'Platform Administrator',
    access_level VARCHAR(50) DEFAULT 'FULL',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add PLATFORM_ADMIN role to roles table
INSERT INTO roles (id, role_key, label, department, branch_scope, description) VALUES
('a0000002-0000-4000-a000-000000000001', 'PLATFORM_ADMIN', 'Platform Admin', 'platform', 'ALL', 'Full access to all tenants, can create tenants and assign system admins');

-- Seed default Platform Admin
INSERT INTO platform_admins (id, first_name, last_name, email, password, title, access_level, status) VALUES
('a0000001-0000-4000-a000-000000000001', 'Platform', 'Admin', 'platform_admin', 'platform_admin', 'Platform Administrator', 'FULL', 'ACTIVE');
