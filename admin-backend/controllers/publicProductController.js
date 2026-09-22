const Product = require("../models/Product");

// GET /api/public/products?category=cookies&search=choco
const getPublicProducts = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    const withStockFlag = products.map((p) => ({
      ...p.toObject(),
      inStock: p.stock > 0,
    }));

    res.json({ count: withStockFlag.length, products: withStockFlag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/public/products/:slug
const getPublicProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product: { ...product.toObject(), inStock: product.stock > 0 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/public/products/check-stock  { items: [{ productId, qty }] }
// Used by the cart before checkout so the customer sees "out of stock"
// instead of the order silently failing.
const checkStock = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const results = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product || !product.isActive) {
          return { productId: item.productId, available: false, reason: "Product not available" };
        }
        if (product.stock <= 0) {
          return { productId: item.productId, name: product.name, available: false, reason: "Out of stock" };
        }
        if (product.stock < item.qty) {
          return {
            productId: item.productId,
            name: product.name,
            available: false,
            reason: `Only ${product.stock} left in stock`,
          };
        }
        return { productId: item.productId, name: product.name, available: true };
      })
    );

    const allAvailable = results.every((r) => r.available);
    res.json({ allAvailable, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicProducts, getPublicProductBySlug, checkStock };
