import { useState, useEffect } from 'react';
import platformAdminService from '../../services/platformAdminService';
import useSliderStore from '../../stores/sliderStore';
import AddTenantAdminContent from './AddTenantAdminContent';

// ═══════════════════════════════════════════════════════════
// Shared read-only field (same pattern as TripSliderContent)
// ═══════════════════════════════════════════════════════════
function Field({ label, value, mono, icon, badge, badgeColor, full }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
        {icon && <i className={icon} style={{ marginRight: 4, fontSize: 10 }}></i>}
        {label}
        {badge && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: badgeColor || '#DCFCE7', color: badgeColor === '#FEE2E2' ? '#991B1B' : '#16A34A' }}>{badge}</span>}
      </div>
      <div style={{ width: '100%', border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: 600, minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Form field (editable) — same pattern as TripSliderContent
// ═══════════════════════════════════════════════════════════
function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, full }) {
  const baseInput = {
    width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '9px 12px',
    fontSize: 13, color: '#1E293B', fontFamily: 'inherit', fontWeight: 500, outline: 'none',
    background: disabled ? '#F8FAFC' : '#fff',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}{required && <span style={{ color: '#DC2626' }}>*</span>}
      </div>
      {options ? (
        <select value={value} onChange={e => onChange?.(e.target.value)} style={{ ...baseInput, cursor: 'pointer' }} disabled={disabled}>
          {options.map((o, i) => <option key={i} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={baseInput}
          onFocus={e => { e.target.style.borderColor = '#1A73E8'; }}
          onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Section wrapper — same pattern as TripSliderContent
// ═══════════════════════════════════════════════════════════
function Section({ title, icon, iconColor, borderColor, headerBg, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '10px 14px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <i className={icon} style={{ fontSize: 13, color: iconColor || '#1A73E8' }}></i>}
        <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// TENANT DETAIL SLIDER CONTENT
// ═══════════════════════════════════════════════════════════
export default function TenantDetailContent({ tenant, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const { openSlider } = useSliderStore();

  // Editable form state
  const [form, setForm] = useState({
    name: tenant.name || '',
    tradeName: tenant.tradeName || '',
    gstin: tenant.gstin || '',
    pan: tenant.pan || '',
    city: tenant.city || '',
    state: tenant.state || '',
    phone: tenant.phone || '',
    email: tenant.email || '',
  });
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'branches') fetchBranches();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await platformAdminService.getTenantUsers(tenant.id);
      setUsers(res.data || []);
    } catch (err) { console.error('Failed to load tenant users:', err); }
    finally { setLoadingUsers(false); }
  };

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await platformAdminService.getTenantBranches(tenant.id);
      setBranches(res.data || []);
    } catch (err) { console.error('Failed to load tenant branches:', err); }
    finally { setLoadingBranches(false); }
  };

  const handleAddAdmin = () => {
    openSlider({
      title: `Add Admin — ${tenant.name}`,
      width: '480px',
      content: (
        <AddTenantAdminContent
          tenantId={tenant.id}
          tenantName={tenant.name}
          onSuccess={() => { fetchUsers(); if (onRefresh) onRefresh(); }}
        />
      ),
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: API call to update tenant
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { key: 'users', label: 'Users', icon: 'fas fa-users' },
    { key: 'branches', label: 'Branches', icon: 'fas fa-code-branch' },
  ];

  const statusColor = tenant.status === 'ACTIVE' ? '#16A34A' : tenant.status === 'SUSPENDED' ? '#D97706' : '#DC2626';

  return (
    <div>
      {/* Action Bar — uses standard .sl-action-bar pattern */}
      <div className="sl-action-bar" style={{ padding: '8px 20px', gap: 6, flexWrap: 'wrap' }}>
        <button className={`sl-action-btn sl-edit-toggle-btn ${isEditing ? 'active' : ''}`} onClick={() => { if (isEditing) { handleSave(); } else { setIsEditing(true); } }}>
          <i className={`fas fa-${isEditing ? 'save' : 'edit'}`}></i> {isEditing ? 'Save' : 'Edit Details'}
        </button>
        <button className="sl-action-btn" onClick={handleAddAdmin}>
          <i className="fas fa-user-plus"></i> Add System Admin
        </button>
        <div style={{ flex: 1 }}></div>
      </div>

      {/* Status Badge Row */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}40`, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor }}></span>
          {tenant.status || 'Active'}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{tenant.id?.substring(0, 8)}...</span>
      </div>

      {/* Tabs — uses standard .slider-tabs pattern */}
      <div className="slider-tabs" style={{ marginTop: 8 }}>
        {TABS.map(t => (
          <div key={t.key} className={`slider-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <i className={t.icon} style={{ marginRight: 4, fontSize: 11 }}></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 20 }}>
        {activeTab === 'overview' && <OverviewTab tenant={tenant} isEditing={isEditing} form={form} set={set} />}
        {activeTab === 'users' && <UsersTab users={users} loading={loadingUsers} />}
        {activeTab === 'branches' && <BranchesTab branches={branches} loading={loadingBranches} />}
      </div>
    </div>
  );
}


// ─── OVERVIEW TAB ────────────────────────────────────────────
function OverviewTab({ tenant, isEditing, form, set }) {
  return (
    <>
      {/* Summary Stats — same pattern as Trip Financials */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700, textTransform: 'uppercase' }}>Users</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1E3A5F', marginTop: 4 }}>{tenant.userCount || 0}</div>
        </div>
        <div style={{ padding: 14, background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
          <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 700, textTransform: 'uppercase' }}>Branches</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#166534', marginTop: 4 }}>{tenant.branchCount || 0}</div>
        </div>
      </div>

      {/* Tenant Details Section */}
      <Section title="Tenant Details" icon="fas fa-building" iconColor="#7C3AED" borderColor="#C4B5FD" headerBg="#F5F3FF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {isEditing ? (
            <>
              <FormField label="Tenant Name" value={form.name} onChange={set('name')} required />
              <FormField label="Trade Name" value={form.tradeName} onChange={set('tradeName')} />
              <FormField label="GSTIN" value={form.gstin} onChange={set('gstin')} placeholder="e.g. 27AABCU9603R1ZM" />
              <FormField label="PAN" value={form.pan} onChange={set('pan')} placeholder="e.g. AABCU9603R" />
              <FormField label="City" value={form.city} onChange={set('city')} />
              <FormField label="State" value={form.state} onChange={set('state')} />
              <FormField label="Phone" value={form.phone} onChange={set('phone')} type="tel" />
              <FormField label="Email" value={form.email} onChange={set('email')} type="email" />
            </>
          ) : (
            <>
              <Field label="Tenant Name" value={tenant.name} />
              <Field label="Trade Name" value={tenant.tradeName} />
              <Field label="GSTIN" value={tenant.gstin} mono />
              <Field label="PAN" value={tenant.pan} mono />
              <Field label="City" value={tenant.city} />
              <Field label="State" value={tenant.state} />
              <Field label="Phone" value={tenant.phone} />
              <Field label="Email" value={tenant.email} />
            </>
          )}
        </div>
      </Section>

      {/* System Info Section */}
      <Section title="System Info" icon="fas fa-cog" iconColor="#64748B" borderColor="#E2E8F0" headerBg="#F8FAFC">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Tenant ID" value={tenant.id} mono />
          <Field label="Created" value={tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : '—'} />
          <Field label="Status" value={tenant.status} badge={tenant.status === 'ACTIVE' ? 'Active' : tenant.status}
            badgeColor={tenant.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2'} />
        </div>
      </Section>
    </>
  );
}


// ─── USERS TAB ────────────────────────────────────────────
function UsersTab({ users, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
        <i className="fas fa-spinner fa-spin"></i> Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Section title="Team Members" icon="fas fa-users" iconColor="#7C3AED" borderColor="#C4B5FD" headerBg="#F5F3FF">
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8' }}>
          <i className="fas fa-users" style={{ fontSize: '1.5rem', opacity: 0.3, marginBottom: 8, display: 'block' }}></i>
          No users found for this tenant
        </div>
      </Section>
    );
  }

  return (
    <Section title={`Team Members (${users.length})`} icon="fas fa-users" iconColor="#7C3AED" borderColor="#C4B5FD" headerBg="#F5F3FF">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {users.map((user, i) => (
          <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < users.length - 1 ? '1px solid #F8FAFC' : 'none', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
            }}>
              {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                {user.email} • {user.title || user.role}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#EFF6FF', color: '#1D4ED8' }}>
                {user.role}
              </span>
              {user.branchName && (
                <span style={{ fontSize: 10, color: '#94A3B8' }}>
                  <i className="fas fa-code-branch"></i> {user.branchName}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}


// ─── BRANCHES TAB ─────────────────────────────────────────
function BranchesTab({ branches, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
        <i className="fas fa-spinner fa-spin"></i> Loading branches...
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <Section title="Branches" icon="fas fa-code-branch" iconColor="#0D9488" borderColor="#A7F3D0" headerBg="#F0FDF4">
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8' }}>
          <i className="fas fa-code-branch" style={{ fontSize: '1.5rem', opacity: 0.3, marginBottom: 8, display: 'block' }}></i>
          No branches found for this tenant
        </div>
      </Section>
    );
  }

  return (
    <Section title={`Branches (${branches.length})`} icon="fas fa-code-branch" iconColor="#0D9488" borderColor="#A7F3D0" headerBg="#F0FDF4">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {branches.map((branch, i) => (
          <div key={branch.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < branches.length - 1 ? '1px solid #F8FAFC' : 'none', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: branch.isPrimary ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'linear-gradient(135deg, #64748b, #94a3b8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, flexShrink: 0,
            }}>
              <i className={branch.isPrimary ? 'fas fa-star' : 'fas fa-code-branch'}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>
                {branch.name}
                {branch.isPrimary && (
                  <span style={{ fontSize: 9, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, marginLeft: 8, fontWeight: 700 }}>PRIMARY</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                {[branch.city, branch.state].filter(Boolean).join(', ') || '—'}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
              background: branch.status === 'ACTIVE' ? '#DCFCE7' : '#FEF2F2',
              color: branch.status === 'ACTIVE' ? '#166534' : '#B91C1C',
            }}>
              {branch.status}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
