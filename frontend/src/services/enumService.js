import api from './api';

/**
 * Fetches all enum types from the backend in a single call.
 * Returns a map of enumGroup → [{ key, labelKey, defaultLabel }]
 *
 * This is the ONLY source of truth for dropdown options.
 * No hardcoded option arrays should exist elsewhere.
 */
const enumService = {
  getAll: () => api.get('/enums').then(r => r.data),
};

export default enumService;
