import { useState } from "react";

const VEHICLES = [
  { id: "v1", reg: "MH04VW6256", type: "Multi-Axle Trailer", make: "BharatBenz", model: "1217C", year: 2023, meter: "1,50,004", status: "On Trip", health: 78, branch: "Mumbai", trip: "TRP-0142", driver: "Rajesh K.", servicesDue: 2, issuesOpen: 1, complianceOk: true, fuelEff: "4.8 kmpl" },
  { id: "v2", reg: "MH12EF9012", type: "Container 40ft", make: "Ashok Leyland", model: "4220", year: 2022, meter: "2,10,430", status: "On Trip", health: 85, branch: "Mumbai", trip: "TRP-0141", driver: "Anita V.", servicesDue: 1, issuesOpen: 0, complianceOk: true, fuelEff: "4.2 kmpl" },
  { id: "v3", reg: "MH04CD5678", type: "Multi-Axle Trailer", make: "Tata", model: "Signa 4825.T", year: 2021, meter: "2,85,112", status: "On Trip", health: 52, branch: "Mumbai", trip: "TRP-0140", driver: "Vikram S.", servicesDue: 3, issuesOpen: 2, complianceOk: false, fuelEff: "3.9 kmpl" },
  { id: "v4", reg: "MH04KL4567", type: "Multi-Axle Trailer", make: "BharatBenz", model: "2823C", year: 2020, meter: "3,42,890", status: "In Shop", health: 34, branch: "Mumbai", trip: null, driver: null, servicesDue: 0, issuesOpen: 3, complianceOk: true, fuelEff: "3.1 kmpl" },
  { id: "v5", reg: "MH04XY5500", type: "Container 20ft", make: "Eicher", model: "Pro 6049", year: 2023, meter: "48,200", status: "Idle", health: 88, branch: "Mumbai", trip: null, driver: null, servicesDue: 0, issuesOpen: 0, complianceOk: true, fuelEff: "5.4 kmpl" },
  { id: "v6", reg: "KA01AL2010", type: "Tanker 24KL", make: "Ashok Leyland", model: "U3518", year: 2022, meter: "1,92,400", status: "Idle", health: 71, branch: "Mumbai", trip: null, driver: null, servicesDue: 1, issuesOpen: 0, complianceOk: false, fuelEff: "3.6 kmpl" },
];

const SERVICES_DUE = [
  { task: "DEF Fluid Fill", interval: "Every 1 month / 4,000 km", nextDue: "4 weeks", lastDone: "05/06/2024", compliance: 100, status: "upcoming" },
  { task: "Engine Oil & Filter", interval: "Every 5 months / 45,000 km", nextDue: "5 months", lastDone: "05/02/2024", compliance: 100, status: "upcoming" },
  { task: "Tire Rotation", interval: "Every 10 months / 45,000 km", nextDue: "10 months", lastDone: "05/02/2024", compliance: 100, status: "upcoming" },
];

const SERVICE_HISTORY = [
  { wo: "#26", date: "05/06/2024", meter: "1,50,004 km", tasks: ["Engine Air Filter", "DEF Pump Filter", "DEF Fluid Fill"], total: "6,604" },
  { wo: "#25", date: "05/02/2024", meter: "1,49,716 km", tasks: ["Tire Rotation", "Engine Oil & Filter", "Engine Air Filter", "DEF Pump Filter"], total: "12,290" },
  { wo: "#24", date: "05/01/2024", meter: "1,49,454 km", tasks: ["Engine Coolant Drain", "Engine Oil & Filter"], total: "16,270" },
];

const ISSUES = [{ id: 1, title: "Oil leak", desc: "Oil leak appearing from the oil pan area", status: "Open", priority: "Medium", created: "May 10, 2024" }];

const TIRES = [
  { axle: "Front", pos: "LF", brand: "Milestar BS625", tread: 18, pressure: 110 },
  { axle: "Front", pos: "RF", brand: "Milestar BS625", tread: 16, pressure: 110 },
  { axle: "Rear 1", pos: "LR-O", brand: "Apollo EnduRace", tread: 22, pressure: 120 },
  { axle: "Rear 1", pos: "LR-I", brand: "Apollo EnduRace", tread: 21, pressure: 120 },
  { axle: "Rear 1", pos: "RR-I", brand: "Apollo EnduRace", tread: 20, pressure: 118 },
  { axle: "Rear 1", pos: "RR-O", brand: "Apollo EnduRace", tread: 22, pressure: 120 },
  { axle: "Rear 2", pos: "LR2-O", brand: "Apollo EnduRace", tread: 24, pressure: 120 },
  { axle: "Rear 2", pos: "LR2-I", brand: "Apollo EnduRace", tread: 23, pressure: 120 },
  { axle: "Rear 2", pos: "RR2-I", brand: "Apollo EnduRace", tread: 25, pressure: 120 },
  { axle: "Rear 2", pos: "RR2-O", brand: "Apollo EnduRace", tread: 24, pressure: 118 },
];

const FUEL = [
  { date: "May 09", vendor: "Indian Oil", vol: "144.9 L", total: "₹13,041", kmpl: 0.18 },
  { date: "May 08", vendor: "Indian Oil", vol: "141.9 L", total: "₹12,778", kmpl: 0.28 },
  { date: "May 03", vendor: "Indian Oil", vol: "150.3 L", total: "₹13,527", kmpl: 0.28 },
  { date: "Apr 28", vendor: "Bharat Petroleum", vol: "142.6 L", total: "₹12,841", kmpl: 0.27 },
];

const WARRANTIES = [
  { name: "Manufacturer (Bumper-to-Bumper)", provider: "BharatBenz", expiry: "15 Mar 2026", status: "Active" },
  { name: "Extended Powertrain", provider: "BharatBenz", expiry: "15 Mar 2028", status: "Upcoming" },
  { name: "Tyre Warranty", provider: "Apollo Tyres", expiry: "01 Feb 2025", status: "Expiring" },
];

const COMPLIANCE = [
  { type: "RTO Fitness", result: "Pass", nextDue: "Feb 20, 2025", status: "Current" },
  { type: "PUC", result: "Pass", nextDue: "Mar 05, 2026", status: "Current" },
  { type: "Safety Inspection", result: "Cond. Pass", nextDue: "Jun 10, 2024", status: "Overdue" },
];

const RECALLS = [
  { id: "24V-187", title: "Fuel Pump Assembly — Potential leak", status: "Action Required" },
  { id: "23V-541", title: "Rear Axle Nut — Completed Oct 2023", status: "Completed" },
];

// ── Helpers ──
const hc = h => h >= 80 ? "#059669" : h >= 50 ? "#D97706" : "#DC2626";
const sc = s => ({ "On Trip": "#2563EB", "In Shop": "#DC2626", Idle: "#94A3B8", Active: "#059669", Current: "#059669", Upcoming: "#2563EB", Expiring: "#D97706", Overdue: "#DC2626", "Action Required": "#DC2626", Completed: "#059669", Open: "#D97706" })[s] || "#6B7280";
const tc = d => d >= 20 ? "#059669" : d >= 10 ? "#D97706" : "#DC2626";

export default function VehicleModule() {
  const [page, setPage] = useState("fleet"); // fleet | profile | maintenance | operations | financials | compliance
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [slider, setSlider] = useState(null);
  const [sliderData, setSliderData] = useState(null);

  const v = selectedVehicle ? VEHICLES.find(x => x.id === selectedVehicle) : null;
  const openProfile = (id) => { setSelectedVehicle(id); setPage("profile"); };
  const openSlider = (type, data) => { setSlider(type); setSliderData(data); };
  const closeSlider = () => { setSlider(null); setSliderData(null); };

  // Breadcrumb
  const crumbs = [{ label: "Fleet Overview", action: () => { setPage("fleet"); setSelectedVehicle(null); } }];
  if (v && page !== "fleet") crumbs.push({ label: v.reg, action: () => setPage("profile") });
  if (["maintenance","operations","financials","compliance"].includes(page)) crumbs.push({ label: page.charAt(0).toUpperCase() + page.slice(1) });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F1F5F9", minHeight: "100vh" }}>
      {/* Top Header */}
      <div style={{ background: "#FFF", borderBottom: "1px solid #E2E8F0", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span style={{ color: "#CBD5E1" }}>›</span>}
              <span onClick={c.action} style={{ color: i === crumbs.length - 1 ? "#1E293B" : "#2563EB", fontWeight: i === crumbs.length - 1 ? 700 : 500, cursor: c.action ? "pointer" : "default" }}>{c.label}</span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6 }}>📍 Mumbai HQ</span>
          {page !== "fleet" && <button style={{ background: "#2563EB", color: "#FFF", border: "none", padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add ▾</button>}
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "24px 28px" }}>

        {/* ═══ FLEET OVERVIEW ═══ */}
        {page === "fleet" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", margin: 0 }}>Fleet Overview</h1>
            <button style={{ background: "#2563EB", color: "#FFF", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ Add Vehicle</button>
          </div>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              ["Total Vehicles", VEHICLES.length, "#2563EB", null],
              ["On Trip", VEHICLES.filter(x=>x.status==="On Trip").length, "#059669", null],
              ["In Shop", VEHICLES.filter(x=>x.status==="In Shop").length, "#DC2626", null],
              ["Idle", VEHICLES.filter(x=>x.status==="Idle").length, "#D97706", "Action needed"],
              ["Avg Health", Math.round(VEHICLES.reduce((a,x)=>a+x.health,0)/VEHICLES.length), "#2563EB", "/100"],
            ].map(([l,val,c,sub])=>(
              <div key={l} style={{ background: "#FFF", borderRadius: 10, border: "1px solid #E2E8F0", padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.4px" }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c, lineHeight: 1.1, marginTop: 4 }}>{val}{sub && <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 400 }}>{sub}</span>}</div>
              </div>
            ))}
          </div>
          {/* Vehicle Table */}
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0" }}>
                  {["VEHICLE", "TYPE", "STATUS", "HEALTH", "DRIVER", "BRANCH", "FUEL EFF", "ISSUES", "SERVICES DUE"].map(h=>(
                    <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94A3B8", padding: "12px 14px", letterSpacing: "0.3px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VEHICLES.map(veh=>(
                  <tr key={veh.id} onClick={()=>openProfile(veh.id)} style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background 0.1s" }}
                    onMouseOver={e=>e.currentTarget.style.background="#F8FAFC"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding: "14px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: "#1E293B" }}>{veh.reg}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{veh.year} {veh.make} {veh.model}</div>
                    </td>
                    <td style={{ padding: "14px", fontSize: 12, color: "#475569" }}>{veh.type}</td>
                    <td style={{ padding: "14px" }}><span style={{ fontSize: 11, fontWeight: 700, color: sc(veh.status), background: `${sc(veh.status)}12`, padding: "3px 10px", borderRadius: 6 }}>{veh.status}</span></td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", position: "relative" }}>
                          <svg viewBox="0 0 36 36" style={{ width: 32, height: 32, transform: "rotate(-90deg)" }}>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3"/>
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={hc(veh.health)} strokeWidth="3" strokeDasharray={`${veh.health} ${100-veh.health}`} strokeLinecap="round"/>
                          </svg>
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: hc(veh.health) }}>{veh.health}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontSize: 12, color: veh.driver ? "#475569" : "#CBD5E1" }}>{veh.driver || "Unassigned"}</td>
                    <td style={{ padding: "14px", fontSize: 12, color: "#475569" }}>{veh.branch}</td>
                    <td style={{ padding: "14px", fontSize: 12, fontWeight: 600, color: parseFloat(veh.fuelEff) >= 4.2 ? "#059669" : "#DC2626" }}>{veh.fuelEff}</td>
                    <td style={{ padding: "14px" }}>{veh.issuesOpen > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: 4 }}>{veh.issuesOpen}</span> : <span style={{ fontSize: 11, color: "#CBD5E1" }}>—</span>}</td>
                    <td style={{ padding: "14px" }}>{veh.servicesDue > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 8px", borderRadius: 4 }}>{veh.servicesDue}</span> : <span style={{ fontSize: 11, color: "#CBD5E1" }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* ═══ VEHICLE PROFILE ═══ */}
        {page === "profile" && v && (<>
          {/* Identity Header */}
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, background: "#EFF6FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🚛</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "monospace" }}>{v.reg}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc(v.status), background: `${sc(v.status)}12`, padding: "3px 10px", borderRadius: 6 }}>{v.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{v.year} {v.make} {v.model} · {v.type} · {v.meter} km · {v.branch}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Health Score */}
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 56, height: 56 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 56, height: 56, transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="2.5"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={hc(v.health)} strokeWidth="2.5" strokeDasharray={`${v.health} ${100-v.health}`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: hc(v.health) }}>{v.health}</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: hc(v.health), marginTop: 2 }}>Health</div>
              </div>
              <button style={{ padding: "8px 16px", background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✏ Edit</button>
            </div>
          </div>

          {/* 4 Navigation Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { id: "maintenance", icon: "🔧", label: "Maintenance & Health", stats: [`${v.servicesDue} services due`, `${v.issuesOpen} open issue${v.issuesOpen!==1?"s":""}`, `${WARRANTIES.filter(w=>w.status==="Active").length} active warranties`], color: "#D97706", alert: v.issuesOpen > 0 || v.servicesDue > 0 },
              { id: "operations", icon: "📊", label: "Operations & Tracking", stats: [`Fuel efficiency: ${v.fuelEff}`, `${FUEL.length} fuel entries recent`, `Last inspection: 2 days ago`], color: "#2563EB", alert: false },
              { id: "financials", icon: "💰", label: "Vehicle Financials", stats: ["Book value: ₹19,95,000", "EMI: ₹47,412/month", "TCO: ₹48,27,557"], color: "#059669", alert: false },
              { id: "compliance", icon: "🛡️", label: "Compliance & Documents", stats: [`${COMPLIANCE.filter(c=>c.status==="Current").length} docs current`, `${COMPLIANCE.filter(c=>c.status==="Overdue").length} overdue`, `${RECALLS.filter(r=>r.status==="Action Required").length} recall pending`], color: "#7C3AED", alert: COMPLIANCE.some(c=>c.status==="Overdue") || RECALLS.some(r=>r.status==="Action Required") },
            ].map(card=>(
              <div key={card.id} onClick={()=>setPage(card.id)}
                style={{ background: "#FFF", borderRadius: 12, border: `1px solid ${card.alert ? sc("Overdue")+"40" : "#E2E8F0"}`, padding: "20px", cursor: "pointer", transition: "all 0.15s", position: "relative", overflow: "hidden" }}
                onMouseOver={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.boxShadow="0 2px 8px rgba(37,99,235,0.1)"}}
                onMouseOut={e=>{e.currentTarget.style.borderColor=card.alert?sc("Overdue")+"40":"#E2E8F0";e.currentTarget.style.boxShadow="none"}}>
                {card.alert && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#DC2626" }}/>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{card.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>{card.label}</span>
                </div>
                {card.stats.map((s,i)=>(
                  <div key={i} style={{ fontSize: 12, color: "#64748B", padding: "3px 0" }}>{s}</div>
                ))}
                <div style={{ marginTop: 12, fontSize: 12, color: "#2563EB", fontWeight: 600 }}>View Details →</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: "20px 24px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Recent Activity</h3>
            {[
              { date: "May 10", icon: "⚠️", text: "Issue reported: Oil leak from oil pan", tag: "Issue", color: "#D97706" },
              { date: "May 09", icon: "⛽", text: "Fuel entry: 144.9L at Indian Oil — ₹13,041", tag: "Fuel", color: "#059669" },
              { date: "May 08", icon: "🔍", text: "Inspection by Eddie Johns — 19m 10s — Pass", tag: "Inspection", color: "#2563EB" },
              { date: "May 06", icon: "🔧", text: "Work Order #26 completed — ₹6,604", tag: "Service", color: "#7C3AED" },
              { date: "May 04", icon: "🔍", text: "Inspection by Rajesh Kumar — 15m 42s — Pass", tag: "Inspection", color: "#2563EB" },
            ].map((e,i)=>(
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 4 ? "1px solid #F8FAFC" : "none" }}>
                <span style={{ fontSize: 11, color: "#94A3B8", minWidth: 48, fontWeight: 500 }}>{e.date}</span>
                <span style={{ fontSize: 16 }}>{e.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: "#475569" }}>{e.text}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: e.color, background: `${e.color}12`, padding: "2px 8px", borderRadius: 4 }}>{e.tag}</span>
              </div>
            ))}
          </div>
        </>)}

        {/* ═══ MAINTENANCE ═══ */}
        {page === "maintenance" && v && (<>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>🔧 Maintenance & Health — {v.reg}</h2>
          {/* Action Required */}
          {(ISSUES.length > 0) && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>⚠ ACTION REQUIRED</div>
              {ISSUES.map(i=>(
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#1E293B" }}>Issue #{i.id}: {i.title} — {i.priority} Priority</span>
                  <button onClick={()=>openSlider("issue",i)} style={{ fontSize: 12, color: "#2563EB", background: "#FFF", border: "1px solid #E2E8F0", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>View & Create WO</button>
                </div>
              ))}
            </div>
          )}
          {/* Service Schedule */}
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Upcoming Service Schedule</h3>
              <span style={{ fontSize: 12, color: "#2563EB", cursor: "pointer", fontWeight: 600 }} onClick={()=>openSlider("serviceHistory",null)}>View Full History →</span>
            </div>
            {SERVICES_DUE.map(s=>(
              <div key={s.task} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}
                onClick={()=>openSlider("serviceTask",s)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}>{s.task}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{s.interval}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>Due: {s.nextDue}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>Last: {s.lastDone}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Tires */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Tire Status — 6×4</h3>
              {["Front", "Rear 1", "Rear 2"].map(axle=>(
                <div key={axle} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.3px", marginBottom: 6 }}>{axle.toUpperCase()}</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {TIRES.filter(t=>t.axle===axle).map(t=>(
                      <div key={t.pos} onClick={()=>openSlider("tire",t)}
                        style={{ width: 50, padding: "6px 4px", background: "#F8FAFC", borderRadius: 6, textAlign: "center", cursor: "pointer", border: "1px solid #E2E8F0", transition: "border-color 0.15s" }}
                        onMouseOver={e=>e.currentTarget.style.borderColor="#2563EB"} onMouseOut={e=>e.currentTarget.style.borderColor="#E2E8F0"}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B" }}>{t.pos}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: tc(t.tread) }}>{t.tread}</div>
                        <div style={{ fontSize: 8, color: "#94A3B8" }}>/32 in</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Warranties ({WARRANTIES.length})</h3>
                {WARRANTIES.map(w=>(
                  <div key={w.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}
                    onClick={()=>openSlider("warranty",w)}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{w.provider} · Exp: {w.expiry}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sc(w.status), background: `${sc(w.status)}12`, padding: "2px 8px", borderRadius: 4 }}>{w.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>)}

        {/* ═══ OPERATIONS ═══ */}
        {page === "operations" && v && (<>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>📊 Operations & Tracking — {v.reg}</h2>
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>⛽ Fuel History</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["DATE","VENDOR","VOLUME","TOTAL","KMPL"].map(h=>(
                <th key={h} style={{ textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94A3B8", padding: "0 10px 10px" }}>{h}</th>
              ))}</tr></thead>
              <tbody>{FUEL.map((f,i)=>(
                <tr key={i} style={{ borderBottom: "1px solid #F8FAFC", cursor: "pointer" }} onClick={()=>openSlider("fuel",f)}>
                  <td style={{ padding: "10px", fontSize: 13, color: "#475569" }}>{f.date}</td>
                  <td style={{ padding: "10px", fontSize: 13, color: "#2563EB" }}>{f.vendor}</td>
                  <td style={{ padding: "10px", fontSize: 13 }}>{f.vol}</td>
                  <td style={{ padding: "10px", fontSize: 13, fontWeight: 600 }}>{f.total}</td>
                  <td style={{ padding: "10px", fontSize: 13, fontWeight: 700, color: f.kmpl >= 0.28 ? "#059669" : "#DC2626" }}>{f.kmpl}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}

        {/* ═══ FINANCIALS ═══ */}
        {page === "financials" && v && (<>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>💰 Vehicle Financials — {v.reg}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {[["Purchase Price","₹28,50,000","#1E293B"],["Book Value","₹19,95,000","#D97706"],["Resale Est.","₹17,10,000","#059669"],["Total COO","₹48,27,557","#DC2626"]].map(([l,val,c])=>(
              <div key={l} style={{ background: "#FFF", borderRadius: 10, border: "1px solid #E2E8F0", padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* ═══ COMPLIANCE ═══ */}
        {page === "compliance" && v && (<>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>🛡️ Compliance & Documents — {v.reg}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {[["Current",COMPLIANCE.filter(c=>c.status==="Current").length,"#059669"],["Expiring Soon",0,"#D97706"],["Overdue",COMPLIANCE.filter(c=>c.status==="Overdue").length,"#DC2626"]].map(([l,val,c])=>(
              <div key={l} style={{ background: "#FFF", borderRadius: 10, border: `1px solid ${c}30`, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: c, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Documents</h3>
            {COMPLIANCE.map(d=>(
              <div key={d.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F8FAFC" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.type}</div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748B" }}>Due: {d.nextDue}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc(d.status), background: `${sc(d.status)}12`, padding: "2px 10px", borderRadius: 4 }}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#FFF", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Recalls & Campaigns</h3>
            {RECALLS.map(r=>(
              <div key={r.id} style={{ padding: 12, marginBottom: 8, borderRadius: 8, border: "1px solid", borderColor: r.status==="Action Required"?"#FECACA":"#D1FAE5", background: r.status==="Action Required"?"#FEF2F2":"#ECFDF5" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>#{r.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc(r.status) }}>{r.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{r.title}</div>
              </div>
            ))}
          </div>
        </>)}
      </div>

      {/* ═══ RIGHT SLIDER ═══ */}
      {slider && (<>
        <div onClick={closeSlider} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.12)", zIndex: 40 }}/>
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, background: "#FFF", boxShadow: "-4px 0 20px rgba(0,0,0,0.08)", zIndex: 50, overflowY: "auto", padding: 24, animation: "slideIn 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1E293B" }}>
              {slider==="serviceHistory"?"Service History":slider==="serviceTask"?sliderData?.task:slider==="tire"?`Tire: ${sliderData?.pos}`:slider==="warranty"?sliderData?.name:slider==="issue"?`Issue #${sliderData?.id}`:slider==="fuel"?"Fuel Entry":"Detail"}
            </h3>
            <button onClick={closeSlider} style={{ background: "#F1F5F9", border: "none", width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", fontWeight: 700, color: "#64748B" }}>✕</button>
          </div>
          {slider==="serviceHistory" && SERVICE_HISTORY.map(s=>(
            <div key={s.wo} style={{ padding: 14, marginBottom: 10, background: "#F8FAFC", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2563EB" }}>WO {s.wo}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>₹{s.total}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>{s.date} · {s.meter}</div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>{s.tasks.map(t=>(<span key={t} style={{ fontSize: 10, background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: 4 }}>{t}</span>))}</div>
            </div>
          ))}
          {slider==="tire" && sliderData && (
            <div>{[["Position",sliderData.pos],["Brand",sliderData.brand],["Tread Depth",`${sliderData.tread}/32 in`],["Pressure",`${sliderData.pressure} PSI`],["Condition",sliderData.tread>=20?"Good":sliderData.tread>=10?"Monitor":"Replace Soon"]].map(([k,v])=>(
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
                <span style={{ color: "#64748B" }}>{k}</span>
                <span style={{ fontWeight: 700, color: k==="Tread Depth"?tc(sliderData.tread):k==="Condition"?tc(sliderData.tread):"#1E293B" }}>{v}</span>
              </div>
            ))}</div>
          )}
          {slider==="warranty" && sliderData && (
            <div>{[["Provider",sliderData.provider],["Expiry",sliderData.expiry],["Status",sliderData.status]].map(([k,v])=>(
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
                <span style={{ color: "#64748B" }}>{k}</span>
                <span style={{ fontWeight: 600, color: k==="Status"?sc(v):"#1E293B" }}>{v}</span>
              </div>
            ))}</div>
          )}
          {slider==="issue" && sliderData && (
            <div>
              <div style={{ padding: 14, background: "#FEF3C7", borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>#{sliderData.id} — {sliderData.title}</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{sliderData.desc}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{sliderData.priority} · {sliderData.created}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, padding: 10, background: "#2563EB", color: "#FFF", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Create Work Order</button>
                <button style={{ flex: 1, padding: 10, background: "#F1F5F9", color: "#475569", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Close Issue</button>
              </div>
            </div>
          )}
          {slider==="fuel" && sliderData && (
            <div>{[["Date",sliderData.date],["Vendor",sliderData.vendor],["Volume",sliderData.vol],["Total",sliderData.total],["Fuel Economy",`${sliderData.kmpl} kmpl`]].map(([k,v])=>(
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
                <span style={{ color: "#64748B" }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#1E293B" }}>{v}</span>
              </div>
            ))}</div>
          )}
        </div>
      </>)}
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}
