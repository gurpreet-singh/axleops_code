import { useState, useEffect, useMemo } from 'react';
import { getContacts } from '../../services/contactService';
import useSliderStore from '../../stores/sliderStore';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const { openSlider } = useSliderStore();

  useEffect(() => { getContacts().then(setContacts); }, []);

  const types = useMemo(() => [...new Set(contacts.map(c=>c.type))].sort(), [contacts]);

  const filtered = useMemo(() => {
    let c = contacts;
    if (typeFilter !== 'all') c = c.filter(x => x.type === typeFilter);
    if (search) { const q = search.toLowerCase(); c = c.filter(x => x.name.toLowerCase().includes(q) || x.phone.includes(q)); }
    return c;
  }, [contacts, typeFilter, search]);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Contacts & Drivers</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary"><i className="fas fa-plus"></i> Add Contact</button>
        </div>
      </div>
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{color:'var(--text-muted)'}}></i>
            <input placeholder="Search contacts..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="filter-btn">
            <select style={{border:'none',background:'transparent',fontSize:12,fontWeight:600,cursor:'pointer',outline:'none'}} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
              <option value="all">Type ▾</option>
              {types.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="pagination-info">1-{filtered.length} of {contacts.length}</div>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Phone</th><th>Email</th><th>Branch</th><th>Vehicle</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{cursor:'pointer'}} onClick={()=>openSlider({title:c.name,content:<CD c={c}/>,width:'50vw'})}>
                <td style={{fontWeight:600,color:'var(--primary)'}}>{c.name}</td>
                <td><span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:12,background:c.type==='Driver'?'#dcfce7':'#f0f9ff',color:c.type==='Driver'?'#166534':'#1e40af'}}>{c.type}</span></td>
                <td style={{fontSize:12}}>{c.phone}</td>
                <td style={{fontSize:12,color:'var(--text-secondary)'}}>{c.email}</td>
                <td>{c.branch}</td>
                <td>{c.vehicleAssigned||'—'}</td>
                <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CD({c}){
  return(<div style={{padding:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    {[['Name',c.name],['Type',c.type],['Phone',c.phone],['Email',c.email],['Branch',c.branch],['Status',c.status],['License No',c.licenseNo||'N/A'],['License Expiry',c.licenseExpiry||'N/A'],['Vehicle Assigned',c.vehicleAssigned||'None']].map(([l,v])=>(
      <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',marginBottom:5}}>{l}</div>
      <div style={{border:'1.5px solid #F1F5F9',borderRadius:10,padding:'10px 12px',fontSize:13,background:'#F8FAFC',fontWeight:600}}>{v}</div></div>
    ))}
  </div></div>);
}
