const express = require('express');
const router  = express.Router();
const { adminProtect } = require('../middleware/adminMiddleware');
const {
  loginAdmin, getDashboard, getAllOrders,
  updateOrderStatus, handleRefund, getAllBuyers, sendMessage,
} = require('../controllers/adminController');

router.post('/login',                        loginAdmin);
router.get('/dashboard',    adminProtect,    getDashboard);
router.get('/orders',       adminProtect,    getAllOrders);
router.put('/orders/:id/status', adminProtect, updateOrderStatus);
router.put('/orders/:id/refund', adminProtect, handleRefund);
router.get('/buyers',       adminProtect,    getAllBuyers);
router.post('/send-message',adminProtect,    sendMessage);

module.exports = router;
