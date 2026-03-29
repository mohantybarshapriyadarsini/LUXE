const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment, getMyOrders, getOrderById, requestRefund } = require('../controllers/orderController');

router.post('/',                   protect, createOrder);
router.get('/my',                  protect, getMyOrders);
router.get('/:id',                 protect, getOrderById);
router.post('/:id/verify-payment', protect, verifyPayment);
router.post('/:id/refund',         protect, requestRefund);

module.exports = router;
