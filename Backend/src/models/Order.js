const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  image:    String,
  brand:    String,
  price:    Number,
  priceINR: Number,
  qty:      { type: Number, default: 1 },
});

const trackingSchema = new mongoose.Schema({
  status:    String,
  message:   String,
  updatedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String, phone: String, street: String,
      city: String, state: String, zipCode: String, country: String,
    },
    totalPrice:    { type: Number, required: true },
    totalPriceINR: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'bank', 'razorpay'],
      default: 'cod',
    },
    paymentDetails: { type: String, default: '' }, // UPI ref / bank UTR number

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingHistory:  [trackingSchema],
    trackingMessage:  { type: String, default: '' },

    isPaid:      { type: Boolean, default: false },
    paidAt:      Date,
    deliveredAt: Date,

    // Refund
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
    },
    refundReason: { type: String, default: '' },
    refundedAt:   Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
