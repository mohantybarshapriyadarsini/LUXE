const express = require('express');
const router  = express.Router();
const { protect }      = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const { createOrder, confirmPayment, getMyOrders, getOrderById, requestRefund } = require('../controllers/orderController');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/razorpayController');

router.post('/',                        protect,      createOrder);
router.get('/my',                       protect,      getMyOrders);
router.get('/:id',                      protect,      getOrderById);
router.post('/:id/confirm-payment',     adminProtect, confirmPayment);
router.post('/:id/refund',              protect,      requestRefund);

// Razorpay — new endpoints only
router.post('/razorpay/create',         protect,      createRazorpayOrder);
router.post('/razorpay/verify',         protect,      verifyRazorpayPayment);

module.exports = router;
