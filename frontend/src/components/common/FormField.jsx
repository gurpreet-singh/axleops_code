import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// SHARED FORM COMPONENTS
// Single source of truth for all form fields and section wrappers.
// Every slider and create form uses these components.
// ═══════════════════════════════════════════════════════════════

/**
 * FormField — Renders a labelled input, select, or textarea.
 * Uses CSS classes from overrides.css for zero inline-style drift.
 */
export function FormField({ label, value, onChange, type = 'text', placeholder, required, options, disabled, info, full, textarea, rows, icon, children }) {
  return (
    <div className={full ? 'ax-field ax-field--full' : 'ax-field'}>
      <label className="ax-field-label">
        {icon && <i className={icon} style={{ fontSize: 10, color: '#94A3B8' }}></i>}
        {label}
        {required && <span className="ax-field-required">*</span>}
      </label>
      {children ? children : textarea ? (
        <textarea
          className="ax-input ax-textarea"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 3}
        />
      ) : options ? (
        <select
          className="ax-select"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
        >
          {options.map((o, i) => <option key={i} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input
          className="ax-input"
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {info && <div className="ax-field-info"><i className="fas fa-info-circle"></i>{info}</div>}
    </div>
  );
}

/**
 * Section — Collapsible card wrapper for grouping form fields.
 */
export function Section({ title, emoji, borderColor, headerBg, accentColor, children, collapsible, defaultCollapsed, headerAction }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed || false);

  return (
    <div className="ax-section" style={{ borderColor: borderColor || '#E2E8F0' }}>
      <div
        className={`ax-section-header${collapsible ? ' ax-section-header--collapsible' : ''}`}
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        style={{
          background: headerBg || '#F8FAFC',
          borderBottomColor: collapsed ? 'transparent' : (borderColor || '#E2E8F0'),
        }}
      >
        {emoji && <span className="ax-section-emoji">{emoji}</span>}
        <span className="ax-section-title" style={{ color: accentColor || '#1E293B' }}>{title}</span>
        {headerAction && (
          <span className="ax-section-header-action" onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
            {headerAction}
          </span>
        )}
        {collapsible && (
          <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'} ax-section-chevron`}></i>
        )}
      </div>
      {!collapsed && (
        <div className="ax-section-body">{children}</div>
      )}
    </div>
  );
}
