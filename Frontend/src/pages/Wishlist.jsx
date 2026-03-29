import ProductCard from '../components/ProductCard';
import './Wishlist.css';

export default function Wishlist({ wishlist, onNavigate, onAddToCart, onToggleWishlist }) {
  return (
    <main className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Saved Items</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">My Wishlist</h1>
          <p className="page-sub">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <p>Your wishlist is empty.</p>
            <button className="btn btn-gold" onClick={() => onNavigate('products')}>Explore Collections</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <ProductCard key={product._id} product={product}
                onView={p => onNavigate('product', { productId: p._id })}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={() => true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
