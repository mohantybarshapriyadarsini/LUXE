const express = require('express');
const router  = express.Router();
const { protect }      = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');
const { createOrder, confirmPayment, getMyOrders, getOrderById, requestRefund } = require('../controllers/orderController');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/razorpayController');

// Razorpay routes MUST be before /:id to avoid route conflict
router.post('/razorpay/create',         protect,      createRazorpayOrder);
router.post('/razorpay/verify',         protect,      verifyRazorpayPayment);

router.post('/',                        protect,      createOrder);
router.get('/my',                       protect,      getMyOrders);
router.get('/:id',                      protect,      getOrderById);
router.post('/:id/confirm-payment',     adminProtect, confirmPayment);
router.post('/:id/refund',              protect,      requestRefund);

module.exports = router;
