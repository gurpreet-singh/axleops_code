import { useState, useMemo, useEffect, useCallback } from "react";

const T = {
  bg: "#f5f6f8", card: "#fff", ink: "#101828", ink2: "#344054", ink3: "#667085", ink4: "#98a2b3",
  bdr: "#e4e7ec", bdr2: "#f2f4f7", blue: "#1570ef", blueBg: "#eff8ff", blueTx: "#175cd3",
  green: "#12b76a", greenBg: "#ecfdf3", greenTx: "#027a48", red: "#f04438", redBg: "#fef3f2", redTx: "#b42318",
  amber: "#f79009", amberBg: "#fffaeb", amberTx: "#b54708", purple: "#7a5af8", purpleBg: "#f4f3ff", purpleTx: "#5925dc",
  teal: "#0e9384", tealBg: "#f0fdf9", tealTx: "#107569", coral: "#ef6820", coralBg: "#fff6ed", coralTx: "#b93815",
};
const F = "'DM Sans', system-ui, sans-serif";
const MN = "'JetBrains Mono', monospace";

const Badge = ({ children, c = "blue", s }) => {
  const m = { blue: [T.blueBg, T.blueTx], green: [T.greenBg, T.greenTx], red: [T.redBg, T.redTx], amber: [T.amberBg, T.amberTx], purple: [T.purpleBg, T.purpleTx], teal: [T.tealBg, T.tealTx], coral: [T.coralBg, T.coralTx], gray: [T.bdr2, T.ink3] };
  const [bg, fg] = m[c] || m.blue;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: s === "xs" ? "1px 6px" : "3px 10px", borderRadius: 6, fontSize: s === "xs" ? 8 : 10, fontWeight: 600, background: bg, color: fg, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>{children}</span>;
};
const Btn = ({ children, v = "default", sz = "md", onClick, style: st }) => {
  const base = { fontFamily: F, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 4, fontSize: sz === "sm" ? 11 : 13, padding: sz === "sm" ? "5px 12px" : "8px 16px" };
  const vs = { default: { background: T.card, color: T.ink2, border: "1px solid " + T.bdr }, primary: { background: T.blue, color: "#fff" }, success: { background: T.green, color: "#fff" }, ghost: { background: "transparent", color: T.ink3 } };
  return <button style={{ ...base, ...vs[v], ...st }} onClick={onClick}>{children}</button>;
};
const Metric = ({ label, value, sub, color }) => <div style={{ background: T.card, borderRadius: 8, border: "1px solid " + T.bdr, padding: "10px 14px", flex: 1, minWidth: 100 }}><div style={{ fontSize: 9, fontWeight: 700, color: T.ink4, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div><div style={{ fontSize: 20, fontWeight: 800, color: color || T.ink, lineHeight: 1.1 }}>{value}</div>{sub && <div style={{ fontSize: 9, color: T.ink4, marginTop: 3 }}>{sub}</div>}</div>;
const SL = ({ children }) => <div style={{ fontSize: 9, fontWeight: 700, color: T.ink4, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
const Bar = ({ v, mx, color }) => <div style={{ height: 5, background: T.bdr2, borderRadius: 3, overflow: "hidden", width: "100%" }}><div style={{ height: "100%", width: Math.min((v / mx) * 100, 100) + "%", background: color || T.blue, borderRadius: 3 }} /></div>;
const INR = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");

const vtColors = { "Multi-Axle Truck": "coral", "2-Axle Truck": "amber", "Container 40ft": "purple", LCV: "teal", Tanker: "red", "3-Axle Truck": "blue" };
const tmplColors = { Standard: "blue", Express: "teal", "Heavy Cargo": "purple", Hazmat: "red", "Multi-Drop": "coral" };
const riskColor = (r) => (r >= 7 ? T.red : r >= 4 ? T.amber : T.green);

const ROUTES = [
  { id: "RTE-0012", client: "Reliance Industries", route: "Mumbai \u2192 Delhi (JNPT)", via: "NH48 \u2192 NH44", sc: "MH\u2192DL", origin: "JNPT Navi Mumbai, Gate 3, Plot 12, Uran Road", originPin: "400707", dest: "Mathura Refinery, Loading Bay 4, NH-2 Junction", destPin: "281006", vType: "Multi-Axle Truck", dist: 1380, estTime: "22\u201326 hrs", toll: 8400, diesel: 300, kmpl: 3.2, trips: 87, tripsMtd: 18, contracts: 2, branch: "Global", template: "Standard", risk: 3.2, onTime: 88, avgMargin: 22, status: "Active", revenue: 4219500, avgProfit: 11200, loadInstr: "JNPT Gate 3. Present driver ID + vehicle RC at security. Loading Dock C preferred for Multi-Axle. Weigh-bridge on exit mandatory.", unloadInstr: "Mathura Refinery Loading Bay 4. Weigh-bridge mandatory before entry. Night unloading not permitted (gates close 9 PM). Safety induction for first-time drivers. POD must be signed by Warehouse Supervisor." },
  { id: "RTE-0013", client: "Tata Steel", route: "Mumbai \u2192 Delhi (Kalamboli)", via: "NH48 \u2192 NH44", sc: "MH\u2192DL", origin: "Kalamboli Steel Yard", originPin: "410218", dest: "Faridabad", destPin: "121003", vType: "Container 40ft", dist: 1420, estTime: "24\u201330 hrs", toll: 12200, diesel: 355, kmpl: 2.8, trips: 42, tripsMtd: 8, contracts: 1, branch: "Global", template: "Heavy Cargo", risk: 4.1, onTime: 82, avgMargin: 18, status: "Active", revenue: 1860000, avgProfit: 8400, loadInstr: "Steel coils require crane loading.", unloadInstr: "Faridabad yard. Weigh-bridge mandatory." },
  { id: "RTE-0014", client: "Reliance Industries", route: "Mumbai \u2192 Delhi", via: "NH48 \u2192 NH44", sc: "MH\u2192DL", origin: "JNPT Navi Mumbai", originPin: "400707", dest: "Mathura Refinery", destPin: "281006", vType: "2-Axle Truck", dist: 1380, estTime: "20\u201324 hrs", toll: 4850, diesel: 205, kmpl: 4.8, trips: 52, tripsMtd: 12, contracts: 1, branch: "Mumbai", template: "Standard", risk: 2.8, onTime: 91, avgMargin: 24, status: "Active", revenue: 2640000, avgProfit: 9800, loadInstr: "Standard loading bay.", unloadInstr: "Standard unloading." },
  { id: "RTE-0015", client: "Hindustan Unilever", route: "Mumbai \u2192 Pune", via: "Expressway", sc: "MH\u2192MH", origin: "HUL Andheri Plant", originPin: "400093", dest: "Pune DC Hadapsar", destPin: "411028", vType: "LCV", dist: 150, estTime: "3\u20134 hrs", toll: 420, diesel: 32, kmpl: 8.5, trips: 196, tripsMtd: 24, contracts: 2, branch: "Mumbai", template: "Express", risk: 1.4, onTime: 96, avgMargin: 28, status: "Active", revenue: 3920000, avgProfit: 6200, loadInstr: "HUL Andheri. Fast loading dock.", unloadInstr: "Pune DC. Scan delivery." },
  { id: "RTE-0016", client: "ITC Limited", route: "Delhi \u2192 Jaipur", via: "NH48", sc: "DL\u2192RJ", origin: "ITC Gurgaon Hub", originPin: "122001", dest: "Jaipur Central WH", destPin: "302017", vType: "3-Axle Truck", dist: 280, estTime: "5\u20136 hrs", toll: 2100, diesel: 63, kmpl: 4.4, trips: 64, tripsMtd: 12, contracts: 1, branch: "Delhi", template: "Standard", risk: 2.1, onTime: 94, avgMargin: 26, status: "Active", revenue: 1280000, avgProfit: 7600, loadInstr: "ITC Hub loading.", unloadInstr: "Jaipur WH." },
  { id: "RTE-0017", client: "Reliance Industries", route: "Mumbai \u2192 Ahmedabad", via: "NH48", sc: "MH\u2192GJ", origin: "JNPT Chemical Terminal", originPin: "400707", dest: "Ahmedabad Refinery", destPin: "382443", vType: "Tanker", dist: 530, estTime: "8\u201310 hrs", toll: 3200, diesel: 140, kmpl: 3.2, trips: 38, tripsMtd: 10, contracts: 1, branch: "Global", template: "Hazmat", risk: 6.8, onTime: 84, avgMargin: 16, status: "Active", revenue: 2280000, avgProfit: 5800, loadInstr: "Chemical terminal. Hazmat clearance required.", unloadInstr: "Ahmedabad Refinery. Safety induction mandatory." },
  { id: "RTE-0018", client: "Adani Ports", route: "Mumbai \u2192 Chennai", via: "NH48 \u2192 NH44", sc: "MH\u2192TN", origin: "Adani JNPT", originPin: "400707", dest: "Chennai Port Trust", destPin: "600001", vType: "Multi-Axle Truck", dist: 1340, estTime: "20\u201324 hrs", toll: 7800, diesel: 285, kmpl: 3.2, trips: 28, tripsMtd: 6, contracts: 1, branch: "Global", template: "Heavy Cargo", risk: 4.5, onTime: 80, avgMargin: 19, status: "Active", revenue: 1680000, avgProfit: 8100, loadInstr: "Adani JNPT. Container handling.", unloadInstr: "Chennai Port Trust gate." },
  { id: "RTE-ADH-1", client: "Asian Paints", route: "Mumbai \u2192 Indore", via: "NH48", sc: "MH\u2192MP", origin: "Andheri WH", originPin: "400053", dest: "Indore Depot", destPin: "452001", vType: "LCV", dist: 580, estTime: "10\u201312 hrs", toll: 2800, diesel: 110, kmpl: 5.2, trips: 2, tripsMtd: 2, contracts: 0, branch: "Mumbai", template: "Standard", risk: null, onTime: null, avgMargin: null, status: "Ad-hoc", revenue: 0, avgProfit: 0, isAdhoc: true, adhocTrips: 2, loadInstr: "", unloadInstr: "" },
];

const TOLL_PLAZAS = [
  { name: "JNPT to Panvel Toll", km: 25, hwy: "NH48", rate: 180 },
  { name: "Khopoli Toll", km: 65, hwy: "NH48", rate: 240 },
  { name: "Khalapur Toll Plaza", km: 84, hwy: "Expressway", rate: 320 },
  { name: "Talegaon Toll", km: 135, hwy: "NH48", rate: 280 },
  { name: "Nashik Toll Plaza", km: 260, hwy: "NH48", rate: 420 },
  { name: "Dhule Bypass Toll", km: 410, hwy: "NH48", rate: 380 },
  { name: "MP Border Toll", km: 520, hwy: "NH48", rate: 560, border: true, entering: "Madhya Pradesh" },
  { name: "Indore Bypass Toll", km: 640, hwy: "NH48", rate: 420 },
  { name: "UP Border Toll", km: 780, hwy: "NH44", rate: 480, border: true, entering: "Uttar Pradesh" },
  { name: "Gwalior Toll", km: 880, hwy: "NH44", rate: 480 },
  { name: "Agra Bypass Toll", km: 1020, hwy: "NH44", rate: 520 },
  { name: "Mathura Toll", km: 1080, hwy: "NH44", rate: 380 },
  { name: "Haryana Border Toll", km: 1180, hwy: "NH44", rate: 640, border: true, entering: "Haryana" },
  { name: "Delhi Entry (Badarpur)", km: 1320, hwy: "NH44", rate: 700 },
];

/* ═══ REUSABLE SLIDER COMPONENT ═══ */
const SliderPanel = ({ open, onClose, title, subtitle, badges, children, footer, width = "55%" }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.18)", zIndex: 50, transition: "opacity .2s" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width, maxWidth: "850px", minWidth: "440px",
        background: T.card, boxShadow: "-12px 0 48px rgba(0,0,0,.12)", zIndex: 100,
        display: "flex", flexDirection: "column",
        animation: "slideIn .2s ease-out",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        {/* Slider header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid " + T.bdr, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{title}</span>
              {badges}
            </div>
            {subtitle && <div style={{ fontSize: 11, color: T.ink4, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.ink4, padding: "4px 8px", borderRadius: 6 }}>&times;</button>
        </div>
        {/* Slider body */}
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
        {/* Slider footer */}
        {footer && <div style={{ padding: "12px 20px", borderTop: "1px solid " + T.bdr, display: "flex", gap: 8, flexShrink: 0 }}>{footer}</div>}
      </div>
    </>
  );
};

const SliderTabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: "1px solid " + T.bdr, padding: "0 20px", background: T.bg, position: "sticky", top: 0, zIndex: 5 }}>
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{
        fontFamily: F, fontSize: 11, fontWeight: 600, padding: "10px 14px", border: "none", cursor: "pointer",
        background: "transparent", color: active === t.id ? T.blue : T.ink3,
        borderBottom: active === t.id ? "2px solid " + T.blue : "2px solid transparent", whiteSpace: "nowrap",
      }}>{t.label}{t.count != null && <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 700, background: T.bdr2, color: T.ink4, padding: "1px 5px", borderRadius: 8 }}>{t.count}</span>}</button>
    ))}
  </div>
);

const SliderSection = ({ children }) => <div style={{ padding: "16px 20px" }}>{children}</div>;

const FieldRow = ({ label, value, mono, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid " + T.bdr2 }}>
    <span style={{ fontSize: 11, color: T.ink3 }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 600, fontFamily: mono ? MN : F, color: color || T.ink, textAlign: "right", maxWidth: "60%" }}>{value}</span>
  </div>
);

/* ═══ SLIDER CONTENT TABS ═══ */
const TabOverview = ({ rt }) => (
  <SliderSection>
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <Metric label="Total trips" value={rt.trips} />
      <Metric label="Revenue YTD" value={INR(rt.revenue)} color={T.blue} />
      <Metric label="Avg profit" value={INR(rt.avgProfit)} color={T.green} />
      <Metric label="On-time" value={rt.onTime ? rt.onTime + "%" : "\u2014"} color={rt.onTime >= 90 ? T.green : T.amber} />
    </div>

    <SL>Route operational data</SL>
    <FieldRow label="Client" value={rt.client} />
    <FieldRow label="Vehicle type" value={<Badge c={vtColors[rt.vType] || "gray"} s="xs">{rt.vType}</Badge>} />
    <FieldRow label="Origin" value={rt.origin} />
    <FieldRow label="Origin pincode" value={<span>{rt.originPin} <Badge c="amber" s="xs">EWB Dispatch PIN</Badge></span>} />
    <FieldRow label="Destination" value={rt.dest} />
    <FieldRow label="Dest pincode" value={<span>{rt.destPin} <Badge c="green" s="xs">EWB Delivery PIN</Badge></span>} />
    <FieldRow label="Distance" value={rt.dist + " km"} mono />
    <FieldRow label="Est. duration" value={rt.estTime} />
    <FieldRow label="Via highway" value={rt.via} />
    <FieldRow label="Toll estimate" value={INR(rt.toll) + " (" + TOLL_PLAZAS.length + " plazas \u00B7 FASTag)"} mono color={T.coral} />
    <FieldRow label="Diesel estimate" value={rt.diesel + "L (based on " + rt.kmpl + " kmpl)"} mono color={T.green} />
    <FieldRow label="Avg KMPL" value={rt.kmpl + " kmpl (from " + rt.trips + " trips)"} mono />

    {/* Expense benchmarks */}
    <div style={{ marginTop: 16 }}>
      <SL>Expense benchmarks (per trip)</SL>
      {[
        ["Diesel", INR(Math.round(rt.diesel * 89.6))],
        ["Toll (" + rt.vType + ")", INR(rt.toll)],
        ["Driver allowance", INR(2500)],
        ["Loading / Unloading", INR(1500)],
        ["Miscellaneous", INR(1200)],
      ].map(([l, v]) => <FieldRow key={l} label={l} value={v} mono />)}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 700 }}>
        <span style={{ fontSize: 12 }}>Total benchmark</span>
        <span style={{ fontSize: 13, fontFamily: MN, color: T.blue }}>{INR(Math.round(rt.diesel * 89.6) + rt.toll + 2500 + 1500 + 1200)}</span>
      </div>
    </div>

    {/* Risk score */}
    {rt.risk && (
      <div style={{ marginTop: 16, background: T.bg, borderRadius: 8, padding: "12px 14px" }}>
        <SL>Route risk score</SL>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: riskColor(rt.risk) }}>{rt.risk.toFixed(1)}</span>
          <div style={{ flex: 1 }}>
            <Bar v={rt.risk} mx={10} color={riskColor(rt.risk)} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: T.ink4, marginTop: 2 }}><span>Low 1</span><span>High 10</span></div>
          </div>
        </div>
        {[["SLA breach rate", "12%", T.amber], ["Damage rate", "3%", T.green], ["Road quality", "Good", T.green]].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 10 }}>
            <span style={{ color: T.ink3 }}>{l}</span><span style={{ fontWeight: 600, color: c }}>{v}</span>
          </div>
        ))}
      </div>
    )}

    {/* Instructions */}
    {rt.loadInstr && (
      <div style={{ marginTop: 16 }}>
        <SL>Loading instructions</SL>
        <div style={{ fontSize: 11, color: T.ink2, background: T.bg, borderRadius: 8, padding: "10px 12px", lineHeight: 1.5 }}>{rt.loadInstr}</div>
      </div>
    )}
    {rt.unloadInstr && (
      <div style={{ marginTop: 10 }}>
        <SL>Unloading instructions</SL>
        <div style={{ fontSize: 11, color: T.ink2, background: T.bg, borderRadius: 8, padding: "10px 12px", lineHeight: 1.5 }}>{rt.unloadInstr}</div>
      </div>
    )}
  </SliderSection>
);

const TabTollPlazas = ({ rt }) => {
  let cumulative = 0;
  return (
    <SliderSection>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div><SL>Toll plaza mapping</SL><span style={{ fontSize: 11, color: T.ink3 }}>{TOLL_PLAZAS.length} plazas &middot; {rt.vType} rates &middot; FASTag</span></div>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: MN, color: T.coral }}>{INR(rt.toll)}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>{["#", "Toll plaza", "Hwy", "KM", "Rate", "Cumul."].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: h === "#" || h === "KM" || h === "Rate" || h === "Cumul." ? "right" : "left", fontSize: 9, fontWeight: 700, color: T.ink4, textTransform: "uppercase", borderBottom: "1px solid " + T.bdr, background: T.bg }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {TOLL_PLAZAS.map((tp, i) => {
            cumulative += tp.rate;
            return (
              <tr key={i} style={{ background: i % 2 ? T.bdr2 + "60" : "transparent" }}>
                <td style={{ padding: "7px 8px", textAlign: "right", color: T.ink4, borderBottom: "1px solid " + T.bdr2 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px", fontWeight: 600, borderBottom: "1px solid " + T.bdr2 }}>
                  {tp.name}
                  {tp.border && <Badge c="amber" s="xs" style={{ marginLeft: 4 }}>{tp.entering}</Badge>}
                </td>
                <td style={{ padding: "7px 8px", color: T.ink3, borderBottom: "1px solid " + T.bdr2 }}>{tp.hwy}</td>
                <td style={{ padding: "7px 8px", fontFamily: MN, textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{tp.km}</td>
                <td style={{ padding: "7px 8px", fontFamily: MN, fontWeight: 600, textAlign: "right", color: T.coral, borderBottom: "1px solid " + T.bdr2 }}>{INR(tp.rate)}</td>
                <td style={{ padding: "7px 8px", fontFamily: MN, fontWeight: 700, textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{INR(cumulative)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Btn v="ghost" sz="sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>+ Add toll plaza</Btn>
    </SliderSection>
  );
};

const TabWorkflow = ({ rt }) => (
  <SliderSection>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div><SL>Assigned workflow template</SL><Badge c={tmplColors[rt.template]}>{rt.template}</Badge></div>
      <Btn sz="sm">Change template</Btn>
    </div>
    <div style={{ fontSize: 11, color: T.ink3, marginBottom: 14, lineHeight: 1.5 }}>
      {rt.template === "Standard" && "Default workflow. Optional weight verification. EWB auto if >\u20B950K. GPS every 60s."}
      {rt.template === "Heavy Cargo" && "Mandatory weight + seal at both ends. EWB always required. Manual settlement review."}
      {rt.template === "Hazmat" && "Maximum safety: GPS every 15s. Mandatory checkpoints every 200km. Full verification suite."}
      {rt.template === "Express" && "Fast turnaround. Skips AT_ORIGIN and UNLOADING. Minimal verification."}
    </div>
    <div style={{ background: T.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
      {[
        ["Pre-departure checklist", rt.template === "Express" ? "Disabled" : rt.template === "Standard" ? "Optional" : "Mandatory"],
        ["Weight verification (loading)", rt.template === "Express" ? "Disabled" : rt.template === "Standard" ? "Optional" : "Mandatory"],
        ["Seal number capture", rt.template === "Express" ? "Disabled" : rt.template === "Standard" ? "Optional" : "Mandatory"],
        ["E-Way Bill", rt.template === "Heavy Cargo" || rt.template === "Hazmat" ? "Always required" : "Auto (>\u20B950K)"],
        ["GPS tracking frequency", rt.template === "Hazmat" ? "Every 15s" : rt.template === "Standard" ? "Every 60s" : "Every 30s"],
        ["Checkpoints", rt.template === "Hazmat" ? "Every 200 km" : "Disabled"],
        ["Unloading verification", rt.template === "Express" ? "Skipped" : rt.template === "Standard" ? "Enabled" : "Mandatory"],
        ["POD min photos", rt.template === "Express" ? "1" : rt.template === "Standard" ? "2" : "4"],
        ["Auto-settlement", rt.template === "Standard" || rt.template === "Express" ? "Yes" : "Manual review"],
        ["Detention tracking", rt.template === "Express" ? "No" : "Yes"],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10 }}>
          <span style={{ color: T.ink3 }}>{k}</span>
          <span style={{ fontWeight: 600, color: v === "Mandatory" || v === "Always required" ? T.purple : v === "Disabled" || v === "Skipped" || v === "No" ? T.ink4 : T.ink }}>{v}</span>
        </div>
      ))}
    </div>
    <SL>Template resolution hierarchy</SL>
    {[
      { level: "1. Trip override", desc: "Dispatcher selects at trip creation", active: false },
      { level: "2. Route level", desc: rt.template + " \u2713", active: true },
      { level: "3. Contract fallback", desc: "If route has no template", active: false },
      { level: "4. Client default", desc: rt.client + " default", active: false },
      { level: "5. System default", desc: "Standard", active: false },
    ].map((h, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: h.active ? "6px 10px" : "6px 0", background: h.active ? T.blueBg : "transparent", borderRadius: h.active ? 6 : 0, marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: h.active ? T.blue : T.ink3, minWidth: 100 }}>{h.level}</span>
        <span style={{ fontSize: 10, color: h.active ? T.blueTx : T.ink4 }}>{h.desc}</span>
      </div>
    ))}
  </SliderSection>
);

const TabContracts = ({ rt }) => (
  <SliderSection>
    <div style={{ background: T.blueBg, border: "1px solid " + T.blueTx + "30", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 10, color: T.blueTx }}>
      Route contracts hold <strong>only financial data</strong>: billing type, rate, SLA, demurrage, payment terms. Operational data lives on the Route.
    </div>
    {[
      { id: "RC-2024-0017", type: "Per KM", rate: "\u20B934.15/km", sla: "26 hrs", margin: "18%", vol: "20 trips/mo", achieved: 14, demurrage: "\u20B9500/hr (4h free)", terms: "30 days", dates: "Jan 2024 \u2014 Open", renew: true },
      { id: "RC-2025-0003", type: "Per Trip", rate: "\u20B952,000/trip", sla: "24 hrs", margin: "20%", vol: "\u2014", achieved: null, demurrage: "\u20B9750/hr (6h free)", terms: "15 days", dates: "Apr 2025 \u2014 Mar 2026", expiring: true },
    ].map((c) => (
      <div key={c.id} style={{ border: "1px solid " + T.bdr, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: MN, fontSize: 12, fontWeight: 700, color: T.blue }}>{c.id}</span>
            <Badge c={c.type === "Per KM" ? "blue" : "purple"} s="xs">{c.type}</Badge>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: T.ink3 }}>{c.dates}</div>
            {c.renew && <Badge c="green" s="xs">Auto-renew</Badge>}
            {c.expiring && <Badge c="amber" s="xs">Expiring</Badge>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Rate", c.rate], ["SLA", c.sla], ["Min margin", c.margin], ["Volume", c.vol], ["Demurrage", c.demurrage], ["Payment", c.terms]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: 8, color: T.ink4, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 11, fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
        {c.achieved != null && (
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: T.ink3 }}>Volume achieved:</span>
            <span style={{ fontWeight: 700 }}>{c.achieved}</span>
            <div style={{ width: 60 }}><Bar v={c.achieved} mx={20} color={T.green} /></div>
            <span style={{ fontSize: 10, color: T.green }}>70%</span>
          </div>
        )}
      </div>
    ))}
    <Btn v="primary" sz="sm" style={{ width: "100%", justifyContent: "center" }}>+ New contract</Btn>

    <div style={{ marginTop: 16 }}>
      <SL>FK chain</SL>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Badge c="blue">Trip</Badge><span style={{ color: T.ink4 }}>\u2192</span>
        <Badge c="purple">Contract</Badge><span style={{ color: T.ink4 }}>\u2192</span>
        <Badge c="green">{rt.id}</Badge><span style={{ color: T.ink4 }}>\u2192</span>
        <Badge c="coral">{rt.client}</Badge>
      </div>
    </div>
  </SliderSection>
);

const TabPerformance = ({ rt }) => (
  <SliderSection>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <SL>Monthly trips (6 months)</SL>
        <div style={{ display: "flex", gap: 3, height: 80, alignItems: "flex-end" }}>
          {[12, 15, 18, 14, 20, 18].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: T.ink3, marginBottom: 2 }}>{v}</span>
              <div style={{ width: "70%", height: v * 3.5, background: i === 5 ? T.blue : T.blue + "50", borderRadius: "2px 2px 0 0" }} />
              <span style={{ fontSize: 7, color: T.ink4, marginTop: 2 }}>{["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SL>On-time trend</SL>
        <div style={{ display: "flex", gap: 3, height: 80, alignItems: "flex-end" }}>
          {[85, 88, 82, 90, 86, 88].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: v >= 85 ? T.green : T.amber, marginBottom: 2 }}>{v}%</span>
              <div style={{ width: "70%", height: (v - 70) * 4, background: v >= 85 ? T.green : T.amber, borderRadius: "2px 2px 0 0" }} />
              <span style={{ fontSize: 7, color: T.ink4, marginTop: 2 }}>{["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ marginTop: 16 }}>
      <SL>Estimate accuracy</SL>
      {[
        ["Transit time", "Est: " + rt.estTime, "Actual avg: 24.2 hrs", 92, T.green],
        ["Diesel", "Est: " + rt.diesel + "L", "Actual avg: 312L", 84, T.amber],
        ["Toll charges", "Est: " + INR(rt.toll), "Actual avg: " + INR(rt.toll - 20), 98, T.green],
      ].map(([label, est, actual, acc, color]) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>{label}</span>
            <span style={{ fontWeight: 700, color }}>{acc}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.ink4, marginBottom: 3 }}><span>{est}</span><span>{actual}</span></div>
          <Bar v={acc} mx={100} color={color} />
        </div>
      ))}
    </div>

    <div style={{ marginTop: 16 }}>
      <SL>Top exceptions</SL>
      {[["SLA breach", 8, T.red], ["Fuel anomaly", 5, T.amber], ["Route deviation", 3, T.amber], ["Loading delay", 2, T.ink3]].map(([type, count, color]) => (
        <div key={type} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <span style={{ flex: 1, fontSize: 11 }}>{type}</span>
          <div style={{ width: 50 }}><Bar v={count} mx={10} color={color} /></div>
          <span style={{ fontSize: 11, fontFamily: MN, fontWeight: 700, color, minWidth: 16 }}>{count}</span>
        </div>
      ))}
    </div>
  </SliderSection>
);

const TabTrips = ({ rt }) => (
  <SliderSection>
    <SL>Recent trips on this route</SL>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
      <thead>
        <tr>{["Trip", "Date", "Driver", "Actual time", "Diesel", "SLA", "Margin"].map(h => <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 9, fontWeight: 700, color: T.ink4, textTransform: "uppercase", borderBottom: "1px solid " + T.bdr, background: T.bg }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {[
          { id: "TRP-4821", date: "Mar 20", driver: "Rajesh K.", time: "24.2 hrs", diesel: "308L", sla: true, margin: "22%" },
          { id: "TRP-4815", date: "Mar 17", driver: "Vikram Y.", time: "25.8 hrs", diesel: "315L", sla: true, margin: "19%" },
          { id: "TRP-4808", date: "Mar 14", driver: "Amit S.", time: "28.1 hrs", diesel: "298L", sla: false, margin: "24%" },
          { id: "TRP-4801", date: "Mar 10", driver: "Rajesh K.", time: "23.5 hrs", diesel: "302L", sla: true, margin: "21%" },
          { id: "TRP-4795", date: "Mar 7", driver: "Sanjay P.", time: "26.4 hrs", diesel: "320L", sla: false, margin: "17%" },
        ].map((trip) => (
          <tr key={trip.id} style={{ cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = T.blueBg; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <td style={{ padding: "8px 8px", fontFamily: MN, fontWeight: 700, color: T.blue, borderBottom: "1px solid " + T.bdr2 }}>{trip.id}</td>
            <td style={{ padding: "8px 8px", borderBottom: "1px solid " + T.bdr2 }}>{trip.date}</td>
            <td style={{ padding: "8px 8px", borderBottom: "1px solid " + T.bdr2 }}>{trip.driver}</td>
            <td style={{ padding: "8px 8px", fontFamily: MN, borderBottom: "1px solid " + T.bdr2 }}>{trip.time}</td>
            <td style={{ padding: "8px 8px", fontFamily: MN, borderBottom: "1px solid " + T.bdr2 }}>{trip.diesel}</td>
            <td style={{ padding: "8px 8px", borderBottom: "1px solid " + T.bdr2 }}><Badge c={trip.sla ? "green" : "red"} s="xs">{trip.sla ? "Met" : "Breached"}</Badge></td>
            <td style={{ padding: "8px 8px", fontWeight: 700, color: parseInt(trip.margin) >= 20 ? T.green : T.amber, borderBottom: "1px solid " + T.bdr2 }}>{trip.margin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </SliderSection>
);

/* ═══ ROUTE SLIDER ═══ */
const RouteSlider = ({ route, onClose }) => {
  const [tab, setTab] = useState("overview");
  const rt = route;
  if (!rt) return null;

  return (
    <SliderPanel
      open={true}
      onClose={onClose}
      title={rt.route}
      subtitle={rt.via + " \u00B7 " + rt.dist + " km \u00B7 " + rt.branch}
      badges={
        <>
          <Badge c="blue" s="xs">{rt.client}</Badge>
          <Badge c={vtColors[rt.vType] || "gray"} s="xs">{rt.vType}</Badge>
          <Badge c={tmplColors[rt.template] || "gray"} s="xs">{rt.template}</Badge>
          <Badge c={rt.status === "Active" ? "green" : rt.status === "Ad-hoc" ? "amber" : "gray"} s="xs">{rt.status}</Badge>
        </>
      }
      footer={
        <>
          <Btn style={{ flex: 1 }}>Edit route</Btn>
          <Btn v="primary" style={{ flex: 2 }}>+ Add trip from this route</Btn>
        </>
      }
    >
      <SliderTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "tolls", label: "Toll plazas", count: TOLL_PLAZAS.length },
          { id: "template", label: "Workflow" },
          { id: "contracts", label: "Contracts", count: rt.contracts },
          { id: "performance", label: "Performance" },
          { id: "trips", label: "Trip history" },
        ]}
      />
      {tab === "overview" && <TabOverview rt={rt} />}
      {tab === "tolls" && <TabTollPlazas rt={rt} />}
      {tab === "template" && <TabWorkflow rt={rt} />}
      {tab === "contracts" && <TabContracts rt={rt} />}
      {tab === "performance" && <TabPerformance rt={rt} />}
      {tab === "trips" && <TabTrips rt={rt} />}
    </SliderPanel>
  );
};

/* ═══ MAIN APP ═══ */
export default function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [search, setSearch] = useState("");
  const [clientF, setClientF] = useState("all");
  const [vtF, setVtF] = useState("all");
  const [tmplF, setTmplF] = useState("all");
  const [sort, setSort] = useState({ key: "tripsMtd", dir: "desc" });

  const handleSort = (key) => setSort(p => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }));

  const filtered = useMemo(() => {
    let r = ROUTES.filter(rt =>
      (clientF === "all" || rt.client.includes(clientF)) &&
      (vtF === "all" || rt.vType === vtF) &&
      (tmplF === "all" || rt.template === tmplF) &&
      (search === "" || rt.route.toLowerCase().includes(search.toLowerCase()) || rt.client.toLowerCase().includes(search.toLowerCase()) || rt.id.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort.key) {
      r = [...r].sort((a, b) => {
        let va = a[sort.key], vb = b[sort.key];
        if (va == null) return 1; if (vb == null) return -1;
        if (typeof va === "string") return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        return sort.dir === "asc" ? va - vb : vb - va;
      });
    }
    return r;
  }, [search, clientF, vtF, tmplF, sort]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!selectedRoute) return;
    const idx = ROUTES.findIndex(r => r.id === selectedRoute.id);
    if (e.key === "ArrowDown" && idx < ROUTES.length - 1) { e.preventDefault(); setSelectedRoute(ROUTES[idx + 1]); }
    if (e.key === "ArrowUp" && idx > 0) { e.preventDefault(); setSelectedRoute(ROUTES[idx - 1]); }
  }, [selectedRoute]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const SortTH = ({ children, sk, right }) => {
    const active = sort.key === sk;
    return <th onClick={sk ? () => handleSort(sk) : undefined} style={{ padding: "8px 10px", textAlign: right ? "right" : "left", fontSize: 9, fontWeight: 700, color: active ? T.blue : T.ink4, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "1px solid " + T.bdr, background: T.bg, whiteSpace: "nowrap", cursor: sk ? "pointer" : "default", userSelect: "none", position: "sticky", top: 0 }}>{children}{sk && <span style={{ marginLeft: 2, opacity: active ? 1 : .3 }}>{active ? (sort.dir === "asc" ? "\u25B2" : "\u25BC") : "\u21C5"}</span>}</th>;
  };

  return (
    <div style={{ fontFamily: F, color: T.ink, background: T.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top nav */}
      <div style={{ background: T.card, borderBottom: "1px solid " + T.bdr, padding: "0 24px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.blue, padding: "12px 16px 12px 0", borderRight: "1px solid " + T.bdr, marginRight: 12 }}>TripFlow</div>
        <div style={{ fontWeight: 600, fontSize: 13, color: T.blue, padding: "12px 14px", borderBottom: "2px solid " + T.blue }}>Route management</div>
      </div>

      <div style={{ padding: "16px 20px", maxWidth: 1600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Route management</h2>
          <div style={{ display: "flex", gap: 8 }}><Btn>Export</Btn><Btn v="primary">+ Add route</Btn></div>
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Metric label="Total routes" value={ROUTES.length} />
          <Metric label="Active" value={ROUTES.filter(r => r.status === "Active").length} color={T.green} />
          <Metric label="Ad-hoc" value={ROUTES.filter(r => r.isAdhoc).length} sub="Pending calibration" color={T.amber} />
          <Metric label="High risk" value={ROUTES.filter(r => r.risk >= 5).length} sub="Score \u2265 5" color={T.red} />
          <Metric label="Avg on-time" value={Math.round(ROUTES.filter(r => r.onTime).reduce((s, r) => s + r.onTime, 0) / ROUTES.filter(r => r.onTime).length) + "%"} color={T.green} />
        </div>

        {/* Info banner */}
        <div style={{ background: T.blueBg, border: "1px solid " + T.blueTx + "30", borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontSize: 10, color: T.blueTx }}>
          <strong>Route = Client + Vehicle Type + Origin \u2192 Destination.</strong> Click any row to open route detail in the side panel. Use \u2191\u2193 arrow keys to navigate between routes.
        </div>

        {/* Filters */}
        <div style={{ background: T.card, borderRadius: "10px 10px 0 0", border: "1px solid " + T.bdr, borderBottom: "none", padding: "10px 14px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search routes..." style={{ fontFamily: F, fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid " + T.bdr, width: 170 }} />
          <select value={clientF} onChange={e => setClientF(e.target.value)} style={{ fontFamily: F, fontSize: 10, padding: "5px 8px", borderRadius: 8, border: "1px solid " + T.bdr }}><option value="all">Client \u25BE</option>{[...new Set(ROUTES.map(r => r.client))].sort().map(c => <option key={c} value={c}>{c}</option>)}</select>
          <select value={vtF} onChange={e => setVtF(e.target.value)} style={{ fontFamily: F, fontSize: 10, padding: "5px 8px", borderRadius: 8, border: "1px solid " + T.bdr }}><option value="all">Vehicle \u25BE</option>{[...new Set(ROUTES.map(r => r.vType))].sort().map(v => <option key={v} value={v}>{v}</option>)}</select>
          <select value={tmplF} onChange={e => setTmplF(e.target.value)} style={{ fontFamily: F, fontSize: 10, padding: "5px 8px", borderRadius: 8, border: "1px solid " + T.bdr }}><option value="all">Template \u25BE</option>{["Standard", "Express", "Heavy Cargo", "Hazmat"].map(t => <option key={t} value={t}>{t}</option>)}</select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: T.ink4 }}>{filtered.length} of {ROUTES.length} routes</span>
        </div>

        {/* Table */}
        <div style={{ background: T.card, borderRadius: "0 0 10px 10px", border: "1px solid " + T.bdr, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
              <thead>
                <tr>
                  <SortTH sk="client">Client</SortTH>
                  <SortTH sk="route">Route</SortTH>
                  <SortTH>Vehicle</SortTH>
                  <SortTH>Template</SortTH>
                  <SortTH sk="dist" right>Dist.</SortTH>
                  <SortTH>Est. time</SortTH>
                  <SortTH sk="toll" right>Toll</SortTH>
                  <SortTH right>Diesel</SortTH>
                  <SortTH sk="tripsMtd" right>Trips MTD</SortTH>
                  <SortTH sk="onTime" right>On-time</SortTH>
                  <SortTH sk="risk" right>Risk</SortTH>
                  <SortTH sk="avgMargin" right>Margin</SortTH>
                  <SortTH right>Contracts</SortTH>
                  <SortTH>Status</SortTH>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rt, idx) => {
                  const isSelected = selectedRoute && selectedRoute.id === rt.id;
                  return (
                    <tr key={rt.id} onClick={() => setSelectedRoute(rt)}
                      style={{ cursor: "pointer", background: isSelected ? T.blueBg : idx % 2 ? T.bdr2 + "40" : "transparent", transition: "background .08s" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bdr2; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = idx % 2 ? T.bdr2 + "40" : "transparent"; }}
                    >
                      <td style={{ padding: "9px 10px", fontSize: 12, fontWeight: 600, color: T.blue, borderBottom: "1px solid " + T.bdr2, borderLeft: isSelected ? "3px solid " + T.blue : "3px solid transparent" }}>{rt.client}</td>
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid " + T.bdr2 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: T.blue }}>{rt.route}</div>
                        <div style={{ fontSize: 8, color: T.ink4 }}>{rt.via} <Badge c="gray" s="xs">{rt.sc}</Badge></div>
                      </td>
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid " + T.bdr2 }}><Badge c={vtColors[rt.vType] || "gray"} s="xs">{rt.vType}</Badge></td>
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid " + T.bdr2 }}><Badge c={tmplColors[rt.template] || "gray"} s="xs">{rt.template}</Badge></td>
                      <td style={{ padding: "9px 10px", fontFamily: MN, fontSize: 11, fontWeight: 600, textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{rt.dist.toLocaleString()}</td>
                      <td style={{ padding: "9px 10px", fontSize: 11, color: T.ink3, borderBottom: "1px solid " + T.bdr2 }}>{rt.estTime}</td>
                      <td style={{ padding: "9px 10px", fontFamily: MN, fontSize: 11, fontWeight: 600, textAlign: "right", color: T.coral, borderBottom: "1px solid " + T.bdr2 }}>{INR(rt.toll)}</td>
                      <td style={{ padding: "9px 10px", fontSize: 11, fontWeight: 600, textAlign: "right", color: T.green, borderBottom: "1px solid " + T.bdr2 }}>{rt.diesel}L</td>
                      <td style={{ padding: "9px 10px", fontFamily: MN, fontSize: 12, fontWeight: 700, textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{rt.tripsMtd}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{rt.onTime != null ? <span style={{ fontSize: 11, fontWeight: 700, color: rt.onTime >= 90 ? T.green : rt.onTime >= 80 ? T.amber : T.red }}>{rt.onTime}%</span> : <span style={{ color: T.ink4 }}>\u2014</span>}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{rt.risk != null ? <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}><div style={{ width: 24 }}><Bar v={rt.risk} mx={10} color={riskColor(rt.risk)} /></div><span style={{ fontSize: 10, fontWeight: 700, color: riskColor(rt.risk) }}>{rt.risk.toFixed(1)}</span></div> : <span style={{ fontSize: 10, color: T.ink4 }}>N/A</span>}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", borderBottom: "1px solid " + T.bdr2 }}>{rt.avgMargin != null ? <span style={{ fontSize: 11, fontWeight: 700, color: rt.avgMargin >= 20 ? T.green : T.amber }}>{rt.avgMargin}%</span> : <span style={{ color: T.ink4 }}>\u2014</span>}</td>
                      <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, color: T.blue, borderBottom: "1px solid " + T.bdr2 }}>{rt.contracts}</td>
                      <td style={{ padding: "9px 10px", borderBottom: "1px solid " + T.bdr2 }}><Badge c={rt.status === "Active" ? "green" : "amber"} s="xs">{rt.status}</Badge>{rt.isAdhoc && <div style={{ fontSize: 8, color: T.amberTx }}>{rt.adhocTrips}/3</div>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SLIDER — opens on row click, closes on Escape or backdrop click */}
      {selectedRoute && (
        <RouteSlider route={selectedRoute} onClose={() => setSelectedRoute(null)} />
      )}
    </div>
  );
}
