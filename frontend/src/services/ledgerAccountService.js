import api from './api';

const ledgerAccountService = {
  getAll: () => api.get('/ledger-accounts').then(r => r.data).catch(() => []),
  getActive: () => api.get('/ledger-accounts/active').then(r => r.data).catch(() => []),
  getById: (id) => api.get(`/ledger-accounts/${id}`).then(r => r.data),
  getByCompany: (companyId) => api.get(`/ledger-accounts/by-company/${companyId}`).then(r => r.data).catch(() => []),
  create: (data) => api.post('/ledger-accounts', data),
  update: (id, data) => api.put(`/ledger-accounts/${id}`, data),
  delete: (id) => api.delete(`/ledger-accounts/${id}`),
};

export default ledgerAccountService;
