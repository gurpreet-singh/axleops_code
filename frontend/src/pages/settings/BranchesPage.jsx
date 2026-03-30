import { useState, useEffect } from 'react';
import branchService from '../../services/branchService';
import useSliderStore from '../../stores/sliderStore';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openSlider } = useSliderStore();

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await branchService.getAll();
      setBranches(data || []);
    } catch (e) {
      console.error('Failed to load branches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => openSlider({
    title: 'Add New Branch',
    subtitle: 'Create a new branch or office',
    content: <BranchFormContent onSave={refresh} />,
    width: '44vw',
  });

  const openDetail = (branch) => openSlider({
    title: branch.name,
    subtitle: `${branch.code} • ${branch.city || ''}, ${branch.state || ''}`,
    content: <BranchFormContent branch={branch} onSave={refresh} />,
    width: '44vw',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Branches</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> Add Branch
          </button>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginTop: 20 }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i> Loading branches...
          </div>
        ) : branches.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#94A3B8' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No branches configured</div>
            <div style={{ fontSize: 12, marginTop: 4, color: '#CBD5E1' }}>Create your first branch to get started</div>
          </div>
        ) : branches.map(b => (
          <div key={b.id}
            onClick={() => openDetail(b)}
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* HQ badge */}
            {b.headquarters && (
              <span style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                background: '#EEF2FF', color: '#6366F1', border: '1px solid #C7D2FE',
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>Headquarters</span>
            )}

            {/* Status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: b.active ? '#EEF2FF' : '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: b.active ? '#6366F1' : '#94A3B8', fontSize: 16,
              }}>
                <i className="fas fa-building"></i>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>{b.code}</div>
              </div>
            </div>

            {/* Location */}
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-map-marker-alt" style={{ fontSize: 10, color: '#94A3B8' }}></i>
              {b.city && b.state ? `${b.city}, ${b.state}` : b.city || b.state || 'No location set'}
            </div>

            {/* Resource Counts */}
            <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <ResourceCount icon="fas fa-truck" label="Vehicles" count={b.vehicleCount || 0} color="#3B82F6" />
              <ResourceCount icon="fas fa-id-badge" label="Drivers" count={b.driverCount || 0} color="#059669" />
              <ResourceCount icon="fas fa-route" label="Trips" count={b.tripCount || 0} color="#D97706" />
            </div>

            {/* Contact */}
            {(b.phone || b.email) && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9', fontSize: 11, color: '#94A3B8' }}>
                {b.phone && <span><i className="fas fa-phone" style={{ fontSize: 9, marginRight: 4 }}></i>{b.phone}</span>}
                {b.phone && b.email && <span style={{ margin: '0 8px' }}>•</span>}
                {b.email && <span><i className="fas fa-envelope" style={{ fontSize: 9, marginRight: 4 }}></i>{b.email}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── Resource Count Chip ────────────────────────────────────────

function ResourceCount({ icon, label, count, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
      <i className={icon} style={{ fontSize: 10, color }}></i>
      <span style={{ fontWeight: 700, color: '#1E293B' }}>{count}</span>
      <span style={{ color: '#94A3B8' }}>{label}</span>
    </div>
  );
}


// ─── Branch Form Content (for slider) ──────────────────────────

function BranchFormContent({ branch, onSave }) {
  const isEdit = !!branch;
  const [form, setForm] = useState({
    code: branch?.code || '',
    name: branch?.name || '',
    city: branch?.city || '',
    state: branch?.state || '',
    stateCode: branch?.stateCode || '',
    address: branch?.address || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    gstin: branch?.gstin || '',
    headquarters: branch?.headquarters || false,
    sortOrder: branch?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setError('');
    if (!form.code.trim()) return setError('Branch code is required');
    if (!form.name.trim()) return setError('Branch name is required');

    setSaving(true);
    try {
      if (isEdit) {
        await branchService.update(branch.id, form);
      } else {
        await branchService.create(form);
      }
      onSave();
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save branch';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this branch? Active resources must be transferred first.')) return;
    setSaving(true);
    try {
      await branchService.deactivate(branch.id);
      onSave();
    } catch (e) {
      const data = e.response?.data;
      if (data?.vehicleCount || data?.driverCount || data?.tripCount) {
        setError(`Cannot deactivate: ${data.vehicleCount} vehicles, ${data.driverCount} drivers, ${data.tripCount} active trips still assigned`);
      } else {
        setError(data?.message || 'Failed to deactivate branch');
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '10px 12px', fontSize: 13,
    border: '1px solid var(--border)', borderRadius: 8,
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = { fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4, display: 'block' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Action Bar (top) */}
      <div style={{
        padding: '12px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <i className={saving ? 'fas fa-spinner fa-spin' : 'fas fa-check'}></i>
            {isEdit ? 'Update' : 'Create'} Branch
          </button>
          {isEdit && !branch.headquarters && (
            <button className="btn btn-secondary" onClick={handleDeactivate} disabled={saving}
              style={{ color: '#DC2626', borderColor: '#FECACA' }}>
              <i className="fas fa-power-off"></i> Deactivate
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 16, borderRadius: 8,
            background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 500,
            border: '1px solid #FECACA',
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }}></i>{error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Code */}
          <div>
            <label style={labelStyle}>Code *</label>
            <input style={fieldStyle} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
              placeholder="e.g. PNQ, DEL, HQ" maxLength={10} />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={fieldStyle} value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Pune Office" />
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>City</label>
            <input style={fieldStyle} value={form.city} onChange={e => set('city', e.target.value)}
              placeholder="e.g. Pune" />
          </div>

          {/* State */}
          <div>
            <label style={labelStyle}>State</label>
            <input style={fieldStyle} value={form.state} onChange={e => set('state', e.target.value)}
              placeholder="e.g. Maharashtra" />
          </div>

          {/* State Code */}
          <div>
            <label style={labelStyle}>State Code</label>
            <input style={fieldStyle} value={form.stateCode} onChange={e => set('stateCode', e.target.value)}
              placeholder="e.g. MH" maxLength={5} />
          </div>

          {/* GSTIN */}
          <div>
            <label style={labelStyle}>GSTIN</label>
            <input style={fieldStyle} value={form.gstin} onChange={e => set('gstin', e.target.value)}
              placeholder="e.g. 27AABCU9603R1ZM" maxLength={15} />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={fieldStyle} value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="e.g. +91 98765 43210" />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input style={fieldStyle} value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="e.g. pune@company.com" />
          </div>

          {/* Address (full width) */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Address</label>
            <textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }}
              value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Full address..." />
          </div>

          {/* Sort Order */}
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input type="number" style={fieldStyle} value={form.sortOrder}
              onChange={e => set('sortOrder', parseInt(e.target.value) || 0)} />
          </div>

          {/* Headquarters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
            <input type="checkbox" id="hq-toggle" checked={form.headquarters}
              onChange={e => set('headquarters', e.target.checked)} />
            <label htmlFor="hq-toggle" style={{ fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <i className="fas fa-star" style={{ color: form.headquarters ? '#F59E0B' : '#CBD5E1', marginRight: 4 }}></i>
              Headquarters
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
