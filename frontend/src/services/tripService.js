import api from './api';

// ═══════════════════════════════════════════════════════════
// STATUS COLORS (matches new TripStatus enum)
// ═══════════════════════════════════════════════════════════
export const TRIP_STATE_COLORS = {
  CREATED: {
    mid: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', dot: '#3B82F6',
    bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', label: 'Created',
  },
  IN_TRANSIT: {
    mid: '#FEF3C7', text: '#92400E', border: '#FDE68A', dot: '#F59E0B',
    bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', label: 'In Transit',
  },
  DELIVERED: {
    mid: '#D1FAE5', text: '#065F46', border: '#6EE7B7', dot: '#10B981',
    bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', label: 'Delivered',
  },
  SETTLED: {
    mid: '#E0E7FF', text: '#3730A3', border: '#A5B4FC', dot: '#6366F1',
    bg: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', label: 'Settled',
  },
  CANCELLED: {
    mid: '#FEE2E2', text: '#991B1B', border: '#FECACA', dot: '#EF4444',
    bg: 'linear-gradient(135deg, #FEE2E2, #FECACA)', label: 'Cancelled',
  },
};

// ═══════════════════════════════════════════════════════════
// TRIP CRUD
// ═══════════════════════════════════════════════════════════

export async function getTrips(status) {
  const params = status ? { status } : {};
  const { data } = await api.get('/trips', { params });
  return data;
}

export async function getActiveTrips() {
  const { data } = await api.get('/trips/active');
  return data;
}

export async function getTripCounts() {
  const { data } = await api.get('/trips/counts');
  return data;
}

export async function getTripById(id) {
  const { data } = await api.get(`/trips/${id}`);
  return data;
}

export async function createTrip(request) {
  const { data } = await api.post('/trips', request);
  return data;
}

export async function updateTrip(id, request) {
  const { data } = await api.put(`/trips/${id}`, request);
  return data;
}

export async function deleteTrip(id) {
  await api.delete(`/trips/${id}`);
}

// ═══════════════════════════════════════════════════════════
// STATE MACHINE TRANSITIONS
// ═══════════════════════════════════════════════════════════

export async function startTrip(id, request = {}) {
  const { data } = await api.post(`/trips/${id}/start`, request);
  return data;
}

export async function deliverTrip(id, request = {}) {
  const { data } = await api.post(`/trips/${id}/deliver`, request);
  return data;
}

export async function markReached(id) {
  const { data } = await api.post(`/trips/${id}/mark-reached`);
  return data;
}

export async function settleTrip(id, request = {}) {
  const { data } = await api.post(`/trips/${id}/settle`, request);
  return data;
}

export async function cancelTrip(id, request) {
  const { data } = await api.post(`/trips/${id}/cancel`, request);
  return data;
}

// ═══════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════

export async function getTripExpenses(tripId) {
  const { data } = await api.get(`/trips/${tripId}/expenses`);
  return data;
}

export async function addTripExpense(tripId, request) {
  const { data } = await api.post(`/trips/${tripId}/expenses`, request);
  return data;
}

export async function updateTripExpense(tripId, expenseId, request) {
  const { data } = await api.put(`/trips/${tripId}/expenses/${expenseId}`, request);
  return data;
}

export async function deleteTripExpense(tripId, expenseId) {
  await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
}

// ═══════════════════════════════════════════════════════════
// ADVANCES
// ═══════════════════════════════════════════════════════════

export async function getTripAdvances(tripId) {
  const { data } = await api.get(`/trips/${tripId}/advances`);
  return data;
}

export async function addTripAdvance(tripId, request) {
  const { data } = await api.post(`/trips/${tripId}/advances`, request);
  return data;
}

// ═══════════════════════════════════════════════════════════
// SETTLEMENT
// ═══════════════════════════════════════════════════════════

export async function getSettlementSummary(tripId) {
  const { data } = await api.get(`/trips/${tripId}/settlement-summary`);
  return data;
}

// ═══════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════

export async function getTripDocuments(tripId) {
  const { data } = await api.get(`/trips/${tripId}/documents`);
  return data;
}
