import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginBrand, loginAdmin } from '../services/api';
import './AuthPages.css';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [tab,        setTab]        = useState('buyer');
  const [form,       setForm]       = useState({ email: '', password: '' });
  const [otp,        setOtp]        = useState('');
  const [otpStep,    setOtpStep]    = useState(false);  // admin OTP step
  const [otpHint,    setOtpHint]    = useState('');     // demo: shows OTP
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }
  function switchTab(t)    { setTab(t); setError(''); setForm({ email: '', password: '' }); setOtpStep(false); setOtp(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);

    try {
      if (tab === 'buyer') {
        const result = await login(form.email, form.password);
        if (!result.ok) { setError(result.error); return; }
        onNavigate('home');

      } else if (tab === 'brand') {
        const data = await loginBrand({ email: form.email, password: form.password });
        localStorage.setItem('luxe_brand_token', data.token);
        localStorage.setItem('luxe_brand_user', JSON.stringify(data));
        onNavigate('brand-dashboard');

      } else if (tab === 'admin') {
        // Step 1 — send credentials, get OTP
        const res = await loginAdmin({ email: form.email, password: form.password });
        if (res.requireOtp) {
          setOtpStep(true);
          setOtpHint(res.otp); // demo only — remove in production
          setError('');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    setLoading(true);
    try {
      // Step 2 — verify OTP
      const data = await loginAdmin({ email: form.email, password: form.password, otp });
      localStorage.setItem('luxe_admin_token', data.token);
      localStorage.setItem('luxe_admin_user', JSON.stringify(data));
      onNavigate('admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const TAB_LABELS = { buyer: 'Buyer', brand: 'Brand', admin: 'Admin' };
  const TAB_SUBS   = {
    buyer: 'Access your LUXE buyer account',
    brand: 'Access your brand dashboard',
    admin: 'LUXE admin portal — restricted access',
  };

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        <div className="auth-header">
          <p className="section-label">Welcome Back</p>
          <div className="divider" />
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">{TAB_SUBS[tab]}</p>
        </div>

        {/* 3-tab switcher */}
        <div className="login-tabs">
          {['buyer','brand','admin'].map(t => (
            <button key={t} type="button"
              className={`login-tab ${tab === t ? 'active' : ''}`}
              onClick={() => switchTab(t)}>
              {t === 'buyer' ? '🛍️' : t === 'brand' ? '🏷️' : '⚙️'} {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === 'admin' && !otpStep && (
          <div className="auth-info-note">
            ⚙️ Admin access requires 2-step verification. An OTP will be sent after credentials are verified.
          </div>
        )}
        {tab === 'brand' && (
          <div className="auth-info-note">
            🏷️ Brand portal — manage your products and view orders.
          </div>
        )}

        {/* ── Admin OTP Step ── */}
        {tab === 'admin' && otpStep ? (
          <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
            <div className="otp-header">
              <span className="otp-icon">🔐</span>
              <p>OTP sent to admin. Enter the 6-digit code to continue.</p>
            </div>
            {otpHint && (
              <div className="auth-info-note" style={{ textAlign: 'center' }}>
                Demo OTP: <strong style={{ color: 'var(--gold-light)', fontSize: '18px', letterSpacing: '4px' }}>{otpHint}</strong>
              </div>
            )}
            <div className="field-group">
              <label>6-Digit OTP *</label>
              <input
                type="text" value={otp} onChange={e => { setOtp(e.target.value); setError(''); }}
                placeholder="Enter OTP" maxLength={6}
                style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontFamily: 'var(--serif)' }}
                autoFocus
              />
              <span className="field-hint">OTP is valid for 5 minutes</span>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Verify OTP & Sign In'}
            </button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}
              onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}>
              ← Back
            </button>
          </form>
        ) : (
          /* ── Normal Login Form ── */
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : `Sign In as ${TAB_LABELS[tab]}`}
            </button>
          </form>
        )}

        {tab === 'buyer' && (
          <div className="auth-footer">
            <p>Don't have an account?{' '}
              <button className="auth-link" onClick={() => onNavigate('signup')}>Create one</button>
            </p>
            <p style={{ marginTop: '8px' }}>Are you a brand?{' '}
              <button className="auth-link" onClick={() => onNavigate('brand-register')}>Register your brand</button>
            </p>
          </div>
        )}
        {tab === 'brand' && (
          <div className="auth-footer">
            <p>New brand?{' '}
              <button className="auth-link" onClick={() => onNavigate('brand-register')}>Register here</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
