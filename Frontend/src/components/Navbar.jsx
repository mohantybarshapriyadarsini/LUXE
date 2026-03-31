import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ cartCount, wishlistCount, onNavigate }) {
  const { user, logout } = useAuth();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() { logout(); setProfileOpen(false); onNavigate('home'); }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">

        <button className="nav-logo" onClick={() => onNavigate('home')}>LUXE</button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {[['home','Home'],['products','Collections'],['trust','Why Trust Us'],['help','Help Center']].map(([pg, label]) => (
            <button key={pg} className="nav-link" onClick={() => { onNavigate(pg); setMenuOpen(false); }}>
              {label}<span className="nav-underline" />
            </button>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="nav-cta" onClick={() => onNavigate('products')}>Shop Now</button>

          {/* Wishlist */}
          <button className="icon-btn" onClick={() => onNavigate('wishlist')} aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
          </button>

          {/* Cart */}
          <button className="icon-btn" onClick={() => onNavigate('cart')} aria-label="Cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="profile-wrap" ref={profileRef}>
              <button className={`profile-btn ${profileOpen ? 'active' : ''}`} onClick={() => setProfileOpen(v => !v)}>
                <span className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="pd-header">
                    <div className="pd-avatar-lg">{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="pd-name">{user.name}</p>
                      <p className="pd-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="pd-actions">
                    {[['profile','My Profile'],['orders','My Orders'],['wishlist','Wishlist'],['help','Help Center']].map(([pg, label]) => (
                      <button key={pg} className="pd-action-btn" onClick={() => { onNavigate(pg); setProfileOpen(false); }}>{label}</button>
                    ))}
                    <button className="pd-logout-btn" onClick={handleLogout}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-signin-btn" onClick={() => onNavigate('login')}>Sign In</button>
          )}

          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
