const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Admin = require("../models/Admin");
const {
  getSiteSettings,
  updateSiteSettings,
} = require("../controllers/siteSettingsController");
const {
  getSiteImages,
  uploadSiteImage,
  updateSiteImage,
  deleteSiteImage,
  upload,
} = require("../controllers/siteImageController");

// Store settings — announcement bar, festival/offer banner, shipping, COD, etc.
router.get("/site", protect, getSiteSettings);
router.put("/site", protect, updateSiteSettings);

// Site images management
router.get("/images", protect, getSiteImages);
router.post("/images/upload", protect, upload.single('image'), uploadSiteImage);
router.put("/images/:key", protect, updateSiteImage);
router.delete("/images/:key", protect, deleteSiteImage);

router.get("/admins", protect, async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }).select("-password");
    res.json({ count: admins.length, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/admins", protect, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });
    const admin = await Admin.create({ name, email, password, phone, role: "admin" });
    res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/admins/:id", protect, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
