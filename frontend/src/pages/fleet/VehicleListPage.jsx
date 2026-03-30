import { useState, useEffect, useMemo } from 'react';
import { getVehicles, getVehicleStats } from '../../services/vehicleService';
import useSliderStore from '../../stores/sliderStore';
import { VehicleCreateContent, VehicleDetailContent } from './VehicleSliderContent';

const STATUS_TABS = ['all', 'active', 'in_maintenance', 'inactive', 'sold'];
const TAB_LABELS = { all: 'All', active: 'Active', in_maintenance: 'In Maintenance', inactive: 'Inactive', sold: 'Sold' };

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { openSlider } = useSliderStore();

  const refresh = async () => {
    setLoading(true);
    try {
      const [vData, sData] = await Promise.all([getVehicles(), getVehicleStats()]);
      setVehicles(vData || []);
      setStats(sData || {});
    } catch (e) {
      console.error('Failed to load vehicles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    let v = vehicles;
    if (tab !== 'all') {
      const statusMap = { active: 'ACTIVE', in_maintenance: 'IN_MAINTENANCE', inactive: 'INACTIVE', sold: 'SOLD' };
      v = v.filter(x => x.status === statusMap[tab]);
    }
    if (search) {
      const q = search.toLowerCase();
      v = v.filter(x =>
        (x.registrationNumber || '').toLowerCase().includes(q) ||
        (x.make || '').toLowerCase().includes(q) ||
        (x.model || '').toLowerCase().includes(q) ||
        (x.chassisNumber || '').toLowerCase().includes(q) ||
        (x.vehicleTypeName || '').toLowerCase().includes(q) ||
        (x.branchName || '').toLowerCase().includes(q)
      );
    }
    return v;
  }, [vehicles, tab, search]);

  const openDetail = (v) => openSlider({
    title: v.registrationNumber,
    subtitle: `${v.make || ''} ${v.model || ''} • ${v.year || ''} • ${v.vehicleTypeName || ''}`,
    content: <VehicleDetailContent vehicle={v} onSave={refresh} />,
    width: '52vw',
  });

  const openCreate = () => openSlider({
    title: 'Add New Vehicle',
    subtitle: 'Register a vehicle in the fleet',
    content: <VehicleCreateContent onSave={refresh} />,
    width: '52vw',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Vehicles</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Add Vehicle</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <StatCard label="Total Vehicles" value={stats.total || 0} icon="fas fa-truck" color="#6366F1" bg="#EEF2FF" />
        <StatCard label="Active" value={stats.active || 0} icon="fas fa-check-circle" color="#16A34A" bg="#F0FDF4" />
        <StatCard label="In Maintenance" value={stats.inMaintenance || 0} icon="fas fa-wrench" color="#D97706" bg="#FFFBEB" />
        <StatCard label="Inactive" value={stats.inactive || 0} icon="fas fa-pause-circle" color="#94A3B8" bg="#F8FAFC" />
        <StatCard label="Sold" value={stats.sold || 0} icon="fas fa-tag" color="#DC2626" bg="#FEF2F2" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {STATUS_TABS.map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
            {t !== 'all' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: tab === t ? '#3B82F6' : '#E2E8F0', color: tab === t ? '#fff' : '#64748B' }}>
              {t === 'active' ? stats.active || 0 : t === 'in_maintenance' ? stats.inMaintenance || 0 : t === 'inactive' ? stats.inactive || 0 : stats.sold || 0}
            </span>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input">
            <i className="fas fa-search" style={{ color: 'var(--text-muted)' }}></i>
            <input type="text" placeholder="Search by reg. no., make, model, chassis..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="pagination-info">{filtered.length} of {vehicles.length} vehicles</div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }}><input type="checkbox" /></th>
                <th>Reg. Number</th>
                <th>Make / Model</th>
                <th>Year</th>
                <th>Type</th>
                <th>Fuel</th>
                <th>Status</th>
                <th>Branch</th>
                <th>Odometer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i> Loading vehicles...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🚛</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>No vehicles found</div>
                </td></tr>
              ) : filtered.map(v => (
                <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(v)}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {v.registrationNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 13 }}>{v.make}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{v.model}</div>
                  </td>
                  <td>{v.year}</td>
                  <td>
                    {v.vehicleTypeName && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: '#EFF6FF', color: '#2563EB' }}>
                        {v.vehicleTypeName}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 12 }}>{v.fuelType}</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td style={{ fontSize: 12, color: '#475569' }}>{v.branchName || '—'}</td>
                  <td style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#475569' }}>
                    {v.odometer ? Number(v.odometer).toLocaleString('en-IN') + ' km' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ─── Helper Components ──────────────────────────────────────────

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="stat-card" style={{ background: bg, borderColor: color + '30' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <i className={icon} style={{ fontSize: 16, color }}></i>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    ACTIVE: { color: '#16A34A', bg: '#F0FDF4', dot: 'green', label: 'Active' },
    INACTIVE: { color: '#94A3B8', bg: '#F8FAFC', dot: 'gray', label: 'Inactive' },
    IN_MAINTENANCE: { color: '#D97706', bg: '#FFFBEB', dot: 'yellow', label: 'In Maint.' },
    SOLD: { color: '#DC2626', bg: '#FEF2F2', dot: 'red', label: 'Sold' },
    SCRAPPED: { color: '#64748B', bg: '#F1F5F9', dot: 'gray', label: 'Scrapped' },
  };
  const c = config[status] || config.INACTIVE;
  return (
    <span className="status-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      <span className={`status-dot ${c.dot}`}></span> {c.label}
    </span>
  );
}

function ExpiryBadge({ date }) {
  if (!date) return <span style={{ fontSize: 11, color: '#CBD5E1' }}>—</span>;
  const d = new Date(date);
  const now = new Date();
  const daysLeft = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;
  const isExpiring = !isExpired && daysLeft < 30;
  const color = isExpired ? '#DC2626' : isExpiring ? '#D97706' : '#16A34A';
  const bg = isExpired ? '#FEF2F2' : isExpiring ? '#FFFBEB' : '#F0FDF4';

  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: bg, color, border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>
      {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
      {isExpired ? ' ⚠' : isExpiring ? ' ⏳' : ' ✓'}
    </span>
  );
}
