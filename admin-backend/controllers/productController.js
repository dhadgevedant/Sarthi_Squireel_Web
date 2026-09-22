const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Self-contained: images live inside this backend's own /public/uploads folder
// and are served statically by server.js at http://localhost:5001/uploads/...
const uploadFolder = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadFolder);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const valid = /\.(jpeg|jpg|png|gif|webp)$/i.test(ext) && /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    cb(valid ? null : new Error('Only image files are allowed'), valid);
  }
});

const generateSlug = (name) =>
  name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const parseBooleanFlag = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return false;
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (!productData.slug && productData.name) {
      productData.slug = generateSlug(productData.name);
    }
    if (productData.name && !productData.slug) {
      productData.slug = generateSlug(productData.name);
    }
    if (Object.prototype.hasOwnProperty.call(productData, 'isActive')) {
      productData.isActive = parseBooleanFlag(productData.isActive);
    }
    if (Object.prototype.hasOwnProperty.call(productData, 'isFeatured')) {
      productData.isFeatured = parseBooleanFlag(productData.isFeatured);
    }

    const product = await Product.create(productData);
    res.status(201).json({ product });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.slug) {
      return res.status(400).json({ message: 'Product slug already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.name && !updates.slug) {
      updates.slug = generateSlug(updates.name);
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'isActive')) {
      updates.isActive = parseBooleanFlag(updates.isActive);
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'isFeatured')) {
      updates.isFeatured = parseBooleanFlag(updates.isFeatured);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.slug) {
      return res.status(400).json({ message: 'Product slug already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImage, upload };
