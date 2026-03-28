import { create } from 'zustand';
import { ROLES, ROLE_MENUS } from '../config/roles';
import authService from '../services/authService';

const TOKEN_KEY = 'axleops-token';
const USER_KEY = 'axleops-user';

const useAuthStore = create((set, get) => ({
  // ─── Auth State ─────────────────────────────────
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  // ─── Role/Menu State (UI concern) ──────────────
  currentRole: null,
  menuItems: [],

  // ─── Login ──────────────────────────────────────
  login: async (username, password) => {
    const response = await authService.login(username, password);
    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({
      token,
      user,
      isAuthenticated: true,
    });

    return user;
  },

  // ─── Logout ─────────────────────────────────────
  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore errors on logout
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      currentRole: null,
      menuItems: [],
    });
  },

  // ─── Validate Session ───────────────────────────
  // Called on app load to check if existing token is still valid
  validateSession: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isAuthenticated: false, token: null, user: null });
      return false;
    }

    try {
      const response = await authService.me();
      const user = response.data;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return true;
    } catch (e) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ isAuthenticated: false, token: null, user: null, currentRole: null, menuItems: [] });
      return false;
    }
  },

  // ─── Set UI Role (menu switching) ───────────────
  // This is a UI concern — switches which menus are shown.
  // The authenticated user stays the same.
  setRole: (roleId) => {
    const role = ROLES[roleId];
    if (!role) return;

    // Override the role user info with the real authenticated user
    const { user } = get();
    const enhancedRole = { ...role };
    if (user) {
      enhancedRole.user = {
        name: `${user.firstName} ${user.lastName}`,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        title: user.title || role.user.title,
      };
    }

    set({
      currentRole: enhancedRole,
      menuItems: ROLE_MENUS[roleId] || [],
    });
  },

  // ─── Clear Role (back to role selector) ─────────
  clearRole: () => set({ currentRole: null, menuItems: [] }),

  // ─── Helpers ────────────────────────────────────
  getToken: () => get().token,
  getUser: () => get().user,
  getRoleUser: () => get().currentRole?.user || null,
}));

export default useAuthStore;
