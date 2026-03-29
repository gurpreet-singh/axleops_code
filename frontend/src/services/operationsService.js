// ═══════════════════════════════════════════════════════════
// OPERATIONS SERVICE
// ═══════════════════════════════════════════════════════════
import api from './api';

// ─── Dashboard ──────────────────────────────────────────────
export async function getOperationsDashboard(vehicleId) {
  try { return (await api.get(`/vehicles/${vehicleId}/operations/dashboard`)).data; }
  catch { return { totalTrips: 0, activeTrips: 0, completedTrips: 0, totalFuelCost: 0, avgMileage: 0, documentCount: 0, currentDriver: null }; }
}

// ─── Fuel Entries ───────────────────────────────────────────
export const getFuelEntries = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/fuel-entries`)).data;
export const createFuelEntry = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/fuel-entries`, data)).data;
export const getFuelSummary = async (vehicleId) => {
  try { return (await api.get(`/vehicles/${vehicleId}/fuel-entries/summary`)).data; }
  catch { return { totalLitres: 0, totalCost: 0, avgMileage: 0, thisMonth: 0 }; }
};

// ─── Driver Assignments ─────────────────────────────────────
export const getDriverAssignments = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/driver-assignments`)).data;
export const assignDriver = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/driver-assignments`, data)).data;
export const endDriverAssignment = async (assignmentId) => api.put(`/driver-assignments/${assignmentId}/end`);

// ─── Vehicle Documents ──────────────────────────────────────
export const getVehicleDocuments = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/documents`)).data;
export const createVehicleDocument = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/documents`, data)).data;
export const deleteVehicleDocument = async (docId) => api.delete(`/documents/${docId}`);

// ─── Vehicle Trip History ───────────────────────────────────
export const getVehicleTrips = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/trips`)).data;
