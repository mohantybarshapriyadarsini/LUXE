const jwt = require('jsonwebtoken');
const Saler = require('../models/Saler');

const BRAND_THRESHOLD = 284_000_000;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// @POST /api/salers/register
const registerSaler = async (req, res) => {
  const { name, phone, email, password, brandInfo } = req.body;
  try {
    if (await Saler.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const saler = await Saler.create({ name, phone, email, password, brandInfo });

    res.status(201).json({
      _id: saler._id,
      name: saler.name,
      email: saler.email,
      phone: saler.phone,
      brandInfo: saler.brandInfo,
      isCertifiedBrand: saler.isCertifiedBrand,
      brandStatus: saler.isCertifiedBrand
        ? `✅ Certified LUXE Brand (Revenue ≥ $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`
        : `❌ Not a Certified Brand (Revenue < $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`,
      token: generateToken(saler._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/salers/login
const loginSaler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const saler = await Saler.findOne({ email });
    if (!saler || !(await saler.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: saler._id,
      name: saler.name,
      email: saler.email,
      isCertifiedBrand: saler.isCertifiedBrand,
      token: generateToken(saler._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/salers/profile
const getProfile = async (req, res) => {
  const saler = req.saler;
  res.json({
    _id: saler._id,
    name: saler.name,
    email: saler.email,
    phone: saler.phone,
    brandInfo: saler.brandInfo,
    isCertifiedBrand: saler.isCertifiedBrand,
    isApproved: saler.isApproved,
    brandStatus: saler.isCertifiedBrand
      ? `✅ Certified LUXE Brand (Revenue ≥ $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`
      : `❌ Not a Certified Brand (Revenue < $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`
  });
};

// @PUT /api/salers/profile
const updateProfile = async (req, res) => {
  try {
    const saler = await Saler.findById(req.saler._id);
    const { name, phone, password, brandInfo } = req.body;

    if (name) saler.name = name;
    if (phone) saler.phone = phone;
    if (password) saler.password = password;
    if (brandInfo) {
      saler.brandInfo = { ...saler.brandInfo.toObject(), ...brandInfo };
    }

    const updated = await saler.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      brandInfo: updated.brandInfo,
      isCertifiedBrand: updated.isCertifiedBrand,
      brandStatus: updated.isCertifiedBrand
        ? `✅ Certified LUXE Brand (Revenue ≥ $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`
        : `❌ Not a Certified Brand (Revenue < $${(BRAND_THRESHOLD / 1_000_000).toFixed(0)}M USD)`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/salers/brand-status
const checkBrandStatus = async (req, res) => {
  try {
    const saler = await Saler.findById(req.saler._id);
    res.json({
      brandName: saler.brandInfo.brandName,
      annualRevenue: saler.brandInfo.annualRevenue,
      threshold: BRAND_THRESHOLD,
      isCertifiedBrand: saler.isCertifiedBrand,
      message: saler.isCertifiedBrand
        ? `✅ Your brand qualifies as a Certified LUXE Brand with revenue of $${saler.brandInfo.annualRevenue.toLocaleString()} USD`
        : `❌ Your brand does not qualify. Required: $${BRAND_THRESHOLD.toLocaleString()} USD. Current: $${saler.brandInfo.annualRevenue.toLocaleString()} USD. Shortfall: $${(BRAND_THRESHOLD - saler.brandInfo.annualRevenue).toLocaleString()} USD`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/salers/all  (for admin use)
const getAllSalers = async (req, res) => {
  try {
    const salers = await Saler.find().select('-password');
    res.json(salers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerSaler, loginSaler, getProfile, updateProfile, checkBrandStatus, getAllSalers };
