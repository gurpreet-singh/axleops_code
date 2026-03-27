-- Gobind Transport Tenant
INSERT INTO tenants (id, name, trade_name, gstin, pan, city, state, status) VALUES
('e9999999-9999-9999-9999-999999999999', 'Gobind Transport', 'Gobind Transport', '03AABCU9603R1ZM', 'AABCU9603R', 'Amritsar', 'Punjab', 'ACTIVE');

-- Gobind Transport Branch
INSERT INTO branches (id, tenant_id, name, city, state, is_primary) VALUES
('b9999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'Punjab HQ', 'Amritsar', 'Punjab', TRUE);

-- Gobind Transport Admin User (Password is mocked as 'gurpreet_gt' for auth filter later)
INSERT INTO users (id, tenant_id, first_name, last_name, email, password, role, title, branch_id) VALUES
('ae999999-9999-9999-9999-999999999999', 'e9999999-9999-9999-9999-999999999999', 'Gurpreet', 'Singh', 'gurpreet_gt', 'gurpreet_gt', 'OWNER', 'Managing Director', 'b9999999-9999-9999-9999-999999999999');

-- Assign to branch with role (aa111... is OWNER from V5)
INSERT INTO user_branch_roles (id, user_id, branch_id, role_id, is_primary) VALUES
('cb999999-9999-9999-9999-999999999999', 'ae999999-9999-9999-9999-999999999999', 'b9999999-9999-9999-9999-999999999999', 'aa111111-1111-1111-1111-111111111111', TRUE);