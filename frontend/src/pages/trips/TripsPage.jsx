import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, TRIP_STATE_COLORS } from '../../services/tripService';
import useSliderStore from '../../stores/sliderStore';

const STATUS_META = [
  { key: 'Created', icon: '📝', label: 'Created', sub: 'Assign vehicle + driver', color: '#7C3AED' },
  { key: 'In Transit', icon: '🚛', label: 'In Transit', sub: 'Tracking', color: '#0EA5E9' },
  { key: 'Completed', icon: '✅', label: 'Completed', sub: 'POD + delivery done', color: '#10B981' },
  { key: 'Settled', icon: '🔒', label: 'Settled', sub: 'Revenue locked', color: '#D97706' },
];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { openSlider } = useSliderStore();

  useEffect(() => { getTrips().then(setTrips); }, []);

  const activeTrips = useMemo(() =>
    trips.filter(t => t.status !== 'Settled'), [trips]);

  const filtered = useMemo(() => {
    if (!search) return activeTrips;
    const q = search.toLowerCase();
    return activeTrips.filter(t =>
      t.id.toLowerCase().includes(q) || t.lr.toLowerCase().includes(q) ||
      t.client.toLowerCase().includes(q) || t.origin.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) || (t.vehicle || '').toLowerCase().includes(q)
    );
  }, [activeTrips, search]);

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_META.forEach(s => { counts[s.key] = trips.filter(t => t.status === s.key).length; });
    return counts;
  }, [trips]);

  const openTripDetail = (trip) => {
    openSlider({
      title: `Trip ${trip.id}`,
      content: <TripDetailContent trip={trip} />,
      width: '50vw',
    });
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <h1>Trip Dashboard <span className="learn-badge"><i className="fas fa-route" style={{ color: '#059669' }}></i> TMS</span></h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/trips/create')}>
            <i className="fas fa-plus"></i> New Trip
          </button>
        </div>
      </div>

      {/* Lifecycle Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.8 }}>Trip Lifecycle</div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#A7F3D0,transparent)' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {STATUS_META.map(sm => {
          const sc = TRIP_STATE_COLORS[sm.key] || {};
          return (
            <button key={sm.key} onClick={() => navigate(`/trips/active?status=${sm.key}`)}
              style={{ background: sc.light || '#F8FAFC', border: `2px solid ${sc.border || '#E2E8F0'}`, borderRadius: 16, padding: '18px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', display: 'block' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{sm.icon}</span>
                <span style={{ fontSize: 26, fontWeight: 800, color: sm.color }}>{statusCounts[sm.key] || 0}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{sm.label}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{sm.sub}</div>
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: sm.color }}>View trips →</div>
            </button>
          );
        })}
      </div>

      {/* Trip Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1E293B' }}>All Active Trips</div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search..." style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '7px 12px', fontSize: 12, color: '#1E293B', outline: 'none', width: 200, fontFamily: 'inherit' }} />
        </div>
        {/* Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 1.2fr 1fr 1fr 90px 80px 50px', padding: '10px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>ID</span><span>LR No.</span><span>Route</span><span>Client</span><span>Vehicle</span><span>Status</span><span>Freight</span><span></span>
        </div>
        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8', fontSize: 13 }}>No active trips</div>
        ) : filtered.map(t => {
          const sc = TRIP_STATE_COLORS[t.status] || {};
          return (
            <div key={t.id} onClick={() => openTripDetail(t)}
              style={{ display: 'grid', gridTemplateColumns: '70px 80px 1.2fr 1fr 1fr 90px 80px 50px', padding: '12px 20px', borderBottom: '1px solid #F8FAFC', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{t.id}</div>
              <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{t.lr}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{t.origin} → {t.destination}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{t.client}</div>
              <div>{t.vehicle ? <span style={{ fontSize: 11, fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>{t.vehicle}</span> : <span style={{ fontSize: 10, color: '#7C3AED', fontWeight: 700 }}>—</span>}</div>
              <div><span style={{ background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{t.status}</span></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>₹{(t.freight || 0).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Trip Detail Slider Content ─── */
function TripDetailContent({ trip }) {
  const sc = TRIP_STATE_COLORS[trip.status] || {};
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>{trip.status}</span>
        {trip.delayed && <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>⚠ Delayed</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <Field label="Trip ID" value={trip.id} />
        <Field label="LR Number" value={trip.lr} />
        <Field label="Client" value={trip.client} />
        <Field label="Freight" value={`₹${(trip.freight || 0).toLocaleString()}`} mono />
        <Field label="Origin" value={trip.origin} />
        <Field label="Destination" value={trip.destination} />
        <Field label="Vehicle" value={trip.vehicle || 'Unassigned'} />
        <Field label="Driver" value={trip.driver || 'Unassigned'} />
        <Field label="Start Date" value={trip.startDate} />
        <Field label="ETA" value={trip.eta} />
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{label}</div>
      <div style={{ width: '100%', border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: 600, minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}
