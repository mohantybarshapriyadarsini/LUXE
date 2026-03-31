import { useState } from 'react';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { priceINR, toINR } from '../utils/currency';
import './Cart.css';

const RAZORPAY_KEY_ID = 'rzp_test_SXij1zXDGrKPrt'; // only key ID in frontend, secret stays in backend

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Pay Now (Razorpay)', icon: '💳', desc: 'Pay securely via UPI, Cards, Net Banking, Wallets.' },
  { id: 'cod',  label: 'Cash on Delivery',        icon: '💵', desc: 'Pay in cash when your order arrives at your doorstep.' },
  { id: 'upi',  label: 'UPI Transfer',             icon: '📱', desc: 'Pay via UPI and enter your transaction reference number.', info: 'UPI ID: luxe@ybl' },
  { id: 'bank', label: 'Bank Transfer (NEFT/IMPS)',icon: '🏦', desc: 'Transfer to our bank account and enter the UTR number.', info: 'Bank: HDFC Bank\nAccount Name: LUXE Pvt Ltd\nAccount No: 50100123456789\nIFSC: HDFC0001234\nBranch: Mumbai' },
];

export default function Cart({ cart, onNavigate, onRemove, onUpdateQty, onClearCart }) {
  const { user } = useAuth();
  const [step,          setStep]          = useState('cart');
  const [address,       setAddress]       = useState({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentRef,    setPaymentRef]    = useState('');
  const [placing,       setPlacing]       = useState(false);
  const [orderDone,     setOrderDone]     = useState(null);
  const [error,         setError]         = useState('');

  const subtotal    = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const subtotalINR = toINR(subtotal);

  async function handlePlaceOrder() {
    if (paymentMethod !== 'cod' && paymentMethod !== 'razorpay' && !paymentRef.trim()) {
      setError('Please enter your UPI transaction ID or bank UTR number.'); return;
    }
    setPlacing(true); setError('');

    // ── RAZORPAY FLOW ──
    if (paymentMethod === 'razorpay') {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) { setError('Failed to load Razorpay. Check your internet.'); setPlacing(false); return; }

        const items = cart.map(i => ({ product: i._id, name: i.name, image: i.image, brand: i.brand, price: i.price, qty: i.qty }));
        const { orderId, razorpayOrderId, razorpayKeyId, totalPriceINR } = await createRazorpayOrder({
          items, shippingAddress: address, totalPrice: subtotal,
        });

        const options = {
          key:         razorpayKeyId,
          amount:      totalPriceINR * 100,
          currency:    'INR',
          name:        'LUXE',
          description: 'Authenticated Luxury Purchase',
          order_id:    razorpayOrderId,
          prefill:     { name: user.name, email: user.email, contact: address.phone },
          theme:       { color: '#d4af37' },
          handler: async function (response) {
            try {
              await verifyRazorpayPayment({
                orderId,
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              console.log('✅ Payment successful:', response.razorpay_payment_id);
              onClearCart();
              setOrderDone({ _id: orderId });
              setStep('done');
            } catch (err) {
              console.log('❌ Payment verification failed:', err.message);
              setError('Payment Failed: ' + err.message);
            }
            setPlacing(false);
          },
          modal: {
            ondismiss: () => { setError('Payment cancelled.'); setPlacing(false); },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.log('❌ Payment failed:', response.error);
          setError('Payment Failed: ' + response.error.description);
          setPlacing(false);
        });
        rzp.open();
      } catch (err) {
        setError(err.message);
        setPlacing(false);
      }
      return; // stop here for razorpay
    }

    // ── EXISTING COD / UPI / BANK FLOW (unchanged) ──
    try {
      const items = cart.map(i => ({ product: i._id, name: i.name, image: i.image, brand: i.brand, price: i.price, qty: i.qty }));
      const { order } = await createOrder({
        items,
        shippingAddress: address,
        totalPrice:      subtotal,
        paymentMethod,
        paymentDetails:  paymentRef,
      });
      onClearCart();
      setOrderDone(order);
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  // ── Order Success ──
  if (step === 'done') return (
    <main className="cart-page">
      <div className="container">
        <div className="order-success">
          <span className="success-icon">✦</span>
          <h2>Order Placed Successfully!</h2>
          <p className="order-id-text">Order ID: <strong>#{orderDone._id.slice(-8).toUpperCase()}</strong></p>

          {paymentMethod === 'razorpay' && (
            <div className="payment-success-note upi">
              <span>💳</span>
              <div>
                <strong>Payment Successful</strong>
                <p>Your Razorpay payment was verified and confirmed. Your order is being prepared.</p>
              </div>
            </div>
          )}
          {paymentMethod === 'cod' && (
            <div className="payment-success-note cod">
              <span>💵</span>
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay <strong>{priceINR(subtotal)}</strong> when your order arrives. Our delivery partner will collect the amount.</p>
              </div>
            </div>
          )}
          {paymentMethod === 'upi' && (
            <div className="payment-success-note upi">
              <span>📱</span>
              <div>
                <strong>UPI Payment Submitted</strong>
                <p>Transaction Ref: <strong>{paymentRef}</strong></p>
                <p>Our team will verify your payment within 2–4 hours and confirm your order.</p>
              </div>
            </div>
          )}
          {paymentMethod === 'bank' && (
            <div className="payment-success-note bank">
              <span>🏦</span>
              <div>
                <strong>Bank Transfer Submitted</strong>
                <p>UTR Number: <strong>{paymentRef}</strong></p>
                <p>Our team will verify your transfer within 4–8 hours and confirm your order.</p>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button className="btn btn-gold"    onClick={() => onNavigate('orders')}>View My Orders</button>
            <button className="btn btn-outline" onClick={() => onNavigate('products')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main className="cart-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Your Bag</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button className="btn btn-gold" onClick={() => onNavigate('products')}>Explore Collections</button>
          </div>

        ) : step === 'cart' ? (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <p className="cart-item-brand">{item.brand}</p>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-auth">✦ Authenticated</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-stepper">
                      <button onClick={() => onUpdateQty(item._id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(item._id, item.qty + 1)}>+</button>
                    </div>
                    <p className="cart-item-price">{priceINR(item.price * item.qty)}</p>
                    <button className="remove-btn" onClick={() => onRemove(item._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-row"><span>Subtotal</span><span>{priceINR(subtotal)}</span></div>
              <div className="summary-row"><span>Shipping</span><span>Free</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>Included</span></div>
              <div className="summary-row summary-total"><span>Total</span><span>{priceINR(subtotal)}</span></div>
              <div className="summary-auth-note">✦ All items are certified authentic and insured during shipping.</div>
              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { if (!user) { onNavigate('login'); return; } setStep('checkout'); }}>
                Proceed to Checkout
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                onClick={() => onNavigate('products')}>
                Continue Shopping
              </button>
            </div>
          </div>

        ) : (
          <div className="checkout-layout">
            <div className="checkout-left">

              {/* Shipping Address */}
              <div className="checkout-section">
                <h2>Shipping Address</h2>
                <div className="address-grid">
                  {[
                    ['fullName','Full Name'],['phone','Phone'],
                    ['street','Street Address'],['city','City'],
                    ['state','State'],['zipCode','PIN Code'],['country','Country'],
                  ].map(([field, label]) => (
                    <div key={field} className={`field-group ${field === 'street' ? 'full-width' : ''}`}>
                      <label>{label}</label>
                      <input value={address[field]}
                        onChange={e => setAddress(p => ({ ...p, [field]: e.target.value }))}
                        placeholder={label} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h2>Payment Method</h2>
                <div className="payment-options">
                  {PAYMENT_METHODS.map(method => (
                    <div
                      key={method.id}
                      className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => { setPaymentMethod(method.id); setPaymentRef(''); setError(''); }}
                    >
                      <div className="payment-option-header">
                        <span className="payment-icon">{method.icon}</span>
                        <div>
                          <p className="payment-label">{method.label}</p>
                          <p className="payment-desc">{method.desc}</p>
                        </div>
                        <div className={`payment-radio ${paymentMethod === method.id ? 'active' : ''}`} />
                      </div>

                      {/* Bank / UPI details shown when selected */}
                      {paymentMethod === method.id && method.info && (
                        <div className="payment-info-box">
                          <pre>{method.info}</pre>
                          <p className="payment-info-note">
                            Transfer exactly <strong>{priceINR(subtotal)}</strong> and enter your reference below.
                          </p>
                        </div>
                      )}

                      {/* Reference input for UPI / Bank */}
                      {paymentMethod === method.id && method.id !== 'cod' && (
                        <div className="field-group" style={{ marginTop: '12px' }}>
                          <label>{method.id === 'upi' ? 'UPI Transaction ID' : 'Bank UTR / Reference Number'}</label>
                          <input
                            value={paymentRef}
                            onChange={e => setPaymentRef(e.target.value)}
                            placeholder={method.id === 'upi' ? 'e.g. 123456789012' : 'e.g. HDFC12345678'}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="checkout-error">{error}</p>}

              <div className="checkout-actions">
                <button className="btn btn-gold" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? 'Placing Order...' : `Place Order — ${priceINR(subtotal)}`}
                </button>
                <button className="btn btn-outline" onClick={() => setStep('cart')}>Back to Cart</button>
              </div>

              <div className="secure-note">🔒 Your order and personal details are fully secured and encrypted.</div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              {cart.map(i => (
                <div key={i._id} className="summary-item">
                  <span>{i.name} × {i.qty}</span>
                  <span>{priceINR(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="summary-row" style={{ marginTop: '12px' }}><span>Shipping</span><span>Free</span></div>
              <div className="summary-row summary-total"><span>Total</span><span>{priceINR(subtotal)}</span></div>
              <div className="selected-payment-badge">
                {selectedMethod?.icon} {selectedMethod?.label}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
