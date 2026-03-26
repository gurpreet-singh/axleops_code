// ═══════════════════════════════════════════════════════════
// WORK ORDER SERVICE
// Calls: GET /api/v1/work-orders  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import workOrdersJson from '../data/workOrders.json';

export async function getWorkOrders() {
  try {
    const { data } = await api.get('/work-orders');
    return data;
  } catch {
    console.warn('[workOrderService] API unavailable, using local JSON');
    return workOrdersJson;
  }
}

export async function getWorkOrderById(id) {
  try {
    const { data } = await api.get(`/work-orders/${id}`);
    return data;
  } catch {
    return workOrdersJson.find(w => w.id === id) || null;
  }
}

export async function createWorkOrder(payload) {
  const { data } = await api.post('/work-orders', payload);
  return data;
}
