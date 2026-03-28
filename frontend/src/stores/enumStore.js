import { create } from 'zustand';
import enumService from '../services/enumService';

/**
 * Global enum store — fetched once on app load, used by every dropdown.
 *
 * Architecture notes:
 *  - Backend serves i18n-ready data: { key, labelKey, defaultLabel }
 *  - `getOptions(group)` returns [ { value, label } ] for <select> / dropdown use
 *  - `getOptionsWithPlaceholder(group, placeholder)` adds a blank "Select..." option
 *  - When i18n is wired (react-intl / i18next), swap `defaultLabel` for `intl.formatMessage({ id: labelKey })`
 *  - Color maps remain in the frontend since they are purely presentational
 */
const useEnumStore = create((set, get) => ({
  // ── state ─────────────────────────────────────────────────
  enums: {},           // { ledgerAccountType: [{key, labelKey, defaultLabel}], ... }
  loaded: false,
  loading: false,

  // ── actions ───────────────────────────────────────────────

  /** Fetch all enums from backend (call once on app load) */
  fetchEnums: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const data = await enumService.getAll();
      set({ enums: data, loaded: true, loading: false });
    } catch (err) {
      console.error('Failed to load enums:', err);
      set({ loading: false });
    }
  },

  // ── selectors ─────────────────────────────────────────────

  /**
   * Returns dropdown options for a given enum group.
   *  e.g. getOptions('ledgerAccountType')
   *  → [{ value: 'CLIENT', label: 'Client' }, ...]
   */
  getOptions: (group) => {
    const items = get().enums[group] || [];
    return items.map(e => ({ value: e.key, label: e.defaultLabel }));
  },

  /**
   * Same as getOptions but prepends a placeholder option.
   *  e.g. getOptionsWithPlaceholder('ledgerAccountType', 'Select type')
   *  → [{ value: '', label: 'Select type' }, { value: 'CLIENT', label: 'Client' }, ...]
   */
  getOptionsWithPlaceholder: (group, placeholder = 'Select...') => {
    const items = get().enums[group] || [];
    return [
      { value: '', label: placeholder },
      ...items.map(e => ({ value: e.key, label: e.defaultLabel })),
    ];
  },

  /**
   * Returns the defaultLabel for a given enum key.
   *  e.g. getLabel('ledgerAccountType', 'CLIENT') → 'Client'
   */
  getLabel: (group, key) => {
    const items = get().enums[group] || [];
    const found = items.find(e => e.key === key);
    return found?.defaultLabel || key?.replace(/_/g, ' ') || '—';
  },
}));

export default useEnumStore;

// ═══════════════════════════════════════════════════════════════
// PRESENTATIONAL COLOR MAPS (frontend-only, not from backend)
// These are purely for badge/chip styling and belong in the UI.
// ═══════════════════════════════════════════════════════════════

// Party types → green family
// Vendor/Fuel Pump → orange/amber family
// Financial accounts → purple family
// P&L heads → slate/neutral family
const PARTY_TYPES = ['CLIENT', 'VENDOR', 'FUEL_PUMP'];
const FINANCIAL_TYPES = ['BANK_ACCOUNT', 'CASH_ACCOUNT', 'FUEL_CARD', 'FASTAG_ACCOUNT', 'CORPORATE_EXPENSE_CARD'];
const STATUTORY_TYPES = ['TAX_DUTY', 'CAPITAL_ACCOUNT', 'INTERNAL_TRANSFER'];
const PL_TYPES = ['EXPENSE', 'INCOME', 'FIXED_ASSET'];

const COLOR_FAMILIES = {
  party:     { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  financial: { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  statutory: { bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3' },
  pl:        { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  fallback:  { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
};

export function getAccountTypeColor(type) {
  if (PARTY_TYPES.includes(type)) return COLOR_FAMILIES.party;
  if (FINANCIAL_TYPES.includes(type)) return COLOR_FAMILIES.financial;
  if (STATUTORY_TYPES.includes(type)) return COLOR_FAMILIES.statutory;
  if (PL_TYPES.includes(type)) return COLOR_FAMILIES.pl;
  return COLOR_FAMILIES.fallback;
}

/** Which account types should show the Party Data form sections */
export function isPartyAccountType(type) {
  return PARTY_TYPES.includes(type);
}

// Legacy export for backward compat (deprecated — use getAccountTypeColor instead)
export const ACCOUNT_SUB_TYPE_COLORS = new Proxy({}, {
  get: (_target, prop) => getAccountTypeColor(prop),
});

export const NATURE_COLORS = {
  ASSET:     { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  LIABILITY: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  INCOME:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  EXPENSE:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
};
