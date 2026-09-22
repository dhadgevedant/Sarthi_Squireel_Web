const Category = require('../models/Category');
const SiteImage = require('../models/SiteImage');

// Utility: convert name → slug
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// GET /api/admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, sortOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    const finalSlug = slug ? slug.toLowerCase().trim() : toSlug(name);

    const exists = await Category.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ success: false, message: `Slug "${finalSlug}" already exists` });
    }

    const category = await Category.create({ name, slug: finalSlug, sortOrder: sortOrder || 0 });

    // Auto-create a placeholder SiteImage record for this category tile
    const imageKey = `category_${finalSlug}`;
    const existingImage = await SiteImage.findOne({ key: imageKey });
    if (!existingImage) {
      await SiteImage.create({
        key: imageKey,
        belongsTo: `Homepage tile — ${name}`,
        category: 'Category Tiles',
        imageUrl: null,
      });
    }

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, sortOrder, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name) category.name = name;
    if (slug) {
      const newSlug = slug.toLowerCase().trim();
      const conflict = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (conflict) {
        return res.status(400).json({ success: false, message: `Slug "${newSlug}" already in use` });
      }
      category.slug = newSlug;
    }
    if (typeof sortOrder !== 'undefined') category.sortOrder = sortOrder;
    if (typeof isActive !== 'undefined') category.isActive = isActive;

    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/categories/:id  (soft delete — sets isActive: false if products exist)
exports.deleteCategory = async (req, res) => {
  try {
    const Product = require('../models/Product');
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      // Soft-delete only
      category.isActive = false;
      await category.save();
      return res.json({
        success: true,
        softDeleted: true,
        message: `${productCount} product(s) are still in this category. Category deactivated instead of deleted. Reassign those products before deleting permanently.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seed default categories on startup (call from server.js)
exports.seedDefaultCategories = async () => {
  const defaults = [
    { name: 'Cookies', slug: 'cookies', sortOrder: 1 },
    { name: 'Spreads & Butters', slug: 'spreads', sortOrder: 2 },
    { name: 'Bars', slug: 'bars', sortOrder: 3 },
    { name: 'Cakes', slug: 'cakes', sortOrder: 4 },
    { name: 'Gift Hampers', slug: 'giftbox', sortOrder: 5 },
    { name: 'Trail Mix & Seeds', slug: 'trailmix', sortOrder: 6 },
  ];

  for (const cat of defaults) {
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create(cat);
    }
    // Also ensure the SiteImage placeholder exists
    const imageKey = `category_${cat.slug}`;
    const imgExists = await SiteImage.findOne({ key: imageKey });
    if (!imgExists) {
      await SiteImage.create({
        key: imageKey,
        belongsTo: `Homepage tile — ${cat.name}`,
        category: 'Category Tiles',
        imageUrl: null,
      }).catch(() => {}); // ignore duplicate key race
    }
  }
};
