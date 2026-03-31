const Order      = require('../models/Order');
const USD_TO_INR = parseFloat(process.env.USD_TO_INR) || 83.5;

// @POST /api/orders
const createOrder = async (req, res) => {
  const { items, shippingAddress, totalPrice, paymentMethod, paymentDetails } = req.body;
  try {
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No items in order' });

    const totalPriceINR = Math.round(totalPrice * USD_TO_INR);
    const itemsWithINR  = items.map(i => ({ ...i, priceINR: Math.round(i.price * USD_TO_INR) }));

    // For COD — mark as pending payment
    // For Bank/UPI — mark as pending until admin confirms
    const isPaid  = false;
    const status  = 'pending';

    const order = await Order.create({
      buyer: req.buyer._id,
      items: itemsWithINR,
      shippingAddress,
      totalPrice,
      totalPriceINR,
      paymentMethod:  paymentMethod  || 'cod',
      paymentDetails: paymentDetails || '',
      isPaid,
      status,
      trackingHistory: [{
        status:  'pending',
        message: `Order placed via ${(paymentMethod || 'cod').toUpperCase()}. ${
          paymentMethod === 'cod'
            ? 'Pay ₹' + totalPriceINR.toLocaleString('en-IN') + ' on delivery.'
            : paymentMethod === 'upi'
            ? 'UPI payment submitted. Awaiting confirmation.'
            : 'Bank transfer submitted. Awaiting confirmation.'
        }`,
      }],
    });

    res.status(201).json({ order, totalPriceINR });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/orders/:id/confirm-payment  (admin confirms bank/upi payment)
const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isPaid  = true;
    order.paidAt  = new Date();
    order.status  = 'confirmed';
    order.trackingHistory.push({ status: 'confirmed', message: 'Payment confirmed by LUXE team. Your order is being prepared.' });
    await order.save();
    res.json({ message: 'Payment confirmed', order });
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

// @POST /api/orders/:id/refund
const requestRefund = async (req, res) => {
  const { reason } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyer.toString() !== req.buyer._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (order.refundStatus !== 'none')
      return res.status(400).json({ message: `Refund already ${order.refundStatus}` });

    order.refundStatus = 'requested';
    order.refundReason = reason || 'No reason provided';
    await order.save();
    res.json({ message: 'Refund request submitted', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, confirmPayment, getMyOrders, getOrderById, requestRefund };
