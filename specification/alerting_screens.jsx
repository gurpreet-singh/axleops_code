import { useState, useMemo } from "react";

const T={bg:"#f5f6f8",card:"#fff",ink:"#101828",ink2:"#344054",ink3:"#667085",ink4:"#98a2b3",bdr:"#e4e7ec",bdr2:"#f2f4f7",blue:"#1570ef",blueBg:"#eff8ff",blueTx:"#175cd3",green:"#12b76a",greenBg:"#ecfdf3",greenTx:"#027a48",red:"#f04438",redBg:"#fef3f2",redTx:"#b42318",amber:"#f79009",amberBg:"#fffaeb",amberTx:"#b54708",purple:"#7a5af8",purpleBg:"#f4f3ff",purpleTx:"#5925dc",teal:"#0e9384",tealBg:"#f0fdf9",tealTx:"#107569",coral:"#ef6820",coralBg:"#fff6ed",coralTx:"#b93815"};
const F=`'DM Sans',system-ui,sans-serif`,M=`'JetBrains Mono',monospace`;

const Badge=({children,c="blue",s})=>{const m={blue:[T.blueBg,T.blueTx],green:[T.greenBg,T.greenTx],red:[T.redBg,T.redTx],amber:[T.amberBg,T.amberTx],purple:[T.purpleBg,T.purpleTx],teal:[T.tealBg,T.tealTx],coral:[T.coralBg,T.coralTx],gray:[T.bdr2,T.ink3]};const[bg,fg]=m[c]||m.blue;return<span style={{display:"inline-flex",alignItems:"center",padding:s==="xs"?"1px 7px":"3px 10px",borderRadius:6,fontSize:s==="xs"?9:11,fontWeight:600,background:bg,color:fg,textTransform:"uppercase",letterSpacing:".04em",whiteSpace:"nowrap"}}>{children}</span>};
const Btn=({children,v="default",sz="md",onClick,style:st})=>{const b={fontFamily:F,fontWeight:600,borderRadius:8,cursor:"pointer",border:"none",display:"inline-flex",alignItems:"center",gap:5,transition:"all .12s",fontSize:sz==="sm"?12:13,padding:sz==="sm"?"5px 12px":"8px 18px"};const vs={default:{background:T.card,color:T.ink2,border:`1px solid ${T.bdr}`},primary:{background:T.blue,color:"#fff"},danger:{background:T.red,color:"#fff"},success:{background:T.green,color:"#fff"},ghost:{background:"transparent",color:T.ink3}};return<button style={{...b,...vs[v],...st}} onClick={onClick}>{children}</button>};
const Card=({children,style:st,noPad})=><div style={{background:T.card,borderRadius:12,border:`1px solid ${T.bdr}`,padding:noPad?0:"18px 22px",...st}}>{children}</div>;
const Metric=({label,value,sub,color})=><div style={{background:T.card,borderRadius:10,border:`1px solid ${T.bdr}`,padding:"14px 18px",flex:1,minWidth:120}}><div style={{fontSize:10,fontWeight:700,color:T.ink4,letterSpacing:".05em",textTransform:"uppercase",marginBottom:6}}>{label}</div><div style={{fontSize:24,fontWeight:800,color:color||T.ink,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:11,color:T.ink4,marginTop:4}}>{sub}</div>}</div>;
const TH=({children,right})=><th style={{padding:"9px 12px",textAlign:right?"right":"left",fontSize:10,fontWeight:700,color:T.ink4,textTransform:"uppercase",letterSpacing:".04em",borderBottom:`1px solid ${T.bdr}`,background:T.bg,whiteSpace:"nowrap",position:"sticky",top:0}}>{children}</th>;
const TD=({children,mono,bold,color,right})=><td style={{padding:"10px 12px",fontSize:12,fontFamily:mono?M:F,fontWeight:bold?700:400,color:color||T.ink,borderBottom:`1px solid ${T.bdr2}`,textAlign:right?"right":"left",whiteSpace:"nowrap"}}>{children}</td>;
const Tabs=({tabs,active,onChange})=><div style={{display:"flex",gap:1,borderBottom:`1px solid ${T.bdr}`,marginBottom:16,overflowX:"auto"}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{fontFamily:F,fontSize:13,fontWeight:600,padding:"10px 14px",border:"none",cursor:"pointer",background:"transparent",color:active===t.id?T.blue:T.ink3,borderBottom:active===t.id?`2px solid ${T.blue}`:"2px solid transparent",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>{t.icon&&<span>{t.icon}</span>}{t.label}{t.count!=null&&<span style={{fontSize:10,fontWeight:700,background:active===t.id?T.blueBg:t.color?{red:T.redBg,amber:T.amberBg}[t.color]||T.bdr2:T.bdr2,color:active===t.id?T.blueTx:t.color?{red:T.redTx,amber:T.amberTx}[t.color]||T.ink4:T.ink4,padding:"1px 7px",borderRadius:10}}>{t.count}</span>}</button>)}</div>;
const SL=({children})=><div style={{fontSize:10,fontWeight:700,color:T.ink4,letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>{children}</div>;
const Avatar=({name,sz=28})=>{const i=name.split(" ").map(w=>w[0]).join("").slice(0,2);const h=name.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;return<div style={{width:sz,height:sz,borderRadius:"50%",background:`hsl(${h},50%,92%)`,color:`hsl(${h},50%,35%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.36,fontWeight:700,flexShrink:0}}>{i}</div>};
const Bar=({v,mx,color})=><div style={{height:5,background:T.bdr2,borderRadius:3,overflow:"hidden",width:"100%"}}><div style={{height:"100%",width:`${Math.min((v/mx)*100,100)}%`,background:color||T.blue,borderRadius:3,transition:"width .5s"}}/></div>;

const sevColors={Critical:"red",High:"coral",Medium:"amber",Low:"gray",Info:"blue"};
const sevIcons={Critical:"🔴",High:"🟠",Medium:"🟡",Low:"⚪",Info:"🔵"};
const catColors={Financial:"green",Operational:"amber",Driver:"purple",Compliance:"teal"};
const catIcons={Financial:"💰",Operational:"🚛",Driver:"👤",Compliance:"📋"};
const statusColors={Open:"red",Acknowledged:"amber","Investigating":"purple",Escalated:"coral",Resolved:"green","False Positive":"gray",Dismissed:"gray","Auto-Closed":"gray"};

const ALERTS=[
  {id:"ALT-260320-001",title:"LOSS-MAKING TRIP — Estimated Loss ₹8,200",desc:"TRP-0142 (Mumbai → Kolkata) — Expenses ₹1,20,200 have exceeded revenue ₹1,12,000. Fuel cost ₹68,400 is 42% above route average.",trip:"TRP-0142",category:"Financial",severity:"Critical",status:"Open",assignee:"Priya Menon",triggered:"3 min ago",slaRemaining:"27 min",occurrences:1,impact:"₹8,200",route:"Mumbai → Kolkata",driver:"Vikram S.",vehicle:"MH04AB1234"},
  {id:"ALT-260320-002",title:"EXPENSE OVERRUN — 38% above estimate",desc:"TRP-0139 (Delhi → Jaipur) — Actual ₹38,400 vs Estimated ₹27,800. Major overrun in Diesel (₹12,600 over) and Misc (₹4,200 unreceipted).",trip:"TRP-0139",category:"Financial",severity:"Critical",status:"Open",assignee:"Rahul Gupta",triggered:"12 min ago",slaRemaining:"18 min",occurrences:1,impact:"₹10,600",route:"Delhi → Jaipur",driver:"Manoj K.",vehicle:"DL01EF9012"},
  {id:"ALT-260320-003",title:"ROUTE DEVIATION — 85 km off-route detected",desc:"TRP-0141 (Mumbai → Pune) — Vehicle MH12EF9012 deviated near Lonavala. Last GPS: 18.7548°N, 73.4013°E.",trip:"TRP-0141",category:"Operational",severity:"Critical",status:"Acknowledged",assignee:"Dispatch Ops",triggered:"28 min ago",slaRemaining:"2 min",occurrences:14,impact:null,route:"Mumbai → Pune",driver:"Anita V.",vehicle:"MH12EF9012"},
  {id:"ALT-260320-004",title:"INSURANCE EXPIRED — Vehicle non-compliant",desc:"Vehicle MH04CD5678 insurance (ICICI Lombard #LB-9291) expired today at midnight while in transit.",trip:"TRP-0138",category:"Compliance",severity:"Critical",status:"Open",assignee:"Compliance Mgr",triggered:"1 hr ago",slaRemaining:"BREACHED",occurrences:1,impact:null,route:"Mumbai → Chennai",driver:"Sanjay P.",vehicle:"MH04CD5678"},
  {id:"ALT-260320-005",title:"Fuel cost anomaly — ₹4.2/km vs ₹3.1/km avg",desc:"TRP-0140 fuel cost per km is 35% above route baseline for Mumbai → Hyderabad.",trip:"TRP-0140",category:"Financial",severity:"High",status:"Open",assignee:"Fleet Mgr",triggered:"Today 14:22",slaRemaining:"1h 38m",occurrences:1,impact:"₹8,580",route:"Mumbai → Hyderabad",driver:"Deepak J.",vehicle:"MH04MN6789"},
  {id:"ALT-260320-006",title:"Trip delayed — 4.5 hrs behind schedule",desc:"TRP-0137 was expected at 10:00 AM, current ETA is 2:30 PM. SLA deadline: 3:00 PM.",trip:"TRP-0137",category:"Operational",severity:"High",status:"Open",assignee:"Fleet Mgr",triggered:"Today 13:45",slaRemaining:"1h 15m",occurrences:3,impact:null,route:"Delhi → Lucknow",driver:"Amit S.",vehicle:"DL05ST9012"},
  {id:"ALT-260320-007",title:"Frequent cash withdrawals — 5 in 2 days (₹14,200)",desc:"Driver on TRP-0142 has made 5 cash withdrawals totaling ₹14,200 in 2 days. Pattern flagged.",trip:"TRP-0142",category:"Driver",severity:"High",status:"Open",assignee:"Accounts",triggered:"Today 12:30",slaRemaining:"0h 30m",occurrences:5,impact:"₹14,200",route:"Mumbai → Kolkata",driver:"Vikram S.",vehicle:"MH04AB1234"},
  {id:"ALT-260320-008",title:"Missing receipts — 3 expenses (₹6,800) unreceipted",desc:"TRP-0136 has 3 expenses without receipt photos totaling ₹6,800.",trip:"TRP-0136",category:"Driver",severity:"Medium",status:"Open",assignee:"Accounts",triggered:"Today 11:15",slaRemaining:"6h 45m",occurrences:3,impact:"₹6,800",route:"Mumbai → Bangalore",driver:"Kiran D.",vehicle:"MH04QR5678"},
  {id:"ALT-260320-009",title:"Idle vehicle — Stationary 6+ hrs at Udaipur",desc:"TRP-0135 has been stationary for over 6 hours. Possible breakdown.",trip:"TRP-0135",category:"Operational",severity:"High",status:"Investigating",assignee:"Dispatch Ops",triggered:"Today 09:00",slaRemaining:"In progress",occurrences:1,impact:null,route:"Jamnagar → Delhi",driver:"Ravi K.",vehicle:"GJ01OP1234"},
  {id:"ALT-260320-010",title:"Permit expiry in 3 days — NP-8823",desc:"National Permit #NP-8823 for MH04AB1234 expires on 23 Mar.",trip:"TRP-0134",category:"Compliance",severity:"Medium",status:"Open",assignee:"Compliance Mgr",triggered:"Yesterday",slaRemaining:"7h",occurrences:1,impact:null,route:null,driver:null,vehicle:"MH04AB1234"},
  {id:"ALT-260320-011",title:"Fuel efficiency improving — 4.8 kmpl vs 4.2 kmpl",desc:"Vehicle MH04GH3456 fuel efficiency improved 14% vs last month average.",trip:"TRP-0133",category:"Financial",severity:"Info",status:"Resolved",assignee:"Fleet Mgr",triggered:"Yesterday",slaRemaining:null,occurrences:1,impact:"+₹2,100",route:"Mumbai → Ahmedabad",driver:"Vikram Y.",vehicle:"MH04GH3456"},
  {id:"ALT-260320-012",title:"Trip completed under budget — saved ₹4,200",desc:"TRP-0131 completed with ₹4,200 less than estimated expenses.",trip:"TRP-0131",category:"Financial",severity:"Info",status:"Resolved",assignee:"Owner",triggered:"May 12",slaRemaining:null,occurrences:1,impact:"-₹4,200",route:"Mumbai → Delhi",driver:"Rajesh K.",vehicle:"MH04AB1234"},
  // Compound alert
  {id:"ALT-260320-013",title:"⚠ COMPOUND: Driver Vikram S. — 4 alerts in 48 hrs",desc:"Pattern detected: Loss-making trip + Fuel anomaly + Frequent cash withdrawals + Expense overrun. Financial irregularity cluster flagged for investigation.",trip:"TRP-0142",category:"Driver",severity:"Critical",status:"Open",assignee:"Owner",triggered:"Just now",slaRemaining:"30 min",occurrences:4,impact:"₹31,000",route:"Multiple",driver:"Vikram S.",vehicle:"MH04AB1234",isCompound:true,childIds:["ALT-260320-001","ALT-260320-005","ALT-260320-007"]},
];

const RULES=[
  {id:"R-001",name:"Loss-making trip detection",category:"Financial",severity:"Critical",threshold:"Margin < 0%",mode:"Real-time",channels:["In-app","Push","SMS","WhatsApp"],assignTo:"Auto (trip dispatcher)",dedupWindow:"—",active:true,fires30d:3,falsePositiveRate:"0%"},
  {id:"R-002",name:"Expense overrun detection",category:"Financial",severity:"Critical",threshold:">15% above estimate",mode:"Real-time",channels:["In-app","Push","SMS"],assignTo:"Auto (trip dispatcher)",dedupWindow:"1h",active:true,fires30d:8,falsePositiveRate:"12%"},
  {id:"R-003",name:"Fuel cost anomaly",category:"Financial",severity:"High",threshold:">20% above route baseline",mode:"Real-time",channels:["In-app","Push","Email"],assignTo:"Fleet Manager",dedupWindow:"1h",active:true,fires30d:14,falsePositiveRate:"18%",hasDynamicBaseline:true},
  {id:"R-004",name:"Cash advance overspend",category:"Financial",severity:"High",threshold:">₹5,000 over advance",mode:"Batch (6h)",channels:["In-app","Email"],assignTo:"Accounts Lead",dedupWindow:"24h",active:true,fires30d:6,falsePositiveRate:"5%"},
  {id:"R-005",name:"Route deviation detection",category:"Operational",severity:"Critical",threshold:">20 km off planned route",mode:"Real-time",channels:["In-app","Push","SMS","WhatsApp"],assignTo:"On-duty dispatcher",dedupWindow:"1h",active:true,fires30d:5,falsePositiveRate:"8%"},
  {id:"R-006",name:"Trip delay — SLA at risk",category:"Operational",severity:"High",threshold:">2 hours behind ETA",mode:"Real-time",channels:["In-app","Push"],assignTo:"Fleet Manager",dedupWindow:"30m",active:true,fires30d:22,falsePositiveRate:"10%"},
  {id:"R-007",name:"Vehicle stationary > 2 hours",category:"Operational",severity:"High",threshold:"No GPS movement > 2h",mode:"Real-time",channels:["In-app","Push"],assignTo:"Dispatch Ops",dedupWindow:"2h",active:true,fires30d:11,falsePositiveRate:"25%"},
  {id:"R-008",name:"Overspeeding",category:"Driver",severity:"High",threshold:"> 80 km/h (loaded)",mode:"Real-time",channels:["In-app","Push"],assignTo:"Fleet Manager",dedupWindow:"15m",active:true,fires30d:34,falsePositiveRate:"5%"},
  {id:"R-009",name:"Frequent cash withdrawals",category:"Driver",severity:"High",threshold:"> 3 withdrawals in 24h",mode:"Real-time",channels:["In-app","Email"],assignTo:"Accounts Lead",dedupWindow:"24h",active:true,fires30d:4,falsePositiveRate:"0%"},
  {id:"R-010",name:"Vehicle insurance expiring",category:"Compliance",severity:"High",threshold:"Expires within 7 days",mode:"Batch (daily 9AM)",channels:["In-app","Email","Push"],assignTo:"Compliance Officer",dedupWindow:"24h",active:true,fires30d:3,falsePositiveRate:"0%"},
  {id:"R-011",name:"Insurance expired during trip",category:"Compliance",severity:"Critical",threshold:"Insurance expired + in transit",mode:"Real-time",channels:["In-app","Push","SMS","WhatsApp"],assignTo:"Compliance Officer",dedupWindow:"—",active:true,fires30d:1,falsePositiveRate:"0%"},
  {id:"R-012",name:"Driver pattern detection (compound)",category:"Driver",severity:"Critical",threshold:"3+ alerts, same driver, 7 days",mode:"Real-time",channels:["In-app","Push","SMS"],assignTo:"Owner",dedupWindow:"7d",active:true,fires30d:2,falsePositiveRate:"0%",isCompound:true},
];

/* ═══ SCREEN: ALERT COMMAND CENTER ═══ */
const AlertCommandCenter=({onSelectAlert})=>{
  const[catFilter,setCatFilter]=useState("all");
  const[sevFilter,setSevFilter]=useState("all");
  const criticals=ALERTS.filter(a=>a.severity==="Critical"&&(a.status==="Open"||a.status==="Acknowledged"));
  const counts={all:ALERTS.length,Financial:ALERTS.filter(a=>a.category==="Financial").length,Operational:ALERTS.filter(a=>a.category==="Operational").length,Driver:ALERTS.filter(a=>a.category==="Driver").length,Compliance:ALERTS.filter(a=>a.category==="Compliance").length};
  const filtered=ALERTS.filter(a=>(catFilter==="all"||a.category===catFilter)&&(sevFilter==="all"||a.severity===sevFilter));

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:11,color:T.ink4}}>Intelligence › Alert Command Center</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Alert command center</h2></div>
      <div style={{display:"flex",gap:8}}><Btn>Export</Btn><Btn v="primary">🔔 Mark all read</Btn></div>
    </div>

    <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <Metric label="Critical open" value={criticals.length} color={T.red} sub="Requires immediate action"/>
      <Metric label="Total open" value={ALERTS.filter(a=>["Open","Acknowledged","Investigating"].includes(a.status)).length} color={T.amber}/>
      <Metric label="MTTA" value="4.2 min" sub="Target: 5 min" color={T.green}/>
      <Metric label="MTTR" value="22 min" sub="Target: 30 min" color={T.green}/>
      <Metric label="Resolved today" value="7" color={T.green}/>
      <Metric label="SLA breached" value="1" color={T.red} sub="ALT-260320-004"/>
    </div>

    {/* Critical banner */}
    {criticals.length>0&&(<Card style={{background:"#fef3f2",border:"1.5px solid #fecdca",marginBottom:16,padding:"14px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:14,fontWeight:800,color:T.redTx}}>⚠ Critical alerts — requires immediate action</span>
        <span style={{fontSize:12,fontWeight:700,color:T.red}}>{criticals.length} active</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {criticals.map(a=>(
          <div key={a.id} onClick={()=>onSelectAlert(a)} style={{background:T.card,borderRadius:10,padding:"14px 18px",border:`1px solid ${T.bdr}`,cursor:"pointer",display:"flex",alignItems:"start",gap:14,transition:"box-shadow .12s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{width:36,height:36,borderRadius:10,background:a.isCompound?"#fee4e2":"#fef3f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.isCompound?"⚡":a.category==="Financial"?"₹":a.category==="Operational"?"🚛":a.category==="Compliance"?"📋":"👤"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:T.redTx,marginBottom:3}}>{a.title}</div>
              <div style={{fontSize:11,color:T.ink3,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.desc}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <Badge c={catColors[a.category]} s="xs">{a.category}</Badge>
                <Badge c="red" s="xs">Critical</Badge>
                {a.trip&&<Badge c="blue" s="xs">{a.trip}</Badge>}
                {a.vehicle&&<span style={{fontSize:10,color:T.ink4}}>{a.vehicle}</span>}
                {a.isCompound&&<Badge c="purple" s="xs">Compound · {a.occurrences} linked</Badge>}
                {a.occurrences>1&&!a.isCompound&&<span style={{fontSize:10,color:T.ink4}}>({a.occurrences} occurrences)</span>}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
              <span style={{fontSize:10,color:T.ink4}}>{a.triggered}</span>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <Avatar name={a.assignee} sz={20}/>
                <span style={{fontSize:10,color:T.ink3}}>{a.assignee}</span>
              </div>
              <div style={{fontSize:10,fontWeight:700,fontFamily:M,color:a.slaRemaining==="BREACHED"?T.red:parseInt(a.slaRemaining)<5?T.red:T.amber}}>SLA: {a.slaRemaining}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>)}

    {/* Tabs + table */}
    <Tabs active={catFilter} onChange={setCatFilter} tabs={[
      {id:"all",label:"All alerts",count:counts.all,icon:"🔔"},
      {id:"Financial",label:"Financial",count:counts.Financial,icon:"💰",color:"red"},
      {id:"Operational",label:"Operational",count:counts.Operational,icon:"🚛",color:"amber"},
      {id:"Driver",label:"Driver",count:counts.Driver,icon:"👤"},
      {id:"Compliance",label:"Compliance",count:counts.Compliance,icon:"📋"},
    ]}/>

    <Card noPad>
      <div style={{padding:"10px 16px",display:"flex",gap:8,alignItems:"center",borderBottom:`1px solid ${T.bdr}`}}>
        <input placeholder="Search alerts..." style={{fontFamily:F,fontSize:12,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,width:170}}/>
        <select value={sevFilter} onChange={e=>setSevFilter(e.target.value)} style={{fontFamily:F,fontSize:11,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`}}>
          <option value="all">Severity ▾</option>{["Critical","High","Medium","Low","Info"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select style={{fontFamily:F,fontSize:11,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`}}><option>Status ▾</option></select>
        <select style={{fontFamily:F,fontSize:11,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`}}><option>Assignee ▾</option></select>
        <div style={{flex:1}}/>
        <span style={{fontSize:11,color:T.ink4}}>1 – {filtered.length} of {filtered.length}</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["","Alert","Trip","Category","Severity","Assigned to","Triggered","SLA","Status",""].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {filtered.map(a=>(
            <tr key={a.id} onClick={()=>onSelectAlert(a)} style={{cursor:"pointer",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.bdr2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <TD><span style={{fontSize:14}}>{sevIcons[a.severity]}</span></TD>
              <TD><div style={{maxWidth:320}}><div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>{a.occurrences>1&&<span style={{fontSize:9,color:T.ink4}}>({a.occurrences}x)</span>}</div></TD>
              <TD mono bold color={T.blue}>{a.trip}</TD>
              <TD><Badge c={catColors[a.category]} s="xs">{a.category}</Badge></TD>
              <TD><Badge c={sevColors[a.severity]} s="xs">{a.severity}</Badge></TD>
              <TD><div style={{display:"flex",alignItems:"center",gap:5}}><Avatar name={a.assignee} sz={22}/><span style={{fontSize:11}}>{a.assignee}</span></div></TD>
              <TD>{a.triggered}</TD>
              <TD>{a.slaRemaining?<span style={{fontFamily:M,fontSize:11,fontWeight:600,color:a.slaRemaining==="BREACHED"?T.red:a.slaRemaining.includes("min")&&parseInt(a.slaRemaining)<10?T.red:T.ink3}}>{a.slaRemaining}</span>:"—"}</TD>
              <TD><Badge c={statusColors[a.status]} s="xs">{a.status}</Badge></TD>
              <TD><Btn sz="sm" v="ghost">👁</Btn></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══ SCREEN: ALERT DETAIL ═══ */
const AlertDetail=({alert:a,onBack})=>{
  const[tab,setTab]=useState("detail");
  if(!a)a=ALERTS[0];

  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:T.ink4}}>←</button>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontFamily:M,fontSize:12,fontWeight:600,color:T.ink4}}>{a.id}</span>
          <Badge c={sevColors[a.severity]}>{a.severity}</Badge>
          <Badge c={catColors[a.category]}>{a.category}</Badge>
          <Badge c={statusColors[a.status]}>{a.status}</Badge>
          {a.isCompound&&<Badge c="purple">Compound alert</Badge>}
        </div>
        <h2 style={{margin:"6px 0 0",fontSize:18,fontWeight:800,color:a.severity==="Critical"?T.redTx:T.ink}}>{a.title}</h2>
      </div>
      <div style={{display:"flex",gap:6}}>
        {a.status==="Open"&&<Btn v="primary" sz="sm">Acknowledge</Btn>}
        {(a.status==="Open"||a.status==="Acknowledged")&&<Btn v="success" sz="sm">Investigate</Btn>}
        <Btn sz="sm">Reassign</Btn>
        <Btn sz="sm">Escalate</Btn>
        <Btn sz="sm" v="ghost">Dismiss</Btn>
      </div>
    </div>

    <Tabs active={tab} onChange={setTab} tabs={[
      {id:"detail",label:"Alert detail"},{id:"investigation",label:"Investigation"},{id:"timeline",label:"Timeline"},{id:"related",label:"Related alerts"}
    ]}/>

    {tab==="detail"&&(<div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card>
          <SL>Alert description</SL>
          <p style={{margin:0,fontSize:13,color:T.ink2,lineHeight:1.6}}>{a.desc}</p>
        </Card>

        <Card>
          <SL>Data snapshot (at time of alert)</SL>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              ["Route",a.route||"—"],["Driver",a.driver||"—"],["Vehicle",a.vehicle||"—"],
              ["Trip",a.trip||"—"],["Occurrences",a.occurrences],["Financial impact",a.impact||"No direct impact"],
            ].map(([l,v])=>(
              <div key={l} style={{background:T.bg,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:9,color:T.ink4,textTransform:"uppercase",letterSpacing:".04em",marginBottom:3}}>{l}</div>
                <div style={{fontSize:13,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
          {a.category==="Financial"&&(<div style={{marginTop:12,background:T.amberBg,borderRadius:8,padding:"10px 14px"}}>
            <div style={{fontSize:12,fontWeight:700,color:T.amberTx,marginBottom:4}}>Financial breakdown</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
              {[["Estimated","₹27,800"],["Actual","₹38,400"],["Overrun","₹10,600"],["Overrun %","38%"]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:9,color:T.amberTx}}>{l}</div><div style={{fontSize:12,fontWeight:700}}>{v}</div></div>
              ))}
            </div>
          </div>)}
        </Card>

        {a.isCompound&&(<Card style={{border:`1.5px solid ${T.purple}`}}>
          <SL>Linked alerts (compound pattern)</SL>
          <p style={{margin:"0 0 10px",fontSize:12,color:T.ink3}}>This compound alert was auto-generated because multiple alerts were detected for the same driver within 48 hours.</p>
          {["ALT-260320-001 — Loss-making trip (₹8,200 loss)","ALT-260320-005 — Fuel cost anomaly (35% above baseline)","ALT-260320-007 — Frequent cash withdrawals (5 in 2 days)"].map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:i<2?`1px solid ${T.bdr2}`:"none"}}>
              <span style={{fontSize:12}}>🔗</span>
              <span style={{fontSize:12,color:T.blue,fontWeight:600}}>{c}</span>
            </div>
          ))}
        </Card>)}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card>
          <SL>Assignment</SL>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <Avatar name={a.assignee} sz={36}/>
            <div><div style={{fontSize:13,fontWeight:700}}>{a.assignee}</div><div style={{fontSize:10,color:T.ink4}}>Assigned · L1</div></div>
          </div>
          <Btn sz="sm" style={{width:"100%"}}>Reassign →</Btn>
        </Card>

        <Card>
          <SL>SLA status</SL>
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:28,fontWeight:800,fontFamily:M,color:a.slaRemaining==="BREACHED"?T.red:T.amber}}>{a.slaRemaining||"—"}</div>
            <div style={{fontSize:11,color:T.ink4,marginTop:4}}>
              {a.severity==="Critical"?"Critical SLA: 30 min resolve":a.severity==="High"?"High SLA: 2h resolve":"Medium SLA: 8h resolve"}
            </div>
            {a.slaRemaining&&a.slaRemaining!=="BREACHED"&&a.slaRemaining!=="In progress"&&(
              <div style={{marginTop:8}}><Bar v={75} mx={100} color={T.amber}/></div>
            )}
            {a.slaRemaining==="BREACHED"&&<div style={{marginTop:8,fontSize:11,fontWeight:700,color:T.red}}>⚠ SLA BREACHED — Auto-escalated to L2</div>}
          </div>
        </Card>

        <Card>
          <SL>Notification log</SL>
          {[
            {ch:"In-app",to:a.assignee,time:"Instant",status:"Delivered"},
            {ch:"Push",to:a.assignee,time:"+2s",status:"Delivered"},
            {ch:"SMS",to:"+91 98765 43210",time:"+8s",status:"Delivered"},
          ].map((n,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<2?`1px solid ${T.bdr2}`:"none",fontSize:11}}>
              <span><Badge c={n.ch==="SMS"?"amber":"blue"} s="xs">{n.ch}</Badge> → {n.to}</span>
              <Badge c="green" s="xs">{n.status}</Badge>
            </div>
          ))}
        </Card>

        <Card>
          <SL>Quick actions</SL>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {a.driver&&<Btn sz="sm" style={{width:"100%",justifyContent:"center"}}>📞 Call driver ({a.driver})</Btn>}
            {a.trip&&<Btn sz="sm" style={{width:"100%",justifyContent:"center"}}>📍 Track live ({a.trip})</Btn>}
            <Btn sz="sm" style={{width:"100%",justifyContent:"center"}}>📋 View trip detail</Btn>
            <Btn sz="sm" v="danger" style={{width:"100%",justifyContent:"center"}}>⬆ Escalate to L2</Btn>
          </div>
        </Card>
      </div>
    </div>)}

    {tab==="investigation"&&(<Card>
      <SL>Investigation form</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Root cause category *</label>
          <select style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%"}}><option>Select root cause...</option><option>Driver error</option><option>Vehicle issue</option><option>Route issue</option><option>Weather</option><option>Fraud suspected</option><option>False alarm</option><option>External factor</option></select></div>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Disciplinary action</label>
          <select style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%"}}><option>None</option><option>Verbal warning</option><option>Written warning</option><option>Fine deducted</option><option>Suspension</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Root cause detail *</label>
          <textarea placeholder="Describe what caused this alert..." style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%",height:80,resize:"vertical"}}/></div>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Corrective action taken *</label>
          <textarea placeholder="What was done to fix the immediate problem?" style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%",height:60,resize:"vertical"}}/></div>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Preventive action</label>
          <textarea placeholder="What will prevent recurrence?" style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%",height:60,resize:"vertical"}}/></div>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Financial impact (₹)</label>
          <input type="number" placeholder="0" style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%"}}/></div>
        <div><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Recurrence check date</label>
          <input type="date" style={{fontFamily:F,fontSize:13,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%"}}/></div>
        <div style={{gridColumn:"1/-1"}}><label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Evidence (photos, receipts, screenshots)</label>
          <div style={{border:`1.5px dashed ${T.bdr}`,borderRadius:8,padding:20,textAlign:"center",color:T.ink4,fontSize:12}}>Drop files here or click to upload</div></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16,justifyContent:"flex-end"}}>
        <Btn>Save draft</Btn>
        <Btn v="success">Resolve alert</Btn>
        <Btn v="ghost">Mark as false positive</Btn>
      </div>
    </Card>)}

    {tab==="timeline"&&(<Card>
      <SL>Alert timeline</SL>
      <div style={{position:"relative",paddingLeft:28}}>
        <div style={{position:"absolute",left:9,top:4,bottom:4,width:2,background:T.bdr2}}/>
        {[
          {label:"Alert fired",detail:`Rule "${a.category}" triggered for ${a.trip}`,time:a.triggered,color:T.red,done:true},
          {label:"Notifications sent",detail:"In-app + Push + SMS delivered to "+a.assignee,time:"+2s",color:T.blue,done:true},
          {label:"Auto-assigned",detail:`Assigned to ${a.assignee} (L1 — trip dispatcher)`,time:"+3s",color:T.purple,done:true},
          ...(a.status!=="Open"?[{label:"Acknowledged",detail:`${a.assignee} acknowledged the alert`,time:"+4 min",color:T.amber,done:true}]:[{label:"Awaiting acknowledgement",detail:`SLA: ${a.slaRemaining} remaining`,time:"Now",color:T.amber,active:true}]),
          ...(a.status==="Investigating"?[{label:"Investigation started",detail:"Root cause analysis in progress",time:"+8 min",color:T.purple,active:true}]:[]),
          ...(a.status==="Resolved"?[{label:"Resolved",detail:"Root cause identified. Action taken.",time:"+22 min",color:T.green,done:true}]:[]),
        ].map((ev,i)=>(
          <div key={i} style={{position:"relative",marginBottom:18}}>
            <div style={{position:"absolute",left:-28,top:2,width:18,height:18,borderRadius:"50%",background:ev.active?T.amber:ev.done?ev.color:T.bdr2,border:`2px solid ${ev.active?T.amber:ev.done?ev.color:T.bdr}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {ev.done&&<span style={{color:"#fff",fontSize:10,fontWeight:700}}>✓</span>}
              {ev.active&&<span style={{width:5,height:5,borderRadius:"50%",background:"#fff"}}/>}
            </div>
            <div style={{fontSize:13,fontWeight:600,color:ev.active?T.amber:T.ink}}>{ev.label}</div>
            <div style={{fontSize:11,color:T.ink3}}>{ev.detail}</div>
            <div style={{fontSize:10,color:T.ink4,marginTop:2}}>{ev.time}</div>
          </div>
        ))}
      </div>
    </Card>)}

    {tab==="related"&&(<Card>
      <SL>Related alerts for same entities</SL>
      <p style={{margin:"0 0 12px",fontSize:12,color:T.ink3}}>Alerts involving the same driver ({a.driver}), vehicle ({a.vehicle}), or route ({a.route}) in the last 30 days:</p>
      {ALERTS.filter(x=>x.id!==a.id&&(x.driver===a.driver||x.vehicle===a.vehicle)).map(x=>(
        <div key={x.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.bdr2}`}}>
          <Badge c={sevColors[x.severity]} s="xs">{x.severity}</Badge>
          <Badge c={catColors[x.category]} s="xs">{x.category}</Badge>
          <span style={{fontSize:12,fontWeight:600,flex:1}}>{x.title}</span>
          <Badge c={statusColors[x.status]} s="xs">{x.status}</Badge>
          <span style={{fontSize:10,color:T.ink4}}>{x.triggered}</span>
        </div>
      ))}
    </Card>)}
  </div>);
};

/* ═══ SCREEN: RULE ENGINE ═══ */
const RuleEngine=()=>{
  const[catFilter,setCatFilter]=useState("all");
  const filtered=RULES.filter(r=>catFilter==="all"||r.category===catFilter);
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div><div style={{fontSize:11,color:T.ink4}}>Intelligence › Rule Engine</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Alerting rules</h2></div>
      <div style={{display:"flex",gap:8}}><Btn>Configure thresholds</Btn><Btn>Export</Btn><Btn v="primary">+ Add rule</Btn></div>
    </div>
    <Tabs active={catFilter} onChange={setCatFilter} tabs={[
      {id:"all",label:"All rules",count:RULES.length},{id:"Financial",label:"Financial",count:RULES.filter(r=>r.category==="Financial").length,icon:"💰"},
      {id:"Operational",label:"Operational",count:RULES.filter(r=>r.category==="Operational").length,icon:"🚛"},
      {id:"Driver",label:"Driver",count:RULES.filter(r=>r.category==="Driver").length,icon:"👤"},
      {id:"Compliance",label:"Compliance",count:RULES.filter(r=>r.category==="Compliance").length,icon:"📋"},
    ]}/>
    <Card noPad>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Rule name","Category","Severity","Threshold","Mode","Channels","Assign to","Dedup","Fires (30d)","FP rate","Status"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {filtered.map(r=>(
            <tr key={r.id} style={{transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=T.bdr2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <TD><div><div style={{fontWeight:600,fontSize:12}}>{r.name}</div><div style={{fontSize:9,color:T.ink4}}>{r.id}{r.hasDynamicBaseline&&" · 📊 Dynamic baseline"}{r.isCompound&&" · ⚡ Compound"}</div></div></TD>
              <TD><Badge c={catColors[r.category]} s="xs">{r.category}</Badge></TD>
              <TD><Badge c={sevColors[r.severity]} s="xs">{r.severity}</Badge></TD>
              <TD>{r.threshold}</TD>
              <TD><Badge c={r.mode==="Real-time"?"blue":"teal"} s="xs">{r.mode}</Badge></TD>
              <TD><div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{r.channels.map(ch=><span key={ch} style={{fontSize:8,background:T.bdr2,padding:"1px 5px",borderRadius:4,color:T.ink3}}>{ch}</span>)}</div></TD>
              <TD><span style={{fontSize:11}}>{r.assignTo}</span></TD>
              <TD><span style={{fontSize:11,color:T.ink4}}>{r.dedupWindow}</span></TD>
              <TD bold color={r.fires30d>15?T.amber:T.ink}>{r.fires30d}</TD>
              <TD><span style={{fontSize:11,fontWeight:600,color:r.falsePositiveRate!=="0%"&&parseInt(r.falsePositiveRate)>15?T.amber:T.green}}>{r.falsePositiveRate}</span></TD>
              <TD><div style={{display:"flex",gap:4}}><Btn sz="sm" v="ghost">✏️</Btn><div style={{width:32,height:18,borderRadius:9,background:r.active?T.green:T.bdr,position:"relative",cursor:"pointer"}}><div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:r.active?16:2,transition:"left .15s"}}/></div></div></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══ SCREEN: ANALYTICS ═══ */
const AlertAnalytics=()=>{
  const driverAlerts=[{name:"Vikram S.",count:8,trips:3},{name:"Manoj K.",count:5,trips:2},{name:"Kiran D.",count:4,trips:3},{name:"Amit S.",count:3,trips:2},{name:"Anita V.",count:2,trips:1}];
  return(<div>
    <div style={{marginBottom:16}}><div style={{fontSize:11,color:T.ink4}}>Intelligence › Analytics</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Alert analytics</h2></div>
    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <Metric label="Total (30 days)" value="142" sub="↓ 8% from last month" color={T.blue}/>
      <Metric label="Critical" value="12" sub="8.4% of total" color={T.red}/>
      <Metric label="Avg MTTA" value="4.2 min" sub="Target: 5 min ✓" color={T.green}/>
      <Metric label="Avg MTTR" value="22 min" sub="Target: 30 min ✓" color={T.green}/>
      <Metric label="SLA compliance" value="94%" sub="Target: 95%" color={T.amber}/>
      <Metric label="False positive" value="11%" sub="Target: <10%" color={T.amber}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <SL>Alert volume — last 7 days</SL>
        <div style={{display:"flex",gap:4,height:100,alignItems:"flex-end",padding:"0 8px"}}>
          {[18,22,14,26,20,31,11].map((v,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{fontSize:9,fontWeight:600,color:T.ink3,marginBottom:3}}>{v}</span>
              <div style={{width:"65%",height:v*3,background:i===6?T.blue:`${T.blue}60`,borderRadius:"3px 3px 0 0"}}/>
              <span style={{fontSize:8,color:T.ink4,marginTop:3}}>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SL>Category distribution</SL>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}>
            {[["Financial",38,T.green],["Operational",42,T.amber],["Driver",34,T.purple],["Compliance",28,T.teal]].map(([cat,count,color])=>(
              <div key={cat} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{fontWeight:600}}>{cat}</span><span style={{color:T.ink3}}>{count}</span>
                </div>
                <Bar v={count} mx={50} color={color}/>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <SL>Top offending drivers (30 days)</SL>
        {driverAlerts.map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<4?`1px solid ${T.bdr2}`:"none"}}>
            <span style={{fontSize:12,fontWeight:700,color:T.ink4,width:20}}>{i+1}.</span>
            <Avatar name={d.name} sz={26}/>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600}}>{d.name}</div><div style={{fontSize:10,color:T.ink4}}>{d.trips} trips with alerts</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <Bar v={d.count} mx={10} color={d.count>5?T.red:T.amber}/>
              <span style={{fontSize:12,fontWeight:700,color:d.count>5?T.red:T.ink,minWidth:20}}>{d.count}</span>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <SL>Resolution root causes (30 days)</SL>
        {[["Driver error",28,T.red],["Vehicle issue",18,T.amber],["External factor",15,T.blue],["Route issue",12,T.teal],["False alarm",11,T.ink4],["Fraud suspected",4,T.red],["Other",8,T.ink3]].map(([cause,count,color],i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<6?`1px solid ${T.bdr2}`:"none"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
            <span style={{flex:1,fontSize:12}}>{cause}</span>
            <span style={{fontSize:12,fontWeight:700,fontFamily:M}}>{count}</span>
            <span style={{fontSize:10,color:T.ink4,width:36}}>{Math.round(count/96*100)}%</span>
          </div>
        ))}
      </Card>
      <Card style={{gridColumn:"1/-1"}}>
        <SL>Financial impact of detected issues (30 days)</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
          <div style={{background:T.redBg,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:10,color:T.redTx,textTransform:"uppercase",fontWeight:600}}>Total losses detected</div><div style={{fontSize:22,fontWeight:800,color:T.red,marginTop:4}}>₹2,84,600</div></div>
          <div style={{background:T.amberBg,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:10,color:T.amberTx,textTransform:"uppercase",fontWeight:600}}>Expense overruns caught</div><div style={{fontSize:22,fontWeight:800,color:T.amber,marginTop:4}}>₹1,42,800</div></div>
          <div style={{background:T.greenBg,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:10,color:T.greenTx,textTransform:"uppercase",fontWeight:600}}>Recovered / prevented</div><div style={{fontSize:22,fontWeight:800,color:T.green,marginTop:4}}>₹86,400</div></div>
          <div style={{background:T.purpleBg,borderRadius:8,padding:"12px 14px"}}><div style={{fontSize:10,color:T.purpleTx,textTransform:"uppercase",fontWeight:600}}>Fraud investigations</div><div style={{fontSize:22,fontWeight:800,color:T.purple,marginTop:4}}>2 active</div></div>
        </div>
      </Card>
    </div>
  </div>);
};

/* ═══ SCREEN: ESCALATION CONFIG ═══ */
const EscalationConfig=()=>(
  <div>
    <div style={{marginBottom:16}}><div style={{fontSize:11,color:T.ink4}}>Intelligence › Escalation Matrix</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Escalation matrix</h2></div>
    <Card noPad>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Severity","L1 (initial)","ACK SLA","L2 (escalation)","Resolve SLA","L3 (management)","Final escalation","Channels"].map(h=><TH key={h}>{h}</TH>)}</tr></thead>
        <tbody>
          {[
            {sev:"Critical",l1:"On-duty dispatcher",ack:"5 min",l2:"Fleet Mgr + Owner",res:"30 min",l3:"CEO / MD",final:"1 hour",ch:"All channels"},
            {sev:"High",l1:"Fleet Manager",ack:"15 min",l2:"Ops Head",res:"2 hours",l3:"Owner",final:"4 hours",ch:"In-app, Push, Email"},
            {sev:"Medium",l1:"Assigned ops staff",ack:"1 hour",l2:"Fleet Manager",res:"8 hours",l3:"Ops Head",final:"24 hours",ch:"In-app, Email"},
            {sev:"Low",l1:"Assigned ops staff",ack:"4 hours",l2:"Fleet Manager",res:"24 hours",l3:"—",final:"48 hours",ch:"In-app only"},
            {sev:"Info",l1:"Notification only",ack:"—",l2:"—",res:"Auto-close 7d",l3:"—",final:"—",ch:"In-app only"},
          ].map((r,i)=>(
            <tr key={i}>
              <TD><Badge c={sevColors[r.sev]}>{r.sev}</Badge></TD>
              <TD bold>{r.l1}</TD>
              <TD><span style={{fontFamily:M,fontSize:12,fontWeight:600,color:T.amber}}>{r.ack}</span></TD>
              <TD bold>{r.l2}</TD>
              <TD><span style={{fontFamily:M,fontSize:12,fontWeight:600,color:T.red}}>{r.res}</span></TD>
              <TD>{r.l3}</TD>
              <TD><span style={{fontSize:11,color:T.ink3}}>{r.final}</span></TD>
              <TD><span style={{fontSize:10,color:T.ink4}}>{r.ch}</span></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:16}}>
      <Card>
        <SL>On-duty rotation schedule</SL>
        {[
          {day:"Mon-Fri (Day)",person:"Priya Menon",time:"8 AM - 8 PM"},
          {day:"Mon-Fri (Night)",person:"Rahul Gupta",time:"8 PM - 8 AM"},
          {day:"Saturday",person:"Vikram Singh",time:"8 AM - 8 PM"},
          {day:"Sunday / Holiday",person:"Dispatch Auto-assign",time:"24 hours"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<3?`1px solid ${T.bdr2}`:"none"}}>
            <span style={{fontSize:12,fontWeight:600,minWidth:120}}>{r.day}</span>
            <Avatar name={r.person} sz={24}/>
            <span style={{flex:1,fontSize:12}}>{r.person}</span>
            <span style={{fontSize:11,color:T.ink4}}>{r.time}</span>
          </div>
        ))}
      </Card>
      <Card>
        <SL>Notification channel settings</SL>
        {[
          {ch:"In-app notifications",status:"Always on",config:"Cannot disable"},
          {ch:"Push notifications",status:"Enabled",config:"Per-user opt-in/out"},
          {ch:"SMS (Msg91)",status:"Enabled",config:"Critical only by default"},
          {ch:"WhatsApp Business",status:"Enabled",config:"WABA template approved"},
          {ch:"Email (SendGrid)",status:"Enabled",config:"Digest: hourly for Medium+"},
          {ch:"Webhook",status:"Configured",config:"POST to ops dashboard"},
          {ch:"Client portal alerts",status:"Enabled",config:"Delay + delivery alerts only"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<6?`1px solid ${T.bdr2}`:"none"}}>
            <span style={{fontSize:12,fontWeight:600,flex:1}}>{r.ch}</span>
            <Badge c="green" s="xs">{r.status}</Badge>
            <span style={{fontSize:10,color:T.ink4,maxWidth:160}}>{r.config}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

/* ═══ MAIN ═══ */
export default function App(){
  const[screen,setScreen]=useState("command");
  const[selectedAlert,setSelectedAlert]=useState(null);

  const nav=[
    {id:"command",label:"Command center",icon:"🚨"},
    {id:"rules",label:"Rule engine",icon:"⚙️"},
    {id:"analytics",label:"Analytics",icon:"📊"},
    {id:"escalation",label:"Escalation matrix",icon:"⬆"},
  ];

  return(
    <div style={{fontFamily:F,color:T.ink,background:T.bg,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{background:T.card,borderBottom:`1px solid ${T.bdr}`,padding:"0 24px",display:"flex",alignItems:"center",gap:6,position:"sticky",top:0,zIndex:10}}>
        <div style={{fontWeight:800,fontSize:14,color:T.blue,padding:"12px 16px 12px 0",borderRight:`1px solid ${T.bdr}`,marginRight:8}}>TripFlow</div>
        <div style={{fontWeight:600,fontSize:13,color:T.ink3,padding:"12px 12px",borderRight:`1px solid ${T.bdr}`,marginRight:4}}>Intelligence</div>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>{setScreen(n.id);setSelectedAlert(null);}} style={{fontFamily:F,fontSize:13,fontWeight:600,padding:"12px 14px",border:"none",cursor:"pointer",whiteSpace:"nowrap",background:"transparent",color:screen===n.id?T.blue:T.ink3,borderBottom:screen===n.id?`2px solid ${T.blue}`:"2px solid transparent"}}>
            <span style={{marginRight:5}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div style={{padding:"18px 22px",maxWidth:1440,margin:"0 auto"}}>
        {screen==="command"&&!selectedAlert&&<AlertCommandCenter onSelectAlert={a=>{setSelectedAlert(a);setScreen("detail");}}/>}
        {screen==="detail"&&<AlertDetail alert={selectedAlert} onBack={()=>{setScreen("command");setSelectedAlert(null);}}/>}
        {screen==="rules"&&<RuleEngine/>}
        {screen==="analytics"&&<AlertAnalytics/>}
        {screen==="escalation"&&<EscalationConfig/>}
      </div>
    </div>
  );
}
