import './TrustBadges.css';

export default function TrustBadges() {
  const badges = [
    { icon: '🔒', title: 'Secure Payment',     sub: 'SSL + Razorpay encrypted' },
    { icon: '✦',  title: '100% Authentic',      sub: 'Expert verified' },
    { icon: '↩',  title: '14-Day Returns',      sub: 'No questions asked' },
    { icon: '📦', title: 'Insured Shipping',    sub: 'Fully covered in transit' },
    { icon: '🏅', title: 'Certified Experts',   sub: 'In-house authenticators' },
  ];

  return (
    <div className="trust-badges">
      {badges.map((b, i) => (
        <div key={i} className="trust-badge">
          <span className="tb-icon">{b.icon}</span>
          <div>
            <p className="tb-title">{b.title}</p>
            <p className="tb-sub">{b.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
