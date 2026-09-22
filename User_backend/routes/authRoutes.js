const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  guestLogin,
  forgotPassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/guest", guestLogin);
router.post("/forgot-password", forgotPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
