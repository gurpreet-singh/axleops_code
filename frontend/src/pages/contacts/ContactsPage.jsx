import { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../../services/userService';
import useSliderStore from '../../stores/sliderStore';

export default function ContactsPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { openSlider } = useSliderStore();

  useEffect(() => { getUsers().then(setUsers); }, []);

  const roleList = useMemo(() => {
    const roles = new Set();
    users.forEach(u => (u.roles || []).forEach(r => roles.add(r)));
    return [...roles].sort();
  }, [users]);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') list = list.filter(u => (u.roles || []).includes(roleFilter));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (`${u.firstName} ${u.lastName || ''}`).toLowerCase().includes(q)
        || (u.phone || '').includes(q)
        || (u.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const roleBadgeColor = (role) => {
    const map = {
      DRIVER: { bg: '#dcfce7', color: '#166534' },
      MECHANIC: { bg: '#fef3c7', color: '#92400e' },
      FOREMAN: { bg: '#e0e7ff', color: '#3730a3' },
      HELPER: { bg: '#f3e8ff', color: '#6b21a8' },
    };
    return map[role] || { bg: '#f0f9ff', color: '#1e40af' };
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Drivers & Staff</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary"><i className="fas fa-plus"></i> Add User</button>
        </div>
      </div>
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input"><i className="fas fa-search" style={{color:'var(--text-muted)'}}></i>
            <input placeholder="Search by name, phone, or email..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="filter-btn">
            <select style={{border:'none',background:'transparent',fontSize:12,fontWeight:600,cursor:'pointer',outline:'none'}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
              <option value="all">Role ▾</option>
              {roleList.map(r=><option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="pagination-info">1-{filtered.length} of {users.length}</div>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Branch</th><th>Login</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(u=>{
              const name = `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}`;
              const primaryRole = (u.roles || [])[0] || '—';
              const badge = roleBadgeColor(primaryRole);
              return (
                <tr key={u.id} style={{cursor:'pointer'}} onClick={()=>openSlider({title:name,content:<UserDetail u={u}/>,width:'50vw'})}>
                  <td style={{fontWeight:600,color:'var(--primary)'}}>{name}</td>
                  <td><span style={{fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:12,background:badge.bg,color:badge.color}}>{primaryRole.replace(/_/g, ' ')}</span></td>
                  <td style={{fontSize:12}}>{u.phone || '—'}</td>
                  <td style={{fontSize:12,color:'var(--text-secondary)'}}>{u.email}</td>
                  <td>{u.branchName || '—'}</td>
                  <td>{u.loginEnabled ? <span style={{color:'#16a34a',fontSize:11,fontWeight:600}}>✓ Yes</span> : <span style={{color:'#94a3b8',fontSize:11}}>No</span>}</td>
                  <td><span className={`status-badge ${(u.status||'active').toLowerCase()}`}>{u.status || 'ACTIVE'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserDetail({u}){
  const name = `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}`;
  return(<div style={{padding:20}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    {[['Name', name],['Roles', (u.roles||[]).map(r=>r.replace(/_/g,' ')).join(', ')],['Phone',u.phone||'—'],['Email',u.email],['Branch',u.branchName||'—'],['Status',u.status||'ACTIVE'],['Login Enabled',u.loginEnabled?'Yes':'No']].map(([l,v])=>(
      <div key={l}><div style={{fontSize:11,fontWeight:700,color:'#64748B',textTransform:'uppercase',marginBottom:5}}>{l}</div>
      <div style={{border:'1.5px solid #F1F5F9',borderRadius:10,padding:'10px 12px',fontSize:13,background:'#F8FAFC',fontWeight:600}}>{v}</div></div>
    ))}
  </div></div>);
}
