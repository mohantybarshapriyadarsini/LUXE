import { useState, useEffect, useRef } from 'react';
import './Trust.css';

const TESTIMONIALS = [
  { name: 'Priya Sharma',    city: 'Mumbai',    rating: 5, product: 'Hermès Birkin 30',       text: 'I was nervous buying a Birkin online but LUXE made it seamless. The authentication certificate gave me complete confidence. Absolutely genuine.' },
  { name: 'Arjun Mehta',     city: 'Delhi',     rating: 5, product: 'Rolex Submariner',       text: 'Received my Submariner with original box, papers and a LUXE certificate. The watch is flawless. Will definitely buy again.' },
  { name: 'Sneha Reddy',     city: 'Bangalore', rating: 5, product: 'Chanel Classic Flap',    text: 'The bag arrived in perfect condition with all original packaging. LUXE\'s authentication process is thorough and trustworthy.' },
  { name: 'Vikram Patel',    city: 'Chennai',   rating: 5, product: 'Dyson Airwrap',          text: 'Got the Airwrap at a great price. Fully sealed, original warranty card included. LUXE is my go-to for premium products.' },
  { name: 'Ananya Krishnan', city: 'Hyderabad', rating: 5, product: 'LV Neverfull MM',        text: 'The Neverfull is stunning. LUXE verified every detail — stitching, hardware, canvas. I felt completely safe buying here.' },
  { name: 'Rohan Tiwari',    city: 'Pune',      rating: 5, product: 'Gucci Horsebit Bag',     text: 'Exceptional service. The bag was exactly as described. The live tracking and insured shipping gave me peace of mind.' },
];

const STEPS = [
  { num: '01', title: 'Submission',        icon: '📥', desc: 'Seller submits the item with all documentation — receipts, serial numbers, original packaging and provenance records.' },
  { num: '02', title: 'Physical Inspection',icon: '🔍', desc: 'Our certified experts physically examine every detail — stitching, hardware, materials, serial numbers and date codes.' },
  { num: '03', title: 'Brand Verification', icon: '🏷️', desc: 'We cross-reference with brand databases and authorised dealer records to confirm the item\'s origin and authenticity.' },
  { num: '04', title: 'Digital Certification',icon:'📜', desc: 'A unique Certificate of Authenticity is issued with a QR code linking to the item\'s full verification report.' },
  { num: '05', title: 'Secure Packaging',   icon: '📦', desc: 'The item is professionally packaged with tamper-evident seals and fully insured for worldwide shipping.' },
  { num: '06', title: 'Delivered to You',   icon: '✦',  desc: 'You receive your authenticated luxury item with certificate, original packaging and a 14-day return guarantee.' },
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Happy Customers' },
  { value: 98,    suffix: '%', label: 'Satisfaction Rate' },
  { value: 50,    suffix: '+', label: 'Luxury Brands' },
  { value: 0,     suffix: '',  label: 'Counterfeits Ever' },
];

const CERTIFICATIONS = [
  { icon: '🔒', title: 'SSL Encrypted',        desc: '256-bit SSL encryption on all transactions' },
  { icon: '💳', title: 'Razorpay Secured',      desc: 'PCI-DSS compliant payment processing' },
  { icon: '🛡️', title: 'Buyer Protection',      desc: 'Full refund if item fails authentication' },
  { icon: '📋', title: 'GDPR Compliant',        desc: 'Your data is protected and never sold' },
  { icon: '🌍', title: 'Insured Shipping',      desc: 'Every shipment fully insured in transit' },
  { icon: '✅', title: 'Verified Sellers Only', desc: 'All sellers pass our strict vetting process' },
];

function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({ value, suffix, label }) {
  const ref  = useRef(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2000, started);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="trust-stat" ref={ref}>
      <span className="trust-stat-num">{count}{suffix}</span>
      <span className="trust-stat-label">{label}</span>
    </div>
  );
}

export default function Trust({ onNavigate }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="trust-page">

      {/* ── Hero ── */}
      <section className="trust-hero">
        <div className="container">
          <p className="section-label">Why Choose LUXE</p>
          <div className="divider" />
          <h1 className="trust-hero-title">Built on Trust.<br /><em>Backed by Proof.</em></h1>
          <p className="trust-hero-sub">Every decision we make is designed to give you complete confidence — from the moment you browse to the moment your item arrives.</p>
          <button className="btn btn-gold" onClick={() => onNavigate('products')}>Shop with Confidence</button>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="trust-stats-section">
        <div className="container trust-stats-grid">
          {STATS.map((s, i) => <StatCounter key={i} {...s} />)}
        </div>
      </section>

      {/* ── Authentication Process ── */}
      <section className="auth-process-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Our Process</p>
          <div className="divider" />
          <h2 className="trust-section-title">How We Authenticate Every Item</h2>
          <p className="trust-section-sub">A rigorous 6-step process carried out by our in-house certified luxury goods experts.</p>
          <div className="process-steps">
            {STEPS.map((step, i) => (
              <div key={i} className="process-step">
                <div className="step-num-wrap">
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-num">{step.num}</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="testimonials-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Verified Buyers</p>
          <div className="divider" />
          <h2 className="trust-section-title">What Our Customers Say</h2>

          <div className="testimonials-carousel">
            <div className="testimonial-card active">
              <div className="testimonial-stars">
                {'★'.repeat(TESTIMONIALS[activeTestimonial].rating)}
              </div>
              <p className="testimonial-text">"{TESTIMONIALS[activeTestimonial].text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {TESTIMONIALS[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <p className="testimonial-name">{TESTIMONIALS[activeTestimonial].name}</p>
                  <p className="testimonial-meta">{TESTIMONIALS[activeTestimonial].city} · Purchased {TESTIMONIALS[activeTestimonial].product}</p>
                </div>
                <span className="verified-badge">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="testimonial-dots">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`t-dot ${i === activeTestimonial ? 'active' : ''}`} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>

          {/* All testimonials grid */}
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-mini">
                <div className="tm-stars">{'★'.repeat(t.rating)}</div>
                <p className="tm-text">"{t.text.slice(0, 100)}..."</p>
                <div className="tm-author">
                  <span className="tm-name">{t.name}</span>
                  <span className="tm-city">{t.city}</span>
                  <span className="verified-badge-sm">✓ Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Certifications ── */}
      <section className="certifications-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Security & Compliance</p>
          <div className="divider" />
          <h2 className="trust-section-title">Your Security is Our Priority</h2>
          <div className="certifications-grid">
            {CERTIFICATIONS.map((c, i) => (
              <div key={i} className="cert-card">
                <span className="cert-icon">{c.icon}</span>
                <h3 className="cert-title">{c.title}</h3>
                <p className="cert-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Money Back Guarantee ── */}
      <section className="guarantee-section">
        <div className="container guarantee-inner">
          <div className="guarantee-badge">
            <span className="guarantee-icon">🏅</span>
            <div>
              <h2>100% Money-Back Guarantee</h2>
              <p>If any item you receive fails our authentication standards or is not as described, we will issue a <strong>full refund</strong> — no questions asked. Your trust is non-negotiable.</p>
              <div className="guarantee-actions">
                <button className="btn btn-gold" onClick={() => onNavigate('products')}>Shop Now</button>
                <button className="btn btn-outline" onClick={() => onNavigate('help')}>Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
