import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const usernameTrimmed = username.trim();
    if (usernameTrimmed.length < 3 || usernameTrimmed.length > 50) {
      setError('Username must be between 3 and 50 characters.');
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(usernameTrimmed)) {
      setError('Username may only contain letters, numbers, dots, underscores, and hyphens.');
      setLoading(false);
      return;
    }
    if (password.trim() !== password) {
      setError('Password cannot start or end with spaces.');
      setLoading(false);
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameTrimmed.toLowerCase(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error_code === 'AUTH_ERROR_003') {
          navigate('/reset-password', { state: { username: usernameTrimmed, tempPassword: password } });
          return;
        }
        if (data.errors && data.errors.length > 0) {
          const validationMsg = data.errors
            .map((err) => `${err.field.charAt(0).toUpperCase() + err.field.slice(1)}: ${err.message}`)
            .join(' | ');
          throw new Error(validationMsg);
        }
        throw new Error(data.message || 'Invalid username or password.');
      }

      if (!data.success) throw new Error(data.message || 'Login failed.');

      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('user_id', data.data.user_id);
      localStorage.setItem('username', usernameTrimmed.toLowerCase());
      localStorage.setItem('role', data.data.role);
      localStorage.setItem('permissions', JSON.stringify(data.data.permissions));
      localStorage.setItem('token_type', data.data.token_type || 'Bearer');

      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 40%, #E8EDFF 100%)',
      padding: '1.5rem',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '45%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '45%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(79,70,229,0.14), 0 4px 16px rgba(0,0,0,0.06)',
        padding: '2.5rem',
        position: 'relative', zIndex: 1,
        border: '1px solid rgba(79,70,229,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            marginBottom: '1.25rem',
          }}>
            <span style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>HR</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1B4B', margin: 0, letterSpacing: '-0.02em' }}>Welcome Back</h1>
          <p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>Sign in to the HRMS portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            padding: '0.875rem 1rem', borderRadius: '12px',
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={17} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ color: '#991B1B', fontSize: '0.85rem', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <User size={16} />
              </span>
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john.doe"
                style={{
                  width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem',
                  paddingTop: '0.75rem', paddingBottom: '0.75rem',
                  border: '1.5px solid #E4E9F7', borderRadius: '12px',
                  background: '#F8FAFF', color: '#1E1B4B',
                  fontSize: '0.9rem', outline: 'none', transition: 'all 0.18s',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%', paddingLeft: '2.5rem', paddingRight: '3rem',
                  paddingTop: '0.75rem', paddingBottom: '0.75rem',
                  border: '1.5px solid #E4E9F7', borderRadius: '12px',
                  background: '#F8FAFF', color: '#1E1B4B',
                  fontSize: '0.9rem', outline: 'none', transition: 'all 0.18s',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E4E9F7'; e.target.style.background = '#F8FAFF'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
                  display: 'flex', padding: 0, transition: 'color 0.18s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%', padding: '0.875rem',
              background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.4)',
              transition: 'all 0.18s', fontFamily: 'var(--font-sans)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.5)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 14px rgba(79,70,229,0.4)'; }}
          >
            {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /><span>Signing In...</span></> : <span>Sign In</span>}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Human Resources Management System · v2.0
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
