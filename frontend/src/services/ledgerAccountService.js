import api from './api';

const ledgerAccountService = {
  getAll: () => api.get('/ledger-accounts').then(r => r.data).catch(() => []),
  getActive: () => api.get('/ledger-accounts/active').then(r => r.data).catch(() => []),
  getById: (id) => api.get(`/ledger-accounts/${id}`).then(r => r.data),
  getByCompany: (companyId) => api.get(`/ledger-accounts/by-company/${companyId}`).then(r => r.data).catch(() => []),
  getFuelVendors: () => api.get('/ledger-accounts/fuel-vendors').then(r => r.data).catch(() => []),
  create: (data) => api.post('/ledger-accounts', data),
  update: (id, data) => api.put(`/ledger-accounts/${id}`, data),
  delete: (id) => api.delete(`/ledger-accounts/${id}`),
};

// For use in dropdowns
export const ACCOUNT_TYPE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: 'PARTY_ROUTE', label: 'Party Route' },
  { value: 'PARTY_GENERAL', label: 'Party General' },
  { value: 'BANK', label: 'Bank' },
  { value: 'DRIVER_CASH', label: 'Driver Cash' },
  { value: 'GENERAL', label: 'General' },
];

export const TCS_OPTIONS = [
  { value: '', label: 'Not Applicable' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
  { value: 'TCS_ON_SALE', label: 'TCS on Sale' },
  { value: 'TCS_ON_PURCHASE', label: 'TCS on Purchase' },
];

export const ACCOUNT_TYPE_COLORS = {
  PARTY_ROUTE:   { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  PARTY_GENERAL: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  BANK:          { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  DRIVER_CASH:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  GENERAL:       { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
};

export default ledgerAccountService;
