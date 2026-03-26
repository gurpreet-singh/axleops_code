import useAuthStore from '../stores/authStore';

// Mock KPI data per role
const ROLE_KPI_DATA = {
  owner: [
    { label: 'Revenue (MTD)', value: '₹18.4L', change: '+12.3%', positive: true },
    { label: 'Net Profit', value: '₹4.2L', change: '+8.7%', positive: true },
    { label: 'Fleet Utilization', value: '84%', change: '+3.2%', positive: true },
    { label: 'Active Trips', value: '47', change: '−2', positive: false },
    { label: 'Pending Invoices', value: '23', change: '+5', positive: false },
    { label: 'Total Clients', value: '68', change: '+4', positive: true },
    { label: 'Drivers Active', value: '89', change: '−1', positive: false },
    { label: 'Vehicles', value: '124', change: '0', positive: true },
  ],
  fleet_manager: [
    { label: 'Vehicle Utilization', value: '84%', change: '+3.2%', positive: true },
    { label: 'On-Time Delivery', value: '91%', change: '+1.5%', positive: true },
    { label: 'Active Trips', value: '47', change: '+5', positive: true },
    { label: 'Idle Vehicles', value: '12', change: '−3', positive: true },
  ],
  finance_controller: [
    { label: 'Revenue (MTD)', value: '₹18.4L', change: '+12.3%', positive: true },
    { label: 'Outstanding AR', value: '₹7.8L', change: '+₹1.2L', positive: false },
    { label: 'Profit Margin', value: '22.8%', change: '+1.1%', positive: true },
    { label: 'Cash Flow', value: '₹5.2L', change: '+₹0.8L', positive: true },
  ],
};

export default function Dashboard() {
  const { currentRole } = useAuthStore();

  if (!currentRole) return null;

  const kpis = ROLE_KPI_DATA[currentRole.id] || ROLE_KPI_DATA.owner;

  return (
    <div>
      {/* Page Header */}
      <div style={{
        padding: '20px 24px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            Welcome back, {currentRole.user.name.split(' ')[0]}
          </h2>
          <p style={{ color: '#8e99a9', fontSize: '0.82rem', marginTop: 4 }}>
            {currentRole.label} Dashboard — Here's your overview for today
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #e1e5eb', background: '#fff',
            cursor: 'pointer', fontSize: '0.82rem', color: '#5a6474',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="fas fa-calendar-alt"></i> Today
          </button>
          <button style={{
            padding: '8px 16px', borderRadius: 8,
            border: 'none', background: '#1a73e8',
            cursor: 'pointer', fontSize: '0.82rem', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="dashboard-grid">
        {kpis.map((kpi, idx) => (
          <div className="stat-card" key={idx}>
            <span className="stat-label">{kpi.label}</span>
            <span className="stat-value">{kpi.value}</span>
            <span className={`stat-change ${kpi.positive ? 'positive' : 'negative'}`}>
              {kpi.change} vs last month
            </span>
          </div>
        ))}
      </div>

      {/* Activity Section */}
      <div style={{ padding: '0 24px 24px' }}>
        <div className="placeholder-card">
          <i className="fas fa-chart-area" style={{ display: 'block' }}></i>
          <h3>Revenue & Expenses Chart</h3>
          <p>Interactive charts will be rendered here using a charting library.</p>
        </div>
      </div>
    </div>
  );
}
