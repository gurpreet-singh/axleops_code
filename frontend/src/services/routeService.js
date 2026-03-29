// ═══════════════════════════════════════════════════════════
// ROUTE SERVICE
// Full CRUD: GET, POST, PUT, DELETE /api/v1/routes
// ═══════════════════════════════════════════════════════════
import api from './api';
import routesJson from '../data/routes.json';

export const ROUTE_STATUS_COLORS = {
  ACTIVE:  { mid: '#D1FAE5', text: '#065F46', dot: '#10B981', border: '#6EE7B7' },
  Active:  { mid: '#D1FAE5', text: '#065F46', dot: '#10B981', border: '#6EE7B7' },
  'Ad-hoc': { mid: '#FEF3C7', text: '#92400E', dot: '#D97706', border: '#FCD34D' },
  AD_HOC:  { mid: '#FEF3C7', text: '#92400E', dot: '#D97706', border: '#FCD34D' },
  Draft:   { mid: '#F1F5F9', text: '#475569', dot: '#94A3B8', border: '#E5E7EB' },
  DRAFT:   { mid: '#F1F5F9', text: '#475569', dot: '#94A3B8', border: '#E5E7EB' },
};

export const TEMPLATE_COLORS = {
  Standard:     { bg: '#EFF8FF', color: '#175CD3' },
  Express:      { bg: '#F0FDF9', color: '#107569' },
  'Heavy Cargo': { bg: '#F4F3FF', color: '#5925DC' },
  Hazmat:       { bg: '#FEF3F2', color: '#B42318' },
};

// Map backend API response fields → frontend field names
function mapApiRoute(r) {
  if (r.route) return r;
  return {
    ...r,
    route: r.name || `${r.origin || ''} → ${r.destination || ''}`,
    dist: r.distanceKm || r.dist || 0,
    estTime: r.estimatedHours || r.estTime || 0,
    toll: r.tollCost || r.toll || 0,
    dest: r.destination || r.dest || '',
    origin: r.origin || '',
    originPin: r.originPin || '',
    destPin: r.destPin || '',
    via: r.via || '',
    ledgerAccountId: r.ledgerAccountId || null,
    ledgerAccountName: r.ledgerAccountName || '—',
    vType: r.vehicleType || r.vType || '—',
    template: r.template || 'Standard',
    branch: r.branch || 'Global',
    billingType: r.billingType || '',
    documentSeries: r.documentSeries || '',
    invoiceTypeId: r.invoiceTypeId || null,
    invoiceTypeName: r.invoiceTypeName || '—',
    annexureTypeId: r.annexureTypeId || null,
    annexureTypeName: r.annexureTypeName || '—',
    // Charge columns
    freightRate: r.freightRate || 0,
    gdsCharges: r.gdsCharges || 0,
    stCharges: r.stCharges || 0,
    insurance: r.insurance || 0,
    loadingCharges: r.loadingCharges || 0,
    unloadingCharges: r.unloadingCharges || 0,
    deliveryCharges: r.deliveryCharges || 0,
    collectionCharges: r.collectionCharges || 0,
    detentionCharges: r.detentionCharges || 0,
    godownCharges: r.godownCharges || 0,
    lrCharges: r.lrCharges || 0,
    otherCharges: r.otherCharges || 0,
    // Operational defaults
    driverExpense: r.driverExpense || 0,
    diesel: r.dieselLitres || r.diesel || 0,
    // Instructions
    loadingInstructions: r.loadingInstructions || '',
    unloadingInstructions: r.unloadingInstructions || '',
    slaHrs: r.slaHours || r.slaHrs || 0,
    payTerms: r.paymentTerms || r.payTerms || '',
    status: r.status || 'Active',
    trips: r.trips || 0,
    tripsMtd: r.tripsMtd || 0,
    onTime: r.onTime || null,
    avgMargin: r.avgMargin || null,
    avgProfit: r.avgProfit || 0,
  };
}

export async function getRoutes() {
  try {
    const { data } = await api.get('/routes');
    return (data || []).map(mapApiRoute);
  } catch {
    console.warn('[routeService] API unavailable, using local JSON');
    return routesJson;
  }
}

export async function getRouteById(id) {
  try {
    const { data } = await api.get(`/routes/${id}`);
    return mapApiRoute(data);
  } catch {
    return routesJson.find(r => r.id === id) || null;
  }
}

export async function createRoute(payload) {
  const { data } = await api.post('/routes', payload);
  return mapApiRoute(data);
}

export async function updateRoute(id, payload) {
  const { data } = await api.put(`/routes/${id}`, payload);
  return mapApiRoute(data);
}

export async function deleteRoute(id) {
  await api.delete(`/routes/${id}`);
}
