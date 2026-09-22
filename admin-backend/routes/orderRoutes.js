const express = require("express");
const router = express.Router();
const { getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllOrders);
router.put("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
