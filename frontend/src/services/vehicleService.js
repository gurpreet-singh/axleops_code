// ═══════════════════════════════════════════════════════════
// VEHICLE SERVICE
// Calls: GET /api/v1/vehicles  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import vehiclesJson from '../data/vehicles.json';

export async function getVehicles() {
  try {
    const { data } = await api.get('/vehicles');
    return data;
  } catch {
    console.warn('[vehicleService] API unavailable, using local JSON');
    return vehiclesJson;
  }
}

export async function getVehicleById(id) {
  try {
    const { data } = await api.get(`/vehicles/${id}`);
    return data;
  } catch {
    return vehiclesJson.find(v => v.id === id) || null;
  }
}

export async function createVehicle(payload) {
  const { data } = await api.post('/vehicles', payload);
  return data;
}
