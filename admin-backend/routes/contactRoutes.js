const express = require("express");
const router = express.Router();
const { getAllMessages, markResolved, deleteMessage } = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllMessages);
router.put("/:id/resolve", protect, markResolved);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
