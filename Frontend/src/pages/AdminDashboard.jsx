import { useState, useEffect } from 'react';
import {
  getAdminDashboard, getAdminOrders, updateOrderStatus,
  handleRefundAdmin, getAdminBuyers, sendTrackingMessage,
} from '../services/api';
import './AdminDashboard.css';

const STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled'];
const STATUS_COLORS  = { pending:'#d4af37', confirmed:'#4a9eff', shipped:'#9b59b6', delivered:'#27ae60', cancelled:'#e05555' };
const REFUND_COLORS  = { none:'', requested:'#d4af37', approved:'#27ae60', rejected:'#e05555' };

function authHeaders() {
  const token = localStorage.getItem('luxe_admin_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
}

// Override api.js headers for admin token
function setAdminToken() {
  window.__luxeAdminMode = true;
}

export default function AdminDashboard({ onNavigate }) {
  const adminUser = JSON.parse(localStorage.getItem('luxe_admin_user') || 'null');

  const [tab,       setTab]       = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [buyers,    setBuyers]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  // Message modal
  const [msgModal,  setMsgModal]  = useState(null); // { orderId, buyerEmail }
  const [msgText,   setMsgText]   = useState('');
  const [msgSent,   setMsgSent]   = useState('');

  // Status update
  const [statusModal, setStatusModal] = useState(null); // { orderId }
  const [newStatus,   setNewStatus]   = useState('');
  const [statusMsg,   setStatusMsg]   = useState('');
  const [updating,    setUpdating]    = useState(false);

  useEffect(() => {
    if (!adminUser) { onNavigate('login'); return; }
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const d = await fetchAdmin('/api/admin/dashboard');
        setDashboard(d);
      } else if (tab === 'orders') {
        const o = await fetchAdmin('/api/admin/orders');
        setOrders(o);
      } else if (tab === 'buyers') {
        const b = await fetchAdmin('/api/admin/buyers');
        setBuyers(b);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAdmin(path) {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('luxe_admin_token');
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }

  async function postAdmin(path, body) {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('luxe_admin_token');
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }

  async function putAdmin(path, body) {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('luxe_admin_token');
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }

  async function handleUpdateStatus() {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await putAdmin(`/api/admin/orders/${statusModal.orderId}/status`, {
        status: newStatus, message: statusMsg,
      });
      setStatusModal(null); setNewStatus(''); setStatusMsg('');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleSendMessage() {
    if (!msgText.trim()) return;
    try {
      await postAdmin('/api/admin/send-message', { orderId: msgModal.orderId, message: msgText });
      setMsgSent('Message sent successfully!');
      setTimeout(() => { setMsgModal(null); setMsgText(''); setMsgSent(''); }, 2000);
    } catch (err) {
      setMsgSent('Error: ' + err.message);
    }
  }

  async function handleRefund(orderId, action) {
    if (!confirm(`${action === 'approved' ? 'Approve' : 'Reject'} this refund?`)) return;
    try {
      await putAdmin(`/api/admin/orders/${orderId}/refund`, { action });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('luxe_admin_token');
    localStorage.removeItem('luxe_admin_user');
    onNavigate('login');
  }

  const filteredOrders = orders.filter(o =>
    o._id.toLowerCase().includes(search.toLowerCase()) ||
    o.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.buyer?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">LUXE <span>Admin</span></div>
        <div className="admin-user">
          <div className="admin-avatar">{adminUser?.name?.charAt(0) || 'A'}</div>
          <div>
            <p className="admin-name">{adminUser?.name}</p>
            <p className="admin-role">Super Admin</p>
          </div>
        </div>
        <nav className="admin-nav">
          {[
            ['dashboard', '📊', 'Dashboard'],
            ['orders',    '📦', 'Orders'],
            ['buyers',    '👥', 'Buyers'],
          ].map(([t, icon, label]) => (
            <button key={t} className={`admin-nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <button className="admin-logout" onClick={handleLogout}>Sign Out</button>
      </aside>

      {/* Main content */}
      <main className="admin-main">

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="admin-content">
            <h1 className="admin-title">Dashboard</h1>
            {loading ? <div className="admin-loading">Loading...</div> : dashboard && (
              <>
                <div className="stats-grid">
                  {[
                    { label: 'Total Orders',    value: dashboard.totalOrders,    icon: '📦', color: '#4a9eff' },
                    { label: 'Total Buyers',    value: dashboard.totalBuyers,    icon: '👥', color: '#27ae60' },
                    { label: 'Total Products',  value: dashboard.totalProducts,  icon: '🛍️', color: '#9b59b6' },
                    { label: 'Revenue (INR)',   value: `₹${(dashboard.totalRevenue||0).toLocaleString('en-IN')}`, icon: '💰', color: '#d4af37' },
                    { label: 'Pending Refunds', value: dashboard.pendingRefunds, icon: '↩', color: '#e05555' },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
                      <span className="stat-icon">{s.icon}</span>
                      <span className="stat-value">{s.value}</span>
                      <span className="stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="recent-orders">
                  <h2>Recent Orders</h2>
                  <table className="admin-table">
                    <thead>
                      <tr><th>Order ID</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {dashboard.recentOrders?.map(o => (
                        <tr key={o._id}>
                          <td className="order-id-cell">#{o._id.slice(-8).toUpperCase()}</td>
                          <td>{o.buyer?.name}<br /><span className="sub-text">{o.buyer?.email}</span></td>
                          <td>₹{(o.totalPriceINR||0).toLocaleString('en-IN')}</td>
                          <td><span className="status-pill" style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                          <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <h1 className="admin-title">All Orders</h1>
              <input className="admin-search" placeholder="Search by order ID, buyer name or email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <div className="admin-loading">Loading...</div> : (
              <div className="orders-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Buyer</th><th>Items</th>
                      <th>Amount</th><th>Status</th><th>Paid</th>
                      <th>Refund</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id}>
                        <td className="order-id-cell">#{order._id.slice(-8).toUpperCase()}<br />
                          <span className="sub-text">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </td>
                        <td>
                          <strong>{order.buyer?.name}</strong><br />
                          <span className="sub-text">{order.buyer?.email}</span><br />
                          <span className="sub-text">{order.buyer?.phone}</span>
                        </td>
                        <td>
                          {order.items?.map((item, i) => (
                            <div key={i} className="order-item-mini">
                              {item.name} × {item.qty}
                            </div>
                          ))}
                        </td>
                        <td>₹{(order.totalPriceINR||0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className="status-pill" style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.isPaid
                            ? <span className="paid-tag">✓ Paid</span>
                            : <span className="unpaid-tag">Unpaid</span>}
                        </td>
                        <td>
                          {order.refundStatus !== 'none' && (
                            <div>
                              <span style={{ color: REFUND_COLORS[order.refundStatus], fontSize: '11px' }}>
                                {order.refundStatus}
                              </span>
                              {order.refundStatus === 'requested' && (
                                <div className="refund-actions">
                                  <button className="btn-approve" onClick={() => handleRefund(order._id, 'approved')}>✓</button>
                                  <button className="btn-reject"  onClick={() => handleRefund(order._id, 'rejected')}>✕</button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn update-btn"
                              onClick={() => { setStatusModal({ orderId: order._id }); setNewStatus(order.status); setStatusMsg(''); }}>
                              📦 Update Status
                            </button>
                            <button className="action-btn msg-btn"
                              onClick={() => { setMsgModal({ orderId: order._id, buyerEmail: order.buyer?.email }); setMsgText(''); setMsgSent(''); }}>
                              ✉ Send Message
                            </button>
                          </div>
                          {order.trackingMessage && (
                            <p className="last-msg">Last: {order.trackingMessage.slice(0, 50)}...</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BUYERS ── */}
        {tab === 'buyers' && (
          <div className="admin-content">
            <div className="admin-content-header">
              <h1 className="admin-title">All Buyers</h1>
              <input className="admin-search" placeholder="Search buyers..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? <div className="admin-loading">Loading...</div> : (
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Addresses</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {buyers.filter(b =>
                    b.name.toLowerCase().includes(search.toLowerCase()) ||
                    b.email.toLowerCase().includes(search.toLowerCase())
                  ).map(buyer => (
                    <tr key={buyer._id}>
                      <td><strong>{buyer.name}</strong></td>
                      <td>{buyer.email}</td>
                      <td>{buyer.phone || '—'}</td>
                      <td>{buyer.addresses?.length || 0} saved</td>
                      <td>{new Date(buyer.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </main>

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div className="admin-modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button className="modal-close" onClick={() => setStatusModal(null)}>✕</button>
            </div>
            <div className="field-group">
              <label>New Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="field-group" style={{ marginTop: '16px' }}>
              <label>Tracking Message (optional — auto-generated if empty)</label>
              <textarea rows={3} value={statusMsg} onChange={e => setStatusMsg(e.target.value)}
                placeholder="e.g. Your order has been dispatched from our Mumbai warehouse..." />
            </div>
            <div className="modal-note">📧 An email notification will be sent to the buyer automatically.</div>
            <div className="modal-actions">
              <button className="btn btn-gold" onClick={handleUpdateStatus} disabled={updating}>
                {updating ? 'Updating...' : 'Update & Notify Buyer'}
              </button>
              <button className="btn btn-outline" onClick={() => setStatusModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Message Modal ── */}
      {msgModal && (
        <div className="admin-modal-overlay" onClick={() => setMsgModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Message to Buyer</h3>
              <button className="modal-close" onClick={() => setMsgModal(null)}>✕</button>
            </div>
            <p className="modal-note">📧 To: <strong>{msgModal.buyerEmail}</strong></p>
            <div className="field-group" style={{ marginTop: '16px' }}>
              <label>Message</label>
              <textarea rows={5} value={msgText} onChange={e => setMsgText(e.target.value)}
                placeholder="Type your message to the buyer..." />
            </div>
            {msgSent && <p className={`msg-feedback ${msgSent.includes('Error') ? 'error' : 'success'}`}>{msgSent}</p>}
            <div className="modal-actions">
              <button className="btn btn-gold" onClick={handleSendMessage}>Send Message</button>
              <button className="btn btn-outline" onClick={() => setMsgModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
