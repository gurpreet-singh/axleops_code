import { useState, useEffect } from 'react';
import useSliderStore from '../../stores/sliderStore';
import { createVehicle, updateVehicle, deleteVehicle } from '../../services/vehicleService';
import { getVehicleCompliance, createComplianceDocument, getVersionHistory, cancelComplianceDocument, getVehicleComplianceSummary } from '../../services/complianceService';
import { getMaintenanceDashboard, getServiceTasks, createServiceTask, completeServiceTask, deleteServiceTask, getIssues, createIssue, updateIssueStatus, getInspections, createInspection, getWarranties, createWarranty, computeHealthScore, getLoans, createLoan } from '../../services/maintenanceService';
import { getOperationsDashboard, getFuelEntries, createFuelEntry, getFuelSummary, getDriverAssignments, assignDriver, endDriverAssignment, getVehicleTrips, getVehicleDocuments, createVehicleDocument, deleteVehicleDocument } from '../../services/operationsService';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { FormField, Section } from '../../components/common/FormField';
import api from '../../services/api';

// ─── Reusable Section Header Action Button ──────────────────
function SectionAddBtn({ label, icon, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: `1.5px solid ${color}`, borderRadius: 6, padding: '3px 10px',
      fontSize: 10, fontWeight: 700, color, background: 'transparent',
      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color; }}
    >
      <i className={`fas fa-${icon}`} style={{ fontSize: 8 }}></i> {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATIC OPTIONS
// ═══════════════════════════════════════════════════════════════

const VEHICLE_CATEGORIES = [
  { value: '', label: 'Select category' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'NON_TRANSPORT', label: 'Non-Transport' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'GOVERNMENT', label: 'Government' },
];

const FUEL_TYPES = [
  { value: '', label: 'Select fuel' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'PETROL', label: 'Petrol' },
  { value: 'CNG', label: 'CNG' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const BODY_TYPES = [
  { value: '', label: 'Select body type' },
  { value: 'CLOSE_BODY', label: 'Close Body' },
  { value: 'OPEN_BODY', label: 'Open Body' },
  { value: 'TANKER', label: 'Tanker' },
  { value: 'CONTAINER', label: 'Container' },
  { value: 'FLATBED', label: 'Flatbed' },
  { value: 'TIPPER', label: 'Tipper / Dumper' },
  { value: 'TRAILER', label: 'Trailer' },
  { value: 'REFRIGERATED', label: 'Refrigerated' },
];

const OWNERSHIP_TYPES = [
  { value: '', label: 'Select ownership' },
  { value: 'OWNED', label: 'Owned' },
  { value: 'LEASED', label: 'Leased' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'MARKET', label: 'Market' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'SCRAPPED', label: 'Scrapped' },
];


// ═══════════════════════════════════════════════════════════════
// HELPER — build form state from vehicle or empty for create
// ═══════════════════════════════════════════════════════════════

function buildFormState(v) {
  if (!v) return {
    registrationNumber: '', vehicleCategory: 'TRANSPORT', vehicleTypeId: '',
    make: '', model: '', year: '', mfgMonthYear: '',
    chassisNumber: '', engineNumber: '',
    color: '', bodyType: '', fuelType: 'DIESEL', axleConfig: '',
    ulwKg: '', rlwKg: '', payloadCapacityKg: '', seatingCapacity: '', hpCc: '',
    odometer: '', status: 'ACTIVE',
    registrationDate: '', registrationState: '', rtoOffice: '',
    ownership: 'OWNED', soldFlag: false, hypothecation: '',
    vehicleGroup: '', groupId: '', branchId: '', clientId: '', operatorId: '',
  };

  return {
    registrationNumber: v.registrationNumber || '',
    vehicleCategory: v.vehicleCategory || 'TRANSPORT',
    vehicleTypeId: v.vehicleTypeId || '',
    make: v.make || '', model: v.model || '',
    year: v.year?.toString() || '',
    mfgMonthYear: v.mfgMonthYear || '',
    chassisNumber: v.chassisNumber || '', engineNumber: v.engineNumber || '',
    color: v.color || '', bodyType: v.bodyType || '',
    fuelType: v.fuelType || 'DIESEL', axleConfig: v.axleConfig || '',
    ulwKg: v.ulwKg?.toString() || '', rlwKg: v.rlwKg?.toString() || '',
    payloadCapacityKg: v.payloadCapacityKg?.toString() || '',
    seatingCapacity: v.seatingCapacity?.toString() || '', hpCc: v.hpCc || '',
    odometer: v.odometer?.toString() || '', status: v.status || 'ACTIVE',
    registrationDate: v.registrationDate || '', registrationState: v.registrationState || '',
    rtoOffice: v.rtoOffice || '',
    ownership: v.ownership || 'OWNED', soldFlag: v.soldFlag || false,
    hypothecation: v.hypothecation || '',
    vehicleGroup: v.vehicleGroup || '', groupId: v.groupId || '',
    branchId: v.branchId || '', clientId: v.clientId || '', operatorId: v.operatorId || '',
  };
}

// Convert form state → API payload
function formToPayload(form) {
  const num = (v) => v ? parseInt(v, 10) : null;
  const dec = (v) => v ? parseFloat(v) : null;
  return {
    registrationNumber: form.registrationNumber || null,
    vehicleCategory: form.vehicleCategory || null,
    vehicleTypeId: form.vehicleTypeId || null,
    make: form.make || null,
    model: form.model || null,
    year: num(form.year),
    mfgMonthYear: form.mfgMonthYear || null,
    chassisNumber: form.chassisNumber || null,
    engineNumber: form.engineNumber || null,
    color: form.color || null,
    bodyType: form.bodyType || null,
    fuelType: form.fuelType || null,
    axleConfig: form.axleConfig || null,
    ulwKg: num(form.ulwKg),
    rlwKg: num(form.rlwKg),
    payloadCapacityKg: num(form.payloadCapacityKg),
    seatingCapacity: num(form.seatingCapacity),
    hpCc: form.hpCc || null,
    odometer: dec(form.odometer),
    status: form.status || 'ACTIVE',
    registrationDate: form.registrationDate || null,
    registrationState: form.registrationState || null,
    rtoOffice: form.rtoOffice || null,
    ownership: form.ownership || null,
    soldFlag: form.soldFlag || false,
    hypothecation: form.hypothecation || null,
    vehicleGroup: form.vehicleGroup || null,
    groupId: form.groupId || null,
    branchId: form.branchId || null,
    clientId: form.clientId || null,
    operatorId: form.operatorId || null,
  };
}


// ═══════════════════════════════════════════════════════════════
// VEHICLE CREATE SLIDER CONTENT
// ═══════════════════════════════════════════════════════════════

export function VehicleCreateContent({ onSave }) {
  const { updateSlider } = useSliderStore();
  const [form, setForm] = useState(buildFormState(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.registrationNumber.trim()) {
      setError('Registration Number is required');
      return;
    }
    if (!form.make.trim()) {
      setError('Make is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const vehicle = await createVehicle(formToPayload(form));
      onSave?.();
      // Swap to detail view
      updateSlider({
        title: vehicle.registrationNumber || 'Vehicle',
        subtitle: `${vehicle.make || ''} ${vehicle.model || ''}`.trim(),
        content: <VehicleDetailContent vehicle={vehicle} onSave={onSave} />,
      });
    } catch (e) {
      console.error('Failed to create vehicle:', e);
      setError(e?.response?.data?.message || 'Failed to create vehicle');
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
          <i className="fas fa-plus" style={{ fontSize: 10 }}></i> {saving ? 'Saving…' : 'Create Vehicle'}
        </button>
        <div style={{ flex: 1 }}></div>
        {error && <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <VehicleFormSections form={form} set={set} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// VEHICLE DETAIL SLIDER CONTENT (view + edit, with tabs)
// ═══════════════════════════════════════════════════════════════

export function VehicleDetailContent({ vehicle, onSave }) {
  const { closeSlider } = useSliderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(buildFormState(vehicle));
  const [activeTab, setActiveTab] = useState('overview');
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const statusColor = vehicle.status === 'ACTIVE' ? '#16A34A' : vehicle.status === 'IN_MAINTENANCE' ? '#D97706' : vehicle.status === 'INACTIVE' ? '#94A3B8' : '#DC2626';

  const handleSave = async () => {
    if (!form.registrationNumber.trim()) {
      setError('Registration Number is required');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateVehicle(vehicle.id, formToPayload(form));
      setIsEditing(false);
      onSave?.();
    } catch (e) {
      console.error('Failed to update vehicle:', e);
      setError(e?.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteVehicle(vehicle.id);
    closeSlider();
    onSave?.();
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
    { id: 'operations', label: 'Operations', icon: 'fas fa-route' },
    { id: 'compliance', label: 'Compliance', icon: 'fas fa-shield-alt' },
  ];

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
          <button onClick={() => { setIsEditing(false); setForm(buildFormState(vehicle)); setError(null); }} style={{
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

      {/* Status row */}
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F1F5F9' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusColor + '18', padding: '4px 12px', borderRadius: 20, border: `1px solid ${statusColor}40` }}>
          {vehicle.status?.replace('_', ' ')}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{vehicle.vehicleCategory}</span>
        {vehicle.ownership && <span style={{ fontSize: 11, color: '#94A3B8' }}>• {vehicle.ownership}</span>}
      </div>

      {/* Tabs */}
      <div className="slider-tabs">
        {TABS.map(t => (
          <div key={t.id}
            className={`slider-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            <i className={t.icon} style={{ fontSize: 10, marginRight: 5 }}></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px 20px 40px' }}>
        {activeTab === 'overview' && (
          isEditing ? (
            <VehicleFormSections form={form} set={set} />
          ) : (
            <VehicleViewSections v={vehicle} />
          )
        )}

        {activeTab === 'operations' && <OperationsTab vehicle={vehicle} />}
        {activeTab === 'compliance' && <ComplianceTab vehicle={vehicle} />}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        entityName={vehicle.registrationNumber}
        entityType="Vehicle"
      />
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// EDITABLE FORM SECTIONS (used by both create and edit)
// ═══════════════════════════════════════════════════════════════

function VehicleFormSections({ form, set }) {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    api.get('/masters/vehicle-types/dropdown').then(({ data }) => setVehicleTypes(data || [])).catch(() => {});
    api.get('/branches').then(({ data }) => setBranches(data || [])).catch(() => setBranches([]));
    api.get('/clients').then(({ data }) => setClients(data || [])).catch(() => setClients([]));
    api.get('/users').then(({ data }) => setContacts(data || [])).catch(() => setContacts([]));
  }, []);

  const vehicleTypeOptions = [
    { value: '', label: 'Select vehicle type' },
    ...vehicleTypes.map(vt => ({ value: vt.id, label: vt.name })),
  ];
  const branchOptions = [
    { value: '', label: 'Select branch' },
    ...branches.map(b => ({ value: b.id, label: b.name })),
  ];
  const clientOptions = [
    { value: '', label: 'Select client' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
  ];
  const operatorOptions = [
    { value: '', label: 'Select operator' },
    ...contacts.map(c => ({ value: c.id, label: c.name })),
  ];

  return (
    <>
      {/* ═══ 1. VEHICLE IDENTIFICATION ═══ */}
      <Section title="Vehicle Information" emoji="🚛" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Registration Number" value={form.registrationNumber} onChange={set('registrationNumber')} required placeholder="e.g. MH04VW6256" />
          <FormField label="Vehicle Category" value={form.vehicleCategory} onChange={set('vehicleCategory')} options={VEHICLE_CATEGORIES} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Vehicle Type" value={form.vehicleTypeId} onChange={set('vehicleTypeId')} options={vehicleTypeOptions} />
          <FormField label="Body Type" value={form.bodyType} onChange={set('bodyType')} options={BODY_TYPES} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Make" value={form.make} onChange={set('make')} required placeholder="e.g. BharatBenz" />
          <FormField label="Model" value={form.model} onChange={set('model')} placeholder="e.g. 1217C" />
          <FormField label="Year" value={form.year} onChange={set('year')} type="number" placeholder="e.g. 2024" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Chassis Number" value={form.chassisNumber} onChange={set('chassisNumber')} placeholder="VIN / Chassis No." />
          <FormField label="Engine Number" value={form.engineNumber} onChange={set('engineNumber')} placeholder="Engine No." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <FormField label="Fuel Type" value={form.fuelType} onChange={set('fuelType')} options={FUEL_TYPES} />
          <FormField label="Color" value={form.color} onChange={set('color')} placeholder="e.g. White" />
          <FormField label="Mfg. Month/Year" value={form.mfgMonthYear} onChange={set('mfgMonthYear')} type="date" />
        </div>
      </Section>

      {/* ═══ 2. DIMENSIONS & CAPACITY ═══ */}
      <Section title="Dimensions & Capacity" emoji="📐" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Unladen Weight (kg)" value={form.ulwKg} onChange={set('ulwKg')} type="number" placeholder="e.g. 5500" />
          <FormField label="Gross Vehicle Weight (kg)" value={form.rlwKg} onChange={set('rlwKg')} type="number" placeholder="e.g. 16200" />
          <FormField label="Payload Capacity (kg)" value={form.payloadCapacityKg} onChange={set('payloadCapacityKg')} type="number" placeholder="e.g. 10700" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <FormField label="Axle Config" value={form.axleConfig} onChange={set('axleConfig')} placeholder="e.g. 6x4" />
          <FormField label="HP / CC" value={form.hpCc} onChange={set('hpCc')} placeholder="e.g. 210 HP / 7200 CC" />
          <FormField label="Seating Capacity" value={form.seatingCapacity} onChange={set('seatingCapacity')} type="number" placeholder="Passengers" />
        </div>
      </Section>

      {/* ═══ 3. ASSIGNMENT ═══ */}
      <Section title="Assignment" emoji="🏢" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Branch" value={form.branchId} onChange={set('branchId')} options={branchOptions} />
          <FormField label="Vehicle Group" value={form.vehicleGroup} onChange={set('vehicleGroup')} placeholder="e.g. Mumbai Fleet" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Client (Owner)" value={form.clientId} onChange={set('clientId')} options={clientOptions} />
          <FormField label="Operator" value={form.operatorId} onChange={set('operatorId')} options={operatorOptions} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Ownership" value={form.ownership} onChange={set('ownership')} options={OWNERSHIP_TYPES} />
          <FormField label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
        </div>
      </Section>

      {/* ═══ 4. REGISTRATION ═══ */}
      <Section title="Registration" emoji="📋" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Registration Date" value={form.registrationDate} onChange={set('registrationDate')} type="date" />
          <FormField label="Registration State" value={form.registrationState} onChange={set('registrationState')} placeholder="e.g. Maharashtra" />
          <FormField label="RTO Office" value={form.rtoOffice} onChange={set('rtoOffice')} placeholder="e.g. R.T.O. Pune" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <FormField label="Hypothecation" value={form.hypothecation} onChange={set('hypothecation')} placeholder="Bank/financer details" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Odometer (km)" value={form.odometer} onChange={set('odometer')} type="number" placeholder="e.g. 145200" />
          <div></div>
        </div>
      </Section>


    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// READ-ONLY VIEW SECTIONS (Overview tab)
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

function VehicleViewSections({ v }) {
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const fmtKg = (n) => n ? n.toLocaleString('en-IN') + ' kg' : null;

  return (
    <>
      {/* Key Details */}
      <Section title="Key Details" emoji="🚛" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ReadField label="Registration Number" value={v.registrationNumber} mono />
          <ReadField label="Vehicle Type" value={v.vehicleTypeName} />
          <ReadField label="Make" value={v.make} />
          <ReadField label="Model" value={v.model} />
          <ReadField label="Year" value={v.year?.toString()} />
          <ReadField label="Body Type" value={v.bodyType?.replace('_', ' ')} />
          <ReadField label="Chassis Number" value={v.chassisNumber} mono />
          <ReadField label="Engine Number" value={v.engineNumber} mono />
          <ReadField label="Fuel Type" value={v.fuelType} />
          <ReadField label="Color" value={v.color} />
          <ReadField label="Odometer" value={v.odometer ? v.odometer.toLocaleString('en-IN') + ' km' : null} />
          <ReadField label="Axle Config" value={v.axleConfig} />
        </div>
      </Section>

      {/* Dimensions & Weight */}
      <Section title="Dimensions & Capacity" emoji="📐" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <ReadField label="Unladen Weight" value={fmtKg(v.ulwKg)} />
          <ReadField label="Gross Vehicle Weight" value={fmtKg(v.rlwKg)} />
          <ReadField label="Payload Capacity" value={fmtKg(v.payloadCapacityKg)} />
          <ReadField label="Axle Config" value={v.axleConfig} />
          <ReadField label="HP / CC" value={v.hpCc} />
          <ReadField label="Seating Capacity" value={v.seatingCapacity?.toString()} />
        </div>
      </Section>

      {/* Assignment */}
      <Section title="Assignment" emoji="🏢" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ReadField label="Branch" value={v.branchName} />
          <ReadField label="Vehicle Group" value={v.vehicleGroup} />
          <ReadField label="Client (Owner)" value={v.clientName} />
          <ReadField label="Operator" value={v.operatorName} />
          <ReadField label="Ownership" value={v.ownership} />
        </div>
      </Section>

      {/* Registration */}
      <Section title="Registration" emoji="📋" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <ReadField label="Registration Date" value={fmtDate(v.registrationDate)} />
          <ReadField label="State" value={v.registrationState} />
          <ReadField label="RTO Office" value={v.rtoOffice} />
          <ReadField label="Hypothecation" value={v.hypothecation} />
          <ReadField label="Mfg. Month/Year" value={fmtDate(v.mfgMonthYear)} />
          <div></div>
        </div>
      </Section>


    </>
  );
}

function ExpiryCard({ label, date }) {
  const isExpired = date && new Date(date) < new Date();
  const isExpiring = date && !isExpired && (new Date(date) - new Date()) / (1000 * 60 * 60 * 24) < 30;
  const color = !date ? '#94A3B8' : isExpired ? '#DC2626' : isExpiring ? '#D97706' : '#16A34A';
  const bg = !date ? '#F8FAFC' : isExpired ? '#FEF2F2' : isExpiring ? '#FFFBEB' : '#F0FDF4';
  const statusText = !date ? 'Not Set' : isExpired ? 'EXPIRED' : isExpiring ? 'EXPIRING SOON' : 'ACTIVE';

  return (
    <div style={{ padding: 14, borderRadius: 12, border: `1.5px solid ${color}30`, background: bg, textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
        {date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color, padding: '2px 8px', borderRadius: 10, background: color + '18', display: 'inline-block' }}>
        {statusText}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// OPERATIONS TAB — Full implementation (Phase 4)
// ═══════════════════════════════════════════════════════════════

const FUEL_TYPES_OPS = [{ value: 'DIESEL', label: 'Diesel' }, { value: 'PETROL', label: 'Petrol' }, { value: 'CNG', label: 'CNG' }, { value: 'ELECTRIC', label: 'Electric' }];
const DOC_CAT_OPTS = [{ value: '', label: 'Select category' }, { value: 'PHOTO', label: 'Photo' }, { value: 'INVOICE', label: 'Invoice' }, { value: 'RECEIPT', label: 'Receipt' }, { value: 'RC_COPY', label: 'RC Copy' }, { value: 'INSURANCE_COPY', label: 'Insurance Copy' }, { value: 'OTHER', label: 'Other' }];

function OperationsTab({ vehicle }) {
  const [dash, setDash] = useState(null);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [fuelSummary, setFuelSummary] = useState({ totalLitres: 0, totalCost: 0, avgMileage: 0, thisMonth: 0 });
  const [assignments, setAssignments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, fe, fs, da, t, dc] = await Promise.all([
        getOperationsDashboard(vehicle.id),
        getFuelEntries(vehicle.id).catch(() => []),
        getFuelSummary(vehicle.id),
        getDriverAssignments(vehicle.id).catch(() => []),
        getVehicleTrips(vehicle.id).catch(() => []),
        getVehicleDocuments(vehicle.id).catch(() => []),
      ]);
      setDash(d); setFuelEntries(fe || []); setFuelSummary(fs);
      setAssignments(da || []); setTrips(t || []); setDocs(dc || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [vehicle.id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}><i className="fas fa-spinner fa-spin"></i> Loading operations data...</div>;

  const cd = dash?.currentDriver;

  return (
    <>
      {/* Operations Summary */}
      <Section title="Operations Summary" emoji="📊" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <MiniStat label="Total Trips" value={dash?.totalTrips || 0} color="#6366F1" />
          <MiniStat label="Active" value={dash?.activeTrips || 0} color="#0369A1" />
          <MiniStat label="Completed" value={dash?.completedTrips || 0} color="#16A34A" />
          <MiniStat label="Documents" value={dash?.documentCount || 0} color="#64748B" />
        </div>
        {cd ? (
          <div style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #6366F130', background: '#EEF2FF', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{cd.name?.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{cd.name}</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Current Driver • Since {fmtDateSafe(cd.since)}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #16A34A30' }}>ASSIGNED</span>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', padding: '8px 0' }}>No driver assigned</div>
        )}
      </Section>

      {/* Fuel Log */}
      <Section title="Fuel Log" emoji="⛽" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412"
        headerAction={<SectionAddBtn label={showFuelForm ? 'Cancel' : 'Add Fuel Entry'} icon={showFuelForm ? 'times' : 'plus'} color="#9A3412" onClick={() => setShowFuelForm(!showFuelForm)} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ padding: 10, borderRadius: 8, border: '1px solid #EA580C25', background: '#EA580C08', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>{Number(fuelSummary.avgMileage || 0).toFixed(1)}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#EA580C', textTransform: 'uppercase' }}>Avg km/L</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, border: '1px solid #D9770625', background: '#D9770608', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>{Number(fuelSummary.totalLitres || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Total Litres</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, border: '1px solid #DC262625', background: '#DC262608', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>₹{Number(fuelSummary.totalCost || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Total Cost</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, border: '1px solid #16A34A25', background: '#16A34A08', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>₹{Number(fuelSummary.thisMonth || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>This Month</div>
          </div>
        </div>
        {showFuelForm && <AddFuelForm vehicleId={vehicle.id} fuelType={vehicle.fuelType} onSaved={() => { setShowFuelForm(false); load(); }} />}
        {fuelEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}>No fuel entries recorded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fuelEntries.slice(0, 8).map(f => (
              <div key={f.id} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-gas-pump" style={{ fontSize: 12 }}></i></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{f.quantityLitres}L @ ₹{f.ratePerLitre}/L</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{fmtDateSafe(f.fillDate)} {f.stationName ? `• ${f.stationName}` : ''} {f.odometerReading ? `• ${Number(f.odometerReading).toLocaleString('en-IN')} km` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>₹{Number(f.totalCost).toLocaleString('en-IN')}</div>
                  {f.mileageKmpl && <div style={{ fontSize: 10, fontWeight: 600, color: Number(f.mileageKmpl) > 4 ? '#16A34A' : '#DC2626' }}>{Number(f.mileageKmpl).toFixed(1)} km/L</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Driver Assignments */}
      <Section title="Driver History" emoji="👤" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9" collapsible
        headerAction={<SectionAddBtn label={showAssignForm ? 'Cancel' : 'Assign Driver'} icon={showAssignForm ? 'times' : 'user-plus'} color="#6D28D9" onClick={() => setShowAssignForm(!showAssignForm)} />}
      >
        {showAssignForm && <AssignDriverForm vehicleId={vehicle.id} onSaved={() => { setShowAssignForm(false); load(); }} />}
        {assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}>No driver assignment history.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {assignments.map(a => (
              <div key={a.id} style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${a.isCurrent ? '#6366F130' : '#E2E8F0'}`, background: a.isCurrent ? '#EEF2FF' : '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.isCurrent ? '#6366F1' : '#94A3B8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{a.driverName?.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{a.driverName} <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{a.assignmentType}</span></div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{fmtDateSafe(a.assignedFrom)} → {a.assignedTo ? fmtDateSafe(a.assignedTo) : 'Present'}</div>
                </div>
                {a.isCurrent && <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 8, background: '#F0FDF4', color: '#16A34A', border: '1px solid #16A34A30' }}>CURRENT</span>}
                {a.isCurrent && <button onClick={async () => { await endDriverAssignment(a.id); load(); }} style={{ fontSize: 10, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>End</button>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Trip History */}
      <Section title="Trip History" emoji="🛣️" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669" collapsible defaultCollapsed>
        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}>No trips recorded for this vehicle.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {trips.slice(0, 10).map(t => (
              <div key={t.id} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-route" style={{ fontSize: 12 }}></i></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{t.tripNumber} <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{t.lrNumber ? `LR: ${t.lrNumber}` : ''}</span></div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{t.origin} → {t.destination} {t.driverName ? `• ${t.driverName}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <TaskStatusBadge status={t.status} />
                  {t.revenue && <div style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', marginTop: 4 }}>₹{Number(t.revenue).toLocaleString('en-IN')}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Vehicle Documents */}
      <Section title="Documents" emoji="📁" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626" collapsible
        headerAction={<SectionAddBtn label={showDocForm ? 'Cancel' : 'Add Document'} icon={showDocForm ? 'times' : 'file-upload'} color="#DC2626" onClick={() => setShowDocForm(!showDocForm)} />}
      >
        {showDocForm && <AddDocumentForm vehicleId={vehicle.id} onSaved={() => { setShowDocForm(false); load(); }} />}
        {docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}>No documents uploaded.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {docs.map(d => {
              const iconMap = { PHOTO: 'fa-image', INVOICE: 'fa-file-invoice', RECEIPT: 'fa-receipt', RC_COPY: 'fa-id-card', INSURANCE_COPY: 'fa-shield-alt', OTHER: 'fa-file' };
              return (
                <div key={d.id} style={{ padding: 10, borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`fas ${iconMap[d.documentCategory] || 'fa-file'}`} style={{ fontSize: 14, color: '#64748B' }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1E293B' }}>{d.name}</div>
                    <div style={{ fontSize: 9, color: '#94A3B8' }}>{d.documentCategory} • {fmtDateSafe(d.uploadDate)}</div>
                  </div>
                  <button onClick={async () => { await deleteVehicleDocument(d.id); load(); }} style={{ fontSize: 9, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 4, padding: '3px 6px', cursor: 'pointer' }}><i className="fas fa-times"></i></button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

// ─── Operations Inline Forms ────────────────────────────────

function AddFuelForm({ vehicleId, fuelType, onSaved }) {
  const [f, sF] = useState({ fillDate: '', quantityLitres: '', totalCost: '', ratePerLitre: '', odometerReading: '', stationName: '', receiptNumber: '', fuelType: fuelType || 'DIESEL' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.quantityLitres || !f.totalCost) return; setSaving(true);
    try { await createFuelEntry(vehicleId, f); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #FDBA74', background: '#FFF7ED', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Fill Date" value={f.fillDate} onChange={s('fillDate')} type="date" />
        <FormField label="Quantity (L)" value={f.quantityLitres} onChange={s('quantityLitres')} type="number" required placeholder="e.g. 120" />
        <FormField label="Total Cost (₹)" value={f.totalCost} onChange={s('totalCost')} type="number" required placeholder="e.g. 10500" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Rate/L (₹)" value={f.ratePerLitre} onChange={s('ratePerLitre')} type="number" placeholder="Auto-computed" />
        <FormField label="Odometer (km)" value={f.odometerReading} onChange={s('odometerReading')} type="number" placeholder="Current reading" />
        <FormField label="Station" value={f.stationName} onChange={s('stationName')} placeholder="e.g. HP Pump Pune" />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#9A3412', background: '#FFF7ED', border: '1.5px solid #9A3412', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-check" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Save Fuel Entry'}
      </button>
    </div>
  );
}

function AssignDriverForm({ vehicleId, onSaved }) {
  const [drivers, setDrivers] = useState([]);
  const [f, sF] = useState({ driverId: '', assignedFrom: '', assignmentType: 'PRIMARY', notes: '' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/users', { params: { role: 'DRIVER' } }).then(({ data }) => setDrivers(data || [])).catch(() => setDrivers([]));
  }, []);

  const driverOpts = [{ value: '', label: 'Select driver' }, ...drivers.map(d => ({ value: d.id, label: `${d.firstName}${d.lastName ? ' ' + d.lastName : ''}` }))];

  const save = async () => {
    if (!f.driverId) return; setSaving(true);
    try { await assignDriver(vehicleId, f); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #C4B5FD', background: '#F5F3FF', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Driver" value={f.driverId} onChange={s('driverId')} options={driverOpts} required />
        <FormField label="Assignment Date" value={f.assignedFrom} onChange={s('assignedFrom')} type="date" />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', border: '1.5px solid #6D28D9', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-user-check" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Assign Driver'}
      </button>
    </div>
  );
}

function AddDocumentForm({ vehicleId, onSaved }) {
  const [f, sF] = useState({ name: '', documentCategory: 'OTHER', notes: '' });
  const [saving, setSaving] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const s = k => v => sF(p => ({ ...p, [k]: v }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'vehicle-docs');
      const { data } = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadedFile(data);
      // Auto-fill name from filename if empty
      if (!f.name) sF(p => ({ ...p, name: file.name.replace(/\.[^.]+$/, '') }));
    } catch (err) {
      setError('File upload failed');
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!f.name) { setError('Document name is required'); return; }
    setSaving(true); setError(null);
    try {
      await createVehicleDocument(vehicleId, {
        ...f,
        fileUrl: uploadedFile?.fileUrl || null,
        fileName: uploadedFile?.fileName || null,
        fileType: uploadedFile?.fileType || null,
        fileSizeBytes: uploadedFile?.fileSizeBytes || null,
      });
      onSaved?.();
    } catch (e) { setError('Failed to save'); console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #FECACA', background: '#FEF2F2', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Document Name" value={f.name} onChange={s('name')} required placeholder="e.g. Vehicle Photo - Front" />
        <FormField label="Category" value={f.documentCategory} onChange={s('documentCategory')} options={DOC_CAT_OPTS} />
      </div>
      {/* File Upload Zone */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Upload File</div>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8,
          border: `1.5px dashed ${uploadedFile ? '#16A34A' : '#94A3B8'}`, background: uploadedFile ? '#F0FDF410' : '#F8FAFC',
          cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
          <i className={`fas fa-${uploading ? 'spinner fa-spin' : uploadedFile ? 'check-circle' : 'cloud-upload-alt'}`}
            style={{ fontSize: 16, color: uploadedFile ? '#16A34A' : '#94A3B8' }}></i>
          <div>
            {uploading ? (
              <span style={{ fontSize: 11, color: '#64748B' }}>Uploading...</span>
            ) : uploadedFile ? (
              <div>
                <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>{uploadedFile.fileName}</div>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>{(uploadedFile.fileSizeBytes / 1024).toFixed(1)} KB • {uploadedFile.fileType?.toUpperCase()}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Click to upload file</div>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>PDF, JPG, PNG, DOC, XLS (max 10MB)</div>
              </>
            )}
          </div>
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <FormField label="Notes" value={f.notes} onChange={s('notes')} placeholder="Optional notes" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1.5px solid #DC2626', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
          <i className="fas fa-file-upload" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Save Document'}
        </button>
        {error && <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAINTENANCE & HEALTH TAB — Full implementation (Phase 3)
// ═══════════════════════════════════════════════════════════════


const TASK_TYPE_OPTS = [{ value: '', label: 'Select type' }, { value: 'PREVENTIVE', label: 'Preventive' }, { value: 'CORRECTIVE', label: 'Corrective' }, { value: 'REGULATORY', label: 'Regulatory' }];
const ISSUE_PRIORITY_OPTS = [{ value: '', label: 'Select priority' }, { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' }];
const ISSUE_CAT_OPTS = [{ value: '', label: 'Select category' }, { value: 'MECHANICAL', label: 'Mechanical' }, { value: 'ELECTRICAL', label: 'Electrical' }, { value: 'BODY', label: 'Body' }, { value: 'TIRE', label: 'Tire' }, { value: 'BRAKE', label: 'Brake' }, { value: 'OTHER', label: 'Other' }];
const WARRANTY_TYPES = [{ value: '', label: 'Select type' }, { value: 'OEM', label: 'OEM' }, { value: 'EXTENDED', label: 'Extended' }, { value: 'COMPONENT', label: 'Component' }, { value: 'TIRE', label: 'Tire' }, { value: 'BATTERY', label: 'Battery' }];

function MaintenanceTab({ vehicle }) {
  const [dash, setDash] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showWarrantyForm, setShowWarrantyForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, t, i, ins, w] = await Promise.all([
        getMaintenanceDashboard(vehicle.id),
        getServiceTasks(vehicle.id).catch(() => []),
        getIssues(vehicle.id).catch(() => []),
        getInspections(vehicle.id).catch(() => []),
        getWarranties(vehicle.id).catch(() => []),
      ]);
      setDash(d); setTasks(t || []); setIssues(i || []);
      setInspections(ins || []); setWarranties(w || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [vehicle.id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}><i className="fas fa-spinner fa-spin"></i> Loading maintenance data...</div>;

  const hs = dash?.healthScore || { score: 0, maintenanceScore: 0, issueScore: 0, inspectionScore: 0, complianceScore: 0 };
  const scoreColor = hs.score >= 80 ? '#16A34A' : hs.score >= 50 ? '#D97706' : '#DC2626';

  return (
    <>
      {/* Health Score & Summary */}
      <Section title="Vehicle Health" emoji="\u2764\uFE0F" borderColor="#A5F3FC" headerBg="linear-gradient(135deg, #ECFEFF, #CFFAFE)" accentColor="#0E7490">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: scoreColor + '10' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: scoreColor }}>{hs.score}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: scoreColor, textTransform: 'uppercase' }}>Health</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <ScoreFactor label="Maintenance" score={hs.maintenanceScore} />
            <ScoreFactor label="Issues" score={hs.issueScore} />
            <ScoreFactor label="Inspections" score={hs.inspectionScore} />
            <ScoreFactor label="Compliance" score={hs.complianceScore} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          <MiniStat label="Overdue Tasks" value={dash?.overdueTasks || 0} color="#DC2626" />
          <MiniStat label="Active Tasks" value={dash?.activeTasks || 0} color="#0369A1" />
          <MiniStat label="Open Issues" value={dash?.openIssues || 0} color="#D97706" />
          <MiniStat label="Inspections" value={dash?.totalInspections || 0} color="#16A34A" />
        </div>
        <button onClick={async () => { await computeHealthScore(vehicle.id); load(); }} style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: '#0E7490', background: 'none', border: '1px solid #0E749040', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
          <i className="fas fa-sync" style={{ marginRight: 4 }}></i> Recalculate Health Score
        </button>
      </Section>

      {/* Service Tasks */}
      <Section title="Service Schedule" emoji="\uD83D\uDD27" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setShowTaskForm(!showTaskForm)} style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', background: '#F0F9FF', border: '1.5px solid #0369A1', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <i className={`fas fa-${showTaskForm ? 'times' : 'plus'}`} style={{ marginRight: 4, fontSize: 9 }}></i>{showTaskForm ? 'Cancel' : 'Add Task'}
          </button>
        </div>
        {showTaskForm && <AddTaskForm vehicleId={vehicle.id} onSaved={() => { setShowTaskForm(false); load(); }} />}
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 12 }}>No service tasks scheduled.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.filter(t => t.status !== 'CANCELLED').map(t => (
              <div key={t.id} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: t.status === 'OVERDUE' ? '#FEF2F2' : t.status === 'COMPLETED' ? '#F0FDF4' : '#EFF6FF', color: t.status === 'OVERDUE' ? '#DC2626' : t.status === 'COMPLETED' ? '#16A34A' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas fa-${t.status === 'COMPLETED' ? 'check' : t.status === 'OVERDUE' ? 'exclamation' : 'clock'}`} style={{ fontSize: 12 }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                    {t.taskType} • {t.nextDueDate ? `Due: ${fmtDateSafe(t.nextDueDate)}` : ''}
                    {t.intervalMonths ? ` • Every ${t.intervalMonths}mo` : ''}
                    {t.intervalKm ? ` • Every ${t.intervalKm.toLocaleString()}km` : ''}
                  </div>
                </div>
                <TaskStatusBadge status={t.status} />
                {t.status === 'ACTIVE' && <button onClick={async () => { await completeServiceTask(t.id); load(); }} style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', border: '1px solid #16A34A40', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }} title="Mark Complete"><i className="fas fa-check"></i></button>}
                <button onClick={async () => { await deleteServiceTask(t.id); load(); }} style={{ fontSize: 10, color: '#94A3B8', background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }} title="Remove"><i className="fas fa-times"></i></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Open Issues */}
      <Section title="Open Issues" emoji="\u26A0\uFE0F" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setShowIssueForm(!showIssueForm)} style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1.5px solid #DC2626', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <i className={`fas fa-${showIssueForm ? 'times' : 'plus'}`} style={{ marginRight: 4, fontSize: 9 }}></i>{showIssueForm ? 'Cancel' : 'Report Issue'}
          </button>
        </div>
        {showIssueForm && <AddIssueForm vehicleId={vehicle.id} onSaved={() => { setShowIssueForm(false); load(); }} />}
        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 12 }}>No issues reported. \u2705</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {issues.map(i => (
              <div key={i.id} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <PriorityDot priority={i.priority} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{i.title} <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{i.issueNumber}</span></div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{i.category} • Reported {fmtDateSafe(i.reportedDate)}</div>
                </div>
                <TaskStatusBadge status={i.status} />
                {i.status === 'OPEN' && <button onClick={async () => { await updateIssueStatus(i.id, 'RESOLVED', null); load(); }} style={{ fontSize: 10, fontWeight: 600, color: '#16A34A', background: '#F0FDF4', border: '1px solid #16A34A40', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Resolve</button>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Warranties */}
      <Section title="Warranties" emoji="\uD83D\uDEE1\uFE0F" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9" collapsible>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setShowWarrantyForm(!showWarrantyForm)} style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', border: '1.5px solid #6D28D9', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
            <i className={`fas fa-${showWarrantyForm ? 'times' : 'plus'}`} style={{ marginRight: 4, fontSize: 9 }}></i>{showWarrantyForm ? 'Cancel' : 'Add Warranty'}
          </button>
        </div>
        {showWarrantyForm && <AddWarrantyForm vehicleId={vehicle.id} onSaved={() => { setShowWarrantyForm(false); load(); }} />}
        {warranties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 12 }}>No warranties recorded.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {warranties.map(w => {
              const isExp = w.expiryDate && new Date(w.expiryDate) < new Date();
              return (
                <div key={w.id} style={{ padding: 12, borderRadius: 10, border: `1.5px solid ${isExp ? '#FECACA' : '#E2E8F0'}`, background: isExp ? '#FEF2F2' : '#fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1E293B' }}>{w.warrantyType}</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{w.provider}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>{fmtDateSafe(w.startDate)} \u2192 {fmtDateSafe(w.expiryDate)}</div>
                  <TaskStatusBadge status={isExp ? 'EXPIRED' : w.status} />
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Inspection History */}
      <Section title="Inspection History" emoji="\uD83D\uDCCB" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669" collapsible defaultCollapsed>
        {inspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 12 }}>No inspections recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inspections.slice(0, 10).map(ins => (
              <div key={ins.id} style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: ins.overallResult === 'PASS' ? '#F0FDF4' : ins.overallResult === 'FAIL' ? '#FEF2F2' : '#FFFBEB', color: ins.overallResult === 'PASS' ? '#16A34A' : ins.overallResult === 'FAIL' ? '#DC2626' : '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                  {ins.overallResult === 'PASS' ? '\u2713' : ins.overallResult === 'FAIL' ? '\u2717' : '!'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{ins.formType} Inspection</div>
                  <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{new Date(ins.submittedAt).toLocaleString('en-IN')} {ins.defectsFound > 0 ? `\u2022 ${ins.defectsFound} defect(s)` : ''}</div>
                </div>
                <TaskStatusBadge status={ins.overallResult} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

// ─── Maintenance Helper Components ──────────────────────────

function ScoreFactor({ label, score }) {
  const c = score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{score || 0}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${color}25`, background: color + '08', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

function TaskStatusBadge({ status }) {
  const cfg = { ACTIVE: { c: '#2563EB', b: '#EFF6FF' }, COMPLETED: { c: '#16A34A', b: '#F0FDF4' }, OVERDUE: { c: '#DC2626', b: '#FEF2F2' }, OPEN: { c: '#D97706', b: '#FFFBEB' }, IN_PROGRESS: { c: '#0369A1', b: '#F0F9FF' }, RESOLVED: { c: '#16A34A', b: '#F0FDF4' }, CLOSED: { c: '#64748B', b: '#F1F5F9' }, DEFERRED: { c: '#94A3B8', b: '#F8FAFC' }, PASS: { c: '#16A34A', b: '#F0FDF4' }, FAIL: { c: '#DC2626', b: '#FEF2F2' }, CONDITIONAL: { c: '#D97706', b: '#FFFBEB' }, EXPIRED: { c: '#DC2626', b: '#FEF2F2' } };
  const s = cfg[status] || { c: '#64748B', b: '#F8FAFC' };
  return <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 8, background: s.b, color: s.c, border: `1px solid ${s.c}30` }}>{status}</span>;
}

function PriorityDot({ priority }) {
  const c = { CRITICAL: '#DC2626', HIGH: '#EA580C', MEDIUM: '#D97706', LOW: '#16A34A' };
  return <div style={{ width: 10, height: 10, borderRadius: '50%', background: c[priority] || '#94A3B8', flexShrink: 0 }} title={priority}></div>;
}

function AddTaskForm({ vehicleId, onSaved }) {
  const [f, sF] = useState({ name: '', taskType: 'PREVENTIVE', intervalMonths: '', intervalKm: '', nextDueDate: '', estimatedCost: '' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.name) return;
    setSaving(true);
    try { await createServiceTask(vehicleId, { ...f, intervalMonths: f.intervalMonths ? parseInt(f.intervalMonths) : null, intervalKm: f.intervalKm ? parseInt(f.intervalKm) : null }); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #BAE6FD', background: '#F0F9FF', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Task Name" value={f.name} onChange={s('name')} required placeholder="e.g. Engine Oil Change" />
        <FormField label="Type" value={f.taskType} onChange={s('taskType')} options={TASK_TYPE_OPTS} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Interval (months)" value={f.intervalMonths} onChange={s('intervalMonths')} type="number" placeholder="e.g. 6" />
        <FormField label="Interval (km)" value={f.intervalKm} onChange={s('intervalKm')} type="number" placeholder="e.g. 10000" />
        <FormField label="Next Due Date" value={f.nextDueDate} onChange={s('nextDueDate')} type="date" />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1.5px solid #059669', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-check" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Save Task'}
      </button>
    </div>
  );
}

function AddIssueForm({ vehicleId, onSaved }) {
  const [f, sF] = useState({ title: '', description: '', priority: 'MEDIUM', category: 'MECHANICAL' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.title) return;
    setSaving(true);
    try { await createIssue(vehicleId, f); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #FECACA', background: '#FEF2F2', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Issue Title" value={f.title} onChange={s('title')} required placeholder="e.g. Brake vibration on left front" />
        <FormField label="Priority" value={f.priority} onChange={s('priority')} options={ISSUE_PRIORITY_OPTS} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Category" value={f.category} onChange={s('category')} options={ISSUE_CAT_OPTS} />
        <FormField label="Description" value={f.description} onChange={s('description')} placeholder="Details..." />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1.5px solid #DC2626', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-exclamation-circle" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Report Issue'}
      </button>
    </div>
  );
}

function AddWarrantyForm({ vehicleId, onSaved }) {
  const [f, sF] = useState({ warrantyType: 'OEM', provider: '', startDate: '', expiryDate: '', policyNumber: '', coverageDetails: '' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.provider || !f.startDate || !f.expiryDate) return;
    setSaving(true);
    try { await createWarranty(vehicleId, f); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #C4B5FD', background: '#F5F3FF', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Warranty Type" value={f.warrantyType} onChange={s('warrantyType')} options={WARRANTY_TYPES} />
        <FormField label="Provider" value={f.provider} onChange={s('provider')} required placeholder="e.g. BharatBenz India" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Start Date" value={f.startDate} onChange={s('startDate')} type="date" required />
        <FormField label="Expiry Date" value={f.expiryDate} onChange={s('expiryDate')} type="date" required />
        <FormField label="Policy Number" value={f.policyNumber} onChange={s('policyNumber')} placeholder="Optional" />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', background: '#F5F3FF', border: '1.5px solid #6D28D9', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-check" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Save Warranty'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE TAB — Full implementation (Phase 2)
// ═══════════════════════════════════════════════════════════════

const DOC_TYPE_META = {
  RC: { label: 'Registration Certificate', icon: 'fas fa-id-card', color: '#6366F1' },
  PERMIT: { label: 'Permit', icon: 'fas fa-stamp', color: '#8B5CF6' },
  PUC: { label: 'PUC Certificate', icon: 'fas fa-leaf', color: '#16A34A' },
  PASSING: { label: 'Fitness / Passing', icon: 'fas fa-clipboard-check', color: '#0369A1' },
  INSURANCE: { label: 'Insurance', icon: 'fas fa-shield-alt', color: '#DC2626' },
  ROAD_TAX: { label: 'Road Tax', icon: 'fas fa-road', color: '#D97706' },
  GREEN_TAX: { label: 'Green Tax', icon: 'fas fa-seedling', color: '#059669' },
  AUTHORITY: { label: 'Authority', icon: 'fas fa-gavel', color: '#7C3AED' },
  CFRA: { label: 'CFRA', icon: 'fas fa-file-signature', color: '#0E7490' },
  PTI: { label: 'PTI', icon: 'fas fa-search', color: '#64748B' },
  FASTAG: { label: 'FASTag', icon: 'fas fa-wifi', color: '#EA580C' },
  PROFESSION_TAX: { label: 'Profession Tax', icon: 'fas fa-receipt', color: '#9333EA' },
};

const DOC_TYPE_OPTIONS = [
  { value: '', label: 'Select document type' },
  ...Object.entries(DOC_TYPE_META).map(([k, v]) => ({ value: k, label: v.label })),
];

function ComplianceTab({ vehicle }) {
  const [docs, setDocs] = useState([]);
  const [summary, setSummary] = useState({ active: 0, expiringSoon: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        getVehicleCompliance(vehicle.id, null, true),
        getVehicleComplianceSummary(vehicle.id),
      ]);
      setDocs(d || []);
      setSummary(s || { active: 0, expiringSoon: 0, expired: 0 });
    } catch (e) {
      console.error('Failed to load compliance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, [vehicle.id]);

  const filtered = filter === 'all' ? docs : docs.filter(d => d.expiryStatus === filter.toUpperCase());

  return (
    <>
      {/* Compliance Documents */}
      <Section title="Compliance Documents" emoji="🛡️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1"
        headerAction={<>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '4px 10px',
            fontSize: 10, fontWeight: 600, color: '#475569', background: '#fff', cursor: 'pointer',
          }}>
            <option value="all">All ({docs.length})</option>
            <option value="active">Active ({summary.active})</option>
            <option value="expiring_soon">Expiring ({summary.expiringSoon})</option>
            <option value="expired">Expired ({summary.expired})</option>
          </select>
          <SectionAddBtn label={showAddForm ? 'Cancel' : 'Add Document'} icon={showAddForm ? 'times' : 'plus'} color="#0369A1" onClick={() => setShowAddForm(!showAddForm)} />
        </>}
      >



        {/* Inline Add Form */}
        {showAddForm && <AddComplianceDocForm vehicleId={vehicle.id} onSaved={() => { setShowAddForm(false); loadDocs(); }} />}

        {/* Document List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
            <i className="fas fa-spinner fa-spin"></i> Loading compliance documents...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>No compliance documents found</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Click "Add Document" to add compliance records.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(doc => (
              <ComplianceDocCard
                key={doc.id}
                doc={doc}
                onCancel={async () => { await cancelComplianceDocument(doc.id); loadDocs(); }}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function CompStat({ label, value, color, bg }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, border: `1px solid ${color}30`, background: bg, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ComplianceDocCard({ doc, onCancel }) {
  const meta = DOC_TYPE_META[doc.documentType] || { label: doc.documentType, icon: 'fas fa-file', color: '#64748B' };
  const daysText = doc.daysRemaining != null
    ? doc.daysRemaining < 0 ? `${Math.abs(doc.daysRemaining)}d overdue` : `${doc.daysRemaining}d remaining`
    : 'No expiry';

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      border: '1.5px solid #E2E8F0', background: '#fff',
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = meta.color + '60'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: meta.color + '15', color: meta.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={meta.icon} style={{ fontSize: 14 }}></i>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
          {meta.label}
          <span style={{ marginLeft: 8, fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>v{doc.versionNumber}</span>
        </div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
          {doc.documentNumber || '—'} • {fmtDateSafe(doc.effectiveFrom)} → {fmtDateSafe(doc.effectiveTo)}
        </div>
      </div>
      <div style={{ textAlign: 'right', marginRight: 8 }}>
        <CompStatusBadge status={doc.expiryStatus || doc.status} />
        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: 600 }}>{daysText}</div>
      </div>
      <button onClick={onCancel} title="Cancel Document" style={{
        width: 28, height: 28, borderRadius: 6, border: '1px solid #FECACA',
        background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><i className="fas fa-times"></i></button>
    </div>
  );
}

function CompStatusBadge({ status }) {
  const cfg = {
    ACTIVE: { color: '#16A34A', bg: '#F0FDF4', label: 'Active' },
    EXPIRING_SOON: { color: '#D97706', bg: '#FFFBEB', label: 'Expiring Soon' },
    EXPIRED: { color: '#DC2626', bg: '#FEF2F2', label: 'Expired' },
    SUPERSEDED: { color: '#64748B', bg: '#F1F5F9', label: 'Superseded' },
    CANCELLED: { color: '#94A3B8', bg: '#F8FAFC', label: 'Cancelled' },
  };
  const c = cfg[status] || cfg.ACTIVE;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10,
      background: c.bg, color: c.color, border: `1px solid ${c.color}30`,
    }}>{c.label}</span>
  );
}

function fmtDateSafe(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Add Compliance Document Inline Form ────────────────────

function AddComplianceDocForm({ vehicleId, onSaved }) {
  const [form, setForm] = useState({
    documentType: '', documentNumber: '',
    effectiveFrom: '', effectiveTo: '',
    issuedDate: '', amount: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', 'compliance');
      const { data } = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadedFile(data);
    } catch (err) {
      setError('File upload failed');
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.documentType) { setError('Document type is required'); return; }
    setError(null);
    setSaving(true);
    try {
      await createComplianceDocument(vehicleId, {
        ...form,
        amount: form.amount ? parseFloat(form.amount) : null,
        fileUrl: uploadedFile?.fileUrl || null,
        fileName: uploadedFile?.fileName || null,
      });
      onSaved?.();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      padding: 16, borderRadius: 12, border: '1.5px solid #BAE6FD',
      background: '#F0F9FF', marginBottom: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#0369A1', marginBottom: 12 }}>
        <i className="fas fa-plus-circle" style={{ marginRight: 6 }}></i>Add Compliance Document
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <FormField label="Document Type" value={form.documentType} onChange={set('documentType')} options={DOC_TYPE_OPTIONS} required />
        <FormField label="Document Number" value={form.documentNumber} onChange={set('documentNumber')} placeholder="e.g. POL-2026-001" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <FormField label="Effective From" value={form.effectiveFrom} onChange={set('effectiveFrom')} type="date" />
        <FormField label="Effective To" value={form.effectiveTo} onChange={set('effectiveTo')} type="date" />
        <FormField label="Amount (₹)" value={form.amount} onChange={set('amount')} type="number" placeholder="e.g. 15000" />
      </div>
      {/* File Upload */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Upload Document</div>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8,
          border: '1.5px dashed #94A3B8', background: '#F8FAFC', cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
          <i className={`fas fa-${uploading ? 'spinner fa-spin' : uploadedFile ? 'check-circle' : 'cloud-upload-alt'}`}
            style={{ fontSize: 16, color: uploadedFile ? '#16A34A' : '#94A3B8' }}></i>
          <div>
            {uploading ? (
              <span style={{ fontSize: 11, color: '#64748B' }}>Uploading...</span>
            ) : uploadedFile ? (
              <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>{uploadedFile.fileName}</span>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>Click to upload or drag file</div>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>PDF, JPG, PNG, DOC (max 10MB)</div>
              </>
            )}
          </div>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <FormField label="Notes" value={form.notes} onChange={set('notes')} textarea placeholder="Additional details..." full />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #059669', borderRadius: 8, padding: '7px 16px',
          fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
          cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1,
        }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className="fas fa-check" style={{ fontSize: 10 }}></i> {saving ? 'Saving…' : 'Save Document'}
        </button>
        {error && <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle"></i> {error}</div>}
      </div>
    </div>
  );
}

// ─── Loan Section Component (used in Compliance Tab) ──────

function LoanSection({ vehicleId }) {
  const [loans, setLoans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setLoans(await getLoans(vehicleId) || []); }
    catch { setLoans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [vehicleId]);

  return (
    <Section title="Loan Information" emoji="💰" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669" collapsible defaultCollapsed>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setShowForm(!showForm)} style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1.5px solid #059669', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
          <i className={`fas fa-${showForm ? 'times' : 'plus'}`} style={{ marginRight: 4, fontSize: 9 }}></i>{showForm ? 'Cancel' : 'Add Loan'}
        </button>
      </div>
      {showForm && <AddLoanForm vehicleId={vehicleId} onSaved={() => { setShowForm(false); load(); }} />}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}><i className="fas fa-spinner fa-spin"></i> Loading...</div>
      ) : loans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 12 }}>No loan records.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loans.map(l => (
            <div key={l.id} style={{ padding: 14, borderRadius: 12, border: '1.5px solid #A7F3D0', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{l.lender}</div>
                <TaskStatusBadge status={l.status} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div><div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Amount</div><div style={{ fontSize: 14, fontWeight: 800 }}>₹{Number(l.loanAmount || 0).toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>EMI</div><div style={{ fontSize: 14, fontWeight: 800, color: '#059669' }}>₹{Number(l.monthlyEmi || 0).toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Outstanding</div><div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>₹{Number(l.outstandingBalance || 0).toLocaleString('en-IN')}</div></div>
              </div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#64748B' }}>{l.interestRate && `${l.interestRate}%`} • {l.loanTermMonths && `${l.loanTermMonths}mo`} • {fmtDateSafe(l.disbursementDate)} → {fmtDateSafe(l.maturityDate)}</div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function AddLoanForm({ vehicleId, onSaved }) {
  const [f, sF] = useState({ lender: '', loanAccountNo: '', loanAmount: '', interestRate: '', loanTermMonths: '', monthlyEmi: '', disbursementDate: '', maturityDate: '' });
  const [saving, setSaving] = useState(false);
  const s = k => v => sF(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (!f.lender) return; setSaving(true);
    try { await createLoan(vehicleId, f); onSaved?.(); }
    catch (e) { console.error(e); } finally { setSaving(false); }
  };
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1.5px solid #A7F3D0', background: '#F0FDF4', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Lender" value={f.lender} onChange={s('lender')} required placeholder="e.g. HDFC Bank" />
        <FormField label="Loan A/C No." value={f.loanAccountNo} onChange={s('loanAccountNo')} placeholder="Account No." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="Amount (₹)" value={f.loanAmount} onChange={s('loanAmount')} type="number" placeholder="1500000" />
        <FormField label="Rate (%)" value={f.interestRate} onChange={s('interestRate')} type="number" placeholder="9.5" />
        <FormField label="Term (mo)" value={f.loanTermMonths} onChange={s('loanTermMonths')} type="number" placeholder="60" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
        <FormField label="EMI (₹)" value={f.monthlyEmi} onChange={s('monthlyEmi')} type="number" placeholder="31000" />
        <FormField label="Disbursement" value={f.disbursementDate} onChange={s('disbursementDate')} type="date" />
        <FormField label="Maturity" value={f.maturityDate} onChange={s('maturityDate')} type="date" />
      </div>
      <button onClick={save} disabled={saving} style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1.5px solid #059669', borderRadius: 8, padding: '6px 14px', cursor: saving ? 'wait' : 'pointer' }}>
        <i className="fas fa-check" style={{ marginRight: 4, fontSize: 9 }}></i>{saving ? 'Saving...' : 'Save Loan'}
      </button>
    </div>
  );
}
