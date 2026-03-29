import { useState, useEffect } from 'react';
import { getProductById, addReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { priceINR } from '../utils/currency';
import './ProductDetail.css';

export default function ProductDetail({ productId, onNavigate, onAddToCart, onToggleWishlist, isInWishlist }) {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    getProductById(productId).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [productId]);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    setSubmitting(true);
    try {
      await addReview(productId, reviewForm);
      setReviewMsg('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      const updated = await getProductById(productId);
      setProduct(updated);
    } catch (err) {
      setReviewMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="detail-page"><div className="container"><div className="detail-skeleton" /></div></main>;

  if (!product) return (
    <main className="detail-page">
      <div className="container">
        <p>Product not found.</p>
        <button className="btn btn-outline" onClick={() => onNavigate('products')}>Back to Collections</button>
      </div>
    </main>
  );

  const wished = isInWishlist?.(product._id);

  return (
    <main className="detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <button onClick={() => onNavigate('home')}>Home</button>
          <span>/</span>
          <button onClick={() => onNavigate('products')}>Collections</button>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-img">
            <img src={product.image} alt={product.name} />
            <div className="detail-auth-badge"><span>✦</span><span>Certified Authentic</span></div>
          </div>

          <div className="detail-info">
            <p className="detail-brand">{product.brand}</p>
            <h1 className="detail-name">{product.name}</h1>
            <p className="detail-category">{product.category}</p>

            {product.numReviews > 0 && (
              <div className="detail-rating">
                <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
                <span className="review-count">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            <div className="detail-price">{priceINR(product.price)}</div>
            <p className="detail-desc">{product.description}</p>

            <ul className="auth-list">
              <li>✦ Expert-verified authenticity</li>
              <li>✦ Certificate of Authenticity included</li>
              <li>✦ Original packaging where available</li>
              <li>✦ Insured worldwide shipping</li>
            </ul>

            <div className="detail-actions">
              <button className="btn btn-gold" onClick={() => onAddToCart(product)}>Add to Cart</button>
              {onToggleWishlist && (
                <button className={`btn btn-outline wishlist-detail-btn ${wished ? 'wished' : ''}`} onClick={() => onToggleWishlist(product)}>
                  {wished ? '♥ Wishlisted' : '♡ Wishlist'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>

          {product.reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product.</p>
          ) : (
            <div className="reviews-list">
              {product.reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{r.buyerName}</span>
                    <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h3>Write a Review</h3>
              <div className="field-group">
                <label>Rating</label>
                <select value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: Number(e.target.value) }))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Comment</label>
                <textarea rows={4} value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." />
              </div>
              {reviewMsg && <p className="review-msg">{reviewMsg}</p>}
              <button className="btn btn-gold" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          ) : (
            <p className="login-to-review">
              <button className="auth-link" onClick={() => onNavigate('login')}>Sign in</button> to write a review.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
