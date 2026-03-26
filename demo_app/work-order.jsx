import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data & Constants ────────────────────────────────────────────────
const VEHICLES = [
  { id: "v1", name: "AP101", type: "Pickup Truck", status: "Active", group: "Atlanta", image: "🚛" },
  { id: "v2", name: "AB103", type: "Bobcat", status: "Out of Service", group: "Atlanta", image: "🚜" },
  { id: "v3", name: "AB104", type: "Bobcat", status: "Active", group: "Atlanta", image: "🚜" },
  { id: "v4", name: "AB105CON", type: "Bobcat", status: "Out of Service", group: "Atlanta", image: "🚜" },
  { id: "v5", name: "AB106CON", type: "Bobcat", status: "Active", group: "Nashville", image: "🚜" },
  { id: "v6", name: "SR 5", type: "Skid Steer", status: "Active", group: "Columbia", image: "🏗️" },
];

const TECHNICIANS = [
  { id: "t1", name: "Jacob Silva", role: "Technician", location: "Birmingham", avatar: "JS" },
  { id: "t2", name: "Sara Ciskie", role: "Account Owner", location: "Atlanta", avatar: "SC" },
  { id: "t3", name: "Caimen", role: "Technician", location: "Nashville", avatar: "CA" },
  { id: "t4", name: "Ben Babin", role: "Employee", location: "Florida", avatar: "BB" },
  { id: "t5", name: "Bri P", role: "Operator", location: "Columbia", avatar: "BP" },
  { id: "t6", name: "Allison Curtis", role: "Technician", location: "Atlanta", avatar: "AC" },
  { id: "t7", name: "Stephen Moore", role: "Technician", location: "Birmingham", avatar: "SM" },
  { id: "t8", name: "Gloria Chavez", role: "Operator", location: "Nashville", avatar: "GC" },
];

const SERVICE_TASKS_LIBRARY = [
  { id: "st1", name: "Tire Replacement", category: { system: "1 - Chassis Group", assembly: "017 - Tires, Tubes, Liners", component: "001 - Tire - Pneumatic" } },
  { id: "st2", name: "Brake Inspection", category: { system: "1 - Chassis Group", assembly: "013 - Brakes", component: "" } },
  { id: "st3", name: "Engine Oil & Filter Replacement", category: { system: "4 - Engine / Motor System", assembly: "045 - Power Plant", component: "011 - Filter Assembly - Oil" } },
  { id: "st4", name: "Tire Rotation", category: { system: "1 - Chassis Group", assembly: "017 - Tires, Tubes, Liners", component: "" } },
  { id: "st5", name: "Brake Line Inspect", category: { system: "1 - Chassis Group", assembly: "013 - Brakes", component: "" } },
  { id: "st6", name: "Brake Linings Inspect", category: { system: "1 - Chassis Group", assembly: "013 - Brakes", component: "" } },
  { id: "st7", name: "A/C Inspection", category: { system: "1 - Chassis Group", assembly: "001 - Air Conditioning", component: "" } },
];

const PARTS_CATALOG = [
  { id: "p1", name: "Michelin LTX A/T2", description: "All-terrain truck tire", unitCost: 211.98, image: "🛞", locations: [{ name: "Alabama", qty: 200 }, { name: "Atlanta", qty: 196 }, { name: "Birmingham", qty: 229 }, { name: "Columbia", qty: 200 }, { name: "Florida", qty: 200 }] },
  { id: "p2", name: "STP Oil Filter", description: "Extended Life Oil Filter", unitCost: 9.99, image: "🔧", locations: [{ name: "Alabama", qty: 150 }, { name: "Birmingham", qty: 120 }] },
  { id: "p3", name: "Valvoline Premium Blue Motor Oil", description: "10W30 Diesel Engine Oil for Skid Steers", unitCost: 18.99, image: "🛢️", locations: [{ name: "Alabama", qty: 80 }, { name: "Nashville", qty: 60 }] },
  { id: "p4", name: "Bosch Brake Pad Set", description: "Premium ceramic brake pads", unitCost: 45.99, image: "🔩", locations: [{ name: "Atlanta", qty: 50 }, { name: "Columbia", qty: 35 }] },
  { id: "p5", name: "WIX Air Filter", description: "Heavy duty air filter", unitCost: 24.50, image: "💨", locations: [{ name: "Birmingham", qty: 90 }, { name: "Florida", qty: 75 }] },
];

const SERVICE_REMINDERS = [
  { id: "sr1", task: "Brake Inspection", mileInterval: 7500, dueSoonMiles: 500, timeInterval: "12 months", dueSoonTime: "2 weeks", nextDue: "1 year from now", milesRemaining: 41 },
  { id: "sr2", task: "Engine Oil & Filter Replacement", mileInterval: 10000, dueSoonMiles: 1000, timeInterval: "12 months", dueSoonTime: "1 month", nextDue: "11 months from now", milesRemaining: 991 },
  { id: "sr3", task: "Tire Rotation", mileInterval: 10000, dueSoonMiles: 1000, timeInterval: "12 months", dueSoonTime: "1 month", nextDue: "1 year from now", milesRemaining: 10000 },
  { id: "sr4", task: "Brake Line Inspect", mileInterval: 10000, dueSoonMiles: 1000, timeInterval: "12 months", dueSoonTime: "1 month", nextDue: "1 year from now", milesRemaining: 10000 },
  { id: "sr5", task: "Brake Linings Inspect", mileInterval: 10000, dueSoonMiles: 1000, timeInterval: "12 months", dueSoonTime: "1 month", nextDue: "1 year from now", milesRemaining: 10000 },
];

const ISSUES = [
  { id: "i1", number: "#20", summary: "Flat tire", status: "Open", assignedTo: "Stephen Moore", labels: [], linkedItems: [] },
  { id: "i2", number: "#18", summary: "Check engine light on", status: "Open", assignedTo: "Jacob Silva", labels: [], linkedItems: [] },
  { id: "i3", number: "#15", summary: "Windshield crack", status: "Open", assignedTo: "Caimen", labels: [], linkedItems: [] },
];

const REPAIR_PRIORITY_CLASSES = [
  { value: "scheduled", label: "Scheduled", color: "#3b82f6" },
  { value: "non-scheduled", label: "Non-Scheduled", color: "#f59e0b" },
  { value: "emergency", label: "Emergency", color: "#ef4444" },
];

const REASON_FOR_REPAIR = [
  "Preventive Maintenance",
  "Corrective Repair",
  "Inspection",
  "Accident Repair",
  "Warranty Repair",
  "Recall",
  "Other",
];

const LABELS = ["Tires", "Engine", "Brakes", "Electrical", "Body", "HVAC", "Transmission", "Urgent"];

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "#22c55e" },
  { value: "pending", label: "Pending", color: "#f59e0b" },
  { value: "completed", label: "Completed", color: "#22c55e" },
  { value: "pending-warranty", label: "Pending - Warranty", color: "#ec4899" },
];

// ─── Utility Helpers ─────────────────────────────────────────────────
const formatCurrency = (n) => `$${(n || 0).toFixed(2)}`;
const genId = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split("T")[0];
const clsx = (...args) => args.filter(Boolean).join(" ");

// ─── Reusable UI Components ─────────────────────────────────────────

function Badge({ children, color = "#64748b", size = "sm" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: size === "sm" ? "2px 8px" : "4px 12px",
      borderRadius: 12, fontSize: size === "sm" ? 11 : 12, fontWeight: 600,
      background: color + "18", color, border: `1px solid ${color}30`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {children}
    </span>
  );
}

function IconBtn({ children, onClick, active, title, size = 32 }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
      border: "1px solid var(--border)", borderRadius: 6, background: active ? "var(--accent)" : "var(--surface)",
      color: active ? "#fff" : "var(--text-secondary)", cursor: "pointer", fontSize: 14, transition: "all .15s",
    }}>
      {children}
    </button>
  );
}

function Avatar({ initials, size = 28, color }) {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6"];
  const bg = color || colors[initials.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Dropdown({ value, onChange, options, placeholder, width, renderOption }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = options.find((o) => (typeof o === "string" ? o : o.value) === value);
  const label = selected ? (typeof selected === "string" ? selected : selected.label) : placeholder;
  return (
    <div ref={ref} style={{ position: "relative", width: width || "100%" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6,
        background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between",
        cursor: "pointer", fontSize: 13, color: value ? "var(--text)" : "var(--text-tertiary)",
        transition: "border-color .15s",
        borderColor: open ? "var(--accent)" : "var(--border)",
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: 10, marginLeft: 8, opacity: .5 }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100,
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)", maxHeight: 220, overflowY: "auto",
        }}>
          {options.map((opt, i) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lbl = typeof opt === "string" ? opt : opt.label;
            return (
              <div key={i} onClick={() => { onChange(val); setOpen(false); }}
                style={{
                  padding: "8px 12px", cursor: "pointer", fontSize: 13,
                  background: val === value ? "var(--accent-light)" : "transparent",
                  color: "var(--text)", transition: "background .1s",
                }}
                onMouseEnter={(e) => e.target.style.background = "var(--hover)"}
                onMouseLeave={(e) => e.target.style.background = val === value ? "var(--accent-light)" : "transparent"}
              >
                {renderOption ? renderOption(opt) : lbl}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--text-tertiary)" }}>⌕</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 12px 8px 32px", border: "1px solid var(--border)",
          borderRadius: 6, fontSize: 13, background: "var(--surface)", color: "var(--text)",
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
      />
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border-light)" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          background: "none", border: "none",
          color: active === t.id ? "var(--accent)" : "var(--text-secondary)",
          borderBottom: active === t.id ? "2px solid var(--accent)" : "2px solid transparent",
          marginBottom: -2, transition: "all .15s",
        }}>
          {t.label}{t.count != null && <span style={{ marginLeft: 6, fontSize: 11, opacity: .7, background: active === t.id ? "var(--accent-light)" : "var(--hover)", padding: "1px 6px", borderRadius: 8 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,.4)", backdropFilter: "blur(2px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 12, width, maxWidth: "92vw", maxHeight: "85vh",
        display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.2)",
        animation: "modalIn .2s ease-out",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border-light)" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10,
      padding: "12px 20px", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600,
      background: type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6",
      boxShadow: "0 8px 24px rgba(0,0,0,.2)", animation: "slideUp .3s ease-out",
    }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      {message}
    </div>
  );
}

// ─── Add Part Modal ──────────────────────────────────────────────────
function AddPartModal({ open, onClose, onSave, serviceTaskName }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [partSearch, setPartSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  const reset = () => { setSelectedPart(null); setPartSearch(""); setQuantity(1); setLocation(""); setNote(""); };
  const filteredParts = PARTS_CATALOG.filter((p) => p.name.toLowerCase().includes(partSearch.toLowerCase()));
  const subtotal = selectedPart ? quantity * selectedPart.unitCost : 0;
  const selectedLocation = selectedPart?.locations.find((l) => l.name === location);

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add Part">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Part Search */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
            Part <span style={{ color: "#ef4444" }}>*</span>
          </label>
          {selectedPart ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)" }}>
              <span style={{ fontSize: 18 }}>{selectedPart.image}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{selectedPart.name}</span>
              <button onClick={() => { setSelectedPart(null); setLocation(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 14 }}>✕</button>
            </div>
          ) : (
            <div>
              <SearchInput value={partSearch} onChange={setPartSearch} placeholder="Search Parts..." />
              {partSearch && (
                <div style={{ border: "1px solid var(--border)", borderRadius: 6, marginTop: 4, maxHeight: 160, overflow: "auto", background: "var(--surface)" }}>
                  {filteredParts.map((p) => (
                    <div key={p.id} onClick={() => { setSelectedPart(p); setPartSearch(""); }}
                      style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <span>{p.image}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{p.description}</div>
                      </div>
                    </div>
                  ))}
                  {filteredParts.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "var(--text-tertiary)", textAlign: "center" }}>No parts found</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Part Location */}
        {selectedPart && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Part Location</label>
            <Dropdown
              value={location}
              onChange={setLocation}
              placeholder="Please Select"
              options={[
                { value: "__none", label: "None (No Inventory Adjustment)" },
                ...selectedPart.locations.map((l) => ({ value: l.name, label: `${l.name} (${l.qty})` }))
              ]}
            />
            {location && location !== "__none" && (
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>This will make an inventory adjustment</div>
            )}
          </div>
        )}

        {/* Quantity & Unit Cost */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Quantity</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Unit Cost</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "8px 8px", background: "var(--bg)", color: "var(--text-tertiary)", fontSize: 13, borderRight: "1px solid var(--border)" }}>$</span>
              <input type="number" step="0.01" value={selectedPart?.unitCost || 0}
                style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, background: "var(--surface)", color: "var(--text)", outline: "none" }}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Service Task */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Service Task</label>
          <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, color: "var(--text)", background: "var(--bg)" }}>
            {serviceTaskName || "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Recommended for precise maintenance cost reporting.</div>
        </div>

        {/* Note */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add notes or details (optional)"
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, background: "var(--surface)", color: "var(--text)", minHeight: 70, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Subtotal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Subtotal</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{quantity}.0 x {formatCurrency(selectedPart?.unitCost || 0)}/ea</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{formatCurrency(subtotal)}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <button onClick={() => { reset(); onClose(); }} style={{ padding: "8px 16px", border: "none", background: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => {
            if (!selectedPart) return;
            onSave({
              id: genId(), partId: selectedPart.id, name: selectedPart.name, description: selectedPart.description,
              image: selectedPart.image, quantity, unitCost: selectedPart.unitCost,
              location: location === "__none" ? "None" : location || "None",
              locationQty: selectedLocation?.qty, amount: subtotal, note,
            });
            reset(); onClose();
          }} style={{
            padding: "8px 20px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 13,
            background: selectedPart ? "var(--accent)" : "var(--border)", color: selectedPart ? "#fff" : "var(--text-tertiary)",
            opacity: selectedPart ? 1 : .6,
          }}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Add Labor Modal ─────────────────────────────────────────────────
function AddLaborModal({ open, onClose, onSave, serviceTaskName, assignedTo }) {
  const [technician, setTechnician] = useState(assignedTo || "");
  const [hours, setHours] = useState(1);
  const [rate, setRate] = useState(0);
  const [setTimeEntry, setSetTimeEntry] = useState(false);
  const [note, setNote] = useState("");
  const subtotal = hours * rate;

  const reset = () => { setTechnician(assignedTo || ""); setHours(1); setRate(0); setNote(""); setSetTimeEntry(false); };

  const quickTimes = [
    { label: "15m", val: 0.25 }, { label: "30m", val: 0.5 }, { label: "45m", val: 0.75 },
    { label: "1h", val: 1 }, { label: "2h", val: 2 }, { label: "3h", val: 3 }, { label: "4h", val: 4 },
  ];

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Add Labor">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Technician */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>
            Technician <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Dropdown value={technician} onChange={setTechnician} placeholder="Select technician"
            options={TECHNICIANS.map((t) => ({ value: t.id, label: t.name }))}
            renderOption={(opt) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar initials={TECHNICIANS.find((t) => t.id === opt.value)?.avatar || "?"} size={24} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                    {TECHNICIANS.find((t) => t.id === opt.value)?.role} · {TECHNICIANS.find((t) => t.id === opt.value)?.location}
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Hours & Rate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Labor Hours</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              <input type="number" min="0.25" step="0.25" value={hours} onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, background: "var(--surface)", color: "var(--text)", outline: "none" }}
              />
              <span style={{ padding: "8px 8px", background: "var(--bg)", color: "var(--text-tertiary)", fontSize: 12, borderLeft: "1px solid var(--border)" }}>hr</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {quickTimes.map((qt) => (
                <button key={qt.label} onClick={() => setHours(qt.val)} style={{
                  padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border)",
                  background: hours === qt.val ? "var(--accent-light)" : "var(--surface)",
                  color: hours === qt.val ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 11, cursor: "pointer", fontWeight: 500,
                }}>
                  {qt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Hourly Rate</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "8px 8px", background: "var(--bg)", color: "var(--text-tertiary)", fontSize: 13, borderRight: "1px solid var(--border)" }}>$</span>
              <input type="number" step="0.01" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                style={{ flex: 1, padding: "8px 12px", border: "none", fontSize: 13, background: "var(--surface)", color: "var(--text)", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Set Labor Time Entry */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={setTimeEntry} onChange={(e) => setSetTimeEntry(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--accent)" }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Set Labor Time Entry</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Set a specific date and time when this labor was performed to create a Time Entry</div>
          </div>
        </label>

        {/* Service Task */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Service Task</label>
          <div style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, color: "var(--text)", background: "var(--bg)" }}>
            {serviceTaskName || "—"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Recommended for precise maintenance cost reporting.</div>
        </div>

        {/* Note */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add notes or details (optional)"
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, background: "var(--surface)", color: "var(--text)", minHeight: 60, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Subtotal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Subtotal</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{hours.toFixed(2)} hrs × {formatCurrency(rate)} /hr</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(subtotal)}</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <button onClick={() => { reset(); onClose(); }} style={{ padding: "8px 16px", border: "none", background: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={() => {
            onSave({ id: genId(), technicianId: technician, technicianName: TECHNICIANS.find(t => t.id === technician)?.name || "", hours, rate, amount: subtotal, note, serviceTask: serviceTaskName });
            reset(); onClose();
          }} style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "var(--accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Service Reminders Modal ─────────────────────────────────────────
function ServiceRemindersModal({ open, onClose, onAdd }) {
  return (
    <Modal open={open} onClose={onClose} title="Service Reminders" width={620}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {SERVICE_REMINDERS.map((sr) => (
          <div key={sr.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--border-light)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{sr.task}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Every {sr.mileInterval.toLocaleString()} miles <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Due soon threshold: {sr.dueSoonMiles.toLocaleString()} miles</span><br />
                Every {sr.timeInterval} <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Due soon threshold: {sr.dueSoonTime}</span><br />
                <span style={{ color: "var(--text-tertiary)" }}>{sr.nextDue}</span><br />
                <span style={{ color: sr.milesRemaining < 100 ? "#ef4444" : "#f59e0b", fontWeight: 500 }}>{sr.milesRemaining.toLocaleString()} miles remaining</span>
              </div>
            </div>
            <button onClick={() => onAdd(sr)} style={{
              padding: "6px 14px", border: "1px solid var(--border)", borderRadius: 6,
              background: "var(--surface)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              color: "var(--text)", display: "flex", alignItems: "center", gap: 4,
            }}>
              + Add
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Service Task Line Item ──────────────────────────────────────────
function ServiceTaskItem({ task, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true);
  const [showAddPart, setShowAddPart] = useState(false);
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [reasonForRepair, setReasonForRepair] = useState(task.reasonForRepair || "");
  const [notes, setNotes] = useState(task.notes || "");

  const laborTotal = (task.labor || []).reduce((s, l) => s + l.amount, 0);
  const partsTotal = (task.parts || []).reduce((s, p) => s + p.amount, 0);
  const subtotal = laborTotal + partsTotal;

  return (
    <div style={{ border: "1px solid var(--border-light)", borderRadius: 8, marginBottom: 8, background: "var(--surface)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 8, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 12, transition: "transform .2s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{task.name}</span>
        {task.linkedParts > 0 && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>🔗 {task.linkedParts}</span>}
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          <span style={{ color: "var(--text-secondary)" }}>{formatCurrency(laborTotal)}</span>
          <span style={{ color: "var(--text-secondary)" }}>{formatCurrency(partsTotal)}</span>
          <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 16 }}>⋯</button>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--border-light)" }}>
          {/* Last Completed / Next Due */}
          {task.lastCompleted && (
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-tertiary)", padding: "8px 0", flexWrap: "wrap" }}>
              <span>📅 Last Completed: {task.lastCompleted}</span>
              {task.nextDue && <span>⏰ Next Due: {task.nextDue} · <span style={{ color: "#f59e0b" }}>{task.milesRemaining} miles remaining</span></span>}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => setShowAddLabor(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", fontSize: 12, cursor: "pointer", color: "var(--text)", fontWeight: 500 }}>
              👤 Add Labor
            </button>
            <button onClick={() => setShowAddPart(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", fontSize: 12, cursor: "pointer", color: "var(--text)", fontWeight: 500 }}>
              🔧 Add Part
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", fontSize: 12, cursor: "pointer", color: "var(--text)", fontWeight: 500 }}>
              🔗 Link Issues
            </button>
          </div>

          {/* Notes */}
          <textarea value={notes} onChange={(e) => { setNotes(e.target.value); onUpdate({ ...task, notes: e.target.value }); }}
            placeholder="Add notes or additional details"
            style={{ width: "100%", marginTop: 10, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--bg)", color: "var(--text)", minHeight: 48, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />

          {/* Maintenance Categorization */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: ".5px", marginBottom: 8 }}>MAINTENANCE CATEGORIZATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Reason for Repair</label>
                <Dropdown value={reasonForRepair} onChange={(v) => { setReasonForRepair(v); onUpdate({ ...task, reasonForRepair: v }); }}
                  placeholder="Select Reason for Repair" options={REASON_FOR_REPAIR}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2, display: "block" }}>Category / System / Assembly</label>
                <div style={{ fontSize: 12, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)", color: "var(--text-secondary)" }}>
                  {task.category ? `${task.category.system} › ${task.category.assembly}${task.category.component ? ` › ${task.category.component}` : ""}` : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Parts List */}
          {task.parts?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: ".5px", marginBottom: 6 }}>PARTS ({task.parts.length})</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px 80px 80px 28px", gap: 4, fontSize: 11, color: "var(--text-tertiary)", padding: "0 0 4px", borderBottom: "1px solid var(--border-light)" }}>
                <span></span><span>PART LOCATION</span><span>QTY</span><span>UNIT COST</span><span>AMOUNT</span><span></span>
              </div>
              {task.parts.map((part) => (
                <div key={part.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 60px 80px 80px 28px", gap: 4, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{part.image}</span>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--accent)" }}>{part.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{part.description}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{part.location}{part.locationQty ? ` (${part.locationQty})` : ""}</span>
                  <span>{part.quantity.toFixed(2)}</span>
                  <span>{formatCurrency(part.unitCost)}</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(part.amount)}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 12 }}>✎</button>
                </div>
              ))}
            </div>
          )}

          {/* Labor List */}
          {task.labor?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: ".5px", marginBottom: 6 }}>LABOR ({task.labor.length})</div>
              {task.labor.map((l) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar initials={TECHNICIANS.find(t => t.id === l.technicianId)?.avatar || "?"} size={24} />
                    <span style={{ fontWeight: 500 }}>{l.technicianName}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.hours}h × {formatCurrency(l.rate)}/hr</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(l.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddPartModal open={showAddPart} onClose={() => setShowAddPart(false)} serviceTaskName={task.name}
        onSave={(part) => onUpdate({ ...task, parts: [...(task.parts || []), part] })}
      />
      <AddLaborModal open={showAddLabor} onClose={() => setShowAddLabor(false)} serviceTaskName={task.name}
        onSave={(labor) => onUpdate({ ...task, labor: [...(task.labor || []), labor] })}
      />
    </div>
  );
}

// ─── Work Order Form (New / Edit) ────────────────────────────────────
function WorkOrderForm({ workOrder, onSave, onCancel }) {
  const [form, setForm] = useState({
    id: workOrder?.id || genId(),
    number: workOrder?.number || Math.floor(300 + Math.random() * 100),
    vehicle: workOrder?.vehicle || "",
    status: workOrder?.status || "open",
    repairPriority: workOrder?.repairPriority || "",
    issueDate: workOrder?.issueDate || today(),
    issueTime: workOrder?.issueTime || "7:00am",
    issuedBy: workOrder?.issuedBy || "t2",
    startDate: workOrder?.startDate || "",
    startTime: workOrder?.startTime || "",
    startOdometer: workOrder?.startOdometer || "",
    completionDate: workOrder?.completionDate || "",
    completionTime: workOrder?.completionTime || "",
    useStartOdometer: workOrder?.useStartOdometer ?? true,
    assignedTo: workOrder?.assignedTo || "",
    labels: workOrder?.labels || [],
    vendor: workOrder?.vendor || "",
    invoiceNumber: workOrder?.invoiceNumber || "",
    poNumber: workOrder?.poNumber || "",
    glCode: workOrder?.glCode || "",
    issues: workOrder?.issues || [],
    serviceTasks: workOrder?.serviceTasks || [],
    description: workOrder?.description || "",
    discount: workOrder?.discount || 0,
    discountType: workOrder?.discountType || "%",
    tax: workOrder?.tax || 0,
    taxType: workOrder?.taxType || "%",
    warrantyCreditValue: workOrder?.warrantyCreditValue || 0,
    warrantyCreditType: workOrder?.warrantyCreditType || "$",
  });

  const [activeLineTab, setActiveLineTab] = useState("tasks");
  const [taskSearch, setTaskSearch] = useState("");
  const [showReminders, setShowReminders] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addServiceTask = (taskDef) => {
    const newTask = {
      id: genId(),
      serviceTaskId: taskDef.id || taskDef.task,
      name: taskDef.name || taskDef.task,
      category: taskDef.category || SERVICE_TASKS_LIBRARY.find(st => st.name === taskDef.task)?.category || null,
      parts: [],
      labor: [],
      notes: "",
      reasonForRepair: "",
      lastCompleted: taskDef.lastCompleted || null,
      nextDue: taskDef.nextDue || null,
      milesRemaining: taskDef.milesRemaining || null,
      linkedParts: 0,
    };
    update("serviceTasks", [...form.serviceTasks, newTask]);
  };

  const updateServiceTask = (idx, updated) => {
    const tasks = [...form.serviceTasks];
    tasks[idx] = updated;
    update("serviceTasks", tasks);
  };

  const removeServiceTask = (idx) => {
    update("serviceTasks", form.serviceTasks.filter((_, i) => i !== idx));
  };

  const totalLabor = form.serviceTasks.reduce((s, t) => s + (t.labor || []).reduce((ss, l) => ss + l.amount, 0), 0);
  const totalParts = form.serviceTasks.reduce((s, t) => s + (t.parts || []).reduce((ss, p) => ss + p.amount, 0), 0);
  const subtotal = totalLabor + totalParts;
  const discountAmt = form.discountType === "%" ? subtotal * (form.discount / 100) : form.discount;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = form.taxType === "%" ? afterDiscount * (form.tax / 100) : form.tax;
  const warrantyAmt = form.warrantyCreditType === "$" ? form.warrantyCreditValue : afterDiscount * (form.warrantyCreditValue / 100);
  const total = afterDiscount + taxAmt - warrantyAmt;

  const filteredLibTasks = SERVICE_TASKS_LIBRARY.filter(st =>
    st.name.toLowerCase().includes(taskSearch.toLowerCase()) &&
    !form.serviceTasks.some(t => t.serviceTaskId === st.id)
  );

  const serviceTaskCount = form.serviceTasks.length;
  const laborCount = form.serviceTasks.reduce((s, t) => s + (t.labor?.length || 0), 0);
  const partsCount = form.serviceTasks.reduce((s, t) => s + (t.parts?.length || 0), 0);

  return (
    <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      {/* Top Bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: "1px solid var(--border-light)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>← Work Orders</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            {workOrder ? `Work Order #${form.number}` : "New Work Order"}
          </h2>
          <span style={{ padding: "2px 10px", borderRadius: 6, fontSize: 12, background: "var(--bg)", color: "var(--text-tertiary)", fontWeight: 500 }}>{form.number}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Cancel</button>
          <button style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Save and …</button>
          <button onClick={() => onSave(form)} style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "var(--accent)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Save Work Order</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* ─── Details Section ───── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Left Column */}
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Details</h3>

            {/* Vehicle */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Vehicle</label>
              <Dropdown value={form.vehicle} onChange={(v) => update("vehicle", v)} placeholder="Select Vehicle"
                options={VEHICLES.map(v => ({ value: v.id, label: v.name }))}
                renderOption={(opt) => {
                  const veh = VEHICLES.find(v => v.id === opt.value);
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{veh?.image}</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{veh?.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{veh?.type} · {veh?.group}</div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Status */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Status *</label>
              <Dropdown value={form.status} onChange={(v) => update("status", v)} placeholder="Select Status"
                options={STATUS_OPTIONS}
                renderOption={(opt) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_OPTIONS.find(s => s.value === opt.value)?.color }} />
                    {opt.label}
                  </div>
                )}
              />
            </div>

            {/* Repair Priority Class */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Repair Priority Class</label>
              <Dropdown value={form.repairPriority} onChange={(v) => update("repairPriority", v)} placeholder="Select Priority"
                options={REPAIR_PRIORITY_CLASSES}
                renderOption={(opt) => (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: REPAIR_PRIORITY_CLASSES.find(r => r.value === opt.value)?.color }} />
                    {opt.label}
                  </div>
                )}
              />
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 3 }}>VMRS Code Key 16 – classifies scheduled, non-scheduled, or emergency work.</div>
            </div>

            {/* Issue Date / Issued By */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Issue Date *</label>
                <input type="date" value={form.issueDate} onChange={(e) => update("issueDate", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Time</label>
                <input value={form.issueTime} onChange={(e) => update("issueTime", e.target.value)} placeholder="7:00am"
                  style={{ width: "100%", padding: "8px 6px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Issued By</label>
                <Dropdown value={form.issuedBy} onChange={(v) => update("issuedBy", v)} placeholder="Select"
                  options={TECHNICIANS.map(t => ({ value: t.id, label: t.name }))}
                />
              </div>
            </div>

            {/* Start Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Time</label>
                <input value={form.startTime} onChange={(e) => update("startTime", e.target.value)} placeholder="8:01am"
                  style={{ width: "100%", padding: "8px 6px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Start Odometer */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Start Odometer</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input value={form.startOdometer} onChange={(e) => update("startOdometer", e.target.value)} placeholder=""
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>mi</span>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input type="checkbox" /> Void
                </label>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 3 }}>Last updated: 95,284 mi (4 days ago)</div>
            </div>

            {/* Completion Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Completion Date</label>
                <input type="date" value={form.completionDate} onChange={(e) => update("completionDate", e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Time</label>
                <input value={form.completionTime} onChange={(e) => update("completionTime", e.target.value)} placeholder="11:37am"
                  style={{ width: "100%", padding: "8px 6px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Use start odometer checkbox */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={form.useStartOdometer} onChange={(e) => update("useStartOdometer", e.target.checked)}
                style={{ marginTop: 2, accentColor: "var(--accent)" }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Use start odometer for completion meter</div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Uncheck if meter usage has increased since work order start date</div>
              </div>
            </label>

            {/* Assigned To */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Assigned To</label>
              <Dropdown value={form.assignedTo} onChange={(v) => update("assignedTo", v)} placeholder="Please select"
                options={TECHNICIANS.map(t => ({ value: t.id, label: t.name }))}
                renderOption={(opt) => {
                  const tech = TECHNICIANS.find(t => t.id === opt.value);
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={tech?.avatar || "?"} size={22} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 12 }}>{tech?.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{tech?.role} · {tech?.location}</div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Labels */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Labels</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {LABELS.map((lbl) => (
                  <button key={lbl} onClick={() => update("labels", form.labels.includes(lbl) ? form.labels.filter(l => l !== lbl) : [...form.labels, lbl])}
                    style={{
                      padding: "4px 10px", borderRadius: 12, fontSize: 11, cursor: "pointer", fontWeight: 500,
                      border: form.labels.includes(lbl) ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: form.labels.includes(lbl) ? "var(--accent-light)" : "var(--surface)",
                      color: form.labels.includes(lbl) ? "var(--accent)" : "var(--text-secondary)",
                    }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor / Invoice / PO */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Vendor</label>
              <Dropdown value={form.vendor} onChange={(v) => update("vendor", v)} placeholder="Please select"
                options={["AutoZone", "O'Reilly Auto Parts", "NAPA", "Tire Rack", "Fleet Parts Inc"]}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Invoice Number</label>
                <input value={form.invoiceNumber} onChange={(e) => update("invoiceNumber", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>PO Number</label>
                <input value={form.poNumber} onChange={(e) => update("poNumber", e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Custom Fields */}
            <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border-light)" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>Custom Fields</h4>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>GL Code</label>
                <input value={form.glCode} onChange={(e) => update("glCode", e.target.value)} placeholder=""
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, background: "var(--surface)", color: "var(--text)", boxSizing: "border-box" }}
                />
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 3 }}>General ledger code for cost of work performed.</div>
              </div>
            </div>
          </div>

          {/* Right Column - Warranty */}
          <div>
            <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)", marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Warranty Coverage</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>Active</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#22c55e" }}>1</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>Expiring Soon</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>0</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4 }}>Total</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>1</div>
                </div>
              </div>
            </div>

            {/* Issues */}
            <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Issues</h3>
                <button style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add Issue</button>
              </div>
              <Tabs tabs={[
                { id: "open", label: "Open", count: ISSUES.filter(i => i.status === "Open").length },
                { id: "resolved", label: "Resolved", count: 0 },
                { id: "closed", label: "Closed", count: 0 },
              ]} active="open" onChange={() => {}} />
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", padding: "8px 0", marginBottom: 4 }}>
                Select any issues that were resolved as part of this service
              </div>
              {ISSUES.map((issue) => (
                <label key={issue.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                  borderBottom: "1px solid var(--border-light)", cursor: "pointer",
                }}>
                  <input type="checkbox" checked={form.issues.includes(issue.id)}
                    onChange={(e) => update("issues", e.target.checked ? [...form.issues, issue.id] : form.issues.filter(i => i !== issue.id))}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{issue.number}</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{issue.summary}</span>
                  <Badge color={issue.status === "Open" ? "#f59e0b" : "#22c55e"}>{issue.status}</Badge>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Avatar initials={TECHNICIANS.find(t => t.name === issue.assignedTo)?.avatar || "?"} size={20} />
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{issue.assignedTo}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Line Items ───── */}
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Line Items</h3>
            <button onClick={() => setShowReminders(true)} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              View Service Reminders ({SERVICE_REMINDERS.length})
            </button>
          </div>

          <Tabs tabs={[
            { id: "tasks", label: "Service Tasks", count: serviceTaskCount },
            { id: "labor", label: "Labor", count: laborCount },
            { id: "parts", label: "Parts", count: partsCount },
          ]} active={activeLineTab} onChange={setActiveLineTab} />

          <div style={{ marginTop: 12 }}>
            {activeLineTab === "tasks" && (
              <>
                <SearchInput value={taskSearch} onChange={setTaskSearch} placeholder="Search Service Tasks..." />
                {taskSearch && filteredLibTasks.length > 0 && (
                  <div style={{ border: "1px solid var(--border)", borderRadius: 6, marginTop: 4, maxHeight: 180, overflow: "auto", background: "var(--surface)" }}>
                    {filteredLibTasks.map((st) => (
                      <div key={st.id} onClick={() => { addServiceTask(st); setTaskSearch(""); }}
                        style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        {st.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Column Headers */}
                {form.serviceTasks.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "24px 24px 1fr 80px 80px 80px 28px", gap: 8, padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginTop: 8, borderBottom: "1px solid var(--border-light)" }}>
                    <span></span><span></span><span></span><span>Labor</span><span>Parts</span><span>Subtotal</span><span></span>
                  </div>
                )}

                <div style={{ marginTop: 4 }}>
                  {form.serviceTasks.map((task, idx) => (
                    <ServiceTaskItem key={task.id} task={task}
                      onUpdate={(updated) => updateServiceTask(idx, updated)}
                      onRemove={() => removeServiceTask(idx)}
                    />
                  ))}
                </div>

                {form.serviceTasks.length === 0 && !taskSearch && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-tertiary)" }}>
                    <div style={{ fontSize: 13 }}>No Service Task line items added</div>
                    <button onClick={() => setShowAddTask(true)} style={{ marginTop: 8, padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
                      Add Service Task
                    </button>
                  </div>
                )}
              </>
            )}

            {activeLineTab === "labor" && (
              <div style={{ padding: 16 }}>
                {form.serviceTasks.flatMap(t => (t.labor || []).map(l => ({ ...l, taskName: t.name }))).length > 0 ? (
                  form.serviceTasks.flatMap(t => (t.labor || []).map(l => ({ ...l, taskName: t.name }))).map((l) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar initials={TECHNICIANS.find(t => t.id === l.technicianId)?.avatar || "?"} size={28} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{l.technicianName}</div>
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{l.taskName}</div>
                        </div>
                      </div>
                      <span>{l.hours}h × {formatCurrency(l.rate)}/hr</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(l.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>No labor entries yet. Add labor from a service task.</div>
                )}
              </div>
            )}

            {activeLineTab === "parts" && (
              <div style={{ padding: 16 }}>
                {form.serviceTasks.flatMap(t => (t.parts || []).map(p => ({ ...p, taskName: t.name }))).length > 0 ? (
                  form.serviceTasks.flatMap(t => (t.parts || []).map(p => ({ ...p, taskName: t.name }))).map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{p.image}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: "var(--accent)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{p.taskName} · {p.location}</div>
                        </div>
                      </div>
                      <span>{p.quantity} × {formatCurrency(p.unitCost)}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(p.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>No parts added yet. Add parts from a service task.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Description & Cost Summary ───── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>Description</h3>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              placeholder="Add notes or additional details"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, background: "var(--bg)", color: "var(--text)", minHeight: 120, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Cost Summary</h3>
            {[
              { label: "Labor", value: totalLabor },
              { label: "Parts", value: totalParts },
              { label: "Subtotal", value: subtotal },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "var(--text-secondary)" }}>
                <span>{row.label}</span><span style={{ fontWeight: row.label === "Subtotal" ? 600 : 400 }}>{formatCurrency(row.value)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 8, paddingTop: 8 }}>
              {/* Warranty Credits */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Warranty Credits</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Dropdown value={form.warrantyCreditType} onChange={(v) => update("warrantyCreditType", v)}
                    options={[{ value: "$", label: "$" }, { value: "%", label: "%" }]} width={50}
                  />
                  <input type="number" value={form.warrantyCreditValue} onChange={(e) => update("warrantyCreditValue", parseFloat(e.target.value) || 0)}
                    style={{ width: 60, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, textAlign: "right", background: "var(--surface)", color: "var(--text)" }}
                  />
                  <span style={{ width: 70, textAlign: "right", fontSize: 13 }}>{formatCurrency(warrantyAmt)}</span>
                </div>
              </div>
              {/* Discount */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Discount</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Dropdown value={form.discountType} onChange={(v) => update("discountType", v)}
                    options={[{ value: "%", label: "%" }, { value: "$", label: "$" }]} width={50}
                  />
                  <input type="number" value={form.discount} onChange={(e) => update("discount", parseFloat(e.target.value) || 0)}
                    style={{ width: 60, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, textAlign: "right", background: "var(--surface)", color: "var(--text)" }}
                  />
                  <span style={{ width: 70, textAlign: "right", fontSize: 13 }}>{formatCurrency(discountAmt)}</span>
                </div>
              </div>
              {/* Tax */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Dropdown value={form.taxType} onChange={(v) => update("taxType", v)}
                    options={[{ value: "%", label: "%" }, { value: "$", label: "$" }]} width={50}
                  />
                  <input type="number" value={form.tax} onChange={(e) => update("tax", parseFloat(e.target.value) || 0)}
                    style={{ width: 60, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, textAlign: "right", background: "var(--surface)", color: "var(--text)" }}
                  />
                  <span style={{ width: 70, textAlign: "right", fontSize: 13 }}>{formatCurrency(taxAmt)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, borderTop: "2px solid var(--border)", fontSize: 16, fontWeight: 800 }}>
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* ─── Photos & Documents ───── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {["Photos", "Documents"].map((section) => (
            <div key={section} style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>{section}</h3>
              <div style={{
                border: "2px dashed var(--border)", borderRadius: 8, padding: "24px 16px",
                textAlign: "center", color: "var(--text-tertiary)", cursor: "pointer",
                transition: "border-color .2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
                <div style={{ fontSize: 12 }}>Drag and drop files to upload</div>
                <div style={{ fontSize: 11 }}>or click to pick files</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Comments ───── */}
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)", marginBottom: 40 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Comments</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <Avatar initials="SC" size={32} color="#3b82f6" />
            <textarea placeholder="Add an optional comment"
              style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 13, background: "var(--bg)", color: "var(--text)", minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
        </div>
      </div>

      <ServiceRemindersModal open={showReminders} onClose={() => setShowReminders(false)}
        onAdd={(sr) => { addServiceTask(sr); setShowReminders(false); }}
      />
    </div>
  );
}

// ─── Work Order Detail View ──────────────────────────────────────────
function WorkOrderDetail({ workOrder, onBack, onEdit }) {
  const vehicle = VEHICLES.find(v => v.id === workOrder.vehicle);
  const assignee = TECHNICIANS.find(t => t.id === workOrder.assignedTo);
  const issuer = TECHNICIANS.find(t => t.id === workOrder.issuedBy);
  const statusOpt = STATUS_OPTIONS.find(s => s.value === workOrder.status);
  const totalLabor = workOrder.serviceTasks.reduce((s, t) => s + (t.labor || []).reduce((ss, l) => ss + l.amount, 0), 0);
  const totalParts = workOrder.serviceTasks.reduce((s, t) => s + (t.parts || []).reduce((ss, p) => ss + p.amount, 0), 0);
  const total = totalLabor + totalParts;

  return (
    <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>← Work Orders</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Work Order #{workOrder.number}</h2>
          {workOrder.labels?.map(l => <Badge key={l} color="#3b82f6" size="sm">{l}</Badge>)}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color={statusOpt?.color || "#64748b"} size="sm">{statusOpt?.label || workOrder.status}</Badge>
          <button onClick={onEdit} style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "var(--accent)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✎ Edit</button>
          <button style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>▶ Start Work</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Details */}
          <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Details</h3>
            {[
              { label: "Vehicle", value: vehicle ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span>{vehicle.image}</span><span style={{ color: "var(--accent)", fontWeight: 500 }}>{vehicle.name}</span></span> : "—" },
              { label: "Issue Date", value: workOrder.issueDate || "—" },
              { label: "Status", value: <Badge color={statusOpt?.color}>{statusOpt?.label}</Badge> },
              { label: "Repair Priority Class", value: workOrder.repairPriority ? REPAIR_PRIORITY_CLASSES.find(r => r.value === workOrder.repairPriority)?.label : "—" },
              { label: "Issued By", value: issuer ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar initials={issuer.avatar} size={20} />{issuer.name}</span> : "—" },
              { label: "Assigned To", value: assignee ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Avatar initials={assignee.avatar} size={20} />{assignee.name}</span> : "—" },
              { label: "Start Date", value: workOrder.startDate || "—" },
              { label: "Actual Start Date", value: workOrder.startDate || "—" },
              { label: "Expected Completion", value: workOrder.completionDate || "—" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Warranty + Cost */}
          <div>
            <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)", marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Warranty Coverage</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
                <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Active</div><div style={{ fontSize: 22, fontWeight: 700, color: "#22c55e" }}>1</div></div>
                <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Expiring Soon</div><div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>0</div></div>
                <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Total</div><div style={{ fontSize: 22, fontWeight: 700 }}>1</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Summary */}
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 20, border: "1px solid var(--border-light)", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>Line Items</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16, textAlign: "center" }}>
            <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Labor</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(totalLabor)}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Parts</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(totalParts)}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Total</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(total)}</div></div>
          </div>

          {workOrder.serviceTasks.map((task) => {
            const taskLabor = (task.labor || []).reduce((s, l) => s + l.amount, 0);
            const taskParts = (task.parts || []).reduce((s, p) => s + p.amount, 0);
            return (
              <div key={task.id} style={{ padding: "12px 0", borderTop: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{task.name}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(taskLabor + taskParts)}</span>
                </div>
                {task.category && (
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
                    {task.category.system} / {task.category.assembly}{task.category.component ? ` / ${task.category.component}` : ""}
                  </div>
                )}
                {task.parts?.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0 6px 16px", fontSize: 12 }}>
                    <span>{p.image}</span>
                    <span style={{ color: "var(--accent)", fontWeight: 500 }}>{p.name}</span>
                    <span style={{ color: "var(--text-tertiary)" }}>· {p.location}</span>
                    <span style={{ marginLeft: "auto", color: "var(--text-secondary)" }}>{p.quantity} ea × {formatCurrency(p.unitCost)}</span>
                    <span style={{ fontWeight: 500, width: 70, textAlign: "right" }}>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Work Orders List ────────────────────────────────────────────────
function WorkOrdersList({ workOrders, onSelect, onAdd, viewMode, setViewMode }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = workOrders.filter(wo => {
    const matchSearch = !search || wo.number.toString().includes(search) ||
      VEHICLES.find(v => v.id === wo.vehicle)?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || wo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Work Orders</h2>
          <button onClick={onAdd} style={{ padding: "8px 20px", border: "none", borderRadius: 6, background: "var(--accent)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            + Add Work Order
          </button>
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          {[
            { id: "all", label: "All" },
            { id: "open", label: "Open", color: "#22c55e" },
            { id: "pending", label: "Pending", color: "#f59e0b" },
            { id: "completed", label: "Completed", color: "#22c55e" },
            { id: "pending-warranty", label: "Pending - Warranty", color: "#ec4899" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setStatusFilter(tab.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "4px 0", background: "none",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              color: statusFilter === tab.id ? "var(--text)" : "var(--text-tertiary)",
              borderBottom: statusFilter === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 8,
            }}>
              {tab.color && <span style={{ width: 8, height: 8, borderRadius: "50%", background: tab.color }} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, maxWidth: 280 }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search..." />
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {[
              { id: "list", icon: "☰" },
              { id: "calendar", icon: "📅" },
            ].map((v) => (
              <IconBtn key={v.id} active={viewMode === v.id} onClick={() => setViewMode(v.id)}>{v.icon}</IconBtn>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {viewMode === "list" && (
        <div style={{ padding: "0 24px" }}>
          {/* Column Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 120px 80px 100px 160px 100px 100px 100px 100px 80px", gap: 8, padding: "12px 0", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-light)", letterSpacing: ".3px" }}>
            <span></span><span>Vehicle</span><span>Number</span><span>Status</span><span>Service Tasks</span><span>Issue Date</span><span>Assigned To</span><span>Watchers</span><span>Total Cost</span><span>Labels</span>
          </div>
          {filtered.map((wo) => {
            const vehicle = VEHICLES.find(v => v.id === wo.vehicle);
            const assignee = TECHNICIANS.find(t => t.id === wo.assignedTo);
            const statusOpt = STATUS_OPTIONS.find(s => s.value === wo.status);
            const totalCost = wo.serviceTasks.reduce((s, t) =>
              s + (t.labor || []).reduce((ss, l) => ss + l.amount, 0) + (t.parts || []).reduce((ss, p) => ss + p.amount, 0), 0);
            return (
              <div key={wo.id} onClick={() => onSelect(wo)} style={{
                display: "grid", gridTemplateColumns: "28px 120px 80px 100px 160px 100px 100px 100px 100px 80px",
                gap: 8, padding: "12px 0", fontSize: 13, cursor: "pointer",
                borderBottom: "1px solid var(--border-light)", alignItems: "center",
                transition: "background .1s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 16 }}>{vehicle?.image || "🚗"}</span>
                <span style={{ fontWeight: 600 }}>{vehicle?.name || "—"}</span>
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>#{wo.number}</span>
                <Badge color={statusOpt?.color}>{statusOpt?.label}</Badge>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{wo.serviceTasks.map(t => t.name).join(", ") || "—"}</span>
                <span style={{ fontSize: 12 }}>{wo.issueDate}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {assignee && <Avatar initials={assignee.avatar} size={20} />}
                  <span style={{ fontSize: 11 }}>{assignee?.name || "—"}</span>
                </span>
                <span></span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(totalCost)}</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {wo.labels?.map(l => <Badge key={l} color="#3b82f6" size="sm">{l}</Badge>)}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-tertiary)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>No work orders found</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Create a new work order to get started</div>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div style={{ padding: "20px 24px" }}>
          <CalendarView workOrders={filtered} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}

// ─── Calendar View ───────────────────────────────────────────────────
function CalendarView({ workOrders, onSelect }) {
  const [viewType, setViewType] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const isToday = (d) => d.toDateString() === new Date().toDateString();

  const formatDateRange = () => {
    const start = days[0];
    const end = days[6];
    return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  };

  const navigate = (dir) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + dir * 7);
    setCurrentDate(next);
  };

  const getWOsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return workOrders.filter(wo => wo.issueDate === dateStr || wo.startDate === dateStr);
  };

  // Group by assignee
  const assignees = [...new Set(workOrders.map(wo => wo.assignedTo).filter(Boolean))];

  return (
    <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border-light)", overflow: "hidden" }}>
      {/* Calendar Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{formatDateRange()}</span>
          <button onClick={() => navigate(1)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>›</button>
          <button onClick={() => setCurrentDate(new Date())} style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, cursor: "pointer", background: "var(--surface)" }}>Today</button>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {["Day", "Week", "Month"].map((v) => (
            <button key={v} onClick={() => setViewType(v.toLowerCase())} style={{
              padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 11,
              cursor: "pointer", fontWeight: 500,
              background: viewType === v.toLowerCase() ? "var(--accent-light)" : "var(--surface)",
              color: viewType === v.toLowerCase() ? "var(--accent)" : "var(--text-secondary)",
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Grouped by Assignee */}
      <div style={{ display: "flex" }}>
        {/* Assignee column */}
        <div style={{ width: 180, flexShrink: 0, borderRight: "1px solid var(--border-light)" }}>
          <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1px solid var(--border-light)", height: 36, display: "flex", alignItems: "center" }}>
            Assignee
          </div>
          {assignees.map((aId) => {
            const tech = TECHNICIANS.find(t => t.id === aId);
            return (
              <div key={aId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--border-light)", height: 48 }}>
                <Avatar initials={tech?.avatar || "?"} size={24} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{tech?.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{tech?.location}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(7, 1fr)` }}>
          {/* Day headers */}
          {days.map((d, i) => (
            <div key={i} style={{
              padding: "8px 4px", textAlign: "center", borderBottom: "1px solid var(--border-light)",
              borderRight: i < 6 ? "1px solid var(--border-light)" : "none",
              background: isToday(d) ? "var(--accent-light)" : "transparent",
              height: 36, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 11, fontWeight: isToday(d) ? 700 : 500, color: isToday(d) ? "var(--accent)" : "var(--text-secondary)" }}>
                {dayNames[i]} {String(d.getDate()).padStart(2, "0")}
              </span>
            </div>
          ))}

          {/* Cells */}
          {assignees.map((aId) =>
            days.map((d, i) => {
              const wos = workOrders.filter(wo => {
                const dateStr = d.toISOString().split("T")[0];
                return wo.assignedTo === aId && (wo.issueDate === dateStr || wo.startDate === dateStr);
              });
              return (
                <div key={`${aId}-${i}`} style={{
                  padding: 4, borderBottom: "1px solid var(--border-light)",
                  borderRight: i < 6 ? "1px solid var(--border-light)" : "none",
                  height: 48, overflow: "hidden",
                }}>
                  {wos.map((wo) => (
                    <div key={wo.id} onClick={() => onSelect(wo)} style={{
                      padding: "3px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                      background: "#3b82f620", color: "#3b82f6", cursor: "pointer",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      #{wo.number}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ activeSection, onNavigate }) {
  const sections = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "vehicles", icon: "🚗", label: "Vehicles", children: ["Vehicle List", "Vehicle Assignments", "Meter History", "Expense History", "Replacement Analysis", "Telematics Devices"] },
    { id: "equipment", icon: "⚙️", label: "Equipment" },
    { id: "inspections", icon: "✅", label: "Inspections", children: ["Inspection History", "Item Failures", "Schedules", "Forms"] },
    { id: "issues", icon: "⚠️", label: "Issues" },
    { id: "reminders", icon: "🔔", label: "Reminders" },
    { id: "service", icon: "🔧", label: "Service", children: ["Service History", "Work Orders", "Service Tasks", "Service Programs", "Shop Directory", "Shop Integration"] },
    { id: "contacts", icon: "👥", label: "Contacts" },
    { id: "vendors", icon: "🏪", label: "Vendors" },
    { id: "parts", icon: "📦", label: "Parts & Inventory" },
    { id: "fuel", icon: "⛽", label: "Fuel & Energy" },
    { id: "places", icon: "📍", label: "Places" },
    { id: "documents", icon: "📄", label: "Documents" },
    { id: "reports", icon: "📈", label: "Reports" },
  ];

  const [expandedSections, setExpandedSections] = useState(["service"]);

  return (
    <div style={{
      width: 220, flexShrink: 0, background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>F</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Ciskie Contracting</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Sara Ciskie</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
        {sections.map((sec) => (
          <div key={sec.id}>
            <button
              onClick={() => {
                if (sec.children) {
                  setExpandedSections(expandedSections.includes(sec.id) ? expandedSections.filter(s => s !== sec.id) : [...expandedSections, sec.id]);
                }
                if (sec.id === "service") onNavigate("list");
              }}
              style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%",
                padding: "7px 16px", background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--text-secondary)", textAlign: "left",
                transition: "background .1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{sec.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{sec.label}</span>
              {sec.children && <span style={{ fontSize: 8, opacity: .5 }}>{expandedSections.includes(sec.id) ? "▼" : "▶"}</span>}
            </button>
            {sec.children && expandedSections.includes(sec.id) && (
              <div style={{ paddingLeft: 36 }}>
                {sec.children.map((child) => (
                  <button key={child}
                    onClick={() => child === "Work Orders" && onNavigate("list")}
                    style={{
                      display: "block", width: "100%", padding: "5px 12px",
                      background: child === "Work Orders" && activeSection === "list" ? "var(--accent-light)" : "none",
                      border: "none", cursor: "pointer", fontSize: 12, textAlign: "left",
                      color: child === "Work Orders" && activeSection === "list" ? "var(--accent)" : "var(--text-tertiary)",
                      fontWeight: child === "Work Orders" && activeSection === "list" ? 600 : 400,
                      borderRadius: 4,
                    }}
                    onMouseEnter={(e) => { if (!(child === "Work Orders" && activeSection === "list")) e.currentTarget.style.background = "var(--hover)"; }}
                    onMouseLeave={(e) => { if (!(child === "Work Orders" && activeSection === "list")) e.currentTarget.style.background = "transparent"; }}
                  >
                    {child}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)" }}>
        <button style={{ display: "flex", alignItems: "center", gap: 6, background: "#22c55e", border: "none", borderRadius: 20, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          💬 Help
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────
export default function WorkOrderApp() {
  const [view, setView] = useState("list"); // list | new | edit | detail
  const [viewMode, setViewMode] = useState("list"); // list | calendar
  const [selectedWO, setSelectedWO] = useState(null);
  const [toast, setToast] = useState(null);

  // Seed with sample data
  const [workOrders, setWorkOrders] = useState([
    {
      id: "wo1", number: 371, vehicle: "v1", status: "open", repairPriority: "non-scheduled",
      issueDate: "2024-05-10", issueTime: "3:47pm", issuedBy: "t2", startDate: "2024-05-10", startTime: "3:51pm",
      assignedTo: "t1", labels: ["Tires"],
      issues: ["i1"], vendor: "", invoiceNumber: "", poNumber: "", glCode: "",
      description: "", discount: 0, discountType: "%", tax: 0, taxType: "%",
      warrantyCreditValue: 0, warrantyCreditType: "$",
      serviceTasks: [
        {
          id: "st_1", serviceTaskId: "st1", name: "Tire Replacement",
          category: { system: "1 - Chassis Group", assembly: "017 - Tires, Tubes, Liners", component: "001 - Tire - Pneumatic" },
          parts: [{ id: "pt1", partId: "p1", name: "Michelin LTX A/T2", description: "All-terrain truck tire", image: "🛞", quantity: 4, unitCost: 211.98, location: "Birmingham", locationQty: 229, amount: 847.92, note: "" }],
          labor: [], notes: "", reasonForRepair: "", lastCompleted: "Never",
        },
        {
          id: "st_2", serviceTaskId: "st2", name: "Brake Inspection",
          category: { system: "1 - Chassis Group", assembly: "013 - Brakes", component: "" },
          parts: [], labor: [], notes: "", reasonForRepair: "",
          lastCompleted: "3 days ago · 7,459 mi ago", nextDue: "1 year from now", milesRemaining: "41 miles",
        },
        {
          id: "st_3", serviceTaskId: "st3", name: "Engine Oil & Filter Replacement",
          category: { system: "4 - Engine / Motor System", assembly: "045 - Power Plant", component: "011 - Filter Assembly - Oil" },
          parts: [
            { id: "pt2", partId: "p2", name: "STP Oil Filter", description: "Extended Life Oil Filter", image: "🔧", quantity: 1, unitCost: 9.99, location: "None", amount: 9.99, note: "" },
            { id: "pt3", partId: "p3", name: "Valvoline Premium Blue Motor Oil", description: "10W30 Diesel Engine Oil for Skid Steers", image: "🛢️", quantity: 7, unitCost: 18.99, location: "None", amount: 132.93, note: "" },
          ],
          labor: [], notes: "", reasonForRepair: "",
          lastCompleted: "1 month ago · 9,009 mi ago", nextDue: "11 months from now", milesRemaining: "991 miles",
        },
      ],
    },
    {
      id: "wo2", number: 369, vehicle: "v4", status: "open", repairPriority: "scheduled",
      issueDate: "2024-05-09", issueTime: "10:00am", issuedBy: "t2", startDate: "2024-05-10",
      assignedTo: "t6", labels: [],
      issues: [], vendor: "", invoiceNumber: "", poNumber: "", glCode: "",
      description: "", discount: 0, discountType: "%", tax: 0, taxType: "%",
      warrantyCreditValue: 0, warrantyCreditType: "$",
      serviceTasks: [{ id: "st_4", serviceTaskId: "st4", name: "Tire Rotation", category: SERVICE_TASKS_LIBRARY[3].category, parts: [], labor: [], notes: "", reasonForRepair: "" }],
    },
    {
      id: "wo3", number: 316, vehicle: "v5", status: "pending", repairPriority: "non-scheduled",
      issueDate: "2024-05-09", issueTime: "2:00pm", issuedBy: "t5",
      assignedTo: "t5", labels: [],
      issues: [], vendor: "", invoiceNumber: "", poNumber: "", glCode: "",
      description: "", discount: 0, discountType: "%", tax: 0, taxType: "%",
      warrantyCreditValue: 0, warrantyCreditType: "$",
      serviceTasks: [{ id: "st_5", serviceTaskId: "st7", name: "A/C Inspection", category: SERVICE_TASKS_LIBRARY[6].category, parts: [], labor: [], notes: "", reasonForRepair: "" }],
    },
  ]);

  const handleSave = (formData) => {
    if (view === "new") {
      setWorkOrders([formData, ...workOrders]);
      setToast({ message: "Work order created successfully", type: "success" });
    } else {
      setWorkOrders(workOrders.map(wo => wo.id === formData.id ? formData : wo));
      setToast({ message: "Work order updated successfully", type: "success" });
    }
    setView("list");
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: "var(--bg)", color: "var(--text)",
      "--bg": "#f1f5f9",
      "--surface": "#ffffff",
      "--sidebar-bg": "#f8fafc",
      "--text": "#0f172a",
      "--text-secondary": "#475569",
      "--text-tertiary": "#94a3b8",
      "--border": "#e2e8f0",
      "--border-light": "#f1f5f9",
      "--accent": "#2563eb",
      "--accent-light": "#dbeafe",
      "--hover": "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes modalIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Sidebar activeSection={view === "list" ? "list" : "detail"} onNavigate={(v) => { setView(v); setSelectedWO(null); }} />

      {view === "list" && (
        <WorkOrdersList
          workOrders={workOrders}
          onSelect={(wo) => { setSelectedWO(wo); setView("detail"); }}
          onAdd={() => setView("new")}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}
      {view === "new" && (
        <WorkOrderForm onSave={handleSave} onCancel={() => setView("list")} />
      )}
      {view === "edit" && selectedWO && (
        <WorkOrderForm workOrder={selectedWO} onSave={handleSave} onCancel={() => setView("detail")} />
      )}
      {view === "detail" && selectedWO && (
        <WorkOrderDetail
          workOrder={selectedWO}
          onBack={() => { setView("list"); setSelectedWO(null); }}
          onEdit={() => setView("edit")}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
