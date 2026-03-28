import { useState, useEffect, useMemo } from 'react';
import ledgerGroupService from '../../services/ledgerGroupService';
import useEnumStore, { NATURE_COLORS } from '../../stores/enumStore';
import useSliderStore from '../../stores/sliderStore';
import { LedgerGroupCreateContent, LedgerGroupDetailContent } from './LedgerGroupSliderContent';

export default function LedgerGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [natureFilter, setNatureFilter] = useState('all');
  const { openSlider } = useSliderStore();
  const { getOptions, getLabel } = useEnumStore();

  const refresh = () => {
    setLoading(true);
    ledgerGroupService.getAllGroups()
      .then(res => setGroups(res.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return groups.filter(g =>
      (natureFilter === 'all' || g.nature === natureFilter) &&
      (!search || g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.tallyGroupName || '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [groups, search, natureFilter]);

  const stats = useMemo(() => ({
    total: groups.length,
    asset: groups.filter(g => g.nature === 'ASSET').length,
    liability: groups.filter(g => g.nature === 'LIABILITY').length,
    income: groups.filter(g => g.nature === 'INCOME').length,
    expense: groups.filter(g => g.nature === 'EXPENSE').length,
  }), [groups]);

  const openNewGroup = () => openSlider({
    title: 'Add Ledger Group',
    subtitle: 'Define a new ledger group',
    content: <LedgerGroupCreateContent onSave={refresh} groups={groups} />,
    width: '520px',
  });

  const openDetail = (group) => openSlider({
    title: group.name,
    subtitle: `${group.nature}`,
    content: <LedgerGroupDetailContent group={group} onSave={refresh} groups={groups} />,
    width: '520px',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Ledger Groups</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary" onClick={openNewGroup}><i className="fas fa-plus"></i> Add Group</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Groups', value: stats.total, icon: 'fas fa-layer-group', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0' },
          { label: 'Asset', value: stats.asset, icon: 'fas fa-building', ...NATURE_COLORS.ASSET },
          { label: 'Liability', value: stats.liability, icon: 'fas fa-hand-holding-usd', ...NATURE_COLORS.LIABILITY },
          { label: 'Income', value: stats.income, icon: 'fas fa-arrow-circle-down', ...NATURE_COLORS.INCOME },
          { label: 'Expense', value: stats.expense, icon: 'fas fa-arrow-circle-up', ...NATURE_COLORS.EXPENSE },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={s.icon} style={{ fontSize: 14, color: s.color }}></i>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select value={natureFilter} onChange={e => setNatureFilter(e.target.value)} style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="all">All Natures</option>
          {getOptions('groupNature').map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{filtered.length} of {groups.length} groups</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search groups..." style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#1E293B', outline: 'none', width: 240, fontFamily: 'inherit' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 60px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Group Name</span><span>Nature</span><span>Default Sub Type</span><span>Tally Name</span><span></span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: 20, marginBottom: 8 }}></i>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Loading groups...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{groups.length === 0 ? 'No ledger groups yet' : 'No groups match your filter'}</div>
            {groups.length === 0 && <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Click "Add Group" to create one</div>}
          </div>
        ) : filtered.map(g => {
          const nc = NATURE_COLORS[g.nature] || { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' };
          return (
            <div key={g.id} onClick={() => openDetail(g)}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 60px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{g.name}</div>
                {g.parentGroupId && <div style={{ fontSize: 11, color: '#94A3B8' }}>Parent: {groups.find(p => p.id === g.parentGroupId)?.name || '—'}</div>}
              </div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: nc.bg, color: nc.color, border: `1px solid ${nc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                  {g.nature}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{getLabel('accountSubType', g.defaultAccountSubType)}</div>
              <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{g.tallyGroupName || '—'}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
