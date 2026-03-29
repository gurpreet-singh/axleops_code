import { useState, useEffect, useMemo } from 'react';
import { getRoutes } from '../../services/routeService';
import useSliderStore from '../../stores/sliderStore';
import { RouteCreateContent, RouteDetailContent } from './RouteSliderContent';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [vtF, setVtF] = useState('all');
  const { openSlider } = useSliderStore();

  const refresh = () => getRoutes().then(setRoutes);
  useEffect(() => { refresh(); }, []);

  const vTypes = useMemo(() => [...new Set(routes.map(r => r.vType).filter(v => v && v !== '—'))].sort(), [routes]);

  const filtered = useMemo(() => {
    return routes.filter(r =>
      (vtF === 'all' || r.vType === vtF) &&
      (!search ||
        (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.ledgerAccountName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.route || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.origin || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.dest || r.destination || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [routes, search, vtF]);

  const openNewRoute = () => openSlider({
    title: 'Add New Route',
    subtitle: 'Define a new route',
    content: <RouteCreateContent onSave={refresh} />,
    width: '52vw',
  });

  const openDetail = (rt) => openSlider({
    title: rt.name || rt.route,
    subtitle: `${rt.ledgerAccountName || '—'} • ${rt.vType || '—'}`,
    content: <RouteDetailContent rt={rt} onSave={refresh} />,
    width: '52vw',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Route Management</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary" onClick={openNewRoute}><i className="fas fa-plus"></i> Add Route</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="ax-filter-bar">
        <select className="ax-filter-select" value={vtF} onChange={e => setVtF(e.target.value)}>
          <option value="all">All Vehicles</option>
          {vTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <div style={{ flex: 1 }}></div>
        <span className="ax-filter-count">{filtered.length} of {routes.length} routes</span>
        <input className="ax-filter-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search routes..." />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'auto' }}>
        <div style={{ minWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 80px 90px 90px 90px 90px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <span>Route Name</span>
            <span>Ledger Account</span>
            <span style={{ textAlign: 'right' }}>Dist.</span>
            <span style={{ textAlign: 'right' }}>Driver</span>
            <span style={{ textAlign: 'right' }}>Toll</span>
            <span style={{ textAlign: 'right' }}>Diesel</span>
            <span style={{ textAlign: 'right' }}>Freight</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}><div style={{ fontSize: 28, marginBottom: 8 }}>📭</div><div style={{ fontSize: 13, fontWeight: 600 }}>No routes found</div></div>
          ) : filtered.map(rt => {
            return (
              <div key={rt.id} onClick={() => openDetail(rt)}
                style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 80px 90px 90px 90px 90px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{rt.name || '—'}</div>
                  {rt.via && <div style={{ fontSize: 11, color: '#94A3B8' }}>{rt.via}</div>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{rt.ledgerAccountName || '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{rt.dist ? rt.dist.toLocaleString() + ' km' : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{rt.driverExpense ? INR(rt.driverExpense) : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{rt.toll ? INR(rt.toll) : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{rt.diesel ? rt.diesel.toLocaleString() + ' L' : '—'}</div>
                <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{rt.freightRate ? INR(rt.freightRate) : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
