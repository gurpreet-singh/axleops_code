import { useState } from 'react';
import useSliderStore from '../../stores/sliderStore';
import useEnumStore, { NATURE_COLORS } from '../../stores/enumStore';
import ledgerGroupService from '../../services/ledgerGroupService';

// ═══════════════════════════════════════════════════════════════
// Reusable Form Components (same pattern as RouteSliderContent)
// ═══════════════════════════════════════════════════════════════

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

function Section({ title, emoji, borderColor, headerBg, accentColor, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '12px 16px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</span>
      </div>
      <div style={{ padding: '16px 16px 18px' }}>{children}</div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// CREATE SLIDER
// ═══════════════════════════════════════════════════════════════

export function LedgerGroupCreateContent({ onSave, groups }) {
  const { closeSlider } = useSliderStore();
  const { getOptionsWithPlaceholder } = useEnumStore();
  const [form, setForm] = useState({
    name: '', nature: '', defaultAccountType: '',
    tallyGroupName: '', parentGroupId: '', systemGroup: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.nature) return;
    setSaving(true);
    try {
      await ledgerGroupService.create({
        name: form.name,
        nature: form.nature,
        defaultAccountType: form.defaultAccountType || null,
        tallyGroupName: form.tallyGroupName || null,
        parentGroupId: form.parentGroupId || null,
        systemGroup: form.systemGroup,
      });
      onSave?.();
      closeSlider();
    } catch (err) {
      console.error('Failed to create ledger group:', err);
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = [
    { value: '', label: 'None (Top Level)' },
    ...groups.map(g => ({ value: g.id, label: g.name }))
  ];

  return (
    <div>
      {/* Sticky Action Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <button onClick={handleSave} disabled={saving || !form.name || !form.nature}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
            fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
            cursor: (saving || !form.name || !form.nature) ? 'not-allowed' : 'pointer',
            opacity: (saving || !form.name || !form.nature) ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!saving) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#059669'; }}
        >
          <i className={`fas fa-${saving ? 'spinner fa-spin' : 'plus'}`} style={{ fontSize: 10 }}></i>
          {saving ? 'Creating...' : 'Create Group'}
        </button>
        <button onClick={closeSlider} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 14px',
          fontSize: 12, fontWeight: 600, color: '#64748B', background: '#fff', cursor: 'pointer',
        }}>Cancel</button>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <Section title="Group Identity" emoji="📊" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Group Name" value={form.name} onChange={set('name')} required placeholder="e.g. SUNDRY DEBTORS" full />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Nature" value={form.nature} onChange={set('nature')} required options={getOptionsWithPlaceholder('groupNature', 'Select nature')} />
            <FormField label="Default Account Type" value={form.defaultAccountType} onChange={set('defaultAccountType')} options={getOptionsWithPlaceholder('ledgerGroupAccountType', 'Select type')} />
          </div>
        </Section>

        <Section title="Hierarchy & Tally" emoji="🏗️" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Parent Group" value={form.parentGroupId} onChange={set('parentGroupId')} options={parentOptions} />
            <FormField label="Tally Group Name" value={form.tallyGroupName} onChange={set('tallyGroupName')} placeholder="e.g. Sundry Debtors" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: 8 }}>
            <input type="checkbox" checked={form.systemGroup} onChange={e => set('systemGroup')(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E' }}>System Group</div>
              <div style={{ fontSize: 10, color: '#A16207' }}>System groups are protected from deletion</div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// DETAIL SLIDER
// ═══════════════════════════════════════════════════════════════

export function LedgerGroupDetailContent({ group, onSave, groups }) {
  const { closeSlider } = useSliderStore();
  const { getOptionsWithPlaceholder, getLabel } = useEnumStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: group.name || '',
    nature: group.nature || '',
    defaultAccountType: group.defaultAccountType || '',
    tallyGroupName: group.tallyGroupName || '',
    parentGroupId: group.parentGroupId || '',
    systemGroup: group.systemGroup || false,
  });
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const nc = NATURE_COLORS[group.nature] || { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
  const parentName = groups.find(g => g.id === group.parentGroupId)?.name;

  const parentOptions = [
    { value: '', label: 'None (Top Level)' },
    ...groups.filter(g => g.id !== group.id).map(g => ({ value: g.id, label: g.name }))
  ];

  const handleSave = async () => {
    try {
      await ledgerGroupService.update(group.id, {
        name: form.name,
        nature: form.nature,
        defaultAccountType: form.defaultAccountType || null,
        tallyGroupName: form.tallyGroupName || null,
        parentGroupId: form.parentGroupId || null,
        systemGroup: form.systemGroup,
      });
      setIsEditing(false);
      onSave?.();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

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
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: nc.bg, color: nc.color, border: `1px solid ${nc.border}`,
          fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
        }}>
          {group.nature}
        </span>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {isEditing ? (
          <>
            <Section title="Group Identity" emoji="📊" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <FormField label="Group Name" value={form.name} onChange={set('name')} required full />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Nature" value={form.nature} onChange={set('nature')} required options={getOptionsWithPlaceholder('groupNature', 'Select nature')} />
                <FormField label="Default Account Type" value={form.defaultAccountType} onChange={set('defaultAccountType')} options={getOptionsWithPlaceholder('ledgerGroupAccountType', 'Select type')} />
              </div>
            </Section>
            <Section title="Hierarchy & Tally" emoji="🏗️" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Parent Group" value={form.parentGroupId} onChange={set('parentGroupId')} options={parentOptions} />
                <FormField label="Tally Group Name" value={form.tallyGroupName} onChange={set('tallyGroupName')} />
              </div>
            </Section>
          </>
        ) : (
          <>
            <Section title="Group Identity" emoji="📊" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ReadField label="Group Name" value={group.name} />
                <ReadField label="Nature" value={group.nature} />
                <ReadField label="Default Account Type" value={getLabel('ledgerGroupAccountType', group.defaultAccountType)} />
                <ReadField label="System Group" value={group.systemGroup ? '✅ Yes — Protected' : 'No — Custom'} />
              </div>
            </Section>
            <Section title="Hierarchy & Tally" emoji="🏗️" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <ReadField label="Parent Group" value={parentName || 'None (Top Level)'} />
                <ReadField label="Tally Group Name" value={group.tallyGroupName} mono />
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
