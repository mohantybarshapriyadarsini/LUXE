import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup({ onNavigate }) {
  const { signup } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())          { setError('Name is required.'); return; }
    if (!EMAIL_RE.test(form.email)) { setError('Enter a valid email address.'); return; }
    if (!form.phone.trim())         { setError('Phone number is required.'); return; }
    if (form.password.length < 6)   { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const result = await signup(form);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onNavigate('home');
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        <div className="auth-header">
          <p className="section-label">Join LUXE</p>
          <div className="divider" />
          <h1 className="auth-title">Create Account</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="fields-row">
            <div className="field-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
            </div>
            <div className="field-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555-000-0000" />
            </div>
          </div>
          <div className="field-group">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?{' '}<button className="auth-link" onClick={() => onNavigate('login')}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
