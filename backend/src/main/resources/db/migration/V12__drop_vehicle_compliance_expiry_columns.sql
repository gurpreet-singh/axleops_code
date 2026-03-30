-- =====================================================================
-- V12: Remove denormalized compliance expiry columns from vehicles
-- These fields are now derived from the compliance_documents table.
-- =====================================================================

ALTER TABLE vehicles DROP COLUMN IF EXISTS insurance_expiry;
ALTER TABLE vehicles DROP COLUMN IF EXISTS fitness_expiry;
ALTER TABLE vehicles DROP COLUMN IF EXISTS permit_expiry;
