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
import './index.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [page,      setPage]      = useState('home');
  const [pageProps, setPageProps] = useState({});
  const [cart,      setCart]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('luxe_cart')) || []; } catch { return []; }
  });
  const [wishlist,  setWishlist]  = useState([]);

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
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) { setCart(prev => prev.filter(i => i._id !== id)); }

  function updateQty(id, qty) {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  }

  function clearCart() { setCart([]); }

  function toggleWishlist(product) {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id);
      return exists ? prev.filter(p => p._id !== product._id) : [...prev, product];
    });
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
      case 'help':     return <HelpCenter onNavigate={navigate} />;
      case 'home':
      default:         return <Home onNavigate={navigate} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isInWishlist={isInWishlist} />;
    }
  }

  const hideFooter = ['login', 'signup'].includes(page);

  return (
    <>
      <Navbar cartCount={cartCount} wishlistCount={wishlist.length} onNavigate={navigate} />
      {renderPage()}
      {!hideFooter && <Footer onNavigate={navigate} />}
    </>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
