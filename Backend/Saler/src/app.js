const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/salers', require('./routes/salerRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
