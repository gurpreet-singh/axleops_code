import { useEffect, useRef } from 'react';
import useToastStore from '../../stores/toastStore';

const TOAST_CONFIG = {
  error:   { icon: 'fas fa-exclamation-circle', bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', border: '#FECACA', accent: '#DC2626', titleColor: '#991B1B' },
  success: { icon: 'fas fa-check-circle',       bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '#BBF7D0', accent: '#16A34A', titleColor: '#166534' },
  warning: { icon: 'fas fa-exclamation-triangle',bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '#FDE68A', accent: '#D97706', titleColor: '#92400E' },
  info:    { icon: 'fas fa-info-circle',         bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '#BFDBFE', accent: '#2563EB', titleColor: '#1E40AF' },
};

function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.error;
  const ref = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (ref.current) ref.current.style.transform = 'translateX(0)';
    });
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px', borderRadius: 12,
        background: cfg.bg, border: `1.5px solid ${cfg.border}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        minWidth: 320, maxWidth: 420,
        transform: 'translateX(120%)', transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'pointer', position: 'relative',
      }}
      onClick={() => onRemove(toast.id)}
    >
      {/* Accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: cfg.accent, borderRadius: '12px 0 0 12px',
      }} />

      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: cfg.accent + '18',
      }}>
        <i className={cfg.icon} style={{ fontSize: 14, color: cfg.accent }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: 12, fontWeight: 800, color: cfg.titleColor, marginBottom: 2, letterSpacing: 0.2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, fontWeight: 500 }}>
          {toast.message}
        </div>
      </div>

      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(toast.id); }}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          color: '#94A3B8', fontSize: 12, padding: 2, flexShrink: 0,
          lineHeight: 1,
        }}
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
