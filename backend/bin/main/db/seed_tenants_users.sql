-- ============================================
-- AxleOps — Clean Seed Script
-- Creates: 1 Tenant, 1 Branch, 1 Platform Admin, 1 Tenant User
-- Run manually:  psql -h localhost -p 5433 -U postgres -d axleops -f seed_tenants_users.sql
-- ============================================

-- ─── 1. Tenant: Gobind Transport ────────────────────────
INSERT INTO tenants (id, name, trade_name, gstin, pan, city, state, status, created_at, updated_at)
VALUES (
    'e9999999-9999-9999-9999-999999999999',
    'Gobind Transport',
    'Gobind Transport',
    '03AABCU9603R1ZM',
    'AABCU9603R',
    'Amritsar',
    'Punjab',
    'ACTIVE',
    NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Branch: Punjab HQ ───────────────────────────────
INSERT INTO branches (id, tenant_id, code, name, city, state, is_headquarters, is_active, created_at, updated_at)
VALUES (
    'b9999999-9999-9999-9999-999999999999',
    'e9999999-9999-9999-9999-999999999999',
    'HQ',
    'Punjab HQ',
    'Amritsar',
    'Punjab',
    TRUE,
    TRUE,
    NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Platform Admin ─────────────────────────────────
-- Login: platform_admin / platform_admin
INSERT INTO platform_admins (id, first_name, last_name, email, password, title, access_level, is_active, created_at, updated_at)
VALUES (
    'a0000001-0000-4000-a000-000000000001',
    'Platform',
    'Admin',
    'platform_admin',
    'platform_admin',
    'Platform Administrator',
    'PLATFORM_ADMIN',
    TRUE,
    NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ─── 4. Tenant User: Gurpreet Singh (Owner/Director) ───
-- Login: gurpreet_gt / gurpreet_gt
INSERT INTO users (id, tenant_id, first_name, last_name, email, password, title, phone, branch_id, is_active, created_at, updated_at)
VALUES (
    'ae999999-9999-9999-9999-999999999999',
    'e9999999-9999-9999-9999-999999999999',
    'Gurpreet',
    'Singh',
    'gurpreet_gt',
    'gurpreet_gt',
    'Managing Director',
    NULL,
    'b9999999-9999-9999-9999-999999999999',
    TRUE,
    NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. Assign OWNER_DIRECTOR role to Gurpreet ─────────
INSERT INTO tenant_user_role (user_id, role)
VALUES ('ae999999-9999-9999-9999-999999999999', 'OWNER_DIRECTOR')
ON CONFLICT DO NOTHING;

-- ─── 6. Update existing vehicles to this tenant ────────
-- (Ensures CSV-imported vehicles are visible to the tenant user)
UPDATE vehicles SET tenant_id = 'e9999999-9999-9999-9999-999999999999'
WHERE tenant_id IS NULL OR tenant_id = 'e9999999-9999-9999-9999-999999999999';

-- ============================================
-- VERIFICATION QUERIES (uncomment to check)
-- ============================================
-- SELECT id, name, status FROM tenants;
-- SELECT id, name, tenant_id FROM branches;
-- SELECT id, email, access_level FROM platform_admins;
-- SELECT id, email, tenant_id, is_active FROM users;
-- SELECT * FROM tenant_user_role;
-- SELECT COUNT(*) AS vehicle_count FROM vehicles WHERE tenant_id = 'e9999999-9999-9999-9999-999999999999';
