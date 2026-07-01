import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Users, BookOpen, ShieldAlert, Award, FileText,
  Settings, LayoutDashboard, ChevronRight, Feather, Bookmark, DollarSign,
} from 'lucide-react';
import UserManagement from './UserManagement.jsx';
import AuthorManagement from './AuthorManagement.jsx';
import BookManagement from './BookManagement.jsx';
import BorrowManagement from './BorrowManagement.jsx';
import FineManagement from './FineManagement.jsx';

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'employees', label: 'Employees',  Icon: Users },
  { id: 'authors',   label: 'Authors',    Icon: Feather },
  { id: 'library',   label: 'Library',    Icon: BookOpen },
  { id: 'borrow',    label: 'Borrow',     Icon: Bookmark },
  { id: 'fine',      label: 'Fine',       Icon: DollarSign },
  { id: 'settings',  label: 'Settings',   Icon: Settings },
];

export default function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const role     = localStorage.getItem('role')     || 'User';
  const username = localStorage.getItem('username') || localStorage.getItem('user_id') || 'User';
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [sidebarHover, setSidebarHover] = React.useState(null);

  const handleLogout = () => {
    localStorage.clear();
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    }
    navigate('/login');
  };

  const initials = username.substring(0, 2).toUpperCase();

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#F0F4FF', fontFamily: 'var(--font-sans)',
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1.5px solid #E4E9F7',
        display: 'flex', flexDirection: 'column',
        padding: '1.5rem 1rem',
        boxShadow: '2px 0 12px rgba(79,70,229,0.04)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79,70,229,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' }}>HR</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>H.R.M.S</div>
            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 500 }}>Management Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
            Navigation
          </p>
          {SIDEBAR_NAV.map(({ id, label, Icon }) => {
            if (id === 'employees' && role !== 'ADMIN') return null;
            if (id === 'authors' && role !== 'ADMIN' && role !== 'SUPERVISOR') return null;
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                onMouseEnter={() => setSidebarHover(id)}
                onMouseLeave={() => setSidebarHover(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem', borderRadius: '10px', border: 'none',
                  background: isActive ? 'rgba(79,70,229,0.08)' : (sidebarHover === id ? '#F8FAFF' : 'transparent'),
                  color: isActive ? '#4F46E5' : '#4B5563',
                  fontWeight: isActive ? 600 : 500, fontSize: '0.875rem',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                  borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                }}>
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </button>
            );
          })}
        </nav>

        {/* User Card + Logout */}
        <div>
          <div style={{
            padding: '0.875rem', borderRadius: '12px',
            background: '#F8FAFF', border: '1.5px solid #E4E9F7',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</div>
              <div style={{ fontSize: '0.7rem', color: '#6366F1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.625rem', borderRadius: '10px', border: '1.5px solid #FEE2E2',
              background: '#FFF5F5', color: '#DC2626', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 2rem', background: '#FFFFFF',
          borderBottom: '1.5px solid #E4E9F7',
          boxShadow: '0 1px 4px rgba(79,70,229,0.04)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
              {SIDEBAR_NAV.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.5rem 1rem', borderRadius: '10px',
              background: '#F0F4FF', border: '1.5px solid #E4E9F7',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.72rem',
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E1B4B' }}>{username}</div>
                <div style={{ fontSize: '0.68rem', color: '#6366F1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div style={{ padding: '2rem', flex: 1 }}>
          {activeTab === 'dashboard' && <DashboardHome username={username} role={role} />}
          {activeTab === 'employees' && <UserManagement />}
          {activeTab === 'authors'   && <AuthorManagement />}
          {activeTab === 'library'   && <BookManagement />}
          {activeTab === 'borrow'    && <BorrowManagement />}
          {activeTab === 'fine'      && <FineManagement />}
          {activeTab === 'settings'  && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

/* ─── Dashboard Home ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, Icon, color, bg }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem',
      border: '1.5px solid #E4E9F7',
      boxShadow: '0 2px 8px rgba(79,70,229,0.06)',
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(79,70,229,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#1E1B4B', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.375rem', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function DashboardHome({ username, role }) {
  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)',
        borderRadius: '20px', padding: '2rem 2.5rem',
        marginBottom: '1.75rem', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(79,70,229,0.3)',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40%', right: '15%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Good {getTimeGreeting()}, {username}! 👋
        </h2>
        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
          You're logged in as <strong style={{ color: '#fff' }}>{role}</strong>. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <StatCard label="Total Employees" value="124" Icon={Users} color="#4F46E5" bg="rgba(79,70,229,0.08)" />
        <StatCard label="Library Catalog" value="4,812" Icon={BookOpen} color="#0891B2" bg="rgba(8,145,178,0.08)" />
        <StatCard label="System Uptime" value="98.4%" Icon={Award} color="#059669" bg="rgba(5,150,105,0.08)" />
        <StatCard label="Critical Alerts" value="0" Icon={ShieldAlert} color="#DC2626" bg="rgba(220,38,38,0.08)" />
      </div>

      {/* Info panel */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem 2rem',
        border: '1.5px solid #E4E9F7', boxShadow: '0 2px 8px rgba(79,70,229,0.04)',
      }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.05rem', fontWeight: 700, color: '#1E1B4B' }}>System Overview</h3>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.7 }}>
          All services are operational. Use the left sidebar to navigate to employee management,
          library catalog, reports, and settings. Administrative actions are available based on your role.
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  const username = localStorage.getItem('username') || '';
  const role = localStorage.getItem('role') || 'User';
  const userId = localStorage.getItem('user_id') || '';

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ text: '', type: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: 'All fields are required.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase(),
          old_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ text: err.message || 'Something went wrong.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1.5px solid #E4E9F7',
    borderRadius: '10px',
    background: '#F8FAFF',
    color: '#1E1B4B',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.18s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#4B5563',
    marginBottom: '0.375rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {/* Profile Info Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem',
        border: '1.5px solid #E4E9F7', boxShadow: '0 2px 8px rgba(79,70,229,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#4F46E5'
          }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E1B4B' }}>Profile Information</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>Your personal account information.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User ID</span>
            <div style={{ fontSize: '0.9rem', color: '#1E1B4B', fontWeight: 600, wordBreak: 'break-all', marginTop: '0.2rem' }}>{userId}</div>
          </div>
          <div style={{ borderTop: '1px solid #F1F4FA', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</span>
            <div style={{ fontSize: '0.9rem', color: '#1E1B4B', fontWeight: 600, marginTop: '0.2rem' }}>{username}</div>
          </div>
          <div style={{ borderTop: '1px solid #F1F4FA', paddingTop: '0.8rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</span>
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{
                display: 'inline-flex', padding: '0.25rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(79,70,229,0.08)', color: '#4F46E5'
              }}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '1.75rem',
        border: '1.5px solid #E4E9F7', boxShadow: '0 2px 8px rgba(79,70,229,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#4F46E5'
          }}>
            <Settings size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E1B4B' }}>Security Settings</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#9CA3AF' }}>Update your account password.</p>
          </div>
        </div>

        {message.text && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem', borderRadius: '10px',
            background: message.type === 'success' ? '#ECFDF5' : '#FFF5F5',
            border: `1.5px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            color: message.type === 'success' ? '#065F46' : '#DC2626',
            fontSize: '0.8rem', fontWeight: 500, marginBottom: '1rem',
          }}>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.625rem', borderRadius: '10px', border: 'none',
              background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #6366F1)',
              color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)', transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
