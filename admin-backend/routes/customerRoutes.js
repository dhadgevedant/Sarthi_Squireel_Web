const express = require("express");
const router = express.Router();
const { getAllCustomers, deleteCustomer } = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllCustomers);
router.delete("/:id", protect, deleteCustomer);

module.exports = router;
