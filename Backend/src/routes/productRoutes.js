const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProducts, getFeaturedProducts, getProductById, addReview, createProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, addReview);
router.post('/', createProduct);

module.exports = router;
