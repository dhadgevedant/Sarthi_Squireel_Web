/**
 * File: User_backend/routes/categoryRoutes.js  (NEW FILE)
 *
 * Public, unauthenticated read-only endpoint for active categories.
 * Mount in User_backend/server.js:
 *   app.use('/api/categories', require('./routes/categoryRoutes'));
 *
 * Also add a public site-images endpoint if one doesn't already exist:
 *   app.use('/api/site-images', require('./routes/siteImageRoutes'));
 */

const express  = require('express');
const router   = express.Router();
const Category = require('../models/Category'); // mirrors admin-backend model

// GET /api/categories — returns active categories sorted by sortOrder
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('name slug sortOrder');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

/* ─────────────────────────────────────────────────────────────────────────────
 * NOTE: If User_backend uses a SEPARATE MongoDB connection from admin-backend,
 * copy the Category schema verbatim into User_backend/models/Category.js.
 * If they share the same MongoDB URI, you can import the schema from a shared
 * location or just redeclare it — Mongoose caches compiled models by name so
 * the same model won't be registered twice as long as the schema is identical.
 * ───────────────────────────────────────────────────────────────────────────── */
