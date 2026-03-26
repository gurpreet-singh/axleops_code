// ═══════════════════════════════════════════════════════════
// PURCHASE ORDER SERVICE
// Calls: GET /api/v1/purchase-orders  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import poJson from '../data/purchaseOrders.json';

export async function getPurchaseOrders() {
  try {
    const { data } = await api.get('/purchase-orders');
    return data;
  } catch {
    console.warn('[purchaseOrderService] API unavailable, using local JSON');
    return poJson;
  }
}

export async function getPurchaseOrderById(id) {
  try {
    const { data } = await api.get(`/purchase-orders/${id}`);
    return data;
  } catch {
    return poJson.find(p => p.id === id) || null;
  }
}

export async function createPurchaseOrder(payload) {
  const { data } = await api.post('/purchase-orders', payload);
  return data;
}
