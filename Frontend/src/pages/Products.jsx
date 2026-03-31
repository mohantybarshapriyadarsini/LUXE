import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/api';
import { priceINR } from '../utils/currency';
import ProductCard from '../components/ProductCard';
import './Products.css';

const BRANDS     = ['All','Louis Vuitton','Chanel','Hermès','Rolex','Gucci','Prada','Dyson'];
const CATEGORIES = ['All','Handbags','Watches','Jewellery','Shoes','Accessories','Electronics'];
const SORTS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newly Released' },
  { value: 'top-rated',  label: 'Top Rated' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹1,00,000',    min: '',      max: '1200'  },
  { label: '₹1L – ₹5L',         min: '1200',  max: '6000'  },
  { label: '₹5L – ₹15L',        min: '6000',  max: '18000' },
  { label: 'Above ₹15L',         min: '18000', max: ''      },
];

export default function Products({ onNavigate, onAddToCart, onToggleWishlist, isInWishlist, initialBrand, initialCategory }) {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState('');
  const [activeBrand,    setActiveBrand]    = useState(initialBrand || 'All');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'All');
  const [sort,           setSort]           = useState('default');
  const [minPrice,       setMinPrice]       = useState('');
  const [maxPrice,       setMaxPrice]       = useState('');
  const [search,         setSearch]         = useState('');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (activeBrand    !== 'All') params.brand    = activeBrand;
    if (activeCategory !== 'All') params.category = activeCategory;
    if (sort !== 'default')       params.sort     = sort;
    if (minPrice)                 params.minPrice = minPrice;
    if (maxPrice)                 params.maxPrice = maxPrice;
    if (search)                   params.search   = search;
    getProducts(params)
      .then(data => { console.log('Products fetched:', data.length); setFetchError(''); setProducts(data); })
      .catch(err => { console.error('Products fetch error:', err.message); setFetchError(err.message); setProducts([]); })
      .finally(() => setLoading(false));
  }, [activeBrand, activeCategory, sort, minPrice, maxPrice, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function clearFilters() {
    setActiveBrand('All'); setActiveCategory('All');
    setSort('default'); setMinPrice(''); setMaxPrice(''); setSearch('');
  }

  function applyPricePreset(preset) {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
  }

  const activeFiltersCount = [
    activeBrand !== 'All',
    activeCategory !== 'All',
    sort !== 'default',
    minPrice !== '',
    maxPrice !== '',
    search !== '',
  ].filter(Boolean).length;

  return (
    <main className="products-page">
      <div className="container">

        {/* Page Header */}
        <div className="page-header">
          <p className="section-label">Collections</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">All Products</h1>
          <p className="page-sub">Every item is certified authentic by our expert team.</p>
        </div>

        {/* Search bar — full width above layout */}
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Mobile filter toggle */}
        <button className="mobile-filter-btn" onClick={() => setSidebarOpen(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
          </svg>
          Filters {activeFiltersCount > 0 && <span className="filter-count-badge">{activeFiltersCount}</span>}
        </button>

        {/* Main layout: sidebar + grid */}
        <div className="products-layout">

          {/* ── LEFT SIDEBAR ── */}
          <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <span className="sidebar-title">Filters</span>
              {activeFiltersCount > 0 && (
                <button className="clear-all-btn" onClick={clearFilters}>Clear All</button>
              )}
            </div>

            {/* Brand */}
            <div className="sidebar-section">
              <p className="sidebar-label">Brand</p>
              <div className="sidebar-options">
                {BRANDS.map(b => (
                  <button
                    key={b}
                    className={`sidebar-option ${activeBrand === b ? 'active' : ''}`}
                    onClick={() => setActiveBrand(b)}
                  >
                    <span className="option-dot" />
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-divider" />

            {/* Category */}
            <div className="sidebar-section">
              <p className="sidebar-label">Category</p>
              <div className="sidebar-options">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    className={`sidebar-option ${activeCategory === c ? 'active' : ''}`}
                    onClick={() => setActiveCategory(c)}
                  >
                    <span className="option-dot" />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-divider" />

            {/* Price Range */}
            <div className="sidebar-section">
              <p className="sidebar-label">Price Range (INR)</p>
              <div className="price-presets">
                {PRICE_PRESETS.map(p => (
                  <button
                    key={p.label}
                    className={`sidebar-option ${minPrice === p.min && maxPrice === p.max ? 'active' : ''}`}
                    onClick={() => applyPricePreset(p)}
                  >
                    <span className="option-dot" />
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min USD"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  min="0"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max USD"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
              {(minPrice || maxPrice) && (
                <p className="price-hint">
                  {minPrice ? priceINR(Number(minPrice)) : '₹0'} — {maxPrice ? priceINR(Number(maxPrice)) : '∞'}
                </p>
              )}
            </div>

            <div className="sidebar-divider" />

            {/* Sort */}
            <div className="sidebar-section">
              <p className="sidebar-label">Sort By</p>
              <div className="sidebar-options">
                {SORTS.map(s => (
                  <button
                    key={s.value}
                    className={`sidebar-option ${sort === s.value ? 'active' : ''}`}
                    onClick={() => setSort(s.value)}
                  >
                    <span className="option-dot" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* ── RIGHT PRODUCT GRID ── */}
          <div className="products-main">
            <div className="products-toolbar">
              <p className="result-count">
                {loading ? 'Loading...' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
              </p>
              {/* Sort dropdown for quick access on desktop */}
              <select
                className="sort-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="products-grid-page">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card-page" />)}
              </div>
            ) : fetchError ? (
              <div className="empty-state">
                <p style={{ color: '#e05555' }}>⚠ Could not load products: {fetchError}</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Make sure the backend is running at the correct URL.</p>
                <button className="btn btn-outline" onClick={fetchProducts} style={{ marginTop: '16px' }}>Retry</button>
              </div>
            ) : products.length > 0 ? (
              <div className="products-grid-page">
                {products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onView={p => onNavigate('product', { productId: p._id })}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isInWishlist={isInWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No products found for the selected filters.</p>
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
