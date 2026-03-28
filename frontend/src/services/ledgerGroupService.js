import api from './api';

const ledgerGroupService = {
  getAll: () => api.get('/accounting/ledgers').then(r => r.data).catch(() => []),
  // Dedicated ledger group endpoints
  getAllGroups: () => api.get('/ledger-groups').catch(() => ({ data: [] })),
  create: (data) => api.post('/ledger-groups', data),
  update: (id, data) => api.put(`/ledger-groups/${id}`, data),
  delete: (id) => api.delete(`/ledger-groups/${id}`),
};

export default ledgerGroupService;
