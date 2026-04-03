-- ============================================
-- V15: Remove contacts table — unify on users
-- ============================================
-- This migration:
--   1. Adds driver/operational fields to the users table
--   2. Migrates existing contact data into users
--   3. Re-points all FK references from contacts(id) to users(id)
--   4. Drops the contacts table
-- ============================================

-- ── Step 1: Add new columns to users table ─────────────────────

-- Auth: username-based login (replaces email-based)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
UPDATE users SET username = email WHERE username IS NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Drop old email unique constraint, add username unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tenant_id_email_key;
ALTER TABLE users ADD CONSTRAINT users_tenant_id_username_key UNIQUE (tenant_id, username);

-- Email is now optional (communication only, not login)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Operational fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';


-- ── Step 2: Migrate contacts into users ────────────────────────
-- For each contact:
--   - If a user with matching (tenant_id, phone) exists → update that user with driver fields
--   - Otherwise → insert a new user row with password=NULL, login_enabled=TRUE

-- 2a. Update existing users that match by phone
UPDATE users u
SET address = c.address,
    status  = c.status
FROM contacts c
WHERE u.tenant_id = c.tenant_id
  AND u.phone IS NOT NULL
  AND u.phone = c.phone;

-- 2b. Insert contacts that have no matching user (by phone within tenant)
INSERT INTO users (id, tenant_id, first_name, last_name, email, password, phone,
                   address, login_enabled, status, branch_id, is_active, created_at, updated_at)
SELECT c.id, c.tenant_id, c.first_name, c.last_name,
       COALESCE(c.email, c.phone || '@imported.local'),
       NULL,
       c.phone,
       c.address,
       TRUE,
       COALESCE(c.status, 'ACTIVE'),
       c.branch_id,
       TRUE,
       COALESCE(c.created_at, NOW()),
       NOW()
FROM contacts c
WHERE NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.tenant_id = c.tenant_id
      AND u.phone IS NOT NULL
      AND u.phone = c.phone
);

-- 2c. Assign DRIVER role to all migrated users that came from DRIVER contacts
INSERT INTO tenant_user_role (user_id, role)
SELECT u.id, 'DRIVER'
FROM contacts c
JOIN users u ON (
    (u.id = c.id)  -- directly inserted contacts
    OR (u.tenant_id = c.tenant_id AND u.phone IS NOT NULL AND u.phone = c.phone)  -- merged contacts
)
WHERE c.type = 'DRIVER'
ON CONFLICT DO NOTHING;

-- Assign MECHANIC role to MECHANIC contacts
INSERT INTO tenant_user_role (user_id, role)
SELECT u.id, 'MECHANIC'
FROM contacts c
JOIN users u ON (
    (u.id = c.id)
    OR (u.tenant_id = c.tenant_id AND u.phone IS NOT NULL AND u.phone = c.phone)
)
WHERE c.type = 'MECHANIC'
ON CONFLICT DO NOTHING;

-- Assign OPERATIONS_EXECUTIVE role to OPERATIONS contacts
INSERT INTO tenant_user_role (user_id, role)
SELECT u.id, 'OPERATIONS_EXECUTIVE'
FROM contacts c
JOIN users u ON (
    (u.id = c.id)
    OR (u.tenant_id = c.tenant_id AND u.phone IS NOT NULL AND u.phone = c.phone)
)
WHERE c.type = 'OPERATIONS'
ON CONFLICT DO NOTHING;


-- ── Step 3: Re-point FK columns ───────────────────────────────
-- For contacts that were merged by phone (not direct ID insert),
-- we need to update the FK columns to point to the user's ID.
-- For contacts inserted directly (kept same ID), no update needed.

-- Create a mapping table: contact_id → user_id
CREATE TEMP TABLE contact_user_map AS
SELECT c.id AS contact_id,
       COALESCE(
           (SELECT u.id FROM users u WHERE u.tenant_id = c.tenant_id AND u.phone IS NOT NULL AND u.phone = c.phone LIMIT 1),
           c.id  -- fallback: same ID (direct insert)
       ) AS user_id
FROM contacts c;

-- Update all FK references
UPDATE trips SET driver_id = m.user_id FROM contact_user_map m WHERE trips.driver_id = m.contact_id;
UPDATE vouchers SET driver_id = m.user_id FROM contact_user_map m WHERE vouchers.driver_id = m.contact_id;
UPDATE driver_assignment_history SET driver_id = m.user_id FROM contact_user_map m WHERE driver_assignment_history.driver_id = m.contact_id;
UPDATE fuel_entries SET driver_id = m.user_id FROM contact_user_map m WHERE fuel_entries.driver_id = m.contact_id;
UPDATE vehicle_issues SET reported_by = m.user_id FROM contact_user_map m WHERE vehicle_issues.reported_by = m.contact_id;
UPDATE vehicles SET operator_id = m.user_id FROM contact_user_map m WHERE vehicles.operator_id = m.contact_id;
UPDATE work_orders SET assigned_to = m.user_id FROM contact_user_map m WHERE work_orders.assigned_to = m.contact_id;
UPDATE work_orders SET vendor_id = m.user_id FROM contact_user_map m WHERE work_orders.vendor_id = m.contact_id;
UPDATE vehicle_inspections SET inspector_id = m.user_id FROM contact_user_map m WHERE vehicle_inspections.inspector_id = m.contact_id;

DROP TABLE contact_user_map;


-- ── Step 4: Drop contacts table ────────────────────────────────
DROP TABLE IF EXISTS contacts;
