import { useState } from 'react';
import { registerBrand } from '../services/api';
import './AuthPages.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GST_RE   = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_RE   = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const CATEGORIES = ['Fashion','Jewellery','Accessories','Beauty','Footwear','Watches','Electronics','Other'];
const EMP_RANGES = ['1–10','11–50','51–200','201–500','500+'];

export default function BrandRegister({ onNavigate }) {
  const [step,    setStep]    = useState(1); // 1=personal, 2=brand info, 3=legal & social
  const [form,    setForm]    = useState({
    // Personal
    name: '', email: '', phone: '', password: '', confirmPassword: '', designation: '',
    // Brand Info
    brandName: '', category: 'Fashion', location: '', city: '', state: '', country: 'India',
    pincode: '', annualRevenue: '', brandValuation: '', establishedYear: '', numEmployees: '',
    description: '', website: '',
    // Legal & Social
    gstNumber: '', panNumber: '', instagram: '', facebook: '', twitter: '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); }

  function validateStep1() {
    if (!form.name.trim())          return 'Full name is required.';
    if (!EMAIL_RE.test(form.email)) return 'Enter a valid email address.';
    if (!form.phone.trim())         return 'Phone number is required.';
    if (form.password.length < 6)   return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  }

  function validateStep2() {
    if (!form.brandName.trim())    return 'Brand name is required.';
    if (!form.location.trim())     return 'Brand location is required.';
    if (!form.city.trim())         return 'City is required.';
    if (!form.annualRevenue)       return 'Annual revenue is required.';
    if (Number(form.annualRevenue) < 0) return 'Annual revenue cannot be negative.';
    if (!form.establishedYear)     return 'Established year is required.';
    const yr = Number(form.establishedYear);
    if (yr < 1800 || yr > new Date().getFullYear()) return 'Enter a valid established year.';
    if (!form.description.trim())  return 'Brand description is required.';
    return null;
  }

  function validateStep3() {
    if (form.gstNumber && !GST_RE.test(form.gstNumber.toUpperCase()))
      return 'Enter a valid GST number (e.g. 22AAAAA0000A1Z5).';
    if (form.panNumber && !PAN_RE.test(form.panNumber.toUpperCase()))
      return 'Enter a valid PAN number (e.g. ABCDE1234F).';
    return null;
  }

  function goNext(e) {
    e.preventDefault();
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) { setError(err); return; }
    setError(''); setStep(s => s + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validateStep3();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await registerBrand({
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, designation: form.designation,
        brandInfo: {
          brandName:       form.brandName,
          category:        form.category,
          location:        form.location,
          city:            form.city,
          state:           form.state,
          country:         form.country,
          pincode:         form.pincode,
          annualRevenue:   Number(form.annualRevenue),
          brandValuation:  Number(form.brandValuation) || 0,
          establishedYear: Number(form.establishedYear),
          numEmployees:    form.numEmployees,
          description:     form.description,
          website:         form.website,
          gstNumber:       form.gstNumber.toUpperCase(),
          panNumber:       form.panNumber.toUpperCase(),
          instagram:       form.instagram,
          facebook:        form.facebook,
          twitter:         form.twitter,
        },
      });
      setSuccess('Brand registered successfully! You can now sign in using the Brand tab.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up">
        <div className="auth-success-screen">
          <span className="success-icon">✦</span>
          <h2>Brand Registered!</h2>
          <p>{success}</p>
          <button className="btn btn-gold" onClick={() => onNavigate('login')}>Sign In as Brand</button>
        </div>
      </div>
    </div>
  );

  const STEP_LABELS = ['Personal Info', 'Brand Details', 'Legal & Social'];

  return (
    <div className="auth-page">
      <div className="auth-card anim-fade-up" style={{ maxWidth: '680px' }}>
        <div className="auth-header">
          <p className="section-label">Join LUXE as a Brand</p>
          <div className="divider" />
          <h1 className="auth-title">Register Brand</h1>
          <p className="auth-sub">Step {step} of 3 — {STEP_LABELS[step - 1]}</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {[1,2,3].map((s, i) => (
            <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
              {i < 2 && <div className={`step-line ${step > s ? 'active' : ''}`} />}
            </span>
          ))}
        </div>

        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={goNext} noValidate>
            <div className="fields-row">
              <div className="field-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
              </div>
              <div className="field-group">
                <label>Designation</label>
                <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. CEO, Manager" />
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
              </div>
              <div className="field-group">
                <label>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="brand@example.com" />
              </div>
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

        {/* ── STEP 2: Brand Details ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={goNext} noValidate>
            <div className="fields-row">
              <div className="field-group">
                <label>Brand Name *</label>
                <input name="brandName" value={form.brandName} onChange={handleChange} placeholder="e.g. Maison Luxe" />
              </div>
              <div className="field-group">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="auth-select">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label>Brand Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your brand, products, and what makes it unique..." rows={3}
                className="auth-textarea" />
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Headquarters Location *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, India" />
              </div>
              <div className="field-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>State</label>
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" />
              </div>
              <div className="field-group">
                <label>PIN Code</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit PIN" maxLength={6} />
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Annual Revenue (USD) *</label>
                <input type="number" name="annualRevenue" value={form.annualRevenue} onChange={handleChange} placeholder="e.g. 300000000" min="0" />
                <span className="field-hint">≥ $284M = Certified LUXE Brand ✦</span>
              </div>
              <div className="field-group">
                <label>Brand Valuation (USD)</label>
                <input type="number" name="brandValuation" value={form.brandValuation} onChange={handleChange} placeholder="e.g. 500000000" min="0" />
              </div>
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Established Year *</label>
                <input type="number" name="establishedYear" value={form.establishedYear} onChange={handleChange} placeholder="e.g. 1990" min="1800" max={new Date().getFullYear()} />
              </div>
              <div className="field-group">
                <label>Number of Employees</label>
                <select name="numEmployees" value={form.numEmployees} onChange={handleChange} className="auth-select">
                  <option value="">Select range</option>
                  {EMP_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label>Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://yourbrand.com" />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="step2-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setStep(1); setError(''); }}>← Back</button>
              <button className="btn btn-gold auth-submit" type="submit" style={{ flex: 1 }}>Continue →</button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Legal & Social ── */}
        {step === 3 && (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="fields-divider"><span>Legal Information (Optional)</span></div>
            <div className="fields-row">
              <div className="field-group">
                <label>GST Number</label>
                <input name="gstNumber" value={form.gstNumber} onChange={handleChange}
                  placeholder="e.g. 22AAAAA0000A1Z5" maxLength={15}
                  style={{ textTransform: 'uppercase' }} />
                <span className="field-hint">15-character GST identification number</span>
              </div>
              <div className="field-group">
                <label>PAN Number</label>
                <input name="panNumber" value={form.panNumber} onChange={handleChange}
                  placeholder="e.g. ABCDE1234F" maxLength={10}
                  style={{ textTransform: 'uppercase' }} />
                <span className="field-hint">10-character PAN card number</span>
              </div>
            </div>

            <div className="fields-divider"><span>Social Media (Optional)</span></div>
            <div className="field-group">
              <label>Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/yourbrand" />
            </div>
            <div className="fields-row">
              <div className="field-group">
                <label>Facebook</label>
                <input name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/yourbrand" />
              </div>
              <div className="field-group">
                <label>Twitter / X</label>
                <input name="twitter" value={form.twitter} onChange={handleChange} placeholder="https://twitter.com/yourbrand" />
              </div>
            </div>

            <div className="auth-info-note" style={{ marginTop: '8px' }}>
              ✦ By registering, you agree to LUXE's brand verification process. Brands with annual revenue ≥ $284M USD receive Certified LUXE Brand status.
            </div>

            {error && <p className="auth-error">{error}</p>}
            <div className="step2-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setStep(2); setError(''); }}>← Back</button>
              <button className="btn btn-gold auth-submit" type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className="btn-spinner" /> : 'Register Brand ✦'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>Already registered?{' '}<button className="auth-link" onClick={() => onNavigate('login')}>Sign in</button></p>
        </div>
      </div>
    </div>
  );
}
