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
};

export default authService;
