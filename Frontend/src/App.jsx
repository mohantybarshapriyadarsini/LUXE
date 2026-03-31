import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import HelpCenter from './pages/HelpCenter';
import Trust from './pages/Trust';
import AdminDashboard from './pages/AdminDashboard';
import BrandRegister from './pages/BrandRegister';
import LiveActivityFeed from './components/LiveActivityFeed';
import Toast from './components/Toast';
import './index.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [page,      setPage]      = useState('home');
  const [pageProps, setPageProps] = useState({});
  const [cart,      setCart]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('luxe_cart')) || []; } catch { return []; }
  });
  const [wishlist,  setWishlist]  = useState([]);
  const [toasts,     setToasts]    = useState([]);

  function showToast({ type, icon, title, sub }) {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, icon, title, sub }]);
    setTimeout(() => removeToast(id), 3500);
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
  }, [cart]);

  function navigate(target, props = {}) {
    const protectedPages = ['wishlist', 'profile', 'orders'];
    if (protectedPages.includes(target) && !user) {
      setPage('login'); setPageProps({}); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    setPage(target); setPageProps(props); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addToCart(product) {
    const existing = cart.find(i => i._id === product._id);
    if (existing) {
      showToast({ type: 'cart', icon: '🛍️', title: 'Already in Cart', sub: `${product.name} quantity updated.` });
      setCart(prev => prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      showToast({ type: 'cart', icon: '🛍️', title: 'Added to Cart', sub: product.name });
      setCart(prev => [...prev, { ...product, qty: 1 }]);
    }
  }

  function removeFromCart(id) { setCart(prev => prev.filter(i => i._id !== id)); }

  function updateQty(id, qty) {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  }

  function clearCart() { setCart([]); }

  function toggleWishlist(product) {
    const exists = wishlist.find(p => p._id === product._id);
    if (exists) {
      showToast({ type: 'wishlist-remove', icon: '🤍', title: 'Removed from Wishlist', sub: product.name });
      setWishlist(prev => prev.filter(p => p._id !== product._id));
    } else {
      showToast({ type: 'wishlist-add', icon: '♥️', title: 'Added to Wishlist', sub: product.name });
      setWishlist(prev => [...prev, product]);
    }
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const isInWishlist = (id) => wishlist.some(p => p._id === id);

  if (loading) return null;

  function renderPage() {
    switch (page) {
      case 'login':    return <Login onNavigate={navigate} />;
      case 'signup':   return <Signup onNavigate={navigate} />;
      case 'products': return <Products onNavigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} initialBrand={pageProps.brand} initialCategory={pageProps.category} />;
      case 'product':  return <ProductDetail productId={pageProps.productId} onNavigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} />;
      case 'cart':     return <Cart cart={cart} onNavigate={navigate} onRemove={removeFromCart} onUpdateQty={updateQty} onClearCart={clearCart} />;
      case 'wishlist': return <Wishlist wishlist={wishlist} onNavigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} />;
      case 'profile':  return <Profile onNavigate={navigate} />;
      case 'orders':   return <Orders onNavigate={navigate} />;
      case 'help':           return <HelpCenter onNavigate={navigate} />;
      case 'trust':           return <Trust onNavigate={navigate} />;
      case 'admin':           return <AdminDashboard onNavigate={navigate} />;
      case 'brand-register':  return <BrandRegister onNavigate={navigate} />;
      case 'home':
      default:         return <Home onNavigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} />;
    }
  }

  const hideFooter = ['login', 'signup', 'admin'].includes(page);

  return (
    <>
      {page !== 'admin' && <Navbar cartCount={cartCount} wishlistCount={wishlist.length} onNavigate={navigate} />}
      {renderPage()}
      {!hideFooter && <Footer onNavigate={navigate} />}
      {page !== 'admin' && <LiveActivityFeed />}
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
