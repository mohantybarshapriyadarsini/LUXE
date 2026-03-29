const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.buyer = await Buyer.findById(decoded.id).select('-password');
    if (!req.buyer) return res.status(401).json({ message: 'Buyer not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
