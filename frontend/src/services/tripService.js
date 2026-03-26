// ═══════════════════════════════════════════════════════════
// TRIP SERVICE
// Calls: GET /api/v1/trips  — falls back to local JSON
// Normalizes API response fields to match frontend expectations
// ═══════════════════════════════════════════════════════════
import api from './api';
import tripsJson from '../data/trips.json';

export const TRIP_STATE_COLORS = {
  CREATED:       { mid: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6', border: '#DDD6FE', light: '#FAFAFE' },
  Created:       { mid: '#F5F3FF', text: '#7C3AED', dot: '#8B5CF6', border: '#DDD6FE', light: '#FAFAFE' },
  IN_TRANSIT:    { mid: '#ECFDF5', text: '#059669', dot: '#10B981', border: '#A7F3D0', light: '#F0FDF4' },
  'In Transit':  { mid: '#ECFDF5', text: '#059669', dot: '#10B981', border: '#A7F3D0', light: '#F0FDF4' },
  COMPLETED:     { mid: '#FFF7ED', text: '#C2410C', dot: '#F97316', border: '#FED7AA', light: '#FFFBEB' },
  Completed:     { mid: '#FFF7ED', text: '#C2410C', dot: '#F97316', border: '#FED7AA', light: '#FFFBEB' },
  SETTLED:       { mid: '#FEF3C7', text: '#92400E', dot: '#D97706', border: '#FDE68A', light: '#FFFBEB' },
  Settled:       { mid: '#FEF3C7', text: '#92400E', dot: '#D97706', border: '#FDE68A', light: '#FFFBEB' },
};

/** Normalize API response to match frontend field names */
function normalizeTrip(t) {
  return {
    ...t,
    lr: t.lrNumber || t.lr,
    client: t.clientName || t.client,
    vehicle: t.vehicleRegistration || t.vehicle,
    driver: t.driverName || t.driver,
    freight: t.revenue || t.freight || 0,
    startDate: t.scheduledStart || t.startDate,
    eta: t.eta || null,
  };
}

export async function getTrips() {
  try {
    const { data } = await api.get('/trips');
    return data.map(normalizeTrip);
  } catch {
    console.warn('[tripService] API unavailable, using local JSON');
    return tripsJson;
  }
}

export async function getTripById(id) {
  try {
    const { data } = await api.get(`/trips/${id}`);
    return normalizeTrip(data);
  } catch {
    return tripsJson.find(t => t.id === id) || null;
  }
}

export async function createTrip(payload) {
  const { data } = await api.post('/trips', payload);
  return data;
}

export async function updateTrip(id, payload) {
  const { data } = await api.put(`/trips/${id}`, payload);
  return data;
}
