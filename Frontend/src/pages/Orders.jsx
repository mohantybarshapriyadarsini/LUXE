import { useState, useEffect } from 'react';
import { getMyOrders, requestRefund } from '../services/api';
import { priceINR } from '../utils/currency';
import './Orders.css';

const STATUS_COLORS = {
  pending:   '#d4af37',
  confirmed: '#4a9eff',
  shipped:   '#9b59b6',
  delivered: '#27ae60',
  cancelled: '#e05555',
};

const REFUND_COLORS = {
  none:      '',
  requested: '#d4af37',
  approved:  '#27ae60',
  rejected:  '#e05555',
};

export default function Orders({ onNavigate }) {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refundModal,  setRefundModal]  = useState(null); // orderId
  const [refundReason, setRefundReason] = useState('');
  const [refunding,    setRefunding]    = useState(false);
  const [refundMsg,    setRefundMsg]    = useState('');

  useEffect(() => {
    getMyOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  async function handleRefundSubmit(e) {
    e.preventDefault();
    if (!refundReason.trim()) return;
    setRefunding(true); setRefundMsg('');
    try {
      await requestRefund(refundModal, refundReason);
      setRefundMsg('Refund request submitted successfully!');
      const updated = await getMyOrders();
      setOrders(updated);
      setTimeout(() => { setRefundModal(null); setRefundReason(''); setRefundMsg(''); }, 2000);
    } catch (err) {
      setRefundMsg(err.message);
    } finally {
      setRefunding(false);
    }
  }

  if (loading) return (
    <main className="orders-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Purchases</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">My Orders</h1>
        </div>
        <div className="orders-skeleton">
          {[...Array(3)].map((_, i) => <div key={i} className="order-skeleton" />)}
        </div>
      </div>
    </main>
  );

  return (
    <main className="orders-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Purchases</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">My Orders</h1>
          <p className="page-sub">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet.</p>
            <button className="btn btn-gold" onClick={() => onNavigate('products')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">

                {/* Header */}
                <div className="order-header">
                  <div>
                    <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="order-badges">
                    <span className="order-status" style={{ color: STATUS_COLORS[order.status] }}>
                      ● {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.isPaid && <span className="paid-badge">✓ Paid</span>}
                    {order.refundStatus !== 'none' && (
                      <span className="refund-badge" style={{ color: REFUND_COLORS[order.refundStatus] }}>
                        Refund: {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="order-item-brand">{item.brand}</p>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.qty}</p>
                      </div>
                      <p className="order-item-price">
                        {item.priceINR
                          ? priceINR(item.price * item.qty)
                          : priceINR(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="order-footer">
                  <div className="order-address">
                    <p className="addr-label">Shipped to</p>
                    <p>{order.shippingAddress?.fullName}, {order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                  </div>
                  <div className="order-footer-right">
                    <div className="order-total">
                      <span>Total</span>
                      <span className="total-amount">
                        {order.totalPriceINR ? `₹${order.totalPriceINR.toLocaleString('en-IN')}` : priceINR(order.totalPrice)}
                      </span>
                    </div>
                    {order.isPaid && order.refundStatus === 'none' && order.status !== 'cancelled' && (
                      <button
                        className="refund-btn"
                        onClick={() => { setRefundModal(order._id); setRefundMsg(''); }}
                      >
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking History */}
                {order.trackingHistory?.length > 0 && (
                  <div className="tracking-history">
                    <p className="tracking-label">📦 Tracking History</p>
                    {order.trackingHistory.slice().reverse().map((t, i) => (
                      <div key={i} className="tracking-entry">
                        <span className="tracking-status">{t.status}</span>
                        <span className="tracking-msg">{t.message}</span>
                        <span className="tracking-time">{new Date(t.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="modal-overlay" onClick={() => setRefundModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Refund</h3>
              <button className="modal-close" onClick={() => setRefundModal(null)}>✕</button>
            </div>
            <p className="modal-sub">Please describe your reason for requesting a refund. Our team will review within 2–3 business days.</p>
            <form onSubmit={handleRefundSubmit}>
              <div className="field-group">
                <label>Reason for Refund</label>
                <textarea
                  rows={4}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g. Item not as described, damaged on arrival..."
                  required
                />
              </div>
              {refundMsg && (
                <p className={`refund-msg ${refundMsg.includes('success') ? 'success' : 'error'}`}>
                  {refundMsg}
                </p>
              )}
              <div className="modal-actions">
                <button className="btn btn-gold" type="submit" disabled={refunding}>
                  {refunding ? 'Submitting...' : 'Submit Request'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setRefundModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
