// ═══════════════════════════════════════════════════════════
// CLIENT SERVICE
// Calls: GET /api/v1/clients  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import clientsJson from '../data/clients.json';

export async function getClients() {
  try {
    const { data } = await api.get('/clients');
    return data;
  } catch {
    console.warn('[clientService] API unavailable, using local JSON');
    return clientsJson;
  }
}

export async function getClientById(id) {
  try {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  } catch {
    return clientsJson.find(c => c.id === id) || null;
  }
}

export async function createClient(payload) {
  const { data } = await api.post('/clients', payload);
  return data;
}
