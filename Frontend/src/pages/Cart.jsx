import { useState } from 'react';
import { createOrder, verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { priceINR, toINR } from '../utils/currency';
import './Cart.css';

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Cart({ cart, onNavigate, onRemove, onUpdateQty, onClearCart }) {
  const { user } = useAuth();
  const [step,      setStep]      = useState('cart'); // cart | address | paying
  const [address,   setAddress]   = useState({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '' });
  const [placing,   setPlacing]   = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [error,     setError]     = useState('');

  const subtotal    = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const subtotalINR = toINR(subtotal);

  async function handlePayNow() {
    setPlacing(true); setError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setError('Failed to load Razorpay. Check your internet connection.'); setPlacing(false); return; }

      const items = cart.map(i => ({ product: i._id, name: i.name, image: i.image, brand: i.brand, price: i.price, qty: i.qty }));
      const { order, razorpayOrderId, razorpayKeyId, totalPriceINR } = await createOrder({
        items, shippingAddress: address, totalPrice: subtotal,
      });

      const options = {
        key:      razorpayKeyId,
        amount:   totalPriceINR * 100,
        currency: 'INR',
        name:     'LUXE',
        description: 'Authenticated Luxury Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name:    user.name,
          email:   user.email,
          contact: user.phone || address.phone,
        },
        theme: { color: '#d4af37' },
        handler: async function (response) {
          try {
            await verifyPayment(order._id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onClearCart();
            setOrderDone(order);
            setStep('done');
          } catch (err) {
            setError('Payment verification failed: ' + err.message);
          }
        },
        modal: {
          ondismiss: () => { setPlacing(false); setError('Payment cancelled.'); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (step === 'done') return (
    <main className="cart-page">
      <div className="container">
        <div className="order-success">
          <span className="success-icon">✦</span>
          <h2>Payment Successful!</h2>
          <p className="order-id-text">Order ID: <strong>{orderDone._id}</strong></p>
          <p>Your payment was processed securely via Razorpay. We'll notify you once your order is confirmed and shipped.</p>
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
              <button className="btn btn-gold rzp-btn" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { if (!user) { onNavigate('login'); return; } setStep('address'); }}>
                <img src="https://razorpay.com/favicon.ico" width="16" height="16" alt="" />
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
            <div className="address-form">
              <h2>Shipping Address</h2>
              {[
                ['fullName','Full Name'],['phone','Phone'],['street','Street Address'],
                ['city','City'],['state','State'],['zipCode','PIN Code'],['country','Country'],
              ].map(([field, label]) => (
                <div key={field} className="field-group">
                  <label>{label}</label>
                  <input
                    value={address[field]}
                    onChange={e => setAddress(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={label}
                  />
                </div>
              ))}
              {error && <p className="checkout-error">{error}</p>}
              <div className="checkout-actions">
                <button className="btn btn-gold rzp-btn" onClick={handlePayNow} disabled={placing}>
                  <img src="https://razorpay.com/favicon.ico" width="16" height="16" alt="" />
                  {placing ? 'Opening Razorpay...' : `Pay ${priceINR(subtotal)}`}
                </button>
                <button className="btn btn-outline" onClick={() => setStep('cart')}>Back to Cart</button>
              </div>
              <div className="razorpay-note">
                🔒 Secured by <strong>Razorpay</strong> — UPI, Cards, Net Banking, Wallets accepted
              </div>
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              {cart.map(i => (
                <div key={i._id} className="summary-item">
                  <span>{i.name} × {i.qty}</span>
                  <span>{priceINR(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="summary-row summary-total" style={{ marginTop: '16px' }}>
                <span>Total</span>
                <span>{priceINR(subtotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
