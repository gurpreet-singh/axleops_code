export default function PlaceholderPage({ title, icon }) {
  return (
    <div className="page-content">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a1a2e' }}>
          <i className={icon} style={{ marginRight: 8, opacity: 0.6 }}></i>
          {title}
        </h2>
      </div>

      <div className="placeholder-card">
        <i className={icon} style={{ display: 'block' }}></i>
        <h3>{title}</h3>
        <p style={{ maxWidth: 400, margin: '0 auto' }}>
          This module is under development. The existing HTML demo pages will be
          converted into React components with full backend API integration.
        </p>
      </div>
    </div>
  );
}
