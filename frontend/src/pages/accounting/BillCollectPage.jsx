import { useState, useEffect, useMemo } from 'react';
import { getInvoices } from '../../services/invoiceService';
import useSliderStore from '../../stores/sliderStore';

const INR = n => '₹' + Number(n).toLocaleString('en-IN');

export default function BillCollectPage() {
  const [invoices, setInvoices] = useState([]);
  const { openSlider } = useSliderStore();

  useEffect(() => { getInvoices().then(setInvoices); }, []);

  const openDetail = (inv) => openSlider({ title: `Bill ${inv.id}`, content: <BillDetail inv={inv} />, width: '50vw' });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 11, color: '#98a2b3', marginBottom: 2 }}>Accounts › Bill & Collect</div>
          <h1>Bill & Collect</h1>
        </div>
        <div className="page-header-actions">
          <div className="filter-btn"><i className="fas fa-calendar-alt" style={{ marginRight: 6 }}></i>Mar 2026 ▾</div>
          <button className="btn btn-primary"><i className="fas fa-plus"></i> Create Bill</button>
        </div>
      </div>

      <div className="widget" style={{ marginBottom: 20 }}>
        <div className="widget-header">
          <h3><i className="fas fa-file-invoice" style={{ color: '#2563eb', marginRight: 6 }}></i>Recent Client Bills</h3>
        </div>
        <div className="widget-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Bill No</th><th>Client Name</th><th>Bill Date</th>
                <th style={{ textAlign: 'right' }}>Total Taxable</th>
                <th style={{ textAlign: 'right' }}>Total GST</th>
                <th style={{ textAlign: 'right' }}>Grand Total</th>
                <th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(inv)}>
                  <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: '#1570ef' }}>{inv.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{inv.client}</td>
                  <td>{inv.billDate}</td>
                  <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>{INR(inv.totalTaxable)}</td>
                  <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace" }}>{INR(inv.totalGst)}</td>
                  <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>{INR(inv.grandTotal)}</td>
                  <td><span className={`status-badge ${inv.status === 'Paid' ? 'completed' : inv.status === 'Invoiced' ? 'info' : inv.status === 'Overdue' ? 'critical' : 'pending'}`}>{inv.status}</span></td>
                  <td><button className="btn btn-link" style={{ fontSize: 11 }}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillDetail({ inv }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[['Bill No', inv.id], ['Client', inv.client], ['Bill Date', inv.billDate], ['Due Date', inv.dueDate], ['Total Taxable', `₹${inv.totalTaxable.toLocaleString()}`], ['GST', `₹${inv.totalGst.toLocaleString()}`], ['Grand Total', `₹${inv.grandTotal.toLocaleString()}`], ['Status', inv.status], ['Trips', inv.trips]].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>{l}</div>
            <div style={{ border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
