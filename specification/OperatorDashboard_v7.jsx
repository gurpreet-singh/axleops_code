import { useState, useMemo } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ROUTES = [
  { id:"RT-001", origin:"Mumbai",    destination:"Pune",      client:"Reliance Retail", rateType:"Flat",   rate:8500,  distKm:148, transitDays:1, team:"West Team",  freightTerms:"To Pay",            defaultConsignor:"Reliance Jamnagar DC",   defaultConsignee:"Reliance Pune WH-3"  },
  { id:"RT-002", origin:"Mumbai",    destination:"Nashik",    client:"ITC Limited",     rateType:"Per Km", rate:42,    distKm:165, transitDays:1, team:"West Team",  freightTerms:"Paid",              defaultConsignor:"ITC Mumbai Factory",     defaultConsignee:"ITC Nashik Depot"    },
  { id:"RT-003", origin:"Delhi",     destination:"Agra",      client:"Tata Chemicals",  rateType:"Flat",   rate:7200,  distKm:210, transitDays:1, team:"North Team", freightTerms:"To Be Billed (TBB)",defaultConsignor:"Tata Chem Delhi Plant",  defaultConsignee:"Tata Agra Warehouse" },
  { id:"RT-005", origin:"Bengaluru", destination:"Chennai",   client:"Nestlé India",    rateType:"Flat",   rate:14000, distKm:346, transitDays:2, team:"South Team", freightTerms:"To Pay",            defaultConsignor:"Nestlé Bengaluru Plant",defaultConsignee:"Nestlé Chennai DC"   },
  { id:"RT-009", origin:"Pune",      destination:"Ahmedabad", client:"Marico",          rateType:"Flat",   rate:16500, distKm:462, transitDays:2, team:"West Team",  freightTerms:"To Pay",            defaultConsignor:"Marico Pune Factory",   defaultConsignee:"Marico Ahmedabad DC" },
];
const VEHICLE_MAP = {};
[
  { num:"MH12 AB 1234", driver:"Raju Singh",    type:"Own",      routeId:"RT-001" },
  { num:"MH12 CD 5678", driver:"Mohan Lal",     type:"Own",      routeId:"RT-001" },
  { num:"MH15 EF 2341", driver:"Suresh Kumar",  type:"Attached", routeId:"RT-002" },
  { num:"DL10 GH 9012", driver:"Arjun Nair",    type:"Own",      routeId:"RT-003" },
  { num:"KA05 MN 4567", driver:"Sanjay Gupta",  type:"Own",      routeId:"RT-005" },
  { num:"MH14 WX 3456", driver:"Rahul Desai",   type:"Own",      routeId:"RT-009" },
].forEach(v => { VEHICLE_MAP[v.num] = { ...v, route: ROUTES.find(r=>r.id===v.routeId) }; });

function today(){ return new Date().toISOString().slice(0,10); }
function fmtD(iso){ if(!iso) return "—"; const [y,m,d]=iso.split("-"); return `${d}/${m}/${y.slice(2)}`; }
function money(n){ return n ? `₹${Number(n).toLocaleString()}` : "—"; }
let _uid=4630;
const uid = () => `T-0${_uid++}`;

/*
  SIMPLIFIED STATUS FLOW:
  In Transit → Delivered (+ ePOD at delivery) → Trip Sheet → Billed → Paid

  OPS:   Creates trip (LR + Vehicle in one step) → Marks Delivered (uploads ePOD)
  ACCTS: Adds advances → Settles Trip Sheet → Raises Bill → Records Payment
*/

const STATES = ["Consignment","In Transit","Delivered","Trip Sheet","Billed","Paid"];
const STATE_COLOR = {
  "Consignment":{ dot:"#7C3AED", light:"#F5F3FF", mid:"#EDE9FE", text:"#5B21B6", border:"#C4B5FD" },
  "In Transit": { dot:"#0EA5E9", light:"#F0F9FF", mid:"#E0F2FE", text:"#0369A1", border:"#7DD3FC" },
  "Delivered":  { dot:"#10B981", light:"#F0FDF4", mid:"#D1FAE5", text:"#065F46", border:"#6EE7B7" },
  "Trip Sheet": { dot:"#D97706", light:"#FFFBEB", mid:"#FEF3C7", text:"#92400E", border:"#FCD34D" },
  "Billed":     { dot:"#6366F1", light:"#EEF2FF", mid:"#E0E7FF", text:"#3730A3", border:"#A5B4FC" },
  "Paid":       { dot:"#16A34A", light:"#DCFCE7", mid:"#BBF7D0", text:"#14532D", border:"#86EFAC" },
};

const EXPENSE_CATS = ["Fuel","Toll / Tax","Loading Labour","Unloading Labour","Mechanical","Driver Allowance","Other"];
const PAYMENT_MODES = ["Cash","Bank Transfer / NEFT","Cheque","UPI","Fuel Card"];

const TRIPS_INIT = [
  { id:"T-04600",lr:"LR-08000",routeId:"RT-009",status:"Consignment",lrDate:"2026-03-23",client:"Marico",origin:"Pune",destination:"Ahmedabad",team:"West Team",vehicle:null,driver:null,vtype:null,consignor:"Marico Pune Factory",consignee:"Marico Ahmedabad DC",goods:"Coconut oil cartons",weightKg:10200,packages:300,declaredValue:380000,freight:16500,hire:null,freightTerms:"To Pay",
    jobEntry:null,advances:[],expenses:[],pod:null,tripSheet:null,deliveryDate:null,invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04601",lr:"LR-08001",routeId:"RT-001",status:"In Transit",lrDate:"2026-03-22",client:"Reliance Retail",origin:"Mumbai",destination:"Pune",team:"West Team",vehicle:"MH12 AB 1234",driver:"Raju Singh",vtype:"Own",consignor:"Reliance Jamnagar DC",consignee:"Reliance Pune WH-3",goods:"Packaged food items",weightKg:14200,packages:320,declaredValue:420000,freight:8500,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-22",time:"09:00",odoStart:12340,dispatchNote:"Standard load"},advances:[{id:"adv1",type:"Driver",amount:3500,mode:"Cash",date:"2026-03-22",note:"Fuel + toll"}],expenses:[],pod:null,tripSheet:null,deliveryDate:null,invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04602",lr:"LR-08002",routeId:"RT-002",status:"In Transit",lrDate:"2026-03-22",client:"ITC Limited",origin:"Mumbai",destination:"Nashik",team:"West Team",vehicle:"MH15 EF 2341",driver:"Suresh Kumar",vtype:"Attached",consignor:"ITC Mumbai Factory",consignee:"ITC Nashik Depot",goods:"Cigarettes & FMCG",weightKg:8400,packages:210,declaredValue:680000,freight:6930,hire:5500,freightTerms:"Paid",
    jobEntry:{date:"2026-03-22",time:"08:30",odoStart:45230,dispatchNote:"Loaded and sealed"},advances:[{id:"adv2",type:"Driver",amount:2000,mode:"Cash",date:"2026-03-22",note:"Trip advance"},{id:"adv3",type:"Hire Slip",amount:2000,mode:"Bank Transfer",date:"2026-03-22",note:"Owner advance"}],expenses:[],pod:null,tripSheet:null,deliveryDate:null,invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04603",lr:"LR-08003",routeId:"RT-003",status:"In Transit",lrDate:"2026-03-20",client:"Tata Chemicals",origin:"Delhi",destination:"Agra",team:"North Team",vehicle:"DL10 GH 9012",driver:"Arjun Nair",vtype:"Own",consignor:"Tata Chem Delhi Plant",consignee:"Tata Agra Warehouse",goods:"Industrial chemicals",weightKg:18000,packages:90,declaredValue:890000,freight:7200,hire:null,freightTerms:"To Be Billed (TBB)",
    jobEntry:{date:"2026-03-20",time:"06:00",odoStart:89100,dispatchNote:"Hazmat sealed"},advances:[{id:"adv4",type:"Driver",amount:4000,mode:"Cash",date:"2026-03-20",note:"Long trip"}],expenses:[],pod:null,tripSheet:null,deliveryDate:null,invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:true },
  { id:"T-04604",lr:"LR-08004",routeId:"RT-005",status:"Delivered",lrDate:"2026-03-18",client:"Nestlé India",origin:"Bengaluru",destination:"Chennai",team:"South Team",vehicle:"KA05 MN 4567",driver:"Sanjay Gupta",vtype:"Own",consignor:"Nestlé Bengaluru Plant",consignee:"Nestlé Chennai DC",goods:"Dairy & packaged food",weightKg:11200,packages:480,declaredValue:560000,freight:14000,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-18",time:"05:00",odoStart:32400,dispatchNote:"Cold chain"},advances:[{id:"adv5",type:"Driver",amount:6000,mode:"Cash",date:"2026-03-18",note:"2-day trip"}],expenses:[{id:"exp3",category:"Fuel",amount:3800,date:"2026-03-19",note:"NH44 fuel"},{id:"exp4",category:"Toll",amount:620,date:"2026-03-19",note:"NHAI"},{id:"exp5",category:"Labour",amount:800,date:"2026-03-19",note:"Unloading"}],pod:{receiver:"Ramesh Kumar",date:"2026-03-19",files:2,note:"Signed + photo"},tripSheet:null,deliveryDate:"2026-03-19",invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04605",lr:"LR-08005",routeId:"RT-009",status:"Billed",lrDate:"2026-03-15",client:"Marico",origin:"Pune",destination:"Ahmedabad",team:"West Team",vehicle:"MH14 WX 3456",driver:"Rahul Desai",vtype:"Own",consignor:"Marico Pune Factory",consignee:"Marico Ahmedabad DC",goods:"Hair oils & cosmetics",weightKg:9800,packages:280,declaredValue:340000,freight:16500,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-15",time:"04:00",odoStart:61800,dispatchNote:"Standard"},advances:[{id:"adv6",type:"Driver",amount:5000,mode:"Cash",date:"2026-03-15",note:"Advance"}],expenses:[{id:"exp6",category:"Fuel",amount:4200,date:"2026-03-16",note:"Fuel"},{id:"exp7",category:"Toll",amount:890,date:"2026-03-16",note:"Tolls"},{id:"exp8",category:"Other",amount:300,date:"2026-03-16",note:"Misc"}],pod:{receiver:"Nitin Patel",date:"2026-03-16",files:1,note:"POD scan"},tripSheet:{settledDate:"2026-03-17",totalAdv:5000,totalExp:5390,balance:-390,note:"Driver owes ₹390"},deliveryDate:"2026-03-16",invoiceAmt:16800,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04606",lr:"LR-08006",routeId:"RT-001",status:"Paid",lrDate:"2026-03-10",client:"Reliance Retail",origin:"Mumbai",destination:"Pune",team:"West Team",vehicle:"MH12 CD 5678",driver:"Mohan Lal",vtype:"Own",consignor:"Reliance Dharavi WH",consignee:"Reliance Pune WH-1",goods:"Electronics & appliances",weightKg:6200,packages:140,declaredValue:920000,freight:8500,hire:null,freightTerms:"To Be Billed (TBB)",
    jobEntry:{date:"2026-03-10",time:"07:00",odoStart:78200,dispatchNote:"Fragile goods"},advances:[{id:"adv7",type:"Driver",amount:3000,mode:"Cash",date:"2026-03-10",note:"Advance"}],expenses:[{id:"exp9",category:"Fuel",amount:1800,date:"2026-03-11",note:"Fuel"},{id:"exp10",category:"Toll",amount:240,date:"2026-03-11",note:"Toll"}],pod:{receiver:"Vijay Sharma",date:"2026-03-11",files:1,note:"Scanned POD"},tripSheet:{settledDate:"2026-03-12",totalAdv:3000,totalExp:2040,balance:960,note:"₹960 refund from driver"},deliveryDate:"2026-03-11",invoiceAmt:8500,paymentDate:"2026-03-15",paymentRef:"UTR20260315001",delayed:false },
  // Trip Sheet trips
  { id:"T-04607",lr:"LR-08007",routeId:"RT-003",status:"Trip Sheet",lrDate:"2026-03-16",client:"Tata Chemicals",origin:"Delhi",destination:"Agra",team:"North Team",vehicle:"DL10 GH 9012",driver:"Arjun Nair",vtype:"Own",consignor:"Tata Chem Delhi Plant",consignee:"Tata Agra Warehouse",goods:"Soda ash bags",weightKg:20000,packages:400,declaredValue:720000,freight:7200,hire:null,freightTerms:"To Be Billed (TBB)",
    jobEntry:{date:"2026-03-16",time:"05:30",odoStart:89600,dispatchNote:"Heavy load"},advances:[{id:"adv8",type:"Driver",amount:3500,mode:"Cash",date:"2026-03-16",note:"Fuel advance"}],expenses:[{id:"exp11",category:"Fuel",amount:2400,date:"2026-03-17",note:"Diesel"},{id:"exp12",category:"Toll",amount:380,date:"2026-03-17",note:"NH2 toll"}],pod:{receiver:"Warehouse Mgr",date:"2026-03-17",files:1,note:"Signed LR"},tripSheet:{settledDate:"2026-03-18",totalAdv:3500,totalExp:2780,balance:720,note:"₹720 refund from driver"},deliveryDate:"2026-03-17",invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04608",lr:"LR-08008",routeId:"RT-005",status:"Trip Sheet",lrDate:"2026-03-14",client:"Nestlé India",origin:"Bengaluru",destination:"Chennai",team:"South Team",vehicle:"KA05 MN 4567",driver:"Sanjay Gupta",vtype:"Own",consignor:"Nestlé Bengaluru Plant",consignee:"Nestlé Chennai DC",goods:"Maggi noodles & sauces",weightKg:12800,packages:520,declaredValue:480000,freight:14000,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-14",time:"04:30",odoStart:33100,dispatchNote:"Standard FMCG"},advances:[{id:"adv9",type:"Driver",amount:5500,mode:"Cash",date:"2026-03-14",note:"Trip advance"}],expenses:[{id:"exp13",category:"Fuel",amount:3600,date:"2026-03-15",note:"NH44"},{id:"exp14",category:"Toll",amount:580,date:"2026-03-15",note:"NHAI"},{id:"exp15",category:"Labour",amount:600,date:"2026-03-15",note:"Unloading"}],pod:{receiver:"DC Manager",date:"2026-03-15",files:2,note:"POD + photo"},tripSheet:{settledDate:"2026-03-16",totalAdv:5500,totalExp:4780,balance:720,note:"Balance settled"},deliveryDate:"2026-03-15",invoiceAmt:null,paymentDate:null,paymentRef:null,delayed:false },
  // Extra Billed trips
  { id:"T-04609",lr:"LR-08009",routeId:"RT-001",status:"Billed",lrDate:"2026-03-12",client:"Reliance Retail",origin:"Mumbai",destination:"Pune",team:"West Team",vehicle:"MH12 AB 1234",driver:"Raju Singh",vtype:"Own",consignor:"Reliance Jamnagar DC",consignee:"Reliance Pune WH-3",goods:"Beverages & snacks",weightKg:13500,packages:350,declaredValue:310000,freight:8500,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-12",time:"06:00",odoStart:12800,dispatchNote:"Standard"},advances:[{id:"adv10",type:"Driver",amount:3200,mode:"Cash",date:"2026-03-12",note:"Advance"}],expenses:[{id:"exp16",category:"Fuel",amount:1900,date:"2026-03-13",note:"Fuel"},{id:"exp17",category:"Toll",amount:250,date:"2026-03-13",note:"Toll"}],pod:{receiver:"Store Incharge",date:"2026-03-13",files:1,note:"Signed copy"},tripSheet:{settledDate:"2026-03-14",totalAdv:3200,totalExp:2150,balance:1050,note:"₹1,050 refund"},deliveryDate:"2026-03-13",invoiceAmt:8925,paymentDate:null,paymentRef:null,delayed:false },
  { id:"T-04610",lr:"LR-08010",routeId:"RT-002",status:"Billed",lrDate:"2026-03-11",client:"ITC Limited",origin:"Mumbai",destination:"Nashik",team:"West Team",vehicle:"MH15 EF 2341",driver:"Suresh Kumar",vtype:"Attached",consignor:"ITC Mumbai Factory",consignee:"ITC Nashik Depot",goods:"Biscuits & personal care",weightKg:7600,packages:190,declaredValue:520000,freight:6930,hire:5200,freightTerms:"Paid",
    jobEntry:{date:"2026-03-11",time:"07:30",odoStart:45800,dispatchNote:"Sealed truck"},advances:[{id:"adv11",type:"Driver",amount:1800,mode:"Cash",date:"2026-03-11",note:"Advance"},{id:"adv12",type:"Hire Slip",amount:2500,mode:"Bank Transfer",date:"2026-03-11",note:"Owner payment"}],expenses:[{id:"exp18",category:"Fuel",amount:1700,date:"2026-03-12",note:"Diesel"},{id:"exp19",category:"Toll",amount:280,date:"2026-03-12",note:"Toll"}],pod:{receiver:"Depot Mgr",date:"2026-03-12",files:1,note:"ePOD"},tripSheet:{settledDate:"2026-03-13",totalAdv:4300,totalExp:1980,balance:2320,note:"Hire adjusted"},deliveryDate:"2026-03-12",invoiceAmt:7277,paymentDate:null,paymentRef:null,delayed:false },
  // Extra Paid trips
  { id:"T-04611",lr:"LR-08011",routeId:"RT-005",status:"Paid",lrDate:"2026-03-05",client:"Nestlé India",origin:"Bengaluru",destination:"Chennai",team:"South Team",vehicle:"KA05 MN 4567",driver:"Sanjay Gupta",vtype:"Own",consignor:"Nestlé Bengaluru Plant",consignee:"Nestlé Chennai DC",goods:"Baby food & cereals",weightKg:9800,packages:410,declaredValue:620000,freight:14000,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-05",time:"05:00",odoStart:31800,dispatchNote:"Temperature sensitive"},advances:[{id:"adv13",type:"Driver",amount:5800,mode:"Cash",date:"2026-03-05",note:"2-day advance"}],expenses:[{id:"exp20",category:"Fuel",amount:3500,date:"2026-03-06",note:"NH44"},{id:"exp21",category:"Toll",amount:600,date:"2026-03-06",note:"NHAI"},{id:"exp22",category:"Labour",amount:700,date:"2026-03-06",note:"Unloading"}],pod:{receiver:"DC Supervisor",date:"2026-03-06",files:1,note:"Signed"},tripSheet:{settledDate:"2026-03-07",totalAdv:5800,totalExp:4800,balance:1000,note:"₹1,000 refund"},deliveryDate:"2026-03-06",invoiceAmt:14700,paymentDate:"2026-03-12",paymentRef:"UTR20260312004",delayed:false },
  { id:"T-04612",lr:"LR-08012",routeId:"RT-009",status:"Paid",lrDate:"2026-03-02",client:"Marico",origin:"Pune",destination:"Ahmedabad",team:"West Team",vehicle:"MH14 WX 3456",driver:"Rahul Desai",vtype:"Own",consignor:"Marico Pune Factory",consignee:"Marico Ahmedabad DC",goods:"Saffola oils & oats",weightKg:11000,packages:310,declaredValue:420000,freight:16500,hire:null,freightTerms:"To Pay",
    jobEntry:{date:"2026-03-02",time:"03:30",odoStart:62400,dispatchNote:"Night dispatch"},advances:[{id:"adv14",type:"Driver",amount:5500,mode:"Cash",date:"2026-03-02",note:"Advance"}],expenses:[{id:"exp23",category:"Fuel",amount:4400,date:"2026-03-03",note:"Fuel"},{id:"exp24",category:"Toll",amount:920,date:"2026-03-03",note:"NH48 tolls"},{id:"exp25",category:"Other",amount:250,date:"2026-03-03",note:"Parking"}],pod:{receiver:"Godown Keeper",date:"2026-03-03",files:2,note:"POD + weighment slip"},tripSheet:{settledDate:"2026-03-04",totalAdv:5500,totalExp:5570,balance:-70,note:"₹70 due to driver"},deliveryDate:"2026-03-03",invoiceAmt:17325,paymentDate:"2026-03-09",paymentRef:"CHQ-884721",delayed:false },
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const c = STATE_COLOR[status]||{dot:"#9CA3AF",mid:"#F3F4F6",text:"#374151",border:"#E5E7EB"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:c.mid,color:c.text,border:`1px solid ${c.border}`,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,whiteSpace:"nowrap"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:c.dot}}/>{status}
  </span>;
};

const Tag = ({label,bg,col}) => <span style={{background:bg,color:col,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6}}>{label}</span>;
const Lbl = ({t,required}) => <div style={{fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:.6,marginBottom:5}}>{t}{required&&<span style={{color:"#EF4444",marginLeft:2}}>*</span>}</div>;

const Field = ({value,onChange,placeholder,type="text",disabled}) => (
  <input type={type} value={value||""} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    style={{width:"100%",border:`1.5px solid ${disabled?"#F1F5F9":"#E2E8F0"}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:disabled?"#94A3B8":"#1E293B",background:disabled?"#F8FAFC":"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} />
);

const Dropdown = ({value,onChange,children}) => (
  <select value={value||""} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"10px 12px",fontSize:13,color:"#1E293B",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:"pointer"}}>
    {children}
  </select>
);

// Searchable dropdown — replaces native select with type-ahead filtering
function SearchDropdown({value,onChange,options,placeholder="Select..."}) {
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const selected = options.find(o=>o.value===value);
  const filtered = query ? options.filter(o=>o.label.toLowerCase().includes(query.toLowerCase())) : options;
  return (
    <div style={{position:"relative"}}>
      <div onClick={()=>{setOpen(!open);setQuery("");}}
        style={{width:"100%",border:`1.5px solid ${open?"#0EA5E9":"#E2E8F0"}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:selected?"#1E293B":"#94A3B8",background:"#fff",cursor:"pointer",boxSizing:"border-box",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected?selected.label:placeholder}</span>
        <span style={{fontSize:10,color:"#94A3B8",marginLeft:8}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:10,zIndex:60,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",overflow:"hidden",marginTop:4,maxHeight:240}}>
          <div style={{padding:"8px",borderBottom:"1px solid #F1F5F9"}}>
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Search..."
              style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:8,padding:"8px 10px",fontSize:12,color:"#1E293B",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {filtered.length===0 && <div style={{padding:"12px 14px",fontSize:12,color:"#94A3B8"}}>No results found</div>}
            {filtered.map(o=>(
              <button key={o.value} onClick={()=>{onChange(o.value);setOpen(false);setQuery("");}}
                style={{width:"100%",background:o.value===value?"#F0F7FF":"none",border:"none",padding:"10px 14px",textAlign:"left",cursor:"pointer",borderBottom:"1px solid #F8FAFC",fontSize:12,color:"#1E293B",fontFamily:"inherit",display:"block"}}
                onMouseEnter={e=>{if(o.value!==value)e.currentTarget.style.background="#F8FAFC";}}
                onMouseLeave={e=>{e.currentTarget.style.background=o.value===value?"#F0F7FF":"none";}}>
                <div style={{fontWeight:o.value===value?700:400}}>{o.label}</div>
                {o.sub && <div style={{fontSize:11,color:"#94A3B8",marginTop:1}}>{o.sub}</div>}
              </button>
            ))}
          </div>
        </div>
      )}
      {open && <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:55}}/>}
    </div>
  );
}

const Btn = ({label,onClick,color="#1E3A5F",secondary,disabled,small}) => (
  <button onClick={onClick} disabled={disabled} style={{background:disabled?"#F1F5F9":secondary?"#F8FAFC":color,color:disabled?"#CBD5E1":secondary?"#475569":"#fff",border:secondary?"1.5px solid #E2E8F0":"none",borderRadius:10,padding:small?"8px 14px":"10px 20px",fontSize:small?12:13,fontWeight:700,cursor:disabled?"default":"pointer",whiteSpace:"nowrap"}}>
    {label}
  </button>
);

const Divider = ({label}) => (
  <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0 12px"}}>
    {label && <span style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.7,whiteSpace:"nowrap"}}>{label}</span>}
    <div style={{flex:1,height:1,background:"#F1F5F9"}}/>
  </div>
);

const InfoRow = ({label,value,mono,tag}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #F8FAFC"}}>
    <span style={{fontSize:12,color:"#64748B"}}>{label}</span>
    <span style={{fontSize:12,fontWeight:700,color:"#1E293B",fontFamily:mono?"monospace":"inherit",display:"flex",alignItems:"center",gap:6}}>{value}{tag}</span>
  </div>
);

// ─── OPS ACTIONS ──────────────────────────────────────────────────────────────

// Assign vehicle to a consignment → moves to In Transit
function ActionDispatch({trip, onDone}) {
  const [vehInput,setVehInput]=useState("");
  const [showDD,setShowDD]=useState(false);
  const [resolved,setResolved]=useState(null);
  const [jobTime,setJobTime]=useState("");
  const [odoStart,setOdoStart]=useState("");
  const [dispNote,setDispNote]=useState("");
  const [advAmt,setAdvAmt]=useState("");
  const [advMode,setAdvMode]=useState("");

  const allNums = Object.keys(VEHICLE_MAP);
  const suggestions = vehInput.length>=2 ? allNums.filter(n=>n.toLowerCase().includes(vehInput.toLowerCase())).slice(0,5) : [];

  const resolveVeh = (num) => {
    const key = Object.keys(VEHICLE_MAP).find(k=>k.replace(/\s/g,"")===num.replace(/\s/g,"").toUpperCase());
    setVehInput(num); setShowDD(false);
    if(key){ setResolved(VEHICLE_MAP[key]); } else { setResolved(null); }
  };

  return (
    <div style={{background:"#F0F9FF",border:"1.5px solid #BAE6FD",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#0369A1",marginBottom:12}}>🚛 Assign Vehicle & Dispatch</div>
      <div style={{position:"relative",marginBottom:12}}>
        <Lbl t="Vehicle Number" required/>
        <div style={{display:"flex",gap:8}}>
          <input value={vehInput} onChange={e=>{setVehInput(e.target.value);setShowDD(true);if(!e.target.value)setResolved(null);}}
            onBlur={()=>setTimeout(()=>setShowDD(false),150)} placeholder="Type vehicle number..."
            style={{flex:1,border:`1.5px solid ${resolved?"#86EFAC":"#E2E8F0"}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:"#1E293B",background:resolved?"#F0FDF4":"#fff",outline:"none",fontFamily:"inherit"}}/>
          <button onClick={()=>resolveVeh(vehInput)} style={{background:"#1E3A5F",color:"#fff",border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Look up</button>
        </div>
        {showDD&&suggestions.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:10,zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,0.1)",overflow:"hidden",marginTop:4}}>
            {suggestions.map(num=>{const v=VEHICLE_MAP[num];return(
              <button key={num} onMouseDown={()=>resolveVeh(num)} style={{width:"100%",background:"none",border:"none",padding:"10px 14px",textAlign:"left",cursor:"pointer",borderBottom:"1px solid #F8FAFC",display:"flex",gap:10,alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.background="#F0F7FF"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span>🚛</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:"#1E293B"}}>{num}</div>
                  <div style={{fontSize:11,color:"#64748B"}}>{v.driver} · {v.type} · {v.route.origin}→{v.route.destination}</div>
                </div>
              </button>);})}
          </div>
        )}
      </div>
      {resolved && (
        <div style={{background:"#D1FAE5",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:"#065F46"}}>
          ✓ <strong>{resolved.driver}</strong> · {resolved.type} vehicle
        </div>
      )}
      {resolved && (
        <>
          <Divider label="Job Entry (optional)"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><Lbl t="Dispatch Time"/><Field type="time" value={jobTime} onChange={setJobTime}/></div>
            <div><Lbl t="Odometer (km)"/><Field type="number" value={odoStart} onChange={setOdoStart} placeholder="Starting reading"/></div>
            <div style={{gridColumn:"1/-1"}}><Lbl t="Note"/><Field value={dispNote} onChange={setDispNote} placeholder="e.g. Sealed, fragile, cold chain"/></div>
          </div>
          <Divider label="Driver Advance (optional)"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><Lbl t="Advance (₹)"/><Field type="number" value={advAmt} onChange={setAdvAmt} placeholder="0"/></div>
            <div><Lbl t="Mode"/>
              <SearchDropdown value={advMode} onChange={setAdvMode} placeholder="Select mode..." options={PAYMENT_MODES.map(m=>({value:m,label:m}))}/>
            </div>
          </div>
          <Btn label="✓ Dispatch — Move to In Transit" onClick={()=>{
            const adv = advAmt ? [{id:`adv${Date.now()}`,type:"Driver",amount:Number(advAmt),mode:advMode,date:today(),note:"Dispatch advance"}] : [];
            const je = (jobTime||odoStart||dispNote) ? {date:today(),time:jobTime,odoStart:Number(odoStart)||null,dispatchNote:dispNote} : null;
            onDone({
              status:"In Transit",vehicle:vehInput,driver:resolved.driver,vtype:resolved.type,
              jobEntry:je,advances:[...trip.advances,...adv],
            });
          }} color="#0EA5E9"/>
        </>
      )}
    </div>
  );
}

// Mark Delivered + ePOD upload in one step
function ActionMarkDelivered({trip, onDone}) {
  const [date,setDate]=useState(today());
  const [condition,setCondition]=useState("");
  const [receiver,setReceiver]=useState("");
  const [uploaded,setUploaded]=useState(false);
  const [podNote,setPodNote]=useState("");
  return (
    <div style={{background:"#F0FDF4",border:"1.5px solid #A7F3D0",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#065F46",marginBottom:12}}>✅ Mark Delivered & Upload ePOD</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><Lbl t="Delivery Date" required/><Field type="date" value={date} onChange={setDate}/></div>
        <div><Lbl t="Goods Condition" required/>
          <Dropdown value={condition} onChange={setCondition}>
            <option value="">Select...</option>
            <option>Good — No issues</option>
            <option>Damaged — Partial</option>
            <option>Short — Quantity less</option>
          </Dropdown>
        </div>
      </div>

      <Divider label="ePOD — Proof of Delivery"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><Lbl t="Received By"/><Field value={receiver} onChange={setReceiver} placeholder="Name at destination"/></div>
        <div><Lbl t="Note"/><Field value={podNote} onChange={setPodNote} placeholder="e.g. Signed LR copy"/></div>
      </div>
      <div style={{marginBottom:14}}>
        <button onClick={()=>setUploaded(true)} style={{width:"100%",background:uploaded?"#F0FDF4":"#F8FAFC",border:`1.5px ${uploaded?"solid":"dashed"} ${uploaded?"#6EE7B7":"#E2E8F0"}`,borderRadius:10,padding:"12px",cursor:"pointer",textAlign:"center"}}>
          {uploaded ? <span style={{color:"#065F46",fontWeight:700,fontSize:13}}>✓ ePOD Uploaded</span>
                    : <span style={{color:"#94A3B8",fontSize:13}}>📎 Upload signed LR / delivery photo / ePOD</span>}
        </button>
      </div>

      <Btn label="✓ Confirm Delivery" onClick={()=>{
        if(!condition) return;
        const pod = (receiver||uploaded) ? {receiver:receiver||"—",date,files:uploaded?1:0,note:podNote||"ePOD at delivery"} : null;
        onDone({status:"Delivered",deliveryDate:date,pod});
      }} disabled={!condition} color="#10B981"/>
    </div>
  );
}

// ─── ACCOUNTS ACTIONS ─────────────────────────────────────────────────────────

function ActionAddAdvance({trip, onDone}) {
  const [atype,setAtype]=useState("Driver");
  const [amount,setAmount]=useState("");
  const [mode,setMode]=useState("");
  const [note,setNote]=useState("");
  const isHire = trip.vtype==="Attached"||trip.vtype==="Market";
  return (
    <div style={{background:"#F5F3FF",border:"1.5px solid #C4B5FD",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#5B21B6",marginBottom:12}}>💵 Add Advance</div>
      {isHire && (
        <div style={{marginBottom:10}}>
          <Lbl t="Advance Type"/>
          <div style={{display:"flex",gap:8}}>
            {["Driver","Hire Slip"].map(t=>(
              <button key={t} onClick={()=>setAtype(t)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${atype===t?"#7C3AED":"#E2E8F0"}`,background:atype===t?"#EDE9FE":"#fff",color:atype===t?"#5B21B6":"#64748B",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><Lbl t="Amount (₹)" required/><Field type="number" value={amount} onChange={setAmount} placeholder="0"/></div>
        <div><Lbl t="Payment Mode"/>
          <SearchDropdown value={mode} onChange={setMode} placeholder="Select mode..." options={PAYMENT_MODES.map(m=>({value:m,label:m}))}/>
        </div>
      </div>
      <div style={{marginBottom:12}}><Lbl t="Note"/><Field value={note} onChange={setNote} placeholder="Purpose of advance"/></div>
      <Btn label="Save Advance" onClick={()=>amount&&onDone("advance",{type:atype,amount:Number(amount),mode,note,date:today(),id:`adv${Date.now()}`})} disabled={!amount} color="#7C3AED"/>
    </div>
  );
}

function ActionTripSheet({trip, onDone}) {
  const [cat,setCat]=useState("");
  const [amount,setAmount]=useState("");
  const [note,setNote]=useState("");
  const [date,setDate]=useState(today());
  const [settleNote,setSettleNote]=useState("");
  const totalAdv = trip.advances.reduce((s,a)=>s+a.amount,0);
  const totalExp = trip.expenses.reduce((s,e)=>s+e.amount,0);
  const [newExpenses,setNewExpenses]=useState([]);
  const allExp = totalExp + newExpenses.reduce((s,e)=>s+e.amount,0) + Number(amount||0);
  const balance = totalAdv - allExp;

  const addExpense = () => {
    if(!cat||!amount) return;
    setNewExpenses(prev=>[...prev,{category:cat,amount:Number(amount),note,date,id:`exp${Date.now()}`}]);
    setCat(""); setAmount(""); setNote("");
  };

  return (
    <div style={{background:"#FFFBEB",border:"1.5px solid #FCD34D",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#92400E",marginBottom:4}}>🧾 Trip Sheet — Expense Settlement</div>
      <div style={{fontSize:11,color:"#64748B",marginBottom:14}}>Log all trip expenses and settle against advances given to the driver.</div>

      {trip.expenses.length>0 && (
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:6}}>PREVIOUSLY LOGGED</div>
          {trip.expenses.map(e=>(
            <div key={e.id} style={{background:"#fff",borderRadius:6,padding:"6px 10px",marginBottom:4,fontSize:12,display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"#64748B"}}>{e.category} — {e.note}</span><strong style={{color:"#D97706"}}>{money(e.amount)}</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:6}}>ADD EXPENSE</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
        <div><Lbl t="Category"/>
          <SearchDropdown value={cat} onChange={setCat} placeholder="Select category..." options={EXPENSE_CATS.map(c=>({value:c,label:c}))}/>
        </div>
        <div><Lbl t="Amount (₹)"/><Field type="number" value={amount} onChange={setAmount} placeholder="0"/></div>
        <div><Lbl t="Date"/><Field type="date" value={date} onChange={setDate}/></div>
        <div><Lbl t="Note"/><Field value={note} onChange={setNote} placeholder="Details"/></div>
      </div>
      <div style={{marginBottom:12}}>
        <Btn label="+ Add Expense Line" onClick={addExpense} disabled={!cat||!amount} small secondary/>
      </div>

      {newExpenses.length>0 && (
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:6}}>NEW EXPENSES</div>
          {newExpenses.map((e,i)=>(
            <div key={i} style={{background:"#FEF3C7",borderRadius:6,padding:"6px 10px",marginBottom:4,fontSize:12,display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"#92400E"}}>{e.category} — {e.note||"—"}</span><strong style={{color:"#D97706"}}>{money(e.amount)}</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{background:"#1E293B",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        {[["Total Advances",money(totalAdv)],["Total Expenses",money(allExp)]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{color:"#94A3B8"}}>{l}</span><span style={{color:"#F0F2FF",fontWeight:700}}>{v}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid #334155",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:14}}>
          <span style={{color:"#fff",fontWeight:800}}>Balance</span>
          <span style={{color:balance>=0?"#22C55E":"#EF4444",fontWeight:800}}>
            {balance>=0?`₹${balance.toLocaleString()} refund from driver`:`₹${Math.abs(balance).toLocaleString()} due to driver`}
          </span>
        </div>
      </div>
      <div style={{marginBottom:12}}><Lbl t="Settlement Note"/><Field value={settleNote} onChange={setSettleNote} placeholder="e.g. Cash settled, balance adjusted next trip"/></div>
      <Btn label="✓ Settle Trip Sheet" onClick={()=>{
        onDone("tripsheet",{newExpenses,settleNote,totalAdv,totalExp:allExp,balance});
      }} color="#D97706"/>
    </div>
  );
}

function ActionRaiseBill({trip, onDone}) {
  const [detention,setDetention]=useState("0");
  const [loading,setLoading]=useState("0");
  const [other,setOther]=useState("0");
  const [gst,setGst]=useState("5");
  const [billDate,setBillDate]=useState(today());
  const base = trip.freight;
  const sub = base+Number(detention)+Number(loading)+Number(other);
  const gstAmt = Math.round(sub*Number(gst)/100);
  const total = sub+gstAmt;
  return (
    <div style={{background:"#EEF2FF",border:"1.5px solid #A5B4FC",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#3730A3",marginBottom:8}}>📄 Raise Freight Bill</div>
      <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
        <InfoRow label="Base Freight" value={money(base)} tag={<Tag label="AUTO" bg="#D1FAE5" col="#065F46"/>}/>
        <InfoRow label="Client" value={trip.client} tag={<Tag label="AUTO" bg="#D1FAE5" col="#065F46"/>}/>
        <InfoRow label="Freight Terms" value={trip.freightTerms} tag={<Tag label="AUTO" bg="#D1FAE5" col="#065F46"/>}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><Lbl t="Detention (₹)"/><Field type="number" value={detention} onChange={setDetention}/></div>
        <div><Lbl t="Loading Charges (₹)"/><Field type="number" value={loading} onChange={setLoading}/></div>
        <div><Lbl t="Other Charges (₹)"/><Field type="number" value={other} onChange={setOther}/></div>
        <div><Lbl t="GST %"/>
          <Dropdown value={gst} onChange={setGst}>
            <option value="0">0% — Exempt</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
          </Dropdown>
        </div>
        <div><Lbl t="Bill Date"/><Field type="date" value={billDate} onChange={setBillDate}/></div>
      </div>
      <div style={{background:"#1E293B",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        {[[`Sub-total`,`₹${sub.toLocaleString()}`],[`GST (${gst}%)`,`₹${gstAmt.toLocaleString()}`]].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
            <span style={{color:"#94A3B8"}}>{l}</span><span style={{color:"#F0F2FF",fontWeight:700}}>{v}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid #334155",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:15}}>
          <span style={{color:"#fff",fontWeight:800}}>Invoice Total</span>
          <span style={{color:"#22C55E",fontWeight:800}}>₹{total.toLocaleString()}</span>
        </div>
      </div>
      <Btn label="Generate Invoice" onClick={()=>onDone({status:"Billed",invoiceAmt:total})} color="#6366F1"/>
    </div>
  );
}

function ActionRecordPayment({trip, onDone}) {
  const [amount,setAmount]=useState(trip.invoiceAmt||trip.freight);
  const [mode,setMode]=useState("");
  const [ref,setRef]=useState("");
  const [date,setDate]=useState(today());
  return (
    <div style={{background:"#F0FDF4",border:"1.5px solid #86EFAC",borderRadius:12,padding:"16px"}}>
      <div style={{fontSize:13,fontWeight:800,color:"#14532D",marginBottom:8}}>💳 Payment Receipt</div>
      <div style={{background:"#fff",borderRadius:8,padding:"10px 12px",marginBottom:12}}>
        <InfoRow label="Invoice Amount" value={money(trip.invoiceAmt||trip.freight)} tag={<Tag label="AUTO" bg="#D1FAE5" col="#065F46"/>}/>
        <InfoRow label="Client" value={trip.client}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div><Lbl t="Amount Received (₹)" required/><Field type="number" value={amount} onChange={setAmount}/></div>
        <div><Lbl t="Payment Mode" required/>
          <SearchDropdown value={mode} onChange={setMode} placeholder="Select mode..." options={PAYMENT_MODES.map(m=>({value:m,label:m}))}/>
        </div>
        <div><Lbl t="UTR / Reference No."/><Field value={ref} onChange={setRef} placeholder="Transaction reference"/></div>
        <div><Lbl t="Payment Date"/><Field type="date" value={date} onChange={setDate}/></div>
      </div>
      <Btn label="✓ Record Payment" onClick={()=>mode&&onDone({status:"Paid",paymentDate:date,paymentRef:ref})} disabled={!mode} color="#16A34A"/>
    </div>
  );
}

// Section card wrapper — inspired by the reference screenshots
const Section = ({icon,title,bg,borderColor,children}) => (
  <div style={{border:`1.5px solid ${borderColor||"#E2E8F0"}`,borderRadius:12,marginBottom:14,overflow:"hidden"}}>
    <div style={{background:bg||"#F8FAFC",padding:"10px 14px",borderBottom:`1px solid ${borderColor||"#E2E8F0"}`,display:"flex",alignItems:"center",gap:8}}>
      {icon&&<span style={{fontSize:14}}>{icon}</span>}
      <span style={{fontSize:12,fontWeight:800,color:"#1E293B",textTransform:"uppercase",letterSpacing:.5}}>{title}</span>
    </div>
    <div style={{padding:"14px"}}>{children}</div>
  </div>
);

// Edit Consignment Details — available on Consignment, In Transit, Delivered
function ActionEditDetails({trip, onDone}) {
  const [consignor,setConsignor]=useState(trip.consignor||"");
  const [consignee,setConsignee]=useState(trip.consignee||"");
  const [goods,setGoods]=useState(trip.goods||"");
  const [weightKg,setWeightKg]=useState(trip.weightKg||"");
  const [packages,setPackages]=useState(trip.packages||"");
  const [declaredVal,setDeclaredVal]=useState(trip.declaredValue||"");
  const showEway = Number(declaredVal)>50000;
  return (
    <div>
      <Section icon="📦" title="Consignor & Consignee">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><Lbl t="Consignor (Sender)"/><Field value={consignor} onChange={setConsignor} placeholder="Sender name / company"/></div>
          <div><Lbl t="Consignee (Receiver)"/><Field value={consignee} onChange={setConsignee} placeholder="Receiver name / company"/></div>
        </div>
      </Section>
      <Section icon="🏷️" title="Cargo Details">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><Lbl t="Cargo Description"/><Field value={goods} onChange={setGoods} placeholder="e.g. FMCG Goods, Chemicals, Electronics"/></div>
          <div><Lbl t="Cargo Weight (kg)"/><Field type="number" value={weightKg} onChange={setWeightKg} placeholder="0"/></div>
          <div><Lbl t="Packages / Units"/><Field type="number" value={packages} onChange={setPackages} placeholder="0"/></div>
          <div><Lbl t="Consignment Value (₹)"/><Field type="number" value={declaredVal} onChange={setDeclaredVal} placeholder="0"/></div>
        </div>
        {showEway && (
          <div style={{background:"#F0FDF4",border:"1px solid #A7F3D0",borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:12,color:"#065F46",display:"flex",alignItems:"center",gap:6}}>
            <span>✅</span> ₹{Number(declaredVal).toLocaleString()} exceeds ₹50,000 — E-Way Bill is mandatory.
          </div>
        )}
      </Section>
      <Btn label="✓ Save Details" onClick={()=>onDone({consignor,consignee,goods,weightKg:Number(weightKg)||0,packages:Number(packages)||0,declaredValue:Number(declaredVal)||0})} color="#1E3A5F"/>
    </div>
  );
}

// ─── TRIP DETAIL ─────────────────────────────────────────────────────────────

function TripDetail({ trip, role, onUpdate, onBack }) {
  const [activeAction, setActiveAction] = useState(null);
  const totalAdv = trip.advances.reduce((s,a)=>s+a.amount,0);
  const sc = STATE_COLOR[trip.status]||{};

  const opsActions = {
    "Consignment":["dispatch","edit"],
    "In Transit": ["deliver","edit"],
    "Delivered":["edit"], "Trip Sheet":[], "Billed":[], "Paid":[],
  };
  const acctActions = {
    "Consignment":["edit"],
    "In Transit": ["advance","edit"],
    "Delivered":  ["tripsheet","edit"],
    "Trip Sheet": ["bill"],
    "Billed":     ["payment"],
    "Paid":       [],
  };
  const availableActions = role==="ops" ? (opsActions[trip.status]||[]) : (acctActions[trip.status]||[]);

  const ACTION_META = {
    dispatch:  { label:"Assign Vehicle & Dispatch",icon:"🚛", color:"#0EA5E9" },
    deliver:   { label:"Mark Delivered + ePOD", icon:"✅", color:"#10B981" },
    edit:      { label:"Edit Details",          icon:"✏️", color:"#64748B" },
    advance:   { label:"Add Advance",           icon:"💵", color:"#7C3AED" },
    tripsheet: { label:"Trip Sheet / Settle",   icon:"🧾", color:"#D97706" },
    bill:      { label:"Raise Freight Bill",    icon:"📄", color:"#6366F1" },
    payment:   { label:"Payment Receipt",       icon:"💳", color:"#16A34A" },
  };

  const handleActionDone = (actionIdOrUpdates, subData) => {
    if (subData) {
      if (actionIdOrUpdates==="advance") onUpdate({advances:[...trip.advances,subData]});
      if (actionIdOrUpdates==="tripsheet") {
        onUpdate({
          status:"Trip Sheet",
          expenses:[...trip.expenses,...subData.newExpenses],
          tripSheet:{settledDate:today(),totalAdv:subData.totalAdv,totalExp:subData.totalExp,balance:subData.balance,note:subData.settleNote}
        });
      }
    } else {
      onUpdate(actionIdOrUpdates);
    }
    setActiveAction(null);
  };

  // Accounts Ledger
  const ledgerEntries = [];
  trip.advances.forEach(a => ledgerEntries.push({date:a.date, type:"Advance", desc:`${a.type} — ${a.note||"Advance"}`, debit:a.amount, credit:0}));
  if(trip.tripSheet) {
    trip.expenses.forEach(e => ledgerEntries.push({date:e.date, type:"Expense", desc:`${e.category} — ${e.note||""}`, debit:e.amount, credit:0}));
    ledgerEntries.push({date:trip.tripSheet.settledDate, type:"Settlement", desc:`Trip Sheet settled (${trip.tripSheet.note||""})`, debit:0, credit:0, isSettlement:true});
  }
  if(trip.invoiceAmt) ledgerEntries.push({date:trip.deliveryDate||today(), type:"Freight Bill", desc:`Invoice ₹${trip.invoiceAmt.toLocaleString()} to ${trip.client}`, debit:0, credit:trip.invoiceAmt});
  if(trip.paymentDate) ledgerEntries.push({date:trip.paymentDate, type:"Payment", desc:`Received ${trip.paymentRef||"—"}`, debit:0, credit:trip.invoiceAmt||trip.freight});

  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748B",fontSize:12,fontWeight:700,cursor:"pointer",padding:"0 0 14px",marginBottom:4}}>← Back to list</button>

      <div style={{background:`linear-gradient(135deg,${sc.dot||"#1E3A5F"},${sc.dot||"#1E3A5F"}cc)`,borderRadius:14,padding:"16px 18px",marginBottom:16,color:"#fff"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <div style={{fontSize:11,opacity:.75,fontWeight:700,letterSpacing:1,marginBottom:3}}>{trip.id} · {trip.lr}</div>
            <div style={{fontSize:18,fontWeight:800}}>{trip.origin} → {trip.destination}</div>
            <div style={{fontSize:13,opacity:.85,marginTop:2}}>{trip.client} · {trip.team}</div>
          </div>
          <Badge status={trip.status}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {trip.delayed && <span style={{background:"rgba(220,38,38,.3)",border:"1px solid rgba(220,38,38,.5)",color:"#fca5a5",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>🚨 Delayed</span>}
          {trip.vehicle ? <span style={{background:"rgba(255,255,255,.2)",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>{trip.vtype} · {trip.vehicle}</span>
            : <span style={{background:"rgba(255,255,255,.2)",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>No vehicle assigned</span>}
          <span style={{background:"rgba(255,255,255,.2)",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>LR: {fmtD(trip.lrDate)}</span>
          {trip.pod && <span style={{background:"rgba(34,197,94,.3)",fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:10}}>📋 ePOD</span>}
        </div>
      </div>

      {availableActions.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.7,marginBottom:8}}>
            {role==="ops"?"Operations":"Accounts"} — Next Step
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {availableActions.map(a=>{
              const m = ACTION_META[a];
              return (
                <button key={a} onClick={()=>setActiveAction(activeAction===a?null:a)}
                  style={{display:"flex",alignItems:"center",gap:6,background:activeAction===a?m.color:"#F8FAFC",color:activeAction===a?"#fff":m.color,border:`1.5px solid ${activeAction===a?m.color:m.color+"40"}`,borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeAction==="dispatch"  && <div style={{marginBottom:16}}><ActionDispatch      trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="deliver"   && <div style={{marginBottom:16}}><ActionMarkDelivered trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="edit"      && <div style={{marginBottom:16}}><ActionEditDetails   trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="advance"   && <div style={{marginBottom:16}}><ActionAddAdvance    trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="tripsheet" && <div style={{marginBottom:16}}><ActionTripSheet     trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="bill"      && <div style={{marginBottom:16}}><ActionRaiseBill     trip={trip} onDone={handleActionDone}/></div>}
      {activeAction==="payment"   && <div style={{marginBottom:16}}><ActionRecordPayment trip={trip} onDone={handleActionDone}/></div>}

      {trip.status==="Paid" && (
        <div style={{background:"#DCFCE7",border:"1.5px solid #86EFAC",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🎉</span>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#14532D"}}>Trip fully closed</div>
            <div style={{fontSize:12,color:"#166534"}}>Payment received {fmtD(trip.paymentDate)} · All settled</div>
          </div>
        </div>
      )}

      <Section icon="📄" title="LR / Consignment" borderColor="#E2E8F0">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
          <InfoRow label="LR / Bilty" value={trip.lr} mono/>
          <InfoRow label="LR Date" value={fmtD(trip.lrDate)}/>
        </div>
        <InfoRow label="Client" value={trip.client}/>
        <InfoRow label="Freight Terms" value={trip.freightTerms}/>
        <InfoRow label="Contract Freight" value={money(trip.freight)}/>
      </Section>

      {trip.vehicle && (
        <Section icon="🚛" title="Vehicle & Driver" borderColor="#BAE6FD" bg="#F0F9FF">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <InfoRow label="Vehicle" value={trip.vehicle} mono/>
            <InfoRow label="Type" value={trip.vtype}/>
            <InfoRow label="Driver" value={trip.driver}/>
            <InfoRow label="Route" value={`${trip.origin} → ${trip.destination}`}/>
          </div>
          {trip.jobEntry && (
            <>
              <div style={{borderTop:"1px solid #E0F2FE",margin:"8px 0"}}/>
              <div style={{fontSize:10,fontWeight:700,color:"#0369A1",marginBottom:6}}>JOB ENTRY / TRIP LOG</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                <InfoRow label="Dispatch" value={`${fmtD(trip.jobEntry.date)} at ${trip.jobEntry.time||"—"}`}/>
                {trip.jobEntry.odoStart && <InfoRow label="Odometer" value={`${trip.jobEntry.odoStart.toLocaleString()} km`}/>}
              </div>
              {trip.jobEntry.dispatchNote && <InfoRow label="Note" value={trip.jobEntry.dispatchNote}/>}
            </>
          )}
        </Section>
      )}

      {(trip.consignor||trip.goods) && (
        <Section icon="📦" title="Consignment Details" borderColor="#E2E8F0">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <InfoRow label="Consignor" value={trip.consignor||"—"}/>
            <InfoRow label="Consignee" value={trip.consignee||"—"}/>
          </div>
          {trip.goods && <InfoRow label="Cargo" value={trip.goods}/>}
          {(trip.weightKg>0||trip.packages>0) && <InfoRow label="Weight / Pkgs" value={`${(trip.weightKg/1000).toFixed(1)}T · ${trip.packages} pkgs`}/>}
          {trip.declaredValue>0 && (
            <>
              <InfoRow label="Consignment Value" value={money(trip.declaredValue)}/>
              {trip.declaredValue>50000 && (
                <div style={{background:"#F0FDF4",border:"1px solid #A7F3D0",borderRadius:6,padding:"6px 10px",marginTop:6,fontSize:11,color:"#065F46"}}>
                  ✅ E-Way Bill applicable (value exceeds ₹50,000)
                </div>
              )}
            </>
          )}
          {!trip.goods && !trip.consignor && (
            <div style={{fontSize:12,color:"#94A3B8",fontStyle:"italic",padding:"8px 0"}}>No consignment details added yet — use Edit Details to fill in.</div>
          )}
        </Section>
      )}

      {trip.deliveryDate && (
        <Section icon="✅" title="Delivery" borderColor="#A7F3D0" bg="#F0FDF4">
          <InfoRow label="Delivered On" value={fmtD(trip.deliveryDate)}/>
        </Section>
      )}

      {trip.pod && (
        <Section icon="📋" title="ePOD — Proof of Delivery" borderColor="#FCD34D" bg="#FFFBEB">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <InfoRow label="Received By" value={trip.pod.receiver}/>
            <InfoRow label="Date" value={fmtD(trip.pod.date)}/>
          </div>
          {trip.pod.note && <InfoRow label="Note" value={trip.pod.note}/>}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
            <Tag label="✓ ON FILE" bg="#FEF3C7" col="#92400E"/>
          </div>
        </Section>
      )}

      {/* Accounts Ledger */}
      {(role==="accts" && ledgerEntries.length>0) && (
        <Section icon="📊" title="Accounts Ledger" borderColor="#A5B4FC" bg="#EEF2FF">
          <div style={{background:"#fff",borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"70px 90px 1fr 80px 80px",padding:"8px 12px",background:"#F8FAFC",fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:.5}}>
              <span>Date</span><span>Type</span><span>Description</span><span style={{textAlign:"right"}}>Debit</span><span style={{textAlign:"right"}}>Credit</span>
            </div>
            {ledgerEntries.map((e,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"70px 90px 1fr 80px 80px",padding:"7px 12px",borderTop:"1px solid #F1F5F9",fontSize:12,background:e.isSettlement?"#FEF3C7":"transparent"}}>
                <span style={{color:"#94A3B8",fontFamily:"monospace",fontSize:11}}>{fmtD(e.date)}</span>
                <span><Tag label={e.type} bg={e.type==="Advance"?"#EDE9FE":e.type==="Expense"?"#FEF3C7":e.type==="Freight Bill"?"#E0E7FF":e.type==="Payment"?"#D1FAE5":"#F1F5F9"} col={e.type==="Advance"?"#5B21B6":e.type==="Expense"?"#92400E":e.type==="Freight Bill"?"#3730A3":e.type==="Payment"?"#065F46":"#64748B"}/></span>
                <span style={{color:"#1E293B",fontSize:11}}>{e.desc}</span>
                <span style={{textAlign:"right",fontWeight:700,color:e.debit?"#DC2626":"#CBD5E1"}}>{e.debit?money(e.debit):"—"}</span>
                <span style={{textAlign:"right",fontWeight:700,color:e.credit?"#16A34A":"#CBD5E1"}}>{e.credit?money(e.credit):"—"}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {role==="ops" && totalAdv>0 && (
        <Section icon="💵" title="Advances Given" borderColor="#C4B5FD" bg="#F5F3FF">
          {trip.advances.map(a=>(
            <div key={a.id} style={{background:"#fff",borderRadius:8,padding:"9px 12px",marginBottom:6}}>
              <div style={{fontSize:12,fontWeight:700,color:"#5B21B6"}}>{a.type} · {money(a.amount)}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{a.mode} · {fmtD(a.date)} {a.note&&`· ${a.note}`}</div>
            </div>
          ))}
        </Section>
      )}

      {trip.tripSheet && (
        <Section icon="🧾" title="Trip Sheet Settlement" borderColor="#FCD34D" bg="#FFFBEB">
          <div style={{background:"#1E293B",borderRadius:10,padding:"10px 14px"}}>
            {[["Advances Given",money(trip.tripSheet.totalAdv)],["Expenses Incurred",money(trip.tripSheet.totalExp)]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:"#94A3B8"}}>{l}</span><span style={{color:"#F0F2FF",fontWeight:700}}>{v}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #334155",paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:13}}>
              <span style={{color:"#fff",fontWeight:800}}>Balance</span>
              <span style={{color:trip.tripSheet.balance>=0?"#22C55E":"#EF4444",fontWeight:800}}>
                {trip.tripSheet.balance>=0?`₹${trip.tripSheet.balance.toLocaleString()} refund`:`₹${Math.abs(trip.tripSheet.balance).toLocaleString()} due`}
              </span>
            </div>
            {trip.tripSheet.note && <div style={{fontSize:11,color:"#94A3B8",marginTop:6}}>{trip.tripSheet.note}</div>}
          </div>
        </Section>
      )}
    </div>
  );
}


// ─── ADD TRIP FORM ───────────────────────────────────────────────────────────

function AddTripForm({ onSave, onClose }) {
  const [lrNum,setLrNum]=useState("");
  const [lrDate,setLrDate]=useState(today());
  const [tripDate,setTripDate]=useState(today());
  const [vehInput,setVehInput]=useState("");
  const [showDD,setShowDD]=useState(false);
  const [resolved,setResolved]=useState(null);
  const [routeId,setRouteId]=useState("");
  const [consignor,setConsignor]=useState("");
  const [consignee,setConsignee]=useState("");
  const [goods,setGoods]=useState("");
  const [weightKg,setWeightKg]=useState("");
  const [packages,setPackages]=useState("");
  const [declaredVal,setDeclaredVal]=useState("");
  const [invoiceNo,setInvoiceNo]=useState("");
  const [materialType,setMaterialType]=useState("");
  const [advAmt,setAdvAmt]=useState("");
  const [advMode,setAdvMode]=useState("");
  const [notes,setNotes]=useState("");

  const allNums = Object.keys(VEHICLE_MAP);
  const suggestions = vehInput.length>=2 ? allNums.filter(n=>n.toLowerCase().includes(vehInput.toLowerCase())).slice(0,5) : [];

  const resolveVeh = (num) => {
    const key = Object.keys(VEHICLE_MAP).find(k=>k.replace(/\s/g,"")===num.replace(/\s/g,"").toUpperCase());
    setVehInput(num); setShowDD(false);
    if(key){
      const m=VEHICLE_MAP[key]; setResolved(m);
      if(!routeId){ setRouteId(m.route.id); setConsignor(m.route.defaultConsignor); setConsignee(m.route.defaultConsignee); }
    } else { setResolved(null); }
  };

  const handleRouteChange = (id) => {
    setRouteId(id);
    const r = ROUTES.find(x=>x.id===id);
    if(r){ setConsignor(r.defaultConsignor); setConsignee(r.defaultConsignee); }
  };

  const route = ROUTES.find(r=>r.id===routeId);
  const canSave = lrNum && routeId;
  const showEway = Number(declaredVal)>50000;

  const doSave = (startTrip) => {
    if(!canSave) return;
    const r = route;
    const freight = r.rateType==="Flat" ? r.rate : r.rate*r.distKm;
    const adv = (advAmt && resolved) ? [{id:`adv${Date.now()}`,type:"Driver",amount:Number(advAmt),mode:advMode,date:today(),note:"Dispatch advance"}] : [];
    onSave({
      id:uid(), lr:lrNum, lrDate, routeId:r.id,
      status: startTrip ? "In Transit" : "Consignment",
      client:r.client, origin:r.origin, destination:r.destination, team:r.team,
      vehicle:resolved?vehInput:null, driver:resolved?.driver||null, vtype:resolved?.type||null,
      consignor, consignee, goods, weightKg:Number(weightKg)||0, packages:Number(packages)||0,
      declaredValue:Number(declaredVal)||0,
      freight, hire:null, freightTerms:r.freightTerms,
      jobEntry:null, advances:adv, expenses:[], pod:null, tripSheet:null,
      deliveryDate:null, invoiceAmt:null, paymentDate:null, paymentRef:null, delayed:false,
    });
  };

  return (
    <div>
      {/* Sticky action bar at top */}
      <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="🚛 Start Trip" onClick={()=>doSave(false)} disabled={!canSave} color="#7C3AED" small/>
          {resolved && <Btn label="✓ Start & Dispatch" onClick={()=>doSave(true)} disabled={!canSave} color="#059669" small/>}
          <Btn label="Cancel" onClick={onClose} secondary small/>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:canSave?(resolved?"#059669":"#7C3AED"):"#94A3B8"}}>
          {!canSave?"Fill LR & Route":"Ready"}
        </div>
      </div>

      {/* Section 1: LR + Vehicle */}
      <Section icon="📄" title="LR / Waybill & Vehicle" borderColor="#BAE6FD" bg="#F0F9FF">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div><Lbl t="LR / Waybill / Bilty No." required/><Field value={lrNum} onChange={setLrNum} placeholder="As printed on consignment note"/></div>
          <div><Lbl t="LR Date"/><Field type="date" value={lrDate} onChange={setLrDate}/></div>
        </div>
        <div style={{position:"relative"}}>
          <Lbl t="Vehicle Number"/>
          <div style={{display:"flex",gap:8}}>
            <input value={vehInput} onChange={e=>{setVehInput(e.target.value);setShowDD(true);if(!e.target.value)setResolved(null);}}
              onBlur={()=>setTimeout(()=>setShowDD(false),150)} placeholder="Type vehicle number..."
              style={{flex:1,border:`1.5px solid ${resolved?"#86EFAC":"#E2E8F0"}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:"#1E293B",background:resolved?"#F0FDF4":"#fff",outline:"none",fontFamily:"inherit"}}/>
            {vehInput && <button onClick={()=>resolveVeh(vehInput)} style={{background:"#1E3A5F",color:"#fff",border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Look up</button>}
          </div>
          {showDD&&suggestions.length>0&&(
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:10,zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,0.1)",overflow:"hidden",marginTop:4}}>
              {suggestions.map(num=>{const v=VEHICLE_MAP[num];return(
                <button key={num} onMouseDown={()=>resolveVeh(num)} style={{width:"100%",background:"none",border:"none",padding:"10px 14px",textAlign:"left",cursor:"pointer",borderBottom:"1px solid #F8FAFC",display:"flex",gap:10,alignItems:"center"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F0F7FF"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <span>🚛</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:"#1E293B"}}>{num}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{v.driver} · {v.type} · {v.route.origin}→{v.route.destination}</div>
                  </div>
                </button>);})}
            </div>
          )}
        </div>
        {resolved && (
          <div style={{background:"#D1FAE5",borderRadius:8,padding:"10px 12px",marginTop:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Driver",resolved.driver],["Vehicle Type",resolved.type]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:9,color:"#065F46",fontWeight:700,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:"#065F46"}}>{v}</div></div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Section 2: Route & Client */}
      <Section icon="🗺️" title="Route & Client" borderColor="#E2E8F0">
        <div style={{marginBottom:10}}>
          <Lbl t="Select Route" required/>
          <SearchDropdown value={routeId} onChange={handleRouteChange} placeholder="Search routes..."
            options={ROUTES.map(r=>({value:r.id, label:`${r.origin} → ${r.destination} — ${r.client}`, sub:`${r.distKm}km · ${r.rateType==="Flat"?`₹${r.rate.toLocaleString()}`:`₹${r.rate}/km`} · ${r.freightTerms}`}))}/>
        </div>
        {route && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
              {[["Client",route.client],["Origin → Destination",`${route.origin} → ${route.destination}`]].map(([l,v])=>(
                <div key={l} style={{background:"#F0F9FF",borderRadius:7,padding:"7px 10px",border:"1px solid #E0F2FE"}}>
                  <div style={{fontSize:9,color:"#0369A1",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#1E293B"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["Distance",`${route.distKm} km · ${route.transitDays} day${route.transitDays>1?"s":""}`],["Rate",`${route.rateType==="Flat"?`₹${route.rate.toLocaleString()}`:`₹${route.rate}/km`} · ${route.freightTerms}`]].map(([l,v])=>(
                <div key={l} style={{background:"#F8FAFC",borderRadius:7,padding:"6px 10px"}}>
                  <div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#1E293B"}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              <div><Lbl t="Trip Date"/><Field type="date" value={tripDate} onChange={setTripDate}/></div>
              <div><Lbl t="Team"/><Field value={route.team} disabled/></div>
            </div>
          </>
        )}
      </Section>

      {/* Section 3: Consignment Details */}
      <Section icon="📦" title="Consignment Details" borderColor="#E2E8F0">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><Lbl t="Consignor (Sender)"/><Field value={consignor} onChange={setConsignor} placeholder="Sender name / company"/></div>
          <div><Lbl t="Consignee (Receiver)"/><Field value={consignee} onChange={setConsignee} placeholder="Receiver name / company"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><Lbl t="Cargo Description"/><Field value={goods} onChange={setGoods} placeholder="e.g. FMCG Goods, Chemicals"/></div>
          <div><Lbl t="Material Type"/><Field value={materialType} onChange={setMaterialType} placeholder="e.g. Palletized, Loose, Liquid"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><Lbl t="Cargo Weight (kg)"/><Field type="number" value={weightKg} onChange={setWeightKg} placeholder="0"/></div>
          <div><Lbl t="Packages / Qty"/><Field type="number" value={packages} onChange={setPackages} placeholder="0"/></div>
          <div><Lbl t="Consignment Value (₹)"/><Field type="number" value={declaredVal} onChange={setDeclaredVal} placeholder="0"/></div>
          <div><Lbl t="Invoice No."/><Field value={invoiceNo} onChange={setInvoiceNo} placeholder="Consignor invoice number"/></div>
        </div>
        {showEway && (
          <div style={{background:"#F0FDF4",border:"1px solid #A7F3D0",borderRadius:8,padding:"8px 12px",marginTop:10,fontSize:12,color:"#065F46",display:"flex",alignItems:"center",gap:6}}>
            ✅ ₹{Number(declaredVal).toLocaleString()} exceeds ₹50,000 — E-Way Bill is mandatory. It will auto-generate on trip start.
          </div>
        )}
      </Section>

      {/* Section 4: Driver Advance */}
      {resolved && (
        <Section icon="💵" title="Driver Advance" borderColor="#C4B5FD" bg="#F5F3FF">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><Lbl t="Advance Amount (₹)"/><Field type="number" value={advAmt} onChange={setAdvAmt} placeholder="0"/></div>
            <div><Lbl t="Payment Mode"/>
              <SearchDropdown value={advMode} onChange={setAdvMode} placeholder="Select mode..." options={PAYMENT_MODES.map(m=>({value:m,label:m}))}/>
            </div>
          </div>
          {advAmt && <div style={{fontSize:11,color:"#7C3AED",marginTop:8}}>ℹ️ Advance will be deducted from final driver settlement. Remaining balance: ₹(calculated at trip completion).</div>}
        </Section>
      )}

      {/* Section 5: Notes */}
      <Section icon="📝" title="Notes" borderColor="#E2E8F0">
        <Field value={notes} onChange={setNotes} placeholder="Add any special instructions, loading details, permit info, etc."/>
      </Section>
    </div>
  );
}
// ─── RIGHT SLIDER ─────────────────────────────────────────────────────────────

function RightSlider({ open, config, trips, role, onClose, onUpdateTrip, onAddTrip }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [search, setSearch] = useState("");
  const [prevConfig, setPrevConfig] = useState(null);
  if (config !== prevConfig) { setPrevConfig(config); setSelectedTrip(null); setSearch(""); }

  const sliderTrips = useMemo(()=>{
    if (!config) return [];
    let list = config.filter ? trips.filter(config.filter) : trips;
    if (search) { const q=search.toLowerCase(); list=list.filter(t=>t.id.toLowerCase().includes(q)||t.lr.toLowerCase().includes(q)||t.client.toLowerCase().includes(q)||(t.vehicle||"").toLowerCase().includes(q)); }
    return list;
  }, [config, trips, search]);

  if (!open || !config) return null;

  const handleUpdate = (updates) => {
    onUpdateTrip(selectedTrip.id, updates);
    setSelectedTrip(t=>({...t,...updates}));
  };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.3)",zIndex:200}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:201,display:"flex",flexDirection:"column",boxShadow:"-6px 0 32px rgba(0,0,0,0.1)"}}>
        <div style={{background:"linear-gradient(135deg,#1A237E,#0F4C81)",padding:"18px 22px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{color:"rgba(255,255,255,.65)",fontSize:10,fontWeight:700,letterSpacing:1.5,marginBottom:3}}>{config.title?.toUpperCase()}</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:800}}>
                {selectedTrip ? `${selectedTrip.id} — ${selectedTrip.origin} → ${selectedTrip.destination}` : `${sliderTrips.length} trip${sliderTrips.length!==1?"s":""}${config.subtitle?` · ${config.subtitle}`:""}`}
              </div>
            </div>
            <button onClick={()=>{if(selectedTrip)setSelectedTrip(null);else onClose();}} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:8,width:32,height:32,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {selectedTrip?"←":"✕"}
            </button>
          </div>
        </div>

        {config.mode==="addTrip" && (
          <div style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>
            <AddTripForm onSave={(data)=>{onAddTrip(data);onClose();}} onClose={onClose}/>
          </div>
        )}

        {config.mode!=="addTrip" && (
          <>
            {!selectedTrip && (
              <>
                <div style={{padding:"12px 22px",borderBottom:"1px solid #F1F5F9",flexShrink:0}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Filter trips..."
                    style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"8px 12px",fontSize:13,color:"#1E293B",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"8px 22px"}}>
                  {sliderTrips.length===0 && (
                    <div style={{textAlign:"center",padding:"40px 20px",color:"#94A3B8"}}>
                      <div style={{fontSize:28,marginBottom:8}}>📭</div>
                      <div style={{fontSize:13,fontWeight:600}}>No trips found</div>
                    </div>
                  )}
                  {sliderTrips.map(t=>{
                    const totalAdv=t.advances.reduce((s,a)=>s+a.amount,0);
                    return (
                      <div key={t.id} onClick={()=>setSelectedTrip(t)}
                        style={{background:"#fff",border:"1.5px solid #F1F5F9",borderRadius:14,padding:"14px",marginBottom:10,cursor:"pointer",transition:"all .12s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="#F8FAFC";e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="#F1F5F9";e.currentTarget.style.boxShadow="none";}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                          <div>
                            <div style={{fontSize:11,color:"#94A3B8",fontFamily:"monospace",marginBottom:1}}>{t.id} · {t.lr}</div>
                            <div style={{fontSize:14,fontWeight:800,color:"#1E293B"}}>{t.origin} → {t.destination}</div>
                            <div style={{fontSize:12,color:"#64748B",marginTop:1}}>{t.client}</div>
                          </div>
                          <Badge status={t.status}/>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                          {t.vehicle ? <span style={{fontSize:11,background:"#F1F5F9",color:"#475569",padding:"2px 8px",borderRadius:6,fontFamily:"monospace"}}>{t.vehicle}</span>
                            : <span style={{fontSize:11,background:"#EDE9FE",color:"#5B21B6",padding:"2px 8px",borderRadius:6,fontWeight:700}}>No vehicle</span>}
                          {t.driver && <span style={{fontSize:11,background:"#F1F5F9",color:"#475569",padding:"2px 8px",borderRadius:6}}>👤 {t.driver}</span>}
                          {t.delayed&&<span style={{fontSize:11,background:"#FEE2E2",color:"#991B1B",padding:"2px 8px",borderRadius:6,fontWeight:700}}>🚨 Delayed</span>}
                          {t.pod && <span style={{fontSize:11,background:"#FEF3C7",color:"#92400E",padding:"2px 8px",borderRadius:6,fontWeight:700}}>📋 ePOD</span>}
                          {t.tripSheet && <span style={{fontSize:11,background:"#D1FAE5",color:"#065F46",padding:"2px 8px",borderRadius:6,fontWeight:700}}>🧾 Settled</span>}
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",gap:12,fontSize:11}}>
                            <span style={{color:"#64748B"}}>Freight: <strong style={{color:"#1E293B"}}>{money(t.freight)}</strong></span>
                            {totalAdv>0&&<span style={{color:"#64748B"}}>Adv: <strong style={{color:"#7C3AED"}}>{money(totalAdv)}</strong></span>}
                          </div>
                          <span style={{fontSize:11,color:"#94A3B8",fontWeight:700}}>Open →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {selectedTrip && (
              <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
                <TripDetail trip={selectedTrip} role={role} onUpdate={handleUpdate} onBack={()=>setSelectedTrip(null)}/>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [trips, setTrips] = useState(TRIPS_INIT);
  const [role, setRole]   = useState("ops");
  const [slider, setSlider] = useState({ open:false, config:null });

  const updateTrip = (id, updates) => setTrips(ts=>ts.map(t=>t.id===id?{...t,...updates}:t));
  const addTrip    = (trip)        => setTrips(ts=>[trip,...ts]);
  const openSlider = (config)      => setSlider({ open:true, config });
  const closeSlider = ()           => setSlider(s=>({...s,open:false}));

  const byStatus = (s) => trips.filter(t=>t.status===s);
  const delayed  = trips.filter(t=>t.delayed);

  // ─── OPS: Trip Movement ───
  const opsBoxes = [
    { key:"consignment",label:"Consignment", icon:"📝", count:byStatus("Consignment").length, color:"#7C3AED", light:"#F5F3FF", border:"#DDD6FE",
      filter:t=>t.status==="Consignment",title:"Consignment", subtitle:"Assign vehicle & dispatch" },
    { key:"intransit",  label:"In Transit",  icon:"🚛", count:byStatus("In Transit").length,  color:"#0EA5E9", light:"#F0F9FF", border:"#BAE6FD",
      filter:t=>t.status==="In Transit", title:"In Transit",  subtitle:"Mark delivered + ePOD" },
    { key:"delivered",  label:"Delivered",   icon:"✅", count:byStatus("Delivered").length,   color:"#10B981", light:"#F0FDF4", border:"#A7F3D0",
      filter:t=>t.status==="Delivered",  title:"Delivered",   subtitle:"Handed to Accounts" },
  ];
  const opsAlerts = [
    { key:"delayed", label:"Delayed Trips", icon:"🚨", count:delayed.length, color:"#DC2626", light:"#FEF2F2", border:"#FECACA",
      filter:t=>t.delayed, title:"Delayed Trips", subtitle:"Overdue — follow up" },
  ];

  // ─── ACCOUNTS ───
  const acctMovement = [
    { key:"consignment",label:"Consignment", icon:"📝", count:byStatus("Consignment").length, color:"#7C3AED", light:"#F5F3FF", border:"#DDD6FE",
      filter:t=>t.status==="Consignment",title:"Consignment", subtitle:"Awaiting dispatch" },
    { key:"intransit",  label:"In Transit",  icon:"🚛", count:byStatus("In Transit").length,  color:"#0EA5E9", light:"#F0F9FF", border:"#BAE6FD",
      filter:t=>t.status==="In Transit", title:"In Transit",  subtitle:"Add advances" },
    { key:"delivered",  label:"Delivered",   icon:"✅", count:byStatus("Delivered").length,   color:"#10B981", light:"#F0FDF4", border:"#A7F3D0",
      filter:t=>t.status==="Delivered",  title:"Delivered",   subtitle:"Create Trip Sheet" },
  ];
  // Bar 2: Bill & Collect
  const acctBill = [
    { key:"tripsheet", label:"Trip Sheet",    icon:"🧾", count:byStatus("Trip Sheet").length, color:"#D97706", light:"#FFFBEB", border:"#FCD34D",
      filter:t=>t.status==="Trip Sheet", title:"Trip Sheet",   subtitle:"Raise freight bill" },
    { key:"billed",    label:"Billed",        icon:"📄", count:byStatus("Billed").length,     color:"#6366F1", light:"#EEF2FF", border:"#A5B4FC",
      filter:t=>t.status==="Billed",     title:"Billed",       subtitle:"Collect payment" },
    { key:"paid",      label:"Paid & Closed", icon:"💰", count:byStatus("Paid").length,       color:"#16A34A", light:"#DCFCE7", border:"#86EFAC",
      filter:t=>t.status==="Paid",       title:"Paid & Closed",subtitle:"Fully settled" },
  ];

  const BoxRow = ({boxes, cols}) => (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:12,marginBottom:20}}>
      {boxes.map(b=>(
        <button key={b.key} onClick={()=>openSlider({mode:"list",title:b.title,subtitle:b.subtitle,filter:b.filter})}
          style={{background:b.light,border:`2px solid ${b.border}`,borderRadius:16,padding:"20px 16px",cursor:"pointer",textAlign:"left",transition:"all .15s",display:"block"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${b.color}25`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
          <div style={{fontSize:26,marginBottom:10}}>{b.icon}</div>
          <div style={{fontSize:28,fontWeight:800,color:b.color,lineHeight:1,marginBottom:4}}>{b.count}</div>
          <div style={{fontSize:13,fontWeight:700,color:"#1E293B"}}>{b.label}</div>
          <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{b.subtitle}</div>
          <div style={{marginTop:12,fontSize:11,fontWeight:700,color:b.color}}>View trips →</div>
        </button>
      ))}
    </div>
  );

  const AlertRow = ({boxes, cols}) => (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:12,marginBottom:20}}>
      {boxes.map(b=>(
        <button key={b.key} onClick={()=>b.count>0&&openSlider({mode:"list",title:b.title,subtitle:b.subtitle,filter:b.filter})}
          style={{background:b.count>0?b.light:"#F8FAFC",border:`2px solid ${b.count>0?b.border:"#E8EDF2"}`,borderRadius:16,padding:"18px 16px",cursor:b.count>0?"pointer":"default",textAlign:"left",transition:"all .15s",opacity:b.count===0?.5:1,display:"block"}}
          onMouseEnter={e=>{if(b.count>0){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${b.color}20`;}}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:22}}>{b.icon}</span>
            <span style={{fontSize:24,fontWeight:800,color:b.count>0?b.color:"#CBD5E1"}}>{b.count}</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:b.count>0?"#1E293B":"#94A3B8"}}>{b.label}</div>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{b.subtitle}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",background:"#F0F4F9",minHeight:"100vh",color:"#1E293B"}}>
      <div style={{background:"linear-gradient(135deg,#1A237E,#0F4C81)",padding:"15px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#90CAF9",fontSize:10,fontWeight:700,letterSpacing:3,marginBottom:2}}>TMS — OPERATOR DASHBOARD</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:800}}>Trip Control Centre</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{background:"rgba(255,255,255,.12)",borderRadius:10,padding:4,display:"flex",gap:2}}>
            {[["ops","Operations"],["accts","Accounts"]].map(([r,l])=>(
              <button key={r} onClick={()=>setRole(r)}
                style={{background:role===r?"#fff":"none",color:role===r?"#1E3A5F":"rgba(255,255,255,.7)",border:"none",borderRadius:8,padding:"7px 16px",fontSize:12,fontWeight:800,cursor:"pointer",transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>openSlider({mode:"addTrip",title:"New Trip"})}
            style={{background:"#22C55E",color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
            ➕ New Trip
          </button>
        </div>
      </div>

      <div style={{padding:"22px 28px",maxWidth:1300,margin:"0 auto"}}>
        <div style={{background:role==="ops"?"#E0F2FE":"#EDE9FE",border:`1px solid ${role==="ops"?"#BAE6FD":"#DDD6FE"}`,borderRadius:10,padding:"10px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>{role==="ops"?"🚛":"💼"}</span>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:role==="ops"?"#0369A1":"#5B21B6"}}>
              {role==="ops"?"Operations — Create Trip, Track & Deliver":"Accounts — Settle, Bill & Collect"}
            </div>
            <div style={{fontSize:11,color:role==="ops"?"#0284C7":"#6D28D9"}}>
              {role==="ops"
                ? "Create trip (LR + Vehicle) → Mark Delivered with ePOD"
                : "Add Advances → Trip Sheet (settle) → Freight Bill → Payment Receipt"}
            </div>
          </div>
        </div>

        {role==="ops" ? (
          <>
            <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Trip Movement</div>
            <BoxRow boxes={opsBoxes} cols={3}/>
            <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Ops Alerts</div>
            <AlertRow boxes={opsAlerts} cols={3}/>
          </>
        ) : (
          <>
            <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Trip Movement</div>
            <BoxRow boxes={acctMovement} cols={3}/>
            <div style={{fontSize:12,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:.8,marginBottom:12}}>Bill & Collect</div>
            <BoxRow boxes={acctBill} cols={3}/>
          </>
        )}
      </div>

      <RightSlider open={slider.open} config={slider.config} trips={trips} role={role} onClose={closeSlider} onUpdateTrip={updateTrip} onAddTrip={addTrip}/>
    </div>
  );
}
