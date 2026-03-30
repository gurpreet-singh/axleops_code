import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import masterService from '../../services/masterService';
import useSliderStore from '../../stores/sliderStore';

// ─── Entity navigation sidebar items ──────────────────────────────
const ENTITY_NAV = [
  { slug: 'vehicle-types', name: 'Vehicle Types', icon: 'fas fa-truck', color: '#6366F1' },
  { slug: 'equipment-types', name: 'Equipment Types', icon: 'fas fa-cogs', color: '#8B5CF6' },
  { slug: 'document-types', name: 'Document Types', icon: 'fas fa-file-alt', color: '#0EA5E9' },
  { slug: 'service-types', name: 'Service Types', icon: 'fas fa-wrench', color: '#F59E0B' },
  { slug: 'part-categories', name: 'Part Categories', icon: 'fas fa-puzzle-piece', color: '#10B981' },
  { slug: 'inspection-templates', name: 'Inspections', icon: 'fas fa-clipboard-check', color: '#14B8A6' },
  { slug: 'locations', name: 'Locations', icon: 'fas fa-map-marker-alt', color: '#EF4444' },
  { slug: 'toll-plazas', name: 'Toll Plazas', icon: 'fas fa-road', color: '#64748B' },
  { slug: 'payment-terms', name: 'Payment Terms', icon: 'fas fa-calendar-check', color: '#0369A1' },
  { slug: 'tax-config', name: 'Tax Config', icon: 'fas fa-percent', color: '#DC2626' },
  { slug: 'number-series', name: 'Number Series', icon: 'fas fa-hashtag', color: '#7C3AED' },
  { slug: 'alert-rules', name: 'Alert Rules', icon: 'fas fa-bell', color: '#F97316' },
  { slug: 'expense-categories', name: 'Expense Categories', icon: 'fas fa-receipt', color: '#059669' },
  { slug: 'ledger-groups', name: 'Ledger Groups', icon: 'fas fa-layer-group', color: '#6D28D9' },
  { slug: 'freight-charge-types', name: 'Freight Charges', icon: 'fas fa-file-invoice-dollar', color: '#0891B2' },
];

// ─── Format field values for display ─────────────────────────────
function formatValue(val, fieldKey) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? '✓ Yes' : '✗ No';
  if (typeof val === 'number') {
    if (fieldKey?.includes('rate') || fieldKey?.includes('cost') || fieldKey?.includes('Cost') || fieldKey?.includes('Rate') || fieldKey?.includes('amount'))
      return `₹${val.toLocaleString('en-IN')}`;
    return val.toLocaleString('en-IN');
  }
  if (typeof val === 'string' && val.match(/^[A-Z_]+$/)) {
    return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\B[A-Z]/g, l => l.toLowerCase());
  }
  return String(val);
}

// ─── Label from field key ────────────────────────────────────────
function fieldLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/Id$/, '')
    .replace(/Cft$/, ' (cft)')
    .replace(/Ltrs$/, ' (L)')
    .replace(/Kmpl$/, ' (kmpl)')
    .replace(/Kg$/, ' (kg)')
    .replace(/Ft$/, ' (ft)')
    .trim();
}

// ═══════════════════════════════════════════════════════════════════
// MASTER DETAIL / CREATE SLIDER CONTENT (schema-driven)
// ═══════════════════════════════════════════════════════════════════

function MasterFormContent({ entitySlug, schema, record, onSave }) {
  const isEdit = !!record;
  const { closeSlider } = useSliderStore();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!isEdit);
  const [dropdownOptions, setDropdownOptions] = useState({});

  useEffect(() => {
    if (record) {
      setForm({ ...record });
    } else {
      const defaults = {};
      (schema?.fields || []).forEach(f => {
        if (f.type === 'checkbox') defaults[f.key] = false;
      });
      setForm(defaults);
    }
  }, [record, schema]);

  // Load dropdown sources for master-dropdown fields
  useEffect(() => {
    if (!schema?.fields) return;
    schema.fields.filter(f => f.type === 'master-dropdown' || f.dropdownSource).forEach(f => {
      const source = f.dropdownSource || f.key;
      masterService.dropdown(source).then(res => {
        setDropdownOptions(prev => ({ ...prev, [f.key]: res.data || [] }));
      }).catch(() => {});
    });
  }, [schema]);

  const set = (key) => (e) => {
    const val = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await masterService.update(entitySlug, record.id, form);
      } else {
        await masterService.create(entitySlug, form);
      }
      onSave?.();
      closeSlider();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this record?')) return;
    try {
      await masterService.deactivate(entitySlug, record.id);
      onSave?.();
      closeSlider();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Cannot deactivate';
      alert(msg);
    }
  };

  const handleActivate = async () => {
    try {
      await masterService.activate(entitySlug, record.id);
      onSave?.();
      closeSlider();
    } catch (err) {
      alert('Failed to activate');
    }
  };

  const fields = schema?.fields || [];

  return (
    <div>
      {/* Action bar */}
      <div className="sl-action-bar" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
        {isEdit ? (
          <>
            <button
              className={`sl-action-btn sl-edit-toggle-btn ${isEditing ? 'active' : ''}`}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
            >
              <i className={`fas ${isEditing ? 'fa-check' : 'fa-pen'}`}></i>
              {isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
            </button>
            <div style={{ flex: 1 }}></div>
            {record?.active === false ? (
              <button className="sl-action-btn" onClick={handleActivate} style={{ color: '#059669' }}>
                <i className="fas fa-check-circle"></i> Reactivate
              </button>
            ) : (
              <button className="sl-delete-btn" onClick={handleDeactivate}>
                <i className="fas fa-recycle"></i> Delete
              </button>
            )}
          </>
        ) : (
          <>
            <button className="sl-action-btn sl-edit-toggle-btn active" onClick={handleSave} disabled={saving}>
              <i className="fas fa-check"></i> {saving ? 'Creating...' : 'Create'}
            </button>
          </>
        )}
      </div>

      {/* Status badge for existing records */}
      {isEdit && (
        <div style={{ padding: '8px 20px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700,
            padding: '3px 10px', borderRadius: 12,
            background: record?.active !== false ? '#F0FDF4' : '#FEF2F2',
            color: record?.active !== false ? '#059669' : '#DC2626',
            border: `1px solid ${record?.active !== false ? '#A7F3D0' : '#FECACA'}`,
          }}>
            <i className={`fas ${record?.active !== false ? 'fa-check-circle' : 'fa-ban'}`} style={{ fontSize: 8 }}></i>
            {record?.active !== false ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      )}

      {/* Form fields */}
      <div style={{ padding: 20 }}>
        <div style={{
          background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', background: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
            borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isEdit ? 'Details' : 'New Record'}
            </span>
          </div>
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fields.map(f => {
              const isFullWidth = f.type === 'textarea';
              return (
                <div key={f.key} style={{ gridColumn: isFullWidth ? '1 / -1' : undefined }}>
                  {isEditing ? (
                    <FormField
                      label={f.label}
                      value={form[f.key] ?? ''}
                      onChange={set(f.key)}
                      type={f.type}
                      options={f.options}
                      dropdownOptions={dropdownOptions[f.key]}
                      required={f.required}
                    />
                  ) : (
                    <Field label={f.label} value={form[f.key]} fieldKey={f.key} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sort order & description (common for all) */}
        {isEditing && !fields.find(f => f.key === 'sortOrder') && (
          <div style={{ marginTop: 12 }}>
            <FormField label="Sort Order" value={form.sortOrder ?? 0} onChange={set('sortOrder')} type="number" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Read-only field ─────────────────────────────────────────────
function Field({ label, value, fieldKey }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#1E293B', padding: '8px 10px',
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, minHeight: 34,
        display: 'flex', alignItems: 'center',
      }}>
        {formatValue(value, fieldKey)}
      </div>
    </div>
  );
}

// ─── Editable form field ─────────────────────────────────────────
function FormField({ label, value, onChange, type = 'text', options, dropdownOptions, required }) {
  const inputStyle = {
    width: '100%', padding: '8px 10px', fontSize: 13, fontWeight: 500, color: '#1E293B',
    border: '1.5px solid #CBD5E1', borderRadius: 8, outline: 'none', background: '#fff',
    transition: 'border-color .15s',
  };

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </div>
      {type === 'select' && options ? (
        <select style={inputStyle} value={value || ''} onChange={onChange}>
          <option value="">Select...</option>
          {options.map(o => (
            <option key={o} value={o}>
              {o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\B[A-Z]/g, l => l.toLowerCase())}
            </option>
          ))}
        </select>
      ) : type === 'master-dropdown' && dropdownOptions ? (
        <select style={inputStyle} value={value || ''} onChange={onChange}>
          <option value="">Select...</option>
          {dropdownOptions.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 0' }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={onChange}
            style={{ width: 16, height: 16, accentColor: '#6366F1' }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{value ? 'Yes' : 'No'}</span>
        </label>
      ) : type === 'textarea' ? (
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
          value={value || ''}
          onChange={onChange}
          onFocus={e => e.target.style.borderColor = '#6366F1'}
          onBlur={e => e.target.style.borderColor = '#CBD5E1'}
        />
      ) : type === 'date' ? (
        <input
          type="date"
          style={inputStyle}
          value={value || ''}
          onChange={onChange}
          onFocus={e => e.target.style.borderColor = '#6366F1'}
          onBlur={e => e.target.style.borderColor = '#CBD5E1'}
        />
      ) : (
        <input
          type={type === 'number' ? 'number' : 'text'}
          style={inputStyle}
          value={value ?? ''}
          onChange={onChange}
          step={type === 'number' ? 'any' : undefined}
          onFocus={e => e.target.style.borderColor = '#6366F1'}
          onBlur={e => e.target.style.borderColor = '#CBD5E1'}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function MastersPage() {
  const { entitySlug } = useParams();
  const navigate = useNavigate();
  const activeSlug = entitySlug || 'vehicle-types';
  const activeNav = ENTITY_NAV.find(e => e.slug === activeSlug) || ENTITY_NAV[0];

  const [data, setData] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const { openSlider } = useSliderStore();

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      masterService.getAll(activeSlug, '', showInactive ? undefined : true),
      masterService.getSchema(activeSlug),
    ]).then(([dataRes, schemaRes]) => {
      setData(dataRes.data || []);
      setSchema(schemaRes.data || null);
    }).catch(() => {
      setData([]);
      setSchema(null);
    }).finally(() => setLoading(false));
  }, [activeSlug, showInactive]);

  useEffect(() => {
    setSearch('');
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.code || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const listColumns = schema?.listColumns || ['name', 'code'];

  const openCreate = () => openSlider({
    title: `New ${activeNav.name.replace(/s$/, '')}`,
    subtitle: activeNav.name,
    width: '520px',
    content: <MasterFormContent entitySlug={activeSlug} schema={schema} onSave={loadData} />,
  });

  const openDetail = (record) => openSlider({
    title: record.name,
    subtitle: `${activeNav.name} • ${record.code || 'No code'}`,
    width: '520px',
    content: <MasterFormContent entitySlug={activeSlug} schema={schema} record={record} onSave={loadData} />,
  });

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter(r => r.active !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [data]);

  return (
    <div className="page-content" style={{ display: 'flex', gap: 0, padding: 0, height: '100%' }}>
      {/* ─── Left sidebar — entity navigation ─── */}
      <div style={{
        width: 220, minWidth: 220, background: '#FAFBFC', borderRight: '1.5px solid #E2E8F0',
        overflowY: 'auto', padding: '16px 0',
      }}>
        <div style={{ padding: '0 14px 12px', fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
          Master Entities
        </div>
        {ENTITY_NAV.map(ent => {
          const isActive = ent.slug === activeSlug;
          return (
            <div
              key={ent.slug}
              onClick={() => navigate(`/settings/masters/${ent.slug}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer',
                background: isActive ? `${ent.color}10` : 'transparent',
                borderRight: isActive ? `3px solid ${ent.color}` : '3px solid transparent',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? `${ent.color}18` : '#F1F5F9',
              }}>
                <i className={ent.icon} style={{ fontSize: 11, color: isActive ? ent.color : '#94A3B8' }}></i>
              </div>
              <span style={{
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                color: isActive ? ent.color : '#475569',
              }}>
                {ent.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Right content — data grid ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${activeNav.color}12`,
            }}>
              <i className={activeNav.icon} style={{ fontSize: 16, color: activeNav.color }}></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18 }}>{activeNav.name}</h1>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                {ENTITY_NAV.find(e => e.slug === activeSlug)?.name || ''} configuration
              </div>
            </div>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="fas fa-plus"></i> Add {activeNav.name.replace(/s$/, '')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total', value: stats.total, icon: 'fas fa-database', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0' },
            { label: 'Active', value: stats.active, icon: 'fas fa-check-circle', color: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
            { label: 'Inactive', value: stats.inactive, icon: 'fas fa-ban', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={s.icon} style={{ fontSize: 12, color: s.color }}></i>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="ax-filter-bar" style={{ marginBottom: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#64748B', cursor: 'pointer' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} style={{ accentColor: '#6366F1' }} />
            Show inactive
          </label>
          <div style={{ flex: 1 }}></div>
          <span className="ax-filter-count">{filtered.length} of {data.length}</span>
          <input
            className="ax-filter-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search..."
          />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginTop: 12 }}>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: `2fr ${listColumns.slice(1).map(() => '1fr').join(' ')} 50px`,
            padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
            fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            {listColumns.map(col => (
              <span key={col}>{fieldLabel(col)}</span>
            ))}
            <span></span>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: 20, marginBottom: 8 }}></i>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Loading...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {data.length === 0 ? `No ${activeNav.name.toLowerCase()} yet` : 'No records match your search'}
              </div>
              {data.length === 0 && (
                <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Click "Add" to create one</div>
              )}
            </div>
          ) : filtered.map(row => (
            <div
              key={row.id}
              onClick={() => openDetail(row)}
              style={{
                display: 'grid', gridTemplateColumns: `2fr ${listColumns.slice(1).map(() => '1fr').join(' ')} 50px`,
                padding: '13px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center',
                cursor: 'pointer', transition: 'all .1s',
                opacity: row.active === false ? 0.5 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              {listColumns.map((col, i) => (
                <div key={col} style={{
                  fontSize: i === 0 ? 13 : 12,
                  fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? '#1E293B' : '#475569',
                }}>
                  {formatValue(row[col], col)}
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
