import { useState } from 'react';
import useSliderStore from '../../stores/sliderStore';
import ledgerAccountService, { ACCOUNT_TYPE_OPTIONS, TCS_OPTIONS, ACCOUNT_TYPE_COLORS } from '../../services/ledgerAccountService';

// ═══════════════════════════════════════════════════════════════
// Reusable Form Components (consistent with RouteSliderContent)
// ═══════════════════════════════════════════════════════════════

function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, info, full, textarea, rows }) {
  const baseInput = {
    width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px',
    fontSize: 13, color: '#1E293B', fontFamily: 'inherit', fontWeight: 500, outline: 'none',
    background: disabled ? '#F8FAFC' : '#fff', transition: 'border-color 0.15s, box-shadow 0.15s',
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
          rows={rows || 3} style={{ ...baseInput, resize: 'vertical', minHeight: 72 }}
          onFocus={focusStyle} onBlur={blurStyle} />
      ) : options ? (
        <select value={value} onChange={e => onChange?.(e.target.value)}
          style={{ ...baseInput, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
          disabled={disabled}>
          {options.map((o, i) => <option key={i} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={baseInput} onFocus={focusStyle} onBlur={blurStyle} />
      )}
      {info && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}><i className="fas fa-info-circle" style={{ marginRight: 3 }}></i>{info}</div>}
    </div>
  );
}

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

function Section({ title, emoji, borderColor, headerBg, accentColor, children, collapsible, defaultCollapsed }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed || false);
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden', background: '#fff' }}>
      <div onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        style={{ background: headerBg || '#F8FAFC', padding: '12px 16px', borderBottom: collapsed ? 'none' : `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8, cursor: collapsible ? 'pointer' : 'default', userSelect: 'none' }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 }}>{title}</span>
        {collapsible && <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`} style={{ fontSize: 10, color: '#94A3B8' }}></i>}
      </div>
      {!collapsed && <div style={{ padding: '16px 16px 18px' }}>{children}</div>}
    </div>
  );
}

const INR = n => n ? '₹' + Number(n).toLocaleString('en-IN') : '—';


// ═══════════════════════════════════════════════════════════════
// CREATE SLIDER
// ═══════════════════════════════════════════════════════════════

export function LedgerAccountCreateContent({ onSave, groups }) {
  const { closeSlider } = useSliderStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accountHead: '', tallyName: '', nameOnDashboard: '',
    accountGroupId: '', accountType: '',
    openingBalance: '', currency: 'INR',
    panNumber: '', gstin: '', legalName: '', ourVendorCode: '',
    tcsApplicable: '', paymentTerms: '', tallyPaymentTerms: '', pumpAccount: false,
    billingAddress: '', city: '', state: '', stateCode: '', country: 'India', pinCode: '',
    phone: '', mobile: '', email: '', contactPerson: '', designation: '',
    shippedToSameAsBilling: true,
    shippingAddress: '', shippingCity: '', shippingState: '', shippingStateCode: '', shippingCountry: '', shippingPinCode: '',
    shippingPhone: '', shippingContactPerson: '', shippingDesignation: '',
    originCity: '', destinationCity: '', distanceKm: '',
    cinNumber: '', lastYearRevenue: '', defaultShippedToCode: '',
  });
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const groupOptions = [
    { value: '', label: 'Select account group' },
    ...groups.map(g => ({ value: g.id, label: `${g.name} (${g.nature})` }))
  ];

  const handleSave = async () => {
    if (!form.accountHead || !form.accountGroupId || !form.accountType) return;
    setSaving(true);
    try {
      await ledgerAccountService.create({
        ...form,
        openingBalance: form.openingBalance ? parseFloat(form.openingBalance) : 0,
        distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : null,
        lastYearRevenue: form.lastYearRevenue ? parseFloat(form.lastYearRevenue) : null,
        tcsApplicable: form.tcsApplicable || null,
      });
      onSave?.();
      closeSlider();
    } catch (err) {
      console.error('Failed to create ledger account:', err);
    } finally {
      setSaving(false);
    }
  };

  const isPartyType = form.accountType === 'PARTY_ROUTE' || form.accountType === 'PARTY_GENERAL';
  const isRouteType = form.accountType === 'PARTY_ROUTE';

  return (
    <div>
      {/* Sticky Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={handleSave} disabled={saving || !form.accountHead || !form.accountGroupId || !form.accountType}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
            fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
            cursor: (saving || !form.accountHead) ? 'not-allowed' : 'pointer',
            opacity: (saving || !form.accountHead) ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className={`fas fa-${saving ? 'spinner fa-spin' : 'plus'}`} style={{ fontSize: 10 }}></i>
          {saving ? 'Creating...' : 'Create Account'}
        </button>
        <button onClick={closeSlider} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
        }}>Cancel</button>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {/* Identity */}
        <Section title="Account Identity" emoji="🏷️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Account Head" value={form.accountHead} onChange={set('accountHead')} required placeholder="e.g. Nashik To Chakan" full />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Ledger Group" value={form.accountGroupId} onChange={set('accountGroupId')} required options={groupOptions} />
            <FormField label="Account Type" value={form.accountType} onChange={set('accountType')} required options={ACCOUNT_TYPE_OPTIONS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Tally Name" value={form.tallyName} onChange={set('tallyName')} placeholder="Override for Tally sync" />
            <FormField label="Dashboard Name" value={form.nameOnDashboard} onChange={set('nameOnDashboard')} placeholder="Display override" />
          </div>
        </Section>

        {/* Financials */}
        <Section title="Financials" emoji="💰" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Opening Balance (₹)" value={form.openingBalance} onChange={set('openingBalance')} type="number" placeholder="0.00" />
            <FormField label="Currency" value={form.currency} onChange={set('currency')} options={[{ value: 'INR', label: 'INR — Indian Rupee' }, { value: 'USD', label: 'USD' }]} />
          </div>
        </Section>

        {/* Party Data — only for PARTY_* types */}
        {isPartyType && (
          <Section title="Party Data" emoji="🏢" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
            <div style={{ padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-info-circle" style={{ fontSize: 11 }}></i>
              Party data is denormalised from the Company master for zero-join reads.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <FormField label="Legal Name" value={form.legalName} onChange={set('legalName')} placeholder="e.g. Mahindra & Mahindra Ltd." />
              <FormField label="PAN Number" value={form.panNumber} onChange={set('panNumber')} placeholder="e.g. AAFCM2530H" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <FormField label="GSTIN" value={form.gstin} onChange={set('gstin')} placeholder="e.g. 27AAFCM2530H1ZO" />
              <FormField label="Vendor Code" value={form.ourVendorCode} onChange={set('ourVendorCode')} placeholder="Our vendor code" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <FormField label="TCS Applicable" value={form.tcsApplicable} onChange={set('tcsApplicable')} options={TCS_OPTIONS} />
              <FormField label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')} placeholder="e.g. 30 days" />
              <FormField label="Tally Payment Terms" value={form.tallyPaymentTerms} onChange={set('tallyPaymentTerms')} placeholder="Tally terms" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
              <input type="checkbox" checked={form.pumpAccount} onChange={e => set('pumpAccount')(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>Fuel Vendor (Pump Account)</div>
                <div style={{ fontSize: 10, color: '#B91C1C' }}>Mark this if the account is a fuel pump / vendor</div>
              </div>
            </div>
          </Section>
        )}

        {/* Address */}
        <Section title="Billing Address" emoji="📍" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412" collapsible defaultCollapsed={!isPartyType}>
          <FormField label="Full Address" value={form.billingAddress} onChange={set('billingAddress')} textarea placeholder="Complete billing address..." full />
          <div style={{ height: 14 }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="City" value={form.city} onChange={set('city')} placeholder="e.g. Mumbai" />
            <FormField label="State" value={form.state} onChange={set('state')} placeholder="e.g. Maharashtra" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="State Code" value={form.stateCode} onChange={set('stateCode')} placeholder="e.g. 27" />
            <FormField label="Country" value={form.country} onChange={set('country')} />
            <FormField label="PIN Code" value={form.pinCode} onChange={set('pinCode')} placeholder="e.g. 400001" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Phone" value={form.phone} onChange={set('phone')} placeholder="Landline" />
            <FormField label="Mobile" value={form.mobile} onChange={set('mobile')} placeholder="Mobile number" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <FormField label="Email" value={form.email} onChange={set('email')} type="email" placeholder="email@company.com" />
            <FormField label="Contact Person" value={form.contactPerson} onChange={set('contactPerson')} placeholder="Name" />
            <FormField label="Designation" value={form.designation} onChange={set('designation')} placeholder="Title" />
          </div>
        </Section>

        {/* Shipping — only if not same as billing */}
        <Section title="Shipping Address" emoji="🚚" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626" collapsible defaultCollapsed>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, marginBottom: 14 }}>
            <input type="checkbox" checked={form.shippedToSameAsBilling} onChange={e => set('shippedToSameAsBilling')(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>Same as Billing Address</div>
          </div>
          {!form.shippedToSameAsBilling && (
            <>
              <FormField label="Shipping Address" value={form.shippingAddress} onChange={set('shippingAddress')} textarea placeholder="Full shipping address..." full />
              <div style={{ height: 14 }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <FormField label="Ship City" value={form.shippingCity} onChange={set('shippingCity')} placeholder="City" />
                <FormField label="Ship State" value={form.shippingState} onChange={set('shippingState')} placeholder="State" />
                <FormField label="Ship State Code" value={form.shippingStateCode} onChange={set('shippingStateCode')} placeholder="Code" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <FormField label="Ship Country" value={form.shippingCountry} onChange={set('shippingCountry')} />
                <FormField label="Ship PIN" value={form.shippingPinCode} onChange={set('shippingPinCode')} placeholder="PIN" />
                <FormField label="Ship Phone" value={form.shippingPhone} onChange={set('shippingPhone')} placeholder="Phone" />
              </div>
            </>
          )}
        </Section>

        {/* Route Data — only for PARTY_ROUTE */}
        {isRouteType && (
          <Section title="Route Data" emoji="🗺️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <FormField label="Origin City" value={form.originCity} onChange={set('originCity')} placeholder="e.g. Nashik" />
              <FormField label="Destination City" value={form.destinationCity} onChange={set('destinationCity')} placeholder="e.g. Chakan" />
              <FormField label="Distance (KM)" value={form.distanceKm} onChange={set('distanceKm')} type="number" placeholder="e.g. 85" />
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// DETAIL SLIDER
// ═══════════════════════════════════════════════════════════════

export function LedgerAccountDetailContent({ account, onSave, groups }) {
  const { closeSlider } = useSliderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState({ ...account });
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const tc = ACCOUNT_TYPE_COLORS[account.accountType] || ACCOUNT_TYPE_COLORS.GENERAL;
  const isPartyType = account.accountType === 'PARTY_ROUTE' || account.accountType === 'PARTY_GENERAL';
  const isRouteType = account.accountType === 'PARTY_ROUTE';

  const groupOptions = [
    { value: '', label: 'Select group' },
    ...groups.map(g => ({ value: g.id, label: `${g.name} (${g.nature})` }))
  ];

  const handleSave = async () => {
    try {
      await ledgerAccountService.update(account.id, {
        ...form,
        openingBalance: form.openingBalance ? parseFloat(form.openingBalance) : 0,
        distanceKm: form.distanceKm ? parseFloat(form.distanceKm) : null,
        lastYearRevenue: form.lastYearRevenue ? parseFloat(form.lastYearRevenue) : null,
        tcsApplicable: form.tcsApplicable || null,
      });
      setIsEditing(false);
      onSave?.();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(isPartyType ? [{ id: 'party', label: 'Party Details' }] : []),
    { id: 'address', label: 'Address' },
    ...(isRouteType ? [{ id: 'route', label: 'Route' }] : []),
  ];

  return (
    <div>
      {/* Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={() => { if (isEditing) { handleSave(); } else { setIsEditing(true); } }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: `1.5px solid ${isEditing ? '#059669' : '#E2E8F0'}`,
            borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
            color: isEditing ? '#059669' : '#475569',
            background: isEditing ? '#ECFDF5' : '#fff',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`} style={{ fontSize: 10 }}></i>
          {isEditing ? 'Save Changes' : 'Edit Details'}
        </button>
        <div style={{ flex: 1 }}></div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
          {account.accountType?.replace(/_/g, ' ')}
        </span>
        {account.active ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }}></span>Active
          </span>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', padding: '4px 10px', border: '1px solid #E2E8F0', borderRadius: 20, background: '#F8FAFC' }}>Inactive</span>
        )}
      </div>

      {/* Balance summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 20px', background: '#FAFBFC', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ padding: 12, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Opening Balance</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{INR(account.openingBalance)}</div>
        </div>
        <div style={{ padding: 12, background: (account.currentBalance || 0) >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${(account.currentBalance || 0) >= 0 ? '#BBF7D0' : '#FECACA'}`, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: (account.currentBalance || 0) >= 0 ? '#16A34A' : '#DC2626', textTransform: 'uppercase' }}>Current Balance</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: (account.currentBalance || 0) >= 0 ? '#166534' : '#991B1B', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{INR(account.currentBalance)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="slider-tabs" style={{ padding: '0 20px', borderBottom: '1px solid #E2E8F0' }}>
        {tabs.map(t => (
          <button key={t.id} className={`slider-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            style={{ background: 'none', border: 'none', padding: '10px 16px', fontSize: 12, fontWeight: 600, color: activeTab === t.id ? '#1A73E8' : '#64748B', borderBottom: activeTab === t.id ? '2px solid #1A73E8' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          isEditing ? (
            <>
              <Section title="Identity" emoji="🏷️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <FormField label="Account Head" value={form.accountHead} onChange={set('accountHead')} required full />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <FormField label="Ledger Group" value={form.accountGroupId} onChange={set('accountGroupId')} options={groupOptions} />
                  <FormField label="Account Type" value={form.accountType} onChange={set('accountType')} options={ACCOUNT_TYPE_OPTIONS} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <FormField label="Tally Name" value={form.tallyName} onChange={set('tallyName')} />
                  <FormField label="Dashboard Name" value={form.nameOnDashboard} onChange={set('nameOnDashboard')} />
                </div>
              </Section>
              <Section title="Financials" emoji="💰" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <FormField label="Opening Balance" value={form.openingBalance} onChange={set('openingBalance')} type="number" />
                  <FormField label="Currency" value={form.currency} onChange={set('currency')} />
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section title="Identity" emoji="🏷️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ReadField label="Account Head" value={account.accountHead} />
                  <ReadField label="Ledger Group" value={account.accountGroup} />
                  <ReadField label="Group Nature" value={account.groupNature} />
                  <ReadField label="Account Type" value={account.accountType?.replace(/_/g, ' ')} />
                  <ReadField label="Tally Name" value={account.tallyName} />
                  <ReadField label="Dashboard Name" value={account.nameOnDashboard} />
                </div>
              </Section>
              <Section title="Financials" emoji="💰" borderColor="#A7F3D0" headerBg="linear-gradient(135deg, #F0FDF4, #DCFCE7)" accentColor="#059669">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <ReadField label="Opening Balance" value={INR(account.openingBalance)} mono />
                  <ReadField label="Current Balance" value={INR(account.currentBalance)} mono />
                  <ReadField label="Currency" value={account.currency} />
                  <ReadField label="Status" value={account.active ? '✅ Active' : '❌ Inactive'} />
                </div>
              </Section>
            </>
          )
        )}

        {/* PARTY TAB */}
        {activeTab === 'party' && (
          isEditing ? (
            <Section title="Party Data" emoji="🏢" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <FormField label="Legal Name" value={form.legalName} onChange={set('legalName')} />
                <FormField label="PAN" value={form.panNumber} onChange={set('panNumber')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <FormField label="GSTIN" value={form.gstin} onChange={set('gstin')} />
                <FormField label="Vendor Code" value={form.ourVendorCode} onChange={set('ourVendorCode')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <FormField label="TCS" value={form.tcsApplicable} onChange={set('tcsApplicable')} options={TCS_OPTIONS} />
                <FormField label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')} />
                <FormField label="Tally Terms" value={form.tallyPaymentTerms} onChange={set('tallyPaymentTerms')} />
              </div>
            </Section>
          ) : (
            <Section title="Party Data" emoji="🏢" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ReadField label="Legal Name" value={account.legalName} />
                <ReadField label="PAN Number" value={account.panNumber} mono />
                <ReadField label="GSTIN" value={account.gstin} mono />
                <ReadField label="Vendor Code" value={account.ourVendorCode} mono />
                <ReadField label="TCS Applicable" value={account.tcsApplicable?.replace(/_/g, ' ') || 'Not Applicable'} />
                <ReadField label="Payment Terms" value={account.paymentTerms} />
                <ReadField label="Tally Terms" value={account.tallyPaymentTerms} />
                <ReadField label="Pump Account" value={account.pumpAccount ? '⛽ Yes' : 'No'} />
              </div>
            </Section>
          )
        )}

        {/* ADDRESS TAB */}
        {activeTab === 'address' && (
          isEditing ? (
            <>
              <Section title="Billing Address" emoji="📍" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
                <FormField label="Address" value={form.billingAddress} onChange={set('billingAddress')} textarea full />
                <div style={{ height: 14 }}></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <FormField label="City" value={form.city} onChange={set('city')} />
                  <FormField label="State" value={form.state} onChange={set('state')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <FormField label="State Code" value={form.stateCode} onChange={set('stateCode')} />
                  <FormField label="Country" value={form.country} onChange={set('country')} />
                  <FormField label="PIN" value={form.pinCode} onChange={set('pinCode')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <FormField label="Phone" value={form.phone} onChange={set('phone')} />
                  <FormField label="Mobile" value={form.mobile} onChange={set('mobile')} />
                  <FormField label="Email" value={form.email} onChange={set('email')} />
                </div>
              </Section>
            </>
          ) : (
            <>
              <Section title="Billing Address" emoji="📍" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1 / -1' }}><ReadField label="Full Address" value={account.billingAddress} /></div>
                  <ReadField label="City" value={account.city} />
                  <ReadField label="State" value={account.state} />
                  <ReadField label="State Code" value={account.stateCode} mono />
                  <ReadField label="Country" value={account.country} />
                  <ReadField label="PIN Code" value={account.pinCode} mono />
                  <ReadField label="Phone" value={account.phone} />
                  <ReadField label="Mobile" value={account.mobile} />
                  <ReadField label="Email" value={account.email} />
                  <ReadField label="Contact Person" value={account.contactPerson} />
                  <ReadField label="Designation" value={account.designation} />
                </div>
              </Section>
              {!account.shippedToSameAsBilling && (
                <Section title="Shipping Address" emoji="🚚" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ gridColumn: '1 / -1' }}><ReadField label="Shipping Address" value={account.shippingAddress} /></div>
                    <ReadField label="City" value={account.shippingCity} />
                    <ReadField label="State" value={account.shippingState} />
                    <ReadField label="State Code" value={account.shippingStateCode} mono />
                    <ReadField label="PIN" value={account.shippingPinCode} mono />
                  </div>
                </Section>
              )}
            </>
          )
        )}

        {/* ROUTE TAB */}
        {activeTab === 'route' && (
          isEditing ? (
            <Section title="Route Data" emoji="🗺️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <FormField label="Origin City" value={form.originCity} onChange={set('originCity')} />
                <FormField label="Destination City" value={form.destinationCity} onChange={set('destinationCity')} />
                <FormField label="Distance (KM)" value={form.distanceKm} onChange={set('distanceKm')} type="number" />
              </div>
            </Section>
          ) : (
            <Section title="Route Data" emoji="🗺️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <ReadField label="Origin City" value={account.originCity} />
                <ReadField label="Destination City" value={account.destinationCity} />
                <ReadField label="Distance" value={account.distanceKm ? `${account.distanceKm} km` : '—'} />
              </div>
            </Section>
          )
        )}
      </div>
    </div>
  );
}
