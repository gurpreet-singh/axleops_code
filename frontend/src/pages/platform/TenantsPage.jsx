import { useState, useEffect, useCallback } from 'react';
import platformAdminService from '../../services/platformAdminService';
import useSliderStore from '../../stores/sliderStore';
import TenantDetailContent from './TenantDetailContent';
import TenantCreateContent from './TenantCreateContent';

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { openSlider } = useSliderStore();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformAdminService.getAllTenants();
      setTenants(res.data || []);
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filtered = tenants.filter((t) =>
    [t.name, t.tradeName, t.city, t.state, t.gstin]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRowClick = (tenant) => {
    openSlider({
      title: tenant.name,
      subtitle: `${tenant.city || ''} ${tenant.state || ''} • ${(tenant.status || 'active').toUpperCase()}`.trim(),
      width: '580px',
      content: <TenantDetailContent tenant={tenant} onRefresh={fetchTenants} />,
    });
  };

  const handleAddTenant = () => {
    openSlider({
      title: 'Add New Tenant',
      subtitle: 'Register a new tenant',
      width: '580px',
      content: <TenantCreateContent onSuccess={fetchTenants} />,
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return '#34a853';
      case 'INACTIVE': return '#ea4335';
      case 'SUSPENDED': return '#fbbc04';
      default: return '#94a3b8';
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1>
          <i className="fas fa-building" style={{ color: '#7C3AED' }}></i>
          Tenant Management
          <span className="learn-badge">
            <i className="fas fa-info-circle"></i> {tenants.length} total
          </span>
        </h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" id="btn-add-tenant" onClick={handleAddTenant}>
            <i className="fas fa-plus"></i> Add Tenant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Tenants</div>
          <div className="stat-value text-blue">{tenants.length}</div>
          <div className="stat-change positive">
            <i className="fas fa-building"></i> All registered tenants
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value text-green">
            {tenants.filter((t) => t.status === 'ACTIVE').length}
          </div>
          <div className="stat-change positive">
            <i className="fas fa-check-circle"></i> Currently operational
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" style={{ color: '#7C3AED' }}>
            {tenants.reduce((sum, t) => sum + (t.userCount || 0), 0)}
          </div>
          <div className="stat-change">
            <i className="fas fa-users"></i> Across all tenants
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Branches</div>
          <div className="stat-value" style={{ color: '#0891B2' }}>
            {tenants.reduce((sum, t) => sum + (t.branchCount || 0), 0)}
          </div>
          <div className="stat-change">
            <i className="fas fa-code-branch"></i> Across all tenants
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input">
            <i className="fas fa-search" style={{ color: '#94a3b8' }}></i>
            <input
              id="tenant-search"
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="pagination-info">
            Showing {filtered.length} of {tenants.length} tenants
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <p>Loading tenants...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-building" style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}></i>
            <p>No tenants found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>City</th>
                  <th>State</th>
                  <th>GSTIN</th>
                  <th>Branches</th>
                  <th>Users</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr
                    key={tenant.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(tenant)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {(tenant.tradeName || tenant.name || '??')
                            .split(' ')
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{tenant.name}</div>
                          {tenant.tradeName && tenant.tradeName !== tenant.name && (
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{tenant.tradeName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{tenant.city || '—'}</td>
                    <td>{tenant.state || '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
                        {tenant.gstin || '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#f0fdfa',
                          color: '#0d9488',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {tenant.branchCount || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#f5f3ff',
                          color: '#7c3aed',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {tenant.userCount || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: getStatusColor(tenant.status) + '18',
                          color: getStatusColor(tenant.status),
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {tenant.status?.toLowerCase() || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
