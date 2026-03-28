import api from './api';

const authService = {
  /**
   * POST /auth/login — authenticate and get JWT token + user profile
   */
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  /**
   * POST /auth/logout — invalidate the current session
   */
  logout: () =>
    api.post('/auth/logout'),

  /**
   * GET /auth/me — get the current authenticated user's profile
   */
  me: () =>
    api.get('/auth/me'),

  /**
   * POST /auth/select-role — generate a scoped JWT for a specific role
   * @param {string} roleCode — enum name (e.g. 'FLEET_MANAGER') or 'ALL'
   */
  selectRole: (roleCode) =>
    api.post('/auth/select-role', { roleCode }),
};

export default authService;
