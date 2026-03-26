import { useState, useMemo } from "react";

const T={bg:"#f5f6f8",card:"#fff",ink:"#101828",ink2:"#344054",ink3:"#667085",ink4:"#98a2b3",bdr:"#e4e7ec",bdr2:"#f2f4f7",blue:"#1570ef",blueBg:"#eff8ff",blueTx:"#175cd3",green:"#12b76a",greenBg:"#ecfdf3",greenTx:"#027a48",red:"#f04438",redBg:"#fef3f2",redTx:"#b42318",amber:"#f79009",amberBg:"#fffaeb",amberTx:"#b54708",purple:"#7a5af8",purpleBg:"#f4f3ff",purpleTx:"#5925dc",teal:"#0e9384",tealBg:"#f0fdf9",tealTx:"#107569"};
const F=`'DM Sans',system-ui,sans-serif`,M=`'JetBrains Mono',monospace`;
const Badge=({children,c="blue",s})=>{const m={blue:[T.blueBg,T.blueTx],green:[T.greenBg,T.greenTx],red:[T.redBg,T.redTx],amber:[T.amberBg,T.amberTx],purple:[T.purpleBg,T.purpleTx],teal:[T.tealBg,T.tealTx],gray:[T.bdr2,T.ink3]};const[bg,fg]=m[c]||m.blue;return<span style={{display:"inline-flex",alignItems:"center",padding:s==="xs"?"1px 7px":"3px 10px",borderRadius:6,fontSize:s==="xs"?9:11,fontWeight:600,background:bg,color:fg,textTransform:"uppercase",letterSpacing:".04em",whiteSpace:"nowrap"}}>{children}</span>};
const Btn=({children,v="default",sz="md",onClick,style:st})=>{const b={fontFamily:F,fontWeight:600,borderRadius:8,cursor:"pointer",border:"none",display:"inline-flex",alignItems:"center",gap:5,transition:"all .12s",fontSize:sz==="sm"?11:13,padding:sz==="sm"?"4px 10px":"8px 18px"};const vs={default:{background:T.card,color:T.ink2,border:`1px solid ${T.bdr}`},primary:{background:T.blue,color:"#fff"},success:{background:T.green,color:"#fff"},danger:{background:T.red,color:"#fff"},ghost:{background:"transparent",color:T.ink3}};return<button style={{...b,...vs[v],...st}} onClick={onClick}>{children}</button>};
const Card=({children,style:st,noPad})=><div style={{background:T.card,borderRadius:12,border:`1px solid ${T.bdr}`,padding:noPad?0:"18px 22px",...st}}>{children}</div>;
const Metric=({label,value,sub,color})=><div style={{background:T.card,borderRadius:10,border:`1px solid ${T.bdr}`,padding:"12px 16px",flex:1,minWidth:110}}><div style={{fontSize:9,fontWeight:700,color:T.ink4,letterSpacing:".05em",textTransform:"uppercase",marginBottom:5}}>{label}</div><div style={{fontSize:22,fontWeight:800,color:color||T.ink,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:10,color:T.ink4,marginTop:3}}>{sub}</div>}</div>;
const Avatar=({name,sz=24})=>{const i=name.split(" ").map(w=>w[0]).join("").slice(0,2);const h=name.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;return<div style={{width:sz,height:sz,borderRadius:"50%",background:`hsl(${h},50%,92%)`,color:`hsl(${h},50%,35%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.36,fontWeight:700,flexShrink:0}}>{i}</div>};
const SL=({children})=><div style={{fontSize:10,fontWeight:700,color:T.ink4,letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
const Bar=({v,mx,color})=><div style={{height:5,background:T.bdr2,borderRadius:3,overflow:"hidden",width:"100%"}}><div style={{height:"100%",width:`${Math.min((v/mx)*100,100)}%`,background:color||T.blue,borderRadius:3}}/></div>;
const INR=n=>n==null?"—":`₹${Math.abs(n).toLocaleString("en-IN")}`;

const mvColors={Fast:"green",Medium:"amber",Slow:"red",Dead:"gray"};
const healthColors={Under:"red",Correct:"green",Over:"amber",Dead:"gray"};
const coverageColor=w=>w===null||w===Infinity?"gray":w<3?"red":w<6?"amber":"green";

// ═══ PARTS DATA ═══
const PARTS=[
  {id:"P001",pn:"OIL-5W30-5L",name:"Engine Oil 5W30 (5L)",cat:"Fluids",uom:"Units",consumable:false,vendor:"Castrol India",vendorContact:{name:"Amit Desai",phone:"+91 98765 00001",email:"amit@castrol.com"},unitCost:1850,stock:24,weeklyConsumption:4.2,weeksCoverage:5.7,safetyStock:9,reorderPoint:15,recommended:20,moq:12,leadTime:5,movement:"Fast",health:"Correct",invValue:44400,openPoQty:0,openPoValue:0,payTerms:30},
  {id:"P002",pn:"BRK-PAD-TATA-F",name:"Brake Pad Set — Tata Front",cat:"Brakes",uom:"Units",consumable:false,vendor:"Brembo India",vendorContact:{name:"Suresh K.",phone:"+91 98765 00002",email:"suresh@brembo.in"},unitCost:3200,stock:4,weeklyConsumption:1.8,weeksCoverage:2.2,safetyStock:4,reorderPoint:7,recommended:10,moq:6,leadTime:7,movement:"Fast",health:"Under",invValue:12800,openPoQty:6,openPoValue:19200,payTerms:30},
  {id:"P003",pn:"TYR-295-80-MRF",name:"MRF 295/80 R22.5 Tyre",cat:"Tyres",uom:"Units",consumable:false,vendor:"CEAT Tyre Zone",vendorContact:{name:"Rajesh P.",phone:"+91 98765 00003",email:"rajesh@ceat.com"},unitCost:18500,stock:8,weeklyConsumption:1.2,weeksCoverage:6.7,safetyStock:3,reorderPoint:5,recommended:8,moq:4,leadTime:10,movement:"Fast",health:"Correct",invValue:148000,openPoQty:4,openPoValue:74000,payTerms:45},
  {id:"P004",pn:"FLT-OIL-MANN",name:"Oil Filter — Mann",cat:"Filters",uom:"Units",consumable:false,vendor:"Boodmo Auto Parts",vendorContact:{name:"Priya S.",phone:"+91 98765 00004",email:"priya@boodmo.com"},unitCost:450,stock:42,weeklyConsumption:3.5,weeksCoverage:12.0,safetyStock:8,reorderPoint:12,recommended:18,moq:24,leadTime:7,movement:"Fast",health:"Over",invValue:18900,openPoQty:0,openPoValue:0,payTerms:15},
  {id:"P005",pn:"FLT-AIR-MANN",name:"Air Filter — Mann",cat:"Filters",uom:"Units",consumable:false,vendor:"Boodmo Auto Parts",vendorContact:{name:"Priya S.",phone:"+91 98765 00004",email:"priya@boodmo.com"},unitCost:680,stock:36,weeklyConsumption:3.2,weeksCoverage:11.3,safetyStock:7,reorderPoint:11,recommended:17,moq:24,leadTime:7,movement:"Fast",health:"Over",invValue:24480,openPoQty:0,openPoValue:0,payTerms:15},
  {id:"P006",pn:"GRS-LITHIUM-1K",name:"Lithium Grease",cat:"Consumables",uom:"Kg",consumable:true,vendor:"Gulf Oil India",vendorContact:{name:"Vikram M.",phone:"+91 98765 00005",email:"vikram@gulfoil.in"},unitCost:320,stock:8.5,weeklyConsumption:1.8,weeksCoverage:4.7,safetyStock:4,reorderPoint:6,recommended:9,moq:5,leadTime:5,movement:"Fast",health:"Correct",invValue:2720,openPoQty:0,openPoValue:0,payTerms:0},
  {id:"P007",pn:"NUT-M12-HEX",name:"Hex Nut M12 (assorted)",cat:"Consumables",uom:"Kg",consumable:true,vendor:"Sai Hardware",vendorContact:{name:"Mohan L.",phone:"+91 98765 00006",email:"mohan@saihw.com"},unitCost:180,stock:12.0,weeklyConsumption:2.4,weeksCoverage:5.0,safetyStock:5,reorderPoint:8,recommended:11,moq:5,leadTime:3,movement:"Fast",health:"Correct",invValue:2160,openPoQty:0,openPoValue:0,payTerms:0},
  {id:"P008",pn:"BLT-FAN-GATES",name:"Fan Belt — Gates",cat:"Engine",uom:"Units",consumable:false,vendor:"Gates India",vendorContact:{name:"Deepak R.",phone:"+91 98765 00007",email:"deepak@gates.com"},unitCost:1200,stock:6,weeklyConsumption:0.8,weeksCoverage:7.5,safetyStock:2,reorderPoint:3,recommended:5,moq:4,leadTime:7,movement:"Medium",health:"Correct",invValue:7200,openPoQty:0,openPoValue:0,payTerms:30},
  {id:"P009",pn:"BAT-EXIDE-150",name:"Exide 150Ah Battery",cat:"Electrical",uom:"Units",consumable:false,vendor:"Exide Industries",vendorContact:{name:"Kiran T.",phone:"+91 98765 00008",email:"kiran@exide.in"},unitCost:12500,stock:3,weeklyConsumption:0.3,weeksCoverage:10.0,safetyStock:1,reorderPoint:2,recommended:3,moq:2,leadTime:14,movement:"Medium",health:"Correct",invValue:37500,openPoQty:0,openPoValue:0,payTerms:60},
  {id:"P010",pn:"CLT-COOLANT-5L",name:"Coolant Fluid (5L)",cat:"Fluids",uom:"Units",consumable:false,vendor:"Castrol India",vendorContact:{name:"Amit Desai",phone:"+91 98765 00001",email:"amit@castrol.com"},unitCost:850,stock:18,weeklyConsumption:2.0,weeksCoverage:9.0,safetyStock:4,reorderPoint:7,recommended:10,moq:6,leadTime:5,movement:"Fast",health:"Over",invValue:15300,openPoQty:0,openPoValue:0,payTerms:30},
  {id:"P011",pn:"SUS-BUSH-POLY",name:"Polyurethane Suspension Bush",cat:"Suspension",uom:"Units",consumable:false,vendor:"Rane Holdings",vendorContact:{name:"Anita V.",phone:"+91 98765 00009",email:"anita@rane.in"},unitCost:2800,stock:14,weeklyConsumption:0,weeksCoverage:Infinity,safetyStock:2,reorderPoint:3,recommended:5,moq:4,leadTime:10,movement:"Dead",health:"Dead",invValue:39200,openPoQty:0,openPoValue:0,payTerms:45},
  {id:"P012",pn:"EXH-GASKET-SET",name:"Exhaust Gasket Set",cat:"Engine",uom:"Units",consumable:false,vendor:"Elgi Rubber",vendorContact:{name:"Ramesh D.",phone:"+91 98765 00010",email:"ramesh@elgi.com"},unitCost:950,stock:22,weeklyConsumption:0.2,weeksCoverage:110.0,safetyStock:1,reorderPoint:2,recommended:3,moq:6,leadTime:14,movement:"Slow",health:"Dead",invValue:20900,openPoQty:0,openPoValue:0,payTerms:30},
  {id:"P013",pn:"TRN-FLUID-ATF",name:"ATF Transmission Fluid (1L)",cat:"Fluids",uom:"Units",consumable:false,vendor:"Gulf Oil India",vendorContact:{name:"Vikram M.",phone:"+91 98765 00005",email:"vikram@gulfoil.in"},unitCost:420,stock:2,weeklyConsumption:1.5,weeksCoverage:1.3,safetyStock:3,reorderPoint:5,recommended:8,moq:6,leadTime:5,movement:"Fast",health:"Under",invValue:840,openPoQty:0,openPoValue:0,payTerms:0},
  {id:"P014",pn:"WSH-FLAT-M10",name:"Flat Washer M10 (assorted)",cat:"Consumables",uom:"Kg",consumable:true,vendor:"Sai Hardware",vendorContact:{name:"Mohan L.",phone:"+91 98765 00006",email:"mohan@saihw.com"},unitCost:140,stock:6.5,weeklyConsumption:1.0,weeksCoverage:6.5,safetyStock:2,reorderPoint:4,recommended:6,moq:5,leadTime:3,movement:"Fast",health:"Correct",invValue:910,openPoQty:0,openPoValue:0,payTerms:0},
  // Second vendor row for same part
  {id:"P002b",pn:"BRK-PAD-TATA-F",name:"Brake Pad Set — Tata Front",cat:"Brakes",uom:"Units",consumable:false,vendor:"Rane Holdings",vendorContact:{name:"Anita V.",phone:"+91 98765 00009",email:"anita@rane.in"},unitCost:3400,stock:4,weeklyConsumption:1.8,weeksCoverage:2.2,safetyStock:4,reorderPoint:7,recommended:10,moq:4,leadTime:10,movement:"Fast",health:"Under",invValue:12800,openPoQty:0,openPoValue:0,payTerms:45,isAltVendor:true},
];

const TH=({children,right,sortKey,sortState,onSort})=>{
  const active=sortState?.key===sortKey;
  const dir=active?sortState.dir:null;
  return<th onClick={sortKey?()=>onSort(sortKey):undefined} style={{padding:"8px 10px",textAlign:right?"right":"left",fontSize:9,fontWeight:700,color:active?T.blue:T.ink4,textTransform:"uppercase",letterSpacing:".04em",borderBottom:`1px solid ${T.bdr}`,background:T.bg,whiteSpace:"nowrap",position:"sticky",top:0,cursor:sortKey?"pointer":"default",userSelect:"none"}}>
    {children}{sortKey&&<span style={{marginLeft:3,opacity:active?1:0.3}}>{dir==="asc"?"▲":dir==="desc"?"▼":"⇅"}</span>}
  </th>;
};
const TD=({children,mono,bold,color,right})=><td style={{padding:"9px 10px",fontSize:12,fontFamily:mono?M:F,fontWeight:bold?700:400,color:color||T.ink,borderBottom:`1px solid ${T.bdr2}`,textAlign:right?"right":"left",whiteSpace:"nowrap"}}>{children}</td>;
const Tabs=({tabs,active,onChange})=><div style={{display:"flex",gap:1,borderBottom:`1px solid ${T.bdr}`,marginBottom:16,overflowX:"auto"}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{fontFamily:F,fontSize:13,fontWeight:600,padding:"10px 14px",border:"none",cursor:"pointer",background:"transparent",color:active===t.id?T.blue:T.ink3,borderBottom:active===t.id?`2px solid ${T.blue}`:"2px solid transparent",whiteSpace:"nowrap"}}>{t.icon&&<span style={{marginRight:5}}>{t.icon}</span>}{t.label}</button>)}</div>;

/* ═══ VENDOR POPOVER ═══ */
const VendorCell=({vendor,contact,payTerms})=>{
  const[show,setShow]=useState(false);
  return<td style={{padding:"9px 10px",fontSize:12,borderBottom:`1px solid ${T.bdr2}`,position:"relative"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
    <div style={{fontWeight:600,color:T.blue,cursor:"pointer",fontSize:11}}>{vendor}</div>
    <div style={{fontSize:9,color:T.ink4}}>{payTerms===0?"Immediate":"Net "+payTerms+"d"}</div>
    {show&&<div style={{position:"absolute",top:-8,left:"100%",marginLeft:8,zIndex:100,background:T.card,border:`1px solid ${T.bdr}`,borderRadius:10,padding:"12px 16px",boxShadow:"0 8px 24px rgba(0,0,0,.12)",width:220}}>
      <div style={{fontSize:12,fontWeight:700,marginBottom:6}}>{vendor}</div>
      <div style={{fontSize:11,color:T.ink3,marginBottom:3}}>👤 {contact.name}</div>
      <div style={{fontSize:11,color:T.ink3,marginBottom:3}}>📞 {contact.phone}</div>
      <div style={{fontSize:11,color:T.ink3,marginBottom:3}}>✉ {contact.email}</div>
      <div style={{fontSize:11,color:T.ink3}}>💳 Payment: {payTerms===0?"Immediate":`Net ${payTerms} days`}</div>
    </div>}
  </td>;
};

/* ═══ SCREEN: INVENTORY INTELLIGENCE DASHBOARD ═══ */
const InventoryDashboard=()=>{
  const[sort,setSort]=useState({key:"weeksCoverage",dir:"asc"});
  const[catFilter,setCatFilter]=useState("all");
  const[mvFilter,setMvFilter]=useState("all");
  const[healthFilter,setHealthFilter]=useState("all");
  const[uomFilter,setUomFilter]=useState("all");
  const[orderDrawer,setOrderDrawer]=useState(null);
  const[search,setSearch]=useState("");

  const handleSort=key=>{setSort(p=>({key,dir:p.key===key&&p.dir==="asc"?"desc":"asc"}));};

  const filtered=useMemo(()=>{
    let d=PARTS.filter(p=>(catFilter==="all"||p.cat===catFilter)&&(mvFilter==="all"||p.movement===mvFilter)&&(healthFilter==="all"||p.health===healthFilter)&&(uomFilter==="all"||p.uom===uomFilter)&&(search===""||p.name.toLowerCase().includes(search.toLowerCase())||p.pn.toLowerCase().includes(search.toLowerCase())));
    if(sort.key){d.sort((a,b)=>{let va=a[sort.key],vb=b[sort.key];if(va===Infinity)va=99999;if(vb===Infinity)vb=99999;if(typeof va==="string")return sort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va);return sort.dir==="asc"?(va||0)-(vb||0):(vb||0)-(va||0);});}
    return d;
  },[sort,catFilter,mvFilter,healthFilter,uomFilter,search]);

  const totalInvValue=PARTS.reduce((s,p)=>s+(p.isAltVendor?0:p.invValue),0);
  const totalPoValue=PARTS.reduce((s,p)=>s+p.openPoValue,0);
  const belowReorder=PARTS.filter(p=>p.stock<p.reorderPoint&&!p.isAltVendor).length;
  const deadValue=PARTS.filter(p=>p.health==="Dead"&&!p.isAltVendor).reduce((s,p)=>s+p.invValue,0);

  return(<div style={{position:"relative"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div><div style={{fontSize:11,color:T.ink4}}>Workshop › Part Inventory Intelligence</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Part inventory intelligence</h2></div>
      <div style={{display:"flex",gap:8}}><Btn>Export</Btn><Btn v="primary">+ Add part</Btn></div>
    </div>

    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Metric label="Total inventory value" value={INR(totalInvValue)} color={T.blue}/>
      <Metric label="Open PO value" value={INR(totalPoValue)} color={T.purple} sub="Capital committed"/>
      <Metric label="Below reorder point" value={belowReorder} color={T.red} sub="Need ordering now"/>
      <Metric label="Dead stock value" value={INR(deadValue)} color={T.red} sub="₹ stuck in dead inventory"/>
      <Metric label="Fast movers" value={PARTS.filter(p=>p.movement==="Fast"&&!p.isAltVendor).length} color={T.green}/>
      <Metric label="Total capital locked" value={INR(totalInvValue+totalPoValue)} color={T.amber} sub="Inv + open POs"/>
    </div>

    <Card noPad>
      <div style={{padding:"10px 14px",display:"flex",gap:6,alignItems:"center",borderBottom:`1px solid ${T.bdr}`,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search parts..." style={{fontFamily:F,fontSize:12,padding:"6px 10px",borderRadius:8,border:`1px solid ${T.bdr}`,width:160}}/>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{fontFamily:F,fontSize:11,padding:"6px 8px",borderRadius:8,border:`1px solid ${T.bdr}`}}>
          <option value="all">Category ▾</option>{[...new Set(PARTS.map(p=>p.cat))].sort().map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select value={uomFilter} onChange={e=>setUomFilter(e.target.value)} style={{fontFamily:F,fontSize:11,padding:"6px 8px",borderRadius:8,border:`1px solid ${T.bdr}`}}>
          <option value="all">UOM ▾</option><option value="Units">Units</option><option value="Kg">Kg</option>
        </select>
        {["all","Fast","Medium","Slow","Dead"].map(m=>(
          <button key={m} onClick={()=>setMvFilter(m)} style={{fontFamily:F,fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:6,border:`1px solid ${mvFilter===m?T.blue:T.bdr}`,background:mvFilter===m?T.blueBg:"transparent",color:mvFilter===m?T.blueTx:T.ink3,cursor:"pointer"}}>{m==="all"?"All movers":m}</button>
        ))}
        <span style={{color:T.ink4,fontSize:10}}>|</span>
        {["all","Under","Correct","Over","Dead"].map(h=>(
          <button key={h} onClick={()=>setHealthFilter(h)} style={{fontFamily:F,fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:6,border:`1px solid ${healthFilter===h?T.blue:T.bdr}`,background:healthFilter===h?T.blueBg:"transparent",color:healthFilter===h?T.blueTx:T.ink3,cursor:"pointer"}}>{h==="all"?"All health":h}</button>
        ))}
        <div style={{flex:1}}/>
        <span style={{fontSize:10,color:T.ink4}}>{filtered.length} parts</span>
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1600}}>
          <thead><tr>
            <TH>Part #</TH>
            <TH sortKey="name" sortState={sort} onSort={handleSort}>Part name</TH>
            <TH>Cat</TH>
            <TH>UOM</TH>
            <TH>Vendor</TH>
            <TH right sortKey="unitCost" sortState={sort} onSort={handleSort}>Unit cost</TH>
            <TH right sortKey="stock" sortState={sort} onSort={handleSort}>Stock</TH>
            <TH right sortKey="weeklyConsumption" sortState={sort} onSort={handleSort}>Wkly use</TH>
            <TH right sortKey="weeksCoverage" sortState={sort} onSort={handleSort}>Wks cover</TH>
            <TH right>Safety</TH>
            <TH right>Re-order pt</TH>
            <TH right>Rec. holding</TH>
            <TH sortKey="movement" sortState={sort} onSort={handleSort}>Movement</TH>
            <TH sortKey="health" sortState={sort} onSort={handleSort}>Health</TH>
            <TH right sortKey="invValue" sortState={sort} onSort={handleSort}>Inv value</TH>
            <TH right sortKey="openPoValue" sortState={sort} onSort={handleSort}>Open PO</TH>
            <TH right sortKey="totalCapital" sortState={sort} onSort={handleSort}>Capital locked</TH>
            <TH>Action</TH>
          </tr></thead>
          <tbody>
            {filtered.map(p=>{
              const needsOrder=p.stock<p.reorderPoint;
              const u=p.uom==="Kg"?" kg":"";
              return(
                <tr key={p.id} style={{background:needsOrder?T.redBg+"40":"transparent"}}>
                  <TD mono bold color={T.blue}>{p.pn}</TD>
                  <TD><div style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}}><span style={{fontWeight:600,fontSize:11}}>{p.name}</span>{p.isAltVendor&&<span style={{fontSize:9,color:T.ink4,marginLeft:4}}>(alt vendor)</span>}</div></TD>
                  <TD><span style={{fontSize:10,color:T.ink3}}>{p.cat}</span></TD>
                  <TD><Badge c={p.consumable?"teal":"gray"} s="xs">{p.uom}</Badge></TD>
                  <VendorCell vendor={p.vendor} contact={p.vendorContact} payTerms={p.payTerms}/>
                  <TD mono right>{INR(p.unitCost)}{p.consumable?"/kg":""}</TD>
                  <TD mono right bold color={needsOrder?T.red:T.ink}>{p.stock}{u}</TD>
                  <TD mono right>{p.weeklyConsumption>0?p.weeklyConsumption.toFixed(1)+u:"—"}</TD>
                  <TD mono right bold color={{green:T.green,amber:T.amber,red:T.red,gray:T.ink4}[coverageColor(p.weeksCoverage)]}>{p.weeksCoverage===Infinity?"∞":p.weeksCoverage.toFixed(1)}</TD>
                  <TD mono right>{p.safetyStock}{u}</TD>
                  <TD mono right>{p.reorderPoint}{u}</TD>
                  <TD mono right>{p.recommended}{u}</TD>
                  <TD><Badge c={mvColors[p.movement]} s="xs">{p.movement}</Badge></TD>
                  <TD><Badge c={healthColors[p.health]} s="xs">{p.health}</Badge></TD>
                  <TD mono right bold>{INR(p.invValue)}</TD>
                  <TD mono right color={p.openPoValue>0?T.purple:T.ink4}>{p.openPoValue>0?INR(p.openPoValue):"—"}</TD>
                  <TD mono right bold color={T.amber}>{INR(p.invValue+p.openPoValue)}</TD>
                  <TD>{needsOrder?<Btn v="danger" sz="sm" onClick={()=>setOrderDrawer(p)}>Order</Btn>:<span style={{fontSize:10,color:T.green}}>✓ OK</span>}</TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>

    {/* ═══ ORDER DRAWER ═══ */}
    {orderDrawer&&(<div style={{position:"fixed",top:0,right:0,bottom:0,width:420,background:T.card,boxShadow:"-8px 0 40px rgba(0,0,0,.12)",zIndex:200,display:"flex",flexDirection:"column",borderLeft:`1px solid ${T.bdr}`}}>
      <div style={{padding:"18px 22px",borderBottom:`1px solid ${T.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:16,fontWeight:800}}>Quick order</div><div style={{fontSize:11,color:T.ink4}}>MOQ-adjusted reorder</div></div>
        <button onClick={()=>setOrderDrawer(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.ink3}}>✕</button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"18px 22px"}}>
        <div style={{background:T.redBg,borderRadius:8,padding:"10px 14px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:T.redTx}}>⚠ Below reorder point</div>
          <div style={{fontSize:12,color:T.redTx}}>Stock: {orderDrawer.stock}{orderDrawer.uom==="Kg"?" kg":""} · Reorder point: {orderDrawer.reorderPoint}{orderDrawer.uom==="Kg"?" kg":""}</div>
        </div>

        <SL>Part details</SL>
        {[["Part #",orderDrawer.pn],["Name",orderDrawer.name],["Category",orderDrawer.cat],["UOM",orderDrawer.uom]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}>
            <span style={{color:T.ink3}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
          </div>
        ))}

        <div style={{margin:"16px 0",borderTop:`1px solid ${T.bdr2}`,paddingTop:16}}>
          <SL>Order calculation</SL>
          {(()=>{
            const raw=orderDrawer.reorderPoint+orderDrawer.safetyStock-orderDrawer.stock;
            const moqAdj=Math.max(orderDrawer.moq,Math.ceil(raw/orderDrawer.moq)*orderDrawer.moq);
            return<>
              {[["Need (reorder+safety-stock)",`${raw.toFixed(1)}${orderDrawer.uom==="Kg"?" kg":""}`],["MOQ",`${orderDrawer.moq}${orderDrawer.uom==="Kg"?" kg":""}`],["MOQ-adjusted qty",`${moqAdj}${orderDrawer.uom==="Kg"?" kg":""}`],["Unit cost",INR(orderDrawer.unitCost)],["Order value",INR(moqAdj*orderDrawer.unitCost)]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}>
                  <span style={{color:T.ink3}}>{l}</span><span style={{fontWeight:700,fontFamily:M}}>{v}</span>
                </div>
              ))}
            </>;
          })()}
        </div>

        <div style={{margin:"16px 0",borderTop:`1px solid ${T.bdr2}`,paddingTop:16}}>
          <SL>Vendor</SL>
          <div style={{background:T.bg,borderRadius:8,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700}}>{orderDrawer.vendor}</div>
            <div style={{fontSize:11,color:T.ink3}}>👤 {orderDrawer.vendorContact.name} · 📞 {orderDrawer.vendorContact.phone}</div>
            <div style={{fontSize:11,color:T.ink3}}>💳 Payment: {orderDrawer.payTerms===0?"Immediate":`Net ${orderDrawer.payTerms} days`}</div>
            <div style={{fontSize:11,color:T.ink3}}>🚚 Lead time: {orderDrawer.leadTime} days</div>
          </div>
          <label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Quantity (adjust if needed)</label>
          <input type="number" defaultValue={Math.max(orderDrawer.moq,Math.ceil((orderDrawer.reorderPoint+orderDrawer.safetyStock-orderDrawer.stock)/orderDrawer.moq)*orderDrawer.moq)} style={{fontFamily:M,fontSize:14,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%",marginBottom:12}}/>
          <label style={{fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:4}}>Notes for vendor</label>
          <textarea placeholder="Urgent, quality specs, etc." style={{fontFamily:F,fontSize:12,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.bdr}`,width:"100%",height:50,resize:"vertical"}}/>
        </div>
      </div>
      <div style={{padding:"14px 22px",borderTop:`1px solid ${T.bdr}`,display:"flex",gap:8}}>
        <Btn style={{flex:1}} onClick={()=>setOrderDrawer(null)}>Cancel</Btn>
        <Btn v="primary" style={{flex:2}}>Create purchase order →</Btn>
      </div>
    </div>)}
  </div>);
};

/* ═══ SCREEN: WORK ORDER BOARD ═══ */
const WorkOrderBoard=()=>{
  const columns=[
    {key:"draft",label:"Draft",color:T.ink4,items:[{id:"WO-381",vehicle:"MH04KL4567",tasks:"AC Service, Coolant Flush",mechanic:"Deepak Patel",priority:"Scheduled",hrs:4}]},
    {key:"scheduled",label:"Scheduled",color:T.blue,items:[{id:"WO-380",vehicle:"MH12EF9012",tasks:"Brake Pad Replacement",mechanic:"Anita Verma",priority:"Scheduled",hrs:3},{id:"WO-379",vehicle:"GJ01OP1234",tasks:"Tire Rotation, Alignment",mechanic:"Rajesh Kumar",priority:"Scheduled",hrs:2}]},
    {key:"inprogress",label:"In progress",color:T.amber,items:[{id:"WO-378",vehicle:"MH04AB1234",tasks:"Oil & Filter Change, Multi-Point",mechanic:"Vikram Singh",priority:"Scheduled",hrs:2.5},{id:"WO-377",vehicle:"DL01EF9012",tasks:"Transmission Flush",mechanic:"Priya Sharma",priority:"Emergency",hrs:3}]},
    {key:"waitparts",label:"Waiting parts",color:T.red,items:[{id:"WO-376",vehicle:"MH04CD5678",tasks:"Tire Replacement (4 tyres)",mechanic:"Rajesh Kumar",priority:"Non-Scheduled",hrs:4}]},
    {key:"qc",label:"Quality check",color:T.purple,items:[{id:"WO-375",vehicle:"MH12GH3456",tasks:"Fan Belt Replacement",mechanic:"Deepak Patel",priority:"Scheduled",hrs:1}]},
    {key:"completed",label:"Completed",color:T.green,items:[{id:"WO-374",vehicle:"MH04AB1234",tasks:"Brake Linings Inspection",mechanic:"Rajesh Kumar",priority:"Scheduled",hrs:1.5}]},
  ];

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <div><div style={{fontSize:11,color:T.ink4}}>Workshop › Work Orders</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Work order board</h2></div>
      <div style={{display:"flex",gap:8}}><Btn>Calendar view</Btn><Btn v="primary">+ Add work order</Btn></div>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:16}}>
      <Metric label="Open WOs" value="6" color={T.amber}/>
      <Metric label="In progress" value="2" color={T.blue}/>
      <Metric label="Waiting parts" value="1" color={T.red} sub="PO auto-suggested"/>
      <Metric label="Completed today" value="1" color={T.green}/>
      <Metric label="Labor hrs today" value="14.5h" sub="of 24h capacity"/>
    </div>
    <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
      {columns.map(col=>(
        <div key={col.key} style={{minWidth:230,flex:1,background:T.bg,borderRadius:12,padding:"10px 8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"0 6px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
            <span style={{fontSize:12,fontWeight:700}}>{col.label}</span>
            <span style={{fontSize:10,fontWeight:700,background:T.bdr2,color:T.ink3,width:18,height:18,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{col.items.length}</span>
          </div>
          {col.items.map(wo=>(
            <Card key={wo.id} style={{padding:"12px 14px",marginBottom:8,cursor:"pointer"}} hover>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:M,fontSize:11,fontWeight:700,color:T.blue}}>{wo.id}</span>
                <Badge c={wo.priority==="Emergency"?"red":wo.priority==="Non-Scheduled"?"amber":"blue"} s="xs">{wo.priority}</Badge>
              </div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:3}}>{wo.vehicle}</div>
              <div style={{fontSize:10,color:T.ink3,marginBottom:8}}>{wo.tasks}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <Avatar name={wo.mechanic} sz={20}/>
                  <span style={{fontSize:10,color:T.ink3}}>{wo.mechanic}</span>
                </div>
                <span style={{fontSize:10,fontWeight:600,color:T.ink4}}>~{wo.hrs}h</span>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  </div>);
};

/* ═══ SCREEN: WORKSHOP FORECAST ═══ */
const WorkshopForecast=()=>{
  const weeks=[
    {label:"This week (Mar 17-21)",confirmed:18,predicted:6,capacity:24,utilization:100,leave:["Deepak Patel (Thu-Fri)"]},
    {label:"Week 2 (Mar 24-28)",confirmed:12,predicted:14,capacity:24,utilization:108,leave:[]},
    {label:"Week 3 (Mar 31-Apr 4)",confirmed:4,predicted:18,capacity:24,utilization:92,leave:["Vikram Singh (Mon)"]},
    {label:"Week 4 (Apr 7-11)",confirmed:2,predicted:16,capacity:24,utilization:75,leave:[]},
  ];

  return(<div>
    <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.ink4}}>Workshop › Forecast & Capacity</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Workshop forecast & capacity</h2></div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      <Metric label="This week utilization" value="100%" color={T.amber} sub="At full capacity"/>
      <Metric label="Next week" value="108%" color={T.red} sub="⚠ Overtime needed"/>
      <Metric label="Mechanics available" value="4" sub="1 on leave this week"/>
      <Metric label="Predicted services (4 wks)" value="54 hrs" color={T.purple}/>
    </div>

    <Card style={{marginBottom:16}}>
      <SL>4-week capacity forecast</SL>
      <div style={{display:"flex",gap:16}}>
        {weeks.map((w,i)=>(
          <div key={i} style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:600,marginBottom:8,textAlign:"center"}}>{w.label}</div>
            <div style={{height:140,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",background:T.bg,borderRadius:8,padding:"8px 0",position:"relative"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,borderBottom:`2px dashed ${T.ink4}`,opacity:0.3}}/>
              <div style={{display:"flex",gap:2,alignItems:"flex-end",height:"100%"}}>
                <div style={{width:30,height:`${(w.confirmed/w.capacity)*100}%`,background:T.blue,borderRadius:"3px 3px 0 0",maxHeight:"100%"}}/>
                <div style={{width:30,height:`${(w.predicted/w.capacity)*100}%`,background:T.amber+"80",borderRadius:"3px 3px 0 0",maxHeight:"100%"}}/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6}}>
              <span style={{fontSize:9,color:T.blue}}>■ {w.confirmed}h confirmed</span>
              <span style={{fontSize:9,color:T.amber}}>■ {w.predicted}h predicted</span>
            </div>
            <div style={{textAlign:"center",marginTop:4}}>
              <span style={{fontSize:14,fontWeight:800,color:w.utilization>100?T.red:w.utilization>80?T.amber:T.green}}>{w.utilization}%</span>
            </div>
            {w.utilization>100&&<div style={{textAlign:"center",fontSize:9,color:T.red,fontWeight:600}}>⚠ {w.utilization-100}% overtime</div>}
            {w.leave.length>0&&<div style={{textAlign:"center",fontSize:9,color:T.amber,marginTop:2}}>Leave: {w.leave.join(", ")}</div>}
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SL>Upcoming predicted services (next 4 weeks)</SL>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Vehicle","Service program","Predicted due","Est. hours","Key parts needed","Status"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:T.ink4,textTransform:"uppercase",borderBottom:`1px solid ${T.bdr}`,background:T.bg}}>{h}</th>)}</tr></thead>
        <tbody>
          {[
            {vehicle:"MH04AB1234",program:"Standard Maintenance",due:"Mar 24",hrs:2.5,parts:"Oil filter, air filter, engine oil",status:"Confirmed"},
            {vehicle:"MH12EF9012",program:"Standard Maintenance",due:"Mar 26",hrs:2.5,parts:"Oil filter, air filter, engine oil",status:"Confirmed"},
            {vehicle:"GJ01OP1234",program:"Standard Maintenance",due:"Mar 28",hrs:3.0,parts:"Oil, filters, brake inspection",status:"Predicted"},
            {vehicle:"DL01EF9012",program:"RTO Compliance",due:"Apr 1",hrs:4.0,parts:"Brake pads, PUC test",status:"Predicted"},
            {vehicle:"MH04CD5678",program:"Standard Maintenance",due:"Apr 3",hrs:2.5,parts:"Oil, filters",status:"Predicted"},
            {vehicle:"MH04GH3456",program:"Standard Maintenance",due:"Apr 7",hrs:2.5,parts:"Oil, filters, coolant",status:"Predicted"},
          ].map((s,i)=>(
            <tr key={i}>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,fontWeight:600,color:T.blue,borderBottom:`1px solid ${T.bdr2}`}}>{s.vehicle}</td>
              <td style={{padding:"10px 12px",fontSize:12,borderBottom:`1px solid ${T.bdr2}`}}>{s.program}</td>
              <td style={{padding:"10px 12px",fontSize:12,fontWeight:600,borderBottom:`1px solid ${T.bdr2}`}}>{s.due}</td>
              <td style={{padding:"10px 12px",fontSize:12,borderBottom:`1px solid ${T.bdr2}`}}>{s.hrs}h</td>
              <td style={{padding:"10px 12px",fontSize:11,color:T.ink3,borderBottom:`1px solid ${T.bdr2}`}}>{s.parts}</td>
              <td style={{padding:"10px 12px",borderBottom:`1px solid ${T.bdr2}`}}><Badge c={s.status==="Confirmed"?"green":"amber"} s="xs">{s.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>);
};

/* ═══ SCREEN: VENDOR WORKING CAPITAL ═══ */
const VendorCapital=()=>(
  <div>
    <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.ink4}}>Workshop › Vendor Working Capital</div><h2 style={{margin:0,fontSize:22,fontWeight:800}}>Vendor working capital</h2></div>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      <Metric label="Total outstanding" value="₹3,42,600" color={T.red}/>
      <Metric label="Within terms" value="₹2,18,400" color={T.green}/>
      <Metric label="Overdue" value="₹1,24,200" color={T.red} sub="3 vendors"/>
      <Metric label="Open PO value" value="₹93,200" color={T.purple}/>
      <Metric label="Avg payment cycle" value="28 days"/>
    </div>
    <Card noPad>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Vendor","Payment terms","Open POs","Outstanding","Within terms","Overdue","Total capital stuck","Action"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:h==="Vendor"||h==="Action"?"left":"right",fontSize:10,fontWeight:700,color:T.ink4,textTransform:"uppercase",borderBottom:`1px solid ${T.bdr}`,background:T.bg}}>{h}</th>)}</tr></thead>
        <tbody>
          {[
            {name:"CEAT Tyre Zone",terms:"Net 45 days",openPo:"₹74,000",outstanding:"₹1,38,450",within:"₹1,38,450",overdue:"₹0",total:"₹2,12,450"},
            {name:"Boodmo Auto Parts",terms:"Net 15 days",openPo:"₹0",outstanding:"₹42,600",within:"₹18,400",overdue:"₹24,200",total:"₹42,600"},
            {name:"Castrol India",terms:"Net 30 days",openPo:"₹0",outstanding:"₹86,200",within:"₹0",overdue:"₹86,200",total:"₹86,200"},
            {name:"Gulf Oil India",terms:"Immediate",openPo:"₹0",outstanding:"₹0",within:"₹0",overdue:"₹0",total:"₹0"},
            {name:"Sai Hardware",terms:"Immediate",openPo:"₹0",outstanding:"₹0",within:"₹0",overdue:"₹0",total:"₹0"},
            {name:"Gates India",terms:"Net 30 days",openPo:"₹0",outstanding:"₹32,400",within:"₹32,400",overdue:"₹0",total:"₹32,400"},
            {name:"Exide Industries",terms:"Net 60 days",openPo:"₹19,200",outstanding:"₹42,950",within:"₹29,150",overdue:"₹13,800",total:"₹62,150"},
            {name:"Rane Holdings",terms:"Net 45 days",openPo:"₹0",outstanding:"₹0",within:"₹0",overdue:"₹0",total:"₹0"},
          ].map((v,i)=>(
            <tr key={i} style={{background:v.overdue!=="₹0"?T.redBg+"30":"transparent"}}>
              <td style={{padding:"10px 12px",fontSize:12,fontWeight:600,color:T.blue,borderBottom:`1px solid ${T.bdr2}`}}>{v.name}</td>
              <td style={{padding:"10px 12px",fontSize:12,textAlign:"right",borderBottom:`1px solid ${T.bdr2}`}}><Badge c={v.terms==="Immediate"?"green":parseInt(v.terms.match(/\d+/))>30?"amber":"blue"} s="xs">{v.terms}</Badge></td>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,textAlign:"right",color:v.openPo!=="₹0"?T.purple:T.ink4,borderBottom:`1px solid ${T.bdr2}`}}>{v.openPo}</td>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,fontWeight:600,textAlign:"right",borderBottom:`1px solid ${T.bdr2}`}}>{v.outstanding}</td>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,textAlign:"right",color:T.green,borderBottom:`1px solid ${T.bdr2}`}}>{v.within}</td>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,fontWeight:700,textAlign:"right",color:v.overdue!=="₹0"?T.red:T.ink4,borderBottom:`1px solid ${T.bdr2}`}}>{v.overdue}</td>
              <td style={{padding:"10px 12px",fontSize:12,fontFamily:M,fontWeight:700,textAlign:"right",color:T.amber,borderBottom:`1px solid ${T.bdr2}`}}>{v.total}</td>
              <td style={{padding:"10px 12px",borderBottom:`1px solid ${T.bdr2}`}}>{v.overdue!=="₹0"&&<Btn sz="sm" v="danger">Pay now</Btn>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

/* ═══ MAIN APP ═══ */
export default function App(){
  const[screen,setScreen]=useState("inventory");
  const nav=[
    {id:"inventory",label:"Part intelligence",icon:"📊"},
    {id:"workorders",label:"Work orders",icon:"🔧"},
    {id:"forecast",label:"Forecast & capacity",icon:"📅"},
    {id:"vendors",label:"Vendor capital",icon:"💳"},
  ];

  return(
    <div style={{fontFamily:F,color:T.ink,background:T.bg,minHeight:"100vh"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{background:T.card,borderBottom:`1px solid ${T.bdr}`,padding:"0 24px",display:"flex",alignItems:"center",gap:6,position:"sticky",top:0,zIndex:10}}>
        <div style={{fontWeight:800,fontSize:14,color:T.blue,padding:"12px 16px 12px 0",borderRight:`1px solid ${T.bdr}`,marginRight:8}}>TripFlow</div>
        <div style={{fontWeight:600,fontSize:13,color:T.ink3,padding:"12px 12px",borderRight:`1px solid ${T.bdr}`,marginRight:4}}>Workshop</div>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{fontFamily:F,fontSize:13,fontWeight:600,padding:"12px 14px",border:"none",cursor:"pointer",whiteSpace:"nowrap",background:"transparent",color:screen===n.id?T.blue:T.ink3,borderBottom:screen===n.id?`2px solid ${T.blue}`:"2px solid transparent"}}>
            <span style={{marginRight:5}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div style={{padding:"18px 22px",maxWidth:1600,margin:"0 auto"}}>
        {screen==="inventory"&&<InventoryDashboard/>}
        {screen==="workorders"&&<WorkOrderBoard/>}
        {screen==="forecast"&&<WorkshopForecast/>}
        {screen==="vendors"&&<VendorCapital/>}
      </div>
    </div>
  );
}
