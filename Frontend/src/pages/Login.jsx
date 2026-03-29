import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onNavigate('home');
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        <div className="auth-header">
          <p className="section-label">Welcome Back</p>
          <div className="divider" />
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Access your LUXE account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-gold auth-submit" type="submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?{' '}<button className="auth-link" onClick={() => onNavigate('signup')}>Create one</button></p>
        </div>
      </div>
    </div>
  );
}
