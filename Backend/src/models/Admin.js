const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true, lowercase: true },
    password:    { type: String, required: true },
    phone:       { type: String, default: '' },
    role:        { type: String, enum: ['superadmin', 'admin', 'moderator'], default: 'admin' },
    permissions: {
      manageOrders:   { type: Boolean, default: true },
      manageBuyers:   { type: Boolean, default: true },
      manageBrands:   { type: Boolean, default: true },
      manageProducts: { type: Boolean, default: true },
      viewReports:    { type: Boolean, default: true },
    },
    lastLogin:   { type: Date, default: null },
    // OTP for 2-step verification
    otpCode:     { type: String, default: '' },
    otpExpiry:   { type: Date,   default: null },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
