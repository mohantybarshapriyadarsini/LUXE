const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerSaler,
  loginSaler,
  getProfile,
  updateProfile,
  checkBrandStatus,
  getAllSalers
} = require('../controllers/salerController');

// Auth
router.post('/register', registerSaler);
router.post('/login', loginSaler);

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Brand Status
router.get('/brand-status', protect, checkBrandStatus);

// All Salers (Admin)
router.get('/all', getAllSalers);

module.exports = router;
