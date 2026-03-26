import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkOrders } from '../../services/workOrderService';
import useSliderStore from '../../stores/sliderStore';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { openSlider } = useSliderStore();

  useEffect(() => { getWorkOrders().then(setOrders); }, []);

  const filtered = useMemo(() => {
    let o = orders;
    if (tab !== 'all') o = o.filter(x => x.status.toLowerCase().replace(/ /g, '-') === tab);
    if (search) { const q = search.toLowerCase(); o = o.filter(x => x.vehicle.toLowerCase().includes(q) || x.number.includes(q)); }
    return o;
  }, [orders, tab, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Work Orders</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/mro/create')}><i className="fas fa-plus"></i> Add Work Order</button>
        </div>
      </div>
      <div className="wo-status-tabs">
        {['all','open','pending','completed','pending---warranty'].map(t => (
          <button key={t} className={`wo-status-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t==='all'?'All':t.replace(/-/g,' ')}</button>
        ))}
      </div>
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{color:'var(--text-muted)'}}></i>
            <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="pagination-info">1-{filtered.length} of {orders.length}</div>
        </div>
        <div style={{padding:'0 16px'}}>
          <div className="wo-list-header"><span></span><span>Vehicle</span><span>Number</span><span>Status</span><span>Priority</span><span>Service Tasks</span><span>Issue Date</span><span>Assigned To</span><span>Total Cost</span><span>Labels</span></div>
          {filtered.map(wo=>(
            <div key={wo.id} className="wo-list-row" onClick={()=>openSlider({title:`WO ${wo.number}`,content:<WOD wo={wo}/>,width:'50vw'})}>
              <span style={{fontSize:16}}>{wo.emoji}</span>
              <span style={{fontWeight:600}}>{wo.vehicle}</span>
              <span style={{color:'var(--primary)',fontWeight:500}}>{wo.number}</span>
              <span><span className={`status-badge ${wo.status==='Open'?'open':wo.status==='Completed'?'completed':'pending'}`}>{wo.status}</span></span>
              <span><span className="status-badge" style={{background:wo.priorityBg,color:wo.priorityColor}}>{wo.priority}</span></span>
              <span style={{fontSize:12,color:'var(--text-secondary)'}}>{wo.serviceTasks}</span>
              <span style={{fontSize:12}}>{wo.issueDate}</span>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span className="wo-avatar" style={{background:wo.assignedColor,width:20,height:20,fontSize:9}}>{wo.assignedInitials}</span><span style={{fontSize:11}}>{wo.assignedTo}</span></span>
              <span style={{fontWeight:600}}>{wo.totalCost?INR(wo.totalCost):'₹0'}</span>
              <span>{wo.label&&<span className={`wo-label-chip ${wo.labelClass}`}>{wo.label}</span>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WOD({wo}){
  return(<div style={{padding:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    {[['WO#',wo.number],['Vehicle',wo.vehicle],['Status',wo.status],['Priority',wo.priority],['Date',wo.issueDate],['Assigned',wo.assignedTo],['Tasks',wo.serviceTasks],['Cost',wo.totalCost?`₹${wo.totalCost.toLocaleString()}`:'₹0']].map(([l,v])=>(
      <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',marginBottom:5}}>{l}</div>
      <div style={{border:'1.5px solid #F1F5F9',borderRadius:10,padding:'10px 12px',fontSize:13,background:'#F8FAFC',fontWeight:600}}>{v}</div></div>
    ))}
  </div></div>);
}
