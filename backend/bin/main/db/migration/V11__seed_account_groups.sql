-- ============================================================
-- V11: Create ledger_groups table + Seed Standard COA Tree
-- ============================================================
-- Must create table here because Hibernate DDL runs AFTER Flyway.
-- Follows Tally ERP 9 structure (Indian accounting standard).
-- ============================================================

-- ── CREATE TABLE (idempotent) ──────────────────────────────

CREATE TABLE IF NOT EXISTS ledger_groups (
    id                   UUID PRIMARY KEY,
    tenant_id            UUID,
    created_at           TIMESTAMP(6),
    updated_at           TIMESTAMP(6),
    name                 VARCHAR(255) NOT NULL,
    nature               VARCHAR(20) NOT NULL CHECK (nature IN ('ASSET','LIABILITY','INCOME','EXPENSE')),
    default_account_type VARCHAR(30) CHECK (default_account_type IN ('PARTY_ROUTE','PARTY_GENERAL','BANK','DRIVER_CASH','GENERAL')),
    parent_group_id      UUID REFERENCES ledger_groups(id),
    tally_group_name     VARCHAR(255),
    is_system_group      BOOLEAN NOT NULL DEFAULT FALSE
);


-- ── ROOT GROUPS (depth=0) ──────────────────────────────────

MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0001-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111',
   'Assets', 'ASSET', NULL, NULL, 'Assets', TRUE, NOW(), NOW()),

  ('aa000000-0001-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111',
   'Liabilities', 'LIABILITY', NULL, NULL, 'Liabilities', TRUE, NOW(), NOW()),

  ('aa000000-0001-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111',
   'Income', 'INCOME', NULL, NULL, 'Income', TRUE, NOW(), NOW()),

  ('aa000000-0001-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111',
   'Expenses', 'EXPENSE', NULL, NULL, 'Expenses', TRUE, NOW(), NOW())

;


-- ── ASSET CHILDREN (depth=1) ───────────────────────────────

MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0002-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111',
   'Current Assets', 'ASSET', NULL, 'aa000000-0001-0000-0000-000000000001', 'Current Assets', TRUE, NOW(), NOW()),

  ('aa000000-0002-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111',
   'Fixed Assets', 'ASSET', NULL, 'aa000000-0001-0000-0000-000000000001', 'Fixed Assets', TRUE, NOW(), NOW())

;

-- ASSET depth=2
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000001', 'e1111111-1111-1111-1111-111111111111',
   'Cash-in-Hand', 'ASSET', 'GENERAL', 'aa000000-0002-0000-0000-000000000001', 'Cash-in-Hand', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000002', 'e1111111-1111-1111-1111-111111111111',
   'Bank Accounts', 'ASSET', 'BANK', 'aa000000-0002-0000-0000-000000000001', 'Bank Accounts', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111',
   'Sundry Debtors', 'ASSET', 'PARTY_ROUTE', 'aa000000-0002-0000-0000-000000000001', 'Sundry Debtors', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111',
   'Vehicles', 'ASSET', 'GENERAL', 'aa000000-0002-0000-0000-000000000002', 'Vehicles', TRUE, NOW(), NOW())

;


-- ── LIABILITY CHILDREN (depth=1) ───────────────────────────

MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0002-0000-0000-000000000003', 'e1111111-1111-1111-1111-111111111111',
   'Current Liabilities', 'LIABILITY', NULL, 'aa000000-0001-0000-0000-000000000002', 'Current Liabilities', TRUE, NOW(), NOW()),

  ('aa000000-0002-0000-0000-000000000004', 'e1111111-1111-1111-1111-111111111111',
   'Loans (Liability)', 'LIABILITY', NULL, 'aa000000-0001-0000-0000-000000000002', 'Loans (Liability)', TRUE, NOW(), NOW())

;

-- LIABILITY depth=2
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111',
   'Sundry Creditors', 'LIABILITY', 'PARTY_GENERAL', 'aa000000-0002-0000-0000-000000000003', 'Sundry Creditors', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000006', 'e1111111-1111-1111-1111-111111111111',
   'Duties & Taxes', 'LIABILITY', 'GENERAL', 'aa000000-0002-0000-0000-000000000003', 'Duties & Taxes', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000007', 'e1111111-1111-1111-1111-111111111111',
   'Vehicle Loans (EMI)', 'LIABILITY', 'GENERAL', 'aa000000-0002-0000-0000-000000000004', 'Secured Loans', TRUE, NOW(), NOW())

;


-- ── INCOME CHILDREN (depth=1) ──────────────────────────────

MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0002-0000-0000-000000000005', 'e1111111-1111-1111-1111-111111111111',
   'Direct Income', 'INCOME', NULL, 'aa000000-0001-0000-0000-000000000003', 'Direct Incomes', TRUE, NOW(), NOW())

;

-- INCOME depth=2
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000008', 'e1111111-1111-1111-1111-111111111111',
   'Freight Revenue', 'INCOME', 'PARTY_ROUTE', 'aa000000-0002-0000-0000-000000000005', 'Freight Revenue', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000009', 'e1111111-1111-1111-1111-111111111111',
   'Loading/Unloading Income', 'INCOME', 'GENERAL', 'aa000000-0002-0000-0000-000000000005', 'Loading/Unloading Income', FALSE, NOW(), NOW())

;


-- ── EXPENSE CHILDREN (depth=1) ─────────────────────────────

MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0002-0000-0000-000000000006', 'e1111111-1111-1111-1111-111111111111',
   'Trip Expenses', 'EXPENSE', NULL, 'aa000000-0001-0000-0000-000000000004', 'Direct Expenses', TRUE, NOW(), NOW()),

  ('aa000000-0002-0000-0000-000000000007', 'e1111111-1111-1111-1111-111111111111',
   'Fixed Costs', 'EXPENSE', NULL, 'aa000000-0001-0000-0000-000000000004', 'Indirect Expenses', TRUE, NOW(), NOW()),

  ('aa000000-0002-0000-0000-000000000008', 'e1111111-1111-1111-1111-111111111111',
   'Admin Expenses', 'EXPENSE', NULL, 'aa000000-0001-0000-0000-000000000004', 'Administrative Expenses', TRUE, NOW(), NOW())

;

-- EXPENSE depth=2 (Trip Expenses children)
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000010', 'e1111111-1111-1111-1111-111111111111',
   'Fuel', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000006', 'Fuel Expenses', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000011', 'e1111111-1111-1111-1111-111111111111',
   'Toll', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000006', 'Toll Expenses', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000012', 'e1111111-1111-1111-1111-111111111111',
   'Driver Bata', 'EXPENSE', 'DRIVER_CASH', 'aa000000-0002-0000-0000-000000000006', 'Driver Bata', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000013', 'e1111111-1111-1111-1111-111111111111',
   'Trip Maintenance', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000006', 'Repair & Maintenance', FALSE, NOW(), NOW())

;

-- EXPENSE depth=2 (Fixed Costs children)
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000014', 'e1111111-1111-1111-1111-111111111111',
   'EMI', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000007', 'EMI Payments', FALSE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000015', 'e1111111-1111-1111-1111-111111111111',
   'Insurance', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000007', 'Insurance Charges', TRUE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000016', 'e1111111-1111-1111-1111-111111111111',
   'Permits & Tax', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000007', 'Road Tax & Permits', TRUE, NOW(), NOW())

;

-- EXPENSE depth=2 (Admin Expenses children)
MERGE INTO ledger_groups (id, tenant_id, name, nature, default_account_type, parent_group_id, tally_group_name, is_system_group, created_at, updated_at) KEY(id)
VALUES
  ('aa000000-0003-0000-0000-000000000017', 'e1111111-1111-1111-1111-111111111111',
   'Office Rent', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000008', 'Rent', FALSE, NOW(), NOW()),

  ('aa000000-0003-0000-0000-000000000018', 'e1111111-1111-1111-1111-111111111111',
   'Salaries', 'EXPENSE', 'GENERAL', 'aa000000-0002-0000-0000-000000000008', 'Salary Expenses', TRUE, NOW(), NOW())

;
