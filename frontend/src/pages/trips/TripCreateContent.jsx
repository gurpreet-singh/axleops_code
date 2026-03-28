import { useState } from 'react';
import useSliderStore from '../../stores/sliderStore';
import { FormField, Section } from '../../components/common/FormField';


// ═══════════════════════════════════════════════════════════════
// MOCK DATA for selects
// ═══════════════════════════════════════════════════════════════
const MOCK_VEHICLES = [
  { value: '', label: 'Search vehicle...' },
  { value: 'MH04AB1234', label: 'MH04AB1234 — 2022 Tata Signa 4825.T' },
  { value: 'MH04CD5678', label: 'MH04CD5678 — 2021 Ashok Leyland U-3718' },
  { value: 'MH04KL4567', label: 'MH04KL4567 — 2022 BharatBenz 4228R' },
  { value: 'MH12EF9012', label: 'MH12EF9012 — 2023 Tata Signa 4825.T' },
];

const MOCK_ROUTES = [
  { value: '', label: 'Search routes...' },
  { value: 'mumbai-delhi', label: 'Mumbai → Delhi (JNPT) — 1,380 km' },
  { value: 'mumbai-ahmedabad', label: 'Mumbai → Ahmedabad — 530 km' },
  { value: 'mumbai-chennai', label: 'Mumbai → Chennai — 1,340 km' },
  { value: 'delhi-jaipur', label: 'Delhi → Jaipur — 280 km' },
];

const TRIP_TYPES = [
  { value: 'FTL', label: 'FTL — Full truck load' },
  { value: 'PTL', label: 'PTL — Part truck load' },
  { value: 'ODC', label: 'ODC — Over dimensional cargo' },
  { value: 'Container', label: 'Container' },
  { value: 'Tanker', label: 'Tanker' },
];

const MATERIAL_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'pharma', label: 'Pharmaceuticals' },
  { value: 'auto-parts', label: 'Auto Parts' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'metals', label: 'Metals & Alloys' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'agri', label: 'Agricultural Products' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_TERMS = [
  { value: 'to-pay', label: 'To pay' },
  { value: 'paid', label: 'Paid' },
  { value: 'to-be-billed', label: 'To be billed' },
  { value: 'cod', label: 'COD' },
];

const RISK_TYPES = [
  { value: 'carrier', label: 'Carrier risk' },
  { value: 'owner', label: "Owner's risk" },
];

const CONSIGNORS = [
  { value: '', label: 'Search consignor...' },
  { value: 'reliance', label: 'Reliance Industries Ltd' },
  { value: 'tata', label: 'Tata Steel' },
  { value: 'hul', label: 'Hindustan Unilever' },
  { value: 'itc', label: 'ITC Limited' },
  { value: 'adani', label: 'Adani Ports' },
];

const CONSIGNEES = [
  { value: '', label: 'Search consignee...' },
  { value: 'reliance-delhi', label: 'Reliance Retail — Delhi Warehouse' },
  { value: 'tata-pune', label: 'Tata Motors — Pune Plant' },
  { value: 'hul-chennai', label: 'HUL — Chennai DC' },
  { value: 'itc-kolkata', label: 'ITC — Kolkata Hub' },
];

const BILLING_PARTIES = [
  { value: '', label: 'If different from consignor' },
  { value: 'reliance', label: 'Reliance Industries Ltd' },
  { value: 'tata', label: 'Tata Steel' },
  { value: 'hul', label: 'Hindustan Unilever' },
];

const TRANSPORTERS = [
  { value: '', label: 'Fleet owner name' },
  { value: 'goodwill', label: 'Goodwill Transport' },
  { value: 'agarwal', label: 'Agarwal Packers' },
  { value: 'gati', label: 'Gati Logistics' },
];

// ═══════════════════════════════════════════════════════════════
// TRIP CREATE CONTENT — Based on design screens
// Opens inside the slider panel
// ═══════════════════════════════════════════════════════════════
export default function TripCreateContent({ onSave }) {
  const { closeSlider } = useSliderStore();

  const today = new Date().toISOString().split('T')[0].split('-').reverse().join('/');

  const [form, setForm] = useState({
    // Core Selection
    vehicle: '',
    route: '',
    tripType: 'FTL',
    // LR / Consignment Note
    lrNumber: '',
    lrDate: today,
    invoiceNumbers: '',
    dispatchDate: today,
    dispatchTime: '',
    // Parties
    consignor: '',
    consignee: '',
    billingParty: '',
    transporter: '',
    // Cargo Details
    cargoDescription: '',
    materialType: '',
    weight: '',
    packages: '',
    ewayBillNo: '',
    // Financial
    freightAmount: '0',
    paymentTerms: 'to-pay',
    loadingNote: '',
    // Additional Fields
    consignmentValue: '0',
    permitNumber: '',
    documentNo: '',
    riskType: 'carrier',
    remarks: '',
    consignorAddress: '',
    consigneeAddress: '',
    trollyPalletQty: '0',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    onSave?.();
    closeSlider();
  };

  return (
    <div>
      {/* ─── Action Bar ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 20px',
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <button onClick={closeSlider} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
        >
          <i className="fas fa-times" style={{ fontSize: 10 }}></i> Cancel
        </button>
        <div style={{ flex: 1 }}></div>
        <button onClick={handleSave} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: 'none', borderRadius: 8, padding: '8px 20px',
          fontSize: 12, fontWeight: 700, color: '#fff',
          background: 'linear-gradient(135deg, #059669, #10B981)',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(5,150,105,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(5,150,105,0.25)'; }}
        >
          <i className="fas fa-check" style={{ fontSize: 10 }}></i> Save Trip
        </button>
      </div>

      {/* ─── Form Content ─── */}
      <div style={{ padding: '20px 20px 40px' }}>

        {/* ═══ 1. CORE SELECTION ═══ */}
        <Section
          title="Core Selection"
          emoji="🖥️"
          borderColor="#BAE6FD"
          headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)"
          accentColor="#0369A1"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Vehicle" value={form.vehicle} onChange={set('vehicle')} required
              options={MOCK_VEHICLES} />
            <FormField label="Route" value={form.route} onChange={set('route')} required
              options={MOCK_ROUTES} />
            <FormField label="Trip Type" value={form.tripType} onChange={set('tripType')}
              options={TRIP_TYPES} />
          </div>
        </Section>

        {/* ═══ 2. LR / CONSIGNMENT NOTE ═══ */}
        <Section
          title="LR / Consignment Note"
          emoji="📄"
          borderColor="#C4B5FD"
          headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)"
          accentColor="#6D28D9"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="LR / GCN No." value={form.lrNumber} onChange={set('lrNumber')} required
              placeholder="Consignment note number" />
            <FormField label="LR Date" value={form.lrDate} onChange={set('lrDate')} type="date" />
            <FormField label="Invoice Numbers" value={form.invoiceNumbers} onChange={set('invoiceNumbers')}
              placeholder="INV-001, INV-002" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Dispatch Date" value={form.dispatchDate} onChange={set('dispatchDate')} type="date" />
            <FormField label="Dispatch Time" value={form.dispatchTime} onChange={set('dispatchTime')} type="time"
              placeholder="--:-- --" />
          </div>
        </Section>

        {/* ═══ 3. PARTIES ═══ */}
        <Section
          title="Parties"
          emoji="🤝"
          borderColor="#FDE68A"
          headerBg="linear-gradient(135deg, #FFFBEB, #FEF3C7)"
          accentColor="#92400E"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignor (Pickup)" value={form.consignor} onChange={set('consignor')} required
              options={CONSIGNORS} />
            <FormField label="Consignee (Delivery)" value={form.consignee} onChange={set('consignee')} required
              options={CONSIGNEES} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Billing Party" value={form.billingParty} onChange={set('billingParty')}
              options={BILLING_PARTIES} />
            <FormField label="Transporter / BA Name" value={form.transporter} onChange={set('transporter')}
              options={TRANSPORTERS} />
          </div>
        </Section>

        {/* ═══ 4. CARGO DETAILS ═══ */}
        <Section
          title="Cargo Details"
          emoji="📦"
          borderColor="#FDBA74"
          headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)"
          accentColor="#9A3412"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Cargo Description" value={form.cargoDescription} onChange={set('cargoDescription')}
              placeholder="e.g. FMCG goods, chemicals" />
            <FormField label="Material Type" value={form.materialType} onChange={set('materialType')}
              options={MATERIAL_TYPES} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Weight (KG)" value={form.weight} onChange={set('weight')} type="number"
              placeholder="0" />
            <FormField label="Packages / Qty" value={form.packages} onChange={set('packages')} type="number"
              placeholder="0" />
            <FormField label="E-Way Bill No." value={form.ewayBillNo} onChange={set('ewayBillNo')}
              placeholder="EWB number" />
          </div>
        </Section>

        {/* ═══ 5. FINANCIAL ═══ */}
        <Section
          title="Financial"
          emoji="💰"
          borderColor="#FDE68A"
          headerBg="linear-gradient(135deg, #FEFCE8, #FEF9C3)"
          accentColor="#854D0E"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Freight Amount" value={form.freightAmount} onChange={set('freightAmount')} type="number"
              required placeholder="0" />
            <FormField label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')}
              options={PAYMENT_TERMS} />
            <FormField label="Loading Note" value={form.loadingNote} onChange={set('loadingNote')}
              placeholder="Special instructions" />
          </div>
        </Section>

        {/* ═══ 6. ADDITIONAL FIELDS (OPTIONAL) ═══ */}
        <Section
          title="Additional Fields (Optional)"
          emoji="⚙️"
          borderColor="#D1D5DB"
          headerBg="linear-gradient(135deg, #F9FAFB, #F3F4F6)"
          accentColor="#4B5563"
          collapsible
          defaultCollapsed
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignment Value (₹)" value={form.consignmentValue} onChange={set('consignmentValue')}
              type="number" placeholder="0" />
            <FormField label="Permit Number" value={form.permitNumber} onChange={set('permitNumber')}
              placeholder="If required" />
            <FormField label="Document No." value={form.documentNo} onChange={set('documentNo')}
              placeholder="Reference doc" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Risk Type" value={form.riskType} onChange={set('riskType')}
              options={RISK_TYPES} />
            <FormField label="Remarks" value={form.remarks} onChange={set('remarks')}
              placeholder="Any notes" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Consignor Address" value={form.consignorAddress} onChange={set('consignorAddress')}
              placeholder="Pickup address / PIN" />
            <FormField label="Consignee Address" value={form.consigneeAddress} onChange={set('consigneeAddress')}
              placeholder="Delivery address / PIN" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, maxWidth: '33%' }}>
            <FormField label="Trolly / Pallet Qty" value={form.trollyPalletQty} onChange={set('trollyPalletQty')}
              type="number" placeholder="0" />
          </div>
        </Section>

      </div>
    </div>
  );
}
