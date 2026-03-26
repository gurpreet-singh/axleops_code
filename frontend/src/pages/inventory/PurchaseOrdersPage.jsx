import { useState, useEffect, useMemo } from 'react';
import { getPurchaseOrders } from '../../services/purchaseOrderService';
import useSliderStore from '../../stores/sliderStore';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const { openSlider } = useSliderStore();

  useEffect(() => { getPurchaseOrders().then(setOrders); }, []);

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(p => p.poNumber.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q));
  }, [orders, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary"><i className="fas fa-plus"></i> New PO</button>
        </div>
      </div>
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{color:'var(--text-muted)'}}></i>
            <input placeholder="Search POs..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="filter-btn">Status ▾</div>
          <div className="pagination-info">1-{filtered.length} of {orders.length}</div>
        </div>
        <table>
          <thead><tr><th>PO Number</th><th>Vendor</th><th>Date</th><th>Items</th><th style={{textAlign:'right'}}>Total Amount</th><th>Delivery Date</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(po=>(
              <tr key={po.id} style={{cursor:'pointer'}} onClick={()=>openSlider({title:`PO ${po.poNumber}`,content:<POD po={po}/>,width:'50vw'})}>
                <td style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'var(--primary)'}}>{po.poNumber}</td>
                <td style={{fontWeight:600}}>{po.vendor}</td>
                <td>{po.date}</td>
                <td>{po.items}</td>
                <td style={{textAlign:'right',fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{INR(po.totalAmount)}</td>
                <td>{po.deliveryDate||'—'}</td>
                <td><span className={`status-badge ${po.status==='Delivered'?'completed':po.status==='Approved'?'active':po.status==='Pending'?'pending':'info'}`}>{po.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function POD({po}){
  return(<div style={{padding:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    {[['PO Number',po.poNumber],['Vendor',po.vendor],['Date',po.date],['Items',po.items],['Total',`₹${po.totalAmount.toLocaleString()}`],['Delivery',po.deliveryDate||'TBD'],['Status',po.status]].map(([l,v])=>(
      <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',marginBottom:5}}>{l}</div>
      <div style={{border:'1.5px solid #F1F5F9',borderRadius:10,padding:'10px 12px',fontSize:13,background:'#F8FAFC',fontWeight:600}}>{v}</div></div>
    ))}
  </div></div>);
}
