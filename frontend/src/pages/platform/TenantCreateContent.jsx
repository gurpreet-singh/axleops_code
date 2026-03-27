import { useState } from 'react';
import platformAdminService from '../../services/platformAdminService';
import useSliderStore from '../../stores/sliderStore';

// ═══════════════════════════════════════════════════════════
// FormField — same reusable pattern as RouteSliderContent
// ═══════════════════════════════════════════════════════════
function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, info, full }) {
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
      {options ? (
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

// ═══════════════════════════════════════════════════════════
// Section — same reusable pattern as RouteSliderContent
// ═══════════════════════════════════════════════════════════
function Section({ title, emoji, borderColor, headerBg, accentColor, children }) {
  return (
    <div style={{
      border: `1.5px solid ${borderColor || '#E2E8F0'}`,
      borderRadius: 14, marginBottom: 16, overflow: 'hidden',
      background: '#fff', transition: 'box-shadow 0.2s',
    }}>
      <div style={{
        background: headerBg || '#F8FAFC', padding: '12px 16px',
        borderBottom: `1px solid ${borderColor || '#E2E8F0'}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6, flex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: '16px 16px 18px' }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TENANT CREATE SLIDER CONTENT
// Uses same dark header + action bar + sections pattern
// ═══════════════════════════════════════════════════════════
export default function TenantCreateContent({ onSuccess }) {
  const { closeSlider } = useSliderStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '', tradeName: '', gstin: '', pan: '',
    address: '', city: '', state: '', phone: '', email: '',
    primaryBranchName: '', primaryBranchCity: '', primaryBranchState: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '', adminTitle: '',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Tenant name is required'); return; }
    if (!form.adminEmail.trim()) { setError('System admin email is required'); return; }
    if (!form.adminPassword.trim()) { setError('System admin password is required'); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        primaryBranchName: form.primaryBranchName || `${form.city || form.name} HQ`,
        primaryBranchCity: form.primaryBranchCity || form.city,
        primaryBranchState: form.primaryBranchState || form.state,
      };
      await platformAdminService.createTenant(payload);
      if (onSuccess) onSuccess();
      closeSlider();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Action Bar — same as RouteCreateContent */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={handleSubmit} disabled={saving} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
          fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
          cursor: saving ? 'wait' : 'pointer', transition: 'all 0.15s', opacity: saving ? 0.7 : 1,
          fontFamily: 'inherit',
        }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className={`fas fa-${saving ? 'spinner fa-spin' : 'plus'}`} style={{ fontSize: 10 }}></i>
          {saving ? 'Creating...' : 'Create Tenant'}
        </button>
        <button onClick={closeSlider} disabled={saving} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          Cancel
        </button>
        <div style={{ flex: 1 }}></div>
      </div>

      {/* Form Content */}
      <div style={{ padding: '20px 20px 40px' }}>
        {/* Error Banner */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: 11 }}></i>
            {error}
          </div>
        )}

        {/* ═══ 1. TENANT INFORMATION ═══ */}
        <Section title="Tenant Information" emoji="🏢" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Tenant Name" value={form.name} onChange={set('name')} required placeholder="e.g. Gobind Transport" />
            <FormField label="Trade Name" value={form.tradeName} onChange={set('tradeName')} placeholder="e.g. Gobind Transport" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="GSTIN" value={form.gstin} onChange={set('gstin')} placeholder="e.g. 03AABCU9603R1ZM" />
            <FormField label="PAN" value={form.pan} onChange={set('pan')} placeholder="e.g. AABCU9603R" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="City" value={form.city} onChange={set('city')} placeholder="e.g. Amritsar" />
            <FormField label="State" value={form.state} onChange={set('state')} placeholder="e.g. Punjab" />
          </div>
          <FormField label="Address" value={form.address} onChange={set('address')} placeholder="Full address" full />
          <div style={{ height: 14 }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Phone" value={form.phone} onChange={set('phone')} type="tel" placeholder="Phone number" />
            <FormField label="Email" value={form.email} onChange={set('email')} type="email" placeholder="company@example.com" />
          </div>
        </Section>

        {/* ═══ 2. PRIMARY BRANCH ═══ */}
        <Section title="Primary Branch" emoji="🏗️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
          {/* Info banner */}
          <div style={{ padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-info-circle" style={{ fontSize: 11 }}></i>
            Auto-populated from tenant details if left empty.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Branch Name" value={form.primaryBranchName} onChange={set('primaryBranchName')} placeholder={form.city ? `${form.city} HQ` : 'HQ'} />
            <FormField label="Branch City" value={form.primaryBranchCity} onChange={set('primaryBranchCity')} placeholder={form.city || 'City'} />
          </div>
        </Section>

        {/* ═══ 3. INITIAL SYSTEM ADMIN ═══ */}
        <Section title="Initial System Admin" emoji="🔐" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626">
          {/* Info banner */}
          <div style={{ padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8, marginBottom: 14, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-info-circle" style={{ fontSize: 11 }}></i>
            First admin user for this tenant. They can create other users later.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="First Name" value={form.adminFirstName} onChange={set('adminFirstName')} required placeholder="First name" />
            <FormField label="Last Name" value={form.adminLastName} onChange={set('adminLastName')} placeholder="Last name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Login Email" value={form.adminEmail} onChange={set('adminEmail')} required placeholder="admin@company.com" type="email" />
            <FormField label="Password" value={form.adminPassword} onChange={set('adminPassword')} required placeholder="Initial password" type="password" />
          </div>
          <FormField label="Title" value={form.adminTitle} onChange={set('adminTitle')} placeholder="e.g. Managing Director" full />
        </Section>
      </div>
    </div>
  );
}
