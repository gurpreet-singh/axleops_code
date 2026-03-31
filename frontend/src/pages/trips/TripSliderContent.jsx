import { useState, useEffect, useRef } from 'react';
import { TRIP_STATE_COLORS, getTripById, updateTrip, deleteTrip, startTrip, deliverTrip, markReached, settleTrip, cancelTrip, getTripExpenses, addTripExpense, deleteTripExpense, getTripAdvances, addTripAdvance, getSettlementSummary, getTripDocuments, uploadTripDocument, deleteTripDocument } from '../../services/tripService';
import { getVehicles } from '../../services/vehicleService';
import { getRoutes } from '../../services/routeService';
import { getDrivers } from '../../services/contactService';
import ledgerAccountService from '../../services/ledgerAccountService';
import useSliderStore from '../../stores/sliderStore';
import useToastStore from '../../stores/toastStore';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { FormField } from '../../components/common/FormField';

// Re-export TripCreateContent
export { default as TripCreateContent } from './TripCreateContent';

// ═══════════════════════════════════════════════════════════
// Field helper
// ═══════════════════════════════════════════════════════════
function Field({ label, value, mono, icon, full }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
        {icon && <i className={icon} style={{ marginRight: 4, fontSize: 10 }}></i>}
        {label}
      </div>
      <div style={{ width: '100%', border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: 600, minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}

function Section({ title, icon, iconColor, borderColor, headerBg, headerAction, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '10px 14px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <i className={icon} style={{ fontSize: 13, color: iconColor || '#1A73E8' }}></i>}
        <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</span>
        {headerAction}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRIP DETAIL CONTENT (loads trip by ID)
// ═══════════════════════════════════════════════════════════
export function TripDetailContent({ tripId, onRefresh }) {
  const { closeSlider, updateSlider } = useSliderStore();
  const { addToast } = useToastStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Dropdown data for editing
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => []);
    getRoutes().then(setRoutes).catch(() => []);
    getDrivers().then(setDrivers).catch(() => []);
    ledgerAccountService.getActive().then(setAccounts).catch(() => []);
  }, []);

  const loadTrip = async () => {
    try {
      const data = await getTripById(tripId);
      setTrip(data);
      // Update slider subtitle with route name
      updateSlider({ subtitle: data.routeName || `${data.originCity || '?'} → ${data.destinationCity || '?'}` });
    } catch (e) { /* handled by empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTrip(); }, [tripId]);

  const startEditing = () => {
    setEditForm({
      vehicleId: trip.vehicleId || '',
      driverId: trip.driverId || '',
      routeId: trip.routeId || '',
      tripType: trip.tripType || 'FTL',
      lrNumber: trip.lrNumber || '',
      lrDate: trip.lrDate || '',
      dispatchDate: trip.dispatchDate || '',
      dispatchTime: trip.dispatchTime || '',
      clientInvoiceNumbers: trip.clientInvoiceNumbers || '',
      packagesCount: trip.packagesCount ?? '',
      consignorId: trip.consignorId || '',
      consigneeId: trip.consigneeId || '',
      billingPartyId: trip.billingPartyId || '',
      transporterId: trip.transporterId || '',
      cargoDescription: trip.cargoDescription || '',
      materialType: trip.materialType || '',
      weightKg: trip.weightKg ?? '',
      consignmentValue: trip.consignmentValue ?? '',
      ewayBillNumber: trip.ewayBillNumber || '',
      riskType: trip.riskType || 'CARRIER_RISK',
      freightAmount: trip.freightAmount ?? '',
      paymentTerms: trip.paymentTerms || 'TO_BE_BILLED',
      loadingNote: trip.loadingNote || '',
      permitNumber: trip.permitNumber || '',
      documentNumber: trip.documentNumber || '',
      remarks: trip.remarks || '',
      consignorAddress: trip.consignorAddress || '',
      consigneeAddress: trip.consigneeAddress || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        vehicleId: editForm.vehicleId || null,
        driverId: editForm.driverId || null,
        routeId: editForm.routeId || null,
        consignorId: editForm.consignorId || null,
        consigneeId: editForm.consigneeId || null,
        billingPartyId: editForm.billingPartyId || null,
        transporterId: editForm.transporterId || null,
        weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : null,
        packagesCount: editForm.packagesCount ? parseInt(editForm.packagesCount) : null,
        consignmentValue: editForm.consignmentValue ? parseFloat(editForm.consignmentValue) : null,
        freightAmount: editForm.freightAmount ? parseFloat(editForm.freightAmount) : null,
      };
      await updateTrip(tripId, payload);
      addToast({ type: 'success', title: 'Saved', message: 'Trip details updated' });
      setIsEditing(false);
      await loadTrip();
      onRefresh?.();
    } catch (e) {
      addToast({ type: 'error', title: 'Save Failed', message: e.response?.data?.message || 'Failed to update trip' });
    } finally { setSaving(false); }
  };

  const setField = (key) => (val) => setEditForm(f => ({ ...f, [key]: val }));

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>;
  if (!trip) return <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Trip not found</div>;

  const sc = TRIP_STATE_COLORS[trip.status] || {};

  const handleAction = async (action, payload) => {
    setActionLoading(action);
    try {
      if (action === 'start') await startTrip(tripId);
      else if (action === 'deliver') await deliverTrip(tripId);
      else if (action === 'markReached') await markReached(tripId);
      else if (action === 'settle') await settleTrip(tripId);
      else if (action === 'cancel') await cancelTrip(tripId, { reason: cancelReason });
      await loadTrip();
      onRefresh?.();
      setShowCancelDialog(false);
    } catch(e) {
      const msg = e.response?.data?.message || `Failed to ${action}`;
      addToast({ type: 'error', title: 'Action Failed', message: msg });
    } finally { setActionLoading(null); }
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { key: 'documents', label: 'Documents', icon: 'fas fa-folder-open' },
    { key: 'expenses', label: 'Expenses', icon: 'fas fa-receipt' },
    { key: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
    { key: 'financials', label: 'Financials', icon: 'fas fa-chart-pie' },
  ];

  const canEdit = trip.status !== 'SETTLED' && trip.status !== 'CANCELLED';

  const vehicleOptions = [{ value: '', label: 'Select vehicle...' }, ...vehicles.map(v => ({ value: v.id, label: `${v.registrationNumber} — ${v.make || ''} ${v.model || ''}`.trim() }))];
  const routeOptions = [{ value: '', label: 'Select route...' }, ...routes.map(r => ({ value: r.id, label: r.name || `${r.origin} To ${r.destination}` }))];
  const driverOptions = [{ value: '', label: 'Select driver...' }, ...drivers.map(d => ({ value: d.id, label: `${d.firstName} ${d.lastName || ''}`.trim() }))];
  const partyOptions = [{ value: '', label: 'Select...' }, ...accounts.map(a => ({ value: a.id, label: a.accountHead }))];

  const TRIP_TYPES = [
    { value: 'FTL', label: 'FTL — Full Truck Load' },
    { value: 'PTL', label: 'PTL — Part Truck Load' },
    { value: 'ODC', label: 'ODC — Over Dimensional Cargo' },
    { value: 'CONTAINER', label: 'Container' },
    { value: 'TANKER', label: 'Tanker' },
  ];
  const PAYMENT_TERMS = [
    { value: 'TO_PAY', label: 'To Pay' },
    { value: 'PAID', label: 'Paid' },
    { value: 'TO_BE_BILLED', label: 'To Be Billed' },
  ];
  const RISK_TYPES = [
    { value: 'CARRIER_RISK', label: 'Carrier Risk' },
    { value: 'OWNER_RISK', label: "Owner's Risk" },
  ];

  return (
    <div>
      {/* Action Bar */}
      <div className="sl-action-bar" style={{ padding: '8px 20px', gap: 6, flexWrap: 'wrap' }}>
        {canEdit && (
          isEditing ? (
            <>
              <button className="sl-action-btn sl-edit-toggle-btn active" onClick={handleSaveEdit} disabled={saving}>
                <i className={`fas fa-${saving ? 'spinner fa-spin' : 'check'}`}></i> {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="sl-action-btn" onClick={() => setIsEditing(false)} style={{ color: '#64748B' }}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </>
          ) : (
            <button className="sl-action-btn sl-edit-toggle-btn" onClick={startEditing}>
              <i className="fas fa-pen"></i> Edit Details
            </button>
          )
        )}
        <button className="sl-action-btn"><i className="fas fa-print"></i> Print</button>
        <div style={{ flex: 1 }}></div>
        {/* Status-specific actions */}
        {!isEditing && trip.status === 'CREATED' && (
          <>
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
              onClick={() => handleAction('start')} disabled={actionLoading}>
              <i className={`fas fa-${actionLoading === 'start' ? 'spinner fa-spin' : 'play'}`}></i> Start Trip
            </button>
            <button className="sl-action-btn" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}
              onClick={() => setShowCancelDialog(true)}>
              <i className="fas fa-ban"></i> Cancel
            </button>
          </>
        )}
        {!isEditing && trip.status === 'IN_TRANSIT' && (
          <>
            {!trip.reachedDestination && (
              <button className="sl-action-btn" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}
                onClick={() => handleAction('markReached')} disabled={actionLoading}>
                <i className={`fas fa-${actionLoading === 'markReached' ? 'spinner fa-spin' : 'map-marker-alt'}`}></i> Mark Reached
              </button>
            )}
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
              onClick={() => handleAction('deliver')} disabled={actionLoading}>
              <i className={`fas fa-${actionLoading === 'deliver' ? 'spinner fa-spin' : 'check'}`}></i> Mark Delivered
            </button>
            <button className="sl-action-btn" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}
              onClick={() => setShowCancelDialog(true)}>
              <i className="fas fa-ban"></i> Cancel
            </button>
          </>
        )}
        {!isEditing && trip.status === 'DELIVERED' && (
          <button className="sl-action-btn" style={{ background: '#E0E7FF', color: '#3730A3', borderColor: '#A5B4FC' }}
            onClick={() => handleAction('settle')} disabled={actionLoading}>
            <i className={`fas fa-${actionLoading === 'settle' ? 'spinner fa-spin' : 'lock'}`}></i> Settle Trip
          </button>
        )}
        {!isEditing && (trip.status === 'CREATED') && (
          <button className="sl-delete-btn" onClick={() => setShowDeleteModal(true)}>
            <i className="fas fa-recycle"></i> Delete
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="slider-tabs">
        {TABS.map(t => (
          <div key={t.key} className={`slider-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <i className={t.icon} style={{ marginRight: 4, fontSize: 11 }}></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 20 }}>
        {activeTab === 'overview' && <OverviewTab trip={trip} isEditing={isEditing} editForm={editForm} setField={setField} vehicleOptions={vehicleOptions} routeOptions={routeOptions} driverOptions={driverOptions} partyOptions={partyOptions} TRIP_TYPES={TRIP_TYPES} PAYMENT_TERMS={PAYMENT_TERMS} RISK_TYPES={RISK_TYPES} />}
        {activeTab === 'documents' && <DocumentsTab trip={trip} onRefresh={loadTrip} />}
        {activeTab === 'expenses' && <ExpensesTab trip={trip} onRefresh={loadTrip} />}
        {activeTab === 'timeline' && <TimelineTab trip={trip} />}
        {activeTab === 'financials' && <FinancialsTab trip={trip} isEditing={isEditing} editForm={editForm} setField={setField} PAYMENT_TERMS={PAYMENT_TERMS} />}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#DC2626' }}>Cancel Trip</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '10px 0' }}>Please provide a reason for cancellation:</p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Reason..."
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: 10, fontSize: 13, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelDialog(false)} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Back</button>
              <button onClick={() => handleAction('cancel')} disabled={!cancelReason.trim() || actionLoading}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => { await deleteTrip(trip.id); closeSlider(); onRefresh?.(); }}
        entityName={trip.tripNumber} entityType="Trip" />
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────
// Mirrors the exact same section structure as TripCreateContent
function OverviewTab({ trip, isEditing, editForm, setField, vehicleOptions, routeOptions, driverOptions, partyOptions, TRIP_TYPES, PAYMENT_TERMS, RISK_TYPES }) {
  const INR = v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : null;

  return (
    <>
      {/* 1. CORE SELECTION */}
      <SectionCard title="Core Selection" emoji="🖥️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Route" value={editForm.routeId} onChange={setField('routeId')} options={routeOptions} required /> : <Field label="Route" value={trip.routeName} />}
          {isEditing ? <FormField label="Trip Type" value={editForm.tripType} onChange={setField('tripType')} options={TRIP_TYPES} /> : <Field label="Trip Type" value={trip.tripType} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          {isEditing ? <FormField label="Vehicle" value={editForm.vehicleId} onChange={setField('vehicleId')} options={vehicleOptions} /> : <Field label="Vehicle" value={trip.vehicleRegistration || 'Unassigned'} mono />}
          {isEditing ? <FormField label="Driver" value={editForm.driverId} onChange={setField('driverId')} options={driverOptions} /> : <Field label="Driver" value={trip.driverName || 'Unassigned'} />}
        </div>
        {!isEditing && (!trip.vehicleRegistration || !trip.lrNumber) && trip.status === 'CREATED' && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 11, color: '#92400E' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }}></i>
            {!trip.vehicleRegistration && !trip.lrNumber
              ? 'Vehicle and LR number are required before starting this trip.'
              : !trip.vehicleRegistration
                ? 'Vehicle must be assigned before starting this trip.'
                : 'LR number is required before starting this trip.'}
          </div>
        )}
      </SectionCard>

      {/* 2. LR / CONSIGNMENT NOTE */}
      <SectionCard title="LR / Consignment Note" emoji="📄" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          {isEditing ? <FormField label="LR / GCN No." value={editForm.lrNumber} onChange={setField('lrNumber')} required /> : <Field label="LR / GCN No." value={trip.lrNumber} mono />}
          {isEditing ? <FormField label="LR Date" value={editForm.lrDate} onChange={setField('lrDate')} type="date" /> : <Field label="LR Date" value={trip.lrDate} />}
          {isEditing ? <FormField label="No. of Packages" value={editForm.packagesCount} onChange={setField('packagesCount')} type="number" /> : <Field label="No. of Packages" value={trip.packagesCount} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Invoice Numbers" value={editForm.clientInvoiceNumbers} onChange={setField('clientInvoiceNumbers')} /> : <Field label="Invoice Numbers" value={trip.clientInvoiceNumbers} />}
          {isEditing ? <FormField label="Dispatch Date" value={editForm.dispatchDate} onChange={setField('dispatchDate')} type="date" /> : <Field label="Dispatch Date" value={trip.dispatchDate} />}
          {isEditing ? <FormField label="Dispatch Time" value={editForm.dispatchTime} onChange={setField('dispatchTime')} type="time" /> : <Field label="Dispatch Time" value={trip.dispatchTime} />}
        </div>
      </SectionCard>

      {/* 3. PARTIES */}
      <SectionCard title="Parties" emoji="🤝" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FFFBEB, #FEF3C7)" accentColor="#92400E">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {isEditing ? <FormField label="Consignor (Pickup)" value={editForm.consignorId} onChange={setField('consignorId')} options={partyOptions} /> : <Field label="Consignor (Pickup)" value={trip.consignorName} />}
          {isEditing ? <FormField label="Consignee (Delivery)" value={editForm.consigneeId} onChange={setField('consigneeId')} options={partyOptions} /> : <Field label="Consignee (Delivery)" value={trip.consigneeName} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Billing Party" value={editForm.billingPartyId} onChange={setField('billingPartyId')} options={partyOptions} /> : <Field label="Billing Party" value={trip.billingPartyName} />}
          {isEditing ? <FormField label="Transporter" value={editForm.transporterId} onChange={setField('transporterId')} options={partyOptions} /> : <Field label="Transporter" value={trip.transporterName} />}
        </div>
      </SectionCard>

      {/* 4. CARGO DETAILS */}
      <SectionCard title="Cargo Details" emoji="📦" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {isEditing ? <FormField label="Cargo Description" value={editForm.cargoDescription} onChange={setField('cargoDescription')} /> : <Field label="Cargo Description" value={trip.cargoDescription} />}
          {isEditing ? <FormField label="Material Type" value={editForm.materialType} onChange={setField('materialType')} /> : <Field label="Material Type" value={trip.materialType} />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Weight (KG)" value={editForm.weightKg} onChange={setField('weightKg')} type="number" /> : <Field label="Weight (KG)" value={trip.weightKg ? trip.weightKg.toLocaleString() : null} />}
          {isEditing ? <FormField label="E-Way Bill No." value={editForm.ewayBillNumber} onChange={setField('ewayBillNumber')} /> : <Field label="E-Way Bill No." value={trip.ewayBillNumber} mono />}
        </div>
      </SectionCard>

      {/* 5. FINANCIAL */}
      <SectionCard title="Financial" emoji="💰" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FEFCE8, #FEF9C3)" accentColor="#854D0E">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Freight Amount (₹)" value={editForm.freightAmount} onChange={setField('freightAmount')} type="number" /> : <Field label="Freight Amount (₹)" value={INR(trip.freightAmount)} mono />}
          {isEditing ? <FormField label="Payment Terms" value={editForm.paymentTerms} onChange={setField('paymentTerms')} options={PAYMENT_TERMS} /> : <Field label="Payment Terms" value={trip.paymentTerms} />}
          {isEditing ? <FormField label="Loading Note" value={editForm.loadingNote} onChange={setField('loadingNote')} /> : <Field label="Loading Note" value={trip.loadingNote} />}
        </div>
      </SectionCard>

      {/* 6. ADDITIONAL */}
      {(isEditing || trip.consignmentValue || trip.permitNumber || trip.riskType || trip.remarks || trip.documentNumber || trip.consignorAddress || trip.consigneeAddress) && (
        <SectionCard title="Additional Fields" emoji="⚙️" borderColor="#D1D5DB" headerBg="linear-gradient(135deg, #F9FAFB, #F3F4F6)" accentColor="#4B5563">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            {isEditing ? <FormField label="Consignment Value (₹)" value={editForm.consignmentValue} onChange={setField('consignmentValue')} type="number" /> : <Field label="Consignment Value (₹)" value={INR(trip.consignmentValue)} mono />}
            {isEditing ? <FormField label="Permit Number" value={editForm.permitNumber} onChange={setField('permitNumber')} /> : <Field label="Permit Number" value={trip.permitNumber} />}
            {isEditing ? <FormField label="Risk Type" value={editForm.riskType} onChange={setField('riskType')} options={RISK_TYPES} /> : <Field label="Risk Type" value={trip.riskType} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {isEditing ? <FormField label="Consignor Address" value={editForm.consignorAddress} onChange={setField('consignorAddress')} /> : <Field label="Consignor Address" value={trip.consignorAddress} />}
            {isEditing ? <FormField label="Consignee Address" value={editForm.consigneeAddress} onChange={setField('consigneeAddress')} /> : <Field label="Consignee Address" value={trip.consigneeAddress} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {isEditing ? <FormField label="Remarks" value={editForm.remarks} onChange={setField('remarks')} /> : <Field label="Remarks" value={trip.remarks} />}
            {isEditing ? <FormField label="Document No." value={editForm.documentNumber} onChange={setField('documentNumber')} /> : <Field label="Document No." value={trip.documentNumber} />}
          </div>
        </SectionCard>
      )}
    </>
  );
}

function SectionCard({ title, emoji, borderColor, headerBg, accentColor, headerAction, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '12px 16px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 }}>{title}</span>
        {headerAction}
      </div>
      <div style={{ padding: '16px 16px 18px' }}>{children}</div>
    </div>
  );
}

// ─── EXPENSES TAB ─────────────────────────────────────────
function ExpensesTab({ trip, onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [expForm, setExpForm] = useState({ expenseCategoryName: '', amount: '', description: '', paymentMode: 'CASH' });
  const [advForm, setAdvForm] = useState({ amount: '', paymentMode: 'CASH', notes: '' });

  useEffect(() => {
    getTripExpenses(trip.id).then(setExpenses).catch(() => []);
    getTripAdvances(trip.id).then(setAdvances).catch(() => []);
  }, [trip.id]);

  const canEdit = trip.status !== 'SETTLED' && trip.status !== 'CANCELLED';

  const handleAddExpense = async () => {
    if (!expForm.amount || !expForm.expenseCategoryName) return;
    await addTripExpense(trip.id, { ...expForm, amount: parseFloat(expForm.amount) });
    setShowAddExpense(false);
    setExpForm({ expenseCategoryName: '', amount: '', description: '', paymentMode: 'CASH' });
    getTripExpenses(trip.id).then(setExpenses);
    onRefresh?.();
  };

  const handleAddAdvance = async () => {
    if (!advForm.amount) return;
    await addTripAdvance(trip.id, { ...advForm, amount: parseFloat(advForm.amount) });
    setShowAddAdvance(false);
    setAdvForm({ amount: '', paymentMode: 'CASH', notes: '' });
    getTripAdvances(trip.id).then(setAdvances);
    onRefresh?.();
  };

  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalAdv = advances.reduce((s, a) => s + (a.amount || 0), 0);

  return (
    <>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>EXPENSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#991B1B' }}>₹{totalExp.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>ADVANCES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>₹{totalAdv.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: totalAdv >= totalExp ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${totalAdv >= totalExp ? '#BBF7D0' : '#FECACA'}` }}>
          <div style={{ fontSize: 10, color: totalAdv >= totalExp ? '#16A34A' : '#DC2626', fontWeight: 700 }}>BALANCE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: totalAdv >= totalExp ? '#166534' : '#991B1B' }}>₹{(totalAdv - totalExp).toLocaleString()}</div>
        </div>
      </div>

      {/* Expenses List */}
      <Section title="Expenses" icon="fas fa-receipt" iconColor="#DC2626" borderColor="#FECACA" headerBg="#FEF2F2"
        headerAction={canEdit && (
          <button onClick={() => setShowAddExpense(!showAddExpense)}
            style={{ padding: '3px 10px', border: '1.5px solid #FECACA', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: showAddExpense ? '#FEE2E2' : '#fff', color: showAddExpense ? '#DC2626' : '#1E293B', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
            <i className={`fas fa-${showAddExpense ? 'times' : 'plus'}`} style={{ fontSize: 9 }}></i> {showAddExpense ? 'Cancel' : 'Add Expense'}
          </button>
        )}
      >
        {showAddExpense && (
          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <FormField label="Category" value={expForm.expenseCategoryName} onChange={v => setExpForm(f => ({ ...f, expenseCategoryName: v }))} placeholder="e.g. Diesel, Toll" />
              <FormField label="Amount (₹)" value={expForm.amount} onChange={v => setExpForm(f => ({ ...f, amount: v }))} type="number" placeholder="0" />
            </div>
            <FormField label="Description" value={expForm.description} onChange={v => setExpForm(f => ({ ...f, description: v }))} placeholder="Optional note" />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddExpense(false)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddExpense} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#059669', color: '#fff' }}>Save</button>
            </div>
          </div>
        )}
        {expenses.length === 0 ? <div style={{ fontSize: 12, color: '#94A3B8', padding: 10 }}>No expenses recorded yet</div> :
          expenses.map(exp => (
            <div key={exp.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC', gap: 10 }}>
              <i className="fas fa-receipt" style={{ color: '#DC2626', fontSize: 12, width: 16 }}></i>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', flex: 1 }}>{exp.expenseCategoryName || 'Expense'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', minWidth: 70, textAlign: 'right' }}>₹{(exp.amount || 0).toLocaleString()}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: '#DCFCE7', color: '#16A34A' }}>{exp.paymentMode || 'CASH'}</span>
              {canEdit && <button onClick={async () => { await deleteTripExpense(trip.id, exp.id); getTripExpenses(trip.id).then(setExpenses); onRefresh?.(); }} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 10 }}><i className="fas fa-trash"></i></button>}
            </div>
          ))
        }
      </Section>

      {/* Advances List */}
      <Section title="Advances" icon="fas fa-hand-holding-usd" iconColor="#2563EB" borderColor="#BFDBFE" headerBg="#EFF6FF"
        headerAction={canEdit && trip.driverName && (
          <button onClick={() => setShowAddAdvance(!showAddAdvance)}
            style={{ padding: '3px 10px', border: '1.5px solid #BFDBFE', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: showAddAdvance ? '#DBEAFE' : '#fff', color: showAddAdvance ? '#1D4ED8' : '#1E293B', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
            <i className={`fas fa-${showAddAdvance ? 'times' : 'plus'}`} style={{ fontSize: 9 }}></i> {showAddAdvance ? 'Cancel' : 'Add Advance'}
          </button>
        )}
      >
        {showAddAdvance && (
          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <FormField label="Amount (₹)" value={advForm.amount} onChange={v => setAdvForm(f => ({ ...f, amount: v }))} type="number" placeholder="0" />
              <FormField label="Notes" value={advForm.notes} onChange={v => setAdvForm(f => ({ ...f, notes: v }))} placeholder="Optional" />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddAdvance(false)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddAdvance} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#2563EB', color: '#fff' }}>Save</button>
            </div>
          </div>
        )}
        {advances.length === 0 ? <div style={{ fontSize: 12, color: '#94A3B8', padding: 10 }}>No advances given yet</div> :
          advances.map(adv => (
            <div key={adv.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC', gap: 10 }}>
              <i className="fas fa-hand-holding-usd" style={{ color: '#2563EB', fontSize: 12, width: 16 }}></i>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', flex: 1 }}>{adv.notes || 'Advance'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', minWidth: 70, textAlign: 'right' }}>₹{(adv.amount || 0).toLocaleString()}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: '#DBEAFE', color: '#2563EB' }}>{adv.paymentMode || 'CASH'}</span>
            </div>
          ))
        }
      </Section>
    </>
  );
}

// ─── TIMELINE TAB ─────────────────────────────────────────
function TimelineTab({ trip }) {
  const events = [
    { time: trip.createdAt, label: 'Trip Created', icon: 'fas fa-plus-circle', done: true },
    ...(trip.vehicleRegistration ? [{ time: trip.createdAt, label: 'Vehicle Assigned', icon: 'fas fa-truck', done: true, detail: trip.vehicleRegistration }] : []),
    ...(trip.driverName ? [{ time: trip.createdAt, label: 'Driver Assigned', icon: 'fas fa-user', done: true, detail: trip.driverName }] : []),
    ...(trip.startedAt ? [{ time: trip.startedAt, label: 'Trip Started', icon: 'fas fa-play', done: true }] : []),
    ...(trip.status === 'IN_TRANSIT' ? [{ time: null, label: 'In Transit', icon: 'fas fa-road', done: false, current: true }] : []),
    ...(trip.reachedDestination ? [{ time: trip.reachedDestinationAt, label: 'Reached Destination', icon: 'fas fa-map-marker-alt', done: true }] : []),
    ...(trip.deliveredAt ? [{ time: trip.deliveredAt, label: 'Delivered', icon: 'fas fa-check-circle', done: true }] : []),
    ...(trip.settledAt ? [{ time: trip.settledAt, label: 'Trip Settled', icon: 'fas fa-lock', done: true }] : []),
    ...(trip.cancelledAt ? [{ time: trip.cancelledAt, label: 'Cancelled', icon: 'fas fa-ban', done: true, detail: trip.cancellationReason }] : []),
  ];

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
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
            {ev.time && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>{fmtDate(ev.time)}</div>}
            {ev.detail && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{ev.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FINANCIALS TAB ───────────────────────────────────────
function FinancialsTab({ trip, isEditing, editForm, setField, PAYMENT_TERMS }) {
  const revenue = isEditing ? (parseFloat(editForm.freightAmount) || 0) : (trip.freightAmount || 0);
  const expenses = trip.totalExpenses || 0;
  const profit = trip.tripProfit || (revenue - expenses);
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>REVENUE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>₹{revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>EXPENSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#991B1B' }}>₹{expenses.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: profit >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${profit >= 0 ? '#BBF7D0' : '#FECACA'}` }}>
          <div style={{ fontSize: 10, color: profit >= 0 ? '#16A34A' : '#DC2626', fontWeight: 700 }}>PROFIT ({margin}%)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: profit >= 0 ? '#166534' : '#991B1B' }}>₹{profit.toLocaleString()}</div>
        </div>
      </div>

      {/* Editable Financial Fields */}
      <SectionCard title="Revenue & Billing" emoji="💵" borderColor="#BBF7D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#166534">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {isEditing ? <FormField label="Freight Amount (₹)" value={editForm.freightAmount} onChange={setField('freightAmount')} type="number" placeholder="0" /> : <Field label="Freight Amount (₹)" value={`₹${(trip.freightAmount || 0).toLocaleString()}`} mono />}
          {isEditing ? <FormField label="Payment Terms" value={editForm.paymentTerms} onChange={setField('paymentTerms')} options={PAYMENT_TERMS} /> : <Field label="Payment Terms" value={trip.paymentTerms} />}
          {isEditing ? <FormField label="Loading Note" value={editForm.loadingNote} onChange={setField('loadingNote')} placeholder="Special instructions" /> : <Field label="Loading Note" value={trip.loadingNote} />}
        </div>
      </SectionCard>

      <Section title="Settlement Summary" icon="fas fa-balance-scale" iconColor="#6366F1" borderColor="#A5B4FC" headerBg="#E0E7FF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Total Advances" value={`₹${(trip.totalAdvances || 0).toLocaleString()}`} mono />
          <Field label="Total Expenses" value={`₹${(trip.totalExpenses || 0).toLocaleString()}`} mono />
          <Field label="Settlement Balance" value={`₹${(trip.settlementBalance || 0).toLocaleString()}`} mono />
          <Field label="Status" value={trip.status === 'SETTLED' ? '✅ Settled' : '⏳ Pending'} />
        </div>
      </Section>

      {trip.status === 'SETTLED' && trip.settledAt && (
        <div style={{ marginTop: 10, padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 12, color: '#166534' }}>
          <i className="fas fa-check-circle" style={{ marginRight: 6 }}></i>
          Trip settled on {new Date(trip.settledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}
    </>
  );
}

// ─── DOCUMENTS TAB ────────────────────────────────────────
function DocumentsTab({ trip, onRefresh }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('LR');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToastStore();

  const canEdit = trip.status !== 'SETTLED' && trip.status !== 'CANCELLED';

  const DOC_TYPES = [
    { value: 'LR', label: 'LR / Consignment Note' },
    { value: 'POD', label: 'Proof of Delivery' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'EWAYBILL', label: 'E-Way Bill' },
    { value: 'WEIGHBRIDGE', label: 'Weighbridge Slip' },
    { value: 'OTHER', label: 'Other' },
  ];

  const DOC_STATUS_COLORS = {
    PENDING:  { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', label: 'Pending' },
    VERIFIED: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC', label: 'Verified' },
    REJECTED: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', label: 'Rejected' },
  };

  useEffect(() => {
    loadDocs();
  }, [trip.id]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await getTripDocuments(trip.id);
      setDocuments(data);
    } catch { setDocuments([]); }
    finally { setLoading(false); }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      await uploadTripDocument(trip.id, uploadFile, uploadType, uploadNotes);
      addToast({ type: 'success', title: 'Uploaded', message: 'Document uploaded successfully' });
      setShowUpload(false);
      setUploadFile(null);
      setUploadNotes('');
      setUploadType('LR');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadDocs();
      onRefresh?.();
    } catch (e) {
      addToast({ type: 'error', title: 'Upload Failed', message: e.response?.data?.message || 'Failed to upload document' });
    } finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteTripDocument(trip.id, docId);
      addToast({ type: 'success', title: 'Deleted', message: 'Document removed' });
      await loadDocs();
      onRefresh?.();
    } catch (e) {
      addToast({ type: 'error', title: 'Delete Failed', message: e.response?.data?.message || 'Failed to delete document' });
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'LR': return 'fas fa-file-alt';
      case 'POD': return 'fas fa-clipboard-check';
      case 'INVOICE': return 'fas fa-file-invoice';
      case 'EWAYBILL': return 'fas fa-file-contract';
      case 'WEIGHBRIDGE': return 'fas fa-weight';
      default: return 'fas fa-file';
    }
  };

  if (loading) return <div style={{ padding: 30, textAlign: 'center', color: '#94A3B8' }}>Loading documents...</div>;

  return (
    <>
      <SectionCard title="Trip Documents" emoji="📎" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1"
        headerAction={canEdit && (
          <button onClick={() => setShowUpload(!showUpload)}
            style={{ padding: '3px 10px', border: '1.5px solid #93C5FD', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: showUpload ? '#DBEAFE' : '#fff', color: showUpload ? '#1D4ED8' : '#1E293B', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s' }}>
            <i className={`fas fa-${showUpload ? 'times' : 'cloud-upload-alt'}`} style={{ fontSize: 9 }}></i> {showUpload ? 'Cancel' : 'Upload'}
          </button>
        )}
      >
        {showUpload && (
              <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1.5px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Document Type</label>
                    <select value={uploadType} onChange={e => setUploadType(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#1E293B', background: '#fff' }}>
                      {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>Notes (Optional)</label>
                    <input value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="e.g. Original LR copy"
                      style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#1E293B', background: '#fff', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {!uploadFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed #93C5FD', borderRadius: 10, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, #FAFAF9, #EFF6FF)', transition: 'all 0.15s' }}
                  >
                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: 20, color: '#3B82F6', marginBottom: 4 }}></i>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#1D4ED8' }}>Click to select file</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>PDF, JPG, PNG, WEBP — max 10 MB</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1.5px solid #86EFAC' }}>
                    <i className="fas fa-file-alt" style={{ fontSize: 16, color: '#059669' }}></i>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#065F46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadFile.name}</div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>{formatFileSize(uploadFile.size)}</div>
                    </div>
                    <button onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ border: 'none', background: '#FEE2E2', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className="fas fa-times" style={{ fontSize: 9 }}></i> Remove
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />

                <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setShowUpload(false); setUploadFile(null); setUploadNotes(''); }} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff', fontWeight: 600 }}>Cancel</button>
                  <button onClick={handleUpload} disabled={!uploadFile || uploading}
                    style={{ padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: uploadFile && !uploading ? 'pointer' : 'not-allowed', background: uploadFile && !uploading ? '#2563EB' : '#94A3B8', color: '#fff' }}>
                    {uploading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 4 }}></i>Uploading...</> : <><i className="fas fa-upload" style={{ marginRight: 4 }}></i>Upload</>}
                  </button>
                </div>
              </div>
            )}

        {/* Document List */}
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📂</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>No documents attached yet</div>
            <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>Upload LR, POD, or other trip documents</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {documents.map(doc => {
              const sc = DOC_STATUS_COLORS[doc.status] || DOC_STATUS_COLORS.PENDING;
              return (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#FAFAFA', border: '1px solid #F1F5F9', borderRadius: 10, transition: 'all 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={getDocIcon(doc.documentType)} style={{ fontSize: 14, color: '#2563EB' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{doc.documentType}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.fileName || 'No file'}
                      {doc.notes && <span style={{ marginLeft: 6, color: '#94A3B8' }}>• {doc.notes}</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                      Uploaded {formatDate(doc.uploadedAt)}
                      {doc.verifiedAt && <span style={{ color: '#16A34A', marginLeft: 6 }}>• Verified {formatDate(doc.verifiedAt)}</span>}
                    </div>
                    {doc.rejectionReason && (
                      <div style={{ fontSize: 10, color: '#DC2626', marginTop: 2, fontStyle: 'italic' }}>
                        <i className="fas fa-exclamation-circle" style={{ marginRight: 3, fontSize: 9 }}></i>{doc.rejectionReason}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ border: 'none', background: '#EFF6FF', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className="fas fa-external-link-alt" style={{ fontSize: 9 }}></i> View
                      </a>
                    )}
                    {canEdit && (
                      <button onClick={() => handleDelete(doc.id)} style={{ border: 'none', background: '#FEE2E2', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className="fas fa-trash" style={{ fontSize: 9 }}></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </>
  );
}

export default TripDetailContent;
