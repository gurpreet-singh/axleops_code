import { useState, useEffect } from 'react';
import useSliderStore from '../../stores/sliderStore';
import { FormField, Section } from '../../components/common/FormField';
import { createTrip } from '../../services/tripService';
import { getVehicles } from '../../services/vehicleService';
import { getRoutes } from '../../services/routeService';
import { getDrivers } from '../../services/contactService';
import ledgerAccountService from '../../services/ledgerAccountService';

export default function TripCreateContent({ onSave }) {
  const { closeSlider } = useSliderStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown data
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

  const vehicleOptions = [{ value: '', label: 'Select vehicle...' }, ...vehicles.map(v => ({ value: v.id, label: `${v.registrationNumber} — ${v.make || ''} ${v.model || ''}`.trim() }))];
  const routeOptions = [{ value: '', label: 'Select route...' }, ...routes.map(r => ({ value: r.id, label: `${r.origin || ''} → ${r.destination || ''} (${r.name})` }))];
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
    lrNumber: '', lrDate: '', dispatchDate: '', dispatchTime: '', clientInvoiceNumbers: '',
    consignorId: '', consigneeId: '', billingPartyId: '', transporterId: '',
    cargoDescription: '', materialType: '', weightKg: '', packagesCount: '',
    consignmentValue: '', ewayBillNumber: '', riskType: 'CARRIER_RISK', trolleyPalletQty: '',
    freightAmount: '', paymentTerms: 'TO_BE_BILLED', loadingNote: '',
    permitNumber: '', documentNumber: '', remarks: '',
    consignorAddress: '', consigneeAddress: '',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.routeId) { setError('Route is required'); return; }
    setSaving(true); setError(null);
    try {
      const payload = {
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
      };
      await createTrip(payload);
      onSave?.();
      closeSlider();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create trip');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={closeSlider} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer' }}>
          <i className="fas fa-times" style={{ fontSize: 10 }}></i> Cancel
        </button>
        <div style={{ flex: 1 }}></div>
        {error && <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>{error}</span>}
        <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#fff', background: saving ? '#94A3B8' : 'linear-gradient(135deg, #059669, #10B981)', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
          <i className={`fas fa-${saving ? 'spinner fa-spin' : 'check'}`} style={{ fontSize: 10 }}></i> {saving ? 'Saving...' : 'Save Trip'}
        </button>
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
            <FormField label="LR / GCN No." value={form.lrNumber} onChange={set('lrNumber')} placeholder="Consignment note number" />
            <FormField label="LR Date" value={form.lrDate} onChange={set('lrDate')} type="date" />
            <FormField label="Invoice Numbers" value={form.clientInvoiceNumbers} onChange={set('clientInvoiceNumbers')} placeholder="INV-001, INV-002" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Dispatch Date" value={form.dispatchDate} onChange={set('dispatchDate')} type="date" />
            <FormField label="Dispatch Time" value={form.dispatchTime} onChange={set('dispatchTime')} type="time" />
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Weight (KG)" value={form.weightKg} onChange={set('weightKg')} type="number" placeholder="0" />
            <FormField label="Packages / Qty" value={form.packagesCount} onChange={set('packagesCount')} type="number" placeholder="0" />
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
