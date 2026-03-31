const jwt   = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// @POST /api/buyers/register
const registerBuyer = async (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender, city, state, pincode, country } = req.body;
  try {
    if (await Buyer.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const buyer = await Buyer.create({
      name, email, password, phone,
      dateOfBirth: dateOfBirth || '',
      gender:      gender      || '',
      city:        city        || '',
      state:       state       || '',
      pincode:     pincode     || '',
      country:     country     || 'India',
    });

    res.status(201).json({
      _id:   buyer._id,
      name:  buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      token: generateToken(buyer._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/buyers/login
const loginBuyer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const buyer = await Buyer.findOne({ email });
    if (!buyer || !(await buyer.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (!buyer.isActive)
      return res.status(403).json({ message: 'Account has been deactivated. Contact support.' });

    res.json({
      _id:   buyer._id,
      name:  buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      token: generateToken(buyer._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/buyers/profile
const getProfile = async (req, res) => {
  const b = req.buyer;
  res.json({
    _id: b._id, name: b.name, email: b.email, phone: b.phone,
    dateOfBirth: b.dateOfBirth, gender: b.gender,
    city: b.city, state: b.state, pincode: b.pincode, country: b.country,
    avatar: b.avatar, addresses: b.addresses, wishlist: b.wishlist,
    profileComplete: b.profileComplete,
  });
};

// @PUT /api/buyers/profile
const updateProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyer._id);
    const fields = ['name','phone','avatar','password','dateOfBirth','gender','city','state','pincode','country'];
    fields.forEach(f => { if (req.body[f] !== undefined) buyer[f] = req.body[f]; });

    // Mark profile complete if all key fields filled
    buyer.profileComplete = !!(buyer.name && buyer.phone && buyer.dateOfBirth && buyer.gender && buyer.city && buyer.country);

    const updated = await buyer.save();
    res.json({
      _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone,
      dateOfBirth: updated.dateOfBirth, gender: updated.gender,
      city: updated.city, state: updated.state, pincode: updated.pincode, country: updated.country,
      avatar: updated.avatar, profileComplete: updated.profileComplete,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/buyers/addresses
const addAddress = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyer._id);
    if (req.body.isDefault) buyer.addresses.forEach(a => (a.isDefault = false));
    buyer.addresses.push(req.body);
    await buyer.save();
    res.status(201).json(buyer.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/buyers/addresses/:addressId
const updateAddress = async (req, res) => {
  try {
    const buyer   = await Buyer.findById(req.buyer._id);
    const address = buyer.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) buyer.addresses.forEach(a => (a.isDefault = false));
    Object.assign(address, req.body);
    await buyer.save();
    res.json(buyer.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/buyers/addresses/:addressId
const deleteAddress = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyer._id);
    buyer.addresses = buyer.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await buyer.save();
    res.json(buyer.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/buyers/wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyer._id);
    if (buyer.wishlist.includes(req.params.productId))
      return res.status(400).json({ message: 'Already in wishlist' });
    buyer.wishlist.push(req.params.productId);
    await buyer.save();
    res.json(buyer.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/buyers/wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyer._id);
    buyer.wishlist = buyer.wishlist.filter(id => id.toString() !== req.params.productId);
    await buyer.save();
    res.json(buyer.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerBuyer, loginBuyer, getProfile, updateProfile, addAddress, updateAddress, deleteAddress, addToWishlist, removeFromWishlist };
