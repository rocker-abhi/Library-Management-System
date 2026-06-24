import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Feather, Edit2, Trash2, Plus, X, Search, ChevronDown, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';

/* ─── Shared Styles ──────────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', paddingLeft: '2.375rem', paddingRight: '1rem',
  paddingTop: '0.625rem', paddingBottom: '0.625rem',
  border: '1.5px solid #E4E9F7', borderRadius: '10px',
  background: '#F8FAFF', color: '#1E1B4B', fontSize: '0.875rem',
  outline: 'none', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
};
const focusInput  = e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; };
const blurInput   = e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; };

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

export default function AuthorManagement() {
  const [authors,      setAuthors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [formData,     setFormData]     = useState({ first_name: '', last_name: '', bio: '' });
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState('');
  const [toasts,       setToasts]       = useState([]);
  const [searchTerm,   setSearchTerm]   = useState('');

  const token = localStorage.getItem('access_token');
  const role  = localStorage.getItem('role') || 'User';
  const isAdmin = role === 'ADMIN';

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await fetch('http://localhost:9000/authors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthors(data.data || []);
      } else {
        setFetchError(data.message || 'Failed to fetch authors.');
      }
    } catch (err) {
      setFetchError('Failed to fetch authors. Make sure the BookService is running.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleOpenModal = (author = null) => {
    setFormError('');
    if (author) {
      setEditingAuthor(author);
      setFormData({ first_name: author.first_name, last_name: author.last_name, bio: author.bio || '' });
    } else {
      setEditingAuthor(null);
      setFormData({ first_name: '', last_name: '', bio: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAuthor(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setFormError('First Name and Last Name are required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const url = editingAuthor 
        ? `http://localhost:9000/authors/${editingAuthor.id}`
        : 'http://localhost:9000/authors';
      const method = editingAuthor ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(editingAuthor ? 'Author updated successfully.' : 'Author created successfully.', 'success');
        fetchAuthors();
        handleCloseModal();
      } else {
        setFormError(data.message || 'Operation failed.');
      }
    } catch (err) {
      setFormError('Network error. Failed to save author.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author?')) return;

    try {
      const res = await fetch(`http://localhost:9000/authors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Author deleted successfully.', 'success');
        fetchAuthors();
      } else {
        showToast(data.message || 'Failed to delete author.', 'error');
      }
    } catch (err) {
      showToast('Network error. Failed to delete author.', 'error');
    }
  };

  const filteredAuthors = useMemo(() => {
    return authors.filter(a => {
      const name = `${a.first_name} ${a.last_name}`.toLowerCase();
      const bio = (a.bio || '').toLowerCase();
      const q = searchTerm.toLowerCase();
      return name.includes(q) || bio.includes(q);
    });
  }, [authors, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Toast toasts={toasts} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1E1B4B' }}>Author Management</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#9CA3AF' }}>Manage library authors and biographies.</p>
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
            Add Author
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input type="text" placeholder="Search by name or biography…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem', width: '100%' }}
            onFocus={focusInput} onBlur={blurInput} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E4E9F7',
        boxShadow: '0 4px 20px rgba(79,70,229,0.02)', overflow: 'hidden', minHeight: '200px',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '0.75rem' }}>
            <Loader2 size={32} color="#4F46E5" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 500 }}>Loading authors list...</span>
          </div>
        ) : fetchError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#EF4444" />
            <div>
              <div style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.95rem' }}>Could Not Load Authors</div>
              <div style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>{fetchError}</div>
            </div>
            <button onClick={fetchAuthors} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1.5px solid #E4E9F7', background: '#F8FAFF', color: '#4F46E5', fontWeight: 600, cursor: 'pointer' }}>
              Try Again
            </button>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '0.75rem', textAlign: 'center' }}>
            <Feather size={32} color="#9CA3AF" />
            <div>
              <div style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.95rem' }}>No Authors Found</div>
              <div style={{ color: '#9CA3AF', fontSize: '0.82rem', marginTop: '0.25rem' }}>Try adding a new author or search with different keywords.</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFF', borderBottom: '1.5px solid #E4E9F7' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biography</th>
                  {isAdmin && <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid #E4E9F7' }}>
                {filteredAuthors.map(author => (
                  <tr key={author.id} style={{ borderBottom: '1.5px solid #F1F4FA', transition: 'background 0.15s' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
                        }}>
                          <Feather size={14} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.875rem' }}>{author.first_name} {author.last_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontFamily: 'monospace', marginTop: '0.1rem' }}>{author.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#4B5563', maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
                      {author.bio || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>No biography provided.</span>}
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenModal(author)} title="Edit Author"
                            style={{
                              padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #E4E9F7', background: '#FFFFFF',
                              color: '#4B5563', cursor: 'pointer', transition: 'all 0.18s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = 'rgba(79,70,229,0.02)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E9F7'; e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = '#FFFFFF'; }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(author.id)} title="Delete Author"
                            style={{
                              padding: '0.4rem', borderRadius: '8px', border: '1.5px solid #FEE2E2', background: '#FFFFFF',
                              color: '#EF4444', cursor: 'pointer', transition: 'all 0.18s'
                            }}
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
            width: '420px', padding: '1.75rem', boxShadow: '0 20px 50px rgba(30,27,75,0.15)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            animation: 'scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <Feather size={14} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1E1B4B' }}>
                  {editingAuthor ? 'Edit Author' : 'Add New Author'}
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
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>First Name</label>
                  <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Last Name</label>
                  <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    style={{ ...inputStyle, paddingLeft: '0.875rem' }} onFocus={focusInput} onBlur={blurInput} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '0.375rem' }}>Biography</label>
                <textarea rows={4} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  style={{
                    ...inputStyle, paddingLeft: '0.875rem', resize: 'none', height: '100px',
                    paddingTop: '0.625rem', paddingBottom: '0.625rem',
                  }} onFocus={focusInput} onBlur={blurInput} placeholder="Describe the author's background, style, or details..." />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={handleCloseModal}
                  style={{
                    flex: 1, padding: '0.625rem', borderRadius: '10px', border: '1.5px solid #E4E9F7',
                    background: '#FFFFFF', color: '#4B5563', fontWeight: 600, fontSize: '0.875rem',
                    cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{
                    flex: 1, padding: '0.625rem', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#FFFFFF',
                    fontWeight: 600, fontSize: '0.875rem', cursor: submitting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.18s',
                    fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  {submitting ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Author'
                  )}
                </button>
              </div>
            </form>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
