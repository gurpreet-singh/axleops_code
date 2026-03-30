import api from './api';

/**
 * Generic API service for all master entities.
 * All endpoints use the /masters/{entity} pattern.
 */
const masterService = {
  /** List all master entity types */
  getEntityTypes: () => api.get('/masters/entities'),

  /** Get schema for a specific entity (field definitions for forms) */
  getSchema: (entity) => api.get(`/masters/${entity}/schema`),

  /** List all records for an entity */
  getAll: (entity, search, activeOnly) => {
    const params = {};
    if (search) params.search = search;
    if (activeOnly !== undefined) params.activeOnly = activeOnly;
    return api.get(`/masters/${entity}`, { params });
  },

  /** Get one record by ID */
  getById: (entity, id) => api.get(`/masters/${entity}/${id}`),

  /** Create a new record */
  create: (entity, data) => api.post(`/masters/${entity}`, data),

  /** Update an existing record */
  update: (entity, id, data) => api.put(`/masters/${entity}/${id}`, data),

  /** Deactivate (soft-delete) */
  deactivate: (entity, id) => api.delete(`/masters/${entity}/${id}`),

  /** Reactivate */
  activate: (entity, id) => api.patch(`/masters/${entity}/${id}/activate`),

  /** Dropdown endpoint — minimal id+name */
  dropdown: (entity) => api.get(`/masters/${entity}/dropdown`),
};

export default masterService;
