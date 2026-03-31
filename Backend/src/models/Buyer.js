const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  fullName:  String,
  phone:     String,
  street:    String,
  city:      String,
  state:     String,
  zipCode:   String,
  country:   String,
  isDefault: { type: Boolean, default: false },
});

const buyerSchema = new mongoose.Schema(
  {
    // Basic
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone:    { type: String, required: true, default: '' },

    // Extended Profile
    dateOfBirth:     { type: String, default: '' },
    gender:          { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], default: '' },
    city:            { type: String, default: '' },
    state:           { type: String, default: '' },
    pincode:         { type: String, default: '' },
    country:         { type: String, default: 'India' },
    profileComplete: { type: Boolean, default: false },

    avatar:    { type: String, default: '' },
    addresses: [addressSchema],
    wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

buyerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

buyerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Buyer', buyerSchema);
