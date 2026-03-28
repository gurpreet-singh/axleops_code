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

  // ─── Select Role (calls backend for scoped JWT) ─
  selectRole: async (roleCode) => {
    try {
      const response = await authService.selectRole(roleCode);
      const { token, user } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({ token, user, isAuthenticated: true });
    } catch (e) {
      console.error('Failed to select role:', e);
    }
  },

  // ─── Set UI Role (menu switching) ───────────────
  // Sets which menu structure is shown based on the role selection.
  // For PLATFORM_ADMIN or tenant roles — uses the ROLES/ROLE_MENUS config.
  setRole: (roleId) => {
    const role = ROLES[roleId];
    if (!role) return;

    // Override role user info with the real authenticated user
    const { user } = get();
    const enhancedRole = { ...role };
    if (user) {
      const firstName = user.firstName || user.fullName?.split(' ')[0] || '';
      const lastName = user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '';
      enhancedRole.user = {
        name: user.fullName || `${firstName} ${lastName}`,
        initials: `${firstName[0] || ''}${lastName[0] || ''}`,
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

  /**
   * Get the user's assigned role codes (e.g. ['OWNER_DIRECTOR', 'SUPER_ADMIN']).
   * Returns the role codes from the backend /me response.
   */
  getUserRoleCodes: () => {
    const user = get().user;
    if (!user?.roles) return [];
    return user.roles.map(r => typeof r === 'string' ? r : r.code);
  },

  /**
   * Check if user has a specific authority.
   */
  hasAuthority: (authority) => {
    const user = get().user;
    return user?.authorities?.includes(authority) || false;
  },

  /**
   * Check if user can see a module (has any authority with the given prefix).
   * e.g. canSeeModule('TRIP_') → true if user has TRIP_CREATE, TRIP_READ, etc.
   */
  canSeeModule: (prefix) => {
    const user = get().user;
    if (!user?.authorities) return false;
    return user.authorities.some(a => a.startsWith(prefix));
  },

  /**
   * Is the current user a platform admin?
   */
  isPlatformAdmin: () => {
    const user = get().user;
    return user?.type === 'PLATFORM';
  },
}));

export default useAuthStore;
