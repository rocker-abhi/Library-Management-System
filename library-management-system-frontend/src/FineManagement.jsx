import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign, AlertCircle, CheckCircle2, Loader2, Search, Filter,
  ChevronDown, Calendar, User, BookOpen, CreditCard, Gift, ShieldAlert
} from 'lucide-react';

/* ─── Shared Styles ──────────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', paddingLeft: '2.375rem', paddingRight: '1rem',
  paddingTop: '0.625rem', paddingBottom: '0.625rem',
  border: '1.5px solid #E4E9F7', borderRadius: '10px',
  background: '#F8FAFF', color: '#1E1B4B', fontSize: '0.875rem',
  outline: 'none', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
};
const focusInput = e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; };
const blurInput  = e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; };

/* ─── Toast Notification ─────────────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1.25rem', borderRadius: '12px', minWidth: '280px',
          background: t.type === 'success' ? '#ECFDF5' : '#FFF5F5',
          border: `1.5px solid ${t.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {t.type === 'success'
            ? <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
            : <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          }
          <span style={{ fontSize: '0.85rem', color: t.type === 'success' ? '#065F46' : '#991B1B', fontWeight: 500, lineHeight: 1.4 }}>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function FineManagement() {
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [searchTerm,  setSearchTerm]  = useState('');
  const [filterType,  setFilterType]  = useState('ALL'); // ALL, OUTSTANDING, RESOLVED
  const [userMap,     setUserMap]     = useState({});
  const [toasts,      setToasts]      = useState([]);
  const [actionId,    setActionId]    = useState(null); // Tracks active operation row id
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', record: null });

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role') || 'User';
  const userId = localStorage.getItem('user_id');

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  // No longer needed - borrower names resolved server-side via gRPC
  // fetchUsers kept for potential fallback but we primarily use record.borrower_name
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const mapping = {};
        (data.data || []).forEach(u => {
          mapping[u.id] = u.username;
        });
        setUserMap(mapping);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    }
  }, [token]);

  const fetchFines = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('http://localhost:9100/borrow-books/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch fine records.');
      if (data.success) {
        // Map backend records and calculate if they have fines
        const fineRecords = (data.data || []).map(r => ({
          ...r,
          fine: r.fine || 0.0,
        }));
        setRecords(fineRecords);
      }
    } catch (err) {
      setFetchError(err.message || 'Error connecting to borrow service.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFines();
    }
  }, [token, fetchUsers, fetchFines]);

  // Outstanding/Resolved classification:
  // - Resolved: Returned books where any fine has been cleared/paid OR return date is set and fine is 0
  // - Outstanding: Not returned books that are past due date OR returned books with pending fines.
  // Note: Since the DB doesn't have an explicit fine payment status, we treat:
  // - "Outstanding": status is ACTIVE/OVERDUE and today is past due date, OR returned with fine > 0
  // - "Resolved": returned with fine = 0, OR active but not yet past due date (no fine).
  const classifiedRecords = useMemo(() => {
    const list = role === 'STUDENT' ? records.filter(r => r.borrower_id === userId) : records;
    return list.map(r => {
      const isOverdue = !r.return_date && new Date() > new Date(r.due_date);
      const hasFine = r.fine > 0;
      const payState = (r.borrow_payment_state || 'UNPAID').toUpperCase();
      const isPaidOrWaived = payState === 'PAID' || payState === 'WAIVED';
      const isResolved = isPaidOrWaived || (r.status === 'Returned' && r.fine === 0);

      let displayStatus = r.status === 'Returned' ? 'Returned' : (isOverdue ? 'Overdue' : 'Active');
      if (payState === 'WAIVED') {
        displayStatus = 'Waived';
      } else if (payState === 'PAID') {
        displayStatus = 'Paid';
      }

      return {
        ...r,
        isOverdue,
        hasFine,
        isResolved,
        displayStatus,
        payState,
        isPaidOrWaived,
      };
    });
  }, [records, role, userId]);

  // Filter & Search records:
  const filteredRecords = useMemo(() => {
    return classifiedRecords.filter(r => {
      const bName = r.borrower_name || userMap[r.borrower_id] || r.borrower_id || '';
      const matchesSearch = bName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.book_title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'ALL' ||
                            (filterType === 'OUTSTANDING' && r.fine > 0 && !r.isPaidOrWaived) ||
                            (filterType === 'RESOLVED' && r.isResolved) ||
                            (filterType === 'ACTIVE_FINES' && r.fine > 0 && r.status !== 'Returned' && !r.isPaidOrWaived);

      return matchesSearch && matchesFilter;
    });
  }, [classifiedRecords, searchTerm, filterType, userMap]);

  // Stats calculation:
  const stats = useMemo(() => {
    const activeFinesList = classifiedRecords.filter(r => r.fine > 0);
    const totalOutstanding = activeFinesList.reduce((acc, curr) => acc + curr.fine, 0);
    const totalOverdueBooks = classifiedRecords.filter(r => r.displayStatus === 'Overdue').length;
    const resolvedFinesCount = classifiedRecords.filter(r => r.status === 'Returned' && r.fine === 0).length;

    return {
      totalOutstanding,
      outstandingCount: activeFinesList.length,
      totalOverdueBooks,
      resolvedFinesCount
    };
  }, [classifiedRecords]);

  // Waive fine action — calls the dedicated PATCH /waive endpoint
  const handleWaiveFine = async (record) => {
    const bName = record.borrower_name || userMap[record.borrower_id] || 'Borrower';
    setActionId(record.id);
    try {
      const res = await fetch(`http://localhost:9100/borrow-books/${record.id}/waive`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to waive fine.');

      addToast(`Fine for ${bName} successfully waived!`, 'success');
      fetchFines();
    } catch (err) {
      addToast(err.message || 'Error waiving fine.', 'error');
    } finally {
      setActionId(null);
    }
  };

  // Pay/Clear Fine action — calls the dedicated PATCH /pay endpoint
  const handlePayFine = async (record) => {
    const bName = record.borrower_name || userMap[record.borrower_id] || 'Borrower';
    setActionId(record.id);
    try {
      const res = await fetch(`http://localhost:9100/borrow-books/${record.id}/pay`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register payment.');

      addToast(`Payment of ₹${record.fine} registered. Fine cleared!`, 'success');
      fetchFines();
    } catch (err) {
      addToast(err.message || 'Error registering payment.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const thStyle = { padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'var(--font-sans)' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B' }}>Fine Management</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#9CA3AF' }}>Monitor outstanding library fines, process payments, and manage waivers.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={cardStatStyle('#4F46E5', 'rgba(79,70,229,0.08)')}>
          <div style={iconBoxStyle('rgba(79,70,229,0.12)')}>
            <DollarSign size={20} color="#4F46E5" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1E1B4B' }}>₹{stats.totalOutstanding.toFixed(2)}</div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.25rem', fontWeight: 500 }}>Total Outstanding Fines</div>
          </div>
        </div>

        <div style={cardStatStyle('#EF4444', 'rgba(239,68,68,0.08)')}>
          <div style={iconBoxStyle('rgba(239,68,68,0.12)')}>
            <ShieldAlert size={20} color="#EF4444" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1E1B4B' }}>{stats.totalOverdueBooks}</div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.25rem', fontWeight: 500 }}>Overdue Active Loans</div>
          </div>
        </div>

        <div style={cardStatStyle('#059669', 'rgba(5,150,105,0.08)')}>
          <div style={iconBoxStyle('rgba(5,150,105,0.12)')}>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1E1B4B' }}>{stats.resolvedFinesCount}</div>
            <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.25rem', fontWeight: 500 }}>Resolved/Clean Returns</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by borrower name or book title…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem' }}
            onFocus={focusInput}
            onBlur={blurInput}
          />
        </div>

        <div style={{ position: 'relative', minWidth: '180px' }}>
          <Filter size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
            onFocus={focusInput}
            onBlur={blurInput}
          >
            <option value="ALL">All Records</option>
            <option value="OUTSTANDING">Outstanding Fines (₹ &gt; 0)</option>
            <option value="ACTIVE_FINES">Active Overdue (Outstanding + Not Returned)</option>
            <option value="RESOLVED">Returned with No Fine</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1rem', borderRadius: '12px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.15)' }}>
          <AlertCircle size={16} color="#DC2626" />
          <span style={{ color: '#991B1B', fontSize: '0.85rem' }}>{fetchError}</span>
        </div>
      )}

      {/* Data Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E4E9F7', boxShadow: '0 2px 8px rgba(79,70,229,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFF', borderBottom: '1.5px solid #E4E9F7' }}>
                <th style={thStyle}>Borrower</th>
                <th style={thStyle}>Book Details</th>
                <th style={thStyle}>Loan Dates</th>
                <th style={thStyle}>Fine Amount</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Loader2 size={28} color="#4F46E5" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ color: '#9CA3AF', marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading fine records…</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                    <DollarSign size={36} color="#E4E9F7" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No records match the current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => {
                  const isWorking = actionId === record.id;
                  return (
                    <tr
                      key={record.id}
                      style={{ borderBottom: '1px solid #F0F4FF', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Borrower */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(79,70,229,0.08)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
                          }}>
                            <User size={15} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1E1B4B' }}>{record.borrower_name || userMap[record.borrower_id] || 'Unknown User'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Book Details */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ color: '#8E9AA8' }}><BookOpen size={15} /></div>
                          <div style={{ fontWeight: 500, color: '#4B5563' }}>{record.book_title}</div>
                        </div>
                      </td>

                      {/* Loan Dates */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.78rem' }}>
                          <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> Due: {record.due_date}
                          </span>
                          {record.return_date ? (
                            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                              Returned: {record.return_date}
                            </span>
                          ) : (
                            <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              Outstanding
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fine Amount */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {record.fine > 0 ? (
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#DC2626' }}>
                            ₹{record.fine.toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <StatusBadge type={record.displayStatus} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        {record.payState === 'UNPAID' && (record.fine > 0 || record.status === 'Returned') ? (
                          <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {role === 'ADMIN' && (
                              <button
                                title="Waive Fine"
                                disabled={isWorking}
                                onClick={() => setConfirmModal({ isOpen: true, type: 'waive', record })}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                  padding: '0.375rem 0.75rem', borderRadius: '8px', border: '1.5px solid #F3F4F6',
                                  background: '#FFFFFF', color: '#6B7280', fontSize: '0.78rem', fontWeight: 600,
                                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#F3F4F6'; e.currentTarget.style.background = '#FFFFFF'; }}
                              >
                                <Gift size={13} />
                                Waive
                              </button>
                            )}

                            <button
                              title="Register Payment"
                              disabled={isWorking}
                              onClick={() => setConfirmModal({ isOpen: true, type: 'pay', record })}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.375rem 0.75rem', borderRadius: '8px', border: 'none',
                                background: 'linear-gradient(135deg, #059669, #10B981)', color: '#FFFFFF',
                                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                                boxShadow: '0 2px 6px rgba(5,150,105,0.2)'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 10px rgba(5,150,105,0.3)'; }}
                              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(5,150,105,0.2)'; }}
                            >
                              <CreditCard size={13} />
                              Pay Fine
                            </button>
                          </div>
                        ) : record.isPaidOrWaived ? (
                          <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                            No action required
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E4E9F7',
            width: '420px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(30,27,75,0.15)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: confirmModal.type === 'pay' ? 'rgba(5,150,105,0.08)' : 'rgba(79,70,229,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: confirmModal.type === 'pay' ? '#059669' : '#4F46E5'
              }}>
                <DollarSign size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E1B4B' }}>
                {confirmModal.type === 'pay' ? 'Confirm Payment' : 'Confirm Waiver'}
              </h3>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5 }}>
              {confirmModal.type === 'pay' ? (
                <>Mark the fine of <strong style={{ color: '#059669' }}>₹{confirmModal.record?.fine.toFixed(2)}</strong> as <strong>PAID</strong> for <strong style={{ color: '#1E1B4B' }}>{confirmModal.record?.borrower_name || userMap[confirmModal.record?.borrower_id] || 'Borrower'}</strong>? This will clear the fine.</>
              ) : (
                <>Are you sure you want to <strong style={{ color: '#4F46E5' }}>WAIVE</strong> the fine of <strong style={{ color: '#DC2626' }}>₹{confirmModal.record?.fine.toFixed(2)}</strong> for <strong style={{ color: '#1E1B4B' }}>{confirmModal.record?.borrower_name || userMap[confirmModal.record?.borrower_id] || 'Borrower'}</strong>?</>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: '', record: null })}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '10px', border: '1.5px solid #E4E9F7',
                  background: '#FFFFFF', color: '#4B5563', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'pay') {
                    handlePayFine(confirmModal.record);
                  } else {
                    handleWaiveFine(confirmModal.record);
                  }
                  setConfirmModal({ isOpen: false, type: '', record: null });
                }}
                style={{
                  flex: 1, padding: '0.625rem', borderRadius: '10px', border: 'none',
                  background: confirmModal.type === 'pay' ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
                  color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem',
                  cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
                  boxShadow: confirmModal.type === 'pay' ? '0 4px 12px rgba(5,150,105,0.2)' : '0 4px 12px rgba(79,70,229,0.2)'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper Components ─────────────────────────────────────────────────── */
function cardStatStyle(borderColor, bg) {
  return {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    border: '1.5px solid #E4E9F7',
    boxShadow: '0 2px 8px rgba(79,70,229,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderLeft: `4px solid ${borderColor}`,
  };
}

function iconBoxStyle(bg) {
  return {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };
}

function StatusBadge({ type }) {
  const map = {
    Returned: { bg: 'rgba(5,150,105,0.08)', color: '#059669', text: 'Returned' },
    Overdue:  { bg: 'rgba(239,68,68,0.08)',  color: '#EF4444',  text: 'Overdue' },
    Active:   { bg: 'rgba(79,70,229,0.08)',  color: '#4F46E5',  text: 'Active' },
    Waived:   { bg: 'rgba(16,185,129,0.08)',  color: '#10B981',  text: 'Waived' },
    Paid:     { bg: 'rgba(5,150,105,0.08)', color: '#059669', text: 'Paid' },
  };

  const s = map[type] || map.Active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem',
      borderRadius: '100px', background: s.bg, fontSize: '0.75rem', fontWeight: 600, color: s.color
    }}>
      {s.text}
    </span>
  );
}
