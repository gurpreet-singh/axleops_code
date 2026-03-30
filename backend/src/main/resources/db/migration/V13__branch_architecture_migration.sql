-- ============================================
-- V13: Branch Architecture Migration
-- Adds new columns to branches table and backfills existing data.
-- Hibernate handles DDL, but we need to backfill code + is_headquarters
-- for existing rows that were created before the schema change.
-- ============================================

-- Backfill existing branches: set code = 'HQ' where missing
DO $$
BEGIN
  -- Add code column if not exists (Hibernate should have created it, but safety net)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'code') THEN
    UPDATE branches SET code = 'HQ' WHERE code IS NULL;
  END IF;

  -- Migrate is_primary → is_headquarters
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'is_primary') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'is_headquarters') THEN
      UPDATE branches SET is_headquarters = is_primary WHERE is_headquarters IS NULL OR is_headquarters = FALSE;
    END IF;
  END IF;

  -- Migrate status → is_active
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'status') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'is_active') THEN
      UPDATE branches SET is_active = CASE WHEN status = 'ACTIVE' THEN TRUE ELSE FALSE END
      WHERE is_active IS NULL;
    END IF;
  END IF;
END
$$;

-- Drop old columns if they exist (cleanup)
ALTER TABLE branches DROP COLUMN IF EXISTS is_primary;
ALTER TABLE branches DROP COLUMN IF EXISTS status;
