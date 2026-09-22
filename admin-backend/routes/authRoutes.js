const express = require("express");
const router = express.Router();
const { 
  registerAdmin, 
  loginAdmin, 
  getAdminProfile, 
  changePassword, 
  updateAdminProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/adminAuthController");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/profile", require("../middleware/authMiddleware").protect, getAdminProfile);
router.put("/profile/change-password", require("../middleware/authMiddleware").protect, changePassword);
router.put("/profile", require("../middleware/authMiddleware").protect, updateAdminProfile);

module.exports = router;
