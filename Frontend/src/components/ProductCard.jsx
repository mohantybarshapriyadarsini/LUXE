import { priceINR } from '../utils/currency';
import './ProductCard.css';

export default function ProductCard({ product, onView, onAddToCart, onToggleWishlist, isInWishlist }) {
  const wished = isInWishlist?.(product._id);

  return (
    <div className="product-card">
      <span className="auth-badge">✦ Authenticated</span>

      {onToggleWishlist && (
        <button
          className={`wishlist-btn ${wished ? 'wished' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          aria-label="Toggle wishlist"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      )}

      <div className="card-img" onClick={() => onView(product)}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>

      <div className="card-body">
        <p className="card-brand">{product.brand}</p>
        <h3 className="card-name" onClick={() => onView(product)}>{product.name}</h3>
        {product.rating > 0 && (
          <div className="card-rating">
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
            <span>({product.numReviews})</span>
          </div>
        )}
        <p className="card-price">{priceINR(product.price)}</p>
        <button className="btn btn-outline card-cta" onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}
