const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://luxe-aecf.onrender.com',
    'https://luxe-pi-henna.vercel.app',
    'https://luxe-1.onrender.com',
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/buyers',   require('./routes/buyerRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

// Saler routes (brand login/register from frontend)
const salerApp = require('../Saler/src/app');
app.use('/api/salers', require('../Saler/src/routes/salerRoutes'));

app.get('/api/config/razorpay', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
