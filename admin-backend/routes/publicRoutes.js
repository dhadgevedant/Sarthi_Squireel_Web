const express = require("express");
const router = express.Router();
const { getPublicSettings } = require("../controllers/siteSettingsController");
const {
  getPublicProducts,
  getPublicProductBySlug,
  checkStock,
} = require("../controllers/publicProductController");

// Site-wide settings (announcement bar, festival offer banner, shipping, COD, etc.)
router.get("/settings", getPublicSettings);

// Products (read-only, active products only)
router.get("/products", getPublicProducts);
router.get("/products/:slug", getPublicProductBySlug);
router.post("/products/check-stock", checkStock);

module.exports = router;
