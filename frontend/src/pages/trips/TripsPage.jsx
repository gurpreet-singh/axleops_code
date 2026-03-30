import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTripCounts, TRIP_STATE_COLORS } from '../../services/tripService';

export default function TripsPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  useEffect(() => { getTripCounts().then(setCounts).catch(() => {}); }, []);

  const cards = [
    { key: 'CREATED', icon: 'fas fa-plus-circle', label: 'Created', desc: 'Booked & waiting to start' },
    { key: 'IN_TRANSIT', icon: 'fas fa-truck-moving', label: 'In Transit', desc: 'On the road' },
    { key: 'DELIVERED', icon: 'fas fa-box-open', label: 'Delivered', desc: 'Delivered, pending settlement' },
    { key: 'SETTLED', icon: 'fas fa-check-double', label: 'Settled', desc: 'Expenses settled & closed' },
    { key: 'CANCELLED', icon: 'fas fa-ban', label: 'Cancelled', desc: 'Cancelled trips' },
  ];

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Trips <span className="learn-badge"><i className="fas fa-route" style={{ color: '#059669' }}></i> Overview</span></h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/trips/active')}><i className="fas fa-list"></i> View All Trips</button>
        </div>
      </div>

      {/* Total Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A5F, #2D5F8B)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Trips</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1 }}>{total}</div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {cards.filter(c => c.key !== 'CANCELLED').map(c => {
            const sc = TRIP_STATE_COLORS[c.key];
            return (
              <div key={c.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{counts[c.key] || 0}</div>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>{c.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {cards.map(c => {
          const sc = TRIP_STATE_COLORS[c.key];
          const count = counts[c.key] || 0;
          return (
            <div key={c.key}
              onClick={() => navigate(c.key === 'SETTLED' ? '/trips/settled' : `/trips/active?status=${c.key}`)}
              style={{
                background: '#fff', border: `1.5px solid ${sc.border}`, borderRadius: 16,
                padding: '22px 20px', cursor: 'pointer', transition: 'all 0.15s',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: sc.bg }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: sc.mid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={c.icon} style={{ color: sc.dot, fontSize: 15 }}></i>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc.text, textTransform: 'uppercase', letterSpacing: 0.4 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1E293B', lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginTop: 4 }}>{c.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
