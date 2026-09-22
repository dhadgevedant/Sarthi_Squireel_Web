/**
 * PATCH — replace the existing Product.js category field.
 *
 * BEFORE (remove this):
 *   category: { type: String, enum: ["cookies","spreads","bars","cakes","trailmix","giftbox"], required: true }
 *
 * AFTER (use this):
 *   category: { type: String, required: true, trim: true }
 *
 * Full updated schema is below — merge other fields from your existing Product.js.
 * Only the `category` field changes; everything else stays the same.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    // ── CHANGED: was enum; now plain String validated at controller level ──
    category: { type: String, required: true, trim: true },
    // ─────────────────────────────────────────────────────────────────────
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    weight: { type: Number }, // in grams
    tags: [{ type: String }],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

/* ─────────────────────────────────────────────────────────────────────────────
 * ALSO UPDATE productController.js create/update handlers:
 * After receiving `category` from req.body, validate it exists in Category:
 *
 *   const Category = require('../models/Category');
 *   const cat = await Category.findOne({ slug: req.body.category, isActive: true });
 *   if (!cat) return res.status(400).json({ success: false, message: 'Invalid or inactive category' });
 *
 * Then proceed with save as normal.
 * ───────────────────────────────────────────────────────────────────────────── */
