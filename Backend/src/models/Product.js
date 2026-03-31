const mongoose          = require('mongoose');
const calculateLuxuryScore = require('../utils/luxuryScore');

const reviewSchema = new mongoose.Schema(
  {
    buyer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    buyerName: { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    brand:    { type: String, required: true },
    category: {
      type: String, required: true,
      enum: ['Handbags', 'Watches', 'Jewellery', 'Shoes', 'Accessories', 'Electronics'],
    },
    price:       { type: Number, required: true, min: 0 },
    image:       { type: String, required: true },
    description: { type: String, default: '' },
    featured:    { type: Boolean, default: false },
    stock:       { type: Number, default: 10 },
    reviews:     [reviewSchema],
    rating:      { type: Number, default: 0 },
    numReviews:  { type: Number, default: 0 },

    // Luxury Score
    luxuryScore: { type: Number, default: 0, min: 0, max: 100 },
    luxuryBreakdown: {
      brand:    { type: Number, default: 0 },
      price:    { type: Number, default: 0 },
      reviews:  { type: Number, default: 0 },
      material: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Auto-compute luxury score before every save
productSchema.pre('save', function (next) {
  const { total, breakdown } = calculateLuxuryScore({
    brand:      this.brand,
    price:      this.price,
    rating:     this.rating,
    numReviews: this.numReviews,
    category:   this.category,
  });
  this.luxuryScore     = total;
  this.luxuryBreakdown = breakdown;
  next();
});

module.exports = mongoose.model('Product', productSchema);
