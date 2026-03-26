import { useState } from "react";

/* ═══════ DESIGN TOKENS ═══════ */
const T = {
  bg: "#f5f6f8", card: "#fff", ink: "#101828", ink2: "#344054", ink3: "#667085", ink4: "#98a2b3",
  bdr: "#e4e7ec", bdr2: "#f2f4f7",
  blue: "#1570ef", blueBg: "#eff8ff", blueTx: "#175cd3",
  green: "#12b76a", greenBg: "#ecfdf3", greenTx: "#027a48",
  red: "#f04438", redBg: "#fef3f2", redTx: "#b42318",
  amber: "#f79009", amberBg: "#fffaeb", amberTx: "#b54708",
  purple: "#7a5af8", purpleBg: "#f4f3ff", purpleTx: "#5925dc",
  teal: "#0e9384", tealBg: "#f0fdf9", tealTx: "#107569",
  coral: "#ef6820", coralBg: "#fff6ed", coralTx: "#b93815",
};
const F = `'DM Sans', system-ui, sans-serif`;
const M = `'JetBrains Mono', monospace`;

/* ═══════ PRIMITIVES ═══════ */
const Badge = ({ children, c = "blue", s }) => {
  const m = { blue: [T.blueBg, T.blueTx], green: [T.greenBg, T.greenTx], red: [T.redBg, T.redTx], amber: [T.amberBg, T.amberTx], purple: [T.purpleBg, T.purpleTx], teal: [T.tealBg, T.tealTx], coral: [T.coralBg, T.coralTx], gray: [T.bdr2, T.ink3] };
  const [bg, fg] = m[c] || m.blue;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: s === "xs" ? "1px 8px" : "3px 10px", borderRadius: 6, fontSize: s === "xs" ? 10 : 11, fontWeight: 600, background: bg, color: fg, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap" }}>{children}</span>;
};

const Btn = ({ children, v = "default", sz = "md", onClick, style: st }) => {
  const base = { fontFamily: F, fontWeight: 600, borderRadius: 8, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 5, transition: "all .12s", fontSize: sz === "sm" ? 12 : 13, padding: sz === "sm" ? "5px 12px" : "8px 18px" };
  const vs = { default: { background: T.card, color: T.ink2, border: `1px solid ${T.bdr}` }, primary: { background: T.blue, color: "#fff" }, success: { background: T.green, color: "#fff" }, danger: { background: T.red, color: "#fff" }, ghost: { background: "transparent", color: T.ink3 } };
  return <button style={{ ...base, ...vs[v], ...st }} onClick={onClick}>{children}</button>;
};

const Card = ({ children, style: st, noPad }) => (
  <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.bdr}`, padding: noPad ? 0 : "18px 22px", ...st }}>{children}</div>
);

const Metric = ({ label, value, sub, color }) => (
  <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.bdr}`, padding: "14px 18px", flex: 1, minWidth: 130 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: T.ink4, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color: color || T.ink, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.ink4, marginTop: 4 }}>{sub}</div>}
  </div>
);

const TH = ({ children }) => <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: T.ink4, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: `1px solid ${T.bdr}`, background: T.bg, whiteSpace: "nowrap" }}>{children}</th>;
const TD = ({ children, mono, bold, color, right }) => <td style={{ padding: "12px 14px", fontSize: 13, fontFamily: mono ? M : F, fontWeight: bold ? 700 : 400, color: color || T.ink, borderBottom: `1px solid ${T.bdr2}`, textAlign: right ? "right" : "left" }}>{children}</td>;

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 1, borderBottom: `1px solid ${T.bdr}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)} style={{ fontFamily: F, fontSize: 13, fontWeight: 600, padding: "10px 18px", border: "none", cursor: "pointer", background: "transparent", color: active === t.id ? T.blue : T.ink3, borderBottom: active === t.id ? `2px solid ${T.blue}` : "2px solid transparent", transition: "all .12s" }}>
        {t.label}{t.count != null && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, background: active === t.id ? T.blueBg : T.bdr2, color: active === t.id ? T.blueTx : T.ink4, padding: "1px 6px", borderRadius: 10 }}>{t.count}</span>}
      </button>
    ))}
  </div>
);

const Avatar = ({ name, sz = 32 }) => {
  const i = name.split(" ").map(w => w[0]).join("").slice(0, 2);
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <div style={{ width: sz, height: sz, borderRadius: "50%", background: `hsl(${h},50%,92%)`, color: `hsl(${h},50%,35%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * .36, fontWeight: 700, flexShrink: 0 }}>{i}</div>;
};

const SLA = ({ label }) => <div style={{ fontSize: 10, fontWeight: 700, color: T.ink4, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>;

const Bar = ({ v, mx, color }) => (
  <div style={{ height: 5, background: T.bdr2, borderRadius: 3, overflow: "hidden", width: "100%" }}>
    <div style={{ height: "100%", width: `${Math.min((v / mx) * 100, 100)}%`, background: color || T.blue, borderRadius: 3, transition: "width .5s" }} />
  </div>
);

/* ═══════ DATA ═══════ */
const CLIENTS = [
  { id: "CLT-001", name: "Reliance Industries", trade: "Reliance", industry: "Petrochemicals", contractType: "Per KM", rate: "₹34.15/km", trips: 42, revMTD: "₹5,24,300", outstanding: "₹1,45,000", creditLimit: "₹10,00,000", creditUsed: 14.5, status: "Active", am: "Priya Menon", pan: "AAACR5055K", gstin: "27AAACR5055K1ZK", branches: 4, contracts: 2, creditDays: 30, billingCycle: "Fortnightly" },
  { id: "CLT-002", name: "Tata Steel", trade: "Tata Steel", industry: "Steel & Metals", contractType: "Per Trip", rate: "₹48,000/trip", trips: 28, revMTD: "₹3,84,000", outstanding: "₹0", creditLimit: "₹8,00,000", creditUsed: 0, status: "Active", am: "Rahul Gupta", pan: "AABCT1234D", gstin: "27AABCT1234D1ZK", branches: 2, contracts: 1, creditDays: 21, billingCycle: "Monthly" },
  { id: "CLT-003", name: "Hindustan Unilever", trade: "HUL", industry: "FMCG", contractType: "Per KM", rate: "₹28.50/km", trips: 56, revMTD: "₹4,12,800", outstanding: "₹87,800", creditLimit: "₹12,00,000", creditUsed: 7.3, status: "Active", am: "Priya Menon", pan: "AAACH1234A", gstin: "27AAACH1234A1ZZ", branches: 6, contracts: 3, creditDays: 45, billingCycle: "Monthly" },
  { id: "CLT-004", name: "ITC Limited", trade: "ITC", industry: "FMCG", contractType: "Per Tonne", rate: "₹1,200/MT", trips: 34, revMTD: "₹2,88,000", outstanding: "₹0", creditLimit: "₹5,00,000", creditUsed: 0, status: "Active", am: "Vikram Singh", pan: "AAACI5678B", gstin: "36AAACI5678B1ZP", branches: 3, contracts: 1, creditDays: 30, billingCycle: "Monthly" },
  { id: "CLT-005", name: "Adani Ports", trade: "Adani Ports", industry: "Infrastructure", contractType: "Per Trip", rate: "₹72,000/trip", trips: 15, revMTD: "₹1,80,000", outstanding: "₹2,00,000", creditLimit: "₹6,00,000", creditUsed: 33.3, status: "Active", am: "Rahul Gupta", pan: "AABCA5678F", gstin: "24AABCA5678F1ZH", branches: 2, contracts: 1, creditDays: 30, billingCycle: "Fortnightly" },
  { id: "CLT-006", name: "Mahindra Logistics", trade: "Mahindra Log", industry: "3PL", contractType: "Per KM", rate: "₹32.00/km", trips: 22, revMTD: "₹1,56,100", outstanding: "₹0", creditLimit: "₹4,00,000", creditUsed: 0, status: "Active", am: "Priya Menon", pan: "AAACM9012G", gstin: "27AAACM9012G1ZQ", branches: 2, contracts: 1, creditDays: 30, billingCycle: "Monthly" },
  { id: "CLT-007", name: "Asian Paints", trade: "Asian Paints", industry: "Chemicals", contractType: "Per Trip", rate: "₹35,000/trip", trips: 8, revMTD: "₹0", outstanding: "₹0", creditLimit: "₹3,00,000", creditUsed: 0, status: "Inactive", am: "Vikram Singh", pan: "AAACA3456H", gstin: "27AAACA3456H1ZR", branches: 1, contracts: 0, creditDays: 30, billingCycle: "Monthly" },
];

const INVOICES = [
  { id: "INV-2024-082", client: "Reliance Industries", branch: "Mumbai HQ", period: "May 1-15, 2024", trips: 8, base: 388000, gst: 69840, total: 457840, due: "Jun 14, 2024", status: "Sent", gstin: "27AAACR5055K1ZK", gstType: "IGST" },
  { id: "INV-2024-081", client: "Hindustan Unilever", branch: "Delhi Branch", period: "May 1-15, 2024", trips: 12, base: 216000, gst: 38880, total: 254880, due: "Jun 14, 2024", status: "Pending", gstin: "07AAACH1234A1ZZ", gstType: "IGST" },
  { id: "INV-2024-078", client: "Reliance Industries", branch: "Jamnagar Refinery", period: "Apr 16-30, 2024", trips: 10, base: 284500, gst: 51210, total: 335710, due: "May 30, 2024", status: "Overdue", gstin: "24AAACR5055K1ZK", gstType: "IGST" },
  { id: "INV-2024-075", client: "Tata Steel", branch: "Pune Plant", period: "Apr 16-30, 2024", trips: 6, base: 288000, gst: 51840, total: 339840, due: "May 30, 2024", status: "Paid", gstin: "27AABCT1234D1ZK", gstType: "CGST+SGST" },
  { id: "INV-2024-072", client: "ITC Limited", branch: "Hyderabad DC", period: "Apr 1-15, 2024", trips: 8, base: 192000, gst: 34560, total: 226560, due: "May 15, 2024", status: "Paid", gstin: "36AAACI5678B1ZP", gstType: "IGST" },
  { id: "INV-2024-069", client: "Adani Ports", branch: "Mundra Port", period: "Apr 1-15, 2024", trips: 5, base: 360000, gst: 64800, total: 424800, due: "May 15, 2024", status: "Overdue", gstin: "24AABCA5678F1ZH", gstType: "IGST" },
];

const SETTLEMENTS = [
  { trip: "TRP-4824", client: "Reliance Industries", route: "Mumbai → Ahmedabad", rateType: "Per KM", rate: "₹34.15 × 540 km", contract: 42800, expenses: 31450, deductions: 0, netRecv: 42800, vendorPay: 31450, margin: 26.5, marginAmt: 11350, status: "Ready", sla: "on_time" },
  { trip: "TRP-4827", client: "Hindustan Unilever", route: "Mumbai → Hyderabad", rateType: "Per KM", rate: "₹28.50 × 780 km", contract: 55200, expenses: 41600, deductions: 0, netRecv: 55200, vendorPay: 41600, margin: 24.6, marginAmt: 13600, status: "Ready", sla: "on_time" },
  { trip: "TRP-4819", client: "Reliance Industries", route: "Mumbai → Nagpur", rateType: "Per KM", rate: "₹34.15 × 820 km", contract: 38500, expenses: 30200, deductions: 3600, netRecv: 34900, vendorPay: 30200, margin: 12.2, marginAmt: 4700, status: "Disputed", sla: "breached" },
  { trip: "TRP-4820", client: "Tata Steel", route: "Mumbai → Pune", rateType: "Per Trip", rate: "₹18,200 flat", contract: 18200, expenses: 13800, deductions: 0, netRecv: 18200, vendorPay: 13800, margin: 24.2, marginAmt: 4400, status: "Ready", sla: "on_time" },
  { trip: "TRP-4821", client: "Reliance Industries", route: "Mumbai → Delhi", rateType: "Per KM", rate: "₹34.15 × 1380 km", contract: 48500, expenses: 36100, deductions: null, netRecv: null, vendorPay: null, margin: null, marginAmt: null, status: "In Transit", sla: null },
  { trip: "TRP-4825", client: "Adani Ports", route: "Mundra → Delhi", rateType: "Per Trip", rate: "₹62,000 flat", contract: 62000, expenses: 48800, deductions: null, netRecv: null, vendorPay: null, margin: null, marginAmt: null, status: "In Transit", sla: null },
];

const PAYMENTS = [
  { id: "PAY-2024-041", client: "Tata Steel", date: "May 12, 2024", mode: "NEFT", utr: "UTIB24051200142", amount: 339840, tds: 3398, allocated: 339840, invoices: ["INV-2024-075"], status: "Allocated" },
  { id: "PAY-2024-040", client: "ITC Limited", date: "May 10, 2024", mode: "RTGS", utr: "SBIN24051000087", amount: 226560, tds: 2266, allocated: 226560, invoices: ["INV-2024-072"], status: "Allocated" },
  { id: "PAY-2024-039", client: "Reliance Industries", date: "May 8, 2024", mode: "NEFT", utr: "HDFC24050800215", amount: 200000, tds: 2000, allocated: 200000, invoices: ["INV-2024-065", "INV-2024-062"], status: "Allocated" },
  { id: "PAY-2024-038", client: "Hindustan Unilever", date: "May 5, 2024", mode: "NEFT", utr: "ICIC24050500331", amount: 150000, tds: 1500, allocated: 120000, invoices: ["INV-2024-068"], status: "Partial" },
];

/* ═══════ SCREEN: CLIENT LIST ═══════ */
const ClientList = ({ onSelect }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const filtered = CLIENTS.filter(cl => (statusFilter === "all" || cl.status === statusFilter) && (industryFilter === "all" || cl.industry === industryFilter) && (search === "" || cl.name.toLowerCase().includes(search.toLowerCase())));

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4, marginBottom: 4 }}>Clients & Billing › Client List</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.ink }}>Clients & billing</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn>Export</Btn>
        <Btn v="primary">+ Add client</Btn>
      </div>
    </div>

    <Card noPad>
      <div style={{ padding: "14px 18px", display: "flex", gap: 10, alignItems: "center", borderBottom: `1px solid ${T.bdr}` }}>
        <div style={{ position: "relative", flex: "0 0 200px" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.ink4, fontSize: 14 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ fontFamily: F, fontSize: 13, padding: "7px 10px 7px 30px", borderRadius: 8, border: `1px solid ${T.bdr}`, width: "100%", outline: "none" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, color: T.ink2 }}>
          <option value="all">Status ▾</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
        </select>
        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, color: T.ink2 }}>
          <option value="all">Industry ▾</option>{[...new Set(CLIENTS.map(c => c.industry))].map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: T.ink4 }}>1 – {filtered.length} of {filtered.length}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Client name", "Industry", "Contract type", "Rate", "Total trips", "Revenue (MTD)", "Outstanding", "Credit util.", "Status"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {filtered.map((cl, i) => (
            <tr key={cl.id} onClick={() => onSelect(cl)} style={{ cursor: "pointer", transition: "background .1s" }} onMouseEnter={e => e.currentTarget.style.background = T.bdr2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <TD><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={cl.name} sz={30} /><div><div style={{ fontWeight: 600, color: T.blue }}>{cl.name}</div><div style={{ fontSize: 10, color: T.ink4 }}>{cl.id}</div></div></div></TD>
              <TD>{cl.industry}</TD>
              <TD><Badge c="purple" s="xs">{cl.contractType}</Badge></TD>
              <TD mono>{cl.rate}</TD>
              <TD bold>{cl.trips}</TD>
              <TD mono bold>{cl.revMTD}</TD>
              <TD mono bold color={cl.outstanding !== "₹0" ? T.red : T.green}>{cl.outstanding}</TD>
              <TD>
                {cl.creditUsed > 0 && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Bar v={cl.creditUsed} mx={100} color={cl.creditUsed > 50 ? T.red : cl.creditUsed > 25 ? T.amber : T.green} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: cl.creditUsed > 50 ? T.red : T.ink3, whiteSpace: "nowrap" }}>{cl.creditUsed}%</span>
                </div>}
                {cl.creditUsed === 0 && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>Clear</span>}
              </TD>
              <TD><Badge c={cl.status === "Active" ? "green" : "gray"}>{cl.status}</Badge></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══════ SCREEN: CLIENT DETAIL ═══════ */
const ClientDetail = ({ client: cl, onBack }) => {
  const [tab, setTab] = useState("overview");
  return (<div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.ink4, padding: 4 }}>←</button>
      <Avatar name={cl.name} sz={44} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{cl.name}</h2>
          <Badge c="green">{cl.status}</Badge>
          <Badge c="purple" s="xs">{cl.industry}</Badge>
        </div>
        <div style={{ fontSize: 12, color: T.ink4, marginTop: 2 }}>{cl.id} · PAN: {cl.pan} · GSTIN: {cl.gstin} · Account mgr: {cl.am}</div>
      </div>
      <Btn>Edit client</Btn>
      <Btn v="primary">New contract</Btn>
    </div>

    <Tabs active={tab} onChange={setTab} tabs={[
      { id: "overview", label: "Overview" }, { id: "branches", label: "Branches", count: cl.branches },
      { id: "contracts", label: "Contracts", count: cl.contracts }, { id: "invoices", label: "Invoices" },
      { id: "payments", label: "Payments" }, { id: "aging", label: "Aging" }, { id: "statement", label: "Statement" },
    ]} />

    {tab === "overview" && (<div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Metric label="Revenue MTD" value={cl.revMTD} color={T.blue} />
        <Metric label="Trips MTD" value={cl.trips} />
        <Metric label="Outstanding" value={cl.outstanding} color={cl.outstanding !== "₹0" ? T.red : T.green} />
        <Metric label="Credit limit" value={cl.creditLimit} />
        <Metric label="Credit days" value={cl.creditDays} sub={cl.billingCycle} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SLA label="Credit health" />
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: cl.creditUsed > 50 ? T.red : cl.creditUsed > 25 ? T.amber : T.green }}>{cl.creditUsed}%</div>
            <div style={{ flex: 1 }}>
              <Bar v={cl.creditUsed} mx={100} color={cl.creditUsed > 50 ? T.red : cl.creditUsed > 25 ? T.amber : T.green} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: T.ink4 }}>
                <span>Outstanding: {cl.outstanding}</span>
                <span>Limit: {cl.creditLimit}</span>
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: cl.creditUsed > 25 ? T.amberBg : T.greenBg, borderRadius: 8, fontSize: 12, color: cl.creditUsed > 25 ? T.amberTx : T.greenTx, fontWeight: 600 }}>
            {cl.creditUsed > 25 ? "⚠ Credit utilization above 25%. Monitor closely." : "✓ Credit health good. Well within limits."}
          </div>
        </Card>

        <Card>
          <SLA label="Billing configuration" />
          {[["Contract type", cl.contractType], ["Rate", cl.rate], ["Billing cycle", cl.billingCycle], ["Credit days", `${cl.creditDays} days`], ["TDS applicable", "Yes (1%)"], ["GST type", "B2B — E-Invoice eligible"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.bdr2}` }}>
              <span style={{ fontSize: 12, color: T.ink3 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>

        <Card style={{ gridColumn: "1 / -1" }}>
          <SLA label="Recent activity" />
          {[
            { icon: "📄", text: `Invoice INV-2024-082 generated for ${cl.name}`, sub: "₹4,57,840 · 8 trips · May 1-15, 2024", time: "2 hours ago", color: T.blue },
            { icon: "💰", text: "Payment received via NEFT", sub: "₹2,00,000 · UTR: HDFC24050800215", time: "3 days ago", color: T.green },
            { icon: "🚛", text: "Trip TRP-4824 settled", sub: "Mumbai → Ahmedabad · Margin 26.5%", time: "5 days ago", color: T.teal },
            { icon: "📋", text: "Contract RC-2024-0017 renewed", sub: "Per KM · ₹34.15/km · Valid until Dec 2024", time: "2 weeks ago", color: T.purple },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "start", gap: 12, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${T.bdr2}` : "none" }}>
              <span style={{ fontSize: 20, marginTop: 2 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.text}</div>
                <div style={{ fontSize: 12, color: T.ink3 }}>{a.sub}</div>
              </div>
              <span style={{ fontSize: 11, color: T.ink4, whiteSpace: "nowrap" }}>{a.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>)}

    {tab === "branches" && (<Card noPad>
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.bdr}` }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{cl.branches} branches</span>
        <Btn v="primary" sz="sm">+ Add branch</Btn>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Branch name", "GSTIN", "City / State", "Billing contact", "Phone", "Status"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {[
            ["Mumbai HQ (Primary)", cl.gstin, "Mumbai, Maharashtra", "Arun Sharma", "+91 98765 43210", "Active"],
            ["Delhi Warehouse", "07AAACR5055K1ZD", "New Delhi, Delhi", "Kavita Reddy", "+91 98765 43211", "Active"],
            ["Jamnagar Refinery", "24AAACR5055K1ZJ", "Jamnagar, Gujarat", "Sanjay Patel", "+91 98765 43212", "Active"],
            ["Chennai Office", "33AAACR5055K1ZC", "Chennai, Tamil Nadu", "Rajesh Iyer", "+91 98765 43213", "Active"],
          ].map(([name, gstin, city, contact, phone, status], i) => (
            <tr key={i}><TD bold>{name}</TD><TD mono>{gstin}</TD><TD>{city}</TD><TD>{contact}</TD><TD>{phone}</TD><TD><Badge c="green" s="xs">{status}</Badge></TD></tr>
          ))}
        </tbody>
      </table>
    </Card>)}

    {tab === "contracts" && (<div>
      {[
        { num: "RC-2024-0017", type: "Per KM", rate: "₹34.15/km", status: "Active", from: "Jan 1, 2024", to: "Dec 31, 2024", version: 2, routes: 5, trips: "14/20 MTD", fuel: true, minGuarantee: "20 trips/month" },
        { num: "RC-2023-0089", type: "Per KM", rate: "₹31.50/km", status: "Expired", from: "Jan 1, 2023", to: "Dec 31, 2023", version: 1, routes: 3, trips: "248 total", fuel: false, minGuarantee: "15 trips/month" },
      ].map((ct, i) => (
        <Card key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: M, fontSize: 14, fontWeight: 700, color: T.blue }}>{ct.num}</span>
                <Badge c={ct.status === "Active" ? "green" : "gray"}>{ct.status}</Badge>
                <Badge c="purple" s="xs">v{ct.version}</Badge>
                <Badge c="teal" s="xs">{ct.type}</Badge>
              </div>
              <div style={{ fontSize: 12, color: T.ink4, marginTop: 4 }}>{ct.from} → {ct.to} · {ct.routes} routes · {ct.trips}</div>
            </div>
            {ct.status === "Active" && <div style={{ display: "flex", gap: 6 }}><Btn sz="sm">View rates</Btn><Btn sz="sm" v="primary">Amend</Btn></div>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            {[["Base rate", ct.rate], ["Fuel surcharge", ct.fuel ? "Enabled (base ₹87.5/L)" : "Disabled"], ["Min guarantee", ct.minGuarantee], ["SLA penalty", "₹500/hr delay (max 10%)"], ["Detention", "₹400/hr after 4h free"]].map(([l, v]) => (
              <div key={l} style={{ background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: T.ink4, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>)}

    {tab === "aging" && (<div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[["Current", "₹0", T.green], ["1-30 days", "₹85,000", T.amber], ["31-60 days", "₹60,000", T.coral], ["61-90 days", "₹0", T.green], ["90+", "₹0", T.green]].map(([label, amt, color]) => (
          <Metric key={label} label={label} value={amt} color={amt !== "₹0" ? color : T.green} />
        ))}
      </div>
      <Card>
        <SLA label="Aging breakdown" />
        <div style={{ display: "flex", gap: 4, height: 120, alignItems: "flex-end", marginBottom: 16, padding: "0 20px" }}>
          {[0, 58, 42, 0, 0].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "60%", height: v > 0 ? Math.max(v, 10) : 4, background: [T.green, T.amber, T.coral, T.red, T.redTx][i], borderRadius: "4px 4px 0 0", transition: "height .5s" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, padding: "0 20px" }}>
          {["Current", "1-30d", "31-60d", "61-90d", "90+d"].map(l => <div key={l} style={{ flex: 1, textAlign: "center", fontSize: 10, color: T.ink4, fontWeight: 600 }}>{l}</div>)}
        </div>
      </Card>
    </div>)}

    {(tab === "invoices" || tab === "payments" || tab === "statement") && (
      <Card style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{tab === "invoices" ? "📄" : tab === "payments" ? "💰" : "📊"}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{tab === "invoices" ? "Client invoices" : tab === "payments" ? "Payment history" : "Account statement"}</div>
        <div style={{ fontSize: 13, color: T.ink3 }}>Filtered for {cl.name} — use the main {tab === "statement" ? "Statement" : tab} screen for full details</div>
      </Card>
    )}
  </div>);
};

/* ═══════ SCREEN: INVOICES ═══════ */
const InvoiceList = () => {
  const [statusF, setStatusF] = useState("all");
  const filtered = INVOICES.filter(inv => statusF === "all" || inv.status === statusF);
  const stColor = { Sent: "blue", Pending: "amber", Overdue: "red", Paid: "green" };

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4 }}>Clients & Billing › Invoices</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Invoices</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}><Btn>Export</Btn><Btn v="primary">+ Generate invoice</Btn></div>
    </div>

    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Total outstanding" value="₹10,48,430" color={T.red} />
      <Metric label="Overdue" value="₹7,60,510" sub="2 invoices" color={T.red} />
      <Metric label="Sent (awaiting)" value="₹4,57,840" sub="1 invoice" color={T.amber} />
      <Metric label="Collected MTD" value="₹5,66,400" color={T.green} />
      <Metric label="Avg collection" value="24 days" color={T.blue} />
    </div>

    <Card noPad>
      <div style={{ padding: "14px 18px", display: "flex", gap: 10, borderBottom: `1px solid ${T.bdr}`, alignItems: "center" }}>
        <input placeholder="Search invoices..." style={{ fontFamily: F, fontSize: 13, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, width: 180 }} />
        <select value={statusF} onChange={e => setStatusF(e.target.value)} style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}>
          <option value="all">Status ▾</option>{["Sent", "Pending", "Overdue", "Paid"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>Client ▾</option></select>
        <select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>Date ▾</option></select>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: T.ink4 }}>1 – {filtered.length} of {filtered.length}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Invoice #", "Client", "Branch", "Period", "Trips", "Amount", "GST (18%)", "Total", "Due date", "Status"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {filtered.map(inv => (
            <tr key={inv.id}>
              <TD mono bold color={T.blue}>{inv.id}</TD>
              <TD bold>{inv.client}</TD>
              <TD>{inv.branch}</TD>
              <TD>{inv.period}</TD>
              <TD>{inv.trips}</TD>
              <TD mono right>₹{inv.base.toLocaleString("en-IN")}</TD>
              <TD mono right>₹{inv.gst.toLocaleString("en-IN")}</TD>
              <TD mono bold right>₹{inv.total.toLocaleString("en-IN")}</TD>
              <TD>{inv.due}</TD>
              <TD><Badge c={stColor[inv.status]}>{inv.status}</Badge></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══════ SCREEN: SETTLEMENT ═══════ */
const SettlementScreen = () => {
  const [selected, setSelected] = useState(SETTLEMENTS[0]);
  const ready = SETTLEMENTS.filter(s => s.status === "Ready").length;
  const totRecv = SETTLEMENTS.filter(s => s.netRecv).reduce((a, s) => a + s.netRecv, 0);
  const totPay = SETTLEMENTS.filter(s => s.vendorPay).reduce((a, s) => a + s.vendorPay, 0);
  const avgMargin = SETTLEMENTS.filter(s => s.margin).reduce((a, s) => a + s.margin, 0) / SETTLEMENTS.filter(s => s.margin).length;

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4 }}>Trip Management › Settlement</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Settlement & invoicing</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}><Btn>Export</Btn><Btn v="primary">✓ Batch settle</Btn></div>
    </div>

    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Ready to settle" value={ready} sub="POD verified, awaiting settlement" color={T.green} />
      <Metric label="Pending POD" value="2" sub="Cannot settle yet" />
      <Metric label="Total receivable" value={`₹${(totRecv/100000).toFixed(1)}L`} color={T.blue} />
      <Metric label="Total payable" value={`₹${(totPay/100000).toFixed(1)}L`} sub="Vendor payouts" color={T.purple} />
      <Metric label="Avg. margin" value={`${Math.round(avgMargin)}%`} sub="↑ Above 18% floor" color={T.green} />
    </div>

    <Card noPad style={{ marginBottom: 20 }}>
      <div style={{ padding: "14px 18px", display: "flex", gap: 10, borderBottom: `1px solid ${T.bdr}`, alignItems: "center" }}>
        <input placeholder="Search trip, client..." style={{ fontFamily: F, fontSize: 13, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}`, width: 180 }} />
        <select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>All Statuses ▾</option></select>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: T.ink4 }}>1 – {SETTLEMENTS.length} of {SETTLEMENTS.length}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Trip ID", "Client / Route", "Rate type", "Contract rate", "Expenses", "Deductions", "Net receivable", "Vendor payable", "Margin", "Status", "Action"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {SETTLEMENTS.map(s => (
            <tr key={s.trip} onClick={() => s.status !== "In Transit" && setSelected(s)} style={{ cursor: s.status !== "In Transit" ? "pointer" : "default", background: selected?.trip === s.trip ? T.blueBg : "transparent" }}>
              <TD mono bold color={T.blue}>{s.trip}</TD>
              <TD><div style={{ fontWeight: 600 }}>{s.client}</div><div style={{ fontSize: 11, color: T.ink3 }}>{s.route}</div></TD>
              <TD><Badge c="purple" s="xs">{s.rateType}</Badge><div style={{ fontSize: 10, color: T.ink4, marginTop: 2 }}>{s.rate}</div></TD>
              <TD mono right>₹{s.contract.toLocaleString("en-IN")}</TD>
              <TD mono right color={T.red}>₹{s.expenses.toLocaleString("en-IN")}</TD>
              <TD mono right color={s.deductions ? T.red : undefined}>{s.deductions != null ? (s.deductions > 0 ? `₹${s.deductions.toLocaleString("en-IN")}` : "₹0") : "—"}</TD>
              <TD mono bold right color={T.green}>{s.netRecv != null ? `₹${s.netRecv.toLocaleString("en-IN")}` : "—"}</TD>
              <TD mono right>{s.vendorPay != null ? `₹${s.vendorPay.toLocaleString("en-IN")}` : "—"}</TD>
              <TD>{s.margin != null ? <div><span style={{ fontWeight: 700, color: s.margin < 15 ? T.amber : T.green }}>{s.margin}%</span>{s.sla === "breached" && <span style={{ fontSize: 10, color: T.amber }}> ⚠</span>}<div style={{ fontSize: 10, color: T.ink4 }}>₹{s.marginAmt?.toLocaleString("en-IN")}</div></div> : "—"}</TD>
              <TD><Badge c={s.status === "Ready" ? "green" : s.status === "Disputed" ? "red" : s.status === "In Transit" ? "amber" : "gray"}>{s.status}</Badge>{s.sla === "breached" && <div style={{ fontSize: 9, color: T.redTx }}>Shortage deduction</div>}</TD>
              <TD>{s.status === "Ready" ? <Btn v="primary" sz="sm">Settle</Btn> : s.status === "Disputed" ? <Btn sz="sm">Detail</Btn> : <span style={{ fontSize: 11, color: T.ink4 }}>Pending POD</span>}</TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>

    {selected && selected.netRecv && (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.blue }}>Settlement breakdown — {selected.trip}</span>
        </div>
        {[
          { icon: "🚛", label: `Freight Rate (${selected.rateType})`, value: `₹${selected.contract.toLocaleString("en-IN")}`, bg: null },
          { icon: "⊖", label: "Deductions", value: selected.deductions > 0 ? `-₹${selected.deductions.toLocaleString("en-IN")}` : "₹0", bg: null, color: T.red },
          { icon: "→", label: "Net Client Receivable", value: `₹${selected.netRecv.toLocaleString("en-IN")}`, bg: null, bold: true },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bdr2}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 400, color: r.color || T.ink }}>{r.label}</span>
            </div>
            <span style={{ fontFamily: M, fontSize: 14, fontWeight: 700, color: r.color || T.ink }}>{r.value}</span>
          </div>
        ))}
        <div style={{ borderTop: `2px solid ${T.bdr}`, marginTop: 8, paddingTop: 12 }}>
          {[
            { icon: "⛽", label: "Diesel (250L)", value: "₹22,400" },
            { icon: "🛣️", label: "Tolls (FASTag)", value: "₹4,850" },
            { icon: "👤", label: "Driver Allowance", value: "₹2,500" },
            { icon: "🍽️", label: "Driver Food", value: "₹1,200" },
            { icon: "···", label: "Misc Expenses", value: "₹500" },
            { icon: "💳", label: "Driver Advance (Given)", value: "-₹5,000", color: T.blue },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
              <span style={{ fontSize: 12, color: T.ink3, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12 }}>{r.icon}</span>{r.label}</span>
              <span style={{ fontFamily: M, fontSize: 12, fontWeight: 600, color: r.color || T.ink }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: `1px solid ${T.bdr}`, marginTop: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>→ Net Vendor Payable</span>
          <span style={{ fontFamily: M, fontSize: 14, fontWeight: 800, color: T.purple }}>₹26,450</span>
        </div>
        <div style={{ background: T.greenBg, borderRadius: 8, padding: "10px 14px", marginTop: 12, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.greenTx }}>📈 Margin</span>
          <span style={{ fontFamily: M, fontWeight: 800, color: T.greenTx }}>₹{selected.marginAmt?.toLocaleString("en-IN")} ({selected.margin}%)</span>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>📄</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.green }}>Invoice preview</span>
        </div>
        <div style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
          {[["Invoice To", selected.client], ["GSTIN", "27AAACR5055K1ZK"], ["Invoice #", `INV-2024-${selected.trip.slice(-4)}`], ["Date", "May 15, 2024"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.bdr2}` }}>
              <span style={{ fontSize: 12, color: T.ink3 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", padding: "8px 0", fontSize: 10, fontWeight: 700, color: T.ink4, textTransform: "uppercase", borderBottom: `1px solid ${T.bdr}` }}>
              <span style={{ flex: 3 }}>Description</span><span style={{ flex: 1, textAlign: "right" }}>HSN</span><span style={{ flex: 1, textAlign: "right" }}>Amount</span>
            </div>
            <div style={{ display: "flex", padding: "10px 0", borderBottom: `1px solid ${T.bdr2}` }}>
              <span style={{ flex: 3, fontSize: 12 }}>Freight Charges — {selected.route}<br /><span style={{ color: T.ink4, fontSize: 11 }}>({selected.rate})</span></span>
              <span style={{ flex: 1, textAlign: "right", fontSize: 12, fontFamily: M }}>9965</span>
              <span style={{ flex: 1, textAlign: "right", fontSize: 12, fontFamily: M, fontWeight: 600 }}>₹{selected.netRecv?.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", padding: "8px 0" }}>
              <span style={{ flex: 3, fontSize: 12, color: T.ink3 }}>IGST @ 18%</span><span style={{ flex: 1 }} />
              <span style={{ flex: 1, textAlign: "right", fontSize: 12, fontFamily: M }}>₹{Math.round(selected.netRecv * 0.18).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <div style={{ background: T.amberBg, borderRadius: 8, padding: "10px 14px", marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Total Payable (incl. GST)</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.red, fontFamily: M }}>₹{Math.round(selected.netRecv * 1.18).toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn v="primary" style={{ flex: 1 }}>📄 Generate invoice</Btn>
          <Btn style={{ flex: 1 }}>✉ Email to client</Btn>
        </div>
      </Card>
    </div>)}
  </div>);
};

/* ═══════ SCREEN: PAYMENTS ═══════ */
const PaymentScreen = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4 }}>Clients & Billing › Payments</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Payment receipts</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}><Btn>Export</Btn><Btn v="primary">+ Record payment</Btn></div>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Received MTD" value="₹9,16,400" color={T.green} />
      <Metric label="TDS collected" value="₹9,164" sub="1% of gross" color={T.purple} />
      <Metric label="Unallocated" value="₹30,000" sub="1 payment" color={T.amber} />
      <Metric label="Bounced" value="₹0" color={T.green} />
    </div>
    <Card noPad>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Payment #", "Client", "Date", "Mode", "UTR / Ref", "Amount", "TDS", "Allocated", "Against invoices", "Status"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {PAYMENTS.map(p => (
            <tr key={p.id}>
              <TD mono bold color={T.blue}>{p.id}</TD>
              <TD bold>{p.client}</TD>
              <TD>{p.date}</TD>
              <TD><Badge c="teal" s="xs">{p.mode}</Badge></TD>
              <TD mono>{p.utr}</TD>
              <TD mono bold right>₹{p.amount.toLocaleString("en-IN")}</TD>
              <TD mono right color={T.purple}>₹{p.tds.toLocaleString("en-IN")}</TD>
              <TD mono right>₹{p.allocated.toLocaleString("en-IN")}</TD>
              <TD>{p.invoices.map(i => <Badge key={i} c="blue" s="xs">{i}</Badge>)}</TD>
              <TD><Badge c={p.status === "Allocated" ? "green" : "amber"}>{p.status}</Badge></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══════ SCREEN: AGING ═══════ */
const AgingScreen = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4 }}>Clients & Billing › Aging</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Aging analysis</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}><Btn>Export report</Btn><Btn v="primary">Send reminders</Btn></div>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Total outstanding" value="₹4,32,800" color={T.red} />
      <Metric label="Current" value="₹0" color={T.green} />
      <Metric label="1-30 days" value="₹2,32,800" color={T.amber} />
      <Metric label="31-60 days" value="₹2,00,000" color={T.coral} />
      <Metric label="60+ days" value="₹0" color={T.green} />
    </div>
    <Card noPad>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Client", "Current", "1-30 days", "31-60 days", "61-90 days", "90+ days", "Total outstanding", "Credit limit", "Utilization", "Action"].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {[
            { name: "Reliance Industries", cur: 0, d30: 85000, d60: 60000, d90: 0, d90p: 0, total: 145000, limit: 1000000 },
            { name: "Hindustan Unilever", cur: 0, d30: 87800, d60: 0, d90: 0, d90p: 0, total: 87800, limit: 1200000 },
            { name: "Adani Ports", cur: 0, d30: 60000, d60: 140000, d90: 0, d90p: 0, total: 200000, limit: 600000 },
          ].map((r, i) => (
            <tr key={i}>
              <TD bold>{r.name}</TD>
              <TD mono right color={T.green}>₹{r.cur.toLocaleString("en-IN")}</TD>
              <TD mono right color={r.d30 > 0 ? T.amber : T.green}>₹{r.d30.toLocaleString("en-IN")}</TD>
              <TD mono right color={r.d60 > 0 ? T.coral : T.green}>₹{r.d60.toLocaleString("en-IN")}</TD>
              <TD mono right color={r.d90 > 0 ? T.red : T.green}>₹{r.d90.toLocaleString("en-IN")}</TD>
              <TD mono right color={r.d90p > 0 ? T.redTx : T.green}>₹{r.d90p.toLocaleString("en-IN")}</TD>
              <TD mono bold right color={T.red}>₹{r.total.toLocaleString("en-IN")}</TD>
              <TD mono right>₹{r.limit.toLocaleString("en-IN")}</TD>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Bar v={(r.total / r.limit) * 100} mx={100} color={(r.total / r.limit) > 0.3 ? T.red : T.amber} />
                  <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{((r.total / r.limit) * 100).toFixed(0)}%</span>
                </div>
              </TD>
              <TD><Btn sz="sm">Remind</Btn></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══════ MAIN APP ═══════ */
export default function App() {
  const [screen, setScreen] = useState("clients");
  const [selectedClient, setSelectedClient] = useState(null);

  const nav = [
    { id: "clients", label: "Clients", icon: "🏢" },
    { id: "invoices", label: "Invoices", icon: "📄" },
    { id: "settlement", label: "Settlement", icon: "⚖️" },
    { id: "payments", label: "Payments", icon: "💰" },
    { id: "aging", label: "Aging", icon: "📊" },
  ];

  return (
    <div style={{ fontFamily: F, color: T.ink, background: T.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ background: T.card, borderBottom: `1px solid ${T.bdr}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 6, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.blue, padding: "12px 16px 12px 0", borderRight: `1px solid ${T.bdr}`, marginRight: 8, letterSpacing: "-.02em" }}>TripFlow</div>
        {nav.map(n => (
          <button key={n.id} onClick={() => { setScreen(n.id); setSelectedClient(null); }} style={{
            fontFamily: F, fontSize: 13, fontWeight: 600, padding: "12px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap", background: "transparent",
            color: screen === n.id || (n.id === "clients" && selectedClient) ? T.blue : T.ink3,
            borderBottom: screen === n.id || (n.id === "clients" && selectedClient) ? `2px solid ${T.blue}` : "2px solid transparent",
          }}><span style={{ marginRight: 5 }}>{n.icon}</span>{n.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {screen === "clients" && !selectedClient && <ClientList onSelect={cl => { setSelectedClient(cl); }} />}
        {selectedClient && <ClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />}
        {screen === "invoices" && !selectedClient && <InvoiceList />}
        {screen === "settlement" && !selectedClient && <SettlementScreen />}
        {screen === "payments" && !selectedClient && <PaymentScreen />}
        {screen === "aging" && !selectedClient && <AgingScreen />}
      </div>
    </div>
  );
}
