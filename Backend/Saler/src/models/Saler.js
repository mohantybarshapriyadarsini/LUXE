const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const BRAND_THRESHOLD = 284_000_000;

const salerSchema = new mongoose.Schema(
  {
    // Personal Info
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    designation: { type: String, default: '' }, // CEO, Manager, etc.

    // Brand Information
    brandInfo: {
      brandName:       { type: String, required: true, trim: true },
      location:        { type: String, required: true },
      city:            { type: String, default: '' },
      state:           { type: String, default: '' },
      country:         { type: String, default: 'India' },
      pincode:         { type: String, default: '' },
      annualRevenue:   { type: Number, required: true, min: 0 },
      brandValuation:  { type: Number, default: 0 },
      description:     { type: String, default: '' },
      website:         { type: String, default: '' },
      logo:            { type: String, default: '' },
      establishedYear: { type: Number, default: null },
      numEmployees:    { type: String, default: '' }, // '1-10', '11-50', etc.
      category: {
        type: String,
        enum: ['Fashion', 'Jewellery', 'Accessories', 'Beauty', 'Footwear', 'Watches', 'Electronics', 'Other'],
        default: 'Fashion',
      },
      // Legal
      gstNumber:  { type: String, default: '' },
      panNumber:  { type: String, default: '' },
      // Social Media
      instagram:  { type: String, default: '' },
      facebook:   { type: String, default: '' },
      twitter:    { type: String, default: '' },
    },

    isCertifiedBrand: { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true },
    isApproved:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

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
