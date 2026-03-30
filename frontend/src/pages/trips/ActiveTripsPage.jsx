import { useState, useEffect, useMemo } from 'react';
import { getActiveTrips, TRIP_STATE_COLORS } from '../../services/tripService';
import { useSearchParams } from 'react-router-dom';
import useSliderStore from '../../stores/sliderStore';
import { TripCreateContent, TripDetailContent } from './TripSliderContent';

export default function ActiveTripsPage() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const { openSlider } = useSliderStore();

  const load = () => getActiveTrips().then(setTrips).catch(() => []);
  useEffect(() => { load(); }, []);
  useEffect(() => { const s = searchParams.get('status'); if (s) setFilter(s); }, [searchParams]);

  const filtered = useMemo(() => {
    let list = trips;
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.tripNumber || '').toLowerCase().includes(q) ||
        (t.lrNumber || '').toLowerCase().includes(q) ||
        (t.vehicleRegistration || '').toLowerCase().includes(q) ||
        (t.originCity || '').toLowerCase().includes(q) ||
        (t.destinationCity || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [trips, filter, search]);

  const FILTERS = ['all', 'CREATED', 'IN_TRANSIT', 'DELIVERED'];

  const openNewTrip = () => {
    openSlider({
      title: 'New Trip',
      subtitle: 'Create a new trip',
      content: <TripCreateContent onSave={load} />,
      width: '52vw',
    });
  };

  const openTripDetail = (trip) => {
    openSlider({
      title: `Trip ${trip.tripNumber}`,
      subtitle: `${trip.originCity || '?'} → ${trip.destinationCity || '?'}`,
      content: <TripDetailContent tripId={trip.id} onRefresh={load} />,
      width: '52vw',
    });
  };

  const filterLabel = (f) => {
    if (f === 'all') return 'All';
    const sc = TRIP_STATE_COLORS[f];
    return sc?.label || f;
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
      <div className="ax-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E2E8F0', borderRadius: 10, padding: 3 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter === f ? '#1E3A5F' : 'transparent', color: filter === f ? '#fff' : '#475569', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {filterLabel(f)}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }}></div>
        <input className="ax-filter-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search trips..." />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 1.2fr 1fr 110px 90px 60px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Trip No.</span><span>LR No.</span><span>Route</span><span>Vehicle</span><span>Status</span><span>Freight</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No trips found</div>
          </div>
        ) : filtered.map(t => {
          const sc = TRIP_STATE_COLORS[t.status] || {};
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '100px 100px 1.2fr 1fr 110px 90px 60px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              onClick={() => openTripDetail(t)}>
              <div style={{ fontSize: 12, color: '#1E293B', fontFamily: 'monospace', fontWeight: 700 }}>{t.tripNumber}</div>
              <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>{t.lrNumber || '—'}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{t.originCity || '?'} → {t.destinationCity || '?'}</div>
              <div>{t.vehicleRegistration ? <span style={{ fontSize: 12, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{t.vehicleRegistration}</span> : <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700 }}>Unassigned</span>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }}></span>{sc.label || t.status}
                </span>
                {t.reachedDestination && <span style={{ fontSize: 10, background: '#DCFCE7', color: '#16A34A', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>📍</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>₹{(t.freightAmount || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
