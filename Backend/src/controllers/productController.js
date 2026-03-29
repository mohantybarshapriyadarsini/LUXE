const Product = require('../models/Product');

// @GET /api/products
const getProducts = async (req, res) => {
  try {
    const { brand, category, sort, minPrice, maxPrice, search } = req.query;
    const filter = {};

    if (brand && brand !== 'All') filter.brand = brand;
    if (category && category !== 'All') filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortOption = {};
    if (sort === 'price-asc')   sortOption = { price: 1 };
    if (sort === 'price-desc')  sortOption = { price: -1 };
    if (sort === 'newest')      sortOption = { createdAt: -1 };
    if (sort === 'top-rated')   sortOption = { rating: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/products/:id/reviews
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (r) => r.buyer.toString() === req.buyer._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: 'You already reviewed this product' });

    product.reviews.push({
      buyer: req.buyer._id,
      buyerName: req.buyer.name,
      rating: Number(rating),
      comment,
    });

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/products  (seed/admin)
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getFeaturedProducts, getProductById, addReview, createProduct };
