// ═══════════════════════════════════════════════════════════
// PARTS / INVENTORY SERVICE
// Calls: GET /api/v1/parts  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import partsJson from '../data/parts.json';

export async function getParts() {
  try {
    const { data } = await api.get('/parts');
    return data;
  } catch {
    console.warn('[partsService] API unavailable, using local JSON');
    return partsJson;
  }
}

export async function getPartById(id) {
  try {
    const { data } = await api.get(`/parts/${id}`);
    return data;
  } catch {
    return partsJson.find(p => p.id === id) || null;
  }
}

export async function createPart(payload) {
  const { data } = await api.post('/parts', payload);
  return data;
}
