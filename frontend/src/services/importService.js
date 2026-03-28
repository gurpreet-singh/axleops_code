import api from './api';

const importService = {
  // ─── Entity Metadata ─────────────────────────────
  getEntities: () => api.get('/import/entities'),
  getFields: (entityName) => api.get(`/import/entities/${entityName}/fields`),
  downloadSampleCsv: (entityName) =>
    api.get(`/import/entities/${entityName}/sample-csv`, { responseType: 'blob' }),

  // ─── File Upload ─────────────────────────────────
  uploadFile: (file, entityName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityName', entityName);
    return api.post('/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },

  // ─── Column Mapping ──────────────────────────────
  autoMap: (sessionId) => api.post(`/import/${sessionId}/auto-map`),
  applyMapping: (sessionId, mappings) =>
    api.post(`/import/${sessionId}/map`, { mappings }),

  // ─── Inline Edit ─────────────────────────────────
  editRow: (sessionId, rowIndex, updates) =>
    api.put(`/import/${sessionId}/rows/${rowIndex}`, updates),

  // ─── Export ──────────────────────────────────────
  exportErrors: (sessionId) =>
    api.get(`/import/${sessionId}/export-errors`, { responseType: 'blob' }),
  exportDuplicates: (sessionId) =>
    api.get(`/import/${sessionId}/export-duplicates`, { responseType: 'blob' }),

  // ─── Execute Import ──────────────────────────────
  executeImport: (sessionId, duplicateStrategy = 'SKIP') =>
    api.post(`/import/${sessionId}/execute`, { duplicateStrategy }),
  getStatus: (sessionId) => api.get(`/import/${sessionId}/status`),

  // ─── Mapping Templates ──────────────────────────
  getTemplates: (entityName) =>
    api.get('/import/mapping-templates', { params: { entityName } }),
  saveTemplate: (data) => api.post('/import/mapping-templates', data),
  updateTemplate: (templateId, data) =>
    api.put(`/import/mapping-templates/${templateId}`, data),
  deleteTemplate: (templateId) =>
    api.delete(`/import/mapping-templates/${templateId}`),
  detectTemplate: (sessionId) =>
    api.post(`/import/${sessionId}/detect-template`),
};

export default importService;
