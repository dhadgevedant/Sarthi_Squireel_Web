const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    priceOld: { type: Number },
    priceNew: { type: Number, required: true },
    weight: { type: String, default: "" },
    images: {
      primary: { type: String, required: true },
      secondary: { type: String },
    },
    stock: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
