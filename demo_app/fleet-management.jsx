import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────
const GROUPS = ["Atlanta", "Nashville", "Tallahassee", "Florida", "Alabama", "Columbia", "Tennessee", "South Carolina", "Birmingham"];
const TYPES = ["Bobcat", "Car", "Semi Truck", "Pickup Truck", "Van", "SUV"];
const STATUSES = ["Active", "Out of Service", "In Shop"];
const MAKES_MODELS = {
  "Caterpillar": ["259D", "299D2", "262D3"],
  "New Holland": ["L230", "L220", "C238"],
  "Toyota": ["Sienna", "Tacoma", "Camry"],
  "Freightliner": ["Cascadia 113", "M2 106", "Columbia"],
  "Ford": ["F-150", "Transit", "F-250"],
  "Chevrolet": ["Silverado 1500", "Express 3500", "Colorado"],
};

const generateVIN = () => {
  const chars = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ";
  return Array.from({ length: 17 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const generateVehicles = () => {
  const vehicles = [];
  const prefixes = ["AB", "AC", "ABD", "BL", "CF", "DG", "EH", "FK"];
  let id = 1;
  for (let i = 0; i < 52; i++) {
    const make = Object.keys(MAKES_MODELS)[Math.floor(Math.random() * Object.keys(MAKES_MODELS).length)];
    const model = MAKES_MODELS[make][Math.floor(Math.random() * MAKES_MODELS[make].length)];
    const status = STATUSES[Math.floor(Math.random() * 10) < 7 ? 0 : Math.floor(Math.random() * 3)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const group = GROUPS[Math.floor(Math.random() * GROUPS.length)];
    const year = 2010 + Math.floor(Math.random() * 15);
    const suffix = i > 8 ? "CON" : "";
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${100 + i}${suffix}`;
    const isMile = type === "Car" || type === "Semi Truck" || type === "Pickup Truck" || type === "SUV";
    const meter = isMile ? `${(Math.random() * 150000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} mi` : "1,850 hr";
    const plate = Math.random() > 0.7 ? `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}` : "—";

    vehicles.push({ id: id++, name, year, make, model, vin: generateVIN(), status, type, group, meter, plate, fuelType: "Diesel", operator: "Unassigned" });
  }
  return vehicles;
};

const VEHICLES = generateVehicles();

const SERVICE_TASKS = [
  { task: "Diesel Emissions Fluid Fill", interval: "Every 1 month(s) or 4,000 miles", nextDue: "4 weeks from now", lastCompleted: "05/06/2024", compliance: 100 },
  { task: "Diesel Exhaust Fluid Pump Filter Replacement", interval: "Every 4 month(s) or 200,000 miles", nextDue: "4 months from now", lastCompleted: "05/06/2024", compliance: 100 },
  { task: "Engine Oil & Filter Replacement", interval: "Every 5 month(s) or 45,000 miles", nextDue: "5 months from now", lastCompleted: "05/02/2024", compliance: 100 },
  { task: "Tire Rotation", interval: "Every 10 month(s) or 45,000 miles", nextDue: "10 months from now", lastCompleted: "05/02/2024", compliance: 100 },
  { task: "Engine Air Filter Replacement", interval: "Every 12 month(s) or 150,000 miles", nextDue: "1 year from now", lastCompleted: "05/06/2024", compliance: 100 },
  { task: "Engine Coolant Drain & Refill", interval: "Every 24 month(s) or 700,000 miles", nextDue: "2 years from now", lastCompleted: "05/01/2024", compliance: 100 },
];

const SERVICE_HISTORY = [
  { id: 26, date: "05/06/2024 10:18pm", meter: "260 mi", tasks: ["Engine Air Filter Replacement", "Diesel Exhaust Fluid Pump Filter Replacement", "Diesel Emissions Fluid Fill"], total: "$80.05" },
  { id: 25, date: "05/02/2024 8:18pm", meter: "228 mi", tasks: ["Tire Rotation", "Engine Oil & Filter Replacement", "Engine Air Filter Replacement", "Diesel Exhaust Fluid Pump Filter Replacement", "Diesel Emissions Fluid Fill"], total: "$148.96" },
  { id: 24, date: "05/01/2024 3:18pm", meter: "220 mi", tasks: ["Engine Coolant Drain & Refill", "Engine Oil & Filter Replacement"], total: "$197.21" },
  { id: 23, date: "04/21/2024 10:18pm", meter: "140 mi", tasks: ["Tire Rotation", "Engine Air Filter Replacement", "Engine Oil & Filter Replacement"], total: "$97.79" },
  { id: 22, date: "04/09/2024 1:18pm", meter: "40 mi", tasks: ["Engine Oil & Filter Replacement", "Tire Rotation"], total: "$66.49" },
];

const FUEL_HISTORY = [
  { date: "Thu, May 09, 2024 7:34am", vendor: "Shell", meter: "288 mi", usage: 26.0, volume: 144.965, total: "$778.17", economy: 0.18, costPerMeter: "$29.93" },
  { date: "Wed, May 08, 2024 9:51am", vendor: "Shell", meter: "262 mi", usage: 40.0, volume: 141.969, total: "$848.69", economy: 0.28, costPerMeter: "$21.22" },
  { date: "Fri, May 03, 2024 9:25am", vendor: "Shell", meter: "222 mi", usage: 42.0, volume: 150.304, total: "$890.85", economy: 0.28, costPerMeter: "$21.21" },
  { date: "Sun, Apr 28, 2024 8:58pm", vendor: "Shell", meter: "180 mi", usage: 38.0, volume: 142.678, total: "$633.03", economy: 0.27, costPerMeter: "$16.67" },
  { date: "Tue, Apr 23, 2024 3:01pm", vendor: "Shell", meter: "142 mi", usage: 50.0, volume: 145.393, total: "$840.37", economy: 0.34, costPerMeter: "$16.81" },
];

const INSPECTIONS = [
  { date: "Wed, May 08, 2024 2:09pm", duration: "19m 10s", form: "Driver Vehicle Inspection Report (Simple)", user: "Eddie Johns" },
  { date: "Wed, May 08, 2024 9:43am", duration: "18m 12s", form: "Driver Vehicle Inspection Report (Simple)", user: "Eddie Johns" },
  { date: "Mon, May 06, 2024 10:50pm", duration: "19m 38s", form: "Driver Vehicle Inspection Report (Simple)", user: "Eddie Johns" },
  { date: "Sat, May 04, 2024 11:44am", duration: "15m 42s", form: "Driver Vehicle Inspection Report (Simple)", user: "Jacob Silva" },
  { date: "Thu, May 02, 2024 11:52am", duration: "15m 13s", form: "Driver Vehicle Inspection Report (Simple)", user: "Jacob Silva" },
  { date: "Tue, Apr 30, 2024 6:27pm", duration: "19m 53s", form: "Driver Vehicle Inspection Report (Simple)", user: "Jacob Silva" },
  { date: "Sun, Apr 28, 2024 10:18am", duration: "17m 6s", form: "Driver Vehicle Inspection Report (Simple)", user: "Jacob Silva" },
  { date: "Fri, Apr 26, 2024 7:47am", duration: "18m 29s", form: "Driver Vehicle Inspection Report (Simple)", user: "Jacob Silva" },
];

const ALL_COLUMNS = ["Name", "Year", "Make", "Model", "VIN", "Status", "Type", "Group", "Current Meter", "License Plate"];

// ─── Icons ───────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    truck: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    wrench: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    clipboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    fuel: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 11h2a2 2 0 012 2v4a2 2 0 002 2 2 2 0 002-2V9l-3-3"/><path d="M3 22h12"/><rect x="6" y="6" width="6" height="4"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    box: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    arrowLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ─── Status Badge ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const colors = {
    "Active": { bg: "#e8f5e9", dot: "#43a047", text: "#2e7d32" },
    "Out of Service": { bg: "#ffebee", dot: "#e53935", text: "#c62828" },
    "In Shop": { bg: "#fff8e1", dot: "#ffa000", text: "#e65100" },
    "Upcoming": { bg: "#eceff1", dot: "#78909c", text: "#546e7a" },
  };
  const c = colors[status] || colors["Active"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: c.text, padding: "2px 0" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

// ─── Dropdown ────────────────────────────────────────────────────
const Dropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, color: "#344054", cursor: "pointer" }}>
        {label}{value ? `: ${value}` : ""} <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.1)", zIndex: 100, minWidth: 160, maxHeight: 240, overflow: "auto" }}>
          <div onClick={() => { onChange(""); setOpen(false); }} style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer", color: "#667085", borderBottom: "1px solid #f2f4f7" }}>All</div>
          {options.map(o => (
            <div key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ padding: "8px 14px", fontSize: 13, cursor: "pointer", background: value === o ? "#f0f5ff" : "transparent", color: value === o ? "#1570ef" : "#344054" }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Modal ───────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, width = 640 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width, maxWidth: "95vw", maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e4e7ec" }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#101828" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="x" size={20} color="#667085" /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

// ─── Tab Bar ─────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange, moreItems }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div style={{ display: "flex", borderBottom: "2px solid #e4e7ec", gap: 0 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{ padding: "10px 16px", fontSize: 13.5, fontWeight: active === t ? 600 : 400, color: active === t ? "#1570ef" : "#667085", background: "none", border: "none", borderBottom: active === t ? "2px solid #1570ef" : "2px solid transparent", marginBottom: -2, cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>
      ))}
      {moreItems && (
        <div ref={ref} style={{ position: "relative" }}>
          <button onClick={() => setMoreOpen(!moreOpen)} style={{ padding: "10px 16px", fontSize: 13.5, fontWeight: 400, color: "#667085", background: "none", border: "none", borderBottom: "2px solid transparent", marginBottom: -2, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>More <Icon name="chevronDown" size={14} /></button>
          {moreOpen && (
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#fff", border: "1px solid #e4e7ec", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.12)", zIndex: 100, minWidth: 200, overflow: "hidden" }}>
              {moreItems.map(item => (
                <div key={item} onClick={() => { onChange(item); setMoreOpen(false); }} style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: active === item ? "#1570ef" : "#344054", background: active === item ? "#f0f5ff" : "transparent", borderBottom: "1px solid #f9fafb" }}>{item}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Form Field ──────────────────────────────────────────────────
const FormField = ({ label, required, hint, children, half }) => (
  <div style={{ flex: half ? "1" : "unset", minWidth: half ? 0 : "auto" }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#344054", marginBottom: 4 }}>{label}{required && <span style={{ color: "#e53935" }}> *</span>}</label>
    {children}
    {hint && <p style={{ fontSize: 12, color: "#98a2b3", margin: "4px 0 0" }}>{hint}</p>}
  </div>
);

const Input = ({ placeholder, value, onChange, type = "text" }) => (
  <input type={type} placeholder={placeholder} value={value || ""} onChange={e => onChange?.(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 14, color: "#101828", outline: "none", boxSizing: "border-box" }} />
);

const Select = ({ options, value, onChange, placeholder = "Please select" }) => (
  <select value={value || ""} onChange={e => onChange?.(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 14, color: value ? "#101828" : "#98a2b3", background: "#fff", outline: "none", boxSizing: "border-box" }}>
    <option value="" disabled>{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ─── Vehicle Detail View ─────────────────────────────────────────
const VehicleDetail = ({ vehicle, onBack }) => {
  const [tab, setTab] = useState("Overview");
  const mainTabs = ["Overview", "Specs", "Financial", "Warranties", "Tire Management", "Service History"];
  const moreTabs = ["Inspection History", "Fuel History", "Service Reminders", "Issues", "Meter History"];

  const CostChart = () => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    const vals = [2800, 3100, 2600, 3400, 2900, 3200, 2700, 3000, 2500, 3300, 2100, 3600];
    const maxV = Math.max(...vals);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, padding: "0 4px" }}>
        {months.map((m, i) => (
          <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", height: (vals[i] / maxV) * 100, background: i < 10 ? "#36bfb1" : i === 10 ? "#fbbf24" : "#a78bfa", borderRadius: "3px 3px 0 0", minHeight: 4 }} />
            <span style={{ fontSize: 10, color: "#98a2b3" }}>{m}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#667085", fontSize: 13, cursor: "pointer", padding: "0 0 8px", marginBottom: 4 }}>
        <Icon name="arrowLeft" size={14} /> Vehicles
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#e4e7ec", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="truck" size={28} color="#667085" /></div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#101828" }}>{vehicle.name}</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#667085" }}>{vehicle.type} · {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.vin}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: "#344054" }}>{vehicle.meter}</span>
            <StatusBadge status={vehicle.status} />
            <span style={{ fontSize: 13, color: "#667085" }}>{vehicle.group}</span>
            <span style={{ fontSize: 13, color: "#667085" }}>{vehicle.operator}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#344054" }}><Icon name="edit" size={14} /> Edit</button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "none", borderRadius: 6, background: "#1570ef", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 500 }}><Icon name="plus" size={14} color="#fff" /> Add</button>
        </div>
      </div>

      <TabBar tabs={mainTabs} active={tab} onChange={setTab} moreItems={moreTabs} />

      <div style={{ padding: "20px 0" }}>
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#101828", margin: "0 0 16px" }}>Details</h3>
              {[["Name", vehicle.name], ["Meter", vehicle.meter], ["Status", vehicle.status], ["Group", `${vehicle.group}`], ["Operator", vehicle.operator], ["Type", vehicle.type], ["Fuel Type", vehicle.fuelType || "—"], ["VIN/SN", vehicle.vin], ["License Plate", vehicle.plate], ["Year", vehicle.year], ["Make", vehicle.make], ["Model", vehicle.model]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f2f4f7" }}>
                  <span style={{ fontSize: 13, color: "#667085" }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>{v === "Active" ? <StatusBadge status={v} /> : v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#101828", margin: 0 }}>Cost of Ownership</h3>
                  <span style={{ fontSize: 12, color: "#667085", border: "1px solid #e4e7ec", borderRadius: 6, padding: "3px 8px" }}>Last 12 Months</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
                  <div><p style={{ margin: 0, fontSize: 12, color: "#667085" }}>Total Costs</p><p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#101828" }}>$52,682.31</p></div>
                  <div><p style={{ margin: 0, fontSize: 12, color: "#667085" }}>Cost Per Meter</p><p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#101828" }}>$182.92<span style={{ fontSize: 13, fontWeight: 400, color: "#667085" }}> / mi</span></p></div>
                </div>
                <CostChart />
                <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                  {[["#36bfb1", "Fuel Costs", "$51,877.27"], ["#fbbf24", "Service Costs", "$590.53"], ["#a78bfa", "Other Costs", "$214.51"]].map(([c, l, v]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                      <span style={{ fontSize: 11, color: "#667085" }}>{l}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#101828" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Specs" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Dimensions</h3>
                <button style={{ fontSize: 13, color: "#1570ef", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
              </div>
              {["Width", "Height", "Length", "Interior Volume", "Passenger Volume", "Cargo Volume", "Ground Clearance", "Bed Length"].map(f => (
                <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f2f4f7" }}>
                  <span style={{ fontSize: 13, color: "#667085" }}>{f}</span><span style={{ fontSize: 13, color: "#98a2b3" }}>—</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Engine</h3>
                <button style={{ fontSize: 13, color: "#1570ef", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
              </div>
              {[["Engine Summary", "Detroit DD15 14.8L I6 455-560hp"], ["Engine Brand", "Detroit"], ["Aspiration", "Turbocharger"], ["Block Type", "I"], ["Cam Type", "DOHC"], ["Cylinders", "6"], ["Displacement", "14.8"], ["Fuel Induction", "Common Rail Direct Injection"], ["Max HP", "455"], ["Max Torque", "1,550"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f2f4f7" }}>
                  <span style={{ fontSize: 13, color: "#667085" }}>{k}</span><span style={{ fontSize: 13, color: "#101828" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Service History" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
                <Icon name="search" size={16} color="#98a2b3" />
                <input placeholder="Search" style={{ width: "100%", padding: "7px 12px 7px 32px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e4e7ec" }}>
                  {["Work Order", "Actual Completion Date", "Meter", "Service Tasks", "Total"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#667085", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICE_HISTORY.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "12px", fontSize: 13 }}><span style={{ color: "#1570ef", fontWeight: 500 }}>#{s.id}</span></td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{s.date}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{s.meter}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{s.tasks.map((t, i) => <div key={i} style={{ color: "#1570ef", marginBottom: 2 }}>{t}</div>)}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054", fontWeight: 500 }}>{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Warranties" && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#98a2b3" }}>
            <Icon name="search" size={48} color="#d0d5dd" />
            <p style={{ fontSize: 14, marginTop: 12 }}>No results to show.</p>
          </div>
        )}

        {tab === "Tire Management" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Axle Configuration</h3>
                <button style={{ fontSize: 13, color: "#1570ef", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
              </div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>6x4</p>
                <p style={{ fontSize: 12, color: "#667085" }}>6 wheel positions, 4 driven</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "#667085", marginBottom: 8 }}>Front Axle</p>
                  <div style={{ display: "flex", gap: 40 }}>
                    {[0, 1].map(i => <div key={i} style={{ width: 48, height: 64, border: "2px solid #1570ef", borderRadius: 6, background: i === 1 ? "#f0f5ff" : "#1570ef", display: "flex", alignItems: "center", justifyContent: "center" }}>{i === 0 ? <Icon name="plus" size={20} color="#fff" /> : <span style={{ fontSize: 11, fontWeight: 600, color: "#1570ef" }}>RF</span>}</div>)}
                  </div>
                </div>
                {["Axle 2", "Axle 3"].map(axle => (
                  <div key={axle} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: "#667085", marginBottom: 8 }}>{axle}</p>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 36, height: 52, borderRadius: 4, background: "#1570ef", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={16} color="#fff" /></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Installed Tires <span style={{ background: "#e4e7ec", borderRadius: 10, padding: "2px 8px", fontSize: 12 }}>1</span></h3>
                <button style={{ padding: "6px 12px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>+ Add</button>
              </div>
              <div style={{ border: "1px solid #e4e7ec", borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#101828", margin: "0 0 2px" }}>Right Front (RF) <span style={{ fontWeight: 400, color: "#667085" }}>Front Axle</span></p>
                <p style={{ fontSize: 13, color: "#1570ef", margin: "4px 0" }}>Milestar BS625</p>
                <p style={{ fontSize: 11, color: "#98a2b3", margin: "0 0 8px" }}>21135005</p>
                <div style={{ display: "flex", gap: 24 }}>
                  <div><p style={{ fontSize: 11, color: "#667085", margin: 0 }}>Current Tread Depth</p><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>16 <span style={{ fontWeight: 400, color: "#667085" }}>/32 in</span></p></div>
                  <div><p style={{ fontSize: 11, color: "#667085", margin: 0 }}>Current Pressure</p><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>110 <span style={{ fontWeight: 400, color: "#667085" }}>PSI</span></p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Service Reminders" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e4e7ec" }}>
                  {["Service Task", "Status", "Next Due", "Last Completed", "Compliance"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#667085", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICE_TASKS.map(s => (
                  <tr key={s.task} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontSize: 13, color: "#1570ef", fontWeight: 500 }}>{s.task}</div>
                      <div style={{ fontSize: 11, color: "#98a2b3" }}>{s.interval}</div>
                    </td>
                    <td style={{ padding: "12px" }}><StatusBadge status="Upcoming" /></td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{s.nextDue}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#1570ef" }}>{s.lastCompleted}</td>
                    <td style={{ padding: "12px", fontSize: 13, fontWeight: 500, color: "#101828" }}>{s.compliance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Inspection History" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e4e7ec" }}>
                  {["Submitted", "Duration", "Inspection Form", "User"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#667085", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INSPECTIONS.map((ins, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "12px", fontSize: 13, color: "#1570ef" }}>{ins.date}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{ins.duration}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{ins.form}</td>
                    <td style={{ padding: "12px", fontSize: 13 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#4338ca" }}>{ins.user.split(" ").map(n => n[0]).join("")}</div>
                        <span style={{ color: "#1570ef" }}>{ins.user}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Fuel History" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e4e7ec" }}>
                  {["Date", "Vendor", "Meter Entry", "Usage", "Volume", "Total", "Fuel Economy", "Cost per Meter"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#667085", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FUEL_HISTORY.map((f, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f2f4f7" }}>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.date}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#1570ef" }}>{f.vendor}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.meter}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.usage} miles</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.volume} gallons</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054", fontWeight: 500 }}>{f.total}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.economy} mpg</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#344054" }}>{f.costPerMeter} / mile</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "Financial" && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#98a2b3" }}>
            <Icon name="chart" size={48} color="#d0d5dd" />
            <p style={{ fontSize: 14, marginTop: 12 }}>Financial data will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── New Vehicle Form ────────────────────────────────────────────
const NewVehicleForm = ({ onClose, onSave }) => {
  const [formTab, setFormTab] = useState("Details");
  const [form, setForm] = useState({ name: "", vin: "", plate: "", type: "Car", fuelType: "", year: "", make: "", model: "", trim: "", regState: "" });
  return (
    <div>
      <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#667085", fontSize: 13, cursor: "pointer", padding: "0 0 8px" }}>
        <Icon name="arrowLeft" size={14} /> Vehicles
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#101828" }}>New Vehicle</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#344054" }}>Cancel</button>
          <button style={{ padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#344054" }}>Add Multiple Vehicles</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#1570ef", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 500 }}>Save Vehicle</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          {["Details", "Maintenance", "Lifecycle", "Financial", "Custom Fields", "Specifications", "Settings"].map(t => (
            <div key={t} onClick={() => setFormTab(t)} style={{ padding: "10px 14px", fontSize: 13.5, cursor: "pointer", borderRadius: 6, background: formTab === t ? "#f0f5ff" : "transparent", color: formTab === t ? "#1570ef" : "#667085", fontWeight: formTab === t ? 500 : 400, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={t === "Details" ? "file" : t === "Maintenance" ? "wrench" : t === "Settings" ? "settings" : "grid"} size={16} color={formTab === t ? "#1570ef" : "#98a2b3"} />
              {t}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 24 }}>
          {formTab === "Details" && (
            <>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 20px", color: "#101828" }}>Identification</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FormField label="Vehicle Name" required hint="Enter a nickname to distinguish this vehicle in Fleetio.">
                  <Input placeholder="" value={form.name} onChange={v => setForm({ ...form, name: v })} />
                </FormField>
                <FormField label="Telematics Device" hint="Link this vehicle with one of your Telematics Devices to begin automatically collecting data">
                  <Select options={["GPS Tracker 1", "GPS Tracker 2"]} />
                </FormField>
                <FormField label="VIN/SN" hint="Vehicle Identification Number or Serial Number.">
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1 }}><Input placeholder="" value={form.vin} onChange={v => setForm({ ...form, vin: v })} /></div>
                    <button style={{ padding: "8px 14px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#344054", whiteSpace: "nowrap" }}>Decode VIN</button>
                  </div>
                </FormField>
                <FormField label="License Plate">
                  <Input value={form.plate} onChange={v => setForm({ ...form, plate: v })} />
                </FormField>
                <div style={{ display: "flex", gap: 16 }}>
                  <FormField label="Type" required half>
                    <Select options={TYPES} value={form.type} onChange={v => setForm({ ...form, type: v })} />
                  </FormField>
                  <FormField label="Fuel Type" half>
                    <Select options={["Diesel", "Gasoline", "Electric", "Hybrid"]} value={form.fuelType} onChange={v => setForm({ ...form, fuelType: v })} />
                  </FormField>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <FormField label="Year" half hint="e.g. 1999, 2012, etc.">
                    <Input value={form.year} onChange={v => setForm({ ...form, year: v })} />
                  </FormField>
                  <FormField label="Make" half hint="e.g. Toyota, GMC, Chevrolet, etc.">
                    <Select options={Object.keys(MAKES_MODELS)} value={form.make} onChange={v => setForm({ ...form, make: v })} />
                  </FormField>
                  <FormField label="Model" half hint="e.g. 4Runner, Yukon, Silverado, etc.">
                    <Select options={form.make ? MAKES_MODELS[form.make] || [] : []} value={form.model} onChange={v => setForm({ ...form, model: v })} />
                  </FormField>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <FormField label="Trim" half hint="e.g. SE, LE, XLE, etc.">
                    <Input value={form.trim} onChange={v => setForm({ ...form, trim: v })} />
                  </FormField>
                  <FormField label="Registration State/Province" half>
                    <Input value={form.regState} onChange={v => setForm({ ...form, regState: v })} />
                  </FormField>
                </div>
                <FormField label="Labels">
                  <Select options={["Heavy Duty", "Light Duty", "Leased", "Owned"]} />
                </FormField>
              </div>
            </>
          )}
          {formTab === "Maintenance" && (
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>Maintenance Schedule</h3>
              <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Choose a Service Program. Service Programs automatically manage Service Reminders for Vehicles that share common preventative maintenance needs.</p>
              {[["None", "No Service Reminders will be created", true], ["Manufacturer Recommended Maintenance Schedule", "OEM Maintenance Schedule", false], ["Choose an existing Service Program", null, false]].map(([title, desc, selected]) => (
                <div key={title} style={{ border: `2px solid ${selected ? "#1570ef" : "#e4e7ec"}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12, cursor: "pointer", background: selected ? "#f0f5ff" : "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selected ? "#1570ef" : "#d0d5dd"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1570ef" }} />}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#101828" }}>{title}</p>
                      {desc && <p style={{ margin: 0, fontSize: 12, color: "#667085" }}>{desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!["Details", "Maintenance"].includes(formTab) && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#98a2b3" }}>
              <p style={{ fontSize: 14 }}>{formTab} settings will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Add Multiple Vehicles ───────────────────────────────────────
const AddMultipleVehicles = ({ onClose }) => {
  const [text, setText] = useState("");
  return (
    <div>
      <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#667085", fontSize: 13, cursor: "pointer", padding: "0 0 8px" }}>
        <Icon name="arrowLeft" size={14} /> Vehicles
      </button>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#101828", margin: "0 0 20px" }}>Add Multiple Vehicles</h2>
      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        {["Step 1\nAdd Vehicle Data", "Step 2\nReview and Save"].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: "16px 24px", background: i === 0 ? "#fff" : "#f9fafb", borderBottom: i === 0 ? "3px solid #1570ef" : "1px solid #e4e7ec", textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? "#1570ef" : "#98a2b3", margin: 0, whiteSpace: "pre-line" }}>{s}</p>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 24 }}>
        <p style={{ fontSize: 13, color: "#344054", margin: "0 0 4px" }}>Each vehicle should be on a new line. You can copy & paste your vehicle data from a spreadsheet program like Excel or Google Sheets.</p>
        <p style={{ fontSize: 13, color: "#667085", margin: "0 0 16px" }}>NOTE: a maximum of 200 vehicles can be written/pasted into the box below.</p>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="004, 3FAHP0GA6XR228818, Birmingham&#10;022, JACL4B155C7004875, Huntsville&#10;437, 3ALACWDT0UVGH4607, Birmingham" rows={8} style={{ width: "100%", padding: 12, border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 13, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" }} />
        <p style={{ fontSize: 12, color: "#667085", margin: "8px 0 0" }}>Format each line like: {"{Vehicle name}, {VIN}, {Group}"}</p>
      </div>
    </div>
  );
};

// ─── Manage Columns Modal ────────────────────────────────────────
const ManageColumnsModal = ({ columns, onSave, onClose }) => {
  const [visible, setVisible] = useState([...columns]);
  const allOptions = ["12345", "Air Conditioning", "Auto Integrate Status", "Axle Configuration", "Battery Voltage", "Bed Length", "Body Subtype", "Body Type", "Brake System", "Color", "Created On", "Curb Weight", "Current Meter", "Current Secondary Meter", "DEF Level", "Emissions", "Length", "License Plate", "Linked Equipment", "Linked Vehicles", "Make", "Max Payload", "Meter Entry Date", "Model", "Name", "Oil Capacity", "Operator", "Ownership", "Registration State/Province", "Status", "Type", "VIN", "Year", "Group"];
  return (
    <Modal title="Manage Columns" onClose={onClose} width={720}>
      <p style={{ fontSize: 13, color: "#667085", margin: "0 0 16px" }}>Select which columns are visible for you. To change the column order, drag and drop the visible fields.</p>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: "#344054", margin: "0 0 8px" }}>Available Columns <span style={{ color: "#98a2b3", fontWeight: 400 }}>{allOptions.length}</span></h4>
          <input placeholder="Filter columns" style={{ width: "100%", padding: "7px 12px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ maxHeight: 300, overflow: "auto", border: "1px solid #e4e7ec", borderRadius: 6, padding: 4 }}>
            {allOptions.map(col => (
              <label key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", fontSize: 13, cursor: "pointer", color: "#344054" }}>
                <input type="checkbox" checked={visible.includes(col)} onChange={e => { if (e.target.checked) setVisible([...visible, col]); else setVisible(visible.filter(c => c !== col)); }} style={{ accentColor: "#1570ef" }} />
                {col}
              </label>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: "#344054", margin: 0 }}>Visible Columns <span style={{ color: "#98a2b3", fontWeight: 400 }}>{visible.length}</span></h4>
            <button onClick={() => setVisible(ALL_COLUMNS)} style={{ fontSize: 12, color: "#1570ef", background: "none", border: "none", cursor: "pointer" }}>Restore defaults</button>
          </div>
          <div style={{ border: "1px solid #e4e7ec", borderRadius: 6, padding: 4, minHeight: 200 }}>
            {visible.map(col => (
              <div key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", fontSize: 13, color: "#344054", borderBottom: "1px solid #f2f4f7" }}>
                <span style={{ cursor: "grab", color: "#d0d5dd" }}>⠿</span>
                {col}
                <button onClick={() => setVisible(visible.filter(c => c !== col))} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 2 }}><Icon name="x" size={14} color="#98a2b3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
        <button onClick={() => { onSave(visible); onClose(); }} style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#1570ef", fontSize: 13, cursor: "pointer", color: "#fff" }}>Apply Changes</button>
      </div>
    </Modal>
  );
};

// ─── Import Modal ────────────────────────────────────────────────
const ImportModal = ({ onClose }) => (
  <div>
    <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#667085", fontSize: 13, cursor: "pointer", padding: "0 0 8px" }}>
      <Icon name="arrowLeft" size={14} /> Imports
    </button>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: "#101828", margin: "0 0 20px" }}>New Import</h2>
    <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>1. Upload Data</h3>
        <button style={{ fontSize: 13, color: "#1570ef", background: "none", border: "none", cursor: "pointer" }}>Browse Import Templates</button>
      </div>
      <FormField label="Import Type" required>
        <Select options={["Fuel Entry", "Vehicle", "Meter Entry", "Service Entry"]} />
      </FormField>
      <div style={{ marginTop: 16 }}>
        <FormField label="Import File" required>
          <div style={{ border: "2px dashed #d0d5dd", borderRadius: 8, padding: "40px 20px", textAlign: "center", cursor: "pointer" }}>
            <Icon name="plus" size={24} color="#98a2b3" />
            <p style={{ fontSize: 14, fontWeight: 500, color: "#344054", margin: "8px 0 4px" }}>Drag and drop files to upload</p>
            <p style={{ fontSize: 13, color: "#98a2b3", margin: 0 }}>or click to pick files</p>
          </div>
          <p style={{ fontSize: 12, color: "#667085", margin: "8px 0 0" }}>Choose a CSV file or other delimited text file with data (under 10MB) to import.</p>
        </FormField>
      </div>
    </div>
    <div style={{ background: "#f9fafb", border: "1px solid #e4e7ec", borderRadius: 10, padding: "16px 24px", marginBottom: 8, opacity: 0.6 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>2. Map Columns</h3>
    </div>
    <div style={{ background: "#f9fafb", border: "1px solid #e4e7ec", borderRadius: 10, padding: "16px 24px", opacity: 0.6 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>3. Review & Process</h3>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
      <button onClick={onClose} style={{ padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
      <button style={{ padding: "8px 16px", border: "none", borderRadius: 6, background: "#e4e7ec", fontSize: 13, color: "#98a2b3", cursor: "not-allowed" }}>Continue</button>
    </div>
  </div>
);

// ─── Main App ────────────────────────────────────────────────────
export default function FleetManagement() {
  const [view, setView] = useState("list"); // list | detail | new | addMultiple | import
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [listTab, setListTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("Name");
  const [sortAsc, setSortAsc] = useState(true);

  const perPage = 25;

  const filtered = VEHICLES.filter(v => {
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase()) && !v.vin.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType && v.type !== filterType) return false;
    if (filterGroup && v.group !== filterGroup) return false;
    if (filterStatus && v.status !== filterStatus) return false;
    if (listTab === "Assigned" && v.operator === "Unassigned") return false;
    if (listTab === "Unassigned" && v.operator !== "Unassigned") return false;
    return true;
  }).sort((a, b) => {
    const key = sortField.toLowerCase().replace(/ /g, "");
    const av = a[key === "currentmeter" ? "meter" : key === "licenseplate" ? "plate" : key] || "";
    const bv = b[key === "currentmeter" ? "meter" : key === "licenseplate" ? "plate" : key] || "";
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const sidebarItems = [
    { icon: "dashboard", label: "Dashboard" },
    { icon: "truck", label: "Vehicles", active: true, sub: ["Vehicle List", "Vehicle Assignments", "Meter History", "Expense History", "Replacement Analysis", "Telematics Devices"] },
    { icon: "wrench", label: "Equipment" },
    { icon: "clipboard", label: "Inspections" },
    { icon: "alert", label: "Issues" },
    { icon: "bell", label: "Reminders" },
    { icon: "settings", label: "Service" },
    { icon: "users", label: "Contacts" },
    { icon: "users", label: "Vendors" },
    { icon: "box", label: "Parts & Inventory" },
    { icon: "fuel", label: "Fuel & Energy" },
    { icon: "map", label: "Places" },
    { icon: "file", label: "Documents" },
    { icon: "chart", label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Source Sans 3', 'Segoe UI', -apple-system, sans-serif", background: "#f9fafb", color: "#101828", fontSize: 14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        table th { user-select: none; }
        input:focus, select:focus, textarea:focus { border-color: #1570ef !important; outline: none; box-shadow: 0 0 0 3px rgba(21,112,239,.12); }
        button:hover { opacity: 0.9; }
        tr:hover { background: #f9fafb; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? 56 : 220, background: "#0c1e3c", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .2s", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: "#1570ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>CC</div>
          {!sidebarCollapsed && <div><p style={{ fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Ciskie Contracting</p><p style={{ fontSize: 11, color: "rgba(255,255,255,.5)", margin: 0 }}>Sara Ciskie</p></div>}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {sidebarItems.map(item => (
            <div key={item.label}>
              <div onClick={() => item.label === "Vehicles" && view !== "list" ? setView("list") : null} style={{ display: "flex", alignItems: "center", gap: 10, padding: sidebarCollapsed ? "8px 18px" : "8px 16px", cursor: "pointer", background: item.active ? "rgba(255,255,255,.08)" : "transparent", borderRadius: 0, color: item.active ? "#fff" : "rgba(255,255,255,.65)", fontSize: 13.5, fontWeight: item.active ? 500 : 400 }}>
                <Icon name={item.icon} size={18} color={item.active ? "#fff" : "rgba(255,255,255,.5)"} />
                {!sidebarCollapsed && item.label}
                {!sidebarCollapsed && item.sub && <span style={{ marginLeft: "auto" }}><Icon name={item.active ? "chevronDown" : "chevronRight"} size={14} color="rgba(255,255,255,.35)" /></span>}
              </div>
              {item.active && item.sub && !sidebarCollapsed && item.sub.map(s => (
                <div key={s} onClick={() => { if (s === "Vehicle List") setView("list"); }} style={{ padding: "6px 16px 6px 44px", fontSize: 13, cursor: "pointer", color: s === "Vehicle List" ? "#fff" : "rgba(255,255,255,.5)", background: s === "Vehicle List" ? "rgba(21,112,239,.3)" : "transparent", borderRadius: 0 }}>{s}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer", color: "rgba(255,255,255,.5)", fontSize: 13 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>?</span>
            {!sidebarCollapsed && "Help"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 24px", background: "#fff", borderBottom: "1px solid #e4e7ec", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f2f4f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="truck" size={20} color="#667085" />
            </div>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={16} color="#98a2b3" />
              <span style={{ fontSize: 13, color: "#98a2b3", marginLeft: 8 }}>Search Fleetio</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}><Icon name="bell" size={20} color="#667085" /></button>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}><span style={{ fontSize: 16 }}>?</span></button>
            <button style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="plus" size={20} color="#667085" /></button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {view === "list" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#101828", margin: 0 }}>Vehicles</h1>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setView("import")} style={{ padding: "8px 14px", border: "1px solid #d0d5dd", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#344054" }}>···</button>
                  <button onClick={() => setView("new")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "none", borderRadius: 6, background: "#1570ef", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 500 }}><Icon name="plus" size={14} color="#fff" /> Add Vehicle</button>
                </div>
              </div>

              {/* List Tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e4e7ec", marginBottom: 16 }}>
                {["All", "Assigned", "Unassigned", "Archived"].map(t => (
                  <button key={t} onClick={() => { setListTab(t); setPage(1); }} style={{ padding: "8px 16px", fontSize: 13.5, fontWeight: listTab === t ? 600 : 400, color: listTab === t ? "#1570ef" : "#667085", background: "none", border: "none", borderBottom: listTab === t ? "2px solid #1570ef" : "2px solid transparent", marginBottom: -2, cursor: "pointer" }}>{t}</button>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "0 0 220px" }}>
                  <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={15} color="#98a2b3" /></div>
                  <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search" style={{ width: "100%", padding: "7px 12px 7px 32px", border: "1px solid #d0d5dd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <Dropdown label="Vehicle Type" options={TYPES} value={filterType} onChange={v => { setFilterType(v); setPage(1); }} />
                <Dropdown label="Vehicle Group" options={GROUPS} value={filterGroup} onChange={v => { setFilterGroup(v); setPage(1); }} />
                <Dropdown label="Vehicle Status" options={STATUSES} value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#667085" }}>{(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: "4px 8px", border: "1px solid #d0d5dd", borderRadius: 4, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1 }}><Icon name="chevronLeft" size={14} /></button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: "4px 8px", border: "1px solid #d0d5dd", borderRadius: 4, background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}><Icon name="chevronRight" size={14} /></button>
                  <button onClick={() => setShowColumnModal(true)} style={{ padding: "4px 8px", border: "1px solid #d0d5dd", borderRadius: 4, background: "#fff", cursor: "pointer" }}><Icon name="settings" size={14} /></button>
                </div>
              </div>

              {/* Table */}
              <div style={{ background: "#fff", border: "1px solid #e4e7ec", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ padding: "10px 12px", width: 32 }}><input type="checkbox" style={{ accentColor: "#1570ef" }} /></th>
                      <th style={{ width: 40 }} />
                      {visibleColumns.map(col => (
                        <th key={col} onClick={() => { if (sortField === col) setSortAsc(!sortAsc); else { setSortField(col); setSortAsc(true); } }} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#667085", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap" }}>
                          {col} {sortField === col && (sortAsc ? "▲" : "▼")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(v => (
                      <tr key={v.id} style={{ borderTop: "1px solid #f2f4f7", cursor: "pointer" }} onClick={() => { setSelectedVehicle(v); setView("detail"); }}>
                        <td style={{ padding: "10px 12px" }} onClick={e => e.stopPropagation()}><input type="checkbox" style={{ accentColor: "#1570ef" }} /></td>
                        <td style={{ padding: "10px 4px" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 4, background: "#f2f4f7", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="truck" size={16} color="#98a2b3" /></div>
                        </td>
                        {visibleColumns.map(col => {
                          const key = col === "Current Meter" ? "meter" : col === "License Plate" ? "plate" : col.toLowerCase();
                          const val = v[key];
                          if (col === "Status") return <td key={col} style={{ padding: "10px 12px" }}><StatusBadge status={val} /></td>;
                          if (col === "Name") return <td key={col} style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "#101828" }}>{val}</td>;
                          if (col === "Group") return <td key={col} style={{ padding: "10px 12px", fontSize: 13, color: "#344054" }}>{val} ↗</td>;
                          return <td key={col} style={{ padding: "10px 12px", fontSize: 13, color: "#344054" }}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {view === "detail" && selectedVehicle && (
            <VehicleDetail vehicle={selectedVehicle} onBack={() => setView("list")} />
          )}

          {view === "new" && (
            <NewVehicleForm onClose={() => setView("list")} onSave={() => {}} />
          )}

          {view === "addMultiple" && (
            <AddMultipleVehicles onClose={() => setView("list")} />
          )}

          {view === "import" && (
            <ImportModal onClose={() => setView("list")} />
          )}
        </div>
      </div>

      {showColumnModal && <ManageColumnsModal columns={visibleColumns} onSave={setVisibleColumns} onClose={() => setShowColumnModal(false)} />}
    </div>
  );
}
