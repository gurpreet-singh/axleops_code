import { useState } from 'react';
import platformAdminService from '../../services/platformAdminService';
import useSliderStore from '../../stores/sliderStore';

// ═══════════════════════════════════════════════════════════
// FormField — same reusable pattern
// ═══════════════════════════════════════════════════════════
function FormField({ label, value, onChange, type = 'text', placeholder, required, full }) {
  const baseInput = {
    width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px',
    fontSize: 13, color: '#1E293B', fontFamily: 'inherit', fontWeight: 500, outline: 'none',
    background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
        {required && <span style={{ color: '#DC2626', fontSize: 13 }}>*</span>}
      </div>
      <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={baseInput}
        onFocus={e => { e.target.style.borderColor = '#1A73E8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.08)'; }}
        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Section wrapper
// ═══════════════════════════════════════════════════════════
function Section({ title, emoji, borderColor, headerBg, accentColor, children }) {
  return (
    <div style={{
      border: `1.5px solid ${borderColor || '#E2E8F0'}`,
      borderRadius: 14, marginBottom: 16, overflow: 'hidden',
      background: '#fff',
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


export default function AddTenantAdminContent({ tenantId, tenantName, onSuccess }) {
  const { closeSlider } = useSliderStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', title: '', phone: '',
  });
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.email.trim()) { setError('First name and email are required'); return; }
    if (!form.password.trim()) { setError('Password is required'); return; }

    setSaving(true);
    setError(null);
    try {
      await platformAdminService.addTenantAdmin(tenantId, form);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => closeSlider(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add admin');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16A34A, #4ADE80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 24, color: '#fff',
        }}>
          <i className="fas fa-check"></i>
        </div>
        <h3 style={{ marginBottom: 4, color: '#1E293B' }}>Admin Added!</h3>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>
          System admin has been added to <strong>{tenantName}</strong>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
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
          <i className={`fas fa-${saving ? 'spinner fa-spin' : 'user-plus'}`} style={{ fontSize: 10 }}></i>
          {saving ? 'Adding...' : 'Add Admin'}
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

        <Section title="Admin Details" emoji="🔐" borderColor="#FECACA" headerBg="linear-gradient(135deg, #FEF2F2, #FFE4E6)" accentColor="#DC2626">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="First Name" value={form.firstName} onChange={set('firstName')} required placeholder="First name" />
            <FormField label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Last name" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Login Email" value={form.email} onChange={set('email')} required placeholder="admin@company.com" type="email" />
            <FormField label="Password" value={form.password} onChange={set('password')} required placeholder="Password" type="password" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Title" value={form.title} onChange={set('title')} placeholder="e.g. Managing Director" />
            <FormField label="Phone" value={form.phone} onChange={set('phone')} placeholder="Phone number" type="tel" />
          </div>
        </Section>
      </div>
    </div>
  );
}
