// ═══════════════════════════════════════════════════════════
// COMPLIANCE SERVICE
// CRUD + fleet dashboard for the Compliance Engine
// ═══════════════════════════════════════════════════════════
import api from './api';

// ─── Vehicle-Level ──────────────────────────────────────────

export async function getVehicleCompliance(vehicleId, type = null, currentOnly = true) {
  let url = `/vehicles/${vehicleId}/compliance?current=${currentOnly}`;
  if (type) url += `&type=${type}`;
  const { data } = await api.get(url);
  return data;
}

export async function getVehicleComplianceSummary(vehicleId) {
  try {
    const { data } = await api.get(`/vehicles/${vehicleId}/compliance/summary`);
    return data;
  } catch {
    return { active: 0, expiringSoon: 0, expired: 0 };
  }
}

export async function getVersionHistory(vehicleId, documentType) {
  const { data } = await api.get(`/vehicles/${vehicleId}/compliance/history?type=${documentType}`);
  return data;
}

export async function createComplianceDocument(vehicleId, payload) {
  const { data } = await api.post(`/vehicles/${vehicleId}/compliance`, payload);
  return data;
}

// ─── Document-Level ─────────────────────────────────────────

export async function getComplianceDocument(docId) {
  const { data } = await api.get(`/compliance/${docId}`);
  return data;
}

export async function updateComplianceDocument(docId, payload) {
  const { data } = await api.put(`/compliance/${docId}`, payload);
  return data;
}

export async function cancelComplianceDocument(docId) {
  await api.delete(`/compliance/${docId}`);
}

// ─── Fleet-Level ────────────────────────────────────────────

export async function getComplianceDashboard() {
  try {
    const { data } = await api.get('/fleet/compliance-dashboard');
    return data;
  } catch {
    return { totalDocuments: 0, activeDocuments: 0, expiringSoonDocuments: 0, expiredDocuments: 0, byType: {}, expiringNext30Days: [] };
  }
}

export async function getExpiring(days = 30) {
  const { data } = await api.get(`/fleet/expiring?days=${days}`);
  return data;
}
