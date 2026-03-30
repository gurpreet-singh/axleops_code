import { useState, useEffect } from 'react';
import { TRIP_STATE_COLORS, getTripById, deleteTrip, startTrip, deliverTrip, markReached, settleTrip, cancelTrip, getTripExpenses, addTripExpense, deleteTripExpense, getTripAdvances, addTripAdvance, getSettlementSummary } from '../../services/tripService';
import useSliderStore from '../../stores/sliderStore';
import useToastStore from '../../stores/toastStore';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { FormField } from '../../components/common/FormField';

// Re-export TripCreateContent
export { default as TripCreateContent } from './TripCreateContent';

// ═══════════════════════════════════════════════════════════
// Field helper
// ═══════════════════════════════════════════════════════════
function Field({ label, value, mono, icon, full }) {
  return (
    <div style={full ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
        {icon && <i className={icon} style={{ marginRight: 4, fontSize: 10 }}></i>}
        {label}
      </div>
      <div style={{ width: '100%', border: '1.5px solid #F1F5F9', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1E293B', background: '#F8FAFC', fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', fontWeight: 600, minHeight: 42, display: 'flex', alignItems: 'center' }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
      </div>
    </div>
  );
}

function Section({ title, icon, iconColor, borderColor, headerBg, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '10px 14px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <i className={icon} style={{ fontSize: 13, color: iconColor || '#1A73E8' }}></i>}
        <span style={{ fontSize: 12, fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRIP DETAIL CONTENT (loads trip by ID)
// ═══════════════════════════════════════════════════════════
export function TripDetailContent({ tripId, onRefresh }) {
  const { closeSlider } = useSliderStore();
  const { addToast } = useToastStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadTrip = async () => {
    try {
      const data = await getTripById(tripId);
      setTrip(data);
    } catch (e) { /* handled by empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTrip(); }, [tripId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading...</div>;
  if (!trip) return <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Trip not found</div>;

  const sc = TRIP_STATE_COLORS[trip.status] || {};

  const handleAction = async (action, payload) => {
    setActionLoading(action);
    try {
      if (action === 'start') await startTrip(tripId);
      else if (action === 'deliver') await deliverTrip(tripId);
      else if (action === 'markReached') await markReached(tripId);
      else if (action === 'settle') await settleTrip(tripId);
      else if (action === 'cancel') await cancelTrip(tripId, { reason: cancelReason });
      await loadTrip();
      onRefresh?.();
      setShowCancelDialog(false);
    } catch(e) {
      const msg = e.response?.data?.message || `Failed to ${action}`;
      addToast({ type: 'error', title: 'Action Failed', message: msg });
    } finally { setActionLoading(null); }
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
    { key: 'expenses', label: 'Expenses', icon: 'fas fa-receipt' },
    { key: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
    { key: 'financials', label: 'Financials', icon: 'fas fa-chart-pie' },
  ];

  return (
    <div>
      {/* Action Bar */}
      <div className="sl-action-bar" style={{ padding: '8px 20px', gap: 6, flexWrap: 'wrap' }}>
        <button className="sl-action-btn"><i className="fas fa-print"></i> Print</button>
        <div style={{ flex: 1 }}></div>
        {/* Status-specific actions */}
        {trip.status === 'CREATED' && (
          <>
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
              onClick={() => handleAction('start')} disabled={actionLoading}>
              <i className={`fas fa-${actionLoading === 'start' ? 'spinner fa-spin' : 'play'}`}></i> Start Trip
            </button>
            <button className="sl-action-btn" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}
              onClick={() => setShowCancelDialog(true)}>
              <i className="fas fa-ban"></i> Cancel
            </button>
          </>
        )}
        {trip.status === 'IN_TRANSIT' && (
          <>
            {!trip.reachedDestination && (
              <button className="sl-action-btn" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}
                onClick={() => handleAction('markReached')} disabled={actionLoading}>
                <i className={`fas fa-${actionLoading === 'markReached' ? 'spinner fa-spin' : 'map-marker-alt'}`}></i> Mark Reached
              </button>
            )}
            <button className="sl-action-btn" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}
              onClick={() => handleAction('deliver')} disabled={actionLoading}>
              <i className={`fas fa-${actionLoading === 'deliver' ? 'spinner fa-spin' : 'check'}`}></i> Mark Delivered
            </button>
            <button className="sl-action-btn" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FECACA' }}
              onClick={() => setShowCancelDialog(true)}>
              <i className="fas fa-ban"></i> Cancel
            </button>
          </>
        )}
        {trip.status === 'DELIVERED' && (
          <button className="sl-action-btn" style={{ background: '#E0E7FF', color: '#3730A3', borderColor: '#A5B4FC' }}
            onClick={() => handleAction('settle')} disabled={actionLoading}>
            <i className={`fas fa-${actionLoading === 'settle' ? 'spinner fa-spin' : 'lock'}`}></i> Settle Trip
          </button>
        )}
        {(trip.status === 'CREATED') && (
          <button className="sl-delete-btn" onClick={() => setShowDeleteModal(true)}>
            <i className="fas fa-recycle"></i> Delete
          </button>
        )}
      </div>

      {/* Status Badge Row */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: sc.mid, color: sc.text, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }}></span>
          {sc.label || trip.status}
        </span>
        {trip.reachedDestination && <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>📍 Reached</span>}
        {trip.podStatus && trip.podStatus !== 'PENDING' && <span style={{ background: '#DBEAFE', color: '#2563EB', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12 }}>POD: {trip.podStatus}</span>}
        <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{trip.tripNumber}</span>
      </div>

      {/* Tabs */}
      <div className="slider-tabs" style={{ marginTop: 8 }}>
        {TABS.map(t => (
          <div key={t.key} className={`slider-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            <i className={t.icon} style={{ marginRight: 4, fontSize: 11 }}></i>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 20 }}>
        {activeTab === 'overview' && <OverviewTab trip={trip} />}
        {activeTab === 'expenses' && <ExpensesTab trip={trip} onRefresh={loadTrip} />}
        {activeTab === 'timeline' && <TimelineTab trip={trip} />}
        {activeTab === 'financials' && <FinancialsTab trip={trip} />}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#DC2626' }}>Cancel Trip</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '10px 0' }}>Please provide a reason for cancellation:</p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3} placeholder="Reason..."
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: 10, fontSize: 13, resize: 'none' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelDialog(false)} style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Back</button>
              <button onClick={() => handleAction('cancel')} disabled={!cancelReason.trim() || actionLoading}
                style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => { await deleteTrip(trip.id); closeSlider(); onRefresh?.(); }}
        entityName={trip.tripNumber} entityType="Trip" />
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────
// Mirrors the exact same section structure as TripCreateContent
function OverviewTab({ trip }) {
  const INR = v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : null;

  return (
    <>
      {/* 1. CORE SELECTION — same as TripCreateContent */}
      <SectionCard title="Core Selection" emoji="🖥️" borderColor="#BAE6FD" headerBg="linear-gradient(135deg, #F0F9FF, #E0F2FE)" accentColor="#0369A1">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Route" value={trip.routeName} />
          <Field label="Trip Type" value={trip.tripType} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <Field label="Vehicle" value={trip.vehicleRegistration || 'Unassigned'} mono />
          <Field label="Driver" value={trip.driverName || 'Unassigned'} />
        </div>
        {(!trip.vehicleRegistration || !trip.lrNumber) && trip.status === 'CREATED' && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 6, fontSize: 11, color: '#92400E' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }}></i>
            {!trip.vehicleRegistration && !trip.lrNumber
              ? 'Vehicle and LR number are required before starting this trip.'
              : !trip.vehicleRegistration
                ? 'Vehicle must be assigned before starting this trip.'
                : 'LR number is required before starting this trip.'}
          </div>
        )}
      </SectionCard>

      {/* 2. LR / CONSIGNMENT NOTE */}
      <SectionCard title="LR / Consignment Note" emoji="📄" borderColor="#C4B5FD" headerBg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" accentColor="#6D28D9">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="LR / GCN No." value={trip.lrNumber} mono />
          <Field label="LR Date" value={trip.lrDate} />
          <Field label="No. of Packages" value={trip.packagesCount} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Invoice Numbers" value={trip.clientInvoiceNumbers} />
          <Field label="Dispatch Date" value={trip.dispatchDate} />
          <Field label="Dispatch Time" value={trip.dispatchTime} />
        </div>
      </SectionCard>

      {/* 3. PARTIES */}
      <SectionCard title="Parties" emoji="🤝" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FFFBEB, #FEF3C7)" accentColor="#92400E">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Consignor (Pickup)" value={trip.consignorName} />
          <Field label="Consignee (Delivery)" value={trip.consigneeName} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Billing Party" value={trip.billingPartyName} />
          <Field label="Transporter" value={trip.transporterName} />
        </div>
      </SectionCard>

      {/* 4. CARGO DETAILS */}
      <SectionCard title="Cargo Details" emoji="📦" borderColor="#FDBA74" headerBg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" accentColor="#9A3412">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <Field label="Cargo Description" value={trip.cargoDescription} />
          <Field label="Material Type" value={trip.materialType} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Weight (KG)" value={trip.weightKg ? trip.weightKg.toLocaleString() : null} />
          <Field label="E-Way Bill No." value={trip.ewayBillNumber} mono />
        </div>
      </SectionCard>

      {/* 5. FINANCIAL */}
      <SectionCard title="Financial" emoji="💰" borderColor="#FDE68A" headerBg="linear-gradient(135deg, #FEFCE8, #FEF9C3)" accentColor="#854D0E">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <Field label="Freight Amount (₹)" value={INR(trip.freightAmount)} mono />
          <Field label="Payment Terms" value={trip.paymentTerms} />
          <Field label="Loading Note" value={trip.loadingNote} />
        </div>
      </SectionCard>

      {/* 6. ADDITIONAL */}
      {(trip.consignmentValue || trip.permitNumber || trip.riskType || trip.remarks || trip.documentNumber || trip.consignorAddress || trip.consigneeAddress) && (
        <SectionCard title="Additional Fields" emoji="⚙️" borderColor="#D1D5DB" headerBg="linear-gradient(135deg, #F9FAFB, #F3F4F6)" accentColor="#4B5563">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Consignment Value (₹)" value={INR(trip.consignmentValue)} mono />
            <Field label="Permit Number" value={trip.permitNumber} />
            <Field label="Risk Type" value={trip.riskType} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Consignor Address" value={trip.consignorAddress} />
            <Field label="Consignee Address" value={trip.consigneeAddress} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Remarks" value={trip.remarks} />
            <Field label="Document No." value={trip.documentNumber} />
          </div>
        </SectionCard>
      )}
    </>
  );
}

/** Section card matching the TripCreateContent's Section style (emoji + gradient header) */
function SectionCard({ title, emoji, borderColor, headerBg, accentColor, children }) {
  return (
    <div style={{ border: `1.5px solid ${borderColor || '#E2E8F0'}`, borderRadius: 14, marginBottom: 16, overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: headerBg || '#F8FAFC', padding: '12px 16px', borderBottom: `1px solid ${borderColor || '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {emoji && <span style={{ fontSize: 14 }}>{emoji}</span>}
        <span style={{ fontSize: 12, fontWeight: 800, color: accentColor || '#1E293B', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</span>
      </div>
      <div style={{ padding: '16px 16px 18px' }}>{children}</div>
    </div>
  );
}

// ─── EXPENSES TAB ─────────────────────────────────────────
function ExpensesTab({ trip, onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [expForm, setExpForm] = useState({ expenseCategoryName: '', amount: '', description: '', paymentMode: 'CASH' });
  const [advForm, setAdvForm] = useState({ amount: '', paymentMode: 'CASH', notes: '' });

  useEffect(() => {
    getTripExpenses(trip.id).then(setExpenses).catch(() => []);
    getTripAdvances(trip.id).then(setAdvances).catch(() => []);
  }, [trip.id]);

  const canEdit = trip.status !== 'SETTLED' && trip.status !== 'CANCELLED';

  const handleAddExpense = async () => {
    if (!expForm.amount || !expForm.expenseCategoryName) return;
    await addTripExpense(trip.id, { ...expForm, amount: parseFloat(expForm.amount) });
    setShowAddExpense(false);
    setExpForm({ expenseCategoryName: '', amount: '', description: '', paymentMode: 'CASH' });
    getTripExpenses(trip.id).then(setExpenses);
    onRefresh?.();
  };

  const handleAddAdvance = async () => {
    if (!advForm.amount) return;
    await addTripAdvance(trip.id, { ...advForm, amount: parseFloat(advForm.amount) });
    setShowAddAdvance(false);
    setAdvForm({ amount: '', paymentMode: 'CASH', notes: '' });
    getTripAdvances(trip.id).then(setAdvances);
    onRefresh?.();
  };

  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalAdv = advances.reduce((s, a) => s + (a.amount || 0), 0);

  return (
    <>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>EXPENSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#991B1B' }}>₹{totalExp.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>ADVANCES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>₹{totalAdv.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: totalAdv >= totalExp ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${totalAdv >= totalExp ? '#BBF7D0' : '#FECACA'}` }}>
          <div style={{ fontSize: 10, color: totalAdv >= totalExp ? '#16A34A' : '#DC2626', fontWeight: 700 }}>BALANCE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: totalAdv >= totalExp ? '#166534' : '#991B1B' }}>₹{(totalAdv - totalExp).toLocaleString()}</div>
        </div>
      </div>

      {/* Expenses List */}
      <Section title="Expenses" icon="fas fa-receipt" iconColor="#DC2626" borderColor="#FECACA" headerBg="#FEF2F2">
        {canEdit && (
          <button onClick={() => setShowAddExpense(!showAddExpense)} style={{ marginBottom: 10, padding: '6px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#fff', color: '#1E293B' }}>
            <i className="fas fa-plus" style={{ marginRight: 4 }}></i> Add Expense
          </button>
        )}
        {showAddExpense && (
          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <FormField label="Category" value={expForm.expenseCategoryName} onChange={v => setExpForm(f => ({ ...f, expenseCategoryName: v }))} placeholder="e.g. Diesel, Toll" />
              <FormField label="Amount (₹)" value={expForm.amount} onChange={v => setExpForm(f => ({ ...f, amount: v }))} type="number" placeholder="0" />
            </div>
            <FormField label="Description" value={expForm.description} onChange={v => setExpForm(f => ({ ...f, description: v }))} placeholder="Optional note" />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddExpense(false)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddExpense} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#059669', color: '#fff' }}>Save</button>
            </div>
          </div>
        )}
        {expenses.length === 0 ? <div style={{ fontSize: 12, color: '#94A3B8', padding: 10 }}>No expenses recorded yet</div> :
          expenses.map(exp => (
            <div key={exp.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC', gap: 10 }}>
              <i className="fas fa-receipt" style={{ color: '#DC2626', fontSize: 12, width: 16 }}></i>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', flex: 1 }}>{exp.expenseCategoryName || 'Expense'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', minWidth: 70, textAlign: 'right' }}>₹{(exp.amount || 0).toLocaleString()}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: '#DCFCE7', color: '#16A34A' }}>{exp.paymentMode || 'CASH'}</span>
              {canEdit && <button onClick={async () => { await deleteTripExpense(trip.id, exp.id); getTripExpenses(trip.id).then(setExpenses); onRefresh?.(); }} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 10 }}><i className="fas fa-trash"></i></button>}
            </div>
          ))
        }
      </Section>

      {/* Advances List */}
      <Section title="Advances" icon="fas fa-hand-holding-usd" iconColor="#2563EB" borderColor="#BFDBFE" headerBg="#EFF6FF">
        {canEdit && trip.driverName && (
          <button onClick={() => setShowAddAdvance(!showAddAdvance)} style={{ marginBottom: 10, padding: '6px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#fff', color: '#1E293B' }}>
            <i className="fas fa-plus" style={{ marginRight: 4 }}></i> Add Advance
          </button>
        )}
        {showAddAdvance && (
          <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <FormField label="Amount (₹)" value={advForm.amount} onChange={v => setAdvForm(f => ({ ...f, amount: v }))} type="number" placeholder="0" />
              <FormField label="Notes" value={advForm.notes} onChange={v => setAdvForm(f => ({ ...f, notes: v }))} placeholder="Optional" />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddAdvance(false)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={handleAddAdvance} style={{ padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#2563EB', color: '#fff' }}>Save</button>
            </div>
          </div>
        )}
        {advances.length === 0 ? <div style={{ fontSize: 12, color: '#94A3B8', padding: 10 }}>No advances given yet</div> :
          advances.map(adv => (
            <div key={adv.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F8FAFC', gap: 10 }}>
              <i className="fas fa-hand-holding-usd" style={{ color: '#2563EB', fontSize: 12, width: 16 }}></i>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', flex: 1 }}>{adv.notes || 'Advance'}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', minWidth: 70, textAlign: 'right' }}>₹{(adv.amount || 0).toLocaleString()}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: '#DBEAFE', color: '#2563EB' }}>{adv.paymentMode || 'CASH'}</span>
            </div>
          ))
        }
      </Section>
    </>
  );
}

// ─── TIMELINE TAB ─────────────────────────────────────────
function TimelineTab({ trip }) {
  const events = [
    { time: trip.createdAt, label: 'Trip Created', icon: 'fas fa-plus-circle', done: true },
    ...(trip.vehicleRegistration ? [{ time: trip.createdAt, label: 'Vehicle Assigned', icon: 'fas fa-truck', done: true, detail: trip.vehicleRegistration }] : []),
    ...(trip.driverName ? [{ time: trip.createdAt, label: 'Driver Assigned', icon: 'fas fa-user', done: true, detail: trip.driverName }] : []),
    ...(trip.startedAt ? [{ time: trip.startedAt, label: 'Trip Started', icon: 'fas fa-play', done: true }] : []),
    ...(trip.status === 'IN_TRANSIT' ? [{ time: null, label: 'In Transit', icon: 'fas fa-road', done: false, current: true }] : []),
    ...(trip.reachedDestination ? [{ time: trip.reachedDestinationAt, label: 'Reached Destination', icon: 'fas fa-map-marker-alt', done: true }] : []),
    ...(trip.deliveredAt ? [{ time: trip.deliveredAt, label: 'Delivered', icon: 'fas fa-check-circle', done: true }] : []),
    ...(trip.settledAt ? [{ time: trip.settledAt, label: 'Trip Settled', icon: 'fas fa-lock', done: true }] : []),
    ...(trip.cancelledAt ? [{ time: trip.cancelledAt, label: 'Cancelled', icon: 'fas fa-ban', done: true, detail: trip.cancellationReason }] : []),
  ];

  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'linear-gradient(to bottom, #16A34A, #E5E7EB)' }}></div>
      {events.map((ev, i) => (
        <div key={i} style={{ position: 'relative', padding: '10px 0 10px 20px' }}>
          <div style={{
            position: 'absolute', left: -13, top: 12, width: ev.current ? 24 : 20, height: ev.current ? 24 : 20,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
            background: ev.done ? '#16A34A' : ev.current ? '#2563EB' : '#E5E7EB',
            boxShadow: ev.current ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
          }}>
            <i className={ev.done ? 'fas fa-check' : ev.icon} style={{ color: '#fff', fontSize: 8 }}></i>
          </div>
          <div style={{ padding: '10px 14px', background: ev.current ? '#EFF6FF' : ev.done ? '#F0FDF4' : '#F9FAFB', border: `1px solid ${ev.current ? '#2563EB' : ev.done ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ev.current ? '#1E40AF' : ev.done ? '#166534' : '#6B7280' }}>{ev.label}</span>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600, background: ev.done ? '#16A34A' : ev.current ? '#2563EB' : '#F3F4F6', color: ev.done || ev.current ? '#fff' : '#9CA3AF' }}>
                {ev.done ? 'DONE' : ev.current ? 'ACTIVE' : 'PENDING'}
              </span>
            </div>
            {ev.time && <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>{fmtDate(ev.time)}</div>}
            {ev.detail && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{ev.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FINANCIALS TAB ───────────────────────────────────────
function FinancialsTab({ trip }) {
  const revenue = trip.freightAmount || 0;
  const expenses = trip.totalExpenses || 0;
  const profit = trip.tripProfit || (revenue - expenses);
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 14, background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <div style={{ fontSize: 10, color: '#2563EB', fontWeight: 700 }}>REVENUE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1E3A5F' }}>₹{revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>EXPENSES</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#991B1B' }}>₹{expenses.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: profit >= 0 ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${profit >= 0 ? '#BBF7D0' : '#FECACA'}` }}>
          <div style={{ fontSize: 10, color: profit >= 0 ? '#16A34A' : '#DC2626', fontWeight: 700 }}>PROFIT ({margin}%)</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: profit >= 0 ? '#166534' : '#991B1B' }}>₹{profit.toLocaleString()}</div>
        </div>
      </div>

      <Section title="Settlement Summary" icon="fas fa-balance-scale" iconColor="#6366F1" borderColor="#A5B4FC" headerBg="#E0E7FF">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Total Advances" value={`₹${(trip.totalAdvances || 0).toLocaleString()}`} mono />
          <Field label="Total Expenses" value={`₹${(trip.totalExpenses || 0).toLocaleString()}`} mono />
          <Field label="Settlement Balance" value={`₹${(trip.settlementBalance || 0).toLocaleString()}`} mono />
          <Field label="Status" value={trip.status === 'SETTLED' ? '✅ Settled' : '⏳ Pending'} />
        </div>
      </Section>

      {trip.status === 'SETTLED' && trip.settledAt && (
        <div style={{ marginTop: 10, padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 12, color: '#166534' }}>
          <i className="fas fa-check-circle" style={{ marginRight: 6 }}></i>
          Trip settled on {new Date(trip.settledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}
    </>
  );
}

export default TripDetailContent;
