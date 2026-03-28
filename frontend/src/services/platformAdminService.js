import api from './api';

const BASE = '/platform';

const platformAdminService = {
  // ─── Tenants ─────────────────────────────────────────
  getAllTenants: () => api.get(`${BASE}/tenants`),
  getTenantById: (id) => api.get(`${BASE}/tenants/${id}`),
  createTenant: (data) => api.post(`${BASE}/tenants`, data),

  // ─── Tenant Users ────────────────────────────────────
  getTenantUsers: (tenantId) => api.get(`${BASE}/tenants/${tenantId}/users`),
  addTenantAdmin: (tenantId, data) => api.post(`${BASE}/tenants/${tenantId}/admins`, data),

  // ─── Tenant Branches ─────────────────────────────────
  getTenantBranches: (tenantId) => api.get(`${BASE}/tenants/${tenantId}/branches`),

  // ─── Delete Tenant ──────────────────────────────────
  deleteTenant: (tenantId) => api.delete(`${BASE}/tenants/${tenantId}`),
};

export default platformAdminService;
