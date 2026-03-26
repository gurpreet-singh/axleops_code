import { useState, useMemo } from "react";

/* ═══ TOKENS ═══ */
const T = { bg:"#f5f6f8",card:"#fff",ink:"#101828",ink2:"#344054",ink3:"#667085",ink4:"#98a2b3",bdr:"#e4e7ec",bdr2:"#f2f4f7",blue:"#1570ef",blueBg:"#eff8ff",blueTx:"#175cd3",green:"#12b76a",greenBg:"#ecfdf3",greenTx:"#027a48",red:"#f04438",redBg:"#fef3f2",redTx:"#b42318",amber:"#f79009",amberBg:"#fffaeb",amberTx:"#b54708",purple:"#7a5af8",purpleBg:"#f4f3ff",purpleTx:"#5925dc",teal:"#0e9384",tealBg:"#f0fdf9",tealTx:"#107569" };
const F=`'DM Sans',system-ui,sans-serif`, M=`'JetBrains Mono',monospace`;

/* ═══ PRIMITIVES ═══ */
const Badge=({children,c="blue",s})=>{const m={blue:[T.blueBg,T.blueTx],green:[T.greenBg,T.greenTx],red:[T.redBg,T.redTx],amber:[T.amberBg,T.amberTx],purple:[T.purpleBg,T.purpleTx],teal:[T.tealBg,T.tealTx],gray:[T.bdr2,T.ink3]};const[bg,fg]=m[c]||m.blue;return<span style={{display:"inline-flex",alignItems:"center",padding:s==="xs"?"1px 7px":"3px 10px",borderRadius:6,fontSize:s==="xs"?9:11,fontWeight:600,background:bg,color:fg,textTransform:"uppercase",letterSpacing:".04em",whiteSpace:"nowrap"}}>{children}</span>};
const Btn=({children,v="default",sz="md",onClick,style:st})=>{const b={fontFamily:F,fontWeight:600,borderRadius:8,cursor:"pointer",border:"none",display:"inline-flex",alignItems:"center",gap:5,transition:"all .12s",fontSize:sz==="sm"?12:13,padding:sz==="sm"?"5px 12px":"8px 18px"};const vs={default:{background:T.card,color:T.ink2,border:`1px solid ${T.bdr}`},primary:{background:T.blue,color:"#fff"},success:{background:T.green,color:"#fff"},ghost:{background:"transparent",color:T.ink3}};return<button style={{...b,...vs[v],...st}} onClick={onClick}>{children}</button>};
const Card=({children,style:st,noPad})=><div style={{background:T.card,borderRadius:12,border:`1px solid ${T.bdr}`,padding:noPad?0:"18px 22px",...st}}>{children}</div>;
const Metric=({label,value,sub,color})=><div style={{background:T.card,borderRadius:10,border:`1px solid ${T.bdr}`,padding:"14px 18px",flex:1,minWidth:130}}><div style={{fontSize:10,fontWeight:700,color:T.ink4,letterSpacing:".05em",textTransform:"uppercase",marginBottom:6}}>{label}</div><div style={{fontSize:26,fontWeight:800,color:color||T.ink,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:11,color:T.ink4,marginTop:4}}>{sub}</div>}</div>;
const TH=({children,right})=><th style={{padding:"10px 14px",textAlign:right?"right":"left",fontSize:10,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:".04em",borderBottom:`1px solid ${T.bdr}`,background:T.bg,whiteSpace:"nowrap",position:"sticky",top:0}}>{children}</th>;
const TD=({children,mono,bold,color,right})=><td style={{padding:"11px 14px",fontSize:13,fontFamily:mono?M:F,fontWeight:bold?700:400,color:color||T.ink,borderBottom:`1px solid ${T.bdr2}`,textAlign:right?"right":"left",whiteSpace:"nowrap"}}>{children}</td>;
const Tabs=({tabs,active,onChange})=><div style={{display:"flex",gap:1,borderBottom:`1px solid ${T.bdr}`,marginBottom:20,overflowX:"auto"}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{fontFamily:F,fontSize:13,fontWeight:600,padding:"10px 16px",border:"none",cursor:"pointer",background:"transparent",color:active===t.id?T.blue:T.ink3,borderBottom:active===t.id?`2px solid ${T.blue}`:"2px solid transparent",whiteSpace:"nowrap"}}>{t.label}</button>)}</div>;
const SL=({children})=><div style={{fontSize:10,fontWeight:700,color:T.ink4,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>{children}</div>;
const INR=n=>{if(n==null)return"—";const a=Math.abs(n);const s=a>=10000000?`${(a/10000000).toFixed(2)} Cr`:a>=100000?`${(a/100000).toFixed(2)} L`:a.toLocaleString("en-IN");return n<0?`-₹${s}`:`₹${s}`};
const INRfull=n=>n==null?"—":(n<0?"-":"")+`₹${Math.abs(n).toLocaleString("en-IN")}`;

/* ═══ DATA ═══ */
const COA_DATA = [
  { group: "Assets", color: "blue", accounts: [
    { code: "100-001-001", name: "HDFC Bank — Current A/c", type: "BANK", sub: "Primary operating account", balance: 1245800, dr: true },
    { code: "100-001-002", name: "ICICI Bank — Savings A/c", type: "BANK", sub: "Reserve savings account", balance: 582500, dr: true },
    { code: "100-001-003", name: "Fuel Card Account", type: "BANK", sub: "IOCL Fleet Card balance", balance: 124600, dr: true },
    { code: "100-001-004", name: "FASTag Account", type: "BANK", sub: "FASTag wallet balance", balance: 67400, dr: true },
    { code: "100-002-001", name: "Petty Cash — Mumbai HQ", type: "CASH", sub: "Office petty cash float", balance: 48000, dr: true },
    { code: "100-002-002", name: "Petty Cash — Pune Branch", type: "CASH", sub: "Branch petty cash", balance: 22000, dr: true },
    { code: "100-003-001", name: "Accounts Receivable", type: "RECEIVABLE", sub: "Client outstanding collections", balance: 842500, dr: true },
    { code: "100-003-002", name: "Unbilled Revenue", type: "RECEIVABLE", sub: "Delivered but not invoiced", balance: 186200, dr: true },
    { code: "100-004-001", name: "Driver Advance — Outstanding", type: "ADVANCE", sub: "Cash advances to drivers", balance: 145000, dr: true },
    { code: "100-004-002", name: "Vendor Advance — Outstanding", type: "ADVANCE", sub: "Advances to vehicle owners", balance: 280000, dr: true },
    { code: "100-004-003", name: "TDS Receivable", type: "TAX", sub: "TDS deducted by clients", balance: 42800, dr: true },
    { code: "100-004-004", name: "GST Input Credit — CGST", type: "TAX", sub: "CGST on purchases", balance: 68400, dr: true },
    { code: "100-004-005", name: "GST Input Credit — SGST", type: "TAX", sub: "SGST on purchases", balance: 68400, dr: true },
    { code: "100-004-006", name: "GST Input Credit — IGST", type: "TAX", sub: "IGST on interstate purchases", balance: 124000, dr: true },
    { code: "100-005-001", name: "Fixed Assets — Vehicles", type: "FIXED", sub: "Owned vehicles at book value", balance: 4850000, dr: true },
    { code: "100-005-002", name: "Less: Accumulated Depreciation", type: "FIXED", sub: "Vehicle depreciation", balance: -1620000, dr: true },
  ]},
  { group: "Liabilities", color: "red", accounts: [
    { code: "200-001-001", name: "Accounts Payable — Vendors", type: "PAYABLE", sub: "Vendor & supplier dues", balance: 518200, dr: false },
    { code: "200-001-002", name: "Accounts Payable — Drivers", type: "PAYABLE", sub: "Driver settlement dues", balance: 86400, dr: false },
    { code: "200-001-003", name: "Salary Payable", type: "PAYABLE", sub: "Employee salary dues", balance: 364000, dr: false },
    { code: "200-002-001", name: "GST Output Liability — CGST", type: "TAX", sub: "CGST on sales invoices", balance: 142600, dr: false },
    { code: "200-002-002", name: "GST Output Liability — SGST", type: "TAX", sub: "SGST on sales invoices", balance: 142600, dr: false },
    { code: "200-002-003", name: "GST Output Liability — IGST", type: "TAX", sub: "IGST on interstate sales", balance: 284500, dr: false },
    { code: "200-002-004", name: "TDS Payable", type: "TAX", sub: "TDS on vendor payments", balance: 28600, dr: false },
    { code: "200-003-001", name: "Client Advance Received", type: "LIABILITY", sub: "Advance from clients", balance: 150000, dr: false },
    { code: "200-004-001", name: "Vehicle Loan — HDFC", type: "LOAN", sub: "Vehicle financing", balance: 1840000, dr: false },
    { code: "200-005-001", name: "Owner Capital", type: "CAPITAL", sub: "Proprietor capital", balance: 2500000, dr: false },
    { code: "200-005-002", name: "Retained Earnings", type: "CAPITAL", sub: "Accumulated profits", balance: 1248400, dr: false },
  ]},
  { group: "Income", color: "green", accounts: [
    { code: "300-001-001", name: "Freight Revenue", type: "REVENUE", sub: "Core freight charges", balance: 3284000, dr: false },
    { code: "300-001-002", name: "Fuel Surcharge Revenue", type: "REVENUE", sub: "Fuel surcharge billed", balance: 186400, dr: false },
    { code: "300-001-003", name: "Loading/Unloading Revenue", type: "REVENUE", sub: "Loading charges billed", balance: 124800, dr: false },
    { code: "300-001-004", name: "Detention Revenue", type: "REVENUE", sub: "Detention charges", balance: 42600, dr: false },
    { code: "300-002-001", name: "Penalty Income", type: "INCOME", sub: "SLA penalties from vendors", balance: 18400, dr: false },
    { code: "300-003-001", name: "Interest Income", type: "INCOME", sub: "Bank interest", balance: 12800, dr: false },
  ]},
  { group: "Expenses", color: "amber", accounts: [
    { code: "400-001-001", name: "Diesel / Fuel Expense", type: "DIRECT", sub: "Fuel consumed on trips", balance: 1128400, dr: true },
    { code: "400-001-002", name: "Toll Expense", type: "DIRECT", sub: "Toll charges", balance: 284600, dr: true },
    { code: "400-001-003", name: "Driver Allowance Expense", type: "DIRECT", sub: "Daily allowance", balance: 186200, dr: true },
    { code: "400-001-004", name: "Driver Food Expense", type: "DIRECT", sub: "Meal expenses", balance: 62400, dr: true },
    { code: "400-001-005", name: "Loading/Unloading Expense", type: "DIRECT", sub: "Labour charges", balance: 98600, dr: true },
    { code: "400-001-006", name: "Vehicle Hire Charges", type: "DIRECT", sub: "Attached vehicle payments", balance: 842000, dr: true },
    { code: "400-002-001", name: "Vehicle Maintenance", type: "DIRECT", sub: "Repairs, servicing, tyres", balance: 186400, dr: true },
    { code: "400-002-002", name: "Vehicle Insurance", type: "EXPENSE", sub: "Annual insurance", balance: 124000, dr: true },
    { code: "400-002-003", name: "Vehicle Depreciation", type: "EXPENSE", sub: "Monthly depreciation", balance: 162000, dr: true },
    { code: "400-003-001", name: "Salary & Wages", type: "INDIRECT", sub: "Staff salaries", balance: 486000, dr: true },
    { code: "400-003-002", name: "Office Rent", type: "INDIRECT", sub: "Office & warehouse rent", balance: 180000, dr: true },
    { code: "400-003-003", name: "GPS / Tracking Charges", type: "INDIRECT", sub: "GPS subscription", balance: 24000, dr: true },
    { code: "400-004-001", name: "SLA Penalty Expense", type: "INDIRECT", sub: "Penalties to clients", balance: 18600, dr: true },
    { code: "400-004-002", name: "Bank Charges", type: "INDIRECT", sub: "Transaction fees", balance: 8400, dr: true },
    { code: "400-004-003", name: "Miscellaneous Expense", type: "INDIRECT", sub: "Other expenses", balance: 12600, dr: true },
  ]},
];

const LEDGER_ENTRIES = [
  { date: "20 Mar", vNo: "SLS/26-03/0042", type: "Sales", narr: "Invoice INV-2024-082 — Reliance Industries (8 trips)", dr: 457840, cr: 0, bal: 842500 },
  { date: "19 Mar", vNo: "RCT/26-03/0038", type: "Receipt", narr: "Payment from Hindustan Unilever — NEFT UTR: ICIC26031900142", dr: 0, cr: 248600, bal: 384660 },
  { date: "18 Mar", vNo: "SLS/26-03/0041", type: "Sales", narr: "Invoice INV-2024-081 — Hindustan Unilever (12 trips)", dr: 254880, cr: 0, bal: 633260 },
  { date: "17 Mar", vNo: "RCT/26-03/0037", type: "Receipt", narr: "Payment from Tata Steel — RTGS UTR: SBIN26031700087", dr: 0, cr: 339840, bal: 378380 },
  { date: "15 Mar", vNo: "CRN/26-03/0004", type: "Cr. Note", narr: "Credit note CN-2024-0091 — Reliance shortage deduction", dr: 0, cr: 4248, bal: 718220 },
  { date: "14 Mar", vNo: "SLS/26-03/0040", type: "Sales", narr: "Invoice INV-2024-079 — Adani Ports (5 trips)", dr: 424800, cr: 0, bal: 722468 },
  { date: "12 Mar", vNo: "RCT/26-03/0036", type: "Receipt", narr: "Payment from Reliance Industries — NEFT", dr: 0, cr: 200000, bal: 297668 },
  { date: "10 Mar", vNo: "SLS/26-03/0039", type: "Sales", narr: "Invoice INV-2024-078 — Reliance Industries (10 trips)", dr: 335710, cr: 0, bal: 497668 },
  { date: "08 Mar", vNo: "RCT/26-03/0035", type: "Receipt", narr: "Payment from ITC Limited — NEFT", dr: 0, cr: 226560, bal: 161958 },
  { date: "05 Mar", vNo: "SLS/26-03/0038", type: "Sales", narr: "Invoice INV-2024-077 — Mahindra Logistics (6 trips)", dr: 186400, cr: 0, bal: 388518 },
];

const DAYBOOK = [
  { date: "20 Mar", vNo: "SLS/26-03/0042", type: "Sales", narr: "INV-2024-082 — Reliance Industries", dr: 457840, cr: 457840, color: "green" },
  { date: "20 Mar", vNo: "FUL/26-03/0128", type: "Fuel", narr: "Fuel TRP-4828 — IOCL Nashik, 120L", dr: 12480, cr: 12480, color: "amber" },
  { date: "20 Mar", vNo: "TOL/26-03/0084", type: "Toll", narr: "FASTag TRP-4828 — 4 toll plazas", dr: 2850, cr: 2850, color: "amber" },
  { date: "20 Mar", vNo: "ADV/26-03/0045", type: "Advance", narr: "Driver advance — Rajesh Kumar for TRP-4830", dr: 8000, cr: 8000, color: "purple" },
  { date: "19 Mar", vNo: "RCT/26-03/0038", type: "Receipt", narr: "Payment from HUL — NEFT UTR: ICIC26031900142", dr: 248600, cr: 248600, color: "blue" },
  { date: "19 Mar", vNo: "PMT/26-03/0022", type: "Payment", narr: "Vendor settlement TRP-4824 — Vikram Yadav", dr: 26450, cr: 26450, color: "red" },
  { date: "19 Mar", vNo: "FUL/26-03/0127", type: "Fuel", narr: "Fuel TRP-4825 — BPCL Udaipur, 150L", dr: 15600, cr: 15600, color: "amber" },
  { date: "18 Mar", vNo: "SLS/26-03/0041", type: "Sales", narr: "INV-2024-081 — Hindustan Unilever", dr: 254880, cr: 254880, color: "green" },
  { date: "18 Mar", vNo: "PMT/26-03/0021", type: "Payment", narr: "Vendor settlement TRP-4822 — Suresh Patil", dr: 32600, cr: 32600, color: "red" },
];

const typeColors = { BANK: "blue", CASH: "teal", RECEIVABLE: "green", PAYABLE: "red", ADVANCE: "purple", TAX: "amber", FIXED: "gray", REVENUE: "green", INCOME: "green", DIRECT: "amber", INDIRECT: "amber", EXPENSE: "amber", LIABILITY: "red", LOAN: "red", CAPITAL: "purple" };
const voucherColors = { Sales: "green", Receipt: "blue", Payment: "red", Fuel: "amber", Toll: "amber", Advance: "purple", "Cr. Note": "teal", Journal: "gray" };

/* ═══ SCREEN: CHART OF ACCOUNTS ═══ */
const ChartOfAccounts = ({ onSelectAccount }) => {
  const [expanded, setExpanded] = useState({ Assets: true, Liabilities: true, Income: false, Expenses: false });
  const [search, setSearch] = useState("");

  const totals = useMemo(() => {
    const r = {};
    COA_DATA.forEach(g => { r[g.group] = g.accounts.reduce((s, a) => s + Math.abs(a.balance), 0); });
    return r;
  }, []);

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 11, color: T.ink4 }}>Finance › Chart of Accounts</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Chart of accounts</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn>Export to Tally</Btn>
        <Btn v="primary">+ Add account</Btn>
      </div>
    </div>

    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Total accounts" value={COA_DATA.reduce((s, g) => s + g.accounts.length, 0)} />
      <Metric label="Total assets" value={INR(totals.Assets)} color={T.blue} />
      <Metric label="Receivables" value={INR(842500 + 186200)} color={T.green} />
      <Metric label="Payables" value={INR(518200 + 86400 + 364000)} color={T.red} />
    </div>

    <div style={{ marginBottom: 14 }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." style={{ fontFamily: F, fontSize: 13, padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.bdr}`, width: 260 }} />
    </div>

    {COA_DATA.map(group => {
      const filtered = search ? group.accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)) : group.accounts;
      if (search && filtered.length === 0) return null;
      const isExp = expanded[group.group];
      const gColor = { Assets: T.blue, Liabilities: T.red, Income: T.green, Expenses: T.amber }[group.group];

      return (
        <Card key={group.group} style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
          <div onClick={() => setExpanded(p => ({ ...p, [group.group]: !p[group.group] }))} style={{ display: "flex", alignItems: "center", padding: "14px 20px", cursor: "pointer", borderBottom: isExp ? `1px solid ${T.bdr}` : "none", background: isExp ? T.bg : "transparent", transition: "background .15s" }}>
            <span style={{ fontSize: 14, marginRight: 10, transition: "transform .2s", transform: isExp ? "rotate(90deg)" : "rotate(0)" }}>▸</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: gColor, flex: 1 }}>{group.group}</span>
            <span style={{ fontSize: 12, color: T.ink4, marginRight: 16 }}>{filtered.length} accounts</span>
            <span style={{ fontSize: 15, fontWeight: 800, fontFamily: M, color: gColor }}>{INR(totals[group.group])}</span>
          </div>
          {isExp && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Account name", "Code", "Type", "Balance", "Dr/Cr"].map(h => <TH key={h} right={h === "Balance"}>{h}</TH>)}</tr></thead>
              <tbody>
                {filtered.map(acct => (
                  <tr key={acct.code} onClick={() => onSelectAccount(acct)} style={{ cursor: "pointer", transition: "background .1s" }} onMouseEnter={e => e.currentTarget.style.background = T.bdr2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <TD><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: { Assets: T.blueBg, Liabilities: T.redBg, Income: T.greenBg, Expenses: T.amberBg }[group.group], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{{ BANK: "🏦", CASH: "💵", RECEIVABLE: "📥", PAYABLE: "📤", ADVANCE: "💳", TAX: "🏛️", FIXED: "🚛", REVENUE: "📈", INCOME: "💰", DIRECT: "⛽", INDIRECT: "🏢", EXPENSE: "📋", LIABILITY: "📊", LOAN: "🏦", CAPITAL: "👤" }[acct.type]}</div><div><div style={{ fontWeight: 600, color: T.blue, fontSize: 13 }}>{acct.name}</div><div style={{ fontSize: 10, color: T.ink4 }}>{acct.sub}</div></div></div></TD>
                    <TD mono>{acct.code}</TD>
                    <TD><Badge c={typeColors[acct.type]} s="xs">{acct.type}</Badge></TD>
                    <TD mono bold right color={acct.balance < 0 ? T.red : gColor}>{INRfull(Math.abs(acct.balance))}</TD>
                    <TD><Badge c={acct.dr ? "blue" : "red"} s="xs">{acct.dr ? "Dr" : "Cr"}</Badge></TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      );
    })}
  </div>);
};

/* ═══ SCREEN: ACCOUNT LEDGER ═══ */
const AccountLedger = ({ account, onBack }) => {
  const a = account || COA_DATA[0].accounts[6]; // default: Accounts Receivable
  return (<div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.ink4 }}>←</button>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{a.name}</h2>
          <Badge c={typeColors[a.type]} s="xs">{a.type}</Badge>
        </div>
        <div style={{ fontSize: 12, color: T.ink4, marginTop: 2 }}>{a.code} · {a.sub}</div>
      </div>
      <Btn sz="sm">Export CSV</Btn>
      <Btn sz="sm">Export PDF</Btn>
    </div>

    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Opening balance" value={INRfull(161958)} sub="1 Mar 2026" />
      <Metric label="Total debit" value={INRfull(1659630)} color={T.blue} sub="This month" />
      <Metric label="Total credit" value={INRfull(1019248)} color={T.red} sub="This month" />
      <Metric label="Closing balance" value={INRfull(a.balance)} color={T.blue} sub={`${a.dr ? "Dr" : "Cr"} · 20 Mar 2026`} />
    </div>

    <Card noPad>
      <div style={{ padding: "10px 18px", borderBottom: `1px solid ${T.bdr}`, display: "flex", gap: 10, alignItems: "center" }}>
        <select style={{ fontFamily: F, fontSize: 12, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>March 2026</option><option>February 2026</option></select>
        <select style={{ fontFamily: F, fontSize: 12, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>All voucher types</option></select>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Date</TH><TH>Voucher no.</TH><TH>Type</TH><TH>Narration</TH><TH right>Debit (₹)</TH><TH right>Credit (₹)</TH><TH right>Balance (₹)</TH></tr></thead>
        <tbody>
          <tr style={{ background: T.amberBg }}><TD bold>1 Mar</TD><TD>—</TD><TD><Badge c="gray" s="xs">Opening</Badge></TD><TD bold>Opening balance brought forward</TD><TD mono right bold>—</TD><TD mono right>—</TD><TD mono right bold color={T.blue}>{INRfull(161958)}</TD></tr>
          {LEDGER_ENTRIES.map((e, i) => (
            <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={ev => ev.currentTarget.style.background = T.bdr2} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
              <TD>{e.date}</TD>
              <TD mono bold color={T.blue}>{e.vNo}</TD>
              <TD><Badge c={voucherColors[e.type] || "gray"} s="xs">{e.type}</Badge></TD>
              <TD>{e.narr}</TD>
              <TD mono right bold color={e.dr ? T.blue : undefined}>{e.dr ? INRfull(e.dr) : ""}</TD>
              <TD mono right color={e.cr ? T.red : undefined}>{e.cr ? INRfull(e.cr) : ""}</TD>
              <TD mono right bold>{INRfull(e.bal)}</TD>
            </tr>
          ))}
          <tr style={{ background: T.blueBg }}><TD bold>20 Mar</TD><TD>—</TD><TD><Badge c="blue" s="xs">Closing</Badge></TD><TD bold>Closing balance</TD><TD mono right bold>{INRfull(1659630)}</TD><TD mono right bold>{INRfull(1019248)}</TD><TD mono right bold color={T.blue}>{INRfull(842500)}</TD></tr>
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══ SCREEN: DAY BOOK ═══ */
const DayBook = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div><div style={{ fontSize: 11, color: T.ink4 }}>Finance › Day Book</div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Day book</h2></div>
      <Btn>Export</Btn>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
      <input type="date" defaultValue="2026-03-20" style={{ fontFamily: F, fontSize: 13, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }} />
      <span style={{ alignSelf: "center", color: T.ink4 }}>to</span>
      <input type="date" defaultValue="2026-03-20" style={{ fontFamily: F, fontSize: 13, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }} />
      <select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>All types</option></select>
    </div>
    <Card noPad>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Date</TH><TH>Voucher no.</TH><TH>Type</TH><TH>Narration</TH><TH right>Debit (₹)</TH><TH right>Credit (₹)</TH></tr></thead>
        <tbody>
          {DAYBOOK.map((e, i) => (
            <tr key={i} style={{ cursor: "pointer" }} onMouseEnter={ev => ev.currentTarget.style.background = T.bdr2} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
              <TD>{e.date}</TD><TD mono bold color={T.blue}>{e.vNo}</TD>
              <TD><Badge c={voucherColors[e.type] || "gray"} s="xs">{e.type}</Badge></TD>
              <TD>{e.narr}</TD><TD mono right bold>{INRfull(e.dr)}</TD><TD mono right bold>{INRfull(e.cr)}</TD>
            </tr>
          ))}
          <tr style={{ background: T.bg }}><TD></TD><TD></TD><TD></TD><TD bold>Day total (20 Mar 2026)</TD><TD mono right bold color={T.blue}>{INRfull(481170)}</TD><TD mono right bold color={T.red}>{INRfull(481170)}</TD></tr>
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══ SCREEN: TRIAL BALANCE ═══ */
const TrialBalance = () => {
  const totalDr = COA_DATA.flatMap(g => g.accounts).filter(a => a.dr).reduce((s, a) => s + Math.abs(a.balance), 0);
  const totalCr = COA_DATA.flatMap(g => g.accounts).filter(a => !a.dr).reduce((s, a) => s + Math.abs(a.balance), 0);
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div><div style={{ fontSize: 11, color: T.ink4 }}>Finance › Trial Balance</div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Trial balance</h2></div>
      <div style={{ display: "flex", gap: 8 }}><select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>As of 20 Mar 2026</option></select><Btn>Export</Btn></div>
    </div>
    {Math.abs(totalDr - totalCr) < 1 && <div style={{ background: T.greenBg, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: T.greenTx, fontWeight: 600 }}>✓ Trial balance is balanced — Debit total equals Credit total</div>}
    <Card noPad>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><TH>Account code</TH><TH>Account name</TH><TH>Group</TH><TH right>Debit (₹)</TH><TH right>Credit (₹)</TH></tr></thead>
        <tbody>
          {COA_DATA.flatMap(g => g.accounts.map(a => ({ ...a, group: g.group, gColor: g.color }))).filter(a => a.balance !== 0).map((a, i) => (
            <tr key={i}><TD mono>{a.code}</TD><TD bold>{a.name}</TD><TD><Badge c={a.gColor} s="xs">{a.group}</Badge></TD><TD mono right bold color={a.dr ? T.blue : undefined}>{a.dr ? INRfull(Math.abs(a.balance)) : ""}</TD><TD mono right bold color={!a.dr ? T.red : undefined}>{!a.dr ? INRfull(Math.abs(a.balance)) : ""}</TD></tr>
          ))}
          <tr style={{ background: T.bg, borderTop: `2px solid ${T.bdr}` }}><TD></TD><TD bold>TOTAL</TD><TD></TD><TD mono right bold color={T.blue}>{INRfull(totalDr)}</TD><TD mono right bold color={T.red}>{INRfull(totalCr)}</TD></tr>
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══ SCREEN: P&L ═══ */
const ProfitLoss = () => {
  const rev = { freight: 3284000, fuel: 186400, loading: 124800, detention: 42600, penalty: 18400, interest: 12800 };
  const totalRev = Object.values(rev).reduce((a, b) => a + b, 0);
  const direct = { fuel: 1128400, toll: 284600, driverAllow: 186200, food: 62400, loading: 98600, hire: 842000 };
  const totalDirect = Object.values(direct).reduce((a, b) => a + b, 0);
  const gross = totalRev - totalDirect;
  const overhead = { maintenance: 186400, insurance: 124000, depreciation: 162000, salary: 486000, rent: 180000, gps: 24000, slaPenalty: 18600, bank: 8400, misc: 12600 };
  const totalOverhead = Object.values(overhead).reduce((a, b) => a + b, 0);
  const net = gross - totalOverhead;

  const Row = ({ label, value, bold, indent, color, sub }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: bold ? "10px 0" : "5px 0", borderTop: bold ? `1px solid ${T.bdr}` : "none", marginLeft: indent ? 20 : 0 }}>
      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 400, color: sub ? T.ink3 : T.ink }}>{label}</span>
      <span style={{ fontFamily: M, fontSize: 13, fontWeight: bold ? 800 : 600, color: color || T.ink }}>{INRfull(value)}</span>
    </div>
  );

  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div><div style={{ fontSize: 11, color: T.ink4 }}>Finance › Profit & Loss</div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Profit & loss statement</h2></div>
      <div style={{ display: "flex", gap: 8 }}><select style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.bdr}` }}><option>FY 2025-26 (Apr-Mar)</option></select><Btn>Export</Btn></div>
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <Metric label="Total revenue" value={INR(totalRev)} color={T.green} />
      <Metric label="Direct costs" value={INR(totalDirect)} color={T.red} />
      <Metric label="Gross margin" value={`${((gross / totalRev) * 100).toFixed(1)}%`} sub={INR(gross)} color={gross > 0 ? T.green : T.red} />
      <Metric label="Net profit" value={INR(net)} color={net > 0 ? T.green : T.red} sub={`${((net / totalRev) * 100).toFixed(1)}% margin`} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <SL>Revenue</SL>
        <Row label="Freight revenue" value={rev.freight} indent />
        <Row label="Fuel surcharge revenue" value={rev.fuel} indent sub />
        <Row label="Loading / unloading revenue" value={rev.loading} indent sub />
        <Row label="Detention revenue" value={rev.detention} indent sub />
        <Row label="Penalty income (from vendors)" value={rev.penalty} indent sub />
        <Row label="Interest income" value={rev.interest} indent sub />
        <Row label="Total revenue" value={totalRev} bold color={T.green} />

        <div style={{ marginTop: 16 }}><SL>Direct trip costs</SL></div>
        <Row label="Diesel / fuel" value={direct.fuel} indent />
        <Row label="Toll charges" value={direct.toll} indent sub />
        <Row label="Driver allowance" value={direct.driverAllow} indent sub />
        <Row label="Driver food" value={direct.food} indent sub />
        <Row label="Loading / unloading labour" value={direct.loading} indent sub />
        <Row label="Vehicle hire charges" value={direct.hire} indent />
        <Row label="Total direct costs" value={totalDirect} bold color={T.red} />

        <div style={{ marginTop: 12, background: gross > 0 ? T.greenBg : T.redBg, borderRadius: 8, padding: "12px 16px" }}>
          <Row label="GROSS PROFIT" value={gross} bold color={gross > 0 ? T.greenTx : T.redTx} />
          <div style={{ fontSize: 11, color: T.ink3, textAlign: "right" }}>Gross margin: {((gross / totalRev) * 100).toFixed(1)}%</div>
        </div>
      </Card>
      <Card>
        <SL>Overheads & indirect expenses</SL>
        <Row label="Vehicle maintenance" value={overhead.maintenance} indent />
        <Row label="Vehicle insurance" value={overhead.insurance} indent sub />
        <Row label="Depreciation" value={overhead.depreciation} indent sub />
        <Row label="Salary & wages" value={overhead.salary} indent />
        <Row label="Office rent" value={overhead.rent} indent sub />
        <Row label="GPS / tracking" value={overhead.gps} indent sub />
        <Row label="SLA penalties (to clients)" value={overhead.slaPenalty} indent sub />
        <Row label="Bank charges" value={overhead.bank} indent sub />
        <Row label="Miscellaneous" value={overhead.misc} indent sub />
        <Row label="Total overheads" value={totalOverhead} bold color={T.red} />

        <div style={{ marginTop: 16, background: net > 0 ? T.greenBg : T.redBg, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: net > 0 ? T.greenTx : T.redTx }}>NET PROFIT</span>
            <span style={{ fontFamily: M, fontSize: 22, fontWeight: 900, color: net > 0 ? T.greenTx : T.redTx }}>{INRfull(net)}</span>
          </div>
          <div style={{ fontSize: 12, color: T.ink3, textAlign: "right", marginTop: 4 }}>Net margin: {((net / totalRev) * 100).toFixed(1)}% · Revenue: {INR(totalRev)}</div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SL>Margin waterfall</SL>
          <div style={{ display: "flex", gap: 4, height: 110, alignItems: "flex-end", padding: "0 8px" }}>
            {[
              { label: "Revenue", v: 100, color: T.green },
              { label: "Fuel", v: (direct.fuel / totalRev) * 100, color: T.red },
              { label: "Hire", v: (direct.hire / totalRev) * 100, color: T.red },
              { label: "Toll+DA", v: ((direct.toll + direct.driverAllow + direct.food + direct.loading) / totalRev) * 100, color: T.red },
              { label: "Overheads", v: (totalOverhead / totalRev) * 100, color: T.amber },
              { label: "Profit", v: (net / totalRev) * 100, color: T.green },
            ].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.ink3, marginBottom: 4 }}>{Math.round(b.v)}%</span>
                <div style={{ width: "70%", height: Math.max(b.v * 0.9, 4), background: b.color, borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
                <span style={{ fontSize: 8, color: T.ink4, marginTop: 3 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>);
};

/* ═══ SCREEN: EXPORT CENTER ═══ */
const ExportCenter = () => (
  <div>
    <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, color: T.ink4 }}>Finance › Export Center</div><h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Export center</h2></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
      {[
        { name: "Tally Prime", icon: "📗", desc: "XML format with masters & vouchers", format: "Tally XML", color: T.green },
        { name: "SAP Business One", icon: "📘", desc: "CSV with G/L mapping & cost centers", format: "SAP DI CSV", color: T.blue },
        { name: "Zoho Books", icon: "📕", desc: "API sync or CSV import", format: "Zoho CSV / API", color: T.red },
        { name: "Generic CSV", icon: "📊", desc: "Universal journal register & trial balance", format: "CSV / Excel", color: T.purple },
      ].map(e => (
        <Card key={e.name} style={{ cursor: "pointer", transition: "box-shadow .15s" }} onMouseEnter={ev => ev.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"} onMouseLeave={ev => ev.currentTarget.style.boxShadow = "none"}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{e.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{e.name}</div>
          <div style={{ fontSize: 12, color: T.ink3, marginBottom: 10 }}>{e.desc}</div>
          <Badge c={e.name === "Tally Prime" ? "green" : e.name === "SAP Business One" ? "blue" : e.name === "Zoho Books" ? "red" : "purple"} s="xs">{e.format}</Badge>
          <div style={{ marginTop: 12 }}><Btn v="primary" sz="sm" style={{ width: "100%" }}>Export →</Btn></div>
        </Card>
      ))}
    </div>
    <Card>
      <SL>What gets exported</SL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["Chart of Accounts (Masters)", "All ledger accounts with group hierarchy, opening balances, Tally group mapping"],
          ["Sales Vouchers", "Client invoices with line items, GST breakup, HSN codes, party ledger"],
          ["Receipt Vouchers", "Payment receipts with bank details, UTR, TDS, allocation against invoices"],
          ["Payment Vouchers", "Vendor settlements, driver payouts, advance disbursements"],
          ["Journal Vouchers", "Revenue recognition, fuel/toll expenses, depreciation, adjustments"],
          ["Credit / Debit Notes", "Shortage deductions, rate corrections, penalty adjustments with GST reversal"],
        ].map(([title, desc], i) => (
          <div key={i} style={{ background: T.bg, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{title}</div>
            <div style={{ fontSize: 11, color: T.ink3 }}>{desc}</div>
          </div>
        ))}
      </div>
    </Card>
    <Card style={{ marginTop: 16 }}>
      <SL>Export history</SL>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{["Date", "Format", "Period", "Type", "Records", "Status", ""].map(h => <TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {[
            ["20 Mar 2026", "Tally XML", "Mar 1-20, 2026", "Masters + Vouchers", "42 accounts, 186 vouchers", "success"],
            ["01 Mar 2026", "Generic CSV", "Feb 2026", "Journal register", "248 entries", "success"],
            ["01 Mar 2026", "Tally XML", "Feb 2026", "Vouchers only", "248 vouchers", "success"],
            ["01 Feb 2026", "Zoho API", "Jan 2026", "Full sync", "198 invoices + payments", "success"],
          ].map((r, i) => (
            <tr key={i}><TD>{r[0]}</TD><TD><Badge c={r[1].includes("Tally") ? "green" : r[1].includes("Zoho") ? "red" : "purple"} s="xs">{r[1]}</Badge></TD><TD>{r[2]}</TD><TD>{r[3]}</TD><TD>{r[4]}</TD><TD><Badge c="green" s="xs">{r[5]}</Badge></TD><TD><Btn sz="sm">Re-download</Btn></TD></tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══ MAIN ═══ */
export default function App() {
  const [screen, setScreen] = useState("coa");
  const [selectedAccount, setSelectedAccount] = useState(null);

  const nav = [
    { id: "coa", label: "Chart of accounts", icon: "📋" },
    { id: "ledger", label: "Ledger", icon: "📖" },
    { id: "daybook", label: "Day book", icon: "📅" },
    { id: "trial", label: "Trial balance", icon: "⚖️" },
    { id: "pnl", label: "Profit & loss", icon: "📈" },
    { id: "export", label: "Export center", icon: "📤" },
  ];

  return (
    <div style={{ fontFamily: F, color: T.ink, background: T.bg, minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: T.card, borderBottom: `1px solid ${T.bdr}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 6, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: T.blue, padding: "12px 16px 12px 0", borderRight: `1px solid ${T.bdr}`, marginRight: 8 }}>TripFlow</div>
        <div style={{ fontWeight: 600, fontSize: 13, color: T.ink3, padding: "12px 12px", borderRight: `1px solid ${T.bdr}`, marginRight: 4 }}>Finance</div>
        {nav.map(n => (
          <button key={n.id} onClick={() => { setScreen(n.id); setSelectedAccount(null); }} style={{ fontFamily: F, fontSize: 13, fontWeight: 600, padding: "12px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap", background: "transparent", color: screen === n.id ? T.blue : T.ink3, borderBottom: screen === n.id ? `2px solid ${T.blue}` : "2px solid transparent" }}>
            <span style={{ marginRight: 5 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {screen === "coa" && !selectedAccount && <ChartOfAccounts onSelectAccount={a => { setSelectedAccount(a); setScreen("ledger"); }} />}
        {screen === "ledger" && <AccountLedger account={selectedAccount} onBack={() => { setScreen("coa"); setSelectedAccount(null); }} />}
        {screen === "daybook" && <DayBook />}
        {screen === "trial" && <TrialBalance />}
        {screen === "pnl" && <ProfitLoss />}
        {screen === "export" && <ExportCenter />}
      </div>
    </div>
  );
}
