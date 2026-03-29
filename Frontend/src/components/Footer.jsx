import './Footer.css';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">LUXE</span>
          <p>Every product is verified authentic.<br />No counterfeits. Ever.</p>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            {[['Handbags','products',{category:'Handbags'}],['Watches','products',{category:'Watches'}],['Jewellery','products',{category:'Jewellery'}],['Shoes','products',{category:'Shoes'}]].map(([label, pg, props]) => (
              <li key={label} onClick={() => onNavigate(pg, props)}>{label}</li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <ul>
            {[['My Profile','profile'],['My Orders','orders'],['Wishlist','wishlist'],['Help Center','help']].map(([label, pg]) => (
              <li key={label} onClick={() => onNavigate(pg)}>{label}</li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            {[['Authentication Policy','help'],['Returns & Refunds','help'],['Contact Us','help'],['Shipping Info','help']].map(([label, pg]) => (
              <li key={label} onClick={() => onNavigate(pg)}>{label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LUXE. All rights reserved. All products are 100% authenticated.</p>
      </div>
    </footer>
  );
}
