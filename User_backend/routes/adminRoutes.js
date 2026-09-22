const express = require("express");
const router = express.Router();
const { getStats, getAllUsers } = require("../controllers/adminController");
const { getProducts } = require("../controllers/productController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const {
  getAllRules,
  createRule,
  updateRule,
  deleteRule,
  updateSettings,
} = require("../controllers/shippingController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/stats", protect, admin, getStats);
router.get("/users", protect, admin, getAllUsers);
router.get("/products", protect, admin, getProducts);
router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

// Shipping fee chart — weight-based tiers the admin can edit any time.
router.get("/shipping", protect, admin, getAllRules);
router.post("/shipping", protect, admin, createRule);
router.put("/shipping/settings", protect, admin, updateSettings);
router.put("/shipping/:id", protect, admin, updateRule);
router.delete("/shipping/:id", protect, admin, deleteRule);

module.exports = router;
