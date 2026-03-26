import { create } from 'zustand';
import { ROLES, ROLE_MENUS } from '../config/roles';

const useAuthStore = create((set, get) => ({
  currentRole: null,
  menuItems: [],

  setRole: (roleId) => {
    const role = ROLES[roleId];
    if (!role) return;
    set({
      currentRole: role,
      menuItems: ROLE_MENUS[roleId] || [],
    });
  },

  clearRole: () => set({ currentRole: null, menuItems: [] }),

  getRoleUser: () => get().currentRole?.user || null,
}));

export default useAuthStore;
