import { useState, useEffect, useMemo } from 'react';
import { getRoutes, ROUTE_STATUS_COLORS, TEMPLATE_COLORS } from '../../services/routeService';
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
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 0.8fr 80px 90px 100px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Route Name</span><span>Origin → Dest</span><span>Ledger Account</span><span>Vehicle</span><span>Template</span><span style={{ textAlign: 'right' }}>Dist.</span><span style={{ textAlign: 'right' }}>Toll</span><span>Status</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}><div style={{ fontSize: 28, marginBottom: 8 }}>📭</div><div style={{ fontSize: 13, fontWeight: 600 }}>No routes found</div></div>
        ) : filtered.map(rt => {
          const sc = ROUTE_STATUS_COLORS[rt.status] || ROUTE_STATUS_COLORS.Draft;
          const tc = TEMPLATE_COLORS[rt.template] || { bg: '#F1F5F9', color: '#475569' };
          return (
            <div key={rt.id} onClick={() => openDetail(rt)}
              style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 0.8fr 80px 90px 100px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{rt.name || '—'}</div>
                {rt.via && <div style={{ fontSize: 11, color: '#94A3B8' }}>{rt.via}</div>}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                {rt.origin || '—'} → {rt.dest || rt.destination || '—'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{rt.ledgerAccountName || '—'}</div>
              <div><span style={{ fontSize: 12, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{rt.vType || '—'}</span></div>
              <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}30`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>{rt.template}</span></div>
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{rt.dist ? rt.dist.toLocaleString() + ' km' : '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{rt.toll ? INR(rt.toll) : '—'}</div>
              <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }}></span>{rt.status}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
