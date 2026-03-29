/* BrandDashboard.jsx — Protected page for approved brand users */
import { useAuth } from '../context/AuthContext';
import './BrandDashboard.css';

/* Quick stat card */
function StatCard({ label, value, sub }) {
  return (
    <div className="dash-stat">
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-label">{label}</span>
      {sub && <span className="dash-stat-sub">{sub}</span>}
    </div>
  );
}

export default function BrandDashboard({ onNavigate }) {
  const { user, logout } = useAuth();

  /* Guard — should not be reachable by non-brands, but double-check */
  if (!user || user.role !== 'brand') {
    return (
      <div className="dash-guard">
        <p>Access denied. This page is for verified brands only.</p>
        <button className="btn btn-outline" onClick={() => onNavigate('home')}>Go Home</button>
      </div>
    );
  }

  function handleLogout() {
    logout();
    onNavigate('home');
  }

  return (
    <main className="dash-page">
      <div className="container">

        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="section-label">Brand Portal</p>
            <div className="divider" style={{ margin: '12px 0' }} />
            <h1 className="dash-title">Welcome, {user.brandName}</h1>
            <p className="dash-sub">Manage your luxury brand presence on LUXE</p>
          </div>
          <div className="dash-header-actions">
            <span className="dash-status approved">✦ Verified Brand</span>
            <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="dash-stats">
          <StatCard label="Brand Value"  value={`$${Number(user.brandValue).toLocaleString()}`} sub="Verified" />
          <StatCard label="Location"     value={user.location} />
          <StatCard label="Status"       value="Approved" sub="Active listing" />
          <StatCard label="Member Since" value={new Date(user.createdAt).getFullYear()} />
        </div>

        {/* Brand info card */}
        <div className="dash-grid">

          <div className="dash-card">
            <h3>Brand Profile</h3>
            <div className="dash-info-list">
              <div className="dash-info-row">
                <span>Brand Name</span>
                <span>{user.brandName}</span>
              </div>
              <div className="dash-info-row">
                <span>Owner</span>
                <span>{user.name}</span>
              </div>
              <div className="dash-info-row">
                <span>Email</span>
                <span>{user.email}</span>
              </div>
              <div className="dash-info-row">
                <span>Phone</span>
                <span>{user.phone}</span>
              </div>
              <div className="dash-info-row">
                <span>Location</span>
                <span>{user.location}</span>
              </div>
              <div className="dash-info-row">
                <span>Brand Value</span>
                <span>${Number(user.brandValue).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="dash-card">
            <h3>Quick Actions</h3>
            <div className="dash-actions-list">
              <button className="dash-action-btn" onClick={() => onNavigate('products')}>
                <span className="dash-action-icon">◈</span>
                <div>
                  <p>View Marketplace</p>
                  <span>Browse all LUXE products</span>
                </div>
              </button>
              <button className="dash-action-btn">
                <span className="dash-action-icon">✦</span>
                <div>
                  <p>Add Product</p>
                  <span>List a new authenticated item</span>
                </div>
              </button>
              <button className="dash-action-btn">
                <span className="dash-action-icon">◉</span>
                <div>
                  <p>View Orders</p>
                  <span>Track your sales</span>
                </div>
              </button>
              <button className="dash-action-btn">
                <span className="dash-action-icon">◎</span>
                <div>
                  <p>Analytics</p>
                  <span>Performance insights</span>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Notice */}
        <div className="dash-notice">
          ✦ All products listed under your brand will be subject to LUXE's authentication process before going live.
        </div>

      </div>
    </main>
  );
}
