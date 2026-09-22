const SiteImage = require("../models/SiteImage");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadFolder = path.join(__dirname, "..", "..", "User_backend", "public", "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadFolder);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `site-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const valid = /\.(jpe?g|png)$/i.test(ext) && /^image\/(jpeg|jpg|png)$/i.test(file.mimetype);
    cb(valid ? null : new Error('Only JPG and PNG files are allowed'), valid);
  }
});

// GET /api/admin/settings/images
const getSiteImages = async (req, res) => {
  try {
    const images = await SiteImage.find().sort({ category: 1, key: 1 });
    res.json({ count: images.length, images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/settings/images/upload (admin uploads a new site image file)
const uploadSiteImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/settings/images/:key
const updateSiteImage = async (req, res) => {
  try {
    const { key } = req.params;
    const allowed = ["url", "alt", "belongsTo", "category", "isActive"];
    const updates = {};
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const defaults = {
      home_cookie_image: { belongsTo: "Homepage cookie pouch", category: "Homepage" },
      category_cookies: { belongsTo: "Homepage category tile - Cookies", category: "Homepage" },
      category_spreads: { belongsTo: "Homepage category tile - Spreads & Butters", category: "Homepage" },
      category_bars: { belongsTo: "Homepage category tile - Bars", category: "Homepage" },
      category_cakes: { belongsTo: "Homepage category tile - Brownies & Cakes", category: "Homepage" },
      category_gift_hampers: { belongsTo: "Homepage category tile - Gift Hampers", category: "Homepage" },
      category_trail_mix: { belongsTo: "Homepage category tile - Trail Mix & Seeds", category: "Homepage" },
      home_jar_image: { belongsTo: "Homepage story teaser — jar image", category: "Homepage" },
      home_protein_image: { belongsTo: "Homepage story teaser — protein shake overlay", category: "Homepage" },
      story_jar_image: { belongsTo: "Our Story page — Why Choose Squirrel Nuts jar image", category: "About Page" },
      story_protein_image: { belongsTo: "Our Story page — Why Choose Squirrel Nuts protein overlay", category: "About Page" },
    };

    let image = await SiteImage.findOne({ key });
    if (image) {
      Object.assign(image, updates);
      await image.save();
    } else {
      if (!updates.url) return res.status(400).json({ message: 'URL is required when creating a new image record.' });
      const meta = defaults[key] || { belongsTo: "Homepage image", category: "Homepage" };
      image = await SiteImage.create({ key, ...meta, ...updates, isActive: updates.isActive !== undefined ? updates.isActive : true });
    }

    res.json({ image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/settings/images/:key
const deleteSiteImage = async (req, res) => {
  try {
    const { key } = req.params;
    const image = await SiteImage.findOneAndDelete({ key });
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSiteImages, uploadSiteImage, updateSiteImage, deleteSiteImage, upload };
