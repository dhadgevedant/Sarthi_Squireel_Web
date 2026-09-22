const Product = require("../models/Product");

// GET /api/products  (supports ?category=cookies & ?search=choco & ?featured=true)
async function getProducts(req, res, next) {
  try {
    const { category, search, featured } = req.query;
    const filter = { isActive: true };

    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:idOrSlug
async function getProduct(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const product = await Product.findOne({
      $or: [{ _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }, { slug: idOrSlug }],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// POST /api/products  (admin only)
async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id  (admin only)
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id  (admin only)
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
