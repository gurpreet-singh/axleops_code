import { useState, useEffect, useRef } from 'react';
import useSliderStore from '../../stores/sliderStore';
import { FormField, Section } from '../../components/common/FormField';
import { createTrip, startTrip, uploadTripDocument } from '../../services/tripService';
import { getVehicles } from '../../services/vehicleService';
import { getRoutes } from '../../services/routeService';
import { getDrivers } from '../../services/userService';
import ledgerAccountService from '../../services/ledgerAccountService';
import { TripDetailContent } from './TripSliderContent';

export default function TripCreateContent({ onSave }) {
  const { updateSlider } = useSliderStore();
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState(null); // 'draft' or 'start'
  const [error, setError] = useState(null);

  // Dropdown data
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // LR document upload
  const [lrFile, setLrFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getVehicles().then(setVehicles).catch(() => []);
    getRoutes().then(setRoutes).catch(() => []);
    getDrivers().then(setDrivers).catch(() => []);
    ledgerAccountService.getActive().then(setAccounts).catch(() => []);
  }, []);

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

  const [form, setForm] = useState({
    vehicleId: '', driverId: '', routeId: '', tripType: 'FTL',
    lrNumber: '', lrDate: '', dispatchDate: '', dispatchTime: '', clientInvoiceNumbers: '', packagesCount: '',
    consignorId: '', consigneeId: '', billingPartyId: '', transporterId: '',
    cargoDescription: '', materialType: '', weightKg: '',
    consignmentValue: '', ewayBillNumber: '', riskType: 'CARRIER_RISK', trolleyPalletQty: '',
    freightAmount: '', paymentTerms: 'TO_BE_BILLED', loadingNote: '',
    permitNumber: '', documentNumber: '', remarks: '',
    consignorAddress: '', consigneeAddress: '',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const buildPayload = () => ({
    ...form,
    vehicleId: form.vehicleId || null,
    driverId: form.driverId || null,
    routeId: form.routeId || null,
    consignorId: form.consignorId || null,
    consigneeId: form.consigneeId || null,
    billingPartyId: form.billingPartyId || null,
    transporterId: form.transporterId || null,
    weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
    packagesCount: form.packagesCount ? parseInt(form.packagesCount) : null,
    consignmentValue: form.consignmentValue ? parseFloat(form.consignmentValue) : null,
    freightAmount: form.freightAmount ? parseFloat(form.freightAmount) : null,
    trolleyPalletQty: form.trolleyPalletQty ? parseInt(form.trolleyPalletQty) : null,
  });

  const swapToDetail = (trip) => {
    updateSlider({
      title: `Trip ${trip.tripNumber}`,
      subtitle: trip.routeName || `${trip.originCity || '?'} → ${trip.destinationCity || '?'}`,
      content: <TripDetailContent tripId={trip.id} onRefresh={onSave} />,
    });
  };

  const handleSave = async () => {
    if (!form.routeId) { setError('Route is required'); return; }
    if (!form.lrNumber.trim()) { setError('LR / Consignment Note number is required'); return; }
    setSaving(true); setSavingMode('draft'); setError(null);
    try {
      const trip = await createTrip(buildPayload());
      if (lrFile && trip?.id) {
        try { await uploadTripDocument(trip.id, lrFile, 'LR'); } catch (_) {}
      }
      onSave?.();
      swapToDetail(trip);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create trip');
    } finally {
      setSaving(false); setSavingMode(null);
    }
  };

  const handleCreateAndStart = async () => {
    if (!form.routeId) { setError('Route is required'); return; }
    if (!form.lrNumber.trim()) { setError('LR / Consignment Note number is required'); return; }
    if (!form.vehicleId) { setError('Vehicle is required to start a trip'); return; }
    setSaving(true); setSavingMode('start'); setError(null);
    try {
      const trip = await createTrip(buildPayload());
      if (lrFile && trip?.id) {
        try { await uploadTripDocument(trip.id, lrFile, 'LR'); } catch (_) {}
      }
      // Immediately transition to IN_TRANSIT
      await startTrip(trip.id);
      onSave?.();
      swapToDetail(trip);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create and start trip');
    } finally {
      setSaving(false); setSavingMode(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setLrFile(file);
  };

  const removeFile = () => {
    setLrFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="sl-action-bar">
        <button onClick={handleSave} disabled={saving} className="sl-action-btn" style={{ background: saving && savingMode === 'draft' ? '#94A3B8' : '#fff', border: '1.5px solid #E2E8F0', color: '#1E293B', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
          <i className={`fas fa-${saving && savingMode === 'draft' ? 'spinner fa-spin' : 'save'}`} style={{ fontSize: 10 }}></i> {saving && savingMode === 'draft' ? 'Saving...' : 'Save as Draft'}
        </button>
        <button onClick={handleCreateAndStart} disabled={saving} className="sl-action-btn sl-edit-toggle-btn active" style={{ background: saving && savingMode === 'start' ? '#94A3B8' : 'linear-gradient(135deg, #059669, #10B981)', cursor: saving ? 'not-allowed' : 'pointer' }}>
          <i className={`fas fa-${saving && savingMode === 'start' ? 'spinner fa-spin' : 'play'}`} style={{ fontSize: 10 }}></i> {saving && savingMode === 'start' ? 'Starting...' : 'Create & Start'}
        </button>
        <div style={{ flex: 1 }}></div>
        {error && <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, maxWidth: 220, textAlign: 'right' }}>{error}</span>}
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {/* 1. CORE SELECTION */}
        <Section title="Core Selection" emoji="🖥️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Route" value={form.routeId} onChange={set('routeId')} required options={routeOptions} />
            <FormField label="Trip Type" value={form.tripType} onChange={set('tripType')} options={TRIP_TYPES} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <FormField label="Vehicle" value={form.vehicleId} onChange={set('vehicleId')} options={vehicleOptions} />
            <FormField label="Driver" value={form.driverId} onChange={set('driverId')} options={driverOptions} />
          </div>
        </Section>

        {/* 2. LR / CONSIGNMENT NOTE */}
        <Section title="LR / Consignment Note" emoji="📄" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="LR / GCN No." value={form.lrNumber} onChange={set('lrNumber')} placeholder="Consignment note number" required />
            <FormField label="LR Date" value={form.lrDate} onChange={set('lrDate')} type="date" />
            <FormField label="No. of Packages" value={form.packagesCount} onChange={set('packagesCount')} type="number" placeholder="0" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Invoice Numbers" value={form.clientInvoiceNumbers} onChange={set('clientInvoiceNumbers')} placeholder="INV-001, INV-002" />
            <FormField label="Dispatch Date" value={form.dispatchDate} onChange={set('dispatchDate')} type="date" />
            <FormField label="Dispatch Time" value={form.dispatchTime} onChange={set('dispatchTime')} type="time" />
          </div>

          {/* LR Document Upload */}
          <div style={{ marginTop: 6 }}>
            <label className="ax-field-label" style={{ marginBottom: 6, display: 'block' }}>
              <i className="fas fa-paperclip" style={{ fontSize: 10, color: '#94A3B8', marginRight: 4 }}></i>
              LR DOCUMENT (SCAN / PHOTO)
            </label>
            {!lrFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #C4B5FD',
                  borderRadius: 10,
                  padding: '14px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FAFAF9, #F5F3FF)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.background = 'linear-gradient(135deg, #F5F3FF, #EDE9FE)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.background = 'linear-gradient(135deg, #FAFAF9, #F5F3FF)'; }}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: 18, color: '#8B5CF6', marginBottom: 4 }}></i>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9' }}>Click to upload LR scan</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>PDF, JPG, PNG — max 10 MB</div>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
                border: '1.5px solid #86EFAC',
              }}>
                <i className="fas fa-file-alt" style={{ fontSize: 18, color: '#059669' }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#065F46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lrFile.name}</div>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>{formatFileSize(lrFile.size)}</div>
                </div>
                <button
                  onClick={removeFile}
                  style={{
                    border: 'none', background: '#FEE2E2', borderRadius: 6,
                    padding: '4px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 600,
                    color: '#DC2626', display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <i className="fas fa-times" style={{ fontSize: 9 }}></i> Remove
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </Section>

        {/* 3. PARTIES */}
        <Section title="Parties" emoji="🤝" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FFFBEB, #FEF3C7)" accentColor="#92400E">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignor (Pickup)" value={form.consignorId} onChange={set('consignorId')} options={partyOptions} />
            <FormField label="Consignee (Delivery)" value={form.consigneeId} onChange={set('consigneeId')} options={partyOptions} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Billing Party" value={form.billingPartyId} onChange={set('billingPartyId')} options={partyOptions} />
            <FormField label="Transporter" value={form.transporterId} onChange={set('transporterId')} options={partyOptions} />
          </div>
        </Section>

        {/* 4. CARGO DETAILS */}
        <Section title="Cargo Details" emoji="📦" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Cargo Description" value={form.cargoDescription} onChange={set('cargoDescription')} placeholder="e.g. FMCG goods, chemicals" />
            <FormField label="Material Type" value={form.materialType} onChange={set('materialType')} placeholder="e.g. Chemicals" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Weight (KG)" value={form.weightKg} onChange={set('weightKg')} type="number" placeholder="0" />
            <FormField label="E-Way Bill No." value={form.ewayBillNumber} onChange={set('ewayBillNumber')} placeholder="EWB number" />
          </div>
        </Section>

        {/* 5. FINANCIAL */}
        <Section title="Financial" emoji="💰" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FEFCE8, #FEF9C3)" accentColor="#854D0E">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Freight Amount (₹)" value={form.freightAmount} onChange={set('freightAmount')} type="number" placeholder="0" />
            <FormField label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')} options={PAYMENT_TERMS} />
            <FormField label="Loading Note" value={form.loadingNote} onChange={set('loadingNote')} placeholder="Special instructions" />
          </div>
        </Section>

        {/* 6. ADDITIONAL (OPTIONAL) */}
        <Section title="Additional Fields (Optional)" emoji="⚙️" borderColor="#D1D5DB" headerBg="linear-gradient(135deg, #F9FAFB, #F3F4F6)" accentColor="#4B5563" collapsible defaultCollapsed>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignment Value (₹)" value={form.consignmentValue} onChange={set('consignmentValue')} type="number" placeholder="0" />
            <FormField label="Permit Number" value={form.permitNumber} onChange={set('permitNumber')} placeholder="If required" />
            <FormField label="Risk Type" value={form.riskType} onChange={set('riskType')} options={RISK_TYPES} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignor Address" value={form.consignorAddress} onChange={set('consignorAddress')} placeholder="Pickup address" />
            <FormField label="Consignee Address" value={form.consigneeAddress} onChange={set('consigneeAddress')} placeholder="Delivery address" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Remarks" value={form.remarks} onChange={set('remarks')} placeholder="Any notes" />
            <FormField label="Document No." value={form.documentNumber} onChange={set('documentNumber')} placeholder="Reference doc" />
          </div>
        </Section>
      </div>
    </div>
  );
}
