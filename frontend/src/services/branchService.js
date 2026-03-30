import api from './api';

const branchService = {
  /**
   * GET /branches — list all active branches for the current tenant
   */
  getAll: () => api.get('/branches'),

  /**
   * GET /branches/:id — get a single branch by ID
   */
  getById: (id) => api.get(`/branches/${id}`),

  /**
   * GET /branches/count — get active branch count
   */
  getCount: () => api.get('/branches/count'),

  /**
   * POST /branches — create a new branch
   */
  create: (data) => api.post('/branches', data),

  /**
   * PUT /branches/:id — update an existing branch
   */
  update: (id, data) => api.put(`/branches/${id}`, data),

  /**
   * DELETE /branches/:id — deactivate a branch (soft delete)
   */
  deactivate: (id) => api.delete(`/branches/${id}`),
};

export default branchService;
