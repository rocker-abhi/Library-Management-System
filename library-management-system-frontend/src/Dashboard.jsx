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
  { id: 'reports',   label: 'Reports',    Icon: FileText },
  { id: 'settings',  label: 'Settings',   Icon: Settings },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const role     = localStorage.getItem('role')     || 'User';
  const username = localStorage.getItem('username') || localStorage.getItem('user_id') || 'User';
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [sidebarHover, setSidebarHover] = React.useState(null);

  const handleLogout = () => {
    localStorage.clear();
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
          {activeTab === 'reports'   && <PlaceholderPage title="Reports" desc="Analytics and system reports." />}
          {activeTab === 'settings'  && <PlaceholderPage title="Settings" desc="System and account configuration." />}
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

function PlaceholderPage({ title, desc }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '16px', padding: '4rem 2rem',
      border: '1.5px solid #E4E9F7', textAlign: 'center',
      boxShadow: '0 2px 8px rgba(79,70,229,0.04)',
    }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(79,70,229,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <Settings size={26} color="#4F46E5" strokeWidth={1.6} />
      </div>
      <h2 style={{ margin: '0 0 0.5rem', color: '#1E1B4B', fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>{desc} — Coming soon.</p>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
