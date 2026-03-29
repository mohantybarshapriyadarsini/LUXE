const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/buyers',   require('./routes/buyerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));

// Public config — exposes only the Razorpay key ID (never the secret)
app.get('/api/config/razorpay', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

// Seed products on first run
const Product = require('./models/Product');
const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) return;
  await Product.insertMany([
    { name: 'Neverfull MM Tote', brand: 'Louis Vuitton', category: 'Handbags', price: 1860, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', description: 'The iconic Neverfull MM in Monogram canvas. Spacious, elegant, and timeless.', featured: true },
    { name: 'Classic Flap Bag', brand: 'Chanel', category: 'Handbags', price: 9800, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', description: 'The Chanel Classic Flap in lambskin leather with gold-tone hardware.', featured: true },
    { name: 'Birkin 30', brand: 'Hermès', category: 'Handbags', price: 24000, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', description: 'The Hermès Birkin 30 in Togo leather. The pinnacle of luxury craftsmanship.', featured: true },
    { name: 'Submariner Date', brand: 'Rolex', category: 'Watches', price: 14500, image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80', description: 'The Rolex Submariner Date in Oystersteel. Water-resistant to 300m.', featured: true },
    { name: 'GG Marmont Shoulder Bag', brand: 'Gucci', category: 'Handbags', price: 1450, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80', description: 'Gucci GG Marmont small shoulder bag in matelassé chevron leather.', featured: false },
    { name: 'Saffiano Leather Tote', brand: 'Prada', category: 'Handbags', price: 2200, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', description: 'Prada Saffiano leather tote with gold-tone hardware.', featured: false },
    { name: 'Datejust 41', brand: 'Rolex', category: 'Watches', price: 12000, image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&q=80', description: 'Rolex Datejust 41 in Oystersteel and yellow gold with fluted bezel.', featured: false },
    { name: 'Kelly 28', brand: 'Hermès', category: 'Handbags', price: 18500, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', description: 'The Hermès Kelly 28 in Epsom leather with palladium hardware.', featured: false },
    { name: 'Diamond Tennis Bracelet', brand: 'Chanel', category: 'Jewellery', price: 8500, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', description: 'Elegant diamond tennis bracelet in 18k white gold.', featured: false },
    { name: 'Monogram Canvas Loafers', brand: 'Louis Vuitton', category: 'Shoes', price: 1100, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', description: 'Louis Vuitton monogram canvas loafers with leather lining.', featured: false },
    { name: 'Silk Scarf', brand: 'Hermès', category: 'Accessories', price: 450, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80', description: 'Hermès 90cm silk twill scarf with hand-rolled edges.', featured: false },
    { name: 'Daytona Chronograph', brand: 'Rolex', category: 'Watches', price: 35000, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80', description: 'Rolex Cosmograph Daytona in 18ct Everose gold.', featured: true },
  ]);
  console.log('Products seeded');
};
seedProducts();

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
