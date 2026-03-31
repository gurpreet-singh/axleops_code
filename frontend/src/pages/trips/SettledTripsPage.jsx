import { useState, useEffect, useMemo } from 'react';
import { getTrips, TRIP_STATE_COLORS } from '../../services/tripService';
import useSliderStore from '../../stores/sliderStore';
import { TripDetailContent } from './TripSliderContent';

export default function SettledTripsPage() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const { openSlider } = useSliderStore();

  const load = () => getTrips('SETTLED').then(setTrips).catch(() => []);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return trips;
    const q = search.toLowerCase();
    return trips.filter(t =>
      (t.tripNumber || '').toLowerCase().includes(q) ||
      (t.vehicleRegistration || '').toLowerCase().includes(q) ||
      (t.originCity || '').toLowerCase().includes(q) ||
      (t.destinationCity || '').toLowerCase().includes(q)
    );
  }, [trips, search]);

  const openTripDetail = (trip) => {
    openSlider({
      title: `Trip ${trip.tripNumber}`,
      subtitle: trip.routeName || `${trip.originCity || '?'} → ${trip.destinationCity || '?'}`,
      content: <TripDetailContent tripId={trip.id} onRefresh={load} />,
      width: '52vw',
    });
  };

  const sc = TRIP_STATE_COLORS.SETTLED;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Settled Trips <span className="learn-badge"><i className="fas fa-check-double" style={{ color: '#6366F1' }}></i> Closed</span></h1>
      </div>

      <div className="ax-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }}></span>
            {filtered.length} Settled Trip{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ flex: 1 }}></div>
        <input className="ax-filter-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search settled trips..." />
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1.2fr 1fr 100px 100px 100px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Trip No.</span><span>Route</span><span>Vehicle</span><span>Freight</span><span>Expenses</span><span>Profit</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No settled trips found</div>
          </div>
        ) : filtered.map(t => {
          const profit = (t.freightAmount || 0) - (t.totalExpenses || 0);
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '100px 1.2fr 1fr 100px 100px 100px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              onClick={() => openTripDetail(t)}>
              <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#1E293B' }}>{t.tripNumber}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{t.originCity || '?'} → {t.destinationCity || '?'}</div>
              <div>{t.vehicleRegistration ? <span style={{ fontSize: 12, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{t.vehicleRegistration}</span> : '—'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>₹{(t.freightAmount || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>₹{(t.totalExpenses || 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: profit >= 0 ? '#16A34A' : '#DC2626' }}>₹{profit.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
