import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bookmark, Plus, X, Search, ChevronDown, CheckCircle2, AlertTriangle,
  Loader2, Calendar, User, BookOpen, Trash2, Edit2, Check, DollarSign
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
            : <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
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

/* ─── Initial Mock Data ─────────────────────────────────────────────────── */
const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    bookId: '',
    bookTitle: 'Clean Code',
    borrowerName: 'Abhishek Kumar',
    borrowDate: '2026-06-15',
    dueDate: '2026-06-29',
    returnDate: '',
    status: 'Active',
  },
  {
    id: 'tx-2',
    bookId: '',
    bookTitle: 'Design Patterns',
    borrowerName: 'Rohit Sharma',
    borrowDate: '2026-06-01',
    dueDate: '2026-06-15',
    returnDate: '2026-06-14',
    status: 'Returned',
  },
  {
    id: 'tx-3',
    bookId: '',
    bookTitle: 'The Pragmatic Programmer',
    borrowerName: 'John Doe',
    borrowDate: '2026-05-10',
    dueDate: '2026-05-24',
    returnDate: '',
    status: 'Overdue',
  }
];

export default function BorrowManagement() {
  const [transactions, setTransactions] = useState([]);
  const [books,        setBooks]        = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingTx,    setEditingTx]    = useState(null);
  const [formData,     setFormData]     = useState({
    bookId: '',
    bookTitle: '',
    borrowerName: '',
    borrowDate: '',
    dueDate: '',
    status: 'Active',
  });
  const [formError,    setFormError]    = useState('');
  const [toasts,       setToasts]       = useState([]);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const token = localStorage.getItem('access_token');

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* ── Load initial data ─────────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem('borrow_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.setItem('borrow_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    }
  }, []);

  /* ── Fetch library books ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        const res = await fetch('http://localhost:9000/books', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBooks(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [token]);

  /* ── Sync to localStorage ─────────────────────────────────────────────── */
  const saveTransactions = (newTxList) => {
    setTransactions(newTxList);
    localStorage.setItem('borrow_transactions', JSON.stringify(newTxList));
  };

  /* ── Modal helpers ─────────────────────────────────────────────────────── */
  const handleOpenModal = (tx = null) => {
    setFormError('');
    const today = new Date().toISOString().split('T')[0];
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (tx) {
      setEditingTx(tx);
      setFormData({
        bookId: tx.bookId || '',
        bookTitle: tx.bookTitle,
        borrowerName: tx.borrowerName,
        borrowDate: tx.borrowDate,
        dueDate: tx.dueDate,
        status: tx.status,
      });
    } else {
      setEditingTx(null);
      setFormData({
        bookId: '',
        bookTitle: '',
        borrowerName: '',
        borrowDate: today,
        dueDate: twoWeeks,
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  /* ── Save (create / update) ────────────────────────────────────────────── */
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.borrowerName.trim()) {
      setFormError('Borrower name is required.');
      return;
    }
    if (!editingTx && !formData.bookTitle.trim()) {
      setFormError('Please select a book.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (editingTx) {
      // Update
      const updated = transactions.map(t => {
        if (t.id === editingTx.id) {
          const returnDate = formData.status === 'Returned' ? (t.returnDate || todayStr) : '';
          return {
            ...t,
            borrowerName: formData.borrowerName.trim(),
            borrowDate: formData.borrowDate,
            dueDate: formData.dueDate,
            status: formData.status,
            returnDate,
          };
        }
        return t;
      });
      saveTransactions(updated);
      showToast('Borrow transaction updated successfully.', 'success');
    } else {
      // Create
      const selectedBook = books.find(b => b.id === formData.bookId);
      const bookTitle = selectedBook ? selectedBook.title : formData.bookTitle;

      const newTx = {
        id: `tx-${Date.now()}`,
        bookId: formData.bookId,
        bookTitle: bookTitle,
        borrowerName: formData.borrowerName.trim(),
        borrowDate: formData.borrowDate,
        dueDate: formData.dueDate,
        returnDate: '',
        status: 'Active',
      };
      saveTransactions([newTx, ...transactions]);
      showToast('Book borrowed successfully.', 'success');
    }
    handleCloseModal();
  };

  /* ── Mark as returned ──────────────────────────────────────────────────── */
  const handleReturn = (txId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = transactions.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'Returned',
          returnDate: todayStr,
        };
      }
      return t;
    });
    saveTransactions(updated);
    showToast('Book marked as returned.', 'success');
  };

  /* ── Delete transaction ────────────────────────────────────────────────── */
  const handleDelete = (txId) => {
    if (!window.confirm('Delete this borrow transaction?')) return;
    const filtered = transactions.filter(t => t.id !== txId);
    saveTransactions(filtered);
    showToast('Transaction deleted.', 'success');
  };

  /* ── Calculate Fine ────────────────────────────────────────────────────── */
  const getFine = (dueDate, returnDate, status) => {
    const due = new Date(dueDate);
    const end = returnDate ? new Date(returnDate) : new Date();
    if (end > due && status !== 'Returned') {
      const diffTime = Math.abs(end - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 2.0; // $2 per day
    } else if (status === 'Overdue') {
      return 10.0; // default minimum overdue fine if date parsing is off
    }
    return 0;
  };

  /* ── Stats computation ─────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let totalFine = 0;

    transactions.forEach(t => {
      const fineVal = getFine(t.dueDate, t.returnDate, t.status);
      totalFine += fineVal;

      if (t.status === 'Active') active++;
      else if (t.status === 'Overdue') overdue++;
    });

    return {
      total: transactions.length,
      active,
      overdue,
      totalFine,
    };
  }, [transactions]);

  /* ── Filtered transactions ─────────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const q = searchTerm.toLowerCase();
      const matchSearch = t.bookTitle.toLowerCase().includes(q) || t.borrowerName.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'ALL' || t.status.toUpperCase() === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [transactions, searchTerm, filterStatus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B' }}>Borrowing Management</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#9CA3AF' }}>Issue library books, monitor due dates, and manage returns.</p>
        </div>
        <button onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(79,70,229,0.35)', transition: 'all 0.18s',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(79,70,229,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'; }}>
          <Plus size={16} strokeWidth={2.5} />
          Issue Book
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #E4E9F7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79,70,229,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
            <Bookmark size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>Total Issued</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B', marginTop: '0.15rem' }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #E4E9F7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(5,150,105,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>Active Borrows</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B', marginTop: '0.15rem' }}>{stats.active}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #E4E9F7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(220,38,38,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>Overdue Books</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B', marginTop: '0.15rem' }}>{stats.overdue}</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1.5px solid #E4E9F7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(217,119,6,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>Overdue Fines</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B', marginTop: '0.15rem' }}>${stats.totalFine.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by book title or borrower name…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', width: '100%' }}
            onFocus={focusInput} onBlur={blurInput} />
        </div>
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '1rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
            onFocus={focusInput} onBlur={blurInput}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RETURNED">Returned</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E4E9F7',
        boxShadow: '0 4px 20px rgba(79,70,229,0.02)', overflow: 'hidden', minHeight: '200px',
      }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '0.75rem', textAlign: 'center' }}>
            <Bookmark size={32} color="#9CA3AF" />
            <div>
              <div style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.95rem' }}>No Transactions Found</div>
              <div style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>Try refining your search or issue a book.</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', borderBottom: '1.5px solid #E4E9F7' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issued Book</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Borrower</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dates</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fine</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => {
                  const fine = getFine(tx.dueDate, tx.returnDate, tx.status);
                  const isTxOverdue = tx.status === 'Overdue' || (tx.status === 'Active' && new Date() > new Date(tx.dueDate));
                  
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1.5px solid #F1F4FA', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(79,70,229,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>
                            <BookOpen size={16} />
                          </div>
                          <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.875rem' }}>{tx.bookTitle}</div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 700 }}>
                            {tx.borrowerName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: 500 }}>{tx.borrowerName}</div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#4B5563' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div>Issued: <strong style={{ color: '#1E1B4B' }}>{tx.borrowDate}</strong></div>
                          <div>Due: <strong style={{ color: '#1E1B4B' }}>{tx.dueDate}</strong></div>
                          {tx.returnDate && <div style={{ color: '#059669' }}>Returned: <strong>{tx.returnDate}</strong></div>}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                          background: tx.status === 'Returned' ? 'rgba(5,150,105,0.08)' : (isTxOverdue ? 'rgba(220,38,38,0.08)' : 'rgba(79,70,229,0.08)'),
                          color: tx.status === 'Returned' ? '#059669' : (isTxOverdue ? '#DC2626' : '#4F46E5'),
                        }}>
                          {isTxOverdue ? 'Overdue' : tx.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: fine > 0 ? '#DC2626' : '#9CA3AF' }}>
                        {fine > 0 ? `$${fine.toFixed(2)}` : '—'}
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          {tx.status !== 'Returned' && (
                            <button onClick={() => handleReturn(tx.id)} title="Mark Returned"
                              style={{ padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #A7F3D0', background: '#FFFFFF', color: '#059669', cursor: 'pointer', transition: 'all 0.18s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}>
                              <Check size={14} />
                            </button>
                          )}
                          <button onClick={() => handleOpenModal(tx)} title="Edit Details"
                            style={{ padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #E4E9F7', background: '#FFFFFF', color: '#4B5563', cursor: 'pointer', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E9F7'; e.currentTarget.style.color = '#4B5563'; }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} title="Delete Record"
                            style={{ padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #FEE2E2', background: '#FFFFFF', color: '#EF4444', cursor: 'pointer', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = '#FFF5F5'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#FEE2E2'; e.currentTarget.style.background = '#FFFFFF'; }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Borrow Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E4E9F7',
            width: '420px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(30,27,75,0.15)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <Bookmark size={14} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E1B4B' }}>
                  {editingTx ? 'Edit Transaction' : 'Issue Book'}
                </h3>
              </div>
              <button onClick={handleCloseModal} style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '10px', background: '#FFF5F5', border: '1.5px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', fontWeight: 500 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Book Selection */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Book *</label>
                {editingTx ? (
                  <input type="text" disabled value={formData.bookTitle} style={{ ...inputStyle, paddingLeft: '0.875rem', background: '#F1F4FA', color: '#6B7280' }} />
                ) : (
                  <div style={{ position: 'relative' }}>
                    <select value={formData.bookId}
                      onChange={e => {
                        const selected = books.find(b => b.id === e.target.value);
                        setFormData({
                          ...formData,
                          bookId: e.target.value,
                          bookTitle: selected ? selected.title : '',
                        });
                      }}
                      style={{ ...inputStyle, paddingLeft: '0.875rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusInput} onBlur={blurInput}>
                      <option value="">Select a book to issue...</option>
                      {books.map(b => (
                        <option key={b.id} value={b.id} disabled={b.available_copies === 0}>{b.title} {b.available_copies === 0 ? '(Out of stock)' : ''}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                )}
              </div>

              {/* Borrower Name */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Borrower Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input type="text" required value={formData.borrowerName} onChange={e => setFormData({ ...formData, borrowerName: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '2rem' }} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Jane Doe" />
                </div>
              </div>

              {/* Issue & Due Dates */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Issue Date</label>
                  <input type="date" value={formData.borrowDate} onChange={e => setFormData({ ...formData, borrowDate: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>

              {/* Status (Edit only) */}
              {editingTx && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Status</label>
                  <div style={{ position: 'relative' }}>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                      style={{ ...inputStyle, paddingLeft: '0.875rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusInput} onBlur={blurInput}>
                      <option value="Active">Active</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseModal}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', border: '1.5px solid #E4E9F7', background: '#FFFFFF', color: '#4B5563', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.18s', fontFamily: 'var(--font-sans)' }}>
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
          <style>{`
            @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
