import { useState } from 'react';
import './HelpCenter.css';

const FAQS = [
  { q: 'How does LUXE authenticate products?', a: 'Every item undergoes a rigorous multi-point inspection by our certified luxury goods experts. We verify serial numbers, hardware, stitching, materials, and provenance documentation before any listing goes live.' },
  { q: 'What is your return policy?', a: 'We offer a 14-day return policy on all items. If an item fails authentication after purchase, we offer a full refund — no questions asked. Items must be returned in original condition.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3–7 business days. Express shipping (1–2 business days) is available at checkout. All orders are fully insured during transit.' },
  { q: 'Is my payment information secure?', a: 'Yes. All payments are processed through industry-standard encrypted channels. We never store your full card details on our servers.' },
  { q: 'Can I sell my luxury items on LUXE?', a: 'Yes! Register as a brand/seller through our "Become a Brand" option. Brands with annual revenue of $284M+ receive Certified LUXE Brand status.' },
  { q: 'What happens if I receive a counterfeit?', a: 'This has never happened, but if it did, we would issue an immediate full refund plus a $500 LUXE credit as compensation. Our zero-tolerance policy is absolute.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. International shipping times vary by destination (7–14 business days). All international orders are fully insured.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking number via email. You can also view order status in My Orders section of your account.' },
];

export default function HelpCenter({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent]       = useState(false);

  function handleContact(e) {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <main className="help-page">
      <div className="container">
        <div className="page-header">
          <p className="section-label">Support</p>
          <div className="divider" style={{ margin: '12px 0' }} />
          <h1 className="page-title">Help Center</h1>
          <p className="page-sub">Everything you need to know about LUXE.</p>
        </div>

        {/* Quick links */}
        <div className="help-quick-links">
          {[['📦','Track Order','orders'],['↩','Returns','help'],['🔐','Authentication','help'],['📞','Contact Us','help']].map(([icon, label, pg]) => (
            <button key={label} className="quick-link-card" onClick={() => onNavigate(pg)}>
              <span className="ql-icon">{icon}</span>
              <span className="ql-label">{label}</span>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <section className="faq-section">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="contact-section">
          <h2 className="section-heading">Contact Us</h2>
          <div className="contact-layout">
            <div className="contact-info">
              <div className="contact-item"><span className="contact-icon">✉</span><div><p className="contact-label">Email</p><p>support@luxe.com</p></div></div>
              <div className="contact-item"><span className="contact-icon">📞</span><div><p className="contact-label">Phone</p><p>+1 (800) LUXE-000</p></div></div>
              <div className="contact-item"><span className="contact-icon">🕐</span><div><p className="contact-label">Hours</p><p>Mon–Fri, 9am–6pm EST</p></div></div>
              <div className="contact-item"><span className="contact-icon">📍</span><div><p className="contact-label">Address</p><p>1 Luxury Avenue, New York, NY 10001</p></div></div>
            </div>

            {sent ? (
              <div className="contact-success">
                <span>✦</span>
                <h3>Message Sent!</h3>
                <p>Our team will get back to you within 24 hours.</p>
                <button className="btn btn-outline" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContact}>
                <div className="fields-row">
                  <div className="field-group"><label>Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                  <div className="field-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
                </div>
                <div className="field-group"><label>Subject</label><input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
                <div className="field-group">
                  <label>Message</label>
                  <textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <button className="btn btn-gold" type="submit">Send Message</button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
