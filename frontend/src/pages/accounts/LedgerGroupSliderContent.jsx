import { useState } from 'react';
import useSliderStore from '../../stores/sliderStore';
import useEnumStore, { NATURE_COLORS } from '../../stores/enumStore';
import ledgerGroupService from '../../services/ledgerGroupService';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { FormField } from '../../components/common/FormField';


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
    name: '', nature: '', groupType: '',
    tallyGroupName: '', parentGroupId: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.nature || !form.groupType) return;
    setSaving(true);
    try {
      await ledgerGroupService.create({
        name: form.name,
        nature: form.nature,
        groupType: form.groupType,
        tallyGroupName: form.tallyGroupName || null,
        parentGroupId: form.parentGroupId || null,
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
        <button onClick={handleSave} disabled={saving || !form.name || !form.nature || !form.groupType}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            border: '1.5px solid #059669', borderRadius: 8, padding: '8px 18px',
            fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5',
            cursor: (saving || !form.name || !form.nature || !form.groupType) ? 'not-allowed' : 'pointer',
            opacity: (saving || !form.name || !form.nature || !form.groupType) ? 0.5 : 1,
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
            <FormField label="Group Type" value={form.groupType} onChange={set('groupType')} required options={getOptionsWithPlaceholder('ledgerGroupType', 'Select group type')} />
          </div>
        </Section>

        <Section title="Hierarchy & Tally" emoji="🏗️" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <FormField label="Parent Group" value={form.parentGroupId} onChange={set('parentGroupId')} options={parentOptions} />
            <FormField label="Tally Group Name" value={form.tallyGroupName} onChange={set('tallyGroupName')} placeholder="e.g. Sundry Debtors" />
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({
    name: group.name || '',
    nature: group.nature || '',
    groupType: group.groupType || '',
    tallyGroupName: group.tallyGroupName || '',
    parentGroupId: group.parentGroupId || '',
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
        groupType: form.groupType,
        tallyGroupName: form.tallyGroupName || null,
        parentGroupId: form.parentGroupId || null,
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
        <button className="sl-delete-btn" onClick={() => setShowDeleteModal(true)}>
          <i className="fas fa-recycle"></i> Delete
        </button>
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
                <FormField label="Group Type" value={form.groupType} onChange={set('groupType')} required options={getOptionsWithPlaceholder('ledgerGroupType', 'Select group type')} />
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
                <ReadField label="Group Type" value={getLabel('ledgerGroupType', group.groupType)} />
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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await ledgerGroupService.delete(group.id);
          closeSlider();
          onSave?.();
        }}
        entityName={group.name}
        entityType="Ledger Group"
      />
    </div>
  );
}
