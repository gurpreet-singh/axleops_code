// ═══════════════════════════════════════════════════════════
// USER SERVICE
// Replaces the former contactService — all personnel are now Users
// Calls: GET /api/v1/users
// ═══════════════════════════════════════════════════════════
import api from './api';

export async function getUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function getDrivers() {
  const { data } = await api.get('/users', { params: { role: 'DRIVER' } });
  return data;
}

export async function getUsersByRole(role) {
  const { data } = await api.get('/users', { params: { role } });
  return data;
}

export async function getUserById(id) {
  const { data } = await api.get(`/users/${id}`);
  return data;
}
