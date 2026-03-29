const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  brand: String,
  price: Number,       // stored in USD
  priceINR: Number,    // stored in INR
  qty: { type: Number, default: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    totalPrice:    { type: Number, required: true },   // USD
    totalPriceINR: { type: Number, required: true },   // INR
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    // Razorpay
    razorpayOrderId:   { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    isPaid:    { type: Boolean, default: false },
    paidAt:    Date,
    // Refund
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
    },
    refundReason:  { type: String, default: '' },
    refundedAt:    Date,
    deliveredAt:   Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
