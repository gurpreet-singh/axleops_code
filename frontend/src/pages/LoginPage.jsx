import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('gurpreet_owner');
  const [password, setPassword] = useState('gurpreet_owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brandRow}>
          <div style={styles.brandIcon}>
            <i className="fas fa-truck-moving" />
          </div>
          <div>
            <h1 style={styles.brandName}>AxleOps</h1>
            <span style={styles.brandSub}>FLEET MANAGEMENT PLATFORM</span>
          </div>
        </div>

        <h2 style={styles.heading}>Sign in to your account</h2>
        <p style={styles.subheading}>Enter your credentials to access the platform</p>

        {error && (
          <div style={styles.errorBox}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <i className="fas fa-user" style={styles.inputIcon} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={styles.input}
                autoFocus
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <i className="fas fa-lock" style={styles.inputIcon} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading || !username || !password}
            style={{
              ...styles.submitBtn,
              opacity: loading || !username || !password ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{ marginRight: 8 }} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={styles.tenantInfo}>
          <i className="fas fa-building" style={{ marginRight: 6, color: '#64748b' }} />
          <span style={{ color: '#64748b', fontSize: 12 }}>Preet Transport</span>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>© 2026 AxleOps Fleet Management Platform</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    top: -150,
    right: -100,
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
    bottom: -100,
    left: -100,
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: 20,
    padding: '40px 36px 32px',
    width: 400,
    maxWidth: '90vw',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    position: 'relative',
    zIndex: 1,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    justifyContent: 'center',
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.1rem',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  brandName: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#F1F5F9',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: '0.65rem',
    color: '#64748B',
    fontWeight: 600,
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: '1.15rem',
    fontWeight: 600,
    color: '#E2E8F0',
    textAlign: 'center',
    margin: '0 0 6px',
  },
  subheading: {
    fontSize: '0.82rem',
    color: '#94A3B8',
    textAlign: 'center',
    margin: '0 0 24px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#FCA5A5',
    fontSize: 13,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#64748B',
    fontSize: 14,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: 10,
    border: '1px solid rgba(148,163,184,0.15)',
    background: 'rgba(15,23,42,0.5)',
    color: '#F1F5F9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: 6,
    padding: '13px 20px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid rgba(148,163,184,0.08)',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    color: '#475569',
    fontSize: 11,
    zIndex: 1,
  },
};
