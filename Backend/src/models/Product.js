const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    buyerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Handbags', 'Watches', 'Jewellery', 'Shoes', 'Accessories'],
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    stock: { type: Number, default: 10 },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
