const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerBuyer,
  loginBuyer,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/buyerController');

// Auth
router.post('/register', registerBuyer);
router.post('/login', loginBuyer);

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Wishlist
router.post('/wishlist/:productId', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);

module.exports = router;
