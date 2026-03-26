import { useState, useEffect, useMemo } from 'react';
import { getClients } from '../../services/clientService';
import { useNavigate } from 'react-router-dom';
import useSliderStore from '../../stores/sliderStore';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { openSlider } = useSliderStore();

  useEffect(() => { getClients().then(setClients); }, []);

  const filtered = useMemo(() => {
    let c = clients;
    if (statusFilter !== 'all') c = c.filter(x => x.status === statusFilter);
    if (search) { const q = search.toLowerCase(); c = c.filter(x => x.name.toLowerCase().includes(q) || x.industry.toLowerCase().includes(q)); }
    return c;
  }, [clients, statusFilter, search]);

  const totals = useMemo(() => ({
    count: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    revenueMtd: clients.reduce((s, c) => s + c.revenueMtd, 0),
    outstanding: clients.reduce((s, c) => s + c.outstanding, 0),
    avgUtil: clients.length ? (clients.reduce((s, c) => s + c.creditUtil, 0) / clients.length).toFixed(1) : 0,
  }), [clients]);

  const INR = n => '₹' + Number(n).toLocaleString('en-IN');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 11, color: '#98a2b3', marginBottom: 2 }}>Accounts & Users › Client List</div>
          <h1>Clients & billing</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-file-export"></i> Export</button>
          <button className="btn btn-primary" onClick={() => navigate('/clients/new')}><i className="fas fa-plus"></i> Add Client</button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Clients', value: totals.count, sub: `${totals.active} active, ${totals.count - totals.active} inactive`, color: '#101828' },
          { label: 'Revenue MTD', value: INR(totals.revenueMtd), sub: 'Across all clients', color: '#1570ef' },
          { label: 'Outstanding', value: INR(totals.outstanding), sub: `${clients.filter(c => c.outstanding > 0).length} clients with balance`, color: '#f04438' },
          { label: 'Avg Credit Util.', value: `${totals.avgUtil}%`, sub: '✓ Healthy across portfolio', color: '#12b76a' },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, minWidth: 140, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, color: '#98a2b3', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: k.color === '#12b76a' ? '#12b76a' : '#98a2b3', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{ color: 'var(--text-muted)' }}></i>
            <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-btn">
            <select style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#344054', fontWeight: 600, cursor: 'pointer', outline: 'none' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Status ▾</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="pagination-info">1 – {filtered.length} of {clients.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Client Name</th><th>Industry</th><th>Contract Type</th><th>Rate</th><th>Total Trips</th>
              <th style={{ textAlign: 'right' }}>Revenue (MTD)</th><th style={{ textAlign: 'right' }}>Outstanding</th><th>Credit Util.</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openSlider({ title: c.name, content: <ClientDetail c={c} />, width: '50vw' })}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${c.hue},50%,92%)`, color: `hsl(${c.hue},50%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1570ef' }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: '#98a2b3' }}>{c.id}</div>
                    </div>
                  </div>
                </td>
                <td>{c.industry}</td>
                <td><span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#f4f3ff', color: '#5925dc', textTransform: 'uppercase', letterSpacing: '.04em' }}>{c.contractType}</span></td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{c.rate}</td>
                <td style={{ fontWeight: 700 }}>{c.totalTrips}</td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{INR(c.revenueMtd)}</td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: c.outstanding > 0 ? '#f04438' : '#12b76a' }}>{INR(c.outstanding)}</td>
                <td>
                  {c.creditUtil > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 5, background: '#f2f4f7', borderRadius: 3, overflow: 'hidden', flex: 1, minWidth: 50 }}>
                        <div style={{ height: '100%', width: `${c.creditUtil}%`, background: c.creditUtil > 25 ? '#f79009' : '#12b76a', borderRadius: 3, transition: 'width .5s' }}></div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: c.creditUtil > 25 ? '#f79009' : '#667085', whiteSpace: 'nowrap' }}>{c.creditUtil}%</span>
                    </div>
                  ) : <span style={{ fontSize: 11, color: '#12b76a', fontWeight: 600 }}>Clear</span>}
                </td>
                <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientDetail({ c }) {
  const INR = n => '₹' + Number(n).toLocaleString('en-IN');
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `hsl(${c.hue},50%,92%)`, color: `hsl(${c.hue},50%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{c.initials}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B' }}>{c.name}</div>
          <div style={{ fontSize: 12, color: '#64748B' }}>{c.id} · {c.industry}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[['Contract Type', c.contractType], ['Rate', c.rate], ['Total Trips', c.totalTrips], ['Revenue MTD', INR(c.revenueMtd)], ['Outstanding', INR(c.outstanding)], ['Credit Limit', INR(c.creditLimit)], ['Credit Utilization', `${c.creditUtil}%`], ['Status', c.status]].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{l}</div>
            <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
