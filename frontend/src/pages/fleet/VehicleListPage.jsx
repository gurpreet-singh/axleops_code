import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles } from '../../services/vehicleService';
import useSliderStore from '../../stores/sliderStore';

const TABS = ['all', 'assigned', 'unassigned', 'archived'];

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { openSlider } = useSliderStore();

  useEffect(() => { getVehicles().then(setVehicles); }, []);

  const filtered = useMemo(() => {
    let v = vehicles;
    if (tab === 'assigned') v = v.filter(x => x.operator);
    else if (tab === 'unassigned') v = v.filter(x => !x.operator);
    else if (tab === 'archived') v = v.filter(x => x.status === 'Archived');
    if (search) {
      const q = search.toLowerCase();
      v = v.filter(x => x.name.toLowerCase().includes(q) || x.make.toLowerCase().includes(q) || x.model.toLowerCase().includes(q) || x.vin.toLowerCase().includes(q));
    }
    return v;
  }, [vehicles, tab, search]);

  const openDetail = (v) => openSlider({ title: v.name, content: <VehicleDetail v={v} />, width: '50vw' });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Vehicles <span className="learn-badge"><i className="fas fa-graduation-cap"></i> Learn</span></h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-ellipsis-h"></i></button>
          <button className="btn btn-primary" onClick={() => navigate('/fleet/new')}><i className="fas fa-plus"></i> Add Vehicle</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{ color: 'var(--text-muted)' }}></i>
            <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-btn"><i className="fas fa-filter"></i> Vehicle Type</div>
          <div className="filter-btn"><i className="fas fa-filter"></i> Status</div>
          <div className="pagination-info">1 - {filtered.length} of {vehicles.length}</div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{width:30}}><input type="checkbox" /></th>
                <th style={{width:40}}></th>
                <th>Name ▲</th>
                <th>Year</th>
                <th>Make</th>
                <th>Model</th>
                <th>VIN / Chassis No.</th>
                <th>Status</th>
                <th>Type</th>
                <th>Group</th>
                <th>Current Meter</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(v)}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td><span className="vehicle-avatar">{v.emoji}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v.name}</td>
                  <td>{v.year}</td>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{v.vin}</td>
                  <td><span className={`status-badge ${v.status === 'Active' ? 'active' : v.status === 'In Shop' ? 'in-shop' : 'critical'}`}>
                    <span className={`status-dot ${v.status === 'Active' ? 'green' : v.status === 'In Shop' ? 'yellow' : 'red'}`}></span> {v.status}
                  </span></td>
                  <td><span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: v.typeBg, color: v.typeColor }}>{v.type}</span></td>
                  <td>{v.group} <span style={{ fontSize: 10 }}>↗</span></td>
                  <td>{v.meter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VehicleDetail({ v }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 48 }}>{v.emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>{v.name}</div>
        <div style={{ fontSize: 13, color: '#64748B' }}>{v.make} {v.model} · {v.year}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[['VIN', v.vin], ['Status', v.status], ['Type', v.type], ['Group', v.group], ['Meter', v.meter], ['Operator', v.operator], ['Fuel Type', v.fuelType]].map(([l, val]) => (
          <div key={l}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{l}</div>
            <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600 }}>{val || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
