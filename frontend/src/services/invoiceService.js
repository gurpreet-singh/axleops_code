// ═══════════════════════════════════════════════════════════
// INVOICE / BILLING SERVICE
// Calls: GET /api/v1/invoices  — falls back to local JSON
// ═══════════════════════════════════════════════════════════
import api from './api';
import invoicesJson from '../data/invoices.json';

export async function getInvoices() {
  try {
    const { data } = await api.get('/invoices');
    return data;
  } catch {
    console.warn('[invoiceService] API unavailable, using local JSON');
    return invoicesJson;
  }
}

export async function getInvoiceById(id) {
  try {
    const { data } = await api.get(`/invoices/${id}`);
    return data;
  } catch {
    return invoicesJson.find(i => i.id === id) || null;
  }
}

export async function createInvoice(payload) {
  const { data } = await api.post('/invoices', payload);
  return data;
}
