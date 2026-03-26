import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════ */
const T = {
  bg: "#f5f6f8", card: "#fff", ink: "#101828", ink2: "#344054",
  ink3: "#667085", ink4: "#98a2b3", bdr: "#e4e7ec", bdr2: "#f2f4f7",
  blue: "#1570ef", blueBg: "#eff8ff", blueTx: "#175cd3",
  green: "#12b76a", greenBg: "#ecfdf3", greenTx: "#027a48",
  red: "#f04438", redBg: "#fef3f2", redTx: "#b42318",
  amber: "#f79009", amberBg: "#fffaeb", amberTx: "#b54708",
  purple: "#7a5af8", purpleBg: "#f4f3ff", purpleTx: "#5925dc",
  teal: "#0e9384", tealBg: "#f0fdf9", tealTx: "#107569",
  coral: "#ef6820", coralBg: "#fff6ed", coralTx: "#b93815",
};
const F = "'DM Sans', system-ui, sans-serif";
const MN = "'JetBrains Mono', monospace";

/* ═══════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════ */
const Badge = ({ children, c = "blue", s }) => {
  const colors = {
    blue: [T.blueBg, T.blueTx], green: [T.greenBg, T.greenTx],
    red: [T.redBg, T.redTx], amber: [T.amberBg, T.amberTx],
    purple: [T.purpleBg, T.purpleTx], teal: [T.tealBg, T.tealTx],
    coral: [T.coralBg, T.coralTx], gray: [T.bdr2, T.ink3],
  };
  const [bg, fg] = colors[c] || colors.blue;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: s === "xs" ? "1px 6px" : "3px 10px",
      borderRadius: 6, fontSize: s === "xs" ? 8 : 10,
      fontWeight: 600, background: bg, color: fg,
      textTransform: "uppercase", letterSpacing: ".04em",
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const Btn = ({ children, v = "default", sz = "md", onClick, style: customStyle }) => {
  const base = {
    fontFamily: F, fontWeight: 600, borderRadius: 8, cursor: "pointer",
    border: "none", display: "inline-flex", alignItems: "center", gap: 4,
    transition: "all .12s",
    fontSize: sz === "sm" ? 11 : 13,
    padding: sz === "sm" ? "5px 12px" : "8px 16px",
  };
  const variants = {
    default: { background: T.card, color: T.ink2, border: "1px solid " + T.bdr },
    primary: { background: T.blue, color: "#fff" },
    success: { background: T.green, color: "#fff" },
    danger: { background: T.red, color: "#fff" },
    ghost: { background: "transparent", color: T.ink3 },
  };
  return (
    <button style={{ ...base, ...variants[v], ...customStyle }} onClick={onClick}>
      {children}
    </button>
  );
};

const Card = ({ children, style: customStyle }) => (
  <div style={{
    background: T.card, borderRadius: 10,
    border: "1px solid " + T.bdr, padding: "16px 20px",
    ...customStyle,
  }}>{children}</div>
);

const Metric = ({ label, value, sub, color }) => (
  <div style={{
    background: T.card, borderRadius: 8, border: "1px solid " + T.bdr,
    padding: "10px 14px", flex: 1, minWidth: 105,
  }}>
    <div style={{ fontSize: 9, fontWeight: 700, color: T.ink4, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || T.ink, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: T.ink4, marginTop: 3 }}>{sub}</div>}
  </div>
);

const SL = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: T.ink4, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);

const ProgressBar = ({ value, max, color }) => (
  <div style={{ height: 4, background: T.bdr2, borderRadius: 2, overflow: "hidden", width: "100%" }}>
    <div style={{
      height: "100%", borderRadius: 2,
      width: Math.min((value / max) * 100, 100) + "%",
      background: color || T.blue,
    }} />
  </div>
);

const Avatar = ({ name, sz = 24 }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: "50%",
      background: "hsl(" + hue + ",50%,92%)",
      color: "hsl(" + hue + ",50%,35%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: sz * 0.36, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
const fmt = (s) => (s || "").replace(/_/g, " ");

const STATUS_COLOR_MAP = {
  DRAFT: "gray", CREATED: "gray", DISPATCHED: "blue", ACCEPTED: "teal",
  AT_ORIGIN: "teal", LOADING: "teal", LOADED: "teal", EWB_PENDING: "amber",
  DEPARTED: "amber", IN_TRANSIT: "amber", AT_CHECKPOINT: "amber",
  AT_DESTINATION: "purple", UNLOADING: "purple",
  DELIVERED: "blue", POD_SUBMITTED: "blue", POD_VERIFIED: "green",
  POD_DISPUTED: "red", SETTLED: "green", INVOICED: "green", CLOSED: "gray",
  VEHICLE_BREAKDOWN: "red", ACCIDENT: "red", LOAD_TRANSFER: "coral",
  DELIVERY_REJECTED: "red", EWB_EXPIRED: "red", CANCELLED: "gray",
  TRANSFERRED: "gray",
};
const statusColor = (s) => STATUS_COLOR_MAP[s] || "gray";

const EWB_COLOR_MAP = {
  NOT_REQUIRED: "gray", PENDING_GENERATION: "amber", GENERATED: "green",
  GENERATION_FAILED: "red", ACTIVE: "green", EXPIRING_SOON: "red",
  EXPIRED: "red", EXTENDED: "teal", CANCELLED: "gray",
};
const ewbColor = (s) => EWB_COLOR_MAP[s] || "gray";

const slaColor = (sla) => sla > 75 ? T.red : sla > 50 ? T.amber : T.green;

/* ═══════════════════════════════════════════════════════
   TRIP DATA
   ═══════════════════════════════════════════════════════ */
const TRIPS = [
  { id: "TRP-4826", client: "Tata Motors", route: "Chennai \u2192 Bangalore", vehicle: "TN01KL2345", driver: "Ravi Kumar", cargo: "15 MT Auto Parts", value: "\u20B97,80,000", status: "CREATED", ewb: "NOT_REQUIRED", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 0, eta: null, template: "Standard", sub: null, exc: false, scheduledStart: "Mar 22, 06:00", distance: "350 km" },
  { id: "TRP-4823", client: "Hindustan Unilever", route: "Delhi \u2192 Lucknow", vehicle: "DL01EF9012", driver: "Amit Singh", cargo: "22 MT FMCG", value: "\u20B95,60,000", status: "DISPATCHED", ewb: "NOT_REQUIRED", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 0, eta: null, template: "Standard", sub: "Awaiting accept (18m left)", exc: false, scheduledStart: "Mar 21, 14:00", distance: "550 km" },
  { id: "TRP-4822", client: "Tata Motors", route: "Pune \u2192 Chennai", vehicle: "MH12CD5678", driver: "Suresh Patil", cargo: "18 MT Auto Parts", value: "\u20B912,40,000", status: "LOADING", ewb: "PENDING_GENERATION", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 0, eta: null, template: "Heavy Cargo", sub: "Weight verification pending", exc: false, scheduledStart: "Mar 21, 10:00", distance: "1,180 km" },
  { id: "TRP-4829", client: "Reliance Industries", route: "Mumbai \u2192 Pune", vehicle: "MH04QR5678", driver: "Anil Verma", cargo: "30 MT Polymers", value: "\u20B918,00,000", status: "EWB_PENDING", ewb: "PENDING_GENERATION", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 0, eta: null, template: "Heavy Cargo", sub: "EWB generating...", exc: false, scheduledStart: "Mar 21, 11:00", distance: "150 km" },
  { id: "TRP-4821", client: "Reliance Industries", route: "Mumbai \u2192 Delhi", vehicle: "MH04AB1234", driver: "Rajesh Kumar", cargo: "28 MT FMCG", value: "\u20B98,50,000", status: "IN_TRANSIT", ewb: "ACTIVE", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 78, eta: "2h 15m", template: "Standard", sub: null, exc: false, scheduledStart: "Mar 20, 11:00", distance: "1,380 km" },
  { id: "TRP-4825", client: "Adani Ports", route: "Mundra \u2192 Delhi", vehicle: "GJ01IJ7890", driver: "Manoj Sharma", cargo: "40 MT Steel", value: "\u20B932,00,000", status: "IN_TRANSIT", ewb: "ACTIVE", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 45, eta: "8h 40m", template: "Heavy Cargo", sub: null, exc: false, scheduledStart: "Mar 20, 08:00", distance: "1,100 km" },
  { id: "TRP-4828", client: "Reliance Industries", route: "Jamnagar \u2192 Mumbai", vehicle: "GJ01OP1234", driver: "Sanjay Patel", cargo: "35 MT Petrochemicals", value: "\u20B924,00,000", status: "IN_TRANSIT", ewb: "EXPIRING_SOON", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 62, eta: "4h 20m", template: "Hazmat", sub: "EWB expires in 5h", exc: false, scheduledStart: "Mar 20, 06:00", distance: "680 km" },
  { id: "TRP-4830", client: "ITC Limited", route: "Mumbai \u2192 Hyderabad", vehicle: "MH04MN6789", driver: "Deepak Joshi", cargo: "20 MT FMCG", value: "\u20B96,40,000", status: "AT_DESTINATION", ewb: "ACTIVE", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 92, eta: null, template: "Standard", sub: "Unloading in progress", exc: false, scheduledStart: "Mar 19, 22:00", distance: "710 km" },
  { id: "TRP-4824", client: "Reliance Industries", route: "Mumbai \u2192 Ahmedabad", vehicle: "MH04GH3456", driver: "Vikram Yadav", cargo: "32 MT Chemicals", value: "\u20B918,00,000", status: "DELIVERED", ewb: "ACTIVE", pod: "AWAITING_SUBMISSION", inv: "NOT_ELIGIBLE", sla: 100, eta: null, template: "Heavy Cargo", sub: "POD pending submission", exc: false, scheduledStart: "Mar 19, 08:00", distance: "540 km" },
  { id: "TRP-4827", client: "Hindustan Unilever", route: "Mumbai \u2192 Hyderabad", vehicle: "MH04MN6789", driver: "Deepak Joshi", cargo: "25 MT FMCG", value: "\u20B99,20,000", status: "POD_VERIFIED", ewb: "ACTIVE", pod: "VERIFIED_CLEAN", inv: "ELIGIBLE", sla: 100, eta: null, template: "Standard", sub: "Ready for settlement", exc: false, scheduledStart: "Mar 18, 20:00", distance: "710 km" },
  { id: "TRP-4819", client: "Tata Motors", route: "Pune \u2192 Bangalore", vehicle: "MH12PQ2345", driver: "Kiran Desai", cargo: "20 MT Auto Parts", value: "\u20B914,00,000", status: "SETTLED", ewb: "ACTIVE", pod: "VERIFIED_WITH_REMARKS", inv: "INVOICED", sla: 100, eta: null, template: "Standard", sub: "Margin: 12.2%", exc: false, scheduledStart: "Mar 17, 06:00", distance: "840 km" },
  { id: "TRP-4831", client: "Adani Ports", route: "Mundra \u2192 Ahmedabad", vehicle: "GJ01AB5678", driver: "Ramesh Yadav", cargo: "25 MT Steel", value: "\u20B915,00,000", status: "VEHICLE_BREAKDOWN", ewb: "ACTIVE", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 65, eta: "Suspended", template: "Heavy Cargo", sub: "Breakdown near Rajkot. Mechanic dispatched.", exc: true, scheduledStart: "Mar 20, 14:00", distance: "320 km" },
  { id: "TRP-4820", client: "Tata Steel", route: "Mumbai \u2192 Pune", vehicle: "MH04ST1234", driver: "Ganesh M.", cargo: "18 MT Steel", value: "\u20B98,00,000", status: "CANCELLED", ewb: "CANCELLED", pod: "NOT_STARTED", inv: "NOT_ELIGIBLE", sla: 0, eta: null, template: "Standard", sub: "Client cancelled \u2014 order revision", exc: false, scheduledStart: "Mar 21, 06:00", distance: "150 km" },
];

/* ═══════════════════════════════════════════════════════
   KANBAN COLUMN CONFIG
   ═══════════════════════════════════════════════════════ */
const KANBAN_COLUMNS = [
  { key: "created", label: "Created", color: T.ink4, states: ["DRAFT", "CREATED"] },
  { key: "dispatched", label: "Dispatched", color: T.blue, states: ["DISPATCHED"] },
  { key: "loading", label: "Loading", color: T.teal, states: ["ACCEPTED", "AT_ORIGIN", "LOADING", "LOADED", "EWB_PENDING"] },
  { key: "transit", label: "In transit", color: T.amber, states: ["DEPARTED", "IN_TRANSIT", "AT_CHECKPOINT"] },
  { key: "dest", label: "At destination", color: T.purple, states: ["AT_DESTINATION", "UNLOADING"] },
  { key: "delivered", label: "Delivered", color: T.blue, states: ["DELIVERED", "POD_SUBMITTED"] },
  { key: "verified", label: "POD verified", color: T.green, states: ["POD_VERIFIED"] },
  { key: "settled", label: "Settled", color: T.green, states: ["SETTLED", "INVOICED"] },
  { key: "exceptions", label: "Exceptions", color: T.red, states: ["VEHICLE_BREAKDOWN", "ACCIDENT", "LOAD_TRANSFER", "DELIVERY_REJECTED", "EWB_EXPIRED"] },
  { key: "cancelled", label: "Cancelled", color: T.ink4, states: ["CANCELLED", "TRANSFERRED"] },
];

/* ═══════════════════════════════════════════════════════
   NEXT ACTIONS PER STATE
   ═══════════════════════════════════════════════════════ */
const NEXT_ACTIONS = {
  DRAFT: [["Complete & save", "primary"], ["Delete draft", "ghost"]],
  CREATED: [["Dispatch to driver", "primary"], ["Edit trip", "default"], ["Cancel", "ghost"]],
  DISPATCHED: [["Awaiting driver response...", "ghost"]],
  ACCEPTED: [["Mark arrived at origin", "primary"]],
  AT_ORIGIN: [["Start loading", "primary"]],
  LOADING: [["Complete loading", "success"], ["Record weight", "default"]],
  LOADED: [["Depart", "primary"]],
  EWB_PENDING: [["EWB generating...", "ghost"], ["Retry EWB", "default"]],
  DEPARTED: [["In transit (auto)", "ghost"]],
  IN_TRANSIT: [["Mark arrived at destination", "primary"], ["Report breakdown", "danger"], ["Report accident", "danger"]],
  AT_CHECKPOINT: [["Complete checkpoint", "primary"], ["Resume transit", "default"]],
  AT_DESTINATION: [["Start unloading", "primary"], ["Delivery rejected", "danger"]],
  UNLOADING: [["Complete unloading", "success"]],
  DELIVERED: [["Submit POD", "primary"]],
  POD_SUBMITTED: [["Verify POD (clean)", "success"], ["Verify with remarks", "default"], ["Reject POD", "danger"], ["Dispute", "ghost"]],
  POD_VERIFIED: [["Settle trip", "success"]],
  POD_DISPUTED: [["Resolve dispute", "primary"]],
  SETTLED: [["Include in invoice", "primary"]],
  VEHICLE_BREAKDOWN: [["Repaired \u2014 resume transit", "success"], ["Initiate load transfer", "danger"], ["Cancel trip", "ghost"]],
  ACCIDENT: [["File FIR + insurance claim", "danger"], ["Initiate load transfer", "danger"]],
  DELIVERY_REJECTED: [["Create return trip", "danger"], ["Accept partial delivery", "default"]],
};

/* ═══════════════════════════════════════════════════════
   SCREEN: BOARD VIEW (KANBAN)
   ═══════════════════════════════════════════════════════ */
const BoardView = ({ trips, onSelect }) => (
  <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, alignItems: "start" }}>
    {KANBAN_COLUMNS.map((col) => {
      const colTrips = trips.filter((t) => col.states.includes(t.status));
      const isExc = col.key === "exceptions";
      return (
        <div key={col.key} style={{
          minWidth: 195, width: 195, flexShrink: 0,
          background: isExc ? T.redBg + "30" : T.bg,
          borderRadius: 10, padding: "7px 5px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7, padding: "0 4px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: col.color }}>{col.label}</span>
            {colTrips.length > 0 && (
              <span style={{
                fontSize: 8, fontWeight: 700,
                background: isExc ? T.redBg : T.bdr2,
                color: isExc ? T.redTx : T.ink3,
                width: 16, height: 16, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>{colTrips.length}</span>
            )}
          </div>
          {colTrips.map((trip) => (
            <div key={trip.id} onClick={() => onSelect(trip)} style={{
              background: T.card, borderRadius: 8, padding: "8px 10px", marginBottom: 5,
              border: "1px solid " + (trip.exc ? T.red + "40" : T.bdr),
              cursor: "pointer", transition: "box-shadow .1s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,.07)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: MN, fontSize: 9, fontWeight: 700, color: T.blue }}>{trip.id}</span>
                <Badge c={statusColor(trip.status)} s="xs">{fmt(trip.status)}</Badge>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 1 }}>{trip.client}</div>
              <div style={{ fontSize: 9, color: T.ink3, marginBottom: 3 }}>{trip.route}</div>
              <div style={{ fontSize: 8, color: T.ink4, marginBottom: 2 }}>{trip.vehicle} &middot; {trip.cargo}</div>
              {trip.template !== "Standard" && <div style={{ marginBottom: 2 }}><Badge c={trip.template === "Hazmat" ? "red" : "purple"} s="xs">{trip.template}</Badge></div>}
              {trip.ewb !== "NOT_REQUIRED" && trip.ewb !== "ACTIVE" && <div style={{ marginBottom: 2 }}><Badge c={ewbColor(trip.ewb)} s="xs">EWB: {fmt(trip.ewb)}</Badge></div>}
              {trip.sla > 0 && trip.status !== "CANCELLED" && (
                <div style={{ marginTop: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 1 }}>
                    <span style={{ color: T.ink4 }}>SLA</span>
                    <span style={{ fontWeight: 700, color: slaColor(trip.sla) }}>{trip.sla}%</span>
                  </div>
                  <ProgressBar value={trip.sla} max={100} color={slaColor(trip.sla)} />
                  {trip.eta && <div style={{ fontSize: 8, color: T.ink4, marginTop: 1 }}>ETA: {trip.eta}</div>}
                </div>
              )}
              {trip.sub && <div style={{ fontSize: 8, color: trip.exc ? T.redTx : T.ink3, marginTop: 3, fontStyle: "italic" }}>{trip.sub}</div>}
              {trip.pod !== "NOT_STARTED" && <div style={{ marginTop: 2 }}><Badge c={trip.pod.includes("VERIFIED") ? "green" : "amber"} s="xs">POD: {fmt(trip.pod)}</Badge></div>}
            </div>
          ))}
          {colTrips.length === 0 && <div style={{ padding: 12, textAlign: "center", fontSize: 9, color: T.ink4 }}>No trips</div>}
        </div>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════
   SCREEN: LIST VIEW (TABLE)
   ═══════════════════════════════════════════════════════ */
const ListView = ({ trips, onSelect, sortState, onSort }) => {
  const TH = ({ children, right, sortKey }) => {
    const active = sortState.key === sortKey;
    return (
      <th onClick={sortKey ? () => onSort(sortKey) : undefined} style={{
        padding: "9px 12px", textAlign: right ? "right" : "left",
        fontSize: 9, fontWeight: 700, color: active ? T.blue : T.ink4,
        textTransform: "uppercase", letterSpacing: ".04em",
        borderBottom: "1px solid " + T.bdr, background: T.bg,
        whiteSpace: "nowrap", cursor: sortKey ? "pointer" : "default",
        userSelect: "none", position: "sticky", top: 0,
      }}>
        {children}
        {sortKey && <span style={{ marginLeft: 3, opacity: active ? 1 : 0.3 }}>{active ? (sortState.dir === "asc" ? " \u25B2" : " \u25BC") : " \u21C5"}</span>}
      </th>
    );
  };

  return (
    <div style={{ background: T.card, borderRadius: 10, border: "1px solid " + T.bdr, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
          <thead>
            <tr>
              <TH sortKey="id">Trip ID</TH>
              <TH sortKey="client">Client</TH>
              <TH>Route</TH>
              <TH>Vehicle / Driver</TH>
              <TH>Cargo</TH>
              <TH sortKey="template">Template</TH>
              <TH sortKey="status">Status</TH>
              <TH>EWB</TH>
              <TH>POD</TH>
              <TH sortKey="sla" right>SLA</TH>
              <TH>ETA</TH>
              <TH>Scheduled</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, idx) => (
              <tr key={trip.id}
                onClick={() => onSelect(trip)}
                style={{ cursor: "pointer", background: trip.exc ? T.redBg + "20" : idx % 2 ? T.bdr2 + "60" : "transparent", transition: "background .1s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.blueBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = trip.exc ? T.redBg + "20" : idx % 2 ? T.bdr2 + "60" : "transparent"; }}
              >
                <td style={{ padding: "10px 12px", fontFamily: MN, fontSize: 11, fontWeight: 700, color: T.blue, borderBottom: "1px solid " + T.bdr2, whiteSpace: "nowrap" }}>{trip.id}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, borderBottom: "1px solid " + T.bdr2 }}>{trip.client}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: T.ink2, borderBottom: "1px solid " + T.bdr2, whiteSpace: "nowrap" }}>{trip.route}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Avatar name={trip.driver} sz={22} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{trip.driver}</div>
                      <div style={{ fontSize: 9, color: T.ink4, fontFamily: MN }}>{trip.vehicle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 12px", fontSize: 11, color: T.ink3, borderBottom: "1px solid " + T.bdr2, whiteSpace: "nowrap" }}>{trip.cargo}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  <Badge c={trip.template === "Hazmat" ? "red" : trip.template === "Heavy Cargo" ? "purple" : trip.template === "Express" ? "teal" : trip.template === "Multi-Drop" ? "coral" : "gray"} s="xs">{trip.template}</Badge>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  <Badge c={statusColor(trip.status)} s="xs">{fmt(trip.status)}</Badge>
                  {trip.sub && <div style={{ fontSize: 8, color: T.ink4, marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trip.sub}</div>}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  <Badge c={ewbColor(trip.ewb)} s="xs">{fmt(trip.ewb)}</Badge>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  <Badge c={trip.pod.includes("VERIFIED") ? "green" : trip.pod === "NOT_STARTED" ? "gray" : "amber"} s="xs">{fmt(trip.pod)}</Badge>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2, textAlign: "right" }}>
                  {trip.sla > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <div style={{ width: 50 }}><ProgressBar value={trip.sla} max={100} color={slaColor(trip.sla)} /></div>
                      <span style={{ fontFamily: MN, fontSize: 10, fontWeight: 700, color: slaColor(trip.sla), minWidth: 28 }}>{trip.sla}%</span>
                    </div>
                  ) : <span style={{ fontSize: 10, color: T.ink4 }}>&mdash;</span>}
                </td>
                <td style={{ padding: "10px 12px", fontSize: 11, fontWeight: 600, borderBottom: "1px solid " + T.bdr2, whiteSpace: "nowrap" }}>{trip.eta || "\u2014"}</td>
                <td style={{ padding: "10px 12px", fontSize: 10, color: T.ink3, borderBottom: "1px solid " + T.bdr2, whiteSpace: "nowrap" }}>{trip.scheduledStart}</td>
                <td style={{ padding: "10px 12px", borderBottom: "1px solid " + T.bdr2 }}>
                  {(NEXT_ACTIONS[trip.status] || []).slice(0, 1).map(([label, variant], i) => (
                    <Btn key={i} v={variant} sz="sm" onClick={(e) => e.stopPropagation()}>{label.length > 18 ? label.slice(0, 18) + "..." : label}</Btn>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SCREEN: DISPATCH BOARD (BOARD + LIST TOGGLE)
   ═══════════════════════════════════════════════════════ */
const DispatchBoard = ({ onSelectTrip }) => {
  const [viewMode, setViewMode] = useState("board");
  const [clientFilter, setClientFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "id", dir: "desc" });

  const handleSort = (key) => {
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  const filtered = useMemo(() => {
    let result = TRIPS.filter((t) =>
      (clientFilter === "all" || t.client.includes(clientFilter)) &&
      (templateFilter === "all" || t.template === templateFilter) &&
      (statusFilter === "all" || t.status === statusFilter) &&
      (search === "" || t.id.toLowerCase().includes(search.toLowerCase()) || t.client.toLowerCase().includes(search.toLowerCase()) || t.route.toLowerCase().includes(search.toLowerCase()) || t.driver.toLowerCase().includes(search.toLowerCase()))
    );
    if (viewMode === "list" && sort.key) {
      result = [...result].sort((a, b) => {
        let va = a[sort.key];
        let vb = b[sort.key];
        if (typeof va === "string") return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        return sort.dir === "asc" ? (va || 0) - (vb || 0) : (vb || 0) - (va || 0);
      });
    }
    return result;
  }, [clientFilter, templateFilter, statusFilter, search, sort, viewMode]);

  const activeCount = TRIPS.filter((t) => !["CANCELLED", "CLOSED", "TRANSFERRED"].includes(t.status)).length;
  const transitCount = TRIPS.filter((t) => ["IN_TRANSIT", "DEPARTED"].includes(t.status)).length;
  const slaRisk = TRIPS.filter((t) => t.sla > 75 && t.sla < 100).length;
  const excCount = TRIPS.filter((t) => t.exc).length;
  const ewbExpiring = TRIPS.filter((t) => t.ewb === "EXPIRING_SOON").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: T.ink4 }}>Trip Management &rsaquo; Dispatch Board</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Dispatch board</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v={viewMode === "board" ? "primary" : "default"} sz="sm" onClick={() => setViewMode("board")}>Board</Btn>
          <Btn v={viewMode === "list" ? "primary" : "default"} sz="sm" onClick={() => setViewMode("list")}>List</Btn>
          <Btn>Export</Btn>
          <Btn v="primary">+ Add trip</Btn>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <Metric label="Active trips" value={activeCount} color={T.blue} />
        <Metric label="In transit" value={transitCount} sub="On the road" color={T.amber} />
        <Metric label="SLA at risk" value={slaRisk} sub="Needs attention" color={T.red} />
        <Metric label="Exceptions" value={excCount} sub="Active" color={T.red} />
        <Metric label="EWB expiring" value={ewbExpiring} sub="Within 6 hours" color={ewbExpiring > 0 ? T.red : T.green} />
        <Metric label="Delivered today" value="2" sub="POD pending: 1" color={T.green} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {viewMode === "list" && (
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search trips, clients, routes..." style={{
            fontFamily: F, fontSize: 11, padding: "5px 10px", borderRadius: 8,
            border: "1px solid " + T.bdr, width: 200,
          }} />
        )}
        <span style={{ fontSize: 10, fontWeight: 600, color: T.ink3 }}>CLIENT:</span>
        {["all", "Reliance", "Tata", "Hindustan", "Adani", "ITC"].map((c) => (
          <button key={c} onClick={() => setClientFilter(c)} style={{
            fontFamily: F, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 14,
            border: "1px solid " + (clientFilter === c ? T.blue : T.bdr),
            background: clientFilter === c ? T.blueBg : "transparent",
            color: clientFilter === c ? T.blueTx : T.ink3, cursor: "pointer",
          }}>{c === "all" ? "All" : c}</button>
        ))}
        <span style={{ color: T.bdr, margin: "0 2px" }}>|</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.ink3 }}>TEMPLATE:</span>
        {["all", "Standard", "Heavy Cargo", "Hazmat", "Express", "Multi-Drop"].map((tmpl) => (
          <button key={tmpl} onClick={() => setTemplateFilter(tmpl)} style={{
            fontFamily: F, fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 14,
            border: "1px solid " + (templateFilter === tmpl ? T.blue : T.bdr),
            background: templateFilter === tmpl ? T.blueBg : "transparent",
            color: templateFilter === tmpl ? T.blueTx : T.ink3, cursor: "pointer",
          }}>{tmpl === "all" ? "All" : tmpl}</button>
        ))}
        {viewMode === "list" && (
          <>
            <span style={{ color: T.bdr, margin: "0 2px" }}>|</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{
              fontFamily: F, fontSize: 10, padding: "4px 8px", borderRadius: 8,
              border: "1px solid " + T.bdr, color: T.ink2,
            }}>
              <option value="all">All statuses</option>
              {[...new Set(TRIPS.map((t) => t.status))].sort().map((s) => (
                <option key={s} value={s}>{fmt(s)}</option>
              ))}
            </select>
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: T.ink4 }}>{filtered.length} trips</span>
      </div>

      {/* View */}
      {viewMode === "board" ? (
        <BoardView trips={filtered} onSelect={onSelectTrip} />
      ) : (
        <ListView trips={filtered} onSelect={onSelectTrip} sortState={sort} onSort={handleSort} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SCREEN: TRIP DETAIL
   ═══════════════════════════════════════════════════════ */
const TripDetail = ({ trip, onBack }) => {
  const [tab, setTab] = useState("workflow");
  const t = trip || TRIPS[4];

  const timeline = [
    { state: "CREATED", time: "Mar 18, 08:15", actor: "Dispatch Ops", note: "Trip created. " + t.client + " \u2014 " + t.route, done: true },
    { state: "DISPATCHED", time: "08:20", actor: "Dispatch Ops", note: "Dispatched to " + t.driver + ". Accept deadline: 30 min.", done: true },
    { state: "ACCEPTED", time: "08:32", actor: t.driver, note: "Driver accepted. Pre-departure checklist initiated.", done: true },
    { state: "AT ORIGIN", time: "09:15", actor: "GPS Geofence", note: "Arrived at loading point. Detention timer started.", done: true },
    { state: "LOADING", time: "09:25", actor: "Warehouse", note: "Loading started. Dock #3 assigned.", done: true },
    { state: "LOADED", time: "10:50", actor: "Warehouse", note: "Loading complete. Weight: " + t.cargo + ". Seal: SL-2024-9981. Gate pass issued.", done: true },
    ...(t.ewb !== "NOT_REQUIRED" ? [{ state: "EWB GENERATED", time: "10:52", actor: "System (NIC API)", note: "E-Way Bill #281000485721 generated. Valid: Mar 18 10:52 \u2014 Mar 20 10:52 (48h).", done: true }] : []),
    { state: "DEPARTED", time: "11:02", actor: t.driver, note: "Vehicle departed. Odometer: 48,221 km. GPS tracking active. SLA timer started (26 hrs).", done: ["IN_TRANSIT", "AT_DESTINATION", "UNLOADING", "DELIVERED", "POD_SUBMITTED", "POD_VERIFIED", "SETTLED", "INVOICED"].includes(t.status) || t.exc },
    ...(["IN_TRANSIT", "AT_DESTINATION", "DELIVERED", "POD_VERIFIED", "SETTLED"].includes(t.status) ? [{ state: "IN TRANSIT", time: "11:05", actor: "GPS", note: "First GPS ping outside origin geofence. Speed: 45 km/h on NH48.", done: true }] : []),
    ...(["AT_DESTINATION", "DELIVERED", "POD_VERIFIED", "SETTLED"].includes(t.status) ? [{ state: "AT DESTINATION", time: "Mar 19, 14:28", actor: "GPS Geofence", note: "Arrived at destination. SLA: 27.4 hrs (within 26h deadline). Unloading started.", done: true }] : []),
    ...(["DELIVERED", "POD_VERIFIED", "SETTLED"].includes(t.status) ? [{ state: "DELIVERED", time: "15:45", actor: t.driver, note: "Unloading complete. Delivery confirmed. Odometer: 49,601 km. Actual distance: 1,380 km.", done: true }] : []),
    ...(["POD_SUBMITTED", "POD_VERIFIED", "SETTLED"].includes(t.status) ? [{ state: "POD SUBMITTED", time: "16:02", actor: t.driver + " (mobile)", note: "4 photos + signed LR + weight slip + receiver signature uploaded.", done: true }] : []),
    ...(["POD_VERIFIED", "SETTLED"].includes(t.status) ? [{ state: "POD VERIFIED", time: "18:30", actor: "Ops Manager", note: (t.pod === "VERIFIED_WITH_REMARKS" ? "Verified with remarks: minor shortage 0.3 MT noted." : "Verified clean. No issues.") + " Revenue recognized.", done: true }] : []),
    ...(["SETTLED"].includes(t.status) ? [{ state: "SETTLED", time: "Mar 20, 10:00", actor: "Finance (auto)", note: "Freight: \u20B938,500. Expenses: \u20B930,200. Deductions: \u20B93,600. Margin: 12.2% (\u20B94,700).", done: true }] : []),
    { state: fmt(t.status), time: "Current", actor: "\u2014", note: t.sub || "In progress", active: !["SETTLED", "INVOICED", "CLOSED", "CANCELLED"].includes(t.status) },
  ];

  const currentActions = NEXT_ACTIONS[t.status] || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.ink4, padding: 4 }}>&larr;</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MN, fontSize: 14, fontWeight: 800, color: T.blue }}>{t.id}</span>
            <Badge c={statusColor(t.status)}>{fmt(t.status)}</Badge>
            {t.template !== "Standard" && <Badge c={t.template === "Hazmat" ? "red" : t.template === "Heavy Cargo" ? "purple" : "teal"}>{t.template}</Badge>}
            <Badge c={ewbColor(t.ewb)} s="xs">EWB: {fmt(t.ewb)}</Badge>
            {t.pod !== "NOT_STARTED" && <Badge c={t.pod.includes("VERIFIED") ? "green" : "amber"} s="xs">POD: {fmt(t.pod)}</Badge>}
            {t.inv !== "NOT_ELIGIBLE" && <Badge c={t.inv === "INVOICED" || t.inv === "PAID" ? "green" : "amber"} s="xs">INV: {fmt(t.inv)}</Badge>}
          </div>
          <div style={{ fontSize: 11, color: T.ink4, marginTop: 3 }}>
            {t.client} &middot; {t.route} &middot; {t.cargo} &middot; {t.vehicle} &middot; {t.driver} &middot; {t.distance}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {currentActions.map(([label, variant], i) => (
            <Btn key={i} v={variant} sz="sm">{label}</Btn>
          ))}
        </div>
      </div>

      {/* Exception banner */}
      {t.exc && (
        <div style={{ background: T.redBg, border: "1.5px solid #fecdca", borderRadius: 10, padding: "12px 18px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.redTx }}>Active exception: {fmt(t.status)}</div>
          <div style={{ fontSize: 12, color: T.redTx, marginTop: 2 }}>{t.sub}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <Btn v="success" sz="sm">Resume (repaired)</Btn>
            <Btn v="danger" sz="sm">Initiate load transfer</Btn>
            <Btn sz="sm">Contact driver</Btn>
            <Btn sz="sm">Track GPS</Btn>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 1, borderBottom: "1px solid " + T.bdr, marginBottom: 14 }}>
        {[
          { id: "workflow", label: "Workflow timeline" },
          { id: "details", label: "Trip details" },
          { id: "subprocess", label: "Sub-processes" },
          { id: "exceptions", label: "Exceptions" },
        ].map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            fontFamily: F, fontSize: 12, fontWeight: 600, padding: "9px 16px",
            border: "none", cursor: "pointer", background: "transparent",
            color: tab === tb.id ? T.blue : T.ink3,
            borderBottom: tab === tb.id ? "2px solid " + T.blue : "2px solid transparent",
          }}>{tb.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "workflow" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 14 }}>
          <Card>
            <SL>State transition timeline (audit trail)</SL>
            <div style={{ position: "relative", paddingLeft: 26 }}>
              <div style={{ position: "absolute", left: 8, top: 4, bottom: 4, width: 2, background: T.bdr2 }} />
              {timeline.map((ev, i) => (
                <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                  <div style={{
                    position: "absolute", left: -26, top: 2, width: 16, height: 16, borderRadius: "50%",
                    background: ev.active ? T.blue : ev.done ? T.green : T.bdr2,
                    border: "2px solid " + (ev.active ? T.blue : ev.done ? T.green : T.bdr),
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {ev.done && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>{"\u2713"}</span>}
                    {ev.active && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: ev.active ? T.blue : T.ink }}>{ev.state}</span>
                        {ev.active && <Badge c="blue" s="xs">Current</Badge>}
                      </div>
                      <div style={{ fontSize: 10, color: T.ink3, marginTop: 2, lineHeight: 1.4 }}>{ev.note}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 10, color: T.ink4 }}>{ev.time}</div>
                      <div style={{ fontSize: 9, color: T.ink4 }}>by {ev.actor}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Card>
              <SL>SLA progress</SL>
              {t.sla > 0 ? (
                <div style={{ textAlign: "center", padding: "4px 0" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: MN, color: slaColor(t.sla) }}>{t.sla}%</div>
                  <div style={{ marginTop: 6 }}><ProgressBar value={t.sla} max={100} color={slaColor(t.sla)} /></div>
                  {t.eta && <div style={{ fontSize: 11, color: T.ink4, marginTop: 6 }}>ETA: {t.eta}</div>}
                  <div style={{ fontSize: 9, color: T.ink4, marginTop: 2 }}>SLA deadline: 26 hours from departure</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", fontSize: 11, color: T.ink4, padding: 12 }}>SLA timer not yet started</div>
              )}
            </Card>

            <Card>
              <SL>Parallel sub-processes</SL>
              {[
                ["E-Way Bill", t.ewb, ewbColor(t.ewb)],
                ["POD", t.pod, t.pod.includes("VERIFIED") ? "green" : t.pod === "NOT_STARTED" ? "gray" : "amber"],
                ["Invoice", t.inv, t.inv === "INVOICED" || t.inv === "PAID" ? "green" : t.inv === "ELIGIBLE" ? "amber" : "gray"],
              ].map(([label, status, color], i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0", borderBottom: i < 2 ? "1px solid " + T.bdr2 : "none",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
                  <Badge c={color} s="xs">{fmt(status)}</Badge>
                </div>
              ))}
            </Card>

            <Card>
              <SL>Next valid transitions</SL>
              {currentActions.length > 0 ? currentActions.map(([label, variant], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: variant === "primary" ? T.blue : variant === "success" ? T.green : variant === "danger" ? T.red : T.ink4,
                  }} />
                  <span style={{ fontSize: 11, flex: 1 }}>{label}</span>
                  <span style={{ fontSize: 8, fontFamily: MN, color: T.ink4 }}>{variant}</span>
                </div>
              )) : (
                <div style={{ fontSize: 11, color: T.ink4, textAlign: "center", padding: 12 }}>Terminal state &mdash; no transitions</div>
              )}
            </Card>

            <Card>
              <SL>Workflow template: {t.template}</SL>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <Badge c={t.template === "Hazmat" ? "red" : t.template === "Heavy Cargo" ? "purple" : t.template === "Express" ? "teal" : "blue"}>{t.template}</Badge>
              </div>
              <div style={{ fontSize: 10, color: T.ink3, lineHeight: 1.5 }}>
                {t.template === "Standard" && "Default workflow for FMCG and general cargo. Optional weight verification at loading. EWB auto-generated if consignment value exceeds \u20B950,000. GPS every 60 seconds. 2 minimum POD photos."}
                {t.template === "Heavy Cargo" && "Mandatory weight verification at loading AND unloading. Mandatory seal number capture. EWB always required regardless of value. 4 minimum POD photos. Weight slip mandatory. Manual settlement review."}
                {t.template === "Hazmat" && "Maximum safety protocol. GPS every 15 seconds. Mandatory checkpoint verification every 200 km. Full verification suite at both ends. Manual settlement review required."}
                {t.template === "Express" && "Fast turnaround workflow. Skips AT_ORIGIN and UNLOADING states. No weight verification. Minimum 1 POD photo. Auto-settlement enabled."}
                {t.template === "Multi-Drop" && "Multiple delivery points per trip. Per-drop POD collection (2 photos each). Trip DELIVERED only when all stops complete. Detention tracked per stop."}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card>
            <SL>Consignment details</SL>
            {[
              ["Client", t.client], ["Route", t.route], ["Distance", t.distance],
              ["Cargo", t.cargo], ["Consignment value", t.value],
              ["Vehicle", t.vehicle], ["Driver", t.driver],
              ["Workflow template", t.template], ["Scheduled start", t.scheduledStart],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid " + T.bdr2 }}>
                <span style={{ fontSize: 11, color: T.ink3 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </Card>
          <Card>
            <SL>Financial preview</SL>
            {[
              ["Contract freight rate", "\u20B942,800"],
              ["Fuel surcharge (est.)", "\u20B92,400"],
              ["Loading / unloading", "\u20B91,500"],
              ["Detention (est.)", "\u20B90"],
              ["Total estimated freight", "\u20B946,700"],
              ["", ""],
              ["Estimated expenses", "\u20B931,450"],
              ["Estimated margin", "32.6% (\u20B915,250)"],
            ].filter(([l]) => l).map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid " + T.bdr2 }}>
                <span style={{ fontSize: 11, color: T.ink3 }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: MN, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "subprocess" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[
            {
              title: "E-Way Bill", status: t.ewb, color: ewbColor(t.ewb),
              fields: [["Status", fmt(t.ewb)], ["EWB Number", t.ewb === "NOT_REQUIRED" ? "N/A" : "281000485721"], ["Valid from", t.ewb === "NOT_REQUIRED" ? "N/A" : "Mar 18, 10:52"], ["Valid until", t.ewb === "NOT_REQUIRED" ? "N/A" : "Mar 20, 10:52"], ["HSN Code", "9965"], ["Distance", t.distance]],
            },
            {
              title: "Proof of delivery", status: t.pod, color: t.pod.includes("VERIFIED") ? "green" : t.pod === "NOT_STARTED" ? "gray" : "amber",
              fields: [["Status", fmt(t.pod)], ["Photos", t.pod === "NOT_STARTED" ? "Pending" : "4 uploaded"], ["Signed LR", t.pod === "NOT_STARTED" ? "Pending" : "Uploaded"], ["Weight slip", t.pod === "NOT_STARTED" ? "Pending" : "Uploaded"], ["Receiver signature", t.pod === "NOT_STARTED" ? "Pending" : "Captured"], ["Receiver", t.pod === "NOT_STARTED" ? "Pending" : "Mukesh Verma"]],
            },
            {
              title: "Invoice", status: t.inv, color: t.inv === "INVOICED" || t.inv === "PAID" ? "green" : t.inv === "ELIGIBLE" ? "amber" : "gray",
              fields: [["Status", fmt(t.inv)], ["Eligible?", t.inv === "NOT_ELIGIBLE" ? "No \u2014 POD not verified" : "Yes"], ["Billing period", t.inv === "INVOICED" ? "May 1\u201315, 2024" : "\u2014"], ["Invoice #", t.inv === "INVOICED" ? "INV-2024-082" : "\u2014"], ["Amount", t.inv === "INVOICED" ? "\u20B950,504" : "\u2014"], ["GST", t.inv === "INVOICED" ? "\u20B97,704 (IGST 18%)" : "\u2014"]],
            },
          ].map((proc) => (
            <Card key={proc.title}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{proc.title}</span>
                <Badge c={proc.color}>{fmt(proc.status)}</Badge>
              </div>
              {proc.fields.map(([label, val], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < proc.fields.length - 1 ? "1px solid " + T.bdr2 : "none" }}>
                  <span style={{ fontSize: 10, color: T.ink3 }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {tab === "exceptions" && (
        <Card>
          <SL>Exception history for {t.id}</SL>
          {t.exc ? (
            <div style={{ background: T.redBg, borderRadius: 8, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.redTx, marginBottom: 4 }}>{fmt(t.status)}</div>
              <div style={{ fontSize: 12, color: T.redTx, lineHeight: 1.5 }}>{t.sub}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                <Badge c="red">Active</Badge>
                <Badge c="amber" s="xs">Awaiting resolution</Badge>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.ink4 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{"\u2705"}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.green }}>No exceptions</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>This trip has progressed through all states without any exceptions.</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SCREEN: WORKFLOW TEMPLATES
   ═══════════════════════════════════════════════════════ */
const WorkflowTemplates = () => {
  const templates = [
    {
      name: "Standard", desc: "Default workflow for FMCG, general cargo, and most shipments. Covers ~70% of all trips.",
      vehicles: 38, trips: "842 MTD",
      features: {
        "Pre-departure checklist": "Optional",
        "AT_ORIGIN state": "Enabled",
        "Weight verification (loading)": "Optional",
        "Seal number capture": "Optional",
        "E-Way Bill generation": "Auto (if >\u20B950K)",
        "GPS tracking frequency": "Every 60 seconds",
        "Intermediate checkpoints": "Disabled",
        "AT_DESTINATION state": "Enabled",
        "Unloading verification": "Enabled",
        "Weight verification (unloading)": "Optional",
        "POD \u2014 minimum photos": "2",
        "POD \u2014 weight slip": "Optional",
        "POD \u2014 receiver signature": "Mandatory",
        "Auto-settlement": "Yes (if no exceptions)",
        "Detention tracking": "Yes",
      },
    },
    {
      name: "Express", desc: "Fast turnaround for time-sensitive, low-value shipments. Skips verification steps.",
      vehicles: 8, trips: "124 MTD",
      features: {
        "Pre-departure checklist": "Disabled",
        "AT_ORIGIN state": "Skipped",
        "Weight verification (loading)": "Disabled",
        "Seal number capture": "Disabled",
        "E-Way Bill generation": "Auto (if >\u20B950K)",
        "GPS tracking frequency": "Every 30 seconds",
        "Intermediate checkpoints": "Disabled",
        "AT_DESTINATION state": "Skipped",
        "Unloading verification": "Skipped",
        "Weight verification (unloading)": "Disabled",
        "POD \u2014 minimum photos": "1",
        "POD \u2014 weight slip": "No",
        "POD \u2014 receiver signature": "Mandatory",
        "Auto-settlement": "Yes",
        "Detention tracking": "No",
      },
    },
    {
      name: "Heavy Cargo", desc: "Steel, machinery, bulk materials. Full verification at loading and unloading points.",
      vehicles: 15, trips: "186 MTD",
      features: {
        "Pre-departure checklist": "Mandatory",
        "AT_ORIGIN state": "Enabled",
        "Weight verification (loading)": "Mandatory",
        "Seal number capture": "Mandatory",
        "E-Way Bill generation": "Always required",
        "GPS tracking frequency": "Every 30 seconds",
        "Intermediate checkpoints": "Disabled",
        "AT_DESTINATION state": "Enabled",
        "Unloading verification": "Mandatory",
        "Weight verification (unloading)": "Mandatory",
        "POD \u2014 minimum photos": "4",
        "POD \u2014 weight slip": "Mandatory",
        "POD \u2014 receiver signature": "Mandatory",
        "Auto-settlement": "Manual review required",
        "Detention tracking": "Yes (strict)",
      },
    },
    {
      name: "Hazmat", desc: "Chemicals, petrochemicals, hazardous materials. Maximum safety and real-time monitoring.",
      vehicles: 4, trips: "28 MTD",
      features: {
        "Pre-departure checklist": "Mandatory",
        "AT_ORIGIN state": "Enabled",
        "Weight verification (loading)": "Mandatory",
        "Seal number capture": "Mandatory",
        "E-Way Bill generation": "Always required",
        "GPS tracking frequency": "Every 15 seconds",
        "Intermediate checkpoints": "Mandatory (every 200 km)",
        "AT_DESTINATION state": "Enabled",
        "Unloading verification": "Mandatory",
        "Weight verification (unloading)": "Mandatory",
        "POD \u2014 minimum photos": "4",
        "POD \u2014 weight slip": "Mandatory",
        "POD \u2014 receiver signature": "Mandatory + official stamp",
        "Auto-settlement": "Manual review required",
        "Detention tracking": "Yes (strict)",
      },
    },
    {
      name: "Multi-Drop", desc: "Multiple delivery points per trip. POD collected at each stop. Common for FMCG distribution.",
      vehicles: 12, trips: "96 MTD",
      features: {
        "Pre-departure checklist": "Optional",
        "AT_ORIGIN state": "Enabled",
        "Weight verification (loading)": "Disabled",
        "Seal number capture": "Optional",
        "E-Way Bill generation": "Auto (if >\u20B950K)",
        "GPS tracking frequency": "Every 30 seconds",
        "Intermediate checkpoints": "Enabled (per drop point)",
        "AT_DESTINATION state": "Enabled per drop",
        "Unloading verification": "Per drop point",
        "Weight verification (unloading)": "Disabled",
        "POD \u2014 minimum photos": "2 per drop point",
        "POD \u2014 weight slip": "No",
        "POD \u2014 receiver signature": "Mandatory per drop",
        "Auto-settlement": "After all drops complete",
        "Detention tracking": "Yes (per stop)",
      },
    },
  ];

  const featureColor = (val) => {
    if (val === "Mandatory" || val === "Always required" || val.startsWith("Mandatory")) return T.purple;
    if (val === "Disabled" || val === "Skipped" || val === "No") return T.ink4;
    if (val === "Optional") return T.ink2;
    return T.ink;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: T.ink4 }}>Trip Management &rsaquo; Workflow Templates</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Workflow templates</h2>
        </div>
        <Btn v="primary">+ Create template</Btn>
      </div>
      <p style={{ fontSize: 12, color: T.ink3, marginBottom: 16, marginTop: 0, maxWidth: 800 }}>
        Templates define which states and transitions are active for a trip. Each template enables or disables specific workflow steps
        (weight verification, checkpoints, EWB, POD requirements). Assign templates at the route or contract level. Override per-trip if needed.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {templates.map((tmpl) => (
          <Card key={tmpl.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{tmpl.name}</span>
                <Badge c="green" s="xs">Active</Badge>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: T.ink4 }}>{tmpl.vehicles} vehicles</div>
                <div style={{ fontSize: 10, color: T.ink4 }}>{tmpl.trips}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: T.ink3, marginBottom: 12, lineHeight: 1.4 }}>{tmpl.desc}</div>

            <div style={{ background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
              {Object.entries(tmpl.features).map(([key, val], idx) => (
                <div key={key} style={{
                  display: "flex", justifyContent: "space-between", padding: "3px 0",
                  fontSize: 10, borderBottom: idx < Object.keys(tmpl.features).length - 1 ? "1px solid " + T.bdr2 : "none",
                }}>
                  <span style={{ color: T.ink3 }}>{key}</span>
                  <span style={{ fontWeight: 600, color: featureColor(val) }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn sz="sm" style={{ flex: 1, justifyContent: "center" }}>Configure &rarr;</Btn>
              <Btn sz="sm" v="ghost">Duplicate</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("dispatch");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const nav = [
    { id: "dispatch", label: "Dispatch board" },
    { id: "detail", label: "Trip detail" },
    { id: "templates", label: "Workflow templates" },
  ];

  return (
    <div style={{ fontFamily: F, color: T.ink, background: T.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top navigation */}
      <div style={{
        background: T.card, borderBottom: "1px solid " + T.bdr,
        padding: "0 24px", display: "flex", alignItems: "center", gap: 6,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{
          fontWeight: 800, fontSize: 14, color: T.blue,
          padding: "12px 16px 12px 0", borderRight: "1px solid " + T.bdr, marginRight: 8,
        }}>TripFlow</div>
        <div style={{
          fontWeight: 600, fontSize: 13, color: T.ink3,
          padding: "12px 12px", borderRight: "1px solid " + T.bdr, marginRight: 4,
        }}>Trip Management</div>
        {nav.map((n) => (
          <button key={n.id} onClick={() => { setScreen(n.id); if (n.id !== "detail") setSelectedTrip(null); }} style={{
            fontFamily: F, fontSize: 13, fontWeight: 600, padding: "12px 14px",
            border: "none", cursor: "pointer", background: "transparent",
            color: screen === n.id ? T.blue : T.ink3,
            borderBottom: screen === n.id ? "2px solid " + T.blue : "2px solid transparent",
            whiteSpace: "nowrap",
          }}>{n.label}</button>
        ))}
      </div>

      {/* Page content */}
      <div style={{ padding: "16px 20px", maxWidth: 1600, margin: "0 auto" }}>
        {screen === "dispatch" && (
          <DispatchBoard onSelectTrip={(trip) => { setSelectedTrip(trip); setScreen("detail"); }} />
        )}
        {screen === "detail" && (
          <TripDetail trip={selectedTrip} onBack={() => { setScreen("dispatch"); setSelectedTrip(null); }} />
        )}
        {screen === "templates" && <WorkflowTemplates />}
      </div>
    </div>
  );
}
