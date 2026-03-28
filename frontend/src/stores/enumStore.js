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
  enums: {},           // { accountSubType: [{key, labelKey, defaultLabel}], ... }
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
   *  e.g. getOptions('accountSubType')
   *  → [{ value: 'PARTY', label: 'Party' }, ...]
   */
  getOptions: (group) => {
    const items = get().enums[group] || [];
    return items.map(e => ({ value: e.key, label: e.defaultLabel }));
  },

  /**
   * Same as getOptions but prepends a placeholder option.
   *  e.g. getOptionsWithPlaceholder('accountSubType', 'Select type')
   *  → [{ value: '', label: 'Select type' }, { value: 'PARTY', label: 'Party' }, ...]
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
   *  e.g. getLabel('accountSubType', 'PARTY') → 'Party'
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

export const ACCOUNT_SUB_TYPE_COLORS = {
  PARTY:        { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  BANK:         { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  CASH:         { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  DUTIES_TAXES: { bg: '#FFF1F2', color: '#E11D48', border: '#FECDD3' },
  GENERAL:      { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
};

export const NATURE_COLORS = {
  ASSET:     { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  LIABILITY: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  INCOME:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  EXPENSE:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
};
