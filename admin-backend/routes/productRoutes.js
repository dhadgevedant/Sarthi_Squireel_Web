const express = require("express");
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, uploadProductImage, upload } = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
router.post("/", protect, createProduct);
router.post("/upload-image", protect, upload.single('image'), uploadProductImage);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
