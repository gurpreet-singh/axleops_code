// ═══════════════════════════════════════════════════════════
// VEHICLE SERVICE
// Full CRUD + search + stats for the Vehicle Management System
// ═══════════════════════════════════════════════════════════
import api from './api';

export async function getVehicles() {
  const { data } = await api.get('/vehicles');
  return data;
}

export async function getVehicleById(id) {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
}

export async function createVehicle(payload) {
  const { data } = await api.post('/vehicles', payload);
  return data;
}

export async function updateVehicle(id, payload) {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data;
}

export async function deleteVehicle(id) {
  await api.delete(`/vehicles/${id}`);
}

export async function searchVehicles(query) {
  const { data } = await api.get(`/vehicles/search?q=${encodeURIComponent(query)}`);
  return data;
}

export async function getVehicleStats() {
  try {
    const { data } = await api.get('/vehicles/stats');
    return data;
  } catch {
    return { total: 0, active: 0, inactive: 0, inMaintenance: 0, sold: 0 };
  }
}
