-- ============================================
-- V14: Fix branches table schema to match Branch entity
-- Hibernate ddl-auto:update cannot add NOT NULL columns to tables
-- with existing rows. This migration adds the missing columns
-- and migrates data from legacy columns.
-- ============================================

-- 1. Add 'code' column (VARCHAR(10), NOT NULL)
ALTER TABLE branches ADD COLUMN IF NOT EXISTS code VARCHAR(10);
UPDATE branches SET code = 'HQ' WHERE code IS NULL AND is_primary = TRUE;
UPDATE branches SET code = UPPER(LEFT(REPLACE(name, ' ', ''), 6)) WHERE code IS NULL;
ALTER TABLE branches ALTER COLUMN code SET NOT NULL;

-- 2. Add 'is_headquarters' column (BOOLEAN, NOT NULL, default FALSE)
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT FALSE;
UPDATE branches SET is_headquarters = is_primary WHERE is_headquarters IS NULL OR is_headquarters = FALSE;
UPDATE branches SET is_headquarters = FALSE WHERE is_headquarters IS NULL;
ALTER TABLE branches ALTER COLUMN is_headquarters SET NOT NULL;

-- 3. Add 'is_active' column (BOOLEAN, NOT NULL, default TRUE)
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
UPDATE branches SET is_active = CASE WHEN status = 'INACTIVE' THEN FALSE ELSE TRUE END WHERE is_active IS NULL;
ALTER TABLE branches ALTER COLUMN is_active SET NOT NULL;

-- 4. Drop legacy columns
ALTER TABLE branches DROP COLUMN IF EXISTS is_primary;
ALTER TABLE branches DROP COLUMN IF EXISTS status;

-- 5. Add unique constraint on (tenant_id, code) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_branches_tenant_code'
  ) THEN
    ALTER TABLE branches ADD CONSTRAINT uq_branches_tenant_code UNIQUE (tenant_id, code);
  END IF;
END $$;
