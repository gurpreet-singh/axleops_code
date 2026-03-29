import { useState, useEffect } from 'react';
import useSliderStore from '../../stores/sliderStore';
import { createRoute, updateRoute, deleteRoute } from '../../services/routeService';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { FormField, Section } from '../../components/common/FormField';
import api from '../../services/api';


// ═══════════════════════════════════════════════════════════════
// STATIC OPTIONS
// ═══════════════════════════════════════════════════════════════
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
// Helper — build form state from route or empty for create
// ═══════════════════════════════════════════════════════════════
function buildFormState(rt) {
  if (!rt) return {
    name: '', ledgerAccountId: '', vType: '', origin: '', originPin: '', dest: '', destPin: '',
    via: '', dist: '', estTime: '',
    billingType: '', slaHrs: '', payTerms: '',
    documentSeries: '', invoiceTypeId: '', annexureTypeId: '',
    freightRate: '', gdsCharges: '', stCharges: '', insurance: '',
    loadingCharges: '', unloadingCharges: '', deliveryCharges: '', collectionCharges: '',
    detentionCharges: '', godownCharges: '', lrCharges: '', otherCharges: '',
    driverExpense: '', tollExpense: '', diesel: '',
    workflowTemplate: 'Standard', branch: '',
    loadingInstructions: '', unloadingInstructions: '',
  };

  return {
    name: rt.name || '',
    ledgerAccountId: rt.ledgerAccountId || '',
    vType: rt.vType || rt.vehicleType || '',
    origin: rt.origin || '', originPin: rt.originPin || '',
    dest: rt.dest || rt.destination || '', destPin: rt.destPin || '',
    via: rt.via || '', dist: rt.dist?.toString() || rt.distanceKm?.toString() || '',
    estTime: rt.estTime?.toString() || rt.estimatedHours?.toString() || '',
    billingType: rt.billingType || '',
    slaHrs: rt.slaHrs?.toString() || rt.slaHours?.toString() || '',
    payTerms: rt.payTerms || rt.paymentTerms || '',
    documentSeries: rt.documentSeries || '',
    invoiceTypeId: rt.invoiceTypeId || '',
    annexureTypeId: rt.annexureTypeId || '',
    freightRate: rt.freightRate?.toString() || '', gdsCharges: rt.gdsCharges?.toString() || '',
    stCharges: rt.stCharges?.toString() || '', insurance: rt.insurance?.toString() || '',
    loadingCharges: rt.loadingCharges?.toString() || '', unloadingCharges: rt.unloadingCharges?.toString() || '',
    deliveryCharges: rt.deliveryCharges?.toString() || '', collectionCharges: rt.collectionCharges?.toString() || '',
    detentionCharges: rt.detentionCharges?.toString() || '', godownCharges: rt.godownCharges?.toString() || '',
    lrCharges: rt.lrCharges?.toString() || '', otherCharges: rt.otherCharges?.toString() || '',
    driverExpense: rt.driverExpense?.toString() || '',
    tollExpense: rt.toll?.toString() || rt.tollCost?.toString() || '',
    diesel: rt.diesel?.toString() || '',
    workflowTemplate: rt.template || 'Standard', branch: rt.branch || '',
    loadingInstructions: rt.loadingInstructions || '', unloadingInstructions: rt.unloadingInstructions || '',
  };
}

// Convert form state → API payload
function formToPayload(form) {
  const num = (v) => v ? parseFloat(v) : null;
  return {
    name: form.name || null,
    origin: form.origin || null,
    destination: form.dest || null,
    distanceKm: num(form.dist),
    estimatedHours: num(form.estTime),
    tollCost: num(form.tollExpense),
    via: form.via || null,
    originPin: form.originPin || null,
    destPin: form.destPin || null,
    slaHours: form.slaHrs ? parseInt(form.slaHrs, 10) : null,
    paymentTerms: form.payTerms || null,
    template: form.workflowTemplate || null,
    status: 'ACTIVE',
    vehicleType: form.vType || null,
    billingType: form.billingType || null,
    documentSeries: form.documentSeries || null,
    // Charge columns
    freightRate: num(form.freightRate),
    gdsCharges: num(form.gdsCharges),
    stCharges: num(form.stCharges),
    insurance: num(form.insurance),
    loadingCharges: num(form.loadingCharges),
    unloadingCharges: num(form.unloadingCharges),
    deliveryCharges: num(form.deliveryCharges),
    collectionCharges: num(form.collectionCharges),
    detentionCharges: num(form.detentionCharges),
    godownCharges: num(form.godownCharges),
    lrCharges: num(form.lrCharges),
    otherCharges: num(form.otherCharges),
    // Operational defaults
    driverExpense: num(form.driverExpense),
    dieselLitres: num(form.diesel),
    // Instructions
    loadingInstructions: form.loadingInstructions || null,
    unloadingInstructions: form.unloadingInstructions || null,
    // FK IDs
    ledgerAccountId: form.ledgerAccountId || null,
    invoiceTypeId: form.invoiceTypeId || null,
    annexureTypeId: form.annexureTypeId || null,
  };
}


// ═══════════════════════════════════════════════════════════════
// ROUTE CREATE SLIDER CONTENT
// ═══════════════════════════════════════════════════════════════
export function RouteCreateContent({ onSave }) {
  const { closeSlider } = useSliderStore();
  const [form, setForm] = useState(buildFormState(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    // Validate mandatory field
    if (!form.name.trim()) {
      setError('Route Name is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createRoute(formToPayload(form));
      onSave?.();
      closeSlider();
    } catch (e) {
      console.error('Failed to create route:', e);
      setError(e?.response?.data?.message || 'Failed to create route');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
          fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
          cursor: saving ? 'wait' : 'pointer', transition: 'all 0.15s',
          opacity: saving ? 0.7 : 1,
        }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className="fas fa-plus" style={{ fontSize: 10 }}></i> {saving ? 'Saving…' : 'Create Route'}
        </button>
        <div style={{ flex: 1 }}></div>
        {error && <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <RouteFormSections form={form} set={set} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ROUTE DETAIL SLIDER CONTENT (view + edit)
// ═══════════════════════════════════════════════════════════════
export function RouteDetailContent({ rt, onSave }) {
  const { closeSlider } = useSliderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(buildFormState(rt));
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const statusColor = rt.status === 'Active' || rt.status === 'ACTIVE' ? '#16A34A' : rt.status === 'Ad-hoc' ? '#D97706' : '#94A3B8';

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Route Name is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateRoute(rt.id, formToPayload(form));
      setIsEditing(false);
      onSave?.();
    } catch (e) {
      console.error('Failed to update route:', e);
      setError(e?.response?.data?.message || 'Failed to update route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteRoute(rt.id);
    closeSlider();
    onSave?.();
  };

  return (
    <div>
      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => { if (isEditing) { handleSave(); } else { setIsEditing(true); } }}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: `1.5px solid ${isEditing ? '#059669' : '#E2E8F0'}`,
            borderRadius: 8, padding: '7px 14px',
            fontSize: 12, fontWeight: 700,
            color: isEditing ? '#059669' : '#475569',
            background: isEditing ? '#ECFDF5' : '#fff',
            cursor: saving ? 'wait' : 'pointer', transition: 'all 0.15s',
          }}
        >
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`} style={{ fontSize: 10 }}></i>
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Edit Details'}
        </button>
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setForm(buildFormState(rt)); setError(null); }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px',
            fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
          }}>
            Cancel
          </button>
        )}
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
        }}>
          <i className="fas fa-print" style={{ fontSize: 10 }}></i> Print
        </button>
        <div style={{ flex: 1 }}></div>
        {error && <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, marginRight: 8 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
        <button className="sl-delete-btn" onClick={() => setShowDeleteModal(true)}>
          <i className="fas fa-recycle"></i> Delete
        </button>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {isEditing ? (
          <RouteFormSections form={form} set={set} />
        ) : (
          <RouteViewSections rt={rt} form={form} />
        )}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        entityName={rt.name || rt.route || `${rt.origin} → ${rt.dest}`}
        entityType="Route"
      />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// EDITABLE FORM SECTIONS (used by both create and edit)
// ═══════════════════════════════════════════════════════════════
function RouteFormSections({ form, set }) {
  const [ledgerAccounts, setLedgerAccounts] = useState([]);
  const [invoiceTypes, setInvoiceTypes] = useState([]);
  const [annexureTypes, setAnnexureTypes] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    api.get('/ledger-accounts').then(({ data }) => setLedgerAccounts(data || [])).catch(() => setLedgerAccounts([]));
    api.get('/invoice-types').then(({ data }) => setInvoiceTypes(data || [])).catch(() => setInvoiceTypes([]));
    api.get('/annexure-types').then(({ data }) => setAnnexureTypes(data || [])).catch(() => setAnnexureTypes([]));
  }, []);

  const ledgerOptions = [
    { value: '', label: 'Select ledger account' },
    ...ledgerAccounts.map(la => ({ value: la.id, label: `${la.accountHead}${la.accountType ? ' (' + la.accountType + ')' : ''}` })),
  ];

  const invoiceTypeOptions = [
    { value: '', label: 'Select invoice type' },
    ...invoiceTypes.map(it => ({ value: it.id, label: it.name })),
  ];

  const annexureTypeOptions = [
    { value: '', label: 'Select annexure type' },
    ...annexureTypes.map(at => ({ value: at.id, label: at.name })),
  ];

  return (
    <>
      {/* ═══ 1. ROUTE DETAILS ═══ */}
      <Section title="Route Details" emoji="🚛" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ marginBottom: 14 }}>
          <FormField label="Route Name" value={form.name} onChange={set('name')} required placeholder="e.g. Mumbai–Delhi Express" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Ledger Account" value={form.ledgerAccountId} onChange={set('ledgerAccountId')} options={ledgerOptions} />
          <FormField label="Vehicle Type" value={form.vType} onChange={set('vType')} options={VEHICLE_TYPES} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Origin" value={form.origin} onChange={set('origin')} placeholder="e.g. JNPT Navi Mumbai" />
          <FormField label="Origin Pincode" value={form.originPin} onChange={set('originPin')} placeholder="e.g. 400707" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Destination" value={form.dest} onChange={set('dest')} placeholder="e.g. Mathura Refinery" />
          <FormField label="Dest Pincode" value={form.destPin} onChange={set('destPin')} placeholder="e.g. 281006" />
        </div>
        <FormField label="Via Highway" value={form.via} onChange={set('via')} placeholder="e.g. NH48 → NH44" full />
        <div style={{ height: 14 }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Distance (KM)" value={form.dist} onChange={set('dist')} type="number" placeholder="e.g. 1380" />
          <FormField label="Est. Duration (HRS)" value={form.estTime} onChange={set('estTime')} type="number" placeholder="e.g. 22" />
        </div>
      </Section>

      {/* ═══ 1b. DOCUMENT & PDF CONFIG ═══ */}
      <Section title="Document & PDF Config" emoji="📄" borderColor="#A5F3FC" headerBg="linear-gradient(135deg, #ECFEFF, #CFFAFE)" accentColor="#0E7490">
        <div style={{ padding: '10px 14px', background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#115E59', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="fas fa-file-pdf" style={{ fontSize: 11 }}></i>
          Controls how invoices and annexures are generated for trips on this route.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <FormField label="Document Series" value={form.documentSeries} onChange={set('documentSeries')} placeholder="e.g. GTLC/Number/F-26" />
          <FormField label="Invoice Type" value={form.invoiceTypeId} onChange={set('invoiceTypeId')} options={invoiceTypeOptions} />
          <FormField label="Annexure Type" value={form.annexureTypeId} onChange={set('annexureTypeId')} options={annexureTypeOptions} />
        </div>
      </Section>

      {/* ═══ 2. ROUTE CONTRACT ═══ */}
      <Section title="Route Contract" emoji="📝" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
          <i className="fas fa-info-circle" style={{ fontSize: 11 }}></i>
          Contract terms + charge columns. These are templatised per route and feed into trip settlement & client invoicing.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          <FormField label="Billing Type" value={form.billingType} onChange={set('billingType')} options={BILLING_TYPES} />
          <FormField label="SLA (HRS)" value={form.slaHrs} onChange={set('slaHrs')} type="number" placeholder="e.g. 26" />
          <FormField label="Payment Terms" value={form.payTerms} onChange={set('payTerms')} options={PAYMENT_TERMS} />
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          Charge Columns (Per Trip → Invoice)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          <FormField label="Freight Rate" value={form.freightRate} onChange={set('freightRate')} type="number" placeholder="e.g. 47130" />
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
          <FormField label="Driver Expense (₹)" value={form.driverExpense} onChange={set('driverExpense')} type="number" placeholder="e.g. 2200" />
          <FormField label="Toll Expense (₹)" value={form.tollExpense} onChange={set('tollExpense')} type="number" placeholder="e.g. 8400" />
          <FormField label="Diesel (Litres)" value={form.diesel} onChange={set('diesel')} type="number" placeholder="e.g. 300" />
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
// READ-ONLY VIEW SECTIONS
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
          <ReadField label="Route Name" value={rt.name} />
          <ReadField label="Ledger Account" value={rt.ledgerAccountName} />
          <ReadField label="Vehicle Type" value={rt.vType || rt.vehicleType} />
          <ReadField label="Branch" value={rt.branch} />
          <ReadField label="Origin" value={rt.origin} />
          <ReadField label="Origin Pincode" value={rt.originPin} mono />
          <ReadField label="Destination" value={rt.dest || rt.destination} />
          <ReadField label="Dest Pincode" value={rt.destPin} mono />
          <ReadField label="Via Highway" value={rt.via} />
          <ReadField label="Distance" value={rt.dist ? `${rt.dist.toLocaleString()} km` : '—'} />
          <ReadField label="Est. Duration" value={rt.estTime ? `${rt.estTime} hrs` : '—'} />
        </div>
      </Section>

      {/* Document & PDF Config */}
      <Section title="Document & PDF Config" emoji="📄" borderColor="#A5F3FC" headerBg="linear-gradient(135deg, #ECFEFF, #CFFAFE)" accentColor="#0E7490">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <ReadField label="Document Series" value={rt.documentSeries} mono />
          <ReadField label="Invoice Type" value={rt.invoiceTypeName} />
          <ReadField label="Annexure Type" value={rt.annexureTypeName} />
        </div>
      </Section>
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
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F', marginTop: 4 }}>{rt.tripsMtd || 0} / {rt.trips || 0}</div>
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

        {/* Charge columns */}
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
