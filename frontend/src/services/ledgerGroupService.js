import api from './api';

const ledgerGroupService = {
  getAll: () => api.get('/accounting/ledgers').then(r => r.data).catch(() => []),
  // Dedicated ledger group endpoints
  getAllGroups: () => api.get('/ledger-groups').catch(() => ({ data: [] })),
  create: (data) => api.post('/ledger-groups', data),
  update: (id, data) => api.put(`/ledger-groups/${id}`, data),
  delete: (id) => api.delete(`/ledger-groups/${id}`),
};

// Helper constants
export const GROUP_NATURES = [
  { value: '', label: 'Select nature' },
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
];

export const ACCOUNT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'PARTY_GENERAL', label: 'Party General' },
  { value: 'BANK', label: 'Bank' },
  { value: 'DRIVER_CASH', label: 'Driver Cash' },
  { value: 'GENERAL', label: 'General' },
];

export const NATURE_COLORS = {
  ASSET:     { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  LIABILITY: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  INCOME:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  EXPENSE:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
};

export default ledgerGroupService;
