import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * CustomSelect — Premium searchable dropdown.
 * Replaces native <select> everywhere in the app.
 *
 * Props:
 *   options   — [{ value, label }]
 *   value     — current value
 *   onChange  — (value) => void
 *   placeholder — shown when nothing is selected
 *   searchable  — force enable/disable search (auto: ≥6 options)
 *   disabled    — greys out the control
 *   searchPlaceholder — placeholder for the search input
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  searchable,
  disabled = false,
  searchPlaceholder = 'Type to search…',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, direction: 'down' });

  // Auto-enable search for lists >=6 items
  const isSearchable = searchable !== undefined ? searchable : options.length >= 6;

  // Find the selected option
  const selected = useMemo(
    () => options.find(o => (o.value ?? o) === value),
    [options, value],
  );

  // Filtered options
  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(o => {
      const label = (o.label ?? o ?? '').toString().toLowerCase();
      return label.includes(q);
    });
  }, [options, query]);

  // Compute position relative to viewport (for portal)
  const computePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const panelHeight = Math.min(filtered.length * 38 + (isSearchable ? 46 : 8), 320);
    const direction = spaceBelow < panelHeight && spaceAbove > spaceBelow ? 'up' : 'down';

    setPos({
      top: direction === 'down' ? rect.bottom + 4 : rect.top - panelHeight - 4,
      left: rect.left,
      width: rect.width,
      direction,
    });
  }, [filtered.length, isSearchable]);

  // Open handler
  const handleOpen = () => {
    if (disabled) return;
    computePos();
    setOpen(true);
    setQuery('');
    setHighlightIdx(-1);
  };

  // Close handler
  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightIdx(-1);
  }, []);

  // Select an option
  const handleSelect = (opt) => {
    onChange?.(opt.value ?? opt);
    handleClose();
  };

  // Keyboard nav
  const handleKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(i => (i + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(i => (i - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < filtered.length) {
          handleSelect(filtered[highlightIdx]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      default:
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightIdx];
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  // Focus search on open
  useEffect(() => {
    if (open && isSearchable) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [open, isSearchable]);

  // Recompute position on scroll / resize
  useEffect(() => {
    if (!open) return;
    const recompute = () => computePos();
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [open, computePos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target)
      ) return;
      handleClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, handleClose]);

  // Selected label (skip placeholders with empty value)
  const displayLabel = selected && (selected.value ?? selected) !== '' ? (selected.label ?? selected) : null;

  return (
    <div className="ax-csel" ref={triggerRef} onKeyDown={handleKeyDown} tabIndex={disabled ? -1 : 0}>
      {/* ── Trigger ── */}
      <div
        className={`ax-csel-trigger${open ? ' ax-csel-trigger--open' : ''}${disabled ? ' ax-csel-trigger--disabled' : ''}`}
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        <span className={`ax-csel-value${!displayLabel ? ' ax-csel-placeholder' : ''}`}>
          {displayLabel || placeholder}
        </span>
        <svg className={`ax-csel-chevron${open ? ' ax-csel-chevron--open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── Dropdown Panel (portal) ── */}
      {open && createPortal(
        <div
          ref={panelRef}
          className={`ax-csel-panel ax-csel-panel--${pos.direction}`}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 99999,
          }}
        >
          {/* Search */}
          {isSearchable && (
            <div className="ax-csel-search-wrap">
              <i className="fas fa-search ax-csel-search-icon"></i>
              <input
                ref={searchRef}
                className="ax-csel-search"
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setHighlightIdx(0); }}
                placeholder={searchPlaceholder}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button className="ax-csel-search-clear" onClick={() => { setQuery(''); searchRef.current?.focus(); }}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          )}

          {/* Options list */}
          <div className="ax-csel-list" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="ax-csel-empty">
                <i className="fas fa-search" style={{ opacity: 0.3, marginRight: 6 }}></i>
                No results for "{query}"
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const optValue = opt.value ?? opt;
                const optLabel = opt.label ?? opt;
                const isSelected = optValue === value;
                const isHighlighted = idx === highlightIdx;
                // Skip rendering the placeholder option (empty string value)
                if (optValue === '') return null;

                return (
                  <div
                    key={optValue}
                    className={`ax-csel-option${isSelected ? ' ax-csel-option--selected' : ''}${isHighlighted ? ' ax-csel-option--highlight' : ''}`}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightIdx(idx)}
                  >
                    <span className="ax-csel-option-label">{highlightMatch(optLabel, query)}</span>
                    {isSelected && (
                      <svg className="ax-csel-check" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {isSearchable && filtered.length > 0 && (
            <div className="ax-csel-footer">
              {query ? `${filtered.length} of ${options.length - 1} results` : `${options.length - 1} items`}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

/** Highlight matching substring in label */
function highlightMatch(text, query) {
  if (!query) return text;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return str;
  return (
    <>
      {str.slice(0, idx)}
      <mark className="ax-csel-mark">{str.slice(idx, idx + query.length)}</mark>
      {str.slice(idx + query.length)}
    </>
  );
}
