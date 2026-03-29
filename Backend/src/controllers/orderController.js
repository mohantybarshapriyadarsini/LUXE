const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');

const USD_TO_INR = parseFloat(process.env.USD_TO_INR) || 83.5;

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/orders  — create order + Razorpay order
const createOrder = async (req, res) => {
  const { items, shippingAddress, totalPrice } = req.body;
  try {
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' });

    const totalPriceINR = Math.round(totalPrice * USD_TO_INR);

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount:   totalPriceINR * 100,
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });

    const itemsWithINR = items.map(i => ({
      ...i,
      priceINR: Math.round(i.price * USD_TO_INR),
    }));

    const order = await Order.create({
      buyer: req.buyer._id,
      items: itemsWithINR,
      shippingAddress,
      totalPrice,
      totalPriceINR,
      razorpayOrderId: rzpOrder.id,
    });

    res.status(201).json({
      order,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId:   process.env.RAZORPAY_KEY_ID,
      totalPriceINR,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/:id/verify-payment
const verifyPayment = async (req, res) => {
  const { razorpayPaymentId, razorpaySignature } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.buyer._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Verify signature
    const body      = order.razorpayOrderId + '|' + razorpayPaymentId;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature)
      return res.status(400).json({ message: 'Payment verification failed' });

    order.isPaid            = true;
    order.paidAt            = new Date();
    order.status            = 'confirmed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    res.json({ message: 'Payment verified', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.buyer._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.buyer._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/:id/refund  — buyer requests refund
const requestRefund = async (req, res) => {
  const { reason } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.buyer._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (!order.isPaid)
      return res.status(400).json({ message: 'Order is not paid' });
    if (order.refundStatus !== 'none')
      return res.status(400).json({ message: `Refund already ${order.refundStatus}` });
    if (order.status === 'delivered')
      return res.status(400).json({ message: 'Delivered orders cannot be refunded after 14 days' });

    order.refundStatus = 'requested';
    order.refundReason = reason || 'No reason provided';
    await order.save();

    res.json({ message: 'Refund request submitted', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getMyOrders, getOrderById, requestRefund };
