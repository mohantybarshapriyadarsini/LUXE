const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BRAND_THRESHOLD = 284_000_000; // 284 million USD

const salerSchema = new mongoose.Schema(
  {
    // Personal Info
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    // Brand Information
    brandInfo: {
      brandName: { type: String, required: true, trim: true },
      location: { type: String, required: true },
      annualRevenue: { type: Number, required: true, min: 0 }, // in USD
      description: { type: String, default: '' },
      website: { type: String, default: '' },
      logo: { type: String, default: '' },
      establishedYear: { type: Number },
      category: {
        type: String,
        enum: ['Fashion', 'Jewellery', 'Accessories', 'Beauty', 'Footwear', 'Watches', 'Other'],
        default: 'Fashion'
      }
    },

    // Auto-computed based on annualRevenue >= 284 million USD
    isCertifiedBrand: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto-set isCertifiedBrand before saving
salerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.brandInfo && this.brandInfo.annualRevenue !== undefined) {
    this.isCertifiedBrand = this.brandInfo.annualRevenue >= BRAND_THRESHOLD;
  }
  next();
});

salerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Saler', salerSchema);
