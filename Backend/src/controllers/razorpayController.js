const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');

const USD_TO_INR = parseFloat(process.env.USD_TO_INR) || 83.5;

// Secret key stays in backend only — never sent to frontend
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/orders/razorpay/create
// Creates a Razorpay order and a DB order, returns razorpay order id + key id
const createRazorpayOrder = async (req, res) => {
  const { items, shippingAddress, totalPrice } = req.body;
  try {
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' });

    const totalPriceINR = Math.round(totalPrice * USD_TO_INR);
    const itemsWithINR  = items.map(i => ({ ...i, priceINR: Math.round(i.price * USD_TO_INR) }));

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount:   totalPriceINR * 100,
      currency: 'INR',
      receipt:  `luxe_${Date.now()}`,
    });

    // Save order in DB with razorpay method
    const order = await Order.create({
      buyer:           req.buyer._id,
      items:           itemsWithINR,
      shippingAddress,
      totalPrice,
      totalPriceINR,
      paymentMethod:   'razorpay',
      paymentDetails:  rzpOrder.id,
      isPaid:          false,
      status:          'pending',
      trackingHistory: [{ status: 'pending', message: 'Order created. Awaiting Razorpay payment.' }],
    });

    res.status(201).json({
      orderId:        order._id,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId:   process.env.RAZORPAY_KEY_ID, // only key ID, never secret
      totalPriceINR,
    });
  } catch (err) {
    console.error('Razorpay create error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/razorpay/verify
// Verifies Razorpay signature and marks order as paid
const verifyRazorpayPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  try {
    // Verify signature using secret key (backend only)
    const body     = razorpayOrderId + '|' + razorpayPaymentId;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      console.log('❌ Razorpay signature mismatch');
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Mark order as paid
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid          = true;
    order.paidAt          = new Date();
    order.status          = 'confirmed';
    order.paymentDetails  = razorpayPaymentId;
    order.trackingHistory.push({
      status:  'confirmed',
      message: `Payment successful via Razorpay. Payment ID: ${razorpayPaymentId}`,
    });
    await order.save();

    console.log(`✅ Razorpay payment verified — payment_id: ${razorpayPaymentId}, order: ${orderId}, status: paid`);

    res.json({ message: 'Payment verified successfully', order });
  } catch (err) {
    console.error('Razorpay verify error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
