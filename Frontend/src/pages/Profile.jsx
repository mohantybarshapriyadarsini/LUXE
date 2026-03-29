import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, addAddress, deleteAddress } from '../services/api';
import './Profile.css';

export default function Profile({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [tab, setTab]           = useState('info');
  const [form, setForm]         = useState({ name: '', phone: '' });
  const [pwForm, setPwForm]     = useState({ password: '', confirm: '' });
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
  const [msg, setMsg]           = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  async function handleUpdateInfo(e) {
    e.preventDefault(); setSaving(true); setMsg('');
    try { await updateProfile(form); await refreshUser(); setMsg('Profile updated!'); }
    catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) { setMsg('Passwords do not match.'); return; }
    setSaving(true); setMsg('');
    try { await updateProfile({ password: pwForm.password }); setMsg('Password updated!'); setPwForm({ password: '', confirm: '' }); }
    catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  async function handleAddAddress(e) {
    e.preventDefault(); setSaving(true); setMsg('');
    try { await addAddress(addrForm); await refreshUser(); setMsg('Address saved!'); setAddrForm({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '', isDefault: false }); }
    catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  async function handleDeleteAddress(id) {
    try { await deleteAddress(id); await refreshUser(); }
    catch (err) { setMsg(err.message); }
  }

  return (
    <main className="profile-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Account</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">My Profile</h1>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            <nav className="profile-nav">
              {[['info','Personal Info'],['password','Password'],['addresses','Addresses'],['orders','My Orders']].map(([t, label]) => (
                <button key={t} className={`profile-nav-btn ${tab === t ? 'active' : ''}`}
                  onClick={() => { if (t === 'orders') { onNavigate('orders'); return; } setTab(t); setMsg(''); }}>
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="profile-content">
            {msg && <div className="profile-msg">{msg}</div>}

            {tab === 'info' && (
              <form className="profile-form" onSubmit={handleUpdateInfo}>
                <h2>Personal Information</h2>
                {[['name','Full Name','text'],['phone','Phone Number','tel']].map(([field, label, type]) => (
                  <div key={field} className="field-group">
                    <label>{label}</label>
                    <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
                <div className="field-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="disabled-input" />
                </div>
                <button className="btn btn-gold" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            )}

            {tab === 'password' && (
              <form className="profile-form" onSubmit={handleUpdatePassword}>
                <h2>Change Password</h2>
                <div className="field-group">
                  <label>New Password</label>
                  <input type="password" value={pwForm.password} onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" />
                </div>
                <div className="field-group">
                  <label>Confirm Password</label>
                  <input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" />
                </div>
                <button className="btn btn-gold" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</button>
              </form>
            )}

            {tab === 'addresses' && (
              <div className="addresses-section">
                <h2>Saved Addresses</h2>
                {user?.addresses?.length > 0 ? (
                  <div className="addresses-list">
                    {user.addresses.map(addr => (
                      <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                        {addr.isDefault && <span className="default-badge">Default</span>}
                        <p className="addr-name">{addr.fullName}</p>
                        <p>{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                        <p>{addr.country}</p>
                        <p>{addr.phone}</p>
                        <button className="remove-btn" onClick={() => handleDeleteAddress(addr._id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="no-data">No saved addresses.</p>}

                <form className="profile-form addr-form" onSubmit={handleAddAddress}>
                  <h3>Add New Address</h3>
                  <div className="fields-row">
                    {[['fullName','Full Name'],['phone','Phone']].map(([f, l]) => (
                      <div key={f} className="field-group">
                        <label>{l}</label>
                        <input value={addrForm[f]} onChange={e => setAddrForm(p => ({ ...p, [f]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <div className="field-group">
                    <label>Street Address</label>
                    <input value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} />
                  </div>
                  <div className="fields-row">
                    {[['city','City'],['state','State'],['zipCode','ZIP'],['country','Country']].map(([f, l]) => (
                      <div key={f} className="field-group">
                        <label>{l}</label>
                        <input value={addrForm[f]} onChange={e => setAddrForm(p => ({ ...p, [f]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))} />
                    Set as default address
                  </label>
                  <button className="btn btn-gold" type="submit" disabled={saving} style={{ marginTop: '16px' }}>{saving ? 'Saving...' : 'Save Address'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
