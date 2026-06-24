import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BookOpen, Edit2, Trash2, Plus, X, Search, ChevronDown,
  CheckCircle2, AlertTriangle, BookMarked, Loader2
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

const BOOK_SERVICE_URL = 'http://localhost:9000';

/* ─── Availability Badge ─────────────────────────────────────────────────── */
function AvailabilityBadge({ available, total }) {
  const pct = total > 0 ? (available / total) : 0;
  const color = pct === 0 ? '#DC2626' : pct < 0.4 ? '#D97706' : '#059669';
  const bg    = pct === 0 ? 'rgba(220,38,38,0.08)' : pct < 0.4 ? 'rgba(217,119,6,0.08)' : 'rgba(5,150,105,0.08)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      <span style={{ fontWeight: 600, color, fontSize: '0.85rem' }}>{available} / {total} Available</span>
      <div style={{ height: '4px', borderRadius: '2px', background: '#F1F4FA', width: '80px' }}>
        <div style={{ height: '100%', borderRadius: '2px', background: color, width: `${pct * 100}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

export default function BookManagement() {
  const [books,          setBooks]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [fetchError,     setFetchError]    = useState('');
  const [isModalOpen,    setIsModalOpen]   = useState(false);
  const [editingBook,    setEditingBook]   = useState(null);
  const [formData,       setFormData]      = useState({
    title: '', isbn: '', description: '',
    total_copies: 1, available_copies: 1,
    published_date: '',
  });
  const [submitting,     setSubmitting]    = useState(false);
  const [formError,      setFormError]     = useState('');
  const [toasts,         setToasts]        = useState([]);
  const [searchTerm,     setSearchTerm]    = useState('');
  const [filterAvail,    setFilterAvail]   = useState('ALL');

  const token   = localStorage.getItem('access_token');
  const role    = localStorage.getItem('role') || 'User';
  const isAdmin = role === 'ADMIN';

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* ── Fetch books ───────────────────────────────────────────────────────── */
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await fetch(`${BOOK_SERVICE_URL}/books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBooks(data.data || []);
      } else {
        setFetchError(data.message || 'Failed to fetch books.');
      }
    } catch {
      setFetchError('Failed to connect to the Book Service. Make sure it is running on port 9000.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  /* ── Modal helpers ─────────────────────────────────────────────────────── */
  const handleOpenModal = (book = null) => {
    setFormError('');
    if (book) {
      setEditingBook(book);
      setFormData({
        title:            book.title,
        isbn:             book.isbn,
        description:      book.description || '',
        total_copies:     book.total_copies,
        available_copies: book.available_copies,
        published_date:   book.published_date || '',
      });
    } else {
      setEditingBook(null);
      setFormData({ title: '', isbn: '', description: '', total_copies: 1, available_copies: 1, published_date: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingBook(null); };

  /* ── Save (create / update) ────────────────────────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.isbn.trim()) {
      setFormError('Title and ISBN are required.');
      return;
    }
    if (Number(formData.available_copies) > Number(formData.total_copies)) {
      setFormError('Available copies cannot exceed total copies.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const url    = editingBook ? `${BOOK_SERVICE_URL}/books/${editingBook.id}` : `${BOOK_SERVICE_URL}/books`;
      const method = editingBook ? 'PUT' : 'POST';

      const body = {
        title:            formData.title.trim(),
        isbn:             formData.isbn.trim(),
        description:      formData.description.trim() || null,
        total_copies:     Number(formData.total_copies),
        available_copies: Number(formData.available_copies),
        published_date:   formData.published_date || null,
      };

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(editingBook ? 'Book updated successfully.' : 'Book added to catalog.', 'success');
        fetchBooks();
        handleCloseModal();
      } else {
        setFormError(data.message || 'Operation failed.');
      }
    } catch {
      setFormError('Network error. Could not save book.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ────────────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      const res  = await fetch(`${BOOK_SERVICE_URL}/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Book removed from catalog.', 'success');
        fetchBooks();
      } else {
        showToast(data.message || 'Failed to delete book.', 'error');
      }
    } catch {
      showToast('Network error. Failed to delete book.', 'error');
    }
  };

  /* ── Filter & search ───────────────────────────────────────────────────── */
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const q = searchTerm.toLowerCase();
      const matchSearch = b.title.toLowerCase().includes(q)
        || b.isbn.toLowerCase().includes(q)
        || (b.description || '').toLowerCase().includes(q);
      const matchAvail = filterAvail === 'ALL'
        || (filterAvail === 'AVAILABLE' && b.available_copies > 0)
        || (filterAvail === 'UNAVAILABLE' && b.available_copies === 0);
      return matchSearch && matchAvail;
    });
  }, [books, searchTerm, filterAvail]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B' }}>Book Catalog</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#9CA3AF' }}>Manage library books, catalog details, and availability.</p>
        </div>
        {isAdmin && (
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
            Add Book
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by title, ISBN, or description…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', width: '100%' }}
            onFocus={focusInput} onBlur={blurInput} />
        </div>
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <BookMarked size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', zIndex: 1 }} />
          <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer' }}
            onFocus={focusInput} onBlur={blurInput}>
            <option value="ALL">All Books</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E4E9F7',
        boxShadow: '0 4px 20px rgba(79,70,229,0.02)', overflow: 'hidden', minHeight: '200px',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '0.75rem' }}>
            <Loader2 size={32} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 500 }}>Loading book catalog...</span>
          </div>
        ) : fetchError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#EF4444" />
            <div>
              <div style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.95rem' }}>Could Not Load Books</div>
              <div style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>{fetchError}</div>
            </div>
            <button onClick={fetchBooks} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #E4E9F7', background: '#F8FAFF', color: '#4F46E5', fontWeight: 600, cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '0.75rem', textAlign: 'center' }}>
            <BookOpen size={32} color="#9CA3AF" />
            <div>
              <div style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.95rem' }}>No Books Found</div>
              <div style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>Try refining your search or add a new book to the catalog.</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', borderBottom: '1.5px solid #E4E9F7' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Book Details</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Authors</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Availability</th>
                  {isAdmin && <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book.id} style={{ borderBottom: '1.5px solid #F1F4FA', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', flexShrink: 0 }}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.875rem' }}>{book.title}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>ISBN: {book.isbn}</span>
                            {book.published_date && (
                              <>
                                <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D1D5DB' }} />
                                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{book.published_date}</span>
                              </>
                            )}
                          </div>
                          {book.description && (
                            <div style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 500, marginTop: '0.1rem', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {book.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#4B5563' }}>
                      {book.category ? (
                        <span style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', background: '#F0F4FF', color: '#4F46E5', fontWeight: 600, fontSize: '0.75rem' }}>
                          {book.category.name}
                        </span>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontStyle: 'italic', fontSize: '0.8rem' }}>Uncategorized</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.82rem', color: '#4B5563', maxWidth: '180px' }}>
                      {book.authors && book.authors.length > 0
                        ? book.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ')
                        : <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>No authors</span>
                      }
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <AvailabilityBadge available={book.available_copies} total={book.total_copies} />
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenModal(book)} title="Edit Book"
                            style={{ padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #E4E9F7', background: '#FFFFFF', color: '#4B5563', cursor: 'pointer', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = 'rgba(79,70,229,0.02)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E9F7'; e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = '#FFFFFF'; }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(book.id)} title="Delete Book"
                            style={{ padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #FEE2E2', background: '#FFFFFF', color: '#EF4444', cursor: 'pointer', transition: 'all 0.18s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = '#FFF5F5'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#FEE2E2'; e.currentTarget.style.background = '#FFFFFF'; }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30,27,75,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E4E9F7',
            width: '460px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(30,27,75,0.15)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <BookOpen size={14} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E1B4B' }}>
                  {editingBook ? 'Edit Book' : 'Add Book to Catalog'}
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
              {/* Title */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Book Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. Clean Code" />
              </div>

              {/* ISBN + Published Date */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1.3 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>ISBN *</label>
                  <input type="text" required value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} placeholder="e.g. 978-3-16-148410-0" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Published Date</label>
                  <input type="date" value={formData.published_date} onChange={e => setFormData({ ...formData, published_date: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>

              {/* Copies */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Total Copies *</label>
                  <input type="number" min={1} required value={formData.total_copies}
                    onChange={e => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Available Copies *</label>
                  <input type="number" min={0} required value={formData.available_copies}
                    onChange={e => setFormData({ ...formData, available_copies: parseInt(e.target.value) || 0 })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Short Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, paddingLeft: '0.875rem', resize: 'none', height: '75px', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                  onFocus={focusInput} onBlur={blurInput} placeholder="Brief synopsis or details about the book..." />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseModal}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', border: '1.5px solid #E4E9F7', background: '#FFFFFF', color: '#4B5563', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', cursor: submitting ? 'wait' : 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.18s', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {submitting ? (
                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />Saving...</>
                  ) : 'Save Book'}
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
