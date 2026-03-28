import { useState, useEffect, useMemo } from 'react';
import ledgerAccountService from '../../services/ledgerAccountService';
import useEnumStore, { getAccountTypeColor, isPartyAccountType } from '../../stores/enumStore';
import ledgerGroupService from '../../services/ledgerGroupService';
import useSliderStore from '../../stores/sliderStore';
import { LedgerAccountCreateContent, LedgerAccountDetailContent } from './LedgerAccountSliderContent';

const INR = n => n ? '₹' + Number(n).toLocaleString('en-IN') : '—';

export default function LedgerAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [natureFilter, setNatureFilter] = useState('all');
  const { openSlider } = useSliderStore();
  const { getOptions, getLabel } = useEnumStore();

  const refresh = () => {
    setLoading(true);
    Promise.all([
      ledgerAccountService.getAll(),
      ledgerGroupService.getAllGroups().then(r => r.data || []).catch(() => []),
    ]).then(([accts, grps]) => {
      setAccounts(accts);
      setGroups(grps);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return accounts.filter(a =>
      (typeFilter === 'all' || a.accountType === typeFilter) &&
      (natureFilter === 'all' || a.groupNature === natureFilter) &&
      (!search ||
        a.accountHead?.toLowerCase().includes(search.toLowerCase()) ||
        a.legalName?.toLowerCase().includes(search.toLowerCase()) ||
        a.gstin?.toLowerCase().includes(search.toLowerCase()) ||
        a.accountGroup?.toLowerCase().includes(search.toLowerCase()) ||
        a.city?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [accounts, search, typeFilter, natureFilter]);

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter(a => a.active).length,
    party: accounts.filter(a => isPartyAccountType(a.accountType)).length,
    bank: accounts.filter(a => a.accountType === 'BANK_ACCOUNT').length,
    totalBalance: accounts.reduce((s, a) => s + (a.currentBalance || 0), 0),
  }), [accounts]);

  const openNewAccount = () => openSlider({
    title: 'Add Ledger Account',
    subtitle: 'Create a new ledger account',
    content: <LedgerAccountCreateContent onSave={refresh} groups={groups} />,
    width: '52vw',
  });

  const openDetail = (acct) => openSlider({
    title: acct.accountHead,
    subtitle: `${acct.accountGroup || 'General'} • ${getLabel('ledgerAccountType', acct.accountType)}`,
    content: <LedgerAccountDetailContent account={acct} onSave={refresh} groups={groups} />,
    width: '52vw',
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Ledger Accounts</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary" onClick={openNewAccount}><i className="fas fa-plus"></i> Add Account</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total', value: stats.total, icon: 'fas fa-book', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0' },
          { label: 'Active', value: stats.active, icon: 'fas fa-check-circle', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Party', value: stats.party, icon: 'fas fa-building', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
          { label: 'Bank', value: stats.bank, icon: 'fas fa-university', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
          { label: 'Net Balance', value: INR(stats.totalBalance), icon: 'fas fa-rupee-sign', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={s.icon} style={{ fontSize: 12, color: s.color }}></i>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="ax-filter-bar">
        <select className="ax-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Account Types</option>
          {getOptions('ledgerAccountType').map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="ax-filter-select" value={natureFilter} onChange={e => setNatureFilter(e.target.value)}>
          <option value="all">All Natures</option>
          {getOptions('groupNature').map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div style={{ flex: 1 }}></div>
        <span className="ax-filter-count">{filtered.length} of {accounts.length} accounts</span>
        <input className="ax-filter-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search accounts..." />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 0.8fr 100px 80px 60px', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          <span>Account Head</span><span>Group</span><span>Account Type</span><span>GSTIN</span><span style={{ textAlign: 'right' }}>Balance</span><span>Status</span><span></span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: 20, marginBottom: 8 }}></i>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Loading accounts...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📒</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{accounts.length === 0 ? 'No ledger accounts yet' : 'No accounts match your filter'}</div>
            {accounts.length === 0 && <div style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Click "Add Account" to create one</div>}
          </div>
        ) : filtered.map(a => {
          const tc = getAccountTypeColor(a.accountType);
          const balColor = (a.currentBalance || 0) >= 0 ? '#16A34A' : '#DC2626';
          return (
            <div key={a.id} onClick={() => openDetail(a)}
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 0.8fr 100px 80px 60px', padding: '14px 18px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', cursor: 'pointer', transition: 'all .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{a.accountHead}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>
                  {a.legalName && a.legalName !== a.accountHead ? a.legalName : ''}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{a.accountGroup || '—'}</div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                  {getLabel('ledgerAccountType', a.accountType)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{a.gstin || '—'}</div>
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: balColor, fontFamily: "'JetBrains Mono', monospace" }}>{INR(a.currentBalance)}</div>
              <div>
                {a.active ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }}></span>Active
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F8FAFC', color: '#94A3B8', border: '1px solid #E2E8F0', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>Inactive</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textAlign: 'right' }}>Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
