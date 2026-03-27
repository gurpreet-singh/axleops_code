import { useState, useEffect, useMemo } from 'react';
import { TRIP_STATE_COLORS } from '../../services/tripService';
import useSliderStore from '../../stores/sliderStore';

// Re-export TripCreateContent from the dedicated module
export { default as TripCreateContent } from './TripCreateContent';

// ═══════════════════════════════════════════════════════════
// Shared read-only field
// ═══════════════════════════════════════════════════════════
function Field({ label, value, mono, icon, badge, badgeColor, full }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
        {icon && <i className={icon} style={{ marginRight: 4, fontSize: 10 }}></i>}
        {label}
        {badge && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: badgeColor || '#DCFCE7', color: badgeColor === '#FEE2E2' ? '#991B1B' : '#16A34A' }}>{badge}</span>}
      </div>
      <div style={{ width: '100%', border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: 600, minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Form field (editable)
// ═══════════════════════════════════════════════════════════
function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, info, badge, badgeColor, full, children }) {
  const baseInput = {
    width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px',
    fontSize: 13, color: '#1E293B', fontFamily: 'inherit', fontWeight: 500, outline: 'none',
    background: disabled ? '#F8FAFC' : '#fff',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}{required && <span style={{ color: '#DC2626' }}>*</span>}
        {badge && <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: badgeColor || '#E6F4EA', color: '#137333' }}>{badge}</span>}
      </div>
      {children ? children : options ? (
        <select value={value} onChange={e => onChange?.(e.target.value)} style={{ ...baseInput, cursor: 'pointer' }} disabled={disabled}>
          {options.map((o, i) => <option key={i} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={baseInput}
          onFocus={e => { e.target.style.borderColor = '#1A73E8'; }}
          onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
        />
      )}
      {info && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}><i className="fas fa-info-circle" style={{ marginRight: 3 }}></i>{info}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Section wrapper
// ═══════════════════════════════════════════════════════════
function Section({ title, icon, iconColor, borderColor, headerBg, children, collapsed, onToggle }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div onClick={onToggle}
        style={{ background: headerBg || '#F8FAFC', padding: '10px 14px', borderBottom: collapsed ? 'none' : `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8, cursor: onToggle ? 'pointer' : 'default' }}>
        {icon && <i className={icon} style={{ fontSize: 13, color: iconColor || '#1A73E8' }}></i>}
        <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</span>
        {onToggle && <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} style={{ fontSize: 10, color: '#94A3B8' }}></i>}
      </div>
      {!collapsed && <div style={{ padding: 14 }}>{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Info row for detail view
// ═══════════════════════════════════════════════════════════
function InfoRow({ label, value, highlight, highlightColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: 12, minWidth: 130 }}>{label}</span>
      <span style={{ color: highlight ? (highlightColor || '#1E293B') : '#1E293B', fontWeight: 600, textAlign: 'right', flex: 1, fontSize: 13 }}>
        {value || '—'}
      </span>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MOCK DATA for detail view selects (edit mode)
// ═══════════════════════════════════════════════════════════════
const MOCK_VEHICLES = [
  { value: '', label: 'Select vehicle...' },
  { value: 'MH04AB1234', label: 'MH04AB1234 — 2022 Tata Signa 4825.T (Available)' },
  { value: 'MH04CD5678', label: 'MH04CD5678 — 2021 Ashok Leyland U-3718 (Available)' },
  { value: 'MH04KL4567', label: 'MH04KL4567 — 2022 BharatBenz 4228R (On Trip)' },
];
const MOCK_DRIVERS = [
  { value: '', label: 'Select driver...' },
  { value: 'rajesh', label: 'Rajesh Kumar — HMV · ⭐ 4.8 (Available)' },
  { value: 'vikram', label: 'Vikram Singh — HMV · ⭐ 4.5 (Available)' },
  { value: 'deepak', label: 'Deepak Patel — HMV · ⭐ 4.6 (On Trip)' },
];


// ═══════════════════════════════════════════════════════════════
// TRIP DETAIL SLIDER CONTENT (view / edit mode)
// Used for Active, In-Transit, Delivered, Settled trips
// ═══════════════════════════════════════════════════════════════
export function TripDetailContent({ trip }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const sc = TRIP_STATE_COLORS[trip.status] || {};

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { key: 'assignment', label: 'Assignment', icon: 'fas fa-truck' },
    { key: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
    { key: 'financials', label: 'Financials', icon: 'fas fa-chart-pie' },
  ];

  // Status-specific action buttons
  const renderActions = () => {
    switch (trip.status) {
      case 'Created':
        return (
          <>
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>
              <i className="fas fa-play"></i> Start Trip
            </button>
            <button className="sl-action-btn" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}>
              <i className="fas fa-ban"></i> Cancel
            </button>
          </>
        );
      case 'In Transit':
        return (
          <>
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>
              <i className="fas fa-check"></i> Mark Delivered
            </button>
            <button className="sl-action-btn" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>
              <i className="fas fa-exclamation-triangle"></i> Exception
            </button>
          </>
        );
      case 'Completed':
        return (
          <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>
            <i className="fas fa-lock"></i> Settle Trip
          </button>
        );
      case 'Settled':
        return (
          <button className="sl-action-btn" style={{ background: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>
            <i className="fas fa-print"></i> Print
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="sl-action-bar" style={{ padding: '8px 20px', gap: 6, flexWrap: 'wrap' }}>
        <button className={`sl-action-btn sl-edit-toggle-btn ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(!isEditing)}>
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`}></i> {isEditing ? 'Save' : 'Edit Details'}
        </button>
        <button className="sl-action-btn"><i className="fas fa-print"></i> Print</button>
        <div style={{ flex: 1 }}></div>
        {renderActions()}
      </div>

      {/* Status Badge Row */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }}></span>
          {trip.status}
        </span>
        {trip.delayed && <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>⚠ Delayed</span>}
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{trip.id}</span>
      </div>

      {/* Tabs */}
      <div className="slider-tabs" style={{ marginTop: 8 }}>
        {TABS.map(t => (
          <div key={t.key} className={`slider-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <i className={t.icon} style={{ marginRight: 4, fontSize: 11 }}></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 20 }}>
        {activeTab === 'overview' && <OverviewTab trip={trip} isEditing={isEditing} />}
        {activeTab === 'assignment' && <AssignmentTab trip={trip} isEditing={isEditing} />}
        {activeTab === 'timeline' && <TimelineTab trip={trip} />}
        {activeTab === 'financials' && <FinancialsTab trip={trip} />}
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────
function OverviewTab({ trip, isEditing }) {
  return (
    <>
      {/* Trip Execution Progress (for In-Transit) */}
      {trip.status === 'In Transit' && (
        <div style={{ marginBottom: 16, padding: 14, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-tasks" style={{ color: '#2563EB', fontSize: 12 }}></i>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>Trip Execution</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', background: '#DBEAFE', color: '#2563EB', borderRadius: 4 }}>En Route</span>
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {['Accepted', 'Loading', 'EWB', 'Departed', 'En Route', 'Arrived', 'Unloading', 'POD'].map((step, i) => {
              const done = i < 5;
              const current = i === 4;
              return (
                <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: current ? 26 : 22, height: current ? 26 : 22, borderRadius: '50%', margin: '0 auto',
                    background: done ? '#16A34A' : current ? '#2563EB' : '#E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: current ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                  }}>
                    {done && !current ? <i className="fas fa-check" style={{ color: '#fff', fontSize: 8 }}></i>
                      : current ? <i className="fas fa-truck" style={{ color: '#fff', fontSize: 8 }}></i>
                      : <span style={{ fontSize: 8, color: '#9CA3AF', fontWeight: 700 }}>{i + 1}</span>}
                  </div>
                  <div style={{ fontSize: 8, color: done ? '#16A34A' : current ? '#2563EB' : '#9CA3AF', fontWeight: current ? 700 : 500, marginTop: 3 }}>{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Section title="Trip Information" icon="fas fa-info-circle" iconColor="#1A73E8" borderColor="#BAE6FD" headerBg="#F0F9FF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {isEditing ? (
            <>
              <Field label="Trip ID" value={trip.id} mono />
              <FormField label="LR Number" value={trip.lr} />
              <FormField label="Client" value={trip.client} />
              <FormField label="Freight (₹)" value={trip.freight?.toString()} type="number" />
              <FormField label="Origin" value={trip.origin} />
              <FormField label="Destination" value={trip.destination} />
            </>
          ) : (
            <>
              <Field label="Trip ID" value={trip.id} mono />
              <Field label="LR Number" value={trip.lr} mono />
              <Field label="Client" value={trip.client} />
              <Field label="Freight" value={`₹${(trip.freight || 0).toLocaleString()}`} mono />
              <Field label="Origin" value={trip.origin} />
              <Field label="Destination" value={trip.destination} />
            </>
          )}
        </div>
      </Section>

      <Section title="Schedule" icon="fas fa-calendar-alt" iconColor="#D97706" borderColor="#FDE68A" headerBg="#FFFBEB">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Start Date" value={trip.startDate} />
          <Field label="ETA" value={trip.eta} />
        </div>
      </Section>
    </>
  );
}

// ─── ASSIGNMENT TAB ──────────────────────────────────────────
function AssignmentTab({ trip, isEditing }) {
  return (
    <>
      <Section title="Vehicle & Driver" icon="fas fa-truck" iconColor="#7C3AED" borderColor="#C4B5FD" headerBg="#F5F3FF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {isEditing ? (
            <>
              <FormField label="Vehicle" value={trip.vehicle || ''} options={MOCK_VEHICLES} />
              <FormField label="Driver" value={trip.driver || ''} options={MOCK_DRIVERS} />
            </>
          ) : (
            <>
              <Field label="Vehicle" value={trip.vehicle || 'Unassigned'} mono />
              <Field label="Driver" value={trip.driver || 'Unassigned'} />
            </>
          )}
        </div>
        {!trip.vehicle && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 11, color: '#92400E' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }}></i>
            Vehicle and driver need to be assigned before trip can start.
          </div>
        )}
      </Section>

      <Section title="Consignment" icon="fas fa-box" iconColor="#059669" borderColor="#A7F3D0" headerBg="#F0FDF4">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="LR Number" value={trip.lr} mono />
          <Field label="Client" value={trip.client} />
        </div>
      </Section>
    </>
  );
}

// ─── TIMELINE TAB ────────────────────────────────────────────
function TimelineTab({ trip }) {
  const events = [
    { time: trip.startDate, label: 'Trip Created', icon: 'fas fa-plus-circle', done: true },
    ...(trip.vehicle ? [{ time: trip.startDate, label: 'Vehicle Assigned', icon: 'fas fa-truck', done: true, detail: trip.vehicle }] : []),
    ...(trip.driver ? [{ time: trip.startDate, label: 'Driver Assigned', icon: 'fas fa-user', done: true, detail: trip.driver }] : []),
    ...(trip.status !== 'Created' ? [
      { time: trip.startDate, label: 'Trip Started', icon: 'fas fa-play', done: true },
      { time: null, label: 'En Route', icon: 'fas fa-road', done: trip.status !== 'In Transit', current: trip.status === 'In Transit' },
    ] : []),
    ...(trip.status === 'Completed' || trip.status === 'Settled' ? [
      { time: trip.eta, label: 'Delivered', icon: 'fas fa-check-circle', done: true },
      { time: trip.eta, label: 'POD Captured', icon: 'fas fa-signature', done: true },
    ] : []),
    ...(trip.status === 'Settled' ? [
      { time: trip.eta, label: 'Trip Settled', icon: 'fas fa-lock', done: true },
    ] : []),
  ];

  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'linear-gradient(to bottom, #16A34A, #E5E7EB)' }}></div>
      {events.map((ev, i) => (
        <div key={i} style={{ position: 'relative', padding: '10px 0 10px 20px' }}>
          <div style={{
            position: 'absolute', left: -13, top: 12, width: ev.current ? 24 : 20, height: ev.current ? 24 : 20,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            background: ev.done ? '#16A34A' : ev.current ? '#2563EB' : '#E5E7EB',
            boxShadow: ev.current ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
          }}>
            <i className={ev.done ? 'fas fa-check' : ev.icon} style={{ color: '#fff', fontSize: 8 }}></i>
          </div>
          <div style={{ padding: '10px 14px', background: ev.current ? '#EFF6FF' : ev.done ? '#F0FDF4' : '#F9FAFB', border: `1px solid ${ev.current ? '#2563EB' : ev.done ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ev.current ? '#1E40AF' : ev.done ? '#166534' : '#6B7280' }}>{ev.label}</span>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600, background: ev.done ? '#16A34A' : ev.current ? '#2563EB' : '#F3F4F6', color: ev.done || ev.current ? '#fff' : '#9CA3AF' }}>
                {ev.done ? 'DONE' : ev.current ? 'ACTIVE' : 'PENDING'}
              </span>
            </div>
            {ev.time && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>{ev.time}</div>}
            {ev.detail && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{ev.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FINANCIALS TAB ──────────────────────────────────────────
function FinancialsTab({ trip }) {
  const expenses = [
    { type: 'Diesel', icon: 'fas fa-gas-pump', iconColor: '#D97706', amount: 22400, status: 'Paid' },
    { type: 'Toll (FASTag)', icon: 'fas fa-road', iconColor: '#2563EB', amount: 4850, status: 'Auto-deducted' },
    { type: 'Driver Allowance', icon: 'fas fa-user', iconColor: '#0EA5E9', amount: 2500, status: 'Advance' },
    { type: 'Driver Food', icon: 'fas fa-utensils', iconColor: '#F59E0B', amount: 1200, status: 'Pending' },
    { type: 'Misc', icon: 'fas fa-ellipsis-h', iconColor: '#6B7280', amount: 650, status: 'Pending' },
  ];
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const revenue = trip.freight || 0;
  const profit = revenue - totalExpenses;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <>
      {/* P&L Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>REVENUE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>₹{revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>EXPENSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#991B1B' }}>₹{totalExpenses.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: profit >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${profit >= 0 ? '#BBF7D0' : '#FECACA'}` }}>
          <div style={{ fontSize: 10, color: profit >= 0 ? '#16A34A' : '#DC2626', fontWeight: 700 }}>PROFIT ({margin}%)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: profit >= 0 ? '#166534' : '#991B1B' }}>₹{profit.toLocaleString()}</div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <Section title="Expense Breakdown" icon="fas fa-receipt" iconColor="#DC2626" borderColor="#FECACA" headerBg="#FEF2F2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {expenses.map((exp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC', gap: 10 }}>
              <i className={exp.icon} style={{ color: exp.iconColor, fontSize: 12, width: 16 }}></i>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', flex: 1 }}>{exp.type}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', minWidth: 70, textAlign: 'right' }}>₹{exp.amount.toLocaleString()}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: exp.status === 'Paid' ? '#DCFCE7' : '#FEF3C7', color: exp.status === 'Paid' ? '#16A34A' : '#92400E' }}>{exp.status}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', fontWeight: 700, borderTop: '2px solid #E2E8F0', marginTop: 4 }}>
            <span style={{ flex: 1, fontSize: 13, color: '#1E293B' }}>Total</span>
            <span style={{ fontSize: 14, color: '#DC2626' }}>₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      </Section>
    </>
  );
}

export default TripDetailContent;
