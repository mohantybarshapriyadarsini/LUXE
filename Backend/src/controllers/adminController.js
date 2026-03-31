const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Buyer = require('../models/Buyer');
const Product = require('../models/Product');

const generateToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @POST /api/admin/login  — Step 1: verify credentials, generate OTP
const loginAdmin = async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid admin credentials' });
    if (!admin.isActive)
      return res.status(403).json({ message: 'Admin account is deactivated' });

    // Step 2: if OTP provided, verify it
    if (otp) {
      if (admin.otpCode !== otp)
        return res.status(401).json({ message: 'Invalid OTP code' });
      if (new Date() > admin.otpExpiry)
        return res.status(401).json({ message: 'OTP expired. Please login again.' });

      // OTP verified — issue token
      admin.otpCode   = '';
      admin.otpExpiry = null;
      admin.lastLogin = new Date();
      await admin.save();

      return res.json({
        _id:         admin._id,
        name:        admin.name,
        email:       admin.email,
        phone:       admin.phone,
        role:        admin.role,
        permissions: admin.permissions,
        lastLogin:   admin.lastLogin,
        token:       generateToken(admin._id),
      });
    }

    // Step 1: credentials valid — generate OTP
    const code   = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    admin.otpCode   = code;
    admin.otpExpiry = expiry;
    await admin.save();

    // In production replace with real email/SMS
    console.log(`\n🔐 ADMIN OTP for ${email}: ${code} (valid 5 mins)\n`);

    return res.json({
      requireOtp: true,
      message:    `OTP sent to admin. Check server console. OTP: ${code}`,
      otp:        code, // remove this in production — only for demo
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalBuyers, totalProducts, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Buyer.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('buyer', 'name email'),
    ]);

    const revenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPriceINR' } } },
    ]);

    const pendingRefunds = await Order.countDocuments({ refundStatus: 'requested' });

    res.json({
      totalOrders,
      totalBuyers,
      totalProducts,
      totalRevenue: revenue[0]?.total || 0,
      pendingRefunds,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('buyer', 'name email phone');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/orders/:id/status  — update status + send tracking message
const updateOrderStatus = async (req, res) => {
  const { status, message } = req.body;
  try {
    const order = await Order.findById(req.params.id).populate('buyer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.status;
    order.status = status;

    const trackingMsg = message || getDefaultMessage(status, order);
    order.trackingMessage = trackingMsg;
    order.trackingHistory.push({ status, message: trackingMsg });

    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    // Simulate email notification (log to console — replace with nodemailer in production)
    console.log(`\n📧 EMAIL NOTIFICATION`);
    console.log(`To: ${order.buyer.email}`);
    console.log(`Subject: Your LUXE Order #${order._id.toString().slice(-8).toUpperCase()} — ${status.toUpperCase()}`);
    console.log(`Message: ${trackingMsg}\n`);

    res.json({ message: 'Order updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function getDefaultMessage(status, order) {
  const id = order._id.toString().slice(-8).toUpperCase();
  const msgs = {
    confirmed: `Your LUXE order #${id} has been confirmed! We are preparing your authenticated luxury item for dispatch.`,
    shipped:   `Great news! Your LUXE order #${id} has been shipped. Your item is on its way and fully insured during transit.`,
    delivered: `Your LUXE order #${id} has been delivered. We hope you love your authenticated luxury purchase! Please leave a review.`,
    cancelled: `Your LUXE order #${id} has been cancelled. If you paid, a refund will be processed within 5–7 business days.`,
  };
  return msgs[status] || `Your order #${id} status has been updated to ${status}.`;
}

// @PUT /api/admin/orders/:id/refund  — approve or reject refund
const handleRefund = async (req, res) => {
  const { action } = req.body; // 'approved' | 'rejected'
  try {
    const order = await Order.findById(req.params.id).populate('buyer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.refundStatus = action;
    if (action === 'approved') {
      order.refundedAt = new Date();
      order.status     = 'cancelled';
      order.trackingHistory.push({
        status:  'cancelled',
        message: `Refund approved for order #${order._id.toString().slice(-8).toUpperCase()}. Amount will be credited within 5–7 business days.`,
      });
    }
    await order.save();

    console.log(`\n📧 REFUND EMAIL`);
    console.log(`To: ${order.buyer.email}`);
    console.log(`Refund ${action} for order #${order._id.toString().slice(-8).toUpperCase()}\n`);

    res.json({ message: `Refund ${action}`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/buyers
const getAllBuyers = async (req, res) => {
  try {
    const buyers = await Buyer.find().select('-password').sort({ createdAt: -1 });
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/admin/send-message  — send custom message to buyer
const sendMessage = async (req, res) => {
  const { orderId, message } = req.body;
  try {
    const order = await Order.findById(orderId).populate('buyer', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.trackingMessage = message;
    order.trackingHistory.push({ status: order.status, message });
    await order.save();

    console.log(`\n📧 CUSTOM MESSAGE`);
    console.log(`To: ${order.buyer.email} (${order.buyer.name})`);
    console.log(`Message: ${message}\n`);

    res.json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { loginAdmin, getDashboard, getAllOrders, updateOrderStatus, handleRefund, getAllBuyers, sendMessage };
