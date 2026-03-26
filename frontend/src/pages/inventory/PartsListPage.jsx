import { useState, useEffect, useMemo } from 'react';
import { getParts } from '../../services/partsService';
import useSliderStore from '../../stores/sliderStore';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function PartsListPage() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const { openSlider } = useSliderStore();

  useEffect(() => { getParts().then(setParts); }, []);

  const filtered = useMemo(() => {
    if (!search) return parts;
    const q = search.toLowerCase();
    return parts.filter(p => p.name.toLowerCase().includes(q) || p.partNumber.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [parts, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Parts & Inventory</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary"><i className="fas fa-upload"></i> Bulk Manage</button>
          <button className="btn btn-primary"><i className="fas fa-plus"></i> Add Part</button>
        </div>
      </div>
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{color:'var(--text-muted)'}}></i>
            <input placeholder="Search parts..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="filter-btn">Category ▾</div>
          <div className="filter-btn">Location ▾</div>
          <div className="pagination-info">1-{filtered.length} of {parts.length}</div>
        </div>
        <table>
          <thead><tr><th>Part Name</th><th>Part Number</th><th>Category</th><th>Location</th><th>In Stock</th><th>Min Qty</th><th>Unit Cost</th></tr></thead>
          <tbody>
            {filtered.map(p=>(
              <tr key={p.id} style={{cursor:'pointer'}} onClick={()=>openSlider({title:p.name,content:<PD p={p}/>,width:'50vw'})}>
                <td><a href="#" onClick={e=>e.preventDefault()} style={{color:'var(--primary)',fontWeight:600}}>{p.name}</a></td>
                <td>{p.partNumber}</td>
                <td>{p.category}</td>
                <td>{p.location}</td>
                <td><span style={{color:p.inStock<p.minQty?'var(--status-overdue)':'inherit',fontWeight:p.inStock<p.minQty?600:'inherit'}}>{p.inStock}</span></td>
                <td>{p.minQty}</td>
                <td>{INR(p.unitCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PD({p}){
  return(<div style={{padding:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    {[['Part Name',p.name],['Part Number',p.partNumber],['Category',p.category],['Location',p.location],['In Stock',p.inStock],['Min Qty',p.minQty],['Unit Cost',`₹${p.unitCost.toLocaleString()}`],['Total Value',`₹${(p.inStock*p.unitCost).toLocaleString()}`]].map(([l,v])=>(
      <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',marginBottom:5}}>{l}</div>
      <div style={{border:'1.5px solid #F1F5F9',borderRadius:10,padding:'10px 12px',fontSize:13,background:'#F8FAFC',fontWeight:600}}>{v}</div></div>
    ))}
  </div></div>);
}
