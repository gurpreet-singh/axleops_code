import { useState, useEffect } from 'react';
import useSliderStore from '../../stores/sliderStore';

// ═══════════════════════════════════════════════════════════════
// Reusable Form Components (shared patterns from TripCreateContent)
// ═══════════════════════════════════════════════════════════════

function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, info, full, textarea, rows }) {
  const baseInput = {
    width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px',
    fontSize: 13, color: '#1E293B', fontFamily: 'inherit', fontWeight: 500, outline: 'none',
    background: disabled ? '#F8FAFC' : '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const focusStyle = (e) => { e.target.style.borderColor = '#1A73E8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.08)'; };
  const blurStyle = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
        {required && <span style={{ color: '#DC2626', fontSize: 13 }}>*</span>}
      </div>
      {textarea ? (
        <textarea value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          rows={rows || 3}
          style={{ ...baseInput, resize: 'vertical', minHeight: 72 }}
          onFocus={focusStyle} onBlur={blurStyle}
        />
      ) : options ? (
        <select value={value} onChange={e => onChange?.(e.target.value)}
          style={{ ...baseInput, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
          disabled={disabled}>
          {options.map((o, i) => <option key={i} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={baseInput}
          onFocus={focusStyle} onBlur={blurStyle}
        />
      )}
      {info && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}><i className="fas fa-info-circle" style={{ marginRight: 3 }}></i>{info}</div>}
    </div>
  );
}

function Section({ title, emoji, borderColor, headerBg, accentColor, children, collapsible, defaultCollapsed }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed || false);

  return (
    <div style={{
      border: `1.5px solid ${borderColor || '#E2E8F0'}`,
      borderRadius: 14, marginBottom: 16, overflow: 'hidden',
      background: '#fff', transition: 'box-shadow 0.2s',
    }}>
      <div
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        style={{
          background: headerBg || '#F8FAFC', padding: '12px 16px',
          borderBottom: collapsed ? 'none' : `1px solid ${borderColor || '#E2E8F0'}`,
          display: 'flex', alignItems: 'center', gap: 8,
          cursor: collapsible ? 'pointer' : 'default', userSelect: 'none',
        }}
      >
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 }}>{title}</span>
        {collapsible && <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} style={{ fontSize: 10, color: '#94A3B8' }}></i>}
      </div>
      {!collapsed && <div style={{ padding: '16px 16px 18px' }}>{children}</div>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════
const CLIENTS = [
  { value: '', label: 'Select client' },
  { value: 'Reliance Industries', label: 'Reliance Industries' },
  { value: 'Tata Steel', label: 'Tata Steel' },
  { value: 'Hindustan Unilever', label: 'Hindustan Unilever' },
  { value: 'ITC Limited', label: 'ITC Limited' },
  { value: 'Adani Ports', label: 'Adani Ports' },
  { value: 'Mahindra Logistics', label: 'Mahindra Logistics' },
  { value: 'Asian Paints', label: 'Asian Paints' },
  { value: 'Larsen & Toubro', label: 'Larsen & Toubro' },
];

const VEHICLE_TYPES = [
  { value: '', label: 'Select vehicle type' },
  { value: 'Multi-Axle Truck', label: 'Multi-Axle Truck' },
  { value: '2-Axle Truck', label: '2-Axle Truck' },
  { value: '3-Axle Truck', label: '3-Axle Truck' },
  { value: 'Container 20ft', label: 'Container 20ft' },
  { value: 'Container 40ft', label: 'Container 40ft' },
  { value: 'Tanker', label: 'Tanker' },
  { value: 'LCV', label: 'LCV — Light Commercial Vehicle' },
  { value: 'Tractor-Trailer', label: 'Tractor-Trailer' },
  { value: 'Tipper / Dumper', label: 'Tipper / Dumper' },
];

const BILLING_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'Per KM', label: 'Per KM' },
  { value: 'Per Trip', label: 'Per Trip' },
  { value: 'Per MT', label: 'Per MT (Metric Ton)' },
  { value: 'Fixed', label: 'Fixed Rate' },
];

const PAYMENT_TERMS = [
  { value: '', label: 'Select terms' },
  { value: '15 days', label: '15 days' },
  { value: '30 days', label: '30 days' },
  { value: '45 days', label: '45 days' },
  { value: '60 days', label: '60 days' },
  { value: 'Advance', label: 'Advance' },
  { value: 'COD', label: 'COD' },
];

const WORKFLOW_TEMPLATES = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Express', label: 'Express' },
  { value: 'Heavy Cargo', label: 'Heavy Cargo' },
  { value: 'Hazmat', label: 'Hazmat' },
];

const BRANCHES = [
  { value: '', label: 'Select branch' },
  { value: 'Global', label: 'Global (All Branches)' },
  { value: 'Mumbai', label: 'Mumbai HQ' },
  { value: 'Delhi', label: 'Delhi NCR' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Chennai', label: 'Chennai' },
];


// ═══════════════════════════════════════════════════════════════
// Helper — build initial form state from a route object (for edit)
// or empty (for create)
// ═══════════════════════════════════════════════════════════════
function buildFormState(rt) {
  if (!rt) return {
    client: '', vType: '', origin: '', originPin: '', dest: '', destPin: '',
    via: '', dist: '', estTime: '',
    billingType: '', slaHrs: '', payTerms: '',
    freightRate: '', gdsCharges: '', stCharges: '', insurance: '',
    loadingCharges: '', unloadingCharges: '', deliveryCharges: '', collectionCharges: '',
    detentionCharges: '', godownCharges: '', lrCharges: '', otherCharges: '',
    driverExpense: '', tollExpense: '', diesel: '',
    workflowTemplate: 'Standard', branch: '',
    loadingInstructions: '', unloadingInstructions: '',
  };

  return {
    client: rt.client || '', vType: rt.vType || '',
    origin: rt.origin || '', originPin: rt.originPin || '',
    dest: rt.dest || '', destPin: rt.destPin || '',
    via: rt.via || '', dist: rt.dist?.toString() || '', estTime: rt.estTime?.toString() || '',
    billingType: rt.billingType || '', slaHrs: rt.slaHrs?.toString() || '', payTerms: rt.payTerms || '',
    freightRate: rt.freightRate?.toString() || '', gdsCharges: rt.gdsCharges?.toString() || '',
    stCharges: rt.stCharges?.toString() || '', insurance: rt.insurance?.toString() || '',
    loadingCharges: rt.loadingCharges?.toString() || '', unloadingCharges: rt.unloadingCharges?.toString() || '',
    deliveryCharges: rt.deliveryCharges?.toString() || '', collectionCharges: rt.collectionCharges?.toString() || '',
    detentionCharges: rt.detentionCharges?.toString() || '', godownCharges: rt.godownCharges?.toString() || '',
    lrCharges: rt.lrCharges?.toString() || '', otherCharges: rt.otherCharges?.toString() || '',
    driverExpense: rt.driverExpense?.toString() || rt.toll ? '' : '', // derive from data
    tollExpense: rt.toll?.toString() || '', diesel: rt.diesel?.toString() || '',
    workflowTemplate: rt.template || 'Standard', branch: rt.branch || '',
    loadingInstructions: rt.loadingInstructions || '', unloadingInstructions: rt.unloadingInstructions || '',
  };
}


// ═══════════════════════════════════════════════════════════════
// ROUTE CREATE/EDIT SLIDER CONTENT
// mode = 'create' → shows "NEW ROUTE / Define a new route" header
// mode = 'edit'   → shows route name, with Edit Details toggle
// ═══════════════════════════════════════════════════════════════

export function RouteCreateContent({ onSave }) {
  const { closeSlider } = useSliderStore();
  const [form, setForm] = useState(buildFormState(null));
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    onSave?.();
    closeSlider();
  };

  return (
    <div>
      {/* Dark Header */}
      <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#94A3B8', marginBottom: 4 }}>NEW ROUTE</div>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>Define a new route</div>
      </div>

      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={handleSave} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
          fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className="fas fa-plus" style={{ fontSize: 10 }}></i> Create Route
        </button>
        <div style={{ flex: 1 }}></div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <RouteFormSections form={form} set={set} />
      </div>
    </div>
  );
}


export function RouteDetailContent({ rt, onSave }) {
  const { closeSlider } = useSliderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(buildFormState(rt));
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // Status info
  const statusColor = rt.status === 'Active' ? '#16A34A' : rt.status === 'Ad-hoc' ? '#D97706' : '#94A3B8';

  const handleSave = () => {
    setIsEditing(false);
    onSave?.();
  };

  return (
    <div>
      {/* Dark Header with route info */}
      <div style={{ padding: '16px 24px', background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: '#94A3B8' }}>{rt.id}</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}40` }}>{rt.status}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>{rt.route}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{rt.client} • {rt.vType}</div>
      </div>

      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => { if (isEditing) { handleSave(); } else { setIsEditing(true); } }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: `1.5px solid ${isEditing ? '#059669' : '#E2E8F0'}`,
            borderRadius: 8, padding: '7px 14px',
            fontSize: 12, fontWeight: 700,
            color: isEditing ? '#059669' : '#475569',
            background: isEditing ? '#ECFDF5' : '#fff',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`} style={{ fontSize: 10 }}></i>
          {isEditing ? 'Save Changes' : 'Edit Details'}
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
        }}>
          <i className="fas fa-print" style={{ fontSize: 10 }}></i> Print
        </button>
        <div style={{ flex: 1 }}></div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {isEditing ? (
          <RouteFormSections form={form} set={set} />
        ) : (
          <RouteViewSections rt={rt} form={form} />
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// EDITABLE FORM SECTIONS (used by both create and edit)
// ═══════════════════════════════════════════════════════════════
function RouteFormSections({ form, set }) {
  return (
    <>
      {/* ═══ 1. ROUTE DETAILS ═══ */}
      <Section title="Route Details" emoji="🚛" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Client" value={form.client} onChange={set('client')} required options={CLIENTS} />
          <FormField label="Vehicle Type" value={form.vType} onChange={set('vType')} required options={VEHICLE_TYPES} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Origin" value={form.origin} onChange={set('origin')} required placeholder="e.g. JNPT Navi Mumbai" />
          <FormField label="Origin Pincode" value={form.originPin} onChange={set('originPin')} placeholder="e.g. 400707" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Destination" value={form.dest} onChange={set('dest')} required placeholder="e.g. Mathura Refinery" />
          <FormField label="Dest Pincode" value={form.destPin} onChange={set('destPin')} placeholder="e.g. 281006" />
        </div>
        <FormField label="Via Highway" value={form.via} onChange={set('via')} placeholder="e.g. NH48 → NH44" full />
        <div style={{ height: 14 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Distance (KM)" value={form.dist} onChange={set('dist')} type="number" required placeholder="e.g. 1380" />
          <FormField label="Est. Duration (HRS)" value={form.estTime} onChange={set('estTime')} type="number" placeholder="e.g. 22" />
        </div>
      </Section>

      {/* ═══ 2. ROUTE CONTRACT ═══ */}
      <Section title="Route Contract" emoji="📝" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        {/* Info banner */}
        <div style={{ padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="fas fa-info-circle" style={{ fontSize: 11 }}></i>
          Contract terms + charge columns. These are templatised per route and feed into trip settlement & client invoicing.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <FormField label="Billing Type" value={form.billingType} onChange={set('billingType')} required options={BILLING_TYPES} />
          <FormField label="SLA (HRS)" value={form.slaHrs} onChange={set('slaHrs')} type="number" required placeholder="e.g. 26" />
          <FormField label="Payment Terms" value={form.payTerms} onChange={set('payTerms')} options={PAYMENT_TERMS} />
        </div>

        {/* Charge Columns sub-header */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          Charge Columns (Per Trip → Invoice)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <FormField label="Freight Rate" value={form.freightRate} onChange={set('freightRate')} type="number" required placeholder="e.g. 47130" />
          <FormField label="GDS Charges" value={form.gdsCharges} onChange={set('gdsCharges')} type="number" placeholder="e.g. 0" />
          <FormField label="ST Charges" value={form.stCharges} onChange={set('stCharges')} type="number" placeholder="e.g. 0" />
          <FormField label="Insurance" value={form.insurance} onChange={set('insurance')} type="number" placeholder="e.g. 450" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <FormField label="Loading Charges" value={form.loadingCharges} onChange={set('loadingCharges')} type="number" placeholder="e.g. 800" />
          <FormField label="Unloading Charges" value={form.unloadingCharges} onChange={set('unloadingCharges')} type="number" placeholder="e.g. 800" />
          <FormField label="Delivery Charges" value={form.deliveryCharges} onChange={set('deliveryCharges')} type="number" placeholder="e.g. 500" />
          <FormField label="Collection Charges" value={form.collectionCharges} onChange={set('collectionCharges')} type="number" placeholder="e.g. 0" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <FormField label="Detention Charges" value={form.detentionCharges} onChange={set('detentionCharges')} type="number" placeholder="e.g. 500" />
          <FormField label="Godown Charges" value={form.godownCharges} onChange={set('godownCharges')} type="number" placeholder="e.g. 0" />
          <FormField label="LR Charges" value={form.lrCharges} onChange={set('lrCharges')} type="number" placeholder="e.g. 150" />
          <FormField label="Other Charges" value={form.otherCharges} onChange={set('otherCharges')} type="number" placeholder="e.g. 0" />
        </div>
      </Section>

      {/* ═══ 3. OPERATIONAL CONFIG ═══ */}
      <Section title="Operational Config" emoji="📦" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Driver Expense (₹)" value={form.driverExpense} onChange={set('driverExpense')} type="number" required placeholder="e.g. 2200" />
          <FormField label="Toll Expense (₹)" value={form.tollExpense} onChange={set('tollExpense')} type="number" required placeholder="e.g. 8400" />
          <FormField label="Diesel (Litres)" value={form.diesel} onChange={set('diesel')} type="number" required placeholder="e.g. 300" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Workflow Template" value={form.workflowTemplate} onChange={set('workflowTemplate')} options={WORKFLOW_TEMPLATES} />
          <FormField label="Branch" value={form.branch} onChange={set('branch')} options={BRANCHES} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <FormField label="Loading Instructions" value={form.loadingInstructions} onChange={set('loadingInstructions')} textarea placeholder="Special loading instructions..." full />
        </div>
        <FormField label="Unloading Instructions" value={form.unloadingInstructions} onChange={set('unloadingInstructions')} textarea placeholder="Special unloading instructions..." full />
      </Section>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// READ-ONLY VIEW SECTIONS (used by detail slider when not editing)
// ═══════════════════════════════════════════════════════════════

function ReadField({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{label}</div>
      <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}

const INR = n => n ? '₹' + Number(n).toLocaleString('en-IN') : '—';

function RouteViewSections({ rt, form }) {
  return (
    <>
      {/* Route Details */}
      <Section title="Route Details" emoji="🚛" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ReadField label="Client" value={rt.client} />
          <ReadField label="Vehicle Type" value={rt.vType} />
          <ReadField label="Origin" value={rt.origin} />
          <ReadField label="Origin Pincode" value={rt.originPin} mono />
          <ReadField label="Destination" value={rt.dest} />
          <ReadField label="Dest Pincode" value={rt.destPin} mono />
          <ReadField label="Via Highway" value={rt.via} />
          <ReadField label="Distance" value={rt.dist ? `${rt.dist.toLocaleString()} km` : '—'} />
          <ReadField label="Est. Duration" value={rt.estTime ? `${rt.estTime} hrs` : '—'} />
          <ReadField label="Branch" value={rt.branch} />
        </div>
      </Section>

      {/* Route Contract */}
      <Section title="Route Contract" emoji="📝" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <ReadField label="Billing Type" value={rt.billingType} />
          <ReadField label="SLA" value={rt.slaHrs ? `${rt.slaHrs} hrs` : '—'} />
          <ReadField label="Payment Terms" value={rt.payTerms} />
        </div>

        {/* Performance stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ padding: 12, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Trips MTD</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F', marginTop: 4 }}>{rt.tripsMtd} / {rt.trips}</div>
          </div>
          <div style={{ padding: 12, background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>On-Time %</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#166534', marginTop: 4 }}>{rt.onTime || '—'}%</div>
          </div>
          <div style={{ padding: 12, background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Avg Margin</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#92400E', marginTop: 4 }}>{rt.avgMargin || '—'}%</div>
          </div>
        </div>

        {/* Charge columns display */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>Charge Columns</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            ['Freight Rate', form.freightRate], ['GDS', form.gdsCharges], ['ST', form.stCharges], ['Insurance', form.insurance],
            ['Loading', form.loadingCharges], ['Unloading', form.unloadingCharges], ['Delivery', form.deliveryCharges], ['Collection', form.collectionCharges],
            ['Detention', form.detentionCharges], ['Godown', form.godownCharges], ['LR', form.lrCharges], ['Other', form.otherCharges],
          ].map(([l, v]) => (
            <div key={l} style={{ background: '#FAF5FF', borderRadius: 8, padding: '8px 10px', border: '1px solid #EDE9FE' }}>
              <div style={{ fontSize: 9, color: '#7C3AED', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{v ? INR(v) : '—'}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Operational Config */}
      <Section title="Operational Config" emoji="📦" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <ReadField label="Driver Expense" value={form.driverExpense ? INR(form.driverExpense) : '—'} />
          <ReadField label="Toll Expense" value={rt.toll ? INR(rt.toll) : (form.tollExpense ? INR(form.tollExpense) : '—')} />
          <ReadField label="Diesel" value={form.diesel ? `${form.diesel} L` : '—'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <ReadField label="Workflow Template" value={rt.template} />
          <ReadField label="Branch" value={rt.branch} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>Loading Instructions</div>
            <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 500, minHeight: 50 }}>
              {form.loadingInstructions || <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>No instructions provided</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>Unloading Instructions</div>
            <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 500, minHeight: 50 }}>
              {form.unloadingInstructions || <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>No instructions provided</span>}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
