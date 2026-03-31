import { useState, useEffect } from 'react';
import { getFeaturedProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const BRANDS = ['Louis Vuitton', 'Chanel', 'Hermès', 'Rolex', 'Gucci', 'Prada'];

export default function Home({ onNavigate, onAddToCart, onToggleWishlist, isInWishlist }) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getFeaturedProducts().then(setFeatured).catch(() => {});
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-overlay-gradient" />
        <div className="hero-content">
          <p className="section-label anim-fade-up">100% Authenticated Luxury</p>
          <div className="divider anim-fade-up anim-delay-1" />
          <h1 className="hero-title anim-fade-up anim-delay-1">Where Luxury<br /><em>Meets Certainty</em></h1>
          <p className="hero-sub anim-fade-up anim-delay-2">Every piece on LUXE is verified authentic by certified experts. No fakes. No compromises.</p>
          <div className="hero-actions anim-fade-up anim-delay-3">
            <button className="btn btn-gold" onClick={() => onNavigate('products')}>Shop Collections</button>
            <button className="btn btn-outline" onClick={() => onNavigate('help')}>Learn More</button>
          </div>
        </div>
        <div className="hero-side-text anim-fade-in anim-delay-4">AUTHENTICATED · VERIFIED · GENUINE · LUXE</div>
        <div className="scroll-indicator anim-fade-in anim-delay-4"><span /></div>
      </section>

      <section className="trust-bar">
        <div className="container trust-inner">
          {['Expert Authentication','Certificate of Authenticity','Insured Worldwide Shipping','14-Day Returns'].map((item, i) => (
            <div key={i} className="trust-item"><span className="trust-icon">✦</span><span>{item}</span></div>
          ))}
        </div>
      </section>

      <section className="brands-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Our Brands</p>
          <div className="divider" />
          <div className="brands-strip">
            {BRANDS.map(brand => (
              <button key={brand} className="brand-pill" onClick={() => onNavigate('products', { brand })}>{brand}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Featured Pieces</p>
          <div className="divider" />
          <h2 className="section-title">Curated for You</h2>
          {featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(product => (
                <ProductCard key={product._id} product={product}
                  onView={p => onNavigate('product', { productId: p._id })}
                  onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isInWishlist={isInWishlist} />
              ))}
            </div>
          ) : (
            <div className="products-grid skeleton-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '56px' }}>
            <button className="btn btn-outline" onClick={() => onNavigate('products')}>View All Collections</button>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Shop by Category</p>
          <div className="divider" />
          <div className="categories-grid">
            {[['Handbags','👜'],['Watches','⌚'],['Jewellery','💎'],['Shoes','👠'],['Accessories','🧣'],['Electronics','🔌']].map(([cat, icon]) => (
              <button key={cat} className="category-card" onClick={() => onNavigate('products', { category: cat })}>
                <span className="cat-icon">{icon}</span>
                <span className="cat-name">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="promise-section">
        <div className="container promise-inner">
          <div className="promise-text">
            <p className="section-label">Our Promise</p>
            <div className="divider" style={{ margin: '16px 0' }} />
            <h2>Zero Tolerance<br />for Fakes</h2>
            <p>Every item listed on LUXE undergoes a rigorous multi-point authentication process by our team of certified luxury goods experts.</p>
            <p style={{ marginTop: '16px' }}>If an item ever fails authentication after purchase, we offer a full refund — no questions asked.</p>
            <button className="btn btn-outline" style={{ marginTop: '32px' }} onClick={() => onNavigate('trust')}>See How We Authenticate →</button>
          </div>
          <div className="promise-stats">
            {[['100%','Authenticated'],['50+','Luxury Brands'],['0','Counterfeits']].map(([num, label]) => (
              <div key={label} className="stat"><span className="stat-num">{num}</span><span className="stat-label">{label}</span></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
