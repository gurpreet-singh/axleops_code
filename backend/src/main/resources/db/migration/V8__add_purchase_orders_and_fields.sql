-- ============================================
-- V8: Add purchase_orders table + extra columns
-- ============================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id              UUID DEFAULT RANDOM_UUID() NOT NULL PRIMARY KEY,
    po_number       VARCHAR(100) NOT NULL UNIQUE,
    vendor_name     VARCHAR(255) NOT NULL,
    order_date      DATE,
    delivery_date   DATE,
    item_count      INT,
    total_amount    DECIMAL(15,2),
    status          VARCHAR(50) DEFAULT 'DRAFT',
    branch_id       UUID,
    tenant_id       UUID,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- tenant_id for tables that extend BaseEntity but were created without it
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE route_contracts ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE vehicle_types ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- service_tasks and label for work_orders
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS service_tasks VARCHAR(500);
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS label VARCHAR(100);

-- extra client fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rate VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2) DEFAULT 0;

-- extra route fields
ALTER TABLE routes ADD COLUMN IF NOT EXISTS origin_pin VARCHAR(10);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS dest_pin VARCHAR(10);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS via VARCHAR(255);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS sla_hours INT;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS template VARCHAR(50);

-- vehicle group
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_group VARCHAR(100);
