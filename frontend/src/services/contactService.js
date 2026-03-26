// ═══════════════════════════════════════════════════════════
// CONTACT SERVICE
// Calls: GET /api/v1/contacts  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import contactsJson from '../data/contacts.json';

export async function getContacts() {
  try {
    const { data } = await api.get('/contacts');
    return data;
  } catch {
    console.warn('[contactService] API unavailable, using local JSON');
    return contactsJson;
  }
}

export async function getDrivers() {
  try {
    const { data } = await api.get('/contacts', { params: { type: 'Driver' } });
    return data;
  } catch {
    return contactsJson.filter(c => c.type === 'Driver');
  }
}

export async function getContactById(id) {
  try {
    const { data } = await api.get(`/contacts/${id}`);
    return data;
  } catch {
    return contactsJson.find(c => c.id === id) || null;
  }
}
