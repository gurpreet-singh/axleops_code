// ═══════════════════════════════════════════════════════════
// MAINTENANCE & FINANCE SERVICE
// ═══════════════════════════════════════════════════════════
import api from './api';

// ─── Dashboard ──────────────────────────────────────────────
export async function getMaintenanceDashboard(vehicleId) {
  try {
    const { data } = await api.get(`/vehicles/${vehicleId}/maintenance/dashboard`);
    return data;
  } catch { return { overdueTasks: 0, activeTasks: 0, openIssues: 0, totalInspections: 0, totalCost: 0, healthScore: { score: 0 } }; }
}

// ─── Service Tasks ──────────────────────────────────────────
export const getServiceTasks = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/service-tasks`)).data;
export const createServiceTask = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/service-tasks`, data)).data;
export const completeServiceTask = async (taskId) => (await api.put(`/service-tasks/${taskId}/complete`)).data;
export const deleteServiceTask = async (taskId) => api.delete(`/service-tasks/${taskId}`);

// ─── Issues ─────────────────────────────────────────────────
export const getIssues = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/issues`)).data;
export const createIssue = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/issues`, data)).data;
export const updateIssueStatus = async (issueId, status, notes) => (await api.put(`/issues/${issueId}/status`, { status, notes })).data;

// ─── Inspections ────────────────────────────────────────────
export const getInspections = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/inspections`)).data;
export const createInspection = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/inspections`, data)).data;

// ─── Health Score ───────────────────────────────────────────
export const getHealthScore = async (vehicleId) => {
  try { return (await api.get(`/vehicles/${vehicleId}/health-score`)).data; }
  catch { return { score: 0, maintenanceScore: 0, issueScore: 0, inspectionScore: 0, complianceScore: 0 }; }
};
export const computeHealthScore = async (vehicleId) => (await api.post(`/vehicles/${vehicleId}/health-score/compute`)).data;

// ─── Loans ──────────────────────────────────────────────────
export const getLoans = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/loans`)).data;
export const createLoan = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/loans`, data)).data;

// ─── Warranties ─────────────────────────────────────────────
export const getWarranties = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/warranties`)).data;
export const createWarranty = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/warranties`, data)).data;

// ─── Cost Entries ───────────────────────────────────────────
export const getCostEntries = async (vehicleId) => (await api.get(`/vehicles/${vehicleId}/costs`)).data;
export const createCostEntry = async (vehicleId, data) => (await api.post(`/vehicles/${vehicleId}/costs`, data)).data;
export const getCostSummary = async (vehicleId) => {
  try { return (await api.get(`/vehicles/${vehicleId}/costs/summary`)).data; }
  catch { return { totalCost: 0, thisMonth: 0, thisYear: 0 }; }
};
