// ═══════════════════════════════════════════════════════════
// ROUTE SERVICE
// Calls: GET /api/v1/routes  — falls back to local JSON
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
  // If the record already has 'route' field (local JSON format), return as-is
  if (r.route) return r;
  return {
    ...r,
    route: r.name || `${r.origin} → ${r.destination}`,
    dist: r.distanceKm || r.dist || 0,
    estTime: r.estimatedHours || r.estTime || 0,
    toll: r.tollCost || r.toll || 0,
    dest: r.destination || r.dest || '',
    origin: r.origin || '',
    originPin: r.originPin || '',
    destPin: r.destPin || '',
    via: r.via || '',
    client: r.client || r.clientName || '—',
    vType: r.vType || r.vehicleType || '—',
    template: r.template || 'Standard',
    branch: r.branch || 'Global',
    billingType: r.billingType || '',
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
  return data;
}

export async function deleteRoute(id) {
  await api.delete(`/routes/${id}`);
}
