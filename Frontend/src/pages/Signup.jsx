import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

export default function Signup({ onNavigate }) {
  const { signup } = useAuth();
  const [step,    setStep]    = useState(1); // 1 = basic, 2 = personal details
  const [form,    setForm]    = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  }

  function validateStep1() {
    if (!form.name.trim())              return 'Full name is required.';
    if (!EMAIL_RE.test(form.email))     return 'Enter a valid email address.';
    if (!PHONE_RE.test(form.phone))     return 'Enter a valid phone number.';
    if (form.password.length < 6)       return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  }

  function validateStep2() {
    if (!form.dateOfBirth)   return 'Date of birth is required.';
    if (!form.gender)        return 'Please select your gender.';
    if (!form.city.trim())   return 'City is required.';
    if (!form.state)         return 'Please select your state.';
    if (!form.pincode.trim()) return 'PIN code is required.';
    if (!/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit PIN code.';
    return null;
  }

  function handleNext(e) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }

    setLoading(true);
    const result = await signup({
      name: form.name, email: form.email, phone: form.phone, password: form.password,
      dateOfBirth: form.dateOfBirth, gender: form.gender,
      city: form.city, state: form.state, pincode: form.pincode, country: form.country,
    });
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onNavigate('home');
  }

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up" style={{ maxWidth: '600px' }}>

        <div className="auth-header">
          <p className="section-label">Join LUXE</p>
          <div className="divider" />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">{step === 1 ? 'Step 1 of 2 — Account Details' : 'Step 2 of 2 — Personal Details'}</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleNext} noValidate>
            <div className="fields-row">
              <div className="field-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div className="field-group">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
              </div>
            </div>
            <div className="field-group">
              <label>Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />
              </div>
              <div className="field-group">
                <label>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
              </div>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn btn-gold auth-submit" type="submit">Continue →</button>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="fields-row">
              <div className="field-group">
                <label>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
                <span className="field-hint">Must be 18 years or older</span>
              </div>
              <div className="field-group">
                <label>Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="auth-select">
                  <option value="">Select gender</option>
                  {['Male','Female','Other','Prefer not to say'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" />
              </div>
              <div className="field-group">
                <label>State *</label>
                <select name="state" value={form.state} onChange={handleChange} className="auth-select">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>PIN Code *</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} />
              </div>
              <div className="field-group">
                <label>Country</label>
                <input name="country" value={form.country} onChange={handleChange} placeholder="India" />
              </div>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="step2-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setStep(1); setError(''); }}>← Back</button>
              <button className="btn btn-gold auth-submit" type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className="btn-spinner" /> : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account?{' '}<button className="auth-link" onClick={() => onNavigate('login')}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
