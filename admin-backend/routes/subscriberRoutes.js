const express = require("express");
const router = express.Router();
const { getAllSubscribers, deleteSubscriber } = require("../controllers/subscriberController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllSubscribers);
router.delete("/:id", protect, deleteSubscriber);

module.exports = router;
