import { useState, useEffect, useMemo } from 'react';
import { getRoutes, ROUTE_STATUS_COLORS, TEMPLATE_COLORS } from '../../services/routeService';
import useSliderStore from '../../stores/sliderStore';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [clientF, setClientF] = useState('all');
  const [vtF, setVtF] = useState('all');
  const { openSlider } = useSliderStore();

  useEffect(() => { getRoutes().then(setRoutes); }, []);

  const clients = useMemo(() => [...new Set(routes.map(r => r.client))].sort(), [routes]);
  const vTypes = useMemo(() => [...new Set(routes.map(r => r.vType))].sort(), [routes]);

  const filtered = useMemo(() => {
    return routes.filter(r =>
      (clientF === 'all' || r.client === clientF) &&
      (vtF === 'all' || r.vType === vtF) &&
      (!search || r.route.toLowerCase().includes(search.toLowerCase()) || r.client.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))
    );
  }, [routes, search, clientF, vtF]);

  const openDetail = (rt) => openSlider({
    title: `${rt.route} — ${rt.client}`,
    content: <RouteDetail rt={rt} />,
    width: '50vw',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Route Management</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary"><i className="fas fa-plus"></i> Add Route</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select value={clientF} onChange={e => setClientF(e.target.value)} style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={vtF} onChange={e => setVtF(e.target.value)} style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="all">All Vehicles</option>
          {vTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{filtered.length} of {routes.length} routes</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search routes..." style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', width: 240, fontFamily: 'inherit' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr 80px 90px 100px 60px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Client</span><span>Route</span><span>Vehicle</span><span>Template</span><span style={{ textAlign: 'right' }}>Dist.</span><span style={{ textAlign: 'right' }}>Toll</span><span>Status</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}><div style={{ fontSize: 28, marginBottom: 8 }}>📭</div><div style={{ fontSize: 13, fontWeight: 600 }}>No routes found</div></div>
        ) : filtered.map(rt => {
          const sc = ROUTE_STATUS_COLORS[rt.status] || ROUTE_STATUS_COLORS.Draft;
          const tc = TEMPLATE_COLORS[rt.template] || { bg: '#F1F5F9', color: '#475569' };
          return (
            <div key={rt.id} onClick={() => openDetail(rt)}
              style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr 0.8fr 80px 90px 100px 60px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{rt.client}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{rt.route}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{rt.via}</div>
              </div>
              <div><span style={{ fontSize: 12, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{rt.vType}</span></div>
              <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}30`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>{rt.template}</span></div>
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{rt.dist.toLocaleString()} km</div>
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{INR(rt.toll)}</div>
              <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }}></span>{rt.status}</span></div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RouteDetail({ rt }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ border: '1.5px solid #BAE6FD', borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ background: '#F0F9FF', padding: '10px 14px', borderBottom: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🛣️</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Route Details</span>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Client', rt.client], ['Vehicle Type', rt.vType], ['Origin', rt.origin], ['Origin Pin', rt.originPin], ['Destination', rt.dest], ['Dest Pin', rt.destPin], ['Via Highway', rt.via], ['Distance', `${rt.dist.toLocaleString()} km`], ['Est. Duration', `${rt.estTime} hrs`], ['Branch', rt.branch]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{l}</div>
                <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: '1.5px solid #C4B5FD', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ background: '#F5F3FF', padding: '10px 14px', borderBottom: '1px solid #C4B5FD', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>📝</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Route Contract</span>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Billing Type', rt.billingType], ['SLA', `${rt.slaHrs} hrs`], ['Payment Terms', rt.payTerms], ['Trips MTD', `${rt.tripsMtd} / ${rt.trips}`], ['On-Time %', rt.onTime ? `${rt.onTime}%` : '—'], ['Avg Margin', rt.avgMargin ? `${rt.avgMargin}%` : '—']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{l}</div>
                <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
