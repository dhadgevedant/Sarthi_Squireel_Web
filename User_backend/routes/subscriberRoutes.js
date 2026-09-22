const express = require("express");
const router = express.Router();
const { subscribe, getAllSubscribers } = require("../controllers/subscriberController");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", subscribe);
router.get("/", protect, admin, getAllSubscribers);

module.exports = router;
