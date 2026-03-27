import { useState, useEffect, useMemo } from 'react';
import { getTrips, TRIP_STATE_COLORS } from '../../services/tripService';
import { useSearchParams } from 'react-router-dom';
import useSliderStore from '../../stores/sliderStore';
import { TripCreateContent, TripDetailContent } from './TripSliderContent';

export default function ActiveTripsPage() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const { openSlider } = useSliderStore();

  useEffect(() => { getTrips().then(setTrips); }, []);
  useEffect(() => { const s = searchParams.get('status'); if (s) setFilter(s); }, [searchParams]);

  const filtered = useMemo(() => {
    let active = trips.filter(t => t.status === 'Created' || t.status === 'In Transit' || t.status === 'Completed');
    if (filter !== 'all') active = active.filter(t => t.status === filter);
    if (search) {
      const q = search.toLowerCase();
      active = active.filter(t => t.id.toLowerCase().includes(q) || t.lr.toLowerCase().includes(q) || t.client.toLowerCase().includes(q) || (t.vehicle || '').toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q));
    }
    return active;
  }, [trips, filter, search]);

  const FILTERS = ['all', 'Created', 'In Transit', 'Completed'];

  const openNewTrip = () => {
    openSlider({
      title: 'Add New Trip',
      content: <TripCreateContent onSave={() => getTrips().then(setTrips)} />,
      width: '52vw',
    });
  };

  const openTripDetail = (trip) => {
    openSlider({
      title: `Trip ${trip.id}`,
      content: <TripDetailContent trip={trip} />,
      width: '52vw',
    });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Active Trips <span className="learn-badge"><i className="fas fa-route" style={{ color: '#059669' }}></i> Operations</span></h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openNewTrip}><i className="fas fa-plus"></i> New Trip</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E2E8F0', borderRadius: 10, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? '#1E3A5F' : 'transparent', color: filter === f ? '#fff' : '#475569', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search trips..." style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', width: 240, fontFamily: 'inherit' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 90px 1.2fr 1fr 1fr 100px 80px 60px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Trip ID</span><span>LR No.</span><span>Route</span><span>Client</span><span>Vehicle</span><span>Status</span><span>Freight</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No trips found</div>
          </div>
        ) : filtered.map(t => {
          const sc = TRIP_STATE_COLORS[t.status] || {};
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '90px 90px 1.2fr 1fr 1fr 100px 80px 60px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              onClick={() => openTripDetail(t)}>
              <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{t.id}</div>
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{t.lr}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{t.origin} → {t.destination}</div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{t.client}</div>
              <div>{t.vehicle ? <span style={{ fontSize: 12, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{t.vehicle}</span> : <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700 }}>Unassigned</span>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }}></span>{t.status}
                </span>
                {t.delayed && <span style={{ fontSize: 10, background: '#FEE2E2', color: '#991B1B', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>⚠</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>₹{(t.freight || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
